import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderGit2,
  Plus,
  Search,
  Filter,
  Sparkles,
  ExternalLink,
  Eye,
  ThumbsUp,
  Award,
  Layers,
  Code2,
  X
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import ShowcaseCard from "../components/ShowcaseCard";
import CreateShowcaseModal from "../components/CreateShowcaseModal";
import API from "../services/api";

const GithubIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const categoryFilters = [
  "All",
  "Web Development",
  "Mobile Development",
  "AI/ML",
  "UI/UX",
  "Data Science",
  "Cloud",
];

const ShowcasePage = () => {
  const { user } = useAuth();
  const [showcases, setShowcases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedShowcase, setSelectedShowcase] = useState(null);

  const fetchShowcases = async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/api/showcase");
      if (data.success && data.showcases) {
        setShowcases(data.showcases);
      }
    } catch (err) {
      console.error("Error loading showcases:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShowcases();
  }, []);

  const featuredProject = showcases[0] || null;

  const filtered = showcases.filter((item) => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pt-24 pb-20 px-2 sm:px-4 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Title & CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl saas-card bg-white border border-slate-200/80 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-[#635BFF] text-xs font-bold uppercase tracking-wider mb-2">
              <FolderGit2 className="w-3.5 h-3.5" />
              <span>Freelancer Verified Portfolio Gallery</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              Portfolio & Product Showcase
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Explore production-ready client applications, technical case studies, and live demo builds
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-3 rounded-2xl bg-[#635BFF] hover:bg-[#5249ea] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer border-none"
          >
            <Plus className="w-4 h-4" />
            <span>Publish Showcase Project</span>
          </button>
        </div>

        {/* FEATURED SPOTLIGHT PROJECT HERO */}
        {featuredProject && (
          <div className="relative rounded-3xl saas-card bg-white border border-slate-200/80 overflow-hidden p-6 sm:p-8 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Info Side */}
            <div className="lg:col-span-7 space-y-4 z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-extrabold uppercase tracking-wider">
                <Award className="w-4 h-4 text-amber-600" />
                <span>Project Spotlight of the Week</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {featuredProject.title}
              </h2>

              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                {featuredProject.description}
              </p>

              {/* Tech stack */}
              <div className="flex flex-wrap gap-2 pt-1">
                {featuredProject.techStack?.map((t) => (
                  <span
                    key={t}
                    className="px-3 py-1 rounded-xl bg-indigo-50 border border-indigo-100 text-[#635BFF] text-xs font-bold"
                  >
                    {t}
                  </span>
                ))}
              </div>

              {/* Author & CTA Action */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#635BFF] flex items-center justify-center font-bold text-white shadow-sm">
                    {featuredProject.author?.name?.[0]?.toUpperCase() || "A"}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{featuredProject.author?.name}</div>
                    <div className="text-xs text-slate-500">{featuredProject.author?.title || "Specialist"}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {featuredProject.demoUrl && (
                    <a
                      href={featuredProject.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 rounded-xl bg-[#635BFF] hover:bg-[#5249ea] text-white font-bold text-xs flex items-center gap-2 transition-all shadow-sm no-underline"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Live Demo
                    </a>
                  )}

                  <button
                    onClick={() => setSelectedShowcase(featuredProject)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all border border-slate-200 cursor-pointer"
                  >
                    View Full Case Study
                  </button>
                </div>
              </div>
            </div>

            {/* Image Side */}
            <div className="lg:col-span-5 relative h-64 sm:h-80 rounded-2xl overflow-hidden border border-slate-200 shadow-md">
              <img
                src={featuredProject.coverImage}
                alt={featuredProject.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        )}

        {/* FILTER & SEARCH TOOLBAR */}
        <div className="p-4 rounded-2xl saas-card bg-white border border-slate-200/80 space-y-4 shadow-sm">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search showcase projects by title, category, or technology..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs sm:text-sm outline-none focus:border-[#635BFF] focus:bg-white transition-all"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              {categoryFilters.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer border ${
                    selectedCategory === cat
                      ? "bg-[#635BFF] text-white border-[#635BFF] shadow-sm"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* SHOWCASE CARDS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <ShowcaseCard
              key={item._id}
              showcase={item}
              onClick={() => setSelectedShowcase(item)}
            />
          ))}
        </div>

        {/* CASE STUDY MODAL */}
        <AnimatePresence>
          {selectedShowcase && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedShowcase(null)}
              className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-3xl rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden my-8 text-slate-900"
              >
                {/* Cover Header */}
                <div className="relative h-64 sm:h-80 w-full overflow-hidden">
                  <img
                    src={selectedShowcase.coverImage}
                    alt={selectedShowcase.title}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => setSelectedShowcase(null)}
                    className="absolute top-4 right-4 p-2 rounded-xl bg-white/90 text-slate-700 hover:bg-white transition-colors cursor-pointer border border-slate-200 shadow-md"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md border border-slate-200 text-[#635BFF] text-xs font-bold px-3 py-1 rounded-full uppercase shadow-sm">
                    {selectedShowcase.category}
                  </div>
                </div>

                {/* Body Info */}
                <div className="p-6 sm:p-8 space-y-6">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
                      {selectedShowcase.title}
                    </h2>
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                      {selectedShowcase.description}
                    </p>
                  </div>

                  {/* Problem & Solution */}
                  {(selectedShowcase.problemStatement || selectedShowcase.solution) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                      {selectedShowcase.problemStatement && (
                        <div className="space-y-1">
                          <span className="font-bold text-rose-600 uppercase tracking-wider block text-[10px]">
                            Problem Challenge
                          </span>
                          <p className="text-slate-700">{selectedShowcase.problemStatement}</p>
                        </div>
                      )}
                      {selectedShowcase.solution && (
                        <div className="space-y-1">
                          <span className="font-bold text-emerald-600 uppercase tracking-wider block text-[10px]">
                            Technical Solution
                          </span>
                          <p className="text-slate-700">{selectedShowcase.solution}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tech Stack */}
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                      Technologies & Frameworks
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {selectedShowcase.techStack?.map((t) => (
                        <span
                          key={t}
                          className="px-3 py-1 rounded-xl bg-indigo-50 border border-indigo-100 text-[#635BFF] text-xs font-bold"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Links */}
                  <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#635BFF] flex items-center justify-center font-bold text-white shadow-sm">
                        {selectedShowcase.author?.name?.[0]?.toUpperCase() || "A"}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{selectedShowcase.author?.name}</div>
                        <div className="text-xs text-slate-500">{selectedShowcase.author?.title || "Specialist"}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {selectedShowcase.githubUrl && (
                        <a
                          href={selectedShowcase.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-2 border border-slate-200 no-underline"
                        >
                          <GithubIcon className="w-4 h-4" />
                          GitHub
                        </a>
                      )}
                      {selectedShowcase.demoUrl && (
                        <a
                          href={selectedShowcase.demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2.5 rounded-xl bg-[#635BFF] hover:bg-[#5249ea] text-white font-bold text-xs flex items-center gap-2 shadow-sm no-underline"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Live Demo
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <CreateShowcaseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </div>
    </div>
  );
};

export default ShowcasePage;
