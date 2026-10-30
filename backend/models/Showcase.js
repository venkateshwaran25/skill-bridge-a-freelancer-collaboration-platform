const mongoose = require("mongoose");

const showcaseSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    coverImage: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      required: true,
    },
    problemStatement: {
      type: String,
      default: "",
    },
    solution: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      enum: [
        "Web Development",
        "Mobile Development",
        "AI/ML",
        "UI/UX",
        "Data Science",
        "Cloud",
        "Cybersecurity",
        "Other",
      ],
      default: "Web Development",
    },
    techStack: {
      type: [String],
      default: [],
    },
    duration: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      default: "Full Stack Developer",
    },
    teamMembers: {
      type: [String],
      default: [],
    },
    projectUrl: {
      type: String,
      default: "",
    },
    githubUrl: {
      type: String,
      default: "",
    },
    demoUrl: {
      type: String,
      default: "",
    },
    screenshots: {
      type: [String],
      default: [],
    },
    impactResults: {
      type: String,
      default: "",
    },
    completionDate: {
      type: Date,
      default: Date.now,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        text: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    views: {
      type: Number,
      default: 0,
    },
    saves: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Showcase", showcaseSchema);
