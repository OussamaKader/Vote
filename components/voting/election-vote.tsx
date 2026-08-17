"use client";

import { useState } from "react";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { castVote } from "@/lib/auth/actions";
import { getStatusLabel } from "@/lib/utils";

export function ElectionVote({
  election,
  hasAlreadyVoted,
  status,
  userId,
}: {
  election: any;
  hasAlreadyVoted: boolean;
  status: "upcoming" | "active" | "finished";
  userId?: string | null;
}) {
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVote = async () => {
    if (!selectedListId) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (!userId) {
        throw new Error("Vous devez être connecté pour voter.");
      }

      const result = await castVote(String(election.id), selectedListId, userId);

      if (result.error) {
        throw new Error(result.error);
      }

      setMessage("Votre vote a été enregistré avec succès.");
      setDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l’enregistrement du vote.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const lists = election.lists ?? [];

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-xl font-semibold text-slate-900">Vote</h3>
          <Badge className="bg-blue-50 text-blue-700">{getStatusLabel(status)}</Badge>
        </div>

        {status === "active" && !hasAlreadyVoted ? (
          <>
            <p className="mt-3 text-sm text-slate-600">Choisissez une liste ci-dessous pour valider votre vote.</p>
            <div className="mt-5 space-y-3">
              {lists.map((list: any) => (
                <Button
                  key={list.id}
                  variant={selectedListId === list.id ? "default" : "outline"}
                  className="w-full justify-between"
                  onClick={() => {
                    setSelectedListId(list.id);
                    setDialogOpen(true);
                  }}
                >
                  <span>{list.name}</span>
                  <span className="text-xs">Voter</span>
                </Button>
              ))}
            </div>
          </>
        ) : (
          <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
            {hasAlreadyVoted ? "Vous avez déjà participé à cette élection." : "L’élection n’est pas ouverte pour le vote."}
          </div>
        )}

        {error ? <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

        {message ? (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-emerald-700">
            <CheckCircle2 className="h-5 w-5" />
            {message}
          </div>
        ) : null}
      </Card>

      <Card className="p-5">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-blue-600" />
          <p className="font-medium text-slate-900">Protection</p>
        </div>
        <p className="mt-3 text-sm text-slate-600">Chaque utilisateur ne peut voter qu’une seule fois pour cette élection.</p>
      </Card>

      <ConfirmDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={() => void handleVote()}
        title="Confirmer votre vote"
        description="Êtes-vous sûr de vouloir voter pour cette liste ? Cette action ne peut pas être annulée."
      />
    </div>
  );
}
