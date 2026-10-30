const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
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
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['weekly', 'milestone', 'completion', 'performance'],
      default: 'weekly',
    },
    title: {
      type: String,
    },
    aiRecommendation: {
      type: String,
    },
    period: {
      startDate: Date,
      endDate: Date,
    },
    summary: {
      type: String,
      required: true,
    },
    metrics: {
      totalTasks: Number,
      completedTasks: Number,
      completionPercentage: {
        type: Number,
        min: 0,
        max: 100,
      },
      delayedTasks: Number,
      onScheduleTasks: Number,
      avgTaskCompletionTime: Number, // in hours
      totalMilestones: Number,
      completedMilestones: Number,
      delayedMilestones: Number,
      projectCompletionPercentage: {
        type: Number,
        min: 0,
        max: 100,
      },
      budgetUsed: Number,
      budgetRemaining: Number,
      budgetPercentage: {
        type: Number,
        min: 0,
        max: 100,
      },
    },
    insights: {
      strengths: [String],
      concerns: [String],
      recommendations: [String],
    },
    taskStatuses: {
      todo: Number,
      inProgress: Number,
      completed: Number,
      blocked: Number,
    },
    milestoneStatuses: {
      notStarted: Number,
      inProgress: Number,
      completed: Number,
      delayed: Number,
      onHold: Number,
    },
    teamPerformance: {
      topPerformer: {
        userId: mongoose.Schema.Types.ObjectId,
        name: String,
        tasksCompleted: Number,
      },
      averageTasksPerTeamMember: Number,
      teamProductivity: {
        type: String,
        enum: ['low', 'medium', 'high', 'excellent'],
      },
    },
    riskAssessment: {
      overallRisk: {
        type: String,
        enum: ['low', 'medium', 'high'],
      },
      atRiskTasks: [
        {
          taskId: mongoose.Schema.Types.ObjectId,
          taskName: String,
          reason: String,
        },
      ],
      atRiskMilestones: [
        {
          milestoneId: mongoose.Schema.Types.ObjectId,
          milestoneName: String,
          reason: String,
        },
      ],
    },
    aiGenerated: {
      type: Boolean,
      default: true,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

reportSchema.index({ workplaceId: 1, createdAt: -1 });
reportSchema.index({ projectId: 1 });
reportSchema.index({ generatedAt: -1 });

module.exports = mongoose.model('Report', reportSchema);
