import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default async function EditElectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireAdmin();
  const supabase = createAdminSupabaseClient();

  const { data: election } = await supabase
    .from("elections")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!election) {
    redirect("/admin/elections");
  }

  async function updateElection(formData: FormData) {
    "use server";

    const title = String(formData.get("title") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const startDate = String(formData.get("start_date") ?? "").trim();
    const endDate = String(formData.get("end_date") ?? "").trim();

    if (!title || !startDate || !endDate) {
      throw new Error("Titre et dates obligatoires.");
    }

    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T23:59:59`);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
      throw new Error("La date de fin doit être supérieure à la date de début.");
    }

    const supabaseAdmin = createAdminSupabaseClient();
    const { error } = await supabaseAdmin
      .from("elections")
      .update({
        title,
        description: description || null,
        start_date: start.toISOString(),
        end_date: end.toISOString(),
      })
      .eq("id", id);

    if (error) {
      throw new Error(error.message);
    }

    redirect(`/admin/elections/${id}`);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <Card className="mx-auto max-w-3xl overflow-hidden">
          <CardHeader className="px-4 pb-3 pt-5 sm:px-6">
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Modifier l’élection</h1>
          </CardHeader>
          <CardContent className="px-4 pb-5 pt-0 sm:px-6 sm:pb-6">
            <form action={updateElection} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium text-slate-700">Titre</label>
                <Input id="title" name="title" defaultValue={election.title} required />
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium text-slate-700">Description</label>
                <Input id="description" name="description" defaultValue={election.description ?? ""} />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="start_date" className="text-sm font-medium text-slate-700">Date de début</label>
                  <Input
                    id="start_date"
                    name="start_date"
                    type="date"
                    defaultValue={new Date(election.start_date).toISOString().slice(0, 10)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="end_date" className="text-sm font-medium text-slate-700">Date de fin</label>
                  <Input
                    id="end_date"
                    name="end_date"
                    type="date"
                    defaultValue={new Date(election.end_date).toISOString().slice(0, 10)}
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button type="submit" className="w-full sm:w-auto">Enregistrer</Button>
                <Button type="button" variant="outline" onClick={() => window.history.back()} className="w-full sm:w-auto">Annuler</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
