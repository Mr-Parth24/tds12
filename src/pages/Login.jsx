// src/pages/Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  Fade,
  Zoom,
  FormControlLabel,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Container,
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import CodeOutlinedIcon from '@mui/icons-material/CodeOutlined';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../firebase/auth'; // Import ROLES constant

const Login = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { 
    login, 
    loginWithGoogle, 
    error, 
    loading, 
    clearError, 
    isAuthenticated, 
    role,
    getRememberedEmail,
    setRememberMe,
    rememberMe
  } = useAuth();

  // Google sign-in dialog state
  const [googleDialogOpen, setGoogleDialogOpen] = useState(false);
  const [googleLoginData, setGoogleLoginData] = useState({
    role: ROLES.USER,
    organizationCode: ''
  });

  const [formData, setFormData] = useState({
    email: getRememberedEmail() || '',
    password: '',
    rememberMe: rememberMe || false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      console.log("Login - User authenticated with role:", role);
      navigate(role === ROLES.ADMIN ? '/admin-dashboard' : '/dashboard');
    }
  }, [isAuthenticated, role, navigate]);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    const newValue = name === 'rememberMe' ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: newValue }));
    if (error) clearError();
  };

  const handleGoogleDialogChange = (e) => {
    const { name, value } = e.target;
    setGoogleLoginData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Attempting to login with email:", formData.email);
    console.log("Remember me setting:", formData.rememberMe);
    
    // Update remember me setting in auth context
    setRememberMe(formData.rememberMe);
    
    const success = await login(formData.email, formData.password, formData.rememberMe);
    if (success) {
      console.log("Login successful, redirecting to dashboard");
      navigate(role === ROLES.ADMIN ? '/admin-dashboard' : '/dashboard');
    }
  };

  const handleGoogleLoginClick = () => {
    setGoogleDialogOpen(true);
  };

  const handleGoogleLogin = async () => {
    setGoogleDialogOpen(false);
    
    // For Admin role, no organization code is needed
    const orgCode = googleLoginData.role === ROLES.ADMIN ? null : googleLoginData.organizationCode;
    
    // Check if organization code is required but missing
    if (googleLoginData.role === ROLES.USER && !orgCode) {
      clearError();
      setGoogleDialogOpen(true); // Keep dialog open
      return;
    }
    
    console.log("Attempting Google login with role:", googleLoginData.role);
    const success = await loginWithGoogle(googleLoginData.role, orgCode);
    
    if (success) {
      console.log("Google login successful, redirecting to dashboard");
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
      <Container maxWidth="md">
        <Zoom in={true} style={{ transitionDelay: '100ms' }}>
          <Box
            sx={{
              display: 'flex',
              width: '100%',
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
                  
                  {/* Logo placeholder */}
                  <Box 
                    sx={{ 
                      my: 4, 
                      width: 120, 
                      height: 120, 
                      backgroundColor: 'rgba(255,255,255,0.2)', 
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto'
                    }}
                  >
                    <Typography variant="h2" component="span" color="#1a2a41">
                      API
                    </Typography>
                  </Box>
                  
                  <Typography variant="h6" gutterBottom color="#1a2a41">
                    API Management Interface
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 2, maxWidth: '80%', mx: 'auto', color: '#1a2a41' }}>
                    Seamlessly manage and deploy APIs with our intuitive no-code platform.
                  </Typography>

                  <Box sx={{ mt: 6 }}>
                    <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#1a2a41' }}>
                      "Triode Data Systems revolutionized how we build and manage APIs."
                    </Typography>
                    <Typography variant="subtitle2" sx={{ mt: 1, color: '#1a2a41' }}>
                      — John Doe, CTO at TechCorp
                    </Typography>
                  </Box>
                </Box>
              </Fade>
            </Box>

            {/* Right side - Login form */}
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
              }}
            >
              <Fade in={animationComplete} style={{ transitionDelay: '200ms' }}>
                <Box>
                  <Typography variant="h4" component="h1" align="center" gutterBottom sx={{ fontWeight: 600, color: '#1E293B' }}>
                    Welcome Back
                  </Typography>
                  <Typography variant="body2" align="center" sx={{ color: '#64748B', mb: 4 }}>
                    Sign in to continue managing your APIs
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
                              aria-label="toggle password visibility"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        mb: 1,
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

                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      mb: 2,
                      mt: 1
                    }}>
                      <FormControlLabel
                        control={
                          <Checkbox 
                            checked={formData.rememberMe} 
                            onChange={handleChange} 
                            name="rememberMe"
                            color="primary"
                            sx={{
                              '&.Mui-checked': {
                                color: theme.palette.primary.main,
                              },
                            }}
                          />
                        }
                        label={
                          <Typography variant="body2" color="text.secondary">
                            Remember me
                          </Typography>
                        }
                      />
                      
                      <Button 
                        component={Link}
                        to="/forgot-password"
                        variant="text" 
                        size="small"
                        sx={{ 
                          color: theme.palette.primary.main,
                          textTransform: 'none',
                          '&:hover': {
                            backgroundColor: 'transparent',
                            textDecoration: 'underline',
                          },
                        }}
                      >
                        Forgot password?
                      </Button>
                    </Box>

                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      size="large"
                      sx={{
                        py: 1.5,
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
                          transform: 'translateY(-2px)',
                        },
                      }}
                      disabled={loading}
                    >
                      {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Sign In'}
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
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    Sign in with Google
                  </Button>

                  <Box sx={{ textAlign: 'center', mt: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Don't have an account?{' '}
                      <Link 
                        to="/register"
                        style={{ 
                          color: theme.palette.primary.main,
                          textDecoration: 'none',
                          fontWeight: 'bold',
                        }}
                      >
                        Create Account
                      </Link>
                    </Typography>
                  </Box>
                </Box>
              </Fade>
            </Paper>
          </Box>
        </Zoom>
      </Container>

      {/* Google Sign-in Dialog */}
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
          Sign in with Google
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
            onClick={handleGoogleLogin}
            disabled={googleLoginData.role === ROLES.USER && !googleLoginData.organizationCode}
            sx={{
              backgroundColor: theme.palette.primary.main,
              color: '#fff',
              fontWeight: 'bold',
              borderRadius: '8px',
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
                transform: 'translateY(-2px)',
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

export default Login;