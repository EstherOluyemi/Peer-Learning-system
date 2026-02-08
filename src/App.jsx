import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import ProtectedRoute from './components/ProtectedRoute';
import AccessibilityToolbar from './components/AccessibilityToolbar';

// Import your pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
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
          <div className="min-h-screen bg-gray-50">
            <AccessibilityToolbar />
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              
              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                {/* <Route path="/create-session" element={<CreateSession />} />
                <Route path="/sessions" element={<BrowseSessions />} />
                <Route path="/session/:id" element={<SessionDetail />} /> */}
              </Route>
              
              {/* <Route path="*" element={<NotFound />} /> */}
            </Routes>
          </div>
        </AccessibilityProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;