import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getSessionUser } from "@/lib/auth/actions";
import { getCurrentProfile } from "@/lib/auth/session";
import { formatDate } from "@/lib/utils";
import { LogoutButton } from "./logout-button";

export default async function ProfilePage() {
  const sessionUser = await getSessionUser();

  if (!sessionUser?.userId) {
    redirect("/login");
  }

  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  // ✅ Service role client pour bypasser la RLS
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: votes = [], error: votesError } = await supabaseAdmin
    .from("votes")
    .select("*, lists(name)")
    .eq("user_id", sessionUser.userId)
    .order("created_at", { ascending: false });

  if (votesError) {
    console.error("Erreur récupération historique votes:", votesError);
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-lg font-bold uppercase tracking-widest text-blue-600">
            Profil
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Consultez vos informations et votre historique de votes.
          </p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          {/* Informations du profil */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-slate-900">
                Informations
              </h2>
            </CardHeader>

            <CardContent className="space-y-5">
              <div>
                <p className="text-sm text-slate-500">Nom complet</p>
                <p className="font-medium text-slate-900">
                  {profile.full_name}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Numéro WhatsApp</p>
                <p className="font-medium text-slate-900">
                  {profile.whatsapp_number}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Date d'inscription</p>
                <p className="font-medium text-slate-900">
                  {profile.created_at ? formatDate(profile.created_at) : "-"}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Statut du compte</p>
                <p
                  className={`font-medium ${
                    profile.is_active ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {profile.is_active ? "Actif" : "Désactivé"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Historique des votes */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-slate-900">
                Historique des votes
              </h2>
              <p className="text-sm text-slate-500">
                Vos votes enregistrés sur la plateforme.
              </p>
            </CardHeader>

            <CardContent className="space-y-4">
              {!votes || votes.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                  <p className="text-sm text-slate-600">
                    Aucun vote enregistré pour le moment.
                  </p>
                </div>
              ) : (
                votes.map((vote: any) => (
                  <div
                    key={vote.id}
                    className="rounded-xl border border-slate-200 bg-white p-4 transition-shadow hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900">
                          {vote.lists?.name ?? "Liste"}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          Date du vote :{" "}
                          {vote.created_at ? formatDate(vote.created_at) : "-"}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-600">
                        ✓ Enregistré
                      </span>
                    </div>

                    <div className="mt-3 border-t border-slate-100 pt-3">
                      <p className="text-xs text-slate-500">
                        Vous avez déjà voté pour cette élection.
                      </p>
                    </div>
                  </div>
                ))
              )}

              {/* Déconnexion */}
              <div className="flex justify-start pt-4">
                <LogoutButton />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}