import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './ProjectDashboard.css';

const ProjectDashboard = () => {
  const { workplaceId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generatingReport, setGeneratingReport] = useState(false);

  useEffect(() => {
    fetchProjectStats();
  }, [workplaceId]);

  const fetchProjectStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('skillbridge_token');
      const response = await axios.get(
        `/api/reports/stats/${workplaceId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStats(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Failed to load project statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      setGeneratingReport(true);
      const token = localStorage.getItem('skillbridge_token');
      await axios.post(
        `/api/reports/generate/${workplaceId}`,
        { type: 'weekly' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Report generated successfully!');
      navigate('/reports');
    } catch (err) {
      console.error('Error generating report:', err);
      alert('Failed to generate report');
    } finally {
      setGeneratingReport(false);
    }
  };

  if (loading) {
    return <div className="project-dashboard loading">Loading project dashboard...</div>;
  }

  if (error) {
    return <div className="project-dashboard error">{error}</div>;
  }

  return (
    <div className="project-dashboard">
      <div className="dashboard-header">
        <h1>📊 Project Analytics Dashboard</h1>
        <button
          className="btn-generate-report"
          onClick={handleGenerateReport}
          disabled={generatingReport}
        >
          {generatingReport ? 'Generating...' : '📄 Generate Report'}
        </button>
      </div>

      {/* Overview Cards */}
      <div className="dashboard-grid">
        <StatCard
          title="Project Completion"
          value={`${stats?.metrics?.projectCompletionPercentage || 0}%`}
          icon="📈"
          bgColor="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          trend={stats?.metrics?.completionPercentage > 50 ? 'up' : 'down'}
        />
        <StatCard
          title="Budget Usage"
          value={`${stats?.metrics?.budgetPercentage || 0}%`}
          icon="💰"
          bgColor="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
          trend={stats?.metrics?.budgetPercentage < 75 ? 'up' : 'down'}
        />
        <StatCard
          title="Task Completion"
          value={`${stats?.metrics?.completedTasks || 0}/${stats?.metrics?.totalTasks || 0}`}
          icon="✅"
          bgColor="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
          trend={stats?.metrics?.completionPercentage > 60 ? 'up' : 'down'}
        />
        <StatCard
          title="Team Productivity"
          value={stats?.teamPerformance?.teamProductivity?.toUpperCase() || 'N/A'}
          icon="👥"
          bgColor="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
          trend="neutral"
        />
      </div>

      {/* Detailed Sections */}
      <div className="dashboard-sections">
        {/* Tasks Overview */}
        <div className="dashboard-card">
          <h2>📝 Task Overview</h2>
          <div className="task-overview">
            <TaskStatusBar
              label="To-Do"
              count={stats?.taskStatuses?.todo || 0}
              color="#3498db"
            />
            <TaskStatusBar
              label="In Progress"
              count={stats?.taskStatuses?.inProgress || 0}
              color="#f39c12"
            />
            <TaskStatusBar
              label="Completed"
              count={stats?.taskStatuses?.completed || 0}
              color="#27ae60"
            />
            <TaskStatusBar
              label="Blocked"
              count={stats?.taskStatuses?.blocked || 0}
              color="#e74c3c"
            />
          </div>
          <div className="overview-stats">
            <p>
              <strong>{stats?.metrics?.completedTasks || 0}</strong> tasks completed
            </p>
            <p>
              <strong>{stats?.metrics?.delayedTasks || 0}</strong> tasks overdue
            </p>
            <p>
              Avg <strong>{stats?.metrics?.avgTaskCompletionTime || 0}</strong>h per task
            </p>
          </div>
        </div>

        {/* Milestones Overview */}
        <div className="dashboard-card">
          <h2>🎯 Milestone Status</h2>
          <div className="milestone-overview">
            <MilestoneStatusItem
              status="Not Started"
              count={stats?.milestoneStatuses?.notStarted || 0}
              color="#95a5a6"
            />
            <MilestoneStatusItem
              status="In Progress"
              count={stats?.milestoneStatuses?.inProgress || 0}
              color="#f39c12"
            />
            <MilestoneStatusItem
              status="Completed"
              count={stats?.milestoneStatuses?.completed || 0}
              color="#27ae60"
            />
            <MilestoneStatusItem
              status="Delayed"
              count={stats?.milestoneStatuses?.delayed || 0}
              color="#e74c3c"
            />
          </div>
          <p className="milestone-note">
            {stats?.milestoneStatuses?.completed || 0} of{' '}
            {(stats?.metrics?.totalMilestones || 0) +
              (stats?.milestoneStatuses?.completed || 0)} milestones completed
          </p>
        </div>

        {/* Risk Assessment */}
        <div className="dashboard-card">
          <h2>⚠️ Risk Level</h2>
          <div className="risk-assessment">
            <div
              className={`risk-indicator risk-${stats?.riskAssessment?.overallRisk || 'low'}`}
            >
              {(stats?.riskAssessment?.overallRisk || 'low').toUpperCase()}
            </div>
            <div className="risk-details">
              {stats?.riskAssessment?.atRiskTasks?.length > 0 && (
                <p>⚠️ {stats.riskAssessment.atRiskTasks.length} at-risk tasks</p>
              )}
              {stats?.riskAssessment?.atRiskMilestones?.length > 0 && (
                <p>⚠️ {stats.riskAssessment.atRiskMilestones.length} at-risk milestones</p>
              )}
              {stats?.metrics?.delayedTasks > 0 && (
                <p>⚠️ {stats.metrics.delayedTasks} overdue tasks</p>
              )}
              {stats?.riskAssessment?.atRiskTasks?.length === 0 &&
                stats?.riskAssessment?.atRiskMilestones?.length === 0 && (
                  <p>✅ No major risks identified</p>
                )}
            </div>
          </div>
        </div>

        {/* Team Performance */}
        <div className="dashboard-card">
          <h2>👥 Team Performance</h2>
          <div className="team-performance">
            {stats?.teamPerformance?.topPerformer && (
              <div className="top-performer-badge">
                <p className="label">🏆 Top Performer</p>
                <p className="performer-tasks">
                  {stats.teamPerformance.topPerformer.tasksCompleted} tasks
                </p>
              </div>
            )}
            <div className="team-metrics">
              <MetricDisplay
                label="Avg Tasks per Member"
                value={stats?.teamPerformance?.averageTasksPerTeamMember?.toFixed(1) || 0}
              />
              <MetricDisplay
                label="Team Productivity"
                value={stats?.teamPerformance?.teamProductivity?.toUpperCase() || 'N/A'}
              />
            </div>
          </div>
        </div>

        {/* Budget Tracking */}
        <div className="dashboard-card">
          <h2>💰 Budget Status</h2>
          <div className="budget-tracking">
            <div className="budget-bar">
              <div
                className="budget-used"
                style={{ width: `${stats?.metrics?.budgetPercentage || 0}%` }}
              />
            </div>
            <div className="budget-stats">
              <p>
                <strong>${stats?.metrics?.budgetUsed || 0}</strong> used
              </p>
              <p>
                <strong>${stats?.metrics?.budgetRemaining || 0}</strong> remaining
              </p>
            </div>
            <p className="budget-percentage">
              {stats?.metrics?.budgetPercentage || 0}% of budget utilized
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="dashboard-actions">
        <button className="btn-primary" onClick={() => navigate(`/workspace/${workplaceId}`)}>
          ← Back to Workspace
        </button>
        <button className="btn-secondary" onClick={() => navigate('/reports')}>
          View All Reports →
        </button>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, bgColor, trend }) => (
  <div className="stat-card" style={{ background: bgColor }}>
    <div className="stat-icon">{icon}</div>
    <div className="stat-content">
      <p className="stat-title">{title}</p>
      <p className="stat-value">{value}</p>
      <p className={`stat-trend ${trend}`}>
        {trend === 'up' && '📈 On track'}
        {trend === 'down' && '📉 Needs attention'}
        {trend === 'neutral' && '➡️ Stable'}
      </p>
    </div>
  </div>
);

const TaskStatusBar = ({ label, count, color }) => (
  <div className="task-status-row">
    <div className="task-label">
      <span style={{ backgroundColor: color }} className="task-dot" />
      {label}
    </div>
    <div className="task-count">{count}</div>
  </div>
);

const MilestoneStatusItem = ({ status, count, color }) => (
  <div className="milestone-item">
    <div
      className="milestone-indicator"
      style={{ backgroundColor: color }}
      title={status}
    />
    <div className="milestone-info">
      <p className="milestone-status">{status}</p>
      <p className="milestone-count">{count}</p>
    </div>
  </div>
);

const MetricDisplay = ({ label, value }) => (
  <div className="metric-display">
    <p className="metric-label">{label}</p>
    <p className="metric-value">{value}</p>
  </div>
);

export default ProjectDashboard;
