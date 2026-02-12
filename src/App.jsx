// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LearnerLayout from './components/learner/LearnerLayout';
import SessionsPage from './components/learner/SessionsPage';
import CreateSessionPage from './components/learner/CreateSessionPage';
import ProfilePage from './components/learner/ProfilePage';
import SettingsPage from './components/learner/SettingsPage';
import { AuthProvider } from './context/AuthContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import AccessibilityToolbar from './components/AccessibilityToolbar';

// Import your pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import RoleSelection from './pages/RoleSelection';
import DashboardLearner from './pages/DashboardLearner';
import DashboardTutor from './pages/DashboardTutor';
import TutorLayout from './components/tutor/TutorLayout';
import SessionsPage from './components/tutor/SessionsPage';
import StudentsPage from './components/tutor/StudentsPage';
import MessagesPage from './components/tutor/MessagesPage';
import ReviewsPage from './components/tutor/ReviewsPage';
import EarningsPage from './components/tutor/EarningsPage';
import SettingsPage from './components/tutor/SettingsPage';
import Profile from './pages/Profile';
/* import CreateSession from './pages/CreateSession';
import BrowseSessions from './pages/BrowseSessions';
import SessionDetail from './pages/SessionDetail';
import NotFound from './pages/NotFound';
 */
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <AccessibilityProvider>
          <ThemeProvider>
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
              <AccessibilityToolbar />
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/role-selection" element={<RoleSelection />} />
                <Route path="/signup" element={<SignUp />} />

                {/* Protected Routes with role-based access */}
                <Route element={<ProtectedRoute allowedRoles={["learner"]} />}>
                  <Route path="/dashboard-learner" element={<LearnerLayout />}>
                    <Route index element={<DashboardLearner />} />
                    <Route path="sessions" element={<SessionsPage />} />
                    <Route path="create-session" element={<CreateSessionPage />} />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="settings" element={<SettingsPage />} />
                  </Route>
                  <Route path="/DashboardLearner" element={<Navigate to="/dashboard-learner" replace />} />
                </Route>
                <Route element={<ProtectedRoute allowedRoles={["tutor"]} />}>
                  <Route path="/dashboard-tutor" element={<TutorLayout />}>
                    <Route index element={<DashboardTutor />} />
                    <Route path="sessions" element={<SessionsPage />} />
                    <Route path="students" element={<StudentsPage />} />
                    <Route path="messages" element={<MessagesPage />} />
                    <Route path="reviews" element={<ReviewsPage />} />
                    <Route path="earnings" element={<EarningsPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                  </Route>
                  <Route path="/DashboardTutor" element={<Navigate to="/dashboard-tutor" replace />} />
                </Route>
                <Route element={<ProtectedRoute allowedRoles={["learner", "tutor"]} />}>
                  <Route path="/profile" element={<Profile />} />
                </Route>

                {/* <Route path="*" element={<NotFound />} /> */}
              </Routes>
            </div>
          </ThemeProvider>
        </AccessibilityProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;