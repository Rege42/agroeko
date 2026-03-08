import express from 'express';
import { exportToExcel, exportToPDF, customExport } from '../controllers/exportController.js';

const router = express.Router();

router.post('/excel', exportToExcel);
router.post('/pdf', exportToPDF);
router.post('/custom', customExport);

export default router;