"use client";

import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#f2eef0] flex items-center justify-center">
      
      <div className="bg-white p-10 rounded-2xl shadow-md w-full max-w-md">
        
        <h1 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          Login to Fuzzy Bloom
        </h1>

        <form className="space-y-4">
          
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white py-3 rounded-full hover:opacity-80 transition"
          >
            Login
          </button>
        </form>

        <p className="text-sm text-center text-gray-500 mt-6">
          Don’t have an account?{" "}
          <Link href="/register" className="text-black font-medium">
            Register
          </Link>
        </p>

      </div>

    </div>
  );
}