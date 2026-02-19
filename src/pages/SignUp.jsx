
import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import signupLogo from '../assets/signup-logo.webp';
import { Users, Mail, Lock, User, BookOpen, ArrowLeft, ArrowRight, Eye, EyeOff, GraduationCap, AlertCircle } from 'lucide-react';
import peerlearnLogo from '../assets/peerlearn-logo.png';
import { useAccessibility } from '../context/hooks';
import { useAuth } from '../context/AuthContext';
import AccessibilityToolbar from '../components/AccessibilityToolbar';

const SignUp = () => {
  const { highContrast, textSize } = useAccessibility();
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    fullName: location.state?.fullName || '',
    email: location.state?.email || '',
    password: location.state?.password || '',
    confirmPassword: location.state?.confirmPassword || '',
    role: location.state?.role || ''
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');

  // Redirect to role selection if no role is present
  React.useEffect(() => {
    if (!formData.role) {
      navigate('/role-selection', { replace: true });
    }
  }, [formData.role, navigate]);

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear errors when user types
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (generalError) setGeneralError('');
  };

  // Validation Logic
  const validateForm = () => {
    const newErrors = {};

    // Full Name Validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = 'Name must be at least 3 characters long';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.fullName)) {
      newErrors.fullName = 'Name can only contain letters and spaces';
    }

    // Email Validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password Validation
    const hasUpperCase = /[A-Z]/.test(formData.password);
    const hasLowerCase = /[a-z]/.test(formData.password);
    const hasNumber = /\d/.test(formData.password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(formData.password);

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      newErrors.password = 'Password must include uppercase, lowercase, number and special character';
    }

    // Confirm Password Validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
        // We register first to get the user account created
        const basePayload = {
          name: formData.fullName,
          email: formData.email,
          password: formData.password
        };
        const rolePayload = formData.role === 'tutor'
          ? { bio: 'New tutor', subjects: [], hourlyRate: 0 }
          : { interests: [] };
        const userData = await register({
          ...basePayload,
          ...rolePayload
        }, formData.role);

        // Then move to Step 3: Profile Setup
        navigate('/profile-setup', { 
          state: { 
            role: formData.role,
            userId: userData.id
          } 
        });
      } catch (error) {
        setGeneralError(error.message || 'Registration failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Dynamic Styles based on Accessibility Context
  const baseFontSize = textSize === 'large' ? 'text-lg' : 'text-base';
  const containerClass = highContrast ? 'bg-white text-black contrast-more' : 'bg-slate-50';

  return (
    <div className={`min-h-screen w-full flex flex-col ${containerClass} transition-colors duration-300 signup-page`}>
      <AccessibilityToolbar />
      
      {/* Skip Link */}
      <a 
        href="#signup-form" 
        className="sr-only focus-not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
      >
        Skip to signup form
      </a>
      
      <style>{`
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

        {/* LEFT SIDE: Image */}
        <div className="hidden lg:block lg:w-1/2" aria-hidden="true">
          <div className="fixed top-0 left-0 w-1/2 h-full bg-slate-900 z-0">
            <img
              src={signupLogo}
              alt="Students collaborating"
              className="w-full h-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/30 to-transparent flex flex-col justify-end p-12 text-white">
              <div className="mb-6 inline-flex items-center px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-sm font-medium backdrop-blur-sm">
                Step 2 of 3: Account Details
              </div>
              <h2 className="text-4xl font-bold mb-4">Almost there, {formData.role}!</h2>
              <p className="text-lg text-slate-200 max-w-md">Create your account to start your journey as a {formData.role === 'tutor' ? 'knowledge sharer' : 'skill seeker'}.</p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Form Container */}
        <div className="flex-1 w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 lg:px-16 bg-white z-10 min-h-screen">
          <div className="w-full max-w-md space-y-8">
            {/* Header Section */}
            <header>
              <button
                onClick={() => navigate('/role-selection', { state: formData })}
                className="inline-flex items-center text-slate-500 hover:text-blue-600 font-medium transition-colors mb-8 group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 rounded"
              >
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" aria-hidden="true" />
                Back to Role Selection
              </button>

              <div className="flex items-center gap-3 mb-6">
                <img
                  src={peerlearnLogo}
                  alt="PeerLearn"
                  className="w-10 h-10 object-contain"
                />
                <span className="text-2xl font-bold text-slate-900 tracking-tight">PeerLearn</span>
              </div>

              <h1 className={`font-bold text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 rounded ${textSize === 'large' ? 'text-4xl' : 'text-3xl'}`} tabIndex={-1}>
                Account Details
              </h1>
              <p className={`mt-2 text-slate-600 ${baseFontSize}`}>
                Tell us a bit more about yourself.
              </p>
              {/* Step Indicator - ARIA for screen readers */}
              <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">
                Step 2 of 3: Account Details. Fill in your email, password, and confirm password fields below.
              </span>
            </header>

            {/* General Error Banner */}
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
            <form onSubmit={handleSubmit} className="space-y-6" id="signup-form" noValidate>

              {/* Full Name Input */}
              <div>
                <label htmlFor="fullName" className={`block font-medium text-slate-900 mb-2 ${baseFontSize}`}>
                  Full Name
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" aria-hidden="true">
                    <User className={`h-5 w-5 ${errors.fullName ? 'text-red-400' : 'text-slate-400 group-focus-within:text-blue-500'} transition-colors`} />
                  </div>
                  <input
                    type="text"
                    name="fullName"
                    id="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-3 rounded-xl border text-slate-900 ${errors.fullName
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                      : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
                      } focus:outline-none focus:ring-4 transition-all duration-200 sm:text-sm`}
                    placeholder="John Doe"
                    disabled={isLoading}
                    aria-invalid={!!errors.fullName}
                    aria-describedby={errors.fullName ? "fullName-error" : undefined}
                    required
                  />
                </div>
                {errors.fullName && (
                  <p id="fullName-error" className="mt-1.5 text-sm text-red-600 flex items-center">
                    <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                    {errors.fullName}
                  </p>
                )}
              </div>

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
                    className={`block w-full pl-10 pr-3 py-3 rounded-xl border text-slate-900 ${errors.email
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
                  <p id="email-error" className="mt-1.5 text-sm text-red-600 flex items-center">
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
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className={`h-5 w-5 ${errors.password ? 'text-red-400' : 'text-slate-400 group-focus-within:text-blue-500'} transition-colors`} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    id="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-10 py-3 rounded-xl border text-slate-900 ${errors.password
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                      : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
                      } focus:outline-none focus:ring-4 transition-all duration-200 sm:text-sm`}
                    placeholder="••••••••"
                    disabled={isLoading}
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? "password-error" : "password-hint"}
                    required
                    aria-label="Password. Must include uppercase, lowercase, number and special character"
                  />
                  <span id="password-hint" className="sr-only">Requirement: Must include uppercase, lowercase, number and special character</span>
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

              {/* Confirm Password Input */}
              <div>
                <label htmlFor="confirmPassword" className={`block font-medium text-slate-900 mb-2 ${baseFontSize}`}>
                  Confirm Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className={`h-5 w-5 ${errors.confirmPassword ? 'text-red-400' : 'text-slate-400 group-focus-within:text-blue-500'} transition-colors`} aria-hidden="true" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-10 py-3 rounded-xl border text-slate-900 ${errors.confirmPassword
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                      : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
                      } focus:outline-none focus:ring-4 transition-all duration-200 sm:text-sm`}
                    placeholder="••••••••"
                    disabled={isLoading}
                    aria-invalid={!!errors.confirmPassword}
                    aria-describedby={errors.confirmPassword ? "confirmPassword-error" : "confirmPassword-hint"}
                    required
                    aria-label="Confirm Password. Must match the password you entered above"
                  />
                  <span id="confirmPassword-hint" className="sr-only">Requirement: Must match the password you entered above</span>
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 rounded"
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                    aria-pressed={showConfirmPassword}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p id="confirmPassword-error" className="mt-1.5 text-sm text-red-600 flex items-center">
                    <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                    {errors.confirmPassword}
                  </p>
                )}
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
                      Creating account...
                    </>
                  ) : (
                    <>
                      <span>Continue to Profile Setup</span>
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </div>
              </button>

              {/* Sign In Link */}
              <p className="text-center text-sm text-slate-600 pt-2">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-all"
                >
                  Sign in
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );};

export default SignUp;