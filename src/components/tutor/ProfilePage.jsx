// src/components/tutor/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import {
  User, Mail, Calendar, Star, BookOpen, Award, Edit, Save, X,
  Camera, AlertCircle, CheckCircle, Loader2, Bell, Shield
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const TutorProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState(null);

  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    expertise: user?.expertise || [],
    qualifications: user?.qualifications || '',
    hourlyRate: user?.hourlyRate || '0',
    totalStudents: 0,
    totalSessions: 0,
    averageRating: 0,
    totalReviews: 0,
    joinedDate: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently',
    responseTime: '2 hours',
    completionRate: '98%'
  });

  const [editedProfile, setEditedProfile] = useState(profile);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/v1/tutor/me');
        const tutorData = response || {};
        
        setProfile(prev => ({
          ...prev,
          ...tutorData,
          name: tutorData.name || user?.name || prev.name,
          email: tutorData.email || user?.email || prev.email,
          bio: tutorData.bio || prev.bio,
          expertise: tutorData.expertise || prev.expertise,
          qualifications: tutorData.qualifications || prev.qualifications,
          hourlyRate: tutorData.hourlyRate || prev.hourlyRate,
          totalStudents: tutorData.totalStudents || 0,
          totalSessions: tutorData.totalSessions || 0,
          averageRating: tutorData.averageRating || 0,
          totalReviews: tutorData.totalReviews || 0
        }));
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user]);

  useEffect(() => {
    setEditedProfile(profile);
  }, [profile]);

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      setError(null);
      
      const updatedData = await api.put('/v1/tutor/me', {
        name: editedProfile.name,
        bio: editedProfile.bio,
        expertise: editedProfile.expertise,
        qualifications: editedProfile.qualifications,
        hourlyRate: editedProfile.hourlyRate
      });

      setProfile(prev => ({
        ...prev,
        ...editedProfile
      }));
      
      // Update user context with new data if available
      if (updatedData && updateUser) {
        updateUser({ ...user, ...updatedData });
      }
      
      setSuccessMessage('Profile updated successfully!');
      setIsEditing(false);
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-lg font-medium" style={{ color: 'var(--text-secondary)' }}>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>My Profile</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Manage your tutor profile and settings</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit Profile
          </button>
        )}
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-center gap-3 text-green-700 dark:text-green-400">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{successMessage}</p>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-3 text-red-700 dark:text-red-400">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
        {['overview', 'expertise', 'settings'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 font-medium border-b-2 transition-colors capitalize ${
              activeTab === tab
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="p-6 rounded-2xl shadow-sm border" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=random&size=120`}
                    alt={profile.name}
                    className="w-24 h-24 rounded-full border-4 object-cover"
                    style={{ borderColor: 'var(--border-color)' }}
                  />
                  <button className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{profile.name}</h2>
                <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>Senior Tutor</p>
                
                <div className="flex items-center justify-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.floor(profile.averageRating) ? 'text-yellow-500' : 'text-slate-300 dark:text-slate-600'}`} />
                  ))}
                  <span className="text-sm font-medium ml-2" style={{ color: 'var(--text-secondary)' }}>
                    {profile.averageRating} ({profile.totalReviews} reviews)
                  </span>
                </div>

                <div className="w-full space-y-2 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Students</span>
                    <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{profile.totalStudents}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Sessions</span>
                    <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{profile.totalSessions}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Completion Rate</span>
                    <span className="font-bold text-green-600">{profile.completionRate}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Info Card */}
          <div className="lg:col-span-2 space-y-4">
            <div className="p-6 rounded-2xl shadow-sm border" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
              <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Basic Information</h3>
              
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Full Name</label>
                    <input
                      type="text"
                      value={editedProfile.name}
                      onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border-none focus:ring-2 focus:ring-blue-500"
                      style={{ backgroundColor: 'var(--input-bg)', color: 'var(--input-text)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Email</label>
                    <input
                      type="email"
                      value={editedProfile.email}
                      disabled
                      className="w-full px-4 py-2 rounded-lg border-none opacity-50 cursor-not-allowed"
                      style={{ backgroundColor: 'var(--input-bg)', color: 'var(--input-text)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Bio</label>
                    <textarea
                      value={editedProfile.bio}
                      onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows="4"
                      style={{ backgroundColor: 'var(--input-bg)', color: 'var(--input-text)' }}
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 transition-colors"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 rounded-lg border transition-colors"
                      style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Full Name</div>
                      <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{profile.name}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Email</div>
                      <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{profile.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Joined</div>
                      <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{profile.joinedDate}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 rounded-2xl shadow-sm border" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
              <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Bio</h3>
              <p style={{ color: 'var(--text-secondary)' }}>{profile.bio || 'No bio added yet. Edit your profile to add one.'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Expertise Tab */}
      {activeTab === 'expertise' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl shadow-sm border" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Areas of Expertise</h3>
            <div className="space-y-2">
              {editedProfile.expertise && editedProfile.expertise.length > 0 ? (
                editedProfile.expertise.map((skill, idx) => (
                  <div key={idx} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: 'var(--bg-hover)' }}>
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <span style={{ color: 'var(--text-primary)' }}>{skill}</span>
                  </div>
                ))
              ) : (
                <p style={{ color: 'var(--text-secondary)' }}>No expertise added yet.</p>
              )}
            </div>
          </div>

          <div className="p-6 rounded-2xl shadow-sm border" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Qualifications</h3>
            <p style={{ color: 'var(--text-secondary)' }}>{editedProfile.qualifications || 'No qualifications added yet.'}</p>
          </div>

          <div className="p-6 rounded-2xl shadow-sm border col-span-1 lg:col-span-2" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Hourly Rate</h3>
            <div className="text-3xl font-bold text-green-600">${editedProfile.hourlyRate}/hour</div>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-4">
          <div className="p-6 rounded-2xl shadow-sm border" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>Notifications</h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>New messages and session updates</p>
                </div>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5 rounded" />
            </div>
          </div>

          <div className="p-6 rounded-2xl shadow-sm border" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>Two-Factor Authentication</h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Add extra security to your account</p>
                </div>
              </div>
              <button className="px-4 py-2 text-blue-600 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
                Enable
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorProfilePage;
