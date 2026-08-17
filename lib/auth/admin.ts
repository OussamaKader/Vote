import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/session";

export async function requireAdmin() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  if (profile.role !== "admin") {
    redirect("/");
  }

  return profile;
}
