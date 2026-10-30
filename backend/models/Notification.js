const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'project_accepted',
        'proposal_received',
        'proposal_accepted',
        'proposal_rejected',
        'task_assigned',
        'task_updated',
        'milestone_completed',
        'payment_received',
        'payment_pending',
        'review_received',
        'message_received',
        'workspace_created',
        'file_uploaded',
        'project_completed',
        'other',
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    relatedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    relatedProject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
    },
    relatedWorkplace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workplace',
    },
    relatedTask: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
    },
    relatedPayment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
    },
    relatedReview: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review',
    },
    read: {
      type: Boolean,
      default: false,
    },
    readAt: Date,
    actionUrl: String,
    icon: {
      type: String,
      default: '📢',
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal',
    },
    emailSent: {
      type: Boolean,
      default: false,
    },
    emailSentAt: Date,
    dismissed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, read: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
