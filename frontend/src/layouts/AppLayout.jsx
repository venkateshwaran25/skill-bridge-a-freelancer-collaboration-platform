import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Briefcase,
  FolderGit2,
  Users,
  Rss,
  Sparkles,
  MessageSquare,
  Bot,
  LayoutDashboard,
  CheckSquare,
  BarChart3,
  Settings,
  HelpCircle,
  Search,
  Bell,
  Menu,
  X,
  ChevronDown,
  LogOut,
  User,
  Shield,
  PlusCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import SearchModal from "../components/SearchModal";

const mainNavItems = [
  { label: "Home", path: "/", icon: Home },
  { label: "Projects", path: "/projects", icon: Briefcase },
  { label: "My Projects", path: "/my-projects", icon: FolderGit2 },
  { label: "Network", path: "/network", icon: Users },
  { label: "Feed", path: "/feed", icon: Rss },
  { label: "Showcase", path: "/showcase", icon: FolderGit2 },
  { label: "AI Match", path: "/ai-match", icon: Sparkles },
  { label: "Messages", path: "/messages", icon: MessageSquare },
  { label: "AI Assistant", path: "/ai-assistant", icon: Bot },
];

const workspaceItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Tasks & Work", path: "/reports", icon: CheckSquare },
  { label: "Reports", path: "/reports", icon: BarChart3 },
  { label: "Connections", path: "/network", icon: Users },
];

const bottomItems = [
  { label: "My Profile", path: "/profile", icon: Settings },
  { label: "Notifications", path: "/notifications", icon: HelpCircle },
];

const AppLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  const isClient = user?.role === "client";

  const getFilteredNavItems = () => {
    return mainNavItems
      .map((item) => {
        if (isClient) {
          if (item.path === "/projects") return null;
          if (item.path === "/showcase") return { ...item, label: "Browse Showcases" };
          if (item.path === "/network") return { ...item, label: "Find Freelancers" };
          if (item.path === "/ai-match") return { ...item, label: "AI Talent Match" };
        } else {
          if (item.path === "/projects") return { ...item, label: "Browse Jobs" };
          if (item.path === "/network") return { ...item, label: "Network & Peers" };
          if (item.path === "/ai-match") return { ...item, label: "AI Job Match" };
        }
        return item;
      })
      .filter(Boolean);
  };

  const userInitials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "SB";

  const renderNavGroup = (items, title = null) => (
    <div className="space-y-0.5">
      {title && (
        <div className="px-3 pt-5 pb-1.5 text-[10px] font-bold uppercase tracking-widest"
          style={{ color: "var(--text-light)" }}>
          {title}
        </div>
      )}
      {items.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.path === "/"
            ? location.pathname === "/"
            : location.pathname.startsWith(item.path);

        return (
          <Link
            key={item.label}
            to={item.path}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all no-underline group"
            style={
              isActive
                ? {
                    background: "var(--primary-soft)",
                    color: "var(--primary-dark)",
                    borderLeft: "3px solid var(--primary)",
                    fontWeight: 600,
                  }
                : {
                    color: "var(--text-sub)",
                    borderLeft: "3px solid transparent",
                  }
            }
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = "var(--bg-hover)";
                e.currentTarget.style.color = "var(--text-main)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = "";
                e.currentTarget.style.color = "var(--text-sub)";
              }
            }}
          >
            <Icon
              className="w-4 h-4 shrink-0 transition-colors"
              style={{ color: isActive ? "var(--primary)" : "var(--text-light)" }}
            />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );

  const sidebarContent = (
    <div className="flex flex-col h-full w-64 select-none"
      style={{
        background: "var(--bg-sidebar)",
        borderRight: "1px solid var(--border-color)",
      }}
    >
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center justify-between shrink-0"
        style={{ borderBottom: "1px solid var(--border-color)" }}>
        <Link to="/" className="flex items-center no-underline group">
          <span
            className="font-bold text-xl tracking-tight"
            style={{
              fontFamily: "'Lora', Georgia, serif",
              color: "var(--text-main)",
            }}
          >
            SkillBridge
          </span>
        </Link>
      </div>

      {/* Nav Scroll Area */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-0">
        {renderNavGroup(getFilteredNavItems())}
        {renderNavGroup(workspaceItems, "Workspace")}
        {renderNavGroup(bottomItems, "Account")}

        {user?.role === "admin" && (
          <div className="pt-2 px-1">
            <Link
              to="/admin"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all no-underline"
              style={
                location.pathname.startsWith("/admin")
                  ? {
                      background: "#FEF3C7",
                      color: "#92400E",
                      borderLeft: "3px solid #D97706",
                    }
                  : {
                      color: "#B45309",
                      borderLeft: "3px solid transparent",
                    }
              }
            >
              <Shield className="w-4 h-4 text-amber-500" />
              <span>Admin Console</span>
            </Link>
          </div>
        )}
      </div>

      {/* User Compact Card */}
      {user && (
        <div className="p-3 m-3 rounded-xl flex items-center gap-3"
          style={{
            background: "var(--primary-soft)",
            border: "1px solid var(--primary-mid)",
          }}
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
            style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-light))" }}>
            {userInitials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold truncate" style={{ color: "var(--text-main)" }}>
              {user.name}
            </p>
            <p className="text-[10px] capitalize truncate" style={{ color: "var(--primary-dark)" }}>
              {user.role || "Freelancer"}
            </p>
          </div>
        </div>
      )}
    </div>
  );

  if (!user || location.pathname === "/login" || location.pathname === "/register") {
    return <div className="min-h-screen font-sans">{children}</div>;
  }

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg-primary)", color: "var(--text-main)", fontFamily: "'Inter', sans-serif" }}>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block shrink-0 sticky top-0 h-screen z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 lg:hidden"
              style={{ background: "rgba(28, 25, 23, 0.35)", backdropFilter: "blur(2px)" }}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 z-50 lg:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {isOffline && (
          <div className="text-xs py-2 px-4 text-center flex items-center justify-center gap-2 z-[100]"
            style={{ background: "#FEF3C7", color: "#92400E", borderBottom: "1px solid #FDE68A" }}>
            <span className="w-2 h-2 rounded-full animate-ping" style={{ background: "#D97706" }} />
            <span>⚡ You are currently offline. Your session & drafts are backed up locally!</span>
          </div>
        )}

        {/* Top Header */}
        <header className="h-16 sticky top-0 z-20 px-4 sm:px-8 flex items-center justify-between"
          style={{
            background: "rgba(250, 250, 248, 0.92)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid var(--border-color)",
            boxShadow: "0 1px 0 0 var(--border-color)",
          }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg focus:outline-none transition-colors"
              style={{ color: "var(--text-muted)" }}
              aria-label="Toggle navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Global Search Input */}
            <div
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl cursor-pointer text-xs sm:text-sm w-48 sm:w-80 transition-colors"
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-color)",
                color: "var(--text-light)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--primary-light)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-color)")}
            >
              <Search className="w-4 h-4 shrink-0" style={{ color: "var(--text-light)" }} />
              <span className="truncate">Search projects, freelancers, skills...</span>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {user?.role === "client" ? (
              <Link
                to="/projects/create"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-semibold no-underline transition-all"
                style={{
                  background: "linear-gradient(135deg, var(--primary), var(--primary-light))",
                  boxShadow: "var(--shadow-amber)",
                }}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Post Project</span>
              </Link>
            ) : user?.role === "freelancer" ? (
              <Link
                to="/showcase"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-semibold no-underline transition-all"
                style={{
                  background: "linear-gradient(135deg, var(--primary), var(--primary-light))",
                  boxShadow: "var(--shadow-amber)",
                }}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add Showcase</span>
              </Link>
            ) : null}

            {/* Notifications */}
            <Link
              to="/notifications"
              className="p-2 rounded-xl relative transition-colors no-underline"
              style={{ color: "var(--text-muted)" }}
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full ring-2 ring-white"
                style={{ background: "var(--primary)" }} />
            </Link>

            {/* Messages */}
            <Link
              to="/messages"
              className="p-2 rounded-xl transition-colors no-underline hidden sm:block"
              style={{ color: "var(--text-muted)" }}
              title="Messages"
            >
              <MessageSquare className="w-5 h-5" />
            </Link>

            {/* AI Assistant */}
            <Link
              to="/ai-assistant"
              className="p-2 rounded-xl flex items-center gap-1 text-xs font-semibold no-underline transition-colors"
              style={{
                color: "var(--primary-dark)",
                background: "var(--primary-soft)",
              }}
              title="Ask AI Assistant"
            >
              <Bot className="w-5 h-5" style={{ color: "var(--primary)" }} />
              <span className="hidden md:inline">Ask AI</span>
            </Link>

            {/* Profile Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl transition-colors focus:outline-none"
                  style={{ color: "var(--text-main)" }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-sm"
                    style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-light))" }}
                  >
                    {userInitials}
                  </div>
                  <span className="hidden md:block text-xs font-semibold" style={{ color: "var(--text-main)" }}>
                    {user.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 hidden md:block" style={{ color: "var(--text-muted)" }} />
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute right-0 mt-2 w-52 rounded-2xl py-2 z-50"
                      style={{
                        background: "var(--bg-card)",
                        border: "1px solid var(--border-color)",
                        boxShadow: "var(--shadow-lg)",
                      }}
                    >
                      <div className="px-4 py-2" style={{ borderBottom: "1px solid var(--border-color)" }}>
                        <p className="text-xs font-bold truncate" style={{ color: "var(--text-main)" }}>
                          {user.name}
                        </p>
                        <p className="text-[11px] truncate" style={{ color: "var(--text-muted)" }}>
                          {user.email}
                        </p>
                      </div>

                      {[
                        { to: "/profile", icon: User, label: "My Profile" },
                        { to: "/my-projects", icon: Briefcase, label: "My Projects" },
                      ].map(({ to, icon: Icon, label }) => (
                        <Link
                          key={to}
                          to={to}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium no-underline transition-colors"
                          style={{ color: "var(--text-sub)" }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                        >
                          <Icon className="w-4 h-4" style={{ color: "var(--text-light)" }} />
                          <span>{label}</span>
                        </Link>
                      ))}

                      {user.role === "admin" && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium no-underline"
                          style={{ color: "#92400E" }}
                        >
                          <Shield className="w-4 h-4 text-amber-500" />
                          <span>Admin Panel</span>
                        </Link>
                      )}

                      <div style={{ borderTop: "1px solid var(--border-color)", margin: "4px 0" }} />

                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-left border-none bg-transparent cursor-pointer"
                        style={{ color: "#DC2626" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#FEF2F2")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                      >
                        <LogOut className="w-4 h-4" style={{ color: "#DC2626" }} />
                        <span>Sign Out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold no-underline"
                  style={{ color: "var(--text-sub)" }}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white no-underline"
                  style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-light))" }}
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 px-4 sm:px-8 py-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
};

export default AppLayout;
