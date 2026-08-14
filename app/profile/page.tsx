import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { mockProfiles, mockVotes } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";

export default function ProfilePage() {
  const user = mockProfiles[0];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-slate-900">Profil</h1>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-slate-900">Informations</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-slate-500">Nom</p>
                <p className="font-medium text-slate-900">{user.full_name}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Email</p>
                <p className="font-medium text-slate-900">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Date de création</p>
                <p className="font-medium text-slate-900">{formatDate(user.created_at)}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-slate-900">Historique des votes</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockVotes.filter((vote) => vote.user_id === user.id).map((vote) => (
                <div key={vote.id} className="rounded-xl border border-slate-200 p-4">
                  <p className="font-medium text-slate-900">Élection #{vote.election_id}</p>
                  <p className="mt-1 text-sm text-slate-600">Date du vote : {formatDate(vote.created_at)}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
