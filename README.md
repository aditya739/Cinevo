# Cinevo - Video Platform

A modern, full-stack video sharing platform built with React and Node.js. Upload, share, discover, and interact with videos in a clean, responsive interface.

## 🚀 Live Demo

[Live Demo Link ](https://cinevo-xi.vercel.app/) <!-- Add your live demo link here -->

## ✨ Features

### Core Features
- **Video Upload & Streaming** - Upload and watch videos with thumbnail generation
- **User Authentication** - Secure registration, login, and JWT-based sessions
- **Video Discovery** - Browse, search, and filter videos by category and date
- **Social Features** - Like, comment, and save videos to collections
- **Trending Content** - Discover popular and trending videos
- **User Profiles** - View user channels with their videos and statistics
- **User Settings** - Manage profile information, security settings, and password
- **Collections** - Create and manage video playlists
- **Watch History** - Track and revisit watched videos
- **YouTube Integration** - Search and embed YouTube content
- **Shorts** - Vertical video feed with swipe navigation (TikTok-style)
- **Admin Dashboard** - Analytics, user management, and content moderation

### Advanced Features
- **Real-time Comments** - Interactive comment system
- **Video Reports** - Content moderation and reporting system
- **Responsive Design** - Mobile-first, cross-device compatibility
- **Dark/Light Theme** - Theme switching support
- **Advanced Search** - Search videos by title, creator, category, duration, views, and upload date
- **YouTube Search Integration** - Search YouTube videos directly from the app
- **Subscription System** - Follow creators and get updates
- **Error Handling** - Graceful error handling with user-friendly messages
- **Loading States** - Smooth loading indicators throughout the app

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern UI library with hooks
- **React Router DOM v6** - Client-side routing
- **Tailwind CSS v3** - Utility-first CSS framework
- **Vite v7.2.4** - Fast build tool and dev server (with security fixes)
- **Context API** - State management for auth and themes
- **Custom API Service** - Centralized API calls with error handling and token refresh

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT** - JSON Web Tokens for authentication
- **Cloudinary** - Media storage and optimization
- **Multer** - File upload handling
- **bcrypt** - Password hashing

### DevOps & Tools
- **ESLint** - Code linting and formatting
- **Prettier** - Code formatting
- **CORS** - Cross-origin resource sharing
- **Cookie Parser** - HTTP cookie parsing

## 📁 Project Structure

```
Cinevo/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── models/         # Database schemas
│   │   ├── routes/         # API endpoints
│   │   ├── middlewares/    # Auth & file upload
│   │   ├── utils/          # Helper functions
│   │   └── db/            # Database connection
│   ├── public/temp/       # Temporary file storage
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/     # Reusable UI components
    │   ├── pages/         # Route components
    │   │   ├── Home.jsx
    │   │   ├── VideoPage.jsx
    │   │   ├── Channel.jsx          # NEW: User channel/profile
    │   │   ├── Settings.jsx         # NEW: User settings
    │   │   ├── Collections.jsx
    │   │   ├── Trending.jsx
    │   │   ├── Shorts.jsx
    │   │   ├── SearchPage.jsx
    │   │   ├── Upload.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   └── AdminDashboard.jsx
    │   ├── services/      # API & auth services
    │   │   ├── api.jsx    # Centralized API with error handling
    │   │   └── auth.jsx   # Authentication context
    │   ├── contexts/      # React contexts
    │   │   └── ThemeContext.jsx
    │   └── assets/        # Static assets
    └── package.json
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Cloudinary account (for media storage)

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd Cinevo
```

2. **Backend Setup**
```bash
cd backend
npm install
```

3. **Frontend Setup**
```bash
cd ../frontend
npm install
```

4. **Environment Configuration**

Create `.env` files in both backend and frontend directories:

**Backend `.env`:**
```env
PORT=8000
MONGODB_URI=your_mongodb_connection_string
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
DB_NAME=Backend

ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=10d

CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

YOUTUBE_API_KEY=your_youtube_api_key
YOUTUBE_REGION=IN
```

**Frontend `.env`:**
```env
VITE_API_URL=http://localhost:8000/api/v1
```

### Running the Application

1. **Start Backend Server**
```bash
cd backend
npm run dev
```

2. **Start Frontend Development Server**
```bash
cd frontend
npm run dev
```

3. **Access the Application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/v1/users/register` - User registration
- `POST /api/v1/users/login` - User login
- `POST /api/v1/users/logout` - User logout
- `GET /api/v1/users/current-user` - Get current user

### Video Endpoints
- `GET /api/v1/videos` - Get all videos (with search/filter)
- `GET /api/v1/videos/shorts/feed` - Get shorts feed
- `POST /api/v1/videos` - Upload new video
- `GET /api/v1/videos/:id` - Get video by ID
- `PATCH /api/v1/videos/:id` - Update video
- `DELETE /api/v1/videos/:id` - Delete video

### Social Features
- `POST /api/v1/likes/toggle/v/:videoId` - Toggle video like
- `POST /api/v1/comments/:videoId` - Add comment
- `GET /api/v1/comments/:videoId` - Get video comments
- `POST /api/v1/collections` - Create collection
- `GET /api/v1/collections` - Get user collections

## 🎯 Usage

### For Users
1. **Register/Login** - Create an account or sign in
2. **Browse Videos** - Explore content on the home page
3. **Search & Filter** - Find specific videos using search and filters
4. **Watch Videos** - Click on any video to watch and interact
5. **Engage** - Like, comment, and save videos to collections
6. **Upload Content** - Share your own videos with the community

### For Developers
1. **API Integration** - Use the RESTful API for custom integrations
2. **Component Reuse** - Leverage React components for rapid development
3. **Database Models** - Extend MongoDB schemas for new features
4. **Authentication** - Implement JWT-based auth in your applications

## 🔧 Configuration

### Database Setup
The application uses MongoDB with the following collections:
- Users, Videos, Comments, Likes, Collections, Playlists, Subscriptions, Reports, Watch History

### File Upload
- Videos and thumbnails are stored on Cloudinary
- Temporary files are handled via Multer middleware
- Supported formats: MP4, JPG, PNG

### Security Features
- JWT token authentication
- Password hashing with bcrypt
- CORS protection
- Input validation and sanitization

## 🐛 Recent Fixes & Updates

### v1.4 - Complete Error Handling & New Pages (Latest)
**Major Improvements:**
1. Created Channel page (`/c/:username`) - View user profiles and their videos
2. Created Settings page (`/settings`) - User profile settings, security, and logout
3. Fixed all "y.data.data is not iterable" errors across the app
4. Improved error handling on all video fetch pages (Home, Trending, Shorts, Collections, SearchPage)
5. Switched all pages to use consistent `api` service instead of axios
6. Added proper error messages and loading states everywhere
7. Updated Vite from v4.5.3 to v7.2.4 (fixed security vulnerabilities)
8. Updated baseline-browser-mapping to latest version

**Features Added:**
- **Channel Page** - View any user's profile with their videos and statistics
- **Settings Page** - Manage profile info, change password, and logout
- **Improved Error Handling** - All pages now gracefully handle backend connection issues
- **User-Friendly Error Messages** - Clear feedback when things go wrong

**Files Modified:**
- `frontend/src/pages/Channel.jsx` - NEW: User channel/profile page
- `frontend/src/pages/Settings.jsx` - NEW: User settings and profile management
- `frontend/src/App.jsx` - Added new routes and imports
- `frontend/src/pages/Collections.jsx` - Improved error handling
- `frontend/src/pages/Trending.jsx` - Fixed array validation
- `frontend/src/pages/Shorts.jsx` - Fixed error handling
- `frontend/src/pages/SearchPage.jsx` - Fixed YouTube search, improved error handling
- `frontend/src/services/api.jsx` - Better 401 error handling
- `frontend/src/services/auth.jsx` - Improved payload validation
- `package.json` - Updated dependencies

### v1.3 - Token Refresh & Auth Improvements
**Issues Fixed:**
- 401 error loop when refresh token missing
- Invalid data parsing when setting user state
- Missing error handling for null/missing refresh tokens

**Solutions:**
- Check if refreshToken exists before attempting refresh
- Validate payload is valid object before setting user state
- Redirect to login immediately if no refresh token available

### v1.2 - Dependency & Build Fixes
**Improvements:**
- Updated Vite to v7.2.4 (from v4.5.3)
- Fixed JSX syntax errors in AdminDashboard
- Resolved all security vulnerabilities

### Fixed: Infinite Page Reload Loop on Admin Panel (v1.1)
**Issue:** The admin dashboard was causing infinite page reloads redirecting to login repeatedly.

**Root Cause:** 
- AdminDashboard component lacked authentication checks
- When unauthorized (401), the API would redirect to /login
- This created a redirect loop: admin page → 401 → login → loop back → admin

**Solution:**
1. Added `useAuth()` hook in AdminDashboard to check user authentication
2. Added role-based access control - only admins can access the dashboard
3. Non-authenticated users are redirected to login page (no loop)
4. Non-admin users are shown an error message and redirected to home after 2 seconds
5. Updated API error handler to prevent redundant redirects (checks current pathname)

**Files Modified:**
- `frontend/src/pages/AdminDashboard.jsx` - Added auth checks and role validation
- `frontend/src/services/api.jsx` - Improved 401 error handling to prevent redirect loops

## 🛣️ Application Routes

### Public Routes
- `/` - Home page with video feed
- `/login` - User login
- `/register` - User registration
- `/videos/:id` - Video player page
- `/trending` - Trending videos page
- `/shorts` - Short videos feed
- `/search` - Search and filter videos

### Protected Routes (Login Required)
- `/upload` - Upload new video
- `/collections` - User's video collections
- `/c/:username` - User's channel/profile
- `/settings` - User settings and profile management

### Admin Routes (Admin Only)
- `/admin` - Admin dashboard with analytics, user management, and reports

## 🆘 Troubleshooting

### Common Issues & Solutions

#### White Screen / App Won't Load
- **Check 1:** Ensure backend is running on `http://localhost:8000`
- **Check 2:** Verify `VITE_API_URL` is set correctly in frontend `.env`
- **Check 3:** Open browser console (F12) to check for errors
- **Solution:** Restart both frontend and backend servers

#### Backend Connection Refused
- **Issue:** `localhost:8000/api/v1/... Failed to load resource: net::ERR_CONNECTION_REFUSED`
- **Solution:** 
  - Make sure backend server is running: `npm run dev` in backend folder
  - Check PORT in backend `.env` (default: 8000)
  - Verify MongoDB connection string in `.env`

#### Videos Not Loading
- **Issue:** Empty video list or error messages
- **Solution:**
  - Check backend logs for errors
  - Verify Cloudinary credentials in backend `.env`
  - Check MongoDB connection and data

#### Login Issues
- **Issue:** Cannot login or stuck on login page
- **Solution:**
  - Clear browser cache and localStorage
  - Check JWT secrets in backend `.env`
  - Verify user exists in MongoDB

#### Search Not Working
- **Issue:** YouTube search or local search returns no results
- **Solution:**
  - Verify `YOUTUBE_API_KEY` is valid and has quota
  - Check backend `/search` endpoint logs
  - Try searching with different keywords

#### Infinite Loading / Unresponsive UI
- **Issue:** Page keeps loading or freezes
- **Solution:**
  - Check browser console for errors
  - Clear browser cache
  - Restart the dev server
  - Check network tab (F12) for failed requests

#### "y.data.data is not iterable" Error
- **Issue:** TypeError when loading videos
- **Solution:** This has been fixed in v1.4. Update your code to latest version.

#### Port Already in Use
- **Issue:** `Error: listen EADDRINUSE: address already in use :::8000`
- **Solution:**
  - Kill process using port: `lsof -i :8000` (Mac/Linux)
  - Or change PORT in `.env` to a different number
  - Windows: `netstat -ano | findstr :8000` then `taskkill /PID <PID> /F`

#### Build Errors
- **Issue:** Build fails with ESLint or Vite errors
- **Solution:**
  - Clear `node_modules` and `dist` folder
  - Run `npm install` again
  - Check for syntax errors in modified files

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 👨‍💻 Author

**ADITYA SINGH** 

## 🙏 Acknowledgments

- React team for the amazing framework
- MongoDB for the flexible database
- Cloudinary for media management
- Tailwind CSS for the utility-first approach
- All contributors and the open-source community

---

⭐ **Star this repository if you found it helpful!**
