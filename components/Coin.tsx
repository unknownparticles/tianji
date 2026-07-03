
import React, { useEffect, useRef, useState } from 'react';
import { CoinSide } from '../types';

interface CoinProps {
  side: CoinSide | null;
  isRolling: boolean;
  onAnimationComplete?: () => void;
}

const Coin: React.FC<CoinProps> = ({ side, isRolling, onAnimationComplete }) => {
  const [displaySide, setDisplaySide] = useState<'heads' | 'tails' | null>(null);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const prevRollingRef = useRef(isRolling);

  // 硬币翻滚动画
  useEffect(() => {
    if (isRolling) {
      startTimeRef.current = Date.now();
      setDisplaySide(null);

      const animate = () => {
        const elapsed = Date.now() - startTimeRef.current;
        // 1.2秒的翻滚动画，360度翻转
        const progress = Math.min(elapsed / 1200, 1);
        // 使用 easeOut 效果让动画更自然
        const easeOut = 1 - Math.pow(1 - progress, 3);

        // 每隔一段时间切换显示的正反面
        const flipCycle = (elapsed % 300) < 150;
        setDisplaySide(flipCycle ? 'heads' : 'tails');

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        }
      };

      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      if (side) {
        setDisplaySide(side);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRolling, side]);

  // 动画完成回调
  useEffect(() => {
    if (prevRollingRef.current && !isRolling && side && onAnimationComplete) {
      const timer = setTimeout(() => {
        onAnimationComplete();
      }, 400);
      return () => clearTimeout(timer);
    }
    prevRollingRef.current = isRolling;
  }, [isRolling, side, onAnimationComplete]);

  const currentSide = isRolling ? (displaySide || 'heads') : side;

  return (
    <div className="relative w-20 h-32 flex flex-col items-center">
      {/* 硬币容器 */}
      <div
        className={`
          relative w-16 h-16 md:w-20 md:h-20
          transition-all duration-200
          ${isRolling ? 'animate-coin-toss' : ''}
        `}
      >
        {/* 硬币本体 */}
        <div
          className={`
            w-full h-full rounded-full
            border-4 border-amber-600
            bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500
            flex items-center justify-center shadow-xl
            relative overflow-hidden
            ${isRolling ? '' : 'animate-coin-land'}
          `}
        >
          {/* 金属光泽效果 */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-black/10 rounded-full"></div>

          {/* 古代铜钱方孔 */}
          <div className="w-5 h-5 md:w-6 md:h-6 bg-stone-100 border-2 border-amber-700 rounded-sm transform rotate-45 shadow-inner"></div>

          {/* 装饰字符 */}
          <div className="absolute inset-0 flex flex-col items-center justify-between py-1 text-[8px] md:text-[10px] font-bold text-amber-900 pointer-events-none">
            <span className="opacity-80 tracking-widest">
              {currentSide === 'heads' ? '乾' : '坤'}
            </span>
            <div className="flex w-full justify-between px-2">
              <span className="opacity-80">元</span>
              <span className="opacity-80">亨</span>
            </div>
            <span className="opacity-80 tracking-widest">
              {currentSide === 'heads' ? '隆' : '通'}
            </span>
          </div>

          {/* 边缘装饰 */}
          <div className="absolute inset-0 rounded-full border-2 border-amber-300/50"></div>
        </div>

        {/* 正面/背面指示标签 */}
        {currentSide && !isRolling && (
          <div
            className={`
              absolute -top-6 left-1/2 -translate-x-1/2
              px-2 py-0.5 rounded text-xs font-bold whitespace-nowrap
              ${currentSide === 'heads'
                ? 'bg-red-800 text-amber-100'
                : 'bg-stone-700 text-stone-200'
              }
            `}
          >
            {currentSide === 'heads' ? '☰ 阳' : '☷ 阴'}
          </div>
        )}
      </div>

      {/* 底部标签 */}
      {currentSide && !isRolling && (
        <div className="absolute -bottom-5 text-xs font-bold text-amber-800 whitespace-nowrap">
          {currentSide === 'heads' ? '三正面 = 阳爻' : '二正面 = 阴爻'}
        </div>
      )}
    </div>
  );
};

export default Coin;
