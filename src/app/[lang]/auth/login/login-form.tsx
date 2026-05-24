"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Dict {
  nav: { back: string };
  [key: string]: unknown;
}

export function LoginForm({ lang, dict }: { lang: string; dict: Dict }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(
        lang === "pt"
          ? "Email ou palavra-passe incorretos."
          : "Incorrect email or password."
      );
      setLoading(false);
      return;
    }

    router.push(`/${lang}/journey`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
      <label className="flex flex-col gap-1">
        <span className="font-sans text-sm text-carvao/70">Email</span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-xl border border-barro/20 bg-areia/50 px-4 py-3 font-sans text-base text-carvao outline-none focus:border-barro/50 transition-colors"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-sans text-sm text-carvao/70">
          {lang === "pt" ? "Palavra-passe" : "Password"}
        </span>
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-xl border border-barro/20 bg-areia/50 px-4 py-3 font-sans text-base text-carvao outline-none focus:border-barro/50 transition-colors"
        />
      </label>

      {error && (
        <p className="font-sans text-sm text-red-700 bg-red-50 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-2 w-full rounded-full bg-barro px-8 py-4 font-sans text-base font-medium text-creme transition-colors hover:bg-barro-symbol disabled:opacity-50"
      >
        {loading
          ? lang === "pt"
            ? "A entrar..."
            : "Signing in..."
          : lang === "pt"
            ? "Entrar"
            : "Sign in"}
      </button>
    </form>
  );
}
