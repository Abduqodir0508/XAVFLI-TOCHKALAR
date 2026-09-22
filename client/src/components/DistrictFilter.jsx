import React from 'react';
import { TASHKENT_DISTRICTS } from '../constants/districts';
import { MapPin, Navigation } from 'lucide-react';

export default function DistrictFilter({ selectedDistrict, onSelectDistrict }) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-slate-900/90 backdrop-blur-md p-2 rounded-2xl border border-slate-800 shadow-xl">
      <div className="flex items-center gap-2 px-3 py-1.5 text-slate-400 text-xs font-semibold uppercase tracking-wider">
        <Navigation className="w-3.5 h-3.5 text-sky-400" />
        <span>Tuman:</span>
      </div>

      {/* Select Dropdown */}
      <div className="relative flex-1 min-w-[200px]">
        <select
          value={selectedDistrict?.name || 'Barcha tumanlar'}
          onChange={(e) => {
            const district = TASHKENT_DISTRICTS.find((d) => d.name === e.target.value);
            if (district) {
              onSelectDistrict(district);
            }
          }}
          className="w-full bg-slate-800 hover:bg-slate-750 text-slate-100 text-sm font-medium rounded-xl px-3.5 py-2 pr-9 border border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all cursor-pointer appearance-none"
        >
          {TASHKENT_DISTRICTS.map((district) => (
            <option key={district.id} value={district.name} className="bg-slate-800 text-white">
              {district.name === 'Barcha tumanlar' ? '🏙️ Barcha tumanlar (Toshkent)' : `📍 ${district.name} tumani`}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
