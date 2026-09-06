import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect, notFound } from "next/navigation";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const course = await prisma.course.findUnique({
    where: { id },
  });

  if (!course) {
    notFound();
  }

  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  const isTeacher = role === "TEACHER" && course.teacherId === userId;

  let isEnrolled = false;
  if (role === "STUDENT") {
    const enrollment = await prisma.enrollment.findFirst({
      where: { courseId: id, studentId: userId },
    });
    isEnrolled = !!enrollment;
  }

  if (!isTeacher && !isEnrolled && role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <a
        href="/dashboard"
        className="text-blue-600 text-sm mb-4 inline-block"
      >
        ← Back to Dashboard
      </a>

      <h1 className="text-2xl font-bold text-gray-800 mb-1">
        {course.title}
      </h1>
      <p className="text-gray-600 mb-6">{course.description}</p>

      <div className="bg-white p-4 rounded shadow border border-gray-200">
        <p className="text-gray-500">
          Assignments and notes will appear here soon.
        </p>
      </div>
    </div>
  );
}
