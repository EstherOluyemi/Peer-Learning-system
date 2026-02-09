import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Users, Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import peerlearnLogo from '../assets/peerlearn-logo.png';
import loginLogo from '../assets/login-logo.jpg';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/hooks';
import AccessibilityToolbar from '../components/AccessibilityToolbar';

const Login = () => {
  const { highContrast, textSize } = useAccessibility();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ email: '', password: '', rememberMe: false });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      // Simulate login
      setTimeout(() => {
        setIsLoading(false);
        // navigate('/dashboard');
      }, 1000);
    }
  };

  return (
    <>
      <div className={`min-h-screen w-screen flex transition-colors duration-300 ${highContrast ? 'high-contrast' : ''}`} style={{ fontSize: textSize === 'large' ? '18px' : '16px' }}>
        <AccessibilityToolbar />
        {/* Left: Image (fixed, always fills left half) */}
        <div className="hidden md:block md:w-1/2 fixed left-0 top-0 h-full min-h-screen z-0">
          <img
            src={loginLogo}
            alt="Login visual"
            className="object-cover w-full h-full min-h-screen"
            style={{ minHeight: '100vh' }}
          />
        </div>
        {/* Right: Form (scrollable, with left margin) */}
        <div className="flex-1 flex flex-col justify-center items-center bg-white/90 p-8 min-h-screen ml-0 md:ml-[50vw] z-10">
          {/* Back to Home link */}a
          <div className="w-full flex justify-start mb-4">
              <Link to="/" className="flex items-center text-blue-600 hover:bg-blue-100 hover:text-blue-500 font-medium gap-1 rounded-lg px-2 py-1 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Back to Home
            </Link>
          </div>
          <div className="flex flex-col items-center mb-8 w-full">
            <div className="flex items-center gap-3 mb-4">
              {peerlearnLogo ? (
                <img src={peerlearnLogo} alt= "PeerLearn Logo" className="h-16 w-auto" />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Users className="w-7 h-7 text-white" />
                </div>
              )}
              <span className="text-2xl font-bold text-slate-900">PeerLearn</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 text-center">Sign in to your account</h1>
            <p className="text-slate-600 text-center mt-2">Welcome back! Please enter your details.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-900 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-blue-500 focus:outline-none focus:ring-2"
                  placeholder="you@example.com"
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>
            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-900 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-10 py-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-blue-500 focus:outline-none focus:ring-2"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-slate-400" aria-hidden="true" />
                  ) : (
                    <Eye className="h-5 w-5 text-slate-400" aria-hidden="true" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p id="password-error" className="mt-1 text-sm text-red-600" role="alert">
                  {errors.password}
                </p>
              )}
            </div>
            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 focus:ring-2 focus:ring-offset-0"
                  disabled={isLoading}
                  aria-label="Remember me on this device"
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-slate-700">
                  Remember me
                </label>
              </div>
            </div>
            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3.5 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
              aria-label={isLoading ? "Signing in..." : "Sign in to your account"}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" aria-hidden="true"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" aria-hidden="true" />
                  <span>Sign in to your account</span>
                </>
              )}
            </button>
            {/* Sign Up Link */}
            <div className="text-center pt-4 border-t border-slate-100">
              <p className="text-sm text-slate-600">
                Don't have an account?{' '}
                <Link 
                  to="/signup" 
                  className="font-medium text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
                  aria-label="Create a new account"
                >
                  Create account
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
