import React, { useState, useEffect, useRef } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Chip,
  Alert,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Refresh,
  Download,
  Email,
  Schedule,
  FilterList,
  Settings,
  Notifications,
  PlayArrow,
  Pause,
  Stop
} from '@mui/icons-material';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import axios from 'axios';
import io from 'socket.io-client';
import { useAuthContext } from '../context/AuthContext';
import { API_URL } from '../config';
import './RealTimeAnalytics.css';

const RealTimeAnalytics = () => {
  const { currentUser } = useAuthContext();
  const [activeTab, setActiveTab] = useState(0);
  const [timeframe, setTimeframe] = useState('24h');
  const [loading, setLoading] = useState(false);
  const [liveData, setLiveData] = useState({});
  const [filteredData, setFilteredData] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [reportDialog, setReportDialog] = useState(false);
  const [scheduleDialog, setScheduleDialog] = useState(false);
  const [filterDialog, setFilterDialog] = useState(false);
  const [alertDialog, setAlertDialog] = useState(false);
  const [error, setError] = useState(null);
  
  const socketRef = useRef(null);
  const [reportConfig, setReportConfig] = useState({
    timeframe: '24h',
    includeCharts: true,
    format: 'json',
    sections: ['overview', 'transactions', 'users', 'nfts', 'system'],
    email: ''
  });
  
  const [scheduleConfig, setScheduleConfig] = useState({
    frequency: 'daily',
    emails: [''],
    enabled: true,
    reportOptions: {
      timeframe: '24h',
      includeCharts: true,
      sections: ['overview', 'transactions', 'users', 'nfts']
    }
  });
  
  const [filterConfig, setFilterConfig] = useState({
    chains: [],
    userTiers: [],
    transactionTypes: [],
    minAmount: 0,
    maxAmount: null,
    sortBy: 'timestamp',
    sortOrder: 'DESC',
    limit: 100,
    offset: 0
  });
  
  const [alertConfig, setAlertConfig] = useState({
    metric: 'transaction_volume',
    thresholds: {
      warning: 1000,
      critical: 5000
    },
    notifications: {
      email: true,
      webhook: ''
    },
    enabled: true
  });

  const headers = {
    Authorization: `Bearer ${currentUser}`
  };

  const supportedChains = ['ETH', 'BNB', 'AVAX', 'MATIC', 'XDC', 'SOL', 'XRP', 'XLM'];
  const transactionTypes = ['mint', 'sale', 'auction', 'bridge', 'transfer'];
  const userTiers = ['basic', 'premium', 'vip'];

  useEffect(() => {
    initializeSocket();
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const initializeSocket = () => {
    socketRef.current = io(API_URL, {
      auth: {
        token: currentUser
      }
    });

    socketRef.current.on('connect', () => {
      console.log('Connected to real-time analytics');
      socketRef.current.emit('join_admin_dashboard');
      socketRef.current.emit('join_system_monitoring');
      setIsStreaming(true);
    });

    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from real-time analytics');
      setIsStreaming(false);
    });

    // Listen for real-time data streams
    socketRef.current.on('transaction_stream', (data) => {
      setLiveData(prev => ({ ...prev, transactions: data }));
    });

    socketRef.current.on('health_stream', (data) => {
      setLiveData(prev => ({ ...prev, health: data }));
    });

    socketRef.current.on('user_activity_stream', (data) => {
      setLiveData(prev => ({ ...prev, userActivity: data }));
    });

    socketRef.current.on('blockchain_stream', (data) => {
      setLiveData(prev => ({ ...prev, blockchain: data }));
    });

    socketRef.current.on('system_alert', (alert) => {
      setAlerts(prev => [alert, ...prev.slice(0, 9)]); // Keep last 10 alerts
    });
  };

  const handleStartStreaming = () => {
    if (socketRef.current && !socketRef.current.connected) {
      socketRef.current.connect();
    }
  };

  const handleStopStreaming = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
  };

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${API_URL}/admindashboard/analytics/generate-report`,
        reportConfig,
        { headers }
      );

      if (response.data.success) {
        // Handle successful report generation
        if (reportConfig.format === 'json') {
          // Download JSON report
          const dataStr = JSON.stringify(response.data.report, null, 2);
          const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
          const exportFileDefaultName = `dbx-analytics-report-${new Date().toISOString().split('T')[0]}.json`;
          
          const linkElement = document.createElement('a');
          linkElement.setAttribute('href', dataUri);
          linkElement.setAttribute('download', exportFileDefaultName);
          linkElement.click();
        }
        
        setReportDialog(false);
        setError(null);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      setError('Failed to generate report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleReport = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${API_URL}/admindashboard/analytics/schedule-report`,
        scheduleConfig,
        { headers }
      );

      if (response.data.success) {
        setScheduleDialog(false);
        setError(null);
        // Show success message
      }
    } catch (error) {
      console.error('Error scheduling report:', error);
      setError('Failed to schedule report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${API_URL}/admindashboard/analytics/filtered`,
        { ...filterConfig, timeframe },
        { headers }
      );

      if (response.data.success) {
        setFilteredData(response.data.data);
        setFilterDialog(false);
        setError(null);
      }
    } catch (error) {
      console.error('Error applying filters:', error);
      setError('Failed to apply filters. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfigureAlerts = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${API_URL}/admindashboard/analytics/alerts/configure`,
        alertConfig,
        { headers }
      );

      if (response.data.success) {
        setAlertDialog(false);
        setError(null);
        // Show success message
      }
    } catch (error) {
      console.error('Error configuring alerts:', error);
      setError('Failed to configure alerts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async (dataType, format) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${API_URL}/admindashboard/analytics/export-data`,
        {
          dataType,
          format,
          timeframe,
          filters: filterConfig
        },
        { 
          headers,
          responseType: 'blob'
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${dataType}-export-${new Date().toISOString().split('T')[0]}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
      setError('Failed to export data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num?.toString() || '0';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const getAlertSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'default';
    }
  };

  // Chart configurations for live data
  const transactionStreamChart = {
    labels: Array.from({ length: 10 }, (_, i) => `${i + 1}m ago`),
    datasets: [
      {
        label: 'Transactions/min',
        data: Array.from({ length: 10 }, () => Math.floor(Math.random() * 100)),
        borderColor: '#1976d2',
        backgroundColor: 'rgba(25, 118, 210, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const chainDistributionChart = {
    labels: supportedChains,
    datasets: [
      {
        data: supportedChains.map(() => Math.floor(Math.random() * 1000)),
        backgroundColor: [
          '#627EEA', '#F3BA2F', '#E84142', '#8247E5',
          '#1F4E79', '#9945FF', '#23292F', '#000000'
        ]
      }
    ]
  };

  return (
    <Box className="real-time-analytics">
      {/* Header */}
      <Box className="analytics-header">
        <Typography variant="h4" className="analytics-title">
          Real-Time Analytics & Reporting
        </Typography>
        <Box className="analytics-controls">
          <FormControl size="small" style={{ minWidth: 120, marginRight: '10px' }}>
            <InputLabel>Timeframe</InputLabel>
            <Select
              value={timeframe}
              label="Timeframe"
              onChange={(e) => setTimeframe(e.target.value)}
            >
              <MenuItem value="1h">1 Hour</MenuItem>
              <MenuItem value="24h">24 Hours</MenuItem>
              <MenuItem value="7d">7 Days</MenuItem>
              <MenuItem value="30d">30 Days</MenuItem>
              <MenuItem value="90d">90 Days</MenuItem>
            </Select>
          </FormControl>
          
          <Tooltip title={isStreaming ? "Stop Live Stream" : "Start Live Stream"}>
            <IconButton 
              onClick={isStreaming ? handleStopStreaming : handleStartStreaming}
              color={isStreaming ? "error" : "success"}
            >
              {isStreaming ? <Stop /> : <PlayArrow />}
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Apply Filters">
            <IconButton onClick={() => setFilterDialog(true)} color="primary">
              <FilterList />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Generate Report">
            <IconButton onClick={() => setReportDialog(true)} color="primary">
              <Download />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Schedule Reports">
            <IconButton onClick={() => setScheduleDialog(true)} color="primary">
              <Schedule />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Configure Alerts">
            <IconButton onClick={() => setAlertDialog(true)} color="primary">
              <Settings />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Streaming Status */}
      <Box className="streaming-status">
        <Chip
          icon={isStreaming ? <PlayArrow /> : <Pause />}
          label={isStreaming ? "Live Streaming Active" : "Streaming Paused"}
          color={isStreaming ? "success" : "default"}
          variant="outlined"
        />
        {liveData.transactions && (
          <Typography variant="body2" color="textSecondary">
            Last update: {new Date(liveData.transactions.timestamp).toLocaleTimeString()}
          </Typography>
        )}
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" style={{ marginBottom: '20px' }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* System Alerts */}
      {alerts.length > 0 && (
        <Box className="system-alerts" style={{ marginBottom: '20px' }}>
          <Typography variant="h6" gutterBottom>
            Recent System Alerts
          </Typography>
          {alerts.slice(0, 3).map((alert) => (
            <Alert 
              key={alert.id}
              severity={getAlertSeverityColor(alert.severity)}
              style={{ marginBottom: '10px' }}
            >
              <strong>{alert.message}</strong> - {new Date(alert.timestamp).toLocaleString()}
            </Alert>
          ))}
        </Box>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} style={{ marginBottom: '20px' }}>
        <Tab label="Live Dashboard" />
        <Tab label="Filtered Analytics" />
        <Tab label="Export Data" />
        <Tab label="System Health" />
      </Tabs>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* Live Metrics */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Live Transaction Stream
                </Typography>
                <Box style={{ height: '300px' }}>
                  <Line 
                    data={transactionStreamChart} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: { beginAtZero: true }
                      }
                    }} 
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Chain Distribution
                </Typography>
                <Box style={{ height: '300px' }}>
                  <Doughnut 
                    data={chainDistributionChart}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: 'bottom' }
                      }
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Live Stats Cards */}
          <Grid item xs={12} sm={6} md={3}>
            <Card className="live-stat-card">
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Live TPS
                </Typography>
                <Typography variant="h4" className="stat-value">
                  {liveData.transactions?.tps?.toFixed(2) || '0.00'}
                </Typography>
                <Typography variant="body2" color="success.main">
                  Transactions per second
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card className="live-stat-card">
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Active Users
                </Typography>
                <Typography variant="h4" className="stat-value">
                  {formatNumber(liveData.userActivity?.activeUsers)}
                </Typography>
                <Typography variant="body2" color="primary.main">
                  Last 5 minutes
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card className="live-stat-card">
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Online Chains
                </Typography>
                <Typography variant="h4" className="stat-value">
                  {liveData.blockchain?.onlineChains || 0}/{liveData.blockchain?.totalChains || 8}
                </Typography>
                <Typography variant="body2" color="success.main">
                  Blockchain adapters
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card className="live-stat-card">
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  System Health
                </Typography>
                <Typography variant="h4" className="stat-value">
                  {liveData.health?.database?.status === 'healthy' ? '✅' : '⚠️'}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {liveData.health?.database?.responseTime || 0}ms response
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <Box>
          {filteredData ? (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Filtered Analytics Results
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Total Records: {filteredData.pagination.total} | 
                      Total Volume: {formatCurrency(filteredData.aggregated.totalVolume)} |
                      Average Price: {formatCurrency(filteredData.aggregated.avgPrice)}
                    </Typography>
                    
                    <TableContainer component={Paper} style={{ marginTop: '20px' }}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Timestamp</TableCell>
                            <TableCell>Blockchain</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Amount</TableCell>
                            <TableCell>Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {filteredData.transactions.slice(0, 10).map((transaction, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                {new Date(transaction.timestamp).toLocaleString()}
                              </TableCell>
                              <TableCell>{transaction.blockchain}</TableCell>
                              <TableCell>{transaction.transaction_type}</TableCell>
                              <TableCell>{formatCurrency(transaction.price)}</TableCell>
                              <TableCell>
                                <Chip 
                                  label={transaction.status || 'completed'} 
                                  color="success" 
                                  size="small" 
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          ) : (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  No Filtered Data
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Click the filter button to apply filters and view analytics data.
                </Typography>
                <Button 
                  variant="contained" 
                  startIcon={<FilterList />}
                  onClick={() => setFilterDialog(true)}
                  style={{ marginTop: '20px' }}
                >
                  Apply Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </Box>
      )}

      {activeTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Export Transaction Data
                </Typography>
                <Box className="export-buttons">
                  <Button 
                    variant="outlined" 
                    onClick={() => handleExportData('transactions', 'csv')}
                    style={{ margin: '5px' }}
                  >
                    Export CSV
                  </Button>
                  <Button 
                    variant="outlined" 
                    onClick={() => handleExportData('transactions', 'json')}
                    style={{ margin: '5px' }}
                  >
                    Export JSON
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Export User Data
                </Typography>
                <Box className="export-buttons">
                  <Button 
                    variant="outlined" 
                    onClick={() => handleExportData('users', 'csv')}
                    style={{ margin: '5px' }}
                  >
                    Export CSV
                  </Button>
                  <Button 
                    variant="outlined" 
                    onClick={() => handleExportData('users', 'json')}
                    style={{ margin: '5px' }}
                  >
                    Export JSON
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Export NFT Data
                </Typography>
                <Box className="export-buttons">
                  <Button 
                    variant="outlined" 
                    onClick={() => handleExportData('nfts', 'csv')}
                    style={{ margin: '5px' }}
                  >
                    Export CSV
                  </Button>
                  <Button 
                    variant="outlined" 
                    onClick={() => handleExportData('nfts', 'json')}
                    style={{ margin: '5px' }}
                  >
                    Export JSON
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Export System Logs
                </Typography>
                <Box className="export-buttons">
                  <Button 
                    variant="outlined" 
                    onClick={() => handleExportData('system_logs', 'csv')}
                    style={{ margin: '5px' }}
                  >
                    Export CSV
                  </Button>
                  <Button 
                    variant="outlined" 
                    onClick={() => handleExportData('system_logs', 'json')}
                    style={{ margin: '5px' }}
                  >
                    Export JSON
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  System Health Monitoring
                </Typography>
                {liveData.health ? (
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Box className="health-metric">
                        <Typography variant="subtitle1">Database</Typography>
                        <Typography variant="h6" color={liveData.health.database.status === 'healthy' ? 'success.main' : 'error.main'}>
                          {liveData.health.database.status}
                        </Typography>
                        <Typography variant="body2">
                          Response: {liveData.health.database.responseTime}ms
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box className="health-metric">
                        <Typography variant="subtitle1">Memory Usage</Typography>
                        <Typography variant="h6">
                          {Math.round(liveData.health.memory.heapUsed / 1024 / 1024)}MB
                        </Typography>
                        <Typography variant="body2">
                          Heap: {Math.round(liveData.health.memory.heapTotal / 1024 / 1024)}MB
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box className="health-metric">
                        <Typography variant="subtitle1">Uptime</Typography>
                        <Typography variant="h6">
                          {Math.floor(liveData.health.uptime / 3600)}h
                        </Typography>
                        <Typography variant="body2">
                          {Math.floor((liveData.health.uptime % 3600) / 60)}m
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    No health data available. Start live streaming to see system health metrics.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Dialogs */}
      
      {/* Report Generation Dialog */}
      <Dialog open={reportDialog} onClose={() => setReportDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Generate Analytics Report</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} style={{ marginTop: '10px' }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Timeframe</InputLabel>
                <Select
                  value={reportConfig.timeframe}
                  label="Timeframe"
                  onChange={(e) => setReportConfig(prev => ({ ...prev, timeframe: e.target.value }))}
                >
                  <MenuItem value="1h">1 Hour</MenuItem>
                  <MenuItem value="24h">24 Hours</MenuItem>
                  <MenuItem value="7d">7 Days</MenuItem>
                  <MenuItem value="30d">30 Days</MenuItem>
                  <MenuItem value="90d">90 Days</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Format</InputLabel>
                <Select
                  value={reportConfig.format}
                  label="Format"
                  onChange={(e) => setReportConfig(prev => ({ ...prev, format: e.target.value }))}
                >
                  <MenuItem value="json">JSON</MenuItem>
                  <MenuItem value="csv">CSV</MenuItem>
                  <MenuItem value="pdf">PDF</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email (optional)"
                type="email"
                value={reportConfig.email}
                onChange={(e) => setReportConfig(prev => ({ ...prev, email: e.target.value }))}
                helperText="Leave empty to download directly"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={reportConfig.includeCharts}
                    onChange={(e) => setReportConfig(prev => ({ ...prev, includeCharts: e.target.checked }))}
                  />
                }
                label="Include Charts"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportDialog(false)}>Cancel</Button>
          <Button onClick={handleGenerateReport} variant="contained" disabled={loading}>
            {loading ? <LinearProgress /> : 'Generate Report'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Schedule Dialog */}
      <Dialog open={scheduleDialog} onClose={() => setScheduleDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Schedule Automated Reports</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} style={{ marginTop: '10px' }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Frequency</InputLabel>
                <Select
                  value={scheduleConfig.frequency}
                  label="Frequency"
                  onChange={(e) => setScheduleConfig(prev => ({ ...prev, frequency: e.target.value }))}
                >
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={scheduleConfig.enabled}
                    onChange={(e) => setScheduleConfig(prev => ({ ...prev, enabled: e.target.checked }))}
                  />
                }
                label="Enabled"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email Addresses (comma separated)"
                value={scheduleConfig.emails.join(', ')}
                onChange={(e) => setScheduleConfig(prev => ({ 
                  ...prev, 
                  emails: e.target.value.split(',').map(email => email.trim()) 
                }))}
                helperText="Enter email addresses separated by commas"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScheduleDialog(false)}>Cancel</Button>
          <Button onClick={handleScheduleReport} variant="contained" disabled={loading}>
            {loading ? <LinearProgress /> : 'Schedule Reports'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Filter Dialog */}
      <Dialog open={filterDialog} onClose={() => setFilterDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Advanced Filters</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} style={{ marginTop: '10px' }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Blockchains</InputLabel>
                <Select
                  multiple
                  value={filterConfig.chains}
                  label="Blockchains"
                  onChange={(e) => setFilterConfig(prev => ({ ...prev, chains: e.target.value }))}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {supportedChains.map((chain) => (
                    <MenuItem key={chain} value={chain}>{chain}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Transaction Types</InputLabel>
                <Select
                  multiple
                  value={filterConfig.transactionTypes}
                  label="Transaction Types"
                  onChange={(e) => setFilterConfig(prev => ({ ...prev, transactionTypes: e.target.value }))}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {transactionTypes.map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Minimum Amount"
                type="number"
                value={filterConfig.minAmount}
                onChange={(e) => setFilterConfig(prev => ({ ...prev, minAmount: parseFloat(e.target.value) || 0 }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Maximum Amount"
                type="number"
                value={filterConfig.maxAmount || ''}
                onChange={(e) => setFilterConfig(prev => ({ ...prev, maxAmount: parseFloat(e.target.value) || null }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Limit"
                type="number"
                value={filterConfig.limit}
                onChange={(e) => setFilterConfig(prev => ({ ...prev, limit: parseInt(e.target.value) || 100 }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Sort Order</InputLabel>
                <Select
                  value={filterConfig.sortOrder}
                  label="Sort Order"
                  onChange={(e) => setFilterConfig(prev => ({ ...prev, sortOrder: e.target.value }))}
                >
                  <MenuItem value="DESC">Newest First</MenuItem>
                  <MenuItem value="ASC">Oldest First</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFilterDialog(false)}>Cancel</Button>
          <Button onClick={handleApplyFilters} variant="contained" disabled={loading}>
            {loading ? <LinearProgress /> : 'Apply Filters'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Alert Configuration Dialog */}
      <Dialog open={alertDialog} onClose={() => setAlertDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Configure System Alerts</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} style={{ marginTop: '10px' }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Metric</InputLabel>
                <Select
                  value={alertConfig.metric}
                  label="Metric"
                  onChange={(e) => setAlertConfig(prev => ({ ...prev, metric: e.target.value }))}
                >
                  <MenuItem value="transaction_volume">Transaction Volume</MenuItem>
                  <MenuItem value="error_rate">Error Rate</MenuItem>
                  <MenuItem value="response_time">Response Time</MenuItem>
                  <MenuItem value="user_activity">User Activity</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={alertConfig.enabled}
                    onChange={(e) => setAlertConfig(prev => ({ ...prev, enabled: e.target.checked }))}
                  />
                }
                label="Enabled"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Warning Threshold"
                type="number"
                value={alertConfig.thresholds.warning}
                onChange={(e) => setAlertConfig(prev => ({ 
                  ...prev, 
                  thresholds: { ...prev.thresholds, warning: parseFloat(e.target.value) || 0 }
                }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Critical Threshold"
                type="number"
                value={alertConfig.thresholds.critical}
                onChange={(e) => setAlertConfig(prev => ({ 
                  ...prev, 
                  thresholds: { ...prev.thresholds, critical: parseFloat(e.target.value) || 0 }
                }))}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={alertConfig.notifications.email}
                    onChange={(e) => setAlertConfig(prev => ({ 
                      ...prev, 
                      notifications: { ...prev.notifications, email: e.target.checked }
                    }))}
                  />
                }
                label="Email Notifications"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Webhook URL (optional)"
                value={alertConfig.notifications.webhook}
                onChange={(e) => setAlertConfig(prev => ({ 
                  ...prev, 
                  notifications: { ...prev.notifications, webhook: e.target.value }
                }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAlertDialog(false)}>Cancel</Button>
          <Button onClick={handleConfigureAlerts} variant="contained" disabled={loading}>
            {loading ? <LinearProgress /> : 'Configure Alerts'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RealTimeAnalytics;

