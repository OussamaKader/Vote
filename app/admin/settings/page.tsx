import { redirect } from "next/navigation";

export default function AdminSettingsPage() {
  // Redirection vers la nouvelle page profil
  redirect("/admin/profile");
}
