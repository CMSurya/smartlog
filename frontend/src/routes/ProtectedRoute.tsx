import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuthStore, selectIsAuthenticated } from "@/store/auth-store";

export function ProtectedRoute() {
  const ok = useAuthStore(selectIsAuthenticated);
  const hydrated = useAuthStore((s) => s.hydrated);
  const loc = useLocation();

  if (!hydrated) return null;
  if (!ok) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  return <Outlet />;
}

export function PublicOnlyRoute() {
  const ok = useAuthStore(selectIsAuthenticated);
  const hydrated = useAuthStore((s) => s.hydrated);

  if (!hydrated) return null;
  if (ok) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
