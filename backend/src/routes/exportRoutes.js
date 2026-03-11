import express from "express";
import {
  exportToExcel,
  exportToPDF,
  customExport,
} from "../controllers/exportController.js";
import { authenticateJWT } from "../middlewares/authenticateJWT.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { ROLES } from "../constants/roles.js";

const router = express.Router();

router.post(
  "/excel",
  authenticateJWT,
  authorizeRoles(ROLES.AGRONOMIST, ROLES.MANAGER),
  exportToExcel,
);
router.post(
  "/pdf",
  authenticateJWT,
  authorizeRoles(ROLES.AGRONOMIST, ROLES.MANAGER),
  exportToPDF,
);
router.post(
  "/custom",
  authenticateJWT,
  authorizeRoles(ROLES.AGRONOMIST, ROLES.MANAGER),
  customExport,
);

export default router;
