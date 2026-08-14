"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BriefcaseBusiness, LayoutDashboard, LogOut, ShieldCheck, UserCog, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/elections", label: "Élections", icon: BriefcaseBusiness },
  { href: "/admin/users", label: "Utilisateurs", icon: Users },
  { href: "/admin/results", label: "Résultats", icon: BarChart3 },
  { href: "/admin/settings", label: "Paramètres", icon: UserCog },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-72 shrink-0 border-r border-slate-200 bg-slate-950 p-5 text-slate-100 lg:block">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Admin</p>
          <h2 className="text-lg font-semibold">VoteCampus</h2>
        </div>
      </div>

      <nav className="space-y-2">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-10 border-t border-slate-800 pt-5">
        <Button variant="ghost" className="w-full justify-start gap-2 text-slate-200 hover:bg-slate-800 hover:text-white">
          <LogOut className="h-4 w-4" />
          Déconnexion
        </Button>
      </div>
    </aside>
  );
}
