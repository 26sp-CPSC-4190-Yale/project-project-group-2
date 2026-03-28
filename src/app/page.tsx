import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { CalendarLayout } from "@/components/calendar/layout/CalendarLayout";

export default async function Home() {
  const session = await getSession();
  if (!session) redirect("/login");

  return <CalendarLayout />;
}
