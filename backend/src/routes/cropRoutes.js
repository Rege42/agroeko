import express from "express";
import cropController from "../controllers/cropController.js";
import validateRequest from "../middlewares/validateRequest.js";
import validateObjectId from "../middlewares/validateObjectId.js";
import {
  createCropValidator,
  updateCropValidator,
  listCropsValidator,
} from "../validators/cropValidators.js";
import { authenticateJWT } from "../middlewares/authenticateJWT.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { ROLES } from "../constants/roles.js";

const router = express.Router();

router.get(
  "/",
  listCropsValidator,
  validateRequest,
  authenticateJWT,
  authorizeRoles(ROLES.AGRONOMIST, ROLES.MANAGER),
  cropController.getAll,
);
router.get(
  "/:id",
  validateObjectId("id"),
  authenticateJWT,
  authorizeRoles(ROLES.AGRONOMIST, ROLES.MANAGER),
  cropController.getById,
);
router.post(
  "/",
  createCropValidator,
  validateRequest,
  authenticateJWT,
  authorizeRoles(ROLES.AGRONOMIST, ROLES.MANAGER),
  cropController.create,
);
router.patch(
  "/:id",
  validateObjectId("id"),
  updateCropValidator,
  validateRequest,
  authenticateJWT,
  authorizeRoles(ROLES.AGRONOMIST, ROLES.MANAGER),
  cropController.update,
);
router.delete(
  "/:id",
  validateObjectId("id"),
  authenticateJWT,
  authorizeRoles(ROLES.AGRONOMIST, ROLES.MANAGER),
  cropController.delete,
);

export default router;
