import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Welcome to ClassFlow
        </h1>
        <p className="text-gray-600">
          You are logged in as: {session.user?.email}
        </p>
      </div>
    </div>
  );
}
