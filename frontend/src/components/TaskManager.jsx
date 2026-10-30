import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Plus, Clock, User, AlertCircle, CheckCircle2, MoreVertical, X } from 'lucide-react';

const TaskManager = ({ workplaceId }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, [workplaceId]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/api/tasks/workplace/${workplaceId}`);
      setTasks(res.data.tasks || []);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { id: 'to-do', title: 'TO DO', color: 'border-slate-300 bg-slate-100 text-slate-700' },
    { id: 'in-progress', title: 'IN PROGRESS', color: 'border-indigo-300 bg-indigo-50 text-indigo-700' },
    { id: 'review', title: 'REVIEW', color: 'border-purple-300 bg-purple-50 text-purple-700' },
    { id: 'completed', title: 'COMPLETED', color: 'border-emerald-300 bg-emerald-50 text-emerald-700' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">Task Management Board</h2>
          <p className="text-xs text-slate-500">Track deliverables, assignees, and progress across columns.</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn-saas-primary text-xs py-2 px-3"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      {showCreateForm && (
        <CreateTaskModal
          workplaceId={workplaceId}
          onClose={() => setShowCreateForm(false)}
          onTaskCreated={() => {
            setShowCreateForm(false);
            fetchTasks();
          }}
        />
      )}

      {loading ? (
        <div className="py-12 text-center text-slate-400 text-xs">Loading task board...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map((col) => {
            const colTasks = tasks.filter((t) => {
              if (col.id === 'to-do') return t.status === 'to-do' || t.status === 'blocked';
              return t.status === col.id;
            });

            return (
              <div key={col.id} className="saas-card p-3 bg-slate-50/60 border-slate-200 space-y-3">
                <div className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center justify-between ${col.color}`}>
                  <span>{col.title}</span>
                  <span className="w-5 h-5 rounded-full bg-white text-slate-800 text-[10px] flex items-center justify-center font-extrabold shadow-2xs">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-2 min-h-[280px]">
                  {colTasks.map((task) => (
                    <TaskCard key={task._id} task={task} onUpdate={fetchTasks} />
                  ))}
                  {colTasks.length === 0 && (
                    <div className="h-32 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 text-[11px]">
                      No tasks
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const TaskCard = ({ task, onUpdate }) => {
  const handleStatusChange = async (newStatus) => {
    try {
      await API.put(`/api/tasks/${task._id}`, { status: newStatus });
      onUpdate();
    } catch (error) {
      alert('Failed to update status');
    }
  };

  const priorityColors = {
    critical: "bg-rose-100 text-rose-700 border-rose-200",
    high: "bg-amber-100 text-amber-700 border-amber-200",
    medium: "bg-purple-100 text-purple-700 border-purple-200",
    low: "bg-slate-100 text-slate-600 border-slate-200",
  };

  return (
    <div className="saas-card p-3 bg-white hover:border-[#635BFF] transition-all space-y-2.5 shadow-2xs">
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-xs font-bold text-slate-900 leading-snug">{task.title}</h4>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase shrink-0 ${priorityColors[task.priority] || priorityColors.medium}`}>
          {task.priority}
        </span>
      </div>

      {task.description && (
        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{task.description}</p>
      )}

      <div className="space-y-1 pt-1 border-t border-slate-100">
        <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
          <span className="truncate">Assigned: <strong className="text-slate-800">{task.assignedTo?.name || "Unassigned"}</strong></span>
          {task.dueDate && <span>{new Date(task.dueDate).toLocaleDateString()}</span>}
        </div>

        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-[#635BFF] h-full rounded-full"
            style={{ width: `${task.completionPercentage || (task.status === 'completed' ? 100 : 40)}%` }}
          />
        </div>
      </div>

      <div className="pt-1">
        <select
          value={task.status}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="form-control-custom text-[10px] py-1 px-2 w-full bg-slate-50"
        >
          <option value="to-do">Move to: TO DO</option>
          <option value="in-progress">Move to: IN PROGRESS</option>
          <option value="review">Move to: REVIEW</option>
          <option value="completed">Move to: COMPLETED</option>
        </select>
      </div>
    </div>
  );
};

const CreateTaskModal = ({ workplaceId, onClose, onTaskCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    estimatedHours: 0,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post('/api/tasks', { workplaceId, ...formData });
      if (data.success && data.task) {
        onTaskCreated(data.task);
      } else {
        onTaskCreated();
      }
    } catch (error) {
      console.error('Task create error:', error);
      onTaskCreated();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="saas-card max-w-md w-full p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="text-sm font-bold text-slate-900">Create New Task</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 border-none bg-transparent">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Task Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="form-control-custom w-full text-xs"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="form-control-custom w-full text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="form-control-custom w-full text-xs"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="form-control-custom w-full text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-saas-secondary text-xs py-1.5 px-3">
              Cancel
            </button>
            <button type="submit" className="btn-saas-primary text-xs py-1.5 px-4">
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskManager;
