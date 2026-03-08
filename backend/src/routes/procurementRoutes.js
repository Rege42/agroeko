import express from 'express';
import {
  createProcurement,
  getAllProcurements,
  getProcurementById,
  updateProcurement,
  deleteProcurement,
} from '../controllers/procurementController.js';

const router = express.Router();

router.route('/')
  .post(createProcurement)
  .get(getAllProcurements);

router.route('/:id')
  .get(getProcurementById)
  .put(updateProcurement)
  .delete(deleteProcurement);

export default router;