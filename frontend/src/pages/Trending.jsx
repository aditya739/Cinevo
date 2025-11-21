import React from "react";
import { Link } from "react-router-dom";
import api from "../services/api.jsx";

export default function Trending() {
  const [videos, setVideos] = React.useState([]);
  const [timeframe, setTimeframe] = React.useState("week");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    const fetchTrending = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get(`/trending?timeframe=${timeframe}`);
        // Safely extract videos array
        const arr = res?.data?.videos ?? res?.videos ?? res;
        setVideos(Array.isArray(arr) ? arr : []);
      } catch (e) {
        console.error("Error fetching trending:", e.message);
        setError("Unable to fetch trending videos. Is the backend running?");
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, [timeframe]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Trending Videos</h1>
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2"
        >
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {Array.from({length:10}).map((_,i) => (
            <div key={i} className="flex gap-4 bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
              <div className="w-32 h-20 bg-gray-200 rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {videos.map((video, index) => (
            <Link
              key={video._id}
              to={`/videos/${video._id}`}
              className="flex gap-4 bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full text-sm font-bold text-gray-600">
                {index + 1}
              </div>
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-32 h-20 object-cover rounded"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{video.title}</h3>
                <p className="text-sm text-gray-600">{video.owner?.username}</p>
                <p className="text-sm text-gray-500">{video.views} views</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}