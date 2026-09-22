import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '..', 'data', 'incidents.json');

// Yordamchi funksiya: JSON faylni o'qish
const readData = () => {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf8');
      return [];
    }
    const rawData = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(rawData || '[]');
  } catch (err) {
    console.error('Ma\'lumotlarni o\'qishda xatolik:', err);
    return [];
  }
};

// Yordamchi funksiya: JSON faylga yozish
const writeData = (data) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Ma\'lumotlarni yozishda xatolik:', err);
    return false;
  }
};

// Xavf darajasini hisoblash qoidasi:
// 1 ta hodisa -> low (Sariq)
// 2-4 ta hodisa -> medium (To'q sariq)
// 5 va undan ortiq -> high (Qizil - O'ta xavfli)
const calculateDangerLevel = (totalCount) => {
  if (totalCount >= 5) return 'high';
  if (totalCount >= 2) return 'medium';
  return 'low';
};

// Hodisalar tarixini eng yangisi tepada bo'ladigan qilib tartiblash (Descending)
const sortHistoryDesc = (history) => {
  if (!Array.isArray(history)) return [];
  return [...history].sort((a, b) => {
    const timeA = new Date(a.date || a.createdAt).getTime() || 0;
    const timeB = new Date(b.date || b.createdAt).getTime() || 0;
    return timeB - timeA;
  });
};

/**
 * GET /api/incidents
 * Barcha xavfli nuqtalarni olish (filtrlar: district, dangerLevel, search)
 */
export const getIncidents = (req, res) => {
  try {
    const { district, dangerLevel, search } = req.query;
    let incidents = readData();

    // Filtrlash: Tuman bo'yicha
    if (district && district !== 'Barcha tumanlar') {
      incidents = incidents.filter(
        (item) => item.district?.toLowerCase() === district.toLowerCase()
      );
    }

    // Filtrlash: Xavf darajasi bo'yicha
    if (dangerLevel && dangerLevel !== 'all') {
      incidents = incidents.filter((item) => item.dangerLevel === dangerLevel);
    }

    // Qidiruv: Sarlavha yoki izoh bo'yicha
    if (search && search.trim() !== '') {
      const q = search.toLowerCase();
      incidents = incidents.filter(
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

    // Har bir nuqtaning tarixini eng yangi birinchi qilib tartiblash
    incidents = incidents.map((item) => ({
      ...item,
      history: sortHistoryDesc(item.history)
    }));

    return res.status(200).json({
      success: true,
      count: incidents.length,
      data: incidents
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Serverda xatolik yuz berdi: ' + error.message
    });
  }
};

/**
 * POST /api/incidents
 * Yangi koordinataga birinchi hodisani qo'shish
 */
export const createIncident = (req, res) => {
  try {
    const { lat, lng, type, date, description, district, title } = req.body;

    // Majburiy maydonlarni qat'iy tekshirish (Validatsiya)
    if (lat === undefined || lat === null || lng === undefined || lng === null) {
      return res.status(400).json({
        success: false,
        message: 'Xaritada koordinata (lat, lng) tanlanishi shart!'
      });
    }

    if (!type || !type.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Hodisa turi (Nima bo\'ldi?) to\'ldirilishi majburiy!'
      });
    }

    if (!date || !date.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Hodisa sanasi to\'ldirilishi majburiy!'
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Hodisa haqida izoh / tafsilot yozilishi majburiy!'
      });
    }

    const incidents = readData();
    const nowIso = new Date().toISOString();
    const incidentId = `inc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const eventId = `evt-${Date.now()}-1`;

    const firstEvent = {
      id: eventId,
      type: type.trim(),
      date: date.trim(),
      description: description.trim(),
      createdAt: nowIso
    };

    const newIncident = {
      id: incidentId,
      title: (title && title.trim()) || `Chorraha / Nuqta [${lat.toFixed(4)}, ${lng.toFixed(4)}]`,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      district: district || 'Noma\'lum',
      totalIncidents: 1,
      dangerLevel: calculateDangerLevel(1), // 1 -> 'low' (Sariq)
      history: [firstEvent],
      createdAt: nowIso,
      updatedAt: nowIso
    };

    incidents.push(newIncident);
    writeData(incidents);

    return res.status(201).json({
      success: true,
      message: 'Yangi xavfli nuqta va hodisa muvaffaqiyatli saqlandi!',
      data: newIncident
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Hodisa qo\'shishda xatolik: ' + error.message
    });
  }
};

/**
 * POST /api/incidents/:id/add-event
 * Mavjud nuqtaga qayta/yangi hodisa qo'shish (Xavf darajasi va soni oshadi)
 */
export const addEventToIncident = (req, res) => {
  try {
    const { id } = req.params;
    const { type, date, description } = req.body;

    // Majburiy maydonlarni tekshirish
    if (!type || !type.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Hodisa turi kiritilishi shart!'
      });
    }

    if (!date || !date.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Hodisa sanasi kiritilishi shart!'
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Hodisa haqida izoh kiritilishi shart!'
      });
    }

    const incidents = readData();
    const incidentIndex = incidents.findIndex((item) => item.id === id);

    if (incidentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Bunday ID ga ega nuqta topilmadi!'
      });
    }

    const incident = incidents[incidentIndex];
    const nowIso = new Date().toISOString();
    const newEventId = `evt-${Date.now()}-${(incident.history?.length || 0) + 1}`;

    const newEvent = {
      id: newEventId,
      type: type.trim(),
      date: date.trim(),
      description: description.trim(),
      createdAt: nowIso
    };

    // Yangi hodisani tarixga qo'shamiz
    const updatedHistory = [newEvent, ...(incident.history || [])];
    const updatedCount = (incident.totalIncidents || 0) + 1;
    const newDangerLevel = calculateDangerLevel(updatedCount);

    const updatedIncident = {
      ...incident,
      totalIncidents: updatedCount,
      dangerLevel: newDangerLevel,
      history: sortHistoryDesc(updatedHistory),
      updatedAt: nowIso
    };

    incidents[incidentIndex] = updatedIncident;
    writeData(incidents);

    return res.status(200).json({
      success: true,
      message: 'Ushbu nuqtaga yangi hodisa kiritildi! Xavf darajasi yangilandi.',
      data: updatedIncident
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Hodisa qo\'shishda xatolik: ' + error.message
    });
  }
};

/**
 * GET /api/incidents/stats
 * Toshkent bo'yicha umumiy DTP va xavfli zonalar statistikasi
 */
export const getStats = (req, res) => {
  try {
    const incidents = readData();
    let totalDTP = 0;
    let highRiskCount = 0;
    let mediumRiskCount = 0;
    let lowRiskCount = 0;

    incidents.forEach((item) => {
      totalDTP += item.totalIncidents || 1;
      if (item.dangerLevel === 'high') highRiskCount++;
      else if (item.dangerLevel === 'medium') mediumRiskCount++;
      else lowRiskCount++;
    });

    const topDangerous = [...incidents]
      .sort((a, b) => b.totalIncidents - a.totalIncidents)
      .slice(0, 5);

    return res.status(200).json({
      success: true,
      data: {
        totalSpots: incidents.length,
        totalDTP,
        highRiskCount,
        mediumRiskCount,
        lowRiskCount,
        topDangerous
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Statistikani olishda xatolik: ' + error.message
    });
  }
};
