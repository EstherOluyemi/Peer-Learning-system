// src/components/Navbar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import peerlearnLogo from '../assets/peerlearn-logo.png';

const Navbar = ({
    navItems = [],
    bottomItems = [],
    user,
    onLogout,
    sidebarOpen,
    setSidebarOpen
}) => {
    const location = useLocation();

    const NavItemContent = ({ item }) => {
        // Check if this item is currently active
        const isActive = location.pathname === item.to;

        // Base classes for the item
        const baseClasses = `
      flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-base transition-all duration-200 group
      ${isActive
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-blue-600 dark:hover:text-blue-400'
            }
    `;

        return (
            <div className={baseClasses}>
                {item.icon && (
                    <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'}`} />
                )}
                <span>{item.label}</span>
                {item.badge && (
                    <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-600'}`}>
                        {item.badge}
                    </span>
                )}
            </div>
        );
    };

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 backdrop-blur-sm ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setSidebarOpen(false)}
            />

            {/* Sidebar */}
            <aside className={`
        fixed top-0 left-0 z-50 h-full w-68 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 
        transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none 
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
                <div className="flex flex-col h-full">
                    {/* Logo Area */}
                    <div className="h-20 flex items-center px-6 border-b border-slate-100 dark:border-slate-700">
                        {peerlearnLogo ? (
                            <img src={peerlearnLogo} alt="PeerLearn" className="h-8 w-8 mr-3" />
                        ) : (
                            <div className="h-8 w-8 bg-blue-600 rounded-lg mr-3"></div>
                        )}
                        <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">PeerLearn</span>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="ml-auto lg:hidden text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Main Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
                        {navItems.map((item, idx) => (
                            <Link key={idx} to={item.to} onClick={() => setSidebarOpen(false)}>
                                <NavItemContent item={item} />
                            </Link>
                        ))}
                    </nav>

                    {/* Bottom Actions */}
                    <div className="p-4 border-t border-slate-100 dark:border-slate-700 space-y-2 bg-slate-50/50 dark:bg-slate-800/50">
                        {bottomItems.map((item, idx) => (
                            // Check if item has an onClick (like Dark Mode toggle), render button, else render Link
                            item.onClick ? (
                                <button key={idx} onClick={item.onClick} className="w-full text-left">
                                    <NavItemContent item={item} />
                                </button>
                            ) : (
                                <Link key={idx} to={item.to} onClick={() => setSidebarOpen(false)}>
                                    <NavItemContent item={item} />
                                </Link>
                            )
                        ))}

                        {/* User Profile Snippet */}
                        {user && (
                            <div className="flex items-center gap-3 px-4 py-3 mt-4 bg-white dark:bg-slate-700 rounded-xl border border-slate-100 dark:border-slate-600 shadow-sm">
                                <img
                                    src={`https://ui-avatars.com/api/?name=${user.name || 'User'}&background=random`}
                                    alt="avatar"
                                    className="w-9 h-9 rounded-full object-cover"
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.name}</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 capitalize truncate">{user.role}</div>
                                </div>
                                {onLogout && (
                                    <button
                                        onClick={onLogout}
                                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        title="Logout"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Navbar;