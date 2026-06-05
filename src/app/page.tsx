import { redirect } from "next/navigation";

// Em condicoes normais o proxy (src/proxy.ts) intercepta "/" e redireciona
// para o locale negociado por Accept-Language antes desta pagina renderizar.
// Isto fica apenas como fallback caso o proxy nao corra, e aponta para o
// mesmo defaultLocale do proxy ("pt").
export default function RootPage() {
  redirect("/pt");
}
