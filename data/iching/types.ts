/** 本地问题分类，综合分类用于没有填写咨询问题的情况。 */
export type QuestionCategory = '综合' | '事业' | '财运' | '感情' | '健康' | '学业' | '出行';

/** 需要用户手动确认的六类具体事项；综合仅用于未填写问题时的默认解读。 */
export type SelectableQuestionCategory = Exclude<QuestionCategory, '综合'>;

/** 单条爻辞及其白话翻译。 */
export interface YaoKnowledge {
  position: string;
  text: string;
  translation: string;
}

/** 本地知识库中的一卦，binary 按初爻到上爻排列。 */
export interface HexagramKnowledge {
  number: number;
  name: string;
  fullName: string;
  upperTrigram: string;
  lowerTrigram: string;
  binary: string;
  unicode: string;
  guaCi: string;
  guaCiTranslation: string;
  daXiang: string;
  yaoTexts: YaoKnowledge[];
  yongText?: string;
  keywords: string[];
  palace: string;
  palaceOrder: number;
  worldLine: number;
  responseLine: number;
}
