// src/layout/MainNavigation.jsx
import React, { useState } from 'react';
import { 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  IconButton, 
  useTheme, 
  useMediaQuery,
  Divider,
  Collapse,
  Tooltip,
  Button,
  Typography,
  Avatar
} from '@mui/material';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import CodeIcon from '@mui/icons-material/Code';
import SettingsIcon from '@mui/icons-material/Settings';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import MenuIcon from '@mui/icons-material/Menu';
import ApiIcon from '@mui/icons-material/Api';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import GroupsIcon from '@mui/icons-material/Groups';
import ScienceIcon from '@mui/icons-material/Science';
import BarChartIcon from '@mui/icons-material/BarChart';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import HomeIcon from '@mui/icons-material/Home';

import { ROLES } from '../firebase/auth';

// Drawer width
const drawerWidth = 240;
const miniDrawerWidth = 70;

const MainNavigation = () => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, role, user } = useAuth();
  
  // For responsive design
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State for drawer open/closed
  const [open, setOpen] = useState(!isMobile);
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Expanded sections in the navigation
  const [expandedSection, setExpandedSection] = useState('');
  
  // Don't show sidebar on public pages (login, register, home)
  const isPublicPage = ['/login', '/register', '/forgot-password', '/'].includes(location.pathname);
  
  // Only show for authenticated users except on public pages
  if (!isAuthenticated && !isPublicPage) {
    return null;
  }
  
  // Don't show on public pages
  if (isPublicPage) {
    return null;
  }
  
  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setOpen(!open);
    }
  };
  
  const handleSectionExpand = (section) => {
    if (expandedSection === section) {
      setExpandedSection('');
    } else {
      setExpandedSection(section);
    }
  };
  
  const isActive = (path) => location.pathname === path;
  const isActiveSection = (path) => location.pathname.includes(path);
  
  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return 'U';
    
    if (user.displayName) {
      const names = user.displayName.split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase();
      }
      return user.displayName.substring(0, 2).toUpperCase();
    }
    
    if (user.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    
    return 'U';
  };
  
  // Navigation content
  const navigationContent = (
    <>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: open ? 'flex-end' : 'center',
        p: 1
      }}>
        {open && (
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1, 
              fontWeight: 'bold', 
              ml: 2,
              color: theme.palette.primary.main 
            }}
          >
            TDS API
          </Typography>
        )}
        <IconButton onClick={handleDrawerToggle} size="small">
          {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </Box>
      
      <Divider />
      
      {open && (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Avatar 
            sx={{ 
              width: 60, 
              height: 60, 
              mx: 'auto',
              bgcolor: theme.palette.primary.main,
              color: 'white',
              fontWeight: 'bold'
            }}
          >
            {getUserInitials()}
          </Avatar>
          <Typography variant="subtitle1" sx={{ mt: 1, fontWeight: 'medium' }}>
            {user?.displayName || user?.email?.split('@')[0] || 'User'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {role === ROLES.ADMIN ? 'Administrator' : 'Member'}
          </Typography>
        </Box>
      )}
      
      {!open && (
        <Box sx={{ p: 1, textAlign: 'center' }}>
          <Avatar 
            sx={{ 
              width: 40, 
              height: 40, 
              mx: 'auto',
              bgcolor: theme.palette.primary.main,
              color: 'white',
              fontWeight: 'bold'
            }}
          >
            {getUserInitials()}
          </Avatar>
        </Box>
      )}
      
      <Divider sx={{ mb: 1 }} />
      
      <List component="nav" sx={{ px: 1 }}>
        {/* Dashboard */}
        <Tooltip title={open ? "" : "Dashboard"} placement="right">
          <ListItem 
            button 
            component={Link} 
            to={role === ROLES.ADMIN ? "/admin-dashboard" : "/dashboard"} 
            selected={isActive(role === ROLES.ADMIN ? "/admin-dashboard" : "/dashboard")}
            sx={{
              mb: 1,
              borderRadius: '8px',
              height: '48px',
              pl: open ? 2 : 'auto',
              justifyContent: open ? 'flex-start' : 'center',
              '&.Mui-selected': {
                backgroundColor: `${theme.palette.primary.main}20`,
                color: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: `${theme.palette.primary.main}30`,
                }
              }
            }}
          >
            <ListItemIcon sx={{ 
              minWidth: open ? 40 : 'auto',
              color: isActive(role === ROLES.ADMIN ? "/admin-dashboard" : "/dashboard") ? "primary" : "inherit" 
            }}>
              {role === ROLES.ADMIN ? (
                <AdminPanelSettingsIcon />
              ) : (
                <DashboardIcon />
              )}
            </ListItemIcon>
            {open && (
              <ListItemText 
                primary="Dashboard" 
                primaryTypographyProps={{ 
                  fontWeight: isActive(role === ROLES.ADMIN ? "/admin-dashboard" : "/dashboard") ? 'bold' : 'normal',
                  fontSize: '0.95rem'
                }} 
              />
            )}
          </ListItem>
        </Tooltip>
        
        {/* Projects Section */}
        <Tooltip title={open ? "" : "Projects"} placement="right">
          <ListItem 
            button 
            onClick={() => open ? handleSectionExpand('projects') : navigate('/projects')}
            selected={isActiveSection('/projects')}
            sx={{
              mb: 1,
              borderRadius: '8px',
              height: '48px',
              pl: open ? 2 : 'auto',
              justifyContent: open ? 'flex-start' : 'center',
              '&.Mui-selected': {
                backgroundColor: `${theme.palette.primary.main}20`,
                color: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: `${theme.palette.primary.main}30`,
                }
              }
            }}
          >
            <ListItemIcon sx={{ 
              minWidth: open ? 40 : 'auto',
              color: isActiveSection('/projects') ? "primary" : "inherit"
            }}>
              <CodeIcon />
            </ListItemIcon>
            {open && (
              <>
                <ListItemText 
                  primary="Projects" 
                  primaryTypographyProps={{ 
                    fontWeight: isActiveSection('/projects') ? 'bold' : 'normal',
                    fontSize: '0.95rem'
                  }} 
                />
                {expandedSection === 'projects' ? <ChevronLeftIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
              </>
            )}
          </ListItem>
        </Tooltip>
        
        {open && (
          <Collapse in={expandedSection === 'projects'} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem 
                button 
                component={Link} 
                to="/projects"
                selected={isActive('/projects')}
                sx={{
                  pl: 6,
                  borderRadius: '8px',
                  mb: 1,
                  height: '40px',
                  '&.Mui-selected': {
                    backgroundColor: `${theme.palette.primary.main}20`,
                    color: theme.palette.primary.main,
                  }
                }}
              >
                <ListItemText 
                  primary="All Projects" 
                  primaryTypographyProps={{ 
                    fontSize: '0.875rem',
                    fontWeight: isActive('/projects') ? 'medium' : 'normal'
                  }} 
                />
              </ListItem>
              
              {role === ROLES.ADMIN && (
                <ListItem 
                  button 
                  component={Link} 
                  to="/projects/create"
                  selected={isActive('/projects/create')}
                  sx={{
                    pl: 6,
                    borderRadius: '8px',
                    mb: 1,
                    height: '40px',
                    '&.Mui-selected': {
                      backgroundColor: `${theme.palette.primary.main}20`,
                      color: theme.palette.primary.main,
                    }
                  }}
                >
                  <ListItemText 
                    primary="Create Project" 
                    primaryTypographyProps={{ 
                      fontSize: '0.875rem',
                      fontWeight: isActive('/projects/create') ? 'medium' : 'normal'
                    }} 
                  />
                </ListItem>
              )}
            </List>
          </Collapse>
        )}
        
        {/* API Playground (Coming Soon) */}
        <Tooltip title={open ? "" : "API Playground (Coming Soon)"} placement="right">
          <ListItem 
            button 
            sx={{
              mb: 1,
              borderRadius: '8px',
              height: '48px',
              pl: open ? 2 : 'auto',
              justifyContent: open ? 'flex-start' : 'center',
              opacity: 0.7,
              position: 'relative'
            }}
          >
            <ListItemIcon sx={{ minWidth: open ? 40 : 'auto' }}>
              <ScienceIcon />
            </ListItemIcon>
            {open && (
              <>
                <ListItemText 
                  primary="API Playground" 
                  primaryTypographyProps={{ fontSize: '0.95rem' }} 
                />
                <NewReleasesIcon color="primary" fontSize="small" sx={{ ml: 1 }} />
              </>
            )}
            {!open && (
              <NewReleasesIcon 
                color="primary" 
                fontSize="small" 
                sx={{ 
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  width: 16,
                  height: 16
                }} 
              />
            )}
          </ListItem>
        </Tooltip>
        
        {/* Analytics (Coming Soon) */}
        <Tooltip title={open ? "" : "Analytics (Coming Soon)"} placement="right">
          <ListItem 
            button 
            sx={{
              mb: 1,
              borderRadius: '8px',
              height: '48px',
              pl: open ? 2 : 'auto',
              justifyContent: open ? 'flex-start' : 'center',
              opacity: 0.7,
              position: 'relative'
            }}
          >
            <ListItemIcon sx={{ minWidth: open ? 40 : 'auto' }}>
              <BarChartIcon />
            </ListItemIcon>
            {open && (
              <>
                <ListItemText 
                  primary="Analytics" 
                  primaryTypographyProps={{ fontSize: '0.95rem' }} 
                />
                <NewReleasesIcon color="primary" fontSize="small" sx={{ ml: 1 }} />
              </>
            )}
            {!open && (
              <NewReleasesIcon 
                color="primary" 
                fontSize="small" 
                sx={{ 
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  width: 16,
                  height: 16
                }} 
              />
            )}
          </ListItem>
        </Tooltip>
        
        {/* Profile/Settings */}
        <Tooltip title={open ? "" : "Settings"} placement="right">
          <ListItem 
            button 
            component={Link}
            to="/profile"
            selected={isActive('/profile')}
            sx={{
              mb: 1,
              borderRadius: '8px',
              height: '48px',
              pl: open ? 2 : 'auto',
              justifyContent: open ? 'flex-start' : 'center',
              '&.Mui-selected': {
                backgroundColor: `${theme.palette.primary.main}20`,
                color: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: `${theme.palette.primary.main}30`,
                }
              }
            }}
          >
            <ListItemIcon sx={{ 
              minWidth: open ? 40 : 'auto',
              color: isActive('/profile') ? "primary" : "inherit"
            }}>
              <SettingsIcon />
            </ListItemIcon>
            {open && (
              <ListItemText 
                primary="Settings" 
                primaryTypographyProps={{ 
                  fontWeight: isActive('/profile') ? 'bold' : 'normal',
                  fontSize: '0.95rem'
                }} 
              />
            )}
          </ListItem>
        </Tooltip>
        
        {/* Back to Home */}
        <Tooltip title={open ? "" : "Home"} placement="right">
          <ListItem 
            button 
            component={Link}
            to="/"
            sx={{
              borderRadius: '8px',
              height: '48px',
              pl: open ? 2 : 'auto',
              justifyContent: open ? 'flex-start' : 'center',
            }}
          >
            <ListItemIcon sx={{ minWidth: open ? 40 : 'auto' }}>
              <HomeIcon />
            </ListItemIcon>
            {open && (
              <ListItemText 
                primary="Home" 
                primaryTypographyProps={{ fontSize: '0.95rem' }} 
              />
            )}
          </ListItem>
        </Tooltip>
      </List>
    </>
  );
  
  // Render based on screen size
  return (
    <>
      {/* Mobile drawer */}
      {isMobile && (
        <>
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': { 
                width: drawerWidth,
                boxSizing: 'border-box',
                boxShadow: '0 0 10px rgba(0,0,0,0.1)' 
              },
            }}
          >
            {navigationContent}
          </Drawer>
          
          {/* Mobile drawer toggle button */}
          <Box 
            sx={{ 
              position: 'fixed', 
              left: 16, 
              bottom: 16, 
              zIndex: 1100 
            }}
          >
            <IconButton
              color="primary"
              onClick={handleDrawerToggle}
              sx={{ 
                backgroundColor: 'white', 
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                '&:hover': { 
                  backgroundColor: 'white',
                  transform: 'scale(1.1)'
                }
              }}
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </>
      )}
      
      {/* Desktop drawer */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          open={open}
          sx={{
            display: { xs: 'none', md: 'block' },
            width: open ? drawerWidth : miniDrawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: open ? drawerWidth : miniDrawerWidth,
              boxSizing: 'border-box',
              overflowX: 'hidden',
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
              boxShadow: '0 0 10px rgba(0,0,0,0.05)'
            },
          }}
        >
          {navigationContent}
        </Drawer>
      )}
    </>
  );
};

export default MainNavigation;