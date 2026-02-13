
import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import signupLogo from '../assets/signup-logo.webp';
import { Users, Mail, Lock, User, BookOpen, ArrowLeft, Eye, EyeOff, GraduationCap, AlertCircle } from 'lucide-react';
import peerlearnLogo from '../assets/peerlearn-logo.png';
import { useAccessibility } from '../context/hooks';
import { useAuth } from '../context/AuthContext';
import AccessibilityToolbar from '../components/AccessibilityToolbar';

// eslint-disable-next-line no-unused-vars
const RoleCard = ({ title, description, icon: Icon, value, isSelected, setFormData }) => (
  <div
    onClick={() => setFormData(prev => ({ ...prev, role: value }))}
    className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
  >
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isSelected ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h3 className="font-semibold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-600 mt-1">{description}</p>
      </div>
    </div>
  </div>
);


const SignUp = () => {
  React.useEffect(() => {
    document.title = 'Sign Up';
  }, []);
  const { highContrast, textSize } = useAccessibility();
  const navigate = useNavigate();
  const location = useLocation();
  const initialRole = location.state?.role || '';
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: initialRole // get from role selection page
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const [generalError, setGeneralError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (generalError) setGeneralError('');
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.role) {
      newErrors.role = 'Please select a role';
    }
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    // Strong password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = 'Password must contain an uppercase letter';
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password = 'Password must contain a lowercase letter';
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = 'Password must contain a number';
    } else if (!/[^A-Za-z0-9]/.test(formData.password)) {
      newErrors.password = 'Password must contain a special character';
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (validateForm()) {
      setIsSubmitting(true);
      setGeneralError('');
      try {
        const user = await register({
          name: formData.fullName,
          email: formData.email,
          password: formData.password
        }, formData.role);

        if (user.role === 'tutor') {
          navigate('/dashboard-tutor');
        } else {
          navigate('/dashboard-learner');
        }
      } catch (error) {
        setGeneralError(error.message || 'Registration failed. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <>
      <div className={`min-h-screen w-screen flex transition-colors duration-300 ${highContrast ? 'high-contrast' : ''} signup-page`} style={{ fontSize: textSize === 'large' ? '18px' : '16px' }}>
        <AccessibilityToolbar />
        {/* Left: Image (fixed, always fills left half) */}
        <div className="hidden md:block md:w-1/2 fixed left-0 top-0 h-full min-h-screen z-0">
          <img
            src={signupLogo}
            alt="Sign up visual"
            className="object-cover w-full h-full min-h-screen"
            style={{ minHeight: '100vh' }}
          />
        </div>
        {/* Right: Form (scrollable, with left margin) */}
        <div className="flex-1 flex flex-col justify-center items-center bg-white/90 p-8 min-h-screen ml-0 md:ml-[50vw] z-10">
          {/* Back to Home link */}
          <div className="w-full flex justify-start mb-4">
            <Link to="/" className="flex items-center text-blue-600 hover:bg-blue-100 hover:text-blue-500 font-medium gap-1 rounded-lg px-2 py-1 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Back to Home
            </Link>
          </div>
          <div className="flex flex-col items-center mb-8 w-full">
            <div className="flex items-center gap-3 mb-4">
              {peerlearnLogo ? (
                <img src={peerlearnLogo} alt="PeerLearn Logo" className="h-16 w-auto" />
              ) : (
                <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Users className="w-7 h-7 text-white" />
                </div>
              )}
              <span className="text-2xl font-bold text-slate-900">PeerLearn</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 text-center">Create your account</h1>
            <p className="text-slate-600 text-center mt-2">Join our community of learners and tutors</p>
          </div>

          {/* General Error Banner */}
          {generalError && (
            <div className="w-full max-w-md mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md flex items-start animate-fade-in">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5" />
              <p className="text-sm text-red-700">{generalError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md">
            {/* Role Selection Notice */}
            {!formData.role && (
              <div className="mb-4">
                <p className="text-red-600 text-sm">Please select your role first. <Link to="/role-selection" className="text-blue-600 underline">Go back</Link></p>
              </div>
            )}
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-3 rounded-lg border ${errors.fullName ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500'} focus:outline-none focus:ring-2`}
                  placeholder="John Doe"
                />
              </div>
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
              )}
            </div>
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-3 rounded-lg border ${errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500'} focus:outline-none focus:ring-2`}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>
            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-10 py-3 rounded-lg border ${errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500'} focus:outline-none focus:ring-2`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-slate-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-slate-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>
            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-10 py-3 rounded-lg border ${errors.confirmPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500'} focus:outline-none focus:ring-2`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-slate-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-slate-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>
            {/* Terms */}
            <div className="flex items-center">
              <input
                id="terms"
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                required
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-slate-700">
                I agree to the{' '}
                <Link to="/terms" className="text-blue-600 hover:text-blue-700 font-medium">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-blue-600 hover:text-blue-700 font-medium">
                  Privacy Policy
                </Link>
              </label>
            </div>
            {/* Submit Button */}
            <button
              type="submit"
              className={`w-full bg-linear-to-r from-blue-600 to-blue-700 text-white font-semibold py-3.5 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-md hover:shadow-lg flex items-center justify-center ${isSubmitting || !formData.role || !formData.fullName || !formData.email || !formData.password || !formData.confirmPassword || Object.keys(errors).length > 0 ? 'opacity-60 cursor-not-allowed' : ''}`}
              disabled={isSubmitting || !formData.role || !formData.fullName || !formData.email || !formData.password || !formData.confirmPassword || Object.keys(errors).length > 0}
            >
              {isSubmitting ? (
                <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
              ) : null}
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </button>
            {/* Login Link */}
            <div className="text-center">
              <p className="text-sm text-slate-600">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-700">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default SignUp;