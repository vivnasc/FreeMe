import { redirect } from "next/navigation";
import { getAdminEmail } from "@/lib/admin/auth";
import { SaudeClient } from "./client";

export default async function SaudePage() {
  const email = await getAdminEmail();
  if (!email) redirect("/admin");
  return <SaudeClient />;
}
