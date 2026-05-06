import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FilesLayout } from "@/components/files/FilesLayout";

export default async function Files() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [user] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.userId },
      select: { avatarUrl: true },
    }),
  ]);

  return <FilesLayout avatarUrl={user?.avatarUrl}/>;
}
