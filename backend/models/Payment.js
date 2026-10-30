const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
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
    milestoneId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Milestone',
    },
    payerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    description: String,
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'bank_transfer', 'wallet', 'stripe', 'paypal'],
    },
    transactionId: String,
    invoiceNumber: String,
    dueDate: Date,
    paidDate: Date,
    refundDate: Date,
    refundReason: String,
    notes: String,
    relatedMilestone: {
      title: String,
      dueDate: Date,
    },
  },
  { timestamps: true }
);

paymentSchema.index({ workplaceId: 1 });
paymentSchema.index({ projectId: 1 });
paymentSchema.index({ payerId: 1 });
paymentSchema.index({ recipientId: 1 });
paymentSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Payment', paymentSchema);
