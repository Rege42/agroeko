import express from 'express';
import weatherObservationController from '../controllers/weatherObservationController.js';
import { authenticateJWT } from '../middlewares/authenticateJWT.js';

const router = express.Router();

router.route('/')
  .post(authenticateJWT, weatherObservationController.create)
  .get(authenticateJWT, weatherObservationController.getAll);

router.route('/:id')
  .get(authenticateJWT, weatherObservationController.getById)
  .put(authenticateJWT, weatherObservationController.update)
  .delete(authenticateJWT, weatherObservationController.delete);

export default router;