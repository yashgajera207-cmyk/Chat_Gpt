"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface NavbarProps {
  userEmail?: string;
  onSidebarToggle?: () => void;
}

export function Navbar({ userEmail, onSidebarToggle }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Initialize theme from localStorage

  useEffect(() => {
    const savedTheme = localStorage.getItem("navbarTheme");

    const html = document.documentElement;

    if (savedTheme === "dark") {
      html.classList.add("dark");

      setIsDarkMode(true);
    } else {
      html.classList.remove("dark");

      setIsDarkMode(false);
    }
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;

    if (isDarkMode) {
      html.classList.remove("dark");

      localStorage.setItem("navbarTheme", "light");

      setIsDarkMode(false);
    } else {
      html.classList.add("dark");

      localStorage.setItem("navbarTheme", "dark");

      setIsDarkMode(true);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 right-0 left-0 lg:left-64 z-40 transition-all duration-300 ${
          scrolled
            ? isDarkMode
              ? "bg-gray-900/90 backdrop-blur-xl shadow-lg border-b border-gray-800"
              : "bg-white/90 backdrop-blur-xl shadow-lg border-b border-gray-200"
            : isDarkMode
              ? "bg-gray-900/50 backdrop-blur-sm border-b border-gray-800"
              : "bg-white/50 backdrop-blur-sm border-b border-gray-100"
        }`}
      >
        <div className="flex items-center justify-between px-4 sm:px-6 py-3">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              onClick={onSidebarToggle}
              className={`lg:hidden p-2 rounded-lg transition-colors ${
                isDarkMode
                  ? "hover:bg-gray-800 text-gray-400"
                  : "hover:bg-gray-100 text-gray-600"
              }`}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            {/* Logo (mobile) */}
            <div className="lg:hidden flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <span
                className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}
              >
                ChatGPT
              </span>
            </div>

            {/* Page title */}
            <h1
              className={`hidden lg:block text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}
            >
              Chat Interface
            </h1>
          </div>

          {/* Theme toggle and user menu */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
              }`}
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <svg
                  className="w-5 h-5 text-yellow-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`flex items-center gap-3 p-2 rounded-lg transition-colors group ${
                  isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
                }`}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {userEmail?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="hidden sm:block text-left">
                  <p
                    className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
                  >
                    {userEmail?.split("@")[0] || "User"}
                  </p>
                  <p
                    className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                  >
                    {userEmail}
                  </p>
                </div>
                <svg
                  className={`w-4 h-4 transition-transform group-hover:rotate-180 ${
                    isDarkMode ? "text-gray-400" : "text-gray-400"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowUserMenu(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`absolute right-0 mt-2 w-64 rounded-xl shadow-xl border z-50 overflow-hidden ${
                        isDarkMode
                          ? "bg-gray-800 border-gray-700"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      <div
                        className={`p-4 border-b ${isDarkMode ? "border-gray-700" : "border-gray-100"}`}
                      >
                        <p
                          className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
                        >
                          {userEmail?.split("@")[0]}
                        </p>
                        <p
                          className={`text-xs mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                        >
                          {userEmail}
                        </p>
                      </div>
                      <div className="p-2">
                        <a
                          href="/auth/logout"
                          className={`flex items-center gap-3 w-full p-2 rounded-lg transition-colors ${
                            isDarkMode
                              ? "text-red-400 hover:bg-red-900/20"
                              : "text-red-600 hover:bg-red-50"
                          }`}
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                            />
                          </svg>
                          <span>Sign out</span>
                        </a>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Spacer for fixed navbar */}
      <div className="h-16" />
    </>
  );
}
