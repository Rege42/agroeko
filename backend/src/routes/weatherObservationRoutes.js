import express from 'express';
import weatherObservationController from '../controllers/weatherObservationController.js';

const router = express.Router();

router.route('/')
  .post(weatherObservationController.create)
  .get(weatherObservationController.getAll);

router.route('/:id')
  .get(weatherObservationController.getById)
  .put(weatherObservationController.update)
  .delete(weatherObservationController.delete);

export default router;