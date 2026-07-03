
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
  const [rotation, setRotation] = useState(0);

  // 太极持续旋转
  useEffect(() => {
    if (phase === 'taiji' || phase === 'bagua') {
      const interval = setInterval(() => {
        setRotation(prev => (prev + 2) % 360);
      }, 50);
      return () => clearInterval(interval);
    }
  }, [phase]);

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
          ${phase === 'expand' ? 'scale-125 opacity-90' : ''}
          ${phase === 'fade' ? 'scale-150 opacity-0' : ''}
        `}
        style={{
          transition: 'all 1s ease-out',
        }}
      >
        {/* 太极图 - 使用 EthanDeL 的 CSS 方法 */}
        <div
          className="relative"
          style={{
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'linear-gradient(to right, #fff 50%, #000 50%)',
            animation: phase !== 'fade' ? 'taijiSpin 4s linear infinite' : 'none',
            boxShadow: '0 0 40px rgba(255, 255, 255, 0.3)',
          }}
        >
          {/* 左半圆（白） */}
          <div
            style={{
              position: 'absolute',
              width: '100px',
              height: '200px',
              left: '0',
              overflow: 'hidden',
              borderRadius: '100px 0 0 100px',
              background: 'linear-gradient(to right, #fff 50%, #000 50%)',
            }}
          >
            {/* 白色鱼眼 */}
            <div
              style={{
                position: 'absolute',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: '#fff',
                top: '30px',
                left: '30px',
              }}
            />
          </div>

          {/* 右半圆（黑） */}
          <div
            style={{
              position: 'absolute',
              width: '100px',
              height: '200px',
              right: '0',
              overflow: 'hidden',
              borderRadius: '0 100px 100px 0',
              background: 'linear-gradient(to left, #000 50%, #fff 50%)',
            }}
          >
            {/* 黑色鱼眼 */}
            <div
              style={{
                position: 'absolute',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: '#000',
                bottom: '30px',
                right: '30px',
              }}
            />
          </div>
        </div>

        {/* 八卦在外圈 - 围绕太极 */}
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
          className="absolute inset-0 rounded-full border-2 border-red-900/20"
          style={{
            width: '280px',
            height: '280px',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
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
