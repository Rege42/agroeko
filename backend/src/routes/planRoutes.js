import express from 'express';
import {
  createPlan,
  getAllPlans,
  getPlanById,
  updatePlan,
  deletePlan,
} from '../controllers/planController.js';
import { authenticateJWT } from '../middlewares/authenticateJWT.js';
import { authorizeRoles } from '../middlewares/authorizeRoles.js';
import { ROLES } from '../constants/roles.js';

const router = express.Router();

router.route('/')
  .post(authenticateJWT, authorizeRoles(ROLES.AGRONOMIST, ROLES.MANAGER), createPlan)
  .get(authenticateJWT, authorizeRoles(ROLES.AGRONOMIST, ROLES.MANAGER), getAllPlans);

router.route('/:id')
  .get(authenticateJWT, authorizeRoles(ROLES.AGRONOMIST, ROLES.MANAGER), getPlanById)
  .put(authenticateJWT, authorizeRoles(ROLES.AGRONOMIST, ROLES.MANAGER), updatePlan)
  .delete(authenticateJWT, authorizeRoles(ROLES.AGRONOMIST, ROLES.MANAGER), deletePlan);

export default router;