"use client";

import { Button } from "@/components/ui/button";

export function DeleteElectionForm({ electionId, action }: { electionId: number; action: (formData: FormData) => Promise<void> }) {
  return (
    <form action={action} className="w-full sm:w-auto">
      <input type="hidden" name="election_id" value={electionId} />
      <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 sm:w-auto">
        Supprimer
      </Button>
    </form>
  );
}
