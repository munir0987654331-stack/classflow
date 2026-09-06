import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import CourseForm from "./CourseForm";

const prisma = new PrismaClient();

export default async function TeacherDashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const role = (session.user as any)?.role;

  if (role !== "TEACHER") {
    redirect("/dashboard");
  }

  const courses = await prisma.course.findMany({
    where: { teacherId: (session.user as any).id },
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">
        Teacher Dashboard
      </h1>
      <p className="text-gray-600 mb-6">
        Welcome, {session.user?.name || session.user?.email}
      </p>

      <CourseForm />

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">
          Your Courses
        </h2>
        {courses.length === 0 ? (
          <p className="text-gray-500">No courses yet. Create one above.</p>
        ) : (
          <ul className="space-y-2">
            {courses.map((course) => (
              <li
                key={course.id}
                className="bg-white p-4 rounded shadow border border-gray-200"
              >
                <p className="font-medium text-gray-800">{course.title}</p>
                <p className="text-sm text-gray-500">{course.description}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
