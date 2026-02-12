// src/context/ThemeContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [darkMode, setDarkMode] = useState(() => {
        // Initialize from localStorage or system preference
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) {
                return savedTheme === 'dark';
            }
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return false;
    });

    useEffect(() => {
        // Apply theme on mount and whenever darkMode changes
        const htmlElement = document.documentElement;
        
        if (darkMode) {
            htmlElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            htmlElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [darkMode]);

    const toggleTheme = () => {
        setDarkMode((prev) => !prev);
    };

    return (
        <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
