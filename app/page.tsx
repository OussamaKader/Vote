import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@supabase/supabase-js";
import { ArrowRight, CheckCircle2, BarChart2, Vote, Flag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ElectionCard } from "@/components/elections/election-card";
import { Navbar } from "@/components/layout/navbar";
import { getCurrentProfile } from "@/lib/auth/session";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function Home() {
  console.log("========== HOME DEBUG ==========");

  const profile = await getCurrentProfile();

  console.log("HOME - PROFILE:", profile);

  if (!profile) {
    console.log("HOME - NO PROFILE -> REDIRECT LOGIN");
    redirect("/login");
  }

  console.log("HOME - USER ID:", profile.id);
  console.log("HOME - USER ROLE:", profile.role);
  console.log("HOME - USER ACTIVE:", profile.is_active);

  if (profile.role === "admin") {
    console.log("HOME - ADMIN -> REDIRECT ADMIN");
    redirect("/admin");
  }

  console.log("HOME - REGULAR USER -> LOAD HOME");

  const supabase = await createServerSupabaseClient();

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: elections = [], error: electionsError } =
    await supabase
      .from("elections")
      .select("*, lists(*)")
      .order("start_date", { ascending: false });

  console.log("HOME - ELECTIONS:", elections);
  console.log("HOME - ELECTIONS ERROR:", electionsError);

  // Service role pour bypasser la RLS
  const { count: totalVotes, error: votesError } =
    await supabaseAdmin
      .from("votes")
      .select("*", {
        count: "exact",
        head: true,
      });

  console.log("HOME - TOTAL VOTES:", totalVotes);
  console.log("HOME - VOTES ERROR:", votesError);

  const openElections = (elections ?? []).filter(
    (e) => e.status === "active",
  );

  const upcomingElections = (elections ?? []).filter(
    (e) => e.status === "upcoming",
  );

  const finishedElections = (elections ?? []).filter(
    (e) => e.status === "finished",
  );

  console.log("HOME - OPEN ELECTIONS:", openElections.length);
  console.log(
    "HOME - UPCOMING ELECTIONS:",
    upcomingElections.length,
  );
  console.log(
    "HOME - FINISHED ELECTIONS:",
    finishedElections.length,
  );

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />

      <main className="mx-auto flex-1 max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="rounded-[32px] bg-gradient-to-br from-blue-950 via-blue-800 to-blue-600 px-6 py-12 text-white shadow-xl sm:px-10 lg:px-12">
          <div className="grid items-center gap-8 lg:grid-cols-[1.3fr_0.7fr]">
            <div>
              <Badge className="mb-4 border-white/20 bg-white/10 text-white">
                Plateforme de vote sécurisée
              </Badge>

              <h1 className="max-w-xl text-4xl font-bold tracking-tight sm:text-5xl">
                Votez simplement, rapidement et en toute confiance.
              </h1>

              <p className="mt-4 max-w-xl text-base text-blue-100 sm:text-lg">
                Une solution moderne pour organiser des élections
                transparentes, sécurisées et conformes à la réglementation.
              </p>
            </div>

            <Card className="border-white/15 bg-white/10 p-5 text-white backdrop-blur-sm">
              <CardContent className="space-y-4 p-0">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-white/10 p-2">
                    <Vote className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-sm text-blue-100">
                      Élections actives
                    </p>

                    <p className="text-2xl font-bold">
                      {openElections.length}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-white/10 p-2">
                    <BarChart2 className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-sm text-blue-100">
                      Votes enregistrés
                    </p>

                    <p className="text-2xl font-bold">
                      {totalVotes ?? 0}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-white/10 p-2">
                    <Flag className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-sm text-blue-100">
                      Élections terminées
                    </p>

                    <p className="text-2xl font-bold">
                      {finishedElections.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}