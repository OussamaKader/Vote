"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { logoutUser } from "@/lib/auth/actions";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await logoutUser();
    router.push("/login");
    router.refresh();
  };

  return (
    <Button
      type="button"
      variant="default"
      onClick={() => void handleLogout()}
      className="gap-2 bg-red-600 hover:bg-red-700"
    >
      <LogOut className="h-4 w-4" />
      Déconnexion
    </Button>
  );
}
