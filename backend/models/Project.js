const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    budgetType: {
      type: String,
      enum: ["fixed", "hourly", "negotiable"],
      default: "fixed",
    },
    budget: {
      type: Number,
      default: 0,
    },
    budgetMin: {
      type: Number,
      default: null,
    },
    budgetMax: {
      type: Number,
      default: null,
    },
    hourlyRateMin: {
      type: Number,
      default: null,
    },
    hourlyRateMax: {
      type: Number,
      default: null,
    },
    estimatedHoursMin: {
      type: Number,
      default: null,
    },
    estimatedHoursMax: {
      type: Number,
      default: null,
    },
    skills: {
      type: [String],
      default: [],
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      default: "Web Development",
    },
    complexity: {
      type: String,
      enum: ["Entry", "Intermediate", "Expert"],
      default: "Intermediate",
    },
    duration: {
      type: String,
      default: "1-2 weeks",
    },
    proposalsCount: {
      type: Number,
      default: 0,
    },
    maxProposals: {
      type: Number,
      default: 5,
    },
    assignedFreelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["open", "in progress", "completed", "cancelled"],
      default: "open",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Project", projectSchema);
