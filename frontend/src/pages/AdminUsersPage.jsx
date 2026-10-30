import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Search, ArrowLeft, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import Button from "../components/marketplace/Button";

const AdminUsersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState("");

  useEffect(() => {
    if (!user) return;
    if (user.role !== "admin") {
      navigate("/dashboard");
    }
  }, [user]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (roleFilter !== "all") params.role = roleFilter;
      const { data } = await API.get("/api/admin/users", { params });
      if (data.success) setUsers(data.users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter]);

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      const { data } = await API.delete(`/api/admin/users/${id}`);
      if (data.success) {
        setActionMsg(`✅ User "${name}" deleted.`);
        fetchUsers();
      }
    } catch (err) {
      setActionMsg(`❌ ${err.response?.data?.message || "Delete failed"}`);
    }
  };

  const handleRoleChange = async (id, newRole) => {
    try {
      const { data } = await API.put(`/api/admin/users/${id}/role`, { role: newRole });
      if (data.success) {
        setActionMsg(`✅ Role updated to "${newRole}".`);
        fetchUsers();
      }
    } catch (err) {
      setActionMsg(`❌ ${err.response?.data?.message || "Role update failed"}`);
    }
  };

  const handleToggleSuspend = async (id, currentSuspended, name) => {
    const actionText = currentSuspended ? "Reactivate" : "Suspend";
    if (!window.confirm(`${actionText} account for "${name}"?`)) return;
    try {
      const { data } = await API.put(`/api/admin/users/${id}/suspend`);
      if (data.success) {
        setActionMsg(`✅ User "${name}" has been ${data.user.isSuspended ? "suspended" : "reactivated"}.`);
        fetchUsers();
      }
    } catch (err) {
      setActionMsg(`❌ ${err.response?.data?.message || "Suspension update failed"}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pt-24 pb-20 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-[#635BFF] text-sm font-semibold mb-6 transition-colors no-underline"
        >
          <ArrowLeft className="w-4 h-4 text-[#635BFF]" />
          <span>Back to Admin Dashboard</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="saas-card bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 mb-8 shadow-sm"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold mb-3">
            <Shield className="w-3.5 h-3.5" />
            <span>Admin Control</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">User & Account Governance</h1>
          <p className="text-slate-500 text-sm mt-1">Manage user roles, suspend or reactivate accounts, and inspect platform members.</p>
        </motion.div>

        {actionMsg && (
          <div className="p-4 mb-6 rounded-2xl bg-indigo-50 border border-indigo-100 text-sm font-semibold text-indigo-900 shadow-sm">
            {actionMsg}
          </div>
        )}

        {/* Filter Bar */}
        <div className="saas-card bg-white rounded-2xl border border-slate-200/80 p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs outline-none focus:border-[#635BFF] focus:bg-white transition-all placeholder-slate-400"
            />
          </div>

          <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
            {["all", "admin", "client", "freelancer"].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                  roleFilter === r
                    ? "bg-[#635BFF] text-white shadow-sm"
                    : "bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="text-center py-16 text-slate-500 font-medium">Loading registered users...</div>
        ) : (
          <div className="saas-card bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50/80 text-slate-500 uppercase font-bold text-[11px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-4">User</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Last Login</th>
                    <th className="p-4">Joined</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-bold text-slate-900">{u.name}</td>
                      <td className="p-4 text-slate-600">{u.email}</td>
                      <td className="p-4">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          disabled={u._id === user._id}
                          className="bg-slate-50 text-slate-900 border border-slate-200 rounded-lg px-2.5 py-1 text-xs outline-none focus:border-[#635BFF] font-medium"
                        >
                          <option value="freelancer">Freelancer</option>
                          <option value="client">Client</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            u.isSuspended
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}
                        >
                          {u.isSuspended ? "Suspended" : "Active"}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600">
                        {u.lastLogin ? (
                          <div className="flex flex-col">
                            <span className="text-slate-900 font-semibold">
                              {new Date(u.lastLogin).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {new Date(u.lastLogin).toLocaleTimeString(undefined, {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="p-4 text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleToggleSuspend(u._id, u.isSuspended, u.name)}
                            disabled={u._id === user._id}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer disabled:opacity-50 ${
                              u.isSuspended
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                            }`}
                          >
                            {u.isSuspended ? "Reactivate" : "Suspend"}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u._id, u.name)}
                            disabled={u._id === user._id}
                            className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold transition-all cursor-pointer disabled:opacity-50 border border-rose-200"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsersPage;
