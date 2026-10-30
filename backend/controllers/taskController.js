const Task = require("../models/Task");
const Workplace = require("../models/Workplace");

// Create a task
const createTask = async (req, res) => {
  try {
    const { workplaceId, title, description, assignedToId, priority, dueDate, estimatedHours } = req.body;

    if (!workplaceId || !title) {
      return res.status(400).json({
        success: false,
        message: "Workplace ID and title are required",
      });
    }

    const workplace = await Workplace.findById(workplaceId);

    if (!workplace) {
      return res.status(404).json({
        success: false,
        message: "Workplace not found",
      });
    }

    // Check authorization (only client or freelancer can create tasks)
    if (
      workplace.client.toString() !== req.user._id.toString() &&
      workplace.freelancer.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Only workspace members can create tasks",
      });
    }

    const targetAssignee = assignedToId || workplace.freelancer || workplace.client || req.user._id;

    const task = await Task.create({
      workplace: workplaceId,
      title,
      description,
      assignedTo: targetAssignee,
      createdBy: req.user._id,
      priority: priority || "medium",
      dueDate,
      estimatedHours: estimatedHours || 0,
    });

    workplace.tasks.push(task._id);
    await workplace.save();

    const populated = await Task.findById(task._id)
      .populate("assignedTo", "name email profileImage")
      .populate("createdBy", "name email");

    // Emit real-time task socket events
    const io = req.app.get("io");
    if (io) {
      io.to(assignedToId.toString()).emit("task_notification", {
        type: "task_assigned",
        taskId: task._id,
        taskTitle: title,
        assignedByName: req.user.name,
        message: `📋 ${req.user.name} assigned you a task: "${title}"`,
      });
      io.to(`workplace_${workplaceId}`).emit("task_activity", {
        type: "task_created",
        task: populated,
        workplaceId,
      });
    }

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      task: populated,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get all tasks in a workplace
const getWorkplaceTasks = async (req, res) => {
  try {
    const { workplaceId } = req.params;

    const workplace = await Workplace.findById(workplaceId);

    if (!workplace) {
      return res.status(404).json({
        success: false,
        message: "Workplace not found",
      });
    }

    const tasks = await Task.find({ workplace: workplaceId })
      .populate("assignedTo", "name email profileImage")
      .populate("createdBy", "name email")
      .populate("milestone", "title")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      tasks,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get single task
const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id)
      .populate("workplace")
      .populate("assignedTo", "name email profileImage")
      .populate("createdBy", "name email")
      .populate("milestone", "title dueDate")
      .populate({
        path: "comments",
        populate: { path: "user", select: "name email profileImage" },
      });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Update task
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, dueDate, completionPercentage, estimatedHours, actualHours } = req.body;

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check authorization
    const workplace = await Workplace.findById(task.workplace);
    if (
      workplace.client.toString() !== req.user._id.toString() &&
      workplace.freelancer.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this task",
      });
    }

    if (title) task.title = title;
    if (description) task.description = description;
    if (status) task.status = status;
    if (priority) task.priority = priority;
    if (dueDate) task.dueDate = dueDate;
    if (completionPercentage !== undefined) task.completionPercentage = completionPercentage;
    if (estimatedHours !== undefined) task.estimatedHours = estimatedHours;
    if (actualHours !== undefined) task.actualHours = actualHours;

    await task.save();

    // Update workplace completion if status changed to completed
    if (status === "completed") {
      const tasks = await Task.find({ workplace: task.workplace });
      const completedTasks = tasks.filter((t) => t.status === "completed" || t._id.toString() === id).length;
      workplace.completionPercentage = Math.round(
        (completedTasks / tasks.length) * 100
      );
      await workplace.save();
    }

    const updated = await Task.findById(id)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email");

    // Emit real-time task update socket event to workplace
    const io = req.app.get("io");
    if (io) {
      io.to(`workplace_${task.workplace}`).emit("task_activity", {
        type: "task_updated",
        taskId: task._id,
        status: task.status,
        task: updated,
        workplaceId: task.workplace,
      });
    }

    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      task: updated,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Add comment to task
const addTaskComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: "Comment text is required",
      });
    }

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    task.comments.push({
      user: req.user._id,
      text,
    });

    await task.save();

    const updated = await Task.findById(id).populate({
      path: "comments",
      populate: { path: "user", select: "name email profileImage" },
    });

    res.status(200).json({
      success: true,
      message: "Comment added successfully",
      task: updated,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Delete task
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check authorization
    const workplace = await Workplace.findById(task.workplace);
    if (workplace.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the client can delete tasks",
      });
    }

    await Task.findByIdAndDelete(id);

    // Remove from workplace tasks
    workplace.tasks = workplace.tasks.filter((t) => t.toString() !== id);
    await workplace.save();

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
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
  createTask,
  getWorkplaceTasks,
  getTaskById,
  updateTask,
  addTaskComment,
  deleteTask,
};
