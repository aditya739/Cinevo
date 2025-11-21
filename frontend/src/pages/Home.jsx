import React from "react";
import api from "../services/api.jsx";
import { Link } from "react-router-dom";
import { useAuth } from "../services/auth.jsx";
import SaveModal from "../components/SaveModal.jsx";
import SearchBar from "../components/SearchBar.jsx";
import YouTubeEmbed from "../components/YouTubeEmbed.jsx";
import ContinueWatching from "../components/ContinueWatching.jsx";

function VideoCard({ v }) {
  const { user } = useAuth();
  const [showSaveModal, setShowSaveModal] = React.useState(false);
  const thumb = v.thumbnail || `https://source.unsplash.com/collection/190727/800x600?sig=${v._id}`;
  
  const handleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowSaveModal(true);
  };

  return (
    <>
      <div className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
        <Link to={`/videos/${v._id}`} className="block">
          <div className="aspect-video bg-gray-100 relative overflow-hidden">
            <img 
              src={thumb} 
              alt={v.title} 
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" 
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-300 delay-75">
                <svg className="w-5 h-5 text-gray-900 ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
            </div>
            <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-md text-white text-xs px-2 py-1 rounded-md">
              {Math.floor(v.duration / 60)}:{String(v.duration % 60).padStart(2, '0')}
            </div>
          </div>
          <div className="p-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                  {(v.owner?.username || "U")[0].toUpperCase()}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
                  {v.title}
                </h3>
                <p className="text-sm text-gray-500 truncate hover:text-gray-700">
                  {v.owner?.username || "Unknown"}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                  <span>{v.views?.toLocaleString()} views</span>
                  <span>•</span>
                  <span>{new Date(v.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </Link>
        {user && (
          <button
            onClick={handleSave}
            className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-gray-700 p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white hover:text-blue-600 shadow-lg transform translate-y-2 group-hover:translate-y-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
        )}
      </div>
      {showSaveModal && (
        <SaveModal videoId={v._id} onClose={() => setShowSaveModal(false)} />
      )}
    </>
  );
}

export default function Home() {
  const [videos, setVideos] = React.useState([]);
  const [youtubeVideos, setYoutubeVideos] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [youtubeLoading, setYoutubeLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [sortBy, setSortBy] = React.useState("newest");
  const [showTrending, setShowTrending] = React.useState(true);

  const fetchVideos = React.useCallback(async (params = {}) => {
    setLoading(true);
    setError("");
    try {
      let url = "/videos?limit=20&page=1";
      if (params.query) url += `&search=${encodeURIComponent(params.query)}`;
      if (params.category) url += `&category=${params.category}`;
      if (params.uploadDate) url += `&uploadDate=${params.uploadDate}`;
      if (params.sortBy) url += `&sort=${params.sortBy}`;
      
      const res = await api.get(url);
      const arr = res?.data?.videos ?? res?.videos ?? res ?? [];
      setVideos(Array.isArray(arr) ? arr : []);
    } catch (err) {
      setError("Unable to fetch videos. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchYouTubeVideos = React.useCallback(async () => {
    setYoutubeLoading(true);
    try {
      const res = await api.get("/youtube/trending?maxResults=6");
      const items = res?.data?.items || [];
      setYoutubeVideos(items);
    } catch (err) {
      // Silently handle YouTube API errors
    } finally {
      setYoutubeLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchVideos();
    if (showTrending) {
      fetchYouTubeVideos();
    }
  }, [fetchVideos, fetchYouTubeVideos, showTrending]);

  const handleSearch = (params) => {
    setSearchQuery(params.query || "");
    setSortBy(params.sortBy || "newest");
    fetchVideos(params);
  };

  const handleYouTubeSearch = async (params) => {
    if (!params.query) return;
    setYoutubeLoading(true);
    try {
      const res = await api.get(`/youtube/search?q=${encodeURIComponent(params.query)}&maxResults=6`);
      const items = res?.data?.items || [];
      setYoutubeVideos(items);
    } catch (err) {
      setYoutubeVideos([]);
    } finally {
      setYoutubeLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white border-b border-gray-100">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 opacity-50"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{animationDelay: '1.5s'}}></div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-20 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight animate-fade-in-up">
            Discover <span className="text-gradient">Amazing</span> Content
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto animate-fade-in-up" style={{animationDelay: '0.1s'}}>
            Join our community of creators and watch thousands of videos from around the world.
          </p>
          
          <div className="animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            <SearchBar onSearch={handleSearch} onYouTubeSearch={handleYouTubeSearch} />
          </div>

          <div className="mt-10 flex justify-center gap-4 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
            <Link to="/upload" className="bg-gray-900 text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Start Creating
            </Link>
            <Link to="/shorts" className="bg-white text-gray-900 px-8 py-3 rounded-full font-medium border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all shadow-sm hover:shadow-md flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Watch Shorts
            </Link>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        {/* Continue Watching Section */}
        <ContinueWatching />

        {/* Trending Toggle */}
        <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-600">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900">YouTube Trending</h3>
              <p className="text-sm text-gray-500">See what's popular on YouTube right now</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={showTrending}
              onChange={(e) => setShowTrending(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-purple-600"></div>
          </label>
        </div>

        {/* Main Content Grid */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recommended for you</h2>
            <div className="flex gap-2">
              <select 
                value={sortBy}
                onChange={(e) => handleSearch({ sortBy: e.target.value })}
                className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="views">Most Viewed</option>
                <option value="likes">Most Liked</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({length:8}).map((_,i)=>(
                <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                  <div className="rounded-xl bg-gray-100 animate-pulse h-48 mb-4" />
                  <div className="h-4 bg-gray-100 rounded w-3/4 mb-2 animate-pulse" />
                  <div className="h-3 bg-gray-100 rounded w-1/2 animate-pulse" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-red-100 shadow-sm">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Oops! Something went wrong</h3>
              <p className="text-gray-500 mb-6">{error}</p>
              <button 
                onClick={() => fetchVideos()}
                className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No videos found</h3>
              <p className="text-gray-500 mb-8">Be the first to upload amazing content!</p>
              <Link to="/upload" className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all hover:-translate-y-1">
                Upload Video
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {videos.map(v => <VideoCard key={v._id} v={v} />)}
            </div>
          )}
        </div>
        
        {/* YouTube Trending Section */}
        {showTrending && (
          <section className="pt-8 border-t border-gray-200">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-red-500/30">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Trending on YouTube</h2>
            </div>

            {youtubeLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({length:6}).map((_,i)=>(
                  <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                    <div className="rounded-xl bg-gray-100 animate-pulse h-48 mb-4" />
                    <div className="h-4 bg-gray-100 rounded w-3/4 mb-2 animate-pulse" />
                    <div className="h-3 bg-gray-100 rounded w-1/2 animate-pulse" />
                  </div>
                ))}
              </div>
            ) : youtubeVideos.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                <div className="text-gray-500">Unable to load YouTube videos</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {youtubeVideos.map(video => (
                  <div key={video.id} className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <YouTubeEmbed videoId={video.id} title={video.snippet?.title} />
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-red-600 transition-colors">{video.snippet?.title}</h3>
                      <div className="flex items-center justify-between text-sm">
                        <p className="font-medium text-gray-700">{video.snippet?.channelTitle}</p>
                        <p className="text-gray-500">{parseInt(video.statistics?.viewCount || 0).toLocaleString()} views</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
