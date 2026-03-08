// src/components/tutor/CreateSessionPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import {
  ArrowLeft, Calendar, Clock, Users, BookOpen,
  Video, Save,
  AlertCircle, HelpCircle, Loader2, Copy, CheckCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { featureFlags } from '../../config/featureFlags';
import { createInstantGoogleMeetLink } from '../../services/googleMeetService';

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
    // REMOVED: studentId — not needed here. Sessions are created by the tutor.
    // Students enroll separately. The backend uses req.tutor._id as owner.
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(!!editId);
  const [apiError, setApiError] = useState(null);
  const [generatedMeetLink, setGeneratedMeetLink] = useState('');
  const [meetLinkLoading, setMeetLinkLoading] = useState(false);
  const [meetLinkCopied, setMeetLinkCopied] = useState(false);

  useEffect(() => {
    if (editId && location.state?.sessionData) {
      const session = location.state.sessionData;
      const startDate = new Date(session.startTime);
      const endDate = new Date(session.endTime);
      const durationMinutes = Math.round((endDate - startDate) / 60000);
      setFormData(prev => ({
        ...prev,
        title: session.title || '',
        description: session.description || '',
        subject: session.subject || '',
        date: startDate.toISOString().split('T')[0],
        time: startDate.toTimeString().slice(0, 5),
        duration: durationMinutes,
        maxParticipants: session.maxParticipants || 10,
        meetingLink: session.meetingLink || ''
      }));
      setIsLoading(false);
    } else if (editId) {
      const fetchSession = async () => {
        try {
          const response = await api.get(`/v1/tutor/sessions/${editId}`);
          const session = response?.data || response;
          const startDate = new Date(session.startTime);
          const endDate = new Date(session.endTime);
          const durationMinutes = Math.round((endDate - startDate) / 60000);
          setFormData(prev => ({
            ...prev,
            title: session.title || '',
            description: session.description || '',
            subject: session.subject || '',
            date: startDate.toISOString().split('T')[0],
            time: startDate.toTimeString().slice(0, 5),
            duration: durationMinutes,
            maxParticipants: session.maxParticipants || 10,
            meetingLink: session.meetingLink || ''
          }));
        } catch (err) {
          setApiError('Failed to load session. Please navigate back and try again.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchSession();
    }
  }, [editId, location.state?.sessionData]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Session title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.subject.trim()) newErrors.subject = 'Please enter a subject';
    if (!formData.date) newErrors.date = 'Please select a date';
    if (!formData.time) newErrors.time = 'Please select a time';
    if (formData.duration < 15) newErrors.duration = 'Minimum duration is 15 minutes';
    if (formData.maxParticipants < 1) newErrors.maxParticipants = 'Minimum 1 participant';
    // REMOVED: studentId validation — no longer needed
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

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
      let meetingLink = formData.meetingLink?.trim();
      let meetingId;
      const shouldAttachGeneratedMeet = featureFlags.googleMeet && Boolean(generatedMeetLink);

      if (!editId && shouldAttachGeneratedMeet) {
        meetingLink = generatedMeetLink;
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
      };

      if (editId) {
        await api.patch(`/v1/tutor/sessions/${editId}`, payload);
        navigate('/dashboard-tutor/sessions', {
          state: { updatedSessionId: editId, message: 'Session updated successfully.' }
        });
      } else {
        const createdSession = await api.post('/v1/tutor/sessions', payload);
        const createdPayload = createdSession?.data || createdSession;
        // Unwrap nested data if needed: { success, data: { _id, ... } }
        const sessionData = createdPayload?.data || createdPayload;
        const createdId = sessionData?._id || sessionData?.id;
        navigate('/dashboard-tutor/sessions', {
          state: createdId
            ? { createdSessionId: createdId, message: 'Session created successfully.' }
            : { message: 'Session created successfully.' }
        });
      }
    } catch (err) {
      console.error('Failed to save session:', err);
      setApiError(err.message || 'Failed to save session. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleGenerateMeetLink = async () => {
    try {
      setMeetLinkLoading(true);
      setApiError(null);
      const meetingResponse = await createInstantGoogleMeetLink();
      const link = meetingResponse?.joinUrl;
      if (link) {
        setGeneratedMeetLink(link);
        setFormData(prev => ({ ...prev, meetingLink: link }));
      } else {
        setApiError('Failed to generate Google Meet link. Please try again.');
      }
    } catch (error) {
      console.error('Meet link generation error:', error);
      setApiError(error?.message || 'Failed to generate Google Meet link. Please try again.');
    } finally {
      setMeetLinkLoading(false);
    }
  };

  const handleCopyMeetLink = () => {
    if (generatedMeetLink) {
      navigator.clipboard.writeText(generatedMeetLink).then(() => {
        setMeetLinkCopied(true);
        setTimeout(() => setMeetLinkCopied(false), 2000);
      }).catch(err => {
        console.error('Failed to copy:', err);
      });
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-lg z-50">
        Skip to main content
      </a>

      <header className="border-b" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/dashboard-tutor" className="flex items-center space-x-2 transition" style={{ color: 'var(--text-secondary)' }} aria-label="Back to dashboard">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Dashboard</span>
            </Link>
            <div className="hidden md:block">
              <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>{editId ? 'Editing' : 'Creating'} session as:</span>
              <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-sm font-medium">
                {user?.name || 'Tutor'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {isLoading ? (
        <main id="main-content" className="container mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-lg font-medium" style={{ color: 'var(--text-secondary)' }}>Loading session...</p>
          </div>
        </main>
      ) : (
        <main id="main-content" className="container mx-auto px-4 sm:px-6 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
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

            <div className="rounded-2xl shadow-sm border overflow-hidden" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
              <div className="p-8">
                <form onSubmit={handleSubmit} className="space-y-8">

                  {/* Basic Information */}
                  <section aria-labelledby="basic-info-heading">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h2 id="basic-info-heading" className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Basic Information</h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label htmlFor="title" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Session Title *</label>
                        <input
                          id="title" name="title" type="text" value={formData.title} onChange={handleChange}
                          className={`w-full px-4 py-3 rounded-lg border ${errors.title ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500' : 'focus:border-blue-500 focus:ring-2 focus:ring-blue-500'} focus:outline-none transition-all`}
                          style={{ backgroundColor: 'var(--input-bg)', color: 'var(--input-text)', borderColor: 'var(--input-border)' }}
                          placeholder="e.g., Introduction to React Hooks"
                          aria-required="true" aria-invalid={!!errors.title}
                        />
                        {errors.title && <p className="mt-2 text-sm text-red-600 flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{errors.title}</p>}
                      </div>

                      <div className="md:col-span-2">
                        <label htmlFor="description" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Description *</label>
                        <textarea
                          id="description" name="description" value={formData.description} onChange={handleChange} rows="4"
                          className={`w-full px-4 py-3 rounded-lg border ${errors.description ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500' : 'focus:border-blue-500 focus:ring-2 focus:ring-blue-500'} focus:outline-none transition-all`}
                          style={{ backgroundColor: 'var(--input-bg)', color: 'var(--input-text)', borderColor: 'var(--input-border)' }}
                          placeholder="Describe what students will learn in this session..."
                          aria-required="true" aria-invalid={!!errors.description}
                        />
                        {errors.description && <p className="mt-2 text-sm text-red-600 flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{errors.description}</p>}
                      </div>

                      <div>
                        <label htmlFor="subject" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Subject *</label>
                        <input
                          id="subject" name="subject" type="text" value={formData.subject} onChange={handleChange}
                          className={`w-full px-4 py-3 rounded-lg border ${errors.subject ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500' : 'focus:border-blue-500 focus:ring-2 focus:ring-blue-500'} focus:outline-none transition-all`}
                          style={{ backgroundColor: 'var(--input-bg)', color: 'var(--input-text)', borderColor: 'var(--input-border)' }}
                          placeholder="e.g., Mathematics"
                          aria-required="true" aria-invalid={!!errors.subject}
                        />
                        {errors.subject && <p className="mt-2 text-sm text-red-600 flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{errors.subject}</p>}
                      </div>
                    </div>
                  </section>

                  {/* Scheduling */}
                  <section aria-labelledby="scheduling-heading" className="pt-8 border-t" style={{ borderColor: 'var(--card-border)' }}>
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h2 id="scheduling-heading" className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Scheduling</h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div>
                        <label htmlFor="date" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Date *</label>
                        <div className="relative">
                          <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                          <input
                            id="date" name="date" type="date" value={formData.date} onChange={handleChange}
                            min={new Date().toISOString().split('T')[0]}
                            className={`w-full pl-12 pr-4 py-3 rounded-lg border ${errors.date ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500' : 'focus:border-blue-500 focus:ring-2 focus:ring-blue-500'} focus:outline-none transition-all`}
                            style={{ backgroundColor: 'var(--input-bg)', color: 'var(--input-text)', borderColor: 'var(--input-border)' }}
                            aria-required="true"
                          />
                        </div>
                        {errors.date && <p className="mt-2 text-sm text-red-600 flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{errors.date}</p>}
                      </div>

                      <div>
                        <label htmlFor="time" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Time *</label>
                        <div className="relative">
                          <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                          <input
                            id="time" name="time" type="time" value={formData.time} onChange={handleChange}
                            className={`w-full pl-12 pr-4 py-3 rounded-lg border ${errors.time ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500' : 'focus:border-blue-500 focus:ring-2 focus:ring-blue-500'} focus:outline-none transition-all`}
                            style={{ backgroundColor: 'var(--input-bg)', color: 'var(--input-text)', borderColor: 'var(--input-border)' }}
                            aria-required="true"
                          />
                        </div>
                        {errors.time && <p className="mt-2 text-sm text-red-600 flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{errors.time}</p>}
                      </div>

                      <div>
                        <label htmlFor="duration" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Duration (minutes) *</label>
                        <div className="relative">
                          <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                          <input
                            id="duration" name="duration" type="number" min="15" max="240" step="15"
                            value={formData.duration} onChange={handleChange}
                            className={`w-full pl-12 pr-4 py-3 rounded-lg border ${errors.duration ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500' : 'focus:border-blue-500 focus:ring-2 focus:ring-blue-500'} focus:outline-none transition-all`}
                            style={{ backgroundColor: 'var(--input-bg)', color: 'var(--input-text)', borderColor: 'var(--input-border)' }}
                            aria-required="true"
                          />
                        </div>
                        {errors.duration && <p className="mt-2 text-sm text-red-600 flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{errors.duration}</p>}
                      </div>
                    </div>
                  </section>

                  {/* Google Meet */}
                  {featureFlags.googleMeet && (
                    <section aria-labelledby="google-meet-heading" className="pt-8 border-t" style={{ borderColor: 'var(--card-border)' }}>
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                          <Video className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h2 id="google-meet-heading" className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Google Meet</h2>
                          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                              Optionally generate a Meet link now. No redirect happens during session creation.
                          </p>
                        </div>
                      </div>

                      {/* Instant Google Meet Link Generator */}
                      <div className="rounded-xl border p-4 space-y-4" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                              Quick Google Meet Link
                            </p>
                            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                              Create an instant meeting link without any account connection
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={handleGenerateMeetLink}
                            disabled={meetLinkLoading}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                          >
                            {meetLinkLoading ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <Video className="w-4 h-4" />
                                Generate Link
                              </>
                            )}
                          </button>
                        </div>

                        {/* Display Generated Link */}
                        {generatedMeetLink && (
                          <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300 mb-1">
                                Meeting link generated
                              </p>
                              <p className="text-sm font-mono text-emerald-900 dark:text-emerald-100 truncate">
                                {generatedMeetLink}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={handleCopyMeetLink}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors shrink-0"
                              title="Copy to clipboard"
                            >
                              {meetLinkCopied ? (
                                <>
                                  <CheckCircle className="w-3.5 h-3.5" />
                                  Copied!
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  Copy
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="mt-6">
                        <label htmlFor="meetingLink" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                          Meeting Link (optional)
                        </label>
                        <input
                          id="meetingLink" name="meetingLink" type="url" value={formData.meetingLink} onChange={handleChange}
                          className="w-full px-4 py-3 rounded-lg border focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                          style={{ backgroundColor: 'var(--input-bg)', color: 'var(--input-text)', borderColor: 'var(--input-border)' }}
                          placeholder="https://meet.google.com/..."
                        />
                      </div>
                    </section>
                  )}

                  {/* Session Details */}
                  <section aria-labelledby="details-heading" className="pt-8 border-t" style={{ borderColor: 'var(--card-border)' }}>
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h2 id="details-heading" className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Session Details</h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="maxParticipants" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Maximum Participants *</label>
                        <div className="relative">
                          <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                          <input
                            id="maxParticipants" name="maxParticipants" type="number" min="1" max="50"
                            value={formData.maxParticipants} onChange={handleChange}
                            className={`w-full pl-12 pr-4 py-3 rounded-lg border ${errors.maxParticipants ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500' : 'focus:border-blue-500 focus:ring-2 focus:ring-blue-500'} focus:outline-none transition-all`}
                            style={{ backgroundColor: 'var(--input-bg)', color: 'var(--input-text)', borderColor: 'var(--input-border)' }}
                            aria-required="true"
                          />
                        </div>
                        {errors.maxParticipants && <p className="mt-2 text-sm text-red-600 flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{errors.maxParticipants}</p>}
                      </div>

                      <div className="rounded-lg border p-4" style={{ borderColor: 'var(--card-border)' }}>
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Session Communication</p>
                        <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                          Every session includes both a group chat and optional Google Meet link.
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* Form Actions */}
                  <div className="pt-8 border-t" style={{ borderColor: 'var(--card-border)' }}>
                    <div className="flex flex-col-reverse md:flex-row md:items-center md:justify-between gap-4">
                      <p className="text-sm flex items-center" style={{ color: 'var(--text-tertiary)' }}>
                        <HelpCircle className="w-4 h-4 mr-2" />
                        Fields marked with * are required
                      </p>
                      <div className="flex space-x-4">
                        <button
                          type="button" onClick={() => navigate('/dashboard-tutor')}
                          className="px-6 py-3 border rounded-lg transition-colors font-medium"
                          style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
                          disabled={isSubmitting}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit" disabled={isSubmitting}
                          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all font-medium shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
                        >
                          {isSubmitting ? (
                            <><Loader2 className="w-5 h-5 animate-spin mr-2" />{editId ? 'Saving Changes...' : 'Creating Session...'}</>
                          ) : (
                            <><Save className="w-5 h-5 mr-2" />{editId ? 'Save Changes' : 'Create Session'}</>
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
