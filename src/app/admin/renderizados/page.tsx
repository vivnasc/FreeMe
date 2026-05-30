import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin/auth";
import { RenderizadosClient } from "./client";

export default async function RenderizadosPage() {
  if (!(await isAdmin())) redirect("/admin/auth");
  return <RenderizadosClient />;
}
