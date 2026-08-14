"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <Card className="w-full max-w-md p-2 shadow-lg">
        <CardHeader>
          <h1 className="text-3xl font-bold text-slate-900">Connexion</h1>
          <p className="mt-2 text-sm text-slate-600">Accédez à votre espace VoteCampus.</p>
        </CardHeader>
        <CardContent className="space-y-5 p-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@campus.fr" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Mot de passe</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="********" />
          </div>
          <Button className="w-full">Se connecter</Button>
          <p className="text-center text-sm text-slate-600">
            Pas encore inscrit ? <Link href="/register" className="font-medium text-blue-700">Créer un compte</Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
