// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('peerlearn_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      localStorage.removeItem('peerlearn_user');
    } finally {
      setLoading(false);
    }
  }, []);

  // Login function
  const login = (email, password) => {
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('peerlearn_users') || '[]');
    
    // Find user with matching credentials
    const foundUser = users.find(
      u => u.email === email && u.password === password
    );

    if (foundUser) {
      // Remove password before storing in session
      const { password, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('peerlearn_user', JSON.stringify(userWithoutPassword));
      return { success: true, user: userWithoutPassword };
    }

    return { success: false, error: 'Invalid email or password' };
  };

  // Signup function
  const signup = (userData) => {
    // Get existing users
    const users = JSON.parse(localStorage.getItem('peerlearn_users') || '[]');
    
    // Check if email already exists
    const emailExists = users.some(u => u.email === userData.email);
    if (emailExists) {
      return { success: false, error: 'Email already registered' };
    }

    // Create new user with ID and timestamp
    const newUser = {
      id: Date.now().toString(),
      ...userData,
      createdAt: new Date().toISOString(),
      sessionsAttended: 0,
      hoursLearned: 0,
      studyPartners: 0,
      achievements: 0
    };

    // Add to users array
    users.push(newUser);
    localStorage.setItem('peerlearn_users', JSON.stringify(users));

    // Log user in
    const { password, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    localStorage.setItem('peerlearn_user', JSON.stringify(userWithoutPassword));

    return { success: true, user: userWithoutPassword };
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('peerlearn_user');
  };

  const value = {
    user,
    login,
    signup,
    logout,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};