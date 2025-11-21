import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../services/auth.jsx";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("analytics");
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if user is admin on mount
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role !== "admin") {
      setError("Unauthorized: Only admins can access this page");
      setTimeout(() => navigate("/"), 2000);
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    if (activeTab === "analytics") {
      fetchAnalytics();
    } else if (activeTab === "users") {
      fetchUsers();
    } else if (activeTab === "reports") {
      fetchReports();
    }
  }, [activeTab]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/admin/analytics`, {
        withCredentials: true,
      });
      setAnalytics(response.data.data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      alert("Failed to fetch analytics. Make sure you're an admin.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/admin/users?limit=50`, {
        withCredentials: true,
      });
      setUsers(response.data.data.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/admin/reports?limit=50`, {
        withCredentials: true,
      });
      setReports(response.data.data.reports || []);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async (userId) => {
    if (!confirm("Are you sure you want to ban/unban this user?")) return;

    try {
      await axios.patch(`${API_URL}/admin/users/${userId}/ban`, {}, {
        withCredentials: true,
      });
      alert("User ban status updated");
      fetchUsers();
    } catch (error) {
      console.error("Error banning user:", error);
      alert("Failed to update user ban status");
    }
  };

  const handleDeleteVideo = async (videoId) => {
    if (!confirm("Are you sure you want to delete this video?")) return;

    try {
      await axios.delete(`${API_URL}/admin/videos/${videoId}`, {
        withCredentials: true,
      });
      alert("Video deleted successfully");
      fetchReports();
    } catch (error) {
      console.error("Error deleting video:", error);
      alert("Failed to delete video");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

        {/* Error Display */}
        {error && (
          <div className="bg-red-600 text-white p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Prevent rendering if not admin */}
        {!user || user.role !== "admin" ? (
          <div className="text-center py-12">
            <p className="text-gray-400">Redirecting...</p>
          </div>
        ) : (
          <>
        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-700">
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-6 py-3 font-medium transition ${
              activeTab === "analytics"
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-6 py-3 font-medium transition ${
              activeTab === "users"
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`px-6 py-3 font-medium transition ${
              activeTab === "reports"
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Reports
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Analytics Tab */}
            {activeTab === "analytics" && analytics && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Total Users</h3>
                  <p className="text-4xl font-bold">{analytics.users.totalUsers}</p>
                  <p className="text-sm mt-2 text-blue-200">
                    {analytics.users.adminUsers} admins
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Total Videos</h3>
                  <p className="text-4xl font-bold">{analytics.videos.totalVideos}</p>
                  <p className="text-sm mt-2 text-purple-200">
                    {analytics.videos.shorts} shorts
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-600 to-green-800 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Total Views</h3>
                  <p className="text-4xl font-bold">
                    {analytics.videos.totalViews?.toLocaleString()}
                  </p>
                  <p className="text-sm mt-2 text-green-200">
                    {analytics.engagement.viewsLast7Days?.toLocaleString()} last 7 days
                  </p>
                </div>

                <div className="bg-gradient-to-br from-red-600 to-red-800 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Banned Users</h3>
                  <p className="text-4xl font-bold">{analytics.users.bannedUsers}</p>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === "users" && (
              <div className="bg-gray-800 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left">Username</th>
                      <th className="px-6 py-3 text-left">Email</th>
                      <th className="px-6 py-3 text-left">Role</th>
                      <th className="px-6 py-3 text-left">Status</th>
                      <th className="px-6 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id} className="border-t border-gray-700">
                        <td className="px-6 py-4">{user.username}</td>
                        <td className="px-6 py-4">{user.email}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              user.role === "admin"
                                ? "bg-purple-600"
                                : "bg-gray-600"
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              user.isBanned ? "bg-red-600" : "bg-green-600"
                            }`}
                          >
                            {user.isBanned ? "Banned" : "Active"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {user.role !== "admin" && (
                            <button
                              onClick={() => handleBanUser(user._id)}
                              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-sm transition"
                            >
                              {user.isBanned ? "Unban" : "Ban"}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Reports Tab */}
            {activeTab === "reports" && (
              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report._id} className="bg-gray-800 p-6 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">
                          {report.video?.title || "Deleted Video"}
                        </h3>
                        <p className="text-gray-400 mb-2">
                          <span className="font-medium">Reason:</span> {report.reason}
                        </p>
                        <p className="text-sm text-gray-500">
                          Reported by: {report.reportedBy?.username} •{" "}
                          {new Date(report.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {report.video && (
                        <button
                          onClick={() => handleDeleteVideo(report.video._id)}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition"
                        >
                          Delete Video
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {reports.length === 0 && (
                  <p className="text-center text-gray-400 py-12">No reports found</p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
