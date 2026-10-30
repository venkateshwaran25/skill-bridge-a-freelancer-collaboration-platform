import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ArrowLeft,
  Send,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  DollarSign,
  Clock,
  MessageSquare,
  Zap,
  Check,
  X,
  Layers,
  ChevronRight,
  ChevronLeft,
  LogIn
} from "lucide-react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

const CreateProjectPage = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1); // 1: Details, 2: Skills, 3: Budget, 4: Timeline, 5: AI Suggestions, 6: Review

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Web Development");
  const [description, setDescription] = useState("");
  const [complexity, setComplexity] = useState("Intermediate");
  const [duration, setDuration] = useState("2-3 weeks");
  const [skills, setSkills] = useState("");

  // Flexible Budget State
  const [budgetType, setBudgetType] = useState("fixed"); // 'fixed' | 'hourly' | 'negotiable'
  const [budgetMin, setBudgetMin] = useState(5000);
  const [budgetMax, setBudgetMax] = useState(15000);
  const [hourlyRateMin, setHourlyRateMin] = useState(500);
  const [hourlyRateMax, setHourlyRateMax] = useState(1000);
  const [estimatedHoursMin, setEstimatedHoursMin] = useState(20);
  const [estimatedHoursMax, setEstimatedHoursMax] = useState(40);

  // AI Suggestion State
  const [aiSuggesting, setAiSuggesting] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [showAiModal, setShowAiModal] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiOptimizing, setAiOptimizing] = useState(false);

  const navigate = useNavigate();

  // Enforce role permission: only clients and admins can post projects
  useEffect(() => {
    if (user && user.role === "freelancer") {
      navigate("/projects", { replace: true });
    }
  }, [user, navigate]);

  // Restore saved draft project from localStorage on mount
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem("skillbridge_draft_project");
      if (savedDraft) {
        const d = JSON.parse(savedDraft);
        if (d.title) setTitle(d.title);
        if (d.category) setCategory(d.category);
        if (d.description) setDescription(d.description);
        if (d.complexity) setComplexity(d.complexity);
        if (d.duration) setDuration(d.duration);
        if (d.skills) setSkills(d.skills);
        if (d.budgetType) setBudgetType(d.budgetType);
        if (d.budgetMin) setBudgetMin(d.budgetMin);
        if (d.budgetMax) setBudgetMax(d.budgetMax);
        setMessage("✨ Restored your unsaved project draft!");
      }
    } catch (e) {
      console.warn("Could not load project draft");
    }
  }, []);

  // Save project form inputs to localStorage
  useEffect(() => {
    if (title || description || skills) {
      localStorage.setItem(
        "skillbridge_draft_project",
        JSON.stringify({
          title,
          category,
          description,
          complexity,
          duration,
          skills,
          budgetType,
          budgetMin,
          budgetMax,
        })
      );
    }
  }, [title, category, description, complexity, duration, skills, budgetType, budgetMin, budgetMax]);

  const handleAIOptimize = async () => {
    if (!title || !description) {
      setError("Please provide a title and initial description first.");
      return;
    }
    setError("");
    setAiOptimizing(true);

    try {
      const { data } = await API.post("/api/ai/optimize-description", { title, description });
      if (data.success) {
        setDescription(data.enhancedDescription);
        if (data.suggestedSkills && data.suggestedSkills.length > 0) {
          setSkills(data.suggestedSkills.join(", "));
        }
        setMessage("✨ Project description & skills optimized with AI!");
      }
    } catch (err) {
      setError("Failed to optimize description with AI.");
    } finally {
      setAiOptimizing(false);
    }
  };

  const handleAISuggestBudget = async () => {
    if (!title || !description) {
      setError("Please provide a title and description before requesting AI budget suggestions.");
      return;
    }
    setError("");
    setAiSuggesting(true);

    try {
      const { data } = await API.post("/api/ai/suggest-budget", {
        title,
        description,
        skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
        complexity,
        duration,
      });

      if (data.success && data.suggestion) {
        setAiSuggestion(data.suggestion);
        setShowAiModal(true);
      }
    } catch (err) {
      setError("Failed to generate AI budget suggestion.");
    } finally {
      setAiSuggesting(false);
    }
  };

  const applyAISuggestion = () => {
    if (!aiSuggestion) return;
    setBudgetType(aiSuggestion.recommendedBudgetType || "fixed");
    if (aiSuggestion.budgetMin) setBudgetMin(aiSuggestion.budgetMin);
    if (aiSuggestion.budgetMax) setBudgetMax(aiSuggestion.budgetMax);
    if (aiSuggestion.hourlyRateMin) setHourlyRateMin(aiSuggestion.hourlyRateMin);
    if (aiSuggestion.hourlyRateMax) setHourlyRateMax(aiSuggestion.hourlyRateMax);
    if (aiSuggestion.estimatedHoursMin) setEstimatedHoursMin(aiSuggestion.estimatedHoursMin);
    if (aiSuggestion.estimatedHoursMax) setEstimatedHoursMax(aiSuggestion.estimatedHoursMax);
    setShowAiModal(false);
    setMessage("✨ Applied AI Recommended Budget Parameters!");
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!user) {
      setError("Please log in to your account to publish this project.");
      return;
    }

    if (!title.trim() || !description.trim()) {
      setError("Project Title and Description are required.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    const parsedSkills = skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      title,
      category,
      description,
      skills: parsedSkills.length > 0 ? parsedSkills : ["Web Development"],
      budgetType,
      complexity,
      duration,
    };

    if (budgetType === "fixed") {
      payload.budgetMin = Number(budgetMin);
      payload.budgetMax = Number(budgetMax);
      payload.budget = Number(budgetMax) || Number(budgetMin);
    } else if (budgetType === "hourly") {
      payload.hourlyRateMin = Number(hourlyRateMin);
      payload.hourlyRateMax = Number(hourlyRateMax);
      payload.estimatedHoursMin = Number(estimatedHoursMin);
      payload.estimatedHoursMax = Number(estimatedHoursMax);
      payload.budget = Number(hourlyRateMax) * Number(estimatedHoursMax);
    } else {
      payload.budget = 0;
    }

    try {
      const { data } = await API.post("/api/projects", payload);
      if (data.success) {
        localStorage.removeItem("skillbridge_draft_project");
        setMessage("Project posted successfully! Redirecting...");
        setTimeout(() => navigate(`/projects/${data.project._id}`), 1200);
      }
    } catch (err) {
      console.error("Project publish error:", err);
      if (err.response?.status === 401) {
        setError("Your session has expired or is invalid. Please log in again to publish your project.");
      } else {
        setError(err.response?.data?.message || "Failed to create project.");
      }
    } finally {
      setLoading(false);
    }
  };

  const stepsList = [
    "Project Details",
    "Required Skills",
    "Budget",
    "Timeline",
    "AI Optimizations",
    "Review & Publish",
  ];

  return (
    <div className="space-y-6 pb-16 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 text-xs font-semibold no-underline px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4 text-[#635BFF]" />
          <span>Cancel & Return</span>
        </Link>
        <span className="text-xs font-bold text-[#635BFF] bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
          Create New Opportunity
        </span>
      </div>

      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Briefcase className="w-7 h-7 text-[#635BFF]" />
          <span>Post a Project</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Use our multi-step wizard and AI optimization tools to connect with verified talent.
        </p>
      </div>

      {/* Multi-Step Stepper Bar */}
      <div className="saas-card p-4 overflow-x-auto">
        <div className="flex items-center justify-between min-w-[550px]">
          {stepsList.map((stepName, idx) => {
            const stepNum = idx + 1;
            const isDone = stepNum < currentStep;
            const isCurrent = stepNum === currentStep;

            return (
              <div
                key={stepNum}
                onClick={() => stepNum <= currentStep && setCurrentStep(stepNum)}
                className="flex items-center gap-2 cursor-pointer"
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isDone
                      ? "bg-emerald-500 text-white"
                      : isCurrent
                      ? "bg-[#635BFF] text-white shadow-xs"
                      : "bg-slate-100 text-slate-400 border border-slate-200"
                  }`}
                >
                  {isDone ? <Check className="w-3.5 h-3.5" /> : stepNum}
                </div>
                <span
                  className={`text-xs font-semibold shrink-0 ${
                    isCurrent ? "text-[#635BFF]" : isDone ? "text-slate-800" : "text-slate-400"
                  }`}
                >
                  {stepName}
                </span>
                {stepNum < stepsList.length && (
                  <ChevronRight className="w-4 h-4 text-slate-300 mx-1 shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Error & Success Messages */}
      {message && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
          {message}
        </div>
      )}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          {(error.includes("log in") || error.includes("session") || error.includes("token")) && (
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold no-underline transition-all shrink-0"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Log In</span>
            </Link>
          )}
        </div>
      )}

      {/* Unauthenticated / Guest Warning Banner */}
      {!user && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-medium">
            <span>⚠️</span>
            <span>You are currently not logged in. Please log in to publish this project to the marketplace.</span>
          </div>
          <Link
            to="/login"
            className="inline-flex items-center gap-1 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold no-underline transition-all shrink-0"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Log In</span>
          </Link>
        </div>
      )}

      {/* Step Content Container */}
      <div className="saas-card p-6 sm:p-8 space-y-6">
        {/* STEP 1: Project Details */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              Step 1: Project Details
            </h2>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Project Title *
              </label>
              <input
                type="text"
                placeholder="e.g. Full Stack E-Commerce Platform with AI Recommendations"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="form-control-custom w-full text-xs sm:text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="form-control-custom w-full text-xs sm:text-sm"
                >
                  <option value="Web Development">Web Development</option>
                  <option value="Mobile Apps">Mobile Apps</option>
                  <option value="AI & Machine Learning">AI & Machine Learning</option>
                  <option value="UI/UX Design">UI/UX Design</option>
                  <option value="Data Science">Data Science</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Complexity Level
                </label>
                <select
                  value={complexity}
                  onChange={(e) => setComplexity(e.target.value)}
                  className="form-control-custom w-full text-xs sm:text-sm"
                >
                  <option value="Entry">Entry Level</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Expert">Expert Level</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">
                  Project Scope & Description *
                </label>
                <button
                  type="button"
                  onClick={handleAIOptimize}
                  disabled={aiOptimizing}
                  className="btn-saas-outline py-1 px-2.5 text-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{aiOptimizing ? "Optimizing..." : "Optimize with AI"}</span>
                </button>
              </div>
              <textarea
                rows={6}
                placeholder="Describe project requirements, tech stack preferences, and key deliverables..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="form-control-custom w-full text-xs sm:text-sm"
                required
              />
            </div>
          </div>
        )}

        {/* STEP 2: Required Skills */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              Step 2: Required Skills
            </h2>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Required Technical Skills (Comma-separated)
              </label>
              <input
                type="text"
                placeholder="React, Node.js, MongoDB, Python, Docker"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="form-control-custom w-full text-xs sm:text-sm"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Freelancers will be automatically matched based on these required skills.
              </p>
            </div>

            {skills.trim() && (
              <div>
                <span className="text-xs font-semibold text-slate-600 block mb-2">Parsed Skills Preview:</span>
                <div className="flex flex-wrap gap-1.5">
                  {skills.split(",").map((sk, idx) => (
                    <span key={idx} className="skill-tag">
                      {sk.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: Budget */}
        {currentStep === 3 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h2 className="text-base font-bold text-slate-900">
                Step 3: Budget Configuration
              </h2>

              <button
                type="button"
                onClick={handleAISuggestBudget}
                disabled={aiSuggesting}
                className="btn-saas-outline py-1 px-3 text-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#635BFF]" />
                <span>{aiSuggesting ? "Analyzing..." : "✨ Suggest Budget with AI"}</span>
              </button>
            </div>

            {/* Budget Type Tabs */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { type: "fixed", label: "Fixed Price", sub: "Specific total amount" },
                { type: "hourly", label: "Hourly Rate", sub: "Pay per hour worked" },
                { type: "negotiable", label: "Negotiable", sub: "Open to proposals" },
              ].map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => setBudgetType(item.type)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    budgetType === item.type
                      ? "bg-purple-50 border-[#635BFF] text-[#635BFF]"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className="text-xs font-bold block">{item.label}</span>
                  <span className="text-[10px] opacity-80 block">{item.sub}</span>
                </button>
              ))}
            </div>

            {/* Fixed Budget Fields */}
            {budgetType === "fixed" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Minimum Budget (₹)
                  </label>
                  <input
                    type="number"
                    value={budgetMin}
                    onChange={(e) => setBudgetMin(e.target.value)}
                    className="form-control-custom w-full text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Maximum Budget (₹)
                  </label>
                  <input
                    type="number"
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(e.target.value)}
                    className="form-control-custom w-full text-xs"
                  />
                </div>
              </div>
            )}

            {/* Hourly Budget Fields */}
            {budgetType === "hourly" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Hourly Rate Min (₹/hr)
                  </label>
                  <input
                    type="number"
                    value={hourlyRateMin}
                    onChange={(e) => setHourlyRateMin(e.target.value)}
                    className="form-control-custom w-full text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Hourly Rate Max (₹/hr)
                  </label>
                  <input
                    type="number"
                    value={hourlyRateMax}
                    onChange={(e) => setHourlyRateMax(e.target.value)}
                    className="form-control-custom w-full text-xs"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 4: Timeline */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              Step 4: Timeline & Duration
            </h2>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Expected Project Duration
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="form-control-custom w-full text-xs sm:text-sm"
              >
                <option value="Less than 1 week">Less than 1 week</option>
                <option value="1-2 weeks">1-2 weeks</option>
                <option value="2-3 weeks">2-3 weeks</option>
                <option value="1 month">1 month</option>
                <option value="3+ months">3+ months</option>
              </select>
            </div>
          </div>
        )}

        {/* STEP 5: AI Suggestions */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              Step 5: AI Recommendations
            </h2>

            <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-xs text-purple-900 space-y-2">
              <span className="font-bold flex items-center gap-1.5 text-[#635BFF]">
                <Sparkles className="w-4 h-4" />
                AI Optimization Check Passed
              </span>
              <p className="leading-relaxed text-slate-600">
                Your project scope and tech stack tags are well-formatted. Expect high engagement from verified specialists.
              </p>
            </div>
          </div>
        )}

        {/* STEP 6: Review & Publish */}
        {currentStep === 6 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              Step 6: Review & Publish Project
            </h2>

            <div className="saas-card p-4 space-y-2 bg-slate-50 text-xs">
              <div>
                <span className="font-bold text-slate-400 uppercase text-[10px]">Title:</span>
                <p className="font-bold text-slate-900 text-sm">{title || "Untitled Project"}</p>
              </div>

              <div>
                <span className="font-bold text-slate-400 uppercase text-[10px]">Category & Duration:</span>
                <p className="text-slate-700">{category} • {duration}</p>
              </div>

              <div>
                <span className="font-bold text-slate-400 uppercase text-[10px]">Budget Structure:</span>
                <p className="text-emerald-600 font-bold">
                  {budgetType === "fixed"
                    ? `Fixed (₹${budgetMin.toLocaleString()} - ₹${budgetMax.toLocaleString()})`
                    : budgetType === "hourly"
                    ? `Hourly (₹${hourlyRateMin} - ₹${hourlyRateMax}/hr)`
                    : "Negotiable"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="btn-saas-secondary text-xs py-2 px-4"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {currentStep < 6 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(Math.min(6, currentStep + 1))}
              className="btn-saas-primary text-xs py-2 px-4"
            >
              <span>Next Step</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="btn-saas-primary text-xs py-2.5 px-6"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? "Publishing..." : "Publish Project"}</span>
            </button>
          )}
        </div>
      </div>

      {/* AI Budget Modal */}
      {showAiModal && aiSuggestion && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="saas-card max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#635BFF]" />
                <span>AI Recommended Pricing</span>
              </h3>
              <button
                onClick={() => setShowAiModal(false)}
                className="text-slate-400 hover:text-slate-600 border-none bg-transparent"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">{aiSuggestion.reason}</p>

            <div className="p-3 bg-purple-50 rounded-xl text-xs space-y-1 font-semibold text-purple-900">
              <div>Recommended Type: <span className="capitalize font-bold">{aiSuggestion.recommendedBudgetType}</span></div>
              <div>Budget Min: ₹{aiSuggestion.budgetMin} | Max: ₹{aiSuggestion.budgetMax}</div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAiModal(false)}
                className="btn-saas-secondary text-xs py-1.5 px-3"
              >
                Dismiss
              </button>
              <button
                onClick={applyAISuggestion}
                className="btn-saas-primary text-xs py-1.5 px-3"
              >
                Apply Parameters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateProjectPage;
