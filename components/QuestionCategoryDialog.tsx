import React from 'react';
import {
  Activity,
  BriefcaseBusiness,
  GraduationCap,
  Heart,
  Plane,
  WalletCards,
  X,
  type LucideIcon
} from 'lucide-react';
import type { SelectableQuestionCategory } from '../data/iching/types';

interface QuestionCategoryDialogProps {
  question: string;
  candidates: SelectableQuestionCategory[];
  onSelect: (category: SelectableQuestionCategory) => void;
  onClose: () => void;
}

const CATEGORY_ICONS: Record<SelectableQuestionCategory, LucideIcon> = {
  事业: BriefcaseBusiness,
  财运: WalletCards,
  感情: Heart,
  健康: Activity,
  学业: GraduationCap,
  出行: Plane
};

/** 关键词无法唯一分类时，让用户明确选择本次解卦的观察角度。 */
const QuestionCategoryDialog: React.FC<QuestionCategoryDialogProps> = ({
  question,
  candidates,
  onSelect,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="question-category-title"
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 id="question-category-title" className="text-xl font-bold text-red-900">请选择所问事项</h2>
            <p className="mt-1 text-sm text-stone-500">本地知识库无法唯一判断问题类别</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭类别选择"
            title="关闭"
            className="p-1 text-stone-400 transition-colors hover:text-stone-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {question.trim() && (
          <p className="mb-5 border-l-2 border-amber-600 bg-stone-50 px-3 py-2 text-sm leading-relaxed text-stone-600">
            {question}
          </p>
        )}

        <div className="grid grid-cols-2 gap-3">
          {candidates.map(category => {
            const Icon = CATEGORY_ICONS[category];
            return (
              <button
                key={category}
                type="button"
                onClick={() => onSelect(category)}
                className="flex min-h-12 items-center justify-center gap-2 rounded-lg border border-stone-200 bg-white px-4 py-3 font-bold text-stone-700 transition-colors hover:border-red-800 hover:bg-red-50 hover:text-red-900"
              >
                <Icon className="h-4 w-4" />
                {category}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuestionCategoryDialog;
