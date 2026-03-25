import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider.jsx";

function roleToDashboard(role) {
  const r = String(role || "").toLowerCase();
  if (r === "admin") return "/admin-dashboard";
  if (r === "manager") return "/manager-dashboard";
  return "/employee-dashboard";
}

export default function ProtectedRoute({ allowedRoles, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div style={{ padding: 16 }}>Loading...</div>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  const role = String(user.role || "").toLowerCase();
  if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    const ok = allowedRoles.map((x) => String(x).toLowerCase()).includes(role);
    if (!ok) return <Navigate to={roleToDashboard(role)} replace />;
  }

  return children;
}

