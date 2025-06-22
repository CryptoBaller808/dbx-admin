/**
 * Bitcoin Transaction Monitor Component
 * Real-time Bitcoin transaction monitoring and compliance tools
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Eye, 
  Flag,
  Bitcoin,
  ExternalLink,
  Copy,
  Shield,
  TrendingUp,
  Users
} from 'lucide-react';
import { formatCurrency, formatBTC, truncateAddress } from '../../utils/formatters';
import { toast } from 'react-hot-toast';

const BitcoinTransactionMonitor = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [amountFilter, setAmountFilter] = useState('all');
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    failed: 0,
    flagged: 0,
    highValue: 0
  });

  useEffect(() => {
    fetchTransactions();
    fetchAlerts();
    const interval = setInterval(fetchTransactions, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [transactions, searchTerm, statusFilter, amountFilter, flaggedOnly]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/bitcoin/transactions?limit=100', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
      });

      if (response.ok) {
        const result = await response.json();
        setTransactions(result.data.transactions);
        setStats(result.data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      toast.error('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await fetch('/api/admin/bitcoin/alerts/active', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
      });

      if (response.ok) {
        const result = await response.json();
        setAlerts(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    }
  };

  const filterTransactions = () => {
    let filtered = [...transactions];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(tx => 
        tx.txid.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.fromAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.toAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.userId?.toString().includes(searchTerm)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(tx => tx.status === statusFilter);
    }

    // Amount filter
    if (amountFilter !== 'all') {
      const thresholds = {
        small: [0, 0.1],
        medium: [0.1, 1],
        large: [1, 10],
        huge: [10, Infinity]
      };
      const [min, max] = thresholds[amountFilter];
      filtered = filtered.filter(tx => tx.amount >= min && tx.amount < max);
    }

    // Flagged filter
    if (flaggedOnly) {
      filtered = filtered.filter(tx => tx.flagged || tx.suspicious);
    }

    setFilteredTransactions(filtered);
  };

  const flagTransaction = async (txid, reason) => {
    try {
      const response = await fetch('/api/admin/bitcoin/transactions/flag', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ txid, reason })
      });

      if (response.ok) {
        toast.success('Transaction flagged successfully');
        fetchTransactions();
      } else {
        throw new Error('Failed to flag transaction');
      }
    } catch (error) {
      console.error('Failed to flag transaction:', error);
      toast.error('Failed to flag transaction');
    }
  };

  const exportTransactions = async () => {
    try {
      const response = await fetch('/api/admin/bitcoin/transactions/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          filters: { statusFilter, amountFilter, flaggedOnly, searchTerm }
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bitcoin-transactions-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Transactions exported successfully');
      }
    } catch (error) {
      console.error('Failed to export transactions:', error);
      toast.error('Failed to export transactions');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bitcoin className="h-8 w-8" />
              <div>
                <CardTitle className="text-2xl font-bold">Bitcoin Transaction Monitor</CardTitle>
                <p className="text-orange-100">Real-time monitoring and compliance tools</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="secondary" size="sm" onClick={exportTransactions}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="secondary" size="sm" onClick={fetchTransactions} disabled={loading}>
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              <span>Active Alerts ({alerts.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {alerts.slice(0, 4).map((alert, index) => (
                <div key={index} className="p-3 bg-white border border-red-200 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="destructive">{alert.type}</Badge>
                    <span className="text-xs text-gray-500">{alert.timestamp}</span>
                  </div>
                  <p className="text-sm font-semibold">{alert.title}</p>
                  <p className="text-xs text-gray-600">{alert.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-sm text-gray-600">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-sm text-gray-600">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
            <p className="text-sm text-gray-600">Confirmed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
            <p className="text-sm text-gray-600">Failed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-orange-600">{stats.flagged}</p>
            <p className="text-sm text-gray-600">Flagged</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">{stats.highValue}</p>
            <p className="text-sm text-gray-600">High Value</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by TX ID, address, or user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="failed">Failed</option>
            </select>

            <select
              value={amountFilter}
              onChange={(e) => setAmountFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Amounts</option>
              <option value="small">Small (&lt; 0.1 BTC)</option>
              <option value="medium">Medium (0.1-1 BTC)</option>
              <option value="large">Large (1-10 BTC)</option>
              <option value="huge">Huge (&gt; 10 BTC)</option>
            </select>

            <Button
              variant={flaggedOnly ? "default" : "outline"}
              onClick={() => setFlaggedOnly(!flaggedOnly)}
              className="flex items-center space-x-2"
            >
              <Flag className="h-4 w-4" />
              <span>Flagged Only</span>
            </Button>

            <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setAmountFilter('all');
              setFlaggedOnly(false);
            }}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Bitcoin Transactions ({filteredTransactions.length})</span>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">{filteredTransactions.length} of {transactions.length}</Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">TX ID</th>
                  <th className="text-left p-3">From</th>
                  <th className="text-left p-3">To</th>
                  <th className="text-left p-3">Amount</th>
                  <th className="text-left p-3">Fee</th>
                  <th className="text-left p-3">Time</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(tx.status)}
                        <Badge className={getStatusColor(tx.status)}>
                          {tx.status}
                        </Badge>
                        {(tx.flagged || tx.suspicious) && (
                          <Flag className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-sm">{truncateAddress(tx.txid)}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(tx.txid)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="font-mono text-sm">{truncateAddress(tx.fromAddress)}</span>
                    </td>
                    <td className="p-3">
                      <span className="font-mono text-sm">{truncateAddress(tx.toAddress)}</span>
                    </td>
                    <td className="p-3">
                      <div>
                        <p className="font-semibold">{formatBTC(tx.amount)} BTC</p>
                        <p className="text-xs text-gray-500">≈ ${formatCurrency(tx.amount * 45000)}</p>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="text-sm">{formatBTC(tx.fee)} BTC</span>
                    </td>
                    <td className="p-3">
                      <div>
                        <p className="text-sm">{new Date(tx.timestamp).toLocaleDateString()}</p>
                        <p className="text-xs text-gray-500">{new Date(tx.timestamp).toLocaleTimeString()}</p>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedTransaction(tx)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {!tx.flagged && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => flagTransaction(tx.txid, 'Manual review')}
                          >
                            <Flag className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`https://blockstream.info/tx/${tx.txid}`, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No transactions found matching your filters</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Transaction Details</CardTitle>
                <Button variant="ghost" onClick={() => setSelectedTransaction(null)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-600">Transaction ID</label>
                  <p className="font-mono text-sm break-all">{selectedTransaction.txid}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Status</label>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(selectedTransaction.status)}
                    <Badge className={getStatusColor(selectedTransaction.status)}>
                      {selectedTransaction.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Amount</label>
                  <p className="font-semibold">{formatBTC(selectedTransaction.amount)} BTC</p>
                  <p className="text-xs text-gray-500">≈ ${formatCurrency(selectedTransaction.amount * 45000)}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Fee</label>
                  <p>{formatBTC(selectedTransaction.fee)} BTC</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">From Address</label>
                  <p className="font-mono text-sm break-all">{selectedTransaction.fromAddress}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">To Address</label>
                  <p className="font-mono text-sm break-all">{selectedTransaction.toAddress}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Confirmations</label>
                  <p>{selectedTransaction.confirmations || 0}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Block Height</label>
                  <p>{selectedTransaction.blockHeight || 'Unconfirmed'}</p>
                </div>
              </div>

              {selectedTransaction.flagged && (
                <div className="p-4 bg-red-50 border border-red-200 rounded">
                  <div className="flex items-center space-x-2 mb-2">
                    <Flag className="h-4 w-4 text-red-500" />
                    <span className="font-semibold text-red-800">Flagged Transaction</span>
                  </div>
                  <p className="text-sm text-red-600">{selectedTransaction.flagReason}</p>
                </div>
              )}

              <div className="flex space-x-2">
                <Button
                  onClick={() => window.open(`https://blockstream.info/tx/${selectedTransaction.txid}`, '_blank')}
                  className="flex items-center space-x-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>View on Explorer</span>
                </Button>
                {!selectedTransaction.flagged && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      flagTransaction(selectedTransaction.txid, 'Manual review');
                      setSelectedTransaction(null);
                    }}
                    className="flex items-center space-x-2"
                  >
                    <Flag className="h-4 w-4" />
                    <span>Flag Transaction</span>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default BitcoinTransactionMonitor;

