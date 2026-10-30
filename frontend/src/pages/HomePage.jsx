import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sparkles,
  Users,
  Briefcase,
  FolderGit2,
  ArrowRight,
  Bot,
  Rss,
  CheckCircle2,
  Star,
  TrendingUp,
  Shield,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease: "easeOut" },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

const features = [
  {
    icon: Rss,
    title: "Professional Feed",
    desc: "Share project updates, technical milestones, and build your professional reputation.",
    link: "/feed",
    linkLabel: "View Feed",
    color: "#D97706",
    bg: "#FEF3C7",
  },
  {
    icon: FolderGit2,
    title: "Portfolio Showcase",
    desc: "Publish case studies and live demos with verified tech stack tags.",
    link: "/showcase",
    linkLabel: "Explore Showcase",
    color: "#0284C7",
    bg: "#E0F2FE",
  },
  {
    icon: Sparkles,
    title: "AI Match Engine",
    desc: "Match with high-probability opportunities based on your skills and rate.",
    link: "/ai-match",
    linkLabel: "Try AI Match",
    color: "#7C3AED",
    bg: "#EDE9FE",
  },
  {
    icon: Bot,
    title: "AI Copilot",
    desc: "Draft tailored proposals, optimize your profile, and analyze requirements.",
    link: "/ai-assistant",
    linkLabel: "Ask AI Copilot",
    color: "#059669",
    bg: "#ECFDF5",
  },
];

const stats = [
  { label: "Verified Freelancers", value: "15,000+", icon: Users },
  { label: "AI Match Accuracy", value: "98.4%", icon: TrendingUp },
  { label: "Project Volume", value: "₹4.2M+", icon: Briefcase },
  { label: "Showcase Entries", value: "8,500+", icon: FolderGit2 },
];

const trustBadges = [
  "SSL Secured",
  "Escrow Payments",
  "Verified Profiles",
  "AI-Powered",
];

const HomePage = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-20 pb-20">

      {/* ── HERO SECTION ── */}
      <motion.section
        className="relative pt-8 pb-4 max-w-5xl mx-auto"
        initial="initial"
        animate="animate"
        variants={stagger}
      >
        {/* Warm background blob */}
        <div
          className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at center, rgba(253,230,138,0.35) 0%, rgba(253,230,138,0) 70%)",
            filter: "blur(40px)",
          }}
        />

        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text */}
          <div className="space-y-7">
            <motion.div variants={fadeUp}>
              <span
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider"
                style={{
                  background: "var(--primary-soft)",
                  border: "1px solid var(--primary-mid)",
                  color: "var(--primary-dark)",
                }}
              >
                <Sparkles className="w-3.5 h-3.5" style={{ color: "var(--primary)" }} />
                AI-Powered Freelance Platform
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-4xl sm:text-5xl lg:text-[3.4rem] leading-[1.12] font-bold"
              style={{ fontFamily: "'Lora', Georgia, serif", color: "var(--text-main)" }}
            >
              Build. Connect.{" "}
              <span
                className="relative inline-block"
                style={{ color: "var(--primary)" }}
              >
                Get Hired.
                {/* Underline accent */}
                <svg
                  className="absolute -bottom-1 left-0 w-full"
                  height="6"
                  viewBox="0 0 200 6"
                  fill="none"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0 5 Q50 0 100 4 Q150 8 200 3"
                    stroke="var(--primary-light)"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-base sm:text-lg leading-relaxed max-w-md"
              style={{ color: "var(--text-muted)" }}
            >
              The professional AI network where freelancers showcase verified work,
              match with top projects, and collaborate in smart digital workplaces.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-3">
              <Link to="/projects" className="no-underline">
                <button className="btn-saas-primary text-sm py-3 px-6">
                  <Briefcase className="w-4 h-4" />
                  Explore Projects
                </button>
              </Link>
              <Link to={user ? "/profile" : "/register"} className="no-underline">
                <button className="btn-saas-secondary text-sm py-3 px-6">
                  <Users className="w-4 h-4" style={{ color: "var(--primary)" }} />
                  Build Your Profile
                </button>
              </Link>
            </motion.div>

            {/* Trust badges */}
            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-2 pt-1">
              {trustBadges.map((badge) => (
                <span
                  key={badge}
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg"
                  style={{ color: "var(--text-muted)", background: "var(--bg-secondary)", border: "1px solid var(--border-color)" }}
                >
                  <CheckCircle2 className="w-3 h-3" style={{ color: "var(--primary)" }} />
                  {badge}
                </span>
              ))}
            </motion.div>
          </div>

          {/* Right: Dashboard preview card */}
          <motion.div
            variants={{ ...fadeUp, transition: { duration: 0.65, delay: 0.15 } }}
            className="relative hidden lg:block"
          >
            {/* Outer glow */}
            <div
              className="absolute inset-0 rounded-2xl"
              style={{
                background: "radial-gradient(ellipse at 60% 40%, rgba(253,230,138,0.3) 0%, transparent 70%)",
                filter: "blur(24px)",
              }}
            />
            <div
              className="relative rounded-2xl p-6 space-y-4"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-color)",
                boxShadow: "var(--shadow-lg)",
              }}
            >
              {/* Mini header */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold" style={{ fontFamily: "'Lora', serif", color: "var(--text-main)" }}>
                  Dashboard Overview
                </span>
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: "var(--primary-soft)", color: "var(--primary-dark)", border: "1px solid var(--primary-mid)" }}
                >
                  Live
                </span>
              </div>

              {/* Metric cards */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Active Projects", val: "12", delta: "+3" },
                  { label: "Proposals Sent", val: "47", delta: "+8" },
                  { label: "Earnings (₹)", val: "2.4L", delta: "+12%" },
                ].map(({ label, val, delta }) => (
                  <div
                    key={label}
                    className="p-3 rounded-xl"
                    style={{ background: "var(--bg-primary)", border: "1px solid var(--border-color)" }}
                  >
                    <p className="text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>{label}</p>
                    <p className="text-lg font-bold mt-0.5" style={{ fontFamily: "'Lora', serif", color: "var(--text-main)" }}>{val}</p>
                    <p className="text-[10px] font-semibold mt-0.5" style={{ color: "#059669" }}>{delta}</p>
                  </div>
                ))}
              </div>

              {/* Recent activity */}
              <div>
                <p className="text-[11px] font-bold mb-2 uppercase tracking-wider" style={{ color: "var(--text-light)" }}>Recent Activity</p>
                <div className="space-y-2">
                  {[
                    { name: "Anika Sharma", action: "accepted your proposal", time: "2m ago", avatar: "AS" },
                    { name: "Rohan Kumar", action: "left a 5★ review", time: "1h ago", avatar: "RK" },
                    { name: "AI Match", action: "found 3 new projects", time: "3h ago", avatar: "AI", isAI: true },
                  ].map(({ name, action, time, avatar, isAI }) => (
                    <div key={name} className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                        style={{ background: isAI ? "linear-gradient(135deg, var(--primary), var(--primary-light))" : "#6366F1" }}
                      >
                        {avatar}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-semibold truncate" style={{ color: "var(--text-main)" }}>{name}</p>
                        <p className="text-[10px] truncate" style={{ color: "var(--text-muted)" }}>{action}</p>
                      </div>
                      <span className="text-[9px] shrink-0" style={{ color: "var(--text-light)" }}>{time}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Match banner */}
              <div
                className="rounded-xl p-3 flex items-center gap-2"
                style={{ background: "var(--primary-soft)", border: "1px solid var(--primary-mid)" }}
              >
                <Sparkles className="w-4 h-4 shrink-0" style={{ color: "var(--primary)" }} />
                <p className="text-xs font-medium" style={{ color: "var(--primary-dark)" }}>
                  AI found <strong>98.4%</strong> match — React Developer for FinTech Startup
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* ── STATS BAR ── */}
      <motion.section
        className="max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div
          className="grid grid-cols-2 sm:grid-cols-4 gap-0 rounded-2xl overflow-hidden"
          style={{ border: "1px solid var(--border-color)", background: "var(--bg-card)", boxShadow: "var(--shadow-md)" }}
        >
          {stats.map(({ label, value, icon: Icon }, i) => (
            <div
              key={label}
              className="p-6 text-center"
              style={{
                borderRight: i < stats.length - 1 ? "1px solid var(--border-color)" : "none",
              }}
            >
              <Icon className="w-5 h-5 mx-auto mb-2" style={{ color: "var(--primary)" }} />
              <p className="text-2xl font-bold" style={{ fontFamily: "'Lora', serif", color: "var(--text-main)" }}>
                {value}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{label}</p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* ── FEATURES GRID ── */}
      <motion.section
        className="max-w-5xl mx-auto space-y-8"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center">
          <h2
            className="text-2xl sm:text-3xl font-bold"
            style={{ fontFamily: "'Lora', Georgia, serif", color: "var(--text-main)" }}
          >
            Complete Ecosystem for Modern Freelancing
          </h2>
          <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
            Connect, showcase, collaborate, and manage deliverables with built-in AI tools.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map(({ icon: Icon, title, desc, link, linkLabel, color, bg }) => (
            <motion.div
              key={title}
              className="saas-card-interactive p-5 space-y-4"
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ background: bg }}
              >
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <div>
                <h3
                  className="text-sm font-bold"
                  style={{ fontFamily: "'Lora', serif", color: "var(--text-main)" }}
                >
                  {title}
                </h3>
                <p className="text-xs mt-1.5 leading-relaxed" style={{ color: "var(--text-muted)" }}>
                  {desc}
                </p>
              </div>
              <Link
                to={link}
                className="inline-flex items-center gap-1 text-xs font-bold no-underline hover:gap-2 transition-all"
                style={{ color }}
              >
                <span>{linkLabel}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ── TESTIMONIAL / SOCIAL PROOF ── */}
      <motion.section
        className="max-w-3xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div
          className="rounded-3xl p-8 sm:p-10 text-center"
          style={{
            background: "linear-gradient(135deg, var(--primary-soft) 0%, #FFFBF0 100%)",
            border: "1px solid var(--primary-mid)",
          }}
        >
          <div className="flex justify-center mb-3">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-current" style={{ color: "var(--primary)" }} />
            ))}
          </div>
          <blockquote
            className="text-lg sm:text-xl font-medium leading-relaxed mb-4"
            style={{ fontFamily: "'Lora', Georgia, serif", color: "var(--text-main)" }}
          >
            "SkillBridge's AI matching found me a project within 24 hours. The digital workspace
            made collaboration seamless. I earned 40% more than my previous rate."
          </blockquote>
          <div className="flex items-center justify-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-light))" }}
            >
              AS
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold" style={{ color: "var(--text-main)" }}>Anika Sharma</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Senior Full-Stack Developer, Bangalore</p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── CTA SECTION ── */}
      <motion.section
        className="max-w-4xl mx-auto text-center space-y-6"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2
          className="text-3xl sm:text-4xl font-bold"
          style={{ fontFamily: "'Lora', Georgia, serif", color: "var(--text-main)" }}
        >
          Ready to grow your career?
        </h2>
        <p className="text-base" style={{ color: "var(--text-muted)" }}>
          Join thousands of top professionals already building their future on SkillBridge.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link to="/register" className="no-underline">
            <button className="btn-saas-primary text-sm py-3.5 px-8">
              <Sparkles className="w-4 h-4" />
              Start for Free
            </button>
          </Link>
          <Link to="/showcase" className="no-underline">
            <button className="btn-saas-outline text-sm py-3.5 px-8">
              <FolderGit2 className="w-4 h-4" />
              Browse Showcase
            </button>
          </Link>
        </div>
        <div className="flex items-center justify-center gap-2 text-xs" style={{ color: "var(--text-light)" }}>
          <Shield className="w-3.5 h-3.5" />
          No credit card required · Free to join · Cancel anytime
        </div>
      </motion.section>
    </div>
  );
};

export default HomePage;
