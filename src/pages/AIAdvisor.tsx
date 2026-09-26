import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, Send, User, Sparkles, RefreshCw, Trash2, Copy, Check, 
  ArrowRight, ShieldCheck, Truck, Layers, FileText, Zap, Compass, MessageSquare
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  isLiveAI?: boolean;
}

const PRESET_PROMPTS = [
  {
    title: 'Slag Cement Substitution',
    prompt: 'How can Ground Granulated Blast-Furnace Slag (GBFS) be utilized to replace Portland cement under ASTM C989, and what are the CO2e savings per ton?',
    icon: Sparkles
  },
  {
    title: 'Geopolymer Fly Ash',
    prompt: 'Evaluate geopolymer cement formulation using Class F Fly Ash and calculate avoided calcination emissions compared to standard OPC.',
    icon: Zap
  },
  {
    title: 'Twilio Haulage Automation',
    prompt: 'Explain how Twilio SMS dispatch, WhatsApp material passports, and 2FA weighbridge verify work together to secure industrial circular supply chains.',
    icon: MessageSquare
  },
  {
    title: 'Foundry Sand Closed-Loop',
    prompt: 'Identify circular economy recovery routes for Spent Foundry Sand in asphalt pavement and aggregate manufacturing.',
    icon: Compass
  }
];

export const AIAdvisor: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init_welcome',
      role: 'model',
      content: `### 🤖 Welcome to the SYMBIO Industrial AI Advisor

I am your specialized AI engineering assistant for **industrial symbiosis, circular byproduct valorization, and logistics dispatch**.

**How I can assist you:**
* **Technical Compatibility:** Evaluate substitution ratios for slag, fly ash, phosphogypsum, and foundry sand based on ASTM/IS standards.
* **Decarbonization & LCA:** Calculate Scope 3 avoided carbon emissions and embodied energy savings.
* **Telematics & Dispatch:** Draft automated Twilio SMS haul notices, WhatsApp manifests, and weighbridge gatepass workflows.
* **Closed-Loop Cascades:** Identify multi-hop symbiotic loops between steel mills, cement kilns, and precast concrete plants.

Select a prompt below or type your inquiry to begin:`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isLiveAI: true
    }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<string>('Granulated Blast Furnace Slag');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map(m => ({ role: m.role, content: m.content })),
          contextMaterial: selectedMaterial,
        })
      });

      if (res.ok) {
        const data = await res.json();
        const modelMsg: ChatMessage = {
          id: 'msg_model_' + Date.now(),
          role: 'model',
          content: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isLiveAI: data.isLiveAI
        };
        setMessages([...newHistory, modelMsg]);
      } else {
        throw new Error('Failed to fetch AI response');
      }
    } catch (err: any) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: 'msg_err_' + Date.now(),
        role: 'model',
        content: `⚠️ **SYMBIO Advisor Notice:** Could not reach the AI gateway. Please check your connectivity or review your configuration in the **Settings** page.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([...newHistory, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'init_welcome_cleared',
        role: 'model',
        content: 'Chat session reset. How can I assist with your industrial byproduct streams or dispatch automation today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isLiveAI: true
      }
    ]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[640px] max-w-6xl mx-auto text-brand-light">
      {/* Top Header Card */}
      <div className="bg-gray-900 border border-gray-800 p-4 rounded-2xl mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand-primary/20 text-brand-primary border border-brand-primary/30 flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5" />
              GEMINI 3.8 FLASH ENGINE
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              CIRCULAR LCA & TELEMATICS
            </span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">SYMBIO AI Industrial Advisor</h1>
        </div>

        {/* Material Stream Context Filter & Reset */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-gray-800 border border-gray-700 px-3 py-1.5 rounded-xl text-xs">
            <span className="text-gray-400">Context:</span>
            <select
              value={selectedMaterial}
              onChange={(e) => setSelectedMaterial(e.target.value)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
            >
              <option value="Granulated Blast Furnace Slag" className="bg-gray-900 text-white">GBFS / Steel Slag</option>
              <option value="Pulverized Coal Fly Ash (Class F)" className="bg-gray-900 text-white">Fly Ash (Class F/C)</option>
              <option value="Spent Foundry Silica Sand" className="bg-gray-900 text-white">Spent Foundry Sand</option>
              <option value="Phosphogypsum Byproduct" className="bg-gray-900 text-white">Phosphogypsum</option>
              <option value="Secondary Polyolefin Regrind" className="bg-gray-900 text-white">Polymer Regrind</option>
            </select>
          </div>

          <button
            onClick={clearChat}
            className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl border border-gray-700 text-xs transition-colors"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Chat Message Scroll Container */}
      <div className="flex-1 bg-gray-900/60 border border-gray-800 rounded-2xl p-4 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'model' && (
              <div className="w-8 h-8 rounded-xl bg-brand-primary/20 border border-brand-primary/40 text-brand-primary flex items-center justify-center shrink-0 mt-1">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-2xl rounded-2xl p-4 space-y-2 shadow-lg ${
                msg.role === 'user'
                  ? 'bg-brand-primary text-white ml-12 rounded-tr-none'
                  : 'bg-gray-850 border border-gray-800 text-gray-200 mr-12 rounded-tl-none'
              }`}
            >
              <div className="flex items-center justify-between gap-4 text-[11px] opacity-70 pb-1 border-b border-white/10">
                <span className="font-semibold">{msg.role === 'user' ? 'Plant Operator' : 'SYMBIO AI Advisor'}</span>
                <span>{msg.timestamp}</span>
              </div>

              {/* Message text with formatting */}
              <div className="text-sm leading-relaxed whitespace-pre-wrap font-sans">
                {msg.content}
              </div>

              {/* Model Action Toolbar */}
              {msg.role === 'model' && (
                <div className="flex items-center justify-between pt-2 border-t border-gray-800 text-xs text-gray-400">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(msg.id, msg.content)}
                      className="flex items-center gap-1 hover:text-white transition-colors"
                    >
                      {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span className="text-[11px]">{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-3 text-[11px]">
                    <Link to="/dashboard/twilio" className="text-blue-400 hover:underline flex items-center gap-0.5">
                      Twilio Dispatch <ArrowRight className="w-3 h-3" />
                    </Link>
                    <Link to="/dashboard/map" className="text-emerald-400 hover:underline flex items-center gap-0.5">
                      GIS Map <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 mt-1">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-xl bg-brand-primary/20 border border-brand-primary/40 text-brand-primary flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-gray-850 border border-gray-800 rounded-2xl rounded-tl-none p-4 text-xs text-gray-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-primary animate-ping"></span>
              Computing circular engineering standards & LCA emissions...
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 my-3">
        {PRESET_PROMPTS.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(p.prompt)}
            disabled={loading}
            className="p-2.5 bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 rounded-xl text-left transition-all group disabled:opacity-50"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-200 group-hover:text-brand-primary">
              <p.icon className="w-3.5 h-3.5 text-brand-primary shrink-0" />
              <span className="truncate">{p.title}</span>
            </div>
            <p className="text-[11px] text-gray-400 truncate mt-0.5">{p.prompt}</p>
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask about byproduct chemistry, avoided carbon, OSRM transit, or Twilio dispatch...`}
          disabled={loading}
          className="w-full bg-gray-900 border border-gray-700 focus:border-brand-primary text-white rounded-2xl py-3.5 pl-4 pr-12 text-sm focus:outline-none shadow-xl"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="absolute right-2 top-2 p-2 bg-brand-primary hover:bg-blue-600 disabled:bg-gray-800 text-white rounded-xl transition-colors shadow-md"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
