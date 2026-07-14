# Local Hexagram Interpretation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a complete offline 64-hexagram interpretation path with deterministic question classification while preserving optional AI providers.

**Architecture:** Vendor licensed immutable knowledge data behind a small index, then keep question classification and changing-line selection in a pure local service. `App.tsx` orchestrates either local or AI interpretation and opens a category dialog only when local keyword classification is unresolved.

**Tech Stack:** React 19, TypeScript, Vite, Node test runner through Vite SSR

---

### Task 1: Define Knowledge And Parser Contracts

**Files:**
- Create: `tests/local-interpretation.test.mjs`
- Create: `data/iching/types.ts`
- Create: `services/localInterpretationService.ts`

- [ ] **Step 1: Write failing contract tests**

Create a Vite SSR test that imports the future service and asserts `HEXAGRAMS.length === 64`, the total `yaoTexts` count is `384`, empty questions resolve to `综合`, one-category questions resolve automatically, unknown or conflicting questions require selection, and changing counts 0 through 6 select the documented source kind.

- [ ] **Step 2: Verify the tests fail for the missing modules**

Run: `node --test tests/local-interpretation.test.mjs`

Expected: FAIL because `data/iching/index.ts` and `services/localInterpretationService.ts` do not exist.

- [ ] **Step 3: Add the public contracts**

```ts
export type QuestionCategory = '综合' | '事业' | '财运' | '感情' | '健康' | '学业' | '出行';

export interface HexagramKnowledge {
  number: number;
  name: string;
  fullName: string;
  binary: string;
  guaCi: string;
  guaCiTranslation: string;
  daXiang: string;
  yaoTexts: { position: string; text: string; translation: string }[];
  yongText?: string;
  keywords: string[];
}

export type CategoryDetection =
  | { status: 'resolved'; category: QuestionCategory; matchedKeywords: string[] }
  | { status: 'needs-selection'; candidates: QuestionCategory[] };
```

- [ ] **Step 4: Re-run the targeted test**

Run: `node --test tests/local-interpretation.test.mjs`

Expected: contract import succeeds; behavior assertions remain red until Tasks 2 and 3.

### Task 2: Vendor And Index The Knowledge Base

**Files:**
- Create: `data/iching/hexagrams-part1.ts`
- Create: `data/iching/hexagrams-part2.ts`
- Create: `data/iching/index.ts`
- Create: `data/iching/NOTICE.md`

- [ ] **Step 1: Copy the licensed source data**

Copy `src/data/hexagrams-part1.ts` and `src/data/hexagrams-part2.ts` from the inspected MIT source archive, preserving source wording and adding the upstream copyright notice in `NOTICE.md`.

- [ ] **Step 2: Build immutable indexes**

```ts
export const HEXAGRAMS = [...HEXAGRAMS_PART1, ...HEXAGRAMS_PART2]
  .sort((left, right) => left.number - right.number);

export const HEXAGRAM_BY_BINARY = Object.fromEntries(
  HEXAGRAMS.map(hexagram => [hexagram.binary, hexagram])
) as Record<string, HexagramKnowledge>;
```

- [ ] **Step 3: Verify completeness**

Run: `node --test tests/local-interpretation.test.mjs`

Expected: 64 hexagrams, 384 lines, unique numbers and binary codes all pass.

### Task 3: Implement Deterministic Local Interpretation

**Files:**
- Modify: `services/localInterpretationService.ts`

- [ ] **Step 1: Implement category detection**

Use explicit keyword arrays for six specific categories. Empty input resolves to `综合`; one highest-scoring category resolves; zero matches or tied highest scores return `needs-selection`.

- [ ] **Step 2: Implement changing-line source selection**

Return typed sources for `main-judgment`, `main-line`, `changed-judgment`, `changed-line`, and `special-use`, including a `primary` flag according to the seven documented changing-count rules.

- [ ] **Step 3: Format the local interpretation**

```ts
export function interpretLocally(input: LocalInterpretationInput): string {
  const main = requireHexagram(input.mainCode);
  const changed = input.changedCode ? requireHexagram(input.changedCode) : null;
  const sources = selectInterpretationSources(main, changed, input.changingLines);
  return formatMarkdown({ main, changed, sources, category: input.category });
}
```

- [ ] **Step 4: Verify all parser tests pass**

Run: `node --test tests/local-interpretation.test.mjs`

Expected: all data, category and changing-line tests PASS.

### Task 4: Make Local The Default Provider

**Files:**
- Modify: `hooks/useApiKeys.ts`
- Modify: `App.tsx`
- Create: `components/QuestionCategoryDialog.tsx`
- Modify: `README.md`

- [ ] **Step 1: Add failing provider and rendering tests**

Assert the initial config provider is `local`, the settings SSR contains “本地知识库”, and the local path can be selected without an API key.

- [ ] **Step 2: Extend and validate stored configuration**

```ts
export type InterpretationProvider = 'local' | 'gemini' | 'glm' | 'deepseek';

const DEFAULT_CONFIG: ApiConfig = { provider: 'local', apiKey: '' };
```

Parse saved JSON defensively. Preserve a valid existing AI provider and key; fall back to `DEFAULT_CONFIG` for malformed or unknown values.

- [ ] **Step 3: Add the category dialog**

Render a modal with six category buttons, close behavior, focusable controls, `role="dialog"`, `aria-modal="true"`, and a heading referenced by `aria-labelledby`.

- [ ] **Step 4: Route interpretation in App**

For `local`, classify before starting animation; open the dialog for unresolved classification or call `interpretLocally` after one animation frame. For AI providers, retain API-key validation and the existing request path.

- [ ] **Step 5: Update settings and documentation**

Label the panel “解卦设置”, show `本地知识库（无需 API Key）`, hide the key input for local, and document that local data is bundled with no runtime request.

- [ ] **Step 6: Verify targeted UI tests**

Run: `node --test tests/local-interpretation.test.mjs`

Expected: all tests PASS.

### Task 5: Final Verification And Cleanup

**Files:**
- Delete: `tests/local-interpretation.test.mjs`

- [ ] **Step 1: Run TypeScript and production build checks**

Run: `./node_modules/.bin/tsc --noEmit --types node,vite/client`

Run: `npm run build`

Expected: both commands exit 0.

- [ ] **Step 2: Run local runtime checks**

Verify no local interpretation path calls `fetch` or `@google/genai`, no API key prompt appears for local, unresolved categories open the selector, and a selected category resumes interpretation.

- [ ] **Step 3: Delete temporary tests**

Delete `tests/local-interpretation.test.mjs` and remove the empty `tests` directory, then rerun TypeScript and build checks.

- [ ] **Step 4: Review the final diff**

Run: `git diff --check` and inspect `git diff --stat` plus the complete diff for unrelated changes.
