import express from 'express';
import soilAnalysisController from '../controllers/soilAnalysisController.js';
import { authenticateJWT } from '../middlewares/authenticateJWT.js';

const router = express.Router();

router.route('/')
  .post(authenticateJWT, soilAnalysisController.create)
  .get(authenticateJWT, soilAnalysisController.getAll);

router.route('/:id')
  .get(authenticateJWT, soilAnalysisController.getById)
  .put(authenticateJWT, soilAnalysisController.update)
  .delete(authenticateJWT, soilAnalysisController.delete);

export default router;