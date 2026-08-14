import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { mockElections } from "@/lib/mock-data";
import Link from "next/link";

export default function AdminElectionsPage() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-8">
        <div className="mb-8 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-700">Gestion</p>
            <h1 className="mt-2 text-4xl font-bold text-slate-900">Élections</h1>
          </div>
          <Link href="/admin/elections/create">
            <Button>Créer une élection</Button>
          </Link>
        </div>

        <div className="space-y-4">
          {mockElections.map((election) => (
            <Card key={election.id}>
              <CardContent className="flex items-center justify-between gap-4 p-5">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">{election.title}</h2>
                  <p className="mt-1 text-sm text-slate-600">{election.description}</p>
                </div>
                <Link href={`/admin/elections/${election.id}`}>
                  <Button variant="outline">Gérer</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
