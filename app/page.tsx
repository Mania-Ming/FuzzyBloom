import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f2eef0] flex items-center justify-center">
      
      <div className="text-center max-w-md px-6">
        
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image
            src="/logo.jpg" 
            alt="Fuzzy Bloom Logo"
            width={200}
            height={200}
            className="rounded-full"
          />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">
          Handmade Flowers & Crafts <br /> made with Love
        </h1>

        <p className="text-gray-500 text-sm mb-8">
          Perfect for gifts, surprises, and special moments.
        </p>

        {/* Button */}
        <Link href="/login">
          <button className="bg-black text-white px-10 py-3 rounded-full hover:opacity-80 transition">
            Get Started
          </button>
        </Link>

      </div>

    </div>
  );
}