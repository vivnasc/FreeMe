"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Dict {
  [key: string]: unknown;
}

export function RegisterForm({ lang, dict }: { lang: string; dict: Dict }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [alreadyExists, setAlreadyExists] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const pt = lang === "pt";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setAlreadyExists(false);
    setLoading(true);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: name, locale: lang },
      },
    });

    // O Supabase, para nao revelar emails, devolve "sucesso" com identities
    // vazias quando o email ja existe. Tratamos como ja registado.
    const obfuscatedExisting =
      !error && !!data.user && (data.user.identities?.length ?? 0) === 0;

    if (error || obfuscatedExisting) {
      const msg = error?.message ?? "";
      const isExisting =
        obfuscatedExisting ||
        error?.status === 422 ||
        /already|registered|exists/i.test(msg);

      if (isExisting) {
        setAlreadyExists(true);
        setError(
          pt
            ? "Este email já tem conta. Tenta entrar."
            : "This email already has an account. Try logging in."
        );
      } else {
        setError(
          pt
            ? `Não foi possível criar a conta: ${msg}`
            : `Could not create account: ${msg}`
        );
      }
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="rounded-2xl bg-salvia/10 px-6 py-8">
          <p className="font-serif text-lg text-salvia">
            {lang === "pt"
              ? "Conta criada. Verifica o teu email para confirmar."
              : "Account created. Check your email to confirm."}
          </p>
        </div>
        <button
          onClick={() => router.push(`/${lang}/auth/login`)}
          className="font-sans text-sm text-barro hover:underline"
        >
          {lang === "pt" ? "Ir para o login" : "Go to login"}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
      <label className="flex flex-col gap-1">
        <span className="font-sans text-sm text-carvao/70">
          {lang === "pt" ? "O teu nome" : "Your name"}
        </span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={lang === "pt" ? "Como queres ser chamada?" : "What should we call you?"}
          className="rounded-xl border border-barro/20 bg-areia/50 px-4 py-3 font-sans text-base text-carvao placeholder:text-carvao/30 outline-none focus:border-barro/50 transition-colors"
        />
      </label>

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
        <div className="flex flex-col gap-2">
          <p className="font-sans text-sm text-red-700 bg-red-50 rounded-lg px-3 py-2">
            {error}
          </p>
          {alreadyExists && (
            <button
              type="button"
              onClick={() => router.push(`/${lang}/auth/login`)}
              className="self-start font-sans text-sm text-barro hover:underline"
            >
              {pt ? "Ir para o login" : "Go to login"}
            </button>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-2 w-full rounded-full bg-barro px-8 py-4 font-sans text-base font-medium text-creme transition-colors hover:bg-barro-symbol disabled:opacity-50"
      >
        {loading
          ? lang === "pt"
            ? "A criar..."
            : "Creating..."
          : lang === "pt"
            ? "Criar conta"
            : "Create account"}
      </button>
    </form>
  );
}
