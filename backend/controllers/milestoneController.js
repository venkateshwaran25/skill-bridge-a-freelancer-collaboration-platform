const Milestone = require("../models/Milestone");
const Task = require("../models/Task");
const Workplace = require("../models/Workplace");

// Create a milestone
const createMilestone = async (req, res) => {
  try {
    const { workplaceId, title, description, dueDate, budget } = req.body;

    if (!workplaceId || !title || !dueDate) {
      return res.status(400).json({
        success: false,
        message: "Workplace ID, title, and due date are required",
      });
    }

    const workplace = await Workplace.findById(workplaceId);

    if (!workplace) {
      return res.status(404).json({
        success: false,
        message: "Workplace not found",
      });
    }

    // Check authorization (only client can create milestones)
    if (workplace.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the client can create milestones",
      });
    }

    const milestone = await Milestone.create({
      workplace: workplaceId,
      title,
      description,
      dueDate,
      budget: budget || 0,
    });

    workplace.milestones.push(milestone._id);
    await workplace.save();

    const populated = await Milestone.findById(milestone._id);

    res.status(201).json({
      success: true,
      message: "Milestone created successfully",
      milestone: populated,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get all milestones in a workplace
const getWorkplaceMilestones = async (req, res) => {
  try {
    const { workplaceId } = req.params;

    const workplace = await Workplace.findById(workplaceId);

    if (!workplace) {
      return res.status(404).json({
        success: false,
        message: "Workplace not found",
      });
    }

    const milestones = await Milestone.find({ workplace: workplaceId })
      .populate({
        path: "tasks",
        populate: { path: "assignedTo createdBy", select: "name email" },
      })
      .sort({ dueDate: 1 });

    res.status(200).json({
      success: true,
      milestones,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get single milestone
const getMilestoneById = async (req, res) => {
  try {
    const { id } = req.params;

    const milestone = await Milestone.findById(id)
      .populate("workplace")
      .populate({
        path: "tasks",
        populate: { path: "assignedTo createdBy", select: "name email" },
      });

    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: "Milestone not found",
      });
    }

    res.status(200).json({
      success: true,
      milestone,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Update milestone
const updateMilestone = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, dueDate, status, completionPercentage, budget, paymentStatus, notes } = req.body;

    const milestone = await Milestone.findById(id);

    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: "Milestone not found",
      });
    }

    // Check authorization
    const workplace = await Workplace.findById(milestone.workplace);
    if (workplace.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the client can update milestones",
      });
    }

    if (title) milestone.title = title;
    if (description) milestone.description = description;
    if (dueDate) milestone.dueDate = dueDate;
    if (status) milestone.status = status;
    if (completionPercentage !== undefined) milestone.completionPercentage = completionPercentage;
    if (budget !== undefined) milestone.budget = budget;
    if (paymentStatus) milestone.paymentStatus = paymentStatus;
    if (notes) milestone.notes = notes;

    await milestone.save();

    const updated = await Milestone.findById(id).populate("tasks");

    res.status(200).json({
      success: true,
      message: "Milestone updated successfully",
      milestone: updated,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Add task to milestone
const addTaskToMilestone = async (req, res) => {
  try {
    const { id } = req.params;
    const { taskId } = req.body;

    if (!taskId) {
      return res.status(400).json({
        success: false,
        message: "Task ID is required",
      });
    }

    const milestone = await Milestone.findById(id);
    const task = await Task.findById(taskId);

    if (!milestone || !task) {
      return res.status(404).json({
        success: false,
        message: "Milestone or Task not found",
      });
    }

    if (!milestone.tasks.includes(taskId)) {
      milestone.tasks.push(taskId);
      task.milestone = id;

      await milestone.save();
      await task.save();
    }

    const updated = await Milestone.findById(id).populate("tasks");

    res.status(200).json({
      success: true,
      message: "Task added to milestone successfully",
      milestone: updated,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Add deliverable to milestone
const addDeliverable = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Deliverable name is required",
      });
    }

    const milestone = await Milestone.findById(id);

    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: "Milestone not found",
      });
    }

    milestone.deliverables.push({
      name,
      description,
      status: "pending",
    });

    await milestone.save();

    const updated = await Milestone.findById(id);

    res.status(200).json({
      success: true,
      message: "Deliverable added successfully",
      milestone: updated,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Update deliverable status
const updateDeliverableStatus = async (req, res) => {
  try {
    const { id, deliverableIndex } = req.params;
    const { status } = req.body;

    const milestone = await Milestone.findById(id);

    if (!milestone || !milestone.deliverables[deliverableIndex]) {
      return res.status(404).json({
        success: false,
        message: "Milestone or Deliverable not found",
      });
    }

    milestone.deliverables[deliverableIndex].status = status;
    await milestone.save();

    res.status(200).json({
      success: true,
      message: "Deliverable status updated",
      milestone,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Delete milestone
const deleteMilestone = async (req, res) => {
  try {
    const { id } = req.params;

    const milestone = await Milestone.findById(id);

    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: "Milestone not found",
      });
    }

    // Check authorization
    const workplace = await Workplace.findById(milestone.workplace);
    if (workplace.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the client can delete milestones",
      });
    }

    await Milestone.findByIdAndDelete(id);

    // Remove from workplace
    workplace.milestones = workplace.milestones.filter(
      (m) => m.toString() !== id
    );
    await workplace.save();

    res.status(200).json({
      success: true,
      message: "Milestone deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  createMilestone,
  getWorkplaceMilestones,
  getMilestoneById,
  updateMilestone,
  addTaskToMilestone,
  addDeliverable,
  updateDeliverableStatus,
  deleteMilestone,
};
