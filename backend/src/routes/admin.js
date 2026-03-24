import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  createOrganization,
  getAdminSummary,
  listAdminOrganizations,
  listAdminUsers,
  updateAdminUser,
} from "../controllers/adminController.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/summary", getAdminSummary);
router.get("/users", listAdminUsers);
router.patch("/users/:userId", updateAdminUser);
router.get("/organizations", listAdminOrganizations);
router.post("/organizations", createOrganization);

export default router;
