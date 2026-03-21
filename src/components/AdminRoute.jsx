import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const location = useLocation();

  const access =
    localStorage.getItem("access") || sessionStorage.getItem("access");

  const role =
    localStorage.getItem("role") || sessionStorage.getItem("role");

  if (!access) {
    return <Navigate to="/login" replace state={{ forceLogin: true }} />;
  }

  if (!role) {
    return <Navigate to="/login" replace state={{ forceLogin: true }} />;
  }

  if (role !== "AD") {
    return <Navigate to="/login" replace state={{ forceLogin: true }} />;
  }

  return children;
};

export default AdminRoute;