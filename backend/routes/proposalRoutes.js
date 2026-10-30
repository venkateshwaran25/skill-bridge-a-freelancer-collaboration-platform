const express = require("express");
const router = express.Router();
const {
  createProposal,
  getProjectProposals,
  getMyProposals,
  updateProposalStatus,
} = require("../controllers/proposalController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createProposal);
router.get("/my", protect, getMyProposals);
router.get("/my-proposals", protect, getMyProposals);
router.get("/project/:projectId", protect, getProjectProposals);
router.put("/:id/status", protect, updateProposalStatus);

module.exports = router;
