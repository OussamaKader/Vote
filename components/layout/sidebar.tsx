"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BriefcaseBusiness, LayoutDashboard, Menu, ShieldCheck, UserCog, Users, Vote, X } from "lucide-react";
import { useState } from "react";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/elections", label: "Élections" },
  { href: "/admin/users", label: "Utilisateurs" },
  { href: "/admin/votes", label: "Votes" },
  { href: "/admin/results", label: "Résultats" },
  { href: "/admin/profile", label: "Profil" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-xl shadow-sm">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between gap-3 py-3 md:h-16 md:py-0">
          <Link href="/admin" className="flex min-w-0 items-center gap-3 text-slate-900">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center sm:h-12 sm:w-12">
              <img
                src="/logo.png"
                alt="AEM Logo"
                className="h-full w-full object-contain drop-shadow-sm"
              />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-blue-700">Admin</p>
              <span className="truncate text-base font-semibold">AEM-MAROC</span>
            </div>
          </Link>

          <nav className="hidden flex-1 justify-center md:flex">
            <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1">
              {links.map(({ href, label }) => {
                const active = isActive(href);

                return (
                  <Link
                    key={href}
                    href={href}
                    className={`rounded-full px-3 py-2 text-sm font-medium transition sm:px-4 ${
                      active ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:bg-white hover:text-blue-700"
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>
          </nav>

          <button
            type="button"
            aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
            onClick={() => setIsOpen((current) => !current)}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm md:hidden"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {isOpen ? (
          <div className="flex flex-col gap-2 border-t border-slate-200 bg-white py-3 md:hidden">
            {links.map(({ href, label }) => {
              const active = isActive(href);

              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsOpen(false)}
                  className={`w-full rounded-xl px-3 py-2.5 text-center text-sm font-medium transition ${
                    active ? "bg-blue-600 text-white" : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        ) : null}
      </div>
    </header>
  );
}
