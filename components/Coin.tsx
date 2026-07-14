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
          <div className="coin-face coin-face--heads">
            <span className="coin-character">乾</span>
            <span className="coin-hole" />
            <span className="coin-inscription">元亨</span>
          </div>
          <div className="coin-face coin-face--tails">
            <span className="coin-character">坤</span>
            <span className="coin-hole" />
            <span className="coin-inscription">利贞</span>
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
