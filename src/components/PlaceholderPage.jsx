import React from 'react';
import { Link } from 'react-router-dom';

const PlaceholderPage = ({ title, description }) => (
  <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6">
    <a href="#main" className="skip-link">Skip to main content</a>
    <main id="main" className="text-center max-w-md">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
      <p className="text-gray-600 mb-6">{description}</p>
      <Link
        to="/dashboard"
        className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
      >
        Back to Dashboard
      </Link>
    </main>
  </div>
);

export default PlaceholderPage;
