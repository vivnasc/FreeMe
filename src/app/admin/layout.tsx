import "./admin.css";
import Link from "next/link";
import { getAdminEmail } from "@/lib/admin/auth";
import { AdminNavLink } from "./nav-link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const email = await getAdminEmail();

  if (!email) {
    return <div className="admin-body">{children}</div>;
  }

  return (
    <div className="admin-body">
      <div className="admin-shell">
        <aside className="admin-side">
          <Link href="/admin" className="admin-brand" style={{ textDecoration: "none" }}>
            <span className="brand-mark">✦</span>
            <span>FreeMe · Estúdio</span>
          </Link>
          <nav className="admin-nav">
            <AdminNavLink href="/admin" exact>
              <span className="nav-num">0</span> Studio
            </AdminNavLink>
            <AdminNavLink href="/admin/conteudo">
              <span className="nav-num">1</span> Conteúdo
            </AdminNavLink>
            <AdminNavLink href="/admin/imagens">
              <span className="nav-num">2</span> Imagens
            </AdminNavLink>
            <AdminNavLink href="/admin/slides">
              <span className="nav-num">3</span> Slides
            </AdminNavLink>
            <AdminNavLink href="/admin/distribuir">
              <span className="nav-num">4</span> Distribuir
            </AdminNavLink>
            <div style={{ height: 12 }} />
            <AdminNavLink href="/admin/biblioteca">
              <span className="nav-num">·</span> Biblioteca
            </AdminNavLink>
            <AdminNavLink href="/admin/audio">
              <span className="nav-num">·</span> Áudio (Studio)
            </AdminNavLink>
          </nav>
          <div className="admin-foot">
            <span className="muted">{email}</span>
            <Link href="/" className="muted" style={{ fontSize: 11 }}>← Voltar ao site</Link>
          </div>
        </aside>
        <main className="admin-main">{children}</main>
      </div>
    </div>
  );
}
