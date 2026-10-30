const Showcase = require("../models/Showcase");

const createShowcase = async (req, res) => {
  try {
    const {
      title,
      coverImage,
      description,
      problemStatement,
      solution,
      category,
      techStack,
      duration,
      role,
      teamMembers,
      projectUrl,
      githubUrl,
      demoUrl,
      screenshots,
      impactResults,
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: "Title and description required" });
    }

    const showcase = await Showcase.create({
      author: req.user._id,
      title,
      coverImage: coverImage || "",
      description,
      problemStatement: problemStatement || "",
      solution: solution || "",
      category: category || "Web Development",
      techStack: Array.isArray(techStack)
        ? techStack
        : techStack
        ? techStack.split(",").map((s) => s.trim())
        : [],
      duration: duration || "",
      role: role || "Full Stack Developer",
      teamMembers: Array.isArray(teamMembers) ? teamMembers : [],
      projectUrl: projectUrl || "",
      githubUrl: githubUrl || "",
      demoUrl: demoUrl || "",
      screenshots: Array.isArray(screenshots) ? screenshots : [],
      impactResults: impactResults || "",
    });

    const populatedShowcase = await Showcase.findById(showcase._id).populate(
      "author",
      "name title profileImage avatar rating"
    );

    res.status(201).json({
      success: true,
      message: "Showcase project published successfully",
      showcase: populatedShowcase,
    });
  } catch (error) {
    console.error("Create showcase error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getShowcaseItems = async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};

    if (category && category !== "All") {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { techStack: { $in: [new RegExp(search, "i")] } },
      ];
    }

    const showcases = await Showcase.find(query)
      .populate("author", "name title profileImage avatar rating role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: showcases.length,
      showcases,
    });
  } catch (error) {
    console.error("Get showcase items error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getShowcaseById = async (req, res) => {
  try {
    const { id } = req.params;
    const showcase = await Showcase.findById(id).populate(
      "author",
      "name title profileImage avatar rating skills location bio"
    );

    if (!showcase) {
      return res.status(404).json({ success: false, message: "Showcase project not found" });
    }

    showcase.views += 1;
    await showcase.save();

    res.status(200).json({
      success: true,
      showcase,
    });
  } catch (error) {
    console.error("Get showcase by ID error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const toggleLikeShowcase = async (req, res) => {
  try {
    const { id } = req.params;
    const showcase = await Showcase.findById(id);
    if (!showcase) {
      return res.status(404).json({ success: false, message: "Showcase not found" });
    }

    const userIdStr = req.user._id.toString();
    const index = showcase.likes.findIndex((userId) => userId.toString() === userIdStr);

    if (index > -1) {
      showcase.likes.splice(index, 1);
    } else {
      showcase.likes.push(req.user._id);
    }

    await showcase.save();
    res.status(200).json({
      success: true,
      likesCount: showcase.likes.length,
      isLiked: index === -1,
    });
  } catch (error) {
    console.error("Toggle showcase like error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  createShowcase,
  getShowcaseItems,
  getShowcaseById,
  toggleLikeShowcase,
};
