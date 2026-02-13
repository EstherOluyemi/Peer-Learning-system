// src/components/learner/SettingsPage.jsx
import React, { useState, useEffect } from 'react';
import {
    Settings, User, Mail, Lock, Bell, CreditCard, Globe,
    Calendar, Clock, Shield, Eye, EyeOff, Save, Edit, Upload,
    TrendingUp, TrendingDown, MessageSquare, Star, Users,
    AlertCircle, Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const SettingsPage = () => {
    const { user, updateUser } = useAuth();
    const [activeTab, setActiveTab] = useState('account');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    const [profile, setProfile] = useState({
        name: user?.name || "",
        email: user?.email || "",
        bio: user?.bio || "",
        major: user?.major || "",
        university: user?.university || "",
        year: user?.year || "Freshman",
        notificationEmail: user?.email || "",
        pushNotifications: true,
        sessionReminders: true,
        newSessionAlerts: true,
        progressUpdates: true,
        timezone: "UTC+1 (Lagos)",
        studyHours: "9:00 AM - 6:00 PM",
        preferredDays: ["Monday", "Wednesday", "Friday"],
        maxSessionsPerWeek: 8,
        twoFactorAuth: true,
        passwordLastChanged: "1 month ago",
        activeSessions: 2
    });

    useEffect(() => {
        if (user) {
            setProfile(prev => ({
                ...prev,
                name: user.name || "",
                email: user.email || "",
                bio: user.bio || "",
                major: user.major || "",
                university: user.university || "",
                year: user.year || "Freshman",
                notificationEmail: user.email || ""
            }));
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
                year: profile.year
            });
            
            updateUser(response.data.user);
            setSuccessMessage('Profile updated successfully!');
            
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleNotificationToggle = (field) => {
        setProfile(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const tabs = [
        { id: 'account', label: 'Account', icon: User },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'preferences', label: 'Preferences', icon: Settings },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'privacy', label: 'Privacy', icon: Globe }
    ];

    const renderAccountTab = () => (
        <div className="space-y-6">
            <div className="p-6 rounded-2xl shadow-sm border"
                style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--card-border)'
                }}
            >
                <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Profile Information</h3>
                
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
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Email Address</label>
                        <input
                            type="email"
                            value={profile.email}
                            disabled
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all opacity-60 cursor-not-allowed"
                            style={{
                                backgroundColor: 'var(--input-bg)',
                                color: 'var(--input-text)',
                                borderColor: 'var(--input-border)'
                            }}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>University</label>
                        <input
                            type="text"
                            value={profile.university}
                            onChange={(e) => handleProfileChange('university', e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
                            style={{
                                backgroundColor: 'var(--input-bg)',
                                color: 'var(--input-text)',
                                borderColor: 'var(--input-border)'
                            }}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Major</label>
                        <input
                            type="text"
                            value={profile.major}
                            onChange={(e) => handleProfileChange('major', e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
                            style={{
                                backgroundColor: 'var(--input-bg)',
                                color: 'var(--input-text)',
                                borderColor: 'var(--input-border)'
                            }}
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Bio</label>
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
                    </div>
                </div>
                <div className="mt-4 flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition-colors hover:bg-slate-50 dark:hover:bg-slate-800">
                        <Upload className="w-4 h-4" />
                        Upload Photo
                    </button>
                </div>
            </div>

            <div className="p-6 rounded-2xl shadow-sm border"
                style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--card-border)'
                }}
            >
                <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Account Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Academic Year</label>
                        <select
                            value={profile.year}
                            onChange={(e) => handleProfileChange('year', e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
                            style={{
                                backgroundColor: 'var(--input-bg)',
                                color: 'var(--input-text)',
                                borderColor: 'var(--input-border)'
                            }}
                        >
                            <option value="Freshman">Freshman</option>
                            <option value="Sophomore">Sophomore</option>
                            <option value="Junior">Junior</option>
                            <option value="Senior">Senior</option>
                            <option value="Graduate">Graduate</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Notification Email</label>
                        <input
                            type="email"
                            value={profile.notificationEmail}
                            onChange={(e) => handleProfileChange('notificationEmail', e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
                            style={{
                                backgroundColor: 'var(--input-bg)',
                                color: 'var(--input-text)',
                                borderColor: 'var(--input-border)'
                            }}
                        />
                    </div>
                </div>
                <div className="mt-6 flex justify-end border-t pt-6" style={{ borderColor: 'var(--card-border)' }}>
                    <button 
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {saving ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Save className="w-5 h-5" />
                        )}
                        Save All Changes
                    </button>
                </div>
            </div>
        </div>
    );

    const renderNotificationsTab = () => (
        <div className="space-y-6">
            <div className="p-6 rounded-2xl shadow-sm border"
                style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--card-border)'
                }}
            >
                <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Email Notifications</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-medium" style={{ color: 'var(--text-primary)' }}>Session Reminders</div>
                            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Get notified before your scheduled sessions</div>
                        </div>
                        <button
                            onClick={() => handleNotificationToggle('sessionReminders')}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${profile.sessionReminders ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'
                                }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${profile.sessionReminders ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-medium" style={{ color: 'var(--text-primary)' }}>New Session Alerts</div>
                            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Notify when new sessions are available</div>
                        </div>
                        <button
                            onClick={() => handleNotificationToggle('newSessionAlerts')}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${profile.newSessionAlerts ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'
                                }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${profile.newSessionAlerts ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-medium" style={{ color: 'var(--text-primary)' }}>Progress Updates</div>
                            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Weekly progress reports and insights</div>
                        </div>
                        <button
                            onClick={() => handleNotificationToggle('progressUpdates')}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${profile.progressUpdates ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'
                                }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${profile.progressUpdates ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-medium" style={{ color: 'var(--text-primary)' }}>Push Notifications</div>
                            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Mobile and desktop notifications</div>
                        </div>
                        <button
                            onClick={() => handleNotificationToggle('pushNotifications')}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${profile.pushNotifications ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'
                                }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${profile.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
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
                <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Notification Preferences</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Preferred Notification Time</label>
                        <select
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
                            style={{
                                backgroundColor: 'var(--input-bg)',
                                color: 'var(--input-text)',
                                borderColor: 'var(--input-border)'
                            }}
                        >
                            <option>1 hour before</option>
                            <option>2 hours before</option>
                            <option>1 day before</option>
                            <option>Custom time</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Email Frequency</label>
                        <select
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
                            style={{
                                backgroundColor: 'var(--input-bg)',
                                color: 'var(--input-text)',
                                borderColor: 'var(--input-border)'
                            }}
                        >
                            <option>Real-time</option>
                            <option>Daily digest</option>
                            <option>Weekly summary</option>
                            <option>No emails</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderPreferencesTab = () => (
        <div className="space-y-6">
            <div className="p-6 rounded-2xl shadow-sm border"
                style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--card-border)'
                }}
            >
                <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Study Preferences</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Timezone</label>
                        <select
                            value={profile.timezone}
                            onChange={(e) => handleProfileChange('timezone', e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
                            style={{
                                backgroundColor: 'var(--input-bg)',
                                color: 'var(--input-text)',
                                borderColor: 'var(--input-border)'
                            }}
                        >
                            <option>UTC+1 (Lagos)</option>
                            <option>UTC+0 (GMT)</option>
                            <option>UTC-5 (EST)</option>
                            <option>UTC-8 (PST)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Preferred Study Hours</label>
                        <input
                            type="text"
                            value={profile.studyHours}
                            onChange={(e) => handleProfileChange('studyHours', e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
                            style={{
                                backgroundColor: 'var(--input-bg)',
                                color: 'var(--input-text)',
                                borderColor: 'var(--input-border)'
                            }}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Preferred Days</label>
                        <div className="space-y-2">
                            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => (
                                <label key={day} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={profile.preferredDays.includes(day)}
                                        onChange={() => {
                                            const newDays = profile.preferredDays.includes(day)
                                                ? profile.preferredDays.filter(d => d !== day)
                                                : [...profile.preferredDays, day];
                                            handleProfileChange('preferredDays', newDays);
                                        }}
                                        className="w-4 h-4 text-blue-600"
                                    />
                                    <span style={{ color: 'var(--text-primary)' }}>{day}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Max Sessions Per Week</label>
                        <input
                            type="number"
                            min="1"
                            max="20"
                            value={profile.maxSessionsPerWeek}
                            onChange={(e) => handleProfileChange('maxSessionsPerWeek', e.target.value)}
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
                <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Learning Preferences</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Preferred Session Types</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            {["Group", "1-on-1", "Workshop"].map(type => (
                                <label key={type} className="flex items-center gap-2 p-3 rounded-lg border cursor-pointer"
                                    style={{
                                        borderColor: 'var(--border-color)',
                                        backgroundColor: 'var(--bg-hover)'
                                    }}
                                >
                                    <input type="checkbox" className="w-4 h-4 text-blue-600" />
                                    <span style={{ color: 'var(--text-primary)' }}>{type} Sessions</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Learning Goals</label>
                        <div className="space-y-2">
                            {["Complete Certifications", "Build Projects", "Improve Grades", "Career Preparation"].map(goal => (
                                <label key={goal} className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" className="w-4 h-4 text-blue-600" />
                                    <span style={{ color: 'var(--text-primary)' }}>{goal}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderSecurityTab = () => (
        <div className="space-y-6">
            <div className="p-6 rounded-2xl shadow-sm border"
                style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--card-border)'
                }}
            >
                <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Security Settings</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-medium" style={{ color: 'var(--text-primary)' }}>Two-Factor Authentication</div>
                            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Add an extra layer of security to your account</div>
                        </div>
                        <button
                            onClick={() => handleNotificationToggle('twoFactorAuth')}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${profile.twoFactorAuth ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'
                                }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${profile.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-hover)' }}>
                            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Password Last Changed</div>
                            <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{profile.passwordLastChanged}</div>
                        </div>
                        <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-hover)' }}>
                            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Active Sessions</div>
                            <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{profile.activeSessions}</div>
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
                <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Password Management</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Current Password</label>
                        <div className="relative">
                            <input
                                type="password"
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
                                style={{
                                    backgroundColor: 'var(--input-bg)',
                                    color: 'var(--input-text)',
                                    borderColor: 'var(--input-border)'
                                }}
                            />
                            <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600">
                                <Eye className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>New Password</label>
                        <div className="relative">
                            <input
                                type="password"
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
                                style={{
                                    backgroundColor: 'var(--input-bg)',
                                    color: 'var(--input-text)',
                                    borderColor: 'var(--input-border)'
                                }}
                            />
                            <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600">
                                <Eye className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Confirm New Password</label>
                        <div className="relative">
                            <input
                                type="password"
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
                                style={{
                                    backgroundColor: 'var(--input-bg)',
                                    color: 'var(--input-text)',
                                    borderColor: 'var(--input-border)'
                                }}
                            />
                            <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600">
                                <Eye className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
                <div className="mt-4 flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                        <Save className="w-4 h-4" />
                        Update Password
                    </button>
                </div>
            </div>

            <div className="p-6 rounded-2xl shadow-sm border"
                style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--card-border)'
                }}
            >
                <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Session Management</h3>
                <div className="space-y-3">
                    <button className="w-full text-left p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        style={{ borderColor: 'var(--border-color)' }}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-medium" style={{ color: 'var(--text-primary)' }}>View Active Sessions</div>
                                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Manage your active logins</div>
                            </div>
                            <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                        </div>
                    </button>
                    <button className="w-full text-left p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        style={{ borderColor: 'var(--border-color)' }}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-medium" style={{ color: 'var(--text-primary)' }}>Revoke All Sessions</div>
                                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Log out from all devices</div>
                            </div>
                            <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );

    const renderPrivacyTab = () => (
        <div className="space-y-6">
            <div className="p-6 rounded-2xl shadow-sm border"
                style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--card-border)'
                }}
            >
                <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Privacy Settings</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-medium" style={{ color: 'var(--text-primary)' }}>Profile Visibility</div>
                            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Control who can see your profile</div>
                        </div>
                        <select
                            className="px-3 py-1.5 border rounded-lg text-sm"
                            style={{
                                backgroundColor: 'var(--input-bg)',
                                color: 'var(--input-text)',
                                borderColor: 'var(--input-border)'
                            }}
                        >
                            <option>Public</option>
                            <option>Only Tutors</option>
                            <option>Private</option>
                        </select>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-medium" style={{ color: 'var(--text-primary)' }}>Session History</div>
                            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Share your learning history</div>
                        </div>
                        <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors">
                            <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                        </button>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-medium" style={{ color: 'var(--text-primary)' }}>Data Sharing</div>
                            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Allow anonymized data for improvements</div>
                        </div>
                        <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors">
                            <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
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
                <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Data Management</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Download Your Data</label>
                        <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                            Download all your learning data, session history, and preferences.
                        </p>
                        <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition-colors hover:bg-slate-50 dark:hover:bg-slate-800">
                            <Download className="w-4 h-4" />
                            Download Data
                        </button>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Delete Account</label>
                        <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                            Permanently delete your account and all associated data.
                        </p>
                        <button className="flex items-center gap-2 px-4 py-2 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg font-medium transition-colors hover:bg-red-50 dark:hover:bg-red-900/30">
                            <Trash2 className="w-4 h-4" />
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case 'account': return renderAccountTab();
            case 'notifications': return renderNotificationsTab();
            case 'preferences': return renderPreferencesTab();
            case 'security': return renderSecurityTab();
            case 'privacy': return renderPrivacyTab();
            default: return renderAccountTab();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Settings</h1>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Manage your account preferences and privacy.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-medium transition-colors hover:bg-slate-50 dark:hover:bg-slate-800">
                        <Globe className="w-5 h-5" />
                        Privacy Policy
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
                        <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Account Settings</h3>
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

export default SettingsPage;