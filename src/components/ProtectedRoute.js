import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../App";
import { getToken } from "../utils/auth";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const token = getToken();

  if (!token || !isAuthenticated) {
    // Redirect to signin and save the location they were trying to access
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
