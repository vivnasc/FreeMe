import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getDictionary, hasLocale } from "./dictionaries";
import { SafetyButton } from "@/components/safety-button";

export default async function LandingPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const otherLang = lang === "pt" ? "en" : "pt";

  return (
    <>
      {/* HERO */}
      <section className="relative text-creme text-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/vivianne-6.jpeg"
            alt="Vivianne dos Santos"
            fill
            className="object-cover object-top"
            priority
          />
          <div className="absolute inset-0 bg-[radial-gradient(130%_90%_at_50%_10%,#A85C42cc,#8C4A36dd_55%,#5E3527ee_100%)]" />
        </div>
        <div className="relative max-w-[760px] mx-auto py-24 px-6">
          <svg
            className="w-24 h-24 mx-auto mb-8"
            viewBox="0 0 512 512"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M256 256 C256 210 220 180 180 180 C130 180 100 220 100 270 C100 340 150 390 220 390 C320 390 380 320 380 220 C380 130 310 70 220 70 C120 70 50 150 50 250 C50 380 150 470 290 470 C345 470 385 455 425 425"
              fill="none"
              stroke="#FBF4EC"
              strokeWidth="13"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <h1 className="font-serif font-light text-[3.4rem] leading-tight tracking-tight mb-1">
            Free<span className="font-medium italic">Me</span>
          </h1>
          <p className="font-serif italic text-[#F0C9B0] text-xl mb-2">
            {lang === "pt" ? "A Travessia da Mãe" : "A Mother's Crossing"}
          </p>
          <p className="font-sans text-xs text-creme/50 tracking-widest uppercase mb-9">
            {lang === "pt" ? "uma app, um percurso, uma travessia" : "an app, a journey, a crossing"}
          </p>
          <p className="text-lg font-extralight max-w-[520px] mx-auto mb-4">
            {lang === "pt"
              ? "Toda a gente fala da criança ferida. Ninguém fala da culpa que tu carregas, em silêncio, por achares que falhaste com ele."
              : "Everyone talks about the wounded child. No one talks about the guilt you carry, in silence, for believing you failed them."}
          </p>
          <p className="text-base font-extralight max-w-[520px] mx-auto mb-10 text-areia">
            {lang === "pt"
              ? "E é essa culpa, que ninguém nomeia, que te impede de educar e de ocupar o teu lugar."
              : "And it is that guilt, which no one names, that keeps you from parenting and from taking your place."}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={`/${lang}/auth/register`}
              className="inline-block bg-creme text-barro px-11 py-4 rounded-full text-base font-normal tracking-wide transition-transform hover:-translate-y-0.5"
            >
              {lang === "pt" ? "Descobrir o meu bloqueio" : "Discover my block"}
            </Link>
            <Link
              href={`/${otherLang}`}
              className="inline-block border border-creme/50 text-creme px-8 py-4 rounded-full text-sm font-normal tracking-wide transition-transform hover:-translate-y-0.5"
            >
              {dict.language.switch}
            </Link>
          </div>
        </div>
      </section>

      {/* FERIDA */}
      <section className="bg-areia py-[90px] px-6">
        <div className="max-w-[760px] mx-auto">
          <div className="mb-10 rounded-2xl overflow-hidden">
            <Image
              src="/images/EMOCIONAL-pb-foto1.jpeg"
              alt=""
              width={760}
              height={500}
              className="w-full h-auto object-cover grayscale opacity-80"
              priority={false}
            />
          </div>
          <h2 className="font-serif font-light text-[2.1rem] leading-tight text-barro mb-7">
            {lang === "pt"
              ? "Há uma coisa que tu sentes e nunca disseste a ninguém."
              : "There is something you feel and have never told anyone."}
          </h2>
          <p className="text-lg font-light mb-5">
            {lang === "pt"
              ? "Que gritaste quando não devias. Que não deste o suficiente. Que não tiveste o pai dele por perto, ou o dinheiro, ou a paciência. Que não és a mãe que sonhaste ser antes de seres mãe."
              : "That you shouted when you shouldn't have. That you didn't give enough. That you didn't have his father around, or the money, or the patience. That you are not the mother you dreamed of being before becoming one."}
          </p>
          <p className="text-lg font-light mb-5">
            {lang === "pt"
              ? "E carregas isto sozinha, porque a mãe não se pode queixar. A mãe aguenta."
              : "And you carry this alone, because a mother cannot complain. A mother endures."}
          </p>
          <p className="font-serif italic text-2xl text-barro-symbol leading-snug my-9">
            {lang === "pt"
              ? "Mas a culpa não te torna melhor mãe. Torna-te uma mãe que não educa."
              : "But guilt does not make you a better mother. It makes you a mother who cannot parent."}
          </p>
          <p className="text-lg font-light">
            {lang === "pt"
              ? "Quem se sente em dívida cede para compensar, não põe limites, pede desculpa por existir. E aos poucos abandona o seu lugar. A culpa não é boa conselheira."
              : "Those who feel in debt give in to compensate, set no boundaries, apologise for existing. And gradually abandon their place. Guilt is not a good counsellor."}
          </p>
        </div>
      </section>

      {/* VIRADA */}
      <section className="bg-creme py-[90px] px-6">
        <div className="max-w-[760px] mx-auto">
          <h2 className="font-serif font-light text-[2rem] text-barro mb-6 leading-tight">
            {lang === "pt"
              ? "O FreeMe não te vai ensinar a ser mãe."
              : "FreeMe will not teach you how to be a mother."}
          </h2>
          <p className="text-lg font-light mb-5">
            {lang === "pt"
              ? <>Não é mais um curso, nem mais uma lista de conselhos que te fazem sentir pior. É uma <strong className="text-barro-symbol font-medium">travessia</strong>, um percurso que fazes por dentro, no teu ritmo, para pousares o que não era teu para carregar.</>
              : <>Not another course, nor another list of advice that makes you feel worse. It is a <strong className="text-barro-symbol font-medium">crossing</strong>, a journey you make within, at your own pace, to lay down what was never yours to carry.</>}
          </p>
          <p className="text-lg font-light mb-5">
            {lang === "pt"
              ? "Assenta no trabalho sistémico, nas ordens do amor entre uma mãe e um filho. Aquilo que herdaste sem escolher, e que molda o que te deixas viver."
              : "Grounded in systemic work, in the orders of love between a mother and a child. What you inherited without choosing, and what shapes what you allow yourself to live."}
          </p>
          <p className="text-lg font-light">
            {lang === "pt"
              ? "No fim, não estás curada. Ninguém fica. Mas sabes o caminho de volta a ti. E esse não se desaprende."
              : "In the end, you are not healed. No one is. But you know the way back to yourself. And that cannot be unlearned."}
          </p>
        </div>
      </section>

      {/* BLOQUEIOS */}
      <section className="bg-salvia text-creme py-[90px] px-6">
        <div className="max-w-[760px] mx-auto">
          <h2 className="font-serif font-light text-[2.1rem] text-center mb-3">
            {lang === "pt" ? "Os sete que te prendem" : "The seven that hold you"}
          </h2>
          <p className="text-center max-w-[540px] mx-auto font-extralight text-[#EDEFE4] mb-12">
            {lang === "pt"
              ? "A culpa é só o primeiro. Por baixo dela, há mais. O FreeMe ajuda-te a ver qual te pesa mais, e a atravessá-lo."
              : "Guilt is only the first. Beneath it, there is more. FreeMe helps you see which weighs on you most, and cross through it."}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(lang === "pt"
              ? [
                  { tag: "o que carregas", name: "O peso", desc: "Sustentas tudo e todos, e perdeste-te a ti." },
                  { tag: "o que te falta", name: "O vazio", desc: "Dás e dás, e já não sobra nada para ti." },
                  { tag: "o que te acusa", name: "A culpa", desc: "Sentes que falhaste, e isso paralisa-te." },
                  { tag: "o que te aperta", name: "O medo", desc: "Vigias, antecipas, temes repetir o que viveste." },
                  { tag: "o que escondes", name: "A vergonha", desc: "Achas que há algo errado em ti, e escondes." },
                  { tag: "o que te dói", name: "A mágoa", desc: "As feridas de filha que sangram quando és mãe." },
                  { tag: "o que não largas", name: "O rancor", desc: "A raiva de quem te deixou sozinha." },
                ]
              : [
                  { tag: "what you carry", name: "The weight", desc: "You hold everything and everyone, and lost yourself." },
                  { tag: "what you lack", name: "The void", desc: "You give and give, and nothing is left for you." },
                  { tag: "what accuses you", name: "The guilt", desc: "You feel you failed, and it paralyses you." },
                  { tag: "what tightens", name: "The fear", desc: "You watch, anticipate, fear repeating what you lived." },
                  { tag: "what you hide", name: "The shame", desc: "You think something is wrong with you, and hide." },
                  { tag: "what hurts", name: "The hurt", desc: "The daughter wounds that bleed when you are a mother." },
                  { tag: "what you won't release", name: "The resentment", desc: "The anger at who left you alone." },
                ]
            ).map((b) => (
              <div
                key={b.name}
                className="bg-creme/[0.08] border border-creme/[0.18] rounded-2xl p-6"
              >
                <p className="font-serif italic text-[#D6C9BE] text-sm opacity-80 mb-2">
                  {b.tag}
                </p>
                <h3 className="font-serif font-normal text-xl mb-2">{b.name}</h3>
                <p className="text-sm font-extralight text-[#EDEFE4]">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMO */}
      <section className="bg-areia py-[90px] px-6">
        <div className="max-w-[760px] mx-auto">
          <h2 className="font-serif font-light text-[2rem] text-barro text-center mb-11">
            {lang === "pt" ? "Como é a travessia" : "How the crossing works"}
          </h2>
          {(lang === "pt"
            ? [
                { n: "i", title: "Um espelho à entrada (grátis)", desc: "Respondes a 7 perguntas na app, e o FreeMe mostra-te qual bloqueio mais te prende agora. Sem compromisso." },
                { n: "ii", title: "Um percurso só teu", desc: "Desbloqueias o percurso completo e atravessas os bloqueios pela ordem que te protege, com a minha voz a guiar-te." },
                { n: "iii", title: "A tua voz no papel", desc: "Em cada etapa, escreves o que sentes na app. Privado, só teu. É o teu diário da travessia." },
                { n: "iv", title: "O reencontro", desc: "No fim, a app mostra-te, pelas tuas próprias palavras, a distância entre quem entrou e quem chegou." },
              ]
            : [
                { n: "i", title: "A mirror at the entrance (free)", desc: "You answer 7 questions in the app, and FreeMe shows you which block holds you most right now. No commitment." },
                { n: "ii", title: "A path only yours", desc: "You unlock the full journey and cross the blocks in the order that protects you, with my voice guiding you." },
                { n: "iii", title: "Your voice on paper", desc: "At each step, you write what you feel in the app. Private, only yours. Your crossing journal." },
                { n: "iv", title: "The reunion", desc: "In the end, the app shows you, through your own words, the distance between who entered and who arrived." },
              ]
          ).map((step) => (
            <div key={step.n} className="flex gap-5 mb-8 items-start">
              <div className="shrink-0 w-11 h-11 rounded-full bg-barro text-creme flex items-center justify-center font-serif italic text-base">
                {step.n}
              </div>
              <div>
                <h3 className="font-serif font-normal text-xl text-barro-symbol mb-1">
                  {step.title}
                </h3>
                <p className="text-base font-light">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SOBRE */}
      <section className="bg-creme py-[90px] px-6 text-center">
        <div className="max-w-[760px] mx-auto">
          <div className="w-40 h-40 mx-auto mb-8 rounded-full overflow-hidden">
            <Image
              src="/images/PAGINA-quemsou-foto9.jpeg"
              alt="Vivianne dos Santos"
              width={160}
              height={160}
              className="w-full h-full object-cover"
            />
          </div>
          <svg
            className="w-14 h-14 mx-auto mb-6 opacity-85"
            viewBox="0 0 512 512"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M256 256 C256 210 220 180 180 180 C130 180 100 220 100 270 C100 340 150 390 220 390 C320 390 380 320 380 220 C380 130 310 70 220 70 C120 70 50 150 50 250 C50 380 150 470 290 470 C345 470 385 455 425 425"
              fill="none"
              stroke="#8C4A36"
              strokeWidth="14"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="text-lg font-light max-w-[560px] mx-auto mb-5">
            {lang === "pt"
              ? "Sou a Vivianne. Escritora, mãe de três, e em formação em constelação familiar sistémica, a abordagem que sustenta esta travessia."
              : "I'm Vivianne. Writer, mother of three, and training in systemic family constellation, the approach that sustains this crossing."}
          </p>
          <p className="text-lg font-light max-w-[560px] mx-auto mb-5">
            {lang === "pt"
              ? "Criei o FreeMe porque conheço esta culpa por dentro. E porque ninguém merece carregá-la sozinha, no escuro, sem direito a queixa."
              : "I created FreeMe because I know this guilt from within. And because no one deserves to carry it alone, in the dark, with no right to complain."}
          </p>
          <p className="font-serif italic text-xl text-barro-symbol mt-3">
            Vivianne dos Santos
          </p>
        </div>
      </section>

      {/* SEGURANCA */}
      <section className="bg-[#EAD6C3] py-[90px] px-6 text-center">
        <div className="max-w-[760px] mx-auto">
          <p className="text-base font-light max-w-[560px] mx-auto text-[#5C4A3C]">
            {lang === "pt"
              ? "O FreeMe é uma travessia de autoconhecimento, com base nos princípios da constelação familiar. Não substitui acompanhamento terapêutico. Se atravessas uma dor profunda, luto, trauma, ou sentes que precisas de mais, procura o apoio de um profissional. Não tens de o fazer sozinha."
              : "FreeMe is a self-knowledge crossing, grounded in the principles of family constellation. It does not replace therapeutic support. If you are going through deep pain, grief, trauma, or feel you need more, seek professional support. You do not have to do it alone."}
          </p>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="bg-[radial-gradient(130%_90%_at_50%_100%,#6E7857,#8C4A36_70%)] text-creme py-[90px] px-6 text-center">
        <div className="max-w-[760px] mx-auto">
          <h2 className="font-serif font-light text-[2.4rem] leading-tight mb-4">
            {lang === "pt" ? (
              <>Não vieste tarde.<br /><span className="italic font-medium text-[#F0C9B0]">Vieste a tempo de ti.</span></>
            ) : (
              <>You did not come late.<br /><span className="italic font-medium text-[#F0C9B0]">You came in time for yourself.</span></>
            )}
          </h2>
          <p className="font-extralight max-w-[480px] mx-auto mb-4 text-[#EAD6C3]">
            {lang === "pt"
              ? "A travessia começa quando tu decidires pousar o que não é teu."
              : "The crossing begins when you decide to lay down what is not yours."}
          </p>
          <p className="font-sans text-sm max-w-[420px] mx-auto mb-9 text-creme/50">
            {lang === "pt"
              ? "O diagnóstico é grátis. Vês o teu mapa, decides se queres fazer a travessia."
              : "The diagnostic is free. See your map, then decide if you want to make the crossing."}
          </p>
          <Link
            href={`/${lang}/auth/register`}
            className="inline-block bg-creme text-barro px-11 py-4 rounded-full text-base font-normal tracking-wide transition-transform hover:-translate-y-0.5"
          >
            {lang === "pt" ? "Fazer o diagnóstico grátis" : "Take the free diagnostic"}
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-carvao text-[#9C8E80] text-center py-9 px-6 text-sm">
        <p>
          FreeMe, {lang === "pt" ? "A Travessia da Mãe" : "A Mother's Crossing"}.{" "}
          {lang === "pt" ? "Um percurso de" : "A journey by"} Vivianne dos Santos.
        </p>
        <p className="mt-3">
          <a href="mailto:ola@viviannedossantos.com" className="text-[#C8A88E] hover:text-areia transition-colors">
            ola@viviannedossantos.com
          </a>
        </p>
      </footer>

      <SafetyButton label={dict.safety.helpNow} dict={dict.safety} />
    </>
  );
}
