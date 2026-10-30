const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
const {
  getDashboardStats,
  getAllUsers,
  deleteUser,
  updateUserRole,
  getAllProjects,
  adminDeleteProject,
  getAllProposals,
  updateProjectLimit,
  getAllPosts,
  deletePost,
  deletePostComment,
  getAllReviews,
  adminDeleteReview,
  adminDeleteProposal,
  toggleUserSuspension,
  getAllShowcases,
  toggleFeatureShowcase,
  adminDeleteShowcase,
  getAllPayments,
  adminReleasePayment,
  getAllWorkspaces,
  getAllReports,
} = require("../controllers/adminController");

// All admin routes are protected + admin-only
router.use(protect, adminOnly);

// Dashboard stats
router.get("/dashboard", getDashboardStats);

// User management
router.get("/users", getAllUsers);
router.put("/users/:id/role", updateUserRole);
router.put("/users/:id/suspend", toggleUserSuspension);
router.delete("/users/:id", deleteUser);

// Project management & Proposal Limits
router.get("/projects", getAllProjects);
router.put("/projects/:id/limit", updateProjectLimit);
router.delete("/projects/:id", adminDeleteProject);

// Proposal management
router.get("/proposals", getAllProposals);
router.delete("/proposals/:id", adminDeleteProposal);

// Community Posts & Comments Moderation
router.get("/posts", getAllPosts);
router.delete("/posts/:id", deletePost);
router.delete("/posts/:postId/comments/:commentId", deletePostComment);

// Reviews Moderation
router.get("/reviews", getAllReviews);
router.delete("/reviews/:id", adminDeleteReview);

// Showcase Moderation & Featuring
router.get("/showcases", getAllShowcases);
router.put("/showcases/:id/feature", toggleFeatureShowcase);
router.delete("/showcases/:id", adminDeleteShowcase);

// Payment & Escrow Governance
router.get("/payments", getAllPayments);
router.put("/payments/:id/release", adminReleasePayment);

// Workplace Audit & AI Risk Reports
router.get("/workspaces", getAllWorkspaces);
router.get("/reports", getAllReports);

module.exports = router;
