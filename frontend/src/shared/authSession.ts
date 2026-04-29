const ADMIN_ROLES = new Set(["organization_owner", "organization_admin"]);
const ELEVATED_WORKSPACE_ROLES = new Set([
  "organization_owner",
  "organization_admin",
  "coordinator",
  "professor",
]);
const AUTH_SESSION_EVENT = "bedrock-auth-session-change";
const MANAGEMENT_VISIBILITY_KEY = "bedrock_show_management_navigation";

type SessionUser = {
  nome?: string;
  email?: string;
  role?: string;
  system_role?: string | null;
  organization?: { id: number; name: string; slug: string } | null;
};

export function getStoredUserRole() {
  return localStorage.getItem("user_role") || "";
}

export function getStoredSystemRole() {
  return localStorage.getItem("user_system_role") || "";
}

export function canAccessAdminArea() {
  return (
    getStoredSystemRole() === "system_admin" ||
    ADMIN_ROLES.has(getStoredUserRole())
  );
}

export function canAccessElevatedWorkspace() {
  return (
    getStoredSystemRole() === "system_admin" ||
    ELEVATED_WORKSPACE_ROLES.has(getStoredUserRole())
  );
}

export function canAccessDirectory() {
  return canAccessElevatedWorkspace();
}

export function canAccessStatistics() {
  return canAccessElevatedWorkspace();
}

export function canAccessAdminAreaForUser(user: SessionUser | null | undefined) {
  if (!user) return false;

  return (
    user.system_role === "system_admin" ||
    ADMIN_ROLES.has(user.role || "")
  );
}

export function canAccessElevatedWorkspaceForUser(
  user: SessionUser | null | undefined,
) {
  if (!user) return false;

  return (
    user.system_role === "system_admin" ||
    ELEVATED_WORKSPACE_ROLES.has(user.role || "")
  );
}

export function canAccessDirectoryForUser(user: SessionUser | null | undefined) {
  return canAccessElevatedWorkspaceForUser(user);
}

export function canAccessStatisticsForUser(
  user: SessionUser | null | undefined,
) {
  return canAccessElevatedWorkspaceForUser(user);
}

export function shouldShowManagementNavigation() {
  const value = localStorage.getItem(MANAGEMENT_VISIBILITY_KEY);
  return value === null ? true : value === "true";
}

export function setManagementNavigationVisibility(visible: boolean) {
  localStorage.setItem(MANAGEMENT_VISIBILITY_KEY, String(visible));
  notifyAuthSessionChange();
}

function notifyAuthSessionChange() {
  window.dispatchEvent(new Event(AUTH_SESSION_EVENT));
}

export function subscribeAuthSession(listener: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (
      !event.key ||
      event.key.startsWith("user_") ||
      event.key === "auth_token" ||
      event.key === MANAGEMENT_VISIBILITY_KEY
    ) {
      listener();
    }
  };

  window.addEventListener(AUTH_SESSION_EVENT, listener);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(AUTH_SESSION_EVENT, listener);
    window.removeEventListener("storage", handleStorage);
  };
}

export function storeSessionUser(user: SessionUser) {
  localStorage.setItem("user_nome", user.nome || "");
  localStorage.setItem("user_email", user.email || "");
  localStorage.setItem("user_role", user.role || "");
  localStorage.setItem("user_system_role", user.system_role || "");
  localStorage.setItem("user_org_name", user.organization?.name || "");
  localStorage.setItem("user_org_slug", user.organization?.slug || "");
  notifyAuthSessionChange();
}

export function clearSessionUser() {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("user_nome");
  localStorage.removeItem("user_email");
  localStorage.removeItem("user_role");
  localStorage.removeItem("user_system_role");
  localStorage.removeItem("user_org_name");
  localStorage.removeItem("user_org_slug");
  notifyAuthSessionChange();
}
