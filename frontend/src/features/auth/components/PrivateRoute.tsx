import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getMe } from "../services/authService";
import {
  canAccessAdminArea,
  canAccessAdminAreaForUser,
  canAccessDirectory,
  canAccessDirectoryForUser,
  canAccessStatistics,
  canAccessStatisticsForUser,
  clearSessionUser,
  storeSessionUser,
} from "../../../shared/authSession";

export default function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("auth_token");

  useEffect(() => {
    if (!token) {
      return;
    }

    let active = true;

    async function syncSession() {
      try {
        const user = await getMe();
        if (!active) return;
        storeSessionUser(user);
      } catch (error) {
        if (!active) return;
        console.error("Falha ao sincronizar sessao:", error);
      }
    }

    syncSession();
    return () => {
      active = false;
    };
  }, [token]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export function AdminOnlyRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("auth_token");
  const [state, setState] = useState(() => ({
    checking: true,
    allowed: canAccessAdminArea(),
  }));

  useEffect(() => {
    if (!token) {
      setState({ checking: false, allowed: false });
      return;
    }

    let active = true;

    async function syncAndAuthorize() {
      if (canAccessAdminArea()) {
        if (active) {
          setState({ checking: false, allowed: true });
        }
        return;
      }

      try {
        const user = await getMe();
        if (!active) return;
        storeSessionUser(user);
        setState({
          checking: false,
          allowed: canAccessAdminAreaForUser(user),
        });
      } catch (error) {
        if (!active) return;
        console.error("Falha ao verificar acesso administrativo:", error);
        clearSessionUser();
        setState({ checking: false, allowed: false });
      }
    }

    syncAndAuthorize();
    return () => {
      active = false;
    };
  }, [token]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (state.checking) {
    return null;
  }

  if (!state.allowed) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function RoleProtectedRoute({
  children,
  hasAccess,
  hasAccessForUser,
}: {
  children: React.ReactNode;
  hasAccess: () => boolean;
  hasAccessForUser: (user: Awaited<ReturnType<typeof getMe>>) => boolean;
}) {
  const token = localStorage.getItem("auth_token");
  const [state, setState] = useState(() => ({
    checking: true,
    allowed: hasAccess(),
  }));

  useEffect(() => {
    if (!token) {
      setState({ checking: false, allowed: false });
      return;
    }

    let active = true;

    async function syncAndAuthorize() {
      if (hasAccess()) {
        if (active) {
          setState({ checking: false, allowed: true });
        }
        return;
      }

      try {
        const user = await getMe();
        if (!active) return;
        storeSessionUser(user);
        setState({
          checking: false,
          allowed: hasAccessForUser(user),
        });
      } catch (error) {
        if (!active) return;
        console.error("Falha ao verificar acesso por papel:", error);
        clearSessionUser();
        setState({ checking: false, allowed: false });
      }
    }

    syncAndAuthorize();
    return () => {
      active = false;
    };
  }, [token, hasAccess, hasAccessForUser]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (state.checking) {
    return null;
  }

  if (!state.allowed) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export function DirectoryOnlyRoute({ children }: { children: React.ReactNode }) {
  return (
    <RoleProtectedRoute
      hasAccess={canAccessDirectory}
      hasAccessForUser={canAccessDirectoryForUser}
    >
      {children}
    </RoleProtectedRoute>
  );
}

export function StatisticsOnlyRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleProtectedRoute
      hasAccess={canAccessStatistics}
      hasAccessForUser={canAccessStatisticsForUser}
    >
      {children}
    </RoleProtectedRoute>
  );
}
