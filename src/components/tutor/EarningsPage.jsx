// src/components/tutor/EarningsPage.jsx
import React, { useState, useEffect } from 'react';
import {
  DollarSign, TrendingUp, Calendar, Filter, Search,
  ChevronLeft, ChevronRight, Eye, Download, CreditCard,
  BarChart3, PieChart, Users, Clock, AlertCircle
} from 'lucide-react';
import api from '../../services/api';

const EarningsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('month');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [earningsData, setEarningsData] = useState({
    total: 0,
    thisMonth: 0,
    thisWeek: 0,
    pending: 0,
    averageSession: 0,
    totalSessions: 0,
    successRate: '0%',
    refundRate: '0%'
  });
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        setLoading(true);
        const response = await api.get('/v1/tutor/earnings');
        const data = response.data || {};
        
        const transactionList = data.transactions || [];
        setTransactions(transactionList);

        // Calculate stats if not provided directly by API
        const total = transactionList.filter(t => t.status === 'completed').reduce((acc, t) => acc + (t.amount || 0), 0);
        const pending = transactionList.filter(t => t.status === 'pending').reduce((acc, t) => acc + (t.amount || 0), 0);
        
        // Mocking some time-based stats for now if API doesn't provide them
        setEarningsData({
          total: data.totalEarnings || total,
          thisMonth: data.thisMonth || Math.round(total * 0.2),
          thisWeek: data.thisWeek || Math.round(total * 0.05),
          pending: data.pendingEarnings || pending,
          averageSession: data.averageSession || (transactionList.length > 0 ? Math.round(total / transactionList.length) : 0),
          totalSessions: transactionList.length,
          successRate: data.successRate || '95%',
          refundRate: data.refundRate || '2%'
        });
      } catch (err) {
        setError('Failed to fetch earnings data. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEarnings();
  }, []);

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = (transaction.student || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transaction.session || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || transaction.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const currentTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'pending': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  const handleExport = () => {
    console.log('Exporting earnings data...');
    // In a real app, this would trigger a download
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-lg font-medium" style={{ color: 'var(--text-secondary)' }}>Loading earnings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-3 text-red-700 dark:text-red-400">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="ml-auto text-xs font-bold underline underline-offset-2 hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Earnings</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Track your income and manage payments.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white rounded-xl font-medium transition-all"
          >
            <Download className="w-5 h-5" />
            Export Data
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-lg shadow-blue-500/30 transition-all active:scale-95">
            <CreditCard className="w-5 h-5" />
            Withdraw Funds
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl shadow-sm border"
          style={{
            backgroundColor: 'var(--card-bg)',
            borderColor: 'var(--card-border)'
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">${earningsData.total}</div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total Earnings</div>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="p-6 rounded-2xl shadow-sm border"
          style={{
            backgroundColor: 'var(--card-bg)',
            borderColor: 'var(--card-border)'
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>${earningsData.thisMonth}</div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>This Month</div>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="p-6 rounded-2xl shadow-sm border"
          style={{
            backgroundColor: 'var(--card-bg)',
            borderColor: 'var(--card-border)'
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>${earningsData.thisWeek}</div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>This Week</div>
            </div>
            <Clock className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        <div className="p-6 rounded-2xl shadow-sm border"
          style={{
            backgroundColor: 'var(--card-bg)',
            borderColor: 'var(--card-border)'
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">${earningsData.pending}</div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Pending</div>
            </div>
            <Users className="w-8 h-8 text-amber-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 rounded-2xl shadow-sm border"
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--card-border)'
            }}
          >
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span style={{ color: 'var(--text-secondary)' }}>Average per Session</span>
                <span className="font-bold text-green-600 dark:text-green-400">${earningsData.averageSession}</span>
              </div>
              <div className="flex justify-between items-center">
                <span style={{ color: 'var(--text-secondary)' }}>Total Sessions</span>
                <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{earningsData.totalSessions}</span>
              </div>
              <div className="flex justify-between items-center">
                <span style={{ color: 'var(--text-secondary)' }}>Success Rate</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{earningsData.successRate}</span>
              </div>
              <div className="flex justify-between items-center">
                <span style={{ color: 'var(--text-secondary)' }}>Refund Rate</span>
                <span className="font-bold text-red-600 dark:text-red-400">{earningsData.refundRate}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-none rounded-full text-sm focus:ring-2 focus:ring-blue-500 transition-all"
                  style={{
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--input-text)',
                    borderColor: 'var(--input-border)'
                  }}
                />
              </div>
              <div className="flex gap-2">
                {['all', 'completed', 'pending', 'cancelled'].map(status => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${filterStatus === status
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {currentTransactions.length > 0 ? (
                currentTransactions.map(transaction => (
                  <div
                    key={transaction.id}
                    className="p-6 rounded-2xl shadow-sm border hover:shadow-md transition-all duration-200"
                    style={{
                      backgroundColor: 'var(--card-bg)',
                      borderColor: 'var(--card-border)'
                    }}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={transaction.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(transaction.student || 'Student')}&background=random`}
                          alt={transaction.student}
                          className="w-12 h-12 rounded-full border-2 object-cover"
                          style={{ borderColor: 'var(--border-color)' }}
                        />
                        <div>
                          <h4 className="font-bold" style={{ color: 'var(--text-primary)' }}>{transaction.student}</h4>
                          <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>{transaction.session}</p>
                          <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {transaction.date}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-3">
                        <div className="flex gap-2">
                          <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                          </span>
                          <button className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                            <Eye className="w-5 h-5" />
                          </button>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600 dark:text-green-400">
                            +${transaction.amount}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center rounded-2xl border border-dashed" style={{ borderColor: 'var(--card-border)', backgroundColor: 'var(--card-bg)' }}>
                  <DollarSign className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>No transactions found</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>Try adjusting your search or filters.</p>
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors disabled:opacity-50"
                  style={{
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-secondary)',
                    backgroundColor: 'var(--bg-primary)'
                  }}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Page {currentPage} of {totalPages}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors disabled:opacity-50"
                  style={{
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-secondary)',
                    backgroundColor: 'var(--bg-primary)'
                  }}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EarningsPage;