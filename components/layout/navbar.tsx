import Link from "next/link";
import { BarChart3, LogIn, UserRoundPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
            <BarChart3 className="h-5 w-5" />
          </div>
          VoteCampus
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          <Link href="/">Accueil</Link>
          <Link href="/elections">Élections</Link>
          <Link href="/profile">Profil</Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="outline" className="gap-2">
              <LogIn className="h-4 w-4" />
              Se connecter
            </Button>
          </Link>
          <Link href="/register">
            <Button className="gap-2">
              <UserRoundPlus className="h-4 w-4" />
              Créer un compte
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
