
import React, { useState, useCallback, useMemo } from 'react';
import { LineResult, CoinSide, DivinationState } from './types';
import { HEXAGRAM_NAMES } from './constants';
import { interpretHexagram } from './services/geminiService';
import { useApiKeys } from './hooks/useApiKeys';
import Coin from './components/Coin';
import HexagramDisplay from './components/HexagramDisplay';
import { Sparkles, RefreshCw, ScrollText, CircleAlert, History, HelpCircle, Settings, X } from 'lucide-react';

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
  const [tempProvider, setTempProvider] = useState<'gemini' | 'glm' | 'deepseek'>('gemini');
  const [tempApiKey, setTempApiKey] = useState<string>('');
  const { config, saveConfig } = useApiKeys();

  // 初始化临时设置
  React.useEffect(() => {
    setTempProvider(config.provider);
    setTempApiKey(config.apiKey);
  }, [config, showApiSettingsModal]);

  const rollTrigram = useCallback(() => {
    if (state.lines.length >= 6 || state.isRolling) return;

    setState(prev => ({ ...prev, isRolling: true, currentResult: null }));
    setCurrentBatchCoins([]);

    // Simulate animation time
    setTimeout(() => {
      const results: CoinSide[] = [
        Math.random() > 0.5 ? 'heads' : 'tails',
        Math.random() > 0.5 ? 'heads' : 'tails',
        Math.random() > 0.5 ? 'heads' : 'tails'
      ];

      setCurrentBatchCoins(results);

      // Convert each coin to a line: Heads = Yang, Tails = Yin
      // To keep "Changing Lines" (动爻) possible in this simplified method, 
      // we randomly assign "Changing" status to keep the AI interpretation interesting (approx 15% chance)
      const newLines: LineResult[] = results.map(side => ({
        coins: [side, side, side], // Mocking the coin group for the type
        sum: side === 'heads' ? 9 : 6, // Just a representation
        type: side === 'heads' ? 'yang' : 'yin',
        isChanging: Math.random() < 0.15 // Rare chance to be an "Old" (changing) line
      }));

      setState(prev => ({
        ...prev,
        isRolling: false,
        lines: [...prev.lines, ...newLines]
      }));
    }, 1200);
  }, [state.lines.length, state.isRolling]);

  const reset = () => {
    setState({
      lines: [],
      isRolling: false,
      currentResult: null,
      interpretation: null,
      isLoadingAI: false
    });
    setCurrentBatchCoins([]);
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

  const handleInterpretation = async () => {
    if (state.lines.length < 6) return;
    if (!config.apiKey) {
      alert('请先在设置中配置 API Key');
      setShowApiSettingsModal(true);
      return;
    }
    setState(prev => ({ ...prev, isLoadingAI: true }));
    
    const linesDesc = state.lines.map((l, i) => {
        const type = l.type === 'yang' ? '阳' : '阴';
        const status = l.isChanging ? '动爻' : '静爻';
        return `第${i+1}爻: ${type}爻 (${status})`;
    });

    const customPrompt = consultationQuestion ? `用户的咨询问题：${consultationQuestion}` : '';
    const result = await interpretHexagram(mainHexName!, changeHexName, linesDesc, config.provider, customPrompt, config.apiKey);
    
    setState(prev => ({ 
      ...prev, 
      interpretation: result || "解读失败", 
      isLoadingAI: false 
    }));

    setHistory(prev => [{ name: mainHexName!, date: new Date().toLocaleString() }, ...prev.slice(0, 9)]);
  };

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
          title="API 设置"
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
          <div className="flex justify-center gap-6 md:gap-10 py-12 bg-stone-50 rounded-xl border-inner border border-stone-200 mb-8 relative overflow-hidden">
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]"></div>
            
            <Coin side={currentBatchCoins[0] || null} isRolling={state.isRolling} />
            <Coin side={currentBatchCoins[1] || null} isRolling={state.isRolling} />
            <Coin side={currentBatchCoins[2] || null} isRolling={state.isRolling} />
          </div>

          <div className="flex flex-col items-center gap-4">
            {state.lines.length < 6 ? (
              <button
                onClick={rollTrigram}
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
                    掷三枚铜钱 ({state.lines.length === 0 ? '定下三爻' : '定上三爻'})
                  </>
                )}
              </button>
            ) : (
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
                    {state.isLoadingAI ? '大师正在推演天机...' : '请求大师解卦'}
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
        <div className="mt-12 bg-[#fffdf5] rounded-3xl p-8 md:p-12 shadow-2xl border-x-8 border-red-900/10">
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

      {/* API Settings Modal */}
      {showApiSettingsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-red-900">API 设置</h2>
              <button 
                onClick={() => setShowApiSettingsModal(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Provider Selection */}
              <div>
                <label className="text-sm font-bold text-stone-700 block mb-2">选择 AI Provider</label>
                <div className="space-y-2">
                  {(['gemini', 'glm', 'deepseek'] as const).map((p) => (
                    <label key={p} className="flex items-center gap-2 cursor-pointer hover:bg-stone-50 p-2 rounded">
                      <input 
                        type="radio" 
                        name="provider" 
                        value={p} 
                        checked={tempProvider === p}
                        onChange={() => setTempProvider(p)}
                        className="cursor-pointer"
                      />
                      <span className="capitalize font-medium text-stone-700">{p}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* API Key Input */}
              <div>
                <label className="text-sm font-bold text-stone-700 block mb-2">API Key</label>
                <input 
                  type="password" 
                  value={tempApiKey} 
                  onChange={(e) => setTempApiKey(e.target.value)}
                  placeholder="输入你的 API Key..."
                  className="w-full p-3 rounded border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-800"
                />
              </div>

              <p className="text-xs text-stone-500 bg-stone-50 p-3 rounded">
                💡 API 密钥保存在浏览器本地存储中。GLM 和 Deepseek 的 API 端点需在 .env 文件中配置。
              </p>

              {/* Save Button */}
              <button 
                onClick={() => {
                  saveConfig({
                    provider: tempProvider,
                    apiKey: tempApiKey
                  });
                  setShowApiSettingsModal(false);
                }}
                className="w-full py-3 px-4 bg-red-900 text-white hover:bg-red-800 rounded-lg transition-all font-bold"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
