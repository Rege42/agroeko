import express from 'express';
import {
  createCost,
  getAllCosts,
  getCostById,
  updateCost,
  deleteCost,
} from '../controllers/costController.js';
import { authenticateJWT } from '../middlewares/authenticateJWT.js';

const router = express.Router();

router.route('/')
  .post(authenticateJWT, createCost)
  .get(authenticateJWT, getAllCosts);

router.route('/:id')
  .get(authenticateJWT, getCostById)
  .put(authenticateJWT, updateCost)
  .delete(authenticateJWT, deleteCost);

export default router;