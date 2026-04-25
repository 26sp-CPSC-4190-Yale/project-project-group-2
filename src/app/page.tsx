import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CalendarLayout } from "@/components/calendar/layout/CalendarLayout";

export default async function Home() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [calendars, user] = await Promise.all([
    prisma.calendar.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "asc" },
      select: { id: true, title: true, isDefault: true },
    }),
    prisma.user.findUnique({
      where: { id: session.userId },
      select: { avatarUrl: true },
    }),
  ]);

  return <CalendarLayout calendars={calendars} avatarUrl={user?.avatarUrl} />;
}
