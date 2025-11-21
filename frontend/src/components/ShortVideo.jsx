import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";

const ShortVideo = ({ video, isActive, toggleLike, toggleFollow }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (isActive) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(error => console.log("Autoplay prevented", error));
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [isActive]);

  const handleVideoClick = () => {
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="relative w-full h-full bg-black snap-start flex justify-center items-center">
      {/* Video Player */}
      <video
        ref={videoRef}
        src={video.videoFile}
        className="h-full w-auto max-w-full object-cover"
        loop
        playsInline
        onClick={handleVideoClick}
      />

      {/* Overlay UI */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white">
        <div className="flex justify-between items-end">
          {/* Left Side: Info */}
          <div className="flex-1 mr-4">
            <div className="flex items-center mb-2">
              <img
                src={video.owner?.avatar || "https://via.placeholder.com/40"}
                alt={video.owner?.username}
                className="w-10 h-10 rounded-full border-2 border-white mr-2"
              />
              <div>
                <h3 className="font-bold text-sm">@{video.owner?.username}</h3>
                <button 
                  onClick={() => toggleFollow(video.owner?._id)}
                  className="text-xs bg-red-600 px-2 py-1 rounded-full mt-1 hover:bg-red-700 transition"
                >
                  Follow
                </button>
              </div>
            </div>
            <p className="text-sm line-clamp-2 mb-2">{video.description || video.title}</p>
          </div>

          {/* Right Side: Actions */}
          <div className="flex flex-col items-center gap-4">
            <button onClick={() => toggleLike(video._id)} className="flex flex-col items-center">
              <div className={`p-3 rounded-full bg-gray-800/50 hover:bg-gray-700/50 transition ${video.userReaction === 'like' ? 'text-red-500' : 'text-white'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
                </svg>
              </div>
              <span className="text-xs mt-1">{video.likes}</span>
            </button>

            <button className="flex flex-col items-center">
              <div className="p-3 rounded-full bg-gray-800/50 hover:bg-gray-700/50 transition text-white">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 0 0 6 21.75a6.721 6.721 0 0 0 3.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 0 1-.814 1.686.75.75 0 0 0 .44 1.223ZM8.25 10.875a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25ZM10.875 12a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Zm4.875-1.125a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25Z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-xs mt-1">Comment</span>
            </button>

            <button className="flex flex-col items-center">
              <div className="p-3 rounded-full bg-gray-800/50 hover:bg-gray-700/50 transition text-white">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path fillRule="evenodd" d="M15.75 4.5a3 3 0 1 1 .825 2.066l-8.421 4.679a3.002 3.002 0 0 1 0 1.51l8.421 4.679a3 3 0 1 1-.729 1.31l-8.421-4.678a3 3 0 1 1 0-4.132l8.421-4.679a3 3 0 0 1-.096-.755Z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-xs mt-1">Share</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShortVideo;
