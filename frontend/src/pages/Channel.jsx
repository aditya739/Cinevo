import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../services/auth.jsx";
import api from "../services/api.jsx";

export default function Channel() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [channel, setChannel] = React.useState(null);
  const [videos, setVideos] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        // Fetch channel/user info
        const channelRes = await api.get(`/users/c/${username}`);
        const channelData = channelRes?.data || channelRes;
        setChannel(channelData);

        // Fetch channel videos
        const videosRes = await api.get(`/videos?owner=${username}&limit=20`);
        const videosArr = videosRes?.data?.videos ?? videosRes?.videos ?? videosRes ?? [];
        setVideos(Array.isArray(videosArr) ? videosArr : []);
      } catch (e) {
        console.error("Error fetching channel:", e.message);
        setError("Unable to load channel. Is the backend running?");
      } finally {
        setLoading(false);
      }
    })();
  }, [username]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Loading channel...</p>
        </div>
      </div>
    );
  }

  if (error || !channel) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg inline-block">
          {error || "Channel not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Channel Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32 rounded-lg mb-8 relative">
        <div className="absolute bottom-0 left-6 transform translate-y-1/2">
          <div className="w-24 h-24 rounded-full border-4 border-white bg-white overflow-hidden">
            <img
              src={channel.avatar || `https://ui-avatars.com/api/?name=${channel.username}`}
              alt={channel.username}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Channel Info */}
      <div className="mt-16 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{channel.fullName || channel.username}</h1>
        <p className="text-gray-600">@{channel.username}</p>
        {channel.bio && (
          <p className="text-gray-700 mt-2">{channel.bio}</p>
        )}
        <div className="flex items-center gap-6 mt-4 text-sm text-gray-600">
          <span>📊 {videos.length} videos</span>
          <span>👥 {channel.subscribers || 0} subscribers</span>
        </div>
      </div>

      {/* Videos Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Videos</h2>
        {videos.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No videos yet
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map(video => (
              <div
                key={video._id}
                onClick={() => navigate(`/videos/${video._id}`)}
                className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="aspect-video bg-gray-200 overflow-hidden">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 line-clamp-2">{video.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{video.views || 0} views</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
