import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import MapComponent from './components/MapComponent';
import DistrictFilter from './components/DistrictFilter';
import Legend from './components/Legend';
import IncidentModal from './components/IncidentModal';
import IncidentStats from './components/IncidentStats';
import { fetchIncidents, createIncident, addEventToIncident, fetchStats } from './services/api';
import { TASHKENT_DISTRICTS, TASHKENT_CENTER } from './constants/districts';
import { CheckCircle2, AlertCircle, Info, MousePointerClick } from 'lucide-react';

export default function App() {
  const [incidents, setIncidents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Filtrlar va qidiruv
  const [selectedDistrict, setSelectedDistrict] = useState(TASHKENT_DISTRICTS[0]); // 'Barcha tumanlar'
  const [searchQuery, setSearchQuery] = useState('');
  const [focusedCoords, setFocusedCoords] = useState(null);

  // Modallar va vaqtinchalik koordinata holati
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'append'
  const [tempLocation, setTempLocation] = useState(null);
  const [targetIncident, setTargetIncident] = useState(null);
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  // Toast / Xabarnoma holati
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Ma'lumotlarni yuklash
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [incidentsData, statsData] = await Promise.all([
        fetchIncidents({
          district: selectedDistrict?.id === 'all' ? null : selectedDistrict?.name,
          search: searchQuery
        }),
        fetchStats()
      ]);
      setIncidents(incidentsData);
      setStats(statsData);
    } catch (err) {
      console.error('Ma\'lumotlarni olishda xatolik:', err);
      showToast('Ma\'lumotlarni yuklab bo\'lmadi. Server yoqilganligini tekshiring.', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedDistrict, searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Xaritaga bosilganda yangi nuqta qo'shish oynasini ochish
  const handleMapClick = (coords) => {
    setTempLocation(coords);
    setTargetIncident(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  // Mavjud nuqtaga qo'shimcha hodisa qo'shish
  const handleAddMoreToIncident = (incident) => {
    setTargetIncident(incident);
    setTempLocation(null);
    setModalMode('append');
    setIsModalOpen(true);
  };

  // Formani saqlash (Yangi yoki Qayta hodisa)
  const handleModalSubmit = async (formData) => {
    try {
      setActionLoading(true);
      if (modalMode === 'create') {
        await createIncident(formData);
        showToast('Yangi xavfli nuqta va DTP muvaffaqiyatli saqlandi! 📍', 'success');
      } else if (modalMode === 'append' && targetIncident) {
        await addEventToIncident(targetIncident.id, formData);
        showToast('Nuqtaga yangi hodisa kiritildi va xavf darajasi yangilandi! ⚠️', 'success');
      }
      setIsModalOpen(false);
      setTempLocation(null);
      setTargetIncident(null);
      await loadData();
    } catch (err) {
      showToast(err.message || 'Saqlashda xatolik yuz berdi', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Tuman tanlanganda
  const handleSelectDistrict = (district) => {
    setSelectedDistrict(district);
    setFocusedCoords({
      coords: district.coords,
      zoom: district.zoom
    });
  };

  // Markazga qaytarish
  const handleResetView = () => {
    setSelectedDistrict(TASHKENT_DISTRICTS[0]);
    setFocusedCoords({
      coords: TASHKENT_CENTER,
      zoom: 12.5
    });
    setSearchQuery('');
  };

  // Statistikadan nuqtani tanlab xaritada ko'rsatish
  const handleFocusIncident = (item) => {
    setFocusedCoords({
      coords: [item.lat, item.lng],
      zoom: 16
    });
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Yuqori Header va Qidiruv / Statistika paneli */}
      <Navbar
        stats={stats}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenStats={() => setIsStatsOpen(true)}
        onResetView={handleResetView}
        onAddPointHint={() => {
          showToast('Xaritada istalgan ko‘cha yoki chorraha ustiga bosing — yangi hodisa qo‘shish oynasi ochiladi! 🖱️', 'info');
        }}
      />

      {/* Asosiy Xarita (Leaflet) */}
      <MapComponent
        incidents={incidents}
        selectedDistrict={selectedDistrict}
        tempLocation={tempLocation}
        onMapClick={handleMapClick}
        onAddMoreToIncident={handleAddMoreToIncident}
        focusedCoords={focusedCoords}
      />

      {/* Chap pastki qism: Tuman filtri va qo'llanma */}
      <div className="fixed bottom-6 left-4 z-20 flex flex-col gap-3 pointer-events-auto">
        <DistrictFilter
          selectedDistrict={selectedDistrict}
          onSelectDistrict={handleSelectDistrict}
        />
        <Legend />
      </div>

      {/* O'ng pastki qism: Tezkor yordam chipi */}
      <div className="fixed bottom-6 right-4 z-20 hidden md:flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-800 text-xs text-slate-300 shadow-xl pointer-events-auto">
        <MousePointerClick className="w-4 h-4 text-sky-400" />
        <span>Xaritaga bosib nuqta belgilang</span>
      </div>

      {/* Hodisa Qo'shish / Yangilash Modali */}
      <IncidentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setTempLocation(null);
          setTargetIncident(null);
        }}
        onSubmit={handleModalSubmit}
        mode={modalMode}
        locationData={tempLocation}
        targetIncident={targetIncident}
        isLoading={actionLoading}
      />

      {/* Statistika va Xavfli Hududlar Paneli */}
      <IncidentStats
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        stats={stats}
        incidents={incidents}
        onFocusIncident={handleFocusIncident}
      />

      {/* Toast Xabarnoma */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 flex items-center gap-2.5 bg-slate-900/95 backdrop-blur-md border border-slate-700 text-white px-4 py-3 rounded-2xl shadow-2xl animate-bounce-short">
          {toast.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          ) : toast.type === 'info' ? (
            <Info className="w-5 h-5 text-sky-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          )}
          <span className="text-xs font-semibold">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
