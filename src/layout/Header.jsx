// src/layout/Header.jsx
import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Box, 
  useTheme,
  useMediaQuery,
  Menu,
  MenuItem,
  Avatar,
  Tooltip,
  Badge,
  Divider
} from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import { ROLES } from '../firebase/auth';

const Header = () => {
  const { isAuthenticated, logout, user, role } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const navigate = useNavigate();
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationsAnchor, setNotificationsAnchor] = useState(null);
  
  // Handle user menu open/close
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  // Handle notifications menu
  const handleNotificationsOpen = (event) => {
    setNotificationsAnchor(event.currentTarget);
  };
  
  const handleNotificationsClose = () => {
    setNotificationsAnchor(null);
  };
  
  const handleLogout = async () => {
    handleMenuClose();
    await logout();
    navigate('/');
  };
  
  // Don't show logout on login and register pages
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/forgot-password';
  const isHomePage = location.pathname === '/';
  
  // Get initial of user's email for avatar
  const getUserInitial = () => {
    if (!user) return 'U';
    
    if (user.displayName) {
      const names = user.displayName.split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase();
      }
      return user.displayName.substring(0, 2).toUpperCase();
    }
    
    return user.email ? user.email[0].toUpperCase() : 'U';
  };
  
  // Sample notifications (for demonstration)
  const notifications = [
    { id: 1, content: 'Your project "API Gateway" has been updated', read: false },
    { id: 2, content: 'New API documentation available', read: true },
    { id: 3, content: 'System maintenance scheduled for tonight', read: false }
  ];
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  return (
    <AppBar 
      position="sticky" 
      color="default" 
      elevation={0}
      sx={{
        borderBottom: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.paper',
        zIndex: (theme) => theme.zIndex.drawer + 1
      }}
    >
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        {/* Left side - Logo and title */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography 
            variant="h6" 
            component={Link} 
            to="/" 
            sx={{ 
              fontWeight: "bold", 
              color: theme.palette.primary.main,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              '&:hover': {
                color: theme.palette.primary.dark,
              }
            }}
          >
            TDS API
          </Typography>
        </Box>

        {/* Right side - Auth buttons or user menu */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isAuthenticated && !isAuthPage ? (
            <>
              {/* Notifications */}
              <Tooltip title="Notifications">
                <IconButton 
                  size="small" 
                  onClick={handleNotificationsOpen}
                  sx={{ mr: 1 }}
                >
                  <Badge badgeContent={unreadCount} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
              
              {/* Notifications Menu */}
              <Menu
                anchorEl={notificationsAnchor}
                open={Boolean(notificationsAnchor)}
                onClose={handleNotificationsClose}
                PaperProps={{
                  sx: { 
                    width: 320,
                    maxHeight: 400
                  }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <Typography variant="subtitle1" sx={{ px: 2, py: 1, fontWeight: 'medium' }}>
                  Notifications
                </Typography>
                <Divider />
                {notifications.length === 0 ? (
                  <MenuItem disabled>
                    <Typography variant="body2">No new notifications</Typography>
                  </MenuItem>
                ) : (
                  notifications.map((notification) => (
                    <MenuItem 
                      key={notification.id}
                      onClick={handleNotificationsClose}
                      sx={{ 
                        py: 1.5,
                        px: 2,
                        borderLeft: notification.read ? 'none' : `4px solid ${theme.palette.primary.main}`,
                        backgroundColor: notification.read ? 'transparent' : 'rgba(0,0,0,0.02)'
                      }}
                    >
                      <Typography variant="body2">{notification.content}</Typography>
                    </MenuItem>
                  ))
                )}
                <Divider />
                <Box sx={{ p: 1, textAlign: 'center' }}>
                  <Button size="small" onClick={handleNotificationsClose}>
                    Mark all as read
                  </Button>
                </Box>
              </Menu>
              
              {/* User avatar/menu button */}
              <Tooltip title="Account settings">
                <IconButton
                  onClick={handleMenuOpen}
                  size="small"
                  sx={{ ml: 1 }}
                  aria-controls="user-menu"
                  aria-haspopup="true"
                >
                  <Avatar 
                    sx={{ 
                      width: 32, 
                      height: 32, 
                      bgcolor: theme.palette.primary.main,
                      fontSize: '0.875rem'
                    }}
                  >
                    {getUserInitial()}
                  </Avatar>
                </IconButton>
              </Tooltip>
              
              {/* User dropdown menu */}
              <Menu
                id="user-menu"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                onClick={handleMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                  elevation: 3,
                  sx: {
                    mt: 1.5,
                    width: 220,
                    overflow: 'visible',
                    '&:before': {
                      content: '""',
                      display: 'block',
                      position: 'absolute',
                      top: 0,
                      right: 14,
                      width: 10,
                      height: 10,
                      bgcolor: 'background.paper',
                      transform: 'translateY(-50%) rotate(45deg)',
                      zIndex: 0,
                    },
                  },
                }}
              >
                <MenuItem onClick={() => navigate('/profile')} sx={{ py: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        mr: 1.5,
                        bgcolor: theme.palette.primary.main
                      }}
                    >
                      {getUserInitial()}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {user?.displayName || user?.email?.split('@')[0] || 'User'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {role === ROLES.ADMIN ? 'Administrator' : 'Member'}
                      </Typography>
                    </Box>
                  </Box>
                </MenuItem>
                
                <Divider sx={{ my: 1 }} />
                
                <MenuItem onClick={() => navigate('/profile')} sx={{ py: 1 }}>
                  <PersonIcon fontSize="small" sx={{ mr: 1.5 }} />
                  <Typography variant="body2">My Profile</Typography>
                </MenuItem>
                
                <MenuItem onClick={() => navigate('/profile')} sx={{ py: 1 }}>
                  <SettingsIcon fontSize="small" sx={{ mr: 1.5 }} />
                  <Typography variant="body2">Account Settings</Typography>
                </MenuItem>
                
                {role === ROLES.ADMIN && (
                  <MenuItem onClick={() => navigate('/admin-dashboard')} sx={{ py: 1 }}>
                    <AdminPanelSettingsIcon fontSize="small" sx={{ mr: 1.5 }} />
                    <Typography variant="body2">Admin Dashboard</Typography>
                  </MenuItem>
                )}
                
                <Divider sx={{ my: 1 }} />
                
                <MenuItem onClick={handleLogout} sx={{ py: 1 }}>
                  <ExitToAppIcon fontSize="small" sx={{ mr: 1.5 }} />
                  <Typography variant="body2">Logout</Typography>
                </MenuItem>
              </Menu>
            </>
          ) : (
            // Login/register buttons for unauthenticated users
            !isAuthPage && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button 
                  color="primary" 
                  component={Link} 
                  to="/login"
                  variant={isHomePage ? "contained" : "text"}
                  sx={{ 
                    fontWeight: 'medium',
                    boxShadow: isHomePage ? theme.shadows[1] : 'none',
                    '&:hover': {
                      transform: isHomePage ? 'translateY(-2px)' : 'none',
                      boxShadow: isHomePage ? theme.shadows[4] : 'none',
                    }
                  }}
                >
                  Login
                </Button>
                <Button 
                  color="primary" 
                  component={Link} 
                  to="/register" 
                  variant={isHomePage ? "outlined" : "text"}
                  sx={{ 
                    fontWeight: 'medium',
                    '&:hover': {
                      transform: isHomePage ? 'translateY(-2px)' : 'none',
                    }
                  }}
                >
                  Register
                </Button>
              </Box>
            )
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;