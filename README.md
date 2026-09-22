# SafeRoad Toshkent — Toshkent shahri DTP va Xavfli Nuqtalar Monitoring Tizimi

Toshkent shahri bo'ylab sodir bo'lgan yo'l-transport hodisalari (DTP) va xavfli yo'l/chorrahalarni real vaqt rejimida xaritada monitoring qilish, xavf darajasini tahlil qilish va yangi hodisalarni belgilash uchun zamonaviy Full-stack veb-ilova.

---

## 🚀 Texnologiyalar steki

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Leaflet + React-Leaflet.
- **Backend**: Node.js, Express.js, CORS, Dotenv.
- **Ma'lumotlar bazasi**: JSON doimiy fayl ombori (`server/data/incidents.json`).

---

## 🌟 Asosiy Imkoniyatlar va Funksiyalar

1. **Toshkent Fokusli Yengil Xarita**:
   - Markaz koordinatasi: `[41.311081, 69.240562]`, Zoom: `12-13`.
   - Toshkent shahri chegaralaridan chiqib ketmaslik uchun `maxBounds` cheklovi.
   - Tezkor va qotmaydigan CartoDB / OpenStreetMap xaritasi.

2. **12 ta Tuman Bo'yicha Filtr va Silliq Navigatsiya**:
   - Chilonzor, Olmazor, Mirzo Ulug‘bek, Yunusobod, Sergeli, Yakkasaroy, Shayxontohur, Mirobod, Uchtepa, Yashnobod, Bektemir, Yangihayot.
   - Tuman tanlanganda xarita o'sha tuman markaziga silliq (`flyTo`) yaqinlashadi.

3. **Dinamik Xavf Darajasi (3 Bosqichli va 5+ Qizil Chegara)**:
   - 🟡 **1 ta hodisa**: Sariq/Amber nuqta (Kam xavfli, kichik pulsatsiya).
   - 🟠 **2 - 4 ta hodisa**: To'q sariq nuqta (O'rta xavfli, hisob ko'rsatkichi bilan).
   - 🔴 **5 va undan ortiq (5+)**: Qizil pulsatsiyalanuvchi xavf mayog'i. Kartochka va Popupda qizil rangda **`⚠️ O'TA XAVFLI HUDUD (5+ hodisa)`** ogohlantirish yorlig'i aks etadi.

4. **Hodisalar Tarixi Tartibi (Descending Sorting)**:
   - Marker ustiga bosilganda o'sha chorrahada sodir bo'lgan jami DTP lar soni ko'rsatiladi.
   - Ro'yxatda **eng oxirgi (eng yangi) sodir bo'lgan DTP eng tepada birinchi bo'lib** turadi.

5. **Oson va Tezkor Hodisa Qo'shish**:
   - Hech qanday login yoki ro'yxatdan o'tish talab qilinmaydi.
   - Xaritaning istalgan joyiga bosish orqali yangi nuqta qo'shish mumkin.
   - Mavjud nuqta ustiga bosib, **"➕ Ushbu nuqtaga yana hodisa qo'shish"** tugmasi orqali qayta DTP qo'shish va xavf darajasini oshirish mumkin.
   - Barcha maydonlar qat'iy tekshiriladi (bo'sh qoldirishdan himoyalangan).

---

## 🛠️ Loyihani Ishga Tushirish

### 1-qadam: Kutubxonalarni o'rnatish
Barcha bog'liqliklarni o'rnatish uchun ildiz katalogda quyidagi buyruqni bering:
```bash
npm run install-all
```
*Yoki alohida o'rnatish:*
```bash
cd server && npm install
cd ../client && npm install
```

### 2-qadam: Ilovani ishga tushirish (Frontend + Backend bir vaqtda)
Ildiz katalogdan:
```bash
npm run dev
```

Server va mijoz alohida ishga tushiriladi:
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000](http://localhost:5000)

---

## 📡 REST API Endpointlari

| Metod | Endpoint | Tavsif |
| :--- | :--- | :--- |
| `GET` | `/api/incidents` | Barcha xavfli nuqtalarni olish (`?district=...`, `?search=...`) |
| `GET` | `/api/incidents/stats` | Toshkent bo'yicha umumiy DTP va xavfli zonalar statistikasi |
| `POST` | `/api/incidents` | Yangi koordinataga hodisa qo'shish |
| `POST` | `/api/incidents/:id/add-event` | Mavjud nuqtaga qo'shimcha DTP qo'shish (soni va darajasi oshadi) |
| `POST` | `/api/incidents/:id/increment` | Sinonim endpoint (qayta hodisa qo'shish) |
