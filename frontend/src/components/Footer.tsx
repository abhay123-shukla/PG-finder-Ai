'use client';

import React from 'react';
import { Home, ShieldCheck, Sparkles, Terminal } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-slate-100">
          {/* Column 1: Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
                <Home className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold text-slate-900">PG Finder AI</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              An AI-powered accommodation search and verification assistant designed for college students across India. Grounded strictly on verified relational records.
            </p>
          </div>

          {/* Column 2: Tech Architecture */}
          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              Technology Architecture
            </h4>
            <ul className="space-y-1.5 text-slate-500">
              <li className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-indigo-500" />
                <span>Next.js 16 + TypeScript + Tailwind CSS</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>FastAPI + SQLite + SQLAlchemy Relational DB</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Local Ollama AI (<code className="font-mono text-[10px] bg-slate-100 px-1 py-0.5 rounded">llama3.2:3b</code>)</span>
              </li>
            </ul>
          </div>

          {/* Column 3: Trust & Privacy */}
          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              Privacy &amp; Authenticity
            </h4>
            <p className="text-slate-500 leading-relaxed">
              Zero fabricated reviews or phantom listings. All listing data originates from the live FastAPI SQLite database. Runs 100% locally with zero external API fees.
            </p>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>© 2026 PG Finder AI. Built for student accommodation transparency.</p>
          <p className="font-mono text-[11px]">Local Host: 127.0.0.1:3000 (UI) &amp; 127.0.0.1:8000 (API)</p>
        </div>
      </div>
    </footer>
  );
}
