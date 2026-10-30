import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  ExternalLink,
  Send,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import API from "../services/api";

const PostCard = ({ post, currentUser }) => {
  const [likesCount, setLikesCount] = useState(post?.likes?.length || post?.likesCount || 0);
  const [isLiked, setIsLiked] = useState(
    currentUser && post?.likes
      ? post.likes.some((l) => (typeof l === "string" ? l === currentUser._id : l._id === currentUser._id))
      : false
  );
  const [isSaved, setIsSaved] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(post?.comments || []);
  const [commentText, setCommentText] = useState("");
  const [copied, setCopied] = useState(false);

  const handleLike = async () => {
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
    try {
      if (post?._id) {
        await API.put(`/api/posts/${post._id}/like`);
      }
    } catch (err) {
      console.log("Like post error:", err);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newCommentObj = {
      _id: Date.now().toString(),
      user: {
        _id: currentUser?._id || "guest",
        name: currentUser?.name || "You",
        title: currentUser?.title || "Freelancer",
      },
      text: commentText,
      createdAt: new Date(),
    };

    setComments([...comments, newCommentObj]);
    setCommentText("");

    try {
      if (post?._id) {
        await API.post(`/api/posts/${post._id}/comment`, { text: commentText });
      }
    } catch (err) {
      console.log("Comment submit error:", err);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.origin + "/feed");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const authorName = post?.author?.name || "Alex Rivera";
  const authorTitle = post?.author?.title || "Senior Full Stack & AI Developer";
  const authorRole = post?.author?.role || "freelancer";
  const authorInitials = authorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const formattedDate = post?.createdAt
    ? new Date(post.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : "Just now";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-[#0F172A]/80 border border-white/10 p-5 shadow-lg backdrop-blur-xl transition-all hover:border-white/15"
    >
      {/* Card Header */}
      <div className="flex items-start justify-between gap-3 mb-3.5">
        <div className="flex items-center gap-3">
          {post?.author?.profileImage || post?.author?.avatar ? (
            <img
              src={post.author.profileImage || post.author.avatar}
              alt={authorName}
              className="w-11 h-11 rounded-xl object-cover border border-white/10 shrink-0"
            />
          ) : (
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0">
              {authorInitials}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-white font-semibold text-sm tracking-tight">{authorName}</h4>
              <span className="px-2 py-0.5 text-[10px] font-semibold text-violet-300 bg-violet-500/10 border border-violet-500/20 rounded-full capitalize">
                {authorRole}
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-0.5 line-clamp-1">{authorTitle}</p>
            <p className="text-slate-400 text-[10px] mt-0.5">{formattedDate} • 🌐 Public</p>
          </div>
        </div>

        <button className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Post Text */}
      <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-line mb-3.5">
        {post?.content}
      </p>

      {/* Tech Badges */}
      {post?.techStack && post.techStack.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3.5">
          {post.techStack.map((tech) => (
            <span
              key={tech}
              className="px-2.5 py-1 text-xs font-medium text-slate-300 bg-white/5 border border-white/10 rounded-lg hover:border-violet-500/30 hover:text-violet-300 transition-all"
            >
              #{tech}
            </span>
          ))}
        </div>
      )}

      {/* Optional Post Image / Preview */}
      {post?.image && (
        <div className="mb-3.5 rounded-xl overflow-hidden border border-white/10 bg-slate-900/50 max-h-80">
          <img
            src={post.image}
            alt="Post attachment"
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        </div>
      )}

      {/* Project Link Banner */}
      {post?.projectUrl && (
        <a
          href={post.projectUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-3 mb-3.5 rounded-xl bg-violet-600/10 border border-violet-500/20 hover:bg-violet-600/20 transition-all no-underline group"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span className="text-xs font-semibold text-violet-300 group-hover:text-white">
              View Linked Project
            </span>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-violet-400" />
        </a>
      )}

      {/* Social Actions Header */}
      <div className="flex items-center justify-between py-2 border-t border-b border-white/10 text-xs text-slate-400 mb-2">
        <span className="flex items-center gap-1">
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20" />
          {likesCount} Likes
        </span>
        <span>{comments.length} Comments</span>
      </div>

      {/* Social Buttons */}
      <div className="grid grid-cols-4 gap-1 pt-1">
        <button
          onClick={handleLike}
          className={`flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            isLiked
              ? "text-rose-400 bg-rose-500/10"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Heart className={`w-4 h-4 ${isLiked ? "fill-rose-500 text-rose-500" : ""}`} />
          <span>Like</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <MessageCircle className="w-4 h-4 text-blue-400" />
          <span>Comment</span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-all"
        >
          {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-indigo-400" />}
          <span>{copied ? "Copied!" : "Share"}</span>
        </button>

        <button
          onClick={() => setIsSaved(!isSaved)}
          className={`flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            isSaved
              ? "text-violet-400 bg-violet-500/10"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Bookmark className={`w-4 h-4 ${isSaved ? "fill-violet-400 text-violet-400" : ""}`} />
          <span>Save</span>
        </button>
      </div>

      {/* Expandable Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3.5 pt-3.5 border-t border-white/10 space-y-3"
          >
            {/* Comment Form */}
            <form onSubmit={handleCommentSubmit} className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a professional comment..."
                className="flex-1 px-3 py-2 text-xs rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-400 outline-none focus:border-violet-500/50"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1 transition-all"
              >
                <Send className="w-3 h-3" />
              </button>
            </form>

            {/* Comment List */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {comments.map((c, i) => (
                <div key={c._id || i} className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-violet-300">
                      {c.user?.name || "Community Member"}
                    </span>
                    <span className="text-[10px] text-slate-400">Just now</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{c.text}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PostCard;
