export const TASHKENT_CENTER = [41.311081, 69.240562];
export const TASHKENT_DEFAULT_ZOOM = 12.5;

// Toshkent shahrining chegaralari (Tashqariga chiqib ketmaslik uchun)
export const TASHKENT_BOUNDS = [
  [41.1500, 69.0500], // Janubi-g'arbiy burchak
  [41.4300, 69.4500]  // Shimoli-sharqiy burchak
];

// Toshkentning 12 ta ma'muriy tumani koordinatalari
export const TASHKENT_DISTRICTS = [
  {
    id: 'all',
    name: 'Barcha tumanlar',
    coords: TASHKENT_CENTER,
    zoom: 12.5
  },
  {
    id: 'chilonzor',
    name: 'Chilonzor',
    coords: [41.2721, 69.2045],
    zoom: 13.5
  },
  {
    id: 'olmazor',
    name: 'Olmazor',
    coords: [41.3533, 69.2215],
    zoom: 13.5
  },
  {
    id: 'mirzo-ulugbek',
    name: 'Mirzo Ulug‘bek',
    coords: [41.3325, 69.3341],
    zoom: 13.5
  },
  {
    id: 'yunusobod',
    name: 'Yunusobod',
    coords: [41.3662, 69.2882],
    zoom: 13.5
  },
  {
    id: 'sergeli',
    name: 'Sergeli',
    coords: [41.2214, 69.2223],
    zoom: 13.5
  },
  {
    id: 'yakkasaroy',
    name: 'Yakkasaroy',
    coords: [41.2778, 69.2514],
    zoom: 14
  },
  {
    id: 'shayxontohur',
    name: 'Shayxontohur',
    coords: [41.3218, 69.2319],
    zoom: 14
  },
  {
    id: 'mirobod',
    name: 'Mirobod',
    coords: [41.2915, 69.2827],
    zoom: 14
  },
  {
    id: 'uchtepa',
    name: 'Uchtepa',
    coords: [41.2934, 69.1712],
    zoom: 13.5
  },
  {
    id: 'yashnobod',
    name: 'Yashnobod',
    coords: [41.2954, 69.3401],
    zoom: 13.5
  },
  {
    id: 'bektemir',
    name: 'Bektemir',
    coords: [41.2112, 69.3345],
    zoom: 13.5
  },
  {
    id: 'yangihayot',
    name: 'Yangihayot',
    coords: [41.1985, 69.2048],
    zoom: 13.5
  }
];

// DTP va xavfli holat turlarining tayyor ro'yxati
export const INCIDENT_PRESET_TYPES = [
  "Avariya bo'ldi",
  "Mashina urib ketdi",
  "Ikkita mashina to'qnashdi",
  "Piyodalar o'tish joyida xavfli holat",
  "Ko'prik ustida to'qnashuv",
  "Svetofor ishlamayapti / Tartibsiz harakat",
  "Yo'l o'nqir-cho'nqir / Chuqurlik",
  "Boshqa xavfli holat"
];
