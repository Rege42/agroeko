import { Router } from "express";
import agroPlanStepController from "../controllers/agroPlanStepController.js";
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
  agroPlanStepController.createAgroPlanStep,
);
router.get(
  "/",
  validateRequest,
  authenticateJWT,
  authorizeRoles(ROLES.AGRONOMIST, ROLES.MANAGER),
  agroPlanStepController.getAgroPlanSteps,
);
router.get(
  "/:id",
  validateRequest,
  authenticateJWT,
  authorizeRoles(ROLES.AGRONOMIST, ROLES.MANAGER),
  agroPlanStepController.getAgroPlanStepById,
);
router.patch(
  "/:id",
  validateRequest,
  authenticateJWT,
  authorizeRoles(ROLES.MANAGER),
  agroPlanStepController.updateAgroPlanStep,
);
router.delete(
  "/:id",
  validateRequest,
  authenticateJWT,
  authorizeRoles(ROLES.MANAGER),
  agroPlanStepController.deleteAgroPlanStep,
);

export default router;
