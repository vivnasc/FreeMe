import { redirect } from "next/navigation";
import { getAdminEmail } from "@/lib/admin/auth";
import { AcessosClient } from "./client";

export default async function AcessosPage() {
  const email = await getAdminEmail();
  if (!email) redirect("/admin");
  return <AcessosClient />;
}
