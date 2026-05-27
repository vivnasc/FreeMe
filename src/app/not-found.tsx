import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-creme">
      <svg
        className="w-16 h-16 mb-8 opacity-40"
        viewBox="0 0 512 512"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M256 256 C256 210 220 180 180 180 C130 180 100 220 100 270 C100 340 150 390 220 390 C320 390 380 320 380 220 C380 130 310 70 220 70 C120 70 50 150 50 250 C50 380 150 470 290 470 C345 470 385 455 425 425"
          fill="none"
          stroke="#8C4A36"
          strokeWidth="13"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <h1 className="font-serif text-4xl text-barro mb-3">
        Esta página não existe.
      </h1>
      <p className="font-sans text-base text-carvao/50 mb-8 max-w-sm">
        Mas o teu lugar existe. Volta ao início.
      </p>
      <Link
        href="/pt"
        className="rounded-full bg-barro px-8 py-4 font-sans text-base font-medium text-creme transition-colors hover:bg-barro-symbol"
      >
        Voltar ao início
      </Link>
    </div>
  );
}
