// src/components/tutor/CreateSessionPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import {
  ArrowLeft, Calendar, Clock, Users, BookOpen,
  Video, Globe, Target, Zap, Save, X,
  CheckCircle, AlertCircle, HelpCircle, Eye, EyeOff, Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { featureFlags } from '../../config/featureFlags';
import GoogleMeetAuthPanel from '../meet/GoogleMeetAuthPanel';
import { getGoogleMeetAuthStatus, getGoogleMeetOAuthUrl, getOrCreatePermanentGoogleMeetLink, refreshGoogleMeetAuth, revokeGoogleMeetAuth } from '../../services/googleMeetService';

const CreateSessionPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    date: '',
    time: '',
    duration: 60,
    maxParticipants: 10,
    meetingLink: '',
    studentId: '',
    enableGoogleMeet: true,
    sessionType: 'video',
    accessibilityFeatures: {
      captions: true,
      transcript: false,
      highContrast: true,
      keyboardNav: true,
      screenReader: true,
      altText: true
    }
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(!!editId);
  const [apiError, setApiError] = useState(null);
  const [googleMeetStatus, setGoogleMeetStatus] = useState({ connected: false, expiresAt: null, scopes: [] });
  const [googleMeetLoading, setGoogleMeetLoading] = useState(false);
  const [googleMeetError, setGoogleMeetError] = useState('');

  // Load session data when editing (from navigation state)
  useEffect(() => {
    if (editId && location.state?.sessionData) {
      const session = location.state.sessionData;

      const startDate = new Date(session.startTime);
      const endDate = new Date(session.endTime);
      const durationMs = endDate - startDate;
      const durationMinutes = Math.round(durationMs / 60000);

      const dateStr = startDate.toISOString().split('T')[0];
      const timeStr = startDate.toTimeString().slice(0, 5);

      setFormData(prev => ({
        ...prev,
        title: session.title || '',
        description: session.description || '',
        subject: session.subject || '',
        date: dateStr,
        time: timeStr,
        duration: durationMinutes,
        maxParticipants: session.maxParticipants || 10,
        meetingLink: session.meetingLink || ''
      }));
      setIsLoading(false);
    } else if (editId) {
      // Fallback: try to fetch if state not available (e.g., page refresh)
      const fetchSession = async () => {
        try {
          const response = await api.get(`/v1/tutor/sessions/${editId}`);
          const session = response?.data || response;

          const startDate = new Date(session.startTime);
          const endDate = new Date(session.endTime);
          const durationMs = endDate - startDate;
          const durationMinutes = Math.round(durationMs / 60000);

          const dateStr = startDate.toISOString().split('T')[0];
          const timeStr = startDate.toTimeString().slice(0, 5);

          setFormData(prev => ({
            ...prev,
            title: session.title || '',
            description: session.description || '',
            subject: session.subject || '',
            date: dateStr,
            time: timeStr,
            duration: durationMinutes,
            maxParticipants: session.maxParticipants || 10,
            meetingLink: session.meetingLink || ''
          }));
        } catch (err) {
          setApiError('Failed to load session. Please navigate back and try again.');
          console.error('Error loading session:', err);
        } finally {
          setIsLoading(false);
        }
      };

      fetchSession();
    }
  }, [editId, location.state?.sessionData]);

  useEffect(() => {
    if (!featureFlags.googleMeet) return;
    let active = true;
    const fetchStatus = async () => {
      setGoogleMeetLoading(true);
      setGoogleMeetError('');
      const status = await getGoogleMeetAuthStatus();
      if (!active) return;
      setGoogleMeetStatus({
        connected: status.connected,
        expiresAt: status.expiresAt,
        scopes: status.scopes || [],
      });
      if (status.error) {
        setGoogleMeetError(status.error.message || 'Unable to verify Google Meet connection.');
      }
      setGoogleMeetLoading(false);
    };
    fetchStatus();
    return () => {
      active = false;
    };
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = 'Session title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.subject.trim()) newErrors.subject = 'Please enter a subject';
    if (!formData.date) newErrors.date = 'Please select a date';
    if (!formData.time) newErrors.time = 'Please select a time';
    if (formData.duration < 15) newErrors.duration = 'Minimum duration is 15 minutes';
    if (formData.maxParticipants < 1) newErrors.maxParticipants = 'Minimum 1 participant';
    if (featureFlags.googleMeet && formData.sessionType === 'video' && formData.enableGoogleMeet && !formData.studentId.trim()) {
      newErrors.studentId = 'Student ID is required to generate a Meet link';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        setIsSubmitting(true);
        setApiError(null);
        const startDateTime = new Date(`${formData.date}T${formData.time}`);
        if (Number.isNaN(startDateTime.getTime())) {
          setApiError('Please provide a valid date and time.');
          return;
        }
        const durationMinutes = Number(formData.duration) || 0;
        const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60000);
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        let meetingLink = formData.meetingLink?.trim();
        let meetingId;
        let meetingCode;
        let tutorId = user?.id || user?._id;
        const meetingTitle = formData.title.trim();
        const scheduledTime = startDateTime.toISOString();
        const studentId = formData.studentId?.trim() || tutorId;
        const shouldCreateMeet = featureFlags.googleMeet && formData.sessionType === 'video' && formData.enableGoogleMeet;

        try {
          const meResponse = await api.get('/v1/tutor/me');
          const meRoot = meResponse?.data || meResponse;
          const mePayload = meRoot?.data?.user || meRoot?.data || meRoot;
          const resolvedTutorId =
            mePayload?.id ||
            mePayload?._id ||
            mePayload?.tutorId ||
            mePayload?.tutor?._id ||
            mePayload?.tutor?.id;
          if (resolvedTutorId) {
            tutorId = resolvedTutorId;
          }
        } catch (err) {
          console.error('Failed to resolve tutor ID from /v1/tutor/me:', err);
        }

        if (!tutorId) {
          setApiError('Unable to identify tutor account. Please log out and log in again.');
          setIsSubmitting(false);
          return;
        }

        if (!editId && shouldCreateMeet) {
          if (!googleMeetStatus.connected) {
            setApiError('Connect Google Meet before generating a meeting link.');
            return;
          }
          try {
            const meetingResponse = await getOrCreatePermanentGoogleMeetLink({
              meetingTitle,
              scheduledTime,
              tutorId,
              studentId,
              durationMinutes
            });
            meetingLink = meetingResponse?.joinUrl || meetingLink;
            meetingId = meetingResponse?.meetingId;
            meetingCode = meetingResponse?.meetingId;
            if (!meetingLink) {
              setApiError('Google Meet creation succeeded but no join link was returned.');
              return;
            }
          } catch (err) {
            if (err?.code === 'AUTH_FAILED') {
              setGoogleMeetError('Google authorization expired. Reconnect to continue.');
            }
            const apiError =
              err?.response?.data?.message ||
              err?.response?.data?.error ||
              err.message ||
              'Failed to create Google Meet session. Please try again.';
            console.error('Google Meet creation error:', err);
            setApiError(apiError);
            return;
          }
        }

        const payload = {
          title: formData.title.trim(),
          description: formData.description.trim(),
          subject: formData.subject,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          maxParticipants: Number(formData.maxParticipants),
          meetingLink: meetingLink || undefined,
          meetingProvider: meetingLink ? 'google_meet' : undefined,
          meetingId: meetingId || undefined,
          meetingCode: meetingCode || undefined,
        };

        if (editId) {
          await api.patch(`/v1/tutor/sessions/${editId}`, payload);
          navigate('/dashboard-tutor/sessions');
        } else {
          const createdSession = await api.post('/v1/tutor/sessions', payload);
          const createdPayload = createdSession?.data || createdSession;
          const createdId = createdPayload?._id || createdPayload?.id;
          if (createdId) {
            navigate(`/session/${createdId}`);
          } else {
            navigate('/dashboard-tutor/sessions');
          }
        }
      } catch (err) {
        console.error('Failed to save session:', err);
        setApiError(err.message || 'Failed to save session. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
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

  const handleGoogleMeetConnect = async () => {
    try {
      setGoogleMeetLoading(true);
      setGoogleMeetError('');
      // Call /oauth/start via axios (with auth cookie) to get the URL with tutorId in state
      const response = await api.get('/v1/tutor/google-meet/oauth/start', {
        params: { redirect: window.location.href }
      });
      const payload = response?.data || response;
      const data = payload?.data || payload;
      const authUrl = data?.url;
      if (!authUrl) {
        setGoogleMeetError('Failed to get Google authorization URL.');
        return;
      }
      // Now redirect the browser to the Google consent page
      window.location.assign(authUrl);
    } catch (error) {
      console.error('Google Meet connect error:', error);
      setGoogleMeetError(error?.response?.data?.error?.message || error.message || 'Failed to start Google authorization.');
    } finally {
      setGoogleMeetLoading(false);
    }
  };

  const handleGoogleMeetRefresh = async () => {
    try {
      setGoogleMeetLoading(true);
      setGoogleMeetError('');
      await refreshGoogleMeetAuth();
      const status = await getGoogleMeetAuthStatus();
      setGoogleMeetStatus({
        connected: status.connected,
        expiresAt: status.expiresAt,
        scopes: status.scopes || [],
      });
    } catch (error) {
      setGoogleMeetError(error.message || 'Unable to refresh Google Meet token.');
    } finally {
      setGoogleMeetLoading(false);
    }
  };

  const handleGoogleMeetDisconnect = async () => {
    try {
      setGoogleMeetLoading(true);
      setGoogleMeetError('');
      await revokeGoogleMeetAuth();
      setGoogleMeetStatus({ connected: false, expiresAt: null, scopes: [] });
    } catch (error) {
      setGoogleMeetError(error.message || 'Unable to disconnect Google Meet.');
    } finally {
      setGoogleMeetLoading(false);
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
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Accessibility Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-lg z-50"
      >
        Skip to main content
      </a>

      {/* Header */}
      <header className="border-b" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/dashboard-tutor"
                className="flex items-center space-x-2 transition"
                style={{ color: 'var(--text-secondary)' }}
                aria-label="Back to dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back to Dashboard</span>
              </Link>
            </div>
            <div className="flex items-center space-x-3">
              <div className="hidden md:block">
                <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>{editId ? 'Editing' : 'Creating'} session as:</span>
                <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-sm font-medium">
                  {user?.name || 'Tutor'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {isLoading ? (
        <main id="main-content" className="container mx-auto px-6 py-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-lg font-medium" style={{ color: 'var(--text-secondary)' }}>Loading session...</p>
          </div>
        </main>
      ) : (
        <main id="main-content" className="container mx-auto px-6 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                {editId ? 'Edit Learning Session' : 'Create Learning Session'}
              </h1>
              <p style={{ color: 'var(--text-secondary)' }}>
                {editId ? 'Update your session details' : 'Design an accessible, engaging learning experience for your students'}
              </p>
            </div>

            {apiError && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-3 text-red-700 dark:text-red-400">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-sm font-medium">{apiError}</p>
              </div>
            )}

            {/* Form Card */}
            <div className="rounded-2xl shadow-sm border overflow-hidden"
              style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
              <div className="p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Basic Information Section */}
                  <section aria-labelledby="basic-info-heading">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h2 id="basic-info-heading" className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                        Basic Information
                      </h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Title */}
                      <div className="md:col-span-2">
                        <label htmlFor="title" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                          Session Title *
                        </label>
                        <input
                          id="title"
                          name="title"
                          type="text"
                          value={formData.title}
                          onChange={handleChange}
                          className={`w-full px-4 py-3 rounded-lg border ${errors.title ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500' : 'focus:border-blue-500 focus:ring-2 focus:ring-blue-500'} focus:outline-none transition-all`}
                          style={{ backgroundColor: 'var(--input-bg)', color: 'var(--input-text)', borderColor: 'var(--input-border)' }}
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
                        <label htmlFor="description" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                          Description *
                        </label>
                        <textarea
                          id="description"
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          rows="4"
                          className={`w-full px-4 py-3 rounded-lg border ${errors.description ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500' : 'focus:border-blue-500 focus:ring-2 focus:ring-blue-500'} focus:outline-none transition-all`}
                          style={{ backgroundColor: 'var(--input-bg)', color: 'var(--input-text)', borderColor: 'var(--input-border)' }}
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
                        <label htmlFor="subject" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                          Subject *
                        </label>
                        <input
                          id="subject"
                          name="subject"
                          type="text"
                          value={formData.subject}
                          onChange={handleChange}
                          className={`w-full px-4 py-3 rounded-lg border ${errors.subject ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500' : 'focus:border-blue-500 focus:ring-2 focus:ring-blue-500'} focus:outline-none transition-all`}
                          style={{ backgroundColor: 'var(--input-bg)', color: 'var(--input-text)', borderColor: 'var(--input-border)' }}
                          placeholder="e.g., Mathematics"
                          aria-required="true"
                          aria-invalid={!!errors.subject}
                          aria-describedby={errors.subject ? 'subject-error' : undefined}
                        />
                        {errors.subject && (
                          <p id="subject-error" className="mt-2 text-sm text-red-600 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {errors.subject}
                          </p>
                        )}
                      </div>
                    </div>
                  </section>

                  {/* Scheduling Section */}
                  <section aria-labelledby="scheduling-heading" className="pt-8 border-t" style={{ borderColor: 'var(--card-border)' }}>
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h2 id="scheduling-heading" className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                        Scheduling
                      </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                      {/* Date */}
                      <div>
                        <label htmlFor="date" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
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
                            className={`w-full pl-12 pr-4 py-3 rounded-lg border ${errors.date ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500' : 'focus:border-blue-500 focus:ring-2 focus:ring-blue-500'} focus:outline-none transition-all`}
                            style={{ backgroundColor: 'var(--input-bg)', color: 'var(--input-text)', borderColor: 'var(--input-border)' }}
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
                        <label htmlFor="time" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
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
                            className={`w-full pl-12 pr-4 py-3 rounded-lg border ${errors.time ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500' : 'focus:border-blue-500 focus:ring-2 focus:ring-blue-500'} focus:outline-none transition-all`}
                            style={{ backgroundColor: 'var(--input-bg)', color: 'var(--input-text)', borderColor: 'var(--input-border)' }}
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
                        <label htmlFor="duration" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
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
                            className={`w-full pl-12 pr-4 py-3 rounded-lg border ${errors.duration ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500' : 'focus:border-blue-500 focus:ring-2 focus:ring-blue-500'} focus:outline-none transition-all`}
                            style={{ backgroundColor: 'var(--input-bg)', color: 'var(--input-text)', borderColor: 'var(--input-border)' }}
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
                      </div>
                    </div>
                  </section>

                  {featureFlags.googleMeet && (
                    <section aria-labelledby="google-meet-heading" className="pt-8 border-t" style={{ borderColor: 'var(--card-border)' }}>
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                          <Video className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h2 id="google-meet-heading" className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                            Google Meet
                          </h2>
                          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                            Connect once to generate secure Meet links for video sessions.
                          </p>
                        </div>
                      </div>

                      <GoogleMeetAuthPanel
                        connected={googleMeetStatus.connected}
                        expiresAt={googleMeetStatus.expiresAt}
                        loading={googleMeetLoading}
                        error={googleMeetError}
                        onConnect={handleGoogleMeetConnect}
                        onRefresh={handleGoogleMeetRefresh}
                        onDisconnect={handleGoogleMeetDisconnect}
                      />

                      <div className="grid md:grid-cols-2 gap-6 mt-6">
                        <div>
                          <label htmlFor="studentId" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                            Student ID {formData.sessionType === 'video' && formData.enableGoogleMeet ? '*' : ''}
                          </label>
                          <input
                            id="studentId"
                            name="studentId"
                            type="text"
                            value={formData.studentId}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 rounded-lg border ${errors.studentId ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500' : 'focus:border-blue-500 focus:ring-2 focus:ring-blue-500'} focus:outline-none transition-all`}
                            style={{ backgroundColor: 'var(--input-bg)', color: 'var(--input-text)', borderColor: 'var(--input-border)' }}
                            placeholder="MongoDB ObjectId"
                            aria-invalid={!!errors.studentId}
                            aria-describedby={errors.studentId ? 'studentId-error' : undefined}
                          />
                          {errors.studentId && (
                            <p id="studentId-error" className="mt-2 text-sm text-red-600 flex items-center">
                              <AlertCircle className="w-4 h-4 mr-1" />
                              {errors.studentId}
                            </p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="meetingLink" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                            Meeting Link (optional)
                          </label>
                          <input
                            id="meetingLink"
                            name="meetingLink"
                            type="url"
                            value={formData.meetingLink}
                            onChange={handleChange}
                            disabled={formData.enableGoogleMeet && formData.sessionType === 'video'}
                            className="w-full px-4 py-3 rounded-lg border focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all disabled:opacity-60"
                            style={{ backgroundColor: 'var(--input-bg)', color: 'var(--input-text)', borderColor: 'var(--input-border)' }}
                            placeholder="https://meet.google.com/..."
                          />
                          <p className="text-xs mt-2" style={{ color: 'var(--text-tertiary)' }}>
                            Provide a link only when Google Meet auto-generation is disabled.
                          </p>
                        </div>
                      </div>

                      <div className="mt-6 flex items-center justify-between gap-4 rounded-lg border p-4" style={{ borderColor: 'var(--card-border)' }}>
                        <div>
                          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Generate Google Meet link</p>
                          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                            Available for video sessions and requires a connected Google account.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, enableGoogleMeet: !prev.enableGoogleMeet }))}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.enableGoogleMeet ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                          aria-pressed={formData.enableGoogleMeet}
                          aria-label="Toggle Google Meet auto-generation"
                          disabled={formData.sessionType !== 'video'}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.enableGoogleMeet ? 'translate-x-6' : 'translate-x-1'}`}
                          />
                        </button>
                      </div>
                    </section>
                  )}

                  {/* Session Details Section */}
                  <section aria-labelledby="details-heading" className="pt-8 border-t" style={{ borderColor: 'var(--card-border)' }}>
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h2 id="details-heading" className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                        Session Details
                      </h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Max Participants */}
                      <div>
                        <label htmlFor="maxParticipants" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
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
                            className={`w-full pl-12 pr-4 py-3 rounded-lg border ${errors.maxParticipants ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500' : 'focus:border-blue-500 focus:ring-2 focus:ring-blue-500'} focus:outline-none transition-all`}
                            style={{ backgroundColor: 'var(--input-bg)', color: 'var(--input-text)', borderColor: 'var(--input-border)' }}
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
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                          Session Format *
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, sessionType: 'video' }))}
                            className={`p-4 rounded-lg border transition-all flex flex-col items-center gap-2 ${formData.sessionType === 'video' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-300 dark:border-slate-700 hover:border-slate-400'}`}
                            style={{ color: 'var(--text-primary)' }}
                            aria-pressed={formData.sessionType === 'video'}
                          >
                            <Video className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            <div className="text-sm font-medium">Video Call</div>
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, sessionType: 'text' }))}
                            className={`p-4 rounded-lg border transition-all flex flex-col items-center gap-2 ${formData.sessionType === 'text' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-300 dark:border-slate-700 hover:border-slate-400'}`}
                            style={{ color: 'var(--text-primary)' }}
                            aria-pressed={formData.sessionType === 'text'}
                          >
                            <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            <div className="text-sm font-medium">Text-Based</div>
                          </button>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Accessibility Features Section */}
                  <section aria-labelledby="accessibility-heading" className="pt-8 border-t" style={{ borderColor: 'var(--card-border)' }}>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                          <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h2 id="accessibility-heading" className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                            Accessibility Features
                          </h2>
                          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                            Make your session inclusive for all learners
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {accessibilityFeatures.map((feature) => (
                        <label
                          key={feature.id}
                          className={`flex items-start p-4 rounded-lg border cursor-pointer transition-all ${formData.accessibilityFeatures[feature.id] ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-300 dark:border-slate-700 hover:border-slate-400'}`}
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
                              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                                {feature.label}
                              </span>
                              {formData.accessibilityFeatures[feature.id] && (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                              )}
                            </div>
                            <p id={`${feature.id}-description`} className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                              {feature.description}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </section>

                  {/* Form Actions */}
                  <div className="pt-8 border-t" style={{ borderColor: 'var(--card-border)' }}>
                    <div className="flex flex-col-reverse md:flex-row md:items-center md:justify-between gap-4">
                      <div className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                        <p className="flex items-center">
                          <HelpCircle className="w-4 h-4 mr-2" />
                          Fields marked with * are required
                        </p>
                      </div>

                      <div className="flex space-x-4">
                        <button
                          type="button"
                          onClick={() => navigate('/dashboard-tutor')}
                          className="px-6 py-3 border rounded-lg transition-colors font-medium"
                          style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
                          disabled={isSubmitting}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all font-medium shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin mr-2" />
                              {editId ? 'Saving Changes...' : 'Creating Session...'}
                            </>
                          ) : (
                            <>
                              <Save className="w-5 h-5 mr-2" />
                              {editId ? 'Save Changes' : 'Create Session'}
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
      )}
    </div>
  );
};

export default CreateSessionPage;
