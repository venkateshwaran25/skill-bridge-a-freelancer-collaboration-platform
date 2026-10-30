const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["client", "freelancer", "admin"],
      default: "freelancer",
    },

    skills: {
      type: [String],
      default: [],
    },

    bio: {
      type: String,
      default: "",
    },

    profileImage: {
      type: String,
      default: "",
    },

    experience: {
      type: Number,
      default: 0,
    },

    hourlyRate: {
      type: Number,
      default: 0,
    },

    location: {
      type: String,
      default: "",
    },

    title: {
      type: String,
      default: "Freelancer / Professional",
    },

    rating: {
      type: Number,
      default: 5.0,
    },

    totalJobs: {
      type: Number,
      default: 0,
    },

    isVerified: {
      type: Boolean,
      default: true,
    },

    isSuspended: {
      type: Boolean,
      default: false,
    },

    availability: {
      type: String,
      enum: ["available", "busy", "unavailable"],
      default: "available",
    },

    pricingType: {
      type: String,
      enum: ["hourly", "project", "both"],
      default: "hourly",
    },

    portfolio: [
      {
        title: { type: String, required: true },
        description: { type: String, default: "" },
        image: { type: String, default: "" },
        projectUrl: { type: String, default: "" },
        tags: { type: [String], default: [] },
        createdAt: { type: Date, default: Date.now }
      }
    ],

    lastLogin: {
      type: Date,
      default: Date.now,
    },

    loginHistory: [
      {
        loginAt: {
          type: Date,
          default: Date.now,
        },
        ipAddress: {
          type: String,
          default: "127.0.0.1",
        },
        device: {
          type: String,
          default: "Desktop / Browser",
        },
        userAgent: {
          type: String,
          default: "",
        },
      },
    ]
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);