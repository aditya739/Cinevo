import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../services/auth.jsx";

export default function Nav() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <nav className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
              <span className="font-semibold text-xl text-gray-900">Cinevo</span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Explore</Link>
              <Link to="/shorts" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Shorts</Link>
              <Link to="/trending" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Trending</Link>
              <Link to="/upload" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Upload</Link>
              <Link to="/search" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Search</Link>
              {user && <Link to="/collections" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Collections</Link>}
              {user?.role === "admin" && <Link to="/admin" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Admin</Link>}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="hidden sm:flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-700">{(user.fullName || user.username)?.[0]?.toUpperCase()}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">{user.fullName || user.username}</span>
                </div>
                <button
                  onClick={() => {
                    logout();
                    nav("/");
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">Login</Link>
                <Link to="/register" className="px-4 py-2 text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 rounded-lg transition-colors">Sign up</Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
