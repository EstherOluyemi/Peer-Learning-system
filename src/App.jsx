import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import PlaceholderPage from './components/PlaceholderPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/sessions" element={<PlaceholderPage title="Sessions" description="Browse and join peer learning sessions. Coming soon." />} />
        <Route path="/sessions/:id" element={<PlaceholderPage title="Session Details" description="View session details. Coming soon." />} />
        <Route path="/create-session" element={<PlaceholderPage title="Create Session" description="Schedule a new learning session. Coming soon." />} />
        <Route path="/profile" element={<PlaceholderPage title="Profile" description="Update your profile and preferences. Coming soon." />} />
        <Route path="/settings" element={<PlaceholderPage title="Settings" description="Account settings. Coming soon." />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
