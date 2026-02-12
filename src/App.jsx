// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
            <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
              <AccessibilityToolbar />
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/role-selection" element={<RoleSelection />} />
                <Route path="/signup" element={<SignUp />} />

                {/* Protected Routes with role-based access */}
                <Route element={<ProtectedRoute allowedRoles={["learner"]} />}>
                  <Route path="/dashboard-learner" element={<DashboardLearner />} />
                  <Route path="/DashboardLearner" element={<Navigate to="/dashboard-learner" replace />} />
                </Route>
                <Route element={<ProtectedRoute allowedRoles={["tutor"]} />}>
                  <Route path="/dashboard-tutor" element={<DashboardTutor />} />
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