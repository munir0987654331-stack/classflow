"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AssignmentForm({ courseId }: { courseId: string }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, courseId, dueDate }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong");
      return;
    }

    setTitle("");
    setDescription("");
    setDueDate("");
    router.refresh();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-4 rounded shadow border border-gray-200 space-y-3 mb-6"
    >
      <h2 className="text-lg font-semibold text-gray-800">
        Add Assignment
      </h2>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <input
        type="text"
        placeholder="Assignment title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border border-gray-300 rounded p-2"
        required
      />

      <textarea
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full border border-gray-300 rounded p-2"
      />

      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        className="w-full border border-gray-300 rounded p-2"
      />

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Add Assignment
      </button>
    </form>
  );
}
