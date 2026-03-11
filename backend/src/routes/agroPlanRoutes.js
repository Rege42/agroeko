import { Router } from "express";
import agroPlanController from "../controllers/agroPlanController.js";
import validateRequest from "../middlewares/validateRequest.js";
import { authenticateJWT } from "../middlewares/authenticateJWT.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { ROLES } from "../constants/roles.js";

const router = Router();

router.post(
  "/",
  validateRequest,
  authenticateJWT,
  authorizeRoles(ROLES.MANAGER),
  agroPlanController.createAgroPlan,
);
router.get(
  "/",
  validateRequest,
  authenticateJWT,
  authorizeRoles(ROLES.AGRONOMIST, ROLES.MANAGER),
  agroPlanController.getAgroPlans,
);
router.get(
  "/:id",
  validateRequest,
  authenticateJWT,
  authorizeRoles(ROLES.AGRONOMIST, ROLES.MANAGER),
  agroPlanController.getAgroPlanById,
);
router.patch(
  "/:id",
  validateRequest,
  authenticateJWT,
  authorizeRoles(ROLES.MANAGER),
  agroPlanController.updateAgroPlan,
);
router.delete(
  "/:id",
  validateRequest,
  authenticateJWT,
  authorizeRoles(ROLES.MANAGER),
  agroPlanController.deleteAgroPlan,
);

export default router;
