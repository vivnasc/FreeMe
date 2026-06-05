// Verificacao de setup do FreeMe: corre LOCALMENTE (onde nao ha allowlist de rede).
// Le .env.local, confirma as 5 tabelas, o trigger de criacao de perfil e a auth.
//
//   node scripts/verify-freeme.mjs
//
// Nao altera dados de producao: cria um utilizador de teste e apaga-o no fim.

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv() {
  const raw = readFileSync(join(root, ".env.local"), "utf8");
  const env = {};
  for (const line of raw.split("\n")) {
    if (!line.includes("=") || line.trim().startsWith("#")) continue;
    const i = line.indexOf("=");
    env[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return env;
}

const env = loadEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const svc = env.FREEME_SUPABASE_SERVICE_ROLE_KEY;

if (!url || !svc || svc.startsWith("your-")) {
  console.error("\n  Faltam credenciais no .env.local (NEXT_PUBLIC_SUPABASE_URL e FREEME_SUPABASE_SERVICE_ROLE_KEY).\n");
  process.exit(1);
}

const sb = createClient(url, svc, { auth: { persistSession: false } });
const tables = [
  "freeme_profiles",
  "freeme_diagnostics",
  "freeme_journeys",
  "freeme_blocker_progress",
  "freeme_annotations",
];

let problems = 0;

console.log("\n== Tabelas ==");
for (const t of tables) {
  const { error, count } = await sb.from(t).select("*", { count: "exact", head: true });
  if (error) {
    problems++;
    console.log(`  [FALTA] ${t}: ${error.message}`);
  } else {
    console.log(`  [OK]    ${t} (${count} linhas)`);
  }
}

console.log("\n== Auth + trigger de perfil ==");
const email = `teste+${Date.now()}@freeme-test.local`;
const { data: created, error: cErr } = await sb.auth.admin.createUser({
  email,
  password: "Teste123!forte",
  email_confirm: true,
  user_metadata: { locale: "pt" },
});

if (cErr) {
  problems++;
  console.log(`  [FALHA] criar utilizador: ${cErr.message}`);
} else {
  const uid = created.user.id;
  console.log(`  [OK]    utilizador de teste criado`);
  await new Promise((r) => setTimeout(r, 1500));
  const { data: prof } = await sb.from("freeme_profiles").select("locale, paid").eq("id", uid).maybeSingle();
  if (prof) {
    console.log(`  [OK]    trigger criou o perfil (locale=${prof.locale}, paid=${prof.paid})`);
  } else {
    problems++;
    console.log(`  [FALTA] o trigger nao criou o perfil (freeme_on_auth_user_created em falta?)`);
  }
  // limpeza: apaga o utilizador de teste (cascade remove o perfil)
  await sb.auth.admin.deleteUser(uid);
  console.log(`  [OK]    utilizador de teste removido (limpeza)`);
}

if (problems === 0) {
  console.log("\n  Tudo verde. Schema pronto. Corre 'npm run dev' e abre http://localhost:3000\n");
} else {
  console.log(`\n  ${problems} problema(s). Abre o SQL Editor do Supabase e corre supabase/schema.sql.\n`);
  process.exit(1);
}
