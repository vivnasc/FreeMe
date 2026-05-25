import { Outfit } from "next/font/google";
import "../globals.css";

const outfit = Outfit({ subsets: ["latin", "latin-ext"], variable: "--font-outfit" });

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt" className={`${outfit.variable} h-full`}>
      <body className="min-h-full bg-carvao text-creme font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
