import Image from "next/image";
import Link from "next/link";
import { CalendarDays, UsersRound } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/layout/navbar";
import { ElectionVote } from "@/components/voting/election-vote";
import { getCurrentProfile } from "@/lib/auth/session";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { computeElectionStatus, formatDate, getStatusLabel } from "@/lib/utils";

export default async function ElectionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  if (!profile.is_active) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <Card className="border-red-200 bg-red-50 p-8 text-center">
          <CardContent className="p-0">
            <h1 className="text-2xl font-bold text-red-700">Compte désactivé</h1>
            <p className="mt-3 text-red-600">Ce compte est désactivé.</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  const supabase = await createServerSupabaseClient();
  const { data: election } = await supabase
    .from("elections")
    .select("*, lists(*, candidates(*))")
    .eq("id", id)
    .maybeSingle();

  if (!election) {
    notFound();
  }

  const { data: vote } = profile.id
    ? await supabase
        .from("votes")
        .select("id")
        .eq("election_id", id)
        .eq("user_id", profile.id)
        .maybeSingle()
    : { data: null };

  const status = computeElectionStatus(election.start_date, election.end_date);
  const lists = election.lists ?? [];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">

        {/* En-tête élection */}
        <div className="mb-6">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-700">Élection</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">{election.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" />
              {formatDate(election.start_date)} → {formatDate(election.end_date)}
            </span>
            <span className="flex items-center gap-1.5">
              <UsersRound className="h-4 w-4" />
              {lists.length} liste{lists.length > 1 ? "s" : ""}
            </span>
            <Badge variant="outline">{getStatusLabel(status)}</Badge>
          </div>
        </div>

        {/* Grille principale */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr_0.7fr]">

          {/* Colonne gauche — listes */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Listes participantes</h2>
            {lists.map((list: any) => (
              <Card key={list.id} className="p-4">
                <div className="flex flex-col gap-4 sm:flex-row">
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                    <Image
                      src={list.logo_url || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=300&q=80"}
                      alt={list.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-semibold text-slate-900">{list.name}</h3>
                    <p className="mt-2 text-sm text-slate-600">{list.description}</p>
                    <div className="mt-4 space-y-3">
                      {(list.candidates ?? []).map((candidate: any) => (
                        <div key={candidate.id} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-slate-100">
                            <Image
                              src={candidate.photo_url || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80"}
                              alt={candidate.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-slate-900 truncate">{candidate.name}</p>
                            <p className="text-sm text-slate-500 truncate">{candidate.position}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Colonne droite — vote sticky */}
          <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            <ElectionVote
              election={election}
              hasAlreadyVoted={Boolean(vote)}
              status={status}
              userId={profile.id ?? null}
            />
          </div>
        </div>

        {/* Lien résultats */}
        {election.results_visible ? (
          <div className="mt-8 flex justify-end">
            <Link href={`/elections/${id}/results`} className="text-sm font-medium text-blue-700">
              Voir les résultats
            </Link>
          </div>
        ) : null}
      </main>
    </div>
  );
}