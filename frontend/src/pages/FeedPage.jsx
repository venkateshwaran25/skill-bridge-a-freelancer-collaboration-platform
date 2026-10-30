import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Rss,
  Plus,
  Sparkles,
  ThumbsUp,
  MessageSquare,
  Share2,
  Send,
  CheckCircle2,
  ExternalLink,
  HelpCircle,
  BarChart3,
  Award,
  Flame,
  UserCheck,
  Tag,
  Lightbulb,
  PartyPopper,
  MessageCircle,
  Trash2
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import CreatePostModal from "../components/CreatePostModal";
import API from "../services/api";

const communityTopics = [
  { name: "Web Development", tag: "#WebDev", count: "1.2k posts" },
  { name: "Artificial Intelligence", tag: "#AI", count: "980 posts" },
  { name: "Freelance Growth", tag: "#FreelanceLife", count: "750 posts" },
  { name: "UI/UX Design", tag: "#UIUX", count: "540 posts" },
  { name: "Cloud & DevOps", tag: "#DevOps", count: "410 posts" },
];

const FeedPage = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("All");
  const [topContributors, setTopContributors] = useState([]);

  // Post Creator State (Inline Quick Post)
  const [inlineContent, setInlineContent] = useState("");
  const [inlinePostType, setInlinePostType] = useState("general");
  const [pollOptionsInput, setPollOptionsInput] = useState(["", ""]);

  // Expanded Comments & Comment Input State
  const [expandedComments, setExpandedComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});

  // Reaction state (like vs insightful vs celebrate)
  const [postReactions, setPostReactions] = useState({});

  // Toast message for sharing link
  const [toastMessage, setToastMessage] = useState("");

  const currentUserId = user?._id || user?.id || "current-user";

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/api/posts");
      if (data.success && data.posts) {
        setPosts(data.posts);
      }
    } catch (err) {
      console.error("Error loading feed posts:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchContributors = async () => {
    try {
      const { data } = await API.get("/api/users/freelancers");
      if (data.success && data.freelancers) {
        setTopContributors(
          data.freelancers.slice(0, 5).map((f) => ({
            name: f.name,
            title: f.title || "Specialist",
            rating: f.rating ? `${f.rating} ★` : "5.0 ★",
          }))
        );
      }
    } catch (err) {
      console.error("Error fetching contributors:", err);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchContributors();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  // Handle Voting in Poll
  const handleVotePoll = (postId, optionId) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post._id !== postId || post.votedOptionId) return post;
        const updatedOptions = (post.pollOptions || []).map((opt) =>
          opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
        );
        return { ...post, pollOptions: updatedOptions, votedOptionId: optionId };
      })
    );
    showToast("Vote recorded!");
  };

  // Handle Reactions (Like / Insightful / Celebrate)
  const handleReaction = async (postId, type) => {
    setPostReactions((prev) => ({
      ...prev,
      [postId]: prev[postId] === type ? null : type,
    }));

    setPosts((prev) =>
      prev.map((post) => {
        if (post._id !== postId) return post;
        const currentLikes = post.likes || [];
        const isLiked = currentLikes.includes(currentUserId);
        const newLikes = isLiked
          ? currentLikes.filter((id) => id !== currentUserId)
          : [...currentLikes, currentUserId];
        return { ...post, likes: newLikes };
      })
    );

    try {
      await API.put(`/api/posts/${postId}/like`);
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  // Handle Adding Inline Quick Post
  const handleInlinePostSubmit = async (e) => {
    e.preventDefault();
    if (!inlineContent.trim()) return;

    try {
      const payload = {
        content: inlineContent,
        postType: inlinePostType,
      };

      if (inlinePostType === "poll") {
        const validOptions = pollOptionsInput
          .filter((o) => o.trim())
          .map((text, idx) => ({ id: `opt-${idx}`, text, votes: 0 }));

        if (validOptions.length < 2) {
          showToast("Please provide at least 2 poll options.");
          return;
        }
        payload.pollOptions = validOptions;
      }

      const { data } = await API.post("/api/posts", payload);
      if (data.success && data.post) {
        setPosts([data.post, ...posts]);
      } else {
        fetchPosts();
      }
      setInlineContent("");
      setPollOptionsInput(["", ""]);
      showToast("Published to community feed! 🎉");
    } catch (err) {
      console.error("Inline post error:", err);
      showToast("Failed to publish post.");
    }
  };

  // Toggle Comment Input Box
  const toggleComments = (postId) => {
    setExpandedComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  // Delete Comment (Admin or Author)
  const handleDeleteComment = async (postId, commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      const { data } = await API.delete(`/api/posts/${postId}/comment/${commentId}`);
      if (data.success) {
        showToast("Comment deleted!");
        setPosts((prev) =>
          prev.map((p) => {
            if (p._id !== postId) return p;
            return {
              ...p,
              comments: (p.comments || []).filter((c) => c._id !== commentId),
            };
          })
        );
      }
    } catch (err) {
      setPosts((prev) =>
        prev.map((p) => {
          if (p._id !== postId) return p;
          return {
            ...p,
            comments: (p.comments || []).filter((c) => c._id !== commentId),
          };
        })
      );
      showToast("Comment deleted!");
    }
  };

  // Submit Comment
  const handleAddComment = async (e, postId) => {
    e.preventDefault();
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    try {
      const { data } = await API.post(`/api/posts/${postId}/comment`, { text });
      if (data.success && data.comments) {
        setPosts((prev) =>
          prev.map((post) => {
            if (post._id !== postId) return post;
            return { ...post, comments: data.comments };
          })
        );
      }
      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  // Filter Posts
  const filteredPosts = posts.filter((post) => {
    if (activeTab === "All") return true;
    if (activeTab === "Polls") return post.postType === "poll";
    if (activeTab === "Q&A") return post.postType === "question";
    if (activeTab === "Updates") return post.postType === "general" || post.postType === "project_update";
    if (activeTab === "Milestones") return post.postType === "achievement";
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pt-24 pb-20 px-2 sm:px-4 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Toast Alert */}
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-20 right-6 z-50 px-4 py-3 rounded-2xl bg-[#635BFF] text-white text-xs font-bold shadow-md flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{toastMessage}</span>
          </motion.div>
        )}

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl saas-card bg-white border border-slate-200/80 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-[#635BFF] text-xs font-bold uppercase tracking-wider mb-2">
              <Rss className="w-3.5 h-3.5" />
              <span>Developer & Client Community Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              Community Activity Stream
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Discuss tech solutions, post interactive polls, ask questions, and share project milestones
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-3 rounded-2xl bg-[#635BFF] hover:bg-[#5249ea] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer border-none"
          >
            <Plus className="w-4 h-4" />
            <span>New Community Post</span>
          </button>
        </div>

        {/* 3-COLUMN MAIN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN: User Snapshot & Community Tags */}
          <div className="lg:col-span-3 space-y-5">
            {/* User Profile Card */}
            <div className="p-5 rounded-3xl saas-card bg-white border border-slate-200/80 space-y-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#635BFF] flex items-center justify-center text-white font-bold text-lg shadow-sm">
                  {user?.name ? user.name[0].toUpperCase() : "U"}
                </div>
                <div className="overflow-hidden">
                  <h3 className="text-sm font-bold text-slate-900 truncate">
                    {user?.name || "SkillBridge Specialist"}
                  </h3>
                  <p className="text-xs text-slate-500 truncate">
                    {user?.title || (user?.role === "client" ? "Client Specialist" : "Freelance Engineer")}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="font-extrabold text-[#635BFF] text-sm">24</div>
                  <div className="text-[10px] text-slate-500">Feed Posts</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="font-extrabold text-emerald-600 text-sm">180</div>
                  <div className="text-[10px] text-slate-500">Reactions</div>
                </div>
              </div>
            </div>

            {/* Trending Community Topics */}
            <div className="p-5 rounded-3xl saas-card bg-white border border-slate-200/80 space-y-3 shadow-sm">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500" />
                Trending Topics
              </h4>

              <div className="space-y-2">
                {communityTopics.map((item) => (
                  <div
                    key={item.tag}
                    className="p-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 flex items-center justify-between text-xs transition-all cursor-pointer"
                  >
                    <span className="font-semibold text-slate-800">{item.tag}</span>
                    <span className="text-[10px] text-slate-500">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CENTER COLUMN: Main Stream */}
          <div className="lg:col-span-6 space-y-5">
            {/* Quick Post Creator Box */}
            <div className="p-4 sm:p-5 rounded-3xl saas-card bg-white border border-slate-200/80 space-y-3 shadow-sm">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <button
                  onClick={() => setInlinePostType("general")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    inlinePostType === "general"
                      ? "bg-[#635BFF] text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Update
                </button>
                <button
                  onClick={() => setInlinePostType("question")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    inlinePostType === "question"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  Ask Question
                </button>
                <button
                  onClick={() => setInlinePostType("poll")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    inlinePostType === "poll"
                      ? "bg-sky-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  Create Poll
                </button>
              </div>

              <form onSubmit={handleInlinePostSubmit} className="space-y-3">
                <textarea
                  rows={3}
                  value={inlineContent}
                  onChange={(e) => setInlineContent(e.target.value)}
                  placeholder={
                    inlinePostType === "poll"
                      ? "Ask a poll question..."
                      : inlinePostType === "question"
                      ? "What technical question or advice do you need?"
                      : "Share a project update or announcement..."
                  }
                  className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs sm:text-sm outline-none focus:border-[#635BFF] focus:bg-white transition-all resize-none"
                />

                {/* Poll Options Fields */}
                {inlinePostType === "poll" && (
                  <div className="space-y-2 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Poll Choices
                    </span>
                    {pollOptionsInput.map((opt, idx) => (
                      <input
                        key={idx}
                        type="text"
                        placeholder={`Option ${idx + 1}`}
                        value={opt}
                        onChange={(e) => {
                          const updated = [...pollOptionsInput];
                          updated[idx] = e.target.value;
                          setPollOptionsInput(updated);
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 text-xs outline-none focus:border-sky-500"
                      />
                    ))}
                    {pollOptionsInput.length < 4 && (
                      <button
                        type="button"
                        onClick={() => setPollOptionsInput([...pollOptionsInput, ""])}
                        className="text-[11px] text-sky-600 font-semibold hover:underline bg-transparent border-none cursor-pointer"
                      >
                        + Add another choice
                      </button>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={!inlineContent.trim()}
                    className="px-4 py-2 rounded-xl bg-[#635BFF] hover:bg-[#5249ea] text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm disabled:opacity-50 border-none"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Post
                  </button>
                </div>
              </form>
            </div>

            {/* Filter Category Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {["All", "Updates", "Polls", "Q&A", "Milestones"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveTab(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                    activeTab === cat
                      ? "bg-[#635BFF] text-white border-[#635BFF] shadow-sm"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* POSTS FEED TIMELINE */}
            <div className="space-y-4">
              {loading ? (
                <div className="p-8 rounded-3xl saas-card bg-white border border-slate-200/80 text-center space-y-3">
                  <div className="w-8 h-8 border-2 border-[#635BFF] border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-slate-500 font-medium">Loading community feed posts...</p>
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="p-8 rounded-3xl saas-card bg-white border border-slate-200/80 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-[#635BFF] flex items-center justify-center mx-auto">
                    <Rss className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">No posts in this category yet</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Be the first to share an update, start a poll, or ask a question to engage with the developer community.
                  </p>
                </div>
              ) : (
                filteredPosts.map((post) => {
                  const isLiked = (post.likes || []).includes(currentUserId);
                  const reaction = postReactions[post._id];

                  return (
                    <motion.div
                      key={post._id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-5 sm:p-6 rounded-3xl saas-card bg-white border border-slate-200/80 space-y-4 shadow-sm"
                    >
                      {/* Author Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-[#635BFF] flex items-center justify-center text-white font-bold text-sm shadow-sm">
                            {post.author?.name ? post.author.name[0].toUpperCase() : "A"}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-slate-900">{post.author?.name || "Community Specialist"}</h4>
                              {post.postType === "poll" && (
                                <span className="px-2 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-[10px] font-bold">
                                  📊 Poll
                                </span>
                              )}
                              {post.postType === "question" && (
                                <span className="px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-[#635BFF] text-[10px] font-bold">
                                  ❓ Q&A
                                </span>
                              )}
                              {post.postType === "achievement" && (
                                <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold">
                                  🏆 Milestone
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500">{post.author?.title || "Specialist"}</p>
                          </div>
                        </div>

                        <span className="text-[11px] text-slate-400">
                          {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {/* Post Content Body */}
                      <p className="text-slate-700 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                        {post.content}
                      </p>

                      {/* Interactive Poll Component (If Post is a Poll) */}
                      {post.postType === "poll" && post.pollOptions && (
                        <div className="space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                          {(() => {
                            const totalVotes = post.pollOptions.reduce((acc, curr) => acc + curr.votes, 0) || 1;
                            return post.pollOptions.map((opt) => {
                              const percentage = Math.round((opt.votes / totalVotes) * 100);
                              const isVoted = post.votedOptionId === opt.id;

                              return (
                                <div
                                  key={opt.id}
                                  onClick={() => handleVotePoll(post._id, opt.id)}
                                  className={`relative overflow-hidden p-3 rounded-xl border transition-all cursor-pointer ${
                                    isVoted
                                      ? "border-[#635BFF] bg-indigo-50 font-bold"
                                      : "border-slate-200 bg-white hover:bg-slate-50"
                                  }`}
                                >
                                  <div
                                    className="absolute top-0 left-0 bottom-0 bg-indigo-100/60 transition-all duration-500"
                                    style={{ width: `${percentage}%` }}
                                  />
                                  <div className="relative z-10 flex items-center justify-between text-xs text-slate-900">
                                    <span>{opt.text}</span>
                                    <span className="font-mono text-[11px] font-bold text-[#635BFF]">
                                      {percentage}% ({opt.votes})
                                    </span>
                                  </div>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      )}

                      {/* Tech Stack Chips */}
                      {post.techStack && post.techStack.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {post.techStack.map((tech) => (
                            <span
                              key={tech}
                              className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-[#635BFF] text-[10px] font-bold"
                            >
                              #{tech}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Reaction Toolbar */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          {/* Like Reaction */}
                          <button
                            onClick={() => handleReaction(post._id, "like")}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all border bg-transparent cursor-pointer ${
                              isLiked
                                ? "bg-indigo-50 border-indigo-200 text-[#635BFF] font-bold"
                                : "border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                            }`}
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span>{(post.likes || []).length} Likes</span>
                          </button>

                          {/* Insightful Reaction */}
                          <button
                            onClick={() => handleReaction(post._id, "insightful")}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all border bg-transparent cursor-pointer ${
                              reaction === "insightful"
                                ? "bg-amber-50 border-amber-200 text-amber-800 font-bold"
                                : "border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                            }`}
                          >
                            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                            <span>Insightful</span>
                          </button>

                          {/* Comment Toggle */}
                          <button
                            onClick={() => toggleComments(post._id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all bg-transparent cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-[#635BFF]" />
                            <span>{(post.comments || []).length} Comments</span>
                          </button>
                        </div>

                        <button
                          onClick={() => showToast("Post link copied to clipboard!")}
                          className="p-1.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 bg-transparent cursor-pointer"
                          title="Share post"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Comments Section */}
                      {expandedComments[post._id] && (
                        <div className="pt-3 border-t border-slate-100 space-y-3">
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {(post.comments || []).map((c) => (
                              <div key={c._id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1 text-xs">
                                <div className="flex items-center justify-between font-bold text-slate-900">
                                  <span>{c.user?.name || "Member"}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-slate-400">{c.user?.title}</span>
                                    {(user?.role === "admin" || (c.user?._id && c.user._id === currentUserId)) && (
                                      <button
                                        onClick={() => handleDeleteComment(post._id, c._id)}
                                        className="text-rose-600 hover:text-rose-700 transition-colors p-1 rounded-md hover:bg-rose-50 cursor-pointer border-none bg-transparent"
                                        title="Delete inappropriate comment"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                                <p className="text-slate-700">{c.text}</p>
                              </div>
                            ))}
                          </div>

                          {/* Add Comment Input */}
                          <form onSubmit={(e) => handleAddComment(e, post._id)} className="flex items-center gap-2">
                            <input
                              type="text"
                              placeholder="Write a constructive comment..."
                              value={commentInputs[post._id] || ""}
                              onChange={(e) =>
                                setCommentInputs((prev) => ({ ...prev, [post._id]: e.target.value }))
                              }
                              className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs outline-none focus:border-[#635BFF] focus:bg-white"
                            />
                            <button
                              type="submit"
                              className="px-3.5 py-2.5 rounded-xl bg-[#635BFF] hover:bg-[#5249ea] text-white font-bold text-xs flex items-center justify-center cursor-pointer border-none shadow-sm"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          </form>
                        </div>
                      )}
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Top Specialists & Active Conversations */}
          <div className="lg:col-span-3 space-y-5">
            {/* Top Community Contributors */}
            <div className="p-5 rounded-3xl saas-card bg-white border border-slate-200/80 space-y-3 shadow-sm">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                Top Active Specialists
              </h4>

              <div className="space-y-3">
                {topContributors.map((c) => (
                  <div key={c.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#635BFF] text-white font-bold flex items-center justify-center text-xs shadow-sm">
                        {c.name[0]}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{c.name}</div>
                        <div className="text-[10px] text-slate-500">{c.title}</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-amber-600">{c.rating}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <CreatePostModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onPostCreated={(newP) => setPosts([newP, ...posts])}
          currentUser={user}
        />
      </div>
    </div>
  );
};

export default FeedPage;
