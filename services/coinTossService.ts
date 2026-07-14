import type { CoinSide, LineResult } from '../types';

export interface CoinTossResult {
  coins: [CoinSide, CoinSide, CoinSide];
  lines: [LineResult, LineResult, LineResult];
}

/** 使用同一个随机源生成一次抛币对应的三枚铜钱与三爻结果。 */
export function createCoinToss(random: () => number = Math.random): CoinTossResult {
  const coins = [random(), random(), random()].map(
    value => value > 0.5 ? 'heads' : 'tails'
  ) as CoinTossResult['coins'];
  const lines = coins.map(side => ({
    coins: [side, side, side],
    sum: side === 'heads' ? 9 : 6,
    type: side === 'heads' ? 'yang' : 'yin',
    isChanging: random() < 0.15
  })) as CoinTossResult['lines'];

  return { coins, lines };
}
