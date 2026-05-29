import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin/auth";
import { RenderJobsClient } from "./client";

export default async function RenderJobsPage() {
  if (!(await isAdmin())) redirect("/admin/auth");
  return <RenderJobsClient />;
}
