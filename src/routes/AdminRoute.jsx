// src/routes/AdminRoute.jsx
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, CircularProgress } from '@mui/material';
import { ROLES } from '../firebase/auth'; // Import ROLES constant

const AdminRoute = ({ children }) => {
  const { isAuthenticated, loading, role } = useAuth();

  // Debug logging
  useEffect(() => {
    console.log(`AdminRoute - Auth Status: ${isAuthenticated ? 'Authenticated' : 'Not Authenticated'}`);
    console.log(`AdminRoute - User role: ${role}`);
  }, [isAuthenticated, role]);

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
    console.log('AdminRoute - Redirecting to login: Not authenticated');
    return <Navigate to="/login" replace />;
  }

  // Only allow access to admin users
  if (role !== ROLES.ADMIN) {
    console.log(`AdminRoute - Redirecting to dashboard: User is not an Admin (role: ${role})`);
    return <Navigate to="/dashboard" replace />;
  }

  console.log('AdminRoute - Access granted: User is Admin');
  return children;
};

export default AdminRoute;