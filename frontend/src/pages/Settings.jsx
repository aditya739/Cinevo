import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../services/auth.jsx";
import api from "../services/api.jsx";

export default function Settings() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");
  
  const [formData, setFormData] = React.useState({
    fullName: user?.fullName || "",
    bio: user?.bio || "",
    email: user?.email || "",
  });

  if (!user) {
    return (
      <div className="text-center py-16">
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-6 py-4 rounded-lg inline-block">
          Please login to access settings.
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const res = await api.patch("/users/profile", formData);
      const updatedUser = res?.data || res;
      
      // Update auth context
      login(updatedUser);
      setSuccess("Profile updated successfully!");
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err?.data?.message || err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    const oldPassword = prompt("Enter current password:");
    if (!oldPassword) return;
    
    const newPassword = prompt("Enter new password:");
    if (!newPassword) return;
    
    const confirmPassword = prompt("Confirm new password:");
    if (confirmPassword !== newPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      await api.post("/users/change-password", {
        oldPassword,
        newPassword
      });
      setSuccess("Password changed successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err?.data?.message || err.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      logout();
      navigate("/login");
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Profile Settings */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Information</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Tell us about yourself..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>

      {/* Security Settings */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Security</h2>
        
        <button
          onClick={handleChangePassword}
          disabled={loading}
          className="w-full bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Change Password
        </button>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-lg shadow border-l-4 border-red-500 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Logout</h2>
        
        <button
          onClick={handleLogout}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
