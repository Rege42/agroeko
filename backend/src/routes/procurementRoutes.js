import express from 'express';
import {
  createProcurement,
  getAllProcurements,
  getProcurementById,
  updateProcurement,
  deleteProcurement,
} from '../controllers/procurementController.js';
import { authenticateJWT } from '../middlewares/authenticateJWT.js';

const router = express.Router();

router.route('/')
  .post(authenticateJWT, createProcurement)
  .get(authenticateJWT, getAllProcurements);

router.route('/:id')
  .get(authenticateJWT, getProcurementById)
  .put(authenticateJWT, updateProcurement)
  .delete(authenticateJWT, deleteProcurement);

export default router;