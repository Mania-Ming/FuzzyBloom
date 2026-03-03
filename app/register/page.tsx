"use client";

import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#f2eef0] flex items-center justify-center">
      
      <div className="bg-white p-10 rounded-2xl shadow-md w-full max-w-md">
        
        {/* Header */}
        <h1 className="text-2xl font-semibold text-center text-gray-800">
          Welcome to Fuzzy Bloom
        </h1>

        <div className="flex justify-center gap-6 mt-4 mb-6 text-sm">
          <Link href="/login" className="text-gray-500 hover:text-black">
            Login
          </Link>
          <span className="font-medium text-black border-b-2 border-black pb-1">
            Register
          </span>
        </div>

        <h2 className="text-lg font-medium text-gray-700 mb-1">
          Create your account
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Registration is easy.
        </p>

        {/* Form */}
        <form className="space-y-4">
          
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Full Name*
            </label>
            <input
              type="text"
              placeholder="Enter your full name"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Password *
            </label>
            <input
              type="password"
              placeholder="Create a password"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white py-3 rounded-full hover:opacity-80 transition mt-4"
          >
            Register
          </button>

        </form>
      </div>

    </div>
  );
}