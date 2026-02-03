import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Calendar, 
  MessageSquare, 
  BookOpen, 
  Settings, 
  Bell,
  LogOut,
  Plus,
  Clock,
  TrendingUp,
  Award,
  Video,
  Menu,
  X,
  ChevronRight,
  MoreVertical,
  Filter,
  Download
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  // Sample data
  const upcomingSessions = [
    {
      id: 1,
      title: "Advanced React Patterns",
      tutor: "Sarah Johnson",
      time: "Today, 2:00 PM",
      subject: "Computer Science",
      participants: 8,
      status: "upcoming"
    },
    {
      id: 2,
      title: "Calculus Study Group",
      tutor: "Michael Chen",
      time: "Tomorrow, 4:30 PM",
      subject: "Mathematics",
      participants: 12,
      status: "upcoming"
    },
    {
      id: 3,
      title: "Essay Writing Workshop",
      tutor: "Emma Williams",
      time: "Friday, 1:00 PM",
      subject: "English Literature",
      participants: 6,
      status: "upcoming"
    }
  ];

  const stats = [
    { label: "Sessions Attended", value: "24", change: "+12%", icon: BookOpen, color: "bg-blue-500" },
    { label: "Hours Learned", value: "48", change: "+8%", icon: Clock, color: "bg-green-500" },
    { label: "Study Partners", value: "15", change: "+3", icon: Users, color: "bg-purple-500" },
    { label: "Achievements", value: "8", change: "+2", icon: Award, color: "bg-orange-500" }
  ];

  const recentActivity = [
    {
      id: 1,
      title: "Completed React study session",
      description: "Advanced React patterns",
      time: "2 hours ago",
      icon: TrendingUp,
      iconColor: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      id: 2,
      title: "New study partner added",
      description: "Connected with Michael",
      time: "5 hours ago",
      icon: Users,
      iconColor: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      id: 3,
      title: "Earned 'Helpful peer' badge",
      description: "Hosted 3 sessions this week",
      time: "Yesterday",
      icon: Award,
      iconColor: "text-amber-600",
      bgColor: "bg-amber-50"
    }
  ];

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0]?.toUpperCase())
        .join('')
    : 'PL';

  return (
    <div className="min-h-screen bg-gray-50 flex">
      
      {/* SIDEBAR */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Main navigation"
      >
        <div className="flex flex-col h-full">
          
          {/* Logo */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-900">
                PeerLearn
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-md hover:bg-gray-100 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            <a
              href="#browse"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors text-sm font-medium"
            >
              <Search className="w-4 h-4" />
              <span>Browse sessions</span>
            </a>
            
            <a
              href="#my-sessions"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-blue-50 text-blue-600 font-medium"
              aria-current="page"
            >
              <Calendar className="w-4 h-4" />
              <span>My sessions</span>
              <span className="ml-auto bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                3
              </span>
            </a>

            <a
              href="#messages"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors text-sm font-medium"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Messages</span>
              <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                3
              </span>
            </a>

            <a
              href="#resources"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors text-sm font-medium"
            >
              <BookOpen className="w-4 h-4" />
              <span>Resources</span>
            </a>

            <a
              href="#profile"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors text-sm font-medium"
            >
              <Users className="w-4 h-4" />
              <span>My profile</span>
            </a>

            <a
              href="#settings"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors text-sm font-medium"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </a>
          </nav>

          {/* User Profile & Logout */}
          <div className="border-t border-gray-200 px-4 py-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-sm font-medium text-white">
                {initials}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{user?.fullName || 'User'}</p>
                <p className="text-xs text-gray-500">Student</p>
              </div>
              <button className="p-1.5 rounded-md hover:bg-gray-100">
                <MoreVertical className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <button
              className="flex items-center gap-3 px-3 py-2.5 w-full text-sm text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              aria-label="Log out"
            >
              <LogOut className="w-4 h-4" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* TOP HEADER */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Dashboard
                </h1>
                <p className="text-sm text-gray-600">
                  Welcome back, {user?.fullName?.split(' ')[0] || 'there'}! Here's your learning overview.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                className="relative p-2.5 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
                <Plus className="w-4 h-4" />
                <span>Create Session</span>
              </button>
            </div>
          </div>
        </header>

        {/* DASHBOARD CONTENT */}
        <div className="flex-1 p-6">
          
          {/* WELCOME BANNER */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-2">Continue your learning journey</h2>
                <p className="text-blue-100">You have 3 upcoming sessions this week. Keep up the great work!</p>
              </div>
              <button className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors">
                View Schedule
              </button>
            </div>
          </div>

          {/* STATS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${stat.color} w-10 h-10 rounded-lg flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mb-1">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-600">
                    {stat.label}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            
            {/* UPCOMING SESSIONS */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        Upcoming Sessions
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">
                        Join or review your scheduled sessions
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <Filter className="w-4 h-4" />
                        Filter
                      </button>
                      <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <Download className="w-4 h-4" />
                        Export
                      </button>
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-gray-200">
                  {upcomingSessions.map((session) => (
                    <div
                      key={session.id}
                      className="px-6 py-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {session.subject}
                            </span>
                            <span className="text-xs text-gray-500">
                              Hosted by {session.tutor}
                            </span>
                          </div>
                          <h3 className="font-medium text-gray-900 mb-1">
                            {session.title}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-4 h-4" />
                              {session.time}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Users className="w-4 h-4" />
                              {session.participants} participants
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
                            <Video className="w-4 h-4" />
                            Join
                          </button>
                          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <MoreVertical className="w-5 h-5 text-gray-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="px-6 py-4 border-t border-gray-200">
                  <button className="w-full py-3 text-center text-sm text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors">
                    View all sessions
                    <ChevronRight className="w-4 h-4 inline-block ml-1" />
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT SIDEBAR */}
            <div className="space-y-6">
              
              {/* QUICK ACTIONS */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Quick Actions
                </h2>
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Plus className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900">Create session</p>
                        <p className="text-xs text-gray-500">Start a new study group</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                  
                  <button className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Search className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900">Find partners</p>
                        <p className="text-xs text-gray-500">Connect with peers</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                  
                  <button className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900">Browse resources</p>
                        <p className="text-xs text-gray-500">Study materials & guides</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* RECENT ACTIVITY */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Recent Activity
                  </h2>
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    See all
                  </button>
                </div>
                
                <div className="space-y-4">
                  {recentActivity.map((activity) => {
                    const Icon = activity.icon;
                    return (
                      <div key={activity.id} className="flex gap-3">
                        <div className={`${activity.bgColor} w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <Icon className={`w-5 h-5 ${activity.iconColor}`} />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">
                            {activity.title}
                          </p>
                          <p className="text-xs text-gray-600 mt-0.5">
                            {activity.description}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;