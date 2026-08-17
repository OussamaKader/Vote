import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { DeleteElectionForm } from "./delete-form";
import Link from "next/link";
import { redirect } from "next/navigation";

async function toggleElectionStatusAction(formData: FormData) {
  "use server";

  const electionId = Number(formData.get("election_id") ?? "0");
  const action = String(formData.get("action") ?? "");

  if (!electionId) {
    throw new Error("ID de l’élection manquant.");
  }

  const supabase = createAdminSupabaseClient();
  const nextStatus = action === "activate" ? "active" : "upcoming";

  const { error } = await supabase
    .from("elections")
    .update({ status: nextStatus })
    .eq("id", electionId);

  if (error) {
    throw new Error(error.message);
  }

  redirect("/admin/elections");
}

async function deleteElectionAction(formData: FormData) {
  "use server";

  const electionId = Number(formData.get("election_id") ?? "0");

  if (!electionId) {
    throw new Error("ID de l'élection manquant.");
  }

  const supabase = createAdminSupabaseClient();

  const { error } = await supabase
    .from("elections")
    .delete()
    .eq("id", electionId);

  if (error) {
    throw new Error(error.message);
  }

  redirect("/admin/elections");
}

export default async function AdminElectionsPage() {
  const supabase = createAdminSupabaseClient();
  const { data: elections } = await supabase
    .from("elections")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-blue-700 sm:text-sm">Gestion</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Élections</h1>
          </div>
          <Link href="/admin/elections/create">
            <Button className="w-full sm:w-auto">Créer une élection</Button>
          </Link>
        </div>

        <div className="space-y-4">
          {(elections ?? []).map((election) => (
            <Card key={election.id} className="overflow-hidden">
              <CardContent className="flex flex-col gap-4 p-4 sm:p-5 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0 flex-1">
                  <h2 className="break-words text-lg font-semibold text-slate-900 sm:text-xl">{election.title}</h2>
                  <p className="mt-1 break-words text-sm text-slate-600">{election.description}</p>
                  <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-slate-500 sm:text-xs">
                    {election.status === "active" ? "Active" : "Inactive"}
                  </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                  <Link href={`/admin/elections/${election.id}`} className="w-full sm:w-auto">
                    <Button variant="outline" className="w-full sm:w-auto">Gérer</Button>
                  </Link>

                  <form action={toggleElectionStatusAction} className="w-full sm:w-auto">
                    <input type="hidden" name="election_id" value={election.id} />
                    <input type="hidden" name="action" value={election.status === "active" ? "deactivate" : "activate"} />
                    <Button type="submit" variant={election.status === "active" ? "outline" : "default"} className="w-full sm:w-auto">
                      {election.status === "active" ? "Désactiver" : "Activer"}
                    </Button>
                  </form>

                  <DeleteElectionForm electionId={election.id} action={deleteElectionAction} />
                </div>
              </CardContent>
            </Card>
          ))}
          {elections?.length === 0 && (
            <p className="text-sm text-slate-500">Aucune élection pour le moment.</p>
          )}
        </div>
      </main>
    </div>
  );
}