// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { ThemeProvider } from './context/ThemeContext'; 
import ProtectedRoute from './components/ProtectedRoute';
import AccessibilityToolbar from './components/AccessibilityToolbar';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ProfileSetup from './pages/ProfileSetup';
import RoleSelection from './pages/RoleSelection';
import DashboardLearner from './pages/DashboardLearner';
import DashboardTutor from './pages/DashboardTutor';
import Profile from './pages/Profile';

// Layouts
import LearnerLayout from './components/learner/LearnerLayout';
import TutorLayout from './components/tutor/TutorLayout';

// Sub-pages (Tutor)
import TutorSessionsPage from './components/tutor/SessionsPage';
import StudentsPage from './components/tutor/StudentsPage';
import MessagesPage from './components/tutor/MessagesPage';
import ReviewsPage from './components/tutor/ReviewsPage';
import EarningsPage from './components/tutor/EarningsPage';
import TutorSettingsPage from './components/tutor/SettingsPage';
import TutorCreateSessionPage from './components/tutor/CreateSessionPage';

// Sub-pages (Learner)
import LearnerSessionsPage from './components/learner/SessionsPage';
import ProfilePage from './components/learner/ProfilePage';
import LearnerSettingsPage from './components/learner/SettingsPage';
import CreateSessionPage from './components/learner/CreateSessionPage';

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
                <Route path="/signup" element={<SignUp />} />
                <Route path="/profile-setup" element={<ProfileSetup />} />
                <Route path="/role-selection" element={<RoleSelection />} />

                {/* Learner Routes */}
                <Route element={<ProtectedRoute allowedRoles={["learner"]} />}>
                  <Route path="/dashboard-learner" element={<LearnerLayout />}>
                    <Route index element={<DashboardLearner />} />
                    <Route path="sessions" element={<LearnerSessionsPage />} />
                    <Route path="create-session" element={<CreateSessionPage />} />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="settings" element={<LearnerSettingsPage />} />
                  </Route>
                </Route>

                {/* Tutor Routes */}
                <Route element={<ProtectedRoute allowedRoles={["tutor"]} />}>
                  <Route path="/dashboard-tutor" element={<TutorLayout />}>
                    <Route index element={<DashboardTutor />} />
                    <Route path="sessions" element={<TutorSessionsPage />} />
                    <Route path="create-session" element={<TutorCreateSessionPage />} />
                    <Route path="students" element={<StudentsPage />} />
                    <Route path="messages" element={<MessagesPage />} />
                    <Route path="reviews" element={<ReviewsPage />} />
                    <Route path="earnings" element={<EarningsPage />} />
                    <Route path="settings" element={<TutorSettingsPage />} />
                  </Route>
                </Route>

                <Route element={<ProtectedRoute allowedRoles={["learner", "tutor"]} />}>
                  <Route path="/profile" element={<Profile />} />
                </Route>

                {/* Redirects */}
                <Route path="/DashboardLearner" element={<Navigate to="/dashboard-learner" replace />} />
                <Route path="/DashboardTutor" element={<Navigate to="/dashboard-tutor" replace />} />
              </Routes>
            </div>
          </ThemeProvider>
        </AccessibilityProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;