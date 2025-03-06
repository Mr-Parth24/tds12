// src/pages/Register.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  Paper,
  useTheme,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Fade,
  Zoom,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import CodeOutlinedIcon from '@mui/icons-material/CodeOutlined';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../firebase/auth';

const Register = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { 
    register, 
    loginWithGoogle, 
    error, 
    loading, 
    clearError, 
    isAuthenticated, 
    role,
    validateOrganizationCode
  } = useAuth();

  // Google sign-in dialog state
  const [googleDialogOpen, setGoogleDialogOpen] = useState(false);
  const [googleLoginData, setGoogleLoginData] = useState({
    role: ROLES.USER,
    organizationCode: ''
  });

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: ROLES.USER,
    organizationCode: '',
    rememberMe: true
  });

  const [passwordError, setPasswordError] = useState('');
  const [orgCodeError, setOrgCodeError] = useState('');
  const [validatingOrgCode, setValidatingOrgCode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  // Redirect logged-in users
  useEffect(() => {
    if (isAuthenticated) {
      console.log("Register - User already authenticated with role:", role);
      navigate(role === ROLES.ADMIN ? '/admin-dashboard' : '/dashboard');
    }
  }, [isAuthenticated, role, navigate]);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    const newValue = name === 'rememberMe' ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'role') {
      // Update admin status based on selected role
      const isAdminRole = value === ROLES.ADMIN;
      setIsAdmin(isAdminRole);
      console.log(`Role changed to: ${value}, isAdmin: ${isAdminRole}`);
      
      // Clear organization code for admin
      if (isAdminRole) {
        setFormData(prev => ({ ...prev, organizationCode: '' }));
        setOrgCodeError('');
      }
    }

    if (name === 'confirmPassword' || name === 'password') {
      if (name === 'password' && formData.confirmPassword && formData.confirmPassword !== value) {
        setPasswordError('Passwords do not match');
      } else if (name === 'confirmPassword' && formData.password !== value) {
        setPasswordError('Passwords do not match');
      } else {
        setPasswordError('');
      }
    }

    // Clear org code error when user types
    if (name === 'organizationCode') {
      setOrgCodeError('');
    }

    if (error) clearError();
  };

  const handleGoogleDialogChange = (e) => {
    const { name, value } = e.target;
    setGoogleLoginData(prev => ({ ...prev, [name]: value }));
    
    // Clear organization code for admin role
    if (name === 'role' && value === ROLES.ADMIN) {
      setGoogleLoginData(prev => ({ ...prev, organizationCode: '' }));
    }
  };

  // Validate organization code
  const validateOrgCode = async (code) => {
    if (!code && formData.role === ROLES.USER) {
      setOrgCodeError('Organization code is required for regular users');
      return false;
    }
    
    if (formData.role === ROLES.ADMIN) {
      return true; // No validation needed for admin
    }
    
    setValidatingOrgCode(true);
    try {
      const result = await validateOrganizationCode(code);
      if (!result.valid) {
        setOrgCodeError(result.error || 'Invalid organization code');
        return false;
      }
      return true;
    } catch (err) {
      setOrgCodeError('Error validating organization code');
      return false;
    } finally {
      setValidatingOrgCode(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    // Validate organization code for non-admin users
    if (formData.role === ROLES.USER) {
      const isValid = await validateOrgCode(formData.organizationCode);
      if (!isValid) return;
    }

    console.log("Attempting to register with role:", formData.role);
    
    // Only include organization code for non-admin users
    const orgCode = formData.role === ROLES.ADMIN ? null : formData.organizationCode;
    
    const success = await register(formData.email, formData.password, formData.role, orgCode);
    
    if (success) {
      console.log("Registration successful, redirecting to appropriate dashboard");
      navigate(formData.role === ROLES.ADMIN ? '/admin-dashboard' : '/dashboard');
    }
  };

  const handleGoogleLoginClick = () => {
    setGoogleDialogOpen(true);
  };

  const handleGoogleRegister = async () => {
    // For Admin role, no organization code is needed
    const role = googleLoginData.role;
    const orgCode = role === ROLES.ADMIN ? null : googleLoginData.organizationCode;
    
    // Validate organization code for non-admin users
    if (role === ROLES.USER && !orgCode) {
      clearError();
      return; // Don't close dialog
    }
    
    setGoogleDialogOpen(false);
    console.log("Attempting Google registration with role:", role);
    
    const success = await loginWithGoogle(role, orgCode);
    if (success) {
      console.log("Google sign-in successful, user role:", role);
      navigate(role === ROLES.ADMIN ? '/admin-dashboard' : '/dashboard');
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#f8f9fc', // Light clean background
        position: 'relative',
      }}
    >
      <Zoom in={true} style={{ transitionDelay: '100ms' }}>
        <Box
          sx={{
            display: 'flex',
            width: '90%',
            maxWidth: '1000px',
            minHeight: '560px',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 5px 20px rgba(0, 0, 0, 0.15)',
            zIndex: 1,
          }}
        >
          {/* Left side - Branding */}
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              width: '45%',
              p: 4,
              background: 'linear-gradient(135deg, #F68B1F 0%, #e85d26 100%)',
              color: '#1E293B',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Dotted pattern overlay */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                opacity: 0.15,
                background: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'1\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'1.5\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'1.5\'/%3E%3C/g%3E%3C/svg%3E")',
              }}
            />

            <Fade in={animationComplete} timeout={800}>
              <Box sx={{ zIndex: 2 }}>
                <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom color="#1a2a41">
                  TDS API
                </Typography>
                
                {/* React logo for example - replace with your actual logo */}
                <Box sx={{ my: 4 }}>
                  <svg viewBox="0 0 100 100" width="120" height="120">
                    <g fill="#00D8FF">
                      <path d="M50,33.33c-12.77,0-24.17,1.83-31.67,4.67c-7.5,2.83-11.67,6.5-11.67,10c0,3.5,4.17,7.17,11.67,10c7.5,2.83,18.9,4.67,31.67,4.67c12.77,0,24.17-1.83,31.67-4.67c7.5-2.83,11.67-6.5,11.67-10c0-3.5-4.17-7.17-11.67-10C74.17,35.17,62.77,33.33,50,33.33z" />
                      <path d="M50,33.33c-12.77,0-24.17,1.83-31.67,4.67c-7.5,2.83-11.67,6.5-11.67,10c0,3.5,4.17,7.17,11.67,10c7.5,2.83,18.9,4.67,31.67,4.67c12.77,0,24.17-1.83,31.67-4.67c7.5-2.83,11.67-6.5,11.67-10c0-3.5-4.17-7.17-11.67-10C74.17,35.17,62.77,33.33,50,33.33z" transform="rotate(60 50 50)" />
                      <path d="M50,33.33c-12.77,0-24.17,1.83-31.67,4.67c-7.5,2.83-11.67,6.5-11.67,10c0,3.5,4.17,7.17,11.67,10c7.5,2.83,18.9,4.67,31.67,4.67c12.77,0,24.17-1.83,31.67-4.67c7.5-2.83,11.67-6.5,11.67-10c0-3.5-4.17-7.17-11.67-10C74.17,35.17,62.77,33.33,50,33.33z" transform="rotate(120 50 50)" />
                      <circle cx="50" cy="50" r="8" />
                    </g>
                  </svg>
                </Box>
                
                <Typography variant="h6" gutterBottom color="#1a2a41">
                  API Management Interface
                </Typography>
                <Typography variant="body1" sx={{ mt: 2, maxWidth: '80%', mx: 'auto', color: '#1a2a41' }}>
                  Join our platform and start creating powerful APIs without writing a single line of code.
                </Typography>

                <Box sx={{ mt: 4 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'medium', color: '#1a2a41' }}>
                    Why create an account?
                  </Typography>
                  <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#1a2a41' }}>
                      ✓ Create and deploy APIs in minutes
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#1a2a41' }}>
                      ✓ Collaborate with team members
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#1a2a41' }}>
                      ✓ Access your projects from anywhere
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Fade>
          </Box>

          {/* Right side - Registration form */}
          <Paper
            elevation={0}
            sx={{
              flex: 1,
              p: { xs: 3, sm: 4, md: 5 },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              background: '#fff',
              borderLeft: '1px solid rgba(0,0,0,0.05)',
              overflowY: 'auto',
            }}
          >
            <Fade in={animationComplete} style={{ transitionDelay: '200ms' }}>
              <Box>
                <Typography variant="h4" component="h1" align="center" gutterBottom sx={{ fontWeight: 600, color: '#1E293B' }}>
                  Create Account
                </Typography>
                <Typography variant="body2" align="center" sx={{ color: '#64748B', mb: 4 }}>
                  Join TDS API Management Platform
                </Typography>

                {error && (
                  <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                    {error}
                  </Alert>
                )}

                <form onSubmit={handleSubmit}>
                  <TextField
                    label="Email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    required
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailOutlinedIcon sx={{ color: 'rgba(0, 0, 0, 0.54)' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        backgroundColor: '#F1F5F9',
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.primary.main,
                          borderWidth: 2,
                        },
                      },
                    }}
                  />

                  <TextField
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    required
                    error={!!passwordError}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlinedIcon sx={{ color: 'rgba(0, 0, 0, 0.54)' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton 
                            onClick={() => setShowPassword(!showPassword)} 
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        backgroundColor: '#F1F5F9',
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.primary.main,
                          borderWidth: 2,
                        },
                      },
                    }}
                  />

                  <TextField
                    label="Confirm Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    required
                    error={!!passwordError}
                    helperText={passwordError}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlinedIcon sx={{ color: 'rgba(0, 0, 0, 0.54)' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton 
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                            edge="end"
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        backgroundColor: '#F1F5F9',
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.primary.main,
                          borderWidth: 2,
                        },
                      },
                    }}
                  />

                  {/* Role Selection */}
                  <FormControl 
                    fullWidth 
                    margin="normal"
                    sx={{
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        backgroundColor: '#F1F5F9',
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.primary.main,
                          borderWidth: 2,
                        },
                      },
                    }}
                  >
                    <InputLabel>Account Type</InputLabel>
                    <Select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      startAdornment={
                        <InputAdornment position="start">
                          <BadgeOutlinedIcon sx={{ color: 'rgba(0, 0, 0, 0.54)' }} />
                        </InputAdornment>
                      }
                    >
                      <MenuItem value={ROLES.ADMIN}>Admin</MenuItem>
                      <MenuItem value={ROLES.USER}>User</MenuItem>
                    </Select>
                  </FormControl>

                  {/* Organization Code for non-Admin users */}
                  {!isAdmin && (
                    <TextField
                      label="Organization Code"
                      name="organizationCode"
                      value={formData.organizationCode}
                      onChange={handleChange}
                      fullWidth
                      margin="normal"
                      required
                      variant="outlined"
                      error={!!orgCodeError}
                      helperText={orgCodeError || "Required for regular users"}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CodeOutlinedIcon sx={{ color: 'rgba(0, 0, 0, 0.54)' }} />
                          </InputAdornment>
                        ),
                        endAdornment: validatingOrgCode ? (
                          <InputAdornment position="end">
                            <CircularProgress size={20} />
                          </InputAdornment>
                        ) : null
                      }}
                      sx={{
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '8px',
                          backgroundColor: '#F1F5F9',
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.palette.primary.main,
                            borderWidth: 2,
                          },
                        },
                      }}
                    />
                  )}

                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={formData.rememberMe} 
                        onChange={handleChange} 
                        name="rememberMe"
                        color="primary"
                      />
                    }
                    sx={{ mb: 2 }}
                    label={<Typography variant="body2">Remember me</Typography>}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    sx={{
                      py: 1.5,
                      mt: 2,
                      backgroundColor: theme.palette.primary.main,
                      color: '#fff',
                      fontWeight: 'bold',
                      borderRadius: '8px',
                      transition: 'all 0.3s',
                      textTransform: 'none',
                      fontSize: '1rem',
                      boxShadow: '0 4px 10px rgba(246, 139, 31, 0.25)',
                      '&:hover': {
                        backgroundColor: theme.palette.primary.dark,
                        boxShadow: '0 6px 15px rgba(246, 139, 31, 0.35)',
                      },
                    }}
                    disabled={loading || !!passwordError || validatingOrgCode || (!isAdmin && !formData.organizationCode)}
                  >
                    {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Create Account'}
                  </Button>
                </form>

                <Divider 
                  sx={{ 
                    my: 3, 
                    color: '#94A3B8',
                    '&::before, &::after': {
                      borderColor: '#E2E8F0',
                    },
                  }}
                >
                  OR
                </Divider>

                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<GoogleIcon />}
                  onClick={handleGoogleLoginClick}
                  disabled={loading}
                  sx={{
                    py: 1.25,
                    borderColor: '#CBD5E1',
                    color: '#334155',
                    borderRadius: '8px',
                    fontWeight: 'medium',
                    textTransform: 'none',
                    fontSize: '0.95rem',
                    transition: 'all 0.3s',
                    '&:hover': {
                      borderColor: '#94A3B8',
                      backgroundColor: '#F8FAFC',
                    },
                  }}
                >
                  Sign up with Google
                </Button>

                <Typography variant="body2" align="center" sx={{ mt: 3, color: '#64748B' }}>
                  Already have an account?{' '}
                  <Button
                    onClick={() => navigate('/login')}
                    sx={{
                      p: 0,
                      minWidth: 'auto',
                      fontWeight: 'bold',
                      textTransform: 'none',
                      color: theme.palette.primary.main,
                      '&:hover': {
                        backgroundColor: 'transparent',
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    Sign In
                  </Button>
                </Typography>
              </Box>
            </Fade>
          </Paper>
        </Box>
      </Zoom>

      {/* Google Sign-up Dialog */}
      <Dialog 
        open={googleDialogOpen} 
        onClose={() => setGoogleDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            width: '100%',
            maxWidth: '450px',
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          Sign up with Google
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 3 }}>
            Please select your account type and provide the required information.
          </Typography>

          <FormControl 
            fullWidth 
            margin="normal"
            sx={{ mb: 2 }}
          >
            <InputLabel>Account Type</InputLabel>
            <Select
              name="role"
              value={googleLoginData.role}
              onChange={handleGoogleDialogChange}
              startAdornment={
                <InputAdornment position="start">
                  <BadgeOutlinedIcon sx={{ color: 'rgba(0, 0, 0, 0.54)' }} />
                </InputAdornment>
              }
            >
              <MenuItem value={ROLES.ADMIN}>Admin</MenuItem>
              <MenuItem value={ROLES.USER}>User</MenuItem>
            </Select>
          </FormControl>

          {googleLoginData.role === ROLES.USER && (
            <TextField
              label="Organization Code"
              name="organizationCode"
              value={googleLoginData.organizationCode}
              onChange={handleGoogleDialogChange}
              fullWidth
              margin="normal"
              required
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CodeOutlinedIcon sx={{ color: 'rgba(0, 0, 0, 0.54)' }} />
                  </InputAdornment>
                ),
              }}
              helperText="Required for non-admin users"
              sx={{ mb: 2 }}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={() => setGoogleDialogOpen(false)}
            sx={{ color: theme.palette.text.secondary }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained"
            onClick={handleGoogleRegister}
            disabled={googleLoginData.role === ROLES.USER && !googleLoginData.organizationCode}
            sx={{
              backgroundColor: theme.palette.primary.main,
              color: '#fff',
              fontWeight: 'bold',
              borderRadius: '8px',
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
              },
            }}
          >
            Continue with Google
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Register;