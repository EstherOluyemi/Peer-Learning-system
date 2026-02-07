import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  User, Mail, BookOpen, Award, Settings, 
  Save, Camera, X, CheckCircle, Globe,
  Calendar, Briefcase, MapPin, Edit2
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    bio: user?.bio || 'Passionate about learning and sharing knowledge with peers.',
    subjects: user?.subjects || ['Computer Science', 'Mathematics'],
    learningInterests: user?.learningInterests || ['Web Development', 'Data Science'],
    location: user?.location || 'Lagos, Nigeria',
    education: user?.education || 'Computer Science Student',
  });

  const handleSave = () => {
    updateUser(formData);
    setIsEditing(false);
  };

  const handleAddSubject = () => {
    const newSubject = prompt('Enter new subject:');
    if (newSubject && !formData.subjects.includes(newSubject)) {
      setFormData(prev => ({
        ...prev,
        subjects: [...prev.subjects, newSubject]
      }));
    }
  };

  const handleRemoveSubject = (subject) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.filter(s => s !== subject)
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link to="/dashboard" className="text-slate-600 hover:text-slate-900">
                ← Back to Dashboard
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
              {isEditing && (
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 mb-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              {/* Profile Picture */}
              <div className="relative">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                  {user?.fullName?.charAt(0) || 'U'}
                </div>
                {isEditing && (
                  <button className="absolute bottom-2 right-2 w-10 h-10 bg-white rounded-full border border-slate-200 flex items-center justify-center shadow-sm hover:bg-slate-50">
                    <Camera className="w-5 h-5 text-slate-600" />
                  </button>
                )}
              </div>
              
              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                        className="text-3xl font-bold text-slate-900 border-b border-slate-300 focus:outline-none focus:border-blue-500"
                      />
                    ) : (
                      <h1 className="text-3xl font-bold text-slate-900">{formData.fullName}</h1>
                    )}
                    <div className="flex items-center gap-4 mt-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${user?.role === 'tutor' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {user?.role === 'tutor' ? 'Tutor' : 'Learner'}
                      </span>
                      <span className="text-slate-600 flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {formData.email}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Bio */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-slate-900 mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Bio
                  </h3>
                  {isEditing ? (
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="3"
                    />
                  ) : (
                    <p className="text-slate-700">{formData.bio}</p>
                  )}
                </div>
                
                {/* Additional Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-700">{formData.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-700">{formData.education}</span>
                  </div