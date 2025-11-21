import React, { useState, useEffect, useRef } from "react";
import ShortVideo from "../components/ShortVideo";
import api from "../services/api.jsx";

const Shorts = () => {
  const [shorts, setShorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    fetchShorts();
  }, []);

  const fetchShorts = async () => {
    try {
      const res = await api.get(`/videos/shorts/feed?limit=5`);
      // Safely extract shorts array
      const arr = res?.data?.shorts ?? res?.data ?? res;
      const shortsArray = Array.isArray(arr) ? arr : [];
      setShorts(prev => [...prev, ...shortsArray]);
      setError("");
    } catch (error) {
      console.error("Error fetching shorts:", error.message);
      setError("Unable to fetch shorts. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollTop, clientHeight, scrollHeight } = containerRef.current;
      const index = Math.round(scrollTop / clientHeight);
      if (index !== activeIndex) {
        setActiveIndex(index);
      }

      // Infinite scroll: fetch more when near bottom
      if (scrollHeight - scrollTop - clientHeight < clientHeight * 2) {
        // Debounce or check if already fetching could be added here
        // For simplicity, we'll rely on the user scrolling slowly enough or add a flag
      }
    }
  };

  // Simple infinite scroll trigger
  useEffect(() => {
    if (activeIndex >= shorts.length - 2 && shorts.length > 0) {
      fetchShorts();
    }
  }, [activeIndex]);

  const toggleLike = async (videoId) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/videos/${videoId}/react`, 
        { type: 'like' },
        { withCredentials: true }
      );
      // Optimistic update
      setShorts(prev => prev.map(video => {
        if (video._id === videoId) {
          const isLiked = video.userReaction === 'like';
          return {
            ...video,
            userReaction: isLiked ? null : 'like',
            likes: isLiked ? video.likes - 1 : video.likes + 1
          };
        }
        return video;
      }));
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const toggleFollow = (ownerId) => {
    console.log("Follow toggled for", ownerId);
    // Implement follow logic here
  };

  if (loading && shorts.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-black text-white">
        <div className="mb-4">Loading Shorts...</div>
        {error && (
          <div className="bg-red-600 px-4 py-2 rounded text-sm">
            {error}
          </div>
        )}
      </div>
    );
  }

  if (error && shorts.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen bg-black text-white">
        <div className="text-center">
          <div className="text-xl mb-4">❌ Unable to Load Shorts</div>
          <div className="text-gray-400">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      onScroll={handleScroll}
      className="h-[calc(100vh-64px)] w-full overflow-y-scroll snap-y snap-mandatory bg-black no-scrollbar"
      style={{ scrollBehavior: 'smooth' }}
    >
      {shorts.map((video, index) => (
        <div key={`${video._id}-${index}`} className="h-full w-full snap-start">
          <ShortVideo 
            video={video} 
            isActive={index === activeIndex}
            toggleLike={toggleLike}
            toggleFollow={toggleFollow}
          />
        </div>
      ))}
    </div>
  );
};

export default Shorts;
