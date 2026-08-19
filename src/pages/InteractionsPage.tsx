import React, { useState } from 'react';

export const InteractionsPage: React.FC = () => {
  const [doubleClickStatus, setDoubleClickStatus] = useState<'idle' | 'success'>('idle');

  const handleDoubleClick = () => {
    setDoubleClickStatus('success');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Interactive Elements Tests</h1>
        <p className="text-lg text-gray-600">
          Test various interactive elements, button states, and click scenarios.
        </p>
      </header>

      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="text-6xl mb-4">🖱️</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Coming Soon</h2>
        <p className="text-gray-600">
          This page will contain comprehensive interaction tests including:
        </p>
        <ul className="mt-4 space-y-2 text-left max-w-md mx-auto">
          <li>• Button click scenarios</li>
          <li>• Element hover effects</li>
          <li>• Dynamic element positioning</li>
          <li>• Animation interactions</li>
          <li>• Event handling tests</li>
        </ul>
      </div>

      <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Double Click Test</h3>
        <p className="text-gray-600 mb-4">
          Double click the button below. A success message will appear when detected.
        </p>
        <button
          type="button"
          onDoubleClick={handleDoubleClick}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Double Click Me
        </button>
        <div className="mt-3 text-sm">
          {doubleClickStatus === 'success' ? (
            <span className="text-green-600 font-semibold">Success</span>
          ) : (
            <span className="text-gray-600">Waiting for double click…</span>
          )}
        </div>
      </div>
    </div>
  );
};