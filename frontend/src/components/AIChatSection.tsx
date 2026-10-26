'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Loader2,
  HelpCircle,
} from 'lucide-react';
import { sendAIChatMessage } from '@/lib/api';
import { ChatMessage } from '@/types/pg';

interface AIChatSectionProps {
  initialPrompt?: string;
  onClearInitialPrompt?: () => void;
}

const SUGGESTED_QUESTIONS = [
  'What hidden charges should I ask a PG owner about before moving in?',
  'How do security deposit refunds typically work for student PGs in India?',
  'What are common curfew rules and guest policies in college PGs?',
  'What should I inspect in the bathroom and food preparation area during a PG visit?',
];

export default function AIChatSection({ initialPrompt, onClearInitialPrompt }: AIChatSectionProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Hello! I am your PG Finder AI assistant, powered by local Ollama (llama3.2). Ask me anything about student accommodations, hidden fees, inspection checklists, meal tradeoffs, or curfew rules.',
      timestamp: 'Just now',
      model: 'llama3.2:3b',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = useCallback(async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const result = await sendAIChatMessage(textToSend);
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: result.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        model: result.model || 'llama3.2:3b',
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: unknown) {
      const errText = err instanceof Error ? err.message : 'An error occurred while contacting AI';
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: `Sorry, I encountered an issue: ${errText}. Please ensure your backend and Ollama daemon are running.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  // Handle external prompt passed from a PG card
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      const promptText = initialPrompt.trim();
      const timer = setTimeout(() => {
        handleSend(promptText);
        if (onClearInitialPrompt) {
          onClearInitialPrompt();
        }
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [initialPrompt, handleSend, onClearInitialPrompt]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(inputText);
  };

  return (
    <section id="ai-assistant" className="scroll-mt-20 my-12">
      <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-indigo-500/20">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-indigo-500 p-0.5 flex items-center justify-center shadow-lg">
              <div className="h-full w-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                <Bot className="w-6 h-6 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold tracking-tight">PG Finder AI Assistant</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Local Ollama
                </span>
              </div>
              <p className="text-xs text-indigo-200">
                Ask student accommodation questions, check inspection checklists, or analyze PG tradeoffs.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Privacy-preserving &amp; Zero cloud fees</span>
          </div>
        </div>

        {/* Suggested Quick Questions */}
        <div className="py-4 border-b border-white/10">
          <p className="text-xs font-semibold text-indigo-300 mb-2 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Suggested Student Questions:</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(q)}
                disabled={isLoading}
                className="text-xs text-left px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-200 border border-white/10 transition-colors disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Message Box */}
        <div className="h-[380px] overflow-y-auto my-4 pr-2 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${
                m.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {m.sender === 'ai' && (
                <div className={`h-8 w-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold ${
                  m.isError ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-indigo-600/40 text-indigo-300 border border-indigo-400/30'
                }`}>
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : m.isError
                    ? 'bg-rose-950/70 text-rose-200 border border-rose-800'
                    : 'bg-white/10 text-slate-100 border border-white/10'
                }`}
              >
                <p className="whitespace-pre-line">{m.text}</p>
                <div className="mt-1.5 flex items-center justify-between gap-4 text-[10px] opacity-60">
                  {m.model && <span>Model: {m.model}</span>}
                  <span className="ml-auto">{m.timestamp}</span>
                </div>
              </div>

              {m.sender === 'user' && (
                <div className="h-8 w-8 rounded-xl bg-indigo-500 shrink-0 flex items-center justify-center text-xs text-white">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-indigo-600/40 text-indigo-300 border border-indigo-400/30 shrink-0 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white/10 text-slate-300 rounded-2xl px-4 py-3 text-xs flex items-center gap-2 border border-white/10">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                <span>Ollama is thinking with llama3.2...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Field */}
        <form onSubmit={handleFormSubmit} className="pt-2 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
            placeholder="Ask about deposits, food rules, curfews, or specific PGs..."
            className="flex-1 px-4 py-3 text-xs sm:text-sm rounded-xl bg-white/10 border border-white/15 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-white placeholder-slate-400 disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="px-5 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-700 text-white font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-colors shadow-lg disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Ask</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>
      </div>
    </section>
  );
}
