const Task = require('../models/Task');
const Milestone = require('../models/Milestone');
const Workplace = require('../models/Workplace');
const Project = require('../models/Project');

/**
 * Calculate comprehensive project tracking metrics
 */
const calculateProjectMetrics = async (workplaceId) => {
  try {
    const workplace = await Workplace.findById(workplaceId).populate([
      { path: 'project' },
      { path: 'tasks' },
      { path: 'milestones' },
    ]);

    if (!workplace) {
      throw new Error('Workplace not found');
    }

    // Get all tasks for this workplace
    const tasks = await Task.find({ workplace: workplaceId });
    const milestones = await Milestone.find({ workplace: workplaceId });

    // Task metrics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'completed').length;
    const delayedTasks = tasks.filter(
      (t) =>
        t.dueDate &&
        new Date(t.dueDate) < new Date() &&
        t.status !== 'completed'
    ).length;
    const onScheduleTasks = totalTasks - delayedTasks;
    const todoTasks = tasks.filter((t) => t.status === 'to-do').length;
    const inProgressTasks = tasks.filter((t) => t.status === 'in-progress').length;
    const blockedTasks = tasks.filter((t) => t.status === 'blocked').length;

    // Calculate average task completion time
    const completedTasksWithTime = tasks.filter(
      (t) => t.status === 'completed' && t.actualHours
    );
    const avgTaskCompletionTime =
      completedTasksWithTime.length > 0
        ? completedTasksWithTime.reduce((sum, t) => sum + (t.actualHours || 0), 0) /
          completedTasksWithTime.length
        : 0;

    // Milestone metrics
    const totalMilestones = milestones.length;
    const completedMilestones = milestones.filter(
      (m) => m.status === 'completed'
    ).length;
    const delayedMilestones = milestones.filter(
      (m) =>
        m.status === 'delayed' ||
        (m.dueDate &&
          new Date(m.dueDate) < new Date() &&
          m.status !== 'completed')
    ).length;
    const notStartedMilestones = milestones.filter(
      (m) => m.status === 'not-started'
    ).length;
    const inProgressMilestones = milestones.filter(
      (m) => m.status === 'in-progress'
    ).length;
    const onHoldMilestones = milestones.filter(
      (m) => m.status === 'on-hold'
    ).length;

    // Budget metrics
    const budgetUsed = milestones.reduce((sum, m) => sum + (m.budget || 0), 0);
    const projectBudget = workplace.project?.budget || 0;
    const budgetRemaining = projectBudget - budgetUsed;
    const budgetPercentage =
      projectBudget > 0 ? (budgetUsed / projectBudget) * 100 : 0;

    // Project completion percentage
    const projectCompletionPercentage =
      totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Task completion percentage
    const completionPercentage =
      totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Team performance metrics
    const teamMembers = workplace.members || [];
    const tasksByAssignee = {};
    tasks.forEach((task) => {
      if (task.assignedTo) {
        const userId = task.assignedTo.toString();
        if (!tasksByAssignee[userId]) {
          tasksByAssignee[userId] = { total: 0, completed: 0 };
        }
        tasksByAssignee[userId].total++;
        if (task.status === 'completed') {
          tasksByAssignee[userId].completed++;
        }
      }
    });

    let topPerformer = null;
    let maxCompleted = 0;
    for (const [userId, stats] of Object.entries(tasksByAssignee)) {
      if (stats.completed > maxCompleted) {
        maxCompleted = stats.completed;
        topPerformer = {
          userId,
          tasksCompleted: stats.completed,
        };
      }
    }

    const teamSize = teamMembers.length;
    const averageTasksPerTeamMember = teamSize > 0 ? totalTasks / teamSize : 0;

    // Team productivity assessment
    let teamProductivity = 'medium';
    const productivityRatio = completedTasks / (totalTasks || 1);
    if (productivityRatio > 0.7) {
      teamProductivity = 'excellent';
    } else if (productivityRatio > 0.5) {
      teamProductivity = 'high';
    } else if (productivityRatio < 0.3) {
      teamProductivity = 'low';
    }

    // Risk assessment
    const atRiskTasks = tasks
      .filter(
        (t) =>
          t.status !== 'completed' &&
          t.dueDate &&
          new Date(t.dueDate) < new Date()
      )
      .slice(0, 5)
      .map((t) => ({
        taskId: t._id,
        taskName: t.title,
        reason: 'Past due date',
      }));

    const atRiskMilestones = milestones
      .filter(
        (m) =>
          m.status !== 'completed' &&
          m.dueDate &&
          new Date(m.dueDate) < new Date()
      )
      .slice(0, 5)
      .map((m) => ({
        milestoneId: m._id,
        milestoneName: m.title,
        reason: 'Past due date',
      }));

    let overallRisk = 'low';
    if (delayedTasks > totalTasks * 0.3 || delayedMilestones > 0) {
      overallRisk = 'high';
    } else if (delayedTasks > totalTasks * 0.1) {
      overallRisk = 'medium';
    }

    return {
      metrics: {
        totalTasks,
        completedTasks,
        completionPercentage: Math.round(completionPercentage),
        delayedTasks,
        onScheduleTasks,
        avgTaskCompletionTime: Math.round(avgTaskCompletionTime * 10) / 10,
        totalMilestones,
        completedMilestones,
        delayedMilestones,
        projectCompletionPercentage: Math.round(projectCompletionPercentage),
        budgetUsed: Math.round(budgetUsed),
        budgetRemaining: Math.round(budgetRemaining),
        budgetPercentage: Math.round(budgetPercentage),
      },
      taskStatuses: {
        todo: todoTasks,
        inProgress: inProgressTasks,
        completed: completedTasks,
        blocked: blockedTasks,
      },
      milestoneStatuses: {
        notStarted: notStartedMilestones,
        inProgress: inProgressMilestones,
        completed: completedMilestones,
        delayed: delayedMilestones,
        onHold: onHoldMilestones,
      },
      teamPerformance: {
        topPerformer,
        averageTasksPerTeamMember: Math.round(averageTasksPerTeamMember * 10) / 10,
        teamProductivity,
      },
      riskAssessment: {
        overallRisk,
        atRiskTasks,
        atRiskMilestones,
      },
    };
  } catch (error) {
    console.error('Error calculating project metrics:', error);
    throw error;
  }
};

/**
 * Generate weekly summary for display
 */
const generateWeeklySummary = (metrics, workplaceData) => {
  const { taskStatuses, milestoneStatuses, riskAssessment } = metrics;

  const strengths = [];
  const concerns = [];
  const recommendations = [];

  // Analyze strengths
  if (metrics.metrics.completionPercentage > 70) {
    strengths.push('Excellent task completion rate');
  }
  if (metrics.teamPerformance.teamProductivity === 'excellent') {
    strengths.push('Team is highly productive');
  }
  if (riskAssessment.overallRisk === 'low') {
    strengths.push('Project is on track with low risk');
  }
  if (metrics.metrics.budgetPercentage < 50) {
    strengths.push('Budget is well-managed');
  }

  // Analyze concerns
  if (metrics.metrics.delayedTasks > 0) {
    concerns.push(`${metrics.metrics.delayedTasks} task(s) are overdue`);
  }
  if (metrics.metrics.delayedMilestones > 0) {
    concerns.push(`${metrics.metrics.delayedMilestones} milestone(s) are delayed`);
  }
  if (taskStatuses.blocked > 0) {
    concerns.push(`${taskStatuses.blocked} task(s) are blocked`);
  }
  if (riskAssessment.overallRisk === 'high') {
    concerns.push('Project has elevated risk level');
  }
  if (metrics.metrics.budgetPercentage > 80) {
    concerns.push('Budget usage is high, approaching limit');
  }

  // Generate recommendations
  if (metrics.metrics.delayedTasks > 0) {
    recommendations.push(
      'Prioritize resolving overdue tasks to get back on schedule'
    );
  }
  if (taskStatuses.blocked > 0) {
    recommendations.push('Address blockers on stuck tasks immediately');
  }
  if (riskAssessment.atRiskMilestones.length > 0) {
    recommendations.push(
      'Allocate additional resources to at-risk milestones'
    );
  }
  if (metrics.metrics.completionPercentage < 50) {
    recommendations.push(
      'Increase team capacity or extend timeline if needed'
    );
  }
  if (metrics.metrics.budgetPercentage > 75) {
    recommendations.push('Review milestone budgets and adjust if necessary');
  } else if (metrics.teamPerformance.teamProductivity === 'high') {
    recommendations.push(
      'Maintain current pace and team momentum'
    );
  }

  return {
    strengths: strengths.length > 0 ? strengths : ['Project is progressing'],
    concerns: concerns.length > 0 ? concerns : ['No major concerns'],
    recommendations:
      recommendations.length > 0
        ? recommendations
        : ['Continue current project execution'],
  };
};

module.exports = {
  calculateProjectMetrics,
  generateWeeklySummary,
};
