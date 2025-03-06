
// src/pages/Profile.jsx
import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  CircularProgress, 
  Alert, 
  MenuItem, 
  Select, 
  FormControl,
  InputLabel, 
  IconButton, 
  Avatar,
  Grid,
  Divider,
  Card,
  CardContent,
  Tabs,
  Tab,
  useTheme,
  Chip,
  InputAdornment,
  Snackbar,
  Tooltip,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Fade
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth, db } from '../firebase/config';
import { updatePassword, updateProfile, updateEmail } from 'firebase/auth';
import { collection, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { ROLES } from '../firebase/auth'; // Import ROLES constant

// Icons
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PersonIcon from '@mui/icons-material/Person';
import SecurityIcon from '@mui/icons-material/Security';
import LogoutIcon from '@mui/icons-material/Logout';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RefreshIcon from '@mui/icons-material/Refresh';
import LockIcon from '@mui/icons-material/Lock';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import EmailIcon from '@mui/icons-material/Email';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import GroupIcon from '@mui/icons-material/Group';

const Profile = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, role, organizationCode, logout } = useAuth();
  
  // State for tabs
  const [tabValue, setTabValue] = useState(0);
  
  // State for user information
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  
  // State for organization code
  const [orgCode, setOrgCode] = useState(organizationCode || 'N/A');
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  
  // State for password change
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // State for user management (admin only)
  const [users, setUsers] = useState([]);
  
  // General state
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState({ message: '', show: false });
  const [error, setError] = useState({ message: '', show: false });

  // Fetch users if admin
  useEffect(() => {
    if (role === ROLES.ADMIN) {
      fetchUsers();
    }
  }, [role]);

  // Set initial user data
  useEffect(() => {
    setDisplayName(user?.displayName || '');
    setEmail(user?.email || '');
  }, [user]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersCollection = collection(db, 'users');
      const userSnapshot = await getDocs(usersCollection);
      const userList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(userList);
    } catch (err) {
      console.error("Error fetching users:", err);
      showError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleUpdateProfile = async () => {
    if (!displayName.trim()) {
      showError('Name cannot be empty');
      return;
    }
    
    setLoading(true);
    try {
      await updateProfile(auth.currentUser, { displayName });
      showSuccess('Profile updated successfully!');
      setIsEditingName(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      showError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!email.trim() || !email.includes('@')) {
      showError('Please provide a valid email');
      return;
    }
    
    setLoading(true);
    try {
      await updateEmail(auth.currentUser, email);
      showSuccess('Email updated successfully!');
      setIsEditingEmail(false);
    } catch (err) {
      console.error("Error updating email:", err);
      showError('Failed to update email. You may need to re-authenticate.');
    } finally {
      setLoading(false);
    }
  };

// In pages/Profile.jsx, around line 94-116
const handleGenerateOrgCode = async () => {
  if (role !== ROLES.ADMIN) return;
  
  setIsGeneratingCode(true);
  try {
    // Import and use the service function instead of reimplementing it here
    const { generateOrgCode } = await import('../services/authService');
    const result = await generateOrgCode(user.uid);
    
    if (result.error) {
      showError(result.error);
    } else {
      setOrgCode(result.organizationCode);
      // Force reload to update auth context
      window.location.reload();
      showSuccess('New organization code generated!');
    }
  } catch (err) {
    console.error("Error generating org code:", err);
    showError('Failed to generate organization code');
  } finally {
    setIsGeneratingCode(false);
  }
};

  const handleCopyOrgCode = () => {
    navigator.clipboard.writeText(orgCode);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handlePasswordChange = async () => {
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return;
    }
    
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    setPasswordError('');
    setLoading(true);
    
    try {
      await updatePassword(auth.currentUser, password);
      setPassword('');
      setConfirmPassword('');
      showSuccess('Password updated successfully!');
    } catch (err) {
      console.error("Error updating password:", err);
      showError('Failed to update password. You may need to re-authenticate.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      
      // Update users state locally to avoid refetching
      setUsers(users.map(u => u.id === userId ? {...u, role: newRole} : u));
      showSuccess('User role updated successfully!');
    } catch (err) {
      console.error("Error updating role:", err);
      showError('Failed to update user role');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error("Error logging out:", err);
      showError('Failed to logout');
    }
  };

  // Helper functions to manage messages
  const showSuccess = (message) => {
    setSuccess({ message, show: true });
    setTimeout(() => setSuccess({ message: '', show: false }), 4000);
  };

  const showError = (message) => {
    setError({ message, show: true });
    setTimeout(() => setError({ message: '', show: false }), 4000);
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (displayName) {
      const names = displayName.split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase();
      }
      return displayName.substring(0, 2).toUpperCase();
    }
    
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    
    return 'U';
  };

  return (
    <Box sx={{ 
      p: { xs: 2, md: 3 },
      backgroundColor: '#f8f9fc',
      minHeight: '100vh'
    }}>
      {/* Success Snackbar */}
      <Snackbar
        open={success.show}
        autoHideDuration={4000}
        onClose={() => setSuccess({ ...success, show: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity="success" variant="filled" sx={{ width: '100%' }}>
          {success.message}
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={error.show}
        autoHideDuration={4000}
        onClose={() => setError({ ...error, show: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity="error" variant="filled" sx={{ width: '100%' }}>
          {error.message}
        </Alert>
      </Snackbar>

      {/* Profile Header */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #F68B1F 0%, #e85d26 100%)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          mb: 3,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background pattern */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            background: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'1\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'1.5\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'1.5\'/%3E%3C/g%3E%3C/svg%3E")',
            zIndex: 0,
          }}
        />
        
        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 3 }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: '#fff',
              color: theme.palette.primary.main,
              fontSize: '2rem',
              fontWeight: 'bold',
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
            }}
          >
            {getUserInitials()}
          </Avatar>

          <Box>
            <Typography variant="h4" fontWeight="bold" color="#fff">
              {user?.displayName || 'User Profile'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, flexWrap: 'wrap', gap: 2 }}>
              <Chip 
                icon={
                  role === ROLES.ADMIN ? 
                    <AdminPanelSettingsIcon sx={{ color: '#fff !important' }} /> : 
                    <PersonIcon sx={{ color: '#fff !important' }} />
                } 
                label={role === ROLES.ADMIN ? 'Admin' : 'User'} 
                sx={{ 
                  bgcolor: role === ROLES.ADMIN ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.15)', 
                  color: '#fff',
                  '& .MuiChip-label': { fontWeight: 500 }
                }}
              />
              <Typography variant="body1" color="rgba(255, 255, 255, 0.9)">
                {user?.email}
              </Typography>
            </Box>
          </Box>

          <Button
            variant="outlined"
            color="inherit"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{
              ml: { xs: 0, md: 'auto' },
              borderColor: 'rgba(255,255,255,0.5)',
              color: '#fff',
              '&:hover': {
                borderColor: '#fff',
                bgcolor: 'rgba(255,255,255,0.1)'
              }
            }}
          >
            Logout
          </Button>
        </Box>
      </Paper>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Left Column - Tabs Navigation */}
        <Grid item xs={12} md={3}>
          <Card 
            elevation={0}
            sx={{ 
              borderRadius: '16px',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
              height: '100%',
              overflow: 'hidden'
            }}
          >
            <Tabs
              orientation="vertical"
              variant="scrollable"
              value={tabValue}
              onChange={handleTabChange}
              sx={{
                borderRight: 1,
                borderColor: 'divider',
                '& .MuiTab-root': {
                  alignItems: 'flex-start',
                  textAlign: 'left',
                  py: 2,
                  minHeight: 60
                },
                height: '100%'
              }}
            >
              <Tab 
                icon={<PersonIcon />} 
                iconPosition="start" 
                label="Account Information" 
                sx={{ textTransform: 'none' }} 
              />
              <Tab 
                icon={<SecurityIcon />} 
                iconPosition="start" 
                label="Security" 
                sx={{ textTransform: 'none' }} 
              />
              {role === ROLES.ADMIN && (
                <Tab 
                  icon={<AdminPanelSettingsIcon />} 
                  iconPosition="start" 
                  label="Administration" 
                  sx={{ textTransform: 'none' }} 
                />
              )}
            </Tabs>
          </Card>
        </Grid>

        {/* Right Column - Tab Content */}
        <Grid item xs={12} md={9}>
          <Fade in={tabValue === 0}>
            <Box sx={{ display: tabValue === 0 ? 'block' : 'none' }}>
              <Card
                elevation={0}
                sx={{ 
                  borderRadius: '16px',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
                  overflow: 'hidden',
                  mb: 3
                }}
              >
                <CardContent sx={{ p: 0 }}>
                  <Box sx={{ p: 3, borderBottom: '1px solid #f0f0f0' }}>
                    <Typography variant="h6" fontWeight="bold">
                      Account Information
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      Manage your personal information
                    </Typography>
                  </Box>

                  <Box sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                      {/* Name Field */}
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" fontWeight="medium" color="text.secondary" gutterBottom>
                          Display Name
                        </Typography>
                        
                        {isEditingName ? (
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                            <TextField
                              fullWidth
                              value={displayName}
                              onChange={(e) => setDisplayName(e.target.value)}
                              variant="outlined"
                              size="small"
                              autoFocus
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: '8px',
                                  backgroundColor: '#F1F5F9',
                                }
                              }}
                            />
                            <Button 
                              variant="contained" 
                              size="small" 
                              onClick={handleUpdateProfile}
                              disabled={loading}
                              sx={{ minWidth: 'fit-content', borderRadius: '8px' }}
                            >
                              {loading ? <CircularProgress size={20} /> : 'Save'}
                            </Button>
                          </Box>
                        ) : (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body1">
                              {displayName || 'Not set'}
                            </Typography>
                            <IconButton 
                              size="small" 
                              onClick={() => setIsEditingName(true)}
                              sx={{ color: theme.palette.primary.main }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        )}
                      </Grid>

                      {/* Email Field */}
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" fontWeight="medium" color="text.secondary" gutterBottom>
                          Email Address
                        </Typography>
                        
                        {isEditingEmail ? (
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                            <TextField
                              fullWidth
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              variant="outlined"
                              size="small"
                              autoFocus
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: '8px',
                                  backgroundColor: '#F1F5F9',
                                }
                              }}
                            />
                            <Button 
                              variant="contained" 
                              size="small" 
                              onClick={handleUpdateEmail}
                              disabled={loading}
                              sx={{ minWidth: 'fit-content', borderRadius: '8px' }}
                            >
                              {loading ? <CircularProgress size={20} /> : 'Save'}
                            </Button>
                          </Box>
                        ) : (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body1">
                              {email}
                            </Typography>
                            <IconButton 
                              size="small" 
                              onClick={() => setIsEditingEmail(true)}
                              sx={{ color: theme.palette.primary.main }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        )}
                      </Grid>

                      {/* Organization Code - Only for admins to generate, visible to all */}
                      <Grid item xs={12}>
                        <Divider sx={{ my: 1 }} />
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2" fontWeight="medium" color="text.secondary" gutterBottom>
                            Organization Code
                          </Typography>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                            <TextField
                              value={orgCode}
                              variant="outlined"
                              size="small"
                              InputProps={{
                                readOnly: true,
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <VpnKeyIcon sx={{ color: 'rgba(0, 0, 0, 0.54)' }} />
                                  </InputAdornment>
                                ),
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <Tooltip title={copySuccess ? "Copied!" : "Copy to clipboard"}>
                                      <IconButton 
                                        onClick={handleCopyOrgCode}
                                        edge="end"
                                        size="small"
                                      >
                                        {copySuccess ? <CheckCircleOutlineIcon color="success" /> : <ContentCopyIcon />}
                                      </IconButton>
                                    </Tooltip>
                                  </InputAdornment>
                                )
                              }}
                              sx={{
                                width: { xs: '100%', sm: '50%' },
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: '8px',
                                  backgroundColor: '#F1F5F9',
                                }
                              }}
                            />
                            
                            {role === ROLES.ADMIN && (
                              <Button
                                variant="outlined"
                                startIcon={<RefreshIcon />}
                                onClick={handleGenerateOrgCode}
                                disabled={isGeneratingCode}
                              >
                                {isGeneratingCode ? <CircularProgress size={20} /> : 'Generate New Code'}
                              </Button>
                            )}
                          </Box>
                          
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                            {role === ROLES.ADMIN 
                              ? "This code can be shared with organization members to allow them to register accounts." 
                              : "This is your organization's code. Contact your administrator if you need a new one."}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Fade>

          <Fade in={tabValue === 1}>
            <Box sx={{ display: tabValue === 1 ? 'block' : 'none' }}>
              <Card
                elevation={0}
                sx={{ 
                  borderRadius: '16px',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
                  overflow: 'hidden'
                }}
              >
                <CardContent sx={{ p: 0 }}>
                  <Box sx={{ p: 3, borderBottom: '1px solid #f0f0f0' }}>
                    <Typography variant="h6" fontWeight="bold">
                      Security Settings
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      Manage your account security
                    </Typography>
                  </Box>

                  <Box sx={{ p: 3 }}>
                    <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                      Change Password
                    </Typography>
                    
                    {passwordError && (
                      <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                        {passwordError}
                      </Alert>
                    )}
                    
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="New Password"
                          type={showPassword ? 'text' : 'password'}
                          fullWidth
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <LockIcon sx={{ color: 'rgba(0, 0, 0, 0.54)' }} />
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                  {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '8px',
                              backgroundColor: '#F1F5F9',
                            }
                          }}
                        />
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Confirm Password"
                          type={showConfirmPassword ? 'text' : 'password'}
                          fullWidth
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <LockIcon sx={{ color: 'rgba(0, 0, 0, 0.54)' }} />
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '8px',
                              backgroundColor: '#F1F5F9',
                            }
                          }}
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handlePasswordChange}
                          disabled={loading || !password || !confirmPassword}
                          sx={{ borderRadius: '8px' }}
                        >
                          {loading ? <CircularProgress size={24} /> : 'Update Password'}
                        </Button>
                      </Grid>
                    </Grid>
                    
                    <Box sx={{ mt: 4 }}>
                      <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                        Account Security Tips
                      </Typography>
                      
                      <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
                        <li>Use a strong password with at least 8 characters including numbers and symbols</li>
                        <li>Never share your password or organization code with others</li>
                        <li>Enable two-factor authentication for additional security</li>
                        <li>Regularly update your password for better protection</li>
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Fade>

          {role === ROLES.ADMIN && (
            <Fade in={tabValue === 2}>
              <Box sx={{ display: tabValue === 2 ? 'block' : 'none' }}>
                <Card
                  elevation={0}
                  sx={{ 
                    borderRadius: '16px',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
                    overflow: 'hidden'
                  }}
                >
                  <CardContent sx={{ p: 0 }}>
                    <Box sx={{ p: 3, borderBottom: '1px solid #f0f0f0' }}>
                      <Typography variant="h6" fontWeight="bold">
                        User Administration
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Manage users and their permissions
                      </Typography>
                    </Box>

                    <TableContainer>
                      <Table sx={{ minWidth: 650 }}>
                        <TableHead>
                          <TableRow sx={{ backgroundColor: '#F8FAFC' }}>
                            <TableCell sx={{ fontWeight: 'bold' }}>User</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Role</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Organization Code</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {loading ? (
                            <TableRow>
                              <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                                <CircularProgress size={30} />
                              </TableCell>
                            </TableRow>
                          ) : users.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                                <Typography variant="body1" color="text.secondary">
                                  No users found
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ) : (
                            users.map((user) => (
                              <TableRow key={user.id} hover>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Avatar 
                                      sx={{ 
                                        width: 32, 
                                        height: 32, 
                                        mr: 1,
                                        bgcolor: user.role === ROLES.ADMIN ? '#F44336' : '#2196F3'
                                      }}
                                    >
                                      {user.email.substring(0, 2).toUpperCase()}
                                    </Avatar>
                                    <Typography variant="body2">
                                      {user.displayName || 'N/A'}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                  <FormControl fullWidth size="small">
                                    <Select
                                      value={user.role || ROLES.USER}
                                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                      renderValue={(selected) => (
                                        <Chip
                                              label={selected === ROLES.ADMIN ? "Admin" : "User"}
                                              sx={{
                                                backgroundColor: selected === ROLES.ADMIN ? "#F44336" : "#2196F3",
                                                color: "#fff",
                                                fontWeight: "bold",
                                                borderRadius: "8px",
                                                paddingX: "8px",
                                              }}
                                              />
                                              )}
>
<MenuItem value={ROLES.USER}>User</MenuItem>
<MenuItem value={ROLES.ADMIN}>Admin</MenuItem>
</Select>
</FormControl>
</TableCell>
<TableCell>{user.organizationCode || "N/A"}</TableCell>
</TableRow>
))
)}
</TableBody>
</Table>
</TableContainer>
</CardContent>
</Card>
</Box>
</Fade>
)}
</Grid>
</Grid>
</Box>
);
};

export default Profile;
