import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Mitchell",
    role: "CTO, TechVentures",
    company: "TechVentures Inc.",
    avatar: "SM",
    avatarColor: "from-violet-500 to-purple-600",
    rating: 5,
    text: "SkillBridge AI completely transformed how we hire. The AI matching is eerily accurate — it recommended a React developer who was a perfect cultural and technical fit. We hired them in 24 hours instead of 3 weeks.",
  },
  {
    name: "Alex Chen",
    role: "Freelance ML Engineer",
    company: "Independent",
    avatar: "AC",
    avatarColor: "from-blue-500 to-cyan-600",
    rating: 5,
    text: "The AI proposal generator helped me win 3 out of 5 projects in my first week. The platform understands what clients actually want and helps me communicate my value effectively. My income doubled in 2 months.",
  },
  {
    name: "Priya Sharma",
    role: "Product Lead, StartupAI",
    company: "StartupAI",
    avatar: "PS",
    avatarColor: "from-emerald-500 to-teal-600",
    rating: 5,
    text: "The AI Team Builder assembled our entire startup tech team in 48 hours. What normally takes recruiters months, SkillBridge AI did in 2 days with a 97% success rate on our first sprint. Absolutely game-changing.",
  },
  {
    name: "Marcus Johnson",
    role: "Full-Stack Developer",
    company: "Freelancer",
    avatar: "MJ",
    avatarColor: "from-amber-500 to-orange-600",
    rating: 5,
    text: "I was skeptical about AI job matching, but SkillBridge proved me wrong. Every project matched to me was exactly in my skill zone. The real-time chat and milestone payments are seamless. Best freelance platform period.",
  },
  {
    name: "Emma Rodriguez",
    role: "Founder, DesignFlow",
    company: "DesignFlow Studio",
    avatar: "ER",
    avatarColor: "from-pink-500 to-rose-600",
    rating: 5,
    text: "We've tried Upwork, Toptal, and Fiverr. Nothing comes close to SkillBridge AI. The quality of freelancers is exceptional, the AI-verified profiles give us confidence, and the hiring analytics help us make data-driven decisions.",
  },
];

const TestimonialsSection = () => {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length);
  const next = () => setCurrent((c) => (c + 1) % testimonials.length);

  const getVisible = () => {
    const indices = [];
    for (let i = -1; i <= 1; i++) {
      indices.push((current + i + testimonials.length) % testimonials.length);
    }
    return indices;
  };

  return (
    <section
      className="py-28 px-4 relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, #0B1020 0%, #0d0f1e 100%)" }}
    >
      {/* Background orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-violet-900/5 blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 mb-6">
            <Star className="w-4 h-4 text-amber-400 fill-current" />
            <span className="text-sm text-amber-300 font-medium">5.0 Average Rating</span>
          </div>
          <h2
            className="font-extrabold text-white mb-4"
            style={{
              fontSize: "clamp(2rem, 4vw, 2.8rem)",
              fontFamily: "'Poppins', sans-serif",
              letterSpacing: "-0.02em",
            }}
          >
            Loved by{" "}
            <span className="gradient-text-primary">Professionals</span>
          </h2>
          <p className="text-slate-200 text-lg">
            Join thousands of satisfied clients and freelancers worldwide
          </p>
        </motion.div>

        {/* Carousel */}
        <div className="relative">
          {/* Desktop: 3 cards */}
          <div className="hidden lg:flex items-stretch gap-6">
            {getVisible().map((idx, pos) => {
              const t = testimonials[idx];
              const isCenter = pos === 1;
              return (
                <motion.div
                  key={idx}
                  layout
                  animate={{
                    scale: isCenter ? 1 : 0.92,
                    opacity: isCenter ? 1 : 0.5,
                  }}
                  transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
                  className={`flex-1 rounded-3xl p-7 border transition-all duration-500 ${
                    isCenter
                      ? "bg-white/[0.08] border-violet-500/30 shadow-[0_20px_60px_rgba(124,58,237,0.2)]"
                      : "bg-white/[0.03] border-white/10"
                  }`}
                >
                  <Quote className="w-8 h-8 text-violet-400/40 mb-4" />
                  <p className="text-slate-200 text-base leading-relaxed mb-6">
                    "{t.text}"
                  </p>
                  <div className="flex items-center gap-3 mt-auto">
                    <div
                      className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${t.avatarColor} flex items-center justify-center text-white font-bold text-sm shrink-0`}
                    >
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{t.name}</p>
                      <p className="text-slate-200 text-xs">{t.role} • {t.company}</p>
                    </div>
                    <div className="ml-auto flex gap-0.5">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-current" />
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Mobile: single card */}
          <div className="lg:hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3 }}
                className="rounded-3xl bg-white/[0.08] border border-violet-500/30 p-7 shadow-[0_20px_60px_rgba(124,58,237,0.2)]"
              >
                {(() => {
                  const t = testimonials[current];
                  return (
                    <>
                      <Quote className="w-8 h-8 text-violet-400/40 mb-4" />
                      <p className="text-slate-200 text-base leading-relaxed mb-6">"{t.text}"</p>
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${t.avatarColor} flex items-center justify-center text-white font-bold text-sm shrink-0`}
                        >
                          {t.avatar}
                        </div>
                        <div>
                          <p className="text-white font-semibold text-sm">{t.name}</p>
                          <p className="text-slate-200 text-xs">{t.role}</p>
                        </div>
                        <div className="ml-auto flex gap-0.5">
                          {Array.from({ length: t.rating }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-current" />
                          ))}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-10">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={prev}
              className="w-10 h-10 rounded-2xl bg-white/10 border border-white/15 hover:bg-white/20 hover:border-white/25 flex items-center justify-center text-white transition-all duration-300"
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>

            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`transition-all duration-300 rounded-full ${
                    i === current
                      ? "w-6 h-2 bg-violet-500"
                      : "w-2 h-2 bg-white/20 hover:bg-white/40"
                  }`}
                />
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={next}
              className="w-10 h-10 rounded-2xl bg-white/10 border border-white/15 hover:bg-white/20 hover:border-white/25 flex items-center justify-center text-white transition-all duration-300"
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
