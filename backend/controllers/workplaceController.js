const Workplace = require("../models/Workplace");
const Task = require("../models/Task");
const Milestone = require("../models/Milestone");
const Project = require("../models/Project");
const Proposal = require("../models/Proposal");

// Create a new workplace (after accepting a proposal)
const createWorkplace = async (req, res) => {
  try {
    const { projectId, proposalId } = req.body;

    if (!projectId || !proposalId) {
      return res.status(400).json({
        success: false,
        message: "Project ID and Proposal ID are required",
      });
    }

    const project = await Project.findById(projectId);
    const proposal = await Proposal.findById(proposalId);

    if (!project || !proposal) {
      return res.status(404).json({
        success: false,
        message: "Project or Proposal not found",
      });
    }

    // Check if user is the client
    if (project.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the project client can create a workspace",
      });
    }

    // Check if workplace already exists
    const existingWorkplace = await Workplace.findOne({
      project: projectId,
      proposal: proposalId,
    });

    if (existingWorkplace) {
      return res.status(400).json({
        success: false,
        message: "Workplace already exists for this project",
      });
    }

    // Create workplace
    const workplace = await Workplace.create({
      project: projectId,
      proposal: proposalId,
      client: project.postedBy,
      freelancer: proposal.freelancer,
      title: project.title,
      description: project.description,
      budget: proposal.bidAmount,
      members: [
        { user: project.postedBy, role: "client" },
        { user: proposal.freelancer, role: "freelancer" },
      ],
    });

    // Update project status
    project.status = "in progress";
    project.assignedFreelancer = proposal.freelancer;
    await project.save();

    // Update proposal status
    proposal.status = "accepted";
    await proposal.save();

    const populatedWorkplace = await Workplace.findById(workplace._id)
      .populate("project", "title description budget")
      .populate("client", "name email")
      .populate("freelancer", "name email title")
      .populate("tasks")
      .populate("milestones");

    res.status(201).json({
      success: true,
      message: "Workplace created successfully",
      workplace: populatedWorkplace,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get all workplaces for a user
const getWorkplaces = async (req, res) => {
  try {
    const workplaces = await Workplace.find({
      $or: [
        { client: req.user._id },
        { freelancer: req.user._id },
        { "members.user": req.user._id },
      ],
    })
      .populate("project", "title description")
      .populate("client", "name email profileImage")
      .populate("freelancer", "name email profileImage title")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      workplaces,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get single workplace details
const getWorkplaceById = async (req, res) => {
  try {
    const { id } = req.params;

    const workplace = await Workplace.findById(id)
      .populate("project")
      .populate("proposal")
      .populate("client", "name email profileImage")
      .populate("freelancer", "name email profileImage title")
      .populate({
        path: "tasks",
        populate: { path: "assignedTo createdBy", select: "name email" },
      })
      .populate({
        path: "milestones",
        populate: { path: "tasks" },
      })
      .populate({
        path: "files",
        populate: { path: "uploadedBy", select: "name email" },
      })
      .populate("members.user", "name email profileImage");

    if (!workplace) {
      return res.status(404).json({
        success: false,
        message: "Workplace not found",
      });
    }

    // Safe access check
    const userId = req.user._id.toString();
    const clientId = workplace.client?._id ? workplace.client._id.toString() : workplace.client?.toString();
    const freelancerId = workplace.freelancer?._id ? workplace.freelancer._id.toString() : workplace.freelancer?.toString();

    const isMember = workplace.members && workplace.members.some((m) => {
      if (!m || !m.user) return false;
      const memberId = m.user._id ? m.user._id.toString() : m.user.toString();
      return memberId === userId;
    });

    if (!isMember && clientId !== userId && freelancerId !== userId && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied to this workplace",
      });
    }

    res.status(200).json({
      success: true,
      workplace,
    });
  } catch (error) {
    console.error("Error in getWorkplaceById:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Update workplace
const updateWorkplace = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, endDate } = req.body;

    const workplace = await Workplace.findById(id);

    if (!workplace) {
      return res.status(404).json({
        success: false,
        message: "Workplace not found",
      });
    }

    // Check authorization (only client can update)
    if (workplace.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the client can update the workplace",
      });
    }

    if (title) workplace.title = title;
    if (description) workplace.description = description;
    if (status) workplace.status = status;
    if (endDate) workplace.endDate = endDate;

    // Calculate completion percentage
    if (workplace.tasks.length > 0) {
      const tasks = await Task.find({ _id: { $in: workplace.tasks } });
      const completedTasks = tasks.filter((t) => t.status === "completed").length;
      workplace.completionPercentage = Math.round(
        (completedTasks / tasks.length) * 100
      );
    }

    await workplace.save();

    const updated = await Workplace.findById(id).populate(
      "project client freelancer tasks milestones members.user"
    );

    res.status(200).json({
      success: true,
      message: "Workplace updated successfully",
      workplace: updated,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Add team member to workplace
const addMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, role } = req.body;

    if (!userId || !role) {
      return res.status(400).json({
        success: false,
        message: "User ID and role are required",
      });
    }

    const workplace = await Workplace.findById(id);

    if (!workplace) {
      return res.status(404).json({
        success: false,
        message: "Workplace not found",
      });
    }

    // Check authorization
    if (workplace.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the client can add members",
      });
    }

    // Check if member already exists
    const isMember = workplace.members.some(
      (m) => m.user.toString() === userId
    );

    if (isMember) {
      return res.status(400).json({
        success: false,
        message: "User is already a member",
      });
    }

    workplace.members.push({ user: userId, role });
    await workplace.save();

    const updated = await Workplace.findById(id).populate("members.user");

    res.status(200).json({
      success: true,
      message: "Member added successfully",
      workplace: updated,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get workplace statistics
const getWorkplaceStats = async (req, res) => {
  try {
    const { id } = req.params;

    const workplace = await Workplace.findById(id);

    if (!workplace) {
      return res.status(404).json({
        success: false,
        message: "Workplace not found",
      });
    }

    const tasks = await Task.find({ workplace: id });
    const milestones = await Milestone.find({ workplace: id });

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === "completed").length;
    const inProgressTasks = tasks.filter((t) => t.status === "in-progress").length;
    const toDoTasks = tasks.filter((t) => t.status === "to-do").length;

    const totalMilestones = milestones.length;
    const completedMilestones = milestones.filter(
      (m) => m.status === "completed"
    ).length;

    const stats = {
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        inProgress: inProgressTasks,
        toDo: toDoTasks,
        completionPercentage:
          totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      },
      milestones: {
        total: totalMilestones,
        completed: completedMilestones,
        completionPercentage:
          totalMilestones > 0
            ? Math.round((completedMilestones / totalMilestones) * 100)
            : 0,
      },
      workplaceCompletion: workplace.completionPercentage,
    };

    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get workplace by Project ID (Auto-creates workplace & tasks if project is in-progress/hired)
const getWorkplaceByProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    let workplace = await Workplace.findOne({ project: projectId })
      .populate("project")
      .populate("proposal")
      .populate("client", "name email profileImage")
      .populate("freelancer", "name email profileImage title")
      .populate("tasks")
      .populate("milestones")
      .populate("members.user", "name email profileImage");

    if (!workplace) {
      // Check if project exists and has assigned freelancer or proposal
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ success: false, message: "Project not found" });
      }

      // Find accepted proposal or any proposal for this project
      const proposal = await Proposal.findOne({ project: projectId, status: "accepted" })
        || await Proposal.findOne({ project: projectId });

      const freelancerId = project.assignedFreelancer || (proposal ? proposal.freelancer : null);

      if (freelancerId && proposal) {
        // Auto-create workspace on the fly for hired/in-progress project
        const newWorkplace = await Workplace.create({
          project: project._id,
          proposal: proposal._id,
          client: project.postedBy,
          freelancer: freelancerId,
          title: project.title,
          description: project.description,
          budget: proposal.bidAmount || project.budget || 500,
          members: [
            { user: project.postedBy, role: "client" },
            { user: freelancerId, role: "freelancer" },
          ],
        });

        // Create initial starter tasks
        const task1 = await Task.create({
          workplace: newWorkplace._id,
          title: "Project Alignment & Requirements Setup",
          description: `Kickoff alignment for ${project.title}. Finalize deliverables & technical specifications.`,
          assignedTo: freelancerId,
          createdBy: project.postedBy,
          priority: "high",
          status: "to-do",
          estimatedHours: 4,
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        });

        const task2 = await Task.create({
          workplace: newWorkplace._id,
          title: "Core Deliverables & Feature Development",
          description: "Build primary feature modules, APIs, and user interfaces according to specification.",
          assignedTo: freelancerId,
          createdBy: project.postedBy,
          priority: "medium",
          status: "in-progress",
          estimatedHours: 20,
          dueDate: new Date(Date.now() + (proposal.estimatedDays || 7) * 24 * 60 * 60 * 1000),
        });

        newWorkplace.tasks.push(task1._id, task2._id);

        // Create initial milestone
        const milestone1 = await Milestone.create({
          workplace: newWorkplace._id,
          title: "Milestone 1 - Core Deliverables",
          description: "Initial deliverable release and prototype walkthrough.",
          amount: proposal.bidAmount || project.budget || 500,
          dueDate: new Date(Date.now() + (proposal.estimatedDays || 7) * 24 * 60 * 60 * 1000),
          createdBy: project.postedBy,
          assignedTo: freelancerId,
          status: "pending",
        });

        newWorkplace.milestones.push(milestone1._id);
        await newWorkplace.save();

        workplace = await Workplace.findById(newWorkplace._id)
          .populate("project")
          .populate("proposal")
          .populate("client", "name email profileImage")
          .populate("freelancer", "name email profileImage title")
          .populate("tasks")
          .populate("milestones")
          .populate("members.user", "name email profileImage");
      } else {
        return res.status(404).json({
          success: false,
          message: "Workplace not found for this project",
        });
      }
    }

    res.status(200).json({
      success: true,
      workplace,
    });
  } catch (error) {
    console.error("Error in getWorkplaceByProject:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  createWorkplace,
  getWorkplaces,
  getWorkplaceById,
  getWorkplaceByProject,
  updateWorkplace,
  addMember,
  getWorkplaceStats,
};
