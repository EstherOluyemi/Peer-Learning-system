import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BookOpen, GraduationCap, ArrowRight, Users, ArrowLeft } from 'lucide-react';
import peerlearnLogo from '../assets/peerlearn-logo.png';
import AccessibilityToolbar from '../components/AccessibilityToolbar';
import { useAccessibility } from '../context/hooks';

const RoleCard = ({ title, description, icon: Icon, isSelected, onClick, id }) => (
  <button
    id={id}
    type="button"
    onClick={onClick}
    className={`w-full p-6 rounded-2xl border-2 text-left transition-all duration-300 group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${isSelected
      ? 'border-blue-600 bg-blue-50 shadow-md shadow-blue-100'
      : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-lg hover:shadow-slate-100'
      }`}
    aria-pressed={isSelected}
    aria-label={`${title}. ${description}`}
  >
    <div className="flex items-center gap-5">
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-colors duration-300 ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-600'
        }`} aria-hidden="true">
        <Icon className="w-7 h-7" />
      </div>
      <div className="flex-1">
        <h3 className={`font-bold text-lg ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>{title}</h3>
        <p className={`text-sm mt-1 leading-relaxed ${isSelected ? 'text-blue-700' : 'text-slate-500'}`}>{description}</p>
      </div>
      <div className={`transition-transform duration-300 ${isSelected ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'}`} aria-hidden="true">
        <ArrowRight className={`w-5 h-5 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
      </div>
    </div>
  </button>
);

const RoleSelection = () => {
  const [role, setRole] = useState('');
  const navigate = useNavigate();
  const { highContrast, textSize } = useAccessibility();

  const handleContinue = () => {
    if (role) {
      navigate('/signup', { state: { role } });
    }
  };

  const baseFontSize = textSize === 'large' ? 'text-lg' : 'text-base';
  const containerClass = highContrast ? 'bg-white text-black contrast-more' : 'bg-slate-50';

  return (
    <div className={`min-h-screen w-full flex flex-col ${containerClass} transition-colors duration-300`}>
      <AccessibilityToolbar />
      
      {/* Skip Link */}
      <a 
        href="#role-selection-form" 
        className="sr-only focus-not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
      >
        Skip to role selection
      </a>
      
      <style jsx>{`
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }
        
        .focus-not-sr-only:focus {
          position: static;
          width: auto;
          height: auto;
          padding: inherit;
          margin: inherit;
          overflow: visible;
          clip: auto;
          white-space: normal;
        }
      `}</style>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-xl space-y-8">
          {/* Header */}
          <header className="text-center space-y-4">
            <Link
              to="/"
              className="inline-flex items-center gap-3 mb-4 group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 rounded"
            >
                <img src={peerlearnLogo} alt="PeerLearn" className="w-10 h-10" />
              <span className="text-2xl font-bold text-slate-900 tracking-tight">PeerLearn</span>
            </Link>
            <h1 className={`font-extrabold text-slate-900 tracking-tight focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 rounded ${textSize === 'large' ? 'text-4xl' : 'text-3xl'}`} tabIndex={-1}>
              Choose your journey
            </h1>
            <p className={`text-slate-600 max-w-sm mx-auto ${baseFontSize}`}>
              Select the role that best fits your goals on PeerLearn. You can always explore both sides later.
            </p>
          </header>

          {/* Role Cards */}
          <div className="grid gap-4" id="role-selection-form" role="group" aria-labelledby="role-selection-title">
            <span id="role-selection-title" className="sr-only">Select your role on PeerLearn. You can choose between learner and tutor.</span>
            <RoleCard
              id="role-learner"
              title="I'm a Learner"
              description="I want to find expert tutors, join study sessions, and master new skills with my peers."
              icon={BookOpen}
              isSelected={role === 'learner'}
              onClick={() => setRole('learner')}
            />
            <RoleCard
              id="role-tutor"
              title="I'm a Tutor"
              description="I want to share my knowledge, host sessions, and earn by helping others succeed in their studies."
              icon={GraduationCap}
              isSelected={role === 'tutor'}
              onClick={() => setRole('tutor')}
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 flex flex-col gap-4">
            <button
              onClick={handleContinue}
              disabled={!role}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${role
                ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-500/25 transform hover:-translate-y-0.5'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                }`}
              aria-busy={!role}
              aria-label={role ? `Continue to registration as ${role}` : 'Select a role to continue'}
            >
              Continue to Registration
            </button>
            <Link
              to="/login"
              className="inline-flex items-center justify-center text-slate-500 hover:text-blue-600 font-medium transition-colors py-2 group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 rounded"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" aria-hidden="true" />
              Already have an account? Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
