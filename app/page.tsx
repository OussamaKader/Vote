import Link from "next/link";
import { redirect } from "next/navigation";
import Image from "next/image";

import { createClient } from "@supabase/supabase-js";
import { BarChart2, Vote, Flag, ShieldCheck, Scale } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/layout/navbar";
import { getCurrentProfile } from "@/lib/auth/session";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function Home() {
  const profile = await getCurrentProfile();

  if (!profile) redirect("/login");
  if (profile.role === "admin") redirect("/admin");

  const supabase = await createServerSupabaseClient();
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: elections = [] } = await supabase
    .from("elections")
    .select("*, lists(*)")
    .order("start_date", { ascending: false });

  const { count: totalVotes } = await supabaseAdmin
    .from("votes")
    .select("*", { count: "exact", head: true });

  const openElections = (elections ?? []).filter((e) => e.status === "active");
  const finishedElections = (elections ?? []).filter((e) => e.status === "finished");

  const members = [
    { photo: "/cheikh.jpg", name: "Cheikh Taleb Elemin", role: "Président", color: "blue" },
    { photo: "/moussab.jpg", name: "Dr. Moussab Sneid", role: "Vice-président", color: "violet" },
    { photo: "/Hamadi.jpg", name: "Dr. Hamadi El Wavi", role: "Rapporteur", color: "emerald" },
  ];

  const memberStyles: Record<string, { ring: string; badge: string }> = {
    blue: { ring: "ring-blue-200", badge: "bg-blue-50 text-blue-700" },
    violet: { ring: "ring-violet-200", badge: "bg-violet-50 text-violet-700" },
    emerald: { ring: "ring-emerald-200", badge: "bg-emerald-50 text-emerald-700" },
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />

      <main className="mx-auto flex-1 max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

        {/* Hero */}
        <section className="rounded-[32px] bg-gradient-to-br from-blue-950 via-blue-800 to-blue-600 px-6 py-12 text-white shadow-xl sm:px-10 lg:px-12">
          <div className="grid items-center gap-8 lg:grid-cols-[1.3fr_0.7fr]">
            <div>
              {/* Logo + Badge */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-white/30 bg-white">
                  <Image
                    src="/logo.png"
                    alt="AEM-Maroc Logo"
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
                <Badge className="border-white/20 bg-white/10 text-white">
                  AEM-MAROC
                </Badge>
              </div>

              <h1 className="max-w-xl text-4xl font-bold tracking-tight sm:text-5xl">
                Participez. Votez. Construisons ensemble notre avenir !
              </h1>
              <p className="mt-4 max-w-xl text-base text-blue-100 sm:text-lg">
                Une solution numérique moderne mise en place par l'Association des Étudiants Mauritaniens au Maroc pour organiser des élections transparentes, sécurisées et conformes à la réglementation en vigueur.
              </p>
            </div>

            <Card className="border-white/15 bg-white/10 p-5 text-white backdrop-blur-sm">
              <CardContent className="space-y-4 p-0">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-white/10 p-2">
                    <Vote className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-100">Élections actives</p>
                    <p className="text-2xl font-bold">{openElections.length}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-white/10 p-2">
                    <BarChart2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-100">Votes enregistrés</p>
                    <p className="text-2xl font-bold">{totalVotes ?? 0}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-white/10 p-2">
                    <Flag className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-100">Élections terminées</p>
                    <p className="text-2xl font-bold">{finishedElections.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Commission indépendante */}
        <section className="py-14">
          <div className="text-center mb-10">

            <h2 className="mt-3 text-2xl font-semibold text-slate-900">
              Commission indépendante des élections
            </h2>
            <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              Garante de la transparence et de l'intégrité du processus électoral de l'AEM-Maroc
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-2xl mx-auto">
            {members.map(({ photo, name, role, color }) => (
              <Card key={name} className="rounded-2xl border border-slate-100 bg-white shadow-sm text-center p-6">
                <div className={`w-20 h-20 rounded-full mx-auto mb-4 overflow-hidden ring-2 ${memberStyles[color].ring}`}>
                  <Image
                    src={photo}
                    alt={name}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <span className={`inline-block text-xs font-medium px-3 py-0.5 rounded-full mb-2 ${memberStyles[color].badge}`}>
                  {role}
                </span>
                <p className="text-sm font-medium text-slate-800 leading-snug">{name}</p>
              </Card>
            ))}
          </div>

          <div className="flex items-center justify-center gap-3 mt-8">
            <div className="h-px w-10 bg-slate-200" />
            <Scale className="h-3.5 w-3.5 text-slate-300" />
            <div className="h-px w-10 bg-slate-200" />
          </div>
          <p className="text-center mt-2 text-xs text-slate-400">
            Indépendante · Transparente · Impartiale
          </p>
        </section>

      </main>
    </div>
  );
}