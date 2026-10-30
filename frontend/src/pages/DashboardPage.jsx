import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sparkles,
  Users,
  Briefcase,
  FolderGit2,
  Eye,
  UserCheck,
  TrendingUp,
  ArrowRight,
  Plus,
  Zap,
  BookOpen,
  FileText,
  DollarSign,
  BarChart3,
  Bot,
  User,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";

const DashboardPage = () => {
  const { user } = useAuth();
  const [realStats, setRealStats] = useState({
    myProjectsCount: 0,
    proposalsCount: 0,
    connectionsCount: 0,
  });

  useEffect(() => {
    if (!user) return;
    const loadDashboardMetrics = async () => {
      try {
        if (user.role === "client") {
          const { data } = await API.get("/api/projects");
          if (data.success && data.projects) {
            const owned = data.projects.filter(p => (p.postedBy?._id || p.postedBy) === user._id);
            setRealStats(prev => ({ ...prev, myProjectsCount: owned.length }));
          }
        } else {
          const { data } = await API.get("/api/proposals/my-proposals");
          if (data.success && data.proposals) {
            setRealStats(prev => ({ ...prev, proposalsCount: data.proposals.length }));
          }
        }
      } catch (err) {
        console.error("Error loading dashboard metrics:", err);
      }
    };
    loadDashboardMetrics();
  }, [user]);

  const userName = user?.name || "User";
  const userTitle = user?.title || (user?.role === "client" ? "Client / Organization" : "Freelance Specialist");
  const userSkills = user?.skills?.length ? user.skills : [];
  const isClient = user?.role === "client";

  // Calculate profile completion percentage dynamically
  const profileCompletion = Math.min(
    100,
    (user?.name ? 20 : 0) +
    (user?.email ? 20 : 0) +
    (user?.title ? 20 : 0) +
    (user?.bio ? 20 : 0) +
    (user?.skills?.length ? 20 : 0)
  );

  const clientStats = [
    {
      label: "Active Postings",
      value: `${realStats.myProjectsCount} Projects`,
      sub: "Posted on platform",
      icon: Briefcase,
      iconBg: "bg-purple-100 text-[#635BFF]",
    },
    {
      label: "Profile Status",
      value: user?.isVerified ? "Verified" : "Active",
      sub: "Account state",
      icon: Users,
      iconBg: "bg-indigo-100 text-indigo-600",
    },
    {
      label: "Account Role",
      value: "Client / Sponsor",
      sub: "Hiring & management",
      icon: UserCheck,
      iconBg: "bg-emerald-100 text-emerald-600",
    },
    {
      label: "Profile Completion",
      value: `${profileCompletion}%`,
      sub: "Information rating",
      icon: FileText,
      iconBg: "bg-blue-100 text-blue-600",
    },
  ];

  const freelancerStats = [
    {
      label: "Profile Completion",
      value: `${profileCompletion}%`,
      sub: `${profileCompletion}% Complete`,
      icon: UserCheck,
      iconBg: "bg-purple-100 text-[#635BFF]",
    },
    {
      label: "Completed Jobs",
      value: user?.totalJobs || 0,
      sub: "Verified rating",
      icon: Briefcase,
      iconBg: "bg-emerald-100 text-emerald-600",
    },
    {
      label: "Submitted Proposals",
      value: realStats.proposalsCount,
      sub: "Active bids",
      icon: TrendingUp,
      iconBg: "bg-blue-100 text-blue-600",
    },
    {
      label: "Rating",
      value: user?.rating ? `${user.rating} / 5.0` : "New Freelancer",
      sub: "Client feedback",
      icon: ShieldCheck,
      iconBg: "bg-amber-100 text-amber-600",
    },
  ];

  const activeStats = isClient ? clientStats : freelancerStats;

  const aiTools = isClient
    ? [
        {
          icon: Sparkles,
          title: "AI Freelancer Match",
          description: "Find the best matched freelancers based on your project skills and requirements.",
          link: "/ai-match",
          color: "bg-purple-50 text-purple-600 border-purple-200",
        },
        {
          icon: Users,
          title: "AI Team Builder",
          description: "Build the ideal complementary project team automatically.",
          link: "/ai-match",
          color: "bg-blue-50 text-blue-600 border-blue-200",
        },
        {
          icon: DollarSign,
          title: "AI Budget Suggestion",
          description: "Get accurate, market-aligned project budget estimations for your postings.",
          link: "/projects/create",
          color: "bg-emerald-50 text-emerald-600 border-emerald-200",
        },
        {
          icon: BarChart3,
          title: "AI Project Reports",
          description: "Automatically summarize project progress, task completions, and milestones.",
          link: "/reports",
          color: "bg-amber-50 text-amber-600 border-amber-200",
        },
      ]
    : [
        {
          icon: Sparkles,
          title: "AI Project Match",
          description: "Discover open projects matching your skillset with neural scores.",
          link: "/ai-match",
          color: "bg-purple-50 text-purple-600 border-purple-200",
        },
        {
          icon: FileText,
          title: "AI Proposal Generator",
          description: "Generate personalized, winning project proposals instantly.",
          link: "/projects",
          color: "bg-indigo-50 text-indigo-600 border-indigo-200",
        },
        {
          icon: Bot,
          title: "Profile Improvement",
          description: "Get personalized AI recommendations to optimize your portfolio and skills.",
          link: "/profile",
          color: "bg-rose-50 text-rose-600 border-rose-200",
        },
        {
          icon: BarChart3,
          title: "AI Weekly Reports",
          description: "Automatically summarize weekly progress, logged hours, and earnings.",
          link: "/reports",
          color: "bg-amber-50 text-amber-600 border-amber-200",
        },
      ];

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Dashboard Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-50/90 via-purple-50/70 to-blue-50/80 border border-indigo-100 p-6 sm:p-8 shadow-xs">
        {/* Subtle right AI graphics decoration */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-15 pointer-events-none hidden md:flex items-center justify-end pr-8">
          <div className="w-64 h-64 rounded-full bg-gradient-to-br from-[#635BFF] to-[#8B5CF6] blur-3xl" />
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#635BFF]/10 text-[#635BFF] text-xs font-bold mb-3 border border-[#635BFF]/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isClient ? "AI-Powered Talent Finder" : "AI-Powered Freelance Hub"}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Good morning, <span className="text-[#635BFF]">{userName}</span> 👋
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-2 leading-relaxed">
            {isClient
              ? "Post your project requirements, get instantly matched with verified professionals, and use AI to manage milestones and deliverables."
              : "Discover projects, connect with talented professionals, and grow your freelance career with AI."}
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-5">
            {isClient ? (
              <>
                <Link to="/projects/create" className="no-underline">
                  <button className="btn-saas-primary">
                    <Briefcase className="w-4 h-4" />
                    <span>Post a Project</span>
                  </button>
                </Link>

                <Link to="/network" className="no-underline">
                  <button className="btn-saas-secondary">
                    <Users className="w-4 h-4 text-indigo-600" />
                    <span>Find Freelancers</span>
                  </button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/projects" className="no-underline">
                  <button className="btn-saas-primary">
                    <Briefcase className="w-4 h-4" />
                    <span>Browse Projects</span>
                  </button>
                </Link>

                <Link to="/showcase" className="no-underline">
                  <button className="btn-saas-secondary">
                    <Plus className="w-4 h-4 text-indigo-600" />
                    <span>Add Showcase</span>
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. Compact Profile Summary */}
      <div className="saas-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#635BFF] text-white font-extrabold text-base flex items-center justify-center shadow-md shrink-0">
            {userName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">{userName}</h2>
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-xs text-slate-500 font-medium">{userTitle}</p>
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              {userSkills.slice(0, 4).map((skill, i) => (
                <span key={i} className="skill-tag">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <span>Profile Completion</span>
              <span className="text-[#635BFF] font-bold">{user?.profileCompletion || 85}%</span>
            </div>
            <div className="w-36 h-2 bg-slate-100 rounded-full overflow-hidden mt-1.5 border border-slate-200/60">
              <div
                className="h-full bg-gradient-to-r from-[#635BFF] to-[#8B5CF6] rounded-full"
                style={{ width: `${user?.profileCompletion || 85}%` }}
              />
            </div>
          </div>

          <Link to="/profile" className="no-underline">
            <button className="btn-saas-outline text-xs py-1.5 px-3">
              <span>View Profile</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </Link>
        </div>
      </div>

      {/* 3. Statistics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {activeStats.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className="saas-card p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500">{item.label}</span>
                <div className={`p-1.5 rounded-lg ${item.iconBg}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <span className="text-xl font-extrabold text-slate-900 block tracking-tight">
                  {item.value}
                </span>
                <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
                  {item.sub}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Main 60% / 40% Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (60% - 7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {isClient ? (
            /* Client: Recent Proposals Received */
            <div className="saas-card p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-purple-50 text-[#635BFF] rounded-lg">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Recent Proposals Received</h3>
                </div>
                <Link to="/my-projects" className="text-xs font-semibold text-[#635BFF] hover:underline no-underline">
                  Manage Bids
                </Link>
              </div>

              <div className="space-y-3">
                {[
                  {
                    title: "Senior Full-Stack Architect",
                    bid: "₹45,000",
                    match: "98%",
                    skills: ["React", "Node.js", "MongoDB"],
                    experience: "7 years exp",
                    freelancer: "Sarah Jenkins",
                    projectTitle: "Full Stack E-Commerce Platform"
                  },
                  {
                    title: "AI & Data Scientist",
                    bid: "₹75,000",
                    match: "94%",
                    skills: ["Python", "FastAPI", "Pinecone"],
                    experience: "5 years exp",
                    freelancer: "Alex Chen",
                    projectTitle: "Python FastAPI RAG Search Engine"
                  },
                ].map((prop, idx) => (
                  <div key={idx} className="saas-card-interactive p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="badge-ai text-[10px]">
                          {prop.match} AI Match
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {prop.experience}
                        </span>
                        <span className="text-[11px] text-indigo-600 font-semibold">
                          For: {prop.projectTitle}
                        </span>
                      </div>
                      <h4 className="text-slate-900 font-bold text-xs sm:text-sm leading-snug">
                        {prop.freelancer} — <span className="text-slate-500 font-medium">{prop.title}</span>
                      </h4>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {prop.skills.map((s) => (
                          <span key={s} className="skill-tag">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="sm:text-right shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 flex sm:flex-col items-center sm:items-end justify-between">
                      <div>
                        <span className="text-xs font-extrabold text-emerald-600 block">
                          {prop.bid}
                        </span>
                      </div>
                      <Link to="/messages" className="no-underline mt-2">
                        <button className="btn-saas-primary py-1 px-3 text-xs">
                          Chat & Hire
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Freelancer: Recommended Projects */
            <div className="saas-card p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-purple-50 text-[#635BFF] rounded-lg">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Recommended Projects</h3>
                </div>
                <Link to="/projects" className="text-xs font-semibold text-[#635BFF] hover:underline no-underline">
                  View All
                </Link>
              </div>

              <div className="space-y-3">
                {[
                  {
                    title: "Full Stack E-Commerce Platform with AI Recommendations",
                    budget: "₹35,000 – ₹60,000",
                    match: "98%",
                    skills: ["React", "Node.js", "MongoDB"],
                    duration: "3–5 weeks",
                    client: "Acme Tech Solutions"
                  },
                  {
                    title: "Python FastAPI RAG Vector Search Engine",
                    budget: "₹50,000 – ₹85,000",
                    match: "94%",
                    skills: ["Python", "FastAPI", "Pinecone"],
                    duration: "2–4 weeks",
                    client: "AI Ventures Inc"
                  },
                ].map((proj, idx) => (
                  <div key={idx} className="saas-card-interactive p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="badge-ai text-[10px]">
                          {proj.match} AI Match
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {proj.duration}
                        </span>
                      </div>
                      <h4 className="text-slate-900 font-bold text-xs sm:text-sm leading-snug">
                        {proj.title}
                      </h4>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {proj.skills.map((s) => (
                          <span key={s} className="skill-tag">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="sm:text-right shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 flex sm:flex-col items-center sm:items-end justify-between">
                      <div>
                        <span className="text-xs font-extrabold text-emerald-600 block">
                          {proj.budget}
                        </span>
                        <span className="text-[10px] text-slate-400 block">{proj.client}</span>
                      </div>
                      <Link to="/projects" className="no-underline mt-2">
                        <button className="btn-saas-primary py-1 px-3 text-xs">
                          View Project
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Network / Workspace Activity */}
          <div className="saas-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  {isClient ? "Recent Workspace Activity" : "Recent Network Activity"}
                </h3>
              </div>
              <Link to={isClient ? "/my-projects" : "/feed"} className="text-xs font-semibold text-indigo-600 hover:underline no-underline">
                {isClient ? "View Workspace" : "Go to Feed"}
              </Link>
            </div>

            <div className="space-y-3">
              {isClient ? (
                <>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-start gap-3 text-xs">
                    <div className="w-8 h-8 rounded-full bg-purple-100 text-[#635BFF] flex items-center justify-center font-bold shrink-0">
                      SJ
                    </div>
                    <div>
                      <p className="text-slate-800 leading-snug">
                        <span className="font-bold text-slate-900">Sarah Jenkins</span> marked task <span className="font-semibold text-[#635BFF]">Integrate Stripe Checkout</span> as <span className="text-emerald-600 font-bold">Completed</span>.
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1 block">1 hour ago</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-start gap-3 text-xs">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                      AC
                    </div>
                    <div>
                      <p className="text-slate-800 leading-snug">
                        <span className="font-bold text-slate-900">Alex Chen</span> updated milestone <span className="font-semibold text-slate-900">Vector Embeddings Pipeline</span> to 80% complete.
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1 block">4 hours ago</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-start gap-3 text-xs">
                    <div className="w-8 h-8 rounded-full bg-purple-100 text-[#635BFF] flex items-center justify-center font-bold shrink-0">
                      ER
                    </div>
                    <div>
                      <p className="text-slate-800 leading-snug">
                        <span className="font-bold text-slate-900">Elena Rostova</span> published a new Showcase: <span className="font-semibold text-[#635BFF]">FinTech SaaS Glassmorphic Mobile App</span>.
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1 block">2 hours ago</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-start gap-3 text-xs">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                      MV
                    </div>
                    <div>
                      <p className="text-slate-800 leading-snug">
                        <span className="font-bold text-slate-900">Marcus Vance</span> accepted your connection request.
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1 block">5 hours ago</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (40% - 5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Suggested Connections vs Recommended Freelancers */}
          <div className="saas-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                  <Users className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  {isClient ? "Recommended Freelancers" : "Suggested Connections"}
                </h3>
              </div>
              <Link to="/network" className="text-xs font-semibold text-blue-600 hover:underline no-underline">
                Explore All
              </Link>
            </div>

            <div className="space-y-3">
              {isClient ? (
                /* Client: Recommended Freelancers */
                [
                  { name: "Marcus Vance", role: "Full Stack AI Architect", skills: "Node.js / Python", match: "97%" },
                  { name: "Elena Rostova", role: "UI/UX & Frontend Specialist", skills: "React / Figma", match: "95%" },
                  { name: "Dr. Aris Thorne", role: "Lead ML & Python Architect", skills: "PyTorch / RAG", match: "92%" },
                ].map((person, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#635BFF] to-[#8B5CF6] text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                        {person.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-slate-900 font-bold text-xs">{person.name}</p>
                          <span className="badge-ai text-[9px]">{person.match} Match</span>
                        </div>
                        <p className="text-slate-500 text-[11px] font-medium">{person.role}</p>
                      </div>
                    </div>

                    <Link to="/network" className="no-underline">
                      <button className="btn-saas-outline py-1 px-3 text-xs">
                        View Profile
                      </button>
                    </Link>
                  </div>
                ))
              ) : (
                /* Freelancer: Suggested Connections */
                [
                  { name: "Sarah Chen", role: "React / Next.js Specialist", skills: "Frontend" },
                  { name: "Dr. Aris Thorne", role: "AI / Python Researcher", skills: "Machine Learning" },
                  { name: "Priya Sharma", role: "UI/UX Designer", skills: "Figma" },
                ].map((person, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#635BFF] to-[#8B5CF6] text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                        {person.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-slate-900 font-bold text-xs">{person.name}</p>
                        <p className="text-slate-500 text-[11px] font-medium">{person.role}</p>
                      </div>
                    </div>

                    <Link to="/network" className="no-underline">
                      <button className="btn-saas-outline py-1 px-3 text-xs">
                        Connect
                      </button>
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* AI Skill Recommendation vs Hiring Insight */}
          <div className="rounded-2xl bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 border border-indigo-100 p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#635BFF] uppercase tracking-wider">
              {isClient ? <Sparkles className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
              <span>{isClient ? "AI Hiring Insight" : "AI Skill Recommendation"}</span>
            </div>
            {isClient ? (
              <p className="text-slate-700 text-xs leading-relaxed">
                Hiring a specialized <strong className="text-slate-900">UI/UX Specialist</strong> for your <strong className="text-slate-900">E-Commerce Platform</strong> is estimated to reduce launch time by <strong className="text-[#635BFF]">12 business days</strong>.
              </p>
            ) : (
              <p className="text-slate-700 text-xs leading-relaxed">
                Adding <strong className="text-slate-900">Docker</strong> & <strong className="text-slate-900">Kubernetes</strong> to your profile will unlock <strong className="text-[#635BFF]">8 additional high-budget AI project matches</strong> this week.
              </p>
            )}
            <Link to="/ai-match" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#635BFF] hover:underline no-underline">
              <span>{isClient ? "Match Talents Now" : "View Recommendations"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 5. AI-Powered Tools Section */}
      <div className="space-y-4 pt-4 border-t border-slate-200/80">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-[#635BFF]/10 text-[#635BFF] rounded-xl">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">AI-Powered Tools</h2>
            <p className="text-xs text-slate-500">
              {isClient
                ? "Supercharge your hiring workflow with SkillBridge AI intelligence."
                : "Supercharge your freelance workflow with SkillBridge AI intelligence."}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {aiTools.map((tool, idx) => {
            const Icon = tool.icon;
            return (
              <div key={idx} className="saas-card-interactive p-5 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${tool.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{tool.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{tool.description}</p>
                </div>

                <Link to={tool.link} className="no-underline pt-2">
                  <button className="btn-saas-outline w-full py-1.5 text-xs flex items-center justify-center gap-1">
                    <span>Try Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
