# Coin Motion And Shake Trigger Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the approved “coin storm” toss animation and opt-in shake-to-toss support on iPhone Safari and Android Chrome while preserving the button fallback and existing divination rules.

**Architecture:** Keep shake detection and toss generation as pure services, isolate browser permission lifecycle in one React hook, and keep sound/vibration behind a local feedback service. `App.tsx` owns one synchronous toss guard and one `triggerCoinToss()` path; visual components receive state and never access sensors or generate results.

**Tech Stack:** React 19, TypeScript 5.8, CSS 3D animations, DeviceMotionEvent, Web Audio API, Vite SSR tests, Node test runner

---

### Task 1: Pure Shake Detection And Toss Generation

**Files:**
- Create: `tests/coin-motion.test.mjs`
- Create: `services/shakeDetection.ts`
- Create: `services/coinTossService.ts`

- [ ] **Step 1: Write failing pure-service tests**

Create a temporary Vite SSR test. It must import the two future services and assert static tilt does not trigger, two linear peaks do trigger, peaks inside cooldown do not trigger, fallback gravity samples use vector deltas, invalid coordinates are ignored, and a deterministic random function creates exactly three coin sides plus three lines.

```js
const detector = shake.createInitialShakeState();
const first = shake.detectShake(detector, { x: 14, y: 0, z: 0, timestamp: 100, mode: 'linear' });
const second = shake.detectShake(first.state, { x: -14, y: 0, z: 0, timestamp: 240, mode: 'linear' });
assert.equal(first.triggered, false);
assert.equal(second.triggered, true);

const values = [0.9, 0.1, 0.8, 0.01, 0.2, 0.9];
const toss = coinToss.createCoinToss(() => values.shift());
assert.deepEqual(toss.coins, ['heads', 'tails', 'heads']);
assert.equal(toss.lines.length, 3);
```

- [ ] **Step 2: Run the test and verify RED**

Run: `node --test tests/coin-motion.test.mjs`

Expected: FAIL because `services/shakeDetection.ts` and `services/coinTossService.ts` do not exist.

- [ ] **Step 3: Implement the detector as a pure state transition**

Use named constants and immutable return values so the hook only stores the returned state.

```ts
export const LINEAR_THRESHOLD = 13;
export const GRAVITY_DELTA_THRESHOLD = 12;
export const PEAK_WINDOW_MS = 650;
export const MIN_PEAK_INTERVAL_MS = 80;
export const COOLDOWN_MS = 2000;

export interface MotionSample {
  x: number;
  y: number;
  z: number;
  timestamp: number;
  mode: 'linear' | 'including-gravity';
}

export interface ShakeState {
  peakTimestamps: number[];
  cooldownUntil: number;
  previousGravity: { x: number; y: number; z: number } | null;
}

export function createInitialShakeState(): ShakeState;
export function detectShake(
  state: ShakeState,
  sample: MotionSample
): { state: ShakeState; triggered: boolean };
```

Reject non-finite coordinates. For `including-gravity`, compare the current vector with `previousGravity`; the first sample only stores a baseline. Count peaks above the mode threshold, at least `80ms` apart, and retain only peaks inside `650ms`. On the second peak, clear peaks and set `cooldownUntil = timestamp + 2000`.

- [ ] **Step 4: Implement deterministic toss creation**

```ts
export interface CoinTossResult {
  coins: [CoinSide, CoinSide, CoinSide];
  lines: [LineResult, LineResult, LineResult];
}

export function createCoinToss(random: () => number = Math.random): CoinTossResult {
  const coins = [random(), random(), random()].map(value => value > 0.5 ? 'heads' : 'tails') as CoinTossResult['coins'];
  const lines = coins.map(side => ({
    coins: [side, side, side],
    sum: side === 'heads' ? 9 : 6,
    type: side === 'heads' ? 'yang' : 'yin',
    isChanging: random() < 0.15
  })) as CoinTossResult['lines'];
  return { coins, lines };
}
```

- [ ] **Step 5: Run tests and commit only production files**

Run: `node --test tests/coin-motion.test.mjs`

Expected: all Task 1 assertions PASS.

Commit `services/shakeDetection.ts` and `services/coinTossService.ts`; keep `tests/coin-motion.test.mjs` untracked for later deletion.

### Task 2: Device Motion Permission Hook And Feedback Service

**Files:**
- Modify: `tests/coin-motion.test.mjs`
- Create: `hooks/useShakeToToss.ts`
- Create: `services/coinFeedback.ts`

- [ ] **Step 1: Add failing permission and preference tests**

Test `motionEventToSample()` with linear data, fallback gravity data and null coordinates. Test `requestDeviceMotionPermission()` against fake constructors returning `granted`, `denied`, throwing, and having no request method. Test sound preference parsing.

```js
assert.equal(shakeHook.motionEventToSample({ acceleration: { x: 14, y: 0, z: 0 } }, 100).mode, 'linear');
assert.equal(await shakeHook.requestDeviceMotionPermission({ requestPermission: async () => 'granted' }), 'enabled');
assert.equal(await shakeHook.requestDeviceMotionPermission({ requestPermission: async () => 'denied' }), 'denied');
assert.equal(feedback.parseMutedPreference('true'), true);
assert.equal(feedback.parseMutedPreference('broken'), false);
```

- [ ] **Step 2: Run the targeted test and verify RED**

Run: `node --test --test-name-pattern="motion|permission|feedback" tests/coin-motion.test.mjs`

Expected: FAIL because the hook and feedback service do not exist.

- [ ] **Step 3: Implement `useShakeToToss`**

Export these public contracts:

```ts
export type ShakeStatus = 'unsupported' | 'needs-permission' | 'enabled' | 'denied' | 'error';

export interface UseShakeToTossOptions {
  canToss: boolean;
  onShake: () => void;
}

export interface ShakeToTossController {
  status: ShakeStatus;
  enable: () => Promise<void>;
}
```

`enable()` must run the optional iOS request inside the click call stack. The listener effect attaches only for `status === 'enabled'`, `canToss === true`, and visible documents. Reset detector state whenever the listener attaches. Store `onShake` in a ref so callback changes do not duplicate listeners. Clean up `devicemotion` and `visibilitychange` on every exit path.

- [ ] **Step 4: Implement local audio and vibration degradation**

```ts
export const COIN_SOUND_MUTED_KEY = 'tianji_coin_sound_muted';
export const TOSS_DURATION_MS = 1500;

export function parseMutedPreference(saved: string | null): boolean {
  return saved === 'true';
}

export function unlockCoinAudio(): Promise<void>;
export function playCoinLaunchSound(muted: boolean): void;
export function playCoinLandingFeedback(muted: boolean): void;
```

Create or resume `AudioContext` only inside `unlockCoinAudio()`. Use short oscillator/gain envelopes for launch and landing; catch audio errors and keep them non-blocking. Landing calls `navigator.vibrate?.([18, 28, 35])` independently of mute state.

- [ ] **Step 5: Run tests and commit production files**

Run: `node --test tests/coin-motion.test.mjs`

Expected: all Task 1 and Task 2 assertions PASS.

Commit `hooks/useShakeToToss.ts` and `services/coinFeedback.ts`; do not stage the temporary test.

### Task 3: Coin Storm Visual Components

**Files:**
- Modify: `tests/coin-motion.test.mjs`
- Modify: `components/Coin.tsx`
- Create: `components/CoinTossStage.tsx`
- Modify: `index.html`

- [ ] **Step 1: Add a failing SSR component test**

Render `CoinTossStage` with three known sides. Assert a stable `role="status"`, `aria-busy`, three `data-coin-index` elements, six fixed spark elements, the sound button label, and hidden result labels while rolling.

```js
const html = renderToStaticMarkup(React.createElement(CoinTossStage, {
  sides: ['heads', 'tails', 'heads'],
  isRolling: true,
  muted: false,
  onToggleMuted: () => {}
}));
assert.match(html, /aria-busy="true"/);
assert.equal((html.match(/data-coin-index=/g) || []).length, 3);
assert.doesNotMatch(html, /☰ 阳/);
```

- [ ] **Step 2: Run the SSR test and verify RED**

Run: `node --test --test-name-pattern="coin storm stage" tests/coin-motion.test.mjs`

Expected: FAIL because `components/CoinTossStage.tsx` does not exist.

- [ ] **Step 3: Make `Coin` purely visual**

Replace sensor effects and internal timers with props:

```ts
interface CoinProps {
  side: CoinSide | null;
  isRolling: boolean;
  index: number;
}
```

Render an outer flight wrapper and an inner rotating body so translate and rotation animations do not overwrite each other. Use two faces with `backface-visibility: hidden`; expose the result label only when `!isRolling && side`.

- [ ] **Step 4: Add `CoinTossStage` and exact animation phases**

The stage renders three `Coin` components, six fixed decorative spark spans, two trail spans, and a `Volume2`/`VolumeX` icon button. Co-locate CSS in the component, matching existing `CinematicTaiji` style:

```css
.coin-storm-stage { min-height: 250px; position: relative; overflow: hidden; }
.coin-storm-stage[data-rolling="true"] .coin-flight { animation: coin-flight 1500ms cubic-bezier(.2,.75,.25,1) both; }
.coin-storm-stage[data-rolling="true"] .coin-body { animation: coin-spin 1500ms cubic-bezier(.2,.75,.25,1) both; }
@keyframes coin-flight {
  0% { transform: translate3d(0, 8px, 0) scale(1); }
  12% { transform: translate3d(0, 20px, 0) scale(.96); }
  62% { transform: translate3d(var(--coin-x), -128px, 0) scale(1.1); }
  88% { transform: translate3d(calc(var(--coin-x) * .2), 5px, 0) scale(1); }
  100% { transform: translate3d(0, 0, 0) scale(1); }
}
```

Set per-coin delay and horizontal offset via CSS variables. Add reduced-motion rules that disable spin, sparks and trails while retaining a short result fade.
Accept `triggerSource: 'button' | 'shake' | null`; while rolling, expose “已感应摇动，铜钱翻飞中” for shake and “铜钱翻飞中” for button through the component status text.

- [ ] **Step 5: Remove obsolete global coin keyframes**

Delete `coinFlip`, `coinLand`, `.animate-coin-flip`, and `.animate-coin-land` from `index.html`. Leave unrelated global styles unchanged.

- [ ] **Step 6: Run tests and commit visual files**

Run: `node --test tests/coin-motion.test.mjs`

Expected: all assertions PASS and no SSR warnings.

Commit `components/Coin.tsx`, `components/CoinTossStage.tsx`, and `index.html`; keep the test untracked.

### Task 4: Unify Button And Shake Toss Flow In App

**Files:**
- Modify: `tests/coin-motion.test.mjs`
- Modify: `App.tsx`

- [ ] **Step 1: Add source-level flow assertions before editing App**

Read `App.tsx` in the temporary test and assert the future code has one `triggerCoinToss` function, calls it with both `'button'` and `'shake'`, uses `tossInFlightRef`, clears `tossTimerRef`, and no longer contains `rollTrigram` or direct `<Coin>` usage.

- [ ] **Step 2: Run the flow test and verify RED**

Run: `node --test --test-name-pattern="unified toss flow" tests/coin-motion.test.mjs`

Expected: FAIL because `App.tsx` still has `rollTrigram` and three direct `Coin` instances.

- [ ] **Step 3: Add one guarded toss transaction**

Create `tossInFlightRef`, `tossTimerRef`, `canToss`, `tossTriggerSource`, and `isSoundMuted`. Implement:

```ts
const triggerCoinToss = useCallback((source: 'button' | 'shake') => {
  if (tossInFlightRef.current || state.lines.length >= 6) return;
  tossInFlightRef.current = true;
  setTossTriggerSource(source);
  const toss = createCoinToss();
  setCurrentBatchCoins(toss.coins);
  setState(previous => ({ ...previous, isRolling: true, currentResult: null }));
  playCoinLaunchSound(isSoundMuted);

  tossTimerRef.current = window.setTimeout(() => {
    playCoinLandingFeedback(isSoundMuted);
    setState(previous => ({ ...previous, isRolling: false, lines: [...previous.lines, ...toss.lines] }));
    tossInFlightRef.current = false;
    tossTimerRef.current = null;
  }, TOSS_DURATION_MS);
}, [isSoundMuted, state.lines.length]);
```

The button calls `void unlockCoinAudio()` and then `triggerCoinToss('button')` in the same click handler. `reset()` and component cleanup clear the timer, reset the guard and source, and discard pending results.

- [ ] **Step 4: Connect shake permission and controls**

Call `useShakeToToss({ canToss, onShake: () => triggerCoinToss('shake') })`. Render an icon-plus-text enable button while permission is needed/denied, a concise enabled status, and an `aria-live="polite"` status region. In the enable click handler, invoke `enable()` first so iOS calls `requestPermission()` synchronously inside the user gesture, then call `void unlockCoinAudio()` without awaiting it.

- [ ] **Step 5: Replace the old tray with `CoinTossStage`**

Pass `currentBatchCoins`, `state.isRolling`, `tossTriggerSource`, mute state and a mute toggle that writes `COIN_SOUND_MUTED_KEY`. Preserve the existing fixed page layout, question flow, local interpretation and AI provider behavior.

- [ ] **Step 6: Run test, TypeScript and build checks**

Run:

```bash
node --test tests/coin-motion.test.mjs
./node_modules/.bin/tsc --noEmit --types node,vite/client
npm run build
```

Expected: tests PASS, TypeScript exits 0, Vite build exits 0.

- [ ] **Step 7: Commit App integration**

Commit only `App.tsx`; keep the temporary test untracked.

### Task 5: Runtime Review, Documentation And Temporary Test Cleanup

**Files:**
- Modify: `README.md`
- Delete: `tests/coin-motion.test.mjs`

- [ ] **Step 1: Update feature documentation**

Document the opt-in shake control, iOS permission requirement, Android support, secure-context requirement, button fallback, sound mute control and reduced-motion behavior. Do not claim real-device verification until it has actually happened.

- [ ] **Step 2: Run final temporary tests before deletion**

Run: `node --test tests/coin-motion.test.mjs`

Expected: all detector, permission, feedback, SSR and integration assertions PASS.

- [ ] **Step 3: Perform desktop runtime checks**

Start Vite on an available port. Verify button toss, duplicate-click guard, two tosses creating six lines, reset during animation, mute persistence, unsupported sensor fallback, reduced-motion mode and no console errors. Record that real shake sensitivity remains pending unless actual devices are available.

- [ ] **Step 4: Delete temporary tests**

Use `apply_patch` to delete `tests/coin-motion.test.mjs`, then remove the empty `tests` directory.

- [ ] **Step 5: Run final verification without tests**

Run:

```bash
./node_modules/.bin/tsc --noEmit --types node,vite/client
npm run build
git diff --check
git status --short
```

Expected: TypeScript/build/diff checks exit 0 and no test files remain.

- [ ] **Step 6: Commit documentation and request code review**

Commit `README.md`. Run the repository code-review workflow against all commits on `feat/coin-motion-sensor`, address Critical/Important findings, rerun relevant verification, then prepare the branch for the user’s requested integration workflow.
