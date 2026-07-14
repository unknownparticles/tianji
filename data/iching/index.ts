import { HEXAGRAMS_PART1 } from './hexagrams-part1';
import { HEXAGRAMS_PART2 } from './hexagrams-part2';
import type { HexagramKnowledge } from './types';

/** 按文王卦序排列的完整本地知识库。 */
export const HEXAGRAMS: readonly HexagramKnowledge[] = Object.freeze(
  [...HEXAGRAMS_PART1, ...HEXAGRAMS_PART2].sort((left, right) => left.number - right.number)
);

/** 通过六位卦码查询知识条目，卦码顺序为初爻到上爻。 */
export const HEXAGRAM_BY_BINARY = Object.freeze(
  Object.fromEntries(HEXAGRAMS.map(hexagram => [hexagram.binary, hexagram]))
) as Readonly<Record<string, HexagramKnowledge>>;

/**
 * 获取指定卦码的知识条目。
 * 数据缺失时明确抛错，避免使用错误卦象继续生成解读。
 */
export function requireHexagram(binary: string): HexagramKnowledge {
  const hexagram = HEXAGRAM_BY_BINARY[binary];
  if (!hexagram) {
    throw new Error(`本地知识库中不存在卦码：${binary}`);
  }
  return hexagram;
}

export type { HexagramKnowledge, QuestionCategory, YaoKnowledge } from './types';
