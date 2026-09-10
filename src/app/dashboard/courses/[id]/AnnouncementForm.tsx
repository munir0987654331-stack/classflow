"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AnnouncementForm({ courseId }: { courseId: string }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, courseId }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong");
      return;
    }

    setTitle("");
    setContent("");
    router.refresh();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-4 rounded shadow border border-gray-200 space-y-3 mb-6"
    >
      <h2 className="text-lg font-semibold text-gray-800">
        Post Announcement
      </h2>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <input
        type="text"
        placeholder="Announcement title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border border-gray-300 rounded p-2"
        required
      />

      <textarea
        placeholder="Announcement details"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full border border-gray-300 rounded p-2"
        rows={3}
      />

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Post Announcement
      </button>
    </form>
  );
}
