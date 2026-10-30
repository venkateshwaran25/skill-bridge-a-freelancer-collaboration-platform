import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Briefcase, Users, FolderGit2, Rss, Sparkles } from "lucide-react";

const SearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/projects?search=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-xs flex items-start justify-center pt-20 sm:pt-28 px-4"
      >
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.96 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl saas-card overflow-hidden shadow-xl"
        >
          {/* Header Input */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-3 p-4 border-b border-slate-100 bg-white">
            <Search className="w-5 h-5 text-[#635BFF] shrink-0" />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search freelancers, projects, showcase, posts, skills..."
              className="flex-1 bg-transparent text-slate-900 placeholder-slate-400 outline-none text-sm font-medium border-none"
            />
            {query && (
              <button type="button" onClick={() => setQuery("")} className="text-slate-400 hover:text-slate-600 p-1 border-none bg-transparent">
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg bg-slate-50"
            >
              ESC
            </button>
          </form>

          {/* Body Content */}
          <div className="p-5 max-h-[70vh] overflow-y-auto space-y-4">
            <p className="text-xs uppercase tracking-wider font-bold text-slate-400">
              Quick Navigation
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => {
                  navigate("/projects");
                  onClose();
                }}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-[#635BFF] text-left transition-all"
              >
                <Briefcase className="w-4 h-4 text-[#635BFF]" />
                <span className="text-xs font-bold text-slate-800">Projects</span>
              </button>

              <button
                onClick={() => {
                  navigate("/network");
                  onClose();
                }}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-[#635BFF] text-left transition-all"
              >
                <Users className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-slate-800">Network</span>
              </button>

              <button
                onClick={() => {
                  navigate("/showcase");
                  onClose();
                }}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-[#635BFF] text-left transition-all"
              >
                <FolderGit2 className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-bold text-slate-800">Showcase</span>
              </button>

              <button
                onClick={() => {
                  navigate("/ai-assistant");
                  onClose();
                }}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-[#635BFF] text-left transition-all"
              >
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-800">Ask AI</span>
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SearchModal;
