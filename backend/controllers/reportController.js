const Report = require('../models/Report');
const Workplace = require('../models/Workplace');
const Project = require('../models/Project');
const {
  calculateProjectMetrics,
  generateWeeklySummary,
} = require('../utils/projectTracking');
const { generateAIReport, generateMetricsInsights } = require('../services/aiReportService');

/**
 * Generate a new report for a workplace
 * POST /api/reports/generate/:workplaceId
 */
exports.generateReport = async (req, res) => {
  try {
    const { workplaceId } = req.params;
    const userId = (req.user._id || req.user.id).toString();
    const { type = 'weekly' } = req.body;

    // Verify workplace exists and user has access
    const workplace = await Workplace.findById(workplaceId).populate('project');
    if (!workplace) {
      return res.status(404).json({ error: 'Workplace not found' });
    }

    // Check authorization (client or team member)
    const isMember = workplace.members?.some(
      (m) => m.user.toString() === userId
    );
    const isClient = workplace.client.toString() === userId;
    if (!isMember && !isClient) {
      return res.status(403).json({ error: 'Not authorized to access this workspace' });
    }

    // Calculate metrics
    const metrics = await calculateProjectMetrics(workplaceId);

    // Generate insights and summary
    const insights = generateWeeklySummary(metrics, workplace);
    const metricsInsights = generateMetricsInsights(metrics.metrics);

    // Generate AI report
    let aiSummary = '';
    try {
      aiSummary = await generateAIReport(metrics, workplace, insights);
    } catch (aiError) {
      console.error('AI report generation failed, using fallback:', aiError.message);
      aiSummary = `Project Status Report\n\nProject: ${workplace.title}\nStatus: ${insights.strengths[0]}\nConcerns: ${insights.concerns.join(', ')}\nRecommendations: ${insights.recommendations.join(', ')}`;
    }

    // Create report record
    const report = new Report({
      workplaceId,
      projectId: workplace.project?._id,
      generatedBy: userId,
      type,
      period: {
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        endDate: new Date(),
      },
      summary: aiSummary,
      metrics: metrics.metrics,
      insights,
      taskStatuses: metrics.taskStatuses,
      milestoneStatuses: metrics.milestoneStatuses,
      teamPerformance: metrics.teamPerformance,
      riskAssessment: metrics.riskAssessment,
      aiGenerated: true,
    });

    await report.save();

    res.json({
      message: 'Report generated successfully',
      report: {
        id: report._id,
        type: report.type,
        summary: report.summary,
        metrics: report.metrics,
        insights: report.insights,
        taskStatuses: report.taskStatuses,
        milestoneStatuses: report.milestoneStatuses,
        teamPerformance: report.teamPerformance,
        riskAssessment: report.riskAssessment,
        generatedAt: report.generatedAt,
      },
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: 'Failed to generate report', details: error.message });
  }
};

/**
 * Get reports for a workplace
 * GET /api/reports/workplace/:workplaceId
 */
exports.getWorkplaceReports = async (req, res) => {
  try {
    const { workplaceId } = req.params;
    const userId = (req.user._id || req.user.id).toString();
    const { limit = 10, page = 1, type } = req.query;

    // Verify workplace exists and user has access
    const workplace = await Workplace.findById(workplaceId);
    if (!workplace) {
      return res.status(404).json({ error: 'Workplace not found' });
    }

    // Check authorization
    const isMember = workplace.members?.some(
      (m) => m.user.toString() === userId
    );
    const isClient = workplace.client.toString() === userId;
    if (!isMember && !isClient) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Build query
    let query = { workplaceId };
    if (type) {
      query.type = type;
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const reports = await Report.find(query)
      .sort({ generatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('generatedBy', 'name email image');

    const total = await Report.countDocuments(query);

    res.json({
      reports,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
};

/**
 * Get single report
 * GET /api/reports/:id
 */
exports.getReport = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req.user._id || req.user.id).toString();

    const report = await Report.findById(id)
      .populate('workplaceId', 'title status')
      .populate('projectId', 'title')
      .populate('generatedBy', 'name email image');

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Check authorization
    const workplace = await Workplace.findById(report.workplaceId);
    const isMember = workplace.members?.some(
      (m) => m.user.toString() === userId
    );
    const isClient = workplace.client.toString() === userId;
    if (!isMember && !isClient) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    res.json(report);
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ error: 'Failed to fetch report' });
  }
};

/**
 * Get project statistics (quick overview without full report)
 * GET /api/reports/stats/:workplaceId
 */
exports.getProjectStats = async (req, res) => {
  try {
    const { workplaceId } = req.params;
    const userId = (req.user._id || req.user.id).toString();

    // Verify workplace exists and user has access
    const workplace = await Workplace.findById(workplaceId);
    if (!workplace) {
      return res.status(404).json({ error: 'Workplace not found' });
    }

    // Check authorization
    const isMember = workplace.members?.some(
      (m) => m.user.toString() === userId
    );
    const isClient = workplace.client.toString() === userId;
    if (!isMember && !isClient) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Calculate metrics
    const metrics = await calculateProjectMetrics(workplaceId);

    res.json({
      metrics: metrics.metrics,
      taskStatuses: metrics.taskStatuses,
      milestoneStatuses: metrics.milestoneStatuses,
      teamPerformance: metrics.teamPerformance,
      riskAssessment: metrics.riskAssessment,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
};

/**
 * Get all reports for a user across all workplaces
 * GET /api/reports/my-reports
 */
exports.getUserReports = async (req, res) => {
  try {
    const userId = (req.user._id || req.user.id).toString();
    const { limit = 20, page = 1 } = req.query;

    const skip = (page - 1) * limit;

    // Find workplaces where user is client, freelancer, or member
    const userWorkplaces = await Workplace.find({
      $or: [
        { client: userId },
        { freelancer: userId },
        { 'members.user': userId },
      ],
    }).select('_id');
    const workplaceIds = userWorkplaces.map((w) => w._id);

    const query = {
      $or: [
        { generatedBy: userId },
        { workplaceId: { $in: workplaceIds } },
      ],
    };

    const reports = await Report.find(query)
      .sort({ createdAt: -1, generatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('workplaceId', 'title')
      .populate('projectId', 'title')
      .populate('generatedBy', 'name email');

    const total = await Report.countDocuments(query);

    res.json({
      reports,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching user reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
};

/**
 * Delete a report
 * DELETE /api/reports/:id
 */
exports.deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req.user._id || req.user.id).toString();

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Only report generator or workspace client can delete
    const workspace = await Workplace.findById(report.workplaceId);
    const isAuthorized =
      report.generatedBy.toString() === userId ||
      workspace.client.toString() === userId;

    if (!isAuthorized) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await Report.findByIdAndDelete(id);

    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ error: 'Failed to delete report' });
  }
};
