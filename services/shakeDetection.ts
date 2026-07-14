export const LINEAR_THRESHOLD = 13;
export const GRAVITY_DELTA_THRESHOLD = 12;
export const PEAK_WINDOW_MS = 650;
export const MIN_PEAK_INTERVAL_MS = 80;
export const COOLDOWN_MS = 2000;

interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface MotionSample extends Vector3 {
  timestamp: number;
  mode: 'linear' | 'including-gravity';
}

export interface ShakeState {
  peakTimestamps: number[];
  cooldownUntil: number;
  previousGravity: Vector3 | null;
}

export interface ShakeDetectionResult {
  state: ShakeState;
  triggered: boolean;
}

/** 创建一次独立摇动监听所需的初始状态。 */
export function createInitialShakeState(): ShakeState {
  return {
    peakTimestamps: [],
    cooldownUntil: 0,
    previousGravity: null
  };
}

function isValidSample(sample: MotionSample): boolean {
  return [sample.x, sample.y, sample.z, sample.timestamp].every(Number.isFinite);
}

function magnitude(vector: Vector3): number {
  return Math.sqrt(vector.x ** 2 + vector.y ** 2 + vector.z ** 2);
}

/**
 * 将单次加速度采样推进为新的检测状态。
 * 两个有效峰值才触发，静态重力通过相邻采样差值消除。
 */
export function detectShake(state: ShakeState, sample: MotionSample): ShakeDetectionResult {
  if (!isValidSample(sample)) {
    return { state, triggered: false };
  }

  let acceleration = 0;
  let previousGravity = state.previousGravity;
  if (sample.mode === 'linear') {
    acceleration = magnitude(sample);
  } else {
    const currentGravity = { x: sample.x, y: sample.y, z: sample.z };
    if (previousGravity) {
      acceleration = magnitude({
        x: currentGravity.x - previousGravity.x,
        y: currentGravity.y - previousGravity.y,
        z: currentGravity.z - previousGravity.z
      });
    }
    previousGravity = currentGravity;
  }

  const recentPeaks = state.peakTimestamps.filter(
    timestamp => sample.timestamp >= timestamp && sample.timestamp - timestamp <= PEAK_WINDOW_MS
  );
  const nextBaseState: ShakeState = {
    peakTimestamps: recentPeaks,
    cooldownUntil: state.cooldownUntil,
    previousGravity
  };
  if (sample.timestamp < state.cooldownUntil) {
    return { state: nextBaseState, triggered: false };
  }

  const threshold = sample.mode === 'linear' ? LINEAR_THRESHOLD : GRAVITY_DELTA_THRESHOLD;
  const lastPeak = recentPeaks.at(-1);
  const isSeparatedPeak = lastPeak === undefined || sample.timestamp - lastPeak >= MIN_PEAK_INTERVAL_MS;
  if (acceleration < threshold || !isSeparatedPeak) {
    return { state: nextBaseState, triggered: false };
  }

  const peakTimestamps = [...recentPeaks, sample.timestamp];
  if (peakTimestamps.length < 2) {
    return {
      state: { ...nextBaseState, peakTimestamps },
      triggered: false
    };
  }

  return {
    state: {
      peakTimestamps: [],
      cooldownUntil: sample.timestamp + COOLDOWN_MS,
      previousGravity
    },
    triggered: true
  };
}
