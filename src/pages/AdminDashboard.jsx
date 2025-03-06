// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  CircularProgress, 
  Alert, 
  IconButton, 
  FormControl, 
  Select, 
  MenuItem, 
  Tooltip, 
  Fade,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
  useTheme,
  Avatar,
  Button,
  InputAdornment,
  TextField,
  TablePagination
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import GroupsIcon from '@mui/icons-material/Groups';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import { db } from '../firebase/config';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ROLES } from '../firebase/auth'; // Import ROLES constant

const AdminDashboard = () => {
  const theme = useTheme();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalUsers: 0,
    adminUsers: 0,
    regularUsers: 0
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    // Filter users based on search term
    if (searchTerm) {
      const filtered = users.filter(user => 
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersCollection = collection(db, 'users');
      const userSnapshot = await getDocs(usersCollection);
      const userList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      setUsers(userList);
      setFilteredUsers(userList);
      
      // Calculate stats
      const adminCount = userList.filter(user => user.role === ROLES.ADMIN).length;
      setStats({
        totalUsers: userList.length,
        adminUsers: adminCount,
        regularUsers: userList.length - adminCount
      });
    } catch (err) {
      console.error("Error fetching users:", err);
      setError('Failed to fetch users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      
      // Update local state
      const updatedUsers = users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      );
      setUsers(updatedUsers);
      
      // Recalculate stats
      const adminCount = updatedUsers.filter(user => user.role === ROLES.ADMIN).length;
      setStats({
        totalUsers: updatedUsers.length,
        adminUsers: adminCount,
        regularUsers: updatedUsers.length - adminCount
      });
      
      // Show success message
      setSuccessMessage('User role updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Error updating role:", err);
      setError('Failed to update role. Please try again.');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDeleteUser = async (userId, email) => {
    if (!window.confirm(`Are you sure you want to delete user: ${email}?`)) return;
    
    try {
      await deleteDoc(doc(db, 'users', userId));
      
      // Update local state
      const updatedUsers = users.filter(user => user.id !== userId);
      setUsers(updatedUsers);
      
      // Recalculate stats
      const adminCount = updatedUsers.filter(user => user.role === ROLES.ADMIN).length;
      setStats({
        totalUsers: updatedUsers.length,
        adminUsers: adminCount,
        regularUsers: updatedUsers.length - adminCount
      });
      
      // Show success message
      setSuccessMessage('User deleted successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Error deleting user:", err);
      setError('Failed to delete user. Please try again.');
      setTimeout(() => setError(null), 3000);
    }
  };

  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0); // Reset to first page when searching
  };

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Get user initials for avatar
  const getUserInitials = (email) => {
    if (!email) return '?';
    const parts = email.split('@');
    if (parts[0]) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };

  // Generate random color for avatar based on email
  const getAvatarColor = (email) => {
    const colors = [
      '#F44336', '#E91E63', '#9C27B0', '#673AB7', 
      '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4',
      '#009688', '#4CAF50', '#8BC34A', '#CDDC39',
      '#FFC107', '#FF9800', '#FF5722'
    ];
    
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      hash = email.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <Box sx={{ 
      p: { xs: 2, md: 3 },
      backgroundColor: '#f8f9fc',
      minHeight: '100vh'
    }}>
      {/* Dashboard Header */}
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
        
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h4" fontWeight="bold" color="#fff">
            Admin Dashboard
          </Typography>
          <Typography variant="body1" sx={{ mt: 1, color: 'rgba(255, 255, 255, 0.9)' }}>
            Manage all users, update roles, and control access to the platform.
          </Typography>
        </Box>
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card 
            elevation={0}
            sx={{ 
              borderRadius: '12px',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
              height: '100%',
              transition: 'transform 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)',
              }
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" fontWeight="medium" color="text.secondary">
                  Total Users
                </Typography>
                <Avatar 
                  sx={{ 
                    bgcolor: 'rgba(33, 150, 243, 0.1)', 
                    color: '#2196F3',
                    width: 48,
                    height: 48
                  }}
                >
                  <PeopleAltIcon />
                </Avatar>
              </Box>
              <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
                {loading ? <CircularProgress size={24} /> : stats.totalUsers}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Registered platform users
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Card 
            elevation={0}
            sx={{ 
              borderRadius: '12px',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
              height: '100%',
              transition: 'transform 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)',
              }
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" fontWeight="medium" color="text.secondary">
                  Admin Users
                </Typography>
                <Avatar 
                  sx={{ 
                    bgcolor: 'rgba(244, 67, 54, 0.1)', 
                    color: '#F44336',
                    width: 48,
                    height: 48
                  }}
                >
                  <SupervisorAccountIcon />
                </Avatar>
              </Box>
              <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
                {loading ? <CircularProgress size={24} /> : stats.adminUsers}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Users with admin privileges
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Card 
            elevation={0}
            sx={{ 
              borderRadius: '12px',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
              height: '100%',
              transition: 'transform 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)',
              }
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" fontWeight="medium" color="text.secondary">
                  Regular Users
                </Typography>
                <Avatar 
                  sx={{ 
                    bgcolor: 'rgba(76, 175, 80, 0.1)', 
                    color: '#4CAF50',
                    width: 48,
                    height: 48
                  }}
                >
                  <GroupsIcon />
                </Avatar>
              </Box>
              <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
                {loading ? <CircularProgress size={24} /> : stats.regularUsers}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Standard platform users
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Messages */}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
          {successMessage}
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* User Management Section */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      ) : (
        <Fade in timeout={500}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 0, 
              borderRadius: '16px', 
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
              overflow: 'hidden'
            }}
          >
            <Box sx={{ 
              p: 3, 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2
            }}>
              <Typography variant="h5" fontWeight="bold">
                User Management
              </Typography>
              
              <Box sx={{ 
                display: 'flex', 
                gap: 2,
                alignItems: 'center',
                flexWrap: 'wrap'
              }}>
                <TextField
                  placeholder="Search users..."
                  variant="outlined"
                  size="small"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    minWidth: { xs: '100%', sm: '250px' },
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                      backgroundColor: '#F1F5F9',
                    }
                  }}
                />
                
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<PersonAddIcon />}
                  sx={{
                    borderRadius: '8px',
                    textTransform: 'none',
                    boxShadow: 'none',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    }
                  }}
                >
                  Add User
                </Button>
              </Box>
            </Box>
            
            <Divider />
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#F8FAFC' }}>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>User</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Role</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Joined</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }} align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                        <Box sx={{ textAlign: 'center' }}>
                          <PersonOffIcon sx={{ fontSize: 40, color: '#CBD5E1', mb: 1 }} />
                          <Typography variant="body1" color="text.secondary">
                            No users found
                          </Typography>
                          {searchTerm && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                              Try adjusting your search criteria
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map(user => (
                        <TableRow 
                          key={user.id} 
                          hover 
                          sx={{ 
                            transition: '0.2s',
                            '&:hover': { backgroundColor: '#F1F5F9' } 
                          }}
                        >
                          <TableCell sx={{ py: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar 
                                sx={{ 
                                  bgcolor: getAvatarColor(user.email),
                                  color: '#fff',
                                  mr: 2 
                                }}
                              >
                                {getUserInitials(user.email)}
                              </Avatar>
                              <Box>
                                <Typography variant="body1" fontWeight="medium">
                                  {user.email}
                                </Typography>
                                {user.organizationCode && (
                                  <Typography variant="caption" color="text.secondary">
                                    Org: {user.organizationCode}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <FormControl
                              sx={{ 
                                minWidth: 120,
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: '8px',
                                }
                              }}
                              size="small"
                            >
                              <Select
                                value={user.role || ROLES.USER}
                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                displayEmpty
                                renderValue={(value) => (
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    {value === ROLES.ADMIN ? (
                                      <Chip 
                                        icon={<AdminPanelSettingsIcon sx={{ fontSize: '1rem !important' }} />} 
                                        label="Admin" 
                                        size="small"
                                        sx={{ 
                                          backgroundColor: 'rgba(244, 67, 54, 0.1)',
                                          color: '#F44336',
                                          fontWeight: 500,
                                          borderRadius: '4px',
                                        }}
                                      />
                                    ) : (
                                      <Chip 
                                        icon={<PeopleAltIcon sx={{ fontSize: '1rem !important' }} />} 
                                        label="User" 
                                        size="small"
                                        sx={{ 
                                          backgroundColor: 'rgba(33, 150, 243, 0.1)',
                                          color: '#2196F3',
                                          fontWeight: 500,
                                          borderRadius: '4px',
                                        }}
                                      />
                                    )}
                                  </Box>
                                )}
                              >
                                <MenuItem value={ROLES.USER}>User</MenuItem>
                                <MenuItem value={ROLES.ADMIN}>Admin</MenuItem>
                              </Select>
                            </FormControl>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell align="center" sx={{ py: 2 }}>
                            <Tooltip title="Delete User">
                              <IconButton 
                                color="error"
                                onClick={() => handleDeleteUser(user.id, user.email)}
                                sx={{ 
                                  transition: '0.2s',
                                  '&:hover': { 
                                    backgroundColor: 'rgba(244, 67, 54, 0.1)',
                                  }
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredUsers.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
        </Fade>
      )}
    </Box>
  );
};

export default AdminDashboard;