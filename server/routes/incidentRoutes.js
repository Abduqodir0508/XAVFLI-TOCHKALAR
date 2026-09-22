import express from 'express';
import {
  getIncidents,
  createIncident,
  addEventToIncident,
  getStats
} from '../controllers/incidentController.js';

const router = express.Router();

// Barcha hodisalar va qidiruv/filtrlar
router.get('/', getIncidents);

// Umumiy xavfsizlik statistikasi
router.get('/stats', getStats);

// Yangi koordinataga hodisa yaratish
router.post('/', createIncident);

// Mavjud nuqtaga yana hodisa qo'shish (qayta hodisa)
router.post('/:id/add-event', addEventToIncident);

// Qo'shimcha sinonim endpoint (foydalanuvchi so'rovidagi /increment)
router.post('/:id/increment', addEventToIncident);

export default router;
