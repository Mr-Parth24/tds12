import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, CircularProgress } from '@mui/material';

const ProtectedRoute = ({ children, roleRequired }) => {
  const { isAuthenticated, loading, role } = useAuth();

  // Show a loading spinner while checking authentication
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Role-based access: if a role is required and user does not match, redirect them
  if (roleRequired && role !== roleRequired) {
    return <Navigate to={role === "Admin" ? "/admin-dashboard" : "/dashboard"} replace />;
  }

  return children;
};

export default ProtectedRoute;
