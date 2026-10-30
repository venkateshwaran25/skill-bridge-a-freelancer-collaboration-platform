import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Sparkles,
  Clock,
  Briefcase,
  Users,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Send,
  AlertCircle,
  FileText,
  DollarSign,
  Calendar,
  Layers,
  Cpu,
  TrendingUp,
  ShieldCheck,
  Zap,
  ExternalLink,
  UserCheck,
  Star,
  User,
  AlertTriangle,
} from "lucide-react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import { initSocket } from "../services/socket";
import StatusBadge from "../components/marketplace/StatusBadge";
import SkillChip from "../components/marketplace/SkillChip";
import ClientInfo from "../components/marketplace/ClientInfo";
import Button from "../components/marketplace/Button";

const ProjectDetailsPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [myProposal, setMyProposal] = useState(null);
  const [workplaceId, setWorkplaceId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // UI state
  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'ai-match' | 'workplace' | 'proposals'
  const [aiTone, setAiTone] = useState("professional"); // 'professional' | 'persuasive' | 'technical'

  // Bidding form state for flexible budget types
  const [proposedAmount, setProposedAmount] = useState(5000);
  const [hourlyRate, setHourlyRate] = useState(500);
  const [estimatedHours, setEstimatedHours] = useState(30);
  const [timeline, setTimeline] = useState("2 weeks");
  const [coverLetter, setCoverLetter] = useState("");
  const [estimatedDays, setEstimatedDays] = useState(7);
  const [outOfRangeConfirm, setOutOfRangeConfirm] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [proposalMsg, setProposalMsg] = useState("");
  const [proposalErr, setProposalErr] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);

  // Restore proposal draft from localStorage on mount
  useEffect(() => {
    if (!id) return;
    try {
      const savedProposal = localStorage.getItem(`skillbridge_proposal_draft_${id}`);
      if (savedProposal) {
        const p = JSON.parse(savedProposal);
        if (p.coverLetter) setCoverLetter(p.coverLetter);
        if (p.proposedAmount) setProposedAmount(p.proposedAmount);
        if (p.hourlyRate) setHourlyRate(p.hourlyRate);
        if (p.estimatedHours) setEstimatedHours(p.estimatedHours);
        if (p.estimatedDays) setEstimatedDays(p.estimatedDays);
        if (p.timeline) setTimeline(p.timeline);
      }
    } catch (e) {
      console.warn("Could not load proposal draft");
    }
  }, [id]);

  // Save proposal draft whenever user types
  useEffect(() => {
    if (!id) return;
    if (coverLetter || proposedAmount || hourlyRate) {
      localStorage.setItem(
        `skillbridge_proposal_draft_${id}`,
        JSON.stringify({ coverLetter, proposedAmount, hourlyRate, estimatedHours, estimatedDays, timeline })
      );
    }
  }, [id, coverLetter, proposedAmount, hourlyRate, estimatedHours, estimatedDays, timeline]);

  const fetchProjectDetails = async () => {
    try {
      const { data } = await API.get(`/api/projects/${id}`);
      if (data.success) {
        setProject(data.project);
        const p = data.project;
        if (p.budgetType === "fixed") {
          setProposedAmount(p.budgetMax || p.budgetMin || p.budget || 5000);
        } else if (p.budgetType === "hourly") {
          setHourlyRate(p.hourlyRateMax || p.hourlyRateMin || 500);
          setEstimatedHours(p.estimatedHoursMax || 30);
        } else {
          setProposedAmount(p.budget || 5000);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load project details");
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkplace = async () => {
    try {
      const { data } = await API.get(`/api/workplaces/project/${id}`);
      if (data.success && data.workplace) {
        setWorkplaceId(data.workplace._id);
      }
    } catch (err) {
      console.log("No workplace initialized yet");
    }
  };

  const fetchProposals = async () => {
    try {
      const { data } = await API.get(`/api/proposals/project/${id}`);
      if (data.success) {
        setProposals(data.proposals);
      }
    } catch (err) {
      console.log("Could not load project proposals:", err);
    }
  };

  const fetchMyProposal = async () => {
    if (user && user.role === "freelancer") {
      try {
        const { data } = await API.get("/api/proposals/my");
        if (data.success) {
          const found = data.proposals.find(
            (p) => (p.project?._id || p.project) === id
          );
          if (found) setMyProposal(found);
        }
      } catch (err) {
        console.log("Error checking user proposal:", err);
      }
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  useEffect(() => {
    if (project) {
      if (project.status === "in progress" || project.assignedFreelancer) {
        fetchWorkplace();
      }
      if (user) {
        if (project.postedBy?._id === user._id) {
          fetchProposals();
        } else if (user.role === "freelancer") {
          fetchMyProposal();
        }
      }
    }
  }, [project, user]);

  // Real-time socket event listeners
  useEffect(() => {
    if (user) {
      const socket = initSocket(user._id);

      const handleProposalAlert = (data) => {
        if (data.projectId === id || (data.proposal && data.proposal.project === id)) {
          fetchProposals();
          fetchProjectDetails();
        }
      };

      const handleStatusChange = (data) => {
        if (data.projectId === id) {
          fetchMyProposal();
          fetchProjectDetails();
          if (data.status === "accepted") {
            fetchWorkplace();
          }
        }
      };

      socket.on("proposal_alert", handleProposalAlert);
      socket.on("proposal_status_changed", handleStatusChange);

      return () => {
        socket.off("proposal_alert", handleProposalAlert);
        socket.off("proposal_status_changed", handleStatusChange);
      };
    }
  }, [id, user]);

  const handleGenerateAIProposal = async () => {
    setAiGenerating(true);
    setProposalErr("");
    setProposalMsg("");
    try {
      const { data } = await API.post("/api/ai/generate-proposal", {
        projectId: id,
        tone: aiTone,
      });
      if (data.success && data.proposalText) {
        setCoverLetter(data.proposalText);
        setProposalMsg(`✨ AI (${aiTone}) Proposal drafted successfully! Edit or customize below.`);
      } else {
        setProposalErr("Could not generate AI proposal. Please enter cover letter manually.");
      }
    } catch (err) {
      console.error("AI proposal error:", err);
      setProposalErr("AI proposal generation encountered an issue. Please enter cover letter manually.");
    } finally {
      setAiGenerating(false);
    }
  };

  const handleSubmitProposal = async (e) => {
    e.preventDefault();
    if (!coverLetter.trim()) {
      setProposalErr("Please write or generate a cover letter.");
      return;
    }

    setSubmitting(true);
    setProposalErr("");
    setProposalMsg("");

    try {
      const payload = {
        projectId: id,
        coverLetter,
        estimatedDays: Number(estimatedDays) || 7,
        timeline,
      };

      if (project.budgetType === "hourly") {
        payload.hourlyRate = Number(hourlyRate);
        payload.estimatedHours = Number(estimatedHours);
        payload.bidAmount = Number(hourlyRate) * Number(estimatedHours);
      } else {
        payload.bidAmount = Number(proposedAmount);
      }

      const { data } = await API.post("/api/proposals", payload);
      if (data.success) {
        localStorage.removeItem(`skillbridge_proposal_draft_${id}`);
        setProposalMsg("Proposal submitted successfully!");
        setMyProposal(data.proposal);
        fetchProjectDetails();
      }
    } catch (err) {
      setProposalErr(err.response?.data?.message || "Failed to submit proposal.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateProposalStatus = async (proposalId, status) => {
    try {
      const { data } = await API.put(`/api/proposals/${proposalId}/status`, { status });
      if (data.success) {
        if (data.workplaceId) {
          setWorkplaceId(data.workplaceId);
        }
        fetchProposals();
        fetchProjectDetails();
        if (status === "accepted") {
          fetchWorkplace();
        }
      }
    } catch (err) {
      alert("Failed to update proposal status");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-600">
        <div className="flex items-center gap-3 p-6 rounded-2xl bg-white border border-slate-200 shadow-md">
          <div className="w-6 h-6 border-2 border-[#635BFF] border-t-transparent rounded-full animate-spin" />
          <span className="font-semibold text-xs text-slate-700">Loading Project Details...</span>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 mb-6 max-w-md shadow-xs">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 mb-1">Project Unavailable</h3>
          <p className="text-xs text-slate-600">{error || "Project not found"}</p>
        </div>
        <Link to="/projects" className="no-underline">
          <button className="btn-saas-secondary">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Marketplace</span>
          </button>
        </Link>
      </div>
    );
  }

  const isOwner = user && project.postedBy?._id === user._id;
  const reqSkills = project.skills || [];
  const userSkills = user?.skills || [];
  const matchedSkills = reqSkills.filter((s) =>
    userSkills.some((us) => us.toLowerCase() === s.toLowerCase())
  );
  const matchPercentage =
    reqSkills.length > 0
      ? Math.round((matchedSkills.length / reqSkills.length) * 100)
      : 85;

  return (
    <div className="space-y-6 pb-16">
      {/* Top Navigation Link */}
      <div className="flex items-center justify-between">
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 text-xs font-semibold no-underline px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs transition-all"
        >
          <ArrowLeft className="w-4 h-4 text-[#635BFF]" />
          <span>Back to Marketplace</span>
        </Link>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-[#635BFF] text-xs font-bold">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          SkillBridge Verified Opportunity
        </span>
      </div>

      {/* Main Project Card Banner */}
      <div className="saas-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={project.status} />
              <span className="skill-tag">
                {project.category || "Full-Stack Development"}
              </span>
              {user && (
                <span className="badge-ai text-xs">
                  <Sparkles className="w-3 h-3 inline mr-1" />
                  {matchPercentage}% AI Match
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {project.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 pt-1 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#635BFF]" />
                <span>Duration: <strong className="text-slate-900">{project.duration || "2-3 weeks"}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>Applications: <strong className="text-slate-900">{project.proposalsCount || 0} / {project.maxProposals || 5} Max Limit</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-indigo-600" />
                <span>Posted by: <strong className="text-slate-900">{project.postedBy?.name || "Client"}</strong></span>
              </div>
            </div>
          </div>

          <div className="saas-card p-4 bg-slate-50 border-slate-200 shrink-0 space-y-1 sm:text-right">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Budget Structure
            </span>
            <span className="text-xl sm:text-2xl font-extrabold text-emerald-600 block">
              {project.budgetType === "hourly"
                ? `₹${project.hourlyRateMin || 500} - ₹${project.hourlyRateMax || 800}/hr`
                : project.budgetType === "negotiable"
                ? "Negotiable"
                : `₹${(project.budgetMax || project.budget || 50000).toLocaleString()}`}
            </span>
            <span className="text-[11px] text-slate-500 font-medium block">
              {project.budgetType === "hourly" ? "Hourly Rate" : "Fixed Budget"}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "overview"
              ? "bg-[#635BFF] text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveTab("ai-match")}
          className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "ai-match"
              ? "bg-[#635BFF] text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Cpu className="w-4 h-4 text-purple-400" />
          <span>AI Match Analysis</span>
        </button>

        <button
          onClick={() => setActiveTab("workplace")}
          className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "workplace"
              ? "bg-[#635BFF] text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Layers className="w-4 h-4 text-amber-500" />
          <span>Digital Workplace</span>
        </button>

        {isOwner && (
          <button
            onClick={() => setActiveTab("proposals")}
            className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "proposals"
                ? "bg-[#635BFF] text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Users className="w-4 h-4 text-emerald-500" />
            <span>Proposals ({proposals.length})</span>
          </button>
        )}
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Dynamic Column */}
        <div className="lg:col-span-8 space-y-6">
          {activeTab === "overview" && (
            <div className="saas-card p-6 space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#635BFF]" />
                  <span>Project Overview & Detailed Scope</span>
                </h3>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {project.description}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-2.5 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Required Technical Skills</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {project.skills?.map((sk, idx) => (
                    <span key={idx} className="skill-tag">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "ai-match" && (
            <div className="saas-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-purple-600" />
                    <span>AI Skill Compatibility Analysis</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Evaluation of freelancer profile against project requirements.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-extrabold text-emerald-600">{matchPercentage}%</span>
                  <span className="block text-[10px] text-slate-400 uppercase font-bold">Match Score</span>
                </div>
              </div>

              <div className="w-full bg-slate-100 rounded-full h-3 p-0.5 border border-slate-200">
                <div
                  className="bg-gradient-to-r from-[#635BFF] to-emerald-500 h-full rounded-full transition-all duration-700"
                  style={{ width: `${matchPercentage}%` }}
                />
              </div>
            </div>
          )}

          {activeTab === "workplace" && (
            <div className="saas-card p-6 space-y-4">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 border border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="badge-ai text-xs mb-2 inline-block">Digital Workplace</span>
                  <h3 className="text-lg font-bold text-slate-900">Project Collaboration Space</h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Manage tasks, exchange files, verify milestones, and chat in real-time.
                  </p>
                </div>

                <button
                  onClick={() => {
                    if (workplaceId) {
                      navigate(`/workspace/${workplaceId}`);
                    } else {
                      alert("Workplace initializes when a proposal is accepted.");
                    }
                  }}
                  className="btn-saas-primary text-xs py-2 px-4 shrink-0"
                >
                  <span>Launch Workspace</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {activeTab === "proposals" && isOwner && (
            <div className="saas-card p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Users className="w-5 h-5 text-emerald-600" />
                <span>Freelancer Proposals ({proposals.length})</span>
              </h3>

              {proposals.length === 0 ? (
                <p className="text-xs text-slate-500 py-8 text-center">No proposals submitted yet.</p>
              ) : (
                <div className="space-y-4">
                  {proposals.map((prop) => (
                    <div key={prop._id} className="saas-card p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#635BFF] text-white flex items-center justify-center font-bold text-xs">
                            {prop.freelancer?.name?.[0]?.toUpperCase() || "F"}
                          </div>
                          <div>
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                              {prop.freelancer?.name || "Freelancer"}
                            </h4>
                            <p className="text-[11px] text-slate-500">{prop.freelancer?.title || "Specialist"}</p>
                          </div>
                        </div>

                        <span className="text-sm font-extrabold text-emerald-600">
                          ₹{prop.bidAmount?.toLocaleString()}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200/60 leading-relaxed whitespace-pre-line">
                        {prop.coverLetter}
                      </p>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                        {prop.status === "pending" ? (
                          <>
                            <button
                              onClick={() => handleUpdateProposalStatus(prop._id, "rejected")}
                              className="btn-saas-secondary text-xs py-1 px-3"
                            >
                              Decline
                            </button>
                            <button
                              onClick={() => handleUpdateProposalStatus(prop._id, "accepted")}
                              className="btn-saas-primary text-xs py-1 px-3"
                            >
                              Accept & Hire
                            </button>
                          </>
                        ) : (
                          <span className="text-xs font-bold uppercase text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
                            Status: {prop.status}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Proposal Submission Form (for Freelancers) */}
          {user && user.role === "freelancer" && !isOwner && (
            <div className="saas-card p-6 space-y-4">
              {((project.proposalsCount || 0) >= (project.maxProposals || 5) && !myProposal) ? (
                <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <AlertCircle className="w-5 h-5 text-rose-600" />
                    <span>Application Limit Reached</span>
                  </div>
                  <p className="text-xs text-rose-700 leading-relaxed">
                    This project has reached its maximum application limit ({project.maxProposals || 5} proposals max). No further applications can be accepted at this time.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Send className="w-4 h-4 text-[#635BFF]" />
                      <span>Submit Proposal for this Project</span>
                    </h3>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500">Tone:</span>
                  <select
                    value={aiTone}
                    onChange={(e) => setAiTone(e.target.value)}
                    className="form-control-custom text-xs py-1 px-2"
                  >
                    <option value="professional">Professional</option>
                    <option value="persuasive">Persuasive</option>
                    <option value="technical">Technical</option>
                  </select>

                  <button
                    type="button"
                    onClick={handleGenerateAIProposal}
                    disabled={aiGenerating}
                    className="btn-saas-outline text-xs py-1 px-3"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{aiGenerating ? "Generating..." : "Generate AI Proposal"}</span>
                  </button>
                </div>
              </div>

              {proposalMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
                  {proposalMsg}
                </div>
              )}

              {proposalErr && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                  {proposalErr}
                </div>
              )}

              <form onSubmit={handleSubmitProposal} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Your Proposed Amount (₹)
                    </label>
                    <input
                      type="number"
                      value={proposedAmount}
                      onChange={(e) => setProposedAmount(e.target.value)}
                      className="form-control-custom w-full text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Estimated Duration
                    </label>
                    <input
                      type="text"
                      value={timeline}
                      onChange={(e) => setTimeline(e.target.value)}
                      placeholder="e.g. 2 weeks"
                      className="form-control-custom w-full text-xs"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Cover Letter & Pitch
                  </label>
                  <textarea
                    rows={6}
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Describe your solution, past experience, and deliverables..."
                    className="form-control-custom w-full text-xs"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-saas-primary w-full text-xs py-2.5"
                >
                  <span>{submitting ? "Submitting..." : "Submit Proposal"}</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </div>

    {/* Right Column (Client Info & Meta) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="saas-card p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
              Client Details
            </h3>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                {project.postedBy?.name?.[0]?.toUpperCase() || "C"}
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-slate-900">
                  {project.postedBy?.name || "Client"}
                </p>
                <p className="text-[11px] text-slate-500">
                  {project.postedBy?.title || (project.postedBy?.role === "client" ? "Verified Client" : "Client")}
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <div className="flex justify-between">
                <span>Projects Posted:</span>
                <strong className="text-slate-900">{project.postedBy?.totalJobs || 1}</strong>
              </div>
              <div className="flex justify-between">
                <span>Member Since:</span>
                <strong className="text-slate-900">
                  {project.postedBy?.createdAt
                    ? new Date(project.postedBy.createdAt).getFullYear()
                    : new Date().getFullYear()}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>Payment Method:</span>
                <strong className="text-emerald-600 font-bold">Verified</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsPage;
