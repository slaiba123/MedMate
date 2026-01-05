// 


"use client";

import React, { useState } from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const LoginForm = ({
  onSubmit,
  isLoading,
  error,
  title,
  subtitle,
}: any) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!email || !password) {
      setLocalError("Email and password are required");
      return;
    }

    if (!email.includes("@")) {
      setLocalError("Invalid email format");
      return;
    }

    await onSubmit(email, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl w-full max-w-md">
        <h1 className="text-xl font-bold text-center">{title}</h1>
        <p className="text-center text-sm text-gray-500">{subtitle}</p>

        {(error || localError) && (
          <div className="bg-red-100 text-red-700 p-3 mt-4 rounded">
            {error || localError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button disabled={isLoading} className="w-full">
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm">
          <a href="/update-password" className="text-blue-600">
            Forgot Password?
          </a>
        </p>
      </div>
    </div>
  );
};
