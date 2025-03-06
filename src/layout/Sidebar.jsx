// src/layout/Sidebar.jsx
import React from 'react';
import { Box, List, ListItem, ListItemIcon, ListItemText, Divider, useTheme } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CodeIcon from '@mui/icons-material/Code';
import SettingsIcon from '@mui/icons-material/Settings';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { ROLES } from '../firebase/auth';

const Sidebar = () => {
  const theme = useTheme();
  const location = useLocation();
  const { isAuthenticated, role } = useAuth();
  
  // Don't show sidebar on login and register pages
  if (location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/') {
    return null;
  }
  
  // Only show sidebar for authenticated users
  if (!isAuthenticated) {
    return null;
  }
  
  const isActive = (path) => location.pathname === path;
  
  return (
    <Box
      sx={{
        width: 240,
        flexShrink: 0,
        borderRight: `1px solid ${theme.palette.divider}`,
        height: '100vh',
        position: 'sticky',
        top: 0,
        background: theme.palette.background.paper,
        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
        zIndex: 1,
        display: { xs: 'none', md: 'block' }
      }}
    >
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <img 
          src="/logo192.png" 
          alt="TDS Logo" 
          style={{ 
            width: 80, 
            height: 'auto',
            marginBottom: theme.spacing(2)
          }} 
        />
      </Box>
      
      <Divider />
      
      <List component="nav">
        {/* Dashboard */}
        <ListItem 
          button 
          component={Link} 
          to={role === ROLES.ADMIN ? "/admin-dashboard" : "/dashboard"} 
          selected={isActive(role === ROLES.ADMIN ? "/admin-dashboard" : "/dashboard")}
          sx={{
            my: 1,
            borderRadius: '0 24px 24px 0',
            ml: 1,
            width: 'calc(100% - 16px)',
            '&.Mui-selected': {
              backgroundColor: `${theme.palette.primary.main}20`,
              color: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: `${theme.palette.primary.main}30`,
              }
            }
          }}
        >
          <ListItemIcon>
            {role === ROLES.ADMIN ? 
              <AdminPanelSettingsIcon color={isActive(role === ROLES.ADMIN ? "/admin-dashboard" : "/dashboard") ? "primary" : "inherit"} /> : 
              <DashboardIcon color={isActive(role === ROLES.ADMIN ? "/admin-dashboard" : "/dashboard") ? "primary" : "inherit"} />
            }
          </ListItemIcon>
          <ListItemText 
            primary="Dashboard" 
            sx={{ 
              '& .MuiTypography-root': { 
                fontWeight: isActive(role === ROLES.ADMIN ? "/admin-dashboard" : "/dashboard") ? 'bold' : 'normal' 
              } 
            }} 
          />
        </ListItem>
        
        {/* Projects */}
        <ListItem 
          button 
          component={Link} 
          to="/projects" 
          selected={location.pathname.includes('/projects')}
          sx={{
            my: 1,
            borderRadius: '0 24px 24px 0',
            ml: 1,
            width: 'calc(100% - 16px)',
            '&.Mui-selected': {
              backgroundColor: `${theme.palette.primary.main}20`,
              color: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: `${theme.palette.primary.main}30`,
              }
            }
          }}
        >
          <ListItemIcon>
            <CodeIcon color={location.pathname.includes('/projects') ? "primary" : "inherit"} />
          </ListItemIcon>
          <ListItemText 
            primary="Projects" 
            sx={{ 
              '& .MuiTypography-root': { 
                fontWeight: location.pathname.includes('/projects') ? 'bold' : 'normal' 
              } 
            }} 
          />
        </ListItem>
        
        {/* Settings */}
        <ListItem 
          button 
          component={Link} 
          to="/profile" 
          selected={location.pathname === '/profile'}
          sx={{
            my: 1,
            borderRadius: '0 24px 24px 0',
            ml: 1,
            width: 'calc(100% - 16px)',
            '&.Mui-selected': {
              backgroundColor: `${theme.palette.primary.main}20`,
              color: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: `${theme.palette.primary.main}30`,
              }
            }
          }}
        >
          <ListItemIcon>
            <SettingsIcon color={isActive('/profile') ? "primary" : "inherit"} />
          </ListItemIcon>
          <ListItemText 
            primary="Settings" 
            sx={{ 
              '& .MuiTypography-root': { 
                fontWeight: isActive('/profile') ? 'bold' : 'normal' 
              } 
            }} 
          />
        </ListItem>
      </List>
    </Box>
  );
};

export default Sidebar;