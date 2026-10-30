const express = require("express");
const router = express.Router();
const {
  createShowcase,
  getShowcaseItems,
  getShowcaseById,
  toggleLikeShowcase,
} = require("../controllers/showcaseController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/", getShowcaseItems);
router.get("/:id", getShowcaseById);
router.post("/", createShowcase);
router.put("/:id/like", toggleLikeShowcase);

module.exports = router;
