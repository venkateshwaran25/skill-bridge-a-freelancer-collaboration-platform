const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate AI-powered project report using Gemini
 */
const generateAIReport = async (metrics, workplace, insights) => {
  try {
    const {
      taskStatuses,
      milestoneStatuses,
      riskAssessment,
      teamPerformance,
    } = metrics;
    const { strengths, concerns, recommendations } = insights;

    const prompt = `
You are an expert project manager analyzing a digital workplace project. Generate a professional weekly project status report based on the following metrics:

PROJECT OVERVIEW:
- Workspace: ${workplace.title}
- Status: ${workplace.status}
- Overall Completion: ${metrics.metrics.projectCompletionPercentage}%

TASK METRICS:
- Total Tasks: ${metrics.metrics.totalTasks}
- Completed: ${metrics.metrics.completedTasks} (${metrics.metrics.completionPercentage}%)
- In Progress: ${taskStatuses.inProgress}
- To-Do: ${taskStatuses.todo}
- Blocked: ${taskStatuses.blocked}
- Overdue: ${metrics.metrics.delayedTasks}

MILESTONE METRICS:
- Total Milestones: ${metrics.metrics.totalMilestones}
- Completed: ${milestoneStatuses.completed}
- In Progress: ${milestoneStatuses.inProgress}
- Delayed: ${milestoneStatuses.delayed}
- Overdue: ${metrics.metrics.delayedMilestones}

BUDGET STATUS:
- Budget Used: $${metrics.metrics.budgetUsed} (${metrics.metrics.budgetPercentage}%)
- Budget Remaining: $${metrics.metrics.budgetRemaining}

TEAM PERFORMANCE:
- Team Size: ${workplace.members?.length || 1}
- Avg Tasks per Member: ${teamPerformance.averageTasksPerTeamMember}
- Team Productivity: ${teamPerformance.teamProductivity}
- Top Performer: ${teamPerformance.topPerformer ? teamPerformance.topPerformer.tasksCompleted + ' tasks completed' : 'N/A'}

RISK ASSESSMENT:
- Overall Risk Level: ${riskAssessment.overallRisk}
- At-Risk Tasks: ${riskAssessment.atRiskTasks.length}
- At-Risk Milestones: ${riskAssessment.atRiskMilestones.length}

CURRENT INSIGHTS:
Strengths: ${strengths.join(', ')}
Concerns: ${concerns.join(', ')}
Recommendations: ${recommendations.join(', ')}

Please generate:
1. A professional executive summary (2-3 sentences) of the project status
2. Key accomplishments from this period
3. Areas of concern and their impact
4. Recommended actions for the next week
5. Overall assessment and confidence level

Format the response as a concise, professional report suitable for stakeholder communication.
`;

    const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    let summary = '';
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      summary = result.response.text();
    } catch (modelErr) {
      console.warn(`Primary model (${modelName}) failed, trying fallback gemini-1.5-pro...`, modelErr.message);
      const fallbackModel = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
      const fallbackResult = await fallbackModel.generateContent(prompt);
      summary = fallbackResult.response.text();
    }

    return summary;
  } catch (error) {
    console.error('Error generating AI report:', error);
    throw error;
  }
};

/**
 * Generate detailed insights from metrics for AI processing
 */
const generateMetricsInsights = (metrics) => {
  const insights = [];
  const targetMetrics = metrics?.metrics ? metrics.metrics : (metrics || {});

  const {
    completionPercentage = 0,
    delayedTasks = 0,
    avgTaskCompletionTime = 0,
    delayedMilestones = 0,
    budgetPercentage = 0,
  } = targetMetrics;

  // Task velocity
  insights.push(
    `Project task completion velocity: ${completionPercentage}% (${avgTaskCompletionTime} hours avg per task)`
  );

  // Schedule health
  if (delayedTasks > 0) {
    insights.push(
      `Schedule alert: ${delayedTasks} task(s) past due, indicating potential scheduling issues`
    );
  } else {
    insights.push('Schedule status: On track, no overdue tasks');
  }

  // Milestone progress
  if (delayedMilestones > 0) {
    insights.push(
      `Milestone status: ${delayedMilestones} delayed, attention needed`
    );
  }

  // Budget usage
  if (budgetPercentage > 90) {
    insights.push(
      `Budget alert: ${budgetPercentage}% of budget used, monitor carefully`
    );
  } else if (budgetPercentage > 70) {
    insights.push(`Budget status: ${budgetPercentage}% utilized, moderate usage`);
  } else {
    insights.push(`Budget status: ${budgetPercentage}% utilized, healthy usage`);
  }

  return insights;
};

module.exports = {
  generateAIReport,
  generateMetricsInsights,
};
