import { Star, ShieldCheck, MapPin } from "lucide-react";

const ClientInfo = ({ client }) => {
  const name = client?.name || "Premium Client";
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const rating = client?.rating || 4.9;
  const location = client?.location || client?.country || "United States";
  const isVerified = client?.isVerified !== false;

  return (
    <div className="flex items-center gap-3">
      {/* Avatar */}
      <div className="relative shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-md border border-white/10">
          {initials}
        </div>
        {isVerified && (
          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center ring-2 ring-[#1E293B]">
            <ShieldCheck className="w-2.5 h-2.5 text-white" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-white text-xs font-semibold truncate max-w-[120px]">
            {name}
          </span>
          {isVerified && (
            <span className="inline-flex items-center text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              Verified
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-300 mt-0.5">
          <div className="flex items-center gap-0.5 text-amber-400 font-semibold">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>{rating}</span>
          </div>
          <span className="text-slate-500">•</span>
          <div className="flex items-center gap-1 text-slate-300 truncate">
            <MapPin className="w-3 h-3 text-slate-400" />
            <span className="truncate">{location}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientInfo;
