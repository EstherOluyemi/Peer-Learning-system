import React from 'react';
import { Search, Video, BookOpen, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import heroImage from '../assets/students-learning.jpg';

const Landing = () => {

  React.useEffect(() => {
    const sections = document.querySelectorAll('.reveal');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
          }
        });
      },
      { threshold: 0.15 }
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* NAVBAR */}
      <header>
        <nav
          className="flex items-center justify-between px-8 py-6 border-b border-gray-200 bg-white/90 backdrop-blur-sm sticky top-0 z-50"
          aria-label="Main Navigation"
        >
          <div className="flex items-center gap-2 font-bold text-xl">
            <Users className="w-7 h-7 text-blue-600" aria-hidden="true" />
            <span className="text-2xl">PeerLearn</span>
          </div>

          <div className="flex items-center gap-7">
            <Link
              to="/Login"
              className="text-base font-semibold hover:text-blue-600 transition-colors px-3 py-1.5 rounded-md focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              Log In
            </Link>

            <button
              type="button"
              className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-all hover:scale-105 focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <Link
              to="/SignUp"
              > 
                Sign Up
              </Link>
            </button>
          </div>
        </nav>
      </header>

      <main>

        {/* HERO SECTION */}
        <section className="relative flex items-center justify-center text-center px-6 py-32 overflow-hidden reveal">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${heroImage})`,
            filter: 'brightness(80%)'
          }}
            aria-hidden="true"
          />

          {/* Lighter professional overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/10 to-black/10" />

          <div className="relative z-10 max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Learn Together, <span className="text-blue-400">Grow Together</span>
            </h1>

            <p className="text-gray-200 mb-10 leading-relaxed">
              Connect with fellow students for peer-to-peer learning sessions.
              Share knowledge, ask questions, and succeed together.
            </p>

            <button className="bg-blue-600 text-white px-10 py-5 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-all hover:scale-105">
              Get Started Free
            </button>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section
          className="px-6 py-24 bg-gradient-to-b from-white to-gray-50 reveal"
          aria-labelledby="how-it-works-heading"
        >
          <div className="max-w-5xl mx-auto">
            <h2
              id="how-it-works-heading"
              className="text-3xl md:text-4xl font-bold text-center mb-4"
            >
              How PeerLearn Works
            </h2>

            <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
              Getting started is simple. Follow these three easy steps.
            </p>

            <div className="grid md:grid-cols-3 gap-8">

              <article className="bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-blue-400 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 reveal">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                    <Search className="w-8 h-8 text-white" aria-hidden="true" />
                  </div>
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm mb-3">
                    1
                  </div>
                  <h3 className="font-bold text-xl mb-3">Find Sessions</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Browse learning sessions by subject, date, and tutor. Filter to find your perfect match.
                  </p>
                </div>
              </article>

              <article className="bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-purple-400 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 reveal">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-purple-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                    <Video className="w-8 h-8 text-white" aria-hidden="true" />
                  </div>
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm mb-3">
                    2
                  </div>
                  <h3 className="font-bold text-xl mb-3">Join & Learn</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Participate in live sessions, ask questions, and collaborate with peers in real time.
                  </p>
                </div>
              </article>

              <article className="bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-green-400 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 reveal">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-green-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                    <BookOpen className="w-8 h-8 text-white" aria-hidden="true" />
                  </div>
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm mb-3">
                    3
                  </div>
                  <h3 className="font-bold text-xl mb-3">Share Knowledge</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Host your own sessions and help others learn. Make an impact in the community.
                  </p>
                </div>
              </article>

            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-300 py-10 reveal">
        <div className="max-w-2xl mx-auto text-center px-4">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Users className="w-5 h-5 text-blue-500" />
            <span className="text-white font-bold text-lg">PeerLearn</span>
          </div>

          <p className="text-xs text-gray-400 mb-2">
            Empowering students through collaborative peer-to-peer academic learning.
          </p>

          <p className="text-xs text-gray-500">
            © 2026 PeerLearn. All rights reserved.
          </p>
        </div>
      </footer>

      {/* SCROLL ANIMATIONS */}
      <style>{`
        .reveal {
          opacity: 0;
          transform: translateY(40px);
          transition: opacity 0.9s ease, transform 0.9s ease;
        }

        .reveal-visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
};

export default Landing;
