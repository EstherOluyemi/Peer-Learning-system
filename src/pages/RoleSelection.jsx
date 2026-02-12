import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import peerlearnLogo from '../assets/peerlearn-logo.png';
import { Link } from 'react-router-dom';

const RoleSelection = () => {
  const [role, setRole] = useState('');
  const navigate = useNavigate();

  const handleContinue = () => {
    if (role) {
      navigate('/signup', { state: { role } });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f9fb]">
      <div className="bg-white rounded-2xl shadow-xl px-10 py-14 w-full max-w-md flex flex-col items-center">
        <div className="flex items-center mb-8">
          <img src={peerlearnLogo} alt="PeerLearn Logo" className="h-12 w-12" />
          <Link
            to="/"
            onClick={() => window.location.reload()}
            className="text-2xl font-bold text-slate-900 ml-2 cursor-pointer focus:outline-none"
            style={{ textDecoration: 'none', boxShadow: 'none' }}
          >
            PeerLearn
          </Link>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2 text-center">What is your role?</h2>
        <p className="text-slate-500 mb-8 text-center">How would you be using PeerLearn?</p>
        <div className="flex gap-4 mb-8">
          <button
            className={`px-6 py-2 rounded-lg border text-lg font-medium transition-all ${role === 'tutor' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400'}`}
            onClick={() => setRole('tutor')}
            aria-pressed={role === 'tutor'}
          >
            Tutor
          </button>
          <button
            className={`px-6 py-2 rounded-lg border text-lg font-medium transition-all ${role === 'learner' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400'}`}
            onClick={() => setRole('learner')}
            aria-pressed={role === 'learner'}
          >
            Learner
          </button>
        </div>
        <button
          className={`w-full py-3 rounded-lg text-lg font-semibold transition-all ${role ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-200 text-white cursor-not-allowed'}`}
          onClick={handleContinue}
          disabled={!role}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default RoleSelection;
// Remove default focus ring for all Link elements globally
// You can add this to your global CSS if you want it everywhere:
// a:focus, .focus\:outline-none:focus { outline: none !important; box-shadow: none !important; }
