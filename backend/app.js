const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const projectRoutes = require("./routes/projectRoutes");
const proposalRoutes = require("./routes/proposalRoutes");
const messageRoutes = require("./routes/messageRoutes");
const aiRoutes = require("./routes/aiRoutes");
const adminRoutes = require("./routes/adminRoutes");
const workplaceRoutes = require("./routes/workplaceRoutes");
const taskRoutes = require("./routes/taskRoutes");
const milestoneRoutes = require("./routes/milestoneRoutes");
const fileRoutes = require("./routes/fileRoutes");
const workplaceMessageRoutes = require("./routes/workplaceMessageRoutes");
const reportRoutes = require("./routes/reportRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const postRoutes = require("./routes/postRoutes");
const showcaseRoutes = require("./routes/showcaseRoutes");
const connectionRoutes = require("./routes/connectionRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/proposals", proposalRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/workplaces", workplaceRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/milestones", milestoneRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/workspace-messages", workplaceMessageRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/showcase", showcaseRoutes);
app.use("/api/connections", connectionRoutes);

// Docs Route
app.get("/docs", (req, res) => {
  res.status(200).json({
    success: true,
    message: "SkillBridge AI Backend API Documentation",
    routes: {
      root: "/",
      auth: "/api/auth",
      users: "/api/users",
      projects: "/api/projects",
      proposals: "/api/proposals",
      messages: "/api/messages",
      ai: "/api/ai",
    },
  });
});

// Health Check & Database Status Route
app.get("/api/health", (req, res) => {
  const mongoose = require("mongoose");
  const isConnected = mongoose.connection.readyState === 1;
  res.status(200).json({
    success: true,
    database: {
      provider: "MongoDB Atlas",
      status: isConnected ? "Connected" : "Connecting/Disconnected",
      readyState: mongoose.connection.readyState,
      dbName: mongoose.connection.name || "skillbridge",
      host: mongoose.connection.host || "Cluster0",
    },
    service: "SkillBridge AI API",
    timestamp: new Date().toISOString(),
  });
});

// Test Route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 Welcome to SkillBridge AI Backend API (Powered by MongoDB)",
  });
});

module.exports = app;
