import { Link } from "react-router-dom";
import { brand } from "@shared/brand";
import { cn } from "../lib/utils";

type LogoProps = {
  className?: string;
  light?: boolean;
  href?: string;
};

function LogoMark({ light = false }: { light?: boolean }) {
  return (
    <svg viewBox="0 0 64 64" className="h-10 w-10" aria-hidden="true">
      <rect x="10" y="14" width="28" height="36" rx="8" fill={light ? "#ffffff" : "#08111F"} opacity="0.14" />
      <rect x="16" y="10" width="30" height="38" rx="8" fill={light ? "#7DD3FC" : "#2563EB"} opacity="0.85" />
      <rect x="24" y="18" width="30" height="38" rx="8" fill={light ? "#ECFEFF" : "#0F172A"} />
      <rect x="30" y="14" width="24" height="32" rx="6" fill={light ? "#10B981" : "#10B981"} opacity="0.92" />
      <path d="M44 18 L38 31 H45 L39 46" fill="none" stroke="#FFFFFF" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="20" y="23" width="11" height="2.5" rx="1.25" fill="#CFFAFE" />
      <rect x="20" y="29" width="9" height="2.5" rx="1.25" fill="#CFFAFE" />
      <rect x="20" y="35" width="7" height="2.5" rx="1.25" fill="#CFFAFE" />
    </svg>
  );
}

export default function Logo({ className, light = false, href = "/" }: LogoProps) {
  return (
    <Link to={href} className={cn("inline-flex items-center gap-3", className)}>
      <LogoMark light={light} />
      <div className="space-y-0.5">
        <div className={cn("font-display text-lg font-bold tracking-tight sm:text-xl", light ? "text-white" : "text-ink")}>
          {brand.name}
        </div>
        <div className={cn("text-[10px] uppercase tracking-[0.24em]", light ? "text-cyan-200" : "text-electric")}>
          Templates + Automation
        </div>
      </div>
    </Link>
  );
}
