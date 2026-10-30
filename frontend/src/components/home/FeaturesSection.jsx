import { motion } from "framer-motion";
import {
  Brain,
  FileText,
  Search,
  Users,
  MessageSquare,
  BarChart3,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Talent Matching",
    description:
      "Our neural engine analyzes 50+ signals to match clients with the perfect freelancer in seconds, not days.",
    color: "from-violet-600/20 to-violet-800/10",
    border: "hover:border-violet-500/50",
    iconBg: "bg-violet-500/20",
    iconColor: "text-violet-400",
    glow: "group-hover:shadow-[0_0_30px_rgba(124,58,237,0.2)]",
    tag: "Core AI",
  },
  {
    icon: FileText,
    title: "AI Proposal Generator",
    description:
      "Generate winning, personalized proposals in one click using contextual AI that understands your skills and the project.",
    color: "from-blue-600/20 to-blue-800/10",
    border: "hover:border-blue-500/50",
    iconBg: "bg-blue-500/20",
    iconColor: "text-blue-400",
    glow: "group-hover:shadow-[0_0_30px_rgba(37,99,235,0.2)]",
    tag: "Productivity",
  },
  {
    icon: Search,
    title: "AI Resume Analyzer",
    description:
      "Deep-scan resumes against job requirements with explainable AI scoring to surface the best candidates instantly.",
    color: "from-cyan-600/20 to-cyan-800/10",
    border: "hover:border-cyan-500/50",
    iconBg: "bg-cyan-500/20",
    iconColor: "text-cyan-400",
    glow: "group-hover:shadow-[0_0_30px_rgba(6,182,212,0.2)]",
    tag: "Analytics",
  },
  {
    icon: Users,
    title: "AI Team Builder",
    description:
      "Assemble entire project teams automatically. AI evaluates skill gaps and suggests the optimal team composition.",
    color: "from-emerald-600/20 to-emerald-800/10",
    border: "hover:border-emerald-500/50",
    iconBg: "bg-emerald-500/20",
    iconColor: "text-emerald-400",
    glow: "group-hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]",
    tag: "Team",
  },
  {
    icon: MessageSquare,
    title: "Real-time Chat",
    description:
      "WebSocket-powered instant messaging with file sharing, project milestones, and integrated payment releases.",
    color: "from-pink-600/20 to-pink-800/10",
    border: "hover:border-pink-500/50",
    iconBg: "bg-pink-500/20",
    iconColor: "text-pink-400",
    glow: "group-hover:shadow-[0_0_30px_rgba(236,72,153,0.2)]",
    tag: "Communication",
  },
  {
    icon: BarChart3,
    title: "Smart Hiring Analytics",
    description:
      "Comprehensive dashboards with AI-generated insights on hiring patterns, budget optimization, and team performance.",
    color: "from-amber-600/20 to-amber-800/10",
    border: "hover:border-amber-500/50",
    iconBg: "bg-amber-500/20",
    iconColor: "text-amber-400",
    glow: "group-hover:shadow-[0_0_30px_rgba(245,158,11,0.2)]",
    tag: "Insights",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const FeaturesSection = () => {
  return (
    <section className="py-28 px-4 relative overflow-hidden" style={{ background: "#0B1020" }}>
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-violet-900/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/30 mb-6">
            <Brain className="w-4 h-4 text-violet-400" />
            <span className="text-sm text-violet-300 font-medium">Powered by AI</span>
          </div>
          <h2
            className="font-extrabold text-white mb-4"
            style={{
              fontSize: "clamp(2rem, 4vw, 2.8rem)",
              fontFamily: "'Poppins', sans-serif",
              letterSpacing: "-0.02em",
            }}
          >
            Everything You Need to{" "}
            <span className="gradient-text-primary">Hire Smarter</span>
          </h2>
          <p className="text-slate-200 text-lg max-w-2xl mx-auto">
            A complete AI-powered ecosystem for modern freelancing — from matching to payment, every step is intelligent.
          </p>
        </motion.div>

        {/* Feature Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={cardVariants}
                className={`group relative rounded-3xl bg-white/[0.04] backdrop-blur-sm border border-white/10 p-7 transition-all duration-500 cursor-pointer ${feature.border} ${feature.glow}`}
              >
                {/* Gradient overlay */}
                <div
                  className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
                />

                {/* Tag */}
                <div className="flex items-center justify-between mb-5 relative z-10">
                  <div
                    className={`w-12 h-12 rounded-2xl ${feature.iconBg} flex items-center justify-center ${feature.iconColor} group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className="w-6 h-6" strokeWidth={1.5} />
                  </div>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${feature.iconBg} ${feature.iconColor} border border-current/20`}
                  >
                    {feature.tag}
                  </span>
                </div>

                <h3
                  className="text-white text-xl font-bold mb-3 relative z-10 group-hover:text-white transition-colors"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  {feature.title}
                </h3>
                <p className="text-slate-200 text-sm leading-relaxed relative z-10">
                  {feature.description}
                </p>

                <div className="flex items-center gap-2 mt-5 relative z-10">
                  <span
                    className={`text-sm font-semibold ${feature.iconColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1`}
                  >
                    Learn more <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
