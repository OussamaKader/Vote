"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/layout/footer";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideFooter = pathname === "/login" || pathname === "/register";

  return (
    <>
      <div className="min-h-screen pb-14">{children}</div>
      {!hideFooter && <Footer />}
    </>
  );
}
