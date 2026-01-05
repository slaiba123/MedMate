"use client";

import { useState } from "react";

export default function UpdatePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/update-password`,
        {
          method: "PUT",
          credentials: "include", // ✅ SEND COOKIE
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setMessage("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      setError(err.message || "Password update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 shadow rounded">
      <h2 className="text-xl font-semibold mb-4">Update Password</h2>

      {message && <p className="text-green-600 mb-3">{message}</p>}
      {error && <p className="text-red-600 mb-3">{error}</p>}

      <input
        type="password"
        placeholder="Current Password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        className="w-full mb-3 p-2 border rounded"
      />

      <input
        type="password"
        placeholder="New Password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        className="w-full mb-3 p-2 border rounded"
      />

      <button
        onClick={handleUpdate}
        disabled={loading}
        className="w-full bg-blue-600 text-white p-2 rounded"
      >
        {loading ? "Updating..." : "Update Password"}
      </button>
    </div>
  );
}
