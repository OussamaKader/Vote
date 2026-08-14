import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, Vote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ElectionCard } from "@/components/elections/election-card";
import { mockElections } from "@/lib/mock-data";
import { Navbar } from "@/components/layout/navbar";

export default function Home() {
  const openElections = mockElections.filter((e) => e.status === "open");
  const completedElections = mockElections.filter((e) => e.status === "closed");

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="rounded-[32px] bg-gradient-to-br from-blue-950 via-blue-800 to-blue-600 px-6 py-12 text-white shadow-xl sm:px-10 lg:px-12">
          <div className="grid items-center gap-8 lg:grid-cols-[1.3fr_0.7fr]">
            <div>
              <Badge className="mb-4 border-white/20 bg-white/10 text-white">Plateforme de vote sécurisée</Badge>
              <h1 className="max-w-xl text-4xl font-bold tracking-tight sm:text-5xl">
                Votez simplement, rapidement et en toute confiance.
              </h1>
              <p className="mt-4 max-w-xl text-base text-blue-100 sm:text-lg">
                Une solution moderne pour organiser les élections, suivre les résultats et garantir une participation transparente pour les étudiants.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/login">
                  <Button className="gap-2 bg-white text-blue-700 hover:bg-blue-50">Se connecter <ArrowRight className="h-4 w-4" /></Button>
                </Link>
                <Link href="/register">
                  <Button variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10">Créer un compte</Button>
                </Link>
              </div>
            </div>

            <Card className="border-white/15 bg-white/10 p-5 text-white backdrop-blur-sm">
              <CardContent className="space-y-4 p-0">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-white/10 p-2"><Vote className="h-5 w-5" /></div>
                  <div>
                    <p className="text-sm text-blue-100">Élections actives</p>
                    <p className="text-2xl font-bold">{openElections.length}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-white/10 p-2"><CheckCircle2 className="h-5 w-5" /></div>
                  <div>
                    <p className="text-sm text-blue-100">Participation</p>
                    <p className="text-2xl font-bold">86%</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-white/10 p-2"><ShieldCheck className="h-5 w-5" /></div>
                  <div>
                    <p className="text-sm text-blue-100">Sécurité</p>
                    <p className="text-lg font-medium">Supabase + RLS</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mt-10 grid gap-4 md:grid-cols-3">
          <Card className="p-5">
            <p className="text-sm text-slate-500">Élections ouvertes</p>
            <p className="mt-3 text-3xl font-bold text-slate-900">{openElections.length}</p>
          </Card>
          <Card className="p-5">
            <p className="text-sm text-slate-500">Élections terminées</p>
            <p className="mt-3 text-3xl font-bold text-slate-900">{completedElections.length}</p>
          </Card>
          <Card className="p-5">
            <p className="text-sm text-slate-500">Votants actifs</p>
            <p className="mt-3 text-3xl font-bold text-slate-900">12.4k</p>
          </Card>
        </section>

        <section className="mt-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">Élections actuellement ouvertes</h2>
            <Link href="/elections" className="text-sm font-medium text-blue-700">Voir tout</Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {openElections.map((election) => (
              <ElectionCard key={election.id} election={election} />
            ))}
          </div>
        </section>

        <section className="mt-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">Élections terminées</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {completedElections.map((election) => (
              <ElectionCard key={election.id} election={election} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
