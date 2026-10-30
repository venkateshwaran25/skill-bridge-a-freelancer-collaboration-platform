import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

const stats = [
  {
    value: 10000,
    suffix: "+",
    label: "Freelancers",
    sublabel: "Active on platform",
    icon: "👩‍💻",
    color: "from-violet-500 to-violet-600",
    glow: "shadow-[0_0_30px_rgba(124,58,237,0.3)]",
  },
  {
    value: 5000,
    suffix: "+",
    label: "Clients",
    sublabel: "Trusted businesses",
    icon: "🏢",
    color: "from-blue-500 to-blue-600",
    glow: "shadow-[0_0_30px_rgba(37,99,235,0.3)]",
  },
  {
    value: 40000,
    suffix: "+",
    label: "Projects",
    sublabel: "Successfully completed",
    icon: "🚀",
    color: "from-cyan-500 to-cyan-600",
    glow: "shadow-[0_0_30px_rgba(6,182,212,0.3)]",
  },
  {
    value: 98,
    suffix: "%",
    label: "Success Rate",
    sublabel: "Client satisfaction",
    icon: "⭐",
    color: "from-emerald-500 to-emerald-600",
    glow: "shadow-[0_0_30px_rgba(16,185,129,0.3)]",
  },
];

function useCountUp(target, isInView, duration = 2000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target, duration]);

  return count;
}

const StatCard = ({ stat, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const count = useCountUp(stat.value, isInView);

  const formatCount = (n) => {
    if (n >= 1000) return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + "K";
    return n.toString();
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      whileHover={{ y: -6 }}
      className={`relative rounded-3xl bg-white/[0.05] backdrop-blur-sm border border-white/10 hover:border-white/20 p-8 text-center group transition-all duration-500 hover:${stat.glow}`}
    >
      {/* Gradient overlay on hover */}
      <div
        className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-[0.07] transition-opacity duration-500 pointer-events-none`}
      />

      {/* Icon */}
      <div className="text-4xl mb-4">{stat.icon}</div>

      {/* Counter */}
      <div className="relative z-10">
        <div
          className="font-black text-white leading-none mb-2"
          style={{
            fontSize: "clamp(2.5rem, 4vw, 3.5rem)",
            fontFamily: "'Poppins', sans-serif",
          }}
        >
          <span className={`bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
            {formatCount(count)}
          </span>
          <span className={`bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
            {stat.suffix}
          </span>
        </div>
        <p
          className="text-white font-bold text-xl mb-1"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          {stat.label}
        </p>
        <p className="text-slate-200 text-sm">{stat.sublabel}</p>
      </div>
    </motion.div>
  );
};

const StatsSection = () => {
  return (
    <section
      className="py-24 px-4 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #0d0f20 0%, #0B1020 50%, #0a0e1e 100%)",
      }}
    >
      {/* Decorative gradient strip */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

      {/* Background orbs */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-violet-600/5 blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-blue-600/5 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h2
            className="font-extrabold text-white mb-4"
            style={{
              fontSize: "clamp(2rem, 4vw, 2.8rem)",
              fontFamily: "'Poppins', sans-serif",
              letterSpacing: "-0.02em",
            }}
          >
            Trusted by{" "}
            <span className="gradient-text-primary">Thousands</span>{" "}
            Worldwide
          </h2>
          <p className="text-slate-200 text-lg">
            Numbers that speak for themselves
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {stats.map((stat, i) => (
            <StatCard key={stat.label} stat={stat} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
