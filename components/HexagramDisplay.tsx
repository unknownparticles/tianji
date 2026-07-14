
import React from 'react';
import { LineResult } from '../types';

interface HexagramDisplayProps {
  lines: LineResult[];
  title?: string;
  isChangingMode?: boolean; // 为 true 时显示动爻变化后的阴阳状态。
  isComparison?: boolean; // 变卦出现时收紧宽度，避免两张卦图互相挤压。
}

/** 在固定宽度内绘制六爻，并将爻位与动爻标记限制在组件边界内。 */
const HexagramDisplay: React.FC<HexagramDisplayProps> = ({
  lines,
  title,
  isChangingMode = false,
  isComparison = false
}) => {
  // 卦象自下而上起爻，数组首项是最底部的初爻，展示时需要反转。
  const displayLines = [...lines].reverse();

  return (
    <div className={isComparison
      ? 'flex w-full min-w-0 max-w-[168px] flex-col items-center gap-2'
      : 'flex flex-col items-center gap-2 w-full max-w-[200px]'}>
      {title && <h3 className={isComparison
        ? 'mb-2 text-base font-bold text-red-900 sm:text-lg'
        : 'text-lg font-bold text-red-900 mb-2'}>{title}</h3>}
      <div className={isComparison ? 'flex w-full min-w-0 flex-col gap-3' : 'flex flex-col gap-3 w-full'}>
        {displayLines.map((line, idx) => {
          const actualIdx = lines.length - 1 - idx;
          const isYang = isChangingMode 
            ? (line.isChanging ? line.type === 'yin' : line.type === 'yang')
            : line.type === 'yang';
          
          const lineContent = isYang ? (
            /* 阳爻 */
            <div className="h-full w-full bg-stone-800 rounded-sm"></div>
          ) : (
            /* 阴爻 */
            <div className="h-full w-full flex gap-4">
              <div className="h-full flex-1 bg-stone-800 rounded-sm"></div>
              <div className="h-full flex-1 bg-stone-800 rounded-sm"></div>
            </div>
          );

          if (!isComparison) {
            return (
              <div key={idx} className="relative h-4 w-full flex items-center justify-center">
                <span className="absolute left-[-2rem] text-xs text-stone-400">第{actualIdx + 1}爻</span>
                {lineContent}
                {!isChangingMode && line.isChanging && (
                  <div className="absolute right-[-1.5rem] w-4 h-4 rounded-full border-2 border-red-500 flex items-center justify-center">
                    <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                  </div>
                )}
              </div>
            );
          }

          return (
            <div
              key={idx}
              data-hexagram-row={actualIdx + 1}
              className="grid h-4 w-full min-w-0 grid-cols-[2.25rem_minmax(0,1fr)_1rem] items-center gap-1.5"
            >
              <span className="whitespace-nowrap text-right text-[10px] text-stone-400 sm:text-xs">第{actualIdx + 1}爻</span>
              <div className="flex h-full min-w-0 items-center justify-center">{lineContent}</div>
              {!isChangingMode && line.isChanging ? (
                <div className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-red-500">
                  <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                </div>
              ) : <span aria-hidden="true" />}
            </div>
          );
        })}
        {/* 未完成起卦时保留六爻的稳定高度。 */}
        {Array.from({ length: 6 - lines.length }).map((_, i) => isComparison ? (
          <div key={`p-${i}`} className="grid h-4 w-full min-w-0 grid-cols-[2.25rem_minmax(0,1fr)_1rem] items-center gap-1.5">
            <span aria-hidden="true" />
            <div className="flex h-4 min-w-0 items-center justify-center rounded-sm border border-dashed border-stone-300 opacity-30">
              <span className="text-[10px]">待定</span>
            </div>
            <span aria-hidden="true" />
          </div>
        ) : (
          <div key={`p-${i}`} className="h-4 w-full border border-dashed border-stone-300 rounded-sm flex items-center justify-center opacity-30">
            <span className="text-[10px]">待定</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HexagramDisplay;
