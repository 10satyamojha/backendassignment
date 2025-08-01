// components/PrivateRoute.js
import React from "react";
import { Navigate } from "react-router-dom";

// Dummy auth checker – replace with your auth logic
const isAuthenticated = () => {
  return localStorage.getItem("token") !== null;
};

const PrivateRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
