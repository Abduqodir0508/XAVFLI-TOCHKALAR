import React from 'react';
import { ShieldAlert, BarChart3, Search, RotateCcw, AlertTriangle, Plus } from 'lucide-react';

export default function Navbar({
  stats,
  searchQuery,
  onSearchChange,
  onOpenStats,
  onResetView,
  onAddPointHint
}) {
  const totalDTP = stats?.totalDTP || 0;
  const highRisk = stats?.highRiskCount || 0;

  return (
    <header className="fixed top-3 left-3 right-3 z-30 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 pointer-events-none">
      {/* Chap tomon: Logo va Sarlavha */}
      <div className="flex items-center gap-3 bg-slate-900/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-800 shadow-2xl pointer-events-auto">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center shadow-lg shadow-red-600/30">
          <ShieldAlert className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-extrabold text-white tracking-tight">SafeRoad Toshkent</h1>
            <span className="bg-sky-500/10 text-sky-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-sky-500/20 uppercase tracking-wide">
              Live Monitoring
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Toshkent DTP va xavfli yo'l nuqtalari interaktiv xaritasi</p>
        </div>
      </div>

      {/* O'rta / O'ng tomon: Qidiruv, Statistika va Tezkor Boshqaruv */}
      <div className="flex flex-wrap items-center gap-2 pointer-events-auto">
        {/* Qidiruv input */}
        <div className="relative flex-1 sm:w-64 min-w-[180px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Chorraha yoki ko'cha qidirish..."
            className="w-full bg-slate-900/90 backdrop-blur-md text-white text-xs font-medium rounded-2xl pl-9 pr-4 py-2.5 border border-slate-800 shadow-xl focus:outline-none focus:ring-2 focus:ring-sky-500 transition placeholder:text-slate-500"
          />
        </div>

        {/* Live Badge: 5+ O'ta xavfli zonalar */}
        {highRisk > 0 && (
          <div
            onClick={onOpenStats}
            className="flex items-center gap-1.5 bg-red-950/80 backdrop-blur-md border border-red-800/80 px-3 py-2 rounded-2xl text-xs font-bold text-red-400 shadow-xl cursor-pointer hover:bg-red-900/80 transition animate-pulse"
            title="O'ta xavfli qizil nuqtalar hisoboti"
          >
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span>{highRisk} ta O'ta xavfli (5+)</span>
          </div>
        )}

        {/* Statistika tugmasi */}
        <button
          onClick={onOpenStats}
          className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold px-3.5 py-2.5 rounded-2xl shadow-xl transition"
        >
          <BarChart3 className="w-4 h-4 text-sky-400" />
          <span className="hidden sm:inline">Statistika</span>
          <span className="bg-sky-500/20 text-sky-300 px-1.5 py-0.5 rounded-md text-[10px]">
            {totalDTP}
          </span>
        </button>

        {/* Xaritani qayta markazlash tugmasi */}
        <button
          onClick={onResetView}
          className="p-2.5 bg-slate-900/90 backdrop-blur-md hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-2xl shadow-xl transition"
          title="Xaritani Toshkent markaziga qaytarish"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Qo'shish yo'riqnomasi tugmasi */}
        <button
          onClick={onAddPointHint}
          className="flex items-center gap-1.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-bold px-3.5 py-2.5 rounded-2xl shadow-xl shadow-sky-500/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden md:inline">Hodisa qo'shish</span>
        </button>
      </div>
    </header>
  );
}
