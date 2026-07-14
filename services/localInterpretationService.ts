import { requireHexagram } from '../data/iching';
import type { HexagramKnowledge, QuestionCategory, SelectableQuestionCategory } from '../data/iching/types';

export const QUESTION_CATEGORIES: readonly SelectableQuestionCategory[] = [
  '事业', '财运', '感情', '健康', '学业', '出行'
];

const CATEGORY_KEYWORDS: Record<Exclude<QuestionCategory, '综合'>, readonly string[]> = {
  事业: ['事业', '工作', '职场', '求职', '跳槽', '升职', '晋升', '创业', '项目', '合作', '职业'],
  财运: ['财运', '钱', '收入', '投资', '理财', '股票', '基金', '借贷', '债务', '回款', '买卖'],
  感情: ['感情', '恋爱', '爱情', '婚姻', '对象', '伴侣', '复合', '桃花', '分手', '结婚'],
  健康: ['健康', '身体', '疾病', '生病', '康复', '治疗', '手术', '调养', '体检'],
  学业: ['学业', '学习', '考试', '升学', '成绩', '论文', '答辩', '考研', '考公', '证书'],
  出行: ['出行', '旅行', '旅游', '搬家', '迁居', '远行', '航班', '签证', '旅途']
};

interface CategoryLens {
  focus: string;
  reflectionPrompt: string;
  realityCheck: string;
}

const CATEGORY_LENSES: Record<QuestionCategory, CategoryLens> = {
  综合: {
    focus: '整体处境、变化节奏、优先顺序',
    reflectionPrompt: '当前最需要先处理的矛盾是什么，哪些事情可以暂缓？',
    realityCheck: '先核对事实与可用资源，再决定当下最值得投入的一件事。'
  },
  事业: {
    focus: '职责、协作、推进时机',
    reflectionPrompt: '现有职责、资源和合作关系是否支持下一步行动？',
    realityCheck: '重要决定应结合真实岗位信息、资源条件和相关人的反馈。'
  },
  财运: {
    focus: '现金流、风险承受力、交易边界',
    reflectionPrompt: '收益预期是否有数据支撑，最坏结果是否在承受范围内？',
    realityCheck: '投资、借贷或大额支出应以可核验数据和专业意见为准。'
  },
  感情: {
    focus: '沟通、边界、双方投入',
    reflectionPrompt: '双方表达和行动是否一致，哪些期待还没有坦诚说明？',
    realityCheck: '关系结论应来自双方交流，不能单凭卦象推定对方心意。'
  },
  健康: {
    focus: '身体信号、生活节奏、恢复条件',
    reflectionPrompt: '哪些不适或习惯需要记录，是否已经获得可靠的医疗评估？',
    realityCheck: '出现不适或需要治疗时，应及时咨询合格医疗专业人员。'
  },
  学业: {
    focus: '准备程度、学习方法、持续投入',
    reflectionPrompt: '当前薄弱环节在哪里，下一轮练习怎样获得有效反馈？',
    realityCheck: '结果仍取决于学习计划、练习反馈和实际发挥。'
  },
  出行: {
    focus: '时间、路线、安全预案',
    reflectionPrompt: '证件、交通和备用方案是否齐全，哪些风险需要提前规避？',
    realityCheck: '天气、交通和安全信息应以实时权威来源为准。'
  }
};

const LINE_POSITION_GUIDANCE: Record<number, string> = {
  1: '事情仍在起步阶段，宜先稳住基础并确认方向。',
  2: '事情进入协作阶段，宜借助可信的人和清晰规则推进。',
  3: '事情处在内外转换处，行动前需复核风险，避免急进。',
  4: '事情接近关键选择，宜审时度势，并为进退保留余地。',
  5: '事情来到核心位置，宜承担责任，以中正和长期影响为重。',
  6: '事情发展到阶段高点，宜防止过度，准备收束或转换。'
};

export type CategoryDetection =
  | { status: 'resolved'; category: QuestionCategory; matchedKeywords: string[] }
  | { status: 'needs-selection'; candidates: SelectableQuestionCategory[] };

export type InterpretationSourceKind =
  | 'main-judgment'
  | 'main-line'
  | 'changed-judgment'
  | 'changed-line'
  | 'special-use';

export interface InterpretationSource {
  kind: InterpretationSourceKind;
  hexagram: HexagramKnowledge;
  lineNumber?: number;
  label: string;
  original: string;
  translation?: string;
  primary: boolean;
}

export interface InterpretationSelection {
  rule: string;
  sources: InterpretationSource[];
}

export interface LocalInterpretationInput {
  mainCode: string;
  changedCode: string | null;
  changingLines: number[];
  category: QuestionCategory;
  question?: string;
}

/**
 * 通过显式关键词判断所问事项。
 * 只有唯一最高分时才自动分类；未知或并列结果交给用户选择。
 */
export function detectQuestionCategory(question: string): CategoryDetection {
  const normalizedQuestion = question.trim().toLowerCase();
  if (!normalizedQuestion) {
    return { status: 'resolved', category: '综合', matchedKeywords: [] };
  }

  const matches = Object.entries(CATEGORY_KEYWORDS).map(([category, keywords]) => {
    const matchedKeywords = keywords.filter(keyword => normalizedQuestion.includes(keyword.toLowerCase()));
    return { category: category as QuestionCategory, matchedKeywords };
  });
  const highestScore = Math.max(...matches.map(match => match.matchedKeywords.length));

  if (highestScore === 0) {
    return { status: 'needs-selection', candidates: [...QUESTION_CATEGORIES] };
  }

  const winners = matches.filter(match => match.matchedKeywords.length === highestScore);
  if (winners.length !== 1) {
    return { status: 'needs-selection', candidates: [...QUESTION_CATEGORIES] };
  }

  return {
    status: 'resolved',
    category: winners[0].category,
    matchedKeywords: winners[0].matchedKeywords
  };
}

function judgmentSource(
  kind: 'main-judgment' | 'changed-judgment',
  hexagram: HexagramKnowledge,
  primary: boolean
): InterpretationSource {
  return {
    kind,
    hexagram,
    label: `${hexagram.fullName}卦辞`,
    original: hexagram.guaCi,
    translation: hexagram.guaCiTranslation,
    primary
  };
}

function lineSource(
  kind: 'main-line' | 'changed-line',
  hexagram: HexagramKnowledge,
  lineNumber: number,
  primary: boolean
): InterpretationSource {
  const line = hexagram.yaoTexts[lineNumber - 1];
  if (!line) {
    throw new Error(`${hexagram.fullName}缺少第${lineNumber}爻知识数据`);
  }
  return {
    kind,
    hexagram,
    lineNumber,
    label: `${hexagram.fullName}·${line.position}`,
    original: line.text,
    translation: line.translation,
    primary
  };
}

function validateChangingLines(changingLines: number[]): number[] {
  const normalizedLines = [...new Set(changingLines)].sort((left, right) => left - right);
  const containsInvalidLine = normalizedLines.some(line => !Number.isInteger(line) || line < 1 || line > 6);
  if (containsInvalidLine || normalizedLines.length !== changingLines.length) {
    throw new Error('动爻位置必须是 1 到 6 之间且不重复的整数');
  }
  return normalizedLines;
}

/** 按变爻数量选择本次解读应引用的卦辞或爻辞，并标记主要依据。 */
export function selectInterpretationSources(
  main: HexagramKnowledge,
  changed: HexagramKnowledge | null,
  changingLines: number[]
): InterpretationSelection {
  const lines = validateChangingLines(changingLines);
  const changingCount = lines.length;
  if (changingCount > 0 && !changed) {
    throw new Error('存在动爻时必须提供变卦');
  }

  if (changingCount === 0) {
    return { rule: '无动爻，以本卦卦辞为主要依据。', sources: [judgmentSource('main-judgment', main, true)] };
  }
  if (changingCount === 1) {
    return { rule: '一爻变，以本卦动爻爻辞为主要依据。', sources: [lineSource('main-line', main, lines[0], true)] };
  }
  if (changingCount === 2) {
    const primaryLine = lines[lines.length - 1];
    return {
      rule: '两爻变，参看本卦两条动爻爻辞，以上爻为主。',
      sources: lines.map(line => lineSource('main-line', main, line, line === primaryLine))
    };
  }
  if (changingCount === 3) {
    return {
      rule: '三爻变，参看本卦与变卦卦辞，以本卦为主。',
      sources: [
        judgmentSource('main-judgment', main, true),
        judgmentSource('changed-judgment', changed!, false)
      ]
    };
  }
  if (changingCount === 4 || changingCount === 5) {
    const unchangedLines = [1, 2, 3, 4, 5, 6].filter(line => !lines.includes(line));
    const primaryLine = unchangedLines[0];
    return {
      rule: changingCount === 4
        ? '四爻变，参看变卦两条对应静爻爻辞，以下爻为主。'
        : '五爻变，以变卦唯一对应静爻爻辞为主要依据。',
      sources: unchangedLines.map(line => lineSource('changed-line', changed!, line, line === primaryLine))
    };
  }

  if ((main.number === 1 || main.number === 2) && main.yongText) {
    return {
      rule: main.number === 1 ? '乾卦六爻全变，以用九为主要依据。' : '坤卦六爻全变，以用六为主要依据。',
      sources: [{
        kind: 'special-use',
        hexagram: main,
        label: main.number === 1 ? '乾卦·用九' : '坤卦·用六',
        original: main.yongText,
        translation: main.number === 1 ? '群龙各尽其能而不争为首，吉祥。' : '利于长久守持正道。',
        primary: true
      }]
    };
  }

  return {
    rule: '六爻全变，以变卦卦辞为主要依据。',
    sources: [judgmentSource('changed-judgment', changed!, true)]
  };
}

function formatSources(selection: InterpretationSelection): string {
  return selection.sources.map(source => {
    const marker = source.primary ? '主要依据' : '辅助参考';
    const positionGuidance = source.lineNumber ? `\n\n${LINE_POSITION_GUIDANCE[source.lineNumber]}` : '';
    return `**${marker}｜${source.label}**\n\n> ${source.original}\n\n白话：${source.translation || '本条暂无白话翻译。'}${positionGuidance}`;
  }).join('\n\n');
}

function formatCategoryGuidance(
  category: QuestionCategory,
  question: string | undefined,
  themeWords: string[],
  selection: InterpretationSelection
): string {
  const lens = CATEGORY_LENSES[category];
  const normalizedQuestion = question?.trim().replace(/\s+/g, ' ');
  const questionText = normalizedQuestion || '未填写具体问题，本次按整体处境解读。';
  const primarySource = selection.sources.find(source => source.primary);
  const sourceSummary = primarySource?.translation || primarySource?.original || '本次主要依据';

  return [
    `**原问题：** ${questionText}`,
    '### 事项映射',
    `重点观察：${lens.focus}`,
    `卦象主题：${themeWords.join('、')}`,
    `卦象落点：将“${sourceSummary}”放到上述观察维度中对照，不把它当成确定结果。`,
    `自查问题：${lens.reflectionPrompt}`,
    `现实边界：${lens.realityCheck}`
  ].join('\n\n');
}

/** 根据本卦、变卦、动爻和已确认类别生成完全离线的 Markdown 解读。 */
export function interpretLocally(input: LocalInterpretationInput): string {
  const main = requireHexagram(input.mainCode);
  const changed = input.changedCode ? requireHexagram(input.changedCode) : null;
  const selection = selectInterpretationSources(main, changed, input.changingLines);
  const themeWords = [
    ...main.keywords,
    ...(changed ? changed.keywords : [])
  ].filter((keyword, index, allKeywords) => allKeywords.indexOf(keyword) === index);
  const changedSection = changed
    ? `**变卦：${changed.unicode} ${changed.fullName}（第${changed.number}卦）**\n\n${changed.guaCiTranslation}\n\n变卦关键词：${changed.keywords.join('、')}`
    : '本次没有动爻，卦象以当前格局和本卦卦辞为主。';

  return [
    '# 本地卦象解读',
    `**所问事项：${input.category}**`,
    '## 卦象总览',
    `**本卦：${main.unicode} ${main.fullName}（第${main.number}卦）**`,
    `**卦辞原文：** ${main.guaCi}`,
    `**白话：** ${main.guaCiTranslation}`,
    `**大象：** ${main.daXiang}`,
    `**关键词：** ${main.keywords.join('、')}`,
    '## 动爻取用',
    selection.rule,
    formatSources(selection),
    '## 变卦趋势',
    changedSection,
    `## ${input.category}指引`,
    formatCategoryGuidance(input.category, input.question, themeWords, selection),
    '## 提醒',
    '本地解读依据固定知识库与传统变爻规则生成，仅供传统文化学习与自我反思，不构成医疗、法律、投资或其他专业建议。'
  ].join('\n\n');
}
