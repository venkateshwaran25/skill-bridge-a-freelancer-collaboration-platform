const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  createTask,
  getWorkplaceTasks,
  getTaskById,
  updateTask,
  addTaskComment,
  deleteTask,
} = require("../controllers/taskController");

const router = express.Router();

// All routes require authentication
router.use(protect);

// Task routes
router.post("/", createTask);
router.get("/workplace/:workplaceId", getWorkplaceTasks);
router.get("/:id", getTaskById);
router.put("/:id", updateTask);
router.post("/:id/comments", addTaskComment);
router.delete("/:id", deleteTask);

module.exports = router;
