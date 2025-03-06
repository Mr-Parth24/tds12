// src/context/AuthContext.jsx - Enhanced with Remember Me

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  observeAuthState, 
  loginWithEmail, 
  signInWithGoogle, 
  registerUser, 
  logoutUser, 
  getUserRole, 
  getOrgCode,
  resetPassword,
  updateUserProfile,
  generateOrgCode,
  validateOrgCode,
  ROLES
} from '../firebase/auth';

// Create auth context
const AuthContext = createContext();

// Local storage keys
const USER_EMAIL_KEY = 'tds_user_email';
const REMEMBER_ME_KEY = 'tds_remember_me';

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    user: null,
    role: null,
    organizationCode: null,
    isAuthenticated: false,
    loading: true,
    error: null,
    rememberMe: localStorage.getItem(REMEMBER_ME_KEY) === 'true' || false,
  });

  useEffect(() => {
    console.log("Setting up auth state observer");
    
    // Set up auth state observer
    const unsubscribe = observeAuthState(async (authData) => {
      if (authData.user) {
        // Use the data directly from the authData object that now includes role and organizationCode
        console.log("Auth observer detected user:", authData.user.email, "with role:", authData.role);
        
        // Remember email if rememberMe is enabled
        if (authState.rememberMe) {
          localStorage.setItem(USER_EMAIL_KEY, authData.user.email);
        }
        
        setAuthState(prev => ({
          ...prev,
          user: authData.user,
          role: authData.role,
          organizationCode: authData.organizationCode,
          isAuthenticated: true,
          loading: false,
          error: null,
        }));
      } else {
        console.log("Auth observer detected no user");
        
        // Don't clear remembered email if rememberMe is enabled
        if (!authState.rememberMe) {
          localStorage.removeItem(USER_EMAIL_KEY);
        }
        
        setAuthState(prev => ({
          ...prev,
          user: null,
          role: null,
          organizationCode: null,
          isAuthenticated: false,
          loading: false,
          error: null,
        }));
      }
    });

    return () => unsubscribe(); // Cleanup subscription
  }, [authState.rememberMe]);

  // Get remembered email
  const getRememberedEmail = () => {
    return localStorage.getItem(USER_EMAIL_KEY) || '';
  };

  // Set remember me option
  const setRememberMe = (remember) => {
    console.log("Setting remember me:", remember);
    localStorage.setItem(REMEMBER_ME_KEY, remember);
    setAuthState(prev => ({ ...prev, rememberMe: remember }));
  };

  // Login with email and password
  const login = async (email, password, rememberMe = false) => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));

    // Update rememberMe setting
    setRememberMe(rememberMe);

    // Remember email if rememberMe is true
    if (rememberMe) {
      localStorage.setItem(USER_EMAIL_KEY, email);
    } else {
      localStorage.removeItem(USER_EMAIL_KEY);
    }

    const result = await loginWithEmail(email, password);

    if (result.error) {
      console.error("Login error:", result.error);
      setAuthState((prev) => ({ ...prev, loading: false, error: result.error }));
      return false;
    }

    console.log("Login successful, role:", result.role);
    
    // Use the role and organizationCode from the result directly
    setAuthState((prev) => ({
      ...prev,
      user: result.user,
      role: result.role,
      organizationCode: result.organizationCode,
      isAuthenticated: true,
      loading: false,
    }));

    return true;
  };

  // Login with Google
  const loginWithGooglePopup = async (selectedRole = ROLES.USER, organizationCode = null) => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));

    const result = await signInWithGoogle(selectedRole, organizationCode);

    if (result.error) {
      console.error("Google login error:", result.error);
      setAuthState((prev) => ({ ...prev, loading: false, error: result.error }));
      return false;
    }

    console.log("Google login successful, role:", result.role);
    
    // Use the role and organizationCode from the result directly
    setAuthState((prev) => ({
      ...prev,
      user: result.user,
      role: result.role,
      organizationCode: result.organizationCode,
      isAuthenticated: true,
      loading: false,
    }));

    // If remember me is set, store email
    if (authState.rememberMe && result.user.email) {
      localStorage.setItem(USER_EMAIL_KEY, result.user.email);
    }

    return true;
  };

  // Register new user
  const register = async (email, password, role, organizationCode = null) => {
    // Validate role to ensure consistency
    if (role !== ROLES.ADMIN && role !== ROLES.USER) {
      console.warn(`Invalid role "${role}" provided for registration, defaulting to User`);
      role = ROLES.USER;
    }
    
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));

    const result = await registerUser(email, password, role, organizationCode);

    if (result.error) {
      console.error("Registration error:", result.error);
      setAuthState((prev) => ({ ...prev, loading: false, error: result.error }));
      return false;
    }

    console.log("Registration successful, role:", result.role);
    
    // Use the role and organizationCode from the result directly
    setAuthState((prev) => ({
      ...prev,
      user: result.user,
      role: result.role,
      organizationCode: result.organizationCode,
      isAuthenticated: true,
      loading: false,
    }));

    return true;
  };

  // Send password reset email
  const forgotPassword = async (email) => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));

    const result = await resetPassword(email);

    setAuthState((prev) => ({ 
      ...prev, 
      loading: false,
      error: result.error ? result.error : null
    }));

    return result.success;
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));

    const result = await updateUserProfile(profileData);

    setAuthState((prev) => ({ 
      ...prev, 
      loading: false,
      error: result.error ? result.error : null
    }));

    return result.success;
  };

  // Generate new organization code (for admins)
  const generateNewOrgCode = async () => {
    if (!authState.user || authState.role !== ROLES.ADMIN) {
      return { success: false, error: "Only admins can generate organization codes" };
    }

    setAuthState((prev) => ({ ...prev, loading: true, error: null }));

    const result = await generateOrgCode(authState.user.uid);

    if (result.error) {
      setAuthState((prev) => ({ ...prev, loading: false, error: result.error }));
      return { success: false, error: result.error };
    }

    // Update the organization code in auth state
    setAuthState((prev) => ({
      ...prev,
      organizationCode: result.organizationCode,
      loading: false
    }));

    return { success: true, organizationCode: result.organizationCode };
  };

  // Validate organization code
  const validateOrganizationCode = async (code) => {
    return await validateOrgCode(code);
  };

  // Logout user
  const logout = async () => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));

    const result = await logoutUser();

    if (result.error) {
      console.error("Logout error:", result.error);
      setAuthState((prev) => ({ ...prev, loading: false, error: result.error }));
      return false;
    }

    console.log("Logout successful");
    
    // Clear localStorage if remember me is not enabled
    if (!authState.rememberMe) {
      localStorage.removeItem(USER_EMAIL_KEY);
    }
    
    setAuthState(prev => ({
      ...prev,
      user: null,
      role: null,
      organizationCode: null,
      isAuthenticated: false,
      loading: false,
      error: null,
    }));

    return true;
  };

  // Clear error
  const clearError = () => {
    setAuthState((prev) => ({ ...prev, error: null }));
  };

  // Refresh organization code
  const refreshOrgCode = async () => {
    if (!authState.user) return null;
    
    try {
      const orgCode = await getOrgCode(authState.user.uid);
      
      // Update the organization code in auth state
      setAuthState((prev) => ({
        ...prev,
        organizationCode: orgCode
      }));
      
      console.log("Organization code refreshed:", orgCode);
      return orgCode;
    } catch (err) {
      console.error("Error refreshing organization code:", err);
      return null;
    }
  };

  // Context value
  const value = {
    user: authState.user,
    role: authState.role,
    organizationCode: authState.organizationCode,
    isAuthenticated: authState.isAuthenticated,
    loading: authState.loading,
    error: authState.error,
    rememberMe: authState.rememberMe,
    login,
    loginWithGoogle: loginWithGooglePopup,
    register,
    logout,
    clearError,
    refreshOrgCode,
    forgotPassword,
    updateProfile,
    generateNewOrgCode,
    validateOrganizationCode,
    getRememberedEmail,
    setRememberMe
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};