import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  UserPlus,
  UserCheck,
  MessageSquare,
  Star,
  MapPin,
  Briefcase,
  Users,
  Check,
} from "lucide-react";
import API from "../services/api";

const FreelancerCard = ({ freelancer, currentUser }) => {
  const [status, setStatus] = useState("idle"); // idle, pending, connected
  const [following, setFollowing] = useState(false);
  const navigate = useNavigate();

  const handleConnect = async () => {
    if (status === "idle") {
      setStatus("pending");
      try {
        if (freelancer?._id) {
          await API.post("/api/connections/request", { recipientId: freelancer._id });
        }
      } catch (err) {
        console.log("Connect error:", err);
      }
    }
  };

  const handleMessage = () => {
    navigate(`/messages?user=${freelancer?._id || ""}`);
  };

  const name = freelancer?.name || "Dev Professional";
  const title = freelancer?.title || "Senior Full Stack Engineer";
  const location = freelancer?.location || "Remote";
  const rating = freelancer?.rating || 5.0;
  const skills = freelancer?.skills || ["React", "Node.js", "AI"];
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      className="rounded-2xl bg-[#0F172A]/80 border border-white/10 p-5 shadow-lg backdrop-blur-xl flex flex-col justify-between hover:border-violet-500/30 transition-all duration-300"
    >
      <div>
        {/* Top Header Avatar & Status */}
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
              {initials}
            </div>
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-[#0F172A]" title="Available for hire" />
          </div>

          <button
            onClick={() => setFollowing(!following)}
            className={`px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all ${
              following
                ? "bg-violet-600/20 text-violet-300 border-violet-500/30"
                : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
            }`}
          >
            {following ? "Following" : "+ Follow"}
          </button>
        </div>

        {/* Name & Title */}
        <Link to={`/profile/${freelancer?._id || ""}`} className="no-underline group">
          <h3 className="text-white font-bold text-base group-hover:text-violet-300 transition-colors truncate">
            {name}
          </h3>
        </Link>
        <p className="text-slate-300 text-xs font-medium mt-0.5 line-clamp-1">{title}</p>

        {/* Location & Rating Bar */}
        <div className="flex items-center gap-3 text-slate-400 text-xs mt-2 mb-3.5">
          <span className="flex items-center gap-1 truncate">
            <MapPin className="w-3 h-3 text-violet-400 shrink-0" />
            {location}
          </span>
          <span className="flex items-center gap-1 font-medium text-amber-400">
            <Star className="w-3 h-3 fill-amber-400" />
            {rating.toFixed(1)}
          </span>
        </div>

        {/* Skills Pills */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {skills.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="px-2 py-0.5 text-[11px] font-semibold text-slate-300 bg-white/5 border border-white/10 rounded-md"
            >
              {skill}
            </span>
          ))}
          {skills.length > 3 && (
            <span className="px-1.5 py-0.5 text-[10px] text-slate-400 bg-white/5 rounded-md">
              +{skills.length - 3}
            </span>
          )}
        </div>

        {/* Mutual Connections indicator */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-4 bg-white/[0.02] p-2 rounded-xl border border-white/5">
          <Users className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span>3 mutual connections</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
        <button
          onClick={handleConnect}
          disabled={status === "pending" || status === "connected"}
          className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            status === "pending"
              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
              : status === "connected"
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 shadow-md"
          }`}
        >
          {status === "pending" ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Pending</span>
            </>
          ) : status === "connected" ? (
            <>
              <UserCheck className="w-3.5 h-3.5" />
              <span>Connected</span>
            </>
          ) : (
            <>
              <UserPlus className="w-3.5 h-3.5" />
              <span>Connect</span>
            </>
          )}
        </button>

        <button
          onClick={handleMessage}
          className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-xs border border-white/10 flex items-center justify-center gap-1.5 transition-all"
        >
          <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
          <span>Message</span>
        </button>
      </div>
    </motion.div>
  );
};

export default FreelancerCard;
