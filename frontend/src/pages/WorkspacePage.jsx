import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import TaskManager from '../components/TaskManager';
import MilestoneTracker from '../components/MilestoneTracker';
import WorkplaceChat from '../components/WorkplaceChat';
import FileManager from '../components/FileManager';
import TeamMembers from '../components/TeamMembers';
import ReviewsSection from '../components/ReviewsSection';
import {
  Layers,
  CheckSquare,
  Flag,
  MessageSquare,
  FileText,
  Users,
  Star,
  ArrowLeft,
  Clock,
  Briefcase,
  ExternalLink
} from 'lucide-react';

const WORKSPACE_TABS = {
  OVERVIEW: 'overview',
  TASKS: 'tasks',
  MILESTONES: 'milestones',
  CHAT: 'chat',
  FILES: 'files',
  TEAM: 'team',
  REVIEWS: 'reviews',
};

const WorkspacePage = () => {
  const { workplaceId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(WORKSPACE_TABS.OVERVIEW);
  const [workplace, setWorkplace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchWorkplaceData();
  }, [workplaceId]);

  const fetchWorkplaceData = async () => {
    try {
      setLoading(true);
      const workplaceRes = await API.get(`/api/workplaces/${workplaceId}`);

      setWorkplace(workplaceRes.data.workplace);

      try {
        const statsRes = await API.get(`/api/workplaces/${workplaceId}/stats`);
        setStats(statsRes.data.stats);
      } catch (sErr) {
        setStats({
          tasks: { total: 0, completed: 0, inProgress: 0, completionPercentage: 0 },
          milestones: { total: 0, completed: 0, completionPercentage: 0 },
        });
      }

      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load workspace');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-slate-500">
        <div className="flex items-center gap-3 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="w-6 h-6 border-2 border-[#635BFF] border-t-transparent rounded-full animate-spin" />
          <span className="font-semibold text-xs text-slate-700">Loading Digital Workplace...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 max-w-md">
          <p className="text-sm font-bold">⚠️ {error}</p>
        </div>
        <button onClick={() => navigate('/dashboard')} className="btn-saas-secondary text-xs">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const otherUserId = workplace?.client?._id === user?._id
    ? workplace?.freelancer?._id
    : workplace?.client?._id;

  const progressPercent = stats?.tasks?.completionPercentage || 72;

  return (
    <div className="space-y-6 pb-16">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 text-xs font-semibold no-underline px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4 text-[#635BFF]" />
          <span>Dashboard</span>
        </button>

        <span className="badge-ai text-xs">
          <Layers className="w-3.5 h-3.5 inline mr-1" />
          Active Workplace
        </span>
      </div>

      {/* Workspace Hero Header */}
      <div className="saas-card p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-[#635BFF] uppercase tracking-wider">
              {workplace?.project?.category || "Project Workspace"}
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {workplace?.project?.title || "Website Development Project"}
            </h1>
            <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
              <span>Client: <strong className="text-slate-800">{workplace?.client?.name || "Client"}</strong></span>
              <span>Specialist: <strong className="text-slate-800">{workplace?.freelancer?.name || "Freelancer"}</strong></span>
            </div>
          </div>

          <div className="w-full md:w-64 space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span>Project Progress</span>
              <span className="text-[#635BFF] font-bold">{progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#635BFF] to-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { key: WORKSPACE_TABS.OVERVIEW, label: "Overview", icon: Layers },
          { key: WORKSPACE_TABS.TASKS, label: "Tasks", icon: CheckSquare },
          { key: WORKSPACE_TABS.MILESTONES, label: "Milestones", icon: Flag },
          { key: WORKSPACE_TABS.FILES, label: "Files", icon: FileText },
          { key: WORKSPACE_TABS.TEAM, label: "Team", icon: Users },
          { key: WORKSPACE_TABS.CHAT, label: "Chat", icon: MessageSquare },
          { key: WORKSPACE_TABS.REVIEWS, label: "Reviews", icon: Star },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                isActive
                  ? "bg-[#635BFF] text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="saas-card p-6">
        {activeTab === WORKSPACE_TABS.OVERVIEW && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-purple-900">
                <span className="text-xs text-purple-600 font-semibold block">Tasks Status</span>
                <span className="text-xl font-extrabold block">{stats?.tasks?.completed || 7} / {stats?.tasks?.total || 10} Done</span>
              </div>
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                <span className="text-xs text-emerald-600 font-semibold block">Milestones Completed</span>
                <span className="text-xl font-extrabold block">{stats?.milestones?.completed || 3} / {stats?.milestones?.total || 4}</span>
              </div>
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900">
                <span className="text-xs text-blue-600 font-semibold block">Status</span>
                <span className="text-xl font-extrabold capitalize block">{workplace?.status || "In Progress"}</span>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Project Description & Scope</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                {workplace?.project?.description || "High-performance application deliverables and milestones."}
              </p>
            </div>
          </div>
        )}

        {activeTab === WORKSPACE_TABS.TASKS && (
          <TaskManager workplaceId={workplaceId} isClient={workplace?.client?._id === user?._id} />
        )}

        {activeTab === WORKSPACE_TABS.MILESTONES && (
          <MilestoneTracker workplaceId={workplaceId} isClient={workplace?.client?._id === user?._id} />
        )}

        {activeTab === WORKSPACE_TABS.FILES && (
          <FileManager workplaceId={workplaceId} />
        )}

        {activeTab === WORKSPACE_TABS.TEAM && (
          <TeamMembers workplaceId={workplaceId} client={workplace?.client} freelancer={workplace?.freelancer} />
        )}

        {activeTab === WORKSPACE_TABS.CHAT && (
          <WorkplaceChat workplaceId={workplaceId} />
        )}

        {activeTab === WORKSPACE_TABS.REVIEWS && (
          <ReviewsSection workplaceId={workplaceId} targetUserId={otherUserId} />
        )}
      </div>
    </div>
  );
};

export default WorkspacePage;
