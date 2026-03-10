import express from 'express';
import {
  createLabourCost,
  getAllLabourCosts,
  getLabourCostById,
  updateLabourCost,
  deleteLabourCost,
} from '../controllers/labourCostController.js';
import { authenticateJWT } from '../middlewares/authenticateJWT.js';

const router = express.Router();

router.route('/')
  .post(authenticateJWT, createLabourCost)
  .get(authenticateJWT, getAllLabourCosts);

router.route('/:id')
  .get(authenticateJWT, getLabourCostById)
  .put(authenticateJWT, updateLabourCost)
  .delete(authenticateJWT, deleteLabourCost);

export default router;