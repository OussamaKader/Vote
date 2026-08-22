import { SingleResultPdfExport } from "@/components/admin/pdf-export";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth/admin";
import { calculateElectionResults } from "@/lib/election-results";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export default async function AdminResultsPage() {
  await requireAdmin();
  const supabase = createAdminSupabaseClient();

  const { data: elections = [] } = await supabase
    .from("elections")
    .select("id, title, status, results_visible")
    .order("created_at", { ascending: false });

  const electionList = elections ?? [];

  const { data: lists = [] } = await supabase
    .from("lists")
    .select("id, name")
    .order("id", { ascending: true });

  const listNameById = new Map<string, string>(
    (lists ?? []).map((list: any) => [String(list.id), list.name ?? "-"])
  );

  const { data: votes = [] } = await supabase
    .from("votes")
    .select("id, election_id, list_id, user_id")
    .order("created_at", { ascending: false });

  const { data: candidates = [] } = await supabase
    .from("candidates")
    .select("id, list_id, name, position")
    .order("id", { ascending: true });

  const candidatesByListId = new Map<string, { name: string; position: string | null }[]>();
  for (const candidate of candidates ?? []) {
    const key = String(candidate.list_id);
    const current = candidatesByListId.get(key) ?? [];
    current.push({ name: candidate.name, position: candidate.position ?? null });
    candidatesByListId.set(key, current);
  }

  // Nombre total d'électeurs inscrits
  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  const totalUsersCount = totalUsers ?? 0;

  const electionMeta = new Map<string, any>(
    electionList.map((election: any) => [String(election.id), election])
  );

  const electionResults = electionList.map((election: any) =>
    calculateElectionResults({
      id: election.id,
      title: election.title,
      votes: (votes ?? []).filter(
        (vote: any) => String(vote.election_id) === String(election.id)
      ),
      listNameById,
    })
  );

  const boardMembersByResultId = new Map<
    string,
    { name: string; position: string | null }[]
  >();

  for (const result of electionResults) {
    const winningRows = result.rows.filter((row: any) => row.is_winner);
    const members = winningRows.flatMap(
      (row: any) => candidatesByListId.get(String(row.list_id)) ?? []
    );
    boardMembersByResultId.set(String(result.id), members);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-blue-700 sm:text-sm">
                Administration
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Résultats
              </h1>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:gap-6">
          {(electionResults ?? []).map((result: any) => (
            <Card key={result.id} className="overflow-hidden">
              <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <h2 className="break-words text-lg font-semibold text-slate-900 sm:text-xl">
                          {result.title}
                        </h2>

                        <p className="text-sm text-slate-500">
                          Statut :{" "}
                          {electionMeta.get(String(result.id))?.status ?? "-"}
                        </p>
                      </div>

                      <span className="inline-flex w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                        {electionMeta.get(String(result.id))?.results_visible
                          ? "Visible"
                          : "Masqué"}
                      </span>
                    </div>

                    {result.total_votes > 0 ? (
                      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600">
                        <span>
                          <span className="font-medium text-slate-900">
                            Votants :
                          </span>{" "}
                          {result.total_voters}
                        </span>

                        <span>
                          <span className="font-medium text-slate-900">
                            Votes :
                          </span>{" "}
                          {result.total_votes}
                        </span>

                        <span>
                          <span className="font-medium text-slate-900">
                            {result.isTie ? "Résultat :" : "Gagnant :"}
                          </span>{" "}
                          {result.winner}
                        </span>
                      </div>
                    ) : (
                      <p className="mt-4 text-sm text-slate-500">
                        Aucun vote enregistré pour cette élection.
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-end">
                    {result.total_votes > 0 ? (
                      <SingleResultPdfExport
                        result={result}
                        boardMembers={boardMembersByResultId.get(String(result.id)) ?? []}
                        totalUsers={totalUsersCount}
                      />
                    ) : (
                      <span className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-medium text-slate-500">
                        Aucun résultat
                      </span>
                    )}
                  </div>
                </div>

                {result.total_votes > 0 && (
                  <div className="mt-5 overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead className="bg-slate-50 text-slate-700">
                        <tr>
                          <th className="px-3 py-3 text-xs uppercase tracking-[0.2em] sm:px-4">
                            Liste / Candidat
                          </th>

                          <th className="px-3 py-3 text-xs uppercase tracking-[0.2em] sm:px-4">
                            Votes
                          </th>

                          <th className="px-3 py-3 text-xs uppercase tracking-[0.2em] sm:px-4">
                            % des inscrits
                          </th>

                          <th className="px-3 py-3 text-xs uppercase tracking-[0.2em] sm:px-4">
                            Classement
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {result.rows.map((row: any) => (
                          <tr
                            key={`${result.id}-${row.list_name}`}
                            className="border-t border-slate-200"
                          >
                            <td className="px-3 py-3 sm:px-4">
                              {row.list_name}
                            </td>

                            <td className="px-3 py-3 sm:px-4">
                              {row.vote_count}
                            </td>

                            <td className="px-3 py-3 sm:px-4">
                              {totalUsersCount > 0
                                ? ((row.vote_count / totalUsersCount) * 100).toFixed(1)
                                : row.percentage.toFixed(1)}%
                            </td>

                            <td className="px-3 py-3 sm:px-4">
                              #{row.rank}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {(electionResults ?? []).length === 0 && (
            <Card>
              <CardContent className="p-4 text-sm text-slate-500 sm:p-5">
                Aucune élection pour afficher les résultats.
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}