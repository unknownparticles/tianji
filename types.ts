
export type CoinSide = 'heads' | 'tails'; // Heads = 3 (Yang), Tails = 2 (Yin)

export interface LineResult {
  coins: [CoinSide, CoinSide, CoinSide];
  sum: number; // 6, 7, 8, or 9
  type: 'yin' | 'yang';
  isChanging: boolean;
}

export interface HexagramData {
  name: string;
  pinyin: string;
  judgment: string;
  image: string;
  description: string;
}

export interface DivinationState {
  lines: LineResult[];
  isRolling: boolean;
  currentResult: LineResult | null;
  interpretation: string | null;
  isLoadingAI: boolean;
}
