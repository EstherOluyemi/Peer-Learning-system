// src/components/learner/CreateSessionPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus, Calendar, Clock, Users, Star, Search, Filter, Save,
    ChevronLeft, ChevronRight, Eye, MessageSquare, Bookmark,
    TrendingUp, TrendingDown, MapPin, Video, BookOpen, X, Plus as PlusIcon,
    AlertCircle, Loader2
} from 'lucide-react';
import api from '../../services/api';

const CreateSessionPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        subject: '',
        description: '',
        tutor: '',
        tutorId: '',
        date: '',
        time: '',
        duration: '1.5',
        type: 'Group',
        level: 'Beginner',
        price: '',
        capacity: '10',
        location: 'Online',
        skills: [],
        requirements: ''
    });

    const [newSkill, setNewSkill] = useState('');
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [tutors, setTutors] = useState([]);

    const subjects = [
        'Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology',
        'English Literature', 'History', 'Geography', 'Economics', 'Business Studies'
    ];

    useEffect(() => {
        const fetchTutors = async () => {
            try {
                setLoading(true);
                // Filter tutors by subject if selected
                const endpoint = formData.subject 
                    ? `/v1/tutors?subject=${encodeURIComponent(formData.subject)}`
                    : '/v1/tutors';
                const response = await api.get(endpoint);
                setTutors(response.data || []);
            } catch (err) {
                console.error('Failed to fetch tutors:', err);
                setError('Failed to load tutors. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchTutors();
    }, [formData.subject]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleTutorSelect = (tutor) => {
        setFormData(prev => ({
            ...prev,
            tutor: tutor.name,
            tutorId: tutor.id,
            price: tutor.price || prev.price
        }));
    };

    const addSkill = () => {
        if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
            setFormData(prev => ({
                ...prev,
                skills: [...prev.skills, newSkill.trim()]
            }));
            setNewSkill('');
        }
    };

    const removeSkill = (skillToRemove) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.filter(skill => skill !== skillToRemove)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            setError(null);
            
            await api.post('/v1/learner/sessions', formData);
            
            // Redirect to sessions page on success
            navigate('/dashboard-learner/sessions');
        } catch (err) {
            console.error('Failed to create session:', err);
            setError(err.message || 'Failed to create session. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const renderStep1 = () => (
        <div className="space-y-6">
            <div className="p-6 rounded-2xl shadow-sm border"
                style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--card-border)'
                }}
            >
                <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Session Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Session Title</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => handleInputChange('title', e.target.value)}
                            placeholder="e.g., React Fundamentals Workshop"
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
                            style={{
                                backgroundColor: 'var(--input-bg)',
                                color: 'var(--input-text)',
                                borderColor: 'var(--input-border)'
                            }}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Subject</label>
                        <select
                            value={formData.subject}
                            onChange={(e) => handleInputChange('subject', e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
                            style={{
                                backgroundColor: 'var(--input-bg)',
                                color: 'var(--input-text)',
                                borderColor: 'var(--input-border)'
                            }}
                        >
                            <option value="">Select a subject</option>
                            {subjects.map(subject => (
                                <option key={subject} value={subject}>{subject}</option>
                            ))}
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            rows={4}
                            placeholder="Describe what this session will cover..."
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
                            style={{
                                backgroundColor: 'var(--input-bg)',
                                color: 'var(--input-text)',
                                borderColor: 'var(--input-border)'
                            }}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Session Type</label>
                        <select
                            value={formData.type}
                            onChange={(e) => handleInputChange('type', e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
                            style={{
                                backgroundColor: 'var(--input-bg)',
                                color: 'var(--input-text)',
                                borderColor: 'var(--input-border)'
                            }}
                        >
                            <option value="Group">Group Session</option>
                            <option value="1-on-1">1-on-1 Session</option>
                            <option value="Workshop">Workshop</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Level</label>
                        <select
                            value={formData.level}
                            onChange={(e) => handleInputChange('level', e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
                            style={{
                                backgroundColor: 'var(--input-bg)',
                                color: 'var(--input-text)',
                                borderColor: 'var(--input-border)'
                            }}
                        >
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="p-6 rounded-2xl shadow-sm border"
                style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--card-border)'
                }}
            >
                <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Scheduling</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Date</label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => handleInputChange('date', e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
                            style={{
                                backgroundColor: 'var(--input-bg)',
                                color: 'var(--input-text)',
                                borderColor: 'var(--input-border)'
                            }}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Time</label>
                        <input
                            type="time"
                            value={formData.time}
                            onChange={(e) => handleInputChange('time', e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
                            style={{
                                backgroundColor: 'var(--input-bg)',
                                color: 'var(--input-text)',
                                borderColor: 'var(--input-border)'
                            }}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Duration (hours)</label>
                        <input
                            type="number"
                            step="0.5"
                            min="0.5"
                            max="4"
                            value={formData.duration}
                            onChange={(e) => handleInputChange('duration', e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
                            style={{
                                backgroundColor: 'var(--input-bg)',
                                color: 'var(--input-text)',
                                borderColor: 'var(--input-border)'
                            }}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Location</label>
                        <select
                            value={formData.location}
                            onChange={(e) => handleInputChange('location', e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
                            style={{
                                backgroundColor: 'var(--input-bg)',
                                color: 'var(--input-text)',
                                borderColor: 'var(--input-border)'
                            }}
                        >
                            <option value="Online">Online</option>
                            <option value="In-Person">In-Person</option>
                            <option value="Hybrid">Hybrid</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="p-6 rounded-2xl shadow-sm border"
                style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--card-border)'
                }}
            >
                <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Skills & Requirements</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Skills</label>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                value={newSkill}
                                onChange={(e) => setNewSkill(e.target.value)}
                                placeholder="Add a skill..."
                                className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
                                style={{
                                    backgroundColor: 'var(--input-bg)',
                                    color: 'var(--input-text)',
                                    borderColor: 'var(--input-border)'
                                }}
                            />
                            <button
                                onClick={addSkill}
                                disabled={!newSkill.trim()}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <PlusIcon className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {formData.skills.map(skill => (
                                <span key={skill} className="inline-flex items-center gap-1 px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                    {skill}
                                    <button onClick={() => removeSkill(skill)} className="ml-1">
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Prerequisites</label>
                        <textarea
                            value={formData.requirements}
                            onChange={(e) => handleInputChange('requirements', e.target.value)}
                            rows={4}
                            placeholder="What should students know before attending?"
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
                            style={{
                                backgroundColor: 'var(--input-bg)',
                                color: 'var(--input-text)',
                                borderColor: 'var(--input-border)'
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-6">
            <div className="p-6 rounded-2xl shadow-sm border"
                style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--card-border)'
                }}
            >
                <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Select Tutor</h3>
                
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                        <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Finding available tutors...</p>
                    </div>
                ) : tutors.length > 0 ? (
                    <div className="space-y-4">
                        {tutors.map(tutor => (
                            <div
                                key={tutor.id}
                                onClick={() => handleTutorSelect(tutor)}
                                className={`p-4 rounded-lg border cursor-pointer transition-all ${formData.tutorId === tutor.id
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <img
                                            src={tutor.avatar || `https://ui-avatars.com/api/?name=${tutor.name}&background=random`}
                                            alt={tutor.name}
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                        <div>
                                            <h4 className="font-bold" style={{ color: 'var(--text-primary)' }}>{tutor.name}</h4>
                                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{tutor.specialization || tutor.subject || 'Expert Tutor'}</p>
                                            <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                                                <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-500 fill-amber-500" /> {tutor.rating || 'N/A'}</span>
                                                <span>${tutor.price || '0'}/hr</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                            formData.tutorId === tutor.id ? 'border-blue-500 bg-blue-500' : 'border-slate-300'
                                        }`}>
                                            {formData.tutorId === tutor.id && <div className="w-2 h-2 rounded-full bg-white" />}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>No tutors available for the selected subject.</p>
                    </div>
                )}
            </div>

            <div className="p-6 rounded-2xl shadow-sm border"
                style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--card-border)'
                }}
            >
                <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Session Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Price per Hour ($)</label>
                        <input
                            type="number"
                            min="0"
                            value={formData.price}
                            onChange={(e) => handleInputChange('price', e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
                            style={{
                                backgroundColor: 'var(--input-bg)',
                                color: 'var(--input-text)',
                                borderColor: 'var(--input-border)'
                            }}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Maximum Capacity</label>
                        <input
                            type="number"
                            min="1"
                            max="50"
                            value={formData.capacity}
                            onChange={(e) => handleInputChange('capacity', e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
                            style={{
                                backgroundColor: 'var(--input-bg)',
                                color: 'var(--input-text)',
                                borderColor: 'var(--input-border)'
                            }}
                        />
                    </div>
                </div>
            </div>

            <div className="p-6 rounded-2xl shadow-sm border"
                style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--card-border)'
                }}
            >
                <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Preview</h3>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-hover)' }}>
                            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Session Title</div>
                            <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{formData.title || 'Untitled Session'}</div>
                        </div>
                        <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-hover)' }}>
                            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Tutor</div>
                            <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{formData.tutor || 'Not selected'}</div>
                        </div>
                        <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-hover)' }}>
                            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Price</div>
                            <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                                ${formData.price || '0'}/hr
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-hover)' }}>
                            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Date & Time</div>
                            <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                                {formData.date && formData.time ? `${formData.date} at ${formData.time}` : 'Not set'}
                            </div>
                        </div>
                        <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-hover)' }}>
                            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Duration</div>
                            <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{formData.duration || '0'} hours</div>
                        </div>
                        <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-hover)' }}>
                            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Capacity</div>
                            <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{formData.capacity || '0'} students</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Request New Session</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Fill in the details to request a learning session from a tutor.</p>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-3 text-red-700 dark:text-red-400">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}>
                        1
                    </div>
                    <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Details</span>
                </div>
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700"></div>
                <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}>
                        2
                    </div>
                    <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Tutor & Settings</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3">
                    {step === 1 ? renderStep1() : renderStep2()}

                    <div className="flex justify-between mt-6">
                        <button
                            onClick={() => setStep(Math.max(1, step - 1))}
                            disabled={step === 1}
                            className="flex items-center gap-2 px-4 py-2 border rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                borderColor: 'var(--border-color)',
                                color: 'var(--text-secondary)',
                                backgroundColor: 'var(--bg-primary)'
                            }}
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Previous
                        </button>
                        {step === 1 ? (
                            <button
                                onClick={() => setStep(2)}
                                disabled={!formData.title || !formData.subject || !formData.description}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={submitting || !formData.tutorId}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Request Session
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="p-6 rounded-2xl shadow-sm border"
                        style={{
                            backgroundColor: 'var(--card-bg)',
                            borderColor: 'var(--card-border)'
                        }}
                    >
                        <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Quick Tips</h3>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 shrink-0"></div>
                                <div>
                                    <div className="font-medium" style={{ color: 'var(--text-primary)' }}>Be Specific</div>
                                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Clear titles and descriptions attract more students.</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-green-600 rounded-full mt-2 shrink-0"></div>
                                <div>
                                    <div className="font-medium" style={{ color: 'var(--text-primary)' }}>Set Realistic Prices</div>
                                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Research market rates for your subject and level.</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 shrink-0"></div>
                                <div>
                                    <div className="font-medium" style={{ color: 'var(--text-primary)' }}>Choose the Right Level</div>
                                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Make sure your session matches the skill level.</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl shadow-sm border"
                        style={{
                            backgroundColor: 'var(--card-bg)',
                            borderColor: 'var(--card-border)'
                        }}
                    >
                        <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Session Types</h3>
                        <div className="space-y-3">
                            <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-hover)' }}>
                                <div className="font-medium" style={{ color: 'var(--text-primary)' }}>Group Sessions</div>
                                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Up to 15 students, lower cost per student.</div>
                            </div>
                            <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-hover)' }}>
                                <div className="font-medium" style={{ color: 'var(--text-primary)' }}>1-on-1 Sessions</div>
                                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Personalized attention, higher cost.</div>
                            </div>
                            <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-hover)' }}>
                                <div className="font-medium" style={{ color: 'var(--text-primary)' }}>Workshops</div>
                                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Hands-on learning, longer duration.</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateSessionPage;