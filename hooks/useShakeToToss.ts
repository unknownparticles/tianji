import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createInitialShakeState,
  detectShake,
  type MotionSample
} from '../services/shakeDetection';

export type ShakeStatus = 'unsupported' | 'needs-permission' | 'enabled' | 'denied' | 'error';

interface MotionVectorLike {
  x: number | null;
  y: number | null;
  z: number | null;
}

interface MotionEventLike {
  acceleration?: MotionVectorLike | null;
  accelerationIncludingGravity?: MotionVectorLike | null;
}

export interface DeviceMotionPermissionConstructor {
  requestPermission?: () => Promise<'granted' | 'denied'>;
}

export interface UseShakeToTossOptions {
  canToss: boolean;
  onShake: () => void;
}

export interface ShakeToTossController {
  status: ShakeStatus;
  enable: () => Promise<void>;
}

function readVector(vector: MotionVectorLike | null | undefined): Omit<MotionSample, 'timestamp' | 'mode'> | null {
  if (!vector || ![vector.x, vector.y, vector.z].every(value => typeof value === 'number' && Number.isFinite(value))) {
    return null;
  }
  return { x: vector.x!, y: vector.y!, z: vector.z! };
}

/** 将浏览器设备事件转换为与平台无关的检测采样。 */
export function motionEventToSample(event: MotionEventLike, timestamp: number): MotionSample | null {
  const linear = readVector(event.acceleration);
  if (linear) {
    return { ...linear, timestamp, mode: 'linear' };
  }

  const includingGravity = readVector(event.accelerationIncludingGravity);
  return includingGravity
    ? { ...includingGravity, timestamp, mode: 'including-gravity' }
    : null;
}

/** 统一映射 iOS 授权结果；没有授权函数的浏览器可直接启用监听。 */
export async function requestDeviceMotionPermission(
  constructor: DeviceMotionPermissionConstructor
): Promise<ShakeStatus> {
  if (!constructor.requestPermission) return 'enabled';

  try {
    return await constructor.requestPermission() === 'granted' ? 'enabled' : 'denied';
  } catch {
    return 'error';
  }
}

function getDeviceMotionConstructor(): DeviceMotionPermissionConstructor | null {
  if (typeof DeviceMotionEvent === 'undefined') return null;
  return DeviceMotionEvent as unknown as DeviceMotionPermissionConstructor;
}

/** 管理摇一摇授权与监听生命周期，只在当前允许抛币时触发回调。 */
export function useShakeToToss({ canToss, onShake }: UseShakeToTossOptions): ShakeToTossController {
  const [status, setStatus] = useState<ShakeStatus>('needs-permission');
  const [isPageVisible, setIsPageVisible] = useState(true);
  const onShakeRef = useRef(onShake);

  useEffect(() => {
    onShakeRef.current = onShake;
  }, [onShake]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.isSecureContext || !getDeviceMotionConstructor()) {
      setStatus('unsupported');
    }
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const updateVisibility = () => setIsPageVisible(document.visibilityState === 'visible');
    updateVisibility();
    document.addEventListener('visibilitychange', updateVisibility);
    return () => document.removeEventListener('visibilitychange', updateVisibility);
  }, []);

  const enable = useCallback(async () => {
    if (typeof window === 'undefined' || !window.isSecureContext) {
      setStatus('unsupported');
      return;
    }

    const constructor = getDeviceMotionConstructor();
    if (!constructor) {
      setStatus('unsupported');
      return;
    }
    setStatus(await requestDeviceMotionPermission(constructor));
  }, []);

  useEffect(() => {
    if (status !== 'enabled' || !canToss || !isPageVisible) return;

    let detectorState = createInitialShakeState();
    const handleMotion = (event: DeviceMotionEvent) => {
      const sample = motionEventToSample(event, event.timeStamp);
      if (!sample) return;

      const result = detectShake(detectorState, sample);
      detectorState = result.state;
      if (result.triggered) onShakeRef.current();
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [canToss, isPageVisible, status]);

  return { status, enable };
}
