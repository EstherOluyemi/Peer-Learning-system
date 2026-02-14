import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { mockUsers } from '../data/mockdata';

const AuthContext = createContext();
const USE_MOCK_AUTH = true; // Set to false when backend is ready

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for stored user on app load
  useEffect(() => {
    const checkAuth = async () => {
      const storedUser = localStorage.getItem('peerlearn_user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          // Verify session with backend using HTTP-only cookies
          const endpoint = parsedUser.role === 'tutor' ? '/v1/tutor/auth/me' : '/v1/learner/auth/me';
          try {
            const response = await api.get(endpoint);
            // Backend should return user data if cookie is valid
            setUser({ ...response.data.user, role: parsedUser.role });
          } catch (err) {
            console.error('Session expired or invalid:', err);
            // If 401 or other error, clear the role from localStorage
            localStorage.removeItem('peerlearn_user');
            setUser(null);
          }
        } catch (error) {
          console.error('Error parsing stored user role:', error);
          localStorage.removeItem('peerlearn_user');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (credentials, role = null) => {
    // Mock authentication
    if (USE_MOCK_AUTH) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const foundUser = Object.values(mockUsers).find(
            u => u.email === credentials.email && u.password === credentials.password
          );
          
          if (foundUser) {
            const userData = { ...foundUser };
            setUser(userData);
            localStorage.setItem('peerlearn_user', JSON.stringify({ 
              id: userData.id, 
              role: userData.role,
              name: userData.name 
            }));
            resolve(userData);
          } else {
            reject(new Error('Invalid email or password'));
          }
        }, 500); // Simulate network delay
      });
    }

    // Real API authentication
    try {
      // If role is provided, use the specific endpoint
      if (role) {
        const endpoint = role === 'tutor' ? '/v1/tutor/auth/login' : '/v1/learner/auth/login';
        const response = await api.post(endpoint, credentials);
        const userData = { ...response.data.user, role };
        setUser(userData);
        localStorage.setItem('peerlearn_user', JSON.stringify({ 
          id: userData.id, 
          role: userData.role,
          name: userData.name 
        }));
        return userData;
      }

      // If no role is provided, try learner first, then tutor
      try {
        const response = await api.post('/v1/learner/auth/login', credentials);
        const userData = { ...response.data.user, role: 'learner' };
        setUser(userData);
        localStorage.setItem('peerlearn_user', JSON.stringify({ 
          id: userData.id, 
          role: 'learner',
          name: userData.name 
        }));
        return userData;
      } catch (learnerError) {
        // If learner login fails, try tutor
        try {
          const response = await api.post('/v1/tutor/auth/login', credentials);
          const userData = { ...response.data.user, role: 'tutor' };
          setUser(userData);
          localStorage.setItem('peerlearn_user', JSON.stringify({ 
            id: userData.id, 
            role: 'tutor',
            name: userData.name 
          }));
          return userData;
        } catch (tutorError) {
          // If both fail, throw the original error (usually 401)
          throw learnerError;
        }
      }
    } catch (error) {
      throw error;
    }
  };

  // Register function
  const register = async (userData, role = 'learner') => {
    try {
      const endpoint = role === 'tutor' ? '/v1/tutor/auth/register' : '/v1/learner/auth/register';
      const response = await api.post(endpoint, userData);
      
      // Token is now in HTTP-only cookie
      const newUser = { ...response.data.user, role };
      setUser(newUser);
      // Store only non-sensitive user info and role
      localStorage.setItem('peerlearn_user', JSON.stringify({ 
        id: newUser.id, 
        role: newUser.role,
        name: newUser.name 
      }));
      return newUser;
    } catch (error) {
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      const role = user?.role || JSON.parse(localStorage.getItem('peerlearn_user'))?.role || 'learner';
      const endpoint = role === 'tutor' ? '/v1/tutor/auth/logout' : '/v1/learner/auth/logout';
      await api.post(endpoint);
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('peerlearn_user');
    }
  };

  // Update user function
  const updateUser = (updatedData) => {
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    // Keep role and ID in localStorage
    localStorage.setItem('peerlearn_user', JSON.stringify({ 
      id: updatedUser.id, 
      role: updatedUser.role,
      name: updatedUser.name 
    }));
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