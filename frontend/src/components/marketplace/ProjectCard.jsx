import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Bookmark,
  Share2,
  Clock,
  Briefcase,
  Sparkles,
  Users,
  ArrowRight,
  CheckCircle2,
  Shield,
  Eye,
  DollarSign,
  MessageSquare,
} from "lucide-react";
import StatusBadge from "./StatusBadge";
import SkillChip from "./SkillChip";
import ClientInfo from "./ClientInfo";
import Button from "./Button";
import { useAuth } from "../../context/AuthContext";

const ProjectCard = ({ project, onSkillClick }) => {
  const { user } = useAuth();
  const [bookmarked, setBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);

  const proposalsCount = project.proposalsCount ?? project.proposals?.length ?? 0;
  const duration = project.duration || "2-4 weeks";
  const experience = project.complexity || project.experienceLevel || "Intermediate";
  const aiMatchScore = project.aiMatch || Math.floor(88 + ((project.title.length * 3) % 11));

  // Flexible Budget Renderer
  const renderBudgetContent = () => {
    const type = project.budgetType || "fixed";

    if (type === "hourly") {
      const minRate = project.hourlyRateMin || 500;
      const maxRate = project.hourlyRateMax || 1000;
      const minHrs = project.estimatedHoursMin || 20;
      const maxHrs = project.estimatedHoursMax || 40;

      return (
        <div className="text-right shrink-0">
          <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block mb-0.5 flex items-center justify-end gap-1">
            <Clock className="w-3 h-3" />
            Hourly Rate
          </span>
          <span
            className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-400 bg-clip-text text-transparent block leading-none"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            ₹{minRate} – ₹{maxRate} / hr
          </span>
          <span className="text-[10px] font-medium text-slate-400 tracking-wide block mt-1">
            Est: {minHrs}–{maxHrs} hours
          </span>
        </div>
      );
    }

    if (type === "negotiable") {
      return (
        <div className="text-right shrink-0">
          <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider block mb-0.5 flex items-center justify-end gap-1">
            <MessageSquare className="w-3 h-3" />
            Pricing
          </span>
          <span
            className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-purple-400 via-indigo-300 to-violet-400 bg-clip-text text-transparent block leading-none"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Negotiable
          </span>
          <span className="text-[10px] font-medium text-slate-400 tracking-wide block mt-1">
            Open to Custom Bids
          </span>
        </div>
      );
    }

    // Default: Fixed Price
    const minB = project.budgetMin;
    const maxB = project.budgetMax;
    const displayBudget =
      minB && maxB
        ? `₹${minB.toLocaleString()} – ₹${maxB.toLocaleString()}`
        : typeof project.budget === "number" && project.budget > 0
        ? `₹${project.budget.toLocaleString()}`
        : "₹5,000 – ₹15,000";

    return (
      <div className="text-right shrink-0">
        <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block mb-0.5 flex items-center justify-end gap-1">
          <DollarSign className="w-3 h-3" />
          Fixed Price
        </span>
        <span
          className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300 bg-clip-text text-transparent block leading-none"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          {displayBudget}
        </span>
        <span className="text-[10px] font-medium text-slate-400 tracking-wide block mt-1">
          Fixed Budget
        </span>
      </div>
    );
  };

  const handleShare = (e) => {
    e.stopPropagation();
    e.preventDefault();
    navigator.clipboard?.writeText?.(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBookmark = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setBookmarked(!bookmarked);
  };

  const isFreelancer = user?.role === "freelancer" || !user;
  const isAdmin = user?.role === "admin";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="group relative rounded-[24px] bg-[#1E293B]/80 backdrop-blur-xl border border-white/[0.08] hover:border-violet-500/50 p-6 sm:p-7 shadow-[0_10px_30px_rgba(0,0,0,0.4)] hover:shadow-[0_20px_50px_rgba(124,58,237,0.25)] transition-all duration-300 flex flex-col justify-between overflow-hidden"
    >
      {/* Top Gradient Highlight */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-violet-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div>
        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={project.status} />
            {/* AI Match Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-violet-500/20 border border-violet-500/40 text-violet-300 shadow-[0_0_12px_rgba(124,58,237,0.3)]">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              <span>{aiMatchScore}% AI Match</span>
            </div>
          </div>

          {/* Flexible Budget Renderer */}
          {renderBudgetContent()}
        </div>

        {/* Project Title */}
        <Link to={`/projects/${project._id}`} className="no-underline group-hover:text-violet-300 transition-colors duration-200">
          <h2
            className="text-white text-[20px] sm:text-[24px] font-extrabold leading-snug tracking-tight mb-3 line-clamp-2"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            {project.title}
          </h2>
        </Link>

        {/* Short Description */}
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-5 line-clamp-3">
          {project.description}
        </p>

        {/* Key Metadata Stats Bar */}
        <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-900/60 border border-white/5 mb-5 text-xs">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-violet-400 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px]">Duration</span>
              <span className="text-white font-semibold">{duration}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 border-x border-white/10 px-2">
            <Briefcase className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px]">Level</span>
              <span className="text-white font-semibold">{experience}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 pl-1">
            <Users className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px]">Proposals</span>
              <span className="text-white font-semibold">{proposalsCount}</span>
            </div>
          </div>
        </div>

        {/* Colorful Skill Chips */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {project.skills?.map((sk, idx) => (
            <SkillChip
              key={idx}
              name={sk}
              onClick={() => onSkillClick && onSkillClick(sk)}
            />
          ))}
        </div>
      </div>

      {/* Bottom Footer Section */}
      <div className="pt-4 border-t border-white/[0.08] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mt-auto">
        {/* Client Info */}
        <ClientInfo client={project.postedBy} />

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleBookmark}
            title={bookmarked ? "Bookmarked" : "Bookmark Project"}
            className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all duration-200 cursor-pointer ${
              bookmarked
                ? "bg-violet-500/20 border-violet-500 text-violet-400"
                : "bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10"
            }`}
          >
            <Bookmark className={`w-4 h-4 ${bookmarked ? "fill-violet-400" : ""}`} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleShare}
            title="Share Project"
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-all duration-200 cursor-pointer"
          >
            {copied ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <Share2 className="w-4 h-4" />
            )}
          </motion.button>

          {/* Role-Aware CTA Button */}
          <Link to={`/projects/${project._id}`} className="no-underline">
            {isFreelancer ? (
              <Button variant="primary" size="sm" icon={ArrowRight}>
                Apply Now
              </Button>
            ) : isAdmin ? (
              <Button variant="glass" size="sm" icon={Shield}>
                Admin Control
              </Button>
            ) : (
              <Button variant="glass" size="sm" icon={Eye}>
                View Details
              </Button>
            )}
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectCard;
