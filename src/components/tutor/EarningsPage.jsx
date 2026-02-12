// src/components/tutor/EarningsPage.jsx
import React, { useState } from 'react';
import {
  DollarSign, TrendingUp, Calendar, Filter, Search,
  ChevronLeft, ChevronRight, Eye, Download, CreditCard,
  BarChart3, PieChart, Users, Clock
} from 'lucide-react';

const EarningsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('month');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const earningsData = {
    total: 2840,
    thisMonth: 450,
    thisWeek: 120,
    pending: 85,
    averageSession: 65
  };

  const transactions = [
    {
      id: 1,
      student: "Sarah Johnson",
      session: "React Fundamentals Workshop",
      amount: 50,
      date: "Dec 20, 2024",
      status: "completed",
      avatar: "https://ui-avatars.com/api/?name=Sarah+Johnson&background=random"
    },
    {
      id: 2,
      student: "Michael Chen",
      session: "Advanced JavaScript 1-on-1",
      amount: 75,
      date: "Dec 18, 2024",
      status: "completed",
      avatar: "https://ui-avatars.com/api/?name=Michael+Chen&background=random"
    },
    {
      id: 3,
      student: "Emily Rodriguez",
      session: "UI/UX Design Workshop",
      amount: 100,
      date: "Dec 15, 2024",
      status: "completed",
      avatar: "https://ui-avatars.com/api/?name=Emily+Rodriguez&background=random"
    },
    {
      id: 4,
      student: "David Kim",
      session: "Python for Beginners",
      amount: 40,
      date: "Dec 12, 2024",
      status: "completed",
      avatar: "https://ui-avatars.com/api/?name=David+Kim&background=random"
    },
    {
      id: 5,
      student: "Lisa Thompson",
      session: "Data Structures & Algorithms",
      amount: 80,
      date: "Dec 10, 2024",
      status: "pending",
      avatar: "https://ui-avatars.com/api/?name=Lisa+Thompson&background=random"
    },
    {
      id: 6,
      student: "James Wilson",
      session: "React Fundamentals Workshop",
      amount: 50,
      date: "Dec 8, 2024",
      status: "completed",
      avatar: "https://ui-avatars.com/api/?name=James+Wilson&background=random"
    },
    {
      id: 7,
      student: "Anna Brown",
      session: "Web Development Basics",
      amount: 60,
      date: "Dec 5, 2024",
      status: "completed",
      avatar: "https://ui-avatars.com/api/?name=Anna+Brown&background=random"
    },
    {
      id: 8,
      student: "Robert Davis",
      session: "Mobile App Development",
      amount: 90,
      date: "Dec 3, 2024",
      status: "completed",
      avatar: "https://ui-avatars.com/api/?name=Robert+Davis&background=random"
    },
  ];

  const filteredTransactions = transactions.filter(transaction =>
    transaction.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.session.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const getChartData = () => {
    // Mock chart data - in a real app, this would come from your backend
    return {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      data: [120, 150, 90, 90]
    };
  };

  const handleExport = () => {
    console.log('Exporting earnings data...');
    // In a real app, this would trigger a download of earnings data
  };

  return (
    <div className="space-y-6">
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
                <span className="font-bold" style={{ color: 'var(--text-primary)' }}>44</span>
              </div>
              <div className="flex justify-between items-center">
                <span style={{ color: 'var(--text-secondary)' }}>Success Rate</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">95%</span>
              </div>
              <div className="flex justify-between items-center">
                <span style={{ color: 'var(--text-secondary)' }}>Refund Rate</span>
                <span className="font-bold text-red-600 dark:text-red-400">2%</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl shadow-sm border"
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--card-border)'
            }}
          >
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Payment Methods</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg"
                style={{ backgroundColor: 'var(--bg-hover)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium" style={{ color: 'var(--text-primary)' }}>Credit Card</div>
                    <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>85% of payments</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>$2,414</div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg"
                style={{ backgroundColor: 'var(--bg-hover)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Users className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium" style={{ color: 'var(--text-primary)' }}>PayPal</div>
                    <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>15% of payments</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>$426</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl shadow-sm border"
              style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--card-border)'
              }}
            >
              <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Earnings Overview</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">+12%</div>
                    <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>This Month</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">+8%</div>
                    <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>This Week</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-purple-600 dark:text-purple-400">+15%</div>
                    <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>This Year</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {['week', 'month', 'year'].map(period => (
                    <button
                      key={period}
                      onClick={() => setFilterPeriod(period)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filterPeriod === period
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                    >
                      {period.charAt(0).toUpperCase() + period.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl shadow-sm border"
              style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--card-border)'
              }}
            >
              <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Top Sessions</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg"
                  style={{ backgroundColor: 'var(--bg-hover)' }}
                >
                  <div>
                    <div className="font-medium" style={{ color: 'var(--text-primary)' }}>React Fundamentals</div>
                    <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>12 sessions</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-green-600 dark:text-green-400">$600</div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg"
                  style={{ backgroundColor: 'var(--bg-hover)' }}
                >
                  <div>
                    <div className="font-medium" style={{ color: 'var(--text-primary)' }}>UI/UX Design</div>
                    <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>8 sessions</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-blue-600 dark:text-blue-400">$800</div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg"
                  style={{ backgroundColor: 'var(--bg-hover)' }}
                >
                  <div>
                    <div className="font-medium" style={{ color: 'var(--text-primary)' }}>JavaScript Advanced</div>
                    <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>6 sessions</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-purple-600 dark:text-purple-400">$450</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

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
                    className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${status === 'all'
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
              {currentTransactions.map(transaction => (
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
                        src={transaction.avatar}
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
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors"
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
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors"
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