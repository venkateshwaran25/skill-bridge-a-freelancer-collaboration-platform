import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Shield,
  MessageSquare,
  Star,
  FileText,
  Trash2,
  Sliders,
  Search,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Users
} from "lucide-react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

const AdminModerationPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("comments"); // 'comments', 'reviews', 'limits'
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState("");

  // Data states
  const [posts, setPosts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [projects, setProjects] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [showcases, setShowcases] = useState([]);
  const [payments, setPayments] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [reports, setReports] = useState([]);

  // Search states
  const [searchQuery, setSearchQuery] = useState("");

  // Inline editing limit state
  const [editingLimitId, setEditingLimitId] = useState(null);
  const [newLimitValue, setNewLimitValue] = useState(5);

  useEffect(() => {
    if (!user) return;
    if (user.role !== "admin") {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const loadData = async () => {
    setLoading(true);
    setActionMsg("");
    try {
      if (activeTab === "comments") {
        const { data } = await API.get("/api/admin/posts");
        if (data.success) setPosts(data.posts || []);
      } else if (activeTab === "reviews") {
        const { data } = await API.get("/api/admin/reviews");
        if (data.success) setReviews(data.reviews || []);
      } else if (activeTab === "showcases") {
        const { data } = await API.get("/api/admin/showcases");
        if (data.success) setShowcases(data.showcases || []);
      } else if (activeTab === "payments") {
        const { data } = await API.get("/api/admin/payments");
        if (data.success) setPayments(data.payments || []);
      } else if (activeTab === "workspaces") {
        const [wsRes, repRes] = await Promise.all([
          API.get("/api/admin/workspaces"),
          API.get("/api/admin/reports"),
        ]);
        if (wsRes.data.success) setWorkspaces(wsRes.data.workplaces || []);
        if (repRes.data.success) setReports(repRes.data.reports || []);
      } else if (activeTab === "limits") {
        const [projRes, propRes] = await Promise.all([
          API.get("/api/admin/projects"),
          API.get("/api/admin/proposals"),
        ]);
        if (projRes.data.success) setProjects(projRes.data.projects || []);
        if (propRes.data.success) setProposals(propRes.data.proposals || []);
      }
    } catch (err) {
      console.error("Moderation load error:", err);
      setActionMsg("⚠️ Encountered endpoint issue or loading fallback.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const showToast = (msg) => {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(""), 4000);
  };

  // Delete Post Comment (Admin)
  const handleDeleteComment = async (postId, commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    try {
      const { data } = await API.delete(`/api/admin/posts/${postId}/comments/${commentId}`);
      if (data.success) {
        showToast("✅ Inappropriate comment deleted successfully.");
        setPosts((prev) =>
          prev.map((p) => (p._id === postId ? data.post || p : p))
        );
      }
    } catch (err) {
      showToast(`❌ Delete comment failed: ${err.response?.data?.message || err.message}`);
    }
  };

  // Delete Full Post (Admin)
  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post completely?")) return;
    try {
      const { data } = await API.delete(`/api/admin/posts/${postId}`);
      if (data.success) {
        showToast("✅ Post deleted by admin.");
        setPosts((prev) => prev.filter((p) => p._id !== postId));
      }
    } catch (err) {
      showToast(`❌ Delete post failed: ${err.response?.data?.message || err.message}`);
    }
  };

  // Delete Review (Admin)
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Delete this review from the system?")) return;
    try {
      const { data } = await API.delete(`/api/admin/reviews/${reviewId}`);
      if (data.success) {
        showToast("✅ Inappropriate review removed.");
        setReviews((prev) => prev.filter((r) => r._id !== reviewId));
      }
    } catch (err) {
      showToast(`❌ Delete review failed: ${err.response?.data?.message || err.message}`);
    }
  };

  // Toggle Feature Showcase Project (Admin)
  const handleToggleFeatureShowcase = async (showcaseId) => {
    try {
      const { data } = await API.put(`/api/admin/showcases/${showcaseId}/feature`);
      if (data.success) {
        showToast(`✅ Showcase ${data.showcase.isFeatured ? "Featured" : "Unfeatured"}.`);
        setShowcases((prev) =>
          prev.map((s) => (s._id === showcaseId ? data.showcase : s))
        );
      }
    } catch (err) {
      showToast(`❌ Toggle feature failed: ${err.response?.data?.message || err.message}`);
    }
  };

  // Delete Showcase Project (Admin)
  const handleDeleteShowcase = async (showcaseId) => {
    if (!window.confirm("Delete this showcase project?")) return;
    try {
      const { data } = await API.delete(`/api/admin/showcases/${showcaseId}`);
      if (data.success) {
        showToast("✅ Showcase project deleted.");
        setShowcases((prev) => prev.filter((s) => s._id !== showcaseId));
      }
    } catch (err) {
      showToast(`❌ Delete showcase failed: ${err.response?.data?.message || err.message}`);
    }
  };

  // Release Escrow Payment (Admin)
  const handleReleasePayment = async (paymentId) => {
    if (!window.confirm("Force release this escrow payment to the freelancer?")) return;
    try {
      const { data } = await API.put(`/api/admin/payments/${paymentId}/release`);
      if (data.success) {
        showToast("✅ Escrow payment force-released by admin.");
        setPayments((prev) =>
          prev.map((pm) => (pm._id === paymentId ? data.payment : pm))
        );
      }
    } catch (err) {
      showToast(`❌ Release payment failed: ${err.response?.data?.message || err.message}`);
    }
  };

  // Update Project Max Proposal Limit (Admin)
  const handleSaveLimit = async (projectId) => {
    try {
      const { data } = await API.put(`/api/admin/projects/${projectId}/limit`, {
        maxProposals: Number(newLimitValue),
      });
      if (data.success) {
        showToast(`✅ Proposal limit updated to ${newLimitValue} applications.`);
        setProjects((prev) =>
          prev.map((p) => (p._id === projectId ? data.project || { ...p, maxProposals: newLimitValue } : p))
        );
        setEditingLimitId(null);
      }
    } catch (err) {
      showToast(`❌ Failed to update limit: ${err.response?.data?.message || err.message}`);
    }
  };

  // Delete Proposal (Admin)
  const handleDeleteProposal = async (proposalId) => {
    if (!window.confirm("Delete this proposal application?")) return;
    try {
      const { data } = await API.delete(`/api/admin/proposals/${proposalId}`);
      if (data.success) {
        showToast("✅ Proposal removed.");
        setProposals((prev) => prev.filter((pr) => pr._id !== proposalId));
      }
    } catch (err) {
      showToast(`❌ Delete proposal failed: ${err.response?.data?.message || err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pt-24 pb-20 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Back link */}
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-[#635BFF] text-sm font-semibold transition-colors no-underline"
        >
          <ArrowLeft className="w-4 h-4 text-[#635BFF]" />
          <span>Back to Admin Dashboard</span>
        </Link>

        {/* Page Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="saas-card bg-white rounded-3xl border border-slate-200/80 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wider mb-2">
              <Shield className="w-4 h-4" />
              <span>Full Admin Governance Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Platform Governance & Audit Center</h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Moderate posts, reviews, showcase projects, release escrow payments, audit workplaces, and manage project proposal limits.
            </p>
          </div>

          <button
            onClick={loadData}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold flex items-center gap-2 text-slate-700 transition-all cursor-pointer self-start md:self-auto"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#635BFF]" : ""}`} />
            <span>Refresh Data</span>
          </button>
        </motion.div>

        {/* Toast Alert */}
        {actionMsg && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-sm font-bold text-amber-900 shadow-sm">
            {actionMsg}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
          {[
            { id: "comments", label: "Posts & Comments", icon: MessageSquare },
            { id: "reviews", label: "Reviews", icon: Star },
            { id: "showcases", label: "Showcase & Portfolios", icon: CheckCircle2 },
            { id: "payments", label: "Payments & Escrow", icon: Shield },
            { id: "workspaces", label: "Workplace & AI Risk Audit", icon: AlertTriangle },
            { id: "limits", label: "Limits & Biddings", icon: Sliders },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap border ${
                  isActive
                    ? "bg-[#635BFF] text-white shadow-sm border-[#635BFF]"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search bar */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search content, users, or titles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 text-xs outline-none focus:border-[#635BFF] transition-all shadow-sm"
          />
        </div>

        {/* TAB 1: POSTS & COMMENTS MODERATION */}
        {activeTab === "comments" && (
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12 text-slate-500 font-medium">Loading community posts...</div>
            ) : posts.length === 0 ? (
              <div className="p-8 text-center saas-card bg-white rounded-3xl border border-slate-200/80 text-slate-500 text-sm">
                No community posts found.
              </div>
            ) : (
              posts
                .filter(
                  (p) =>
                    !searchQuery ||
                    p.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    p.author?.name?.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((post) => (
                  <div
                    key={post._id}
                    className="p-5 rounded-3xl saas-card bg-white border border-slate-200/80 space-y-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#635BFF] flex items-center justify-center font-bold text-xs text-white">
                          {post.author?.name ? post.author.name[0].toUpperCase() : "A"}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 text-sm">{post.author?.name || "Member"}</span>
                          <p className="text-[11px] text-slate-500">{post.author?.title || "Specialist"}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeletePost(post._id)}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1.5 transition-all border border-rose-200 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Post</span>
                      </button>
                    </div>

                    <p className="text-slate-700 text-xs sm:text-sm bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                      {post.content}
                    </p>

                    {/* Comments section */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <MessageSquare className="w-3.5 h-3.5 text-[#635BFF]" />
                        Comments ({(post.comments || []).length})
                      </h4>

                      {(!post.comments || post.comments.length === 0) ? (
                        <p className="text-slate-400 text-xs italic">No comments on this post yet.</p>
                      ) : (
                        post.comments.map((comm) => (
                          <div
                            key={comm._id}
                            className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-3 text-xs"
                          >
                            <div className="space-y-1">
                              <span className="font-bold text-[#635BFF]">
                                {comm.user?.name || "Anonymous Member"}:
                              </span>
                              <p className="text-slate-700">{comm.text}</p>
                            </div>

                            <button
                              onClick={() => handleDeleteComment(post._id, comm._id)}
                              className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold flex items-center gap-1 border border-rose-200 cursor-pointer shrink-0"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Remove</span>
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))
            )}
          </div>
        )}

        {/* TAB 2: REVIEWS MODERATION */}
        {activeTab === "reviews" && (
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12 text-slate-500 font-medium">Loading reviews...</div>
            ) : reviews.length === 0 ? (
              <div className="p-8 text-center saas-card bg-white rounded-3xl border border-slate-200/80 text-slate-500 text-sm">
                No reviews found.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reviews
                  .filter(
                    (r) =>
                      !searchQuery ||
                      r.comment?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      r.fromUser?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      r.toUser?.name?.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((rev) => (
                    <div
                      key={rev._id}
                      className="p-5 rounded-3xl saas-card bg-white border border-slate-200/80 space-y-3 shadow-sm flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-amber-600 font-bold text-xs">
                            <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                            <span>{rev.rating} / 5</span>
                          </div>
                          <span className="text-[10px] text-slate-500 uppercase font-bold px-2.5 py-0.5 rounded-md bg-slate-100 border border-slate-200">
                            {rev.reviewerType} review
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-slate-900 mt-2">{rev.title || "User Review"}</h4>
                        <p className="text-slate-600 text-xs mt-1 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                          "{rev.comment}"
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div className="text-[11px] text-slate-500">
                          From <strong className="text-slate-900">{rev.fromUser?.name || "User"}</strong> to{" "}
                          <strong className="text-slate-900">{rev.toUser?.name || "User"}</strong>
                        </div>

                        <button
                          onClick={() => handleDeleteReview(rev._id)}
                          className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1 border border-rose-200 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SHOWCASE & PORTFOLIO MODERATION */}
        {activeTab === "showcases" && (
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12 text-slate-500 font-medium">Loading showcase projects...</div>
            ) : showcases.length === 0 ? (
              <div className="p-8 text-center saas-card bg-white rounded-3xl border border-slate-200/80 text-slate-500 text-sm">
                No showcase projects posted yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {showcases
                  .filter(
                    (s) =>
                      !searchQuery ||
                      s.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      s.author?.name?.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((sh) => (
                    <div
                      key={sh._id}
                      className="p-5 rounded-3xl saas-card bg-white border border-slate-200/80 space-y-3 shadow-sm flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                            {sh.category || "Showcase Project"}
                          </span>

                          <button
                            onClick={() => handleToggleFeatureShowcase(sh._id)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                              sh.isFeatured
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                            }`}
                          >
                            {sh.isFeatured ? "⭐ Featured" : "Mark as Featured"}
                          </button>
                        </div>

                        <h4 className="text-sm font-bold text-slate-900 mt-2">{sh.title}</h4>
                        <p className="text-slate-600 text-xs mt-1 line-clamp-2">{sh.description}</p>
                        <p className="text-[11px] text-slate-500 mt-2">
                          By <strong className="text-slate-900">{sh.author?.name || "Freelancer"}</strong>
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <Link to={`/showcase/${sh._id}`} className="no-underline text-[#635BFF] font-bold hover:underline">
                          View Showcase Page →
                        </Link>

                        <button
                          onClick={() => handleDeleteShowcase(sh._id)}
                          className="px-3 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: PAYMENTS & ESCROW GOVERNANCE */}
        {activeTab === "payments" && (
          <div className="saas-card bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4 shadow-sm">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-600" />
                <span>Platform Payment & Escrow Governance</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Audit all milestone payment transactions across the platform and force-release pending escrow funds if a project is verified complete.
              </p>
            </div>

            {loading ? (
              <div className="text-center py-12 text-slate-500 font-medium">Loading payment records...</div>
            ) : payments.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl text-slate-500 text-sm">
                No payment transactions recorded yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50/80 text-slate-500 uppercase font-bold text-[11px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="p-4">Project</th>
                      <th className="p-4">Payer (Client)</th>
                      <th className="p-4">Recipient (Freelancer)</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-center">Admin Escrow Control</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {payments
                      .filter(
                        (pm) =>
                          !searchQuery ||
                          pm.projectId?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          pm.payerId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          pm.recipientId?.name?.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((pm) => (
                        <tr key={pm._id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-4 font-bold text-slate-900">{pm.projectId?.title || "Milestone Payment"}</td>
                          <td className="p-4 text-slate-600">{pm.payerId?.name || "Client"}</td>
                          <td className="p-4 text-slate-600">{pm.recipientId?.name || "Freelancer"}</td>
                          <td className="p-4 font-bold text-[#635BFF]">${pm.amount}</td>
                          <td className="p-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold border capitalize ${
                                pm.status === "completed"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : pm.status === "pending"
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : "bg-rose-50 text-rose-700 border-rose-200"
                              }`}
                            >
                              {pm.status}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            {pm.status === "completed" ? (
                              <span className="text-[11px] text-emerald-600 font-bold">✓ Released</span>
                            ) : (
                              <button
                                onClick={() => handleReleasePayment(pm._id)}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer border-none shadow-sm"
                              >
                                Force Release Escrow
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: WORKPLACE & AI RISK AUDIT */}
        {activeTab === "workspaces" && (
          <div className="space-y-6">
            {/* Workplace Audit Section */}
            <div className="saas-card bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4 shadow-sm">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-purple-600" />
                  <span>Digital Workplace Audit</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Inspect active collaboration spaces, client-freelancer teams, and jump directly into team workplaces.
                </p>
              </div>

              {loading ? (
                <div className="text-center py-12 text-slate-500 font-medium">Loading active workplaces...</div>
              ) : workspaces.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl text-slate-500 text-sm">
                  No active workspaces initialized yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {workspaces
                    .filter(
                      (w) =>
                        !searchQuery ||
                        (w.project?.title || w.projectId?.title || w.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (w.client?.name || w.clientId?.name || "").toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((ws) => (
                      <div key={ws._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-slate-900 text-sm">{ws.project?.title || ws.projectId?.title || ws.title || "Active Workspace"}</h4>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                            Status: {ws.status || "active"}
                          </span>
                        </div>
                        <div className="text-xs text-slate-600 space-y-1">
                          <p>Client: <strong className="text-slate-900">{ws.client?.name || ws.clientId?.name || "Client"}</strong></p>
                          <p>Freelancer: <strong className="text-slate-900">{ws.freelancer?.name || ws.freelancerId?.name || "Freelancer"}</strong></p>
                        </div>
                        <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
                          <Link to={`/workspace/${ws._id}`} className="no-underline">
                            <button className="px-3.5 py-1.5 rounded-xl bg-[#635BFF] hover:bg-[#5249ea] text-white font-bold text-xs cursor-pointer border-none shadow-sm">
                              Inspect Workspace →
                            </button>
                          </Link>
                          <Link to={`/dashboard/project/${ws._id}`} className="no-underline text-xs text-[#635BFF] font-bold hover:underline">
                            Analytics Dashboard →
                          </Link>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* AI Risk Reports Overview */}
            <div className="saas-card bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4 shadow-sm">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-rose-600" />
                <span>AI Project Risk Monitoring Reports</span>
              </h3>

              {reports.length === 0 ? (
                <p className="text-slate-400 text-xs italic">No AI risk reports generated yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50/80 text-slate-500 uppercase font-bold text-[11px] tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="p-4">Report Type</th>
                        <th className="p-4">Overall Risk Level</th>
                        <th className="p-4">Tasks Done</th>
                        <th className="p-4">Generated By</th>
                        <th className="p-4">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {reports.map((rep) => {
                        const risk = (rep.riskAssessment?.overallRisk || rep.metrics?.riskAssessment?.overallRisk || "low").toLowerCase();
                        return (
                          <tr key={rep._id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-4 font-bold text-slate-900 capitalize">{rep.type || rep.reportType || "Weekly"} Report</td>
                            <td className="p-4">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase ${
                                  risk === "high"
                                    ? "bg-rose-50 text-rose-700 border-rose-200"
                                    : risk === "medium"
                                    ? "bg-amber-50 text-amber-700 border-amber-200"
                                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                }`}
                              >
                                {risk} Risk
                              </span>
                            </td>
                            <td className="p-4 text-slate-600">
                              {rep.metrics?.completedTasks || 0} / {rep.metrics?.totalTasks || 0}
                            </td>
                            <td className="p-4 text-slate-600">{rep.generatedBy?.name || "System AI"}</td>
                            <td className="p-4 text-slate-500">{new Date(rep.createdAt).toLocaleDateString()}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 6: PROJECT APPLICATION LIMITS & GOVERNANCE */}
        {activeTab === "limits" && (
          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-12 text-slate-500 font-medium">Loading project limits & proposals...</div>
            ) : (
              <>
                {/* Section: Project Max Proposal Limits */}
                <div className="saas-card bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4 shadow-sm">
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                      <Sliders className="w-5 h-5 text-emerald-600" />
                      <span>Project Max Freelancer Application Limits</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Set maximum application/proposal thresholds for projects. When a project hits its limit, no additional freelancers can apply.
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600">
                      <thead className="bg-slate-50/80 text-slate-500 uppercase font-bold text-[11px] tracking-wider border-b border-slate-200">
                        <tr>
                          <th className="p-4">Project Title</th>
                          <th className="p-4">Client</th>
                          <th className="p-4">Applied / Max Limit</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-center">Admin Limit Control</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {projects
                          .filter(
                            (p) =>
                              !searchQuery ||
                              p.title?.toLowerCase().includes(searchQuery.toLowerCase())
                          )
                          .map((proj) => {
                            const isFull = (proj.proposalsCount || 0) >= (proj.maxProposals || 5);
                            const isEditing = editingLimitId === proj._id;

                            return (
                              <tr key={proj._id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="p-4 font-bold text-slate-900">{proj.title}</td>
                                <td className="p-4 text-slate-600">{proj.postedBy?.name || "Client"}</td>
                                <td className="p-4">
                                  <span
                                    className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                                      isFull
                                        ? "bg-rose-50 text-rose-700 border-rose-200"
                                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    }`}
                                  >
                                    {proj.proposalsCount || 0} / {proj.maxProposals || 5} Max
                                  </span>
                                </td>
                                <td className="p-4 uppercase font-bold text-[10px] text-slate-500">
                                  {proj.status}
                                </td>
                                <td className="p-4 text-center">
                                  {isEditing ? (
                                    <div className="flex items-center justify-center gap-2">
                                      <input
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={newLimitValue}
                                        onChange={(e) => setNewLimitValue(e.target.value)}
                                        className="w-16 px-2 py-1 rounded-lg bg-slate-50 border border-emerald-500 text-slate-900 text-xs text-center outline-none"
                                      />
                                      <button
                                        onClick={() => handleSaveLimit(proj._id)}
                                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer border-none"
                                      >
                                        Save
                                      </button>
                                      <button
                                        onClick={() => setEditingLimitId(null)}
                                        className="px-2 py-1 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 text-xs cursor-pointer border-none"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        setEditingLimitId(proj._id);
                                        setNewLimitValue(proj.maxProposals || 5);
                                      }}
                                      className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-[#635BFF] font-bold text-xs cursor-pointer"
                                    >
                                      Set Max Limit
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Section: Proposals Moderation */}
                <div className="saas-card bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4 shadow-sm">
                  <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-sky-600" />
                    <span>Submitted Proposals Governance</span>
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600">
                      <thead className="bg-slate-50/80 text-slate-500 uppercase font-bold text-[11px] tracking-wider border-b border-slate-200">
                        <tr>
                          <th className="p-4">Project</th>
                          <th className="p-4">Freelancer</th>
                          <th className="p-4">Bid Amount</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {proposals.map((prop) => (
                          <tr key={prop._id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-4 font-bold text-slate-900">{prop.project?.title || "—"}</td>
                            <td className="p-4 text-slate-600">{prop.freelancer?.name || "—"}</td>
                            <td className="p-4 font-bold text-[#635BFF]">${prop.bidAmount}</td>
                            <td className="p-4 capitalize font-bold text-slate-700">{prop.status}</td>
                            <td className="p-4 text-center">
                              <button
                                onClick={() => handleDeleteProposal(prop._id)}
                                className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs cursor-pointer border border-rose-200"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminModerationPage;
