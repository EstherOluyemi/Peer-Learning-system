// src/pages/Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, Mail, Lock, Eye, EyeOff, LogIn, ArrowLeft, AlertCircle } from 'lucide-react';
import peerlearnLogo from '../assets/peerlearn-logo.png';
import loginLogo from '../assets/login-logo.webp';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/hooks';
import AccessibilityToolbar from '../components/AccessibilityToolbar';

const Login = () => {
  const { highContrast, textSize } = useAccessibility();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: '', password: '', rememberMe: false });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear errors when user types
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (generalError) setGeneralError('');
  };

  // Validation Logic
  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    if (validateForm()) {
      setIsLoading(true);
      setGeneralError('');

      try {
        const user = await login({
          email: formData.email,
          password: formData.password
        });

        console.log('Login successful! User data:', user);
        console.log('User role:', user.role);

        if (user.role === 'tutor') {
          console.log('Redirecting to tutor dashboard...');
          navigate('/dashboard-tutor');
        } else {
          console.log('Redirecting to learner dashboard...');
          navigate('/dashboard-learner');
        }
      } catch (error) {
        console.error('Login error:', error);
        setGeneralError(error.message || 'Invalid email or password. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Dynamic Styles based on Accessibility Context
  const baseFontSize = textSize === 'large' ? 'text-lg' : 'text-base';
  const containerClass = highContrast ? 'bg-white text-black contrast-more' : 'bg-slate-50';

  return (
    <div className={`min-h-screen w-full flex flex-col ${containerClass} transition-colors duration-300 login-page`}>
      <AccessibilityToolbar />
      
      {/* Skip Link */}
      <a 
        href="#login-form" 
        className="sr-only focus-not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
      >
        Skip to login form
      </a>
      
      <style jsx>{`
        /* Accessibility utilities */
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }
        
        .focus-not-sr-only:focus {
          position: static;
          width: auto;
          height: auto;
          padding: inherit;
          margin: inherit;
          overflow: visible;
          clip: auto;
          white-space: normal;
        }
      `}</style>

      <div className="flex-1 flex flex-col lg:flex-row relative">

        {/* LEFT SIDE: Image (Hidden on Mobile/Tablet, Visible on Large Screens) */}
        <div className="hidden lg:block lg:w-1/2" aria-hidden="true">
          <div className="fixed top-0 left-0 w-1/2 h-full bg-slate-900 z-0">
            <img
              src={loginLogo}
              alt="Students learning together"
              className="w-full h-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/30 to-transparent flex flex-col justify-end p-12 text-white">
              <h2 className="text-4xl font-bold mb-4">Join our learning community</h2>
              <p className="text-lg text-slate-200 max-w-md">Connect with peers, master new skills, and achieve your educational goals together.</p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Form Container */}
        <div className="flex-1 w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 lg:px-16 bg-white z-10 min-h-screen">

          <div className="w-full max-w-md space-y-8">

            {/* Header Section */}
            <header>
              <Link
                to="/"
                className="inline-flex items-center text-slate-500 hover:text-blue-600 font-medium transition-colors mb-8 group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 rounded"
              >
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" aria-hidden="true" />
                Back to Home
              </Link>

              <div className="flex items-center gap-3 mb-6">
                <img src={peerlearnLogo} alt="PeerLearn" className="w-10 h-10 object-contain" />
                <span className="text-2xl font-bold text-slate-900 tracking-tight">PeerLearn</span>
              </div>

              <h1 className={`font-bold text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 rounded ${textSize === 'large' ? 'text-4xl' : 'text-3xl'}`} tabIndex={-1}>
                Welcome back
              </h1>
              <p className={`mt-2 text-slate-600 ${baseFontSize}`}>
                Please enter your details to sign in.
              </p>
            </header>

            {/* General Error Banner - WITH ARIA LIVE */}
            {generalError && (
              <div 
                className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md flex items-start animate-fade-in"
                role="alert"
                aria-live="assertive"
                aria-atomic="true"
              >
                <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5" aria-hidden="true" />
                <p className="text-sm text-red-700">{generalError}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6" id="login-form" noValidate>

              {/* Email Input */}
              <div>
                <label htmlFor="email" className={`block font-medium text-slate-900 mb-2 ${baseFontSize}`}>
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" aria-hidden="true">
                    <Mail className={`h-5 w-5 ${errors.email ? 'text-red-400' : 'text-slate-400 group-focus-within:text-blue-500'} transition-colors`} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-3 rounded-xl border ${errors.email
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                      : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
                      } focus:outline-none focus:ring-4 transition-all duration-200 sm:text-sm`}
                    placeholder="you@example.com"
                    disabled={isLoading}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    required
                  />
                </div>
                {errors.email && (
                  <p id="email-error" className="mt-1.5 text-sm text-red-600 flex items-center animate-pulse">
                    <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className={`block font-medium text-slate-900 mb-2 ${baseFontSize}`}>
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" aria-hidden="true">
                    <Lock className={`h-5 w-5 ${errors.password ? 'text-red-400' : 'text-slate-400 group-focus-within:text-blue-500'} transition-colors`} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    id="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-10 py-3 rounded-xl border ${errors.password
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                      : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
                      } focus:outline-none focus:ring-4 transition-all duration-200 sm:text-sm`}
                    placeholder="••••••••"
                    disabled={isLoading}
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? "password-error" : undefined}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 rounded"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
                  </button>
                </div>
                {errors.password && (
                  <p id="password-error" className="mt-1.5 text-sm text-red-600 flex items-center">
                    <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="rememberMe"
                    name="rememberMe"
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    disabled={isLoading}
                  />
                  <label htmlFor="rememberMe" className="ml-2 block text-sm text-slate-700 cursor-pointer select-none">
                    Remember me
                  </label>
                </div>
                <Link to="/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 rounded">
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full relative overflow-hidden bg-linear-to-r from-blue-600 to-blue-700 text-white font-bold py-3.5 px-4 rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition-all duration-300 shadow-lg hover:shadow-blue-500/25 ${isLoading ? 'cursor-not-allowed opacity-80' : 'transform hover:-translate-y-0.5'
                  }`}
                aria-busy={isLoading}
              >
                <div className="flex items-center justify-center">
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5 mr-2" />
                      Sign In
                    </>
                  )}
                </div>
              </button>

              {/* Sign Up Link */}
              <p className="text-center text-sm text-slate-600 pt-2">
                Don't have an account?{' '}
                <Link
                  to="/signup"
                  className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-all"
                >
                  Create an account
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;