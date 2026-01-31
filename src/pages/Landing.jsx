import React from 'react';
import { Search, BookOpen, Users } from 'lucide-react';
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
      <a href="#main" className="skip-link">Skip to main content</a>
      <header>
        <nav
          className="flex items-center justify-between px-8 py-6 border-b border-gray-200 bg-white/90 backdrop-blur-sm sticky top-0 z-50"
          aria-label="Main navigation"
        >
          <Link
            to="/"
            className="flex items-center gap-2.5 group"
            aria-label="PeerLearn home"
          >
            <Users className="w-8 h-8 text-blue-600 shrink-0" aria-hidden="true" />
            <span className="text-xl font-semibold tracking-tight text-gray-900 group-hover:text-blue-600 transition-colors">
              PeerLearn
            </span>
          </Link>

          <div className="flex items-center gap-7">
            <Link
              to="/login"
              className="text-base font-semibold hover:text-blue-600 transition-colors px-3 py-1.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="inline-block bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              Sign up
            </Link>
          </div>
        </nav>
      </header>

      <main id="main">
        <section
          className="relative flex items-center justify-center text-center px-6 py-32 overflow-hidden reveal"
          aria-labelledby="hero-heading"
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${heroImage})`, filter: 'brightness(80%)' }}
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/10 to-black/10"
            aria-hidden="true"
          />

          <div className="relative z-10 max-w-2xl">
            <h1 id="hero-heading" className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Learn together, <span className="text-blue-400">grow together</span>
            </h1>
            <p className="text-gray-200 mb-10 leading-relaxed">
              Connect with fellow students for peer-to-peer learning sessions.
              Share knowledge, ask questions, and succeed together.
            </p>
            <Link
              to="/signup"
              className="inline-block bg-blue-600 text-white px-10 py-5 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              Get started for free
            </Link>
          </div>
        </section>

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

      <footer className="bg-gray-900 text-gray-300 py-10 reveal">
        <div className="max-w-2xl mx-auto text-center px-4">
          <div className="flex items-center justify-center gap-2 mb-3" aria-hidden="true">
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

      <style>{`
        .reveal {
          opacity: 0;
          transform: translateY(40px);
          transition: opacity 0.9s ease, transform 0.9s ease;
        }
        .reveal-visible { opacity: 1; transform: translateY(0); }
        @media (prefers-reduced-motion: reduce) {
          .reveal { opacity: 1; transform: none; transition: none; }
          .reveal-visible { opacity: 1; transform: none; }
        }
      `}</style>
    </div>
  );
};

export default Landing;
