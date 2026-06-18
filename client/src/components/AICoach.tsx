import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Key, Cpu, HelpCircle, Sliders, Settings, Check, Leaf } from 'lucide-react';
import { TwinData } from '../types';

function parseMarkdown(text: string): React.ReactNode[] {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let currentTable: string[][] = [];
  let inTable = false;
  
  let currentList: { type: 'ul' | 'ol'; items: string[] } | null = null;
  let keyCounter = 0;

  const renderTextWithFormatting = (str: string) => {
    const parts = str.split(/\*\*([^*]+)\*\*/g);
    return parts.map((part, idx) => {
      if (idx % 2 === 1) {
        return <strong key={idx} className="font-extrabold text-white">{part}</strong>;
      }
      return part;
    });
  };

  const flushTable = () => {
    if (currentTable.length > 0) {
      const headers = currentTable[0];
      const rows = currentTable.slice(1).filter(row => {
        return !row.every(cell => cell.trim().match(/^-+$/));
      });

      elements.push(
        <div key={`table-${keyCounter++}`} className="overflow-x-auto my-4 border border-white/10 rounded-xl bg-black/40">
          <table className="min-w-full divide-y divide-white/10 text-xs">
            <thead className="bg-white/5 text-gray-300 uppercase tracking-wider font-bold">
              <tr>
                {headers.map((h, i) => (
                  <th key={i} className="px-4 py-3 text-left border-r border-white/5 last:border-0">
                    {h.trim()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-300">
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-white/5 transition-colors">
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="px-4 py-2.5 border-r border-white/5 last:border-0">
                      {renderTextWithFormatting(cell.trim())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      currentTable = [];
      inTable = false;
    }
  };

  const flushList = () => {
    if (currentList) {
      const ListTag = currentList.type;
      const listClass = currentList.type === 'ul' ? 'list-disc pl-5 my-3 text-gray-300 space-y-1.5' : 'list-decimal pl-5 my-3 text-gray-300 space-y-1.5';
      elements.push(
        <ListTag key={`list-${keyCounter++}`} className={listClass}>
          {currentList.items.map((item, idx) => (
            <li key={idx}>{renderTextWithFormatting(item)}</li>
          ))}
        </ListTag>
      );
      currentList = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Check table
    if (line.startsWith('|') && line.endsWith('|')) {
      if (currentList) flushList();
      inTable = true;
      const cells = line.split('|').slice(1, -1);
      currentTable.push(cells);
    } else {
      if (inTable) flushTable();

      if (line === '') {
        if (currentList) flushList();
        continue;
      }

      // Check lists
      if (line.startsWith('* ') || line.startsWith('- ')) {
        const itemContent = line.substring(2);
        if (currentList && currentList.type === 'ul') {
          currentList.items.push(itemContent);
        } else {
          if (currentList) flushList();
          currentList = { type: 'ul', items: [itemContent] };
        }
      } else if (line.match(/^\d+\.\s/)) {
        const index = line.indexOf(' ');
        const itemContent = line.substring(index + 1);
        if (currentList && currentList.type === 'ol') {
          currentList.items.push(itemContent);
        } else {
          if (currentList) flushList();
          currentList = { type: 'ol', items: [itemContent] };
        }
      } else {
        if (currentList) flushList();
        
        // Plain paragraph
        elements.push(
          <p key={`p-${keyCounter++}`} className="my-2 leading-relaxed text-gray-300 text-sm">
            {renderTextWithFormatting(line)}
          </p>
        );
      }
    }
  }

  if (inTable) flushTable();
  if (currentList) flushList();

  return elements;
}

interface AICoachProps {
  token: string;
  twinData: TwinData;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AICoach({ token, twinData }: AICoachProps) {
  const [activeTab, setActiveTab] = useState<'chat' | 'insights'>('chat');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hello! I am your CarbonIQ Climate Coach. Based on your Digital Twin, your carbon footprint is estimated at ${twinData.footprint?.total || 450} kg CO₂/month. Ask me any sustainability questions, or request a customized reduction blueprint!`
    }
  ]);
  
  const [inputMsg, setInputMsg] = useState('');
  const [sending, setSending] = useState(false);
  
  // Settings States
  const [showSettings, setShowSettings] = useState(false);
  const [openRouterKey, setOpenRouterKey] = useState(() => localStorage.getItem('carboniq_or_key') || '');
  const [selectedModel, setSelectedModel] = useState(() => localStorage.getItem('carboniq_model') || 'openrouter/free');
  const [mockMode, setMockMode] = useState(() => {
    const cached = localStorage.getItem('carboniq_mock_mode');
    return cached === null ? false : cached === 'true'; // Default mock to false now that we have an active server API key!
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const saveSettings = () => {
    localStorage.setItem('carboniq_or_key', openRouterKey);
    localStorage.setItem('carboniq_model', selectedModel);
    localStorage.setItem('carboniq_mock_mode', String(mockMode));
    setShowSettings(false);
  };

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputMsg;
    if (!text.trim() || sending) return;

    if (!textToSend) setInputMsg('');
    
    const newMessages = [...messages, { role: 'user' as const, content: text }];
    setMessages(newMessages);
    setSending(true);

    try {
      const res = await fetch('/api/coach/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: text,
          history: newMessages,
          openRouterKey: mockMode ? '' : openRouterKey,
          model: selectedModel,
          mockMode
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Coach error');

      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Unknown error';
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `⚠️ Error connecting to AI Climate Coach: ${errMsg}. Please check your connection or switch to Mock Mode in coach settings.` 
      }]);
    } finally {
      setSending(false);
    }
  };

  // Structured recommendations for the Explainability Panel (Feature 8)
  const recommendationsList = [
    {
      category: 'Transportation',
      title: 'Switch to public transport 2x weekly',
      why: 'Transportation accounts for approximately 43% of average user emissions. Light rail or electric buses have a 75% lower footprint than single-passenger gasoline vehicles.',
      savings: '23.3 kg CO₂ / Month',
      yearlyImpact: '280 kg CO₂',
      difficulty: 'Easy',
      difficultyColor: 'text-primary bg-primary/10 border-primary/20'
    },
    {
      category: 'Diet & Food',
      title: 'Adopt meat-free weekdays',
      why: 'Food represents 36% of personal emissions. Meat (especially beef) demands 10x more land and fresh water, generating high carbon outputs during agricultural logistics.',
      savings: '42.0 kg CO₂ / Month',
      yearlyImpact: '504 kg CO₂',
      difficulty: 'Medium',
      difficultyColor: 'text-secondary bg-secondary/10 border-secondary/20'
    },
    {
      category: 'Energy & Power',
      title: 'Install rooftop Solar Panels',
      why: 'Grid power utilities average 380g CO₂ per kWh due to fossil plants. Rooftop solar offsets grid load with direct, clean photovoltaic generation.',
      savings: '95.0 kg CO₂ / Month',
      yearlyImpact: '1,140 kg CO₂',
      difficulty: 'Hard',
      difficultyColor: 'text-accent bg-accent/10 border-accent/20'
    },
    {
      category: 'Waste',
      title: 'Compost and reduce food waste',
      why: 'Organic food waste decomposing in landfills creates methane, which holds a global warming potential 28 times higher than standard carbon dioxide.',
      savings: '6.7 kg CO₂ / Month',
      yearlyImpact: '80 kg CO₂',
      difficulty: 'Easy',
      difficultyColor: 'text-primary bg-primary/10 border-primary/20'
    }
  ];

  const quickPrompts = [
    { text: 'I commute 20 km daily by car.', label: 'Commuting' },
    { text: 'How do I reduce diet carbon?', label: 'Diet Math' },
    { text: 'What is the impact of solar panels?', label: 'Solar Power' }
  ];

  return (
    <div className="grid lg:grid-cols-3 gap-8 select-none">
      {/* Main chat column */}
      <div className="lg:col-span-2 glass-panel rounded-3xl flex flex-col h-[650px] relative overflow-hidden border border-white/5">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

        {/* Coach Header */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between z-10 bg-black/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Sparkles className="text-primary" size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold font-display text-white">AI Climate Coach</h2>
              <span className="text-[10px] font-semibold text-gray-400">
                {mockMode ? 'Mock Reasoner Active' : `Model: ${selectedModel}`}
              </span>
            </div>
          </div>

          <div role="tablist" aria-label="Coach tabs" className="flex items-center gap-2">
            <button
              role="tab"
              aria-selected={activeTab === 'chat'}
              onClick={() => setActiveTab('chat')}
              className={`cursor-pointer px-3.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                activeTab === 'chat'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-white/5 bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              Chat Assistant
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'insights'}
              onClick={() => setActiveTab('insights')}
              className={`cursor-pointer px-3.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                activeTab === 'insights'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-white/5 bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              Recommendations Board
            </button>

            <button
              onClick={() => setShowSettings(!showSettings)}
              aria-label="API Settings"
              className="cursor-pointer p-2 rounded-lg border border-white/5 bg-white/5 text-gray-400 hover:text-white transition-all"
            >
              <Settings size={16} />
            </button>
          </div>
        </div>

        {/* Content Router */}
        <div className="flex-1 overflow-hidden relative">
          {/* Settings modal drawer */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute inset-0 bg-background/95 z-20 p-6 flex flex-col justify-between border-b border-white/5"
              >
                <div className="space-y-6">
                  <h3 className="text-lg font-bold font-display flex items-center gap-2 text-white">
                    <Sliders size={18} className="text-primary" />
                    <span>Coach API Configurations</span>
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3.5 rounded-xl border border-white/5 bg-white/5">
                      <div>
                        <label htmlFor="mock-mode-chk" className="text-sm font-semibold text-white cursor-pointer">Local Mock Mode</label>
                        <div className="text-xs text-gray-500 mt-1">Runs immediate simulated climate replies. No keys needed.</div>
                      </div>
                      <input
                        id="mock-mode-chk"
                        type="checkbox"
                        checked={mockMode}
                        onChange={(e) => setMockMode(e.target.checked)}
                        className="w-5 h-5 rounded border-white/10 accent-primary cursor-pointer"
                      />
                    </div>

                    {!mockMode && (
                      <>
                        <div>
                          <label htmlFor="or-key-input" className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">OpenRouter API Key</label>
                          <div className="relative">
                            <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                            <input
                              id="or-key-input"
                              type="password"
                              placeholder="sk-or-v1-..."
                              value={openRouterKey}
                              onChange={(e) => setOpenRouterKey(e.target.value)}
                              className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-primary transition-all text-xs"
                            />
                          </div>
                        </div>

                        <div>
                          <label htmlFor="model-select" className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Primary AI Model</label>
                          <div className="relative">
                            <Cpu className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                            <select
                              id="model-select"
                              value={selectedModel}
                              onChange={(e) => setSelectedModel(e.target.value)}
                              className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-primary transition-all text-xs appearance-none cursor-pointer"
                            >
                              <option value="openrouter/free">OpenRouter Auto-Free (Recommended)</option>
                              <option value="meta-llama/llama-3.1-8b-instruct">Llama 3.1 8B (Paid)</option>
                              <option value="google/gemma-2-9b-it">Gemma 2 9B (Paid)</option>
                              <option value="deepseek/deepseek-chat">DeepSeek Chat (Paid)</option>
                            </select>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-white/5">
                  <button
                    onClick={() => setShowSettings(false)}
                    className="cursor-pointer px-4 py-2 border border-white/5 bg-white/5 rounded-xl font-semibold text-xs text-gray-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveSettings}
                    className="cursor-pointer px-5 py-2 bg-primary text-background font-bold rounded-xl text-xs flex items-center gap-1.5"
                  >
                    <Check size={14} />
                    <span>Save Config</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {activeTab === 'chat' ? (
            <div className="h-full flex flex-col justify-between p-6">
              {/* Message scroll list */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 select-text">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed border ${
                        msg.role === 'user'
                          ? 'bg-primary/10 border-primary/20 text-white rounded-tr-none'
                          : 'bg-white/5 border-white/5 text-gray-200 rounded-tl-none'
                      }`}
                    >
                      {parseMarkdown(msg.content)}
                    </div>
                  </div>
                ))}
                {sending && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] p-4 rounded-2xl bg-white/5 border border-white/5 text-gray-500 text-sm flex gap-2 items-center">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                      <span className="text-xs ml-1">AI Coach is thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat footer input */}
              <div className="mt-4 space-y-4">
                <div className="flex gap-2">
                  {quickPrompts.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(p.text)}
                      className="cursor-pointer px-3 py-1.5 rounded-lg border border-white/5 bg-white/5 text-xs text-gray-400 hover:border-primary/20 hover:text-primary transition-all font-semibold"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                <div className="flex gap-3">
                  <input
                    type="text"
                    id="chat-message-input"
                    aria-label="Type your sustainability question"
                    placeholder="Ask about your Twin, diet math, or EV emissions..."
                    value={inputMsg}
                    onChange={(e) => setInputMsg(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-primary text-sm"
                  />
                  <button
                    onClick={() => handleSend()}
                    disabled={sending}
                    aria-label="Send Message"
                    className="cursor-pointer w-12 h-12 rounded-xl bg-primary text-background flex items-center justify-center hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Inside scroll container for Explainability Insights */
            <div className="h-full overflow-y-auto p-6 space-y-6">
              <h3 className="text-lg font-bold font-display text-white flex items-center gap-2">
                <HelpCircle size={18} className="text-primary" />
                <span>Explainable Climate Recommendations</span>
              </h3>
              
              <div className="space-y-4">
                {recommendationsList.map((rec, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-gray-500 tracking-widest">{rec.category}</span>
                        <h4 className="text-sm font-bold text-white mt-1">{rec.title}</h4>
                      </div>
                      <span className={`text-[10px] font-bold border px-2 py-0.5 rounded-full ${rec.difficultyColor}`}>
                        {rec.difficulty}
                      </span>
                    </div>

                    <p className="text-xs text-gray-400 leading-relaxed">{rec.why}</p>

                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
                      <div>
                        <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Est. Monthly Savings</div>
                        <div className="text-xs font-bold text-primary">{rec.savings}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Yearly Impact</div>
                        <div className="text-xs font-bold text-secondary">{rec.yearlyImpact} Saved</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Static sidebar panel: Explainability summary drawer */}
      <div className="glass-panel p-6 rounded-3xl border border-white/5 relative overflow-hidden h-[650px] flex flex-col justify-between">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="space-y-6">
          <div className="flex items-center gap-2.5">
            <Leaf className="text-primary" size={18} />
            <h3 className="text-base font-bold font-display text-white">Coach Quick Audits</h3>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-white/5 bg-black/20 space-y-1">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Calculated Footprint</span>
              <div className="text-xl font-bold font-display text-white">{twinData.footprint?.total || 450} kg CO₂ / mo</div>
            </div>

            <div className="p-4 rounded-xl border border-white/5 bg-black/20 space-y-1">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Sustainability Rank</span>
              <div className="text-base font-bold text-primary">Green Explorer</div>
              <p className="text-[11px] text-gray-400 mt-1">Completing weekly missions boosts score status dynamically.</p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-tr from-primary/10 to-secondary/5 border border-primary/20 space-y-2">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Quick Hint</h4>
          <p className="text-[11px] text-gray-400 leading-normal">
            To query actual OpenRouter models (DeepSeek Chat, Qwen, Gemma), configure your API key in the coach settings panel.
          </p>
        </div>
      </div>
    </div>
  );
}
