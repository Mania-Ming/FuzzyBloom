"use client"

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function AllProducts() {

  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen text-black">

      
      {/* ================= SIDEBAR MENU ================= */}
      {menuOpen && (
        <div className="fixed left-0 top-[88px] w-64 h-[calc(100vh-88px)] bg-white shadow-lg flex flex-col items-center pt-16 space-y-8 text-xl z-40">

          <Link href="/about">About</Link>
          <Link href="#">Contact</Link>
          <Link href="#">Terms</Link>

        </div>
      )}

      {/* ================= NAVBAR ================= */}
      <div className="sticky top-0 w-full h-[88px] bg-white flex items-center justify-between px-10 shadow-sm z-50">

        {/* LEFT SIDE */}
        <div className="flex items-center gap-4">

          <Link href="/dashboard">
            <Image
              src="/logo.jpg"
              alt="logo"
              width={55}
              height={55}
              className="rounded-full"
            />
          </Link>

          {/* HAMBURGER */}
          <div
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-2xl cursor-pointer select-none"
          >
            ☰
          </div>

        </div>

        {/* SEARCH BAR */}
        <div className="flex items-center border border-gray-300 rounded-full overflow-hidden w-[420px]">

          <input
            type="text"
            placeholder="Search"
            className="outline-none w-full px-5 py-2 text-sm"
          />

          <button className="px-6 py-2 bg-black text-white text-sm">
            Search
          </button>

        </div>

        {/* RIGHT SIDE MENU */}
        <div className="flex items-center gap-8 font-medium">

          <Link href="/wishlist">
            Wishlist
          </Link>

          <Link href="/cart">
            Cart
          </Link>

          <Link href="/orders">
            Orders
          </Link>

          <Link href="/">
            Logout
          </Link>

        </div>

      </div>


      {/* ABOUT FUZZY BLOOM */}
      <div className="px-20 py-16 grid grid-cols-2 items-center gap-10">

        <div>

          <h1
            className="text-3xl mb-4"
            style={{fontFamily:"var(--font-pacifico)"}}
          >
            About Fuzzy Bloom
          </h1>

          <p className="text-gray-700 leading-relaxed">
            Fuzzy Bloom is a small handmade brand dedicated
            to creating soft, heartfelt floral crafts that turn
            simple moments into meaningful memories.
          </p>

        </div>

        <div className="flex justify-center">
          <Image
          src="/logo.jpg"
          alt="Fuzzy Bloom"
          width={140}
          height={140}
          className="rounded-full border-4 border-black"
        />
        </div>

      </div>



      {/* OUR STORY */}
      <div className="px-20 mb-20">

        <h2
          className="text-2xl text-center mb-10"
          style={{fontFamily:"var(--font-pacifico)"}}
        >
          Our Story
        </h2>

        <div className="grid grid-cols-2 gap-12 items-center">

          <Image
            src="/kate.jpg"
            alt="Kate"
            width={350}
            height={350}
            className="rounded-xl object-cover"
          />
          <div className="text-gray-700 leading-relaxed space-y-4">

            <p>
              Fuzzy Bloom was founded by <b>Kate Dorraine Ceniza</b>,
              a handmade artist inspired by flowers, creativity,
              and the joy of giving.
            </p>

            <p>
              What started as a simple craft hobby grew into a
              passion for designing floral bouquets, keychains,
              headbands, and accessories that are lovingly made by hand.
            </p>

            <p>
              Every piece is crafted with care, patience,
              and attention to detail because we believe
              handmade items carry warmth that mass-produced
              products never can.
            </p>

          </div>

        </div>

      </div>



      {/* WHAT WE CREATE */}
      <div className="px-20 mb-16">

        <h2
          className="text-2xl mb-4"
          style={{fontFamily:"var(--font-pacifico)"}}
        >
          What we Create
        </h2>

        <ul className="space-y-2 text-gray-700">
          <li>Handmade Bouquets</li>
          <li>Flower Keychains</li>
          <li>Ribbon Keychains</li>
          <li>Headbands</li>
        </ul>

      </div>



      {/* WHY CHOOSE */}
      <div className="px-20 mb-20">

        <h2
          className="text-2xl mb-4"
          style={{fontFamily:"var(--font-pacifico)"}}
        >
          Why Choose Fuzzy Bloom?
        </h2>

        <ul className="space-y-2 text-gray-700">
          <li>- Handmade with love</li>
          <li>- Quality over quantity</li>
          <li>- Soft, aesthetic designs</li>
          <li>- Supporting small handmade art</li>
          <li>- Creating meaningful gifts</li>
        </ul>

      </div>



      {/* FOOTER */}
      <div className="bg-[#d8ced6] px-16 py-12 text-sm text-black">

        <div className="grid grid-cols-3 items-start">

          {/* LEFT */}
          <div className="flex gap-4">

            <Image
              src="/logo.jpg"
              alt="logo"
              width={70}
              height={70}
              className="rounded-full"
            />

            <div>
              <p className="font-semibold">Fuzzy Bloom</p>
              <p>Handicrafts by Kate</p>
              <p>09054026505</p>
              <p>fuzzybloom@gmail.com</p>
            </div>

          </div>


          {/* CENTER */}
          <div className="text-center">
            <p className="font-medium">
              Kate Dorraine Ceniza
            </p>
            <p>
              katedorraineceniza@gmail.com
            </p>
          </div>


          {/* RIGHT */}
          <div className="text-right space-y-1">
            <p>About Us</p>
            <p>Category</p>
            <p>Shop</p>
            <p>Policies</p>
          </div>

        </div>

        <p className="text-center mt-8 text-gray-700">
          Copyright © 2026. Fuzzy Bloom Handicrafts by Kate.
          All right reserved.
        </p>

      </div>

    </div>

  )
}