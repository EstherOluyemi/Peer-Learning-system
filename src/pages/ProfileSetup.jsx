import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    AlertCircle,
    BookOpen,
    DollarSign,
    FileText,
    Plus,
    X,
    Users
} from 'lucide-react';
import { useAccessibility } from '../context/hooks';
import { useAuth } from '../context/AuthContext';
import AccessibilityToolbar from '../components/AccessibilityToolbar';
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
    const containerClass = highContrast ? 'bg-white text-black contrast-more' : 'bg-slate-50';

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
            <AccessibilityToolbar />

            <div className="flex-1 flex flex-col lg:flex-row relative">
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
                            <h2 className="text-4xl font-bold mb-4">Complete Your Profile</h2>
                            <p className="text-lg text-slate-200 max-w-md">
                                {isTutor
                                    ? "Help students find you by listing your expertise and setting your rate."
                                    : "Help tutors understand your needs by listing subjects you're interested in."}
                            </p>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE: Form */}
                <div className="flex-1 w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 lg:px-16 bg-white z-10 min-h-screen">
                    <div className="w-full max-w-md space-y-8">
                        <div>
                            <button
                                onClick={() => navigate(-1)}
                                className="inline-flex items-center text-slate-500 hover:text-blue-600 font-medium transition-colors mb-8 group"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                                Back to Account Details
                            </button>

                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                                    <Users className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-2xl font-bold text-slate-900 tracking-tight">PeerLearn</span>
                            </div>

                            <h1 className={`font-bold text-slate-900 ${textSize === 'large' ? 'text-4xl' : 'text-3xl'}`}>
                                {isTutor ? 'Tutor Profile' : 'Learner Profile'}
                            </h1>
                            <p className={`mt-2 text-slate-600 ${baseFontSize}`}>
                                This information helps us personalize your experience.
                            </p>
                        </div>

                        {errors.general && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md flex items-start">
                                <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5" />
                                <p className="text-sm text-red-700">{errors.general}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Bio Field */}
                            <div className="space-y-2">
                                <label htmlFor="bio" className={`block font-semibold text-slate-900 ${baseFontSize}`}>
                                    Bio (Optional)
                                </label>
                                <div className="relative group">
                                    <div className="absolute top-3 left-3 pointer-events-none">
                                        <FileText className={`w-5 h-5 ${errors.bio ? 'text-red-400' : 'text-slate-400 group-focus-within:text-blue-500'}`} />
                                    </div>
                                    <textarea
                                        id="bio"
                                        name="bio"
                                        rows="4"
                                        value={formData.bio}
                                        onChange={handleChange}
                                        className={`block w-full pl-10 pr-4 py-3 rounded-xl border text-slate-900 ${errors.bio ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'} focus:outline-none focus:ring-4 transition-all resize-none text-sm`}
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
                                <label htmlFor="currentSubject" className={`block font-semibold text-slate-900 ${baseFontSize}`}>
                                    {isTutor ? 'Subjects you Teach' : 'Subjects you want to Learn'} <span className="text-red-500">*</span>
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <BookOpen className={`w-5 h-5 ${errors.subjects ? 'text-red-400' : 'text-slate-400 group-focus-within:text-blue-500'}`} />
                                    </div>
                                    <input
                                        type="text"
                                        id="currentSubject"
                                        name="currentSubject"
                                        value={formData.currentSubject}
                                        onChange={handleChange}
                                        onKeyDown={handleAddSubject}
                                        className={`block w-full pl-10 pr-12 py-3 rounded-xl border text-slate-900 ${errors.subjects ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'} focus:outline-none focus:ring-4 transition-all text-sm`}
                                        placeholder="Type a subject and press Enter"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddSubject}
                                        className="absolute right-2 top-1.5 p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Subject Tags */}
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {formData.subjects.map((subject, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100 group animate-in zoom-in-95 duration-200"
                                        >
                                            {subject}
                                            <button
                                                type="button"
                                                onClick={() => removeSubject(subject)}
                                                className="p-0.5 hover:bg-blue-200 rounded-full transition-colors"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                {errors.subjects && (
                                    <p className="text-xs text-red-600 mt-1">{errors.subjects}</p>
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
                                            <ArrowRight className="w-5 h-5 ml-2" />
                                        </>
                                    )}
                                </div>
                            </button>

                            <p className="text-center text-xs text-slate-500">
                                You can update these details later in your settings.
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileSetup;
