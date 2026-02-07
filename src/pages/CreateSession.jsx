import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, Clock, Users, BookOpen, 
  Video, Globe, Target, Zap, Save, X,
  CheckCircle, AlertCircle, HelpCircle, Eye, EyeOff
} from 'lucide-react';
import { Link } from 'react-router-dom';

const CreateSession = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    date: '',
    time: '',
    duration: 60,
    maxParticipants: 10,
    difficulty: 'beginner',
    sessionType: 'video',
    accessibilityFeatures: {
      captions: true,
      transcript: false,
      highContrast: true,
      keyboardNav: true
    }
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subjects = [
    'Computer Science', 'Mathematics', 'Physics', 'Chemistry',
    'Biology', 'English Literature', 'History', 'Economics',
    'Business Studies', 'Programming', 'Web Development', 'Data Science'
  ];

  const difficulties = [
    { value: 'beginner', label: 'Beginner', color: 'bg-emerald-100 text-emerald-700' },
    { value: 'intermediate', label: 'Intermediate', color: 'bg-blue-100 text-blue-700' },
    { value: 'advanced', label: 'Advanced', color: 'bg-purple-100 text-purple-700' }
  ];

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Session title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.subject) newErrors.subject = 'Please select a subject';
    if (!formData.date) newErrors.date = 'Please select a date';
    if (!formData.time) newErrors.time = 'Please select a time';
    if (formData.duration < 15) newErrors.duration = 'Minimum duration is 15 minutes';
    if (formData.maxParticipants < 1) newErrors.maxParticipants = 'Minimum 1 participant';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      // Simulate API call
      setTimeout(() => {
        console.log('Session created:', formData);
        setIsSubmitting(false);
        navigate('/dashboard');
      }, 1500);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('accessibilityFeatures.')) {
      const feature = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        accessibilityFeatures: {
          ...prev.accessibilityFeatures,
          [feature]: checked
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Accessibility Features Checklist
  const accessibilityFeatures = [
    { id: 'captions', label: 'Live Captions', description: 'Real-time captioning for hearing impaired' },
    { id: 'transcript', label: 'Transcript', description: 'Session transcript available' },
    { id: 'highContrast', label: 'High Contrast Mode', description: 'Supports high contrast display' },
    { id: 'keyboardNav', label: 'Keyboard Navigation', description: 'Full keyboard accessibility' },
    { id: 'screenReader', label: 'Screen Reader Ready', description: 'Compatible with screen readers' },
    { id: 'altText', label: 'Alt Text for Images', description: 'Descriptive text for visual content' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Accessibility Skip Link */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-lg z-50"
      >
        Skip to main content
      </a>

      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                to="/dashboard" 
                className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition"
                aria-label="Back to dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back to Dashboard</span>
              </Link>
            </div>
            <div className="flex items-center space-x-3">
              <div className="hidden md:block">
                <span className="text-sm text-slate-600">Creating session as:</span>
                <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {user?.fullName || 'Tutor'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main id="main-content" className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Create Learning Session
            </h1>
            <p className="text-slate-600">
              Design an accessible, engaging learning experience for your students
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Information Section */}
                <section aria-labelledby="basic-info-heading">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                    </div>
                    <h2 id="basic-info-heading" className="text-xl font-bold text-slate-900">
                      Basic Information
                    </h2>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Title */}
                    <div className="md:col-span-2">
                      <label htmlFor="title" className="block text-sm font-medium text-slate-900 mb-2">
                        Session Title *
                      </label>
                      <input
                        id="title"
                        name="title"
                        type="text"
                        value={formData.title}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-lg border ${errors.title ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500'} focus:outline-none focus:ring-2`}
                        placeholder="e.g., Introduction to React Hooks"
                        aria-required="true"
                        aria-invalid={!!errors.title}
                        aria-describedby={errors.title ? 'title-error' : undefined}
                      />
                      {errors.title && (
                        <p id="title-error" className="mt-2 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.title}
                        </p>
                      )}
                    </div>

                    {/* Description */}
                    <div className="md:col-span-2">
                      <label htmlFor="description" className="block text-sm font-medium text-slate-900 mb-2">
                        Description *
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="4"
                        className={`w-full px-4 py-3 rounded-lg border ${errors.description ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500'} focus:outline-none focus:ring-2`}
                        placeholder="Describe what students will learn in this session..."
                        aria-required="true"
                        aria-invalid={!!errors.description}
                        aria-describedby={errors.description ? 'description-error' : undefined}
                      />
                      {errors.description && (
                        <p id="description-error" className="mt-2 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.description}
                        </p>
                      )}
                    </div>

                    {/* Subject */}
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-slate-900 mb-2">
                        Subject *
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-lg border ${errors.subject ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500'} focus:outline-none focus:ring-2`}
                        aria-required="true"
                        aria-invalid={!!errors.subject}
                        aria-describedby={errors.subject ? 'subject-error' : undefined}
                      >
                        <option value="">Select a subject</option>
                        {subjects.map((subject) => (
                          <option key={subject} value={subject}>
                            {subject}
                          </option>
                        ))}
                      </select>
                      {errors.subject && (
                        <p id="subject-error" className="mt-2 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.subject}
                        </p>
                      )}
                    </div>

                    {/* Difficulty */}
                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-2">
                        Difficulty Level *
                      </label>
                      <div className="flex space-x-3">
                        {difficulties.map((level) => (
                          <button
                            key={level.value}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, difficulty: level.value }))}
                            className={`flex-1 px-4 py-3 rounded-lg border ${formData.difficulty === level.value ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-slate-400'} transition-colors`}
                            aria-pressed={formData.difficulty === level.value}
                          >
                            <span className={`px-2 py-1 ${level.color} rounded text-xs font-medium mb-2 inline-block`}>
                              {level.label}
                            </span>
                            <div className="text-sm text-slate-700">
                              {level.value === 'beginner' && 'Basic concepts'}
                              {level.value === 'intermediate' && 'Some experience needed'}
                              {level.value === 'advanced' && 'Advanced topics'}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Scheduling Section */}
                <section aria-labelledby="scheduling-heading" className="pt-8 border-t border-slate-200">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <h2 id="scheduling-heading" className="text-xl font-bold text-slate-900">
                      Scheduling
                    </h2>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Date */}
                    <div>
                      <label htmlFor="date" className="block text-sm font-medium text-slate-900 mb-2">
                        Date *
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                        <input
                          id="date"
                          name="date"
                          type="date"
                          value={formData.date}
                          onChange={handleChange}
                          min={new Date().toISOString().split('T')[0]}
                          className={`w-full pl-12 pr-4 py-3 rounded-lg border ${errors.date ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500'} focus:outline-none focus:ring-2`}
                          aria-required="true"
                          aria-invalid={!!errors.date}
                          aria-describedby={errors.date ? 'date-error' : undefined}
                        />
                      </div>
                      {errors.date && (
                        <p id="date-error" className="mt-2 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.date}
                        </p>
                      )}
                    </div>

                    {/* Time */}
                    <div>
                      <label htmlFor="time" className="block text-sm font-medium text-slate-900 mb-2">
                        Time *
                      </label>
                      <div className="relative">
                        <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                        <input
                          id="time"
                          name="time"
                          type="time"
                          value={formData.time}
                          onChange={handleChange}
                          className={`w-full pl-12 pr-4 py-3 rounded-lg border ${errors.time ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500'} focus:outline-none focus:ring-2`}
                          aria-required="true"
                          aria-invalid={!!errors.time}
                          aria-describedby={errors.time ? 'time-error' : undefined}
                        />
                      </div>
                      {errors.time && (
                        <p id="time-error" className="mt-2 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.time}
                        </p>
                      )}
                    </div>

                    {/* Duration */}
                    <div>
                      <label htmlFor="duration" className="block text-sm font-medium text-slate-900 mb-2">
                        Duration (minutes) *
                      </label>
                      <div className="relative">
                        <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                        <input
                          id="duration"
                          name="duration"
                          type="number"
                          min="15"
                          max="240"
                          step="15"
                          value={formData.duration}
                          onChange={handleChange}
                          className={`w-full pl-12 pr-4 py-3 rounded-lg border ${errors.duration ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500'} focus:outline-none focus:ring-2`}
                          aria-required="true"
                          aria-invalid={!!errors.duration}
                          aria-describedby={errors.duration ? 'duration-error' : undefined}
                        />
                      </div>
                      {errors.duration && (
                        <p id="duration-error" className="mt-2 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.duration}
                        </p>
                      )}
                      <p className="mt-2 text-sm text-slate-500">
                        Recommended: 60-90 minutes for optimal engagement
                      </p>
                    </div>
                  </div>
                </section>

                {/* Session Details Section */}
                <section aria-labelledby="details-heading" className="pt-8 border-t border-slate-200">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <h2 id="details-heading" className="text-xl font-bold text-slate-900">
                      Session Details
                    </h2>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Max Participants */}
                    <div>
                      <label htmlFor="maxParticipants" className="block text-sm font-medium text-slate-900 mb-2">
                        Maximum Participants *
                      </label>
                      <div className="relative">
                        <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                        <input
                          id="maxParticipants"
                          name="maxParticipants"
                          type="number"
                          min="1"
                          max="50"
                          value={formData.maxParticipants}
                          onChange={handleChange}
                          className={`w-full pl-12 pr-4 py-3 rounded-lg border ${errors.maxParticipants ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500'} focus:outline-none focus:ring-2`}
                          aria-required="true"
                          aria-invalid={!!errors.maxParticipants}
                          aria-describedby={errors.maxParticipants ? 'maxParticipants-error' : undefined}
                        />
                      </div>
                      {errors.maxParticipants && (
                        <p id="maxParticipants-error" className="mt-2 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.maxParticipants}
                        </p>
                      )}
                    </div>

                    {/* Session Type */}
                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-2">
                        Session Type *
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, sessionType: 'video' }))}
                          className={`p-4 rounded-lg border ${formData.sessionType === 'video' ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-slate-400'} transition-colors`}
                          aria-pressed={formData.sessionType === 'video'}
                        >
                          <Video className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                          <div className="text-sm font-medium text-slate-900">Video Call</div>
                          <div className="text-xs text-slate-600">Real-time video</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, sessionType: 'text' }))}
                          className={`p-4 rounded-lg border ${formData.sessionType === 'text' ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-slate-400'} transition-colors`}
                          aria-pressed={formData.sessionType === 'text'}
                        >
                          <BookOpen className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                          <div className="text-sm font-medium text-slate-900">Text-Based</div>
                          <div className="text-xs text-slate-600">Chat & resources</div>
                        </button>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Accessibility Features Section */}
                <section aria-labelledby="accessibility-heading" className="pt-8 border-t border-slate-200">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Zap className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h2 id="accessibility-heading" className="text-xl font-bold text-slate-900">
                          Accessibility Features
                        </h2>
                        <p className="text-sm text-slate-600 mt-1">
                          Make your session inclusive for all learners
                        </p>
                      </div>
                    </div>
                    <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                      Accessibility First
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {accessibilityFeatures.map((feature) => (
                      <label
                        key={feature.id}
                        className={`flex items-start p-4 rounded-lg border cursor-pointer transition-colors ${formData.accessibilityFeatures[feature.id] ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-slate-400'}`}
                      >
                        <input
                          type="checkbox"
                          name={`accessibilityFeatures.${feature.id}`}
                          checked={formData.accessibilityFeatures[feature.id] || false}
                          onChange={handleChange}
                          className="mt-1 mr-3 h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                          aria-describedby={`${feature.id}-description`}
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-slate-900">
                              {feature.label}
                            </span>
                            {formData.accessibilityFeatures[feature.id] && (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            )}
                          </div>
                          <p id={`${feature.id}-description`} className="text-sm text-slate-600 mt-1">
                            {feature.description}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </section>

                {/* Form Actions */}
                <div className="pt-8 border-t border-slate-200">
                  <div className="flex flex-col-reverse md:flex-row md:items-center md:justify-between gap-4">
                    <div className="text-sm text-slate-600">
                      <p className="flex items-center">
                        <HelpCircle className="w-4 h-4 mr-2" />
                        Fields marked with * are required
                      </p>
                    </div>
                    
                    <div className="flex space-x-4">
                      <button
                        type="button"
                        onClick={() => navigate('/dashboard')}
                        className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                        disabled={isSubmitting}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all font-medium shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Creating Session...
                          </>
                        ) : (
                          <>
                            <Save className="w-5 h-5 mr-2" />
                            Create Session
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateSession;