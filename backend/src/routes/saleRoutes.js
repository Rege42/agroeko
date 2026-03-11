import express from "express";
import {
  createSale,
  getAllSales,
  getSaleById,
  updateSale,
  deleteSale,
} from "../controllers/saleController.js";
import { authenticateJWT } from "../middlewares/authenticateJWT.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { ROLES } from "../constants/roles.js";

const router = express.Router();

router
  .route("/")
  .post(
    authenticateJWT,
    authorizeRoles(ROLES.AGRONOMIST, ROLES.MANAGER),
    createSale,
  )
  .get(
    authenticateJWT,
    authorizeRoles(ROLES.AGRONOMIST, ROLES.MANAGER),
    getAllSales,
  );

router
  .route("/:id")
  .get(
    authenticateJWT,
    authorizeRoles(ROLES.AGRONOMIST, ROLES.MANAGER),
    getSaleById,
  )
  .put(
    authenticateJWT,
    authorizeRoles(ROLES.AGRONOMIST, ROLES.MANAGER),
    updateSale,
  )
  .delete(
    authenticateJWT,
    authorizeRoles(ROLES.AGRONOMIST, ROLES.MANAGER),
    deleteSale,
  );

export default router;
