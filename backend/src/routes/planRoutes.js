import express from 'express';
import {
  createPlan,
  getAllPlans,
  getPlanById,
  updatePlan,
  deletePlan,
} from '../controllers/planController.js';

const router = express.Router();

router.route('/')
  .post(createPlan)
  .get(getAllPlans);

router.route('/:id')
  .get(getPlanById)
  .put(updatePlan)
  .delete(deletePlan);

export default router;