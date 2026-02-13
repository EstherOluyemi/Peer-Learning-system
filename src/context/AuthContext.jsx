import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for stored user on app load
  useEffect(() => {
    const storedUser = localStorage.getItem('peerlearn_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('peerlearn_user');
      }
    }
    setLoading(false);
  }, []);

  // Login function
  const login = async (credentials, role = 'learner') => {
    try {
      const endpoint = role === 'tutor' ? '/v1/tutor/auth/login' : '/v1/learner/auth/login';
      const response = await api.post(endpoint, credentials);
      const userData = { ...response.data.user, token: response.token || response.data.token, role };
      setUser(userData);
      localStorage.setItem('peerlearn_user', JSON.stringify(userData));
      return userData;
    } catch (error) {
      throw error;
    }
  };

  // Register function
  const register = async (userData, role = 'learner') => {
    try {
      const endpoint = role === 'tutor' ? '/v1/tutor/auth/register' : '/v1/learner/auth/register';
      const response = await api.post(endpoint, userData);
      const newUser = { ...response.data.user, token: response.token || response.data.token, role };
      setUser(newUser);
      localStorage.setItem('peerlearn_user', JSON.stringify(newUser));
      return newUser;
    } catch (error) {
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('peerlearn_user');
  };

  // Update user function
  const updateUser = (updatedData) => {
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    localStorage.setItem('peerlearn_user', JSON.stringify(updatedUser));
  };

  // Check if user is tutor/learner
  const isTutor = user?.role === 'tutor';
  const isLearner = user?.role === 'learner';

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isTutor,
    isLearner,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};