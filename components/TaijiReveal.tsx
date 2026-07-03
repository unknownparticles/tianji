
import React, { useEffect, useState } from 'react';

interface TaijiRevealProps {
  onComplete: () => void;
}

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
        {/* 太极八卦 SVG */}
        <div
          className={phase !== 'fade' ? 'animate-spin' : ''}
          style={{ animationDuration: '8s' }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="-350 -350 700 700"
            width="280"
            height="280"
            style={{
              filter: 'drop-shadow(0 0 20px rgba(251, 191, 36, 0.5))',
            }}
          >
            {/* 中心太极 */}
            <g>
              <circle cx="0" cy="0" r="80" fill="#fff" />
              <path
                fill="#000"
                d="
                  M0,-80
                  A80,80 0 0 1 0,80
                  A40,40 0 0 0 0,0
                  A40,40 0 0 1 0,-80Z"
              />
              <circle cx="0" cy="-40" r="40" fill="#fff" />
              <circle cx="0" cy="40" r="40" fill="#000" />
              <circle cx="0" cy="-40" r="8" fill="#000" />
              <circle cx="0" cy="40" r="8" fill="#fff" />
            </g>

            <defs>
              <g id="yang">
                <rect x="-40" y="-5" width="80" height="10" fill="#000" />
              </g>

              <g id="yin">
                <rect x="-40" y="-5" width="30" height="10" fill="#000" />
                <rect x="10" y="-5" width="30" height="10" fill="#000" />
              </g>
            </defs>

            {/* ☰ 乾 */}
            <g transform="translate(0,-220)">
              <use href="#yang" y="-30" />
              <use href="#yang" />
              <use href="#yang" y="30" />
            </g>

            {/* ☱ 兑 */}
            <g transform="translate(155,-155) rotate(45)">
              <use href="#yang" y="-30" />
              <use href="#yang" />
              <use href="#yin" y="30" />
            </g>

            {/* ☲ 离 */}
            <g transform="translate(220,0) rotate(90)">
              <use href="#yang" y="-30" />
              <use href="#yin" />
              <use href="#yang" y="30" />
            </g>

            {/* ☳ 震 */}
            <g transform="translate(155,155) rotate(135)">
              <use href="#yin" y="-30" />
              <use href="#yang" />
              <use href="#yang" y="30" />
            </g>

            {/* ☷ 坤 */}
            <g transform="translate(0,220)">
              <use href="#yin" y="-30" />
              <use href="#yin" />
              <use href="#yin" y="30" />
            </g>

            {/* ☶ 艮 */}
            <g transform="translate(-155,155) rotate(225)">
              <use href="#yang" y="-30" />
              <use href="#yin" />
              <use href="#yin" y="30" />
            </g>

            {/* ☵ 坎 */}
            <g transform="translate(-220,0) rotate(270)">
              <use href="#yin" y="-30" />
              <use href="#yang" />
              <use href="#yin" y="30" />
            </g>

            {/* ☴ 巽 */}
            <g transform="translate(-155,-155) rotate(315)">
              <use href="#yang" y="-30" />
              <use href="#yin" />
              <use href="#yang" y="30" />
            </g>
          </svg>
        </div>
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
