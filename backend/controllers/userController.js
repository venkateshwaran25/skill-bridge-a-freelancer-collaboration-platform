const User = require("../models/User");

const getCurrentUser = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Not authorized",
    });
  }

  res.status(200).json({
    success: true,
    user: req.user,
  });
};

const updateUserProfile = async (req, res) => {
  try {
    const { name, bio, title, skills, location, hourlyRate, experience, availability, pricingType, role } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (title !== undefined) user.title = title;
    if (location !== undefined) user.location = location;
    if (hourlyRate !== undefined) user.hourlyRate = Number(hourlyRate);
    if (experience !== undefined) user.experience = Number(experience);
    if (availability) user.availability = availability;
    if (pricingType) user.pricingType = pricingType;
    if (role && ["freelancer", "client"].includes(role)) {
      user.role = role;
    }
    if (skills) {
      user.skills = Array.isArray(skills)
        ? skills
        : skills.split(",").map((s) => s.trim()).filter(Boolean);
    }

    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: userResponse,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getFreelancers = async (req, res) => {
  try {
    const { search, skill } = req.query;

    const query = { role: "freelancer" };

    if (skill) {
      query.skills = { $in: [new RegExp(skill, "i")] };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { title: { $regex: search, $options: "i" } },
        { bio: { $regex: search, $options: "i" } },
        { skills: { $in: [new RegExp(search, "i")] } },
      ];
    }

    const freelancers = await User.find(query)
      .select("-password")
      .sort({ rating: -1, totalJobs: -1 });

    res.status(200).json({
      success: true,
      count: freelancers.length,
      freelancers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const addPortfolioItem = async (req, res) => {
  try {
    const { title, description, image, projectUrl, tags } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const newItem = {
      title,
      description: description || "",
      image: image || "",
      projectUrl: projectUrl || "",
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(",").map(t => t.trim()) : []),
      createdAt: new Date()
    };

    user.portfolio.push(newItem);
    await user.save();

    res.status(201).json({
      success: true,
      message: "Portfolio item added successfully",
      portfolio: user.portfolio
    });
  } catch (error) {
    console.error("Error adding portfolio item:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const deletePortfolioItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.portfolio = user.portfolio.filter(item => item._id.toString() !== itemId);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Portfolio item deleted",
      portfolio: user.portfolio
    });
  } catch (error) {
    console.error("Error deleting portfolio item:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) {
      return res.status(200).json({ success: true, users: [] });
    }

    const currentUserId = req.user._id;
    const users = await User.find({
      _id: { $ne: currentUserId },
      $or: [
        { name: { $regex: q, $options: "i" } },
        { title: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ],
    })
      .select("name email title role profileImage avatar bio location rating")
      .limit(10);

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Search users error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  getCurrentUser,
  updateUserProfile,
  getFreelancers,
  getUserById,
  addPortfolioItem,
  deletePortfolioItem,
  searchUsers,
};
