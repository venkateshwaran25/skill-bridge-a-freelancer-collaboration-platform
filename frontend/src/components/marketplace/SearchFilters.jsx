import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Sparkles,
  SlidersHorizontal,
  Globe,
  Briefcase,
  DollarSign,
  X,
  ChevronDown,
} from "lucide-react";
import SkillChip from "./SkillChip";

const SearchFilters = ({
  search,
  setSearch,
  categoryFilter,
  setCategoryFilter,
  skillFilter,
  setSkillFilter,
  categories,
  popularSkills,
  budgetRange,
  setBudgetRange,
  experienceLevel,
  setExperienceLevel,
  remoteOnly,
  setRemoteOnly,
  aiMatchOnly,
  setAiMatchOnly,
  onResetFilters,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const experiences = ["All Levels", "Entry Level", "Intermediate", "Expert"];
  const locations = ["All Locations", "Worldwide / Remote", "North America", "Europe", "Asia Pacific"];

  return (
    <div className="rounded-[24px] bg-[#1E293B]/70 backdrop-blur-xl border border-white/[0.08] p-5 sm:p-7 shadow-[0_15px_40px_rgba(0,0,0,0.5)] mb-8">
      {/* Top Search Bar Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 mb-4">
        {/* Search Input */}
        <div className="lg:col-span-6 relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
            <Search className="w-5 h-5 text-violet-400" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects by keyword, title, or skills..."
            className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-slate-900/80 border border-white/10 focus:border-violet-500 focus:bg-slate-900 text-white placeholder-slate-400 text-sm outline-none transition-all duration-200 shadow-inner"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Dropdown */}
        <div className="lg:col-span-4 relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
            <Briefcase className="w-4 h-4 text-blue-400" />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full pl-10 pr-8 py-3.5 rounded-2xl bg-slate-900/80 border border-white/10 focus:border-violet-500 text-white text-sm outline-none appearance-none cursor-pointer transition-all duration-200"
          >
            {categories.map((cat, idx) => (
              <option key={idx} value={cat} className="bg-slate-900 text-white py-2">
                {cat}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

        {/* Toggle Advanced Filters Button */}
        <div className="lg:col-span-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`w-full h-full py-3.5 px-4 rounded-2xl border flex items-center justify-center gap-2 text-sm font-semibold transition-all duration-200 cursor-pointer ${
              showAdvanced || budgetRange > 0 || remoteOnly || aiMatchOnly || experienceLevel
                ? "bg-violet-600/20 border-violet-500/50 text-violet-300 shadow-[0_0_15px_rgba(124,58,237,0.3)]"
                : "bg-slate-900/80 border-white/10 text-slate-200 hover:text-white hover:bg-slate-800"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
            {(budgetRange > 0 || remoteOnly || aiMatchOnly) && (
              <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
            )}
          </motion.button>
        </div>
      </div>

      {/* Advanced Filter Collapsible Section */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-t border-white/10 pt-4 mt-2"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
              {/* Budget Range Slider */}
              <div className="space-y-2 bg-slate-900/50 p-3.5 rounded-2xl border border-white/5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300 font-medium flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                    Min Budget
                  </span>
                  <span className="text-amber-400 font-bold">${budgetRange || 0}+</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10000"
                  step="500"
                  value={budgetRange || 0}
                  onChange={(e) => setBudgetRange(Number(e.target.value))}
                  className="w-full accent-violet-500 cursor-pointer"
                />
              </div>

              {/* Experience Level Dropdown */}
              <div className="space-y-1.5 bg-slate-900/50 p-3.5 rounded-2xl border border-white/5">
                <label className="text-xs text-slate-300 font-medium block">Experience Level</label>
                <select
                  value={experienceLevel || "All Levels"}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white outline-none cursor-pointer"
                >
                  {experiences.map((exp) => (
                    <option key={exp} value={exp}>
                      {exp}
                    </option>
                  ))}
                </select>
              </div>

              {/* AI Match Only Toggle */}
              <div
                onClick={() => setAiMatchOnly(!aiMatchOnly)}
                className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all duration-200 ${
                  aiMatchOnly
                    ? "bg-violet-600/20 border-violet-500/50 text-white"
                    : "bg-slate-900/50 border-white/5 text-slate-300 hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-violet-400" />
                  <span className="text-xs font-semibold">90%+ AI Match</span>
                </div>
                <div
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                    aiMatchOnly ? "bg-violet-600" : "bg-slate-700"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      aiMatchOnly ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </div>
              </div>

              {/* Remote Only Toggle */}
              <div
                onClick={() => setRemoteOnly(!remoteOnly)}
                className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all duration-200 ${
                  remoteOnly
                    ? "bg-blue-600/20 border-blue-500/50 text-white"
                    : "bg-slate-900/50 border-white/5 text-slate-300 hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-semibold">Remote Only</span>
                </div>
                <div
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                    remoteOnly ? "bg-blue-600" : "bg-slate-700"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      remoteOnly ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Skill Chips Row */}
      <div className="pt-3 border-t border-white/[0.06] flex items-center gap-2 flex-wrap">
        <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
          <Filter className="w-3 h-3" /> Quick Filter:
        </span>

        <SkillChip
          name="All Skills"
          active={skillFilter === ""}
          onClick={() => setSkillFilter("")}
        />

        {popularSkills.map((sk) => (
          <SkillChip
            key={sk}
            name={sk}
            active={skillFilter === sk}
            onClick={() => setSkillFilter(sk === skillFilter ? "" : sk)}
          />
        ))}

        {(search || categoryFilter !== "All Categories" || skillFilter || budgetRange > 0 || remoteOnly || aiMatchOnly) && (
          <button
            onClick={onResetFilters}
            className="ml-auto text-xs text-rose-400 hover:text-rose-300 underline font-semibold cursor-pointer"
          >
            Clear All
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchFilters;
