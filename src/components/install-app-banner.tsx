"use client";

import { useEffect, useState } from "react";

// Convite gentil para instalar a PWA. Aparece a quem ja e utilizador a serio
// (depois de pagar, no topo da jornada), nunca se ja estiver instalada e nunca
// depois de a pessoa o dispensar.

type Mode = "android" | "ios";

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "freeme-install-dismissed";

function ShareGlyph() {
  // Icone "Partilhar" do iOS (quadrado com seta para cima), para a instrucao
  // ficar inequivoca.
  return (
    <span
      aria-hidden
      className="inline-flex h-5 w-5 translate-y-[2px] items-center justify-center text-barro"
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M12 3v11M12 3l-3.5 3.5M12 3l3.5 3.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6 11H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-1"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function InstallAppBanner({ lang }: { lang: string }) {
  const pt = lang === "pt";
  const [mode, setMode] = useState<Mode | null>(null);
  const [deferred, setDeferred] = useState<InstallPromptEvent | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const nav = window.navigator as Navigator & { standalone?: boolean };
    const isStandalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      nav.standalone === true;
    if (isStandalone) return;

    try {
      if (localStorage.getItem(DISMISS_KEY)) return;
    } catch {
      // localStorage indisponivel: seguimos em frente
    }

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as InstallPromptEvent);
      setMode("android");
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    // O iOS nao dispara beforeinstallprompt: mostramos as instrucoes manuais.
    // setMode fora do ciclo sincrono do effect para nao colidir com a regra
    // react-hooks/set-state-in-effect.
    const isIOS = /iphone|ipad|ipod/i.test(nav.userAgent);
    const iosTimer = isIOS
      ? window.setTimeout(() => setMode("ios"), 0)
      : undefined;

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      if (iosTimer) window.clearTimeout(iosTimer);
    };
  }, []);

  if (!mode) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // ignora
    }
    setMode(null);
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    try {
      await deferred.userChoice;
    } catch {
      // ignora
    }
    dismiss();
  };

  return (
    <div className="relative rounded-2xl border border-barro/15 bg-areia/40 p-5 pr-10">
      <button
        onClick={dismiss}
        aria-label={pt ? "Dispensar" : "Dismiss"}
        className="absolute right-3 top-3 text-xl leading-none text-carvao/30 transition-colors hover:text-carvao/60"
      >
        &times;
      </button>

      <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-salvia">
        {pt ? "A app" : "The app"}
      </p>
      <h2 className="mt-1 font-serif text-lg text-barro">
        {pt ? "Leva o FreeMe contigo" : "Take FreeMe with you"}
      </h2>
      <p className="mt-2 font-serif text-sm leading-relaxed text-carvao/70">
        {pt
          ? "Instala a travessia no teu telemóvel. Abre como uma app, em ecrã cheio, sempre à mão para o teu momento de cada dia."
          : "Install the crossing on your phone. It opens like an app, full screen, always there for your daily moment."}
      </p>

      {mode === "android" ? (
        <div className="mt-4 flex items-center gap-4">
          <button
            onClick={install}
            className="rounded-full bg-barro px-6 py-3 font-sans text-sm font-medium text-creme transition-colors hover:bg-barro-symbol"
          >
            {pt ? "Instalar a app" : "Install the app"}
          </button>
          <button
            onClick={dismiss}
            className="font-sans text-sm text-carvao/40 transition-colors hover:text-carvao/60"
          >
            {pt ? "Agora não" : "Not now"}
          </button>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          <p className="flex flex-wrap items-center gap-1 font-serif text-sm text-carvao/80">
            {pt ? "Toca em" : "Tap"} <ShareGlyph />
            {pt ? 'e depois em "Adicionar ao ecrã principal".' : 'then "Add to Home Screen".'}
          </p>
          <button
            onClick={dismiss}
            className="self-start font-sans text-sm text-carvao/40 transition-colors hover:text-carvao/60"
          >
            {pt ? "Entendi" : "Got it"}
          </button>
        </div>
      )}
    </div>
  );
}
