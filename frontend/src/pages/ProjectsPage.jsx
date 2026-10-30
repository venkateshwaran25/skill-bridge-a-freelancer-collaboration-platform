import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Briefcase,
  Search,
  Filter,
  Sparkles,
  Plus,
  Clock,
  DollarSign,
  Bookmark,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  BookmarkCheck,
  UserCheck
} from "lucide-react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

const ProjectsPage = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("All");
  const [savedProjects, setSavedProjects] = useState([]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/api/projects");
      if (data.success && data.projects) {
        setProjects(data.projects);
      }
    } catch (err) {
      console.error("Error loading projects:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const toggleSave = (pId) => {
    if (savedProjects.includes(pId)) {
      setSavedProjects(savedProjects.filter((id) => id !== pId));
    } else {
      setSavedProjects([...savedProjects, pId]);
    }
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      !search ||
      project.title.toLowerCase().includes(search.toLowerCase()) ||
      project.description.toLowerCase().includes(search.toLowerCase()) ||
      (project.skills && project.skills.some((s) => s.toLowerCase().includes(search.toLowerCase())));

    const matchesSkill =
      selectedSkill === "All" ||
      (project.skills && project.skills.some((s) => s.toLowerCase() === selectedSkill.toLowerCase()));

    return matchesSearch && matchesSkill;
  });

  const skillsList = ["All", "React", "Node.js", "Python", "FastAPI", "MongoDB", "TypeScript", "AI"];

  return (
    <div className="space-y-6 pb-12">
      {/* Page Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2 tracking-tight">
            <Briefcase className="w-6 h-6 text-[#635BFF]" />
            <span>Marketplace Projects</span>
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Browse verified opportunities matched to your skill set with AI scoring.
          </p>
        </div>

        {user?.role === "client" || user?.role === "admin" ? (
          <Link to="/projects/create" className="no-underline">
            <button className="btn-saas-primary">
              <Plus className="w-4 h-4" />
              <span>Post New Project</span>
            </button>
          </Link>
        ) : null}
      </div>

      {/* Filter and Search Bar */}
      <div className="saas-card p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, description, or tech stack..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-control-custom w-full pl-10 text-xs sm:text-sm"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <span className="text-xs font-bold text-slate-400 uppercase shrink-0 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              Skills:
            </span>
            {skillsList.map((skill) => (
              <button
                key={skill}
                onClick={() => setSelectedSkill(skill)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all border ${
                  selectedSkill === skill
                    ? "bg-[#635BFF] text-white border-[#635BFF] shadow-xs"
                    : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200/70"
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {filteredProjects.length === 0 ? (
          <div className="saas-card p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No matching projects found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Try adjusting your search criteria or skill filter to view available opportunities.
            </p>
          </div>
        ) : (
          filteredProjects.map((project) => {
            const isSaved = savedProjects.includes(project._id);
            const aiScore = project.aiMatch || 90;

            let displayBudget = "Negotiable";
            if (project.budgetType === "fixed" || project.projectType === "Fixed-Price") {
              if (project.budgetMin && project.budgetMax) {
                displayBudget = `₹${project.budgetMin.toLocaleString()} – ₹${project.budgetMax.toLocaleString()}`;
              } else if (project.budget) {
                displayBudget = `₹${project.budget.toLocaleString()}`;
              }
            } else if (project.budgetType === "hourly" || project.projectType === "Hourly") {
              if (project.hourlyRateMin && project.hourlyRateMax) {
                displayBudget = `₹${project.hourlyRateMin}/hr – ₹${project.hourlyRateMax}/hr`;
              } else {
                displayBudget = "Hourly Rate";
              }
            }

            return (
              <motion.div
                key={project._id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="saas-card-interactive p-6 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="badge-ai text-xs">
                        <Sparkles className="w-3 h-3 inline mr-1" />
                        {aiScore}% AI Match
                      </span>
                      <span className="badge-open text-xs capitalize">
                        {project.budgetType || project.projectType || "Open"}
                      </span>
                      {project.client?.verified && (
                        <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <ShieldCheck className="w-3 h-3" />
                          Verified Client
                        </span>
                      )}
                    </div>

                    <Link to={`/projects/${project._id}`} className="no-underline group">
                      <h2 className="text-base sm:text-lg font-extrabold text-slate-900 group-hover:text-[#635BFF] transition-colors leading-tight">
                        {project.title}
                      </h2>
                    </Link>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-2">
                      {project.description}
                    </p>
                  </div>

                  <button
                    onClick={() => toggleSave(project._id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-[#635BFF] hover:bg-purple-50 transition-colors self-start shrink-0"
                    title={isSaved ? "Saved" : "Save project"}
                  >
                    {isSaved ? (
                      <BookmarkCheck className="w-5 h-5 text-[#635BFF]" />
                    ) : (
                      <Bookmark className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Tech Chips */}
                <div className="flex flex-wrap gap-1.5">
                  {project.skills?.map((skill) => (
                    <span key={skill} className="skill-tag">
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Footer Info & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-slate-100">
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1 text-slate-900 font-bold">
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                      {displayBudget}
                    </span>
                    {project.deadline && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {project.deadline}
                      </span>
                    )}
                    {project.client?.name && (
                      <span className="flex items-center gap-1 text-slate-600">
                        <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
                        {project.client.name}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Link to={`/projects/${project._id}`} className="no-underline w-full sm:w-auto">
                      <button className="btn-saas-primary text-xs py-2 px-4 w-full">
                        <span>View Details & Apply</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ProjectsPage;
