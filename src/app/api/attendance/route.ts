import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any)?.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId, date, records } = await req.json();

    if (!courseId || !date || !Array.isArray(records)) {
      return NextResponse.json(
        { error: "courseId, date, and records are required" },
        { status: 400 }
      );
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course || course.teacherId !== (session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const attendanceDate = new Date(date);

    for (const record of records) {
      await prisma.attendance.upsert({
        where: {
          courseId_studentId_date: {
            courseId,
            studentId: record.studentId,
            date: attendanceDate,
          },
        },
        update: {
          present: record.present,
        },
        create: {
          courseId,
          studentId: record.studentId,
          date: attendanceDate,
          present: record.present,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json(
        { error: "courseId is required" },
        { status: 400 }
      );
    }

    const role = (session.user as any)?.role;
    const userId = (session.user as any)?.id;

    if (role === "STUDENT") {
      const records = await prisma.attendance.findMany({
        where: { courseId, studentId: userId },
      });
      return NextResponse.json(records);
    }

    const allRecords = await prisma.attendance.findMany({
      where: { courseId },
    });
    return NextResponse.json(allRecords);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
