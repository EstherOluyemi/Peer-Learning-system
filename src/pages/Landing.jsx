import React from 'react';
import { Search, Video, BookOpen, Users } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      
      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-gray-200">
        <div className="flex items-center gap-2 font-bold text-lg">
          <Users className="w-6 h-6 text-blue-600" />
          <span>PeerLearn</span>
        </div>

        <div className="flex items-center gap-6">
          <a href="/login" className="text-sm font-medium hover:text-blue-600 transition-colors">
            Log In
          </a>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
            Sign Up
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="flex flex-col items-center text-center px-6 py-20 bg-gradient-to-b from-blue-50 to-white">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Learn Together, <span className="text-blue-600">Grow Together</span>
        </h1>

        <p className="max-w-xl text-gray-600 mb-8">
          Connect with fellow students for peer-to-peer learning sessions.
          Share knowledge, ask questions, and succeed together.
        </p>

        <button className="bg-blue-600 text-white px-10 py-5 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors">
          Get Started Free
        </button>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-6 py-24 bg-gray-50">
        <h2 className="text-3xl font-bold text-center mb-12">
          How PeerLearn Works
        </h2>

        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Card 1 */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 flex gap-4 hover:shadow-lg transition-shadow">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Search className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">Find Sessions</h3>
              <p className="text-gray-600">
                Browse learning sessions by subject, date, and tutor.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 flex gap-4 hover:shadow-lg transition-shadow">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Video className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">Join & Learn</h3>
              <p className="text-gray-600">
                Participate in live sessions, ask questions, and collaborate.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 flex gap-4 hover:shadow-lg transition-shadow">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">Share Knowledge</h3>
              <p className="text-gray-600">
                Host your own sessions and help others learn.
              </p>
            </div>
          </div>

        </div>
      </section>

    </div>
  )
}

export default Landing