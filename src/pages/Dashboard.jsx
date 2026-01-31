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
  X
} from 'lucide-react';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Sample data
  const upcomingSessions = [
    {
      id: 1,
      title: "Advanced React Patterns",
      tutor: "Sarah Johnson",
      time: "Today, 2:00 PM",
      subject: "Computer Science",
      participants: 8
    },
    {
      id: 2,
      title: "Calculus Study Group",
      tutor: "Michael Chen",
      time: "Tomorrow, 4:30 PM",
      subject: "Mathematics",
      participants: 12
    },
    {
      id: 3,
      title: "Essay Writing Workshop",
      tutor: "Emma Williams",
      time: "Friday, 1:00 PM",
      subject: "English Literature",
      participants: 6
    }
  ];

  const stats = [
    { label: "Sessions Attended", value: "24", icon: BookOpen, color: "blue" },
    { label: "Hours Learned", value: "48", icon: Clock, color: "green" },
    { label: "Study Partners", value: "15", icon: Users, color: "purple" },
    { label: "Achievements", value: "8", icon: Award, color: "orange" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      
      {/* SIDEBAR */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 lg:translate-x-0 lg:static ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Main navigation"
      >
        <div className="flex flex-col h-full">
          
          {/* Logo */}
          <div className="flex items-center justify-between px-6 py-6 border-b border-gray-200">
            <a href="/" className="flex items-center gap-2" aria-label="PeerLearn home">
              <Users className="w-8 h-8 text-blue-600" aria-hidden="true" />
              <span className="text-xl font-bold text-gray-900">PeerLearn</span>
            </a>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2" aria-label="Dashboard navigation">
            <a
              href="#browse"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Search className="w-5 h-5" aria-hidden="true" />
              <span className="font-medium">Browse Sessions</span>
            </a>
            
            <a
              href="#my-sessions"
              className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-600 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-current="page"
            >
              <Calendar className="w-5 h-5" aria-hidden="true" />
              <span>My Sessions</span>
            </a>

            <a
              href="#messages"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <MessageSquare className="w-5 h-5" aria-hidden="true" />
              <span className="font-medium">Messages</span>
              <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">3</span>
            </a>

            <a
              href="#resources"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <BookOpen className="w-5 h-5" aria-hidden="true" />
              <span className="font-medium">Resources</span>
            </a>

            <a
              href="#profile"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Users className="w-5 h-5" aria-hidden="true" />
              <span className="font-medium">My Profile</span>
            </a>

            <a
              href="#settings"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Settings className="w-5 h-5" aria-hidden="true" />
              <span className="font-medium">Settings</span>
            </a>
          </nav>

          {/* Logout */}
          <div className="px-4 py-6 border-t border-gray-200">
            <button
              className="flex items-center gap-3 px-4 py-3 w-full text-gray-700 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
              aria-label="Log out of your account"
            >
              <LogOut className="w-5 h-5" aria-hidden="true" />
              <span className="font-medium">Log Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* TOP HEADER */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome back, John!</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Notifications"
              >
                <Bell className="w-6 h-6 text-gray-700" aria-hidden="true" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" aria-hidden="true"></span>
              </button>

              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                JD
              </div>
            </div>
          </div>
        </header>

        {/* DASHBOARD CONTENT */}
        <div className="flex-1 p-6 overflow-auto">
          
          {/* STATS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              const colors = {
                blue: 'bg-blue-100 text-blue-600',
                green: 'bg-green-100 text-green-600',
                purple: 'bg-purple-100 text-purple-600',
                orange: 'bg-orange-100 text-orange-600'
              };
              
              return (
                <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-lg ${colors[stat.color]} flex items-center justify-center`}>
                      <Icon className="w-6 h-6" aria-hidden="true" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </div>
              );
            })}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            
            {/* UPCOMING SESSIONS */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Upcoming Sessions</h2>
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                    <Plus className="w-4 h-4" aria-hidden="true" />
                    <span className="text-sm font-medium">Join Session</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {upcomingSessions.map((session) => (
                    <article
                      key={session.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">{session.title}</h3>
                          <p className="text-sm text-gray-600">by {session.tutor}</p>
                        </div>
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                          {session.subject}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" aria-hidden="true" />
                            {session.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" aria-hidden="true" />
                            {session.participants} participants
                          </span>
                        </div>
                        
                        <button className="flex items-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <Video className="w-4 h-4" aria-hidden="true" />
                          Join
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>

            {/* QUICK ACTIONS & ACTIVITY */}
            <div className="space-y-6">
              
              {/* QUICK ACTIONS */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                    <Plus className="w-5 h-5" aria-hidden="true" />
                    <span className="font-medium">Create Session</span>
                  </button>
                  
                  <button className="w-full flex items-center gap-3 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
                    <Search className="w-5 h-5" aria-hidden="true" />
                    <span className="font-medium">Find Partners</span>
                  </button>
                  
                  <button className="w-full flex items-center gap-3 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
                    <BookOpen className="w-5 h-5" aria-hidden="true" />
                    <span className="font-medium">Browse Resources</span>
                  </button>
                </div>
              </div>

              {/* RECENT ACTIVITY */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-4 h-4 text-green-600" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Completed React session</p>
                      <p className="text-xs text-gray-600">2 hours ago</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Users className="w-4 h-4 text-blue-600" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">New study partner added</p>
                      <p className="text-xs text-gray-600">5 hours ago</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Award className="w-4 h-4 text-orange-600" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Earned "Helpful Peer" badge</p>
                      <p className="text-xs text-gray-600">Yesterday</p>
                    </div>
                  </div>
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