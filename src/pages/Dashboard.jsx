// src/pages/Dashboard.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  CardHeader,
  Paper, 
  CircularProgress, 
  Alert, 
  Fade, 
  Stack, 
  IconButton, 
  Chip,
  Divider,
  Avatar,
  useTheme,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  TextField,
  InputAdornment,
  Tooltip,
  Badge,
  LinearProgress,
  Tab,
  Tabs
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';

// Icons
import AddIcon from '@mui/icons-material/Add';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import ApiIcon from '@mui/icons-material/Api';
import BarChartIcon from '@mui/icons-material/BarChart';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DownloadIcon from '@mui/icons-material/Download';
import FolderIcon from '@mui/icons-material/Folder';
import CodeIcon from '@mui/icons-material/Code';

const Dashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, role, organizationCode } = useAuth();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [viewMode, setViewMode] = useState('grid');
  
  // Action menu state
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  
  // Stats
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalEndpoints: 0,
    activeProjects: 0
  });

  useEffect(() => {
    fetchProjects();
  }, [user, role]);
  
  useEffect(() => {
    // Filter projects based on search term and active tab
    let filtered = [...projects];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(project => 
        project.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        project.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply tab filter
    if (selectedTab === 1) {
      // Recent projects - show last 5 based on createdAt
      filtered = [...filtered].sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return dateB - dateA;
      }).slice(0, 5);
    } else if (selectedTab === 2) {
      // Shared projects - filter those with assignedUsers array that contains user uid
      filtered = filtered.filter(project => 
        project.assignedUsers && Array.isArray(project.assignedUsers) && 
        project.assignedUsers.includes(user?.uid)
      );
    }
    
    setFilteredProjects(filtered);
  }, [searchTerm, projects, selectedTab, user]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const projectsRef = collection(db, 'projects');
      const q = role === "Admin"
        ? query(projectsRef, where("ownerId", "==", user?.uid)) 
        : query(projectsRef, where("assignedUsers", "array-contains", user?.uid));

      const projectSnapshot = await getDocs(q);
      const projectList = projectSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      setProjects(projectList);
      setFilteredProjects(projectList);
      
      // Calculate stats
      const totalEndpoints = projectList.reduce((sum, project) => sum + (project.endpointCount || 0), 0);
      const activeProjects = projectList.filter(project => project.status === 'active').length || projectList.length;
      
      setStats({
        totalProjects: projectList.length,
        totalEndpoints,
        activeProjects
      });
      
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError('Failed to fetch projects. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };
  
  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };
  
  const handleMenuOpen = (event, projectId) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedProjectId(projectId);
  };
  
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedProjectId(null);
  };
  
  const handleViewModeToggle = () => {
    setViewMode(prev => prev === 'grid' ? 'list' : 'grid');
  };
  
  // Format date from timestamp
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Get project progress indicator percentage
  const getProgressPercentage = (project) => {
    // In a real app, calculate based on completed endpoints or another metric
    return project.endpointCount ? Math.min(project.endpointCount * 10, 100) : 0;
  };
  
  // Get project status chip color and label
  const getStatusChip = (project) => {
    const status = project.status || 'draft';
    
    switch(status) {
      case 'active':
        return <Chip size="small" label="Active" color="success" sx={{ fontWeight: 'medium' }}/>;
      case 'draft':
        return <Chip size="small" label="Draft" color="default" sx={{ fontWeight: 'medium' }}/>;
      case 'archived':
        return <Chip size="small" label="Archived" color="error" sx={{ fontWeight: 'medium' }}/>;
      default:
        return <Chip size="small" label="In Progress" color="primary" sx={{ fontWeight: 'medium' }}/>;
    }
  };
  
  // Get project type icon
  const getProjectTypeIcon = (project) => {
    // In a real app, you'd have a project type field
    // For now, just alternate between types
    const iconMap = {
      api: <ApiIcon />,
      data: <BarChartIcon />,
      concept: <LightbulbIcon />
    };
    
    // Use project name's first letter to determine icon (just for demo variety)
    const index = project.name ? project.name.charCodeAt(0) % 3 : 0;
    const types = ['api', 'data', 'concept'];
    return iconMap[types[index]];
  };

  const renderGridView = useMemo(() => {
    if (filteredProjects.length === 0 && !loading) {
      return (
        <Paper 
          elevation={0}
          sx={{ 
            p: 5, 
            textAlign: 'center', 
            borderRadius: 3,
            border: `1px dashed ${theme.palette.divider}`,
            bgcolor: 'background.paper'
          }}
        >
          {searchTerm ? (
            <>
              <Typography variant="h6" fontWeight="medium" gutterBottom>No matching projects found</Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your search or clear the filter to see all your projects.
              </Typography>
              <Button 
                variant="outlined" 
                sx={{ mt: 2 }}
                onClick={() => setSearchTerm('')}
              >
                Clear Search
              </Button>
            </>
          ) : (
            <>
              <Box sx={{ mb: 2, opacity: 0.7 }}>
                <FolderIcon sx={{ fontSize: 60, color: theme.palette.text.secondary }} />
              </Box>
              <Typography variant="h6" fontWeight="medium" gutterBottom>No projects yet</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: '500px', mx: 'auto' }}>
                {role === "Admin" 
                  ? "Start by creating your first API project. Click the 'Create Project' button to get started."
                  : "You don't have any assigned projects yet. Contact your admin to get access to projects."}
              </Typography>
              {role === "Admin" && (
                <Button 
                  variant="contained" 
                  color="primary" 
                  component={Link} 
                  to="/projects/create"
                  startIcon={<AddIcon />}
                >
                  Create First Project
                </Button>
              )}
            </>
          )}
        </Paper>
      );
    }
    
    return (
      <Grid container spacing={3}>
        {filteredProjects.map((project) => (
          <Grid item xs={12} sm={6} md={4} key={project.id}>
            <Fade in timeout={300}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)', 
                  borderRadius: 3,
                  transition: 'all 0.3s ease-in-out',
                  border: '1px solid rgba(0,0,0,0.05)',
                  position: 'relative',
                  overflow: 'visible',
                  '&:hover': { 
                    transform: 'translateY(-5px)', 
                    boxShadow: '0 8px 16px rgba(0,0,0,0.12)',
                    '& .project-actions': {
                      opacity: 1
                    }
                  }
                }}
              >
                {/* Project status indicator */}
                <Box sx={{ position: 'absolute', top: 12, right: 12, zIndex: 2 }}>
                  {getStatusChip(project)}
                </Box>
                
                {/* Project type icon */}
                <Box sx={{ position: 'absolute', top: -15, left: 20, zIndex: 2 }}>
                  <Avatar
                    sx={{ 
                      bgcolor: theme.palette.primary.main,
                      boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                      width: 38,
                      height: 38
                    }}
                  >
                    {getProjectTypeIcon(project)}
                  </Avatar>
                </Box>
                
                <CardContent sx={{ pt: 4, pb: 1, px: 3, flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom color="text.primary" fontWeight="bold" sx={{ mb: 1 }}>
                    {project.name || 'Unnamed Project'}
                  </Typography>
                  
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    gutterBottom
                    sx={{ 
                      minHeight: 40,
                      mb: 2, 
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {project.description || 'No description available'}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CodeIcon sx={{ color: theme.palette.primary.main, mr: 1, fontSize: 18 }} />
                    <Typography variant="body2" fontWeight="medium">
                      {project.endpointCount || 0} Endpoints
                    </Typography>
                  </Box>
                  
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                    Created: {formatDate(project.createdAt)}
                  </Typography>
                  
                  <LinearProgress 
                    variant="determinate" 
                    value={getProgressPercentage(project)} 
                    sx={{ 
                      height: 6, 
                      borderRadius: 3,
                      mb: 1,
                      bgcolor: theme.palette.background.paper
                    }} 
                  />
                </CardContent>
                
                <Divider sx={{ mx: 3 }} />
                
                <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                  <Box className="project-actions" sx={{ 
                    display: 'flex', 
                    gap: 1,
                    opacity: { xs: 1, md: 0.4 },
                    transition: 'opacity 0.2s'
                  }}>
                    <Tooltip title="Edit Project">
                      <IconButton 
                        component={Link} 
                        to={`/projects/${project.id}`} 
                        color="primary"
                        size="small"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="View Endpoints">
                      <IconButton 
                        component={Link} 
                        to={`/projects/${project.id}/endpoints`} 
                        color="secondary"
                        size="small"
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Test API">
                      <IconButton color="default" size="small">
                        <PlayArrowIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  
                  <IconButton 
                    size="small"
                    onClick={(e) => handleMenuOpen(e, project.id)}
                    sx={{ ml: 'auto' }}
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </CardActions>
              </Card>
            </Fade>
          </Grid>
        ))}
      </Grid>
    );
  }, [filteredProjects, loading, searchTerm, role, theme]);
  
  const renderListView = useMemo(() => {
    if (filteredProjects.length === 0 && !loading) {
      return (
        <Paper 
          elevation={0}
          sx={{ 
            p: 5, 
            textAlign: 'center', 
            borderRadius: 3,
            border: `1px dashed ${theme.palette.divider}`,
            bgcolor: 'background.paper'
          }}
        >
          {searchTerm ? (
            <>
              <Typography variant="h6" fontWeight="medium" gutterBottom>No matching projects found</Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your search or clear the filter to see all your projects.
              </Typography>
              <Button 
                variant="outlined" 
                sx={{ mt: 2 }}
                onClick={() => setSearchTerm('')}
              >
                Clear Search
              </Button>
            </>
          ) : (
            <>
              <Box sx={{ mb: 2, opacity: 0.7 }}>
                <FolderIcon sx={{ fontSize: 60, color: theme.palette.text.secondary }} />
              </Box>
              <Typography variant="h6" fontWeight="medium" gutterBottom>No projects yet</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: '500px', mx: 'auto' }}>
                {role === "Admin" 
                  ? "Start by creating your first API project. Click the 'Create Project' button to get started."
                  : "You don't have any assigned projects yet. Contact your admin to get access to projects."}
              </Typography>
              {role === "Admin" && (
                <Button 
                  variant="contained" 
                  color="primary" 
                  component={Link} 
                  to="/projects/create"
                  startIcon={<AddIcon />}
                >
                  Create First Project
                </Button>
              )}
            </>
          )}
        </Paper>
      );
    }
    
    return (
      <Card 
        elevation={0}
        sx={{ 
          borderRadius: 3,
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          overflow: 'hidden',
          border: '1px solid rgba(0,0,0,0.05)',
        }}
      >
        {filteredProjects.map((project, index) => (
          <React.Fragment key={project.id}>
            {index > 0 && <Divider />}
            <Box 
              sx={{ 
                p: 2,
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.2s',
                '&:hover': { 
                  bgcolor: 'rgba(0,0,0,0.01)',
                  '& .project-actions': {
                    opacity: 1
                  }
                }
              }}
            >
              <Box sx={{ mr: 2 }}>
                <Avatar
                  sx={{ 
                    bgcolor: theme.palette.primary.main,
                    width: 40,
                    height: 40
                  }}
                >
                  {getProjectTypeIcon(project)}
                </Avatar>
              </Box>
              
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="subtitle1" fontWeight="bold" noWrap>
                    {project.name || 'Unnamed Project'}
                  </Typography>
                  <Box sx={{ ml: 2 }}>
                    {getStatusChip(project)}
                  </Box>
                </Box>
                
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ 
                    mb: 0.5,
                    display: '-webkit-box',
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {project.description || 'No description available'}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Typography variant="caption" color="text.secondary">
                    {project.endpointCount || 0} Endpoints
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Created: {formatDate(project.createdAt)}
                  </Typography>
                </Box>
              </Box>
              
              <Box 
                className="project-actions" 
                sx={{ 
                  display: 'flex', 
                  gap: 1,
                  opacity: { xs: 1, md: 0.4 },
                  transition: 'opacity 0.2s',
                  ml: 2
                }}
              >
                <Tooltip title="Edit Project">
                  <IconButton 
                    component={Link} 
                    to={`/projects/${project.id}`} 
                    color="primary"
                    size="small"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="View Endpoints">
                  <IconButton 
                    component={Link} 
                    to={`/projects/${project.id}/endpoints`} 
                    color="secondary"
                    size="small"
                  >
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Test API">
                  <IconButton color="default" size="small">
                    <PlayArrowIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                
                <IconButton 
                  size="small"
                  onClick={(e) => handleMenuOpen(e, project.id)}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </React.Fragment>
        ))}
      </Card>
    );
  }, [filteredProjects, loading, searchTerm, role, theme]);

  return (
    <Box sx={{ p: 3 }}>
      {/* Welcome Card */}
      <Paper 
        elevation={0}
        sx={{ 
          p: { xs: 3, md: 4 }, 
          mb: 4, 
          borderRadius: 3,
          boxShadow: '0 6px 18px rgba(0, 0, 0, 0.06)',
          background: 'linear-gradient(135deg, #F68B1F, #e85d26)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
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
        
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Welcome back, {user?.displayName || user?.email?.split('@')[0] || 'User'}!
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
                You're logged in as: <strong>{role}</strong>
              </Typography>
              
              {organizationCode && (
                <Chip 
                  icon={<CodeIcon />} 
                  label={`Organization: ${organizationCode}`}
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.15)', 
                    color: 'white',
                    '& .MuiChip-icon': { color: 'white' }
                  }}
                />
              )}
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: { xs: 'flex-start', md: 'flex-end' },
                gap: 4, 
                mt: { xs: 2, md: 0 }
              }}>
                <Box sx={{ textAlign: { xs: 'left', md: 'center' } }}>
                  <Typography variant="h3" fontWeight="bold">
                    {stats.totalProjects}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>Projects</Typography>
                </Box>
                
                <Box sx={{ textAlign: { xs: 'left', md: 'center' } }}>
                  <Typography variant="h3" fontWeight="bold">
                    {stats.totalEndpoints}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>Endpoints</Typography>
                </Box>
                
                <Box sx={{ textAlign: { xs: 'left', md: 'center' } }}>
                  <Typography variant="h3" fontWeight="bold">
                    {stats.activeProjects}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>Active</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Projects Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
          mb: 3
        }}>
          <Tabs 
            value={selectedTab} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: '44px',
              '& .MuiTab-root': {
                minHeight: '44px',
                py: 1
              }
            }}
          >
            <Tab label="All Projects" />
            <Tab label="Recent" />
            <Tab label="Shared with me" />
          </Tabs>
          
          <Box sx={{ 
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            ml: 'auto'
          }}>
            <TextField
              placeholder="Search projects..."
              size="small"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{
                width: { xs: '100%', sm: '220px' },
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  bgcolor: 'background.paper'
                }
              }}
            />
            
            <Tooltip title={viewMode === 'grid' ? 'List View' : 'Grid View'}>
              <IconButton
                color="primary"
                onClick={handleViewModeToggle}
                sx={{ display: { xs: 'none', sm: 'flex' } }}
              >
                {viewMode === 'grid' ? <ViewListIcon /> : <ViewModuleIcon />}
              </IconButton>
            </Tooltip>
            
            {role === "Admin" && (
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<AddIcon />}
                component={Link} 
                to="/projects/create"
                sx={{
                  bgcolor: theme.palette.primary.main,
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(246, 139, 31, 0.2)',
                  '&:hover': {
                    bgcolor: theme.palette.primary.dark,
                    boxShadow: '0 6px 16px rgba(246, 139, 31, 0.25)',
                  }
                }}
              >
                Create Project
              </Button>
            )}
          </Box>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert 
            severity="error" 
            sx={{ mb: 3, borderRadius: 2 }}
          >
            {error}
          </Alert>
        ) : (
          viewMode === 'grid' ? renderGridView : renderListView
        )}
      </Box>
      
      {/* Project Action Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { boxShadow: '0 4px 12px rgba(0,0,0,0.15)', borderRadius: 2 }
        }}
      >
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Project</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ color: 'error' }}>Delete</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <ContentCopyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Duplicate</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Dashboard;