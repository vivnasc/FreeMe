import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin/auth";
import { AudioStudio } from "./audio-studio";

export default async function AudioPage() {
  if (!(await isAdmin())) redirect("/admin/auth");
  return <AudioStudio />;
}
