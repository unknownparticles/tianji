
import React from 'react';
import { CoinSide } from '../types';

interface CoinProps {
  side: CoinSide | null;
  isRolling: boolean;
}

const Coin: React.FC<CoinProps> = ({ side, isRolling }) => {
  return (
    <div className={`
      relative w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-amber-600 
      bg-amber-400 flex items-center justify-center shadow-lg transition-all duration-500
      ${isRolling ? 'shake' : ''}
      ${side === 'heads' ? 'rotate-0' : 'rotate-180'}
    `}>
      {/* Ancient Coin Square Hole */}
      <div className="w-5 h-5 md:w-6 md:h-6 bg-stone-100 border-2 border-amber-700 rounded-sm"></div>
      
      {/* Decorative Characters */}
      <div className="absolute inset-0 flex flex-col items-center justify-between py-1 text-[8px] md:text-[10px] font-bold text-amber-900 pointer-events-none">
        <span className="opacity-60">{side === 'heads' ? '乾' : '坤'}</span>
        <div className="flex w-full justify-between px-2">
            <span className="opacity-60">元</span>
            <span className="opacity-60">亨</span>
        </div>
        <span className="opacity-60">{side === 'heads' ? '隆' : '通'}</span>
      </div>

      {/* Side Indicator */}
      <div className="absolute bottom-[-24px] text-xs font-bold text-amber-800">
        {side === 'heads' ? '阳 (3)' : side === 'tails' ? '阴 (2)' : ''}
      </div>
    </div>
  );
};

export default Coin;
