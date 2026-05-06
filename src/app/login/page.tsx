import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AuthLayout } from "@/components/auth/AuthLayout";

export default async function Login() {
  const session = await getSession();
  if (session) redirect("/");

  return <AuthLayout />;
}
