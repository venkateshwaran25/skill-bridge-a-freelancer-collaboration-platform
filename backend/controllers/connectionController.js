const Connection = require("../models/Connection");
const User = require("../models/User");

const getSuggestedConnections = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    // Get existing connections of current user
    const existingConnections = await Connection.find({
      $or: [{ requester: currentUserId }, { recipient: currentUserId }],
    });

    const connectedUserIds = existingConnections.map((c) =>
      c.requester.toString() === currentUserId.toString()
        ? c.recipient.toString()
        : c.requester.toString()
    );

    connectedUserIds.push(currentUserId.toString());

    const suggestions = await User.find({
      _id: { $nin: connectedUserIds },
    })
      .select("-password")
      .limit(20);

    res.status(200).json({
      success: true,
      suggestions,
    });
  } catch (error) {
    console.error("Get suggested connections error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const sendConnectionRequest = async (req, res) => {
  try {
    const { recipientId } = req.body;
    const requesterId = req.user._id;

    if (recipientId === requesterId.toString()) {
      return res.status(400).json({ success: false, message: "Cannot connect with yourself" });
    }

    let connection = await Connection.findOne({
      $or: [
        { requester: requesterId, recipient: recipientId },
        { requester: recipientId, recipient: requesterId },
      ],
    });

    if (connection) {
      return res.status(400).json({
        success: true,
        message: "Connection request already exists",
        connection,
      });
    }

    connection = await Connection.create({
      requester: requesterId,
      recipient: recipientId,
      status: "pending",
    });

    // Emit real-time connection request socket event to recipient
    const io = req.app.get("io");
    if (io) {
      io.to(recipientId.toString()).emit("connection_request_alert", {
        type: "connection_request",
        connectionId: connection._id,
        requesterId,
        requesterName: req.user.name,
        message: `🤝 ${req.user.name} sent you a connection request!`,
        timestamp: new Date(),
      });
    }

    res.status(201).json({
      success: true,
      message: "Connection request sent",
      connection,
    });
  } catch (error) {
    console.error("Send connection request error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const respondToConnectionRequest = async (req, res) => {
  try {
    const { connectionId } = req.params;
    const { action } = req.body; // 'accept' or 'reject'

    const connection = await Connection.findById(connectionId).populate("requester", "name");
    if (!connection) {
      return res.status(404).json({ success: false, message: "Connection request not found" });
    }

    if (connection.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    if (action === "accept") {
      connection.status = "accepted";
      await connection.save();
    } else {
      connection.status = "rejected";
      await connection.save();
    }

    // Emit real-time socket notification to requester
    const io = req.app.get("io");
    if (io && connection.requester) {
      const requesterId = connection.requester._id ? connection.requester._id.toString() : connection.requester.toString();
      io.to(requesterId).emit("connection_status_alert", {
        type: "connection_status",
        status: connection.status,
        recipientName: req.user.name,
        message: action === "accept"
          ? `🤝 ${req.user.name} accepted your connection request!`
          : `${req.user.name} ignored your connection request.`,
        timestamp: new Date(),
      });
    }

    res.status(200).json({
      success: true,
      message: `Connection ${action}ed successfully`,
      connection,
    });
  } catch (error) {
    console.error("Respond connection request error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getPendingRequests = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const pendingRequests = await Connection.find({
      recipient: currentUserId,
      status: "pending",
    }).populate("requester", "name title email profileImage avatar rating skills bio location");

    res.status(200).json({
      success: true,
      pendingRequests,
    });
  } catch (error) {
    console.error("Get pending connection requests error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getMyConnections = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const connections = await Connection.find({
      $or: [{ requester: currentUserId }, { recipient: currentUserId }],
      status: "accepted",
    })
      .populate("requester", "name title profileImage avatar rating skills availability location")
      .populate("recipient", "name title profileImage avatar rating skills availability location");

    const formatted = connections.map((c) => {
      const isRequester = c.requester._id.toString() === currentUserId.toString();
      return isRequester ? c.recipient : c.requester;
    });

    res.status(200).json({
      success: true,
      connections: formatted,
    });
  } catch (error) {
    console.error("Get my connections error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  getSuggestedConnections,
  sendConnectionRequest,
  respondToConnectionRequest,
  getPendingRequests,
  getMyConnections,
};
