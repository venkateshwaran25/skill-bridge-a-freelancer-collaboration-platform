import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Image, Link2, Tag, Send, Award, Users, FileText, CheckCircle2 } from "lucide-react";
import API from "../services/api";

const postTypes = [
  { id: "general", label: "General Update", icon: Sparkles },
  { id: "project_update", label: "Project Update", icon: Link2 },
  { id: "achievement", label: "Achievement / Certificate", icon: Award },
  { id: "collaboration", label: "Looking for Collaboration", icon: Users },
  { id: "article", label: "Technical Article", icon: FileText },
];

const CreatePostModal = ({ isOpen, onClose, onPostCreated, currentUser }) => {
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState("general");
  const [techInput, setTechInput] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [projectUrl, setProjectUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);

  // Restore draft post on mount
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem("skillbridge_draft_post");
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed.content) setContent(parsed.content);
        if (parsed.postType) setPostType(parsed.postType);
        if (parsed.techInput) setTechInput(parsed.techInput);
        if (parsed.imageUrl) setImageUrl(parsed.imageUrl);
        if (parsed.projectUrl) setProjectUrl(parsed.projectUrl);
        setDraftRestored(true);
      }
    } catch (e) {
      console.warn("Could not parse draft post");
    }
  }, []);

  // Save draft whenever inputs change
  useEffect(() => {
    if (content || techInput || imageUrl || projectUrl) {
      localStorage.setItem(
        "skillbridge_draft_post",
        JSON.stringify({ content, postType, techInput, imageUrl, projectUrl })
      );
    }
  }, [content, postType, techInput, imageUrl, projectUrl]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    const techStack = techInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const postPayload = {
      content,
      postType,
      techStack,
      image: imageUrl,
      projectUrl,
    };

    try {
      const { data } = await API.post("/api/posts", postPayload);
      if (data.success && onPostCreated) {
        onPostCreated(data.post);
      }
    } catch (err) {
      console.log("Create post fallback:", err);
      // Client-side fallback if backend API is unreachable
      const fallbackPost = {
        _id: Date.now().toString(),
        author: {
          _id: currentUser?._id || "local-user",
          name: currentUser?.name || "You",
          title: currentUser?.title || "Freelancer / Professional",
          role: currentUser?.role || "freelancer",
        },
        content,
        postType,
        techStack,
        image: imageUrl,
        projectUrl,
        likes: [],
        comments: [],
        createdAt: new Date(),
      };
      if (onPostCreated) onPostCreated(fallbackPost);
    } finally {
      setSubmitting(false);
      localStorage.removeItem("skillbridge_draft_post");
      setContent("");
      setTechInput("");
      setImageUrl("");
      setProjectUrl("");
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-md flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-xl rounded-2xl bg-[#0D1322] border border-white/10 shadow-[0_30px_90px_rgba(0,0,0,0.9)] overflow-hidden"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-400" />
              <h3 className="text-white font-bold text-base">Share with the Freelance Community</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body Form */}
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Post Category Chips */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Post Category
              </label>
              <div className="flex flex-wrap gap-2">
                {postTypes.map((type) => {
                  const active = postType === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setPostType(type.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        active
                          ? "bg-violet-600 text-white shadow-md"
                          : "bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10"
                      }`}
                    >
                      <type.icon className="w-3.5 h-3.5" />
                      {type.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Post Content */}
            <div>
              <textarea
                required
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What project, milestone, technical case study, or update do you want to share?"
                className="w-full p-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-400 text-sm outline-none focus:border-violet-500/50 transition-all resize-none"
              />
            </div>

            {/* Tech Stack Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Technologies / Tags (comma separated)
              </label>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
                <Tag className="w-4 h-4 text-violet-400 shrink-0" />
                <input
                  type="text"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  placeholder="React, Node.js, MongoDB, AI, Python"
                  className="w-full bg-transparent text-white placeholder-slate-400 text-xs outline-none"
                />
              </div>
            </div>

            {/* Media URLs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Image URL (optional)
                </label>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
                  <Image className="w-4 h-4 text-indigo-400 shrink-0" />
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-transparent text-white placeholder-slate-400 text-xs outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Project Link (optional)
                </label>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
                  <Link2 className="w-4 h-4 text-blue-400 shrink-0" />
                  <input
                    type="url"
                    value={projectUrl}
                    onChange={(e) => setProjectUrl(e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full bg-transparent text-white placeholder-slate-400 text-xs outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !content.trim()}
                className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl flex items-center gap-2 transition-all shadow-lg disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? "Publishing..." : "Post to Community"}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CreatePostModal;
