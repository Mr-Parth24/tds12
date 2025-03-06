import React, { useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Container, Box } from '@mui/material';

// Import pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import CreateProject from './pages/CreateProject';
import ManageEndpoints from './pages/ManageEndpoints';
import EndpointForm from './pages/EndpointForm';
import ForgotPassword from './pages/ForgotPassword';

// Import Layout Components
import Header from './layout/Header';
import Footer from './layout/Footer';
import MainNavigation from './layout/MainNavigation'; // New navigation component

// Import auth provider & routes
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import { ROLES } from './firebase/auth';

// Import theme
import theme from './styles/theme';

function App() {
  // Log when app starts
  useEffect(() => {
    console.log('App initialized - Role-based routing enabled');
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            <Box sx={{ display: 'flex', flexGrow: 1 }}>
              <MainNavigation />
              <Container 
                maxWidth="lg" 
                sx={{ 
                  mt: 4, 
                  mb: 4, 
                  flexGrow: 1,
                  transition: 'all 0.3s ease'
                }}
              >
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  
                  {/* User Protected Routes */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  
                  {/* Admin-only Routes */}
                  <Route path="/admin-dashboard" element={
                    <ProtectedRoute roleRequired={ROLES.ADMIN}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } />
                  
                  {/* General Protected Routes */}
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } />

                  {/* Admin-only Project Creation */}
                  <Route path="/projects/create" element={
                    <ProtectedRoute roleRequired={ROLES.ADMIN}>
                      <CreateProject />
                    </ProtectedRoute>
                  } />
                  
                  {/* Project & Endpoints - Role-specific permissions can be managed in components */}
                  <Route path="/projects/:projectId/endpoints" element={
                    <ProtectedRoute>
                      <ManageEndpoints />
                    </ProtectedRoute>
                  } />
                  <Route path="/projects/:projectId/endpoints/create" element={
                    <ProtectedRoute>
                      <EndpointForm />
                    </ProtectedRoute>
                  } />
                  <Route path="/projects/:projectId/endpoints/:endpointId/edit" element={
                    <ProtectedRoute>
                      <EndpointForm />
                    </ProtectedRoute>
                  } />
                  
                  {/* Catch-all route to redirect to appropriate dashboard */}
                  <Route path="*" element={
                    <ProtectedRoute>
                      {({role}) => 
                        <Navigate to={role === ROLES.ADMIN ? "/admin-dashboard" : "/dashboard"} replace />
                      }
                    </ProtectedRoute>
                  } />
                </Routes>
              </Container>
            </Box>
            <Footer />
          </Box>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;