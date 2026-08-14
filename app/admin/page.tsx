import { BarChart3, BriefcaseBusiness, Users, Vote } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { StatCard } from "@/components/ui/stat-card";
import { mockElections, mockProfiles, mockVotes } from "@/lib/mock-data";

export default function AdminDashboardPage() {
  const stats = {
    users: mockProfiles.length,
    elections: mockElections.length,
    activeElections: mockElections.filter((e) => e.status === "open").length,
    finishedElections: mockElections.filter((e) => e.status === "closed").length,
    votes: mockVotes.length,
    participation: 82,
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-8">
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-700">Administration</p>
          <h1 className="mt-2 text-4xl font-bold text-slate-900">Dashboard</h1>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Utilisateurs" value={String(stats.users)} icon={<Users className="h-5 w-5" />} />
          <StatCard title="Élections" value={String(stats.elections)} icon={<BriefcaseBusiness className="h-5 w-5" />} />
          <StatCard title="Votes" value={String(stats.votes)} icon={<Vote className="h-5 w-5" />} />
          <StatCard title="Participation" value={`${stats.participation}%`} icon={<BarChart3 className="h-5 w-5" />} />
        </div>
      </main>
    </div>
  );
}
