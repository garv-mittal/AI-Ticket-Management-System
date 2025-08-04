import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

function CheckAuth({ children, protectedRoute }) {
  const [checking, setChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
    }
    setChecking(false); // auth check done
  }, []);

  if (checking) return <div>Loading...</div>;

  if (protectedRoute && !isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (!protectedRoute && isAuthenticated) {
    return <Navigate to="/" />;
  }

  return children;
}

export default CheckAuth;
