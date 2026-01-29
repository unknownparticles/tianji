
import React from 'react';
import { LineResult } from '../types';

interface HexagramDisplayProps {
  lines: LineResult[];
  title?: string;
  isChangingMode?: boolean; // If true, shows the state *after* changes
}

const HexagramDisplay: React.FC<HexagramDisplayProps> = ({ lines, title, isChangingMode = false }) => {
  // Hexagram lines are drawn from bottom up. 
  // In the array, lines[0] is the first (bottom) line.
  const displayLines = [...lines].reverse();

  return (
    <div className="flex flex-col items-center gap-2 w-full max-w-[200px]">
      {title && <h3 className="text-lg font-bold text-red-900 mb-2">{title}</h3>}
      <div className="flex flex-col gap-3 w-full">
        {displayLines.map((line, idx) => {
          const actualIdx = lines.length - 1 - idx;
          const isYang = isChangingMode 
            ? (line.isChanging ? line.type === 'yin' : line.type === 'yang')
            : line.type === 'yang';
          
          return (
            <div key={idx} className="relative h-4 w-full flex items-center justify-center">
               <span className="absolute left-[-2rem] text-xs text-stone-400">第{actualIdx + 1}爻</span>
               {isYang ? (
                 /* Yang Line: Solid */
                 <div className="h-full w-full bg-stone-800 rounded-sm"></div>
               ) : (
                 /* Yin Line: Broken */
                 <div className="h-full w-full flex gap-4">
                    <div className="h-full flex-1 bg-stone-800 rounded-sm"></div>
                    <div className="h-full flex-1 bg-stone-800 rounded-sm"></div>
                 </div>
               )}
               {!isChangingMode && line.isChanging && (
                 <div className="absolute right-[-1.5rem] w-4 h-4 rounded-full border-2 border-red-500 flex items-center justify-center">
                    <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                 </div>
               )}
            </div>
          );
        })}
        {/* Fill placeholders if less than 6 lines */}
        {Array.from({ length: 6 - lines.length }).map((_, i) => (
          <div key={`p-${i}`} className="h-4 w-full border border-dashed border-stone-300 rounded-sm flex items-center justify-center opacity-30">
            <span className="text-[10px]">待定</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HexagramDisplay;
