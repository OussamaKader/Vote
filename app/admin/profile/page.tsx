import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getSessionUser } from "@/lib/auth/actions";
import { getCurrentProfile } from "@/lib/auth/session";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { LogoutButton } from "./logout-button";
import { requireAdmin } from "@/lib/auth/admin";

export default async function AdminProfilePage() {
  await requireAdmin();

  const sessionUser = await getSessionUser();

  if (!sessionUser?.userId) {
    redirect("/login");
  }

  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-lg font-bold tracking-widest text-blue-600 uppercase">Profil</h1>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-slate-900">Informations</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-slate-500">Nom complet</p>
                <p className="font-medium text-slate-900">{profile?.full_name}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Email</p>
                <p className="font-medium text-slate-900">{profile?.email || "Non disponible"}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Rôle</p>
                <p className="font-medium text-slate-900">Administrateur</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Date d'inscription</p>
                <p className="font-medium text-slate-900">{profile?.created_at ? formatDate(profile.created_at) : "-"}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Statut du compte</p>
                <p className="font-medium text-slate-900">{profile?.is_active ? "Actif" : "Désactivé"}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-slate-900">Accès</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600">Vous avez accès à tous les outils d'administration de VoteCampus.</p>
              <div className="mt-6 space-y-2 text-sm text-slate-600">
                <p>✓ Gestion des élections</p>
                <p>✓ Gestion des utilisateurs</p>
                <p>✓ Consultation des votes</p>
                <p>✓ Visualisation des résultats</p>
              </div>
              <div className="mt-6 flex justify-start pt-4">
                <LogoutButton />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
