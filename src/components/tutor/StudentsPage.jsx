// src/components/tutor/StudentsPage.jsx
import React, { useState } from 'react';
import {
  Users, Search, Filter, MessageSquare, Star, Calendar,
  ChevronLeft, ChevronRight, Eye, Plus, UserPlus
} from 'lucide-react';

const StudentsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const students = [
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah.j@example.com",
      level: "Beginner",
      sessions: 12,
      rating: 4.8,
      lastSession: "2 days ago",
      avatar: "https://ui-avatars.com/api/?name=Sarah+Johnson&background=random"
    },
    {
      id: 2,
      name: "Michael Chen",
      email: "michael.c@example.com",
      level: "Intermediate",
      sessions: 8,
      rating: 4.9,
      lastSession: "1 day ago",
      avatar: "https://ui-avatars.com/api/?name=Michael+Chen&background=random"
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      email: "emily.r@example.com",
      level: "Advanced",
      sessions: 15,
      rating: 4.7,
      lastSession: "3 days ago",
      avatar: "https://ui-avatars.com/api/?name=Emily+Rodriguez&background=random"
    },
    {
      id: 4,
      name: "David Kim",
      email: "david.k@example.com",
      level: "Beginner",
      sessions: 5,
      rating: 4.6,
      lastSession: "5 days ago",
      avatar: "https://ui-avatars.com/api/?name=David+Kim&background=random"
    },
    {
      id: 5,
      name: "Lisa Thompson",
      email: "lisa.t@example.com",
      level: "Intermediate",
      sessions: 10,
      rating: 4.8,
      lastSession: "Yesterday",
      avatar: "https://ui-avatars.com/api/?name=Lisa+Thompson&background=random"
    },
    {
      id: 6,
      name: "James Wilson",
      email: "james.w@example.com",
      level: "Beginner",
      sessions: 3,
      rating: 4.5,
      lastSession: "1 week ago",
      avatar: "https://ui-avatars.com/api/?name=James+Wilson&background=random"
    },
  ];

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === 'all' || student.level.toLowerCase() === filterLevel.toLowerCase();
    return matchesSearch && matchesLevel;
  });

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const currentStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getLevelColor = (level) => {
    switch (level) {
      case 'Beginner': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'Intermediate': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'Advanced': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>My Students</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Manage your students and track their progress.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-lg shadow-blue-500/30 transition-all active:scale-95">
            <UserPlus className="w-5 h-5" />
            Add Student
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl font-medium transition-all">
            <MessageSquare className="w-5 h-5" />
            Bulk Message
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                placeholder="Search students by name or email..."
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
              {['all', 'beginner', 'intermediate', 'advanced'].map(level => (
                <button
                  key={level}
                  onClick={() => setFilterLevel(level)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filterLevel === level
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {currentStudents.map(student => (
              <div
                key={student.id}
                className="p-6 rounded-2xl shadow-sm border hover:shadow-md transition-all duration-200"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--card-border)'
                }}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={student.avatar}
                      alt={student.name}
                      className="w-16 h-16 rounded-full border-2 object-cover"
                      style={{ borderColor: 'var(--border-color)' }}
                    />
                    <div>
                      <h4 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{student.name}</h4>
                      <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>{student.email}</p>
                      <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getLevelColor(student.level)}`}>
                          {student.level}
                        </span>
                        <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5" /> {student.rating}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {student.lastSession}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="flex gap-2">
                      <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                        <MessageSquare className="w-4 h-4" />
                        Message
                      </button>
                      <button className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{student.sessions} Sessions</div>
                      <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Total booked</div>
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

        <div className="space-y-6">
          <div className="rounded-2xl shadow-sm border p-6"
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--card-border)'
            }}
          >
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Student Overview</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg"
                style={{ backgroundColor: 'var(--bg-hover)' }}
              >
                <div>
                  <div className="font-medium" style={{ color: 'var(--text-primary)' }}>Total Students</div>
                  <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>All active students</div>
                </div>
                <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>24</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg text-center"
                  style={{ backgroundColor: 'var(--bg-hover)' }}
                >
                  <div className="text-lg font-bold text-green-600 dark:text-green-400">12</div>
                  <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Beginner</div>
                </div>
                <div className="p-3 rounded-lg text-center"
                  style={{ backgroundColor: 'var(--bg-hover)' }}
                >
                  <div className="text-lg font-bold text-blue-600 dark:text-blue-400">8</div>
                  <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Intermediate</div>
                </div>
                <div className="p-3 rounded-lg text-center"
                  style={{ backgroundColor: 'var(--bg-hover)' }}
                >
                  <div className="text-lg font-bold text-purple-600 dark:text-purple-400">4</div>
                  <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Advanced</div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl shadow-sm border p-6"
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--card-border)'
            }}
          >
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Recent Activity</h3>
            <div className="space-y-3">
              {students.slice(0, 4).map(student => (
                <div key={student.id} className="flex items-center justify-between p-3 rounded-lg"
                  style={{ backgroundColor: 'var(--bg-hover)' }}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={student.avatar}
                      alt={student.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{student.name}</div>
                      <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Booked session</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{student.lastSession}</div>
                    <div className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{student.sessions} sessions</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentsPage;