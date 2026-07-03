
import React, { useEffect, useRef, useState } from 'react';
import { CoinSide } from '../types';

interface CoinProps {
  side: CoinSide | null;
  isRolling: boolean;
  onAnimationComplete?: () => void;
}

const Coin: React.FC<CoinProps> = ({ side, isRolling, onAnimationComplete }) => {
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'up' | 'flip' | 'down' | 'land'>('idle');
  const prevRollingRef = useRef(isRolling);

  useEffect(() => {
    // 开始滚动
    if (!prevRollingRef.current && isRolling) {
      setAnimationPhase('up');
    }
    // 滚动结束，落地
    if (prevRollingRef.current && !isRolling && side) {
      setAnimationPhase('land');
      setTimeout(() => {
        setAnimationPhase('idle');
        onAnimationComplete?.();
      }, 400);
    }
    prevRollingRef.current = isRolling;
  }, [isRolling, side, onAnimationComplete]);

  // 翻转动画循环
  useEffect(() => {
    if (!isRolling) return;

    let frame = 0;
    const maxFrames = 30;
    const interval = setInterval(() => {
      frame++;
      if (frame >= maxFrames) {
        frame = 0;
      }
      // 在 up 和 down 之间切换 flip 状态
      if (animationPhase === 'up' || animationPhase === 'down') {
        setAnimationPhase(frame % 2 === 0 ? 'up' : 'flip');
      }
    }, 80);

    return () => clearInterval(interval);
  }, [isRolling, animationPhase]);

  return (
    <div className="relative w-20 h-32 flex flex-col items-center">
      <div
        className={`
          relative w-16 h-16 md:w-20 md:h-20 rounded-full
          border-4 border-amber-600
          bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500
          flex items-center justify-center shadow-xl
          transition-all duration-200
          ${animationPhase === 'up' ? '-translate-y-16' : ''}
          ${animationPhase === 'flip' ? '-translate-y-8 rotate-y-180' : ''}
          ${animationPhase === 'down' ? '-translate-y-4' : ''}
          ${animationPhase === 'land' ? 'translate-y-0 bounce-land' : ''}
          ${!isRolling && side ? 'shadow-lg' : ''}
        `}
        style={{
          transformStyle: 'preserve-3d',
          perspective: '500px',
        }}
      >
        {/* 金色边框光晕 */}
        <div className="absolute inset-0 rounded-full border-2 border-amber-300 opacity-50"></div>

        {/* 古代铜钱方孔 */}
        <div className="w-5 h-5 md:w-6 md:h-6 bg-stone-100 border-2 border-amber-700 rounded-sm transform rotate-45"></div>

        {/* 装饰字符 */}
        <div className="absolute inset-0 flex flex-col items-center justify-between py-1 text-[8px] md:text-[10px] font-bold text-amber-900 pointer-events-none">
          <span className="opacity-70 tracking-widest">{side === 'heads' ? '乾' : '坤'}</span>
          <div className="flex w-full justify-between px-2">
            <span className="opacity-70">元</span>
            <span className="opacity-70">亨</span>
          </div>
          <span className="opacity-70 tracking-widest">{side === 'heads' ? '隆' : '通'}</span>
        </div>
      </div>

      {/* 正面/背面指示 */}
      {side && !isRolling && (
        <div
          className={`
            absolute -top-6 px-2 py-0.5 rounded text-xs font-bold
            ${side === 'heads' ? 'bg-red-800 text-amber-100' : 'bg-stone-700 text-stone-200'}
          `}
        >
          {side === 'heads' ? '☰ 阳' : '☷ 阴'}
        </div>
      )}

      {/* 底部标签 */}
      {side && !isRolling && (
        <div className="absolute -bottom-6 text-xs font-bold text-amber-800 whitespace-nowrap">
          {side === 'heads' ? '三正面 = 阳爻' : '二正面 = 阴爻'}
        </div>
      )}
    </div>
  );
};

export default Coin;
