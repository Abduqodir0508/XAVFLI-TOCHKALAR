import { INITIAL_TASHKENT_INCIDENTS } from '../constants/initialData';
import {
  isSupabaseConfigured,
  fetchSupabaseIncidents,
  insertSupabaseIncident,
  updateSupabaseIncident
} from './supabase';

const STORAGE_KEY = 'saferoad_tashkent_incidents_v1';
const API_BASE_URL = import.meta.env.VITE_API_URL;

// Xavf darajasini hisoblash qoidasi
const calculateDangerLevel = (count) => {
  if (count >= 5) return 'high';
  if (count >= 2) return 'medium';
  return 'low';
};

// Hodisalar tarixini eng yangisi tepada bo'ladigan qilib tartiblash
const sortHistoryDesc = (history) => {
  if (!Array.isArray(history)) return [];
  return [...history].sort((a, b) => {
    const timeA = new Date(a.date || a.createdAt).getTime() || 0;
    const timeB = new Date(b.date || b.createdAt).getTime() || 0;
    return timeB - timeA;
  });
};

// LocalStorage dan ma'lumotlarni o'qish (yoki boshlang'ich Toshkent ma'lumotlarini yuklash)
const getLocalData = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_TASHKENT_INCIDENTS));
      return INITIAL_TASHKENT_INCIDENTS;
    }
    return JSON.parse(stored);
  } catch (err) {
    console.error('LocalStorage o\'qishda xatolik:', err);
    return INITIAL_TASHKENT_INCIDENTS;
  }
};

// LocalStorage ga saqlash
const saveLocalData = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('LocalStorage yozishda xatolik:', err);
  }
};

/**
 * Barcha xavfli nuqtalarni olish (Supabase -> Backend -> LocalStorage kaskadi)
 */
export const fetchIncidents = async (filters = {}) => {
  let list = [];

  // 1. Agar Supabase sozlangan bo'lsa
  if (isSupabaseConfigured()) {
    const sbData = await fetchSupabaseIncidents();
    if (sbData && Array.isArray(sbData) && sbData.length > 0) {
      list = sbData;
    } else if (sbData && sbData.length === 0) {
      // Supabase bo'sh bo'lsa boshlang'ich ma'lumotlarni yozib yuboramiz
      for (const item of INITIAL_TASHKENT_INCIDENTS) {
        await insertSupabaseIncident(item);
      }
      list = INITIAL_TASHKENT_INCIDENTS;
    }
  }

  // 2. Agar Supabase ishlamasa va API URL mavjud bo'lsa
  if (list.length === 0 && API_BASE_URL) {
    try {
      const res = await fetch(`${API_BASE_URL}/incidents`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          list = json.data;
        }
      }
    } catch (e) {
      console.warn('Backend API ga ulanib bo\'lmadi, LocalStorage ishlatilmoqda.');
    }
  }

  // 3. Vercel va Offline rejimda LocalStorage kafolatlangan ombor
  if (list.length === 0) {
    list = getLocalData();
  }

  // Filtrlarni qo'llash
  if (filters.district && filters.district !== 'all' && filters.district !== 'Barcha tumanlar') {
    list = list.filter(
      (item) => item.district?.toLowerCase() === filters.district.toLowerCase()
    );
  }

  if (filters.dangerLevel && filters.dangerLevel !== 'all') {
    list = list.filter((item) => item.dangerLevel === filters.dangerLevel);
  }

  if (filters.search && filters.search.trim()) {
    const q = filters.search.toLowerCase();
    list = list.filter(
      (item) =>
        item.title?.toLowerCase().includes(q) ||
        item.district?.toLowerCase().includes(q) ||
        item.history?.some(
          (h) =>
            h.type?.toLowerCase().includes(q) ||
            h.description?.toLowerCase().includes(q)
        )
    );
  }

  // Har bir nuqtaning tarixini tartiblash (Eng yangisi birinchi)
  return list.map((item) => ({
    ...item,
    history: sortHistoryDesc(item.history)
  }));
};

/**
 * Yangi xavfli nuqta qo'shish
 */
export const createIncident = async (payload) => {
  const nowIso = new Date().toISOString();
  const incidentId = `inc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const eventId = `evt-${Date.now()}-1`;

  const firstEvent = {
    id: eventId,
    type: payload.type.trim(),
    date: payload.date.trim(),
    description: payload.description.trim(),
    createdAt: nowIso
  };

  const newIncident = {
    id: incidentId,
    title: payload.title?.trim() || `Chorraha [${payload.lat.toFixed(4)}, ${payload.lng.toFixed(4)}]`,
    lat: parseFloat(payload.lat),
    lng: parseFloat(payload.lng),
    district: payload.district || 'Chilonzor',
    totalIncidents: 1,
    dangerLevel: calculateDangerLevel(1),
    history: [firstEvent],
    createdAt: nowIso,
    updatedAt: nowIso
  };

  // 1. Supabase bo'lsa
  if (isSupabaseConfigured()) {
    try {
      await insertSupabaseIncident(newIncident);
    } catch (err) {
      console.warn('Supabase ga yozilmadi, LocalStorage ga saqlanadi', err);
    }
  }

  // 2. LocalStorage da saqlash (Vercel da bir lahzada ishlashi uchun)
  const localList = getLocalData();
  const updatedList = [newIncident, ...localList];
  saveLocalData(updatedList);

  return { success: true, data: newIncident };
};

/**
 * Mavjud nuqtaga qo'shimcha hodisa kiritish (Xavf darajasini va sonini oshirish)
 */
export const addEventToIncident = async (incidentId, payload) => {
  const nowIso = new Date().toISOString();
  const localList = getLocalData();
  const index = localList.findIndex((item) => item.id === incidentId);

  if (index === -1) {
    throw new Error('Tanlangan nuqta topilmadi');
  }

  const existing = localList[index];
  const newEventId = `evt-${Date.now()}-${(existing.history?.length || 0) + 1}`;

  const newEvent = {
    id: newEventId,
    type: payload.type.trim(),
    date: payload.date.trim(),
    description: payload.description.trim(),
    createdAt: nowIso
  };

  const updatedCount = (existing.totalIncidents || 0) + 1;
  const newDangerLevel = calculateDangerLevel(updatedCount);
  const updatedHistory = sortHistoryDesc([newEvent, ...(existing.history || [])]);

  const updatedIncident = {
    ...existing,
    totalIncidents: updatedCount,
    dangerLevel: newDangerLevel,
    history: updatedHistory,
    updatedAt: nowIso
  };

  // 1. Supabase bo'lsa
  if (isSupabaseConfigured()) {
    try {
      await updateSupabaseIncident(incidentId, updatedIncident);
    } catch (err) {
      console.warn('Supabase ga yangilanmadi, LocalStorage yangilandi', err);
    }
  }

  // 2. LocalStorage ni yangilash
  localList[index] = updatedIncident;
  saveLocalData(localList);

  return { success: true, data: updatedIncident };
};

/**
 * Toshkent statistikasi hisoblash
 */
export const fetchStats = async () => {
  const list = getLocalData();
  let totalDTP = 0;
  let highRiskCount = 0;
  let mediumRiskCount = 0;
  let lowRiskCount = 0;

  list.forEach((item) => {
    totalDTP += item.totalIncidents || 1;
    if (item.dangerLevel === 'high' || (item.totalIncidents || 0) >= 5) highRiskCount++;
    else if (item.dangerLevel === 'medium' || (item.totalIncidents || 0) >= 2) mediumRiskCount++;
    else lowRiskCount++;
  });

  const topDangerous = [...list]
    .sort((a, b) => (b.totalIncidents || 0) - (a.totalIncidents || 0))
    .slice(0, 6);

  return {
    totalSpots: list.length,
    totalDTP,
    highRiskCount,
    mediumRiskCount,
    lowRiskCount,
    topDangerous
  };
};
