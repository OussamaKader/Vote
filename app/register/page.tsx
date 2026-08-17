import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/session";
import RegisterForm from "./register-form";

export default async function RegisterPage() {
  const profile = await getCurrentProfile();

  if (profile) {
    redirect(profile.role === "admin" ? "/admin" : "/");
  }

  return <RegisterForm />;
}
