import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../services/auth.jsx";

export default function Nav() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  return (
    <header className="sticky top-0 z-50 glass border-b-0">
      <nav className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
              <span className="font-bold text-2xl text-gradient tracking-tight">Cinevo</span>
            </Link>
            <div className="hidden md:flex items-center gap-1 bg-white/5 rounded-full p-1 border border-white/10 backdrop-blur-sm">
              <NavLink to="/">Explore</NavLink>
              <NavLink to="/shorts">Shorts</NavLink>
              <NavLink to="/trending">Trending</NavLink>
              <NavLink to="/search">Search</NavLink>
              {user && <NavLink to="/collections">Collections</NavLink>}
              {user?.role === "admin" && <NavLink to="/admin">Admin</NavLink>}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <Link 
                  to="/upload" 
                  className="hidden md:flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-5 py-2.5 rounded-full font-medium transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Upload</span>
                </Link>
                
                <div className="relative group">
                  <button className="flex items-center gap-2 focus:outline-none">
                    <img 
                      src={user.avatar} 
                      alt={user.username} 
                      className="w-10 h-10 rounded-full object-cover border-2 border-white/20 ring-2 ring-transparent group-hover:ring-blue-500 transition-all"
                    />
                  </button>
                  
                  <div className="absolute right-0 mt-2 w-48 glass rounded-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right scale-95 group-hover:scale-100">
                    <div className="px-4 py-2 border-b border-white/10 mb-2">
                      <p className="font-medium text-gray-900 truncate">{user.fullName}</p>
                      <p className="text-sm text-gray-500 truncate">@{user.username}</p>
                    </div>
                    <Link to={`/c/${user.username}`} className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                      My Channel
                    </Link>
                    <Link to="/settings" className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                      Settings
                    </Link>
                    <button 
                      onClick={() => {
                        logout();
                        nav("/login");
                      }}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-gray-700 hover:text-gray-900 font-medium px-4 py-2 transition-colors">
                  Log in
                </Link>
                <Link 
                  to="/register" 
                  className="bg-gray-900 text-white px-5 py-2.5 rounded-full font-medium hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}

function NavLink({ to, children }) {
  return (
    <Link 
      to={to} 
      className="px-4 py-2 rounded-full text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-white/50 transition-all"
    >
      {children}
    </Link>
  );
}
