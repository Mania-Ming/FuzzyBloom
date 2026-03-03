"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#f2eef0] flex items-center justify-center">
      <div className="bg-white w-full max-w-md p-10 rounded-2xl shadow-md">

        <h1 className="text-2xl font-semibold text-center mb-2">
          Welcome to Fuzzy Bloom
        </h1>

        {/* Tabs */}
        <div className="flex justify-center gap-6 text-sm mb-6">
          <span className="border-b-2 border-black pb-1 font-medium">
            Login
          </span>
          <Link href="/register" className="text-gray-500 hover:text-black">
            Register
          </Link>
        </div>

        <h2 className="text-lg font-medium mb-1">
          Login to your account
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Enter your credentials below.
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email Address"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            required
          />

          <button
            type="submit"
            className="w-full bg-black text-white py-3 rounded-full hover:opacity-80 transition"
          >
            Login
          </button>
        </form>

      </div>
    </div>
  );
}