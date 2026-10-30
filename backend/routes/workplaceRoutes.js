const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  createWorkplace,
  getWorkplaces,
  getWorkplaceById,
  getWorkplaceByProject,
  updateWorkplace,
  addMember,
  getWorkplaceStats,
} = require("../controllers/workplaceController");

const router = express.Router();

// All routes require authentication
router.use(protect);

// Workplace routes
router.post("/", createWorkplace);
router.get("/", getWorkplaces);
router.get("/project/:projectId", getWorkplaceByProject);
router.get("/:id", getWorkplaceById);
router.put("/:id", updateWorkplace);
router.post("/:id/members", addMember);
router.get("/:id/stats", getWorkplaceStats);

module.exports = router;
