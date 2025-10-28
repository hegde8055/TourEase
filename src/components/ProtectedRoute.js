import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../App";

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    // Redirect to signin and save the location they were trying to access
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
