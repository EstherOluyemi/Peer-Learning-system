import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    AlertCircle,
    BookOpen,
    FileText,
    Plus,
    X
} from 'lucide-react';
import { useAccessibility } from '../context/hooks';
import { useAuth } from '../context/AuthContext';
import AccessibilityToolbar from '../components/AccessibilityToolbar';
import peerlearnLogo from '../assets/peerlearn-logo.png';
import signupLogo from '../assets/signup-logo.webp';

const ProfileSetup = () => {
    const { highContrast, textSize } = useAccessibility();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, loading: authLoading } = useAuth();

    // Redirect if no role or userId is present (meaning they skipped previous steps)
    // But only after auth context has checked for saved user
    useEffect(() => {
        if (!authLoading && !location.state?.role && !user) {
            navigate('/role-selection', { replace: true });
        }
    }, [location.state, user, authLoading, navigate]);

    const [formData, setFormData] = useState({
        bio: '',
        subjects: [],
        currentSubject: '',
    });

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const role = location.state?.role || user?.role || 'learner';
    const isTutor = role === 'tutor';

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleAddSubject = (e) => {
        if (e.key === 'Enter' || e.type === 'click') {
            e.preventDefault();
            const subject = formData.currentSubject.trim();
            if (subject && !formData.subjects.includes(subject)) {
                setFormData(prev => ({
                    ...prev,
                    subjects: [...prev.subjects, subject],
                    currentSubject: ''
                }));
                if (errors.subjects) setErrors(prev => ({ ...prev, subjects: '' }));
            }
        }
    };

    const removeSubject = (subjectToRemove) => {
        setFormData(prev => ({
            ...prev,
            subjects: prev.subjects.filter(s => s !== subjectToRemove)
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (formData.bio.length > 500) {
            newErrors.bio = 'Bio must be less than 500 characters';
        }

        if (formData.subjects.length === 0) {
            newErrors.subjects = isTutor
                ? 'Please add at least one subject you teach'
                : 'Please add at least one subject you want to learn';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isLoading) return;

        if (validateForm()) {
            setIsLoading(true);
            try {
                // Get the role from location.state or user context
                const profileRole = location.state?.role || user?.role || 'learner';
                
                // Mock API call to update profile
                await new Promise(resolve => setTimeout(resolve, 1500));
                setIsSuccess(true);
                
                // Redirect after success message is shown
                const isTutor = profileRole === 'tutor';
                setTimeout(() => {
                    navigate(isTutor ? '/dashboard-tutor' : '/dashboard-learner', { replace: true });
                }, 2000);
            } catch (error) {
                setErrors({ general: 'Failed to update profile. Please try again.' });
            } finally {
                setIsLoading(false);
            }
        }
    };

    const baseFontSize = textSize === 'large' ? 'text-lg' : 'text-base';
    const containerClass = highContrast ? 'bg-white dark:bg-black text-black dark:text-white contrast-more' : 'bg-slate-50 dark:bg-slate-950';

    if (isSuccess) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${containerClass}`}>
                <div className="text-center space-y-6 p-8 bg-white rounded-2xl shadow-xl max-w-md w-full animate-in fade-in zoom-in duration-500">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-12 h-12" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900">Profile Ready!</h2>
                    <p className="text-slate-600">Your {role} profile has been set up successfully. Redirecting you to your dashboard...</p>
                    <div className="flex justify-center">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                </div>
            </div>
        );
    }

    // Show loading while auth context is checking for saved user
    if (authLoading && !location.state?.role) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${containerClass}`}>
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-slate-600">Checking your session...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen w-full flex flex-col ${containerClass} transition-colors duration-300`}>
            {/* Skip Link */}
            <a 
                href="#profile-setup-form" 
                className="sr-only focus-not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
            >
                Skip to profile form
            </a>
            
            <style jsx>{`
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
            <AccessibilityToolbar />

      <main className="flex-1 flex flex-col lg:flex-row relative">
                {/* LEFT SIDE: Context */}
                <div className="hidden lg:block lg:w-1/2">
                    <div className="fixed top-0 left-0 w-1/2 h-full bg-slate-900 z-0">
                        <img
                            src={signupLogo}
                            alt="Profile background"
                            className="w-full h-full object-cover opacity-80"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-12 text-white">
                            <div className="mb-6 inline-flex items-center px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-sm font-medium backdrop-blur-sm">
                                Step 3 of 3: Profile Setup
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Complete Your Profile</h2>
                            <p className="text-lg text-slate-200 max-w-md">
                                {isTutor
                                    ? "Help students find you by listing your expertise and setting your rate."
                                    : "Help tutors understand your needs by listing subjects you're interested in."}
                            </p>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE: Form */}
                <div className="flex-1 w-full lg:w-1/2 flex flex-col justify-center items-center p-4 sm:p-6 md:p-12 lg:px-16 bg-white dark:bg-slate-900 z-10 min-h-screen transition-colors duration-300">
                    <div className="w-full max-w-md space-y-6 sm:space-y-8">
                        <div>
                            <button
                                onClick={() => navigate(-1)}
                                className="inline-flex items-center text-slate-500 hover:text-blue-700 dark:text-blue-500 font-medium transition-colors mb-8 group rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" aria-hidden="true" />
                                Back to Account Details
                            </button>

                            <div className="flex items-center gap-3 mb-6">
                                <img
                                    src={peerlearnLogo}
                                    alt=""
                                    aria-hidden="true"
                                    className="w-10 h-10 object-contain"
                                />
                                <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">PeerLearn</span>
                            </div>

                            <h1 className={`font-bold text-slate-900 dark:text-slate-100 ${textSize === 'large' ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl'}`}>
                                {isTutor ? 'Tutor Profile' : 'Learner Profile'}
                            </h1>
                            <p className={`mt-2 text-slate-600 dark:text-slate-500 dark:text-slate-300 ${baseFontSize}`}>
                                This information helps us personalize your experience.
                            </p>
                        </div>

                        {errors.general && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md flex items-start">
                                <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5" />
                                <p className="text-sm text-red-700">{errors.general}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6" id="profile-setup-form" noValidate>
                            {/* Bio Field */}
                            <div className="space-y-2">
                                <label htmlFor="bio" className={`block font-semibold text-slate-900 dark:text-slate-100 ${baseFontSize}`}>
                                    Bio (Optional)
                                </label>
                                <div className="relative group">
                                    <div className="absolute top-3 left-3 pointer-events-none" aria-hidden="true">
                                        <FileText className={`w-5 h-5 ${errors.bio ? 'text-red-400' : 'text-slate-500 dark:text-slate-300 group-focus-within:text-blue-500'}`} aria-hidden="true" />
                                    </div>
                                    <textarea
                                        id="bio"
                                        name="bio"
                                        rows="4"
                                        value={formData.bio}
                                        onChange={handleChange}
                                        className={`block w-full pl-10 pr-4 py-3 rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 ${errors.bio ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 dark:border-slate-700 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-500'} focus:outline-none focus:ring-4 transition-all resize-none text-sm`}
                                        placeholder={isTutor ? "Describe your teaching experience and style..." : "Tell us about your learning goals..."}
                                    ></textarea>
                                </div>
                                <div className="flex justify-between mt-1">
                                    {errors.bio ? (
                                        <p className="text-xs text-red-600">{errors.bio}</p>
                                    ) : (
                                        <p className="text-xs text-slate-500">{formData.bio.length}/500 characters</p>
                                    )}
                                </div>
                            </div>

                            {/* Subjects Field (Compulsory) */}
                            <div className="space-y-2">
                                <label htmlFor="currentSubject" className={`block font-semibold text-slate-900 dark:text-slate-100 ${baseFontSize}`}>
                                    {isTutor ? 'Subjects you Teach' : 'Subjects you want to Learn'} <span className="text-red-500">*</span>
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" aria-hidden="true">
                                        <BookOpen className={`w-5 h-5 ${errors.subjects ? 'text-red-400' : 'text-slate-500 dark:text-slate-300 group-focus-within:text-blue-500'}`} aria-hidden="true" />
                                    </div>
                                    <input
                                        type="text"
                                        id="currentSubject"
                                        name="currentSubject"
                                        value={formData.currentSubject}
                                        onChange={handleChange}
                                        onKeyDown={handleAddSubject}
                                        className={`block w-full pl-10 pr-12 py-3 rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 ${errors.subjects ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 dark:border-slate-700 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-500'} focus:outline-none focus:ring-4 transition-all text-sm`}
                                        placeholder="Type a subject and press Enter"
                                        aria-invalid={!!errors.subjects}
                                        aria-describedby={errors.subjects ? "subjects-error" : undefined}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddSubject}
                                        className="absolute right-2 top-1.5 p-1.5 bg-blue-50 text-blue-700 dark:text-blue-500 rounded-lg hover:bg-blue-100 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                                        aria-label="Add subject"
                                    >
                                        <Plus className="w-5 h-5" aria-hidden="true" />
                                    </button>
                                </div>

                                {/* Subject Tags */}
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {formData.subjects.map((subject, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium border border-blue-100 dark:border-blue-800 group animate-in zoom-in-95 duration-200"
                                        >
                                            {subject}
                                            <button
                                                type="button"
                                                onClick={() => removeSubject(subject)}
                                                className="p-0.5 hover:bg-blue-200 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                                                aria-label={`Remove subject ${subject}`}
                                            >
                                                <X className="w-3 h-3" aria-hidden="true" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                {errors.subjects && (
                                    <p id="subjects-error" className="text-xs text-red-600 mt-1">{errors.subjects}</p>
                                )}
                            </div>



                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full relative overflow-hidden bg-linear-to-r from-blue-600 to-blue-700 text-white font-bold py-3.5 px-4 rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition-all duration-300 shadow-lg hover:shadow-blue-500/25 ${isLoading ? 'cursor-not-allowed opacity-80' : 'transform hover:-translate-y-0.5'}`}
                            >
                                <div className="flex items-center justify-center">
                                    {isLoading ? (
                                        <>
                                            <div className="animate-spin -ml-1 mr-3 h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                                            Saving Profile...
                                        </>
                                    ) : (
                                        <>
                                            <span>Complete Setup</span>
                                            <ArrowRight className="w-5 h-5 ml-2" aria-hidden="true" />
                                        </>
                                    )}
                                </div>
                            </button>

                            <footer className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
                                <p className="text-xs text-slate-500 dark:text-slate-500 dark:text-slate-300">
                                    &copy; 2026 PeerLearn. All rights reserved. • <Link to="/privacy" className="hover:text-blue-700 dark:text-blue-500">Privacy Policy</Link>
                                </p>
                            </footer>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProfileSetup;

