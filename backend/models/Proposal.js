const mongoose = require("mongoose");

const proposalSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bidAmount: {
      type: Number,
      required: true,
    },
    proposedAmount: {
      type: Number,
      default: null,
    },
    hourlyRate: {
      type: Number,
      default: null,
    },
    estimatedHours: {
      type: Number,
      default: null,
    },
    estimatedTotal: {
      type: Number,
      default: null,
    },
    timeline: {
      type: String,
      default: "",
    },
    coverLetter: {
      type: String,
      required: true,
    },
    estimatedDays: {
      type: Number,
      default: 7,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

proposalSchema.index({ project: 1, freelancer: 1 }, { unique: true });

module.exports = mongoose.model("Proposal", proposalSchema);
