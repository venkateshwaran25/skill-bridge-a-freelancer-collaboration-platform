import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderGit2,
  Briefcase,
  Layers,
  Clock,
  CheckCircle2,
  DollarSign,
  User,
  ExternalLink,
  Search,
  Filter,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  FileText,
  Building,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";

const MyProjectsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [workplaces, setWorkplaces] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch user workplaces
      const workplaceRes = await API.get("/api/workplaces");
      if (workplaceRes.data?.success) {
        setWorkplaces(workplaceRes.data.workplaces || []);
      }

      // 2. Role-specific data fetching
      if (user?.role === "client") {
        const { data } = await API.get("/api/projects");
        if (data.success && data.projects) {
          // Filter projects posted by this client
          const clientProjects = data.projects.filter(
            (p) => (p.postedBy?._id || p.postedBy) === user._id
          );
          setProjects(clientProjects);
        }
      } else {
        // Freelancer role
        const { data } = await API.get("/api/proposals/my");
        if (data.success && data.proposals) {
          setProposals(data.proposals);
        }
      }
    } catch (err) {
      console.error("Error loading My Projects:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  // Map workspace ID for a given project ID
  const getWorkplaceForProject = (projectId) => {
    return workplaces.find(
      (w) => (w.project?._id || w.project) === projectId
    );
  };

  // Filter items based on client vs freelancer role
  const isClient = user?.role === "client";

  const getFilteredItems = () => {
    if (isClient) {
      return projects.filter((p) => {
        const matchesSearch =
          !searchQuery ||
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase());

        if (activeFilter === "in_progress") {
          return matchesSearch && (p.status === "in progress" || p.assignedFreelancer);
        }
        if (activeFilter === "open") {
          return matchesSearch && (p.status === "open" && !p.assignedFreelancer);
        }
        if (activeFilter === "completed") {
          return matchesSearch && p.status === "completed";
        }
        return matchesSearch;
      });
    } else {
      return proposals.filter((prop) => {
        const pTitle = prop.project?.title || "";
        const pDesc = prop.project?.description || "";
        const matchesSearch =
          !searchQuery ||
          pTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pDesc.toLowerCase().includes(searchQuery.toLowerCase());

        if (activeFilter === "in_progress") {
          return matchesSearch && (prop.status === "accepted" || prop.project?.status === "in progress");
        }
        if (activeFilter === "open") {
          return matchesSearch && prop.status === "pending";
        }
        if (activeFilter === "completed") {
          return matchesSearch && prop.project?.status === "completed";
        }
        return matchesSearch;
      });
    }
  };

  const filteredItems = getFilteredItems();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pt-24 pb-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-[#635BFF] text-xs font-bold uppercase tracking-wider mb-1">
              <FolderGit2 className="w-4 h-4" />
              <span>Project Management Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              My Projects & Workspaces
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              {isClient
                ? "Track posted projects, review freelancer proposals, and access active digital workspaces."
                : "Manage your active freelance contracts, proposals, and digital client workspaces."}
            </p>
          </div>

          {isClient && (
            <Link to="/projects/create" className="no-underline shrink-0">
              <button className="px-5 py-3 rounded-2xl bg-[#635BFF] hover:bg-[#5249ea] text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer border-none">
                <Briefcase className="w-4 h-4" />
                <span>Post New Project</span>
              </button>
            </Link>
          )}
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1">
            {[
              { id: "all", label: "All Projects" },
              { id: "in_progress", label: "🚀 Active / Hired" },
              { id: "open", label: "⏳ Open / Pending" },
              { id: "completed", label: "✓ Completed" },
            ].map((tab) => {
              const active = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    active
                      ? "bg-[#635BFF] text-white shadow-sm"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search my projects..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 text-xs outline-none focus:border-[#635BFF] transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Main Content List */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-500 font-medium">
            <div className="w-6 h-6 border-2 border-[#635BFF] border-t-transparent rounded-full animate-spin mr-3" />
            <span>Loading projects and workspaces...</span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center rounded-3xl saas-card bg-white border border-slate-200/80 shadow-sm">
            <Briefcase className="w-12 h-12 text-slate-400 mx-auto mb-4 opacity-50" />
            <h3 className="text-slate-900 font-bold text-lg mb-1">No Projects Found</h3>
            <p className="text-slate-500 text-xs max-w-md mx-auto mb-6">
              {isClient
                ? "You haven't posted any projects matching this filter yet."
                : "You haven't applied to or been hired for any projects matching this filter."}
            </p>
            {isClient ? (
              <Link to="/projects/create" className="no-underline">
                <button className="px-5 py-2.5 rounded-xl bg-[#635BFF] hover:bg-[#5249ea] text-white text-xs font-bold shadow-sm transition-all cursor-pointer border-none">
                  Post Your First Project
                </button>
              </Link>
            ) : (
              <Link to="/projects" className="no-underline">
                <button className="px-5 py-2.5 rounded-xl bg-[#635BFF] hover:bg-[#5249ea] text-white text-xs font-bold shadow-sm transition-all cursor-pointer border-none">
                  Browse Marketplace Projects
                </button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredItems.map((item) => {
              // Extract target project object depending on role
              const project = isClient ? item : item.project;
              if (!project) return null;

              const isHired = project.status === "in progress" || project.assignedFreelancer || item.status === "accepted";
              const workplace = getWorkplaceForProject(project._id);

              return (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-3xl saas-card bg-white border border-slate-200/80 p-6 shadow-sm hover:border-indigo-200 transition-all duration-300"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    {/* Project Information */}
                    <div className="space-y-3 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                            isHired
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : project.status === "completed"
                              ? "bg-sky-50 text-sky-700 border border-sky-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {isHired ? "🚀 Hired / In Progress" : `Status: ${project.status || "Open"}`}
                        </span>

                        {!isClient && item.status && (
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 border border-slate-200 text-slate-700">
                            Proposal: {item.status.toUpperCase()}
                          </span>
                        )}

                        <span className="text-slate-500 text-xs font-semibold ml-auto sm:ml-0">
                          Budget: <strong className="text-emerald-600">${project.budget || item.bidAmount || 0}</strong>
                        </span>
                      </div>

                      <h3 className="text-slate-900 font-bold text-lg hover:text-[#635BFF] transition-colors">
                        <Link to={`/projects/${project._id}`} className="no-underline text-slate-900 hover:text-[#635BFF]">
                          {project.title}
                        </Link>
                      </h3>

                      <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed">
                        {project.description}
                      </p>

                      {/* Participant Meta */}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
                        {isClient ? (
                          project.assignedFreelancer ? (
                            <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                              <ShieldCheck className="w-4 h-4 text-emerald-600" />
                              <span>Hired Freelancer: {project.assignedFreelancer.name || "Assigned"}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <User className="w-4 h-4 text-[#635BFF]" />
                              <span>Proposals Received: {project.proposalsCount || 0}</span>
                            </div>
                          )
                        ) : (
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <Building className="w-4 h-4 text-[#635BFF]" />
                            <span>Client: {project.postedBy?.name || "Verified Client"}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Posted {new Date(project.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Area */}
                    <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end justify-center gap-3 shrink-0">
                      {isHired && (
                        <button
                          onClick={() => {
                            if (workplace) {
                              navigate(`/workspace/${workplace._id}`);
                            } else {
                              navigate(`/projects/${project._id}`);
                            }
                          }}
                          className="px-5 py-3 rounded-xl bg-[#635BFF] hover:bg-[#5249ea] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer border-none"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>Enter Workspace</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <Link to={`/projects/${project._id}`} className="no-underline w-full sm:w-auto">
                        <button className="w-full px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer">
                          <FileText className="w-3.5 h-3.5" />
                          <span>View Details</span>
                        </button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProjectsPage;
