import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function StatCard({
  title,
  value,
  icon,
  className,
  progress,
}: {
  title: string;
  value: string;
  icon: ReactNode;
  className?: string;
  progress?: number;
}) {
  const safeProgress = Math.min(Math.max(progress ?? 0, 0), 100);

  return (
    <div className={cn("rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-slate-500 sm:text-sm">{title}</p>
          <p className="mt-2 text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">{value}</p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 sm:h-11 sm:w-11">{icon}</div>
      </div>

      {typeof progress === "number" ? (
        <div className="mt-3">
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-blue-600" style={{ width: `${safeProgress}%` }} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
