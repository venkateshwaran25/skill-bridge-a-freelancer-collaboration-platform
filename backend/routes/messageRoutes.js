const express = require("express");
const router = express.Router();
const {
  getMessagesWithUser,
  sendMessage,
  getConversations,
} = require("../controllers/messageController");
const { protect } = require("../middleware/authMiddleware");

router.get("/conversations", protect, getConversations);
router.get("/:userId", protect, getMessagesWithUser);
router.post("/", protect, sendMessage);

module.exports = router;
