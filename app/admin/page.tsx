import { BarChart3, BriefcaseBusiness, ShieldCheck, Users, Vote } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { StatCard } from "@/components/ui/stat-card";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export default async function AdminDashboardPage() {
  const supabase = createAdminSupabaseClient();

  const [{ count: usersCount }, { count: activeUsers }, { count: admins }, { count: electionsCount }, { count: openElections }, { count: finishedElections }, { count: votesCount }] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "admin"),
    supabase.from("elections").select("*", { count: "exact", head: true }),
    supabase.from("elections").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("elections").select("*", { count: "exact", head: true }).eq("status", "finished"),
    supabase.from("votes").select("*", { count: "exact", head: true }),
  ]);

  const users = Number(usersCount ?? 0);
  const totalVotes = Number(votesCount ?? 0);
  const participation = users > 0 ? Math.round((totalVotes / users) * 100) : 0;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Sidebar />
      <main className="mx-auto flex-1 w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mb-6 sm:mb-8">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-blue-700 sm:text-sm">Administration</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Dashboard</h1>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Utilisateurs" value={String(users)} icon={<Users className="h-5 w-5" />} />
          <StatCard title="Utilisateurs actifs" value={String(activeUsers ?? 0)} icon={<ShieldCheck className="h-5 w-5" />} />
          <StatCard title="Administrateurs" value={String(admins ?? 0)} icon={<Users className="h-5 w-5" />} />
          <StatCard title="Élections" value={String(electionsCount ?? 0)} icon={<BriefcaseBusiness className="h-5 w-5" />} />
          <StatCard title="Élections ouvertes" value={String(openElections ?? 0)} icon={<Vote className="h-5 w-5" />} />
          <StatCard title="Élections terminées" value={String(finishedElections ?? 0)} icon={<BarChart3 className="h-5 w-5" />} />
          <StatCard title="Votes total" value={String(totalVotes)} icon={<Vote className="h-5 w-5" />} />
          <StatCard title="Taux de participation" value={`${participation}%`} icon={<BarChart3 className="h-5 w-5" />} progress={participation} />
        </div>
      </main>
    </div>
  );
}