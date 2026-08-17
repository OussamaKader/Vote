import { ElectionCard } from "@/components/elections/election-card";
import { Navbar } from "@/components/layout/navbar";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function ElectionsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: elections = [] } = await supabase
    .from("elections")
    .select("*, lists(*)")
    .order("start_date", { ascending: false });

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-700">Élections</p>
          <h1 className="mt-2 text-4xl font-bold text-slate-900">Toutes les élections</h1>
        </div>

        {/* Grille ou empty state */}
        {elections && elections.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {elections.map((election) => (
              <ElectionCard key={election.id} election={election as any} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-24 text-center">
            <p className="text-lg font-medium text-slate-700">Aucune élection disponible</p>
            <p className="mt-2 text-sm text-slate-500">Les élections apparaîtront ici dès qu'elles seront créées.</p>
          </div>
        )}
      </main>
    </div>
  );
}