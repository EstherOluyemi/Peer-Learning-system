// src/pages/Dashboard.jsx - UPDATED WITH BLUE THEME
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/hooks';
import AccessibilityToolbar from '../components/AccessibilityToolbar';
import { 
  Users, Calendar, Video, MessageSquare, BookOpen, 
  Settings, Bell, Search, TrendingUp, Award, Clock,
  ChevronRight, Filter, Plus, MoreVertical, Play,
  BarChart3, Target, Zap, Sparkles, GraduationCap,
  Star, FileText, HelpCircle, Download, Upload,
  CheckCircle, XCircle, Clock3, UserPlus, Eye,
  UsersRound, TargetIcon, LineChart
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Sample data - Updated with blue theme
const sampleTutorSessions = [
  { id: 1, title: "Advanced React Masterclass", subject: "Computer Science", date: "Today, 3:00 PM", participants: 15, status: "upcoming", color: "bg-blue-500" },
  { id: 2, title: "Calculus Fundamentals", subject: "Mathematics", date: "Tomorrow, 10:00 AM", participants: 8, status: "upcoming", color: "bg-purple-500" },
  { id: 3, title: "Web Development Basics", subject: "Programming", date: "Completed", participants: 12, status: "completed", color: "bg-slate-500" },
];

const sampleLearnerSessions = [
  { id: 1, title: "Data Science with Python", tutor: "Dr. Sarah Chen", date: "Today, 2:00 PM", progress: "80%", status: "ongoing", color: "bg-blue-500" },
  { id: 2, title: "French Conversation Practice", tutor: "Marie Laurent", date: "Tomorrow, 4:30 PM", progress: "Not started", status: "upcoming", color: "bg-indigo-500" },
  { id: 3, title: "Machine Learning Basics", tutor: "Prof. Alex Kim", date: "Completed", progress: "100%", status: "completed", color: "bg-slate-500" },
];

const sampleStats = {
  tutor: [
    { label: "Total Sessions", value: "24", change: "+12%", icon: Calendar, color: "bg-gradient-to-br from-blue-500 to-blue-600", textColor: "text-blue-600" },
    { label: "Active Students", value: "48", change: "+8", icon: Users, color: "bg-gradient-to-br from-blue-400 to-blue-500", textColor: "text-blue-500" },
    { label: "Average Rating", value: "4.8", change: "+0.2", icon: Star, color: "bg-gradient-to-br from-blue-300 to-blue-400", textColor: "text-blue-400" },
    { label: "Hours Taught", value: "156", change: "+32", icon: Clock, color: "bg-gradient-to-br from-indigo-500 to-indigo-600", textColor: "text-indigo-600" },
  ],
  learner: [
    { label: "Sessions Attended", value: "18", change: "+6", icon: BookOpen, color: "bg-gradient-to-br from-blue-500 to-blue-600", textColor: "text-blue-600" },
    { label: "Learning Hours", value: "96", change: "+24", icon: Clock, color: "bg-gradient-to-br from-blue-400 to-blue-500", textColor: "text-blue-500" },
    { label: "Study Partners", value: "12", change: "+3", icon: Users, color: "bg-gradient-to-br from-blue-300 to-blue-400", textColor: "text-blue-400" },
    { label: "Achievements", value: "7", change: "+2", icon: Award, color: "bg-gradient-to-br from-indigo-500 to-indigo-600", textColor: "text-indigo-600" },
  ]
};

const Dashboard = () => {
  const { user, isTutor, isLearner } = useAuth();
  const { highContrast, textSize } = useAccessibility();

  // Dashboard Header Component
  const DashboardHeader = () => (
    <>
      <AccessibilityToolbar />
      <header className={`sticky top-0 z-30 bg-white/80 backdrop-blur-sm border-b border-slate-200 transition-colors duration-300 ${highContrast ? 'high-contrast' : ''}`} style={{ fontSize: textSize === 'large' ? '18px' : '16px' }}>
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              {isTutor ? <GraduationCap className="w-6 h-6 text-white" /> : <BookOpen className="w-6 h-6 text-white" />}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {isTutor ? "Tutor Dashboard" : "Learning Dashboard"}
              </h1>
              <p className="text-slate-600">
                Welcome back, {user?.fullName || 'there'}! {isTutor ? 'Ready to teach?' : 'Ready to learn?'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search..."
                className="pl-12 pr-4 py-2.5 bg-slate-100 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
              />
            </div>
            
            <button className="relative p-2.5 hover:bg-slate-100 rounded-xl transition">
              <Bell className="w-6 h-6 text-slate-600" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            <Link 
              to="/profile" 
              className="flex items-center space-x-3 hover:bg-slate-50 p-2 rounded-xl transition"
            >
              <div className="text-right">
                <p className="font-medium text-slate-900">{user?.fullName || 'User'}</p>
                <p className="text-sm text-slate-500">{isTutor ? 'Tutor' : 'Learner'}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
            </Link>
          </div>
        </div>
      </div>
    </header>
    </>
  );

  // Tutor Dashboard Content - BLUE THEME
  const TutorDashboard = () => (
    <main className="container mx-auto px-6 py-8">
      {/* Welcome Card - BLUE GRADIENT */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 rounded-2xl p-8 text-white mb-8 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <GraduationCap className="w-8 h-8" />
              <h2 className="text-2xl font-bold">Teaching Analytics</h2>
            </div>
            <p className="text-blue-100 mb-6 max-w-2xl">
              You have 3 upcoming sessions this week. Share your knowledge and help others learn!
            </p>
            <Link 
              to="/sessions?create=true" 
              className="inline-flex items-center space-x-2 bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition shadow-md hover:shadow-lg"
            >
              <Plus className="w-5 h-5" />
              <span>Create New Session</span>
            </Link>
          </div>
          <div className="hidden lg:block">
            <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm border border-white/20">
              <LineChart className="w-12 h-12" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid - BLUE VARIATIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {sampleStats.tutor.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} w-12 h-12 rounded-xl flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                  {stat.change}
                </span>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</div>
              <div className="text-slate-600">{stat.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Sessions Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Your Sessions</h3>
                <p className="text-slate-600">Manage your teaching schedule</p>
              </div>
              <div className="flex items-center space-x-3">
                <button className="flex items-center space-x-2 px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition">
                  <Filter className="w-4 h-4 text-slate-600" />
                  <span className="text-slate-700">Filter</span>
                </button>
                <Link 
                  to="/sessions?create=true"
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition shadow-sm hover:shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Session</span>
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              {sampleTutorSessions.map((session) => (
                <div key={session.id} className="border border-slate-200 rounded-xl p-5 hover:border-blue-200 hover:shadow-sm transition-all bg-white">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`px-3 py-1 ${session.color} text-white rounded-full text-sm font-medium`}>
                          {session.subject}
                        </span>
                        <span className={`text-sm font-medium ${session.status === 'completed' ? 'text-slate-500' : 'text-blue-600'}`}>
                          {session.status === 'completed' ? '✓ Completed' : '● Upcoming'}
                        </span>
                      </div>
                      <h4 className="text-lg font-semibold text-slate-900 mb-2">{session.title}</h4>
                      <div className="flex items-center space-x-6 text-slate-600 text-sm">
                        <span className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>{session.date}</span>
                        </span>
                        <span className="flex items-center space-x-2">
                          <Users className="w-4 h-4" />
                          <span>{session.participants} participants</span>
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {session.status === 'upcoming' && (
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center space-x-2">
                          <Video className="w-4 h-4" />
                          <span>Start</span>
                        </button>
                      )}
                      <button className="p-2 hover:bg-slate-100 rounded-lg transition">
                        <MoreVertical className="w-5 h-5 text-slate-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Quick Actions</h3>
            <div className="space-y-3">
              <Link 
                to="/sessions?create=true"
                className="flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all group border border-blue-100"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Plus className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Create Session</p>
                    <p className="text-sm text-slate-600">Schedule new learning session</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-blue-400 group-hover:text-blue-600 transition" />
              </Link>
              
              <button className="w-full flex items-center justify-between p-4 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all group border border-indigo-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <UsersRound className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">View Students</p>
                    <p className="text-sm text-slate-600">Manage your students</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-indigo-400 group-hover:text-indigo-600 transition" />
              </button>
              
              <Link 
                to="/profile"
                className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all group border border-slate-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                    <Settings className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Profile Settings</p>
                    <p className="text-sm text-slate-600">Update your information</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition" />
              </Link>
            </div>
          </div>

          {/* Upcoming Sessions */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Upcoming Sessions</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">React Workshop</p>
                    <p className="text-xs text-slate-600">Today, 3:00 PM</p>
                  </div>
                </div>
                <button className="text-blue-600 hover:text-blue-700">
                  <Play className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Math Tutoring</p>
                    <p className="text-xs text-slate-600">Tomorrow, 10:00 AM</p>
                  </div>
                </div>
                <button className="text-indigo-600 hover:text-indigo-700">
                  <Clock3 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );

  // Learner Dashboard Content - BLUE THEME
  const LearnerDashboard = () => (
    <main className="container mx-auto px-6 py-8">
      {/* Welcome Card - BLUE GRADIENT */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 rounded-2xl p-8 text-white mb-8 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <BookOpen className="w-8 h-8" />
              <h2 className="text-2xl font-bold">Learning Progress</h2>
            </div>
            <p className="text-blue-100 mb-6 max-w-2xl">
              You're making great progress! Complete today's session to maintain your learning streak.
            </p>
            <button className="inline-flex items-center space-x-2 bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition shadow-md hover:shadow-lg">
              <Play className="w-5 h-5" />
              <span>Continue Learning</span>
            </button>
          </div>
          <div className="hidden lg:block">
            <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm border border-white/20">
              <TrendingUp className="w-12 h-12" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid - BLUE VARIATIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {sampleStats.learner.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} w-12 h-12 rounded-xl flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                  {stat.change}
                </span>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</div>
              <div className="text-slate-600">{stat.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Enrolled Sessions */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Your Learning Path</h3>
                <p className="text-slate-600">Continue your enrolled sessions</p>
              </div>
              <Link 
                to="/sessions"
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition shadow-sm hover:shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Find Sessions</span>
              </Link>
            </div>

            <div className="space-y-4">
              {sampleLearnerSessions.map((session) => (
                <div key={session.id} className="border border-slate-200 rounded-xl p-5 hover:border-blue-200 hover:shadow-sm transition-all bg-white">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className={`${session.color} w-16 h-2 rounded-full overflow-hidden`}>
                          <div 
                            className={`h-full ${session.progress === '100%' ? 'bg-green-500' : 'bg-blue-500'}`}
                            style={{ width: session.progress === 'Not started' ? '0%' : session.progress }}
                          ></div>
                        </div>
                        <span className={`text-sm font-medium ${session.status === 'completed' ? 'text-slate-500' : session.status === 'ongoing' ? 'text-blue-600' : 'text-indigo-600'}`}>
                          {session.status === 'completed' ? '✓ Completed' : session.status === 'ongoing' ? '● In Progress' : '⏰ Upcoming'}
                        </span>
                      </div>
                      <h4 className="text-lg font-semibold text-slate-900 mb-2">{session.title}</h4>
                      <div className="flex items-center space-x-6 text-slate-600 text-sm">
                        <span className="flex items-center space-x-2">
                          <Users className="w-4 h-4" />
                          <span>Tutor: {session.tutor}</span>
                        </span>
                        <span className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>{session.date}</span>
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {session.status === 'ongoing' && (
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center space-x-2">
                          <Play className="w-4 h-4" />
                          <span>Continue</span>
                        </button>
                      )}
                      {session.status === 'upcoming' && (
                        <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>Schedule</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recommended Sessions */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Recommended For You</h3>
            <div className="space-y-4">
              <div className="p-4 border border-slate-100 rounded-xl hover:border-blue-200 hover:bg-blue-50/30 transition-all">
                <h4 className="font-semibold text-slate-900 mb-2">Python Data Analysis</h4>
                <p className="text-sm text-slate-600 mb-3">Learn data analysis with Pandas & NumPy</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-600 font-medium">92% match</span>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
                    View <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
              
              <div className="p-4 border border-slate-100 rounded-xl hover:border-indigo-200 hover:bg-indigo-50/30 transition-all">
                <h4 className="font-semibold text-slate-900 mb-2">Web Accessibility</h4>
                <p className="text-sm text-slate-600 mb-3">Build accessible web applications</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-indigo-600 font-medium">88% match</span>
                  <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center">
                    View <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-sm border border-blue-100 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-700">Weekly Goal</span>
                <span className="font-semibold text-blue-600">85%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-700">Learning Streak</span>
                <span className="font-semibold text-blue-600">7 days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-700">Active Peers</span>
                <span className="font-semibold text-blue-600">8 online</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <DashboardHeader />
      {isTutor ? <TutorDashboard /> : <LearnerDashboard />}
      
      {/* Footer */}
      <footer className="border-t border-slate-200 mt-12 py-8 bg-white/50">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between text-sm text-slate-600">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                {isTutor ? <GraduationCap className="w-4 h-4 text-white" /> : <BookOpen className="w-4 h-4 text-white" />}
              </div>
              <span>PeerLearn Dashboard • {isTutor ? 'Tutor View' : 'Learner View'}</span>
            </div>
            <div className="flex items-center space-x-6">
              <Link to="/help" className="hover:text-blue-600 transition">Help Center</Link>
              <Link to="/privacy" className="hover:text-blue-600 transition">Privacy</Link>
              <Link to="/terms" className="hover:text-blue-600 transition">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;