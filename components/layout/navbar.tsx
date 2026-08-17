import { NavbarClient } from "@/components/layout/navbar-client";
import { getSessionUser } from "@/lib/auth/actions";

export async function Navbar() {
  const sessionUser = await getSessionUser();

  return <NavbarClient sessionUser={sessionUser} />;
}
