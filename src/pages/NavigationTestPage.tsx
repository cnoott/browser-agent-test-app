import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export const NavigationTestPage: React.FC = () => {
  const [isSlowLoading, setIsSlowLoading] = useState(false);
  const [networkError, setNetworkError] = useState(false);
  const [redirectCount, setRedirectCount] = useState(0);

  useEffect(() => {
    // Simulate slow loading if enabled
    if (isSlowLoading) {
      const timer = setTimeout(() => {
        setIsSlowLoading(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isSlowLoading]);

  const handleSlowLoad = () => {
    setIsSlowLoading(true);
  };

  const handleNetworkError = () => {
    setNetworkError(true);
    setTimeout(() => setNetworkError(false), 2000);
  };

  const handleRedirect = () => {
    setRedirectCount(count => count + 1);
  };

  const testScenarios = [
    {
      title: 'Instant Page Load',
      description: 'Tests immediate page loading without delays',
      testId: 'instant-load',
      action: () => window.location.reload(),
      buttonText: 'Reload Page',
      className: 'bg-green-600 hover:bg-green-700'
    },
    {
      title: 'Slow Page Load (3s)',
      description: 'Simulates slow network conditions',
      testId: 'slow-load',
      action: handleSlowLoad,
      buttonText: 'Trigger Slow Load',
      className: 'bg-yellow-600 hover:bg-yellow-700'
    },
    {
      title: 'Network Error',
      description: 'Simulates network failure scenarios',
      testId: 'network-error',
      action: handleNetworkError,
      buttonText: 'Simulate Error',
      className: 'bg-red-600 hover:bg-red-700'
    },
    {
      title: 'Redirect Test',
      description: 'Tests redirect handling',
      testId: 'redirect-test',
      action: handleRedirect,
      buttonText: 'Trigger Redirect',
      className: 'bg-purple-600 hover:bg-purple-700'
    }
  ];

  if (isSlowLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading...</h2>
          <p className="text-gray-600">Simulating slow network conditions (3 seconds)</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Navigation & Loading Tests</h1>
        <p className="text-lg text-gray-600">
          Test various page loading scenarios, navigation patterns, and error conditions
          to validate browser automation agent capabilities.
        </p>
      </header>

      {networkError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-400">⚠️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Network Error</h3>
              <p className="mt-1 text-sm text-red-700">
                Connection failed. Please check your network and try again.
              </p>
            </div>
          </div>
        </div>
      )}

      {redirectCount > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-blue-400">🔄</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Redirect Triggered</h3>
              <p className="mt-1 text-sm text-blue-700">
                Redirect count: {redirectCount}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {testScenarios.map((scenario, index) => (
          <div key={index} className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{scenario.title}</h3>
            <p className="text-gray-600 mb-4">{scenario.description}</p>
            <button
              data-testid={scenario.testId}
              onClick={scenario.action}
              className={`w-full text-white font-semibold py-2 px-4 rounded-md transition-colors ${scenario.className}`}
            >
              {scenario.buttonText}
            </button>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Navigation Links</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/"
            className="text-center p-3 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
          >
            <div className="text-2xl mb-1">🏠</div>
            <div className="text-sm font-medium">Home</div>
          </Link>
          <Link
            to="/forms"
            className="text-center p-3 bg-green-50 hover:bg-green-100 rounded-md transition-colors"
          >
            <div className="text-2xl mb-1">📝</div>
            <div className="text-sm font-medium">Forms</div>
          </Link>
          <Link
            to="/interactions"
            className="text-center p-3 bg-purple-50 hover:bg-purple-100 rounded-md transition-colors"
          >
            <div className="text-2xl mb-1">🖱️</div>
            <div className="text-sm font-medium">Interactions</div>
          </Link>
          <Link
            to="/data-tables"
            className="text-center p-3 bg-orange-50 hover:bg-orange-100 rounded-md transition-colors"
          >
            <div className="text-2xl mb-1">📊</div>
            <div className="text-sm font-medium">Data Tables</div>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Test Automation Tips</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start">
            <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></span>
            <span>Use <code className="bg-gray-100 px-1 rounded">data-testid</code> attributes for reliable element selection</span>
          </li>
          <li className="flex items-start">
            <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></span>
            <span>Wait for loading states to complete before proceeding</span>
          </li>
          <li className="flex items-start">
            <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></span>
            <span>Handle network errors gracefully with appropriate timeouts</span>
          </li>
          <li className="flex items-start">
            <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></span>
            <span>Test redirect scenarios to ensure proper URL handling</span>
          </li>
        </ul>
      </div>
    </div>
  );
};