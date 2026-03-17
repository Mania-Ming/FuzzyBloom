"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { useLogin } from "@/lib/hooks/useLogin";

export default function LoginPage() {
  const router = useRouter();
  const { mutate: login, isPending, isError, error } = useLogin();

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login({ email, password }, {
      onSuccess: () => router.push("/dashboard"),
    })
  };

  return (
    <div className="min-h-screen bg-[#f2eef0] flex items-center justify-center">
      <div className="bg-white w-full max-w-md p-10 rounded-2xl shadow-lg text-gray-800">

        {/* Title */}
        <h1 className="text-2xl font-semibold text-center mb-3 text-gray-900">
          Welcome to Fuzzy Bloom
        </h1>

        {/* Tabs */}
        <div className="flex justify-center gap-6 text-sm mb-8">
          <span className="border-b-2 border-black pb-1 font-medium text-black">
            Login
          </span>
          <Link href="/register" className="text-gray-500 hover:text-black transition">
            Register
          </Link>
        </div>

        {/* Subtitle */}
        <h2 className="text-lg font-medium mb-1 text-gray-900">
          Login to your account
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Enter your credentials below.
        </p>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
            required
          />

          {isError && (
            <p className="text-red-500 text-sm">
              {(error as any)?.response?.data?.detail ?? "Login failed. Please try again."}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-black text-white py-3 rounded-full hover:opacity-80 transition disabled:opacity-50"
          >
            {isPending ? "Logging in..." : "Login"}
          </button>
        </form>

      </div>
    </div>
  );
}
