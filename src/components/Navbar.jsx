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
        const isActive = location.pathname === item.to;

        return (
            <div
                className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-base transition-all duration-200 group"
                style={{
                    backgroundColor: isActive ? '#2563eb' : 'transparent',
                    color: isActive ? '#ffffff' : 'var(--text-secondary)',
                    boxShadow: isActive ? '0 20px 25px -5px rgba(37, 99, 235, 0.3)' : 'none'
                }}
            >
                {item.icon && (
                    <item.icon
                        className="w-5 h-5"
                        style={{
                            color: isActive ? '#ffffff' : 'var(--text-tertiary)'
                        }}
                    />
                )}
                <span>{item.label}</span>
                {item.badge && (
                    <span
                        className="ml-auto text-xs px-2 py-0.5 rounded-full font-bold"
                        style={{
                            backgroundColor: isActive ? 'rgba(255, 255, 255, 0.2)' : '#dbeafe',
                            color: isActive ? '#ffffff' : '#2563eb'
                        }}
                    >
                        {item.badge}
                    </span>
                )}
            </div>
        );
    };

    return (
        <>
            <div
                className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 backdrop-blur-sm ${
                    sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
                onClick={() => setSidebarOpen(false)}
            />

            <aside
                className="fixed top-0 left-0 z-50 h-full w-72 transition-all duration-300 ease-in-out shadow-2xl lg:shadow-none border-r"
                style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--border-color)',
                    transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
                    '@media (min-width: 1024px)': {
                        transform: 'translateX(0)'
                    }
                }}
            >
                <div className="flex flex-col h-full">
                    <div
                        className="h-20 flex items-center px-6 border-b"
                        style={{
                            borderColor: 'var(--border-color)',
                            backgroundColor: 'var(--card-bg)'
                        }}
                    >
                        {peerlearnLogo ? (
                            <img src={peerlearnLogo} alt="PeerLearn" className="h-8 w-8 mr-3" />
                        ) : (
                            <div className="h-8 w-8 bg-blue-600 rounded-lg mr-3"></div>
                        )}
                        <span className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                            PeerLearn
                        </span>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="ml-auto lg:hidden p-1 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
                            style={{
                                color: 'var(--text-secondary)'
                            }}
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
                        {navItems.map((item, idx) => (
                            <Link key={idx} to={item.to} onClick={() => setSidebarOpen(false)}>
                                <NavItemContent item={item} />
                            </Link>
                        ))}
                    </nav>

                    <div
                        className="p-4 border-t space-y-2"
                        style={{
                            borderColor: 'var(--border-color)',
                            backgroundColor: 'var(--bg-secondary)'
                        }}
                    >
                        {bottomItems.map((item, idx) => (
                            item.onClick ? (
                                <button
                                    key={idx}
                                    onClick={item.onClick}
                                    className="w-full text-left border rounded-xl overflow-hidden transition-all hover:border-blue-500"
                                    style={{
                                        borderColor: 'var(--border-color)'
                                    }}
                                >
                                    <NavItemContent item={item} />
                                </button>
                            ) : (
                                <Link key={idx} to={item.to} onClick={() => setSidebarOpen(false)}>
                                    <NavItemContent item={item} />
                                </Link>
                            )
                        ))}

                        {user && (
                            <div
                                className="flex items-center gap-3 px-4 py-3 mt-4 rounded-xl border shadow-sm"
                                style={{
                                    backgroundColor: 'var(--card-bg)',
                                    borderColor: 'var(--border-color)'
                                }}
                            >
                                <img
                                    src={`https://ui-avatars.com/api/?name=${user.name || 'User'}&background=random`}
                                    alt="avatar"
                                    className="w-9 h-9 rounded-full object-cover"
                                />
                                <div className="flex-1 min-w-0">
                                    <div
                                        className="text-sm font-bold truncate"
                                        style={{ color: 'var(--text-primary)' }}
                                    >
                                        {user.name}
                                    </div>
                                    <div
                                        className="text-xs capitalize truncate"
                                        style={{ color: 'var(--text-tertiary)' }}
                                    >
                                        {user.role}
                                    </div>
                                </div>
                                {onLogout && (
                                    <button
                                        onClick={onLogout}
                                        className="p-1.5 rounded-lg transition-all hover:bg-red-50 dark:hover:bg-red-900/20"
                                        style={{
                                            color: 'var(--text-secondary)'
                                        }}
                                        title="Logout"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="18"
                                            height="18"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                            <polyline points="16 17 21 12 16 7" />
                                            <line x1="21" x2="9" y1="12" y2="12" />
                                        </svg>
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
