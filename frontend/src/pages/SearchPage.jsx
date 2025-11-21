import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

const SearchPage = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    minDuration: "",
    maxDuration: "",
    uploadDate: "",
    minViews: "",
    maxViews: "",
    creator: "",
    sort: "newest",
    source: "local",
  });

  const categories = [
    "gaming",
    "music",
    "education",
    "entertainment",
    "sports",
    "technology",
    "news",
    "comedy",
    "lifestyle",
    "other",
  ];

  const fetchVideos = async () => {
    setLoading(true);
    try {
      if (filters.source === "youtube") {
        const params = new URLSearchParams();
        if (filters.search) params.append("q", filters.search);
        
        const response = await axios.get(`${API_URL}/youtube/search?${params}`, {
          withCredentials: true,
        });
        
        const ytVideos = response.data.data.items.map(item => ({
          _id: item.id.videoId,
          title: item.snippet.title,
          thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
          owner: { username: item.snippet.channelTitle },
          views: 0,
          duration: 0,
          isYoutube: true,
          youtubeId: item.id.videoId
        }));
        setVideos(ytVideos);
      } else {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value && key !== "source") params.append(key, value);
        });

        const response = await axios.get(`${API_URL}/videos?${params}`, {
          withCredentials: true,
        });
        setVideos(response.data.data.videos || []);
      }
    } catch (error) {
      console.error("Error fetching videos:", error);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchVideos();
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      category: "",
      minDuration: "",
      maxDuration: "",
      uploadDate: "",
      minViews: "",
      maxViews: "",
      creator: "",
      sort: "newest",
      source: "local",
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Advanced Search</h1>

        <form onSubmit={handleSearch} className="bg-gray-800 p-6 rounded-lg mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Search</label>
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search videos..."
                className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Source</label>
              <select
                name="source"
                value={filters.source}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="local">Cinevo (Local)</option>
                <option value="youtube">YouTube</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Creator</label>
              <input
                type="text"
                name="creator"
                value={filters.creator}
                onChange={handleFilterChange}
                placeholder="Creator name..."
                className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Min Duration (sec)</label>
              <input
                type="number"
                name="minDuration"
                value={filters.minDuration}
                onChange={handleFilterChange}
                placeholder="0"
                className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Max Duration (sec)</label>
              <input
                type="number"
                name="maxDuration"
                value={filters.maxDuration}
                onChange={handleFilterChange}
                placeholder="3600"
                className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Min Views</label>
              <input
                type="number"
                name="minViews"
                value={filters.minViews}
                onChange={handleFilterChange}
                placeholder="0"
                className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Max Views</label>
              <input
                type="number"
                name="maxViews"
                value={filters.maxViews}
                onChange={handleFilterChange}
                placeholder="1000000"
                className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Upload Date</label>
              <select
                name="uploadDate"
                value={filters.uploadDate}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Any Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>

            {filters.source === "local" && (
              <div>
                <label className="block text-sm font-medium mb-2">Sort By</label>
                <select
                  name="sort"
                  value={filters.sort}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="views">Most Views</option>
                  <option value="likes">Most Likes</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex gap-4 mt-6">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition"
            >
              Search
            </button>
            <button
              type="button"
              onClick={clearFilters}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-medium transition"
            >
              Clear Filters
            </button>
          </div>
        </form>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-400">Searching...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.map((video) => (
              video.isYoutube ? (
                <Link
                  key={video._id}
                  to={`/youtube/${video.youtubeId}`}
                  className="bg-gray-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-red-500 transition group"
                >
                  <div className="relative">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                      YouTube
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-red-400 transition-colors">
                      {video.title}
                    </h3>
                    <p className="text-sm text-gray-400 mb-2">{video.owner?.username}</p>
                  </div>
                </Link>
              ) : (
                <Link
                  key={video._id}
                  to={`/videos/${video._id}`}
                  className="bg-gray-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-500 transition"
                >
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                      {video.title}
                    </h3>
                    <p className="text-sm text-gray-400 mb-2">{video.owner?.username}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>{video.views?.toLocaleString()} views</span>
                      <span>{Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}</span>
                    </div>
                  </div>
                </Link>
              )
            ))}
          </div>
        )}

        {!loading && videos.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-xl">No videos found</p>
            <p className="mt-2">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
