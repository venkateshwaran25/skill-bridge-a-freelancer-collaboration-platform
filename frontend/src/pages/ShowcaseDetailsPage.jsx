import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ExternalLink,
  Heart,
  Eye,
  Bookmark,
  Sparkles,
  Calendar,
  User,
  CheckCircle,
  Layers,
  Code2,
} from "lucide-react";

const GithubIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const ShowcaseDetailsPage = ({ item, onClose, currentUser }) => {
  if (!item) return null;

  const authorName = item?.author?.name || "Dev Specialist";
  const authorTitle = item?.author?.title || "Senior Full Stack Engineer";
  const coverImg = item?.coverImage || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-3xl rounded-3xl bg-[#0D1322] border border-white/10 shadow-[0_30px_90px_rgba(0,0,0,0.9)] overflow-hidden my-6 max-h-[90vh] flex flex-col"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 text-[11px] font-bold text-violet-300 bg-violet-500/10 border border-violet-500/20 rounded-full">
                {item?.category || "Web Development"}
              </span>
              <span className="text-slate-400 text-xs">• Showcase Case Study</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content Body */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            {/* Banner Image */}
            <div className="h-64 sm:h-72 w-full rounded-2xl overflow-hidden relative bg-slate-900 border border-white/10">
              <img src={coverImg} alt={item?.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D1322] via-transparent to-transparent" />
            </div>

            {/* Title & Author Info */}
            <div className="space-y-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {item?.title}
              </h1>

              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                    {authorName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-sm">{authorName}</h4>
                    <p className="text-slate-400 text-xs">{authorTitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                    <User className="w-3.5 h-3.5 text-violet-400" />
                    Role: {item?.role || "Developer"}
                  </span>
                  {item?.duration && (
                    <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                      {item.duration}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Description / Overview */}
            <div className="space-y-2">
              <h3 className="text-xs uppercase font-bold tracking-wider text-slate-400">
                Project Overview
              </h3>
              <p className="text-slate-200 text-sm leading-relaxed">{item?.description}</p>
            </div>

            {/* Problem & Solution Breakdown */}
            {(item?.problemStatement || item?.solution) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {item?.problemStatement && (
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                    <h4 className="text-xs font-bold uppercase text-amber-400 tracking-wider">
                      The Challenge / Problem
                    </h4>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      {item.problemStatement}
                    </p>
                  </div>
                )}

                {item?.solution && (
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                    <h4 className="text-xs font-bold uppercase text-emerald-400 tracking-wider">
                      Technical Solution
                    </h4>
                    <p className="text-slate-300 text-xs leading-relaxed">{item.solution}</p>
                  </div>
                )}
              </div>
            )}

            {/* Technologies Used Badges */}
            {item?.techStack && item.techStack.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs uppercase font-bold tracking-wider text-slate-400">
                  Technologies & Architecture
                </h3>
                <div className="flex flex-wrap gap-2">
                  {item.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1.5 text-xs font-semibold text-violet-300 bg-violet-500/10 border border-violet-500/20 rounded-xl"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Impact & Measured Results */}
            {item?.impactResults && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-600/10 to-indigo-600/10 border border-violet-500/20 space-y-1">
                <h4 className="text-xs font-bold uppercase text-violet-300 tracking-wider flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-violet-400" />
                  Impact & Results
                </h4>
                <p className="text-white text-xs leading-relaxed">{item.impactResults}</p>
              </div>
            )}
          </div>

          {/* Modal Footer Actions */}
          <div className="p-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1 text-rose-400 font-medium">
                <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                {item?.likes?.length || 24} Likes
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <Eye className="w-4 h-4" />
                {item?.views || 640} Views
              </span>
            </div>

            <div className="flex items-center gap-3">
              {item?.githubUrl && (
                <a
                  href={item.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs flex items-center gap-2 transition-all no-underline"
                >
                  <GithubIcon className="w-4 h-4" />
                  <span>GitHub</span>
                </a>
              )}

              {item?.demoUrl && (
                <a
                  href={item.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg transition-all no-underline"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Live Demo</span>
                </a>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ShowcaseDetailsPage;
