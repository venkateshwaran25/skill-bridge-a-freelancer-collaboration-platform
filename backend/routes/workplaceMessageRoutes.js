const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  sendWorkplaceMessage,
  getWorkplaceMessages,
  markMessageAsRead,
  getUnreadCount,
} = require("../controllers/workplaceMessageController");

const router = express.Router();

// All routes require authentication
router.use(protect);

// Workplace message routes
router.post("/", sendWorkplaceMessage);
router.get("/workplace/:workplaceId", getWorkplaceMessages);
router.put("/:id/read", markMessageAsRead);
router.get("/workplace/:workplaceId/unread", getUnreadCount);

module.exports = router;
