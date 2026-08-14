import { ElectionCard } from "@/components/elections/election-card";
import { Navbar } from "@/components/layout/navbar";
import { mockElections } from "@/lib/mock-data";

export default function ElectionsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-700">Élections</p>
          <h1 className="mt-2 text-4xl font-bold text-slate-900">Toutes les élections</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {mockElections.map((election) => (
            <ElectionCard key={election.id} election={election} />
          ))}
        </div>
      </main>
    </div>
  );
}
