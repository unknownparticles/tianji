
import React, { useState, useCallback, useMemo, useRef } from 'react';
import { LineResult, CoinSide, DivinationState } from './types';
import { HEXAGRAM_NAMES } from './constants';
import { detectQuestionCategory, interpretLocally } from './services/localInterpretationService';
import { createCoinToss } from './services/coinTossService';
import {
  COIN_SOUND_MUTED_KEY,
  TOSS_DURATION_MS,
  parseMutedPreference,
  playCoinLandingFeedback,
  playCoinLaunchSound,
  unlockCoinAudio
} from './services/coinFeedback';
import { providerRequiresApiKey, useApiKeys, type InterpretationProvider } from './hooks/useApiKeys';
import { useShakeToToss, type ShakeStatus } from './hooks/useShakeToToss';
import type { QuestionCategory, SelectableQuestionCategory } from './data/iching/types';
import CoinTossStage, { type TossTriggerSource } from './components/CoinTossStage';
import HexagramDisplay from './components/HexagramDisplay';
import CinematicTaiji from './components/CinematicTaiji';
import InterpretationSettingsModal from './components/InterpretationSettingsModal';
import QuestionCategoryDialog from './components/QuestionCategoryDialog';
import { Sparkles, RefreshCw, ScrollText, CircleAlert, History, HelpCircle, Settings, Coins, Vibrate } from 'lucide-react';

const SHAKE_STATUS_TEXT: Record<ShakeStatus, string> = {
  unsupported: '当前设备或浏览器不支持摇一摇',
  'needs-permission': '摇一摇尚未启用',
  requesting: '正在请求传感器权限',
  enabled: '摇一摇已启用',
  denied: '传感器权限已拒绝',
  error: '摇一摇启用失败'
};

function getInitialSoundMuted(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return parseMutedPreference(window.localStorage.getItem(COIN_SOUND_MUTED_KEY));
  } catch {
    return false;
  }
}

const App: React.FC = () => {
  const [state, setState] = useState<DivinationState>({
    lines: [],
    isRolling: false,
    currentResult: null,
    interpretation: null,
    isLoadingAI: false
  });

  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<{name: string, date: string}[]>([]);
  const [currentBatchCoins, setCurrentBatchCoins] = useState<CoinSide[]>([]);
  const [consultationQuestion, setConsultationQuestion] = useState<string>('');
  const [showApiSettingsModal, setShowApiSettingsModal] = useState(false);
  const [tempProvider, setTempProvider] = useState<InterpretationProvider>('local');
  const [tempApiKey, setTempApiKey] = useState<string>('');
  const [pendingCategories, setPendingCategories] = useState<SelectableQuestionCategory[] | null>(null);
  const [showCinematic, setShowCinematic] = useState(false);
  const [tossTriggerSource, setTossTriggerSource] = useState<TossTriggerSource | null>(null);
  const [isSoundMuted, setIsSoundMuted] = useState(getInitialSoundMuted);
  const tossInFlightRef = useRef(false);
  const tossTimerRef = useRef<number | null>(null);
  const interpretationRequestIdRef = useRef(0);
  const interpretationInFlightRef = useRef(false);
  const { config, saveConfig } = useApiKeys();

  // 初始化临时设置
  React.useEffect(() => {
    setTempProvider(config.provider);
    setTempApiKey(config.apiKey);
  }, [config, showApiSettingsModal]);

  const cancelActiveToss = useCallback((clearSource = true) => {
    if (tossTimerRef.current !== null) {
      window.clearTimeout(tossTimerRef.current);
      tossTimerRef.current = null;
    }
    tossInFlightRef.current = false;
    if (clearSource) setTossTriggerSource(null);
  }, []);

  /** 按钮和传感器共用的唯一抛币事务，ref 保证同一时刻只能启动一次。 */
  const triggerCoinToss = useCallback((source: TossTriggerSource) => {
    if (tossInFlightRef.current || state.isRolling || state.lines.length >= 6) return;

    tossInFlightRef.current = true;
    setTossTriggerSource(source);
    const toss = createCoinToss();
    setCurrentBatchCoins(toss.coins);
    setState(previous => ({ ...previous, isRolling: true, currentResult: null }));
    playCoinLaunchSound(isSoundMuted);

    tossTimerRef.current = window.setTimeout(() => {
      playCoinLandingFeedback(isSoundMuted);
      setState(previous => ({
        ...previous,
        isRolling: false,
        lines: [...previous.lines, ...toss.lines]
      }));
      tossInFlightRef.current = false;
      tossTimerRef.current = null;
      setTossTriggerSource(null);
    }, TOSS_DURATION_MS);
  }, [isSoundMuted, state.isRolling, state.lines.length]);

  const canToss = state.lines.length < 6 && !state.isRolling;
  const { status: shakeStatus, enable: enableShake } = useShakeToToss({
    canToss,
    onShake: () => triggerCoinToss('shake')
  });

  const handleButtonToss = () => {
    void unlockCoinAudio();
    triggerCoinToss('button');
  };

  const handleEnableShake = () => {
    // iOS 权限申请必须先在当前点击调用栈内开始。
    void enableShake();
    void unlockCoinAudio();
  };

  const toggleCoinSound = () => {
    setIsSoundMuted(previous => {
      const next = !previous;
      try {
        window.localStorage.setItem(COIN_SOUND_MUTED_KEY, String(next));
      } catch {
        // 隐私模式可能禁用存储，当前页面内的静音状态仍然有效。
      }
      return next;
    });
  };

  React.useEffect(() => () => cancelActiveToss(false), [cancelActiveToss]);

  /** 页面进入后台时丢弃尚未落定的结果，避免计时器恢复后写入过期卦象。 */
  const abortActiveToss = useCallback(() => {
    if (!tossInFlightRef.current) return;

    cancelActiveToss();
    setCurrentBatchCoins([]);
    setState(previous => previous.isRolling
      ? { ...previous, isRolling: false, currentResult: null }
      : previous
    );
  }, [cancelActiveToss]);

  React.useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') abortActiveToss();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [abortActiveToss]);

  const reset = () => {
    cancelActiveToss();
    setState({
      lines: [],
      isRolling: false,
      currentResult: null,
      interpretation: null,
      isLoadingAI: false
    });
    setCurrentBatchCoins([]);
    // 让尚未结束的请求失效，避免重置后旧结果重新写回页面。
    interpretationRequestIdRef.current += 1;
    interpretationInFlightRef.current = false;
    setShowCinematic(false);
    setPendingCategories(null);
    setConsultationQuestion('');
  };

  const getHexCode = (lines: LineResult[], changing = false) => {
    return lines.map(l => {
        if (!changing) return l.type === 'yang' ? '1' : '0';
        if (l.isChanging) return l.type === 'yang' ? '0' : '1';
        return l.type === 'yang' ? '1' : '0';
    }).join('');
  };

  const mainHexName = useMemo(() => {
    if (state.lines.length < 6) return null;
    return HEXAGRAM_NAMES[getHexCode(state.lines)] || "未知卦";
  }, [state.lines]);

  const changeHexName = useMemo(() => {
    if (state.lines.length < 6) return null;
    const hasChange = state.lines.some(l => l.isChanging);
    if (!hasChange) return null;
    return HEXAGRAM_NAMES[getHexCode(state.lines, true)] || "未知卦";
  }, [state.lines]);

  const beginInterpretation = () => {
    const requestId = ++interpretationRequestIdRef.current;
    interpretationInFlightRef.current = true;
    setState(prev => ({ ...prev, isLoadingAI: true }));
    // 动画只覆盖真实的解析过程，请求与动画同时开始。
    setShowCinematic(true);
    return requestId;
  };

  const saveInterpretation = (requestId: number, result: string) => {
    if (requestId !== interpretationRequestIdRef.current) return;

    setState(prev => ({
      ...prev,
      interpretation: result || "解读失败",
      isLoadingAI: false
    }));
    setHistory(prev => [{ name: mainHexName!, date: new Date().toLocaleString() }, ...prev.slice(0, 9)]);
  };

  const saveInterpretationError = (requestId: number, error: unknown) => {
    if (requestId !== interpretationRequestIdRef.current) return;

    console.error('Interpretation Error:', error);
    setState(prev => ({
      ...prev,
      interpretation: "天机暂时不可泄露（解析出错），请静心稍后再试。",
      isLoadingAI: false
    }));
  };

  const finishInterpretation = (requestId: number) => {
    if (requestId === interpretationRequestIdRef.current) {
      interpretationInFlightRef.current = false;
    }
  };

  /** 使用打包在应用内的知识库完成解析，不读取 API Key，也不发起网络请求。 */
  const runLocalInterpretation = async (category: QuestionCategory) => {
    if (state.lines.length < 6 || interpretationInFlightRef.current) return;

    const requestId = beginInterpretation();
    try {
      // 先让浏览器绘制解析状态，再执行同步的本地知识查询。
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
      if (requestId !== interpretationRequestIdRef.current) return;

      const result = interpretLocally({
        mainCode: getHexCode(state.lines),
        changedCode: changeHexName ? getHexCode(state.lines, true) : null,
        changingLines: state.lines.flatMap((line, index) => line.isChanging ? [index + 1] : []),
        category,
        question: consultationQuestion
      });
      saveInterpretation(requestId, result);
    } catch (error) {
      saveInterpretationError(requestId, error);
    } finally {
      finishInterpretation(requestId);
    }
  };

  const handleInterpretation = async () => {
    if (state.lines.length < 6 || interpretationInFlightRef.current) return;

    if (config.provider === 'local') {
      const categoryDetection = detectQuestionCategory(consultationQuestion);
      if (categoryDetection.status === 'needs-selection') {
        setPendingCategories(categoryDetection.candidates);
        return;
      }
      await runLocalInterpretation(categoryDetection.category);
      return;
    }

    if (providerRequiresApiKey(config.provider) && !config.apiKey) {
      alert('请先在设置中配置 API Key');
      setShowApiSettingsModal(true);
      return;
    }

    const requestId = beginInterpretation();

    const linesDesc = state.lines.map((l, i) => {
        const type = l.type == 'yang' ? '阳' : '阴';
        const status = l.isChanging ? '动爻' : '静爻';
        return `第${i+1}爻: ${type}爻 (${status})`;
    });

    const customPrompt = consultationQuestion ? `用户的咨询问题：${consultationQuestion}` : '';
    try {
      // 只有远程模式才加载 AI SDK，本地模式不会下载或执行相关代码。
      const { interpretHexagram } = await import('./services/geminiService');
      const result = await interpretHexagram(mainHexName!, changeHexName, linesDesc, config.provider, customPrompt, config.apiKey);
      saveInterpretation(requestId, result || "解读失败");
    } catch (error) {
      saveInterpretationError(requestId, error);
    } finally {
      finishInterpretation(requestId);
    }
  };

  const handleCinematicComplete = useCallback(() => {
    setShowCinematic(false);
    requestAnimationFrame(() => {
      document.getElementById('interpretation-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, []);
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <header className="text-center mb-10 relative">
        <button 
          onClick={() => {
            setTempProvider(config.provider);
            setTempApiKey(config.apiKey);
            setShowApiSettingsModal(true);
          }}
          className="absolute right-0 top-0 p-2 text-stone-500 hover:text-red-800 transition-colors"
          title="解卦设置"
        >
          <Settings className="w-5 h-5" />
        </button>
        <h1 className="text-4xl md:text-5xl font-bold text-red-900 mb-2 flex items-center justify-center gap-3">
            <ScrollText className="w-10 h-10" />
            天机卦
        </h1>
        <p className="text-stone-600 italic">"太极生两仪，两仪生四象，四象生八卦"</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Throw Area */}
        <div className="lg:col-span-7 bg-white/90 backdrop-blur rounded-2xl p-6 shadow-xl border border-stone-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                <RefreshCw className={`w-5 h-5 ${state.isRolling ? 'animate-spin' : ''}`} />
                {state.lines.length === 0 ? '第一掷：定下卦' : state.lines.length === 3 ? '第二掷：定上卦' : '卦象已成'}
            </h2>
            <div className="flex gap-2">
                <button 
                  onClick={() => setShowHistory(!showHistory)}
                  className="p-2 text-stone-500 hover:text-red-800 transition-colors"
                  title="历史记录"
                >
                    <History className="w-5 h-5" />
                </button>
                <button 
                  onClick={reset}
                  className="p-2 text-stone-500 hover:text-red-800 transition-colors"
                  title="重新起卦"
                >
                    <RefreshCw className="w-5 h-5" />
                </button>
            </div>
          </div>

          {showHistory && (
              <div className="mb-6 p-4 bg-stone-50 rounded-lg border border-stone-100 text-sm">
                  <h3 className="font-bold mb-2">最近占卜:</h3>
                  {history.length === 0 ? <p className="text-stone-400">暂无记录</p> : (
                      <ul className="space-y-1">
                          {history.map((h, i) => (
                              <li key={i} className="flex justify-between">
                                  <span>{h.name}</span>
                                  <span className="text-stone-400">{h.date}</span>
                              </li>
                          ))}
                      </ul>
                  )}
              </div>
          )}

          {/* Coins Display */}
          <div className="mb-8">
            <CoinTossStage
              sides={currentBatchCoins}
              isRolling={state.isRolling}
              muted={isSoundMuted}
              triggerSource={tossTriggerSource}
              onToggleMuted={toggleCoinSound}
            />
          </div>

          <div className="flex flex-col items-center gap-4">
            {/* 掷硬币按钮 */}
            {state.lines.length < 6 && (
              <button
                onClick={handleButtonToss}
                disabled={state.isRolling}
                className="w-full md:w-72 py-4 px-8 bg-red-900 hover:bg-red-800 disabled:bg-stone-400 text-white rounded-full font-bold text-lg shadow-lg transform active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {state.isRolling ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    铜钱翻飞中...
                  </>
                ) : (
                  <>
                    <Coins className="w-5 h-5" />
                    {state.lines.length === 0 ? '掷三枚铜钱（定下卦）' : '再掷三枚铜钱（定上卦）'}
                  </>
                )}
              </button>
            )}

            {state.lines.length < 6 && (
              <div className="flex min-h-9 items-center justify-center" aria-live="polite">
                {shakeStatus === 'enabled' ? (
                  <p className="flex items-center gap-2 text-sm font-bold text-emerald-700">
                    <Vibrate className="h-4 w-4" />
                    {SHAKE_STATUS_TEXT[shakeStatus]}
                  </p>
                ) : shakeStatus === 'unsupported' ? (
                  <p className="text-center text-xs text-stone-400">{SHAKE_STATUS_TEXT[shakeStatus]}</p>
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <button
                      type="button"
                      onClick={handleEnableShake}
                      disabled={shakeStatus === 'requesting'}
                      className="flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-bold text-stone-700 transition-colors hover:border-red-800 hover:text-red-900 disabled:cursor-wait disabled:opacity-60"
                    >
                      <Vibrate className="h-4 w-4" />
                      {shakeStatus === 'needs-permission'
                        ? '启用摇一摇'
                        : shakeStatus === 'requesting'
                          ? '正在请求权限'
                          : '重新启用摇一摇'}
                    </button>
                    {shakeStatus !== 'needs-permission' && (
                      <p className="text-xs text-red-700">{SHAKE_STATUS_TEXT[shakeStatus]}</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 卦象完成 - 显示解读 */}
            {state.lines.length === 6 && (
              <div className="w-full space-y-4">
                <div className="p-5 bg-red-50 border border-red-200 rounded-xl text-center shadow-inner">
                    <p className="text-red-900 font-bold text-2xl mb-1">
                        {mainHexName}
                        {changeHexName && <span className="text-stone-400 font-normal mx-2">之</span>}
                        {changeHexName && <span className="">{changeHexName}</span>}
                    </p>
                    <p className="text-xs text-stone-500 uppercase tracking-widest">
                        {state.lines.some(l => l.isChanging) ? '内含动爻 • 变卦已现' : '六爻安静 • 本卦主事'}
                    </p>
                </div>

                {/* Consultation Question Input */}
                <div className="p-4 bg-stone-50 rounded-lg border border-stone-200">
                  <label className="text-sm font-bold text-stone-700 block mb-2">咨询问题（可选）</label>
                  <textarea
                    value={consultationQuestion}
                    onChange={(e) => setConsultationQuestion(e.target.value)}
                    placeholder="例如：最近工作会不会有机遇？请输入你想咨询的问题..."
                    className="w-full p-3 rounded border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-800"
                    rows={3}
                  />
                </div>

                {!state.interpretation && (
                  <button
                    onClick={handleInterpretation}
                    disabled={state.isLoadingAI}
                    className="w-full py-4 px-8 bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 disabled:bg-stone-400 text-white rounded-full font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all"
                  >
                    {state.isLoadingAI ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                    {state.isLoadingAI
                      ? '正在推演卦象...'
                      : config.provider === 'local' ? '使用本地知识库解卦' : '请求 AI 解卦'}
                  </button>
                )}
              </div>
            )}

            <p className="text-xs text-stone-400 flex items-center gap-1 mt-2">
                <HelpCircle className="w-3 h-3" />
                注：一次掷三枚，每枚对应一爻。正面为阳，反面为阴。掷两次成全卦。
            </p>
          </div>
        </div>

        {/* Right: Hexagram Sidebar */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-xl border border-stone-200">
            <h3 className="text-center font-bold text-stone-700 mb-6 border-b pb-2 flex items-center justify-center gap-2">
                卦象集成
            </h3>
            <div className="flex justify-around items-start min-h-[220px]">
              <HexagramDisplay lines={state.lines} title="本卦" />
              {changeHexName && <HexagramDisplay lines={state.lines} title="变卦" isChangingMode />}
            </div>
            {state.lines.length === 0 && (
                <div className="text-center py-10 text-stone-300">
                    <div className="mb-2 text-3xl opacity-20">☯</div>
                    <div className="text-[12px] tracking-widest">心诚则灵 • 静候卦起</div>
                </div>
            )}
          </div>

          <div className="bg-stone-800 text-stone-300 rounded-2xl p-6 shadow-xl border-t-4 border-amber-600">
            <h4 className="flex items-center gap-2 text-amber-500 font-bold mb-4">
                <CircleAlert className="w-4 h-4" />
                起卦指南
            </h4>
            <ul className="text-sm space-y-3 opacity-90 leading-relaxed">
                <li className="flex gap-2">
                    <span className="text-amber-500 font-bold">1.</span>
                    <span>默念：静心思考您想问的事项（事业、感情、运势等）。</span>
                </li>
                <li className="flex gap-2">
                    <span className="text-amber-500 font-bold">2.</span>
                    <span>初掷：第一掷定出底部的三根爻（下卦/内卦）。</span>
                </li>
                <li className="flex gap-2">
                    <span className="text-amber-500 font-bold">3.</span>
                    <span>再掷：第二掷定出顶部的三根爻（上卦/外卦）。</span>
                </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Result Section */}
      {state.interpretation && (
        <div id="interpretation-result" className="mt-12 bg-[#fffdf5] rounded-3xl p-8 md:p-12 shadow-2xl border-x-8 border-red-900/10 scroll-mt-6">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-10 border-b border-stone-200 pb-4">
                <div>
                    <h2 className="text-3xl font-bold text-red-900">天机解读</h2>
                    <p className="text-stone-400 text-xs mt-1 italic">卦由心生，境随心转</p>
                </div>
                <button onClick={() => window.print()} className="flex items-center gap-1 text-sm text-stone-400 hover:text-red-800 transition-colors">
                    保存卦辞
                </button>
            </div>
            <div className="prose prose-stone lg:prose-lg max-w-none prose-headings:text-red-900 prose-strong:text-amber-800 prose-p:leading-loose">
              {state.interpretation.split('\n').map((line, i) => {
                  if (line.trim() === '') return <br key={i} />;
                  if (line.startsWith('#')) {
                      return <h3 key={i} className="text-2xl font-bold mt-8 mb-4 text-red-800 border-l-4 border-red-800 pl-4">{line.replace(/#/g, '').trim()}</h3>;
                  }
                  if (line.startsWith('**')) {
                      return <p key={i} className="my-3 font-bold text-amber-900 bg-amber-50 p-2 rounded">{line.replace(/\*\*/g, '')}</p>;
                  }
                  if (line.startsWith('> ')) {
                      return <blockquote key={i} className="my-4 border-l-4 border-amber-600 bg-stone-50 px-4 py-3 text-stone-700">{line.slice(2)}</blockquote>;
                  }
                  return <p key={i} className="my-3 text-stone-700">{line}</p>;
              })}
            </div>
            <div className="mt-16 pt-8 border-t border-stone-200 flex flex-col items-center">
                <div className="w-16 h-[2px] bg-stone-300 mb-8"></div>
                <p className="text-stone-500 italic mb-6 text-center max-w-md">"物极必反，否极泰来。卦象仅供参考，命运掌握在自己手中。"</p>
                <button 
                  onClick={reset}
                  className="px-10 py-3 bg-red-900 text-white hover:bg-red-800 rounded-full transition-all shadow-lg font-bold"
                >
                    再求一卦
                </button>
            </div>
          </div>
        </div>
      )}

      {/* 解卦方式设置 */}
      {showApiSettingsModal && (
        <InterpretationSettingsModal
          provider={tempProvider}
          apiKey={tempApiKey}
          onProviderChange={setTempProvider}
          onApiKeyChange={setTempApiKey}
          onClose={() => setShowApiSettingsModal(false)}
          onSave={() => {
            saveConfig({ provider: tempProvider, apiKey: tempApiKey });
            setShowApiSettingsModal(false);
          }}
        />
      )}

      {pendingCategories && (
        <QuestionCategoryDialog
          question={consultationQuestion}
          candidates={pendingCategories}
          onClose={() => setPendingCategories(null)}
          onSelect={category => {
            setPendingCategories(null);
            void runLocalInterpretation(category);
          }}
        />
      )}

      {/* 解卦请求期间显示推演动画，请求完成后由组件平滑退出。 */}
      {showCinematic && (
        <CinematicTaiji isComplete={!state.isLoadingAI} onComplete={handleCinematicComplete} />
      )}
    </div>
  );
};

export default App;
