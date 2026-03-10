import express from 'express';
import {
  createSale,
  getAllSales,
  getSaleById,
  updateSale,
  deleteSale,
} from '../controllers/saleController.js';
import { authenticateJWT } from '../middlewares/authenticateJWT.js';

const router = express.Router();

router.route('/')
  .post(authenticateJWT, createSale)
  .get(authenticateJWT, getAllSales);

router.route('/:id')
  .get(authenticateJWT, getSaleById)
  .put(authenticateJWT, updateSale)
  .delete(authenticateJWT, deleteSale);

export default router;