const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  createMilestone,
  getWorkplaceMilestones,
  getMilestoneById,
  updateMilestone,
  addTaskToMilestone,
  addDeliverable,
  updateDeliverableStatus,
  deleteMilestone,
} = require("../controllers/milestoneController");

const router = express.Router();

// All routes require authentication
router.use(protect);

// Milestone routes
router.post("/", createMilestone);
router.get("/workplace/:workplaceId", getWorkplaceMilestones);
router.get("/:id", getMilestoneById);
router.put("/:id", updateMilestone);
router.post("/:id/tasks", addTaskToMilestone);
router.post("/:id/deliverables", addDeliverable);
router.put("/:id/deliverables/:deliverableIndex", updateDeliverableStatus);
router.delete("/:id", deleteMilestone);

module.exports = router;
