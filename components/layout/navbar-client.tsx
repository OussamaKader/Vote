"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, House, Menu, Vote, X } from "lucide-react";
import { useState } from "react";

type SessionUser = {
  userId?: string;
  role?: string;
} | null;

const desktopLinks = [
  { href: "/", label: "Accueil", icon: House },
  { href: "/elections", label: "Élections", icon: Vote },
];

export function NavbarClient({ sessionUser }: { sessionUser: SessionUser }) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-xl shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-3 md:justify-center">

          <Link
            href="/"
            className="flex min-w-0 items-center gap-2.5 text-slate-900 md:absolute md:left-4 md:gap-3"
          >
            {/* Logo */}
            {/* Logo */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center sm:h-12 sm:w-12">
              <img
                src="/logo.png"
                alt="AEM Logo"
                className="h-full w-full object-contain drop-shadow-sm"
              />
            </div>

            {/* Nom + description */}
            <div className="min-w-0 leading-none">
              <div className="text-[15px] font-bold tracking-tight sm:text-base md:text-lg">
                AEM-MAROC
              </div>
              <div className="mt-0.5 text-[8px] font-medium leading-[1.4] tracking-wide text-slate-500 sm:text-[9px] md:text-[10px]">
                <span className="block">Association des Étudiants</span>
                <span className="block">Mauritaniens au Maroc</span>
              </div>
            </div>
          </Link>
          <nav className="hidden items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1 md:flex md:absolute md:left-1/2 md:-translate-x-1/2">
            {desktopLinks.map(({ href, label }) => {
              const active = isActive(href);

              return (
                <Link
                  key={href}
                  href={href}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${active
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : "text-gray-600 hover:text-blue-600"
                    }`}
                >
                  {label}
                </Link>
              );
            })}
            {sessionUser && (
              <Link
                href="/profile"
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${isActive("/profile")
                  ? "bg-blue-50 text-blue-600 font-semibold"
                  : "text-gray-600 hover:text-blue-600"
                  }`}
              >
                Profil
              </Link>
            )}
          </nav>



          <button
            type="button"
            aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            onClick={() => setIsMenuOpen((current) => !current)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm md:hidden"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {isMenuOpen ? (
          <div className="space-y-2 border-t border-slate-200 bg-white py-3 md:hidden">
            {desktopLinks.map(({ href, label }) => {
              const active = isActive(href);

              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block rounded-xl px-3 py-2.5 text-sm font-medium transition ${active ? "bg-blue-50 text-blue-600 font-semibold" : "text-gray-600 hover:text-blue-600"
                    }`}
                >
                  {label}
                </Link>
              );
            })}
            {sessionUser && (
              <Link
                href="/profile"
                onClick={() => setIsMenuOpen(false)}
                className={`block rounded-xl px-3 py-2.5 text-sm font-medium transition ${isActive("/profile") ? "bg-blue-50 text-blue-600 font-semibold" : "text-gray-600 hover:text-blue-600"
                  }`}
              >
                Profil
              </Link>
            )}
          </div>
        ) : null}
      </div>
    </header>
  );
}
