import express from 'express';
import soilAnalysisController from '../controllers/soilAnalysisController.js';

const router = express.Router();

router.route('/')
  .post(soilAnalysisController.create)
  .get(soilAnalysisController.getAll);

router.route('/:id')
  .get(soilAnalysisController.getById)
  .put(soilAnalysisController.update)
  .delete(soilAnalysisController.delete);

export default router;