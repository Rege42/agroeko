import express from "express";
import fieldController from "../controllers/fieldController.js";
import validateRequest from "../middlewares/validateRequest.js";
import validateObjectId from "../middlewares/validateObjectId.js";
import { authenticateJWT } from "../middlewares/authenticateJWT.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { ROLES } from "../constants/roles.js";
import {
  createFieldValidator,
  updateFieldValidator,
  listFieldsValidator,
} from "../validators/fieldValidators.js";

const router = express.Router();

router.get(
  "/",
  listFieldsValidator,
  validateRequest,
  authenticateJWT,
  authorizeRoles(ROLES.AGRONOMIST, ROLES.MANAGER),
  fieldController.getAll,
);
router.get(
  "/:id",
  validateObjectId("id"),
  authenticateJWT,
  authorizeRoles(ROLES.AGRONOMIST, ROLES.MANAGER),
  fieldController.getById,
);
router.post(
  "/",
  createFieldValidator,
  authenticateJWT,
  authorizeRoles(ROLES.AGRONOMIST, ROLES.MANAGER),
  validateRequest,
  fieldController.create,
);
router.patch(
  "/:id",
  validateObjectId("id"),
  updateFieldValidator,
  validateRequest,
  authenticateJWT,
  authorizeRoles(ROLES.AGRONOMIST, ROLES.MANAGER),
  fieldController.update,
);
router.delete("/:id", validateObjectId("id"), fieldController.delete);

export default router;
