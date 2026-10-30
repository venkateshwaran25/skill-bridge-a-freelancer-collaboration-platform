const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    fromUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    toUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    workplaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workplace',
      required: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 100,
    },
    comment: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    categories: {
      communication: {
        type: Number,
        min: 1,
        max: 5,
      },
      professionalism: {
        type: Number,
        min: 1,
        max: 5,
      },
      deliveryQuality: {
        type: Number,
        min: 1,
        max: 5,
      },
      responsiveness: {
        type: Number,
        min: 1,
        max: 5,
      },
      expertise: {
        type: Number,
        min: 1,
        max: 5,
      },
    },
    isVerifiedTransaction: {
      type: Boolean,
      default: false,
    },
    helpful: {
      type: Number,
      default: 0,
    },
    unhelpful: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'disputed'],
      default: 'pending',
    },
    reviewerType: {
      type: String,
      enum: ['client', 'freelancer'],
      required: true,
    },
  },
  { timestamps: true }
);

reviewSchema.index({ toUser: 1, createdAt: -1 });
reviewSchema.index({ workplaceId: 1 });
reviewSchema.index({ projectId: 1 });
reviewSchema.index({ fromUser: 1 });

module.exports = mongoose.model('Review', reviewSchema);
