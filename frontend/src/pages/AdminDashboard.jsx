import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, Users, Folder, CheckCircle2, Clock, MessageSquare, Briefcase, UserCheck, ArrowRight } from "lucide-react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    if (user.role !== "admin") {
      navigate("/dashboard");
      return;
    }

    const fetchStats = async () => {
      try {
        const { data } = await API.get("/api/admin/dashboard");
        if (data.success) {
          setStats(data.stats);
          setRecentUsers(data.recentUsers || []);
          setRecentProjects(data.recentProjects || []);
        }
      } catch (err) {
        console.error("Error fetching admin stats:", err);
        setError("Failed to fetch admin dashboard statistics.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user, navigate]);

  if (!user || user.role !== "admin") return null;

  const statCards = stats
    ? [
        { label: "Total Users", value: stats.totalUsers },
        { label: "Total Projects", value: stats.totalProjects },
        { label: "Open Projects", value: stats.openProjects },
        { label: "In Progress", value: stats.inProgressProjects },
        { label: "Total Proposals", value: stats.totalProposals },
        { label: "Total Messages", value: stats.totalMessages },
        { label: "Clients", value: stats.totalClients },
        { label: "Freelancers", value: stats.totalFreelancers },
      ]
    : [];

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-amber-500" />
            <span>Admin Control Panel</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Platform governance, user management, and system metrics.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link to="/admin/moderation" className="no-underline">
            <button className="px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer border-none">
              <Shield className="w-4 h-4" />
              <span>Moderation & Limits Hub</span>
            </button>
          </Link>
          <Link to="/admin/users" className="no-underline">
            <button className="btn-saas-secondary text-xs py-1.5 px-3">
              <Users className="w-4 h-4" />
              <span>Manage Users</span>
            </button>
          </Link>
          <Link to="/admin/projects" className="no-underline">
            <button className="btn-saas-primary text-xs py-1.5 px-3">
              <Folder className="w-4 h-4" />
              <span>Manage Projects</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statCards.map((st, idx) => (
          <div key={idx} className="saas-card p-4">
            <span className="text-xs text-slate-500 font-semibold block">{st.label}</span>
            <span className="text-xl font-extrabold text-slate-900 block mt-1">{st.value}</span>
          </div>
        ))}
      </div>

      {/* Admin Power Action Hub Card */}
      <div className="saas-card p-6 rounded-3xl bg-white text-slate-900 border border-slate-200/80 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#635BFF] uppercase tracking-wider">Superpower Controls</span>
            <h2 className="text-lg font-extrabold text-slate-900 mt-0.5">Admin Governance & Application Limits</h2>
            <p className="text-xs text-slate-500 mt-1">
              Control max freelancer applications per project, delete inappropriate comments, and moderate user reviews.
            </p>
          </div>
          <Link to="/admin/moderation" className="no-underline">
            <button className="px-4 py-2 rounded-xl bg-[#635BFF] hover:bg-[#5249ea] text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer border-none shadow-sm">
              <span>Open Moderation Hub</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
