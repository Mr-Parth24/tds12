// src/pages/ManageEndpoints.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useAuth } from '../context/AuthContext';
import { getProjectDetails } from '../services/projectService';
import { db } from '../firebase/config';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc, getDoc } from 'firebase/firestore';

const ManageEndpoints = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { user, role } = useAuth();
  
  const [endpoints, setEndpoints] = useState([]);
  const [projectName, setProjectName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjectAndEndpoints = async () => {
      setLoading(true);
      try {
        // Fetch project details
        const projectDoc = await getDoc(doc(db, 'projects', projectId));
        
        if (!projectDoc.exists()) {
          setError('Project not found');
          setLoading(false);
          return;
        }
        
        const projectData = projectDoc.data();
        setProjectName(projectData.name);
        
        // Check authorization
        if (role !== 'Admin' && projectData.assignedUserId !== user.uid) {
          setError('You do not have access to this project');
          setLoading(false);
          return;
        }
        
        // Fetch endpoints for this project
        const endpointsRef = collection(db, 'endpoints');
        const q = query(endpointsRef, where('projectId', '==', projectId));
        const endpointSnapshot = await getDocs(q);
        
        if (endpointSnapshot.empty) {
          // No endpoints yet, using empty array
          setEndpoints([]);
        } else {
          const endpointList = endpointSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setEndpoints(endpointList);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load project data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjectAndEndpoints();
  }, [projectId, user, role]);

  // Function to get chip color based on HTTP method
  const getMethodColor = (method) => {
    switch (method) {
      case 'GET': return 'info';
      case 'POST': return 'success';
      case 'PUT': return 'warning';
      case 'DELETE': return 'error';
      default: return 'default';
    }
  };

  // Delete endpoint function
  const handleDelete = async (endpointId) => {
    if (!window.confirm('Are you sure you want to delete this endpoint?')) return;
    
    try {
      await deleteDoc(doc(db, 'endpoints', endpointId));
      // Update local state to remove the deleted endpoint
      setEndpoints(endpoints.filter(endpoint => endpoint.id !== endpointId));
    } catch (err) {
      console.error('Error deleting endpoint:', err);
      setError('Failed to delete endpoint. Please try again.');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button 
          variant="outlined"
          component={Link}
          to="/dashboard"
          sx={{ mt: 2 }}
        >
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Manage Endpoints - {projectName}
        </Typography>
        
        <Button 
          variant="contained" 
          color="primary"
          startIcon={<AddIcon />}
          component={Link}
          to={`/projects/${projectId}/endpoints/create`}
        >
          New Endpoint
        </Button>
      </Box>
      
      <Paper sx={{ p: 2 }}>
        <List>
          {endpoints.length === 0 ? (
            <ListItem>
              <ListItemText 
                primary="No endpoints found" 
                secondary="Click the 'New Endpoint' button to create your first API endpoint"
              />
            </ListItem>
          ) : (
            endpoints.map((endpoint, index) => (
              <React.Fragment key={endpoint.id}>
                {index > 0 && <Divider />}
                <ListItem>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip 
                          label={endpoint.method} 
                          color={getMethodColor(endpoint.method)}
                          size="small"
                        />
                        <Typography variant="subtitle1">
                          {endpoint.name}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" component="span" sx={{ display: 'block' }}>
                          Path: {endpoint.path}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {endpoint.description}
                        </Typography>
                      </>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton 
                      edge="end" 
                      aria-label="edit"
                      onClick={() => navigate(`/projects/${projectId}/endpoints/${endpoint.id}/edit`)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      edge="end" 
                      aria-label="delete" 
                      onClick={() => handleDelete(endpoint.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              </React.Fragment>
            ))
          )}
        </List>
      </Paper>
      
      <Box sx={{ mt: 3 }}>
        <Button 
          variant="outlined"
          component={Link}
          to="/dashboard"
        >
          Back to Dashboard
        </Button>
      </Box>
    </Box>
  );
};

export default ManageEndpoints;