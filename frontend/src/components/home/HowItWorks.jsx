import { motion } from "framer-motion";
import {
  ClipboardList,
  Brain,
  Users,
  VideoIcon,
  Handshake,
  BarChart3,
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: ClipboardList,
    title: "Post Your Project",
    description:
      "Describe your project requirements, skills needed, budget, and timeline. Our AI immediately starts analyzing.",
    color: "from-violet-600 to-violet-400",
    glow: "shadow-[0_0_30px_rgba(124,58,237,0.3)]",
    borderColor: "border-violet-500/30",
  },
  {
    number: "02",
    icon: Brain,
    title: "AI Analyzes Requirements",
    description:
      "Our neural engine parses 50+ data points — skills, experience, budget, availability — to build your ideal candidate profile.",
    color: "from-blue-600 to-blue-400",
    glow: "shadow-[0_0_30px_rgba(37,99,235,0.3)]",
    borderColor: "border-blue-500/30",
  },
  {
    number: "03",
    icon: Users,
    title: "Find Best Freelancers",
    description:
      "Get a ranked shortlist of pre-vetted freelancers with AI match scores, detailed profiles, and past work samples.",
    color: "from-cyan-600 to-cyan-400",
    glow: "shadow-[0_0_30px_rgba(6,182,212,0.3)]",
    borderColor: "border-cyan-500/30",
  },
  {
    number: "04",
    icon: VideoIcon,
    title: "Interview & Evaluate",
    description:
      "Use our built-in video calls, skill assessments, and AI-generated interview questions to evaluate candidates quickly.",
    color: "from-emerald-600 to-emerald-400",
    glow: "shadow-[0_0_30px_rgba(16,185,129,0.3)]",
    borderColor: "border-emerald-500/30",
  },
  {
    number: "05",
    icon: Handshake,
    title: "Hire with Confidence",
    description:
      "Send offers, sign smart contracts, and set up milestone payments — all protected by our secure escrow system.",
    color: "from-pink-600 to-pink-400",
    glow: "shadow-[0_0_30px_rgba(236,72,153,0.3)]",
    borderColor: "border-pink-500/30",
  },
  {
    number: "06",
    icon: BarChart3,
    title: "Track Progress",
    description:
      "Real-time project dashboards, automated milestone tracking, and AI-powered team performance insights.",
    color: "from-amber-600 to-amber-400",
    glow: "shadow-[0_0_30px_rgba(245,158,11,0.3)]",
    borderColor: "border-amber-500/30",
  },
];

const HowItWorks = () => {
  return (
    <section
      className="py-28 px-4 relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, #0B1020 0%, #0d0f1e 50%, #0B1020 100%)" }}
    >
      {/* Background orb */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-violet-900/5 blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 mb-6">
            <span className="text-sm text-blue-300 font-medium">🚀 Simple Process</span>
          </div>
          <h2
            className="font-extrabold text-white mb-4"
            style={{
              fontSize: "clamp(2rem, 4vw, 2.8rem)",
              fontFamily: "'Poppins', sans-serif",
              letterSpacing: "-0.02em",
            }}
          >
            How{" "}
            <span className="gradient-text-primary">SkillBridge AI</span>
            {" "}Works
          </h2>
          <p className="text-slate-200 text-lg max-w-2xl mx-auto">
            From posting to hiring in minutes — our AI handles the heavy lifting so you can focus on building.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Center Line */}
          <div className="hidden lg:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-violet-500/30 to-transparent" />

          <div className="space-y-12 lg:space-y-0">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isLeft = index % 2 === 0;
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, x: isLeft ? -40 : 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.7, delay: index * 0.1 }}
                  className={`relative grid lg:grid-cols-2 gap-8 items-center ${index > 0 ? "lg:mt-16" : ""}`}
                >
                  {/* Content */}
                  <div className={`${isLeft ? "lg:text-right lg:pr-16" : "lg:order-2 lg:pl-16"}`}>
                    <motion.div
                      whileHover={{ y: -4 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className={`inline-block rounded-3xl bg-white/[0.05] backdrop-blur-sm border ${step.borderColor} p-6 hover:bg-white/[0.08] transition-all duration-300 cursor-pointer`}
                    >
                      <div className={`flex items-center gap-3 mb-3 ${isLeft ? "lg:flex-row-reverse" : ""}`}>
                        <div
                          className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center ${step.glow}`}
                        >
                          <Icon className="w-5 h-5 text-white" strokeWidth={1.5} />
                        </div>
                        <span
                          className="text-3xl font-black bg-gradient-to-r from-white/20 to-white/5 bg-clip-text text-transparent"
                          style={{ fontFamily: "'Poppins', sans-serif" }}
                        >
                          {step.number}
                        </span>
                      </div>
                      <h3
                        className="text-white font-bold text-xl mb-2"
                        style={{ fontFamily: "'Poppins', sans-serif" }}
                      >
                        {step.title}
                      </h3>
                      <p className="text-slate-200 text-sm leading-relaxed">
                        {step.description}
                      </p>
                    </motion.div>
                  </div>

                  {/* Center dot */}
                  <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-[#0B1020] border-2 border-violet-500/50 items-center justify-center z-10">
                    <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${step.color}`} />
                  </div>

                  {/* Empty right/left side */}
                  <div className={`hidden lg:block ${isLeft ? "lg:order-2" : "lg:order-1"}`} />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
