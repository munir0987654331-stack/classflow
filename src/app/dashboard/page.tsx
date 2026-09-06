import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const role = (session.user as any)?.role;

  if (role === "TEACHER") {
    redirect("/dashboard/teacher");
  } else if (role === "STUDENT") {
    redirect("/dashboard/student");
  } else if (role === "ADMIN") {
    redirect("/dashboard/admin");
  }

  return null;
}
