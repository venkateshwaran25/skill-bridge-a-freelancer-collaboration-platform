const WorkplaceMessage = require("../models/WorkplaceMessage");
const Workplace = require("../models/Workplace");

// Send message in workplace chat
const sendWorkplaceMessage = async (req, res) => {
  try {
    const { workplaceId, content, attachments } = req.body;

    if (!workplaceId || !content) {
      return res.status(400).json({
        success: false,
        message: "Workplace ID and content are required",
      });
    }

    const workplace = await Workplace.findById(workplaceId);

    if (!workplace) {
      return res.status(404).json({
        success: false,
        message: "Workplace not found",
      });
    }

    // Check authorization
    const isMember = workplace.members.some(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (
      !isMember &&
      workplace.client.toString() !== req.user._id.toString() &&
      workplace.freelancer.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const message = await WorkplaceMessage.create({
      workplace: workplaceId,
      sender: req.user._id,
      content,
      attachments: attachments || [],
    });

    const populated = await WorkplaceMessage.findById(message._id)
      .populate("sender", "name email profileImage")
      .populate("workplace", "title");

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: populated,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get workplace chat messages
const getWorkplaceMessages = async (req, res) => {
  try {
    const { workplaceId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const workplace = await Workplace.findById(workplaceId);

    if (!workplace) {
      return res.status(404).json({
        success: false,
        message: "Workplace not found",
      });
    }

    // Check authorization
    const isMember = workplace.members.some(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (
      !isMember &&
      workplace.client.toString() !== req.user._id.toString() &&
      workplace.freelancer.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const skip = (page - 1) * limit;

    const messages = await WorkplaceMessage.find({ workplace: workplaceId })
      .populate("sender", "name email profileImage")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalMessages = await WorkplaceMessage.countDocuments({
      workplace: workplaceId,
    });

    res.status(200).json({
      success: true,
      messages: messages.reverse(),
      pagination: {
        total: totalMessages,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalMessages / limit),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Mark message as read
const markMessageAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await WorkplaceMessage.findById(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Check if user already marked as read
    const alreadyRead = message.readBy.some(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (!alreadyRead) {
      message.readBy.push({
        user: req.user._id,
        readAt: new Date(),
      });
      await message.save();
    }

    res.status(200).json({
      success: true,
      message: "Message marked as read",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get unread message count for workplace
const getUnreadCount = async (req, res) => {
  try {
    const { workplaceId } = req.params;

    const unreadMessages = await WorkplaceMessage.countDocuments({
      workplace: workplaceId,
      $not: { readBy: { $elemMatch: { user: req.user._id } } },
    });

    res.status(200).json({
      success: true,
      unreadCount: unreadMessages,
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
  sendWorkplaceMessage,
  getWorkplaceMessages,
  markMessageAsRead,
  getUnreadCount,
};
