'use client';

import React, { useEffect, useState } from 'react';
import { Home, Sparkles, AlertCircle, ShieldCheck, MessageSquare, PlusCircle } from 'lucide-react';
import { fetchHealth } from '@/lib/api';
import { HealthCheckResponse } from '@/types/pg';

interface NavbarProps {
  onSelectVerifiedOnly?: () => void;
  onOpenAI?: () => void;
  onOpenAddPG?: () => void;
}

export default function Navbar({ onSelectVerifiedOnly, onOpenAI, onOpenAddPG }: NavbarProps) {
  const [health, setHealth] = useState<HealthCheckResponse | null>(null);
  const [statusText, setStatusText] = useState<'checking' | 'online' | 'degraded' | 'offline'>('checking');

  useEffect(() => {
    let isMounted = true;
    async function checkStatus() {
      try {
        const data = await fetchHealth();
        if (!isMounted) return;
        setHealth(data);
        if (data.status === 'healthy' && data.ollama?.connected) {
          setStatusText('online');
        } else {
          setStatusText('degraded');
        }
      } catch {
        if (!isMounted) return;
        setStatusText('offline');
      }
    }

    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-indigo-100">
            <Home className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-bold tracking-tight text-slate-900">
                PG Finder <span className="text-indigo-600 font-extrabold">AI</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" />
                llama3.2
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-none hidden sm:block">
              Verified Student Accommodations in India
            </p>
          </div>
        </div>

        {/* Status Badge & Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Health indicator */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border">
            {statusText === 'online' && (
              <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border-emerald-200">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                API & Ollama Active
              </span>
            )}
            {statusText === 'degraded' && (
              <span className="flex items-center gap-1.5 text-amber-700 bg-amber-50 border-amber-200">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                {health?.database?.connected ? 'DB Active (Ollama Offline)' : 'Degraded'}
              </span>
            )}
            {statusText === 'offline' && (
              <span className="flex items-center gap-1.5 text-rose-700 bg-rose-50 border-rose-200">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                Backend Offline
              </span>
            )}
            {statusText === 'checking' && (
              <span className="text-slate-500">Checking status...</span>
            )}
          </div>

          {/* Quick Buttons */}
          {onSelectVerifiedOnly && (
            <button
              onClick={onSelectVerifiedOnly}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors shadow-2xs"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Verified Only
            </button>
          )}

          {/* Add Your PG Button */}
          {onOpenAddPG && (
            <button
              type="button"
              onClick={onOpenAddPG}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-sm hover:shadow-md cursor-pointer"
              title="Register a new student PG accommodation"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Your PG</span>
            </button>
          )}

          <a
            href="#ai-assistant"
            onClick={(e) => {
              if (onOpenAI) {
                e.preventDefault();
                onOpenAI();
              }
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>AI Assistant</span>
          </a>
        </div>
      </div>
    </header>
  );
}
