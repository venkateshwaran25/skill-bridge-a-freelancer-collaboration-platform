import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Search, Sparkles, Check, X, UserCheck, Clock, UserPlus, MessageSquare, Star } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";

const NetworkPage = () => {
  const { user } = useAuth();
  const [freelancers, setFreelancers] = useState([]);
  const [myConnections, setMyConnections] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("suggestions"); // suggestions, my-connections, pending
  const [sentConnects, setSentConnects] = useState([]);

  const fetchSuggested = async () => {
    try {
      const { data } = await API.get("/api/connections/suggested");
      if (data.success && data.suggestions) {
        setFreelancers(data.suggestions);
      }
    } catch (err) {
      console.error("Error fetching network suggestions:", err);
    }
  };

  useEffect(() => {
    fetchSuggested();
  }, []);

  const handleConnect = (fId) => {
    if (!sentConnects.includes(fId)) {
      setSentConnects([...sentConnects, fId]);
    }
  };

  const filteredFreelancers = freelancers.filter((f) =>
    !searchQuery ||
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (f.skills && f.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  return (
    <div className="space-y-6 pb-16">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-[#635BFF]" />
            <span>Professional Network</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Connect with verified freelancers, top engineering talent, and clients.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("suggestions")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "suggestions"
                ? "bg-[#635BFF] text-[#FFFFFF] shadow-2xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            Suggested ({filteredFreelancers.length})
          </button>
          <button
            onClick={() => setActiveTab("my-connections")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "my-connections"
                ? "bg-[#635BFF] text-[#FFFFFF] shadow-2xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            My Connections ({myConnections.length})
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="saas-card p-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search freelancers by name, role, or skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-control-custom w-full pl-10 text-xs sm:text-sm"
          />
        </div>
      </div>

      {/* LinkedIn Style Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredFreelancers.map((person) => {
          const isSent = sentConnects.includes(person._id);
          return (
            <div key={person._id} className="saas-card-interactive p-5 text-center flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#635BFF] to-[#8B5CF6] text-white flex items-center justify-center font-extrabold text-lg mx-auto shadow-md">
                  {person.name.slice(0, 2).toUpperCase()}
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900">{person.name}</h3>
                  <p className="text-xs text-[#635BFF] font-semibold mt-0.5 line-clamp-1">{person.title}</p>
                  <span className="text-[11px] text-slate-400 block mt-1">{person.location}</span>
                </div>

                <div className="flex flex-wrap justify-center gap-1">
                  {person.skills?.map((s) => (
                    <span key={s} className="skill-tag text-[10px]">{s}</span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                <Link to={`/profile/${person._id}`} className="no-underline flex-1">
                  <button className="btn-saas-secondary text-xs py-1.5 px-2 w-full">
                    View
                  </button>
                </Link>

                <button
                  onClick={() => handleConnect(person._id)}
                  className={`text-xs py-1.5 px-3 rounded-lg font-semibold flex-1 transition-all border ${
                    isSent
                      ? "bg-slate-100 text-slate-500 border-slate-200"
                      : "btn-saas-primary"
                  }`}
                >
                  {isSent ? "Pending" : "Connect"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NetworkPage;
