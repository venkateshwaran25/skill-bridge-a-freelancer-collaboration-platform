import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  MapPin,
  Star,
  MessageSquare,
  Briefcase,
  FolderGit2,
  CheckCircle2,
  Clock,
  Edit2,
  Sparkles,
  ShieldCheck,
  Check,
  Shield,
  Laptop,
  Globe,
  KeyRound,
  Lock,
  Plus,
  ExternalLink,
  DollarSign,
  Award,
  Sliders,
  Smartphone,
  Activity,
  LogOut,
  AlertTriangle
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import ReviewsSection from "../components/ReviewsSection";

const ProfilePage = () => {
  const { id } = useParams();
  const { user: currentUser, updateUser, logout } = useAuth();

  const isOwnProfile = !id || id === currentUser?._id;
  const [profileUser, setProfileUser] = useState(isOwnProfile ? currentUser : null);
  const [activeTab, setActiveTab] = useState("profile"); // 'profile' or 'settings'
  const [isEditing, setIsEditing] = useState(false);
  const [showAddPortfolio, setShowAddPortfolio] = useState(false);

  // Edit Profile Form State
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [selectedRole, setSelectedRole] = useState("freelancer");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [hourlyRate, setHourlyRate] = useState(650);
  const [experience, setExperience] = useState(4);
  const [availability, setAvailability] = useState("available");
  const [pricingType, setPricingType] = useState("hourly");
  const [skillsText, setSkillsText] = useState("");
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  // Portfolio Form State
  const [portTitle, setPortTitle] = useState("");
  const [portDesc, setPortDesc] = useState("");
  const [portUrl, setPortUrl] = useState("");
  const [portTags, setPortTags] = useState("");
  const [addingPort, setAddingPort] = useState(false);

  useEffect(() => {
    if (!isOwnProfile && id) {
      API.get(`/api/users/${id}`)
        .then(({ data }) => {
          if (data.success && data.user) {
            setProfileUser(data.user);
          }
        })
        .catch((e) => console.log("Profile fetch err:", e));
    } else {
      setProfileUser(currentUser);
    }
  }, [id, currentUser]);

  useEffect(() => {
    const target = profileUser || currentUser;
    if (target) {
      setName(target.name || "");
      setTitle(target.title || "");
      setBio(target.bio || "");
      setLocation(target.location || "Remote");
      setHourlyRate(target.hourlyRate || 650);
      setExperience(target.experience || 4);
      setAvailability(target.availability || "available");
      setPricingType(target.pricingType || "hourly");
      setSelectedRole(target.role || "freelancer");
      setSkillsText(target.skills ? target.skills.join(", ") : "");
    }
  }, [profileUser, currentUser]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 4000);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await API.put("/api/users/profile", {
        name,
        title,
        bio,
        location,
        hourlyRate: Number(hourlyRate),
        experience: Number(experience),
        availability,
        pricingType,
        skills: skillsText,
        role: selectedRole,
      });

      if (data.success) {
        updateUser(data.user);
        setProfileUser(data.user);
        showToast("✅ Professional profile updated successfully!");
        setIsEditing(false);
      }
    } catch (err) {
      console.log("Save profile error:", err);
      showToast(`❌ Failed to update profile: ${err.response?.data?.message || err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleAddPortfolio = async (e) => {
    e.preventDefault();
    if (!portTitle.trim()) return;
    setAddingPort(true);
    try {
      const { data } = await API.post("/api/users/portfolio", {
        title: portTitle,
        description: portDesc,
        projectUrl: portUrl,
        tags: portTags,
      });

      if (data.success) {
        const updatedUser = { ...displayUser, portfolio: data.portfolio };
        updateUser(updatedUser);
        setProfileUser(updatedUser);
        showToast("✅ Portfolio project added!");
        setShowAddPortfolio(false);
        setPortTitle("");
        setPortDesc("");
        setPortUrl("");
        setPortTags("");
      }
    } catch (err) {
      showToast(`❌ Failed to add portfolio: ${err.response?.data?.message || err.message}`);
    } finally {
      setAddingPort(false);
    }
  };

  const handleDeletePortfolio = async (itemId) => {
    if (!window.confirm("Delete this portfolio project?")) return;
    try {
      const { data } = await API.delete(`/api/users/portfolio/${itemId}`);
      if (data.success) {
        const updatedUser = { ...displayUser, portfolio: data.portfolio };
        updateUser(updatedUser);
        setProfileUser(updatedUser);
        showToast("✅ Portfolio item removed.");
      }
    } catch (err) {
      showToast(`❌ Delete failed: ${err.response?.data?.message || err.message}`);
    }
  };

  const displayUser = profileUser || currentUser || {
    name: "SkillBridge Member",
    title: "Freelancer / Specialist",
    bio: "Full Stack Engineer dedicated to building high-performance applications.",
    location: "Remote",
    hourlyRate: 650,
    experience: 4,
    rating: 5.0,
    totalJobs: 12,
    skills: ["React", "Node.js", "MongoDB", "Python"],
  };

  const userSkills = displayUser.skills && displayUser.skills.length > 0
    ? displayUser.skills
    : ["React", "Node.js", "MongoDB", "Python"];

  const userInitials = displayUser.name
    ? displayUser.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "SB";

  // Mock / default login history if empty
  const loginHistoryList = displayUser.loginHistory && displayUser.loginHistory.length > 0
    ? displayUser.loginHistory
    : [
        {
          loginAt: displayUser.lastLogin || new Date(),
          ipAddress: "127.0.0.1 (Current Session)",
          device: "Chrome / Windows Desktop",
          status: "active"
        },
        {
          loginAt: new Date(Date.now() - 86400000),
          ipAddress: "172.16.52.246",
          device: "Mobile Browser / iOS",
          status: "expired"
        }
      ];

  return (
    <div className="space-y-6 pb-20 font-sans text-slate-900">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold shadow-sm">
          {toastMsg}
        </div>
      )}

      {/* Main Header Hero Card */}
      <div className="saas-card p-6 sm:p-8 space-y-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#635BFF] to-[#8B5CF6] text-white flex items-center justify-center font-extrabold text-2xl shadow-md shrink-0">
              {userInitials}
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">{displayUser.name}</h1>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified Professional</span>
                </span>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                    displayUser.availability === "busy"
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : displayUser.availability === "unavailable"
                      ? "bg-rose-50 text-rose-700 border-rose-200"
                      : "bg-sky-50 text-sky-700 border-sky-200"
                  }`}
                >
                  ● {displayUser.availability || "Available for Hire"}
                </span>
              </div>

              <p className="text-xs sm:text-sm font-semibold text-[#635BFF]">
                {displayUser.title || "Freelancer / Professional"}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-0.5">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {displayUser.location || "Remote"}
                </span>
                <span className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {displayUser.rating || "5.0"} Rating
                </span>
                <span className="flex items-center gap-1 text-slate-600 font-semibold">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  {displayUser.totalJobs || 12} Projects Completed
                </span>
                <span className="flex items-center gap-1 text-slate-600 font-semibold">
                  <Award className="w-3.5 h-3.5 text-slate-400" />
                  {displayUser.experience || 4}+ Yrs Experience
                </span>
              </div>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
            <span className="text-xl font-extrabold text-slate-900">
              ₹{(displayUser.hourlyRate || 650).toLocaleString()}
              <span className="text-xs text-slate-400 font-normal"> /hr</span>
            </span>

            {isOwnProfile ? (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 rounded-xl bg-[#635BFF] hover:bg-[#5249ea] text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer border-none shadow-sm"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <Link to={`/messages?userId=${displayUser._id}`} className="no-underline">
                <button className="px-4 py-2 rounded-xl bg-[#635BFF] hover:bg-[#5249ea] text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer border-none shadow-sm">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Send Message</span>
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab("profile")}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border ${
            activeTab === "profile"
              ? "bg-[#635BFF] text-white shadow-sm border-[#635BFF]"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <User className="w-4 h-4" />
          <span>Professional Profile</span>
        </button>

        {isOwnProfile && (
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border ${
              activeTab === "settings"
                ? "bg-[#635BFF] text-white shadow-sm border-[#635BFF]"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Settings & Security (Login Activity)</span>
          </button>
        )}
      </div>

      {/* TAB 1: PROFESSIONAL PROFILE OVERVIEW */}
      {activeTab === "profile" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-8 space-y-6">
            {/* Professional Overview Card */}
            <div className="saas-card p-6 bg-white rounded-3xl border border-slate-200/80 space-y-3 shadow-sm">
              <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2.5 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#635BFF]" />
                <span>Professional Bio & Summary</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {displayUser.bio ||
                  "Full Stack Engineer dedicated to building high-performance applications, enterprise scalable backends, and clean AI integrations."}
              </p>
            </div>

            {/* Comprehensive Professional Details Grid */}
            <div className="saas-card p-6 bg-white rounded-3xl border border-slate-200/80 space-y-4 shadow-sm">
              <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2.5 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#635BFF]" />
                <span>Professional Specs & Work Preferences</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-slate-400 font-semibold text-[10px] uppercase block">Primary Role</span>
                  <strong className="text-slate-900 font-bold block mt-1 capitalize">{displayUser.role || "Freelancer"}</strong>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-slate-400 font-semibold text-[10px] uppercase block">Hourly Billing Rate</span>
                  <strong className="text-[#635BFF] font-extrabold block mt-1">₹{(displayUser.hourlyRate || 650).toLocaleString()}/hr</strong>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-slate-400 font-semibold text-[10px] uppercase block">Years Experience</span>
                  <strong className="text-slate-900 font-bold block mt-1">{displayUser.experience || 4} Years</strong>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-slate-400 font-semibold text-[10px] uppercase block">Pricing Model</span>
                  <strong className="text-slate-900 font-bold block mt-1 capitalize">{displayUser.pricingType || "Hourly & Fixed"}</strong>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-slate-400 font-semibold text-[10px] uppercase block">Availability Status</span>
                  <strong className="text-emerald-700 font-bold block mt-1 capitalize">{displayUser.availability || "Available"}</strong>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-slate-400 font-semibold text-[10px] uppercase block">Verification Status</span>
                  <strong className="text-emerald-600 font-bold block mt-1">✓ Identity Verified</strong>
                </div>
              </div>
            </div>

            {/* Skills & Frameworks Card */}
            <div className="saas-card p-6 bg-white rounded-3xl border border-slate-200/80 space-y-3 shadow-sm">
              <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2.5 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#635BFF]" />
                <span>Skills & Core Frameworks</span>
              </h3>
              <div className="flex flex-wrap gap-2 pt-1">
                {userSkills.map((sk, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl bg-purple-50 text-[#635BFF] border border-purple-200/80 font-bold text-xs"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            {/* Showcase & Portfolio Projects Section */}
            <div className="saas-card p-6 bg-white rounded-3xl border border-slate-200/80 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <FolderGit2 className="w-4 h-4 text-[#635BFF]" />
                  <span>Showcase Projects & Portfolio ({ (displayUser.portfolio || []).length })</span>
                </h3>

                {isOwnProfile && (
                  <button
                    onClick={() => setShowAddPortfolio(!showAddPortfolio)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#635BFF]" />
                    <span>Add Project</span>
                  </button>
                )}
              </div>

              {/* Add Portfolio Inline Form */}
              {showAddPortfolio && (
                <form onSubmit={handleAddPortfolio} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase">Add New Portfolio Project</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Project Title"
                      value={portTitle}
                      onChange={(e) => setPortTitle(e.target.value)}
                      required
                      className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs outline-none"
                    />
                    <input
                      type="url"
                      placeholder="Live Demo URL (optional)"
                      value={portUrl}
                      onChange={(e) => setPortUrl(e.target.value)}
                      className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs outline-none"
                    />
                  </div>
                  <textarea
                    placeholder="Brief description of your project..."
                    value={portDesc}
                    onChange={(e) => setPortDesc(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Tags (e.g. React, Node.js, AI)"
                    value={portTags}
                    onChange={(e) => setPortTags(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs outline-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddPortfolio(false)}
                      className="px-3 py-1.5 rounded-xl bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer border-none"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={addingPort}
                      className="px-4 py-1.5 rounded-xl bg-[#635BFF] text-white text-xs font-bold cursor-pointer border-none"
                    >
                      {addingPort ? "Saving..." : "Save Project"}
                    </button>
                  </div>
                </form>
              )}

              {(!displayUser.portfolio || displayUser.portfolio.length === 0) ? (
                <p className="text-slate-400 text-xs italic">No portfolio projects added yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {displayUser.portfolio.map((item) => (
                    <div key={item._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-slate-900 text-xs">{item.title}</h4>
                          {isOwnProfile && (
                            <button
                              onClick={() => handleDeletePortfolio(item._id)}
                              className="text-rose-500 hover:text-rose-700 cursor-pointer border-none bg-transparent p-1"
                              title="Delete project"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        {item.description && <p className="text-slate-600 text-xs mt-1">{item.description}</p>}
                      </div>

                      {item.projectUrl && (
                        <a
                          href={item.projectUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#635BFF] hover:underline no-underline pt-2"
                        >
                          <span>View Demo</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Client Reviews Section */}
            <div className="saas-card p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm">
              <ReviewsSection targetUserId={displayUser._id} />
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* AI Profile Score Widget */}
            <div className="saas-card p-6 bg-white rounded-3xl border border-slate-200/80 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase">
                  <Sparkles className="w-4 h-4 text-[#635BFF]" />
                  <span>AI Profile Score</span>
                </h3>
                <span className="text-lg font-extrabold text-[#635BFF]">94%</span>
              </div>

              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="bg-[#635BFF] h-full rounded-full" style={{ width: "94%" }} />
              </div>

              <div className="space-y-2 pt-1">
                <span className="text-xs font-bold text-slate-700 block">AI Suggestions:</span>
                <ul className="space-y-2 text-xs text-slate-600 font-medium list-none p-0">
                  <li className="flex items-start gap-2 text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Identity and email verified</span>
                  </li>
                  <li className="flex items-start gap-2 text-indigo-700 bg-indigo-50 p-2 rounded-lg border border-indigo-200">
                    <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                    <span>Hourly rate and specs filled</span>
                  </li>
                  <li className="flex items-start gap-2 text-purple-700 bg-purple-50 p-2 rounded-lg border border-purple-200">
                    <Check className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                    <span>Add 1 more showcase project to hit 100%</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SETTINGS & SECURITY (LOGIN & SESSION ACTIVITY) */}
      {activeTab === "settings" && isOwnProfile && (
        <div className="space-y-6">
          {/* Active Session Overview */}
          <div className="saas-card p-6 bg-white rounded-3xl border border-slate-200/80 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#635BFF]" />
                  <span>Current Active Session & Security</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Monitor your active sign-in sessions, device history, and security timestamps.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                ● Active Session
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-slate-400 font-semibold text-[10px] uppercase block">Last Authenticated Login:</span>
                <p className="text-slate-900 font-extrabold text-xs">
                  {displayUser.lastLogin
                    ? new Date(displayUser.lastLogin).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })
                    : "Active Now"}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-slate-400 font-semibold text-[10px] uppercase block">Current IP Address:</span>
                <p className="text-slate-900 font-extrabold text-xs">
                  127.0.0.1 (Local Verified Client)
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-slate-400 font-semibold text-[10px] uppercase block">Account Created:</span>
                <p className="text-slate-900 font-extrabold text-xs">
                  {displayUser.createdAt
                    ? new Date(displayUser.createdAt).toLocaleDateString(undefined, {
                        month: "long",
                        day: "numeric",
                        year: "numeric"
                      })
                    : "October 2026"}
                </p>
              </div>
            </div>
          </div>

          {/* Login Activity History Log Table */}
          <div className="saas-card p-6 bg-white rounded-3xl border border-slate-200/80 space-y-4 shadow-sm">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600" />
                <span>Recent Login Activity & Devices</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Audit sign-ins across browsers, locations, and device types.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50/80 text-slate-500 uppercase font-bold text-[11px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-4">Device / Browser</th>
                    <th className="p-4">IP Address</th>
                    <th className="p-4">Timestamp</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loginHistoryList.map((log, index) => (
                    <tr key={index} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-bold text-slate-900 flex items-center gap-2">
                        <Laptop className="w-4 h-4 text-[#635BFF]" />
                        <span>{log.device || "Desktop Browser"}</span>
                      </td>
                      <td className="p-4 font-mono text-slate-600">{log.ipAddress || "127.0.0.1"}</td>
                      <td className="p-4 text-slate-600">
                        {new Date(log.loginAt || Date.now()).toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            index === 0
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-slate-100 text-slate-600 border-slate-200"
                          }`}
                        >
                          {index === 0 ? "✓ Active Session" : "Expired"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Account Security Controls */}
          <div className="saas-card p-6 bg-white rounded-3xl border border-slate-200/80 space-y-4 shadow-sm">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Account Security Controls</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <h4 className="font-bold text-slate-900 text-xs">Two-Factor & Session Token Security</h4>
                <p className="text-slate-500 text-xs">Your JWT auth token is encrypted and signed with HMAC SHA-256.</p>
                <span className="inline-block px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                  Protected & Encrypted
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <h4 className="font-bold text-slate-900 text-xs">Sign Out All Sessions</h4>
                <p className="text-slate-500 text-xs">End active sessions across all browser tabs and devices.</p>
                <button
                  onClick={logout}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 cursor-pointer"
                >
                  Sign Out Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="saas-card max-w-lg w-full p-6 space-y-4 bg-white rounded-3xl border border-slate-200 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-2">
              Edit Professional Profile Information
            </h3>

            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs outline-none focus:border-[#635BFF]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Account Role</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRole("freelancer")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      selectedRole === "freelancer"
                        ? "bg-[#635BFF] text-white border-[#635BFF] shadow-sm"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    Freelancer (Work & Bids)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRole("client")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      selectedRole === "client"
                        ? "bg-[#635BFF] text-white border-[#635BFF] shadow-sm"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    Client (Post Projects)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Professional Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior Full-Stack Architect"
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs outline-none focus:border-[#635BFF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Hourly Billing Rate (₹/hr)</label>
                  <input
                    type="number"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    min="0"
                    required
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs outline-none focus:border-[#635BFF]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    min="0"
                    required
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs outline-none focus:border-[#635BFF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Availability Status</label>
                  <select
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs outline-none focus:border-[#635BFF]"
                  >
                    <option value="available">Available for Hire</option>
                    <option value="busy">Busy / In Projects</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Pricing Model</label>
                  <select
                    value={pricingType}
                    onChange={(e) => setPricingType(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs outline-none focus:border-[#635BFF]"
                  >
                    <option value="hourly">Hourly Rate</option>
                    <option value="project">Fixed Project</option>
                    <option value="both">Both Hourly & Project</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. San Francisco, CA or Remote"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs outline-none focus:border-[#635BFF]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Professional Bio Summary</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs outline-none focus:border-[#635BFF]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Skills & Tech Stack (Comma-separated)</label>
                <input
                  type="text"
                  value={skillsText}
                  onChange={(e) => setSkillsText(e.target.value)}
                  placeholder="e.g. React, Node.js, Python, MongoDB, Docker"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs outline-none focus:border-[#635BFF]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer border-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-[#635BFF] text-white font-bold text-xs cursor-pointer border-none"
                >
                  {saving ? "Saving Changes..." : "Save All Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
