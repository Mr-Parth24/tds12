// src/pages/EndpointForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material';

const EndpointForm = () => {
  const navigate = useNavigate();
  const { projectId, endpointId } = useParams();
  const isEditMode = !!endpointId;
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    method: 'GET',
    path: '',
    description: ''
  });

  useEffect(() => {
    // In a real app, this would fetch the endpoint data if in edit mode
    if (isEditMode) {
      // Mock data for demo
      setFormData({
        name: 'Get Users',
        method: 'GET',
        path: '/api/users',
        description: 'Retrieve all users'
      });
    }
  }, [isEditMode, endpointId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // In a real app, this would be an API call to create/update an endpoint
    // For now, we'll just simulate a delay and redirect
    setTimeout(() => {
      setLoading(false);
      navigate(`/projects/${projectId}/endpoints`);
    }, 1000);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {isEditMode ? 'Edit' : 'Create'} API Endpoint
      </Typography>
      
      <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Endpoint Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          
          <FormControl fullWidth margin="normal" required>
            <InputLabel>HTTP Method</InputLabel>
            <Select
              name="method"
              value={formData.method}
              onChange={handleChange}
              label="HTTP Method"
            >
              <MenuItem value="GET">GET</MenuItem>
              <MenuItem value="POST">POST</MenuItem>
              <MenuItem value="PUT">PUT</MenuItem>
              <MenuItem value="DELETE">DELETE</MenuItem>
              <MenuItem value="PATCH">PATCH</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            label="Path"
            name="path"
            value={formData.path}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            placeholder="/api/resource"
          />
          
          <TextField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            fullWidth
            margin="normal"
            multiline
            rows={3}
          />
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Button 
              variant="outlined" 
              onClick={() => navigate(`/projects/${projectId}/endpoints`)}
            >
              Cancel
            </Button>
            
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : (isEditMode ? 'Update Endpoint' : 'Create Endpoint')}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default EndpointForm;