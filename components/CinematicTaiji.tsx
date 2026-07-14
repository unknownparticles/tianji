import React, { useEffect, useRef, useState } from 'react';

interface CinematicTaijiProps {
  /** 请求是否已经结束；结束后组件会播放收束动画再调用 onComplete。 */
  isComplete: boolean;
  /** 收束动画结束时调用，用于安全卸载遮罩。 */
  onComplete: () => void;
}

const MINIMUM_VISIBLE_MS = 1200;
const EXIT_DURATION_MS = 520;

const trigrams = [
  { symbol: '☰', x: 180, y: 35 },
  { symbol: '☱', x: 283, y: 79 },
  { symbol: '☲', x: 326, y: 185 },
  { symbol: '☳', x: 283, y: 291 },
  { symbol: '☷', x: 180, y: 334 },
  { symbol: '☶', x: 77, y: 291 },
  { symbol: '☵', x: 34, y: 185 },
  { symbol: '☴', x: 77, y: 79 }
];

/**
 * 在真实解卦请求期间展示太极八卦推演状态。
 * 动画至少展示一小段时间，避免请求过快时产生闪烁；请求时长没有上限。
 */
const CinematicTaiji: React.FC<CinematicTaijiProps> = ({ isComplete, onComplete }) => {
  const [isExiting, setIsExiting] = useState(false);
  const mountedAtRef = useRef(Date.now());
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!isComplete) return;

    const elapsed = Date.now() - mountedAtRef.current;
    const delayBeforeExit = Math.max(0, MINIMUM_VISIBLE_MS - elapsed);
    let exitTimer: number | undefined;
    const startExitTimer = window.setTimeout(() => {
      setIsExiting(true);
      exitTimer = window.setTimeout(() => onCompleteRef.current(), EXIT_DURATION_MS);
    }, delayBeforeExit);

    return () => {
      window.clearTimeout(startExitTimer);
      if (exitTimer !== undefined) window.clearTimeout(exitTimer);
    };
  }, [isComplete]);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy={!isComplete}
      data-state={isComplete ? 'complete' : 'loading'}
      className={`tianji-overlay fixed inset-0 z-[60] flex flex-col items-center justify-center overflow-hidden ${isExiting ? 'tianji-overlay--exiting' : ''}`}
    >
      <style>{`
        .tianji-overlay {
          color: #29251f;
          background: rgba(246, 242, 233, 0.97);
          opacity: 1;
          transition: opacity ${EXIT_DURATION_MS}ms ease, visibility ${EXIT_DURATION_MS}ms ease;
        }
        .tianji-overlay::before,
        .tianji-overlay::after {
          position: absolute;
          content: '';
          background: rgba(62, 55, 45, 0.1);
          transform: scaleX(0);
          animation: tianji-brush-line 900ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .tianji-overlay::before {
          width: min(82vw, 520px);
          height: 1px;
          top: calc(50% - min(41vw, 260px));
        }
        .tianji-overlay::after {
          width: min(68vw, 430px);
          height: 1px;
          bottom: calc(50% - min(44vw, 278px));
          animation-delay: 120ms;
        }
        .tianji-overlay--exiting {
          opacity: 0;
          visibility: hidden;
        }
        .tianji-stage {
          position: relative;
          width: min(78vw, 360px);
          aspect-ratio: 1;
          animation: tianji-stage-enter 650ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .tianji-orbit {
          width: 100%;
          height: 100%;
          overflow: visible;
        }
        .tianji-orbit-track {
          fill: none;
          stroke: rgba(75, 65, 51, 0.18);
          stroke-width: 1;
        }
        .tianji-orbit-runner {
          fill: none;
          stroke: #9f2e23;
          stroke-width: 1.5;
          stroke-linecap: round;
          stroke-dasharray: 28 18 3 18;
          transform-origin: 180px 180px;
          animation: tianji-orbit-turn 18s linear infinite;
        }
        .tianji-trigram {
          fill: #39332b;
          font-family: serif;
          font-size: 28px;
          opacity: 0.48;
          animation: tianji-trigram-breathe 2.8s ease-in-out infinite;
        }
        .tianji-core {
          position: absolute;
          width: 39%;
          aspect-ratio: 1;
          left: 30.5%;
          top: 30.5%;
          filter: drop-shadow(0 10px 18px rgba(52, 43, 31, 0.12));
          animation: tianji-core-turn 8s linear infinite;
        }
        .tianji-core-ring {
          fill: #f9f6ef;
          stroke: #29251f;
          stroke-width: 1.5;
        }
        .tianji-center-seal {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 12px;
          height: 12px;
          margin: -6px 0 0 -6px;
          border: 1px solid rgba(159, 46, 35, 0.72);
          transform: rotate(45deg);
          animation: tianji-seal-breathe 2.8s ease-in-out infinite;
        }
        .tianji-status-copy {
          min-height: 56px;
          margin-top: 8px;
          text-align: center;
          animation: tianji-copy-enter 700ms 220ms ease both;
        }
        .tianji-status-title {
          margin: 0;
          color: #332e27;
          font-size: 18px;
          font-weight: 700;
          letter-spacing: 0;
        }
        .tianji-status-subtitle {
          margin: 8px 0 0;
          color: #817667;
          font-size: 12px;
          letter-spacing: 0;
        }
        .tianji-dots {
          display: inline-flex;
          width: 24px;
          height: 8px;
          align-items: center;
          justify-content: space-between;
          margin-left: 7px;
          vertical-align: middle;
        }
        .tianji-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #9f2e23;
          animation: tianji-dot 1.2s ease-in-out infinite;
        }
        .tianji-dot:nth-child(2) { animation-delay: 160ms; }
        .tianji-dot:nth-child(3) { animation-delay: 320ms; }
        @keyframes tianji-stage-enter {
          from { opacity: 0; transform: scale(0.94); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes tianji-copy-enter {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes tianji-brush-line {
          to { transform: scaleX(1); }
        }
        @keyframes tianji-orbit-turn {
          to { transform: rotate(360deg); }
        }
        @keyframes tianji-core-turn {
          to { transform: rotate(360deg); }
        }
        @keyframes tianji-trigram-breathe {
          0%, 100% { opacity: 0.36; }
          50% { opacity: 0.86; }
        }
        @keyframes tianji-seal-breathe {
          0%, 100% { opacity: 0.38; transform: rotate(45deg) scale(0.85); }
          50% { opacity: 0.9; transform: rotate(45deg) scale(1.15); }
        }
        @keyframes tianji-dot {
          0%, 100% { opacity: 0.25; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(-3px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .tianji-overlay *,
          .tianji-overlay::before,
          .tianji-overlay::after {
            animation-duration: 1ms !important;
            animation-iteration-count: 1 !important;
          }
        }
      `}</style>

      <div className="tianji-stage" aria-hidden="true">
        <svg className="tianji-orbit" viewBox="0 0 360 360">
          <circle className="tianji-orbit-track" cx="180" cy="180" r="137" />
          <circle className="tianji-orbit-runner" cx="180" cy="180" r="146" />
          {trigrams.map((trigram, index) => (
            <text
              key={trigram.symbol}
              className="tianji-trigram"
              x={trigram.x}
              y={trigram.y}
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ animationDelay: `${index * 140}ms` }}
            >
              {trigram.symbol}
            </text>
          ))}
        </svg>

        <svg className="tianji-core" viewBox="-100 -100 200 200">
          <circle className="tianji-core-ring" cx="0" cy="0" r="98" />
          <path d="M0,-98 A98,98 0 0,1 0,98 A49,49 0 0,0 0,0 A49,49 0 0,1 0,-98Z" fill="#29251f" />
          <circle cx="0" cy="-49" r="49" fill="#f9f6ef" />
          <circle cx="0" cy="49" r="49" fill="#29251f" />
          <circle cx="0" cy="-49" r="9" fill="#29251f" />
          <circle cx="0" cy="49" r="9" fill="#f9f6ef" />
        </svg>
        <div className="tianji-center-seal" />
      </div>

      <div className="tianji-status-copy">
        <p className="tianji-status-title">
          {isComplete ? '卦意已明' : '正在推演卦象'}
          {!isComplete && (
            <span className="tianji-dots" aria-hidden="true">
              <span className="tianji-dot" />
              <span className="tianji-dot" />
              <span className="tianji-dot" />
            </span>
          )}
        </p>
        <p className="tianji-status-subtitle">观其象，察其变，明其意</p>
      </div>
    </div>
  );
};

export default CinematicTaiji;
