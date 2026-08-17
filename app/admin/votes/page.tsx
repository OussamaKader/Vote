import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth/admin";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export default async function AdminVotesPage() {
  await requireAdmin();

  const supabase = createAdminSupabaseClient();

  const { data: votes = [] } = await supabase
    .from("votes")
    .select(
      "id, created_at, election_id, list_id, user_id, elections(title), lists(name), profiles(full_name)"
    )
    .order("created_at", { ascending: false });

  const voteRows = (votes ?? []).map((vote: any) => ({
    id: vote.id,
    election_id: vote.election_id,
    list_id: vote.list_id,
    election_title: vote.elections?.title ?? "-",
    list_name: vote.lists?.name ?? "-",
    user_name: vote.profiles?.full_name ?? vote.user_id ?? "-",
    created_at: vote.created_at,
  }));

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* En-tête */}
        <div className="mb-6 sm:mb-8">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-blue-700 sm:text-sm">
            Administration
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Votes
          </h1>
        </div>

        {/* Tableau des votes */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-700">
                  <tr>
                    <th className="whitespace-nowrap px-3 py-3 text-xs uppercase tracking-[0.2em] sm:px-4">
                      Élection
                    </th>

                    <th className="whitespace-nowrap px-3 py-3 text-xs uppercase tracking-[0.2em] sm:px-4">
                      Liste
                    </th>

                    <th className="whitespace-nowrap px-3 py-3 text-xs uppercase tracking-[0.2em] sm:px-4">
                      Utilisateur
                    </th>

                    <th className="whitespace-nowrap px-3 py-3 text-xs uppercase tracking-[0.2em] sm:px-4">
                      Date
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {voteRows.map((vote) => (
                    <tr
                      key={vote.id}
                      className="border-t border-slate-200"
                    >
                      <td className="px-3 py-3 sm:px-4">
                        {vote.election_title}
                      </td>

                      <td className="px-3 py-3 sm:px-4">
                        {vote.list_name}
                      </td>

                      <td className="px-3 py-3 sm:px-4">
                        {vote.user_name}
                      </td>

                      <td className="whitespace-nowrap px-3 py-3 sm:px-4">
                        {new Date(vote.created_at).toLocaleString("fr-FR")}
                      </td>
                    </tr>
                  ))}

                  {voteRows.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-6 text-center text-slate-500"
                      >
                        Aucun vote enregistré.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}