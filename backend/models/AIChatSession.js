const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sender: { type: String, enum: ["user", "ai"], required: true },
  content: { type: String, required: true },
  followUps: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

const aiChatSessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    sessionId: { type: String, required: true, unique: true },
    title: { type: String, default: "New Conversation" },
    messages: [messageSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model("AIChatSession", aiChatSessionSchema);
