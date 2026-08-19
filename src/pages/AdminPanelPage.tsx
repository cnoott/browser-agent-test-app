import React from 'react';

export const AdminPanelPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Admin Panel</h1>
        <p className="text-lg text-gray-600">
          Administrative interface for test configuration and monitoring.
        </p>
      </header>

      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="text-6xl mb-4">⚙️</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Coming Soon</h2>
        <p className="text-gray-600">
          This page will contain admin features including:
        </p>
        <ul className="mt-4 space-y-2 text-left max-w-md mx-auto">
          <li>• Test configuration management</li>
          <li>• Error simulation controls</li>
          <li>• User management</li>
          <li>• System monitoring</li>
          <li>• Analytics and reporting</li>
        </ul>
      </div>
    </div>
  );
};