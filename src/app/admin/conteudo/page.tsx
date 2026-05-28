import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin/auth";
import { AdminDashboard } from "../dashboard";

export default async function AdminConteudoPage() {
  if (!(await isAdmin())) redirect("/admin/auth");
  return <AdminDashboard />;
}
