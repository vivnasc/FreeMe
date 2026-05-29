import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin/auth";
import { BibliotecaClient } from "./client";

export default async function BibliotecaPage() {
  if (!(await isAdmin())) redirect("/admin/auth");
  return <BibliotecaClient />;
}
