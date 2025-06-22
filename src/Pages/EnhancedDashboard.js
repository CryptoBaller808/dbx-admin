import React, { useState, useEffect } from 'react';
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
  Chip,
  LinearProgress,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  TrendingUp, 
  TrendingDown, 
  Refresh, 
  Download, 
  Visibility,
  Warning,
  CheckCircle,
  Error as ErrorIcon
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
import { useAuthContext } from '../context/AuthContext';
import { API_URL } from '../config';
import './EnhancedDashboard.css';

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

const EnhancedDashboard = () => {
  const { currentUser } = useAuthContext();
  const [timeframe, setTimeframe] = useState('24h');
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);
  const [chainStats, setChainStats] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const headers = {
    Authorization: `Bearer ${currentUser}`
  };

  const timeframeOptions = [
    { value: '1h', label: '1 Hour' },
    { value: '24h', label: '24 Hours' },
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' }
  ];

  const blockchainColors = {
    ETH: '#627EEA',
    BNB: '#F3BA2F',
    AVAX: '#E84142',
    MATIC: '#8247E5',
    XDC: '#1F4E79',
    SOL: '#9945FF',
    XRP: '#23292F',
    XLM: '#000000'
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [timeframe]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [overviewRes, healthRes, activityRes] = await Promise.all([
        axios.get(`${API_URL}/admindashboard/enhanced/overview?timeframe=${timeframe}`, { headers }),
        axios.get(`${API_URL}/admindashboard/enhanced/system-health`, { headers }),
        axios.get(`${API_URL}/admindashboard/enhanced/recent-activity?limit=20`, { headers })
      ]);

      setDashboardData(overviewRes.data.data);
      setSystemHealth(healthRes.data.data);
      setChainStats(overviewRes.data.data.chainStats || []);
      setRecentActivity(activityRes.data.data || []);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to fetch dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchDashboardData();
  };

  const handleExportReport = async () => {
    try {
      const response = await axios.post(`${API_URL}/admindashboard/enhanced/export-report`, {
        reportType: 'comprehensive',
        timeframe,
        format: 'json'
      }, { headers });

      // Create download link
      const dataStr = JSON.stringify(response.data.report, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = `dbx-dashboard-report-${timeframe}-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  const getHealthStatusColor = (status) => {
    switch (status) {
      case 'healthy': return '#4caf50';
      case 'warning': return '#ff9800';
      case 'critical': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  const getHealthStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return <CheckCircle style={{ color: '#4caf50' }} />;
      case 'warning': return <Warning style={{ color: '#ff9800' }} />;
      case 'critical': return <ErrorIcon style={{ color: '#f44336' }} />;
      default: return <ErrorIcon style={{ color: '#9e9e9e' }} />;
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

  // Chart configurations
  const transactionVolumeChartData = {
    labels: dashboardData?.transactionMetrics?.hourlyTransactions?.map(item => 
      new Date(item.hour).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    ) || [],
    datasets: [
      {
        label: 'Transactions',
        data: dashboardData?.transactionMetrics?.hourlyTransactions?.map(item => item.count) || [],
        borderColor: '#1976d2',
        backgroundColor: 'rgba(25, 118, 210, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const chainDistributionChartData = {
    labels: chainStats.map(chain => chain.name),
    datasets: [
      {
        data: chainStats.map(chain => chain.transactions),
        backgroundColor: chainStats.map(chain => blockchainColors[chain.chain] || '#9e9e9e'),
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    ]
  };

  const volumeByChainChartData = {
    labels: dashboardData?.transactionMetrics?.volumeByChain?.map(item => item.chain) || [],
    datasets: [
      {
        label: 'Volume (USD)',
        data: dashboardData?.transactionMetrics?.volumeByChain?.map(item => item.volume) || [],
        backgroundColor: dashboardData?.transactionMetrics?.volumeByChain?.map(item => 
          blockchainColors[item.chain] || '#9e9e9e'
        ) || [],
        borderRadius: 4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return formatNumber(value);
          }
        }
      }
    }
  };

  if (loading && !dashboardData) {
    return (
      <Box className="enhanced-dashboard loading">
        <LinearProgress />
        <Typography variant="h6" align="center" style={{ marginTop: '20px' }}>
          Loading Enhanced Dashboard...
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="enhanced-dashboard">
      {/* Header */}
      <Box className="dashboard-header">
        <Typography variant="h4" className="dashboard-title">
          Enhanced Admin Dashboard
        </Typography>
        <Box className="dashboard-controls">
          <FormControl size="small" style={{ minWidth: 120, marginRight: '10px' }}>
            <InputLabel>Timeframe</InputLabel>
            <Select
              value={timeframe}
              label="Timeframe"
              onChange={(e) => setTimeframe(e.target.value)}
            >
              {timeframeOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Tooltip title="Refresh Data">
            <IconButton onClick={handleRefresh} color="primary">
              <Refresh />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export Report">
            <IconButton onClick={handleExportReport} color="primary">
              <Download />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Last Update */}
      <Typography variant="body2" color="textSecondary" style={{ marginBottom: '20px' }}>
        Last updated: {lastUpdate.toLocaleString()}
      </Typography>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" style={{ marginBottom: '20px' }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* System Health Alert */}
      {systemHealth && systemHealth.overall.status !== 'healthy' && (
        <Alert 
          severity={systemHealth.overall.status === 'warning' ? 'warning' : 'error'}
          style={{ marginBottom: '20px' }}
        >
          System Health: {systemHealth.overall.status.toUpperCase()} - Score: {systemHealth.overall.score}%
        </Alert>
      )}

      {/* Overview Cards */}
      <Grid container spacing={3} style={{ marginBottom: '30px' }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="metric-card">
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Transactions
              </Typography>
              <Typography variant="h4" className="metric-value">
                {formatNumber(dashboardData?.overview?.totalTransactions)}
              </Typography>
              <Box className="metric-change positive">
                <TrendingUp fontSize="small" />
                <Typography variant="body2">
                  {dashboardData?.transactionMetrics?.successRate}% Success Rate
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="metric-card">
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Volume
              </Typography>
              <Typography variant="h4" className="metric-value">
                {formatCurrency(dashboardData?.overview?.totalVolume)}
              </Typography>
              <Box className="metric-change positive">
                <TrendingUp fontSize="small" />
                <Typography variant="body2">
                  Across {dashboardData?.overview?.totalChains} chains
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="metric-card">
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Users
              </Typography>
              <Typography variant="h4" className="metric-value">
                {formatNumber(dashboardData?.overview?.activeUsers)}
              </Typography>
              <Box className="metric-change positive">
                <TrendingUp fontSize="small" />
                <Typography variant="body2">
                  {formatNumber(dashboardData?.userMetrics?.newUsers)} new users
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="metric-card">
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total NFTs
              </Typography>
              <Typography variant="h4" className="metric-value">
                {formatNumber(dashboardData?.overview?.totalNFTs)}
              </Typography>
              <Box className="metric-change positive">
                <TrendingUp fontSize="small" />
                <Typography variant="body2">
                  {formatCurrency(dashboardData?.nftMetrics?.averagePrice)} avg price
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Blockchain Network Status */}
      <Grid container spacing={3} style={{ marginBottom: '30px' }}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Blockchain Network Status
              </Typography>
              <Grid container spacing={2}>
                {chainStats.map((chain) => (
                  <Grid item xs={12} sm={6} md={3} key={chain.chain}>
                    <Box className="chain-status-card">
                      <Box className="chain-header">
                        <Typography variant="subtitle1" fontWeight="bold">
                          {chain.name}
                        </Typography>
                        <Chip
                          size="small"
                          label={chain.status}
                          color={chain.status === 'online' ? 'success' : 'error'}
                          icon={getHealthStatusIcon(chain.status === 'online' ? 'healthy' : 'critical')}
                        />
                      </Box>
                      <Typography variant="body2" color="textSecondary">
                        Transactions: {formatNumber(chain.transactions)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Volume: {formatCurrency(chain.volume?.totalVolume)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Response: {chain.responseTime}ms
                      </Typography>
                      {chain.errorRate > 0.05 && (
                        <Typography variant="body2" color="error">
                          Error Rate: {(chain.errorRate * 100).toFixed(2)}%
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} style={{ marginBottom: '30px' }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Transaction Volume Over Time
              </Typography>
              <Box style={{ height: '300px' }}>
                <Line data={transactionVolumeChartData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Transactions by Chain
              </Typography>
              <Box style={{ height: '300px' }}>
                <Doughnut 
                  data={chainDistributionChartData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                      },
                    },
                  }} 
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Volume by Chain */}
      <Grid container spacing={3} style={{ marginBottom: '30px' }}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Trading Volume by Blockchain
              </Typography>
              <Box style={{ height: '300px' }}>
                <Bar data={volumeByChainChartData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* System Health */}
      {systemHealth && (
        <Grid container spacing={3} style={{ marginBottom: '30px' }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Database Health
                </Typography>
                <Box className="health-metric">
                  {getHealthStatusIcon(systemHealth.database.status)}
                  <Typography variant="body1">
                    Status: {systemHealth.database.status}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Response Time: {systemHealth.database.responseTime}ms
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  API Health
                </Typography>
                <Box className="health-metric">
                  {getHealthStatusIcon(systemHealth.api.status)}
                  <Typography variant="body1">
                    Status: {systemHealth.api.status}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Requests/min: {formatNumber(systemHealth.api.requestsPerMinute)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Error Rate: {(systemHealth.api.errorRate * 100).toFixed(2)}%
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Blockchain Health
                </Typography>
                <Box className="health-metric">
                  {getHealthStatusIcon(systemHealth.blockchain.status)}
                  <Typography variant="body1">
                    Status: {systemHealth.blockchain.status}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Healthy Chains: {systemHealth.blockchain.healthyChains}/{systemHealth.blockchain.totalChains}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Health Score: {systemHealth.blockchain.percentage.toFixed(1)}%
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Recent Activity */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Platform Activity
              </Typography>
              <Box className="activity-list">
                {recentActivity.slice(0, 10).map((activity, index) => (
                  <Box key={index} className="activity-item">
                    <Box className="activity-icon">
                      {activity.type === 'transaction' && <TrendingUp />}
                      {activity.type === 'auction' && <Visibility />}
                      {activity.type === 'mint' && <CheckCircle />}
                      {activity.type === 'bridge' && <TrendingUp />}
                    </Box>
                    <Box className="activity-content">
                      <Typography variant="body2" fontWeight="bold">
                        {activity.action.replace('_', ' ')}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {activity.nft && `NFT: ${activity.nft}`}
                        {activity.user && ` | User: ${activity.user}`}
                        {activity.blockchain && ` | Chain: ${activity.blockchain}`}
                        {activity.amount && ` | Amount: ${formatCurrency(activity.amount)}`}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="textSecondary" className="activity-time">
                      {new Date(activity.timestamp).toLocaleTimeString()}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EnhancedDashboard;

