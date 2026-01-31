import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  TrendingUp,
  Star,
  Calendar,
  Users,
  Settings,
  LogOut,
  ChevronRight,
} from 'lucide-react';


const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/sessions', label: 'Sessions' },
  { to: '/create-session', label: 'Create Session' },
  { to: '/profile', label: 'Profile' },
];

const SUMMARY_CARDS = [
  { icon: BookOpen, label: 'Total Sessions', value: '0', color: 'text-blue-600', bg: 'bg-blue-50' },
  { icon: Clock, label: 'Upcoming', value: '0', color: 'text-green-600', bg: 'bg-green-50' },
  { icon: TrendingUp, label: 'Completed', value: '0', color: 'text-green-600', bg: 'bg-green-50' },
  { icon: Star, label: 'Average Rating', value: '0.0', color: 'text-amber-600', bg: 'bg-amber-50' },
];

const UPCOMING_SESSIONS = [
  {
    id: 1,
    title: 'Introduction to React Hooks',
    category: 'Computer Science',
    date: '12/20/2024 at 14:00',
    attendees: '8/15',
  },
  {
    id: 2,
    title: 'Calculus: Derivatives and Applications',
    category: 'Mathematics',
    date: '12/21/2024 at 16:30',
    attendees: '12/12',
  },
];

const Dashboard = () => {
  const location = useLocation();
  const userName = 'esther';

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <a href="#main" className="skip-link">
        Skip to main content
      </a>

      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
        <nav
          className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4"
          aria-label="Main navigation"
        >
          <Link
            to="/"
            className="flex items-center gap-2"
            aria-label="PeerLearn home"
          >
            <Users className="h-8 w-8 text-blue-600 shrink-0" aria-hidden="true" />
            <span className="text-xl font-semibold tracking-tight text-gray-900">
              PeerLearn
            </span>
          </Link>

          <div className="flex items-center gap-1" role="navigation" aria-label="Page navigation">
            {NAV_LINKS.map(({ to, label }) => {
              const isActive = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {label}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/settings"
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              aria-label="Settings"
            >
              <Settings className="h-5 w-5" aria-hidden="true" />
            </Link>
            <span className="flex items-center gap-2 text-sm text-gray-700" aria-hidden="true">
              <span className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                <Users className="h-4 w-4 text-gray-500" aria-hidden="true" />
              </span>
              <span className="font-medium">{userName}</span>
            </span>
            <Link
              to="/"
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              aria-label="Log out"
            >
              <LogOut className="h-5 w-5" aria-hidden="true" />
            </Link>
          </div>
        </nav>
      </header>

      <main id="main" className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {userName}!
          </h1>
          <p className="mt-1 text-gray-600">
            Ready to continue your learning journey? Here&apos;s what&apos;s happening today.
          </p>
        </div>

        {/* Summary Cards */}
        <section aria-labelledby="summary-heading" className="mb-10">
          <h2 id="summary-heading" className="sr-only">
            Your learning summary
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SUMMARY_CARDS.map(({ icon: Icon, label, value, color, bg }) => (
              <div
                key={label}
                className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div
                  className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${bg}`}
                  aria-hidden="true"
                >
                  <Icon className={`h-5 w-5 ${color}`} aria-hidden="true" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-sm text-gray-600">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Upcoming Sessions */}
          <section
            className="flex-1"
            aria-labelledby="upcoming-heading"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 id="upcoming-heading" className="text-lg font-semibold text-gray-900">
                Upcoming Sessions
              </h2>
              <Link
                to="/sessions"
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              >
                View All
              </Link>
            </div>

            <ul className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white shadow-sm">
              {UPCOMING_SESSIONS.map((session) => (
                <li key={session.id}>
                  <Link
                    to={`/sessions/${session.id}`}
                    className="block p-6 hover:bg-gray-50 focus-visible:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600"
                  >
                    <h3 className="font-semibold text-gray-900">{session.title}</h3>
                    <p className="mt-0.5 text-sm text-gray-600">{session.category}</p>
                    <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 shrink-0" aria-hidden="true" />
                        {session.date}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="h-4 w-4 shrink-0" aria-hidden="true" />
                        {session.attendees} attendees
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {/* Sidebar: Quick Actions & Recent Activity */}
          <aside className="w-full lg:w-80 shrink-0" aria-label="Quick actions and recent activity">
            <div className="space-y-6">
              <section aria-labelledby="quick-actions-heading">
                <h2 id="quick-actions-heading" className="mb-3 text-lg font-semibold text-gray-900">
                  Quick Actions
                </h2>
                <div className="space-y-3">
                  <Link
                    to="/sessions"
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                  >
                    <BookOpen className="h-5 w-5 shrink-0" aria-hidden="true" />
                    Browse Sessions
                  </Link>
                  <Link
                    to="/profile"
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 font-medium text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                  >
                    <Star className="h-5 w-5 shrink-0" aria-hidden="true" />
                    Update Profile
                  </Link>
                </div>
              </section>

              <section aria-labelledby="recent-activity-heading">
                <h2 id="recent-activity-heading" className="mb-3 text-lg font-semibold text-gray-900">
                  Recent Activity
                </h2>
                <ul className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <li>
                    <Link
                      to="/sessions"
                      className="flex items-center justify-between py-2 text-sm text-gray-700 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-inset rounded"
                    >
                      New session available
                      <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
                    </Link>
                  </li>
                </ul>
              </section>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
