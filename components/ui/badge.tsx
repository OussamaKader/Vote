import { cn } from "@/lib/utils";

export function Badge({
  className,
  children,
  variant = "default",
}: {
  className?: string;
  children: React.ReactNode;
  variant?: "default" | "outline";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        variant === "outline"
          ? "border border-slate-300 bg-white text-slate-700"
          : "border border-blue-200 bg-blue-50 text-blue-700",
        className,
      )}
    >
      {children}
    </span>
  );
}
