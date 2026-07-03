
import React, { useEffect, useState } from 'react';

interface TaijiRevealProps {
  onComplete: () => void;
}

const TaijiReveal: React.FC<TaijiRevealProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'taiji' | 'bagua' | 'expand' | 'fade'>('taiji');

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    timers.push(setTimeout(() => setPhase('bagua'), 1500));
    timers.push(setTimeout(() => setPhase('expand'), 2500));
    timers.push(setTimeout(() => setPhase('fade'), 3500));
    timers.push(setTimeout(() => onComplete(), 4500));

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[#fffdf5]/98 z-50 overflow-hidden">
      {/* 太极八卦主体 */}
      <div
        className={`
          relative
          ${phase === 'taiji' ? 'scale-100 opacity-100' : ''}
          ${phase === 'bagua' ? 'scale-100 opacity-100' : ''}
          ${phase === 'expand' ? 'scale-125 opacity-90' : ''}
          ${phase === 'fade' ? 'scale-150 opacity-0' : ''}
        `}
        style={{
          transition: 'all 1s ease-out',
        }}
      >
        {/* 太极图 - 使用 CSS 实现 */}
        <div
          className={`
            relative w-40 h-40 md:w-52 md:h-52
            rounded-full
            ${phase === 'taiji' || phase === 'bagua' ? 'animate-taiji-spin' : ''}
          `}
          style={{
            background: `
              radial-gradient(circle at 50% 50%,
                #1c1917 0%, #1c1917 50%,
                #fafaf9 50%, #fafaf9 100%
              )
            `,
            boxShadow: '0 0 60px rgba(251, 191, 36, 0.4)',
          }}
        >
          {/* 阴阳鱼眼 */}
          {/* 上半白（阳） */}
          <div
            className="absolute top-0 left-0 w-full h-1/2 rounded-t-full overflow-hidden"
            style={{ background: '#fafaf9' }}
          >
            <div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-10 md:w-14 md:h-14 rounded-full"
              style={{ background: '#1c1917' }}
            >
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 rounded-full"
                style={{ background: '#fafaf9' }}
              />
            </div>
          </div>

          {/* 下半黑（阴） */}
          <div
            className="absolute bottom-0 left-0 w-full h-1/2 rounded-b-full overflow-hidden"
            style={{ background: '#1c1917' }}
          >
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-10 md:w-14 md:h-14 rounded-full"
              style={{ background: '#fafaf9' }}
            >
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 rounded-full"
                style={{ background: '#1c1917' }}
              />
            </div>
          </div>

          {/* 边缘 */}
          <div className="absolute inset-0 rounded-full border-4 border-red-900/30" />
        </div>

        {/* 八卦 - 8个方位 */}
        {(phase === 'bagua' || phase === 'expand' || phase === 'fade') && (
          <div className="absolute inset-0">
            {/* 八卦位置：上右下左 + 四角 */}
            {[
              { name: '乾', angle: 0, x: '50%', y: '-10%' },
              { name: '兑', angle: 45, x: '95%', y: '20%' },
              { name: '离', angle: 90, x: '110%', y: '50%' },
              { name: '震', angle: 135, x: '95%', y: '80%' },
              { name: '巽', angle: 180, x: '50%', y: '110%' },
              { name: '坎', angle: 225, x: '5%', y: '80%' },
              { name: '艮', angle: 270, x: '-10%', y: '50%' },
              { name: '坤', angle: 315, x: '5%', y: '20%' },
            ].map((bagua) => (
              <div
                key={bagua.name}
                className={`
                  absolute text-2xl md:text-3xl
                  transition-all duration-500
                  ${phase === 'bagua' ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}
                `}
                style={{
                  left: bagua.x,
                  top: bagua.y,
                  transform: 'translate(-50%, -50%)',
                  animationDelay: `${bagua.angle / 45 * 0.1}s`,
                  color: '#991b1b',
                }}
              >
                {bagua.name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 光晕效果 */}
      <div
        className={`
          absolute w-64 h-64 rounded-full
          bg-gradient-radial from-amber-400/30 to-transparent
          blur-3xl
          ${phase === 'expand' ? 'scale-150 opacity-50' : ''}
          ${phase === 'fade' ? 'scale-200 opacity-0' : ''}
        `}
        style={{ transition: 'all 1s ease-out' }}
      />

      <style>{`
        @keyframes taijiSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-taiji-spin {
          animation: taijiSpin 4s linear infinite;
        }
        .bg-gradient-radial {
          background: radial-gradient(circle, rgba(251, 191, 36, 0.3) 0%, transparent 70%);
        }
      `}</style>
    </div>
  );
};

export default TaijiReveal;
