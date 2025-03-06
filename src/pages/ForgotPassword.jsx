// src/pages/ForgotPassword.jsx
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Container,
  Alert,
  CircularProgress,
  useTheme,
  InputAdornment,
  IconButton,
  Fade,
  Zoom,
  Link as MuiLink
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useAuth } from '../context/AuthContext';

const ForgotPassword = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { forgotPassword, error, loading, clearError } = useAuth();
  
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [animationComplete, setAnimationComplete] = useState(false);
  
  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };
  
  const handleChange = (e) => {
    setEmail(e.target.value);
    setValidationError('');
    if (error) clearError();
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate email
    if (!email.trim()) {
      setValidationError('Email is required');
      return;
    }
    
    if (!validateEmail(email)) {
      setValidationError('Please enter a valid email address');
      return;
    }
    
    // Send password reset email
    const success = await forgotPassword(email);
    
    if (success) {
      setSubmitted(true);
    }
  };
  
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#f8f9fc',
        position: 'relative',
      }}
    >
      <Container maxWidth="sm">
        <Zoom in={true} style={{ transitionDelay: '100ms' }}>
          <Paper
            elevation={3}
            sx={{
              p: { xs: 3, sm: 4, md: 5 },
              borderRadius: '16px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {/* Orange accent on top of the card */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '6px',
                background: 'linear-gradient(90deg, #F68B1F, #e85d26)',
              }}
            />
            
            <Fade in={animationComplete} style={{ transitionDelay: '200ms' }}>
              <Box>
                {submitted ? (
                  // Success state
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <CheckCircleOutlineIcon 
                      sx={{ 
                        fontSize: 70, 
                        color: theme.palette.success.main,
                        mb: 2
                      }} 
                    />
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                      Reset Link Sent
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph>
                      We've sent a password reset link to:
                    </Typography>
                    <Typography variant="body1" fontWeight="medium" paragraph>
                      {email}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
                      Please check your email and follow the instructions to reset your password.
                      If you don't receive an email within a few minutes, check your spam folder.
                    </Typography>
                    
                    <Box sx={{ mt: 4 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => navigate('/login')}
                        sx={{
                          py: 1.5,
                          px: 4,
                          borderRadius: '8px',
                          fontWeight: 'bold'
                        }}
                      >
                        Return to Login
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  // Form state
                  <Box>
                    <IconButton 
                      onClick={() => navigate('/login')}
                      sx={{ 
                        mb: 2,
                        color: theme.palette.text.secondary
                      }}
                    >
                      <ArrowBackIcon />
                    </IconButton>
                    
                    <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                      Forgot Password
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                      Enter your email address and we'll send you a link to reset your password.
                    </Typography>
                    
                    {error && (
                      <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                        {error}
                      </Alert>
                    )}
                    
                    <form onSubmit={handleSubmit}>
                      <TextField
                        label="Email Address"
                        type="email"
                        value={email}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        required
                        error={!!validationError}
                        helperText={validationError}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <EmailOutlinedIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          mb: 3,
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
                      
                      <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        size="large"
                        disabled={loading}
                        sx={{
                          py: 1.5,
                          backgroundColor: theme.palette.primary.main,
                          color: '#fff',
                          fontWeight: 'bold',
                          borderRadius: '8px',
                          transition: 'all 0.3s',
                          textTransform: 'none',
                          fontSize: '1rem',
                          mb: 3,
                          boxShadow: '0 4px 10px rgba(246, 139, 31, 0.25)',
                          '&:hover': {
                            backgroundColor: theme.palette.primary.dark,
                            boxShadow: '0 6px 15px rgba(246, 139, 31, 0.35)',
                          },
                        }}
                      >
                        {loading ? (
                          <CircularProgress size={24} color="inherit" />
                        ) : (
                          'Send Reset Link'
                        )}
                      </Button>
                      
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          Remember your password?{' '}
                          <MuiLink 
                            component={Link} 
                            to="/login" 
                            underline="hover"
                            sx={{ 
                              fontWeight: 'bold',
                              color: theme.palette.primary.main
                            }}
                          >
                            Sign in
                          </MuiLink>
                        </Typography>
                      </Box>
                    </form>
                  </Box>
                )}
              </Box>
            </Fade>
          </Paper>
        </Zoom>
      </Container>
    </Box>
  );
};

export default ForgotPassword;