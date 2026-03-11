import express from "express";
import {
  createProcurement,
  getAllProcurements,
  getProcurementById,
  updateProcurement,
  deleteProcurement,
} from "../controllers/procurementController.js";
import { authenticateJWT } from "../middlewares/authenticateJWT.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { ROLES } from "../constants/roles.js";

const router = express.Router();

router
  .route("/")
  .post(
    authenticateJWT,
    authorizeRoles(ROLES.AGRONOMIST, ROLES.MANAGER),
    createProcurement,
  )
  .get(
    authenticateJWT,
    authorizeRoles(ROLES.AGRONOMIST, ROLES.MANAGER),
    getAllProcurements,
  );

router
  .route("/:id")
  .get(
    authenticateJWT,
    authorizeRoles(ROLES.AGRONOMIST, ROLES.MANAGER),
    getProcurementById,
  )
  .put(
    authenticateJWT,
    authorizeRoles(ROLES.AGRONOMIST, ROLES.MANAGER),
    updateProcurement,
  )
  .delete(
    authenticateJWT,
    authorizeRoles(ROLES.AGRONOMIST, ROLES.MANAGER),
    deleteProcurement,
  );

export default router;
