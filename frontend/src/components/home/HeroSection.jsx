import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, Sparkles, Play, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";


const techBadges = [
  { label: "React", color: "from-cyan-500/20 to-cyan-600/20", border: "border-cyan-500/30", text: "text-cyan-300", icon: "⚛️" },
  { label: "Node.js", color: "from-green-500/20 to-green-600/20", border: "border-green-500/30", text: "text-green-300", icon: "⬡" },
  { label: "Python", color: "from-yellow-500/20 to-yellow-600/20", border: "border-yellow-500/30", text: "text-yellow-300", icon: "🐍" },
  { label: "MongoDB", color: "from-emerald-500/20 to-emerald-600/20", border: "border-emerald-500/30", text: "text-emerald-300", icon: "🍃" },
  { label: "AWS", color: "from-orange-500/20 to-orange-600/20", border: "border-orange-500/30", text: "text-orange-300", icon: "☁️" },
  { label: "Docker", color: "from-blue-500/20 to-blue-600/20", border: "border-blue-500/30", text: "text-blue-300", icon: "🐳" },
  { label: "Gemini AI", color: "from-violet-500/20 to-violet-600/20", border: "border-violet-500/30", text: "text-violet-300", icon: "✦" },
];

const companies = [
  { name: "Google", logo: "G" },
  { name: "Microsoft", logo: "M" },
  { name: "Meta", logo: "f" },
  { name: "Apple", logo: "A" },
  { name: "Stripe", logo: "S" },
];

const metrics = [
  { label: "Skill Compatibility", value: 95, color: "from-violet-500 to-violet-400" },
  { label: "Experience Match", value: 88, color: "from-blue-500 to-blue-400" },
  { label: "Budget Alignment", value: 92, color: "from-cyan-500 to-cyan-400" },
  { label: "Timeline Fit", value: 85, color: "from-emerald-500 to-emerald-400" },
];

const Particles = () => {
  const particles = Array.from({ length: 25 }, (_, i) => i);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{
            background: i % 3 === 0 ? "#7C3AED" : i % 3 === 1 ? "#2563EB" : "#A855F7",
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: Math.random() * 0.6 + 0.2,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: Math.random() * 4 + 3,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

const AnimatedProgressBar = ({ label, value, color, delay }) => {
  const [started, setStarted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setStarted(true), delay * 200 + 800);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs text-slate-300 font-medium">{label}</span>
        <span className="text-xs font-bold text-white">{value}%</span>
      </div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${color}`}
          initial={{ width: 0 }}
          animate={{ width: started ? `${value}%` : 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};

const HeroSection = () => {
  const containerRef = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  const rotateX = useTransform(springY, [-0.5, 0.5], [5, -5]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-5, 5]);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-screen flex items-center overflow-hidden pt-24 pb-16 px-4"
      style={{ background: "#0b0f19" }}
    >
      {/* Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-violet-900/5 blur-[100px]" />
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <Particles />

      <div className="max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* LEFT SIDE */}
          <div className="space-y-8">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/30 backdrop-blur-sm">
                <Sparkles className="w-4 h-4 text-violet-400" />
                <span className="text-sm text-violet-300 font-medium">
                  ✨ AI Powered Freelance Marketplace
                </span>
              </div>
            </motion.div>

            {/* Heading */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <h1
                className="font-extrabold leading-tight"
                style={{ fontSize: "clamp(2.8rem, 5vw, 4.5rem)", fontFamily: "'Poppins', sans-serif", letterSpacing: "-0.02em" }}
              >
                <span className="text-white">Find the Perfect</span>
                <br />
                <span className="text-white">Talent, Powered by</span>
                <br />
                <span className="gradient-text-primary">Artificial Intelligence</span>
              </h1>
            </motion.div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-slate-200 text-lg leading-relaxed max-w-xl font-medium"
            >
              Connect clients and freelancers with intelligent AI matching, instant hiring,
              real-time collaboration and secure payments. The future of work is here.
            </motion.p>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="flex flex-wrap gap-4"
            >
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-7 py-3.5 rounded-2xl text-white font-semibold text-base bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 shadow-[0_0_30px_rgba(124,58,237,0.4)] hover:shadow-[0_0_50px_rgba(124,58,237,0.6)] transition-all duration-300"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </Link>
              <Link to="/projects">
                <motion.button
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-7 py-3.5 rounded-2xl text-white font-semibold text-base bg-white/10 border border-white/20 backdrop-blur-sm hover:bg-white/20 hover:border-white/30 transition-all duration-300"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Explore Marketplace
                </motion.button>
              </Link>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3 flex-wrap">
                {[
                  "10K+ Freelancers",
                  "98% Success Rate",
                  "AI-Powered Matching",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm text-slate-300">{item}</span>
                  </div>
                ))}
              </div>

              {/* Trusted by */}
              <div>
                <p className="text-xs text-slate-300/60 uppercase tracking-widest font-semibold mb-3">
                  Trusted by teams at
                </p>
                <div className="flex items-center gap-4 flex-wrap">
                  {companies.map((c) => (
                    <div
                      key={c.name}
                      className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-300 font-semibold hover:bg-white/10 hover:text-white transition-all duration-200"
                    >
                      {c.name}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* RIGHT SIDE — Animated Dashboard */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            <motion.div
              style={{ rotateX, rotateY, perspective: 1000 }}
              className="relative"
            >
              {/* Main Card */}
              <div className="relative rounded-3xl bg-white/[0.06] backdrop-blur-2xl border border-white/10 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.5)] hover:border-violet-500/30 transition-all duration-500">
                {/* Glow inside */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-600/5 to-blue-600/5 pointer-events-none" />

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.4)]">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">Live AI Match</p>
                      <p className="text-slate-300 text-xs">Real-time Analysis</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs text-emerald-400 font-medium">Active</span>
                  </div>
                </div>

                {/* AI Score Circle */}
                <div className="flex items-center justify-center mb-6">
                  <div className="relative">
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.8, duration: 0.6, type: "spring" }}
                      className="w-36 h-36 rounded-full flex flex-col items-center justify-center"
                      style={{
                        background: "conic-gradient(from -90deg, #7C3AED 0%, #2563EB 95%, #ffffff10 95%)",
                        padding: "3px",
                      }}
                    >
                      <div className="w-full h-full rounded-full bg-[#0B1020] flex flex-col items-center justify-center shadow-[0_0_30px_rgba(124,58,237,0.3)]">
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1.2 }}
                          className="text-4xl font-black text-white"
                          style={{ fontFamily: "'Poppins', sans-serif" }}
                        >
                          95%
                        </motion.span>
                        <span className="text-xs text-slate-300 font-medium">AI Score</span>
                      </div>
                    </motion.div>
                    {/* Glow ring */}
                    <div className="absolute inset-0 rounded-full blur-xl bg-violet-600/20 -z-10" />
                  </div>
                </div>

                {/* Progress Bars */}
                <div className="space-y-3 mb-6">
                  {metrics.map((m, i) => (
                    <AnimatedProgressBar
                      key={m.label}
                      label={m.label}
                      value={m.value}
                      color={m.color}
                      delay={i}
                    />
                  ))}
                </div>

                {/* Success Probability */}
                <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-3 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm text-emerald-300 font-medium">
                        Success Probability
                      </span>
                    </div>
                    <span className="text-emerald-400 font-bold">97%</span>
                  </div>
                </div>

                {/* Tech Badges */}
                <div className="flex flex-wrap gap-2">
                  {techBadges.map((badge, i) => (
                    <motion.div
                      key={badge.label}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1 + i * 0.1, type: "spring", stiffness: 300 }}
                      whileHover={{ scale: 1.1, y: -2 }}
                      className={`px-2.5 py-1 rounded-xl bg-gradient-to-r ${badge.color} border ${badge.border} ${badge.text} text-xs font-semibold flex items-center gap-1 cursor-pointer`}
                    >
                      <span>{badge.icon}</span>
                      {badge.label}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Floating mini cards */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-6 -right-6 rounded-2xl bg-white/[0.08] backdrop-blur-xl border border-white/15 p-3 shadow-[0_10px_30px_rgba(0,0,0,0.4)]"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white">
                    AI
                  </div>
                  <div>
                    <p className="text-xs text-white font-semibold">Match Found!</p>
                    <p className="text-xs text-slate-300">Sarah J. — 95%</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-4 -left-6 rounded-2xl bg-white/[0.08] backdrop-blur-xl border border-white/15 p-3 shadow-[0_10px_30px_rgba(0,0,0,0.4)]"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">⚡</span>
                  <div>
                    <p className="text-xs text-white font-semibold">Hired in 2 hrs</p>
                    <p className="text-xs text-slate-300">Avg. hiring time</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
