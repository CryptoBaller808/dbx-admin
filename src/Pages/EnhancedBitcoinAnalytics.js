/**
 * Enhanced Bitcoin Analytics Dashboard
 * Comprehensive real-time Bitcoin metrics and insights for admin panel
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { DatePicker } from '../ui/date-picker';
import { 
  Bitcoin, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  Download, 
  Filter,
  RefreshCw,
  Users,
  Wallet,
  ArrowUpDown,
  DollarSign,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Calendar,
  Target,
  Zap,
  Globe,
  Shield,
  Eye
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart as RechartsPieChart, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { toast } from 'react-hot-toast';
import { formatCurrency, formatBTC, formatPercentage } from '../../utils/formatters';

const EnhancedBitcoinAnalytics = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [userType, setUserType] = useState('all');
  const [transactionType, setTransactionType] = useState('all');
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [analyticsData, setAnalyticsData] = useState(null);
  const [realTimeMetrics, setRealTimeMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('volume');
  const [exportFormat, setExportFormat] = useState('csv');

  // Real-time WebSocket connection
  useEffect(() => {
    const ws = new WebSocket('wss://api.digitalblock.exchange/ws/admin/bitcoin-analytics');
    
    ws.onopen = () => {
      setWsConnected(true);
      console.log('Bitcoin analytics WebSocket connected');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'real_time_metrics':
          setRealTimeMetrics(data.data);
          break;
        case 'transaction_alert':
          if (data.data.amount > 10) { // Large transaction alert
            toast.info(`Large BTC transaction: ${formatBTC(data.data.amount)} BTC`, {
              duration: 5000
            });
          }
          break;
        case 'analytics_update':
          setAnalyticsData(prev => ({ ...prev, ...data.data }));
          break;
      }
    };

    ws.onclose = () => {
      setWsConnected(false);
      console.log('Bitcoin analytics WebSocket disconnected');
    };

    return () => {
      ws.close();
    };
  }, []);

  // Fetch analytics data
  const fetchAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        timeRange,
        userType,
        transactionType,
        ...(dateRange.from && { startDate: dateRange.from.toISOString() }),
        ...(dateRange.to && { endDate: dateRange.to.toISOString() })
      });

      const response = await fetch(`/api/admin/bitcoin-analytics?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setAnalyticsData(result.data);
      } else {
        throw new Error('Failed to fetch analytics data');
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, [timeRange, userType, transactionType, dateRange]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  // Export data
  const exportData = async (format) => {
    try {
      const params = new URLSearchParams({
        format,
        timeRange,
        userType,
        transactionType,
        metric: selectedMetric
      });

      const response = await fetch(`/api/admin/bitcoin-analytics/export?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bitcoin-analytics-${Date.now()}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast.success(`Analytics exported as ${format.toUpperCase()}`);
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export data');
    }
  };

  // Mock data for demonstration
  const mockVolumeData = useMemo(() => [
    { date: '2024-01-01', volume: 1234.56, trades: 456, users: 123 },
    { date: '2024-01-02', volume: 1456.78, trades: 567, users: 145 },
    { date: '2024-01-03', volume: 1678.90, trades: 678, users: 167 },
    { date: '2024-01-04', volume: 1890.12, trades: 789, users: 189 },
    { date: '2024-01-05', volume: 2012.34, trades: 890, users: 201 },
    { date: '2024-01-06', volume: 2234.56, trades: 901, users: 223 },
    { date: '2024-01-07', volume: 2456.78, trades: 1012, users: 245 }
  ], []);

  const mockPairData = useMemo(() => [
    { pair: 'BTC/USDT', volume: 45.67, percentage: 35.2, color: '#f59e0b' },
    { pair: 'BTC/ETH', volume: 23.45, percentage: 18.1, color: '#8b5cf6' },
    { pair: 'BTC/XRP', volume: 18.90, percentage: 14.6, color: '#06b6d4' },
    { pair: 'BTC/SOL', volume: 15.67, percentage: 12.1, color: '#10b981' },
    { pair: 'BTC/AVAX', volume: 12.34, percentage: 9.5, color: '#ef4444' },
    { pair: 'Others', volume: 13.45, percentage: 10.5, color: '#6b7280' }
  ], []);

  const mockUserMetrics = useMemo(() => ({
    totalUsers: 12456,
    activeUsers: 8901,
    newUsers: 234,
    walletCreations: 156,
    deposits: 89,
    withdrawals: 67,
    avgTransactionSize: 0.045
  }), []);

  const timeRangeOptions = [
    { value: '1d', label: '24 Hours' },
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const userTypeOptions = [
    { value: 'all', label: 'All Users' },
    { value: 'retail', label: 'Retail' },
    { value: 'institutional', label: 'Institutional' },
    { value: 'vip', label: 'VIP' }
  ];

  const transactionTypeOptions = [
    { value: 'all', label: 'All Transactions' },
    { value: 'swap', label: 'Swaps' },
    { value: 'deposit', label: 'Deposits' },
    { value: 'withdrawal', label: 'Withdrawals' },
    { value: 'trade', label: 'Trades' }
  ];

  return (
    <div className="w-full space-y-6">
      {/* Enhanced Header */}
      <Card className="bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-600 text-white">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-full">
                <Bitcoin className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl">Bitcoin Analytics Dashboard</CardTitle>
                <p className="text-orange-100 text-sm">Real-time insights and comprehensive reporting</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span className="text-xs">{wsConnected ? 'Live' : 'Offline'}</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={fetchAnalyticsData}
                className="text-white hover:bg-white/20"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Real-Time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">BTC Price</p>
                <p className="text-2xl font-bold text-orange-600">
                  ${formatCurrency(realTimeMetrics?.price || 45000)}
                </p>
                <p className={`text-xs ${(realTimeMetrics?.priceChange || 2.5) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {(realTimeMetrics?.priceChange || 2.5) >= 0 ? '+' : ''}{formatPercentage(realTimeMetrics?.priceChange || 2.5)} 24h
                </p>
              </div>
              <div className="p-2 bg-orange-100 rounded-full">
                <Bitcoin className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">24h Volume</p>
                <p className="text-2xl font-bold">
                  {formatBTC(realTimeMetrics?.volume || 1234.56)} BTC
                </p>
                <p className="text-xs text-gray-500">
                  ${formatCurrency((realTimeMetrics?.volume || 1234.56) * 45000)}
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-2xl font-bold">
                  {(realTimeMetrics?.activeUsers || 8901).toLocaleString()}
                </p>
                <p className="text-xs text-green-600">
                  +{realTimeMetrics?.newUsers || 234} new today
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Network Status</p>
                <p className="text-lg font-bold text-green-600">Healthy</p>
                <p className="text-xs text-gray-500">
                  Block: {(realTimeMetrics?.blockHeight || 820000).toLocaleString()}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>Analytics Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-medium mb-1 block">Time Range</label>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeRangeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium mb-1 block">User Type</label>
              <Select value={userType} onValueChange={setUserType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {userTypeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium mb-1 block">Transaction Type</label>
              <Select value={transactionType} onValueChange={setTransactionType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {transactionTypeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium mb-1 block">Export</label>
              <div className="flex space-x-2">
                <Select value={exportFormat} onValueChange={setExportFormat}>
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="xlsx">Excel</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  size="sm" 
                  onClick={() => exportData(exportFormat)}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trading">Trading</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Volume Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Bitcoin Trading Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={mockVolumeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="volume" 
                      stroke="#f59e0b" 
                      fill="#fef3c7" 
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Trading Pairs Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Trading Pairs Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={mockPairData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="percentage"
                    >
                      {mockPairData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Trading Pairs Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Top Bitcoin Trading Pairs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {mockPairData.map((pair, index) => (
                  <div key={pair.pair} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: pair.color }}
                        ></div>
                        <span className="font-medium">{pair.pair}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatBTC(pair.volume)} BTC</div>
                      <div className="text-sm text-gray-500">{formatPercentage(pair.percentage)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trading Tab */}
        <TabsContent value="trading" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Trade Count */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Trades</p>
                    <p className="text-2xl font-bold">8,901</p>
                    <p className="text-xs text-green-600">+12.5% vs yesterday</p>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-full">
                    <ArrowUpDown className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Average Trade Size */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg Trade Size</p>
                    <p className="text-2xl font-bold">{formatBTC(0.045)} BTC</p>
                    <p className="text-xs text-gray-500">${formatCurrency(0.045 * 45000)}</p>
                  </div>
                  <div className="p-2 bg-green-100 rounded-full">
                    <Target className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Success Rate */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Success Rate</p>
                    <p className="text-2xl font-bold">99.8%</p>
                    <p className="text-xs text-green-600">18 failed trades</p>
                  </div>
                  <div className="p-2 bg-green-100 rounded-full">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Trading Activity Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Trading Activity Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={mockVolumeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="trades" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    name="Number of Trades"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="volume" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    name="Volume (BTC)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold">{mockUserMetrics.totalUsers.toLocaleString()}</p>
                  </div>
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Users</p>
                    <p className="text-2xl font-bold">{mockUserMetrics.activeUsers.toLocaleString()}</p>
                  </div>
                  <Activity className="h-6 w-6 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">New Wallets</p>
                    <p className="text-2xl font-bold">{mockUserMetrics.walletCreations}</p>
                  </div>
                  <Wallet className="h-6 w-6 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg Transaction</p>
                    <p className="text-2xl font-bold">{formatBTC(mockUserMetrics.avgTransactionSize)}</p>
                  </div>
                  <DollarSign className="h-6 w-6 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* User Activity Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">User Activity Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mockVolumeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="users" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Scheduled Reports */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Scheduled Reports</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="font-medium text-sm">Daily Bitcoin Summary</p>
                      <p className="text-xs text-gray-500">Every day at 9:00 AM</p>
                    </div>
                  </div>
                  <Badge variant="outline">Active</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="font-medium text-sm">Weekly Analytics Report</p>
                      <p className="text-xs text-gray-500">Every Monday at 8:00 AM</p>
                    </div>
                  </div>
                  <Badge variant="outline">Active</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-purple-600" />
                    <div>
                      <p className="font-medium text-sm">Monthly Compliance Report</p>
                      <p className="text-xs text-gray-500">First day of each month</p>
                    </div>
                  </div>
                  <Badge variant="outline">Active</Badge>
                </div>

                <Button className="w-full" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule New Report
                </Button>
              </CardContent>
            </Card>

            {/* Quick Reports */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Quick Reports</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => exportData('pdf')}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Current Period Report
                </Button>

                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => exportData('csv')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Transaction Data
                </Button>

                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => exportData('xlsx')}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  User Analytics Summary
                </Button>

                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Compliance Audit Report
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Reports */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Recent Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { name: 'Bitcoin Analytics - January 2024', date: '2024-01-31', size: '2.4 MB', status: 'completed' },
                  { name: 'Weekly Trading Summary', date: '2024-01-29', size: '1.8 MB', status: 'completed' },
                  { name: 'User Activity Report', date: '2024-01-28', size: '3.1 MB', status: 'completed' },
                  { name: 'Compliance Audit Q4 2023', date: '2024-01-25', size: '5.2 MB', status: 'completed' }
                ].map((report, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="font-medium text-sm">{report.name}</p>
                        <p className="text-xs text-gray-500">{report.date} • {report.size}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-green-600">
                        {report.status}
                      </Badge>
                      <Button size="sm" variant="ghost">
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedBitcoinAnalytics;

