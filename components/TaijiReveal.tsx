
import React, { useEffect, useState } from 'react';

interface TaijiRevealProps {
  onComplete: () => void;
}

const TaijiReveal: React.FC<TaijiRevealProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'taiji' | 'bagua' | 'expand' | 'fade'>('taiji');

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    // 太极旋转 1.5s
    timers.push(setTimeout(() => setPhase('bagua'), 1500));
    // 八卦显现 1s
    timers.push(setTimeout(() => setPhase('expand'), 2500));
    // 放大扩散 1s
    timers.push(setTimeout(() => setPhase('fade'), 3500));
    // 完成
    timers.push(setTimeout(() => onComplete(), 4500));

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[#fffdf5]/95 z-50 overflow-hidden">
      {/* 太极图 */}
      <div
        className={`
          relative transition-all duration-1000
          ${phase === 'taiji' ? 'scale-100 opacity-100' : ''}
          ${phase === 'bagua' ? 'scale-100 opacity-100' : ''}
          ${phase === 'expand' ? 'scale-150 opacity-80' : ''}
          ${phase === 'fade' ? 'scale-300 opacity-0' : ''}
        `}
        style={{
          animation: phase === 'taiji' || phase === 'bagua' ? 'spin 2s linear infinite' : 'none'
        }}
      >
        {/* 太极 SVG */}
        <svg width="200" height="200" viewBox="0 0 200 200" className="drop-shadow-2xl">
          {/* 外圈 */}
          <circle cx="100" cy="100" r="95" fill="none" stroke="#dc2626" strokeWidth="3" opacity="0.3" />

          {/* 太极主体 */}
          <g>
            {/* 大圆 - 阴 */}
            <circle cx="100" cy="100" r="80" fill="#1c1917" />

            {/* 阳鱼 */}
            <circle cx="100" cy="60" r="40" fill="#fafaf9" />
            <circle cx="100" cy="60" r="12" fill="#1c1917" />

            {/* 阴鱼 */}
            <circle cx="100" cy="140" r="40" fill="#1c1917" />
            <circle cx="100" cy="140" r="12" fill="#fafaf9" />

            {/* 八卦符号 - 8个卦 */}
            {phase !== 'taiji' && (
              <>
                {/* 乾卦 ☰ */}
                <g transform="translate(100, 20)">
                  <line x1="0" y1="0" x2="20" y2="0" stroke="#dc2626" strokeWidth="4" strokeLinecap="round"/>
                  <line x1="0" y1="6" x2="20" y2="6" stroke="#dc2626" strokeWidth="4" strokeLinecap="round"/>
                  <line x1="0" y1="12" x2="20" y2="12" stroke="#dc2626" strokeWidth="4" strokeLinecap="round"/>
                </g>
                {/* 兑卦 ☱ */}
                <g transform="translate(155, 55)">
                  <line x1="0" y1="0" x2="20" y2="0" stroke="#dc2626" strokeWidth="4" strokeLinecap="round"/>
                  <line x1="0" y1="6" x2="20" y2="6" stroke="#dc2626" strokeWidth="4" strokeLinecap="round"/>
                  <line x1="0" y1="12" x2="20" y2="12" stroke="#dc2626" strokeWidth="4" strokeLinecap="round" strokeDasharray="20 10"/>
                </g>
                {/* 离卦 ☲ */}
                <g transform="translate(180, 100)">
                  <line x1="0" y1="0" x2="20" y2="0" stroke="#dc2626" strokeWidth="4" strokeLinecap="round"/>
                  <line x1="0" y1="6" x2="20" y2="6" stroke="#dc2626" strokeWidth="4" strokeLinecap="round" strokeDasharray="20 10"/>
                  <line x1="0" y1="12" x2="20" y2="12" stroke="#dc2626" strokeWidth="4" strokeLinecap="round"/>
                </g>
                {/* 震卦 ☳ */}
                <g transform="translate(155, 145)">
                  <line x1="0" y1="0" x2="20" y2="0" stroke="#dc2626" strokeWidth="4" strokeLinecap="round" strokeDasharray="20 10"/>
                  <line x1="0" y1="6" x2="20" y2="6" stroke="#dc2626" strokeWidth="4" strokeLinecap="round"/>
                  <line x1="0" y1="12" x2="20" y2="12" stroke="#dc2626" strokeWidth="4" strokeLinecap="round"/>
                </g>
                {/* 巽卦 ☴ */}
                <g transform="translate(100, 180)">
                  <line x1="0" y1="0" x2="20" y2="0" stroke="#dc2626" strokeWidth="4" strokeLinecap="round"/>
                  <line x1="0" y1="6" x2="20" y2="6" stroke="#dc2626" strokeWidth="4" strokeLinecap="round" strokeDasharray="20 10"/>
                  <line x1="0" y1="12" x2="20" y2="12" stroke="#dc2626" strokeWidth="4" strokeLinecap="round" strokeDasharray="20 10"/>
                </g>
                {/* 坎卦 ☵ */}
                <g transform="translate(45, 145)">
                  <line x1="0" y1="0" x2="20" y2="0" stroke="#dc2626" strokeWidth="4" strokeLinecap="round" strokeDasharray="20 10"/>
                  <line x1="0" y1="6" x2="20" y2="6" stroke="#dc2626" strokeWidth="4" strokeLinecap="round"/>
                  <line x1="0" y1="12" x2="20" y2="12" stroke="#dc2626" strokeWidth="4" strokeLinecap="round" strokeDasharray="20 10"/>
                </g>
                {/* 艮卦 ☶ */}
                <g transform="translate(20, 100)">
                  <line x1="0" y1="0" x2="20" y2="0" stroke="#dc2626" strokeWidth="4" strokeLinecap="round" strokeDasharray="20 10"/>
                  <line x1="0" y1="6" x2="20" y2="6" stroke="#dc2626" strokeWidth="4" strokeLinecap="round" strokeDasharray="20 10"/>
                  <line x1="0" y1="12" x2="20" y2="12" stroke="#dc2626" strokeWidth="4" strokeLinecap="round"/>
                </g>
                {/* 坤卦 ☷ */}
                <g transform="translate(45, 55)">
                  <line x1="0" y1="0" x2="20" y2="0" stroke="#dc2626" strokeWidth="4" strokeLinecap="round" strokeDasharray="20 10"/>
                  <line x1="0" y1="6" x2="20" y2="6" stroke="#dc2626" strokeWidth="4" strokeLinecap="round" strokeDasharray="20 10"/>
                  <line x1="0" y1="12" x2="20" y2="12" stroke="#dc2626" strokeWidth="4" strokeLinecap="round" strokeDasharray="20 10"/>
                </g>
              </>
            )}
          </g>
        </svg>

        {/* 外发光效果 */}
        <div
          className={`
            absolute inset-0 rounded-full -z-10
            bg-gradient-radial from-amber-400/50 to-transparent
            blur-xl transition-all duration-1000
            ${phase === 'expand' ? 'scale-200 opacity-50' : ''}
            ${phase === 'fade' ? 'scale-300 opacity-0' : ''}
          `}
        />
      </div>

      {/* 粒子光环 */}
      {(phase === 'expand' || phase === 'fade') && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-amber-400"
              style={{
                left: '50%',
                top: '50%',
                animation: `particleBurst 1s ease-out forwards`,
                animationDelay: `${i * 0.05}s`,
                transform: `rotate(${i * 30}deg) translateY(-100px)`
              }}
            />
          ))}
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes particleBurst {
          0% { opacity: 1; transform: rotate(var(--angle)) translateY(-50px) scale(1); }
          100% { opacity: 0; transform: rotate(var(--angle)) translateY(-200px) scale(0); }
        }
        .bg-gradient-radial {
          background: radial-gradient(circle, currentColor 0%, transparent 70%);
        }
      `}</style>
    </div>
  );
};

export default TaijiReveal;
