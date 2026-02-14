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
    className={`w-full p-6 rounded-2xl border-2 text-left transition-all duration-300 group focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 ${isSelected
      ? 'border-blue-600 bg-blue-50 shadow-none'
      : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-lg hover:shadow-slate-100'
      }`}
    aria-pressed={isSelected}
  >
    <div className="flex items-center gap-5">
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-colors duration-300 ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-600'
        }`}>
        <Icon className="w-7 h-7" />
      </div>
      <div className="flex-1">
        <h3 className={`font-bold text-lg ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>{title}</h3>
        <p className={`text-sm mt-1 leading-relaxed ${isSelected ? 'text-blue-700' : 'text-slate-500'}`}>{description}</p>
      </div>
      <div className={`transition-transform duration-300 ${isSelected ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'}`}>
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
    <div className={`min-h-screen w-full flex flex-col ${containerClass} transition-colors duration-300 relative`}>
      <AccessibilityToolbar />

      <div className="absolute top-6 left-6">
        <Link
          to="/"
          className="inline-flex items-center text-slate-500 hover:text-blue-600 font-medium transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-xl space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <Link
              to="/"
              className="inline-flex items-center gap-3 mb-4 group"
            >
                <img src={peerlearnLogo} alt="PeerLearn Logo" className="w-10 h-10" />
              <span className="text-2xl font-bold text-slate-900 tracking-tight">PeerLearn</span>
            </Link>
            <h1 className={`font-extrabold text-slate-900 tracking-tight ${textSize === 'large' ? 'text-4xl' : 'text-3xl'}`}>
              Choose your journey
            </h1>
            <p className={`text-slate-600 max-w-sm mx-auto ${baseFontSize}`}>
              Select the role that best fits your goals on PeerLearn. You can always explore both sides later.
            </p>
          </div>

          {/* Role Cards */}
          <div className="grid gap-4">
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
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg ${role
                ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-500/25 transform hover:-translate-y-0.5'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                }`}
            >
              Continue to Registration
            </button>
            <Link
              to="/login"
              className="inline-flex items-center justify-center text-slate-500 hover:text-blue-600 font-medium transition-colors py-2 group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Already have an account? Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
