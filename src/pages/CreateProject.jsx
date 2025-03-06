import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Paper, TextField, Button, CircularProgress, Alert 
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { createProject } from '../services/projectService'; // Firebase functions

const CreateProject = () => {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [projectData, setProjectData] = useState({
    name: '',
    description: '',
    assignedTo: '' // Admin assigns the project to a user
  });

  useEffect(() => {
    if (role !== 'Admin') {
      setError("Only admins can create projects.");
    }
  }, [role]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProjectData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (role !== 'Admin') return; // Prevent unauthorized access

    setLoading(true);
    try {
      await createProject({ 
        ...projectData, 
        ownerId: user.uid, 
        assignedTo: projectData.assignedTo || null 
      });
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to create project.');
    }
    setLoading(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Create New API Project
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Project Name"
            name="name"
            value={projectData.name}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />

          <TextField
            label="Description"
            name="description"
            value={projectData.description}
            onChange={handleChange}
            fullWidth
            margin="normal"
            multiline
            rows={4}
          />

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Button variant="outlined" onClick={() => navigate('/dashboard')}>
              Cancel
            </Button>
            
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={loading || role !== 'Admin'}
            >
              {loading ? <CircularProgress size={24} /> : 'Create Project'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default CreateProject;
