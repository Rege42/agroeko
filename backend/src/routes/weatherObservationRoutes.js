import express from 'express';
import weatherObservationController from '../controllers/weatherObservationController.js';
import { authenticateJWT } from '../middlewares/authenticateJWT.js';
import { authorizeRoles } from '../middlewares/authorizeRoles.js';
import { ROLES } from '../constants/roles.js';

const router = express.Router();

router.route('/')
  .post(authenticateJWT, authorizeRoles(ROLES.AGRONOMIST, ROLES.MANAGER), weatherObservationController.create)
  .get(authenticateJWT, authorizeRoles(ROLES.AGRONOMIST, ROLES.MANAGER), weatherObservationController.getAll);

router.route('/:id')
  .get(authenticateJWT, authorizeRoles(ROLES.AGRONOMIST, ROLES.MANAGER), weatherObservationController.getById)
  .put(authenticateJWT, authorizeRoles(ROLES.AGRONOMIST, ROLES.MANAGER), weatherObservationController.update)
  .delete(authenticateJWT, authorizeRoles(ROLES.AGRONOMIST, ROLES.MANAGER), weatherObservationController.delete);

export default router;