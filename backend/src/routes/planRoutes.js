import express from 'express';
import {
  createPlan,
  getAllPlans,
  getPlanById,
  updatePlan,
  deletePlan,
} from '../controllers/planController.js';
import { authenticateJWT } from '../middlewares/authenticateJWT.js';

const router = express.Router();

router.route('/')
  .post(authenticateJWT, createPlan)
  .get(authenticateJWT, getAllPlans);

router.route('/:id')
  .get(authenticateJWT, getPlanById)
  .put(authenticateJWT, updatePlan)
  .delete(authenticateJWT, deletePlan);

export default router;