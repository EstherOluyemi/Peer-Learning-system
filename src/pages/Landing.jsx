import React from 'react';
import { Search, Video, BookOpen, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import heroImage from '../assets/students-learning.jpg';

const Landing = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* NAVBAR */}
      <header>
        <nav
          className="flex items-center justify-between px-8 py-6 border-b border-gray-200"
          aria-label="Main Navigation"
        >
          <div className="flex items-center gap-2 font-bold text-xl">
            <Users className="w-7 h-7 text-blue-600" aria-hidden="true" />
            <span className="text-2xl">PeerLearn</span>
          </div>

          <div className="flex items-center gap-7">
            <Link
              to="/login"
              className="text-base font-semibold hover:text-blue-600 transition-colors px-3 py-1.5 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              aria-label="Log in to your PeerLearn account"
            >
              Log In
            </Link>

            <button
              type="button"
              className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-base font-semibold hover:bg-blue-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              aria-label="Sign up for a PeerLearn account"
            >
              Sign Up
            </button>
          </div>
        </nav>
      </header>

      <main>
        {/* HERO SECTION */}
        <section
          className="relative flex flex-col items-center text-center px-6 py-28"
          aria-labelledby="hero-heading"
        >
          {/* Background image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${heroImage})` }}
            aria-hidden="true"
            role="presentation"
          />

          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50"
            aria-hidden="true"
            role="presentation"
          />

          {/* Hero content */}
          <div className="relative z-10 max-w-2xl transition-all duration-700 ease-out">
            <h1
              id="hero-heading"
              className="text-4xl md:text-5xl font-bold mb-6 text-white"
            >
              Learn Together, <span className="text-blue-400">Grow Together</span>
            </h1>

            <p className="text-gray-200 mb-8">
              Connect with fellow students for peer-to-peer learning sessions.
              Share knowledge, ask questions, and succeed together.
            </p>

            <button
              type="button"
              className="bg-blue-600 text-white px-10 py-5 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              aria-label="Get started with PeerLearn for free"
            >
              Get Started Free
            </button>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section
          className="px-6 py-24 bg-gray-50"
          aria-labelledby="how-it-works-heading"
        >
          <h2
            id="how-it-works-heading"
            className="text-3xl font-bold text-center mb-12"
          >
            How PeerLearn Works
          </h2>

          <div className="max-w-4xl mx-auto space-y-6">
            {/* Card 1 */}
            <article className="bg-white border border-gray-200 rounded-xl p-6 flex gap-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Search className="w-6 h-6 text-blue-600" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Find Sessions</h3>
                <p className="text-gray-600">
                  Browse learning sessions by subject, date, and tutor.
                </p>
              </div>
            </article>

            {/* Card 2 */}
            <article className="bg-white border border-gray-200 rounded-xl p-6 flex gap-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Video className="w-6 h-6 text-blue-600" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Join & Learn</h3>
                <p className="text-gray-600">
                  Participate in live sessions, ask questions, and collaborate.
                </p>
              </div>
            </article>

            {/* Card 3 */}
            <article className="bg-white border border-gray-200 rounded-xl p-6 flex gap-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Share Knowledge</h3>
                <p className="text-gray-600">
                  Host your own sessions and help others learn.
                </p>
              </div>
            </article>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer
        className="bg-gray-900 text-gray-300 py-8"
        aria-labelledby="footer-heading"
      >
        <div className="max-w-2xl mx-auto text-center px-4">
          <h2 id="footer-heading" className="sr-only">
            Footer
          </h2>

          <div className="flex items-center justify-center gap-2 mb-3">
            <Users className="w-5 h-5 text-blue-500" aria-hidden="true" />
            <span className="text-white font-bold text-lg">PeerLearn</span>
          </div>

          <p className="text-xs text-gray-400 mb-2">
            Empowering students through collaborative peer-to-peer academic
            learning. Final Year Project.
          </p>

          <p className="text-xs text-gray-500">
            © 2026 PeerLearn. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
