import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import EnrollButton from "./EnrollButton";

const prisma = new PrismaClient();

export default async function StudentDashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const role = (session.user as any)?.role;

  if (role !== "STUDENT") {
    redirect("/dashboard");
  }

  const studentId = (session.user as any).id;

  const allCourses = await prisma.course.findMany();
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId },
    include: { course: true },
  });

  const enrolledCourseIds = enrollments.map((e) => e.courseId);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">
        Student Dashboard
      </h1>
      <p className="text-gray-600 mb-6">
        Welcome, {session.user?.name || session.user?.email}
      </p>

      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">
          My Courses
        </h2>
        {enrollments.length === 0 ? (
          <p className="text-gray-500">
            You are not enrolled in any courses yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {enrollments.map((e) => (
              <li
                key={e.id}
                className="bg-white p-4 rounded shadow border border-gray-200"
              >
                <p className="font-medium text-gray-800">
                  {e.course.title}
                </p>
                <p className="text-sm text-gray-500">
                  {e.course.description}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-3">
          Available Courses
        </h2>
        {allCourses.length === 0 ? (
          <p className="text-gray-500">No courses available yet.</p>
        ) : (
          <ul className="space-y-2">
            {allCourses.map((course) => (
              <li
                key={course.id}
                className="bg-white p-4 rounded shadow border border-gray-200 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium text-gray-800">
                    {course.title}
                  </p>
                  <p className="text-sm text-gray-500">
                    {course.description}
                  </p>
                </div>
                {enrolledCourseIds.includes(course.id) ? (
                  <span className="text-green-600 text-sm font-medium">
                    Enrolled
                  </span>
                ) : (
                  <EnrollButton courseId={course.id} />
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
