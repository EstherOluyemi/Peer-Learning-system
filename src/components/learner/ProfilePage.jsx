// src/components/learner/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import {
    User, Mail, Calendar, Star, BookOpen, Clock, TrendingUp,
    Edit, Upload, Save, Shield, Globe, Settings,
    ChevronRight, ChevronLeft, Plus, Users, Award, AlertCircle,
    Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const ProfilePage = () => {
    const { user, updateUser } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    const [profile, setProfile] = useState({
        name: user?.name || "",
        email: user?.email || "",
        bio: user?.bio || "",
        major: user?.major || "Not specified",
        university: user?.university || "Not specified",
        year: user?.year || "Not specified",
        skills: user?.skills || [],
        interests: user?.interests || [],
        joinedDate: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "Recently",
        totalSessions: 0,
        averageRating: 0,
        completedHours: 0,
        badges: user?.badges || []
    });

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                setLoading(true);
                // Fetch extra progress/stats data
                const response = await api.get('/v1/learner/me/progress');
                const progressData = response.data || {};
                
                setProfile(prev => ({
                    ...prev,
                    name: user?.name || prev.name,
                    email: user?.email || prev.email,
                    bio: user?.bio || prev.bio,
                    totalSessions: progressData.totalSessions || 0,
                    averageRating: progressData.avgRating || 0,
                    completedHours: progressData.completedHours || 0,
                    badges: user?.badges || progressData.badges || []
                }));
            } catch (err) {
                console.error("Failed to fetch extended profile data:", err);
                // We don't block the UI if extended data fails, just use user context
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchProfileData();
        }
    }, [user]);

    const handleProfileChange = (field, value) => {
        setProfile(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveProfile = async () => {
        try {
            setSaving(true);
            setError(null);
            
            const response = await api.patch('/v1/learner/me', {
                name: profile.name,
                bio: profile.bio,
                major: profile.major,
                university: profile.university,
                year: profile.year,
                skills: profile.skills,
                interests: profile.interests
            });
            
            updateUser(response.data.user);
            setSuccessMessage('Profile updated successfully!');
            setIsEditing(false);
            
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const addSkill = () => {
        if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
            setProfile(prev => ({
                ...prev,
                skills: [...prev.skills, newSkill.trim()]
            }));
            setNewSkill('');
        }
    };

    const removeSkill = (skillToRemove) => {
        setProfile(prev => ({
            ...prev,
            skills: prev.skills.filter(skill => skill !== skillToRemove)
        }));
    };

    const addInterest = () => {
        if (newInterest.trim() && !profile.interests.includes(newInterest.trim())) {
            setProfile(prev => ({
                ...prev,
                interests: [...prev.interests, newInterest.trim()]
            }));
            setNewInterest('');
        }
    };

    const removeInterest = (interestToRemove) => {
        setProfile(prev => ({
            ...prev,
            interests: prev.interests.filter(interest => interest !== interestToRemove)
        }));
    };

    const [newSkill, setNewSkill] = useState('');
    const [newInterest, setNewInterest] = useState('');

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                <p className="text-lg font-medium" style={{ color: 'var(--text-secondary)' }}>Loading profile...</p>
            </div>
        );
    }

    const tabs = [
        { id: 'overview', label: 'Overview', icon: User },
        { id: 'education', label: 'Education', icon: BookOpen },
        { id: 'progress', label: 'Progress', icon: TrendingUp },
        { id: 'badges', label: 'Achievements', icon: Award },
        { id: 'settings', label: 'Settings', icon: Settings }
    ];

    const renderOverviewTab = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="p-6 rounded-2xl shadow-sm border"
                        style={{
                            backgroundColor: 'var(--card-bg)',
                            borderColor: 'var(--card-border)'
                        }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Profile Information</h3>
                            <button
                                onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                                disabled={saving}
                                className="flex items-center gap-2 px-3 py-1.5 text-blue-600 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors disabled:opacity-50"
                            >
                                {saving ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Edit className="w-4 h-4" />
                                )}
                                {isEditing ? 'Save' : 'Edit'}
                            </button>
                        </div>
                        
                        {error && (
                            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-2 text-red-700 dark:text-red-400 text-sm">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </div>
                        )}
                        
                        {successMessage && (
                            <div className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-center gap-2 text-green-700 dark:text-green-400 text-sm">
                                <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center text-white">✓</div>
                                {successMessage}
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Full Name</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={profile.name}
                                        onChange={(e) => handleProfileChange('name', e.target.value)}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
                                        style={{
                                            backgroundColor: 'var(--input-bg)',
                                            color: 'var(--input-text)',
                                            borderColor: 'var(--input-border)'
                                        }}
                                    />
                                ) : (
                                    <p className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-primary)' }}>
                                        {profile.name}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Email Address</label>
                                {isEditing ? (
                                    <input
                                        type="email"
                                        value={profile.email}
                                        onChange={(e) => handleProfileChange('email', e.target.value)}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
                                        style={{
                                            backgroundColor: 'var(--input-bg)',
                                            color: 'var(--input-text)',
                                            borderColor: 'var(--input-border)'
                                        }}
                                    />
                                ) : (
                                    <p className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-primary)' }}>
                                        {profile.email}
                                    </p>
                                )}
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Bio</label>
                                {isEditing ? (
                                    <textarea
                                        value={profile.bio}
                                        onChange={(e) => handleProfileChange('bio', e.target.value)}
                                        rows={4}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
                                        style={{
                                            backgroundColor: 'var(--input-bg)',
                                            color: 'var(--input-text)',
                                            borderColor: 'var(--input-border)'
                                        }}
                                    />
                                ) : (
                                    <p className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-primary)' }}>
                                        {profile.bio}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl shadow-sm border"
                        style={{
                            backgroundColor: 'var(--card-bg)',
                            borderColor: 'var(--card-border)'
                        }}
                    >
                        <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Skills</h3>
                        <div className="space-y-4">
                            <div className="flex gap-2">
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
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {profile.skills.map(skill => (
                                    <span key={skill} className="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                        {skill}
                                        <button onClick={() => removeSkill(skill)} className="ml-1">
                                            <Edit className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl shadow-sm border"
                        style={{
                            backgroundColor: 'var(--card-bg)',
                            borderColor: 'var(--card-border)'
                        }}
                    >
                        <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Interests</h3>
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newInterest}
                                    onChange={(e) => setNewInterest(e.target.value)}
                                    placeholder="Add an interest..."
                                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
                                    style={{
                                        backgroundColor: 'var(--input-bg)',
                                        color: 'var(--input-text)',
                                        borderColor: 'var(--input-border)'
                                    }}
                                />
                                <button
                                    onClick={addInterest}
                                    disabled={!newInterest.trim()}
                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {profile.interests.map(interest => (
                                    <span key={interest} className="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                        {interest}
                                        <button onClick={() => removeInterest(interest)} className="ml-1">
                                            <Edit className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="p-6 rounded-2xl shadow-sm border"
                        style={{
                            backgroundColor: 'var(--card-bg)',
                            borderColor: 'var(--card-border)'
                        }}
                    >
                        <div className="text-center">
                            <img
                                src={`https://ui-avatars.com/api/?name=${profile.name || 'User'}&background=random`}
                                alt="Profile"
                                className="w-24 h-24 rounded-full mx-auto mb-4 border-4"
                                style={{ borderColor: 'var(--border-color)' }}
                            />
                            <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{profile.name}</h3>
                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{profile.major} Student</p>
                            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>@{profile.university}</p>
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl shadow-sm border"
                        style={{
                            backgroundColor: 'var(--card-bg)',
                            borderColor: 'var(--card-border)'
                        }}
                    >
                        <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Quick Stats</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span style={{ color: 'var(--text-secondary)' }}>Total Sessions</span>
                                <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{profile.totalSessions}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span style={{ color: 'var(--text-secondary)' }}>Average Rating</span>
                                <span className="font-bold text-yellow-600">★ {profile.averageRating}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span style={{ color: 'var(--text-secondary)' }}>Hours Completed</span>
                                <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{profile.completedHours}h</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span style={{ color: 'var(--text-secondary)' }}>Member Since</span>
                                <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{profile.joinedDate}</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl shadow-sm border"
                        style={{
                            backgroundColor: 'var(--card-bg)',
                            borderColor: 'var(--card-border)'
                        }}
                    >
                        <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Account Actions</h3>
                        <div className="space-y-3">
                            <button className="w-full text-left p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                <div className="flex items-center justify-between">
                                    <span style={{ color: 'var(--text-primary)' }}>Privacy Settings</span>
                                    <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                                </div>
                            </button>
                            <button className="w-full text-left p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                <div className="flex items-center justify-between">
                                    <span style={{ color: 'var(--text-primary)' }}>Notification Preferences</span>
                                    <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                                </div>
                            </button>
                            <button className="w-full text-left p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                <div className="flex items-center justify-between">
                                    <span style={{ color: 'var(--text-primary)' }}>Download Data</span>
                                    <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderEducationTab = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl shadow-sm border"
                    style={{
                        backgroundColor: 'var(--card-bg)',
                        borderColor: 'var(--card-border)'
                    }}
                >
                    <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Education</h3>
                    <div className="space-y-4">
                        <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-hover)' }}>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                    <BookOpen className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{profile.university}</div>
                                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{profile.major}</div>
                                    <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Year {profile.year}</div>
                                </div>
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
                    <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Academic Goals</h3>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                            <span style={{ color: 'var(--text-primary)' }}>Complete Web Development Specialization</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            <span style={{ color: 'var(--text-primary)' }}>Build 5 Personal Projects</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                            <span style={{ color: 'var(--text-primary)' }}>Achieve 4.5+ Average Rating</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderProgressTab = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl shadow-sm border"
                    style={{
                        backgroundColor: 'var(--card-bg)',
                        borderColor: 'var(--card-border)'
                    }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{profile.totalSessions}</div>
                            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total Sessions</div>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>
                <div className="p-6 rounded-2xl shadow-sm border"
                    style={{
                        backgroundColor: 'var(--card-bg)',
                        borderColor: 'var(--card-border)'
                    }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-yellow-600">★ {profile.averageRating}</div>
                            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Average Rating</div>
                        </div>
                        <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                            <Star className="w-6 h-6 text-yellow-600" />
                        </div>
                    </div>
                </div>
                <div className="p-6 rounded-2xl shadow-sm border"
                    style={{
                        backgroundColor: 'var(--card-bg)',
                        borderColor: 'var(--card-border)'
                    }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{profile.completedHours}h</div>
                            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Hours Completed</div>
                        </div>
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                            <Clock className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl shadow-sm border"
                    style={{
                        backgroundColor: 'var(--card-bg)',
                        borderColor: 'var(--card-border)'
                    }}
                >
                    <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Learning Progress</h3>
                    <div className="space-y-4">
                        {[
                            { skill: 'JavaScript', progress: 85, color: 'bg-blue-500' },
                            { skill: 'React', progress: 70, color: 'bg-green-500' },
                            { skill: 'Python', progress: 60, color: 'bg-purple-500' },
                            { skill: 'Node.js', progress: 45, color: 'bg-orange-500' }
                        ].map((item, index) => (
                            <div key={index}>
                                <div className="flex justify-between items-center mb-2">
                                    <span style={{ color: 'var(--text-primary)' }}>{item.skill}</span>
                                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.progress}%</span>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                    <div className={`h-2 rounded-full ${item.color}`} style={{ width: `${item.progress}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-6 rounded-2xl shadow-sm border"
                    style={{
                        backgroundColor: 'var(--card-bg)',
                        borderColor: 'var(--card-border)'
                    }}
                >
                    <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Recent Activity</h3>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                <BookOpen className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                                <div className="font-medium" style={{ color: 'var(--text-primary)' }}>Completed React Workshop</div>
                                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>2 days ago</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                <Star className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                                <div className="font-medium" style={{ color: 'var(--text-primary)' }}>Left 5-star review</div>
                                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>1 week ago</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                                <Users className="w-4 h-4 text-purple-600" />
                            </div>
                            <div>
                                <div className="font-medium" style={{ color: 'var(--text-primary)' }}>Joined Group Study</div>
                                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>2 weeks ago</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderBadgesTab = () => (
        <div className="space-y-6">
            <div className="p-6 rounded-2xl shadow-sm border"
                style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--card-border)'
                }}
            >
                <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Achievement Badges</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {profile.badges.map((badge, index) => (
                        <div key={index} className="p-4 rounded-lg border text-center"
                            style={{
                                borderColor: 'var(--border-color)',
                                backgroundColor: 'var(--bg-hover)'
                            }}
                        >
                            <div className="w-12 h-12 bg-linear-to-br from-yellow-400 to-orange-500 rounded-full mx-auto mb-3 flex items-center justify-center">
                                <Award className="w-6 h-6 text-white" />
                            </div>
                            <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{badge}</div>
                            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Achieved</div>
                        </div>
                    ))}
                    <div className="p-4 rounded-lg border text-center border-dashed"
                        style={{
                            borderColor: 'var(--border-color)',
                            backgroundColor: 'var(--bg-hover)'
                        }}
                    >
                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full mx-auto mb-3 flex items-center justify-center">
                            <Plus className="w-6 h-6 text-slate-400" />
                        </div>
                        <div className="font-medium" style={{ color: 'var(--text-primary)' }}>More Badges</div>
                        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Keep Learning</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl shadow-sm border"
                    style={{
                        backgroundColor: 'var(--card-bg)',
                        borderColor: 'var(--card-border)'
                    }}
                >
                    <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Next Goals</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-lg"
                            style={{ backgroundColor: 'var(--bg-hover)' }}
                        >
                            <div>
                                <div className="font-medium" style={{ color: 'var(--text-primary)' }}>Complete 30 Sessions</div>
                                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>5 more to go</div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Next Badge</div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg"
                            style={{ backgroundColor: 'var(--bg-hover)' }}
                        >
                            <div>
                                <div className="font-medium" style={{ color: 'var(--text-primary)' }}>Maintain 4.5+ Rating</div>
                                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Current: 4.8</div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Elite Learner</div>
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
                    <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Learning Streak</h3>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">7</div>
                        <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Days in a row</div>
                        <div className="mt-4 flex justify-center gap-2">
                            {[...Array(7)].map((_, i) => (
                                <div key={i} className="w-8 h-8 bg-blue-500 rounded-lg"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderSettingsTab = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl shadow-sm border"
                    style={{
                        backgroundColor: 'var(--card-bg)',
                        borderColor: 'var(--card-border)'
                    }}
                >
                    <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Account Settings</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-medium" style={{ color: 'var(--text-primary)' }}>Email Notifications</div>
                                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Receive updates about your sessions</div>
                            </div>
                            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200 dark:bg-slate-700 transition-colors">
                                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-medium" style={{ color: 'var(--text-primary)' }}>Session Reminders</div>
                                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Get notified before sessions</div>
                            </div>
                            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors">
                                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-medium" style={{ color: 'var(--text-primary)' }}>Profile Visibility</div>
                                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Control who can see your profile</div>
                            </div>
                            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200 dark:bg-slate-700 transition-colors">
                                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-6 rounded-2xl shadow-sm border"
                    style={{
                        backgroundColor: 'var(--card-bg)',
                        borderColor: 'var(--card-border)'
                    }}
                >
                    <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Privacy & Security</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-medium" style={{ color: 'var(--text-primary)' }}>Two-Factor Authentication</div>
                                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Add extra security to your account</div>
                            </div>
                            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200 dark:bg-slate-700 transition-colors">
                                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-medium" style={{ color: 'var(--text-primary)' }}>Active Sessions</div>
                                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Manage your active logins</div>
                            </div>
                            <button className="px-3 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                View
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-medium" style={{ color: 'var(--text-primary)' }}>Download Data</div>
                                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Export your learning data</div>
                            </div>
                            <button className="px-3 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                Download
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview': return renderOverviewTab();
            case 'education': return renderEducationTab();
            case 'progress': return renderProgressTab();
            case 'badges': return renderBadgesTab();
            case 'settings': return renderSettingsTab();
            default: return renderOverviewTab();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Profile</h1>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Manage your learner profile and settings.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-medium transition-colors hover:bg-slate-50 dark:hover:bg-slate-800">
                        <Shield className="w-5 h-5" />
                        Privacy Settings
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-lg shadow-blue-500/30 transition-all active:scale-95">
                        <Save className="w-5 h-5" />
                        Save Changes
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1">
                    <div className="p-6 rounded-2xl shadow-sm border"
                        style={{
                            backgroundColor: 'var(--card-bg)',
                            borderColor: 'var(--card-border)'
                        }}
                    >
                        <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Profile Sections</h3>
                        <div className="space-y-2">
                            {tabs.map(tab => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${activeTab === tab.id
                                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                                            : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                                            }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span className="font-medium">{tab.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-3">
                    {renderTabContent()}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;