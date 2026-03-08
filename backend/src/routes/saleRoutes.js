import express from 'express';
import {
  createSale,
  getAllSales,
  getSaleById,
  updateSale,
  deleteSale,
} from '../controllers/saleController.js';

const router = express.Router();

router.route('/')
  .post(createSale)
  .get(getAllSales);

router.route('/:id')
  .get(getSaleById)
  .put(updateSale)
  .delete(deleteSale);

export default router;