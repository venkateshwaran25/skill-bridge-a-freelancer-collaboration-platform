const Message = require("../models/Message");
const User = require("../models/User");
const Proposal = require("../models/Proposal");
const Project = require("../models/Project");
const { canUsersChat } = require("../utils/canChat");

// Get chat history with another user
const getMessagesWithUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    // Verify accepted application status
    const allowed = await canUsersChat(currentUserId, userId);
    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: "Messaging is only enabled once a client accepts a freelancer's project application.",
      });
    }

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, recipient: userId },
        { sender: userId, recipient: currentUserId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("sender", "name email profileImage")
      .populate("recipient", "name email profileImage");

    // Mark received messages as read
    await Message.updateMany(
      { sender: userId, recipient: currentUserId, read: false },
      { read: true }
    );

    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Send a message via HTTP REST
const sendMessage = async (req, res) => {
  try {
    const { recipientId, content, projectId } = req.body;

    if (!recipientId || !content) {
      return res.status(400).json({
        success: false,
        message: "Recipient ID and message content are required",
      });
    }

    // Verify accepted application status
    const allowed = await canUsersChat(req.user._id, recipientId);
    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: "Messaging is only enabled once a client accepts a freelancer's project application.",
      });
    }

    const message = await Message.create({
      sender: req.user._id,
      recipient: recipientId,
      project: projectId || null,
      content,
    });

    const populated = await Message.findById(message._id)
      .populate("sender", "name email profileImage")
      .populate("recipient", "name email profileImage");

    res.status(201).json({
      success: true,
      message: populated,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get list of active conversations for logged-in user
const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    const conversationUsersMap = new Map();

    // 1. Fetch all direct messages involving current user
    const messages = await Message.find({
      $or: [{ sender: userId }, { recipient: userId }],
    })
      .sort({ createdAt: -1 })
      .populate("sender", "name email title profileImage avatar role location")
      .populate("recipient", "name email title profileImage avatar role location");

    for (const msg of messages) {
      const isSender = msg.sender._id.toString() === userId.toString();
      const partner = isSender ? msg.recipient : msg.sender;
      if (!partner) continue;

      const partnerId = partner._id.toString();
      if (!conversationUsersMap.has(partnerId)) {
        conversationUsersMap.set(partnerId, {
          user: partner,
          lastMessage: msg.content,
          lastMessageDate: msg.createdAt,
          unread: !isSender && !msg.read,
          contractStatus: "Direct Message",
        });
      }
    }

    // 2. Also include accepted project proposal contacts if not already in list
    if (req.user.role === "client") {
      const clientProjects = await Project.find({ postedBy: userId }).select("_id");
      const projectIds = clientProjects.map((p) => p._id);
      const acceptedProposals = await Proposal.find({
        project: { $in: projectIds },
        status: "accepted",
      }).populate("freelancer", "name email title profileImage avatar role location");

      for (const prop of acceptedProposals) {
        if (prop.freelancer) {
          const fId = prop.freelancer._id.toString();
          if (!conversationUsersMap.has(fId)) {
            conversationUsersMap.set(fId, {
              user: prop.freelancer,
              lastMessage: "🎉 Proposal accepted! Start chatting directly.",
              lastMessageDate: prop.updatedAt,
              unread: false,
              contractStatus: "Hired Freelancer",
            });
          }
        }
      }
    } else if (req.user.role === "freelancer") {
      const acceptedProposals = await Proposal.find({
        freelancer: userId,
        status: "accepted",
      }).populate({
        path: "project",
        populate: { path: "postedBy", select: "name email title profileImage avatar role location" },
      });

      for (const prop of acceptedProposals) {
        const client = prop.project?.postedBy;
        if (client) {
          const cId = client._id.toString();
          if (!conversationUsersMap.has(cId)) {
            conversationUsersMap.set(cId, {
              user: client,
              lastMessage: "🎉 Your proposal was accepted! Start chatting with your client.",
              lastMessageDate: prop.updatedAt,
              unread: false,
              contractStatus: "Hired Project Client",
            });
          }
        }
      }
    }

    const conversations = Array.from(conversationUsersMap.values()).sort(
      (a, b) => new Date(b.lastMessageDate) - new Date(a.lastMessageDate)
    );

    res.status(200).json({
      success: true,
      conversations,
    });
  } catch (error) {
    console.error("Get conversations error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  getMessagesWithUser,
  sendMessage,
  getConversations,
};


