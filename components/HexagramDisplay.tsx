
import React from 'react';
import { LineResult } from '../types';

interface HexagramDisplayProps {
  lines: LineResult[];
  title?: string;
  isChangingMode?: boolean; // 为 true 时显示动爻变化后的阴阳状态。
}

/** 在固定宽度内绘制六爻，并将爻位与动爻标记限制在组件边界内。 */
const HexagramDisplay: React.FC<HexagramDisplayProps> = ({ lines, title, isChangingMode = false }) => {
  // 卦象自下而上起爻，数组首项是最底部的初爻，展示时需要反转。
  const displayLines = [...lines].reverse();

  return (
    <div className="flex w-full min-w-0 max-w-[168px] flex-col items-center gap-2">
      {title && <h3 className="mb-2 text-base font-bold text-red-900 sm:text-lg">{title}</h3>}
      <div className="flex w-full min-w-0 flex-col gap-3">
        {displayLines.map((line, idx) => {
          const actualIdx = lines.length - 1 - idx;
          const isYang = isChangingMode 
            ? (line.isChanging ? line.type === 'yin' : line.type === 'yang')
            : line.type === 'yang';
          
          return (
            <div
              key={idx}
              data-hexagram-row={actualIdx + 1}
              className="grid h-4 w-full min-w-0 grid-cols-[2.25rem_minmax(0,1fr)_1rem] items-center gap-1.5"
            >
               <span className="whitespace-nowrap text-right text-[10px] text-stone-400 sm:text-xs">第{actualIdx + 1}爻</span>
               <div className="flex h-full min-w-0 items-center justify-center">
               {isYang ? (
                 /* 阳爻 */
                 <div className="h-full w-full bg-stone-800 rounded-sm"></div>
               ) : (
                 /* 阴爻 */
                 <div className="h-full w-full flex gap-4">
                    <div className="h-full flex-1 bg-stone-800 rounded-sm"></div>
                    <div className="h-full flex-1 bg-stone-800 rounded-sm"></div>
                 </div>
               )}
               </div>
               {!isChangingMode && line.isChanging && (
                 <div className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-red-500">
                    <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                 </div>
               )}
               {(isChangingMode || !line.isChanging) && <span aria-hidden="true" />}
            </div>
          );
        })}
        {/* 未完成起卦时保留六爻的稳定高度。 */}
        {Array.from({ length: 6 - lines.length }).map((_, i) => (
          <div key={`p-${i}`} className="grid h-4 w-full min-w-0 grid-cols-[2.25rem_minmax(0,1fr)_1rem] items-center gap-1.5">
            <span aria-hidden="true" />
            <div className="flex h-4 min-w-0 items-center justify-center rounded-sm border border-dashed border-stone-300 opacity-30">
              <span className="text-[10px]">待定</span>
            </div>
            <span aria-hidden="true" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default HexagramDisplay;
