import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { getFinancialInsights } from '../../services/geminiService';
import { Bot, User, Send, Sparkles, HelpCircle, ShieldCheck } from 'lucide-react';

interface Message {
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

const AiAssistantPage: React.FC = () => {
  const { transactions, accounts, budgets } = useAppContext();
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: "Hello! I am your FinTrack AI Advisor. I can analyze your accounts, spending velocity, budget limits, and suggest specific ways to optimize your cash flow. Ask me anything or click one of the quick prompts below!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMessage: Message = {
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const aiResponseText = await getFinancialInsights(query, transactions, accounts, budgets);
    const aiMessage: Message = {
      sender: 'ai',
      text: aiResponseText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, aiMessage]);
    setIsLoading(false);
  };

  const quickPrompts = [
    "What are my top 3 highest spending categories?",
    "How can I cut 15% from my monthly expenses?",
    "Audit my accounts and net worth balance.",
    "Which budgets am I at risk of exceeding?",
    "Give me an end-of-month cash flow forecast."
  ];

  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col max-w-5xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>AI Financial Advisor</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200 uppercase">
              Gemini Powered
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time financial guidance analyzing your actual {transactions.length} transactions and {accounts.length} wallets.
          </p>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200/90 shadow-sm flex flex-col overflow-hidden">
        {/* Messages scroll area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg, index) => {
            const isUser = msg.sender === 'user';
            return (
              <div 
                key={index} 
                className={`flex items-start space-x-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                    <Bot size={17} />
                  </div>
                )}

                <div className={`max-w-xl rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  isUser 
                    ? 'bg-emerald-600 text-white shadow-xs rounded-tr-none' 
                    : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/60'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  <span className={`block text-[10px] mt-1.5 ${isUser ? 'text-emerald-100 text-right' : 'text-slate-400'}`}>
                    {msg.timestamp}
                  </span>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                    <User size={17} />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                <Bot size={17} />
              </div>
              <div className="bg-slate-100 rounded-2xl rounded-tl-none px-4 py-3 border border-slate-200/60 flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
                <span className="text-xs text-slate-500 font-medium ml-1">Analyzing ledger...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts Chips */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200/80">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Suggested Inquiries:</p>
          <div className="flex flex-wrap gap-1.5">
            {quickPrompts.map(prompt => (
              <button
                key={prompt}
                onClick={() => handleSend(prompt)}
                disabled={isLoading}
                className="text-xs bg-white hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 border border-slate-200 text-slate-700 font-medium py-1 px-2.5 rounded-lg transition-colors text-left"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Input Bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about spending patterns, savings advice, or budget forecasts..."
              className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl p-2.5 shadow-sm transition-colors"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AiAssistantPage;