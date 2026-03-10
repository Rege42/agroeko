import { Router } from "express";
import { getCropCompatibilityMatrixController, getCropSelection } from "../controllers/cropCompatibilityController.js";
import { authenticateJWT } from "../middlewares/authenticateJWT.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { ROLES } from "../constants/roles.js";

const router = Router();

router.get(
  "/matrix",
  authenticateJWT,
  authorizeRoles(ROLES.AGRONOMIST, ROLES.MANAGER),
  getCropCompatibilityMatrixController,
);

router.get(
  "/crop-selection/:fieldId",
  authenticateJWT,
  authorizeRoles(ROLES.AGRONOMIST, ROLES.MANAGER),
  getCropSelection,
);

export default router;
