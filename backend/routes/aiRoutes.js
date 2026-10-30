const express = require("express");
const router = express.Router();
const {
  getMatchedProjects,
  getMatchedFreelancers,
  generateProposal,
  optimizeDescription,
  handleAIChat,
  getAIChatSessions,
  renameAIChatSession,
  deleteAIChatSession,
  clearAllAIChatSessions,
  suggestBudget,
} = require("../controllers/aiController");
const { protect } = require("../middleware/authMiddleware");

// Public/Guest accessible chat endpoint & session routes
router.post("/chat", handleAIChat);
router.get("/chat/sessions", getAIChatSessions);
router.put("/chat/sessions/:sessionId/rename", renameAIChatSession);
router.delete("/chat/sessions/:sessionId", deleteAIChatSession);
router.delete("/chat/sessions", clearAllAIChatSessions);

// Protected routes requiring authentication
router.use(protect);

router.get("/matched-projects", getMatchedProjects);
router.get("/matched-freelancers/:projectId", getMatchedFreelancers);
router.post("/generate-proposal", generateProposal);
router.post("/optimize-description", optimizeDescription);
router.post("/suggest-budget", suggestBudget);

module.exports = router;
