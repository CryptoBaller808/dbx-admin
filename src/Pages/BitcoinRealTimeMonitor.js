/**
 * Bitcoin Real-Time Monitor Component
 * Live transaction tracking and network monitoring for admin panel
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { 
  Bitcoin, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Eye, 
  Search,
  Filter,
  RefreshCw,
  Zap,
  Globe,
  Shield,
  TrendingUp,
  Users,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { formatCurrency, formatBTC, formatTime } from '../../utils/formatters';

const BitcoinRealTimeMonitor = () => {
  const [transactions, setTransactions] = useState([]);
  const [networkStats, setNetworkStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [wsConnected, setWsConnected] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  // WebSocket connection for real-time monitoring
  useEffect(() => {
    const ws = new WebSocket('wss://api.digitalblock.exchange/ws/admin/bitcoin-monitor');
    
    ws.onopen = () => {
      setWsConnected(true);
      console.log('Bitcoin monitor WebSocket connected');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'new_transaction':
          setTransactions(prev => [data.data, ...prev.slice(0, 99)]); // Keep last 100
          
          // Check for large transactions
          if (data.data.amount > 10) {
            const alert = {
              id: Date.now(),
              type: 'large_transaction',
              message: `Large BTC transaction: ${formatBTC(data.data.amount)} BTC`,
              timestamp: new Date(),
              severity: 'warning'
            };
            setAlerts(prev => [alert, ...prev.slice(0, 19)]); // Keep last 20
            toast.warning(alert.message);
          }
          break;
          
        case 'network_update':
          setNetworkStats(data.data);
          break;
          
        case 'security_alert':
          const securityAlert = {
            id: Date.now(),
            type: 'security',
            message: data.data.message,
            timestamp: new Date(),
            severity: data.data.severity
          };
          setAlerts(prev => [securityAlert, ...prev.slice(0, 19)]);
          
          if (data.data.severity === 'high') {
            toast.error(data.data.message);
          } else {
            toast.warning(data.data.message);
          }
          break;
      }
    };

    ws.onclose = () => {
      setWsConnected(false);
      console.log('Bitcoin monitor WebSocket disconnected');
    };

    return () => {
      ws.close();
    };
  }, []);

  // Filter transactions
  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = !searchTerm || 
      tx.hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.fromAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.toAddress?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesFilter = filterType === 'all' || tx.type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  // Mock network stats for demonstration
  const mockNetworkStats = {
    blockHeight: 820145,
    difficulty: '73.197T',
    hashRate: '450.2 EH/s',
    mempoolSize: 12456,
    avgFee: 0.00015,
    avgConfirmationTime: '10 minutes',
    networkHealth: 'excellent'
  };

  // Mock transactions for demonstration
  const mockTransactions = [
    {
      id: '1',
      hash: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0',
      type: 'deposit',
      amount: 0.5,
      fromAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      toAddress: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy',
      status: 'confirmed',
      confirmations: 6,
      timestamp: new Date(Date.now() - 300000),
      fee: 0.00012,
      userId: 'user123'
    },
    {
      id: '2',
      hash: 'b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1',
      type: 'withdrawal',
      amount: 1.25,
      fromAddress: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy',
      toAddress: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
      status: 'pending',
      confirmations: 2,
      timestamp: new Date(Date.now() - 600000),
      fee: 0.00018,
      userId: 'user456'
    },
    {
      id: '3',
      hash: 'c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2',
      type: 'trade',
      amount: 0.75,
      fromAddress: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
      toAddress: '3FupnwfuTJ5w4b8F6VXjKz8F8KvxqJ9Qz2',
      status: 'confirmed',
      confirmations: 12,
      timestamp: new Date(Date.now() - 900000),
      fee: 0.00009,
      userId: 'user789'
    }
  ];

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-600 text-white">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-full">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl">Bitcoin Real-Time Monitor</CardTitle>
                <p className="text-orange-100 text-sm">Live transaction tracking and network monitoring</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="text-xs">{wsConnected ? 'Live' : 'Offline'}</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Network Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Block Height</p>
                <p className="text-xl font-bold">{(networkStats?.blockHeight || mockNetworkStats.blockHeight).toLocaleString()}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <Globe className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Mempool Size</p>
                <p className="text-xl font-bold">{(networkStats?.mempoolSize || mockNetworkStats.mempoolSize).toLocaleString()}</p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-full">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Fee</p>
                <p className="text-xl font-bold">{formatBTC(networkStats?.avgFee || mockNetworkStats.avgFee)}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Network Health</p>
                <p className="text-xl font-bold text-green-600">
                  {(networkStats?.networkHealth || mockNetworkStats.networkHealth).toUpperCase()}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Transactions */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Live Bitcoin Transactions</CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search by hash or address..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 w-64"
                    />
                  </div>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-3 py-1 border rounded text-sm"
                  >
                    <option value="all">All Types</option>
                    <option value="deposit">Deposits</option>
                    <option value="withdrawal">Withdrawals</option>
                    <option value="trade">Trades</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {(filteredTransactions.length > 0 ? filteredTransactions : mockTransactions).map((tx) => (
                  <div 
                    key={tx.id} 
                    className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                    onClick={() => setSelectedTransaction(tx)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-1 bg-orange-100 rounded">
                          {tx.type === 'deposit' ? (
                            <ArrowDownLeft className="h-4 w-4 text-green-600" />
                          ) : tx.type === 'withdrawal' ? (
                            <ArrowUpRight className="h-4 w-4 text-red-600" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-sm">{formatBTC(tx.amount)} BTC</span>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                tx.status === 'confirmed' ? 'text-green-600' : 
                                tx.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                              }`}
                            >
                              {tx.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500">
                            {tx.hash.substring(0, 16)}...{tx.hash.substring(tx.hash.length - 8)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{tx.confirmations}/6</p>
                        <p className="text-xs text-gray-500">{formatTime(tx.timestamp)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts & Notifications */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4" />
                <span>Security Alerts</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {alerts.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-4">No alerts</p>
                ) : (
                  alerts.map((alert) => (
                    <div 
                      key={alert.id} 
                      className={`p-2 rounded text-xs ${
                        alert.severity === 'high' ? 'bg-red-50 text-red-700' :
                        alert.severity === 'warning' ? 'bg-yellow-50 text-yellow-700' :
                        'bg-blue-50 text-blue-700'
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">{alert.message}</p>
                          <p className="text-xs opacity-75">{formatTime(alert.timestamp)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Shield className="h-4 w-4 mr-2" />
                Security Scan
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Network Stats
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Eye className="h-4 w-4 mr-2" />
                View All Transactions
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Filter className="h-4 w-4 mr-2" />
                Advanced Filters
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Transaction Details</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedTransaction(null)}
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Transaction Hash</p>
                  <p className="text-sm font-mono break-all">{selectedTransaction.hash}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Amount</p>
                  <p className="text-lg font-bold">{formatBTC(selectedTransaction.amount)} BTC</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <Badge 
                    variant="outline" 
                    className={
                      selectedTransaction.status === 'confirmed' ? 'text-green-600' : 
                      selectedTransaction.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                    }
                  >
                    {selectedTransaction.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Confirmations</p>
                  <p className="text-sm">{selectedTransaction.confirmations}/6</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">From Address</p>
                  <p className="text-sm font-mono break-all">{selectedTransaction.fromAddress}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">To Address</p>
                  <p className="text-sm font-mono break-all">{selectedTransaction.toAddress}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Fee</p>
                  <p className="text-sm">{formatBTC(selectedTransaction.fee)} BTC</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Timestamp</p>
                  <p className="text-sm">{selectedTransaction.timestamp.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default BitcoinRealTimeMonitor;

