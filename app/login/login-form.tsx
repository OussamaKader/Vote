"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { loginUser } from "@/lib/auth/actions";
import {
  loginSchema,
  normalizeWhatsapp,
} from "@/lib/validation";

export default function LoginForm() {
  const [whatsapp_number, setWhatsappNumber] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError(null);
    setLoading(true);

    try {
      const payload = {
        whatsapp_number: normalizeWhatsapp(whatsapp_number),
        password,
      };

      const validation = loginSchema.safeParse(payload);

      if (!validation.success) {
        setError(
          validation.error.issues[0]?.message ??
            "Vérifiez vos identifiants.",
        );
        setLoading(false);
        return;
      }

      const result = await loginUser(
        validation.data.whatsapp_number,
        validation.data.password,
      );

      if ("error" in result) {
        setError(
          result.error ||
            "Erreur serveur lors de la connexion.",
        );
        setLoading(false);
        return;
      }

      if (!result.success || !result.profile) {
        setError("Profil utilisateur introuvable.");
        setLoading(false);
        return;
      }

      const destination =
        result.profile.role === "admin"
          ? "/admin"
          : "/";

      window.location.assign(destination);
    } catch (err) {
      const digest = (err as { digest?: string } | null | undefined)
        ?.digest;

      if (typeof digest === "string" && digest.startsWith("NEXT_REDIRECT")) {
        return;
      }

      console.error("Login error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Erreur serveur lors de la connexion.",
      );
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <Card className="w-full max-w-md p-2 shadow-lg">
        <CardHeader className="flex flex-col items-center gap-3">
          {/* Logo AEM-Maroc */}
          <Image
            src="/logo.png"
            alt="AEM-Maroc"
            width={80}
            height={80}
            className="object-contain"
            priority
          />

          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-900">
              Connexion
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Connectez-vous avec votre numéro WhatsApp.
            </p>
          </div>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleLogin}
            className="space-y-5 p-5"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Numéro WhatsApp
              </label>

              <Input
                value={whatsapp_number}
                onChange={(e) =>
                  setWhatsappNumber(e.target.value)
                }
                placeholder="212 ou 222 suivi du numéro"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Mot de passe
              </label>

              <div className="relative">
                <Input
                  type={
                    showPassword ? "text" : "password"
                  }
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Votre mot de passe"
                  className="pr-10"
                  required
                  disabled={loading}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600 disabled:opacity-50"
                >
                  {showPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading
                ? "Connexion..."
                : "Se connecter"}
            </Button>

            <p className="text-center text-sm text-slate-600">
              Pas encore inscrit ?{" "}
              <Link
                href="/register"
                className="font-medium text-blue-700 hover:underline"
              >
                Créer un compte
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}