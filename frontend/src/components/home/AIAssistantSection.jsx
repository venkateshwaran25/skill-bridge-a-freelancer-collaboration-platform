import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Send, Sparkles, ArrowRight, Zap, X } from "lucide-react";

const suggestions = [
  { label: "Generate Proposal", icon: "📝", prompt: "Help me write a winning proposal for a React developer role" },
  { label: "Estimate Budget", icon: "💰", prompt: "What should I charge for building a full-stack web app?" },
  { label: "Suggest Team", icon: "👥", prompt: "What roles do I need for a mobile app project?" },
  { label: "Improve Resume", icon: "📄", prompt: "How can I improve my freelance developer profile?" },
];

const sampleResponses = {
  "Generate Proposal": "I'll help you craft a compelling proposal! Start by addressing the client's specific pain points, showcase 2-3 relevant projects, and clearly state your timeline and deliverables. Would you like me to generate a template? 🚀",
  "Estimate Budget": "For a full-stack web app, typical ranges are: Simple (MVP): $3K–$8K, Medium complexity: $8K–$25K, Enterprise: $25K+. Factors include timeline, tech stack, and team size. Want a detailed breakdown?",
  "Suggest Team": "For a mobile app, you'll typically need: 1 Product Manager, 2 Mobile Devs (iOS/Android or React Native), 1 Backend Dev, 1 UI/UX Designer, and 1 QA Engineer. Want me to help find them on SkillBridge?",
  "Improve Resume": "Here are 5 quick wins for your profile: ✅ Add quantified achievements, ✅ Include a strong headline with your specialty, ✅ Showcase your top 3 projects with results, ✅ Add client testimonials, ✅ List certifications. Want a full profile review?",
};

const AIAssistantSection = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "👋 Hi! I'm SkillBridge AI Assistant. Ask me anything about finding talent, pricing projects, writing proposals, or building your team!",
    },
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: msg }]);
    setLoading(true);

    setTimeout(() => {
      const responseKey = Object.keys(sampleResponses).find((k) =>
        msg.toLowerCase().includes(k.toLowerCase().split(" ")[0])
      );
      const response =
        sampleResponses[responseKey] ||
        "Great question! That's something our AI can definitely help with. For a full AI-powered response, try our dedicated AI Assistant page with Gemini integration. 🤖✨";
      setMessages((prev) => [...prev, { role: "assistant", text: response }]);
      setLoading(false);
    }, 1200);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <section
      className="py-28 px-4 relative overflow-hidden"
      style={{ background: "#0B1020" }}
    >
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] rounded-full bg-violet-600/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-blue-600/5 blur-[120px]" />
      </div>

      <div className="max-w-5xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left — Info */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/30">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span className="text-sm text-violet-300 font-medium">
                Gemini AI Powered
              </span>
            </div>

            <h2
              className="font-extrabold text-white"
              style={{
                fontSize: "clamp(2rem, 4vw, 2.8rem)",
                fontFamily: "'Poppins', sans-serif",
                letterSpacing: "-0.02em",
              }}
            >
              Your Personal{" "}
              <span className="gradient-text-primary">AI Assistant</span>
            </h2>

            <p className="text-slate-200 text-lg leading-relaxed">
              Get instant help with proposals, budgeting, team building, and career advice. 
              Our AI is trained on thousands of successful freelance projects.
            </p>

            {/* Quick prompts */}
            <div className="space-y-3">
              <p className="text-xs text-slate-200 uppercase font-semibold tracking-wider">
                Popular Requests
              </p>
              <div className="grid grid-cols-2 gap-2">
                {suggestions.map((s) => (
                  <motion.button
                    key={s.label}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleSend(s.prompt)}
                    className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/[0.05] border border-white/10 hover:bg-violet-500/10 hover:border-violet-500/30 transition-all duration-300 text-left"
                  >
                    <span className="text-lg">{s.icon}</span>
                    <span className="text-sm text-slate-200 font-medium">
                      {s.label}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>

            <Link to="/ai-assistant">
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl text-white font-semibold bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 shadow-[0_0_25px_rgba(124,58,237,0.35)] hover:shadow-[0_0_40px_rgba(124,58,237,0.55)] transition-all duration-300"
              >
                <Zap className="w-4 h-4" />
                Open Full AI Assistant
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </Link>
          </motion.div>

          {/* Right — Chat UI */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="rounded-3xl bg-white/[0.05] backdrop-blur-xl border border-white/10 overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.4)]">
              {/* Chat Header */}
              <div className="flex items-center gap-3 p-5 border-b border-white/10 bg-white/[0.03]">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(124,58,237,0.4)]">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">
                    SkillBridge AI
                  </p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs text-emerald-400">Online</span>
                  </div>
                </div>
                <button className="ml-auto text-slate-200 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Messages */}
              <div className="p-5 space-y-4 min-h-[280px] max-h-[280px] overflow-y-auto">
                <AnimatePresence>
                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          msg.role === "user"
                            ? "bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-br-sm"
                            : "bg-white/[0.07] border border-white/10 text-slate-200 rounded-bl-sm"
                        }`}
                      >
                        {msg.text}
                      </div>
                    </motion.div>
                  ))}
                  {loading && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                    >
                      <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-white/[0.07] border border-white/10">
                        <div className="flex gap-1">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              className="w-1.5 h-1.5 rounded-full bg-violet-400"
                              animate={{ y: [0, -4, 0] }}
                              transition={{
                                duration: 0.6,
                                repeat: Infinity,
                                delay: i * 0.1,
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Input */}
              <div className="p-4 border-t border-white/10 bg-white/[0.02]">
                <div className="flex items-center gap-3 bg-white/[0.06] rounded-2xl border border-white/10 px-4 py-3 focus-within:border-violet-500/50 transition-colors duration-300">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask AI anything..."
                    className="flex-1 bg-transparent text-white placeholder-[#B3B8C5]/60 text-sm outline-none"
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleSend()}
                    className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center hover:shadow-[0_0_15px_rgba(124,58,237,0.4)] transition-all duration-300"
                  >
                    <Send className="w-3.5 h-3.5 text-white" />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AIAssistantSection;
