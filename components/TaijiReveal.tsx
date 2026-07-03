
import React, { useEffect, useState } from 'react';

interface TaijiRevealProps {
  onComplete: () => void;
}

// 八卦符号定义：每个卦由三个爻组成，阳爻为实线，阴爻为断线
const BAGUA = [
  { name: '乾', symbol: '111', x: 100, y: 8 },
  { name: '兑', symbol: '011', x: 178, y: 35 },
  { name: '离', symbol: '101', x: 215, y: 100 },
  { name: '震', symbol: '001', x: 178, y: 165 },
  { name: '巽', symbol: '110', x: 100, y: 192 },
  { name: '坎', symbol: '010', x: 22, y: 165 },
  { name: '艮', symbol: '100', x: -15, y: 100 },
  { name: '坤', symbol: '000', x: 22, y: 35 },
];

// 绘制爻线
const DrawYao = ({ y, isYang }: { y: number; isYang: boolean }) => {
  if (isYang) {
    // 阳爻 - 实线
    return <line x1="0" y1={y} x2="20" y2={y} stroke="#dc2626" strokeWidth="3" strokeLinecap="round" />;
  } else {
    // 阴爻 - 断线
    return (
      <>
        <line x1="0" y1={y} x2="8" y2={y} stroke="#dc2626" strokeWidth="3" strokeLinecap="round" />
        <line x1="12" y1={y} x2="20" y2={y} stroke="#dc2626" strokeWidth="3" strokeLinecap="round" />
      </>
    );
  }
};

const TaijiReveal: React.FC<TaijiRevealProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'taiji' | 'bagua' | 'expand' | 'fade'>('taiji');

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    // 太极旋转
    timers.push(setTimeout(() => setPhase('bagua'), 1500));
    // 八卦显现
    timers.push(setTimeout(() => setPhase('expand'), 2500));
    // 放大扩散
    timers.push(setTimeout(() => setPhase('fade'), 3500));
    // 完成
    timers.push(setTimeout(() => onComplete(), 4500));

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[#fffdf5]/98 z-50 overflow-hidden">
      {/* 背景光晕 */}
      <div className="absolute inset-0 bg-gradient-radial from-amber-200/30 via-transparent to-transparent" />

      {/* 太极八卦主体 */}
      <div
        className={`
          relative transition-all duration-1000 ease-out
          ${phase === 'taiji' ? 'scale-100 opacity-100' : ''}
          ${phase === 'bagua' ? 'scale-110 opacity-100' : ''}
          ${phase === 'expand' ? 'scale-150 opacity-80' : ''}
          ${phase === 'fade' ? 'scale-200 opacity-0' : ''}
        `}
        style={{
          animation: phase === 'taiji' ? 'taijiSpin 2s linear infinite' : 'none',
        }}
      >
        <svg width="250" height="250" viewBox="-50 -50 200 200" className="drop-shadow-2xl">
          {/* 外圈 */}
          <circle cx="50" cy="50" r="48" fill="none" stroke="#991b1b" strokeWidth="1" opacity="0.3" />

          {/* 太极图 */}
          <g>
            {/* 阴阳分界曲线 - 左半边黑 */}
            <path
              d="M 50 2
                 A 48 48 0 0 0 50 98
                 A 24 24 0 0 1 50 50
                 A 24 24 0 0 0 50 2"
              fill="#1c1917"
            />
            {/* 右半边白 */}
            <path
              d="M 50 2
                 A 48 48 0 0 1 50 98
                 A 24 24 0 0 0 50 50
                 A 24 24 0 0 1 50 2"
              fill="#fafaf9"
            />
            {/* 阴鱼（黑） */}
            <circle cx="50" cy="74" r="12" fill="#1c1917" />
            <circle cx="50" cy="74" r="4" fill="#fafaf9" />
            {/* 阳鱼（白） */}
            <circle cx="50" cy="26" r="12" fill="#fafaf9" />
            <circle cx="50" cy="26" r="4" fill="#1c1917" />
          </g>

          {/* 八卦符号 */}
          {(phase === 'bagua' || phase === 'expand' || phase === 'fade') && (
            <g className="transition-opacity duration-500">
              {BAGUA.map((bagua, idx) => {
                // 将爻从下到上排列
                const yaos = bagua.symbol.split('').reverse();
                return (
                  <g
                    key={idx}
                    transform={`translate(${bagua.x}, ${bagua.y})`}
                    style={{
                      opacity: phase === 'bagua' || phase === 'expand' ? 1 : 0,
                      transition: `opacity 0.5s ease ${idx * 0.05}s`
                    }}
                  >
                    {yaos.map((yao, i) => (
                      <DrawYao key={i} y={i * 6} isYang={yao === '1'} />
                    ))}
                  </g>
                );
              })}
            </g>
          )}
        </svg>

        {/* 外发光 */}
        <div
          className={`
            absolute inset-0 -z-10 rounded-full
            bg-gradient-radial from-amber-400/40 to-transparent
            blur-2xl transition-all duration-1000
            ${phase === 'expand' ? 'scale-150 opacity-30' : ''}
            ${phase === 'fade' ? 'scale-200 opacity-0' : ''}
          `}
        />
      </div>

      {/* 粒子爆发效果 */}
      {(phase === 'expand' || phase === 'fade') && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(16)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-amber-400"
              style={{
                left: '50%',
                top: '50%',
                '--angle': `${i * 22.5}deg`,
                animation: `particleBurst 1s ease-out forwards`,
                animationDelay: `${i * 0.03}s`,
              } as React.CSSProperties}
            />
          ))}
        </div>
      )}

      <style>{`
        @keyframes taijiSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes particleBurst {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) rotate(var(--angle)) translateY(-30px) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) rotate(var(--angle)) translateY(-180px) scale(0.3);
          }
        }
        .bg-gradient-radial {
          background: radial-gradient(circle, rgba(251, 191, 36, 0.2) 0%, transparent 70%);
        }
      `}</style>
    </div>
  );
};

export default TaijiReveal;
