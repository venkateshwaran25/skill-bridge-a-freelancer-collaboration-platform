import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Bookmark, Star, Shield, Clock, ArrowRight, Zap } from "lucide-react";
import API from "../../services/api";

const mockProjects = [
  {
    _id: "m1",
    title: "Full-Stack E-Commerce Platform",
    budget: 4500,
    duration: "6 weeks",
    aiScore: 97,
    skills: ["React", "Node.js", "MongoDB", "Stripe"],
    clientRating: 4.9,
    clientName: "TechCorp Inc.",
    verified: true,
    category: "Web Dev",
    proposals: 12,
    gradient: "from-violet-600/20 to-blue-600/20",
    imageBg: "from-violet-900 to-blue-900",
  },
  {
    _id: "m2",
    title: "AI Chatbot for Customer Support",
    budget: 3200,
    duration: "4 weeks",
    aiScore: 94,
    skills: ["Python", "OpenAI", "FastAPI", "React"],
    clientRating: 5.0,
    clientName: "StartupAI",
    verified: true,
    category: "AI/ML",
    proposals: 8,
    gradient: "from-cyan-600/20 to-emerald-600/20",
    imageBg: "from-cyan-900 to-emerald-900",
  },
  {
    _id: "m3",
    title: "Mobile App for Health Tracking",
    budget: 6000,
    duration: "8 weeks",
    aiScore: 91,
    skills: ["React Native", "Firebase", "TypeScript"],
    clientRating: 4.7,
    clientName: "HealthPro",
    verified: true,
    category: "Mobile",
    proposals: 15,
    gradient: "from-pink-600/20 to-rose-600/20",
    imageBg: "from-pink-900 to-rose-900",
  },
];

const ProjectCard = ({ project, index }) => {
  const [bookmarked, setBookmarked] = useState(false);

  const scoreColor =
    project.aiScore >= 95
      ? "text-emerald-400"
      : project.aiScore >= 90
      ? "text-blue-400"
      : "text-violet-400";

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      whileHover={{ y: -8 }}
      className="group relative rounded-3xl bg-white/[0.05] backdrop-blur-sm border border-white/10 hover:border-violet-500/30 overflow-hidden transition-all duration-500 hover:shadow-[0_20px_60px_rgba(124,58,237,0.15)]"
    >
      {/* Card gradient overlay on hover */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${project.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
      />

      {/* Header Image Area */}
      <div
        className={`relative h-36 bg-gradient-to-br ${project.imageBg} flex items-center justify-center overflow-hidden`}
      >
        {/* Abstract background pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3) 0%, transparent 50%), 
                              radial-gradient(circle at 70% 70%, rgba(255,255,255,0.2) 0%, transparent 50%)`,
          }}
        />
        {/* Category badge */}
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-xl bg-black/30 backdrop-blur-sm border border-white/20 text-white text-xs font-semibold">
          {project.category}
        </div>
        {/* Bookmark */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setBookmarked(!bookmarked)}
          className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-black/30 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-black/50 transition-all"
        >
          <Bookmark
            className={`w-4 h-4 transition-colors ${bookmarked ? "text-violet-400 fill-current" : "text-white"}`}
          />
        </motion.button>
        {/* Center icon */}
        <div className="text-4xl font-black text-white/30 select-none">
          {project.title.split("")[0]}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-5">
        {/* Title row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3
            className="text-white font-bold text-base leading-snug line-clamp-2 group-hover:text-white"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            {project.title}
          </h3>
          <div className="flex items-center gap-1 shrink-0">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs text-emerald-400 font-semibold">Verified</span>
          </div>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1">
            <span className="text-slate-200 text-xs">by</span>
            <span className="text-white text-xs font-medium">{project.clientName}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
            <span className="text-white text-xs font-semibold">{project.clientRating}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-200" />
            <span className="text-slate-200 text-xs">{project.duration}</span>
          </div>
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.skills.slice(0, 4).map((skill) => (
            <span
              key={skill}
              className="px-2 py-0.5 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-medium"
            >
              {skill}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div>
            <p className="text-2xl font-black text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
              ${project.budget.toLocaleString()}
            </p>
            <p className="text-xs text-slate-200">{project.proposals} proposals</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {/* AI Score */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/5 border border-white/10">
              <Zap className="w-3 h-3 text-violet-400" />
              <span className={`text-xs font-bold ${scoreColor}`}>
                {project.aiScore}% AI Match
              </span>
            </div>
            <Link to={`/projects/${project._id}`}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white text-xs font-bold hover:from-violet-500 hover:to-blue-500 shadow-[0_4px_15px_rgba(124,58,237,0.3)] transition-all duration-300"
              >
                Apply Now
                <ArrowRight className="w-3.5 h-3.5" />
              </motion.button>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const MarketplaceSection = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data } = await API.get("/api/projects");
        if (data.success && data.projects.length > 0) {
          setProjects(data.projects.slice(0, 3));
        } else {
          setProjects(mockProjects);
        }
      } catch {
        setProjects(mockProjects);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // Merge real and mock data to ensure AI score fields
  const displayProjects = projects.map((p, i) => ({
    ...mockProjects[i % mockProjects.length],
    ...p,
    aiScore: p.aiScore ?? mockProjects[i % mockProjects.length].aiScore,
    duration: p.duration ?? mockProjects[i % mockProjects.length].duration,
    clientRating: p.clientRating ?? mockProjects[i % mockProjects.length].clientRating,
    clientName: p.postedBy?.name ?? mockProjects[i % mockProjects.length].clientName,
    verified: true,
    gradient: mockProjects[i % mockProjects.length].gradient,
    imageBg: mockProjects[i % mockProjects.length].imageBg,
    category: mockProjects[i % mockProjects.length].category,
    proposals: p.proposals ?? mockProjects[i % mockProjects.length].proposals,
  }));

  return (
    <section className="py-28 px-4 relative overflow-hidden" style={{ background: "#0B1020" }}>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-blue-900/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 mb-4">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm text-emerald-300 font-medium">Live Marketplace</span>
            </div>
            <h2
              className="font-extrabold text-white"
              style={{
                fontSize: "clamp(2rem, 4vw, 2.8rem)",
                fontFamily: "'Poppins', sans-serif",
                letterSpacing: "-0.02em",
              }}
            >
              Featured{" "}
              <span className="gradient-text-primary">Opportunities</span>
            </h2>
            <p className="text-slate-200 text-base mt-2">
              Hand-picked projects with AI-verified clients and top-rated talent
            </p>
          </div>
          <Link to="/projects">
            <motion.button
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl text-white font-semibold text-sm bg-white/10 border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300 shrink-0"
            >
              View All Projects
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </Link>
        </motion.div>

        {/* Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-3xl bg-white/[0.03] border border-white/5 h-96 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayProjects.map((project, i) => (
              <ProjectCard key={project._id} project={project} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default MarketplaceSection;
