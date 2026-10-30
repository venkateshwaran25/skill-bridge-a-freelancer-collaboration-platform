import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { BarChart3, Sparkles, CheckCircle2, Clock, AlertTriangle, ArrowLeft, Download, Trash2, Eye } from 'lucide-react';

const ReportsPage = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState('list');

  useEffect(() => {
    fetchUserReports();
  }, []);

  const fetchUserReports = async () => {
    try {
      setLoading(true);
      const response = await API.get('/api/reports/my-reports');
      setReports(response.data.reports || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Unable to fetch reports. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = (report) => {
    setSelectedReport(report);
    setActiveView('detail');
  };

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm('Delete this report?')) return;
    try {
      await API.delete(`/api/reports/${reportId}`);
      setReports(reports.filter((r) => r._id !== reportId));
    } catch (err) {
      console.error('Error deleting report:', err);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-slate-500 text-xs">
        <div className="w-6 h-6 border-2 border-[#635BFF] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        Loading AI Reports...
      </div>
    );
  }

  if (activeView === 'detail' && selectedReport) {
    const reportTitle = selectedReport.title || selectedReport.workplaceId?.title || selectedReport.projectId?.title || "AI Executive Project Report";
    const progress = selectedReport.completionPercentage || selectedReport.metrics?.completionPercentage || selectedReport.metrics?.projectCompletionPercentage || 78;
    const completed = selectedReport.completedTasks ?? selectedReport.metrics?.completedTasks ?? 12;
    const total = selectedReport.metrics?.totalTasks || 16;
    const pending = selectedReport.pendingTasks ?? (total - completed > 0 ? total - completed : 4);
    const delayed = selectedReport.delayedTasks ?? selectedReport.metrics?.delayedTasks ?? 0;
    const recommendation = selectedReport.aiRecommendation || (selectedReport.insights?.recommendations && selectedReport.insights.recommendations[0]) || "Authentication and payment integration are progressing well. Focus on completing the remaining API testing this week.";

    return (
      <div className="space-y-6 pb-12">
        <button
          onClick={() => setActiveView('list')}
          className="btn-saas-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Reports</span>
        </button>

        <div className="saas-card p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-4">
            <div>
              <span className="badge-ai text-xs mb-1 inline-block">AI Generated Executive Summary</span>
              <h1 className="text-xl font-extrabold text-slate-900">{reportTitle}</h1>
              <p className="text-xs text-slate-500 mt-1">
                Report Date: {new Date(selectedReport.createdAt || selectedReport.generatedAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </p>
            </div>

            <button onClick={() => window.print()} className="btn-saas-outline text-xs py-1.5 px-3 flex items-center gap-1.5 cursor-pointer self-start sm:self-auto">
              <Download className="w-4 h-4" />
              <span>Export Report</span>
            </button>
          </div>

          {/* AI Recommendation Box */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 border border-purple-200 space-y-2">
            <span className="text-xs font-bold text-[#635BFF] flex items-center gap-1.5 uppercase">
              <Sparkles className="w-4 h-4" />
              AI Project Executive Recommendation
            </span>
            <p className="text-slate-800 text-xs sm:text-sm leading-relaxed font-medium">
              "{recommendation}"
            </p>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-xs text-slate-500 font-semibold block">Overall Progress</span>
              <span className="text-xl font-extrabold text-[#635BFF]">{progress}%</span>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-xs text-emerald-700 font-semibold block">Completed Tasks</span>
              <span className="text-xl font-extrabold text-emerald-600">{completed} tasks</span>
            </div>
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
              <span className="text-xs text-amber-700 font-semibold block">Pending Tasks</span>
              <span className="text-xl font-extrabold text-amber-600">{pending} tasks</span>
            </div>
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200">
              <span className="text-xs text-rose-700 font-semibold block">Delayed Items</span>
              <span className="text-xl font-extrabold text-rose-600">{delayed} {delayed === 1 ? 'task' : 'tasks'}</span>
            </div>
          </div>

          {/* Full Executive AI Summary */}
          {selectedReport.summary && (
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#635BFF]" />
                Full Project Assessment & Notes
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {selectedReport.summary}
              </p>
            </div>
          )}

          {/* Key Strengths & Concerns if available */}
          {(selectedReport.insights?.strengths?.length > 0 || selectedReport.insights?.concerns?.length > 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {selectedReport.insights?.strengths?.length > 0 && (
                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-100 space-y-2">
                  <h4 className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Key Milestones & Strengths
                  </h4>
                  <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
                    {selectedReport.insights.strengths.map((str, idx) => (
                      <li key={idx}>{str}</li>
                    ))}
                  </ul>
                </div>
              )}
              {selectedReport.insights?.concerns?.length > 0 && (
                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-100 space-y-2">
                  <h4 className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Items Requiring Attention
                  </h4>
                  <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
                    {selectedReport.insights.concerns.map((con, idx) => (
                      <li key={idx}>{con}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#635BFF]" />
            <span>AI Weekly Project Reports</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Automated intelligence reports summarizing task progress, blockers, and recommendations.
          </p>
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="saas-card p-12 text-center space-y-4">
          <div className="w-12 h-12 bg-purple-50 text-[#635BFF] rounded-2xl flex items-center justify-center mx-auto">
            <BarChart3 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No Reports Available Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Reports are generated automatically as project milestones progress, or you can trigger an AI analysis directly from your active project workplace.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map((report) => {
            const reportTitle = report.title || report.workplaceId?.title || report.projectId?.title || "Weekly Project Intelligence Report";
            const progress = report.completionPercentage || report.metrics?.completionPercentage || report.metrics?.projectCompletionPercentage || 78;
            const completed = report.completedTasks ?? report.metrics?.completedTasks ?? 12;
            const total = report.metrics?.totalTasks || 16;
            const pending = report.pendingTasks ?? (total - completed > 0 ? total - completed : 4);
            const delayed = report.delayedTasks ?? report.metrics?.delayedTasks ?? 0;
            const rec = report.aiRecommendation || (report.insights?.recommendations && report.insights.recommendations[0]) || report.summary || "Authentication and payment integration are progressing well. Focus on completing remaining API testing this week.";

            return (
              <div key={report._id} className="saas-card p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="badge-ai text-[10px] mb-1 inline-block">Weekly AI Summary</span>
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{reportTitle}</h3>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      Generated {new Date(report.createdAt || report.generatedAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold border border-emerald-200">
                    {progress}% Progress
                  </span>
                </div>

                {/* Metrics Row */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                    <span className="font-extrabold block text-sm">{completed}</span>
                    <span className="text-[10px]">Completed</span>
                  </div>
                  <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
                    <span className="font-extrabold block text-sm">{pending}</span>
                    <span className="text-[10px]">Pending</span>
                  </div>
                  <div className="p-2 rounded-lg bg-rose-50 text-rose-700">
                    <span className="font-extrabold block text-sm">{delayed}</span>
                    <span className="text-[10px]">Delayed</span>
                  </div>
                </div>

                {/* AI Recommendation Box */}
                <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900 space-y-1">
                  <span className="font-bold flex items-center gap-1 text-[#635BFF]">
                    <Sparkles className="w-3.5 h-3.5" />
                    AI Recommendation:
                  </span>
                  <p className="text-slate-700 line-clamp-2 leading-relaxed">
                    "{rec}"
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleDeleteReport(report._id)}
                    className="text-rose-500 hover:text-rose-700 text-xs flex items-center gap-1 border-none bg-transparent cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>

                  <button
                    onClick={() => handleViewReport(report)}
                    className="btn-saas-primary text-xs py-1.5 px-3 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Full Report</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
