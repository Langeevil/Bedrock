import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import requirePermission from "../middlewares/requirePermission.js";
import { PERMISSIONS } from "../auth/accessControl.js";
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
router.get("/users", requirePermission(PERMISSIONS.ORGANIZATION_MANAGE_MEMBERS), listAdminUsers);
router.patch("/users/:userId", requirePermission(PERMISSIONS.ORGANIZATION_MANAGE_MEMBERS), updateAdminUser);
router.get("/organizations", requirePermission(PERMISSIONS.ORGANIZATION_VIEW), listAdminOrganizations);
router.post("/organizations", requirePermission(PERMISSIONS.ORGANIZATION_MANAGE), createOrganization);

export default router;
