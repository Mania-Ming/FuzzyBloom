"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // fake login success
    alert("Login Successful!");

    // redirect to dashboard
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#f2eef0] flex items-center justify-center">
      <div className="bg-white p-10 rounded-2xl shadow-md w-full max-w-md">

        <h1 className="text-2xl font-semibold text-center mb-6">
          Login to Fuzzy Bloom
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">

          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 border rounded-lg"
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 border rounded-lg"
            required
          />

          <button
            type="submit"
            className="w-full bg-black text-white py-3 rounded-full"
          >
            Login
          </button>

        </form>

        <p className="text-sm text-center mt-6">
          Don’t have an account?{" "}
          <Link href="/register" className="text-black font-medium">
            Register
          </Link>
        </p>

      </div>
    </div>
  );
}