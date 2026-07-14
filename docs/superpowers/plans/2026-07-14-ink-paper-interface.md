# Ink Paper Interface Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Present the divination tool as a restrained ink-and-paper interface and render mixed quote/bold interpretation lines correctly.

**Architecture:** Add a pure interpretation display component so Markdown-like output is parsed once at the presentation boundary. Recompose the `App.tsx` visual hierarchy with paper bands and ink dividers while preserving all existing state, callbacks and provider behavior; restyle the coin stage without changing its animation state model.

**Tech Stack:** React 19, TypeScript 5.8, Tailwind CSS utilities, Vite SSR, Node test runner

---

### Task 1: Structured Interpretation Display

**Files:**
- Create temporarily: `tests/ink-paper-interface.test.mjs`
- Create: `components/InterpretationContent.tsx`
- Modify: `App.tsx`

- [x] **Step 1: Write failing renderer tests**

Render `InterpretationContent` with `> **主要依据｜乾卦**`, `> 卦辞原文`, `**所问事项：事业**` and `## 卦象总览`. Assert the quote includes a `blockquote` and `strong`, emphasis does not retain `**`, and the heading becomes an `h2`.

- [x] **Step 2: Run the test and verify RED**

Run: `node --test tests/ink-paper-interface.test.mjs`

Expected: FAIL because the component does not exist.

- [x] **Step 3: Implement safe line and inline parsing**

Create `InterpretationContent` with an inline bold splitter that returns text nodes and `<strong>` elements, then use it for normal text, standalone emphasis and quote content. Replace the inline result mapping in `App.tsx` with this component.

- [x] **Step 4: Run the test and verify GREEN**

Run: `node --test tests/ink-paper-interface.test.mjs`

Expected: renderer assertions PASS.

### Task 2: Paper And Ink Visual Hierarchy

**Files:**
- Modify temporarily: `tests/ink-paper-interface.test.mjs`
- Modify: `App.tsx`
- Modify: `components/CoinTossStage.tsx`

- [x] **Step 1: Add failing visual structure assertions**

Read `App.tsx` and assert it contains `ink-paper-shell`, `ink-panel-divider` and `ink-result-scroll`. Read `CoinTossStage.tsx` and assert the stage includes `ink-coin-stage`.

- [x] **Step 2: Run the test and verify RED**

Run: `node --test tests/ink-paper-interface.test.mjs`

Expected: FAIL because those visual structure markers are absent.

- [x] **Step 3: Apply the approved visual system**

Use a warm paper page shell, low-radius bordered panels, a restrained vermilion primary action, and a two-column desktop workspace with an ink divider. Convert the dark coin storm surface to a paper-and-ink stage while preserving all existing animation selectors and controls.

- [x] **Step 4: Verify and remove temporary tests**

Run the temporary tests, TypeScript, production build and `git diff --check`. Delete the test file with `apply_patch`, remove its empty directory, and rerun TypeScript, production build and `git diff --check`.
