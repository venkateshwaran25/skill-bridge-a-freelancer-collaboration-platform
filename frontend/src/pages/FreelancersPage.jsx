import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, Star, ShieldCheck, MapPin, MessageSquare, Briefcase, ExternalLink, X } from "lucide-react";
import API from "../services/api";
import SkillChip from "../components/marketplace/SkillChip";
import Button from "../components/marketplace/Button";
import ReviewsSection from "../components/ReviewsSection";

const FreelancersPage = () => {
  const [freelancers, setFreelancers] = useState([]);
  const [search, setSearch] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedFreelancer, setSelectedFreelancer] = useState(null);

  const popularSkills = [
    "React",
    "Node.js",
    "Python",
    "MongoDB",
    "TypeScript",
    "Express",
    "UI/UX",
  ];

  const fetchFreelancers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (skillFilter) params.skill = skillFilter;

      const { data } = await API.get("/api/users/freelancers", { params });
      if (data.success) {
        setFreelancers(data.freelancers);
      }
    } catch (err) {
      console.error("Error loading freelancers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFreelancers();
  }, [search, skillFilter]);

  return (
    <div className="min-h-screen bg-[#0B1120] text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-semibold mb-3 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>AI Vetted & Ranked Specialists</span>
          </div>
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Top Freelance <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">Talent</span>
          </h1>
          <p className="text-slate-300 text-base sm:text-lg mt-2 max-w-2xl">
            Hire world-class engineers, designers, and AI architects verified by SkillBridge neural metrics.
          </p>
        </motion.div>

        {/* Search Panel */}
        <div className="rounded-[24px] bg-[#1E293B]/70 backdrop-blur-xl border border-white/[0.08] p-5 sm:p-7 shadow-[0_15px_40px_rgba(0,0,0,0.5)] mb-8">
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Search className="w-5 h-5 text-violet-400" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search talent by name, technical title, or specialized skills..."
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-400 text-sm focus:border-violet-500 outline-none transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap pt-2">
            <span className="text-xs font-semibold text-slate-400 mr-2">Filter by Skill:</span>
            <SkillChip
              name="All Skills"
              active={skillFilter === ""}
              onClick={() => setSkillFilter("")}
            />
            {popularSkills.map((sk) => (
              <SkillChip
                key={sk}
                name={sk}
                active={skillFilter === sk}
                onClick={() => setSkillFilter(sk === skillFilter ? "" : sk)}
              />
            ))}
          </div>
        </div>

        {/* Talent Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-80 rounded-[24px] bg-[#1E293B]/50 border border-white/5 animate-pulse p-6" />
            ))}
          </div>
        ) : freelancers.length === 0 ? (
          <div className="rounded-[24px] bg-[#1E293B]/60 border border-white/[0.08] p-12 text-center max-w-md mx-auto">
            <h3 className="text-white text-lg font-bold mb-2">No freelancers found</h3>
            <p className="text-slate-300 text-sm mb-4">Try broadening your search query or skill tags.</p>
            <Button variant="primary" onClick={() => { setSearch(""); setSkillFilter(""); }}>
              Reset Search
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {freelancers.map((f) => {
              const initials = f.name
                ? f.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
                : "FL";

              const portfolioCount = f.portfolio ? f.portfolio.length : 0;

              return (
                <motion.div
                  key={f._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-[24px] bg-[#1E293B]/80 backdrop-blur-xl border border-white/[0.08] hover:border-violet-500/50 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.4)] hover:shadow-[0_20px_50px_rgba(124,58,237,0.2)] transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Header Row */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-white font-extrabold text-lg shadow-md shrink-0 border border-white/10">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-white font-bold text-lg truncate">{f.name}</h3>
                          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                        </div>
                        <p className="text-violet-400 text-xs font-semibold truncate">
                          {f.title || "Senior Software Engineer"}
                        </p>
                      </div>
                    </div>

                    {/* Stats Pill */}
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 border border-white/5 mb-4 text-xs">
                      <div className="flex items-center gap-1 text-amber-400 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{f.rating || 5.0}</span>
                      </div>
                      <div className="text-violet-300 font-semibold">
                        💼 {portfolioCount} Projects
                      </div>
                      <div className="text-slate-200 font-bold">
                        ${f.hourlyRate || 50}/hr
                      </div>
                    </div>

                    {/* Bio */}
                    <p className="text-slate-300 text-sm leading-relaxed mb-4 line-clamp-3">
                      {f.bio || "Experienced engineer specializing in full-stack cloud applications, scalable AI APIs, and modern user interfaces."}
                    </p>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {(f.skills && f.skills.length > 0 ? f.skills : ["React", "Node.js", "Python"]).map((sk, idx) => (
                        <SkillChip key={idx} name={sk} />
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedFreelancer(f)}
                      className="px-3.5 py-2 rounded-xl bg-violet-600/20 hover:bg-violet-600/40 text-violet-300 hover:text-white border border-violet-500/30 text-xs font-bold transition-all"
                    >
                      View Portfolio & Reviews
                    </button>

                    <Link to="/projects" className="no-underline">
                      <Button variant="glass" size="sm" icon={Briefcase}>
                        Hire
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Freelancer Portfolio & Reviews Modal */}
        <AnimatePresence>
          {selectedFreelancer && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-[#1E293B] border border-white/10 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative"
              >
                <button
                  onClick={() => setSelectedFreelancer(null)}
                  className="absolute top-6 right-6 text-slate-400 hover:text-white p-2 rounded-xl bg-slate-900/80 border border-white/10"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-white font-extrabold text-xl shadow-lg border border-white/10">
                    {selectedFreelancer.name ? selectedFreelancer.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "FL"}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      {selectedFreelancer.name}
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    </h2>
                    <p className="text-violet-400 text-sm font-semibold">{selectedFreelancer.title || "Specialist Freelancer"}</p>
                    <p className="text-slate-400 text-xs mt-1">{selectedFreelancer.location || "Remote"} • ${selectedFreelancer.hourlyRate}/hr</p>
                  </div>
                </div>

                {/* Bio */}
                <div className="mb-6 p-4 rounded-2xl bg-slate-900/60 border border-white/5">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">About Freelancer</h4>
                  <p className="text-slate-200 text-sm">{selectedFreelancer.bio || "No detailed bio provided."}</p>
                </div>

                {/* Portfolio Showcase */}
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-violet-400" />
                    Portfolio Showcase ({selectedFreelancer.portfolio ? selectedFreelancer.portfolio.length : 0})
                  </h3>

                  {!selectedFreelancer.portfolio || selectedFreelancer.portfolio.length === 0 ? (
                    <p className="text-slate-400 text-xs italic">No portfolio projects uploaded by freelancer yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedFreelancer.portfolio.map((p) => (
                        <div key={p._id} className="bg-slate-900/80 p-4 rounded-2xl border border-white/10">
                          {p.image && <img src={p.image} alt={p.title} className="w-full h-32 object-cover rounded-xl mb-3" />}
                          <div className="flex items-start justify-between">
                            <h4 className="font-bold text-white text-sm">{p.title}</h4>
                            {p.projectUrl && (
                              <a href={p.projectUrl} target="_blank" rel="noreferrer" className="text-violet-400">
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                          <p className="text-slate-300 text-xs mt-2 line-clamp-3">{p.description}</p>
                          {p.tags && p.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-3">
                              {p.tags.map((tag, i) => (
                                <span key={i} className="px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-[10px]">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Ratings & Reviews */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-400" />
                    Client Reviews
                  </h3>
                  <ReviewsSection userId={selectedFreelancer._id} isOwnProfile={false} />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FreelancersPage;
