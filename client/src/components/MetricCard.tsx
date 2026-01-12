import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
  variant?: "default" | "primary" | "danger" | "success";
}

export function MetricCard({ title, value, icon: Icon, trend, trendLabel, variant = "default" }: MetricCardProps) {
  const variants = {
    default: "bg-white border-border text-foreground",
    primary: "bg-gradient-to-br from-primary to-blue-600 text-white border-transparent",
    danger: "bg-red-50 border-red-100 text-red-900",
    success: "bg-emerald-50 border-emerald-100 text-emerald-900",
  };

  const iconStyles = {
    default: "bg-primary/10 text-primary",
    primary: "bg-white/20 text-white",
    danger: "bg-red-100 text-red-600",
    success: "bg-emerald-100 text-emerald-600",
  };

  return (
    <div className={cn(
      "p-6 rounded-2xl border shadow-sm transition-all duration-300 hover:shadow-md",
      variants[variant]
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className={cn(
            "text-sm font-medium mb-1",
            variant === "primary" ? "text-blue-100" : "text-muted-foreground"
          )}>{title}</p>
          <h3 className="text-3xl font-display font-bold tracking-tight">{value}</h3>
        </div>
        <div className={cn("p-3 rounded-xl", iconStyles[variant])}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      
      {trendLabel && (
        <div className="mt-4 flex items-center gap-2 text-sm">
          <span className={cn(
            "font-medium px-2 py-0.5 rounded-full text-xs",
            trend === "down" ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700",
            variant === "primary" && "bg-white/20 text-white"
          )}>
            {trend === "up" ? "↑" : "↓"} {trendLabel}
          </span>
          <span className={cn("opacity-70", variant === "primary" && "text-blue-100")}>vs last month</span>
        </div>
      )}
    </div>
  );
}
