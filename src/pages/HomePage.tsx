import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const [hasAcceptedCookies, setHasAcceptedCookies] = useState<boolean>(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return localStorage.getItem("cookieConsent") === "accepted";
  });

  useEffect(() => {
    if (!hasAcceptedCookies) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [hasAcceptedCookies]);

  const handleAcceptCookies = () => {
    localStorage.setItem("cookieConsent", "accepted");
    setHasAcceptedCookies(true);
  };

  const testScenarios = [
    {
      title: "Navigation & Loading",
      description: "Test page navigation, loading states, and route changes",
      link: "/navigation-test",
      icon: "🧭",
      features: [
        "Different loading times",
        "Error scenarios",
        "Redirects",
        "Network delays",
      ],
    },
    {
      title: "Forms & Inputs",
      description: "Test form interactions, validation, and input types",
      link: "/forms",
      icon: "📝",
      features: [
        "Text inputs",
        "Validation",
        "Dynamic fields",
        "Auto-formatting",
      ],
    },
    {
      title: "Interactive Elements",
      description: "Test button clicks, animations, and element interactions",
      link: "/interactions",
      icon: "🖱️",
      features: [
        "Button states",
        "Delayed elements",
        "Moving targets",
        "Click handlers",
      ],
    },
    {
      title: "Data Tables",
      description: "Test table interactions, sorting, and pagination",
      link: "/data-tables",
      icon: "📊",
      features: ["Sorting", "Pagination", "Filtering", "Row actions"],
    },
    {
      title: "Downloads",
      description: "Test file downloads with various scenarios",
      link: "/downloads",
      icon: "📥",
      features: [
        "Different file types",
        "Slow downloads",
        "Failed downloads",
        "Timeouts",
      ],
    },
    {
      title: "Modals & Popups",
      description: "Test modal interactions and popup handling",
      link: "/modals",
      icon: "🪟",
      features: [
        "Modal dialogs",
        "Popup dismissal",
        "Stacked modals",
        "Notifications",
      ],
    },
    {
      title: "Dropdowns & Selects",
      description: "Test dropdown interactions and select elements",
      link: "/dropdowns",
      icon: "📋",
      features: [
        "Standard selects",
        "Searchable dropdowns",
        "Multi-select",
        "Cascading",
      ],
    },
    {
      title: "Responsive Design",
      description: "Test responsive layouts and viewport changes",
      link: "/responsive",
      icon: "📱",
      features: [
        "Mobile layouts",
        "Breakpoints",
        "Touch interactions",
        "Viewport-specific content",
      ],
    },
    {
      title: "Monitoring & Alerting",
      description:
        "Controlled scenarios that exercise HealthMonitor anomalies and Slack critical alerts",
      link: "/monitoring",
      icon: "🔔",
      features: [
        "repeat_healing anomaly",
        "high_skip_rate anomaly",
        "loop_aborted critical alert",
        "reauth critical alert",
      ],
    },
    {
      title: "API Endpoint Testing",
      description:
        "Test automation endpoint nodes against visible request capture and paginated APIs",
      link: "/api-testing",
      icon: "🔌",
      features: [
        "Incoming request dashboard",
        "Header/body inspection",
        "Cursor pagination",
        "Offset and Link pagination",
      ],
    },
    {
      title: "Font Stress (exaggerated Theranest)",
      description:
        "Overdrive Chromeleon font/fallback stalls: 200+ FontFaces, dense mixed scripts/emoji, nuclear glyph flood, mutating clients table",
      link: "/font-stress",
      icon: "🔤",
      features: [
        "200+ FontFaces",
        "CJK/emoji/script fallbacks",
        "Nuclear glyph flood",
        "Shape probe + live fonts.size",
      ],
    },
  ];

  return (
    <>
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Browser Agent Test Application
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A comprehensive testing environment for browser automation agents.
            Test various scenarios including navigation, forms, interactions,
            and error conditions.
          </p>
          {user && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-800">
                Welcome back, <strong>{user.username}</strong>!
                {user.role === "admin" && (
                  <span className="ml-2 text-sm">
                    As an admin, you have access to the{" "}
                    <Link to="/admin" className="text-blue-600 hover:underline">
                      admin panel
                    </Link>
                    .
                  </span>
                )}
              </p>
            </div>
          )}
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testScenarios.map((scenario, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <span className="text-3xl mr-3">{scenario.icon}</span>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {scenario.title}
                  </h3>
                </div>
                <p className="text-gray-600 mb-4">{scenario.description}</p>

                <ul className="space-y-2 mb-6">
                  {scenario.features.map((feature, featureIndex) => (
                    <li
                      key={featureIndex}
                      className="flex items-center text-sm text-gray-700"
                    >
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  to={scenario.link}
                  className="inline-block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
                >
                  Test Scenario
                </Link>
              </div>
            </div>
          ))}
        </div>

        <section className="mt-16 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Test Capabilities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">
                Browser Automation Actions
              </h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                    START
                  </code>{" "}
                  - Page navigation
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                    NAVIGATE
                  </code>{" "}
                  - URL changes
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                    CLICK
                  </code>{" "}
                  - Element interactions
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                    INPUT_TEXT
                  </code>{" "}
                  - Form filling
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                    INPUT_SELECT
                  </code>{" "}
                  - Dropdown selection
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                    DOWNLOAD
                  </code>{" "}
                  - File downloads
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                    SCREENSHOT
                  </code>{" "}
                  - Visual capture
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Error Scenarios</h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                  Selector not found
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                  Element blocked by overlay
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                  Network timeouts
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                  Download failures
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                  Dynamic content changes
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                  Authentication failures
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                  Memory pressure
                </li>
              </ul>
            </div>
          </div>
        </section>

        {!user && (
          <section className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">Get Started</h2>
            <p className="text-xl mb-6">
              Create an account to access all test scenarios and admin features.
            </p>
            <div className="flex space-x-4">
              <Link
                to="/register"
                className="bg-white text-blue-600 hover:bg-gray-100 font-semibold py-2 px-6 rounded-md transition-colors"
              >
                Create Account
              </Link>
              <Link
                to="/login"
                className="bg-transparent border-2 border-white hover:bg-white hover:text-blue-600 font-semibold py-2 px-6 rounded-md transition-colors"
              >
                Sign In
              </Link>
            </div>
          </section>
        )}
      </div>

      {!hasAcceptedCookies && (
        <>
          <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm z-40"></div>
          <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6">
            <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-2xl p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-blue-600 uppercase tracking-wide">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Cookie preferences
                  </div>
                  <p className="mt-2 text-gray-700">
                    We use cookies to personalize scenarios, analyze agent
                    performance, and keep your session secure. Accept cookies to
                    continue testing.
                  </p>
                  <ul className="mt-3 text-sm text-gray-500 space-y-1 list-disc list-inside">
                    <li>Essential cookies keep you signed in.</li>
                    <li>Analytics cookies surface flaky automation flows.</li>
                  </ul>
                </div>
                <button
                  type="button"
                  onClick={handleAcceptCookies}
                  id="cookies"
                  className="w-full md:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg transition-colors"
                >
                  Accept & Continue
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};
