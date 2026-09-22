import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Calendar, FileText, AlertTriangle, PlusCircle, MapPin, CheckCircle2 } from 'lucide-react';
import { TASHKENT_DISTRICTS, INCIDENT_PRESET_TYPES } from '../constants/districts';

export default function IncidentModal({
  isOpen,
  onClose,
  onSubmit,
  mode = 'create', // 'create' | 'append'
  locationData = null, // { lat, lng } if create
  targetIncident = null, // existing incident object if append
  isLoading = false
}) {
  const [formData, setFormData] = useState({
    title: '',
    district: 'Chilonzor',
    type: INCIDENT_PRESET_TYPES[0],
    customType: '',
    date: '',
    description: ''
  });

  const [errors, setErrors] = useState({});
  const [isCustomType, setIsCustomType] = useState(false);

  // Modal ochilganda sanani bugungi sana bilan default to'ldirish (YYYY-MM-DD formatda)
  useEffect(() => {
    if (isOpen) {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const todayFormatted = `${yyyy}-${mm}-${dd}`;

      if (mode === 'append' && targetIncident) {
        setFormData({
          title: targetIncident.title || '',
          district: targetIncident.district || 'Chilonzor',
          type: INCIDENT_PRESET_TYPES[0],
          customType: '',
          date: todayFormatted,
          description: ''
        });
      } else {
        setFormData({
          title: locationData ? `Chorraha [${locationData.lat.toFixed(4)}, ${locationData.lng.toFixed(4)}]` : '',
          district: 'Chilonzor',
          type: INCIDENT_PRESET_TYPES[0],
          customType: '',
          date: todayFormatted,
          description: ''
        });
      }
      setIsCustomType(false);
      setErrors({});
    }
  }, [isOpen, mode, targetIncident, locationData]);

  if (!isOpen) return null;

  const handleTypeSelect = (typeVal) => {
    if (typeVal === 'Boshqa xavfli holat') {
      setIsCustomType(true);
      setFormData((prev) => ({ ...prev, type: typeVal, customType: '' }));
    } else {
      setIsCustomType(false);
      setFormData((prev) => ({ ...prev, type: typeVal, customType: '' }));
    }
  };

  const validate = () => {
    const errs = {};
    const finalType = isCustomType ? formData.customType.trim() : formData.type;

    if (!finalType) {
      errs.type = 'Hodisa turi tanlanishi yoki yozilishi shart!';
    }

    if (!formData.date.trim()) {
      errs.date = 'Hodisa sanasi to\'ldirilishi majburiy! (Masalan: 22.09.2026)';
    }

    if (!formData.description.trim()) {
      errs.description = 'Hodisa haqida qisqacha izoh / tafsilot yozilishi shart!';
    } else if (formData.description.trim().length < 5) {
      errs.description = 'Izoh kamida 5 ta belgidan iborat bo\'lishi kerak.';
    }

    if (mode === 'create') {
      if (!formData.title.trim()) {
        errs.title = 'Joy nomi yoki chorraha nomi kiritilishi tavsiya etiladi.';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const finalType = isCustomType ? formData.customType.trim() : formData.type;

    const payload = {
      type: finalType,
      date: formData.date,
      description: formData.description.trim()
    };

    if (mode === 'create') {
      payload.lat = locationData.lat;
      payload.lng = locationData.lng;
      payload.district = formData.district;
      payload.title = formData.title.trim() || `Chorraha [${locationData.lat.toFixed(4)}, ${locationData.lng.toFixed(4)}]`;
    }

    onSubmit(payload);
  };

  const currentCount = targetIncident?.totalIncidents || 0;
  const willBeHighRisk = mode === 'append' ? currentCount + 1 >= 5 : false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${mode === 'append' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'}`}>
              {mode === 'append' ? <PlusCircle className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {mode === 'append' ? 'Mavjud nuqtaga hodisa qo‘shish' : 'Xaritada yangi xavfli nuqta belgilash'}
              </h2>
              <p className="text-xs text-slate-400">
                {mode === 'append' ? `Chorraha: ${targetIncident?.title}` : 'Xaritada tanlangan koordinata bo\'yicha'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {/* Append rejimida xavf darajasi ogohlantirishi */}
          {mode === 'append' && (
            <div className={`p-3.5 rounded-2xl border flex items-start gap-3 ${willBeHighRisk ? 'bg-red-950/30 border-red-800/60 text-red-300' : 'bg-orange-950/30 border-orange-800/60 text-orange-300'}`}>
              <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${willBeHighRisk ? 'text-red-400' : 'text-orange-400'}`} />
              <div className="text-xs">
                <p className="font-semibold text-white">Hozirgi hodisalar soni: {currentCount} ta</p>
                <p className="mt-0.5">
                  Ushbu yangi hodisani saqlaganingizdan so'ng jami hodisalar soni <strong>{currentCount + 1} ta</strong> bo'ladi
                  {willBeHighRisk ? ' va hudud "⚠️ O\'TA XAVFLI HUDUD (5+ hodisa)" toifasiga o\'tadi / qizil yonadi.' : '.'}
                </p>
              </div>
            </div>
          )}

          {/* Yangi nuqta qo'shishda nom va tuman */}
          {mode === 'create' && (
            <>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  1. Joy / Chorraha yoki Ko'cha nomi <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Masalan: Bunyodkor va Muqimiy chorrahasi"
                  className={`w-full bg-slate-800 text-white rounded-xl px-4 py-2.5 text-sm border focus:outline-none focus:ring-2 transition ${errors.title ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 focus:ring-sky-500'}`}
                />
                {errors.title && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.title}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  2. Toshkent tumani <span className="text-red-400">*</span>
                </label>
                <select
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="w-full bg-slate-800 text-white rounded-xl px-4 py-2.5 text-sm border border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
                >
                  {TASHKENT_DISTRICTS.filter((d) => d.id !== 'all').map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name} tumani
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Hodisa turi / Nima bo'ldi? */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              {mode === 'create' ? '3.' : '1.'} Hodisa turi / Nima bo'ldi? <span className="text-red-400">*</span>
            </label>

            {/* Tezkor tanlov tugmalari */}
            <div className="grid grid-cols-2 gap-1.5 mb-2.5">
              {INCIDENT_PRESET_TYPES.slice(0, 6).map((preset) => {
                const isSelected = formData.type === preset && !isCustomType;
                return (
                  <button
                    type="button"
                    key={preset}
                    onClick={() => handleTypeSelect(preset)}
                    className={`text-left text-xs p-2 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-sky-500/20 border-sky-400 text-sky-300 font-bold shadow-[0_0_10px_rgba(56,189,248,0.3)]'
                        : 'bg-slate-800/70 border-slate-700/80 text-slate-300 hover:bg-slate-750'
                    }`}
                  >
                    {isSelected ? '✓ ' : ''}{preset}
                  </button>
                );
              })}
            </div>

            {/* Custom input agar maxsus hodisa turi bo'lsa */}
            <div className="mt-2">
              <input
                type="text"
                value={isCustomType ? formData.customType : formData.type}
                onChange={(e) => {
                  setIsCustomType(true);
                  setFormData({ ...formData, customType: e.target.value });
                }}
                placeholder="Yoki o'z variantiizni yozing (Masalan: Yuk mashinasi ag'darildi)"
                className={`w-full bg-slate-800 text-white rounded-xl px-4 py-2.5 text-sm border focus:outline-none focus:ring-2 transition ${errors.type ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 focus:ring-sky-500'}`}
              />
              {errors.type && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.type}</p>}
            </div>
          </div>

          {/* Sana */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center justify-between">
              <span>{mode === 'create' ? '4.' : '2.'} Sana <span className="text-red-400">*</span></span>
              <span className="text-[11px] text-slate-400 font-normal lowercase">Namuna: 22.09.2026</span>
            </label>
            <div className="relative">
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className={`w-full bg-slate-800 text-white rounded-xl px-4 py-2.5 text-sm border focus:outline-none focus:ring-2 transition ${errors.date ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 focus:ring-sky-500'}`}
              />
            </div>
            {errors.date && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.date}</p>}
          </div>

          {/* Izoh / Tafsilot */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              {mode === 'create' ? '5.' : '3.'} Izoh / Tafsilot <span className="text-red-400">*</span>
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Hodisa qanday sodir bo'ldi? (Masalan: Ikki yengil avtomobil to'qnashib, svetofor ustuniga urilgan. Harakat sekinlashgan)."
              className={`w-full bg-slate-800 text-white rounded-xl px-4 py-2.5 text-sm border focus:outline-none focus:ring-2 transition ${errors.description ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 focus:ring-sky-500'}`}
            />
            {errors.description && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.description}</p>}
          </div>

          {/* Footer tugmalari */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 text-sm font-medium transition"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-sm font-bold shadow-lg shadow-sky-500/25 transition flex items-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saqlanmoqda...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Saqlash</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
