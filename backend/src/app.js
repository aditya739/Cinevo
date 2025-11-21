// app.js
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// -------------------------
// CORS (enhanced for Vercel)
// -------------------------
const allowedOrigins = [
  'http://localhost:5173',
  'https://cinevo-xi.vercel.app',
  'https://cinevo-xi.vercel.app/',
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        callback(null, true); // Allow all for now, can restrict later
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    exposedHeaders: ["Set-Cookie"],
  })
);



// -------------------------
// Body parsers / static / cookies
// -------------------------
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// -------------------------
// Routes import
// -------------------------
import userRouter from "./routes/user.routes.js";
import healthcheckRouter from "./routes/healthcheck.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import videoRouter from "./routes/video.routes.js";
import commentRouter from "./routes/comment.routes.js";
import likeRouter from "./routes/like.routes.js";
import playlistRouter from "./routes/playlist.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";
import youtubeRouter from "./routes/youtube.routes.js";
import collectionRouter from "./routes/collection.routes.js";
import reportRouter from "./routes/report.routes.js";
import trendingRouter from "./routes/trending.routes.js";
import watchHistoryRouter from "./routes/watchHistory.routes.js";

// -------------------------
// Routes declaration
// -------------------------
// Root route for testing
app.get("/", (req, res) => {
  res.json({ message: "Cinevo Backend API is running!", status: "OK" });
});

app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/tweets", tweetRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/playlists", playlistRouter);
app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/v1/youtube", youtubeRouter);
app.use("/api/v1/collections", collectionRouter);
app.use("/api/v1/reports", reportRouter);
app.use("/api/v1/trending", trendingRouter);
app.use("/api/v1/watch-history", watchHistoryRouter);

// -------------------------
// Global error handler (safeguard)
// -------------------------
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);

  const status = err.statusCode || err.status || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({
    success: false,
    statusCode: status,
    message,
    data: err.data ?? null,
    errors: err.errors ?? [],
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});




export { app };
