"use client";

import { useState } from "react";

export function WaitlistForm({ lang }: { lang: string }) {
  const pt = lang === "pt";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, lang }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="mx-auto max-w-md rounded-2xl bg-creme/15 border border-creme/25 px-6 py-8 text-center">
        <p className="font-serif text-xl text-creme">
          {pt ? "Guardámos o teu lugar." : "We've saved your place."}
        </p>
        <p className="mt-2 font-sans text-sm text-creme/70">
          {pt
            ? "Avisamos-te em primeira mão assim que a travessia abrir."
            : "We'll let you know first the moment the crossing opens."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mx-auto flex w-full max-w-md flex-col gap-3">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={pt ? "O teu nome (opcional)" : "Your name (optional)"}
        className="rounded-full bg-creme/95 px-6 py-4 font-sans text-base text-carvao placeholder:text-carvao/40 outline-none"
      />
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={pt ? "O teu email" : "Your email"}
        className="rounded-full bg-creme/95 px-6 py-4 font-sans text-base text-carvao placeholder:text-carvao/40 outline-none"
      />
      <button
        type="submit"
        disabled={state === "loading"}
        className="rounded-full bg-creme px-8 py-4 font-sans text-base font-medium text-barro transition-transform hover:-translate-y-0.5 disabled:opacity-60"
      >
        {state === "loading"
          ? pt ? "A inscrever..." : "Joining..."
          : pt ? "Avisem-me quando abrir" : "Tell me when it opens"}
      </button>
      {state === "error" && (
        <p className="text-center font-sans text-sm text-areia">
          {pt ? "Algo correu mal. Tenta novamente." : "Something went wrong. Try again."}
        </p>
      )}
    </form>
  );
}
