const User = require("../models/User");
const Project = require("../models/Project");
const Proposal = require("../models/Proposal");
const Message = require("../models/Message");
const Post = require("../models/Post");
const Review = require("../models/Review");
const Showcase = require("../models/Showcase");
const Payment = require("../models/Payment");
const Workplace = require("../models/Workplace");
const Report = require("../models/Report");
const Task = require("../models/Task");

// ─── Dashboard Stats ───────────────────────────────────────────────────────────
const getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalProjects, totalProposals, totalMessages] = await Promise.all([
      User.countDocuments(),
      Project.countDocuments(),
      Proposal.countDocuments(),
      Message.countDocuments(),
    ]);

    const totalClients = await User.countDocuments({ role: "client" });
    const totalFreelancers = await User.countDocuments({ role: "freelancer" });
    const openProjects = await Project.countDocuments({ status: "open" });
    const inProgressProjects = await Project.countDocuments({ status: "in progress" });
    const completedProjects = await Project.countDocuments({ status: "completed" });

    // Recent 5 new users
    const recentUsers = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(5);

    // Recent 5 new projects
    const recentProjects = await Project.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("postedBy", "name email role");

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalClients,
        totalFreelancers,
        totalProjects,
        openProjects,
        inProgressProjects,
        completedProjects,
        totalProposals,
        totalMessages,
      },
      recentUsers,
      recentProjects,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── All Users ─────────────────────────────────────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    const filter = {};

    if (role && role !== "all") {
      filter.role = role;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(filter).select("-password").sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── Delete User ───────────────────────────────────────────────────────────────
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "Cannot delete yourself" });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── Toggle User Role ──────────────────────────────────────────────────────────
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!["client", "freelancer", "admin"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, message: `User role updated to ${role}`, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── All Projects ──────────────────────────────────────────────────────────────
const getAllProjects = async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter = {};

    if (status && status !== "all") filter.status = status;

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const projects = await Project.find(filter)
      .populate("postedBy", "name email role")
      .populate("assignedFreelancer", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: projects.length, projects });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── Delete Project (Admin) ────────────────────────────────────────────────────
const adminDeleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findByIdAndDelete(id);

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    res.status(200).json({ success: true, message: "Project deleted by admin" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── All Proposals ─────────────────────────────────────────────────────────────
const getAllProposals = async (req, res) => {
  try {
    const proposals = await Proposal.find()
      .populate("freelancer", "name email title")
      .populate("project", "title budget status")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: proposals.length, proposals });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── Update Project Max Proposal Limit ──────────────────────────────────────────
const updateProjectLimit = async (req, res) => {
  try {
    const { id } = req.params;
    const { maxProposals } = req.body;

    if (!maxProposals || isNaN(maxProposals) || Number(maxProposals) < 1) {
      return res.status(400).json({ success: false, message: "Valid limit number required (>= 1)" });
    }

    const project = await Project.findByIdAndUpdate(
      id,
      { maxProposals: Number(maxProposals) },
      { new: true }
    ).populate("postedBy", "name email");

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    res.status(200).json({
      success: true,
      message: `Project application limit updated to ${maxProposals}`,
      project,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── Admin Moderate Posts & Comments ──────────────────────────────────────────
const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "name email title role avatar")
      .populate("comments.user", "name email title avatar")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: posts.length, posts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findByIdAndDelete(id);

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    res.status(200).json({ success: true, message: "Post deleted by admin moderation" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const deletePostComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    post.comments = post.comments.filter(
      (c) => c._id.toString() !== commentId
    );

    await post.save();

    const updatedPost = await Post.findById(postId)
      .populate("author", "name email title role")
      .populate("comments.user", "name email title");

    res.status(200).json({
      success: true,
      message: "Inappropriate comment deleted by admin",
      post: updatedPost,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── Admin Moderate Reviews ────────────────────────────────────────────────────
const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("fromUser", "name email role")
      .populate("toUser", "name email role")
      .populate("projectId", "title")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const adminDeleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findByIdAndDelete(id);

    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    res.status(200).json({ success: true, message: "Inappropriate review deleted by admin" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── Admin Delete Proposal ─────────────────────────────────────────────────────
const adminDeleteProposal = async (req, res) => {
  try {
    const { id } = req.params;
    const proposal = await Proposal.findByIdAndDelete(id);

    if (!proposal) {
      return res.status(404).json({ success: false, message: "Proposal not found" });
    }

    // Decrement proposalsCount on project if project exists
    await Project.findByIdAndUpdate(proposal.project, {
      $inc: { proposalsCount: -1 },
    });

    res.status(200).json({ success: true, message: "Proposal deleted by admin" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── Toggle User Suspension ───────────────────────────────────────────────────
const toggleUserSuspension = async (req, res) => {
  try {
    const { id } = req.params;
    if (id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "Cannot suspend your own account" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.isSuspended = !user.isSuspended;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User account has been ${user.isSuspended ? "suspended" : "reactivated"}`,
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── Showcase Moderation ───────────────────────────────────────────────────────
const getAllShowcases = async (req, res) => {
  try {
    const showcases = await Showcase.find()
      .populate("author", "name email role avatar title")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: showcases.length, showcases });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const toggleFeatureShowcase = async (req, res) => {
  try {
    const { id } = req.params;
    const showcase = await Showcase.findById(id);

    if (!showcase) {
      return res.status(404).json({ success: false, message: "Showcase project not found" });
    }

    showcase.isFeatured = !showcase.isFeatured;
    await showcase.save();

    res.status(200).json({
      success: true,
      message: `Showcase project ${showcase.isFeatured ? "featured on platform" : "unfeatured"}`,
      showcase,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const adminDeleteShowcase = async (req, res) => {
  try {
    const { id } = req.params;
    const showcase = await Showcase.findByIdAndDelete(id);

    if (!showcase) {
      return res.status(404).json({ success: false, message: "Showcase not found" });
    }

    res.status(200).json({ success: true, message: "Showcase deleted by admin" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── Payment Governance & Escrow Release ─────────────────────────────────────
const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("payerId", "name email role")
      .populate("recipientId", "name email role")
      .populate("projectId", "title budget")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: payments.length, payments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const adminReleasePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findById(id);

    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment transaction not found" });
    }

    payment.status = "completed";
    payment.paidDate = new Date();
    payment.notes = (payment.notes || "") + " [Force-released by Admin]";
    await payment.save();

    res.status(200).json({
      success: true,
      message: "Escrow payment successfully released by admin",
      payment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── Workplace Audit ──────────────────────────────────────────────────────────
const getAllWorkspaces = async (req, res) => {
  try {
    const workplaces = await Workplace.find()
      .populate("project", "title budget status")
      .populate("projectId", "title budget status")
      .populate("client", "name email")
      .populate("clientId", "name email")
      .populate("freelancer", "name email")
      .populate("freelancerId", "name email")
      .sort({ updatedAt: -1 });

    res.status(200).json({ success: true, count: workplaces.length, workplaces });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── AI Risk Reports Overview ──────────────────────────────────────────────────
const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("workplaceId")
      .populate("generatedBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: reports.length, reports });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  deleteUser,
  updateUserRole,
  getAllProjects,
  adminDeleteProject,
  getAllProposals,
  updateProjectLimit,
  getAllPosts,
  deletePost,
  deletePostComment,
  getAllReviews,
  adminDeleteReview,
  adminDeleteProposal,
  toggleUserSuspension,
  getAllShowcases,
  toggleFeatureShowcase,
  adminDeleteShowcase,
  getAllPayments,
  adminReleasePayment,
  getAllWorkspaces,
  getAllReports,
};
