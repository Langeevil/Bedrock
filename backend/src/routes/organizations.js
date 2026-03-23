import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import requirePermission from "../middlewares/requirePermission.js";
import {
  getCurrentOrganization,
  listCurrentOrganizationMembers,
  updateCurrentOrganizationMemberRole,
} from "../controllers/organizationController.js";
import { PERMISSIONS } from "../auth/accessControl.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/current", getCurrentOrganization);
router.get(
  "/current/members",
  requirePermission(PERMISSIONS.ORGANIZATION_VIEW),
  listCurrentOrganizationMembers
);
router.patch(
  "/current/members/:userId/role",
  requirePermission(PERMISSIONS.ORGANIZATION_MANAGE_MEMBERS),
  updateCurrentOrganizationMemberRole
);

export default router;
