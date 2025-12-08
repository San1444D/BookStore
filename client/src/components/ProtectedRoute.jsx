// components/ProtectedRoute.jsx
import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AppContext } from "../context/AppContext";


const ProtectedRoute = ({ allowedRoles }) => {
  const { token, role } = useContext(AppContext); // role is lowercase: "admin" | "seller" | "user"

  if (!token) {
    // not logged in → send to home (or show login)
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // logged in but wrong role
    if (role === "admin") return <Navigate to="/admin" replace />;
    if (role === "seller") return <Navigate to="/seller" replace />;
    if (role === "user") return <Navigate to="/" replace />;
    
  }

  // ok
  return <Outlet />;
};

export default ProtectedRoute;
