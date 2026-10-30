const express = require("express");
const router = express.Router();

const {
  getCurrentUser,
  updateUserProfile,
  getFreelancers,
  getUserById,
  addPortfolioItem,
  deletePortfolioItem,
  searchUsers,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

router.get("/me", protect, getCurrentUser);
router.get("/search", protect, searchUsers);
router.put("/profile", protect, updateUserProfile);
router.post("/portfolio", protect, addPortfolioItem);
router.delete("/portfolio/:itemId", protect, deletePortfolioItem);
router.get("/freelancers", protect, getFreelancers);
router.get("/:id", protect, getUserById);

module.exports = router;
