# Hexagram Layout And Coin Face Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prevent the main and changed hexagrams from overlapping or pushing labels outside the card, and give the two coin faces distinct four-character inscriptions.

**Architecture:** Keep hexagram width ownership inside `HexagramDisplay` by placing the line label, line body, and changing marker in one bounded CSS grid. Keep coin face text declarative in `Coin.tsx`, with one positioned glyph per side of the square hole so the reverse reads `厚德载物` instead of imitating the front.

**Tech Stack:** React 19, TypeScript 5.8, Tailwind CSS utilities, Vite SSR, Node test runner

---

### Task 1: Bound The Hexagram Comparison Layout

**Files:**
- Create temporarily: `tests/hexagram-layout-coin-face.test.mjs`
- Modify: `components/HexagramDisplay.tsx`
- Modify: `App.tsx`

- [x] **Step 1: Write the failing layout regression test**

Load `HexagramDisplay` through Vite SSR and verify the rendered rows use an internal three-column grid. Read `App.tsx` and verify changed hexagrams use a two-column comparison grid while the hexagram name row can wrap.

- [x] **Step 2: Run the test and verify RED**

Run: `node --test tests/hexagram-layout-coin-face.test.mjs`

Expected: FAIL because line labels still use negative absolute offsets and the comparison container is still an unconstrained flex row.

- [x] **Step 3: Implement the bounded layout**

Use `grid-cols-[2.25rem_minmax(0,1fr)_1rem]` for every line row, remove negative offsets, and keep the component at `min-w-0 max-w-[168px]`. Render the comparison as one or two explicit grid columns and make the name row wrap between whole names.

- [x] **Step 4: Run the temporary test**

Run: `node --test tests/hexagram-layout-coin-face.test.mjs`

Expected: the layout assertions PASS.

### Task 2: Give Both Coin Faces Independent Inscriptions

**Files:**
- Modify temporarily: `tests/hexagram-layout-coin-face.test.mjs`
- Modify: `components/Coin.tsx`
- Modify: `components/CoinTossStage.tsx`

- [x] **Step 1: Add the failing coin-face assertion**

Render a coin through Vite SSR and assert that its glyphs contain `乾元通宝` and `厚德载物`, with no `坤元通宝` text.

- [x] **Step 2: Run the test and verify RED**

Run: `node --test tests/hexagram-layout-coin-face.test.mjs`

Expected: FAIL because the current faces only contain `乾 / 元亨` and `坤 / 利贞`.

- [x] **Step 3: Implement four positioned glyphs per face**

Define top, bottom, right, and left text for each face in `Coin.tsx`. Replace the old top/bottom selectors with stable glyph-position selectors in `CoinTossStage.tsx`.

- [x] **Step 4: Verify and remove the temporary test**

Run the temporary test, TypeScript, production build, and `git diff --check`. After they pass, delete the temporary test and rerun TypeScript, production build, and `git diff --check` from the final file state.
