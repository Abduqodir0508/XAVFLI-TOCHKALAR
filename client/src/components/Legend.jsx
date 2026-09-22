import React, { useState } from 'react';
import { AlertTriangle, Info, ChevronDown, ChevronUp } from 'lucide-react';

export default function Legend() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800/80 rounded-2xl shadow-2xl p-3.5 text-xs text-slate-200 w-64 transition-all">
      <div 
        className="flex items-center justify-between cursor-pointer font-bold text-slate-100 mb-1"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>Xavf darajalari bo'yicha</span>
        </div>
        <button className="text-slate-400 hover:text-white p-0.5">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isOpen && (
        <div className="mt-2.5 space-y-2 border-t border-slate-800 pt-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-amber-400 border border-white shadow-[0_0_8px_rgba(245,158,11,0.8)] inline-block"></span>
              <span className="text-slate-300 font-medium">1 ta hodisa</span>
            </div>
            <span className="text-amber-400 font-semibold text-[11px] bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-800/40">Kam xavfli</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-orange-500 border border-white shadow-[0_0_10px_rgba(234,88,12,0.9)] inline-block"></span>
              <span className="text-slate-300 font-medium">2 - 4 ta hodisa</span>
            </div>
            <span className="text-orange-400 font-semibold text-[11px] bg-orange-950/60 px-2 py-0.5 rounded-full border border-orange-800/40">O'rta xavf</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-red-600 border border-white shadow-[0_0_12px_rgba(239,68,68,1)] animate-pulse inline-block"></span>
              <span className="text-slate-200 font-bold">5+ ta hodisa</span>
            </div>
            <span className="text-red-400 font-bold text-[11px] bg-red-950/80 px-2 py-0.5 rounded-full border border-red-700 animate-pulse">
              ⚠️ O'TA XAVFLI
            </span>
          </div>

          <div className="pt-2 text-[10px] text-slate-400 flex items-start gap-1 border-t border-slate-800/60">
            <Info className="w-3 h-3 text-sky-400 shrink-0 mt-0.5" />
            <span>Xaritaga bosib yangi DTP qo'shishingiz yoki mavjud nuqta ustiga bosib hodisalar sonini oshirishingiz mumkin.</span>
          </div>
        </div>
      )}
    </div>
  );
}
