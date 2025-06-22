/**
 * Bitcoin Admin Analytics Component
 * Comprehensive Bitcoin analytics dashboard for administrators
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Bitcoin, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Activity, 
  BarChart3,
  PieChart,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Wallet,
  ArrowUpDown
} from 'lucide-react';
import { formatCurrency, formatBTC, formatPercentage } from '../../utils/formatters';
import BitcoinChart from '../BitcoinTrading/BitcoinChart';

const BitcoinAdminAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    overview: {
      totalUsers: 0,
      activeWallets: 0,
      totalVolume: 0,
      totalTransactions: 0,
      averageBalance: 0
    },
    trading: {
      dailyVolume: 0,
      weeklyVolume: 0,
      monthlyVolume: 0,
      topPairs: [],
      swapActivity: []
    },
    transactions: {
      pending: 0,
      confirmed: 0,
      failed: 0,
      highValue: [],
      suspicious: []
    },
    network: {
      fees: { slow: 0, standard: 0, fast: 0 },
      mempool: { count: 0, size: 0 },
      blockHeight: 0
    }
  });
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('7d');
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetchBitcoinAnalytics();
    const interval = setInterval(fetchBitcoinAnalytics, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [timeRange]);

  const fetchBitcoinAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch comprehensive Bitcoin analytics
      const [overviewRes, tradingRes, transactionsRes, networkRes, alertsRes] = await Promise.all([
        fetch(`/api/admin/bitcoin/analytics/overview?timeRange=${timeRange}`),
        fetch(`/api/admin/bitcoin/analytics/trading?timeRange=${timeRange}`),
        fetch(`/api/admin/bitcoin/analytics/transactions?timeRange=${timeRange}`),
        fetch('/api/bitcoin/network/stats'),
        fetch('/api/admin/bitcoin/alerts')
      ]);

      if (overviewRes.ok && tradingRes.ok && transactionsRes.ok && networkRes.ok) {
        const [overview, trading, transactions, network, alertsData] = await Promise.all([
          overviewRes.json(),
          tradingRes.json(),
          transactionsRes.json(),
          networkRes.json(),
          alertsRes.ok ? alertsRes.json() : { data: [] }
        ]);

        setAnalytics({
          overview: overview.data,
          trading: trading.data,
          transactions: transactions.data,
          network: network.data
        });

        setAlerts(alertsData.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch Bitcoin analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportAnalytics = async () => {
    try {
      const response = await fetch(`/api/admin/bitcoin/analytics/export?timeRange=${timeRange}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bitcoin-analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Failed to export analytics:', error);
    }
  };

  const timeRanges = [
    { label: '24H', value: '1d' },
    { label: '7D', value: '7d' },
    { label: '30D', value: '30d' },
    { label: '90D', value: '90d' }
  ];

  return (
    <div className="w-full space-y-6">
      {/* Bitcoin Analytics Header */}
      <Card className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bitcoin className="h-8 w-8" />
              <div>
                <CardTitle className="text-2xl font-bold">Bitcoin Analytics</CardTitle>
                <p className="text-orange-100">Comprehensive Bitcoin monitoring and insights</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                {timeRanges.map((range) => (
                  <Button
                    key={range.value}
                    variant={timeRange === range.value ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setTimeRange(range.value)}
                    className="text-white hover:bg-white/20"
                  >
                    {range.label}
                  </Button>
                ))}
              </div>
              <Button variant="secondary" size="sm" onClick={exportAnalytics}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="secondary" size="sm" onClick={fetchBitcoinAnalytics} disabled={loading}>
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              <span>Bitcoin Alerts ({alerts.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.slice(0, 3).map((alert, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white rounded border">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      alert.severity === 'high' ? 'bg-red-500' :
                      alert.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`} />
                    <div>
                      <p className="font-semibold text-sm">{alert.title}</p>
                      <p className="text-xs text-gray-600">{alert.description}</p>
                    </div>
                  </div>
                  <Badge variant={alert.severity === 'high' ? 'destructive' : 'secondary'}>
                    {alert.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium text-gray-600">Total Users</span>
            </div>
            <p className="text-2xl font-bold mt-2">{analytics.overview.totalUsers.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">Bitcoin wallet holders</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Wallet className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium text-gray-600">Active Wallets</span>
            </div>
            <p className="text-2xl font-bold mt-2">{analytics.overview.activeWallets.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-orange-500" />
              <span className="text-sm font-medium text-gray-600">Total Volume</span>
            </div>
            <p className="text-2xl font-bold mt-2">{formatBTC(analytics.overview.totalVolume)} BTC</p>
            <p className="text-xs text-gray-500 mt-1">≈ ${formatCurrency(analytics.overview.totalVolume * 45000)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-purple-500" />
              <span className="text-sm font-medium text-gray-600">Transactions</span>
            </div>
            <p className="text-2xl font-bold mt-2">{analytics.overview.totalTransactions.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-yellow-500" />
              <span className="text-sm font-medium text-gray-600">Avg Balance</span>
            </div>
            <p className="text-2xl font-bold mt-2">{formatBTC(analytics.overview.averageBalance)} BTC</p>
            <p className="text-xs text-gray-500 mt-1">Per active wallet</p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="trading" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trading">Trading</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="network">Network</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        {/* Trading Analytics */}
        <TabsContent value="trading" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Volume Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Trading Volume</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Daily</p>
                    <p className="text-lg font-bold">{formatBTC(analytics.trading.dailyVolume)} BTC</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Weekly</p>
                    <p className="text-lg font-bold">{formatBTC(analytics.trading.weeklyVolume)} BTC</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Monthly</p>
                    <p className="text-lg font-bold">{formatBTC(analytics.trading.monthlyVolume)} BTC</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Trading Pairs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChart className="h-5 w-5" />
                  <span>Top Bitcoin Pairs</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.trading.topPairs.map((pair, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full bg-orange-${(index + 1) * 100}`} />
                        <span className="font-semibold">{pair.symbol}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatBTC(pair.volume)} BTC</p>
                        <p className="text-xs text-gray-500">{formatPercentage(pair.percentage)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Swap Activity Heatmap */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ArrowUpDown className="h-5 w-5" />
                <span>Bitcoin Swap Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {analytics.trading.swapActivity.map((swap, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold">{swap.pair}</span>
                      <Badge variant="secondary">{swap.count}</Badge>
                    </div>
                    <p className="text-lg font-bold">{formatBTC(swap.volume)} BTC</p>
                    <p className="text-xs text-gray-500">≈ ${formatCurrency(swap.usdValue)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transaction Analytics */}
        <TabsContent value="transactions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Transaction Status */}
            <Card>
              <CardHeader>
                <CardTitle>Transaction Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-yellow-500" />
                    <span>Pending</span>
                  </div>
                  <Badge variant="secondary">{analytics.transactions.pending}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Confirmed</span>
                  </div>
                  <Badge variant="success">{analytics.transactions.confirmed}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <span>Failed</span>
                  </div>
                  <Badge variant="destructive">{analytics.transactions.failed}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* High Value Transactions */}
            <Card>
              <CardHeader>
                <CardTitle>High Value Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.transactions.highValue.slice(0, 5).map((tx, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <p className="text-sm font-semibold">{formatBTC(tx.amount)} BTC</p>
                        <p className="text-xs text-gray-500">{tx.timestamp}</p>
                      </div>
                      <Badge variant={tx.flagged ? 'destructive' : 'secondary'}>
                        {tx.flagged ? 'Flagged' : 'Normal'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Suspicious Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <span>Suspicious Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.transactions.suspicious.length > 0 ? (
                    analytics.transactions.suspicious.map((activity, index) => (
                      <div key={index} className="p-3 bg-red-50 border border-red-200 rounded">
                        <p className="text-sm font-semibold text-red-800">{activity.type}</p>
                        <p className="text-xs text-red-600">{activity.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">No suspicious activity detected</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Network Analytics */}
        <TabsContent value="network" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Network Status */}
            <Card>
              <CardHeader>
                <CardTitle>Bitcoin Network Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Block Height</span>
                  <span className="font-semibold">{analytics.network.blockHeight?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Mempool Size</span>
                  <span className="font-semibold">{analytics.network.mempool?.count?.toLocaleString()} txs</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Mempool Bytes</span>
                  <span className="font-semibold">{(analytics.network.mempool?.size / 1024 / 1024)?.toFixed(2)} MB</span>
                </div>
              </CardContent>
            </Card>

            {/* Fee Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>Current Fee Rates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Slow (1+ hours)</span>
                  <span className="font-semibold">{analytics.network.fees?.slow} sat/vB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Standard (30 min)</span>
                  <span className="font-semibold">{analytics.network.fees?.standard} sat/vB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fast (10 min)</span>
                  <span className="font-semibold">{analytics.network.fees?.fast} sat/vB</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bitcoin Price Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Bitcoin Price Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <BitcoinChart pair="BTC/USDT" height={300} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Analytics */}
        <TabsContent value="compliance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* KYC Status */}
            <Card>
              <CardHeader>
                <CardTitle>KYC Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Verified Users</span>
                    <Badge variant="success">85%</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pending Verification</span>
                    <Badge variant="secondary">12%</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rejected</span>
                    <Badge variant="destructive">3%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AML Monitoring */}
            <Card>
              <CardHeader>
                <CardTitle>AML Monitoring</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Clean Transactions</span>
                    <Badge variant="success">98.5%</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Under Review</span>
                    <Badge variant="secondary">1.2%</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Flagged</span>
                    <Badge variant="destructive">0.3%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BitcoinAdminAnalytics;

