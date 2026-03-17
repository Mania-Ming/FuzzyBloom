"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { useRegister } from "@/lib/hooks/useRegister";

export default function RegisterPage() {
  const router = useRouter();
  const { mutate: register, isPending, isError, error } = useRegister();

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    register({ full_name: fullName, email, password }, {
      onSuccess: () => router.push("/login"),
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
          <Link href="/login" className="text-gray-500 hover:text-black transition">
            Login
          </Link>
          <span className="border-b-2 border-black pb-1 font-medium text-black">
            Register
          </span>
        </div>

        {/* Subtitle */}
        <h2 className="text-lg font-medium mb-1 text-gray-900">
          Create your account
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Registration is easy.
        </p>

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-4">

          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
            required
          />

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
              {error?.message ?? "Registration failed. Please try again."}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-black text-white py-3 rounded-full hover:opacity-80 transition disabled:opacity-50"
          >
            {isPending ? "Registering..." : "Register"}
          </button>

        </form>

      </div>
    </div>
  );
}