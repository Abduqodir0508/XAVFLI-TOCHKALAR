const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Barcha xavfli nuqtalarni olish
 */
export const fetchIncidents = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.district && filters.district !== 'all' && filters.district !== 'Barcha tumanlar') {
      params.append('district', filters.district);
    }
    if (filters.dangerLevel && filters.dangerLevel !== 'all') {
      params.append('dangerLevel', filters.dangerLevel);
    }
    if (filters.search) {
      params.append('search', filters.search);
    }

    const url = `${API_BASE_URL}/incidents${params.toString() ? `?${params.toString()}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Ma\'lumotlarni yuklashda xatolik yuz berdi');
    }
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error('API fetchIncidents error:', error);
    throw error;
  }
};

/**
 * Yangi xavfli nuqta / hodisa qo'shish
 */
export const createIncident = async (payload) => {
  try {
    const res = await fetch(`${API_BASE_URL}/incidents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Hodisani saqlashda xatolik yuz berdi');
    }
    return data;
  } catch (error) {
    console.error('API createIncident error:', error);
    throw error;
  }
};

/**
 * Mavjud nuqtaga yana yangi hodisa qo'shish (Xavf darajasini oshirish)
 */
export const addEventToIncident = async (incidentId, payload) => {
  try {
    const res = await fetch(`${API_BASE_URL}/incidents/${incidentId}/add-event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Qayta hodisani saqlashda xatolik yuz berdi');
    }
    return data;
  } catch (error) {
    console.error('API addEventToIncident error:', error);
    throw error;
  }
};

/**
 * Toshkent statistikasi
 */
export const fetchStats = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/incidents/stats`);
    if (!res.ok) {
      throw new Error('Statistikani yuklashda xatolik yuz berdi');
    }
    const data = await res.json();
    return data.data;
  } catch (error) {
    console.error('API fetchStats error:', error);
    return null;
  }
};
