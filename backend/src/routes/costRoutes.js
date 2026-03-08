import express from 'express';
import {
  createCost,
  getAllCosts,
  getCostById,
  updateCost,
  deleteCost,
} from '../controllers/costController.js';

const router = express.Router();

router.route('/')
  .post(createCost)
  .get(getAllCosts);

router.route('/:id')
  .get(getCostById)
  .put(updateCost)
  .delete(deleteCost);

export default router;