import Link from "next/link";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { notFound, redirect } from "next/navigation";

async function ensureBucketExists(supabase: ReturnType<typeof createAdminSupabaseClient>, bucketName: string) {
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();

  if (listError) {
    throw new Error(`Impossible de vérifier le bucket Supabase: ${listError.message}`);
  }

  const exists = buckets?.some((bucket) => bucket.name === bucketName);

  if (!exists) {
    const { error: createError } = await supabase.storage.createBucket(bucketName, {
      public: true,
      fileSizeLimit: 5242880,
    });

    if (createError && !createError.message.toLowerCase().includes("already exists")) {
      throw new Error(`Erreur création du bucket "${bucketName}": ${createError.message}`);
    }
  }
}

async function addListAction(formData: FormData) {
  "use server";

  const id = String(formData.get("election_id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const logoFile = formData.get("logo") as File | null;

  if (!id || !name) {
    throw new Error("Le nom de la liste est obligatoire.");
  }

  const supabase = createAdminSupabaseClient();
  let logoUrl: string | null = null;

  // Upload logo si fourni
  if (logoFile && logoFile.size > 0) {
    try {
      await ensureBucketExists(supabase, "logos");

      const buffer = await logoFile.arrayBuffer();
      const fileName = `${Date.now()}-${logoFile.name.replace(/[^a-z0-9.-]/gi, "_")}`;

      const { error: uploadError } = await supabase.storage
        .from("logos")
        .upload(fileName, new Uint8Array(buffer), {
          contentType: logoFile.type,
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Erreur upload du logo dans le bucket "logos": ${uploadError.message}`);
      }

      const { data } = supabase.storage
        .from("logos")
        .getPublicUrl(fileName);

      if (!data?.publicUrl) {
        throw new Error("Le logo a bien été uploadé, mais l'URL publique est introuvable.");
      }

      logoUrl = data.publicUrl;
    } catch (err) {
      throw new Error(
        `Erreur lors du traitement du logo: ${err instanceof Error ? err.message : "Erreur inconnue"}`
      );
    }
  }

  // Créer la liste
  const { error } = await supabase.from("lists").insert({
    election_id: Number(id),
    name,
    description: description || null,
    logo_url: logoUrl,
  });

  if (error) {
    throw new Error(error.message);
  }

  redirect(`/admin/elections/${id}`);
}

async function addCandidateAction(formData: FormData) {
  "use server";

  const listId = Number(formData.get("list_id") ?? "0");
  const name = String(formData.get("name") ?? "").trim();
  const position = String(formData.get("position") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const photoFile = formData.get("photo") as File | null;

  if (!listId || !name) {
    throw new Error("Le nom du candidat est obligatoire.");
  }

  const supabase = createAdminSupabaseClient();
  let photoUrl: string | null = null;

  // Upload photo si fournie
  if (photoFile && photoFile.size > 0) {
    try {
      await ensureBucketExists(supabase, "candidate-photos");

      const buffer = await photoFile.arrayBuffer();
      const fileName = `${Date.now()}-${photoFile.name.replace(/[^a-z0-9.-]/gi, "_")}`;
      
      const { error: uploadError } = await supabase.storage
        .from("candidate-photos")
        .upload(fileName, new Uint8Array(buffer), {
          contentType: photoFile.type,
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Erreur upload photo: ${uploadError.message}`);
      }

      // Récupérer l'URL publique
      const { data } = supabase.storage
        .from("candidate-photos")
        .getPublicUrl(fileName);
      
      photoUrl = data?.publicUrl || null;
    } catch (err) {
      throw new Error(`Erreur lors du traitement de la photo: ${err instanceof Error ? err.message : "Erreur inconnue"}`);
    }
  }

  // Créer le candidat
  const { error } = await supabase.from("candidates").insert({
    list_id: listId,
    name,
    position: position || null,
    description: description || null,
    photo_url: photoUrl,
  });

  if (error) {
    throw new Error(error.message);
  }

  const { data: list } = await supabase.from("lists").select("election_id").eq("id", listId).maybeSingle();
  if (list?.election_id) {
    redirect(`/admin/elections/${list.election_id}`);
  }
  redirect("/admin/elections");
}

async function deleteCandidateAction(formData: FormData) {
  "use server";

  const candidateId = Number(formData.get("candidate_id") ?? "0");
  const electionId = String(formData.get("election_id") ?? "");

  if (!candidateId) {
    throw new Error("ID du candidat manquant.");
  }

  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.from("candidates").delete().eq("id", candidateId);

  if (error) {
    throw new Error(error.message);
  }

  redirect(`/admin/elections/${electionId}`);
}

async function deleteListAction(formData: FormData) {
  "use server";

  const listId = Number(formData.get("list_id") ?? "0");
  const electionId = String(formData.get("election_id") ?? "");

  if (!listId) {
    throw new Error("ID de la liste manquant.");
  }

  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.from("lists").delete().eq("id", listId);

  if (error) {
    throw new Error(error.message);
  }

  redirect(`/admin/elections/${electionId}`);
}

type ListRecord = {
  id: number;
  name: string;
  description?: string | null;
  candidates?: CandidateRecord[];
};

type CandidateRecord = {
  id: number;
  name: string;
  position?: string | null;
  description?: string | null;
};

export default async function AdminElectionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminSupabaseClient();

  const { data: election } = await supabase
    .from("elections")
    .select("*, lists(*, candidates(*))")
    .eq("id", id)
    .maybeSingle();

  if (!election) {
    notFound();
  }

  const lists = Array.isArray(election.lists) ? election.lists : [];

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-blue-700 sm:text-sm">Élection</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{election.title}</h1>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href={`/admin/elections/${id}/edit`} className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto">Modifier</Button>
            </Link>
            <Button variant="danger" className="w-full sm:w-auto">Supprimer</Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 sm:gap-6">
          <Card>
            <CardContent className="p-4 sm:p-5">
              <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">Gestion</h2>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <p><span className="font-medium text-slate-900">Description :</span> {election.description || "Aucune description"}</p>
                <p><span className="font-medium text-slate-900">Début :</span> {new Date(election.start_date).toLocaleDateString("fr-FR")}</p>
                <p><span className="font-medium text-slate-900">Fin :</span> {new Date(election.end_date).toLocaleDateString("fr-FR")}</p>
                <p><span className="font-medium text-slate-900">Statut :</span> {election.status}</p>
                <p><span className="font-medium text-slate-900">Résultats visibles :</span> {election.results_visible ? "Oui" : "Non"}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-5">
              <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">Ajouter une liste</h2>
              <form action={addListAction} className="mt-4 space-y-4">
                <input type="hidden" name="election_id" value={id} />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Nom</label>
                  <Input name="name" placeholder="Liste A" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Description</label>
                  <Input name="description" placeholder="Description de la liste" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Logo</label>
                  <Input name="logo" type="file" accept="image/*" />
                </div>
                <Button type="submit" className="w-full">Ajouter la liste</Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 space-y-6">
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Listes candidates</h2>

          {lists.length === 0 ? (
            <Card>
              <CardContent className="p-5 text-sm text-slate-500">Aucune liste pour cette élection.</CardContent>
            </Card>
          ) : (
            lists.map((list: ListRecord) => (
              <Card key={list.id}>
                <CardContent className="p-5">
                  <div className="mb-4 flex flex-col gap-3 border-b border-slate-200 pb-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-xl font-semibold text-slate-900">{list.name}</p>
                      <p className="text-sm text-slate-600">{list.description || "Aucune description"}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Modifier</Button>
                      <form action={deleteListAction} style={{ display: "inline" }}>
                        <input type="hidden" name="list_id" value={list.id} />
                        <input type="hidden" name="election_id" value={id} />
                        <Button variant="danger" size="sm" type="submit">Supprimer</Button>
                      </form>
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Ajouter un candidat</p>
                      <form action={addCandidateAction} className="space-y-3">
                        <input type="hidden" name="list_id" value={list.id} />
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700">Nom</label>
                          <Input name="name" placeholder="Nom du candidat" required />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700">Position</label>
                          <Input name="position" placeholder="Président, trésorier..." />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700">Photo</label>
                          <Input name="photo" type="file" accept="image/*" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700">Description</label>
                          <Input name="description" placeholder="Description du candidat" />
                        </div>
                        <Button type="submit" className="w-full">Ajouter candidat</Button>
                      </form>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Candidats</p>
                      <div className="space-y-3">
                        {(list.candidates ?? []).length === 0 ? (
                          <p className="text-sm text-slate-500">Aucun candidat dans cette liste.</p>
                        ) : (
                          (list.candidates ?? []).map((candidate: CandidateRecord) => (
                            <div key={candidate.id} className="rounded-xl border border-slate-200 p-3">
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <p className="font-medium text-slate-900">{candidate.name}</p>
                                  <p className="text-xs text-slate-500">{candidate.position || "Position non définie"}</p>
                                </div>
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm">Modifier</Button>
                                  <form action={deleteCandidateAction} style={{ display: "inline" }}>
                                    <input type="hidden" name="candidate_id" value={candidate.id} />
                                    <input type="hidden" name="election_id" value={id} />
                                    <Button variant="danger" size="sm" type="submit">Supprimer</Button>
                                  </form>
                                </div>
                              </div>
                              <p className="mt-2 text-sm text-slate-600">{candidate.description || "Aucune description"}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}