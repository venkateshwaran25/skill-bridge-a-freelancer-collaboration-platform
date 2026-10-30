const express = require("express");
const router = express.Router();
const {
  getSuggestedConnections,
  sendConnectionRequest,
  respondToConnectionRequest,
  getPendingRequests,
  getMyConnections,
} = require("../controllers/connectionController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/suggested", getSuggestedConnections);
router.get("/pending", getPendingRequests);
router.get("/my-connections", getMyConnections);
router.post("/request", sendConnectionRequest);
router.put("/request/:connectionId", respondToConnectionRequest);

module.exports = router;
