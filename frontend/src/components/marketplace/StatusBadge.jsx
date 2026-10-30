import { motion } from "framer-motion";
import { CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react";

const statusConfig = {
  open: {
    label: "Open",
    bg: "bg-emerald-500/15",
    border: "border-emerald-500/30",
    text: "text-emerald-400",
    dot: "bg-emerald-400",
    icon: CheckCircle2,
  },
  "in progress": {
    label: "In Progress",
    bg: "bg-amber-500/15",
    border: "border-amber-500/30",
    text: "text-amber-400",
    dot: "bg-amber-400",
    icon: Clock,
  },
  in_progress: {
    label: "In Progress",
    bg: "bg-amber-500/15",
    border: "border-amber-500/30",
    text: "text-amber-400",
    dot: "bg-amber-400",
    icon: Clock,
  },
  closed: {
    label: "Closed",
    bg: "bg-rose-500/15",
    border: "border-rose-500/30",
    text: "text-rose-400",
    dot: "bg-rose-400",
    icon: XCircle,
  },
  completed: {
    label: "Completed",
    bg: "bg-blue-500/15",
    border: "border-blue-500/30",
    text: "text-blue-400",
    dot: "bg-blue-400",
    icon: CheckCircle2,
  },
};

const StatusBadge = ({ status = "open" }) => {
  const normalizedStatus = (status || "open").toString().toLowerCase().trim();
  const config = statusConfig[normalizedStatus] || statusConfig.open;
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm ${config.bg} ${config.border} ${config.text}`}
    >
      <span className={`w-2 h-2 rounded-full ${config.dot} animate-pulse`} />
      <Icon className="w-3.5 h-3.5" />
      <span>{config.label}</span>
    </div>
  );
};

export default StatusBadge;
