import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { mockElections } from "@/lib/mock-data";
import { notFound } from "next/navigation";

export default function AdminElectionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const election = mockElections[0];

  if (!election) {
    notFound();
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-700">Élection</p>
            <h1 className="mt-2 text-4xl font-bold text-slate-900">{election.title}</h1>
          </div>
          <Button variant="danger">Supprimer</Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardContent className="p-5">
              <h2 className="text-xl font-semibold text-slate-900">Gestion</h2>
              <div className="mt-4 space-y-3">
                <Button className="w-full">Ouvrir l’élection</Button>
                <Button variant="outline" className="w-full">Modifier</Button>
                <Button variant="outline" className="w-full">Activer les résultats</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h2 className="text-xl font-semibold text-slate-900">Listes</h2>
              <div className="mt-4 space-y-3">
                {election.lists.map((list) => (
                  <div key={list.id} className="rounded-xl border border-slate-200 p-3">
                    <p className="font-medium text-slate-900">{list.name}</p>
                    <p className="text-sm text-slate-600">{list.candidates.length} candidat(s)</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
