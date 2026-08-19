import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export const Navigation: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path ? "bg-blue-700" : "hover:bg-blue-600";
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  const publicLinks = [
    { path: "/", label: "Home" },
    { path: "/navigation-test", label: "Navigation Test" },
    { path: "/forms", label: "Forms" },
    { path: "/interactions", label: "Interactions" },
    { path: "/data-tables", label: "Data Tables" },
    { path: "/downloads", label: "Downloads" },
    { path: "/uploads", label: "Uploads" },
    { path: "/modals", label: "Modals" },
    { path: "/dropdowns", label: "Dropdowns" },
    { path: "/responsive", label: "Responsive" },
    { path: "/heuristics", label: "Heuristics Test" },
    { path: "/api-testing", label: "API Testing" },
    { path: "/font-stress", label: "Font Stress" },
  ];

  const adminLinks = [
    { path: "/admin", label: "Admin Panel" },
    { path: "/admin/config", label: "Test Config" },
    { path: "/admin/logs", label: "Execution Logs" },
  ];

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold">
            Browser Agent Test App
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-4">
            {publicLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive(link.path)}`}
              >
                {link.label}
              </Link>
            ))}

            {user?.role === "admin" &&
              adminLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive(link.path)}`}
                >
                  {link.label}
                </Link>
              ))}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm">Welcome, {user.username}</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md text-sm font-medium transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="space-x-2">
                <Link
                  to="/login"
                  className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded-md text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded-md text-sm font-medium transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-2">
            {publicLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive(link.path)}`}
              >
                {link.label}
              </Link>
            ))}

            {user?.role === "admin" &&
              adminLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive(link.path)}`}
                >
                  {link.label}
                </Link>
              ))}

            <div className="border-t border-blue-500 pt-4">
              {user ? (
                <div className="space-y-2">
                  <span className="block px-3 py-2 text-sm">
                    Welcome, {user.username}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 bg-red-600 hover:bg-red-700 rounded-md text-sm font-medium transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-2 bg-green-600 hover:bg-green-700 rounded-md text-sm font-medium transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-md text-sm font-medium transition-colors"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
