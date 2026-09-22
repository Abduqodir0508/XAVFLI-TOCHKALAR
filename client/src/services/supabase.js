/**
 * Supabase Cloud Client & REST helper
 * Agar Vercel / .env da VITE_SUPABASE_URL va VITE_SUPABASE_ANON_KEY kiritilgan bo'lsa,
 * to'g'ridan-to'g'ri Supabase PostgreSQL bazasi bilan ishlaydi.
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = () => {
  return Boolean(
    SUPABASE_URL &&
    SUPABASE_ANON_KEY &&
    !SUPABASE_URL.includes('your-supabase-id') &&
    SUPABASE_URL.startsWith('http')
  );
};

const getHeaders = () => ({
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
});

/**
 * Supabase dan barcha hodisalarni o'qish
 */
export const fetchSupabaseIncidents = async () => {
  if (!isSupabaseConfigured()) return null;

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/incidents?select=*&order=createdAt.desc`, {
      headers: getHeaders()
    });

    if (!res.ok) {
      console.warn('Supabase fetch error:', res.statusText);
      return null;
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.warn('Supabase fetch exception:', error);
    return null;
  }
};

/**
 * Supabase ga yangi hodisa yozish
 */
export const insertSupabaseIncident = async (incident) => {
  if (!isSupabaseConfigured()) return null;

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/incidents`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(incident)
    });

    if (!res.ok) {
      throw new Error(`Supabase insert error: ${res.statusText}`);
    }

    const data = await res.json();
    return data?.[0] || incident;
  } catch (error) {
    console.error('Supabase insert exception:', error);
    throw error;
  }
};

/**
 * Supabase dagi mavjud hodisani yangilash
 */
export const updateSupabaseIncident = async (id, updatedIncident) => {
  if (!isSupabaseConfigured()) return null;

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/incidents?id=eq.${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(updatedIncident)
    });

    if (!res.ok) {
      throw new Error(`Supabase update error: ${res.statusText}`);
    }

    const data = await res.json();
    return data?.[0] || updatedIncident;
  } catch (error) {
    console.error('Supabase update exception:', error);
    throw error;
  }
};
