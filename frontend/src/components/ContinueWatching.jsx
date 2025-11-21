import React, { useState, useEffect } from "react";
import api from "../services/api.jsx";

const ContinueWatching = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContinueWatching = async () => {
      try {
        const response = await api.get("/watch-progress/continue-watching");
        setVideos(response.data || []);
      } catch (error) {
        console.error("Error fetching continue watching:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContinueWatching();
  }, []);

  if (loading) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Continue Watching</h2>
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-40 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (videos.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Continue Watching</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {videos.map((item) => (
          <Link
            key={item._id}
            to={`/video/${item.video._id}`}
            className="bg-gray-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-500 transition group"
          >
            <div className="relative">
              <img
                src={item.video.thumbnail}
                alt={item.video.title}
                className="w-full h-40 object-cover"
              />
              {/* Progress Bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-600">
                <div
                  className="h-full bg-red-600"
                  style={{ width: `${item.progress}%` }}
                ></div>
              </div>
              {/* Duration */}
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 px-2 py-1 rounded text-xs">
                {Math.floor(item.video.duration / 60)}:{String(item.video.duration % 60).padStart(2, '0')}
              </div>
            </div>
            <div className="p-3">
              <h3 className="font-semibold text-sm mb-1 line-clamp-2 group-hover:text-blue-400 transition">
                {item.video.title}
              </h3>
              <p className="text-xs text-gray-400">{item.video.owner?.username}</p>
              <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                <span>{item.video.views?.toLocaleString()} views</span>
                <span>•</span>
                <span>{Math.round(item.progress)}% watched</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ContinueWatching;
