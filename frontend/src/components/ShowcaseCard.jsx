import { Eye, ThumbsUp, ExternalLink, Sparkles, Star } from "lucide-react";

const GithubIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const ShowcaseCard = ({ showcase, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="group rounded-3xl saas-card bg-white border border-slate-200/80 overflow-hidden shadow-sm hover:border-indigo-200 transition-all duration-300 flex flex-col justify-between cursor-pointer"
    >
      {/* Visual Cover Image */}
      <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
        <img
          src={
            showcase.coverImage ||
            "https://images.unsplash.com/photo-1556742049-0a67568d049f?auto=format&fit=crop&w=800&q=80"
          }
          alt={showcase.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Category Pill */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md border border-slate-200 text-[#635BFF] text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
          {showcase.category || "Web Development"}
        </div>

        {/* Live Demo Quick Action */}
        {showcase.demoUrl && (
          <a
            href={showcase.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="absolute top-3 right-3 bg-[#635BFF] hover:bg-[#5249ea] text-white p-2 rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition-all no-underline"
            title="Open Live Demo"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Demo</span>
          </a>
        )}
      </div>

      {/* Body Info */}
      <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900 line-clamp-1 group-hover:text-[#635BFF] transition-colors">
              {showcase.title}
            </h3>
          </div>

          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {showcase.description}
          </p>

          {/* Tech Stack Chips */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {showcase.techStack?.slice(0, 4).map((tech) => (
              <span
                key={tech}
                className="px-2.5 py-0.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-semibold"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Author & Footer Metrics */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#635BFF] text-white flex items-center justify-center text-xs font-bold shadow-sm">
              {showcase.author?.name?.[0]?.toUpperCase() || "A"}
            </div>
            <span className="text-slate-900 font-bold text-xs truncate max-w-[110px]">
              {showcase.author?.name || "Author"}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs font-medium">
            {showcase.githubUrl && (
              <a
                href={showcase.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-slate-500 hover:text-slate-900 transition-colors"
                title="View GitHub Repository"
              >
                <GithubIcon className="w-4 h-4" />
              </a>
            )}

            <span className="flex items-center gap-1 text-slate-600">
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              {showcase.views || 480}
            </span>

            <span className="flex items-center gap-1 text-[#635BFF] font-bold">
              <ThumbsUp className="w-3.5 h-3.5" />
              {Array.isArray(showcase.likes) ? showcase.likes.length : showcase.likes || 32}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowcaseCard;
