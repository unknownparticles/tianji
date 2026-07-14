export const COIN_SOUND_MUTED_KEY = 'tianji_coin_sound_muted';
export const TOSS_DURATION_MS = 1500;

let audioContext: AudioContext | null = null;

/** 只有明确保存为 true 才静音，损坏配置回退到声音开启。 */
export function parseMutedPreference(saved: string | null): boolean {
  return saved === 'true';
}

function getAudioContextConstructor(): typeof AudioContext | null {
  if (typeof window === 'undefined') return null;
  const audioWindow = window as Window & { webkitAudioContext?: typeof AudioContext };
  return window.AudioContext || audioWindow.webkitAudioContext || null;
}

/** 在用户手势中初始化或恢复音频上下文，失败时保持静默降级。 */
export async function unlockCoinAudio(): Promise<void> {
  try {
    const AudioContextConstructor = getAudioContextConstructor();
    if (!AudioContextConstructor) return;
    audioContext ||= new AudioContextConstructor();
    if (audioContext.state === 'suspended') await audioContext.resume();
  } catch {
    audioContext = null;
  }
}

function playMetallicTone(frequency: number, duration: number, volume: number, delay = 0): void {
  if (!audioContext || audioContext.state !== 'running') return;

  try {
    const startsAt = audioContext.currentTime + delay;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(frequency, startsAt);
    oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.62, startsAt + duration);
    gain.gain.setValueAtTime(volume, startsAt);
    gain.gain.exponentialRampToValueAtTime(0.001, startsAt + duration);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(startsAt);
    oscillator.stop(startsAt + duration);
  } catch {
    // 音效只是增强反馈，任何播放失败都不能阻断起卦。
  }
}

/** 播放铜钱起飞时的轻金属声。 */
export function playCoinLaunchSound(muted: boolean): void {
  if (muted) return;
  playMetallicTone(980, 0.12, 0.08);
  playMetallicTone(1320, 0.09, 0.04, 0.035);
}

/** 播放落地声，并在浏览器支持时触发短震动。 */
export function playCoinLandingFeedback(muted: boolean): void {
  if (!muted) {
    playMetallicTone(720, 0.22, 0.12);
    playMetallicTone(1080, 0.16, 0.07, 0.045);
  }

  try {
    if (typeof navigator !== 'undefined') navigator.vibrate?.([18, 28, 35]);
  } catch {
    // 浏览器可能不支持震动，失败时保持静默降级。
  }
}
