import express from 'express';
import {
  createLabourCost,
  getAllLabourCosts,
  getLabourCostById,
  updateLabourCost,
  deleteLabourCost,
} from '../controllers/labourCostController.js';

const router = express.Router();

router.route('/')
  .post(createLabourCost)
  .get(getAllLabourCosts);

router.route('/:id')
  .get(getLabourCostById)
  .put(updateLabourCost)
  .delete(deleteLabourCost);

export default router;