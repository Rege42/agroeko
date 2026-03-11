import express from "express";
import cropRotationEntryController from "../controllers/cropRotationEntryController.js";
import validateRequest from "../middlewares/validateRequest.js";
import validateObjectId from "../middlewares/validateObjectId.js";
import {
  createCropRotationEntryValidator,
  updateCropRotationEntryValidator,
  listCropRotationEntriesValidator,
} from "../validators/cropRotationEntryValidators.js";
import { authenticateJWT } from "../middlewares/authenticateJWT.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { ROLES } from "../constants/roles.js";

const router = express.Router();

router.get(
  "/",
  listCropRotationEntriesValidator,
  validateRequest,
  authenticateJWT,
  authorizeRoles(ROLES.AGRONOMIST, ROLES.MANAGER),
  cropRotationEntryController.getAll,
);
router.get("/:id", validateObjectId("id"), cropRotationEntryController.getById);
router.post(
  "/",
  createCropRotationEntryValidator,
  validateRequest,
  authenticateJWT,
  authorizeRoles(ROLES.AGRONOMIST, ROLES.MANAGER),
  cropRotationEntryController.create,
);
router.patch(
  "/:id",
  validateObjectId("id"),
  updateCropRotationEntryValidator,
  validateRequest,
  authenticateJWT,
    authorizeRoles(ROLES.AGRONOMIST, ROLES.MANAGER),
  cropRotationEntryController.update,
);
router.delete(
  "/:id",
  validateObjectId("id"),
  authenticateJWT,
  authorizeRoles(ROLES.AGRONOMIST, ROLES.MANAGER),
  cropRotationEntryController.delete,
);

export default router;
