import { Navigate } from "react-router-dom";
import { canAccessAdminArea } from "../../../shared/authSession";

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("auth_token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!canAccessAdminArea()) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
