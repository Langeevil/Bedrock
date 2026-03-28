import { PERMISSIONS, hasPermission } from "../auth/accessControl.js";

const DISCIPLINE_MANAGER_ROLES = new Set([
  "organization_owner",
  "organization_admin",
  "coordinator",
  "professor",
]);

function sameOrganization(auth, resource) {
  return Boolean(
    auth?.organization?.id &&
      resource?.organization_id &&
      Number(auth.organization.id) === Number(resource.organization_id)
  );
}

function isOwner(auth, resource) {
  return Number(auth?.userId) === Number(resource?.user_id);
}

export function canListAllDisciplines(auth) {
  return hasPermission(auth, PERMISSIONS.DISCIPLINE_MANAGE_ALL);
}

export function canCreateDiscipline(auth) {
  return hasPermission(auth, PERMISSIONS.DISCIPLINE_CREATE);
}

export function canAccessDiscipline(auth, discipline) {
  if (!discipline || !sameOrganization(auth, discipline)) return false;
  if (hasPermission(auth, PERMISSIONS.DISCIPLINE_MANAGE_ALL)) return true;
  return Boolean(
    discipline.current_membership_role ||
      discipline.current_membership_status === "active" ||
      isOwner(auth, discipline)
  );
}

export function canMutateDiscipline(auth, discipline) {
  if (!discipline || !sameOrganization(auth, discipline)) return false;
  if (hasPermission(auth, PERMISSIONS.DISCIPLINE_MANAGE_ALL)) return true;
  if (isOwner(auth, discipline)) return true;
  return DISCIPLINE_MANAGER_ROLES.has(String(discipline.current_membership_role || ""));
}

export function canListAllProjects(auth) {
  return hasPermission(auth, PERMISSIONS.PROJECT_MANAGE_ALL);
}

export function canCreateProject(auth) {
  return hasPermission(auth, PERMISSIONS.PROJECT_CREATE);
}

export function canAccessProject(auth, project) {
  if (!project || !sameOrganization(auth, project)) return false;
  if (hasPermission(auth, PERMISSIONS.PROJECT_MANAGE_ALL)) return true;
  return isOwner(auth, project);
}

export function canMutateProject(auth, project) {
  return canAccessProject(auth, project);
}
