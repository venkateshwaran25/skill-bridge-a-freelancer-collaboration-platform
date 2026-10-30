import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Send, Mail, ArrowRight } from "lucide-react";

const TwitterIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const GithubIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const LinkedinIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.72a1.47 1.47 0 1 0 0 2.94 1.47 1.47 0 0 0 0-2.94z" />
  </svg>
);

const YoutubeIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const footerLinks = {
  Product: [
    { label: "Projects", to: "/projects" },
    { label: "Network", to: "/network" },
    { label: "Feed", to: "/feed" },
    { label: "Showcase", to: "/showcase" },
    { label: "AI Match", to: "/ai-match" },
    { label: "AI Assistant", to: "/ai-assistant" },
  ],
  Resources: [
    { label: "Documentation", to: "#" },
    { label: "API Reference", to: "#" },
    { label: "Blog", to: "#" },
    { label: "Case Studies", to: "#" },
    { label: "Changelog", to: "#" },
  ],
  Community: [
    { label: "Discord Server", to: "#" },
    { label: "GitHub", to: "#" },
    { label: "Twitter/X", to: "#" },
    { label: "LinkedIn", to: "#" },
    { label: "Newsletter", to: "#" },
  ],
  Company: [
    { label: "About", to: "#" },
    { label: "Careers", to: "#" },
    { label: "Privacy Policy", to: "#" },
    { label: "Terms of Service", to: "#" },
    { label: "Contact", to: "#" },
  ],
};

const socialLinks = [
  { Icon: TwitterIcon, href: "#", label: "Twitter" },
  { Icon: GithubIcon, href: "#", label: "GitHub" },
  { Icon: LinkedinIcon, href: "#", label: "LinkedIn" },
  { Icon: YoutubeIcon, href: "#", label: "YouTube" },
];

const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) { setSubscribed(true); setEmail(""); }
  };

  return (
    <footer
      className="relative overflow-hidden"
      style={{ background: "var(--bg-secondary)", borderTop: "1px solid var(--border-color)" }}
    >
      {/* Top accent line */}
      <div className="h-0.5" style={{ background: "linear-gradient(90deg, transparent, var(--primary-mid), transparent)" }} />

      <div className="max-w-7xl mx-auto px-4 pt-16 pb-10">
        {/* Top section */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 mb-14">
          {/* Brand */}
          <div className="lg:col-span-2 space-y-6">
            <Link to="/" className="flex items-center no-underline">
              <span
                className="font-bold text-xl tracking-tight"
                style={{ fontFamily: "'Lora', Georgia, serif", color: "var(--text-main)" }}
              >
                SkillBridge
              </span>
            </Link>

            <p className="text-sm leading-relaxed max-w-sm" style={{ color: "var(--text-muted)" }}>
              The professional AI network for freelancers to showcase verified work, match with top
              projects, and collaborate in digital workplaces.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-2">
              {socialLinks.map(({ Icon, href, label }) => (
                <motion.a
                  key={label}
                  href={href}
                  aria-label={label}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-9 h-9 rounded-xl flex items-center justify-center no-underline transition-all duration-300"
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-color)",
                    color: "var(--text-muted)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--primary-soft)";
                    e.currentTarget.style.borderColor = "var(--primary-mid)";
                    e.currentTarget.style.color = "var(--primary-dark)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "var(--bg-card)";
                    e.currentTarget.style.borderColor = "var(--border-color)";
                    e.currentTarget.style.color = "var(--text-muted)";
                  }}
                >
                  <Icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>

            {/* Newsletter */}
            <div>
              <p className="text-sm font-semibold mb-3 flex items-center gap-2"
                style={{ color: "var(--text-main)" }}>
                <Mail className="w-4 h-4" style={{ color: "var(--primary)" }} />
                Stay in the loop
              </p>
              {subscribed ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-sm"
                  style={{ color: "#059669" }}
                >
                  ✅ Thanks for subscribing! You're awesome.
                </motion.div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-300"
                    style={{
                      background: "var(--bg-card)",
                      border: "1px solid var(--border-color)",
                      color: "var(--text-main)",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--border-color)")}
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="px-4 py-2.5 rounded-xl text-white transition-all duration-300"
                    style={{
                      background: "linear-gradient(135deg, var(--primary), var(--primary-light))",
                      boxShadow: "var(--shadow-amber)",
                    }}
                  >
                    <Send className="w-4 h-4" />
                  </motion.button>
                </form>
              )}
            </div>
          </div>

          {/* Footer Links */}
          <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <p
                  className="font-semibold text-sm mb-4"
                  style={{ color: "var(--text-main)", fontFamily: "'Lora', serif" }}
                >
                  {category}
                </p>
                <ul className="space-y-2.5">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.to}
                        className="text-sm transition-colors duration-200 no-underline hover:translate-x-0.5 inline-block"
                        style={{ color: "var(--text-muted)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--primary-dark)")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl p-8 mb-12 flex flex-col sm:flex-row items-center justify-between gap-6"
          style={{
            background: "linear-gradient(135deg, var(--primary-soft) 0%, #FEF9EE 100%)",
            border: "1px solid var(--primary-mid)",
          }}
        >
          <div>
            <h3
              className="font-bold text-xl mb-1"
              style={{ fontFamily: "'Lora', Georgia, serif", color: "var(--text-main)" }}
            >
              Ready to transform your hiring?
            </h3>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Join 15,000+ professionals already using SkillBridge
            </p>
          </div>
          <Link to="/register">
            <motion.button
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-7 py-3 rounded-2xl text-white font-semibold transition-all duration-300 shrink-0"
              style={{
                background: "linear-gradient(135deg, var(--primary), var(--primary-light))",
                boxShadow: "var(--shadow-amber)",
              }}
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </Link>
        </motion.div>

        {/* Bottom bar */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8"
          style={{ borderTop: "1px solid var(--border-color)" }}
        >
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            © 2026 SkillBridge. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <div
              className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold"
              style={{
                background: "#ECFDF5",
                border: "1px solid #A7F3D0",
                color: "#059669",
              }}
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>🍃 MongoDB Connected</span>
            </div>
            <span className="text-xs hidden md:inline" style={{ color: "var(--text-light)" }}>
              ● AI Engine Active
            </span>
          </div>
          <div className="flex items-center gap-4">
            {["Privacy", "Terms", "Cookies"].map((item) => (
              <a
                key={item}
                href="#"
                className="text-xs transition-colors duration-200 no-underline"
                style={{ color: "var(--text-muted)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-main)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
