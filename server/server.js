import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import incidentRoutes from './routes/incidentRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware sozlamalari
app.use(cors({
  origin: '*', // Ishlab chiqish va ishlab chiqarish uchun ochiq
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sog'lomlik tekshiruvi (Health check)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    system: 'SafeRoad Tashkent API',
    time: new Date().toISOString()
  });
});

// Asosiy marshrutlar
app.use('/api/incidents', incidentRoutes);

// Mavjud bo'lmagan marshrutlar uchun 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Marshrut topilmadi: ${req.originalUrl}`
  });
});

// Global xatoliklar tutqichi (Error handler)
app.use((err, req, res, next) => {
  console.error('Server xatosi:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Server ichki xatoligi: ' + err.message
  });
});

// Serverni ishga tushirish
app.listen(PORT, () => {
  console.log(`=============================================`);
  console.log(`🚦 SafeRoad Tashkent Backend API ishga tushdi`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`📍 Test endpoint: http://localhost:${PORT}/api/incidents`);
  console.log(`=============================================`);
});
