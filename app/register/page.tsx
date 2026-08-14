"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
  const [form, setForm] = useState({ full_name: "", email: "", password: "", confirmPassword: "" });

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <Card className="w-full max-w-md p-2 shadow-lg">
        <CardHeader>
          <h1 className="text-3xl font-bold text-slate-900">Créer un compte</h1>
          <p className="mt-2 text-sm text-slate-600">Rejoignez la plateforme et votez en ligne.</p>
        </CardHeader>
        <CardContent className="space-y-5 p-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Nom complet</label>
            <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Jean Dupont" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Email</label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="jean@campus.fr" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Mot de passe</label>
            <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="********" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Confirmer le mot de passe</label>
            <Input type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} placeholder="********" />
          </div>
          <Button className="w-full">S&apos;inscrire</Button>
          <p className="text-center text-sm text-slate-600">
            Déjà inscrit ? <Link href="/login" className="font-medium text-blue-700">Se connecter</Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
