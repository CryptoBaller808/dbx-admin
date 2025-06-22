import React, { useState, useEffect, useRef } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
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
  Chip,
  LinearProgress,
  Switch,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge,
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Computer,
  Memory,
  Storage,
  Speed,
  Warning,
  Error,
  CheckCircle,
  Refresh,
  Settings,
  Notifications,
  Timeline,
  Dashboard,
  Security,
  CloudQueue,
  NetworkCheck,
  BugReport,
  Healing,
  MonitorHeart,
  SystemUpdate,
  NotificationsActive
} from '@mui/icons-material';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
  BarElement
} from 'chart.js';
import axios from 'axios';
import io from 'socket.io-client';
import { useAuthContext } from '../context/AuthContext';
import { API_URL } from '../config';
import './SystemHealthMonitoring.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement,
  BarElement
);

const SystemHealthMonitoring = () => {
  const { currentUser } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [systemHealth, setSystemHealth] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [metricsHistory, setMetricsHistory] = useState([]);
  const [alertStats, setAlertStats] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [alertDialog, setAlertDialog] = useState(false);
  const [settingsDialog, setSettingsDialog] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [timeRange, setTimeRange] = useState('24h');
  
  const socketRef = useRef(null);
  const refreshIntervalRef = useRef(null);
  
  // Alert thresholds
  const [alertThresholds, setAlertThresholds] = useState({
    cpu_usage: 80,
    memory_usage: 85,
    disk_usage: 90,
    api_response_time: 5000,
    database_latency: 1000,
    error_rate: 5
  });

  const headers = {
    Authorization: `Bearer ${currentUser}`
  };

  useEffect(() => {
    initializeSocket();
    fetchSystemHealth();
    fetchAlerts();
    fetchMetricsHistory();
    fetchAlertStats();
    
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      refreshIntervalRef.current = setInterval(() => {
        fetchSystemHealth();
        fetchAlerts();
      }, refreshInterval * 1000);
    } else {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefresh, refreshInterval]);

  useEffect(() => {
    fetchMetricsHistory();
    fetchAlertStats();
  }, [timeRange]);

  const initializeSocket = () => {
    socketRef.current = io(API_URL, {
      auth: {
        token: currentUser
      }
    });

    socketRef.current.on('connect', () => {
      console.log('Connected to system health monitoring');
      socketRef.current.emit('join_admin_monitoring');
    });

    socketRef.current.on('health_update', (healthData) => {
      setSystemHealth(healthData);
    });

    socketRef.current.on('new_alert', (alert) => {
      setAlerts(prev => [alert, ...prev]);
      setSuccess(`New ${alert.severity} alert: ${alert.message}`);
    });

    socketRef.current.on('alert_resolved', (alert) => {
      setAlerts(prev => prev.map(a => a.id === alert.id ? alert : a));
      setSuccess(`Alert resolved: ${alert.type}`);
    });
  };

  const fetchSystemHealth = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/admindashboard/health/status`, { headers });

      if (response.data.success) {
        setSystemHealth(response.data.data);
        setError(null);
      }
    } catch (error) {
      console.error('Error fetching system health:', error);
      setError('Failed to fetch system health status');
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await axios.get(`${API_URL}/admindashboard/alerts?limit=20`, { headers });

      if (response.data.success) {
        setAlerts(response.data.data.alerts);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const fetchMetricsHistory = async () => {
    try {
      const response = await axios.get(`${API_URL}/admindashboard/health/metrics/history?timeRange=${timeRange}`, { headers });

      if (response.data.success) {
        setMetricsHistory(response.data.data.metrics);
      }
    } catch (error) {
      console.error('Error fetching metrics history:', error);
    }
  };

  const fetchAlertStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/admindashboard/alerts/statistics?timeRange=${timeRange}`, { headers });

      if (response.data.success) {
        setAlertStats(response.data.data.statistics);
      }
    } catch (error) {
      console.error('Error fetching alert statistics:', error);
    }
  };

  const triggerHealthCheck = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/admindashboard/health/check`, {}, { headers });

      if (response.data.success) {
        setSuccess('Manual health check completed');
        setSystemHealth(response.data.data);
      }
    } catch (error) {
      console.error('Error triggering health check:', error);
      setError('Failed to trigger health check');
    } finally {
      setLoading(false);
    }
  };

  const resolveAlert = async (alertId, resolution) => {
    try {
      const response = await axios.post(
        `${API_URL}/admindashboard/alerts/${alertId}/resolve`,
        { resolution },
        { headers }
      );

      if (response.data.success) {
        setSuccess('Alert resolved successfully');
        setAlertDialog(false);
        fetchAlerts();
      }
    } catch (error) {
      console.error('Error resolving alert:', error);
      setError('Failed to resolve alert');
    }
  };

  const updateAlertThresholds = async () => {
    try {
      const response = await axios.put(
        `${API_URL}/admindashboard/alerts/thresholds`,
        { thresholds: alertThresholds },
        { headers }
      );

      if (response.data.success) {
        setSuccess('Alert thresholds updated successfully');
        setSettingsDialog(false);
      }
    } catch (error) {
      console.error('Error updating alert thresholds:', error);
      setError('Failed to update alert thresholds');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'success';
      case 'degraded': return 'warning';
      case 'critical': return 'error';
      case 'online': return 'success';
      case 'offline': return 'error';
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

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const formatBytes = (bytes) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Chart configurations
  const metricsChartData = {
    labels: metricsHistory.map(m => new Date(m.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: 'CPU Usage (%)',
        data: metricsHistory.map(m => m.cpu_usage),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.1
      },
      {
        label: 'Memory Usage (%)',
        data: metricsHistory.map(m => m.memory_usage),
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        tension: 0.1
      },
      {
        label: 'Database Latency (ms)',
        data: metricsHistory.map(m => m.database_latency),
        borderColor: 'rgb(255, 205, 86)',
        backgroundColor: 'rgba(255, 205, 86, 0.2)',
        tension: 0.1,
        yAxisID: 'y1'
      }
    ]
  };

  const metricsChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top'
      },
      title: {
        display: true,
        text: 'System Performance Metrics'
      }
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        max: 100
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: {
          drawOnChartArea: false
        }
      }
    }
  };

  const alertStatsChartData = {
    labels: alertStats.map(stat => stat.alert_type),
    datasets: [
      {
        label: 'Total Alerts',
        data: alertStats.map(stat => stat.count),
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 205, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 159, 64, 0.8)'
        ]
      }
    ]
  };

  if (!systemHealth) {
    return (
      <Box className="system-health-loading">
        <CircularProgress size={60} />
        <Typography variant="h6" style={{ marginTop: '20px' }}>
          Loading System Health Data...
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="system-health-monitoring">
      {/* Header */}
      <Box className="monitoring-header">
        <Typography variant="h4" className="monitoring-title">
          System Health Monitoring
        </Typography>
        <Box className="monitoring-controls">
          <FormControlLabel
            control={
              <Switch
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                color="primary"
              />
            }
            label="Auto Refresh"
          />
          <Tooltip title="Manual Health Check">
            <IconButton onClick={triggerHealthCheck} disabled={loading}>
              <Refresh />
            </IconButton>
          </Tooltip>
          <Tooltip title="Settings">
            <IconButton onClick={() => setSettingsDialog(true)}>
              <Settings />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

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

      {/* System Overview Cards */}
      <Grid container spacing={3} style={{ marginBottom: '30px' }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="health-card">
            <CardContent>
              <Box className="health-content">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    CPU Usage
                  </Typography>
                  <Typography variant="h4">
                    {systemHealth.system.cpu_usage}%
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={systemHealth.system.cpu_usage} 
                    color={systemHealth.system.cpu_usage > 80 ? 'error' : 'primary'}
                    style={{ marginTop: '10px' }}
                  />
                </Box>
                <Computer className="health-icon" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="health-card">
            <CardContent>
              <Box className="health-content">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Memory Usage
                  </Typography>
                  <Typography variant="h4">
                    {systemHealth.system.memory_usage.percentage}%
                  </Typography>
                  <Typography variant="caption">
                    {formatBytes(systemHealth.system.memory_usage.used)} / {formatBytes(systemHealth.system.memory_usage.total)}
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={systemHealth.system.memory_usage.percentage} 
                    color={systemHealth.system.memory_usage.percentage > 85 ? 'error' : 'primary'}
                    style={{ marginTop: '10px' }}
                  />
                </Box>
                <Memory className="health-icon" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="health-card">
            <CardContent>
              <Box className="health-content">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Database Latency
                  </Typography>
                  <Typography variant="h4">
                    {systemHealth.database.latency}ms
                  </Typography>
                  <Chip 
                    label={systemHealth.database.status} 
                    color={getStatusColor(systemHealth.database.status)} 
                    size="small"
                    style={{ marginTop: '10px' }}
                  />
                </Box>
                <Storage className="health-icon" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="health-card">
            <CardContent>
              <Box className="health-content">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    System Uptime
                  </Typography>
                  <Typography variant="h6">
                    {formatUptime(systemHealth.system.uptime)}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Since last restart
                  </Typography>
                </Box>
                <Speed className="health-icon" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Blockchain Adapters Status */}
      <Grid container spacing={3} style={{ marginBottom: '30px' }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Blockchain Adapters Status
              </Typography>
              <Box className="adapters-grid">
                {Object.entries(systemHealth.blockchain.adapters).map(([adapter, status]) => (
                  <Box key={adapter} className="adapter-status">
                    <Typography variant="body2" fontWeight="bold">
                      {adapter.toUpperCase()}
                    </Typography>
                    <Chip 
                      label={status.status} 
                      color={getStatusColor(status.status)} 
                      size="small" 
                    />
                    {status.response_time && (
                      <Typography variant="caption" color="textSecondary">
                        {status.response_time}ms
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Services Health
              </Typography>
              <List dense>
                {Object.entries(systemHealth.services.services).map(([service, status]) => (
                  <ListItem key={service}>
                    <ListItemIcon>
                      {status.status === 'healthy' ? (
                        <CheckCircle color="success" />
                      ) : (
                        <Error color="error" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={service.replace('_', ' ').toUpperCase()}
                      secondary={`Memory: ${formatBytes(status.memory_usage)}`}
                    />
                    <Chip 
                      label={status.status} 
                      color={getStatusColor(status.status)} 
                      size="small" 
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} style={{ marginBottom: '30px' }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box className="chart-header">
                <Typography variant="h6">Performance Metrics</Typography>
                <FormControl size="small" style={{ minWidth: 120 }}>
                  <InputLabel>Time Range</InputLabel>
                  <Select
                    value={timeRange}
                    label="Time Range"
                    onChange={(e) => setTimeRange(e.target.value)}
                  >
                    <MenuItem value="1h">1 Hour</MenuItem>
                    <MenuItem value="24h">24 Hours</MenuItem>
                    <MenuItem value="7d">7 Days</MenuItem>
                    <MenuItem value="30d">30 Days</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box className="chart-container">
                <Line data={metricsChartData} options={metricsChartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Alert Distribution
              </Typography>
              <Box className="chart-container">
                <Doughnut data={alertStatsChartData} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Alerts */}
      <Card>
        <CardContent>
          <Box className="alerts-header">
            <Typography variant="h6">Recent Alerts</Typography>
            <Badge badgeContent={alerts.filter(a => !a.resolved).length} color="error">
              <NotificationsActive />
            </Badge>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Severity</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Message</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {alerts.slice(0, 10).map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell>
                      <Chip 
                        label={alert.severity} 
                        color={getSeverityColor(alert.severity)} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>{alert.type}</TableCell>
                    <TableCell style={{ maxWidth: '300px' }}>
                      {alert.message}
                    </TableCell>
                    <TableCell>
                      {new Date(alert.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={alert.resolved ? 'Resolved' : 'Open'} 
                        color={alert.resolved ? 'success' : 'warning'} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      {!alert.resolved && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            setSelectedAlert(alert);
                            setAlertDialog(true);
                          }}
                        >
                          Resolve
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Alert Resolution Dialog */}
      <Dialog open={alertDialog} onClose={() => setAlertDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Resolve Alert</DialogTitle>
        <DialogContent>
          {selectedAlert && (
            <Box style={{ marginTop: '10px' }}>
              <Typography><strong>Type:</strong> {selectedAlert.type}</Typography>
              <Typography><strong>Message:</strong> {selectedAlert.message}</Typography>
              <Typography><strong>Severity:</strong> {selectedAlert.severity}</Typography>
              <TextField
                fullWidth
                label="Resolution Description"
                multiline
                rows={3}
                style={{ marginTop: '20px' }}
                id="resolution-input"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAlertDialog(false)}>Cancel</Button>
          <Button 
            onClick={() => {
              const resolution = document.getElementById('resolution-input').value;
              if (resolution && selectedAlert) {
                resolveAlert(selectedAlert.id, resolution);
              }
            }}
            variant="contained"
          >
            Resolve Alert
          </Button>
        </DialogActions>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={settingsDialog} onClose={() => setSettingsDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Alert Thresholds Settings</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} style={{ marginTop: '10px' }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="CPU Usage (%)"
                type="number"
                value={alertThresholds.cpu_usage}
                onChange={(e) => setAlertThresholds(prev => ({ ...prev, cpu_usage: parseInt(e.target.value) }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Memory Usage (%)"
                type="number"
                value={alertThresholds.memory_usage}
                onChange={(e) => setAlertThresholds(prev => ({ ...prev, memory_usage: parseInt(e.target.value) }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Disk Usage (%)"
                type="number"
                value={alertThresholds.disk_usage}
                onChange={(e) => setAlertThresholds(prev => ({ ...prev, disk_usage: parseInt(e.target.value) }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Database Latency (ms)"
                type="number"
                value={alertThresholds.database_latency}
                onChange={(e) => setAlertThresholds(prev => ({ ...prev, database_latency: parseInt(e.target.value) }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="API Response Time (ms)"
                type="number"
                value={alertThresholds.api_response_time}
                onChange={(e) => setAlertThresholds(prev => ({ ...prev, api_response_time: parseInt(e.target.value) }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Error Rate (%)"
                type="number"
                value={alertThresholds.error_rate}
                onChange={(e) => setAlertThresholds(prev => ({ ...prev, error_rate: parseInt(e.target.value) }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsDialog(false)}>Cancel</Button>
          <Button onClick={updateAlertThresholds} variant="contained">
            Update Thresholds
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SystemHealthMonitoring;

