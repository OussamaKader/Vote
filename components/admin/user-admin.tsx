"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { deleteUserProfileAdmin, getAllProfilesForAdmin, registerUser, type AdminProfileRow, updateUserProfileAdmin } from "@/lib/auth/actions";
import { normalizeWhatsapp } from "@/lib/validation";
import { formatDate } from "@/lib/utils";

const initialForm = {
  full_name: "",
  whatsapp_number: "",
  password: "",
  role: "user" as "user" | "admin",
  is_active: true,
};

type ProfileRow = AdminProfileRow;

export function UserAdmin() {
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const [form, setForm] = useState(initialForm);
  const [editingProfile, setEditingProfile] = useState<ProfileRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProfileRow | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | undefined>(undefined);

  const loadProfiles = async () => {
    setLoading(true);
    const result = await getAllProfilesForAdmin();

    if ("error" in result) {
      setError(result.error);
      setProfiles([]);
      setLoading(false);
      return;
    }

    setProfiles(result.profiles);
    setError(undefined);
    setLoading(false);
  };

  useEffect(() => {
    void loadProfiles();
  }, []);

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(undefined);

    const phone = normalizeWhatsapp(form.whatsapp_number);

    try {
      const result = await registerUser(
        form.full_name,
        phone,
        form.password,
        form.role,
        form.is_active,
      );

      if (result.error) {
        throw new Error(result.error);
      }

      setForm(initialForm);
      await loadProfiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la création du compte.");
    }
  };

  const openEditForm = (profile: ProfileRow) => {
    setEditingProfile(profile);
    setForm({
      full_name: profile.full_name,
      whatsapp_number: profile.whatsapp_number,
      password: "",
      role: profile.role,
      is_active: profile.is_active,
    });
    setError(undefined);
  };

  const closeEditForm = () => {
    setEditingProfile(null);
    setForm(initialForm);
    setError(undefined);
  };

  const handleUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editingProfile) {
      return;
    }

    setIsSaving(true);
    setError(undefined);

    const normalizedPhone = normalizeWhatsapp(form.whatsapp_number);

    if (!normalizedPhone) {
      setError("Le numéro WhatsApp est invalide.");
      setIsSaving(false);
      return;
    }

    const result = await updateUserProfileAdmin(editingProfile.id, {
      full_name: form.full_name.trim(),
      whatsapp_number: normalizedPhone,
      role: form.role,
      is_active: form.is_active,
    });

    setIsSaving(false);

    if ("error" in result) {
      setError(result.error);
      return;
    }

    closeEditForm();
    await loadProfiles();
  };

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    setIsDeletingId(deleteTarget.id);
    setError(undefined);

    const result = await deleteUserProfileAdmin(deleteTarget.id);

    setIsDeletingId(undefined);
    setDeleteTarget(null);

    if ("error" in result) {
      setError(result.error);
      return;
    }

    await loadProfiles();
  };

  if (loading) {
    return <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">Chargement des utilisateurs…</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-slate-900">Ajouter un utilisateur</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Nom complet</label>
              <Input value={form.full_name} onChange={(event) => setForm({ ...form, full_name: event.target.value })} required />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Numéro WhatsApp</label>
              <Input value={form.whatsapp_number} onChange={(event) => setForm({ ...form, whatsapp_number: event.target.value })} placeholder="+2126XXXXXXXX" required />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Mot de passe</label>
              <Input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Rôle</label>
              <Select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as "user" | "admin" })}>
                <option value="user">Utilisateur</option>
                <option value="admin">Administrateur</option>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Statut</label>
              <Select value={String(form.is_active)} onChange={(event) => setForm({ ...form, is_active: event.target.value === "true" })}>
                <option value="true">Actif</option>
                <option value="false">Inactif</option>
              </Select>
            </div>

            {error ? <div className="md:col-span-2 text-sm text-red-600">{error}</div> : null}

            <div className="md:col-span-2">
              <Button type="submit" className="w-full md:w-auto">Ajouter un utilisateur</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-slate-900">Utilisateurs</h2>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[920px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Nom complet</TableHead>
                  <TableHead>WhatsApp</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date de création</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-slate-500">
                      Aucun utilisateur enregistré.
                    </TableCell>
                  </TableRow>
                ) : (
                  profiles.map((profile) => (
                    <TableRow key={profile.id}>
                      <TableCell>{profile.full_name}</TableCell>
                      <TableCell>{profile.whatsapp_number}</TableCell>
                      <TableCell>
                        <Badge className={profile.role === "admin" ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-700"}>
                          {profile.role === "admin" ? "Admin" : "Utilisateur"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={profile.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-200 text-slate-700"}>
                          {profile.is_active ? "Actif" : "Inactif"}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(profile.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex flex-row items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditForm(profile)}
                            className="min-w-0 flex-1 px-2 py-1.5 text-[11px] sm:text-sm"
                          >
                            Modifier
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => setDeleteTarget(profile)}
                            disabled={isDeletingId === profile.id}
                            className="min-w-0 flex-1 px-2 py-1.5 text-[11px] sm:text-sm"
                          >
                            {isDeletingId === profile.id ? "Suppression..." : "Supprimer"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Modal open={Boolean(editingProfile)} onClose={closeEditForm} title="Modifier l’utilisateur">
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Nom complet</label>
            <Input
              value={form.full_name}
              onChange={(event) => setForm({ ...form, full_name: event.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Numéro WhatsApp</label>
            <Input
              value={form.whatsapp_number}
              onChange={(event) => setForm({ ...form, whatsapp_number: event.target.value })}
              placeholder="+2126XXXXXXXX"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Rôle</label>
              <Select
                value={form.role}
                onChange={(event) => setForm({ ...form, role: event.target.value as "user" | "admin" })}
              >
                <option value="user">Utilisateur</option>
                <option value="admin">Admin</option>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Statut</label>
              <Select value={String(form.is_active)} onChange={(event) => setForm({ ...form, is_active: event.target.value === "true" })}>
                <option value="true">Actif</option>
                <option value="false">Inactif</option>
              </Select>
            </div>
          </div>

          {error ? <div className="text-sm text-red-600">{error}</div> : null}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={closeEditForm}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Supprimer l’utilisateur"
        description={`Voulez-vous vraiment supprimer ${deleteTarget?.full_name ?? "cet utilisateur"} ? Cette action est irréversible.`}
      />
    </div>
  );
}
