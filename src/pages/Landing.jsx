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
           {/* Logo */}
           <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z"/>
              </svg>
              <Users className="w-8 h-8 text-green-500" />
            </div>
            <span className="text-2xl font-bold text-gray-900">PeerLearn</span>
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
            <Link
              to="/SignUp"
              > 
                Get Started For Free
              </Link>
            </button>
          </div>
        </section>

        {/* HOW IT WORKS */}
      <section
        className="px-6 py-24 bg-gradient-to-b from-white to-gray-50 reveal"
        aria-labelledby="how-it-works-heading"
      >
        <div className="max-w-6xl mx-auto">
          <h2
            id="how-it-works-heading"
            className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-900"
          >
            How PeerLearn Works
          </h2>

          <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
            Designed with accessibility, collaboration, and inclusivity at its core.
          </p>

          <div className="grid gap-10 md:grid-cols-3">

            {/* CARD 1 */}
            <article
              className="bg-white border border-gray-200 rounded-xl p-10
              shadow-sm transition-all duration-300
              hover:-translate-y-2 hover:shadow-lg hover:border-blue-400
              reveal"
            >
              <div className="flex flex-col items-center text-center">

                <div className="w-14 h-14 rounded-full bg-blue-50
                  flex items-center justify-center mb-6"
                >
                  <Search className="w-7 h-7 text-blue-600" aria-hidden="true" />
                </div>

                <h3 className="font-semibold text-xl mb-3 text-gray-900">
                  Accessibility First
                </h3>

                <p className="text-gray-600 leading-relaxed text-sm max-w-xs">
                  Built with WCAG AA compliance, keyboard navigation, screen reader
                  support, and customizable themes for all learners.
                </p>
              </div>
            </article>

            {/* CARD 2 */}
            <article
              className="bg-white border border-gray-200 rounded-xl p-10
              shadow-sm transition-all duration-300
              hover:-translate-y-2 hover:shadow-lg hover:border-green-400
              reveal"
            >
              <div className="flex flex-col items-center text-center">

                <div className="w-14 h-14 rounded-full bg-green-50
                  flex items-center justify-center mb-6"
                >
                  <Users className="w-7 h-7 text-green-600" aria-hidden="true" />
                </div>

                <h3 className="font-semibold text-xl mb-3 text-gray-900">
                  Peer Collaboration
                </h3>

                <p className="text-gray-600 leading-relaxed text-sm max-w-xs">
                  Find study partners, join groups, and learn together through
                  structured peer-to-peer interactions.
                </p>
              </div>
            </article>

            {/* CARD 3 */}
            <article
              className="bg-white border border-gray-200 rounded-xl p-10
              shadow-sm transition-all duration-300
              hover:-translate-y-2 hover:shadow-lg hover:border-orange-400
              reveal"
            >
              <div className="flex flex-col items-center text-center">

                <div className="w-14 h-14 rounded-full bg-orange-50
                  flex items-center justify-center mb-6"
                >
                  <BookOpen className="w-7 h-7 text-orange-600" aria-hidden="true" />
                </div>

                <h3 className="font-semibold text-xl mb-3 text-gray-900">
                  Inclusive Learning
                </h3>

                <p className="text-gray-600 leading-relaxed text-sm max-w-xs">
                  Share resources, host sessions, and create a welcoming
                  learning environment where everyone can succeed.
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
