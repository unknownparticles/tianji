
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
          relative
          ${phase === 'expand' ? 'taiji-expand' : ''}
          ${phase === 'fade' ? 'taiji-fade' : ''}
        `}
      >
        {/* 太极图 - 正确CSS实现 */}
        <div className="taiji-container">
          {/* 整个太极容器旋转 */}
          <div className={`taiji-spin ${phase === 'fade' ? 'taiji-spin-stop' : ''}`}>
            {/* 太极本体 */}
            <div className="taiji">
              {/* 上半白 */}
              <div className="taiji-top">
                <div className="taiji-eye-white"></div>
              </div>
              {/* 下半黑 */}
              <div className="taiji-bottom">
                <div className="taiji-eye-black"></div>
              </div>
            </div>
          </div>
        </div>

        {/* 八卦在外圈 - 围绕太极 */}
        {(phase === 'bagua' || phase === 'expand' || phase === 'fade') && (
          <div className="bagua-container">
            {BAGUA.map((bagua) => (
              <div
                key={bagua.name}
                className={`bagua-item ${phase === 'bagua' ? 'bagua-visible' : 'bagua-hidden'}`}
                style={{
                  transform: `rotate(${bagua.angle}deg) translateY(-140px) rotate(-${bagua.angle}deg)`,
                }}
              >
                <span className={bagua.angle === 0 || bagua.angle === 180 ? 'text-red-700' : 'text-red-900'}>
                  {bagua.name}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* 外圈装饰 */}
        <div className="taiji-ring"></div>
      </div>

      {/* 扩散光效 */}
      {(phase === 'expand' || phase === 'fade') && (
        <div className="taiji-glow"></div>
      )}

      <style>{`
        .taiji-container {
          width: 200px;
          height: 200px;
          position: relative;
        }

        .taiji-spin {
          width: 100%;
          height: 100%;
          animation: taijiSpin 4s linear infinite;
        }

        .taiji-spin-stop {
          animation: none;
        }

        .taiji {
          width: 200px;
          height: 200px;
          border-radius: 50%;
          position: relative;
          background: linear-gradient(to right, #fff 50%, #000 50%);
          box-shadow: 0 0 40px rgba(255, 255, 255, 0.3);
        }

        .taiji-top {
          position: absolute;
          width: 100px;
          height: 200px;
          left: 0;
          top: 0;
          overflow: hidden;
          border-radius: 100px 0 0 100px;
          background: linear-gradient(to right, #fff 50%, #000 50%);
        }

        .taiji-eye-white {
          position: absolute;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #fff;
          bottom: 30px;
          right: 30px;
        }

        .taiji-bottom {
          position: absolute;
          width: 100px;
          height: 200px;
          right: 0;
          top: 0;
          overflow: hidden;
          border-radius: 0 100px 100px 0;
          background: linear-gradient(to left, #000 50%, #fff 50%);
        }

        .taiji-eye-black {
          position: absolute;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #000;
          top: 30px;
          left: 30px;
        }

        @keyframes taijiSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .taiji-expand {
          transform: scale(1.25);
          opacity: 0.9;
          transition: all 1s ease-out;
        }

        .taiji-fade {
          transform: scale(1.5);
          opacity: 0;
          transition: all 1s ease-out;
        }

        .bagua-container {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .bagua-item {
          position: absolute;
          left: 50%;
          top: 50%;
          font-size: 1.75rem;
          font-weight: bold;
          transition: all 0.5s ease;
        }

        .bagua-visible {
          opacity: 1;
          transform: rotate(var(--angle)) translateY(-140px) rotate(calc(-1 * var(--angle))) scale(1);
        }

        .bagua-hidden {
          opacity: 0;
          transform: rotate(var(--angle)) translateY(-140px) rotate(calc(-1 * var(--angle))) scale(0.75);
        }

        .taiji-ring {
          position: absolute;
          width: 280px;
          height: 280px;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          border: 2px solid rgba(127, 29, 29, 0.2);
        }

        .taiji-glow {
          position: absolute;
          width: 320px;
          height: 320px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(251, 191, 36, 0.2) 0%, transparent 70%);
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 0.3; }
        }
      `}</style>
    </div>
  );
};

export default TaijiReveal;
