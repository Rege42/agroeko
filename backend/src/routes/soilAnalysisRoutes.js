import express from 'express';
import soilAnalysisController from '../controllers/soilAnalysisController.js';
import { authenticateJWT } from '../middlewares/authenticateJWT.js';
import { authorizeRoles } from '../middlewares/authorizeRoles.js';
import { ROLES } from '../constants/roles.js';

const router = express.Router();

router.route('/')
  .post(authenticateJWT, authorizeRoles(ROLES.AGRONOMIST, ROLES.MANAGER), soilAnalysisController.create)
  .get(authenticateJWT, authorizeRoles(ROLES.AGRONOMIST, ROLES.MANAGER), soilAnalysisController.getAll);

router.route('/:id')
  .get(authenticateJWT, authorizeRoles(ROLES.AGRONOMIST, ROLES.MANAGER), soilAnalysisController.getById)
  .put(authenticateJWT, authorizeRoles(ROLES.AGRONOMIST, ROLES.MANAGER), soilAnalysisController.update)
  .delete(authenticateJWT, authorizeRoles(ROLES.AGRONOMIST, ROLES.MANAGER), soilAnalysisController.delete);

export default router;