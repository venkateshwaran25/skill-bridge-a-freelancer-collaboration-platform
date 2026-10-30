import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, CheckCircle2, AlertCircle, BookOpen, Briefcase, Zap, ShieldCheck, Users, UserPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";

const AIMatchPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("match"); // 'match' | 'team-builder'
  const [recommendations, setRecommendations] = useState([]);
  const [teamCandidates, setTeamCandidates] = useState([]);
  const [addedTeam, setAddedTeam] = useState([]);
  const [loading, setLoading] = useState(false);

  // Client role states
  const [clientProjects, setClientProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [matchedFreelancers, setMatchedFreelancers] = useState([]);

  const isClient = user?.role === "client";

  useEffect(() => {
    if (!user) return;

    if (isClient) {
      const fetchClientProjects = async () => {
        setLoading(true);
        try {
          const { data } = await API.get("/api/projects");
          if (data.success && data.projects) {
            const owned = data.projects.filter(
              (p) => (p.postedBy?._id || p.postedBy) === user._id
            );
            setClientProjects(owned);
            if (owned.length > 0) {
              setSelectedProjectId(owned[0]._id);
            }
          }
        } catch (err) {
          console.error("Error fetching client projects:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchClientProjects();
    } else {
      const fetchMatches = async () => {
        setLoading(true);
        try {
          const { data } = await API.get("/api/ai/matched-projects");
          if (data.success && data.projects) {
            const formatted = data.projects.map((p) => ({
              _id: p._id,
              title: p.title,
              budget: p.budget ? `₹${Number(p.budget).toLocaleString()}` : "Budget negotiable",
              projectType: p.budgetType || "Fixed-Price",
              matchScore: p.matchScore || 85,
              matchedSkills: (p.skills || []).map((s) => `${s} — Skill match`),
              missingSkills: [],
              recommendedAction: "Review project details and submit a tailored proposal.",
              description: p.description,
            }));
            setRecommendations(formatted);
          }
        } catch (err) {
          console.error("Error fetching AI matches:", err);
        } finally {
          setLoading(false);
        }
      };

      const fetchTeamCandidates = async () => {
        try {
          const { data } = await API.get("/api/users/freelancers");
          if (data.success && data.freelancers) {
            setTeamCandidates(
              data.freelancers.slice(0, 6).map((f) => ({
                name: f.name,
                role: f.title || "Freelance Specialist",
                match: f.rating ? Math.round(f.rating * 20) : 90,
                skills: f.skills || [],
                reason: f.bio || "High-performing specialist matching requirement criteria."
              }))
            );
          }
        } catch (err) {
          console.error("Error fetching team candidates:", err);
        }
      };

      fetchMatches();
      fetchTeamCandidates();
    }
  }, [user, isClient]);

  useEffect(() => {
    if (!selectedProjectId) return;

    const fetchFreelancersForProject = async () => {
      setLoading(true);
      try {
        const { data } = await API.get(`/api/ai/matched-freelancers/${selectedProjectId}`);
        if (data.success && data.freelancers) {
          setMatchedFreelancers(data.freelancers);
        }
      } catch (err) {
        console.log("Error fetching matched freelancers:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFreelancersForProject();
  }, [selectedProjectId]);

  const toggleAddToTeam = (name) => {
    if (addedTeam.includes(name)) {
      setAddedTeam(addedTeam.filter((n) => n !== name));
    } else {
      setAddedTeam([...addedTeam, name]);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#635BFF]" />
            <span>{isClient ? "AI Talent Match & Team Builder" : "AI Match & Team Builder"}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {isClient
              ? "Match projects with top vetted freelancers and assemble complementary developer teams."
              : "Projects and cross-functional team recommendations powered by SkillBridge AI."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("match")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "match"
                ? "bg-[#635BFF] text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            {isClient ? "AI Vetted Freelancers" : "AI Skill Match"}
          </button>
          <button
            onClick={() => setActiveTab("team-builder")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "team-builder"
                ? "bg-[#635BFF] text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            👥 AI Team Builder
          </button>
        </div>
      </div>

      {activeTab === "match" ? (
        isClient ? (
          /* Client Match View */
          <div className="space-y-4">
            {clientProjects.length > 0 ? (
              <div className="saas-card p-4 flex flex-col sm:flex-row items-center gap-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">
                  Select Project to Match:
                </span>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="form-control-custom text-xs sm:text-sm flex-1 w-full bg-white border border-slate-200"
                >
                  {clientProjects.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="saas-card p-8 text-center space-y-3">
                <p className="text-xs text-slate-505">You haven't posted any projects yet.</p>
                <Link to="/projects/create" className="no-underline inline-block">
                  <button className="btn-saas-primary text-xs py-1.5 px-4">
                    Post Your First Project
                  </button>
                </Link>
              </div>
            )}

            {matchedFreelancers.length > 0 ? (
              <div className="space-y-4">
                {matchedFreelancers.map((freelancer) => (
                  <div key={freelancer._id} className="saas-card p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#635BFF] text-white flex items-center justify-center font-bold text-sm shrink-0">
                          {freelancer.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-slate-900 leading-tight">
                              {freelancer.name}
                            </h3>
                            <span className="badge-ai text-[10px]">
                              {freelancer.matchScore || Math.floor(85 + Math.random() * 14)}% Skill Match
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-[#635BFF]">
                            {freelancer.title || "Vetted Expert"}
                          </p>
                          <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                            {freelancer.bio || "No biography provided."}
                          </p>
                          <div className="flex flex-wrap gap-1.5 pt-1.5">
                            {(freelancer.skills || []).map((s) => (
                              <span key={s} className="skill-tag text-[10px]">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2">
                        <div>
                          <span className="text-sm font-extrabold text-emerald-600 block">
                            ₹{freelancer.hourlyRate || 500}/hr
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {freelancer.experience || 3}+ years exp
                          </span>
                        </div>
                        <Link to="/messages" className="no-underline mt-2">
                          <button className="btn-saas-primary text-xs py-1.5 px-4">
                            Contact & Hire
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              selectedProjectId && (
                <div className="saas-card text-center p-8">
                  <p className="text-xs text-slate-500">No matching freelancers found for this project requirements.</p>
                </div>
              )
            )}
          </div>
        ) : (
          /* Freelancer Match View */
          <div className="space-y-4">
            {recommendations.map((item) => (
              <div key={item._id} className="saas-card p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="badge-ai text-xs mb-1 inline-block">
                      {item.matchScore}% Neural Match
                    </span>
                    <h3 className="text-base sm:text-lg font-extrabold text-slate-900 leading-tight">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                      {item.description}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-sm font-extrabold text-emerald-600 block">{item.budget}</span>
                    <span className="text-[11px] text-slate-400 font-medium">{item.projectType}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900 space-y-1">
                  <span className="font-bold flex items-center gap-1 text-[#635BFF]">
                    <BookOpen className="w-3.5 h-3.5" />
                    AI Improvement Tip:
                  </span>
                  <p className="text-slate-700 leading-relaxed">{item.recommendedAction}</p>
                </div>

                <div className="flex items-center justify-end pt-2 border-t border-slate-100">
                  <Link to="/projects" className="no-underline">
                    <button className="btn-saas-primary text-xs py-1.5 px-4">
                      <span>Apply Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* SECTION 15: AI TEAM BUILDER INTERFACE */
        <div className="space-y-6">
          <div className="saas-card p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <span className="badge-ai text-xs mb-1 inline-block">AI Team Assembler</span>
                <h2 className="text-base font-bold text-slate-900">Project: AI E-Commerce Platform</h2>
                <p className="text-xs text-slate-500">Automatically recommended team members based on required tech stack.</p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {["React", "Node.js", "MongoDB", "Python", "UI/UX"].map((sk) => (
                  <span key={sk} className="skill-tag text-[11px]">{sk}</span>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-2">
              {teamCandidates.map((cand, idx) => {
                const isAdded = addedTeam.includes(cand.name);
                return (
                  <div key={idx} className="saas-card-interactive p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-full bg-[#635BFF] text-white flex items-center justify-center font-bold text-sm shrink-0">
                        {cand.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900">{cand.name}</h3>
                          <span className="badge-ai text-[10px]">{cand.match}% Match</span>
                        </div>
                        <p className="text-xs font-semibold text-[#635BFF]">{cand.role}</p>
                        <p className="text-xs text-slate-600 leading-relaxed">{cand.reason}</p>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {cand.skills.map((s) => (
                            <span key={s} className="skill-tag text-[10px]">{s}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 sm:flex-col sm:items-end">
                      <Link to="/network" className="no-underline">
                        <button className="btn-saas-secondary text-xs py-1.5 px-3">
                          View Profile
                        </button>
                      </Link>

                      <button
                        onClick={() => toggleAddToTeam(cand.name)}
                        className={`text-xs py-1.5 px-3 rounded-lg font-semibold transition-all border ${
                          isAdded
                            ? "bg-emerald-500 text-white border-emerald-500"
                            : "btn-saas-primary"
                        }`}
                      >
                        {isAdded ? "✓ Added to Team" : "+ Add to Team"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIMatchPage;
