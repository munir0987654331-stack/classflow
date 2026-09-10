"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Student = {
  id: string;
  name: string | null;
  email: string;
};

export default function AttendanceForm({
  courseId,
  students,
}: {
  courseId: string;
  students: Student[];
}) {
  const [date, setDate] = useState("");
  const [present, setPresent] = useState<Record<string, boolean>>({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const togglePresent = (studentId: string) => {
    setPresent((prev) => ({ ...prev, [studentId]: !prev[studentId] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!date) {
      setError("Please select a date");
      return;
    }

    const records = students.map((s) => ({
      studentId: s.id,
      present: !!present[s.id],
    }));

    const res = await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, date, records }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong");
      return;
    }

    setSuccess("Attendance saved!");
    router.refresh();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-4 rounded shadow border border-gray-200 space-y-3 mb-6"
    >
      <h2 className="text-lg font-semibold text-gray-800">
        Mark Attendance
      </h2>

      {error && <p className="text-red-500 text-sm">{error}</p>}
      {success && <p className="text-green-600 text-sm">{success}</p>}

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="w-full border border-gray-300 rounded p-2"
        required
      />

      {students.length === 0 ? (
        <p className="text-gray-500 text-sm">No enrolled students yet.</p>
      ) : (
        <ul className="space-y-2">
          {students.map((s) => (
            <li
              key={s.id}
              className="flex justify-between items-center border border-gray-200 rounded p-2"
            >
              <span className="text-sm text-gray-700">
                {s.name || s.email}
              </span>
              <button
                type="button"
                onClick={() => togglePresent(s.id)}
                className={`text-xs px-3 py-1 rounded ${
                  present[s.id]
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {present[s.id] ? "Present" : "Absent"}
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Save Attendance
      </button>
    </form>
  );
}
