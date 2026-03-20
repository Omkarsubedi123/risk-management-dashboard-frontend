import React from "react";
import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const access =
    localStorage.getItem("access") || sessionStorage.getItem("access");
  const role =
    localStorage.getItem("role") || sessionStorage.getItem("role");

  if (!access) return <Navigate to="/login" replace />;
  if (role !== "AD") return <Navigate to="/login" replace />;

  return children;
};

export default AdminRoute;