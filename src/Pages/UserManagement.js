import React, { useState, useEffect, useRef } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Alert,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Tabs,
  Tab,
  Badge,
  LinearProgress,
  Switch,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Person,
  Block,
  Flag,
  Verified,
  Warning,
  Security,
  Assignment,
  Visibility,
  Edit,
  Delete,
  Search,
  FilterList,
  Download,
  Refresh,
  CheckCircle,
  Cancel,
  Info,
  Error,
  AdminPanelSettings,
  SupervisorAccount,
  PersonAdd,
  Shield
} from '@mui/icons-material';
import axios from 'axios';
import io from 'socket.io-client';
import { useAuthContext } from '../context/AuthContext';
import { API_URL } from '../config';
import './UserManagement.css';

const UserManagement = () => {
  const { currentUser } = useAuthContext();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [kycQueue, setKycQueue] = useState([]);
  const [complianceEvents, setComplianceEvents] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedKyc, setSelectedKyc] = useState(null);
  const [userDialog, setUserDialog] = useState(false);
  const [kycDialog, setKycDialog] = useState(false);
  const [complianceDialog, setComplianceDialog] = useState(false);
  const [actionDialog, setActionDialog] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const socketRef = useRef(null);
  
  // Filters and pagination
  const [userFilters, setUserFilters] = useState({
    page: 1,
    limit: 20,
    search: '',
    kycStatus: '',
    userTier: '',
    status: '',
    sortBy: 'created_at',
    sortOrder: 'DESC'
  });
  
  const [kycFilters, setKycFilters] = useState({
    page: 1,
    limit: 20,
    status: 'pending',
    priority: '',
    sortBy: 'submitted_at',
    sortOrder: 'ASC'
  });
  
  const [complianceFilters, setComplianceFilters] = useState({
    page: 1,
    limit: 20,
    severity: '',
    eventType: '',
    status: '',
    sortBy: 'created_at',
    sortOrder: 'DESC'
  });
  
  // Action states
  const [actionType, setActionType] = useState('');
  const [actionData, setActionData] = useState({
    status: '',
    reason: '',
    role: '',
    flagType: '',
    decision: '',
    comments: ''
  });
  
  // Statistics
  const [userStats, setUserStats] = useState({});
  const [complianceStats, setComplianceStats] = useState({});

  const headers = {
    Authorization: `Bearer ${currentUser}`
  };

  const userStatuses = ['active', 'suspended', 'banned', 'inactive'];
  const userRoles = ['user', 'moderator', 'admin', 'auditor', 'viewer'];
  const flagTypes = ['suspicious_activity', 'fraud', 'money_laundering', 'sanctions_check', 'other'];
  const kycStatuses = ['pending', 'approved', 'rejected', 'under_review'];
  const complianceSeverities = ['info', 'warning', 'critical'];
  const complianceTypes = ['suspicious_activity', 'aml_alert', 'sanctions_match', 'kyc_review', 'user_flagged'];

  useEffect(() => {
    initializeSocket();
    fetchUserStats();
    fetchComplianceStats();
    
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (activeTab === 0) {
      fetchUsers();
    } else if (activeTab === 1) {
      fetchKycQueue();
    } else if (activeTab === 2) {
      fetchComplianceEvents();
    }
  }, [activeTab, userFilters, kycFilters, complianceFilters]);

  const initializeSocket = () => {
    socketRef.current = io(API_URL, {
      auth: {
        token: currentUser
      }
    });

    socketRef.current.on('connect', () => {
      console.log('Connected to user management');
      socketRef.current.emit('join_admin_dashboard');
    });

    socketRef.current.on('compliance_alert', (alert) => {
      setSuccess(`New compliance alert: ${alert.description}`);
      if (activeTab === 2) {
        fetchComplianceEvents();
      }
    });

    socketRef.current.on('kyc_update', (update) => {
      setSuccess(`KYC status updated for user`);
      if (activeTab === 1) {
        fetchKycQueue();
      }
    });
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/admindashboard/users`, {
        headers,
        params: userFilters
      });

      if (response.data.success) {
        setUsers(response.data.data.users);
        setError(null);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchKycQueue = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/admindashboard/kyc/queue`, {
        headers,
        params: kycFilters
      });

      if (response.data.success) {
        setKycQueue(response.data.data.applications);
        setError(null);
      }
    } catch (error) {
      console.error('Error fetching KYC queue:', error);
      setError('Failed to fetch KYC queue');
    } finally {
      setLoading(false);
    }
  };

  const fetchComplianceEvents = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/admindashboard/compliance/events`, {
        headers,
        params: complianceFilters
      });

      if (response.data.success) {
        setComplianceEvents(response.data.data.events);
        setError(null);
      }
    } catch (error) {
      console.error('Error fetching compliance events:', error);
      setError('Failed to fetch compliance events');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/admindashboard/statistics/users`, { headers });
      if (response.data.success) {
        setUserStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching user statistics:', error);
    }
  };

  const fetchComplianceStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/admindashboard/statistics/compliance`, { headers });
      if (response.data.success) {
        setComplianceStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching compliance statistics:', error);
    }
  };

  const handleUserAction = async () => {
    try {
      setLoading(true);
      let response;

      switch (actionType) {
        case 'status':
          response = await axios.put(
            `${API_URL}/admindashboard/users/${selectedUser.id}/status`,
            { status: actionData.status, reason: actionData.reason },
            { headers }
          );
          break;
        case 'flag':
          response = await axios.post(
            `${API_URL}/admindashboard/users/${selectedUser.id}/flag`,
            { flagType: actionData.flagType, reason: actionData.reason },
            { headers }
          );
          break;
        case 'role':
          response = await axios.put(
            `${API_URL}/admindashboard/users/${selectedUser.id}/role`,
            { role: actionData.role },
            { headers }
          );
          break;
      }

      if (response.data.success) {
        setSuccess(response.data.message);
        setActionDialog(false);
        fetchUsers();
        setError(null);
      }
    } catch (error) {
      console.error('Error performing user action:', error);
      setError('Failed to perform action');
    } finally {
      setLoading(false);
    }
  };

  const handleKycReview = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${API_URL}/admindashboard/kyc/applications/${selectedKyc.id}/review`,
        { 
          decision: actionData.decision, 
          comments: actionData.comments 
        },
        { headers }
      );

      if (response.data.success) {
        setSuccess(response.data.message);
        setKycDialog(false);
        fetchKycQueue();
        setError(null);
      }
    } catch (error) {
      console.error('Error reviewing KYC:', error);
      setError('Failed to review KYC application');
    } finally {
      setLoading(false);
    }
  };

  const openUserAction = (user, type) => {
    setSelectedUser(user);
    setActionType(type);
    setActionData({
      status: user.status || '',
      reason: '',
      role: user.role || '',
      flagType: '',
      decision: '',
      comments: ''
    });
    setActionDialog(true);
  };

  const openKycReview = (kyc) => {
    setSelectedKyc(kyc);
    setActionData({
      decision: '',
      comments: ''
    });
    setKycDialog(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'suspended': return 'warning';
      case 'banned': return 'error';
      case 'verified': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'default';
    }
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num || 0);
  };

  return (
    <Box className="user-management">
      {/* Header */}
      <Box className="management-header">
        <Typography variant="h4" className="management-title">
          User Management & Compliance
        </Typography>
        <Box className="management-controls">
          <Tooltip title="Refresh Data">
            <IconButton onClick={() => {
              if (activeTab === 0) fetchUsers();
              else if (activeTab === 1) fetchKycQueue();
              else if (activeTab === 2) fetchComplianceEvents();
            }}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} style={{ marginBottom: '20px' }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="stat-card">
            <CardContent>
              <Box className="stat-content">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Users
                  </Typography>
                  <Typography variant="h4">
                    {formatNumber(userStats.total_users)}
                  </Typography>
                </Box>
                <Avatar className="stat-icon">
                  <Person />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="stat-card">
            <CardContent>
              <Box className="stat-content">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Verified Users
                  </Typography>
                  <Typography variant="h4">
                    {formatNumber(userStats.verified_users)}
                  </Typography>
                </Box>
                <Avatar className="stat-icon verified">
                  <Verified />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="stat-card">
            <CardContent>
              <Box className="stat-content">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Pending KYC
                  </Typography>
                  <Typography variant="h4">
                    {formatNumber(userStats.pending_kyc)}
                  </Typography>
                </Box>
                <Avatar className="stat-icon warning">
                  <Assignment />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="stat-card">
            <CardContent>
              <Box className="stat-content">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Open Compliance Events
                  </Typography>
                  <Typography variant="h4">
                    {formatNumber(complianceStats.open_events)}
                  </Typography>
                </Box>
                <Avatar className="stat-icon error">
                  <Security />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Error/Success Alerts */}
      {error && (
        <Alert severity="error" style={{ marginBottom: '20px' }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" style={{ marginBottom: '20px' }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} style={{ marginBottom: '20px' }}>
        <Tab 
          label={
            <Badge badgeContent={userStats.new_users_24h} color="primary">
              User Management
            </Badge>
          } 
        />
        <Tab 
          label={
            <Badge badgeContent={userStats.pending_kyc} color="warning">
              KYC Review
            </Badge>
          } 
        />
        <Tab 
          label={
            <Badge badgeContent={complianceStats.open_events} color="error">
              Compliance Events
            </Badge>
          } 
        />
      </Tabs>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Card>
          <CardContent>
            <Box className="table-header">
              <Typography variant="h6">User Management</Typography>
              <Box className="table-controls">
                <TextField
                  size="small"
                  placeholder="Search users..."
                  value={userFilters.search}
                  onChange={(e) => setUserFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                  InputProps={{
                    startAdornment: <Search />
                  }}
                />
                <FormControl size="small" style={{ minWidth: 120 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={userFilters.status}
                    label="Status"
                    onChange={(e) => setUserFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
                  >
                    <MenuItem value="">All</MenuItem>
                    {userStatuses.map(status => (
                      <MenuItem key={status} value={status}>{status}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" style={{ minWidth: 120 }}>
                  <InputLabel>KYC Status</InputLabel>
                  <Select
                    value={userFilters.kycStatus}
                    label="KYC Status"
                    onChange={(e) => setUserFilters(prev => ({ ...prev, kycStatus: e.target.value, page: 1 }))}
                  >
                    <MenuItem value="">All</MenuItem>
                    {kycStatuses.map(status => (
                      <MenuItem key={status} value={status}>{status}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>

            {loading && <LinearProgress style={{ marginBottom: '20px' }} />}

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>KYC Status</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Joined</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Box className="user-cell">
                          <Avatar>{user.username?.charAt(0).toUpperCase()}</Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {user.username}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              ID: {user.id}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip 
                          label={user.status} 
                          color={getStatusColor(user.status)} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={user.kyc_status || 'unverified'} 
                          color={getStatusColor(user.kyc_status)} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={user.role || 'user'} 
                          variant="outlined" 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Box className="action-buttons">
                          <Tooltip title="View Profile">
                            <IconButton size="small" onClick={() => {
                              setSelectedUser(user);
                              setUserDialog(true);
                            }}>
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Change Status">
                            <IconButton size="small" onClick={() => openUserAction(user, 'status')}>
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Flag User">
                            <IconButton size="small" onClick={() => openUserAction(user, 'flag')}>
                              <Flag />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Assign Role">
                            <IconButton size="small" onClick={() => openUserAction(user, 'role')}>
                              <AdminPanelSettings />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {activeTab === 1 && (
        <Card>
          <CardContent>
            <Box className="table-header">
              <Typography variant="h6">KYC Review Queue</Typography>
              <Box className="table-controls">
                <FormControl size="small" style={{ minWidth: 120 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={kycFilters.status}
                    label="Status"
                    onChange={(e) => setKycFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
                  >
                    {kycStatuses.map(status => (
                      <MenuItem key={status} value={status}>{status}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>

            {loading && <LinearProgress style={{ marginBottom: '20px' }} />}

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Application ID</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Submitted</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {kycQueue.map((kyc) => (
                    <TableRow key={kyc.id}>
                      <TableCell>
                        <Box className="user-cell">
                          <Avatar>{kyc.username?.charAt(0).toUpperCase()}</Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {kyc.username}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {kyc.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{kyc.id}</TableCell>
                      <TableCell>
                        <Chip 
                          label={kyc.status} 
                          color={getStatusColor(kyc.status)} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={kyc.priority || 'normal'} 
                          variant="outlined" 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(kyc.submitted_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => openKycReview(kyc)}
                        >
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {activeTab === 2 && (
        <Card>
          <CardContent>
            <Box className="table-header">
              <Typography variant="h6">Compliance Events</Typography>
              <Box className="table-controls">
                <FormControl size="small" style={{ minWidth: 120 }}>
                  <InputLabel>Severity</InputLabel>
                  <Select
                    value={complianceFilters.severity}
                    label="Severity"
                    onChange={(e) => setComplianceFilters(prev => ({ ...prev, severity: e.target.value, page: 1 }))}
                  >
                    <MenuItem value="">All</MenuItem>
                    {complianceSeverities.map(severity => (
                      <MenuItem key={severity} value={severity}>{severity}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" style={{ minWidth: 120 }}>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={complianceFilters.eventType}
                    label="Type"
                    onChange={(e) => setComplianceFilters(prev => ({ ...prev, eventType: e.target.value, page: 1 }))}
                  >
                    <MenuItem value="">All</MenuItem>
                    {complianceTypes.map(type => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>

            {loading && <LinearProgress style={{ marginBottom: '20px' }} />}

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Event Type</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell>Severity</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {complianceEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <Chip 
                          label={event.event_type} 
                          variant="outlined" 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>
                        {event.username ? (
                          <Box className="user-cell">
                            <Avatar>{event.username.charAt(0).toUpperCase()}</Avatar>
                            <Typography variant="body2">
                              {event.username}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="textSecondary">
                            System Event
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={event.severity} 
                          color={getSeverityColor(event.severity)} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" style={{ maxWidth: '300px' }}>
                          {event.description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={event.status || 'open'} 
                          color={event.status === 'resolved' ? 'success' : 'warning'} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(event.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          disabled={event.status === 'resolved'}
                        >
                          Resolve
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* User Profile Dialog */}
      <Dialog open={userDialog} onClose={() => setUserDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>User Profile</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Basic Information</Typography>
                <Typography><strong>Username:</strong> {selectedUser.username}</Typography>
                <Typography><strong>Email:</strong> {selectedUser.email}</Typography>
                <Typography><strong>Status:</strong> {selectedUser.status}</Typography>
                <Typography><strong>KYC Status:</strong> {selectedUser.kyc_status}</Typography>
                <Typography><strong>Role:</strong> {selectedUser.role}</Typography>
                <Typography><strong>Joined:</strong> {new Date(selectedUser.created_at).toLocaleString()}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Account Activity</Typography>
                <Typography><strong>Last Login:</strong> {selectedUser.last_login ? new Date(selectedUser.last_login).toLocaleString() : 'Never'}</Typography>
                <Typography><strong>Login Count:</strong> {selectedUser.login_count || 0}</Typography>
                <Typography><strong>Failed Logins:</strong> {selectedUser.failed_login_attempts || 0}</Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* User Action Dialog */}
      <Dialog open={actionDialog} onClose={() => setActionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {actionType === 'status' && 'Update User Status'}
          {actionType === 'flag' && 'Flag User'}
          {actionType === 'role' && 'Assign Role'}
        </DialogTitle>
        <DialogContent>
          {actionType === 'status' && (
            <Grid container spacing={2} style={{ marginTop: '10px' }}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={actionData.status}
                    label="Status"
                    onChange={(e) => setActionData(prev => ({ ...prev, status: e.target.value }))}
                  >
                    {userStatuses.map(status => (
                      <MenuItem key={status} value={status}>{status}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Reason"
                  multiline
                  rows={3}
                  value={actionData.reason}
                  onChange={(e) => setActionData(prev => ({ ...prev, reason: e.target.value }))}
                  required
                />
              </Grid>
            </Grid>
          )}

          {actionType === 'flag' && (
            <Grid container spacing={2} style={{ marginTop: '10px' }}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Flag Type</InputLabel>
                  <Select
                    value={actionData.flagType}
                    label="Flag Type"
                    onChange={(e) => setActionData(prev => ({ ...prev, flagType: e.target.value }))}
                  >
                    {flagTypes.map(type => (
                      <MenuItem key={type} value={type}>{type.replace('_', ' ')}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Reason"
                  multiline
                  rows={3}
                  value={actionData.reason}
                  onChange={(e) => setActionData(prev => ({ ...prev, reason: e.target.value }))}
                  required
                />
              </Grid>
            </Grid>
          )}

          {actionType === 'role' && (
            <Grid container spacing={2} style={{ marginTop: '10px' }}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={actionData.role}
                    label="Role"
                    onChange={(e) => setActionData(prev => ({ ...prev, role: e.target.value }))}
                  >
                    {userRoles.map(role => (
                      <MenuItem key={role} value={role}>{role}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleUserAction} 
            variant="contained" 
            disabled={loading || !actionData.reason && (actionType === 'status' || actionType === 'flag')}
          >
            {loading ? <LinearProgress /> : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* KYC Review Dialog */}
      <Dialog open={kycDialog} onClose={() => setKycDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>KYC Application Review</DialogTitle>
        <DialogContent>
          {selectedKyc && (
            <Grid container spacing={2} style={{ marginTop: '10px' }}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Application Details</Typography>
                <Typography><strong>User:</strong> {selectedKyc.username}</Typography>
                <Typography><strong>Email:</strong> {selectedKyc.email}</Typography>
                <Typography><strong>Application ID:</strong> {selectedKyc.id}</Typography>
                <Typography><strong>Submitted:</strong> {new Date(selectedKyc.submitted_at).toLocaleString()}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth style={{ marginBottom: '16px' }}>
                  <InputLabel>Decision</InputLabel>
                  <Select
                    value={actionData.decision}
                    label="Decision"
                    onChange={(e) => setActionData(prev => ({ ...prev, decision: e.target.value }))}
                  >
                    <MenuItem value="approve">Approve</MenuItem>
                    <MenuItem value="reject">Reject</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  label="Comments"
                  multiline
                  rows={4}
                  value={actionData.comments}
                  onChange={(e) => setActionData(prev => ({ ...prev, comments: e.target.value }))}
                  required
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setKycDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleKycReview} 
            variant="contained" 
            disabled={loading || !actionData.decision || !actionData.comments}
          >
            {loading ? <LinearProgress /> : 'Submit Review'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;

