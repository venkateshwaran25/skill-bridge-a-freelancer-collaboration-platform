import React, { useState, useEffect } from 'react';
import API from '../services/api';
import './MilestoneTracker.css';

const MilestoneTracker = ({ workplaceId }) => {
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    fetchMilestones();
  }, [workplaceId]);

  const fetchMilestones = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/api/milestones/workplace/${workplaceId}`);
      setMilestones(res.data.milestones || []);
    } catch (error) {
      console.error('Failed to fetch milestones:', error);
      setMilestones([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="milestone-tracker">
      <div className="milestone-header">
        <h2>Milestone Management</h2>
        <button 
          className="btn-primary" 
          onClick={() => setShowCreateForm(true)}
        >
          + Create Milestone
        </button>
      </div>

      {showCreateForm && (
        <CreateMilestoneForm 
          workplaceId={workplaceId}
          onMilestoneCreated={() => {
            setShowCreateForm(false);
            fetchMilestones();
          }}
        />
      )}

      {loading ? (
        <div className="loading">Loading milestones...</div>
      ) : milestones.length === 0 ? (
        <div className="empty-state">
          <p>No milestones created yet. Create one to track project progress!</p>
        </div>
      ) : (
        <div className="milestones-timeline">
          {milestones.map((milestone, index) => (
            <MilestoneCard 
              key={milestone._id} 
              milestone={milestone} 
              isLast={index === milestones.length - 1}
              onUpdate={fetchMilestones}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CreateMilestoneForm = ({ workplaceId, onMilestoneCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    budget: 0,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post('/api/milestones', { workplaceId, ...formData });
      onMilestoneCreated();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create milestone');
    }
  };

  return (
    <div className="create-milestone-form">
      <h3>Create New Milestone</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Milestone Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Design Phase Complete"
              required
            />
          </div>

          <div className="form-group">
            <label>Due Date *</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe what this milestone includes"
            rows="3"
          ></textarea>
        </div>

        <div className="form-group">
          <label>Budget Allocation</label>
          <input
            type="number"
            value={formData.budget}
            onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) })}
            placeholder="0"
            min="0"
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary">Create Milestone</button>
          <button 
            type="button" 
            className="btn-secondary"
            onClick={onMilestoneCreated}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

const MilestoneCard = ({ milestone, isLast, onUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [status, setStatus] = useState(milestone.status);
  const daysUntilDue = Math.ceil((new Date(milestone.dueDate) - new Date()) / (1000 * 60 * 60 * 24));

  const handleStatusChange = async (newStatus) => {
    try {
      await API.put(`/api/milestones/${milestone._id}`, { status: newStatus });
      setStatus(newStatus);
      onUpdate();
    } catch (error) {
      alert('Failed to update milestone status');
    }
  };

  return (
    <div className={`milestone-card status-${status}`}>
      <div className="milestone-timeline-dot"></div>
      {!isLast && <div className="milestone-timeline-line"></div>}

      <div className="milestone-content">
        <div className="milestone-header-row">
          <div className="milestone-title-section">
            <h3>{milestone.title}</h3>
            <span className={`status-badge ${status}`}>{status}</span>
          </div>
          <button 
            className="expand-btn"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? '▼' : '▶'}
          </button>
        </div>

        <div className="milestone-dates">
          <span className="due-date">
            Due: {new Date(milestone.dueDate).toLocaleDateString()}
          </span>
          <span className={`days-indicator ${daysUntilDue < 0 ? 'overdue' : daysUntilDue < 7 ? 'urgent' : 'on-track'}`}>
            {daysUntilDue < 0 ? `${Math.abs(daysUntilDue)} days overdue` : `${daysUntilDue} days left`}
          </span>
        </div>

        {isExpanded && (
          <div className="milestone-details">
            {milestone.description && (
              <div className="detail-section">
                <p className="detail-label">Description:</p>
                <p className="detail-text">{milestone.description}</p>
              </div>
            )}

            <div className="detail-section">
              <p className="detail-label">Progress</p>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${milestone.completionPercentage || 0}%` }}></div>
              </div>
              <p className="progress-text">{milestone.completionPercentage || 0}% Complete</p>
            </div>

            {milestone.budget > 0 && (
              <div className="detail-section">
                <p className="detail-label">Budget: ${milestone.budget}</p>
                <p className="detail-label">Payment Status: <span className={`payment-${milestone.paymentStatus}`}>{milestone.paymentStatus}</span></p>
              </div>
            )}

            {milestone.tasks && milestone.tasks.length > 0 && (
              <div className="detail-section">
                <p className="detail-label">Associated Tasks: {milestone.tasks.length}</p>
              </div>
            )}

            <div className="milestone-actions">
              <select 
                value={status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="status-select"
              >
                <option value="not-started">Not Started</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="delayed">Delayed</option>
                <option value="on-hold">On Hold</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MilestoneTracker;
