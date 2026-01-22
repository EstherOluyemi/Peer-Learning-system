import React from 'react';
import { Search, Video, BookOpen, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Navbar*/}
      <header>
        <nav 
          className="flex items-center justify-between px-8 py-6 border-b border-gray-200"
          aria-label="Main Navigation"
        >
          <div className="flex items-center gap-2 font-bold text-xl">
            <Users className="w-7 h-7 text-blue-600" aria-hidden="true" focusable="false" />
            <span className="text-2xl" id="site-title">PeerLearn</span>
          </div>

          <div className="flex items-center gap-7">
            <Link
              to="/Login"
              className="text-base font-semibold hover:text-blue-600 transition-colors px-3 py-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-md" // show clear focus
              aria-label="Log in to your PeerLearn account" 
            >
              Log In
            </Link>
            <button
              className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-base font-semibold hover:bg-blue-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              
              aria-label="Sign up for a PeerLearn account"
              type="button"
            >
              Sign Up
            </button>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero*/}
        <section
          className="flex flex-col items-center text-center px-6 py-20 bg-gradient-to-b from-blue-50 to-white"
          aria-labelledby="hero-heading"
        >
          <h1
            id="hero-heading"
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            Learn Together, <span className="text-blue-600">Grow Together</span>
          </h1>
          <p className="max-w-xl text-gray-600 mb-8">
            Connect with fellow students for peer-to-peer learning sessions.
            Share knowledge, ask questions, and succeed together.
          </p>

          <button
            className="bg-blue-600 text-white px-10 py-5 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            type="button"
            aria-label="Get started with PeerLearn for free"
          >
            Get Started Free
          </button>
        </section>

        {/* HOW IT WORKS */}
        <section className="px-6 py-24 bg-gray-50" aria-labelledby="hiw-heading">
          <h2 id="hiw-heading" className="text-3xl font-bold text-center mb-12">
            How PeerLearn Works
          </h2>

          <div className="max-w-4xl mx-auto space-y-6">
            <article className="bg-white border border-gray-200 rounded-xl p-6 flex gap-4 hover:shadow-lg transition-shadow" aria-labelledby="find-sessions-heading">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Search className="w-6 h-6 text-blue-600" aria-hidden="true" focusable="false" />
              </div>
              <div>
                <h3 id="find-sessions-heading" className="font-semibold text-lg mb-1">
                  Find Sessions
                </h3>
                <p className="text-gray-600">
                  Browse learning sessions by subject, date, and tutor.
                </p>
              </div>
            </article>

            <article className="bg-white border border-gray-200 rounded-xl p-6 flex gap-4 hover:shadow-lg transition-shadow" aria-labelledby="join-learn-heading">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Video className="w-6 h-6 text-blue-600" aria-hidden="true" focusable="false" />
              </div>
              <div>
                <h3 id="join-learn-heading" className="font-semibold text-lg mb-1">Join & Learn</h3>
                <p className="text-gray-600">
                  Participate in live sessions, ask questions, and collaborate.
                </p>
              </div>
            </article>

            <article className="bg-white border border-gray-200 rounded-xl p-6 flex gap-4 hover:shadow-lg transition-shadow" aria-labelledby="share-knowledge-heading">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600" aria-hidden="true" focusable="false" />
              </div>
              <div>
                <h3 id="share-knowledge-heading" className="font-semibold text-lg mb-1">Share Knowledge</h3>
                <p className="text-gray-600">
                  Host your own sessions and help others learn.
                </p>
              </div>
            </article>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-300 py-8 mt-8" aria-labelledby="footer-title">
        <div className="max-w-2xl mx-auto flex flex-col items-center text-center px-4">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-5 h-5 text-blue-500" aria-hidden="true" focusable="false" />
            <span id="footer-title" className="text-white font-bold text-lg">
              PeerLearn
            </span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed mb-2">
            Empowering students through collaborative peer-to-peer academic learning. Final Year Project 2024.
          </p>
          <p className="text-xs text-gray-500 mt-2">
            © 2026 PeerLearn. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Landing