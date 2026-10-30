const Message = require("../models/Message");
const { canUsersChat } = require("../utils/canChat");

// Track online users
const onlineUsers = new Map();

const initSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(`⚡ Socket connected: ${socket.id}`);

    // User joins - register as online
    socket.on("join", (userId) => {
      socket.join(userId);
      onlineUsers.set(userId, { socketId: socket.id, timestamp: Date.now() });
      
      // Broadcast user online status
      io.emit("user_online", {
        userId,
        timestamp: Date.now(),
      });
      console.log(`User ${userId} joined room`);
    });

    // Join workspace/project chat room
    socket.on("join_workplace", (data) => {
      const { userId, workplaceId } = data;
      const roomId = `workplace_${workplaceId}`;
      
      socket.join(roomId);
      console.log(`User ${userId} joined workplace ${workplaceId}`);
      
      // Notify others in the workplace
      socket.to(roomId).emit("user_joined_workplace", {
        userId,
        workplaceId,
        message: `User joined the workspace`,
      });
    });

    // Leave workplace
    socket.on("leave_workplace", (data) => {
      const { userId, workplaceId } = data;
      const roomId = `workplace_${workplaceId}`;
      
      socket.leave(roomId);
      io.to(roomId).emit("user_left_workplace", {
        userId,
        workplaceId,
      });
    });

    // Handle real-time direct messaging
    socket.on("send_message", async (data) => {
      try {
        const { senderId, recipientId, content, projectId } = data;

        // Verify accepted application status
        const allowed = await canUsersChat(senderId, recipientId);
        if (!allowed) {
          console.log(`Blocked socket message between ${senderId} and ${recipientId} - no accepted proposal`);
          return;
        }

        const message = await Message.create({
          sender: senderId,
          recipient: recipientId,
          project: projectId || null,
          content,
        });

        const populated = await Message.findById(message._id)
          .populate("sender", "name email profileImage")
          .populate("recipient", "name email profileImage");

        // Emit to recipient room
        io.to(recipientId).emit("receive_message", populated);
        // Emit back to sender room for confirmation
        io.to(senderId).emit("message_sent", populated);
      } catch (err) {
        console.error("Socket send_message error:", err);
      }
    });

    // Handle workplace chat messages
    socket.on("send_workplace_message", async (data) => {
      try {
        const { senderId, workplaceId, content, senderName, senderImage } = data;
        const roomId = `workplace_${workplaceId}`;

        const message = {
          id: Date.now(),
          senderId,
          senderName,
          senderImage,
          content,
          timestamp: new Date(),
          read: false,
        };

        // Broadcast to all users in workspace
        io.to(roomId).emit("receive_workplace_message", {
          workplaceId,
          message,
        });
      } catch (err) {
        console.error("Socket send_workplace_message error:", err);
      }
    });

    // Handle task assignment notification
    socket.on("task_assigned", (data) => {
      const { taskId, assignedToId, taskTitle, assignedByName, workplaceId } = data;
      const roomId = `workplace_${workplaceId}`;

      io.to(assignedToId).emit("task_notification", {
        type: "task_assigned",
        taskId,
        taskTitle,
        assignedByName,
        message: `${assignedByName} assigned you a task: "${taskTitle}"`,
      });

      io.to(roomId).emit("task_activity", {
        type: "task_assigned",
        taskId,
        taskTitle,
        assignedToId,
      });
    });

    // Handle task status update notification
    socket.on("task_updated", (data) => {
      const { taskId, taskTitle, status, workplaceId } = data;
      const roomId = `workplace_${workplaceId}`;

      io.to(roomId).emit("task_activity", {
        type: "task_updated",
        taskId,
        taskTitle,
        status,
        message: `Task "${taskTitle}" status changed to ${status}`,
      });
    });

    // Handle milestone update notification
    socket.on("milestone_updated", (data) => {
      const { milestoneId, milestoneTitle, status, workplaceId } = data;
      const roomId = `workplace_${workplaceId}`;

      io.to(roomId).emit("milestone_activity", {
        type: "milestone_updated",
        milestoneId,
        milestoneTitle,
        status,
        message: `Milestone "${milestoneTitle}" status changed to ${status}`,
      });
    });

    // Handle file upload notification
    socket.on("file_uploaded", (data) => {
      const { workplaceId, fileName, uploadedByName, uploadedByImage } = data;
      const roomId = `workplace_${workplaceId}`;

      io.to(roomId).emit("file_activity", {
        type: "file_uploaded",
        fileName,
        uploadedByName,
        uploadedByImage,
        message: `${uploadedByName} uploaded a file: ${fileName}`,
        timestamp: new Date(),
      });
    });

    // Handle typing indicator
    socket.on("typing", (data) => {
      const { userId, workplaceId, isTyping } = data;
      const roomId = `workplace_${workplaceId}`;

      socket.to(roomId).emit("user_typing", {
        userId,
        isTyping,
      });
    });

    // Handle live proposal alert
    socket.on("new_proposal", (data) => {
      const { projectOwnerId, projectTitle, freelancerName } = data;
      io.to(projectOwnerId).emit("proposal_alert", {
        message: `New proposal submitted by ${freelancerName} on "${projectTitle}"`,
        projectTitle,
      });
    });

    // Get online users
    socket.on("get_online_users", () => {
      const onlineUsersList = Array.from(onlineUsers.keys());
      socket.emit("online_users_list", onlineUsersList);
    });

    // Check if user is online
    socket.on("check_user_online", (userId) => {
      const isOnline = onlineUsers.has(userId);
      socket.emit("user_online_status", {
        userId,
        isOnline,
      });
    });

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
      
      // Remove user from online list
      for (const [userId, userInfo] of onlineUsers.entries()) {
        if (userInfo.socketId === socket.id) {
          onlineUsers.delete(userId);
          io.emit("user_offline", {
            userId,
            timestamp: Date.now(),
          });
          break;
        }
      }
    });
  });
};

module.exports = initSocket;
