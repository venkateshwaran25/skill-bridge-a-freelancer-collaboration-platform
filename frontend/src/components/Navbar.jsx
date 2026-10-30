import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Bell,
  MessageSquare,
  ChevronDown,
  User,
  LayoutDashboard,
  FolderGit2,
  Users,
  LogOut,
  Sparkles,
  MoreHorizontal,
  Home,
  Briefcase,
  Bot,
  Rss,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import SearchModal from "./SearchModal";

const mainNavLinks = [
  { label: "Home", to: "/", icon: Home },
  { label: "Projects", to: "/projects", icon: Briefcase },
  { label: "My Projects", to: "/my-projects", icon: FolderGit2 },
  { label: "Network", to: "/network", icon: Users },
  { label: "Feed", to: "/feed", icon: Rss },
  { label: "Showcase", to: "/showcase", icon: FolderGit2 },
  { label: "AI Match", to: "/ai-match", icon: Sparkles },
  { label: "Messages", to: "/messages", icon: MessageSquare },
  { label: "AI Assistant", to: "/ai-assistant", icon: Bot },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 15);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const primaryLinks = mainNavLinks.slice(0, 5);
  const secondaryLinks = mainNavLinks.slice(5);

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "SB";

  return (
    <>
      <motion.nav
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className={`fixed top-0 left-0 right-0 z-50 px-3 sm:px-6 transition-all duration-300 ${
          scrolled ? "py-2" : "py-3 sm:py-4"
        }`}
      >
        <div
          className={`max-w-7xl mx-auto px-4 sm:px-6 rounded-2xl flex items-center justify-between transition-all duration-300 ${
            scrolled ? "py-2.5" : "py-3"
          }`}
          style={{
            background: scrolled
              ? "rgba(250, 250, 248, 0.96)"
              : "rgba(250, 250, 248, 0.88)",
            backdropFilter: "blur(16px)",
            border: "1px solid var(--border-color)",
            boxShadow: scrolled
              ? "0 8px 24px rgba(28, 25, 23, 0.10), 0 2px 6px rgba(28, 25, 23, 0.06)"
              : "0 2px 8px rgba(28, 25, 23, 0.06)",
          }}
        >
          {/* Logo */}
          <Link to="/" className="flex items-center no-underline group shrink-0">
            <span
              className="font-bold text-lg tracking-tight"
              style={{
                fontFamily: "'Lora', Georgia, serif",
                color: "var(--text-main)",
              }}
            >
              SkillBridge
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-1.5">
            {primaryLinks.map((link) => {
              const active = location.pathname === link.to;
              return (
                <Link
                  key={link.label}
                  to={link.to}
                  className="px-3 py-1.5 text-xs xl:text-sm font-medium rounded-xl transition-all duration-200 no-underline flex items-center gap-1.5"
                  style={
                    active
                      ? {
                          background: "var(--primary-soft)",
                          color: "var(--primary-dark)",
                          border: "1px solid var(--primary-mid)",
                          fontWeight: 600,
                        }
                      : {
                          color: "var(--text-sub)",
                          border: "1px solid transparent",
                        }
                  }
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = "var(--bg-hover)";
                      e.currentTarget.style.color = "var(--text-main)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = "";
                      e.currentTarget.style.color = "var(--text-sub)";
                    }
                  }}
                >
                  <link.icon
                    className="w-3.5 h-3.5"
                    style={{ color: active ? "var(--primary)" : "var(--text-light)" }}
                  />
                  {link.label}
                </Link>
              );
            })}

            {/* XL screens — secondary links inline */}
            {secondaryLinks.map((link) => {
              const active = location.pathname === link.to;
              return (
                <Link
                  key={link.label}
                  to={link.to}
                  className="hidden xl:flex px-3 py-1.5 text-xs xl:text-sm font-medium rounded-xl transition-all duration-200 no-underline items-center gap-1.5"
                  style={
                    active
                      ? {
                          background: "var(--primary-soft)",
                          color: "var(--primary-dark)",
                          border: "1px solid var(--primary-mid)",
                          fontWeight: 600,
                        }
                      : {
                          color: "var(--text-sub)",
                          border: "1px solid transparent",
                        }
                  }
                >
                  <link.icon
                    className="w-3.5 h-3.5"
                    style={{ color: active ? "var(--primary)" : "var(--text-light)" }}
                  />
                  {link.label}
                </Link>
              );
            })}

            {/* More dropdown (LG only, not XL) */}
            <div className="relative xl:hidden">
              <button
                onClick={() => setMoreOpen(!moreOpen)}
                className="px-2.5 py-1.5 text-xs font-medium rounded-xl flex items-center gap-1 transition-all"
                style={{
                  color: "var(--text-sub)",
                  border: "1px solid transparent",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--bg-hover)";
                  e.currentTarget.style.color = "var(--text-main)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "";
                  e.currentTarget.style.color = "var(--text-sub)";
                }}
              >
                <MoreHorizontal className="w-4 h-4" style={{ color: "var(--text-light)" }} />
                <span>More</span>
              </button>

              <AnimatePresence>
                {moreOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-48 rounded-2xl p-2 z-50"
                    style={{
                      background: "var(--bg-card)",
                      border: "1px solid var(--border-color)",
                      boxShadow: "var(--shadow-lg)",
                    }}
                  >
                    {secondaryLinks.map((link) => (
                      <Link
                        key={link.label}
                        to={link.to}
                        onClick={() => setMoreOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl no-underline transition-colors"
                        style={{ color: "var(--text-sub)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                      >
                        <link.icon className="w-3.5 h-3.5" style={{ color: "var(--primary)" }} />
                        {link.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSearchOpen(true)}
              className="w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200"
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-color)",
                color: "var(--text-muted)",
              }}
              title="Global Search"
            >
              <Search className="w-4 h-4" />
            </motion.button>

            {user ? (
              <>
                {/* Notifications */}
                <Link to="/notifications" className="no-underline">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200"
                    style={{
                      background: "var(--bg-secondary)",
                      border: "1px solid var(--border-color)",
                      color: "var(--text-muted)",
                    }}
                    title="Notifications"
                  >
                    <Bell className="w-4 h-4" />
                    <span
                      className="absolute top-2 right-2 w-2 h-2 rounded-full ring-2"
                      style={{ background: "var(--primary)", ringColor: "var(--bg-primary)" }}
                    />
                  </motion.button>
                </Link>

                {/* Messages */}
                <Link to="/messages" className="no-underline">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200"
                    style={{
                      background: "var(--bg-secondary)",
                      border: "1px solid var(--border-color)",
                      color: "var(--text-muted)",
                    }}
                    title="Messages"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </motion.button>
                </Link>

                {/* Profile Dropdown */}
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-xl transition-all duration-200"
                    style={{
                      background: "var(--bg-secondary)",
                      border: "1px solid var(--border-color)",
                    }}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                      style={{
                        background: "linear-gradient(135deg, var(--primary), var(--primary-light))",
                      }}
                    >
                      {initials}
                    </div>
                    <span className="text-xs font-medium hidden sm:block max-w-[90px] truncate"
                      style={{ color: "var(--text-main)" }}>
                      {user.name?.split(" ")[0]}
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`}
                      style={{ color: "var(--text-muted)" }}
                    />
                  </motion.button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-56 rounded-2xl overflow-hidden z-50 p-1.5"
                        style={{
                          background: "var(--bg-card)",
                          border: "1px solid var(--border-color)",
                          boxShadow: "var(--shadow-lg)",
                        }}
                      >
                        <div className="p-3" style={{ borderBottom: "1px solid var(--border-color)", background: "var(--primary-soft)" }}>
                          <p className="text-sm font-semibold truncate" style={{ fontFamily: "'Lora', serif", color: "var(--text-main)" }}>
                            {user.name}
                          </p>
                          <p className="text-xs truncate mt-0.5" style={{ color: "var(--text-muted)" }}>
                            {user.title || user.email}
                          </p>
                          <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-semibold rounded-full"
                            style={{ color: "#059669", background: "#ECFDF5", border: "1px solid #A7F3D0" }}>
                            ● Available for Hire
                          </span>
                        </div>

                        <div className="py-1">
                          {[
                            { to: "/profile", icon: User, label: "My Profile" },
                            { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
                            { to: "/showcase", icon: FolderGit2, label: "My Showcase" },
                            { to: "/network", icon: Users, label: "My Connections" },
                          ].map(({ to, icon: Icon, label }) => (
                            <Link
                              key={to}
                              to={to}
                              onClick={() => setProfileOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl no-underline transition-colors"
                              style={{ color: "var(--text-sub)" }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                              onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                            >
                              <Icon className="w-3.5 h-3.5" style={{ color: "var(--primary)" }} />
                              {label}
                            </Link>
                          ))}
                        </div>

                        <div style={{ paddingTop: "4px", borderTop: "1px solid var(--border-color)" }}>
                          <button
                            onClick={() => { logout(); setProfileOpen(false); }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl transition-all duration-150"
                            style={{ color: "#DC2626" }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#FEF2F2")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs sm:text-sm font-medium rounded-xl transition-all duration-200 no-underline"
                  style={{ color: "var(--text-sub)" }}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-xs sm:text-sm text-white font-semibold rounded-xl no-underline transition-all duration-200"
                  style={{
                    background: "linear-gradient(135deg, var(--primary), var(--primary-light))",
                    boxShadow: "var(--shadow-amber)",
                  }}
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </motion.nav>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

export default Navbar;
