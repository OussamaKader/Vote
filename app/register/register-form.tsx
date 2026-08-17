"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { registerUser } from "@/lib/auth/actions";
import { normalizeWhatsapp, registerSchema } from "@/lib/validation";

export default function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({ full_name: "", whatsapp_number: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const payload = {
      full_name: form.full_name,
      whatsapp_number: normalizeWhatsapp(form.whatsapp_number),
      password: form.password,
      confirmPassword: form.confirmPassword,
    };

    const validation = registerSchema.safeParse(payload);
    if (!validation.success) {
      setError(validation.error.issues[0]?.message ?? "Vérifiez les informations saisies.");
      return;
    }

    setLoading(true);

    try {
      const result = await registerUser(validation.data.full_name, validation.data.whatsapp_number, validation.data.password);

      if (result.error) {
        setError(result.error);
        return;
      }

      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <Card className="w-full max-w-md p-2 shadow-lg">
        <CardHeader>
          <h1 className="text-3xl font-bold text-slate-900">Créer un compte</h1>
          <p className="mt-2 text-sm text-slate-600">Inscrivez-vous avec votre nom et votre numéro WhatsApp.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-5 p-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Nom complet</label>
              <Input
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                placeholder="Oussama Mohamed lemine"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Numéro WhatsApp</label>
              <Input
                value={form.whatsapp_number}
                onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })}
                placeholder="212 ou 222 suivi du numéro"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Mot de passe</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Minimum 8 caractères"
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Confirmation du mot de passe</label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  placeholder="Confirmez"
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Inscription..." : "S'inscrire"}
            </Button>

            <p className="text-center text-sm text-slate-600">
              Déjà inscrit ?{" "}
              <Link href="/login" className="font-medium text-blue-700">Se connecter</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}