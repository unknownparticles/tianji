
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CoinSide } from '../types';

interface CoinProps {
  side: CoinSide | null;
  isRolling: boolean;
  onAnimationComplete?: () => void;
}

const Coin: React.FC<CoinProps> = ({ side, isRolling, onAnimationComplete }) => {
  const [displaySide, setDisplaySide] = useState<'heads' | 'tails'>('heads');
  const [isFlipping, setIsFlipping] = useState(false);
  const [gravityEnabled, setGravityEnabled] = useState(false);
  const [gravityX, setGravityX] = useState(0);
  const [gravityY, setGravityY] = useState(0);
  const prevRollingRef = useRef(isRolling);

  // 重力感应
  useEffect(() => {
    if (!gravityEnabled) return;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      const x = event.beta || 0;  // 前后倾斜
      const y = event.gamma || 0; // 左右倾斜
      setGravityX(Math.max(-45, Math.min(45, y)));
      setGravityY(Math.max(-45, Math.min(45, x)));
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [gravityEnabled]);

  // 尝试启用重力感应
  const enableGravity = useCallback(() => {
    if (typeof DeviceOrientationEvent !== 'undefined' &&
        typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      (DeviceOrientationEvent as any).requestPermission()
        .then((permissionState: string) => {
          if (permissionState === 'granted') {
            setGravityEnabled(true);
          }
        })
        .catch(console.error);
    } else {
      setGravityEnabled(true);
    }
  }, []);

  useEffect(() => {
    if (isRolling && !prevRollingRef.current) {
      setIsFlipping(true);
      setDisplaySide('heads');
      // 尝试启用重力感应
      enableGravity();
    }
    prevRollingRef.current = isRolling;
  }, [isRolling, enableGravity]);

  // 翻转结束
  useEffect(() => {
    if (isFlipping && !isRolling && side) {
      setDisplaySide(side);
      setIsFlipping(false);
      const timer = setTimeout(() => {
        onAnimationComplete?.();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isFlipping, isRolling, side, onAnimationComplete]);

  // 根据重力感应调整倾斜
  const tiltStyle = gravityEnabled && isFlipping ? {
    transform: `rotateY(720deg) translateY(-120px) rotateX(${-gravityY * 2}deg) rotateZ(${gravityX * 2}deg)`
  } : {};

  return (
    <div className="relative w-20 h-28 flex flex-col items-center">
      {/* 硬币容器 */}
      <div
        className="relative w-16 h-16 md:w-20 md:h-20"
        style={{ perspective: '500px' }}
      >
        {/* 硬币本体 */}
        <div
          className={`
            w-full h-full rounded-full
            border-4 border-amber-600
            bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500
            flex items-center justify-center shadow-xl
            relative overflow-hidden
            ${isFlipping ? 'animate-coin-flip' : ''}
            ${!isFlipping && side ? 'animate-coin-land' : ''}
          `}
          style={tiltStyle}
        >
          {/* 金属光泽 */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-black/10 rounded-full"></div>

          {/* 方孔 */}
          <div className="w-5 h-5 md:w-6 md:h-6 bg-stone-100 border-2 border-amber-700 rounded-sm transform rotate-45 shadow-inner"></div>

          {/* 装饰字符 */}
          <div className="absolute inset-0 flex flex-col items-center justify-between py-1 text-[8px] md:text-[10px] font-bold text-amber-900 pointer-events-none">
            <span className="opacity-80 tracking-widest">
              {displaySide === 'heads' ? '乾' : '坤'}
            </span>
            <div className="flex w-full justify-between px-2">
              <span className="opacity-80">元</span>
              <span className="opacity-80">亨</span>
            </div>
            <span className="opacity-80 tracking-widest">
              {displaySide === 'heads' ? '隆' : '通'}
            </span>
          </div>

          {/* 边缘 */}
          <div className="absolute inset-0 rounded-full border-2 border-amber-300/50"></div>
        </div>

        {/* 结果标签 */}
        {!isFlipping && side && (
          <div
            className={`
              absolute -top-6 left-1/2 -translate-x-1/2
              px-2 py-0.5 rounded text-xs font-bold whitespace-nowrap
              ${side === 'heads' ? 'bg-red-800 text-amber-100' : 'bg-stone-700 text-stone-200'}
            `}
          >
            {side === 'heads' ? '☰ 阳' : '☷ 阴'}
          </div>
        )}
      </div>

      {/* 底部说明 */}
      {!isFlipping && side && (
        <div className="absolute -bottom-4 text-xs font-bold text-amber-800 whitespace-nowrap">
          {side === 'heads' ? '三正面 = 阳爻' : '二正面 = 阴爻'}
        </div>
      )}
    </div>
  );
};

export default Coin;
