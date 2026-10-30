const mongoose = require("mongoose");

const workplaceFileSchema = new mongoose.Schema(
  {
    workplace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workplace",
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true, // Cloudinary public ID for deletion
    },
    fileType: {
      type: String,
      enum: ["document", "image", "video", "audio", "code", "other"],
      default: "other",
    },
    fileSize: {
      type: Number, // in bytes
      default: 0,
    },
    relatedTask: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
    },
    relatedMilestone: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Milestone",
    },
    description: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("WorkplaceFile", workplaceFileSchema);
