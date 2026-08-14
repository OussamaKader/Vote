"use client";

import Image from "next/image";
import { useState } from "react";
import { CalendarDays, CheckCircle2, ShieldCheck, UsersRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { mockElections } from "@/lib/mock-data";
import { computeElectionStatus, formatDate, getStatusLabel } from "@/lib/utils";
import { useParams } from "next/navigation";

export default function ElectionDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const election = mockElections.find((entry) => entry.id === id) ?? mockElections[0];
  const status = computeElectionStatus(election.start_date, election.end_date);
  const [openDialog, setOpenDialog] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  const handleVote = () => {
    setHasVoted(true);
    setOpenDialog(false);
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-700">Élection</p>
          <h1 className="mt-2 text-4xl font-bold text-slate-900">{election.title}</h1>
        </div>
        <Badge className="bg-blue-50 text-blue-700">{getStatusLabel(status)}</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-6">
          <Card className="overflow-hidden">
            <div className="relative h-64 w-full bg-slate-100">
              <Image
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80"
                alt={election.title}
                fill
                className="object-cover"
              />
            </div>
            <CardContent className="space-y-5 p-6">
              <p className="text-slate-600">{election.description}</p>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-sm text-slate-500"><CalendarDays className="h-4 w-4 text-blue-600" /> Début</div>
                  <p className="mt-2 font-semibold text-slate-900">{formatDate(election.start_date)}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-sm text-slate-500"><CalendarDays className="h-4 w-4 text-blue-600" /> Fin</div>
                  <p className="mt-2 font-semibold text-slate-900">{formatDate(election.end_date)}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-sm text-slate-500"><UsersRound className="h-4 w-4 text-blue-600" /> Listes</div>
                  <p className="mt-2 font-semibold text-slate-900">{election.lists.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">Listes participantes</h2>
            {election.lists.map((list) => (
              <Card key={list.id} className="p-4">
                <div className="flex flex-col gap-4 sm:flex-row">
                  <div className="relative h-24 w-24 overflow-hidden rounded-xl bg-slate-100">
                    <Image src={list.logo_url} alt={list.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-semibold text-slate-900">{list.name}</h3>
                        <p className="mt-2 text-sm text-slate-600">{list.description}</p>
                      </div>
                    </div>
                    <div className="mt-4 space-y-3">
                      {list.candidates.map((candidate) => (
                        <div key={candidate.id} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                          <div className="relative h-12 w-12 overflow-hidden rounded-full bg-slate-100">
                            <Image src={candidate.photo_url} alt={candidate.name} fill className="object-cover" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{candidate.name}</p>
                            <p className="text-sm text-slate-500">{candidate.position}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <Card className="p-5">
            <h3 className="text-xl font-semibold text-slate-900">Vote</h3>

            {status === "open" && !hasVoted ? (
              <>
                <p className="mt-3 text-sm text-slate-600">Choisissez une liste ci-dessous pour valider votre vote.</p>
                <div className="mt-5 space-y-3">
                  {election.lists.map((list) => (
                    <Button key={list.id} variant="outline" className="w-full justify-between" onClick={() => setOpenDialog(true)}>
                      <span>{list.name}</span>
                      <span className="text-xs">Voter</span>
                    </Button>
                  ))}
                </div>
              </>
            ) : (
              <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                {hasVoted ? "Votre vote a été enregistré avec succès." : "L’élection n’est pas ouverte pour le vote."}
              </div>
            )}
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-blue-600" />
              <p className="font-medium text-slate-900">Protection</p>
            </div>
            <p className="mt-3 text-sm text-slate-600">Chaque utilisateur ne peut voter qu’une seule fois pour cette élection.</p>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onConfirm={handleVote}
        title="Confirmer votre vote"
        description="Êtes-vous sûr de vouloir voter pour cette liste ? Cette action ne peut pas être annulée."
      />

      {hasVoted && (
        <div className="mt-6 flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-emerald-700">
          <CheckCircle2 className="h-5 w-5" />
          Votre vote a été enregistré avec succès.
        </div>
      )}
    </main>
  );
}
