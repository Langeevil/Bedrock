export const SYSTEM_ROLES = {
  SYSTEM_ADMIN: "system_admin",
};

export const ORGANIZATION_ROLES = {
  ORGANIZATION_OWNER: "organization_owner",
  ORGANIZATION_ADMIN: "organization_admin",
  COORDINATOR: "coordinator",
  PROFESSOR: "professor",
  STUDENT: "student",
  EXTERNAL_PARTNER: "external_partner",
};

export const SELF_SERVICE_ORGANIZATION_ROLES = new Set([
  ORGANIZATION_ROLES.PROFESSOR,
  ORGANIZATION_ROLES.STUDENT,
  ORGANIZATION_ROLES.EXTERNAL_PARTNER,
]);

export const LEGACY_ROLE_ALIASES = {
  aluno: ORGANIZATION_ROLES.STUDENT,
  empresa: ORGANIZATION_ROLES.EXTERNAL_PARTNER,
  professor: ORGANIZATION_ROLES.PROFESSOR,
  student: ORGANIZATION_ROLES.STUDENT,
  external_partner: ORGANIZATION_ROLES.EXTERNAL_PARTNER,
  coordinator: ORGANIZATION_ROLES.COORDINATOR,
  organization_admin: ORGANIZATION_ROLES.ORGANIZATION_ADMIN,
  organization_owner: ORGANIZATION_ROLES.ORGANIZATION_OWNER,
};

export const PERMISSIONS = {
  SYSTEM_ADMIN: "system:admin",
  ORGANIZATION_VIEW: "organization:view",
  ORGANIZATION_MANAGE: "organization:manage",
  ORGANIZATION_MANAGE_MEMBERS: "organization:manage_members",
  ORGANIZATION_ASSIGN_PRIVILEGED_ROLE: "organization:assign_privileged_role",
  USER_VIEW_DIRECTORY: "user:view_directory",
  PROFILE_UPDATE_SELF: "profile:update_self",
  DISCIPLINE_CREATE: "discipline:create",
  DISCIPLINE_MANAGE_ALL: "discipline:manage_all",
  PROJECT_CREATE: "project:create",
  PROJECT_MANAGE_ALL: "project:manage_all",
  CHAT_ACCESS: "chat:access",
  CHAT_CREATE_DIRECT: "chat:create_direct",
  CHAT_CREATE_GROUP: "chat:create_group",
  CHAT_CREATE_CHANNEL: "chat:create_channel",
  CHAT_MANAGE_ALL: "chat:manage_all",
};

const ALL_PERMISSIONS = new Set(Object.values(PERMISSIONS));

const ORG_ROLE_PERMISSIONS = {
  [ORGANIZATION_ROLES.ORGANIZATION_OWNER]: new Set([
    PERMISSIONS.ORGANIZATION_VIEW,
    PERMISSIONS.ORGANIZATION_MANAGE,
    PERMISSIONS.ORGANIZATION_MANAGE_MEMBERS,
    PERMISSIONS.ORGANIZATION_ASSIGN_PRIVILEGED_ROLE,
    PERMISSIONS.USER_VIEW_DIRECTORY,
    PERMISSIONS.PROFILE_UPDATE_SELF,
    PERMISSIONS.DISCIPLINE_CREATE,
    PERMISSIONS.DISCIPLINE_MANAGE_ALL,
    PERMISSIONS.PROJECT_CREATE,
    PERMISSIONS.PROJECT_MANAGE_ALL,
    PERMISSIONS.CHAT_ACCESS,
    PERMISSIONS.CHAT_CREATE_DIRECT,
    PERMISSIONS.CHAT_CREATE_GROUP,
    PERMISSIONS.CHAT_CREATE_CHANNEL,
    PERMISSIONS.CHAT_MANAGE_ALL,
  ]),
  [ORGANIZATION_ROLES.ORGANIZATION_ADMIN]: new Set([
    PERMISSIONS.ORGANIZATION_VIEW,
    PERMISSIONS.ORGANIZATION_MANAGE_MEMBERS,
    PERMISSIONS.USER_VIEW_DIRECTORY,
    PERMISSIONS.PROFILE_UPDATE_SELF,
    PERMISSIONS.DISCIPLINE_CREATE,
    PERMISSIONS.DISCIPLINE_MANAGE_ALL,
    PERMISSIONS.PROJECT_CREATE,
    PERMISSIONS.PROJECT_MANAGE_ALL,
    PERMISSIONS.CHAT_ACCESS,
    PERMISSIONS.CHAT_CREATE_DIRECT,
    PERMISSIONS.CHAT_CREATE_GROUP,
    PERMISSIONS.CHAT_CREATE_CHANNEL,
    PERMISSIONS.CHAT_MANAGE_ALL,
  ]),
  [ORGANIZATION_ROLES.COORDINATOR]: new Set([
    PERMISSIONS.ORGANIZATION_VIEW,
    PERMISSIONS.USER_VIEW_DIRECTORY,
    PERMISSIONS.PROFILE_UPDATE_SELF,
    PERMISSIONS.DISCIPLINE_CREATE,
    PERMISSIONS.DISCIPLINE_MANAGE_ALL,
    PERMISSIONS.PROJECT_CREATE,
    PERMISSIONS.PROJECT_MANAGE_ALL,
    PERMISSIONS.CHAT_ACCESS,
    PERMISSIONS.CHAT_CREATE_DIRECT,
    PERMISSIONS.CHAT_CREATE_GROUP,
    PERMISSIONS.CHAT_CREATE_CHANNEL,
  ]),
  [ORGANIZATION_ROLES.PROFESSOR]: new Set([
    PERMISSIONS.ORGANIZATION_VIEW,
    PERMISSIONS.USER_VIEW_DIRECTORY,
    PERMISSIONS.PROFILE_UPDATE_SELF,
    PERMISSIONS.DISCIPLINE_CREATE,
    PERMISSIONS.PROJECT_CREATE,
    PERMISSIONS.CHAT_ACCESS,
    PERMISSIONS.CHAT_CREATE_DIRECT,
    PERMISSIONS.CHAT_CREATE_GROUP,
  ]),
  [ORGANIZATION_ROLES.STUDENT]: new Set([
    PERMISSIONS.ORGANIZATION_VIEW,
    PERMISSIONS.PROFILE_UPDATE_SELF,
    PERMISSIONS.USER_VIEW_DIRECTORY,
    PERMISSIONS.PROJECT_CREATE,
    PERMISSIONS.CHAT_ACCESS,
    PERMISSIONS.CHAT_CREATE_DIRECT,
    PERMISSIONS.CHAT_CREATE_GROUP,
  ]),
  [ORGANIZATION_ROLES.EXTERNAL_PARTNER]: new Set([
    PERMISSIONS.ORGANIZATION_VIEW,
    PERMISSIONS.PROFILE_UPDATE_SELF,
    PERMISSIONS.USER_VIEW_DIRECTORY,
    PERMISSIONS.CHAT_ACCESS,
    PERMISSIONS.CHAT_CREATE_DIRECT,
  ]),
};

export function normalizeOrganizationRole(role) {
  const key = String(role || "").trim().toLowerCase();
  return LEGACY_ROLE_ALIASES[key] || null;
}

export function isSystemAdmin(auth) {
  return auth?.systemRole === SYSTEM_ROLES.SYSTEM_ADMIN;
}

export function getPermissionsForAuth(auth) {
  if (isSystemAdmin(auth)) {
    return new Set(ALL_PERMISSIONS);
  }

  const membershipRole = normalizeOrganizationRole(auth?.membership?.role);
  if (!membershipRole) {
    return new Set();
  }

  return new Set(ORG_ROLE_PERMISSIONS[membershipRole] || []);
}

export function hasPermission(auth, permission) {
  if (!permission) return true;
  return getPermissionsForAuth(auth).has(permission);
}

export function canAssignOrganizationRole(actorAuth, targetRole) {
  if (isSystemAdmin(actorAuth)) return true;

  const actorRole = normalizeOrganizationRole(actorAuth?.membership?.role);
  const nextRole = normalizeOrganizationRole(targetRole);

  if (!actorRole || !nextRole) return false;

  if (actorRole === ORGANIZATION_ROLES.ORGANIZATION_OWNER) {
    return true;
  }

  if (actorRole === ORGANIZATION_ROLES.ORGANIZATION_ADMIN) {
    return ![
      ORGANIZATION_ROLES.ORGANIZATION_OWNER,
      ORGANIZATION_ROLES.ORGANIZATION_ADMIN,
    ].includes(nextRole);
  }

  return false;
}

export function buildAuthSummary(auth) {
  const permissions = [...getPermissionsForAuth(auth)].sort();

  return {
    user_id: auth.userId,
    system_role: auth.systemRole,
    organization: auth.organization,
    membership: auth.membership,
    effective_role: auth.effectiveRole,
    permissions,
  };
}
