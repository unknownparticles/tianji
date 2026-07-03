
import React, { useEffect, useState } from 'react';

interface TaijiRevealProps {
  onComplete: () => void;
}

// 八卦名称和位置（在外圈）
const BAGUA = [
  { name: '乾', angle: 0 },
  { name: '兑', angle: 45 },
  { name: '离', angle: 90 },
  { name: '震', angle: 135 },
  { name: '巽', angle: 180 },
  { name: '坎', angle: 225 },
  { name: '艮', angle: 270 },
  { name: '坤', angle: 315 },
];

const TaijiReveal: React.FC<TaijiRevealProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'taiji' | 'bagua' | 'expand' | 'fade'>('taiji');

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    timers.push(setTimeout(() => setPhase('bagua'), 2000));
    timers.push(setTimeout(() => setPhase('expand'), 3000));
    timers.push(setTimeout(() => setPhase('fade'), 4000));
    timers.push(setTimeout(() => onComplete(), 5000));

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[#fffdf5]/98 z-50 overflow-hidden">
      {/* 背景光晕 */}
      <div className="absolute inset-0 bg-gradient-radial from-amber-200/20 via-transparent to-transparent" />

      {/* 太极八卦主体 */}
      <div
        className={`
          relative flex items-center justify-center
          ${phase === 'expand' ? 'scale-125 opacity-90' : ''}
          ${phase === 'fade' ? 'scale-150 opacity-0' : ''}
        `}
        style={{ transition: 'all 1s ease-out' }}
      >
        {/* 太极 SVG */}
        <div
          className={`
            ${phase !== 'fade' ? 'taiji-spin' : ''}
          `}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="-100 -100 200 200"
            width="200"
            height="200"
            style={{
              filter: 'drop-shadow(0 0 20px rgba(251, 191, 36, 0.5))',
            }}
          >
            {/* 外圆 */}
            <circle cx="0" cy="0" r="100" fill="white" stroke="#991b1b" strokeWidth="2" />

            {/* 黑色半边 */}
            <path
              d="
                M0,-100
                A100,100 0 0 1 0,100
                A50,50 0 0 0 0,0
                A50,50 0 0 1 0,-100
              "
              fill="black"
            />

            {/* 白色上鱼 */}
            <circle cx="0" cy="-50" r="50" fill="white" />

            {/* 黑色下鱼 */}
            <circle cx="0" cy="50" r="50" fill="black" />

            {/* 阳眼 */}
            <circle cx="0" cy="-50" r="10" fill="black" />

            {/* 阴眼 */}
            <circle cx="0" cy="50" r="10" fill="white" />
          </svg>
        </div>

        {/* 八卦在外圈 */}
        {(phase === 'bagua' || phase === 'expand' || phase === 'fade') && (
          <div className="absolute inset-0">
            {BAGUA.map((bagua) => (
              <div
                key={bagua.name}
                className={`
                  absolute text-3xl font-bold
                  transition-all duration-500
                  ${phase === 'bagua' ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}
                `}
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `rotate(${bagua.angle}deg) translateY(-130px) rotate(-${bagua.angle}deg)`,
                  color: bagua.angle === 0 || bagua.angle === 180 ? '#dc2626' : '#991b1b',
                }}
              >
                {bagua.name}
              </div>
            ))}
          </div>
        )}

        {/* 外圈装饰 */}
        <div
          className="absolute rounded-full border-2 border-red-900/20"
          style={{
            width: '280px',
            height: '280px',
          }}
        />
      </div>

      {/* 扩散光效 */}
      {(phase === 'expand' || phase === 'fade') && (
        <div
          className="absolute w-80 h-80 rounded-full bg-gradient-radial from-amber-400/20 to-transparent blur-3xl"
          style={{
            animation: 'pulse 2s ease-in-out infinite',
          }}
        />
      )}

      <style>{`
        @keyframes taijiSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .taiji-spin {
          animation: taijiSpin 4s linear infinite;
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 0.3; }
        }
        .bg-gradient-radial {
          background: radial-gradient(circle, rgba(251, 191, 36, 0.2) 0%, transparent 70%);
        }
      `}</style>
    </div>
  );
};

export default TaijiReveal;
