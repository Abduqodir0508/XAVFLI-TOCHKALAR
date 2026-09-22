import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { TASHKENT_CENTER, TASHKENT_DEFAULT_ZOOM, TASHKENT_BOUNDS } from '../constants/districts';
import { AlertTriangle, Flame, Plus, Clock, Calendar, MapPin, ShieldAlert } from 'lucide-react';

// Xarita o'lchamlarini avtomatik to'g'ri hisoblash va bo'sh/kulrang tayllarni yo'qotish komponenti
function ResizeHandler() {
  const map = useMap();
  useEffect(() => {
    // Xarita yuklanganda tayllarni to'liq qayta hisoblash
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    const handleResize = () => {
      map.invalidateSize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [map]);

  return null;
}

// Xaritani silliq ko'chirish (FlyTo) yordamchi komponenti
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom || 13, {
        duration: 1.2,
        easeLinearity: 0.25
      });
    }
  }, [center, zoom, map]);
  return null;
}

// Xaritaga bosilganda (Click) yangi koordinatani aniqlash yordamchi komponenti
function MapEventsHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick({
        lat: e.latlng.lat,
        lng: e.latlng.lng
      });
    }
  });
  return null;
}

// Leaflet DivIcon generatori: 3 xil xavf darajasiga mos pulsing pinlar
const createCustomMarkerIcon = (incident) => {
  const count = incident.totalIncidents || 1;
  const isHigh = count >= 5;
  const isMed = count >= 2 && count < 5;

  let htmlContent = '';
  let className = '';

  if (isHigh) {
    // 5+ ta hodisa: Qizil mayoq, qo'shaloq pulsatsiya to'lqini
    className = 'custom-div-icon marker-pin-high';
    htmlContent = `
      <div class="pulse-ring-2"></div>
      <div class="pulse-ring"></div>
      <div class="core-dot">
        <span class="badge-count">${count}</span>
      </div>
    `;
  } else if (isMed) {
    // 2-4 ta hodisa: To'q sariq nuqta, bitta to'lqin, hisob badge
    className = 'custom-div-icon marker-pin-medium';
    htmlContent = `
      <div class="pulse-ring"></div>
      <div class="core-dot"></div>
      <span class="badge-count">${count}</span>
    `;
  } else {
    // 1 ta hodisa: Sariq/Amber nuqta, kichik silliq puls
    className = 'custom-div-icon marker-pin-low';
    htmlContent = `
      <div class="pulse-ring"></div>
      <div class="core-dot"></div>
    `;
  }

  return L.divIcon({
    className,
    html: htmlContent,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -18]
  });
};

// Vaqtinchalik bosilgan nuqta belgisi
const tempClickIcon = L.divIcon({
  className: 'temp-pin',
  html: `
    <div class="target-circle"></div>
    <div class="target-center"></div>
  `,
  iconSize: [26, 26],
  iconAnchor: [13, 13]
});

export default function MapComponent({
  incidents,
  selectedDistrict,
  tempLocation,
  onMapClick,
  onAddMoreToIncident,
  focusedCoords
}) {
  const mapCenter = focusedCoords?.coords || selectedDistrict?.coords || TASHKENT_CENTER;
  const mapZoom = focusedCoords?.zoom || selectedDistrict?.zoom || TASHKENT_DEFAULT_ZOOM;

  return (
    <div className="w-full h-screen relative z-0">
      <MapContainer
        center={TASHKENT_CENTER}
        zoom={TASHKENT_DEFAULT_ZOOM}
        minZoom={11}
        maxZoom={18}
        maxBounds={TASHKENT_BOUNDS}
        maxBoundsViscosity={0.8}
        zoomControl={false}
        className="w-full h-full"
      >
        {/* Mutlaqo bepul, API kalitsiz rasmiy OpenStreetMap qatlami */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Xarita o'lchamini to'g'ri kalibrovka qilish */}
        <ResizeHandler />

        {/* Xarita harakatlarini boshqarish */}
        <MapController center={mapCenter} zoom={mapZoom} />
        <MapEventsHandler onMapClick={onMapClick} />

        {/* Vaqtinchalik bosilgan nuqta belgisi */}
        {tempLocation && (
          <Marker position={[tempLocation.lat, tempLocation.lng]} icon={tempClickIcon} />
        )}

        {/* Barcha qayd qilingan DTP nuqtalari */}
        {incidents.map((item) => {
          const isHighRisk = item.totalIncidents >= 5;
          const isMediumRisk = item.totalIncidents >= 2 && item.totalIncidents < 5;

          // Tarixni teskari (eng oxirgi eng tepada) tartiblash
          const sortedHistory = [...(item.history || [])].sort((a, b) => {
            const timeA = new Date(a.date || a.createdAt).getTime() || 0;
            const timeB = new Date(b.date || b.createdAt).getTime() || 0;
            return timeB - timeA;
          });

          return (
            <Marker
              key={item.id}
              position={[item.lat, item.lng]}
              icon={createCustomMarkerIcon(item)}
            >
              <Popup className="custom-leaflet-popup" minWidth={290} maxWidth={340}>
                <div className="p-4 space-y-3">
                  {/* Popup Sarlavha qismi */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2 pr-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-sky-400 px-2 py-0.5 rounded-md border border-slate-700">
                        {item.district} tumani
                      </span>
                      <span className="text-[11px] font-bold text-slate-300">
                        Jami: <strong className="text-white text-xs">{item.totalIncidents} ta</strong> DTP
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white leading-tight">
                      {item.title}
                    </h3>
                  </div>

                  {/* 5+ O'TA XAVFLI HUDUD Ogohlantirish Paneli */}
                  {isHighRisk && (
                    <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-700/80 flex items-center gap-2 shadow-inner">
                      <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 animate-pulse" />
                      <div className="leading-tight">
                        <span className="text-xs font-black text-red-400 uppercase tracking-wide block">
                          ⚠️ O'TA XAVFLI HUDUD (5+ hodisa)
                        </span>
                        <span className="text-[10px] text-red-300/80">
                          Ushbu chorrahada ko'p marta DTP qayd etilgan!
                        </span>
                      </div>
                    </div>
                  )}

                  {/* O'rta xavfli hudud yorlig'i */}
                  {isMediumRisk && (
                    <div className="p-2 rounded-xl bg-orange-950/40 border border-orange-800/60 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-orange-400 shrink-0" />
                      <span className="text-xs font-bold text-orange-300">
                        O'rta xavf darajasi ({item.totalIncidents} ta hodisa)
                      </span>
                    </div>
                  )}

                  {/* Hodisalar Tarixi Ro'yxati (Eng oxirgisi tepada) */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold mb-2 border-t border-slate-800 pt-2">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        Hodisalar tarixi (Eng so'nggilari tepada):
                      </span>
                    </div>

                    <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                      {sortedHistory.map((hist, idx) => (
                        <div
                          key={hist.id || idx}
                          className={`p-2.5 rounded-xl border text-xs ${
                            idx === 0
                              ? 'bg-slate-800/90 border-slate-700 shadow-sm'
                              : 'bg-slate-850/60 border-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="font-bold text-sky-400 flex items-center gap-1">
                              {idx === 0 && <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping"></span>}
                              {hist.type}
                            </span>
                            <span className="text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700/60 flex items-center gap-0.5">
                              <Calendar className="w-2.5 h-2.5 text-slate-500" />
                              {hist.date}
                            </span>
                          </div>
                          <p className="text-slate-300 text-[11px] leading-relaxed">
                            {hist.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* "Ushbu nuqtaga yana hodisa qo'shish" tugmasi */}
                  <div className="pt-2 border-t border-slate-800">
                    <button
                      onClick={() => onAddMoreToIncident(item)}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white text-xs font-bold py-2 px-3 rounded-xl shadow-lg shadow-orange-600/20 transition-all active:scale-98"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Ushbu nuqtaga yana hodisa qo‘shish</span>
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
