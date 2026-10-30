import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Briefcase,
  Users,
  MessageSquare,
  User,
  Menu,
  X,
  Rss,
  FolderGit2,
  Sparkles,
  Bot,
  Bell,
  LogOut,
  Zap,
  LayoutDashboard,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const MobileNavbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const bottomItems = [
    { label: "Home", to: "/", icon: Home },
    { label: "Projects", to: "/projects", icon: Briefcase },
    { label: "Network", to: "/network", icon: Users },
    { label: "Messages", to: "/messages", icon: MessageSquare },
    { label: "Profile", to: user ? "/profile" : "/login", icon: User },
  ];

  const drawerLinks = [
    { label: "My Projects", to: "/my-projects", icon: FolderGit2 },
    { label: "Feed Stream", to: "/feed", icon: Rss },
    { label: "Showcase Gallery", to: "/showcase", icon: FolderGit2 },
    { label: "AI Recommendations", to: "/ai-match", icon: Sparkles },
    { label: "AI Chat Assistant", to: "/ai-assistant", icon: Bot },
    { label: "Notifications", to: "/notifications", icon: Bell },
    { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  ];

  return (
    <>
      {/* Slide-over Drawer for More Mobile Actions */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-md lg:hidden"
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-0 bottom-0 w-4/5 max-w-sm bg-[#090D18] border-l border-white/10 p-5 flex flex-col justify-between overflow-y-auto"
            >
              {/* Drawer Top */}
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="flex items-center">
                    <span className="text-white font-bold text-base">SkillBridge</span>
                  </div>
                  <button
                    onClick={() => setDrawerOpen(false)}
                    className="p-1.5 rounded-xl bg-white/5 text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {user && (
                  <div className="my-4 p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                      {user.name?.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold truncate">{user.name}</p>
                      <p className="text-slate-400 text-xs truncate">{user.title || user.email}</p>
                    </div>
                  </div>
                )}

                <div className="mt-4 space-y-1">
                  <p className="px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    More Navigation
                  </p>
                  {drawerLinks.map((item) => {
                    const active = location.pathname === item.to;
                    return (
                      <Link
                        key={item.label}
                        to={item.to}
                        onClick={() => setDrawerOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all no-underline ${
                          active
                            ? "bg-violet-600/20 text-white border border-violet-500/30"
                            : "text-slate-300 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <item.icon className="w-4 h-4 text-violet-400" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Drawer Bottom */}
              <div className="pt-4 border-t border-white/10">
                {user ? (
                  <button
                    onClick={() => {
                      logout();
                      setDrawerOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-semibold hover:bg-rose-500/20 transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link
                      to="/login"
                      onClick={() => setDrawerOpen(false)}
                      className="w-full text-center py-2.5 rounded-xl bg-white/5 text-white font-medium text-sm no-underline"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setDrawerOpen(false)}
                      className="w-full text-center py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-sm no-underline shadow-lg"
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fixed Bottom Navigation Bar for Mobile (< lg) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#090D18]/95 border-t border-white/10 backdrop-blur-xl px-2 py-1.5 shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
        <div className="max-w-md mx-auto flex items-center justify-around">
          {bottomItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.label}
                to={item.to}
                className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all no-underline ${
                  active ? "text-violet-400 font-semibold" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <item.icon className={`w-5 h-5 ${active ? "scale-110" : ""}`} />
                <span className="text-[10px] mt-1">{item.label}</span>
              </Link>
            );
          })}

          <button
            onClick={() => setDrawerOpen(true)}
            className="flex flex-col items-center py-1 px-3 rounded-xl text-slate-400 hover:text-slate-200 transition-all"
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] mt-1">More</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default MobileNavbar;
