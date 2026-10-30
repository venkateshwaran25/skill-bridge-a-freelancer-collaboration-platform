const Post = require("../models/Post");

const createPost = async (req, res) => {
  try {
    const { content, postType, techStack, image, projectUrl } = req.body;
    if (!content) {
      return res.status(400).json({ success: false, message: "Content is required" });
    }

    const post = await Post.create({
      author: req.user._id,
      content,
      postType: postType || "general",
      techStack: Array.isArray(techStack)
        ? techStack
        : techStack
        ? techStack.split(",").map((s) => s.trim())
        : [],
      image: image || "",
      projectUrl: projectUrl || "",
    });

    const populatedPost = await Post.findById(post._id).populate(
      "author",
      "name title profileImage avatar rating"
    );

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      post: populatedPost,
    });
  } catch (error) {
    console.error("Create post error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getFeedPosts = async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};

    if (category && category !== "All") {
      query.postType = category.toLowerCase().replace(/\s+/g, "_");
    }

    if (search) {
      query.$or = [
        { content: { $regex: search, $options: "i" } },
        { techStack: { $in: [new RegExp(search, "i")] } },
      ];
    }

    const posts = await Post.find(query)
      .populate("author", "name title profileImage avatar rating role")
      .populate("comments.user", "name title profileImage")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: posts.length,
      posts,
    });
  } catch (error) {
    console.error("Get feed posts error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const toggleLikePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const userIdStr = req.user._id.toString();
    const index = post.likes.findIndex((userId) => userId.toString() === userIdStr);

    if (index > -1) {
      post.likes.splice(index, 1);
    } else {
      post.likes.push(req.user._id);
    }

    await post.save();
    res.status(200).json({
      success: true,
      likesCount: post.likes.length,
      isLiked: index === -1,
    });
  } catch (error) {
    console.error("Toggle post like error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, message: "Comment text required" });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    post.comments.push({
      user: req.user._id,
      text,
      createdAt: new Date(),
    });

    await post.save();

    const updatedPost = await Post.findById(id).populate(
      "comments.user",
      "name title profileImage"
    );

    res.status(200).json({
      success: true,
      comments: updatedPost.comments,
    });
  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const comment = post.comments.id(commentId) || post.comments.find(c => c._id.toString() === commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    // Check if user is comment author or admin
    if (comment.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized to delete this comment" });
    }

    post.comments = post.comments.filter(c => c._id.toString() !== commentId);
    await post.save();

    const updatedPost = await Post.findById(id).populate("comments.user", "name title profileImage");

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
      comments: updatedPost.comments,
    });
  } catch (error) {
    console.error("Delete comment error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  createPost,
  getFeedPosts,
  toggleLikePost,
  addComment,
  deleteComment,
};
