import { Sidebar } from "@/components/layout/sidebar";
import { UserAdmin } from "@/components/admin/user-admin";

export default function AdminUsersPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mb-6 sm:mb-8">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-blue-700 sm:text-sm">Utilisateurs</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Gestion des comptes</h1>
        </div>
        <UserAdmin />
      </main>
    </div>
  );
}
