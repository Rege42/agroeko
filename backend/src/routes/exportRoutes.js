import express from 'express';
import { exportToExcel, exportToPDF, customExport } from '../controllers/exportController.js';
import { authenticateJWT } from '../middlewares/authenticateJWT.js';

const router = express.Router();

router.post('/excel', authenticateJWT, exportToExcel);
router.post('/pdf', authenticateJWT, exportToPDF);
router.post('/custom', authenticateJWT, customExport);

export default router;