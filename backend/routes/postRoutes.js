const express = require("express");
const router = express.Router();
const {
  createPost,
  getFeedPosts,
  toggleLikePost,
  addComment,
  deleteComment,
} = require("../controllers/postController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/", getFeedPosts);
router.post("/", createPost);
router.put("/:id/like", toggleLikePost);
router.post("/:id/comment", addComment);
router.delete("/:id/comment/:commentId", deleteComment);

module.exports = router;
