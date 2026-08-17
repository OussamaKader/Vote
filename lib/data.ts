import { getSessionUser } from "@/lib/auth/actions";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getCurrentProfile() {
  const session = await getSessionUser();

  if (!session?.userId) {
    return null;
  }

  const supabase = createAdminSupabaseClient();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.userId)
    .maybeSingle();

  if (error) {
    console.error("getCurrentProfile error:", error);
    return null;
  }

  console.log("PROFILE:", profile);
  console.log("PROFILE ID:", profile?.id);
  console.log("PROFILE ACTIVE:", profile?.is_active);
  console.log("PROFILE ROLE:", profile?.role);

  return profile;
}

export async function getPublicElections() {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("elections")
    .select("*, lists(*, candidates(*))")
    .order("start_date", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getElectionById(id: string) {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("elections")
    .select("*, lists(*, candidates(*))")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getElectionResults(electionId: string) {
  const supabase = await createServerSupabaseClient();

  const { data: lists, error: listsError } = await supabase
    .from("lists")
    .select("*, candidates(*), votes(count)")
    .eq("election_id", electionId);

  if (listsError) {
    throw new Error(listsError.message);
  }

  const listRows = (lists ?? []).map((list) => {
    const votesCount = Array.isArray((list as any).votes) ? (list as any).votes[0]?.count ?? 0 : 0;
    return {
      ...list,
      votes: Number(votesCount),
    };
  });

  const totalVotes = listRows.reduce((sum, list) => sum + Number(list.votes ?? 0), 0);

  return {
    totalVotes,
    lists: listRows,
  };
}

export async function getAdminStats() {
  const supabase = await createServerSupabaseClient();

  const [{ count: usersCount }, { count: activeUsers }, { count: adminUsers }, { count: electionsCount }, { count: openElections }, { count: finishedElections }, { count: votesCount }] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "admin"),
    supabase.from("elections").select("*", { count: "exact", head: true }),
    supabase.from("elections").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("elections").select("*", { count: "exact", head: true }).eq("status", "finished"),
    supabase.from("votes").select("*", { count: "exact", head: true }),
  ]);

  const users = Number(usersCount ?? 0);
  const active = Number(activeUsers ?? 0);
  const admins = Number(adminUsers ?? 0);
  const elections = Number(electionsCount ?? 0);
  const open = Number(openElections ?? 0);
  const finished = Number(finishedElections ?? 0);
  const totalVotes = Number(votesCount ?? 0);
  const participation = users > 0 ? Math.round((totalVotes / users) * 100) : 0;

  return {
    users,
    activeUsers: active,
    admins,
    elections,
    openElections: open,
    finishedElections: finished,
    totalVotes,
    participation,
  };
}

export async function getUsers() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getUserVoteStatus(electionId: string) {
  const sessionUser = await getSessionUser();

  if (!sessionUser?.userId) {
    return false;
  }

  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("votes")
    .select("id")
    .eq("election_id", electionId)
    .eq("user_id", sessionUser.userId)
    .maybeSingle();

  return Boolean(data);
}
