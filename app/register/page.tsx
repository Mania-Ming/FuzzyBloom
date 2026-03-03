"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();

    // fake register success
    alert("Registration Successful!");

    // redirect to login
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#f2eef0] flex items-center justify-center">
      <div className="bg-white p-10 rounded-2xl shadow-md w-full max-w-md">

        <h1 className="text-2xl font-semibold text-center text-gray-800">
          Welcome to Fuzzy Bloom
        </h1>

        <div className="flex justify-center gap-6 mt-4 mb-6 text-sm">
          <Link href="/login" className="text-gray-500">
            Login
          </Link>
          <span className="font-medium text-black border-b-2 border-black pb-1">
            Register
          </span>
        </div>

        <h2 className="text-lg font-medium mb-1">Create your account</h2>
        <p className="text-sm text-gray-500 mb-6">
          Registration is easy.
        </p>

        <form onSubmit={handleRegister} className="space-y-4">

          <input
            type="text"
            placeholder="Full Name"
            className="w-full px-4 py-2 border rounded-lg"
            required
          />

          <input
            type="email"
            placeholder="Email Address"
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
            Register
          </button>

        </form>
      </div>
    </div>
  );
}