import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Search, ArrowLeft, Trash2, Eye, Sliders, CheckCircle2, AlertCircle } from "lucide-react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

const AdminProjectsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState("");

  useEffect(() => {
    if (!user) return;
    if (user.role !== "admin") navigate("/dashboard");
  }, [user]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter !== "all") params.status = statusFilter;
      const { data } = await API.get("/api/admin/projects", { params });
      if (data.success) setProjects(data.projects);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [search, statusFilter]);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete project "${title}"?`)) return;
    try {
      const { data } = await API.delete(`/api/admin/projects/${id}`);
      if (data.success) {
        setActionMsg(`✅ Project "${title}" deleted.`);
        fetchProjects();
      }
    } catch (err) {
      setActionMsg(`❌ ${err.response?.data?.message || "Delete failed"}`);
    }
  };

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto text-slate-900">
      {/* Top Navigation & Header */}
      <div>
        <Link
          to="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#635BFF] mb-3 transition-colors no-underline"
        >
          <ArrowLeft className="w-4 h-4 text-[#635BFF]" />
          <span>Back to Admin Control Panel</span>
        </Link>

        <div className="saas-card p-6 border border-slate-200 shadow-md bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-[#635BFF] text-xs font-bold mb-2">
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Governance</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">Project Management</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">View, moderate, and enforce application limits on platform job listings.</p>
          </div>
          <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 w-fit">
            Total Projects: {projects.length}
          </span>
        </div>
      </div>

      {actionMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="saas-card p-3.5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 bg-white">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search projects by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-control-custom text-xs py-2 pl-9 pr-4"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto no-scrollbar">
          {["all", "open", "in progress", "completed"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === s
                  ? "bg-[#635BFF] text-white shadow-xs"
                  : "bg-white hover:bg-slate-100 text-slate-600 border border-slate-200"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table View */}
      {loading ? (
        <div className="text-center py-12 text-slate-500 font-semibold text-xs saas-card bg-white border border-slate-200">
          Loading projects data...
        </div>
      ) : (
        <div className="saas-card overflow-hidden border border-slate-200 shadow-md bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="p-4">Project Title</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Budget</th>
                  <th className="p-4">Proposals / Limit</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Posted By</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {projects.map((p) => {
                  const isLimitReached = (p.proposalsCount || 0) >= (p.maxProposals || 5);
                  return (
                    <tr key={p._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 font-bold text-slate-900 max-w-[200px] truncate">{p.title}</td>
                      <td className="p-4 text-slate-600 font-medium">{p.category || "—"}</td>
                      <td className="p-4 text-emerald-600 font-extrabold">${p.budget}</td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                            isLimitReached
                              ? "bg-rose-50 text-rose-600 border-rose-200"
                              : "bg-purple-50 text-[#635BFF] border-purple-200"
                          }`}
                        >
                          {p.proposalsCount || 0} / {p.maxProposals || 5} Max
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 capitalize">
                          {p.status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600 font-semibold">{p.postedBy?.name || "—"}</td>
                      <td className="p-4 text-slate-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center gap-1.5">
                          <Link to={`/projects/${p._id}`} className="no-underline">
                            <button className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 cursor-pointer">
                              View
                            </button>
                          </Link>
                          <button
                            onClick={async () => {
                              const val = prompt(`Set Max Application Limit for "${p.title}":`, p.maxProposals || 5);
                              if (val !== null && !isNaN(val) && Number(val) >= 1) {
                                try {
                                  const { data } = await API.put(`/api/admin/projects/${p._id}/limit`, { maxProposals: Number(val) });
                                  if (data.success) {
                                    setActionMsg(`✅ Max proposal limit updated to ${val}`);
                                    fetchProjects();
                                  }
                                } catch (err) {
                                  setActionMsg(`❌ ${err.response?.data?.message || "Limit update failed"}`);
                                }
                              }
                            }}
                            className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-semibold border border-amber-200 cursor-pointer"
                          >
                            Edit Limit
                          </button>
                          <button
                            onClick={() => handleDelete(p._id, p.title)}
                            className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold border border-rose-200 cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProjectsPage;
