import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function CreateElectionPage() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-8">
        <Card className="mx-auto max-w-3xl">
          <CardHeader>
            <h1 className="text-3xl font-bold text-slate-900">Créer une élection</h1>
          </CardHeader>
          <CardContent className="space-y-5 p-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Titre</label>
              <Input placeholder="Élection du conseil étudiant" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Description</label>
              <Input placeholder="Description détaillée" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Date de début</label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Date de fin</label>
                <Input type="date" />
              </div>
            </div>
            <Button className="w-full">Enregistrer</Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
