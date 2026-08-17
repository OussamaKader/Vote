"use server";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { normalizeWhatsapp } from "@/lib/validation";
import type { Profile } from "@/types";

const SALT_ROUNDS = 10;
const SESSION_COOKIE_NAME = "votes_session";
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 jours

export type AdminProfileRow = {
  id: string;
  full_name: string;
  whatsapp_number: string;
  role: "user" | "admin";
  is_active: boolean;
  created_at: string;
};

export async function getAllProfilesForAdmin() {
  try {
    const supabase = createAdminSupabaseClient();

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return { error: error.message };
    }

    return { success: true, profiles: (data ?? []) as AdminProfileRow[] };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erreur serveur" };
  }
}

export async function updateUserProfileAdmin(
  profileId: string,
  updates: {
    full_name: string;
    whatsapp_number: string;
    role: "user" | "admin";
    is_active: boolean;
  },
) {
  try {
    const normalizedPhone = normalizeWhatsapp(updates.whatsapp_number);

    if (!normalizedPhone) {
      return { error: "Le numéro WhatsApp est invalide." };
    }

    const supabase = createAdminSupabaseClient();

    const { data: existingProfile, error: checkError } = await supabase
      .from("profiles")
      .select("id")
      .eq("whatsapp_number", normalizedPhone)
      .neq("id", profileId)
      .maybeSingle();

    if (checkError) {
      return { error: `Erreur lors de la vérification: ${checkError.message}` };
    }

    if (existingProfile) {
      return { error: "Ce numéro WhatsApp est déjà utilisé." };
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        full_name: updates.full_name.trim(),
        whatsapp_number: normalizedPhone,
        role: updates.role,
        is_active: updates.is_active,
      })
      .eq("id", profileId);

    if (updateError) {
      return { error: `Erreur lors de la modification: ${updateError.message}` };
    }

    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erreur serveur" };
  }
}

export async function deleteUserProfileAdmin(profileId: string) {
  try {
    const supabase = createAdminSupabaseClient();

    const { error } = await supabase.from("profiles").delete().eq("id", profileId);

    if (error) {
      return { error: `Erreur lors de la suppression: ${error.message}` };
    }

    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erreur serveur" };
  }
}

export async function registerUser(
  full_name: string,
  whatsapp_number: string,
  password: string,
  role: "user" | "admin" = "user",
  is_active: boolean = true,
) {
  try {
    const normalizedPhone = normalizeWhatsapp(whatsapp_number);
    const supabase = createAdminSupabaseClient();

    if (!normalizedPhone) {
      return { error: "Le numéro WhatsApp est invalide." };
    }

    const { data: existingProfile, error: checkError } = await supabase
      .from("profiles")
      .select("id")
      .eq("whatsapp_number", normalizedPhone)
      .maybeSingle();

    if (checkError) {
      return { error: `Erreur lors de la vérification: ${checkError.message}` };
    }

    if (existingProfile) {
      return { error: "Ce numéro WhatsApp est déjà utilisé." };
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    const { error: insertError } = await supabase
      .from("profiles")
      .insert({
        full_name,
        whatsapp_number: normalizedPhone,
        password_hash,
        role,
        is_active,
      });

    if (insertError) {
      return { error: `Erreur lors de l'inscription: ${insertError.message}` };
    }

    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erreur serveur" };
  }
}

export async function loginUser(
  whatsapp_number: string,
  password: string,
): Promise<{ success: true; profile: Profile } | { error: string }> {
  try {
    const normalizedPhone = normalizeWhatsapp(whatsapp_number);

    if (!normalizedPhone) {
      return { error: "Le numéro WhatsApp est invalide." };
    }

    const supabase = createAdminSupabaseClient();

    const { data: profile, error: queryError } = await supabase
      .from("profiles")
      .select("*")
      .eq("whatsapp_number", normalizedPhone)
      .maybeSingle();

    if (queryError) {
      console.error("loginUser query error:", queryError);

      return {
        error: `Erreur lors de la recherche: ${queryError.message}`,
      };
    }

    if (!profile) {
      return {
        error: "Ce numéro WhatsApp n'existe pas.",
      };
    }

    if (!profile.is_active) {
      return {
        error: "Ce compte est désactivé.",
      };
    }

    const passwordValid = await bcrypt.compare(
      password,
      profile.password_hash,
    );

    if (!passwordValid) {
      return {
        error: "Mot de passe incorrect.",
      };
    }

    const sessionData = {
      userId: profile.id,
      whatsapp_number: profile.whatsapp_number,
      role: profile.role,
      iat: Date.now(),
    };

    const cookieStore = await cookies();

    cookieStore.set(
      SESSION_COOKIE_NAME,
      JSON.stringify(sessionData),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: SESSION_DURATION / 1000,
        path: "/",
      },
    );

    console.log("SESSION COOKIE CREATED");
    console.log("USER ID:", profile.id);
    console.log("USER ROLE:", profile.role);

    return {
      success: true,
      profile: profile as Profile,
    };
  } catch (err) {
    console.error("loginUser error:", err);

    return {
      error:
        err instanceof Error
          ? err.message
          : "Erreur serveur lors de la connexion.",
    };
  }
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  return { success: true };
}

export async function castVote(electionId: string, listId: string, userId: string) {
  try {
    const supabase = createAdminSupabaseClient();

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, is_active, role")
      .eq("id", userId)
      .maybeSingle();

    console.log("CAST VOTE USER ID:", userId);
    console.log("CAST VOTE PROFILE:", profile);
    console.log("CAST VOTE PROFILE ACTIVE:", profile?.is_active);
    console.log("CAST VOTE PROFILE ROLE:", profile?.role);

    if (profileError) {
      console.error("castVote profile lookup error:", profileError);
      return { error: "Erreur lors de la vérification du profil." };
    }

    if (!profile) {
      return { error: "Ce numéro WhatsApp n'existe pas." };
    }

    if (!profile.is_active) {
      return { error: "Ce compte est désactivé." };
    }

    const { data: existingVote, error: voteCheckError } = await supabase
      .from("votes")
      .select("id")
      .eq("election_id", electionId)
      .eq("user_id", userId)
      .maybeSingle();

    if (voteCheckError) {
      console.error("castVote vote check error:", voteCheckError);
      return { error: voteCheckError.message };
    }

    if (existingVote) {
      return { error: "Vous avez déjà voté pour cette élection." };
    }

    const { error: voteError } = await supabase.from("votes").insert({
      election_id: Number(electionId),
      list_id: Number(listId),
      user_id: userId,
    });

    if (voteError) {
      console.error("castVote insert error:", voteError);
      const message = voteError.message.includes("duplicate") ? "Vous avez déjà voté pour cette élection." : voteError.message;
      return { error: message };
    }

    return { success: true };
  } catch (error) {
    console.error("castVote error:", error);
    return { error: error instanceof Error ? error.message : "Erreur lors de l’enregistrement du vote." };
  }
}

export async function getSessionUser() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

    console.log("getSessionUser: cookie present?", !!sessionCookie);
    console.log("getSessionUser: cookie name", SESSION_COOKIE_NAME);
    console.log("getSessionUser: raw cookie value", sessionCookie?.value ?? "undefined");

    if (!sessionCookie?.value) {
      console.log("getSessionUser: no cookie value found");
      return null;
    }

    console.log("SESSION COOKIE RECEIVED");

    const session = JSON.parse(sessionCookie.value);

    console.log("getSessionUser: parsed session", session);
    console.log("getSessionUser: session.userId", session?.userId);
    console.log("SESSION USER ID", session?.userId);

    if (!session?.userId) {
      console.log("getSessionUser: missing userId in session");
      return null;
    }

    return session;
  } catch (error) {
    console.error("getSessionUser error:", error);
    return null;
  }
}
