import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { FilesLayout } from "@/components/files/FilesLayout";

export default async function Files() {
  const session = await getSession();
  if (!session) redirect("/login");

  return <FilesLayout />;
}
