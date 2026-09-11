import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const role = (session.user as any)?.role;

  if (role !== "ADMIN") {
    redirect("/dashboard");
  }

  const totalUsers = await prisma.user.count();
  const totalTeachers = await prisma.user.count({
    where: { role: "TEACHER" },
  });
  const totalStudents = await prisma.user.count({
    where: { role: "STUDENT" },
  });
  const courses = await prisma.course.findMany({
    include: { teacher: true },
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">
        Admin Dashboard
      </h1>
      <p className="text-gray-600 mb-6">
        Welcome, {session.user?.name || session.user?.email}
      </p>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow border border-gray-200 text-center">
          <p className="text-2xl font-bold text-gray-800">{totalUsers}</p>
          <p className="text-sm text-gray-500">Total Users</p>
        </div>
        <div className="bg-white p-4 rounded shadow border border-gray-200 text-center">
          <p className="text-2xl font-bold text-gray-800">
            {totalTeachers}
          </p>
          <p className="text-sm text-gray-500">Teachers</p>
        </div>
        <div className="bg-white p-4 rounded shadow border border-gray-200 text-center">
          <p className="text-2xl font-bold text-gray-800">
            {totalStudents}
          </p>
          <p className="text-sm text-gray-500">Students</p>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-3">
          All Courses
        </h2>
        {courses.length === 0 ? (
          <p className="text-gray-500">No courses yet.</p>
        ) : (
          <ul className="space-y-2">
            {courses.map((course) => (
              <li
                key={course.id}
                className="bg-white p-4 rounded shadow border border-gray-200"
              >
                <p className="font-medium text-gray-800">
                  {course.title}
                </p>
                <p className="text-sm text-gray-500">
                  Teacher: {course.teacher.name || course.teacher.email}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
