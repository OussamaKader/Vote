import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getSessionUser, logoutUser } from "@/lib/auth/actions";

export async function getCurrentUser() {
  return getSessionUser();
}

export async function getCurrentProfile() {
  try {
    const session = await getSessionUser();

    console.log("getCurrentProfile: session", session);
    console.log("getCurrentProfile: session.userId", session?.userId);

    if (!session?.userId) {
      console.log("getCurrentProfile: no session userId");
      return null;
    }

    const supabase = createAdminSupabaseClient();
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.userId)
      .maybeSingle();

    console.log("getCurrentProfile: Supabase query result profile", profile);
    console.log("getCurrentProfile: Supabase query error", error);

    if (error) {
      console.error("getCurrentProfile error:", error);
      return null;
    }

    if (!profile) {
      return null;
    }

    console.log("PROFILE FOUND");
    console.log("getCurrentProfile: final profile", profile);
    console.log("getCurrentProfile: profile.id", profile?.id);
    console.log("getCurrentProfile: profile.role", profile?.role);

    return profile;
  } catch (error) {
    console.error("getCurrentProfile unexpected error:", error);
    return null;
  }
}

export async function signOut() {
  await logoutUser();
}