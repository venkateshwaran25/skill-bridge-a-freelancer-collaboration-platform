const Project = require("../models/Project");

const createProject = async (req, res) => {
  try {
    if (req.user && req.user.role !== "client" && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only client accounts are permitted to post projects.",
      });
    }

    const {
      title,
      description,
      budgetType = "fixed",
      budget,
      budgetMin,
      budgetMax,
      hourlyRateMin,
      hourlyRateMax,
      estimatedHoursMin,
      estimatedHoursMax,
      skills,
      category,
      complexity = "Intermediate",
      duration,
      maxProposals = 5,
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required",
      });
    }

    // Budget validations
    if (budgetType === "fixed" && budgetMin !== undefined && budgetMax !== undefined && budgetMin !== null && budgetMax !== null) {
      if (Number(budgetMin) > Number(budgetMax)) {
        return res.status(400).json({
          success: false,
          message: "Minimum Budget cannot be greater than Maximum Budget",
        });
      }
    }

    if (budgetType === "hourly" && hourlyRateMin !== undefined && hourlyRateMax !== undefined && hourlyRateMin !== null && hourlyRateMax !== null) {
      if (Number(hourlyRateMin) > Number(hourlyRateMax)) {
        return res.status(400).json({
          success: false,
          message: "Minimum Hourly Rate cannot be greater than Maximum Hourly Rate",
        });
      }
    }

    const legacyBudget =
      budgetMax || budgetMin || budget || (hourlyRateMax ? hourlyRateMax * 30 : 0);

    const project = await Project.create({
      title,
      description,
      budgetType: ["fixed", "hourly", "negotiable"].includes(budgetType) ? budgetType : "fixed",
      budget: Number(legacyBudget) || 0,
      budgetMin: budgetMin !== undefined ? Number(budgetMin) : null,
      budgetMax: budgetMax !== undefined ? Number(budgetMax) : null,
      hourlyRateMin: hourlyRateMin !== undefined ? Number(hourlyRateMin) : null,
      hourlyRateMax: hourlyRateMax !== undefined ? Number(hourlyRateMax) : null,
      estimatedHoursMin: estimatedHoursMin !== undefined ? Number(estimatedHoursMin) : null,
      estimatedHoursMax: estimatedHoursMax !== undefined ? Number(estimatedHoursMax) : null,
      skills: skills || [],
      category: category || "Web Development",
      complexity: complexity || "Intermediate",
      duration: duration || "1-2 weeks",
      maxProposals: maxProposals ? Number(maxProposals) : 5,
      postedBy: req.user._id,
    });

    const populated = await Project.findById(project._id).populate(
      "postedBy",
      "name email role title"
    );

    res.status(201).json({
      success: true,
      project: populated,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const getProjects = async (req, res) => {
  try {
    const { search, skill, category, budgetType, status } = req.query;

    const filter = {};

    if (status) {
      filter.status = status;
    } else {
      filter.status = { $ne: "cancelled" };
    }

    if (category) {
      filter.category = category;
    }

    if (budgetType && ["fixed", "hourly", "negotiable"].includes(budgetType)) {
      filter.budgetType = budgetType;
    }

    if (skill) {
      filter.skills = { $in: [new RegExp(skill, "i")] };
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { skills: { $in: [new RegExp(search, "i")] } },
      ];
    }

    const projects = await Project.find(filter)
      .populate("postedBy", "name email role title rating")
      .populate("assignedFreelancer", "name email title")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id)
      .populate("postedBy", "name email role title bio rating location createdAt totalJobs")
      .populate("assignedFreelancer", "name email title rating skills createdAt");

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    if (project.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const { postedBy, proposalsCount, assignedFreelancer, ...safeUpdates } = req.body;

    const updated = await Project.findByIdAndUpdate(id, safeUpdates, {
      new: true,
      runValidators: true,
    }).populate("postedBy", "name email role");

    res.status(200).json({
      success: true,
      project: updated,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    if (project.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    await project.deleteOne();

    res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
};
