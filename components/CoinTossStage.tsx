import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import type { CoinSide } from '../types';
import Coin from './Coin';

export type TossTriggerSource = 'button' | 'shake';

interface CoinTossStageProps {
  sides: CoinSide[];
  isRolling: boolean;
  muted: boolean;
  triggerSource: TossTriggerSource | null;
  onToggleMuted: () => void;
}

const SPARKS = [0, 1, 2, 3, 4, 5] as const;

/** 铜钱风暴抛币场景，集中管理轨迹、火花、状态文本与音效开关。 */
const CoinTossStage: React.FC<CoinTossStageProps> = ({
  sides,
  isRolling,
  muted,
  triggerSource,
  onToggleMuted
}) => {
  const statusText = isRolling
    ? triggerSource === 'shake' ? '已感应摇动，铜钱翻飞中' : '铜钱翻飞中'
    : sides.length === 3 ? '铜钱已落定' : '静候起卦';
  const SoundIcon = muted ? VolumeX : Volume2;

  return (
    <div className="coin-storm-stage" data-rolling={isRolling}>
      <style>{`
        .coin-storm-stage {
          position: relative;
          width: 100%;
          min-height: 292px;
          overflow: hidden;
          border: 1px solid rgba(112, 79, 45, 0.34);
          border-radius: 8px;
          background:
            radial-gradient(circle at 50% 30%, rgba(221, 162, 65, 0.2), transparent 34%),
            linear-gradient(145deg, #201d19 0%, #33261f 58%, #5a2c22 100%);
          box-shadow: inset 0 0 42px rgba(10, 8, 5, 0.34);
          isolation: isolate;
        }
        .coin-storm-stage::before,
        .coin-storm-stage::after {
          position: absolute;
          content: '';
          pointer-events: none;
        }
        .coin-storm-stage::before {
          inset: 18px;
          border: 1px solid rgba(229, 191, 118, 0.12);
          border-radius: 50%;
          transform: scaleY(0.62);
        }
        .coin-storm-stage::after {
          width: 10px;
          height: 10px;
          left: calc(50% - 5px);
          top: 23px;
          border: 1px solid rgba(226, 171, 74, 0.58);
          transform: rotate(45deg);
        }
        .coin-storm-sound {
          position: absolute;
          z-index: 8;
          top: 12px;
          right: 12px;
          display: inline-flex;
          width: 36px;
          height: 36px;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(239, 203, 132, 0.28);
          border-radius: 50%;
          color: #f0d8a3;
          background: rgba(31, 27, 23, 0.72);
          transition: color 180ms ease, border-color 180ms ease, background 180ms ease;
        }
        .coin-storm-sound:hover {
          color: #fff3cf;
          border-color: rgba(239, 203, 132, 0.58);
          background: rgba(96, 42, 31, 0.84);
        }
        .coin-storm-coins {
          position: absolute;
          z-index: 4;
          width: min(88%, 380px);
          left: 50%;
          bottom: 54px;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
          transform: translateX(-50%);
        }
        .coin-storm-slot {
          --coin-delay: 0ms;
          --coin-x: 0px;
          --coin-settle-x: 0px;
          --coin-turns: 1440deg;
          position: relative;
          width: clamp(64px, 18vw, 82px);
          height: 94px;
          justify-self: center;
          perspective: 720px;
        }
        .coin-flight,
        .coin-body,
        .coin-face {
          position: absolute;
          inset: 0 auto auto 0;
          width: 100%;
          aspect-ratio: 1;
          border-radius: 50%;
          transform-style: preserve-3d;
        }
        .coin-body {
          transform: rotateY(0deg);
          filter: drop-shadow(0 12px 14px rgba(0, 0, 0, 0.38));
        }
        .coin-body[data-side="tails"] {
          transform: rotateY(180deg);
        }
        .coin-face {
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid #d89e31;
          color: #694018;
          background: radial-gradient(circle at 35% 28%, #ffe7a0 0%, #d8a33e 40%, #89511d 82%);
          box-shadow:
            inset 0 0 0 4px rgba(255, 226, 147, 0.28),
            inset 0 -7px 12px rgba(92, 48, 13, 0.25);
          backface-visibility: hidden;
        }
        .coin-face--tails {
          color: #5f3b1a;
          background: radial-gradient(circle at 35% 28%, #f5d686 0%, #c88d31 43%, #754519 84%);
          transform: rotateY(180deg);
        }
        .coin-hole {
          position: absolute;
          width: 25%;
          aspect-ratio: 1;
          border: 2px solid #764619;
          border-radius: 2px;
          background: #2d251e;
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.52);
          transform: rotate(45deg);
        }
        .coin-character {
          position: absolute;
          top: 8%;
          font-size: clamp(10px, 2.8vw, 13px);
          font-weight: 700;
        }
        .coin-inscription {
          position: absolute;
          bottom: 8%;
          font-size: clamp(8px, 2.2vw, 10px);
          font-weight: 700;
          letter-spacing: 0;
        }
        .coin-result {
          position: absolute;
          top: calc(100% - 8px);
          left: 50%;
          display: inline-flex;
          min-width: 50px;
          min-height: 24px;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          padding: 3px 7px;
          color: #fff5d8;
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
          transform: translateX(-50%);
          animation: coin-result-enter 260ms ease both;
        }
        .coin-result--yang { background: #8e2d25; }
        .coin-result--yin { background: #46413a; }
        .coin-storm-trail {
          position: absolute;
          z-index: 2;
          width: min(68%, 290px);
          height: 2px;
          left: 16%;
          top: 45%;
          border-radius: 50%;
          opacity: 0;
          background: linear-gradient(90deg, transparent, rgba(247, 193, 87, 0.9), transparent);
          transform: rotate(-20deg) scaleX(0.3);
        }
        .coin-storm-trail--two {
          top: 58%;
          transform: rotate(18deg) scaleX(0.3);
        }
        .coin-storm-spark {
          position: absolute;
          z-index: 3;
          width: 5px;
          height: 5px;
          left: var(--spark-left);
          top: var(--spark-top);
          border-radius: 50%;
          opacity: 0;
          background: #f6c45f;
          box-shadow: 0 0 10px rgba(246, 196, 95, 0.82);
        }
        .coin-storm-stage[data-rolling="true"] .coin-flight {
          animation: coin-storm-flight 1320ms cubic-bezier(0.2, 0.75, 0.25, 1) var(--coin-delay) both;
        }
        .coin-storm-stage[data-rolling="true"] .coin-body {
          animation: coin-storm-spin 1320ms cubic-bezier(0.2, 0.75, 0.25, 1) var(--coin-delay) both;
        }
        .coin-storm-stage[data-rolling="true"] .coin-storm-trail {
          animation: coin-storm-trail 720ms ease-out 260ms both;
        }
        .coin-storm-stage[data-rolling="true"] .coin-storm-trail--two {
          animation-delay: 420ms;
        }
        .coin-storm-stage[data-rolling="true"] .coin-storm-spark {
          animation: coin-storm-spark 680ms ease-out calc(300ms + var(--spark-delay)) both;
        }
        .coin-storm-status {
          position: absolute;
          z-index: 7;
          right: 48px;
          bottom: 12px;
          left: 48px;
          margin: 0;
          color: #d9c8a5;
          font-size: 12px;
          text-align: center;
          letter-spacing: 0;
        }
        @keyframes coin-storm-flight {
          0% { transform: translate3d(0, 8px, 0) scale(1); }
          12% { transform: translate3d(0, 20px, 0) scale(0.96); }
          62% { transform: translate3d(var(--coin-x), -128px, 0) scale(1.1); }
          88% { transform: translate3d(var(--coin-settle-x), 5px, 0) scale(1); }
          94% { transform: translate3d(0, -9px, 0) scale(1.02); }
          100% { transform: translate3d(0, 0, 0) scale(1); }
        }
        @keyframes coin-storm-spin {
          from { transform: rotateY(0deg) rotateX(0deg); }
          to { transform: rotateY(var(--coin-turns)) rotateX(24deg); }
        }
        @keyframes coin-storm-trail {
          0% { opacity: 0; transform: translateX(-26px) rotate(-20deg) scaleX(0.25); }
          45% { opacity: 1; }
          100% { opacity: 0; transform: translateX(24px) rotate(-20deg) scaleX(1); }
        }
        @keyframes coin-storm-spark {
          0% { opacity: 0; transform: translateY(18px) scale(0.4); }
          42% { opacity: 1; }
          100% { opacity: 0; transform: translateY(-54px) scale(1.2); }
        }
        @keyframes coin-result-enter {
          from { opacity: 0; transform: translate(-50%, 6px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .coin-storm-stage[data-rolling="true"] .coin-flight,
          .coin-storm-stage[data-rolling="true"] .coin-body {
            animation: coin-storm-reduced 240ms ease both;
          }
          .coin-storm-trail,
          .coin-storm-spark {
            display: none;
          }
        }
        @keyframes coin-storm-reduced {
          from { opacity: 0.5; }
          to { opacity: 1; }
        }
      `}</style>

      <button
        type="button"
        className="coin-storm-sound"
        onClick={onToggleMuted}
        aria-label={muted ? '开启铜钱音效' : '静音铜钱音效'}
        title={muted ? '开启铜钱音效' : '静音铜钱音效'}
      >
        <SoundIcon className="h-4 w-4" />
      </button>

      <span className="coin-storm-trail" aria-hidden="true" />
      <span className="coin-storm-trail coin-storm-trail--two" aria-hidden="true" />
      {SPARKS.map(index => (
        <span
          key={index}
          data-spark={index}
          className="coin-storm-spark"
          aria-hidden="true"
          style={{
            '--spark-left': `${18 + index * 13}%`,
            '--spark-top': `${28 + (index % 3) * 15}%`,
            '--spark-delay': `${index * 55}ms`
          } as React.CSSProperties}
        />
      ))}

      <div className="coin-storm-coins">
        {[0, 1, 2].map(index => (
          <Coin
            key={index}
            index={index}
            side={sides[index] || null}
            isRolling={isRolling}
          />
        ))}
      </div>

      <p className="coin-storm-status" role="status" aria-live="polite" aria-busy={isRolling}>
        {statusText}
      </p>
    </div>
  );
};

export default CoinTossStage;
