import express from 'express';
import {
  createCost,
  getAllCosts,
  getCostById,
  updateCost,
  deleteCost,
} from '../controllers/costController.js';
import { authenticateJWT } from '../middlewares/authenticateJWT.js';
import { authorizeRoles } from '../middlewares/authorizeRoles.js';
import { ROLES } from '../constants/roles.js';

const router = express.Router();

router.route('/')
  .post(authenticateJWT, authorizeRoles(ROLES.AGRONOMIST, ROLES.MANAGER), createCost)
  .get(authenticateJWT, authorizeRoles(ROLES.AGRONOMIST, ROLES.MANAGER), getAllCosts);

router.route('/:id')
  .get(authenticateJWT, authorizeRoles(ROLES.AGRONOMIST, ROLES.MANAGER), getCostById)
  .put(authenticateJWT, authorizeRoles(ROLES.AGRONOMIST, ROLES.MANAGER), updateCost)
  .delete(authenticateJWT, authorizeRoles(ROLES.AGRONOMIST, ROLES.MANAGER), deleteCost);

export default router;