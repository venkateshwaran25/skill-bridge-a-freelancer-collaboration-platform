import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Bell,
  CheckCheck,
  UserPlus,
  Heart,
  MessageCircle,
  MessageSquare,
  Sparkles,
  Briefcase,
  Trash2,
} from "lucide-react";
import API from "../services/api";

const initialNotifications = [
  {
    _id: "n-1",
    type: "connection_request",
    title: "New Connection Request",
    message: "Elena Rostova sent you a freelancer connection request.",
    createdAt: new Date(Date.now() - 3600000 * 1),
    read: false,
    icon: UserPlus,
  },
  {
    _id: "n-2",
    type: "like",
    title: "Post Liked",
    message: "Marcus Vance and 5 others liked your showcase project: AI Skin Disease Prediction System.",
    createdAt: new Date(Date.now() - 3600000 * 3),
    read: false,
    icon: Heart,
  },
  {
    _id: "n-3",
    type: "ai_recommendation",
    title: "98% Match Project Found",
    message: "SkillBridge AI recommends: Full Stack E-Commerce Platform with AI Recommendations.",
    createdAt: new Date(Date.now() - 3600000 * 6),
    read: true,
    icon: Sparkles,
  },
  {
    _id: "n-4",
    type: "message",
    title: "Direct Message",
    message: "Sarah Chen sent you a message regarding your React Native proposal.",
    createdAt: new Date(Date.now() - 3600000 * 12),
    read: true,
    icon: MessageSquare,
  },
];

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState("all"); // all, unread

  const fetchNotifications = async () => {
    try {
      const { data } = await API.get("/api/notifications");
      if (data.success && data.notifications && data.notifications.length > 0) {
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.log("Fetch notifications fallback:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter((n) => n._id !== id));
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#080C17] text-white pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 text-violet-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Bell className="w-4 h-4" />
              <span>Activity Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Notifications
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={markAllRead}
              className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold border border-white/10 flex items-center gap-1.5 transition-all"
            >
              <CheckCheck className="w-4 h-4 text-violet-400" />
              <span>Mark All Read</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              filter === "all"
                ? "bg-violet-600 text-white shadow-md"
                : "bg-white/5 text-slate-400 hover:text-white"
            }`}
          >
            All Notifications
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              filter === "unread"
                ? "bg-violet-600 text-white shadow-md"
                : "bg-white/5 text-slate-400 hover:text-white"
            }`}
          >
            Unread Only ({notifications.filter((n) => !n.read).length})
          </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((n) => {
              const IconComp = n.icon || Bell;
              return (
                <motion.div
                  key={n._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                    !n.read
                      ? "bg-violet-600/10 border-violet-500/30"
                      : "bg-[#0F172A]/80 border-white/10"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-violet-400 shrink-0 mt-0.5">
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-white font-bold text-sm">{n.title}</h4>
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                        )}
                      </div>
                      <p className="text-slate-300 text-xs mt-0.5 leading-relaxed">{n.message}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {new Date(n.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteNotification(n._id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/5"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              );
            })
          ) : (
            <div className="p-8 text-center rounded-2xl bg-white/[0.02] border border-white/5 text-slate-400 text-xs">
              No notifications in this view.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
