import React from 'react';
import { X, ShieldAlert, AlertTriangle, CheckCircle2, Flame, MapPin, ExternalLink } from 'lucide-react';

export default function IncidentStats({ isOpen, onClose, stats, incidents, onFocusIncident }) {
  if (!isOpen) return null;

  const topDangerSpots = incidents
    ? [...incidents].sort((a, b) => (b.totalIncidents || 0) - (a.totalIncidents || 0)).slice(0, 6)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Toshkent Yo'l Xavfsizligi Statistikasi</h2>
              <p className="text-xs text-slate-400">Yo'l-transport hodisalari va yuqori xavfli chorrahalar hisoboti</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/60">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Jami DTP</span>
              <p className="text-2xl font-extrabold text-white mt-1">
                {stats?.totalDTP || incidents.reduce((acc, curr) => acc + (curr.totalIncidents || 1), 0)}
              </p>
              <span className="text-[10px] text-slate-400">qayd etilgan</span>
            </div>

            <div className="bg-red-950/30 p-3.5 rounded-2xl border border-red-800/40">
              <div className="flex items-center gap-1 text-red-400 text-[11px] font-semibold uppercase tracking-wider">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>O'ta xavfli (5+)</span>
              </div>
              <p className="text-2xl font-extrabold text-red-400 mt-1">
                {stats?.highRiskCount || incidents.filter((i) => i.dangerLevel === 'high').length}
              </p>
              <span className="text-[10px] text-red-400/70">qizil zonalar</span>
            </div>

            <div className="bg-orange-950/30 p-3.5 rounded-2xl border border-orange-800/40">
              <div className="flex items-center gap-1 text-orange-400 text-[11px] font-semibold uppercase tracking-wider">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>O'rta xavfli (2-4)</span>
              </div>
              <p className="text-2xl font-extrabold text-orange-400 mt-1">
                {stats?.mediumRiskCount || incidents.filter((i) => i.dangerLevel === 'medium').length}
              </p>
              <span className="text-[10px] text-orange-400/70">to'q sariq</span>
            </div>

            <div className="bg-amber-950/30 p-3.5 rounded-2xl border border-amber-800/40">
              <div className="flex items-center gap-1 text-amber-400 text-[11px] font-semibold uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Kam xavfli (1)</span>
              </div>
              <p className="text-2xl font-extrabold text-amber-400 mt-1">
                {stats?.lowRiskCount || incidents.filter((i) => i.dangerLevel === 'low').length}
              </p>
              <span className="text-[10px] text-amber-400/70">sariq nuqta</span>
            </div>
          </div>

          {/* Top Dangerous Intersections */}
          <div>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Flame className="w-4 h-4 text-red-400" />
              <span>Eng ko'p hodisa sodir bo'lgan nuqtalar (Top Hotspots)</span>
            </h3>

            <div className="space-y-2.5">
              {topDangerSpots.map((item, index) => {
                const isHigh = item.totalIncidents >= 5;
                const isMed = item.totalIncidents >= 2 && item.totalIncidents < 5;

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      onFocusIncident(item);
                      onClose();
                    }}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer group ${
                      isHigh
                        ? 'bg-red-950/20 border-red-800/50 hover:bg-red-950/40'
                        : isMed
                        ? 'bg-orange-950/20 border-orange-800/50 hover:bg-orange-950/40'
                        : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
                          isHigh
                            ? 'bg-red-600 text-white shadow-[0_0_10px_rgba(239,68,68,0.8)]'
                            : isMed
                            ? 'bg-orange-600 text-white'
                            : 'bg-amber-500 text-white'
                        }`}
                      >
                        #{index + 1}
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-white group-hover:text-sky-400 transition">
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-500" />
                            {item.district} tumani
                          </span>
                          <span>•</span>
                          <span>Oxirgi hodisa: {item.history?.[0]?.date || 'Noma\'lum'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                            isHigh
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : isMed
                              ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {item.totalIncidents} ta DTP
                        </span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-sky-400 transition" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-xl transition"
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
}
