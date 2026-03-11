import express from "express";
import {
  createLabourCost,
  getAllLabourCosts,
  getLabourCostById,
  updateLabourCost,
  deleteLabourCost,
} from "../controllers/labourCostController.js";
import { authenticateJWT } from "../middlewares/authenticateJWT.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { ROLES } from "../constants/roles.js";

const router = express.Router();

router
  .route("/")
  .post(
    authenticateJWT,
    authorizeRoles(ROLES.AGRONOMIST, ROLES.MANAGER),
    createLabourCost,
  )
  .get(
    authenticateJWT,
    authorizeRoles(ROLES.AGRONOMIST, ROLES.MANAGER),
    getAllLabourCosts,
  );

router
  .route("/:id")
  .get(
    authenticateJWT,
    authorizeRoles(ROLES.AGRONOMIST, ROLES.MANAGER),
    getLabourCostById,
  )
  .put(
    authenticateJWT,
    authorizeRoles(ROLES.AGRONOMIST, ROLES.MANAGER),
    updateLabourCost,
  )
  .delete(
    authenticateJWT,
    authorizeRoles(ROLES.AGRONOMIST, ROLES.MANAGER),
    deleteLabourCost,
  );

export default router;
