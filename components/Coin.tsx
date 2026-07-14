import React from 'react';
import type { CoinSide } from '../types';

interface CoinProps {
  side: CoinSide | null;
  isRolling: boolean;
  index: number;
}

const COIN_MOTION = [
  { delay: '0ms', x: '-22px', settleX: '-5px', turns: 1440 },
  { delay: '70ms', x: '4px', settleX: '1px', turns: 1800 },
  { delay: '140ms', x: '24px', settleX: '5px', turns: 2160 }
] as const;

const COIN_FACE_INSCRIPTIONS = {
  heads: [
    { position: 'top', character: '乾' },
    { position: 'bottom', character: '元' },
    { position: 'right', character: '通' },
    { position: 'left', character: '宝' }
  ],
  tails: [
    { position: 'top', character: '厚' },
    { position: 'bottom', character: '德' },
    { position: 'right', character: '载' },
    { position: 'left', character: '物' }
  ]
} as const;

function renderCoinInscription(side: keyof typeof COIN_FACE_INSCRIPTIONS) {
  return COIN_FACE_INSCRIPTIONS[side].map(({ position, character }) => (
    <span key={position} className={`coin-glyph coin-glyph--${position}`}>{character}</span>
  ));
}

/** 渲染一枚具有独立飞行与翻面层的铜钱，不读取传感器或生成结果。 */
const Coin: React.FC<CoinProps> = ({ side, isRolling, index }) => {
  const motion = COIN_MOTION[index] || COIN_MOTION[0];
  const finalTurns = motion.turns + (side === 'tails' ? 180 : 0);
  const style = {
    '--coin-delay': motion.delay,
    '--coin-x': motion.x,
    '--coin-settle-x': motion.settleX,
    '--coin-turns': `${finalTurns}deg`
  } as React.CSSProperties;

  return (
    <div className="coin-storm-slot" data-coin-index={index} style={style}>
      <div className="coin-flight">
        <div className="coin-body" data-side={side || 'heads'}>
          <div className="coin-face coin-face--heads" data-coin-face="heads" aria-hidden="true">
            {renderCoinInscription('heads')}
            <span className="coin-hole" />
          </div>
          <div className="coin-face coin-face--tails" data-coin-face="tails" aria-hidden="true">
            {renderCoinInscription('tails')}
            <span className="coin-hole" />
          </div>
        </div>
      </div>

      {!isRolling && side && (
        <span className={`coin-result ${side === 'heads' ? 'coin-result--yang' : 'coin-result--yin'}`}>
          {side === 'heads' ? '☰ 阳' : '☷ 阴'}
        </span>
      )}
    </div>
  );
};

export default Coin;
