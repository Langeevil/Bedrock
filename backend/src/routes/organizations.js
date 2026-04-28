import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import requirePermission from "../middlewares/requirePermission.js";
import {
  addCurrentOrganizationMember,
  getCurrentOrganization,
  getCurrentOrganizationTenancy,
  listCurrentOrganizationMembers,
  listCurrentOrganizationDirectory,
  updateCurrentOrganizationTenancy,
  updateCurrentOrganizationMemberRole,
} from "../controllers/organizationController.js";
import { PERMISSIONS } from "../auth/accessControl.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/current", getCurrentOrganization);
router.get(
  "/current/directory",
  requirePermission(PERMISSIONS.USER_VIEW_DIRECTORY),
  listCurrentOrganizationDirectory
);
router.get(
  "/current/tenancy",
  requirePermission(PERMISSIONS.ORGANIZATION_VIEW),
  getCurrentOrganizationTenancy
);
router.patch(
  "/current/tenancy",
  requirePermission(PERMISSIONS.ORGANIZATION_MANAGE),
  updateCurrentOrganizationTenancy
);
router.get(
  "/current/members",
  requirePermission(PERMISSIONS.ORGANIZATION_VIEW),
  listCurrentOrganizationMembers
);
router.post(
  "/current/members",
  requirePermission(PERMISSIONS.ORGANIZATION_MANAGE_MEMBERS),
  addCurrentOrganizationMember
);
router.patch(
  "/current/members/:userId/role",
  requirePermission(PERMISSIONS.ORGANIZATION_MANAGE_MEMBERS),
  updateCurrentOrganizationMemberRole
);

export default router;
