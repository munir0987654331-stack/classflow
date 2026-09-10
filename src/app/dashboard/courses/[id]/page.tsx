import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect, notFound } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import AssignmentForm from "./AssignmentForm";
import NoteForm from "./NoteForm";
import AttendanceForm from "./AttendanceForm";
import AnnouncementForm from "./AnnouncementForm";

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

  const assignments = await prisma.assignment.findMany({
    where: { courseId: id },
    orderBy: { dueDate: "asc" },
  });

  const notes = await prisma.note.findMany({
    where: { courseId: id },
    orderBy: { createdAt: "desc" },
  });

  const announcements = await prisma.announcement.findMany({
    where: { courseId: id },
    orderBy: { createdAt: "desc" },
  });

  let enrolledStudents: { id: string; name: string | null; email: string }[] = [];
  if (isTeacher) {
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId: id },
      include: { student: true },
    });
    enrolledStudents = enrollments.map((e) => ({
      id: e.student.id,
      name: e.student.name,
      email: e.student.email,
    }));
  }

  let attendancePercent: number | null = null;
  if (role === "STUDENT") {
    const records = await prisma.attendance.findMany({
      where: { courseId: id, studentId: userId },
    });
    if (records.length > 0) {
      const presentCount = records.filter((r) => r.present).length;
      attendancePercent = Math.round((presentCount / records.length) * 100);
    }
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

      {attendancePercent !== null && (
        <div className="bg-white p-4 rounded shadow border border-gray-200 mb-6">
          <p className="text-sm text-gray-600">Your Attendance</p>
          <p className="text-2xl font-bold text-gray-800">
            {attendancePercent}%
          </p>
        </div>
      )}

      {isTeacher && <AnnouncementForm courseId={course.id} />}

      <div className="bg-white p-4 rounded shadow border border-gray-200 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          Announcements
        </h2>
        {announcements.length === 0 ? (
          <p className="text-gray-500">No announcements yet.</p>
        ) : (
          <ul className="space-y-3">
            {announcements.map((a) => (
              <li
                key={a.id}
                className="border border-gray-200 rounded p-3"
              >
                <p className="font-medium text-gray-800">{a.title}</p>
                <p className="text-sm text-gray-500">{a.content}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {isTeacher && <AttendanceForm courseId={course.id} students={enrolledStudents} />}

      {isTeacher && <AssignmentForm courseId={course.id} />}

      <div className="bg-white p-4 rounded shadow border border-gray-200 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          Assignments
        </h2>
        {assignments.length === 0 ? (
          <p className="text-gray-500">No assignments yet.</p>
        ) : (
          <ul className="space-y-3">
            {assignments.map((a) => (
              <li
                key={a.id}
                className="border border-gray-200 rounded p-3"
              >
                <p className="font-medium text-gray-800">{a.title}</p>
                <p className="text-sm text-gray-500">{a.description}</p>
                {a.dueDate && (
                  <p className="text-xs text-gray-400 mt-1">
                    Due: {new Date(a.dueDate).toLocaleDateString()}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {isTeacher && <NoteForm courseId={course.id} />}

      <div className="bg-white p-4 rounded shadow border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          Notes
        </h2>
        {notes.length === 0 ? (
          <p className="text-gray-500">No notes yet.</p>
        ) : (
          <ul className="space-y-3">
            {notes.map((n) => (
              <li
                key={n.id}
                className="border border-gray-200 rounded p-3"
              >
                <p className="font-medium text-gray-800">{n.title}</p>
                <p className="text-sm text-gray-500 whitespace-pre-wrap">
                  {n.fileUrl}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
