import { motion } from "framer-motion";

const skillColors = {
  react: "bg-blue-500/15 border-blue-500/30 text-blue-300 hover:bg-blue-500/25",
  "react.js": "bg-blue-500/15 border-blue-500/30 text-blue-300 hover:bg-blue-500/25",
  python: "bg-emerald-500/15 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25",
  mongodb: "bg-green-500/15 border-green-500/30 text-green-300 hover:bg-green-500/25",
  ai: "bg-purple-500/15 border-purple-500/30 text-purple-300 hover:bg-purple-500/25",
  "ai & data science": "bg-purple-500/15 border-purple-500/30 text-purple-300 hover:bg-purple-500/25",
  "machine learning": "bg-purple-500/15 border-purple-500/30 text-purple-300 hover:bg-purple-500/25",
  "node.js": "bg-amber-500/15 border-amber-500/30 text-amber-300 hover:bg-amber-500/25",
  node: "bg-amber-500/15 border-amber-500/30 text-amber-300 hover:bg-amber-500/25",
  typescript: "bg-sky-500/15 border-sky-500/30 text-sky-300 hover:bg-sky-500/25",
  javascript: "bg-yellow-500/15 border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/25",
  figma: "bg-pink-500/15 border-pink-500/30 text-pink-300 hover:bg-pink-500/25",
  "ui/ux design": "bg-pink-500/15 border-pink-500/30 text-pink-300 hover:bg-pink-500/25",
  devops: "bg-cyan-500/15 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/25",
  aws: "bg-orange-500/15 border-orange-500/30 text-orange-300 hover:bg-orange-500/25",
};

const SkillChip = ({ name, active = false, onClick }) => {
  const normalized = (name || "").toLowerCase().trim();
  const colorClasses =
    skillColors[normalized] ||
    "bg-violet-500/15 border-violet-500/30 text-violet-300 hover:bg-violet-500/25";

  return (
    <motion.button
      whileHover={{ scale: 1.05, y: -1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      type="button"
      className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-semibold border transition-all duration-200 cursor-pointer ${
        active
          ? "bg-gradient-to-r from-violet-600 to-blue-600 border-violet-400 text-white shadow-[0_0_12px_rgba(124,58,237,0.4)]"
          : colorClasses
      }`}
    >
      #{name}
    </motion.button>
  );
};

export default SkillChip;
