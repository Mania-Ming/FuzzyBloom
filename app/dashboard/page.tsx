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

      {/* ================= HERO SECTION ================= */}
      <div className="bg-[#d8ced6] px-20 py-16 flex justify-between items-center">

        <div className="max-w-xl">
          <h1
            className="text-5xl mb-4 text-black"
            style={{ fontFamily: "var(--font-pacifico)" }}
          >
            Fuzzy Bloom
          </h1>

          <p className="leading-relaxed mb-6 text-black">
            Handicrafts by Kate <br />
            Ms. Kate Dorraine Ceniza <br />
            Founder and Handmade Artist of Fuzzy Bloom,
            passionately creating handmade floral crafts
            and decorative pieces inspired by nature.
          </p>

          <Link href="/all-products">
            <button className="bg-black text-white px-10 py-3 rounded-full hover:opacity-80 transition">
              Shop now
            </button>
          </Link>

        </div>

        <Image
          src="/logo.jpg"
          alt="Fuzzy Bloom Logo"
          width={240}
          height={240}
          className="rounded-full"
        />

      </div>

      {/* ================= CATEGORIES ================= */}
      <div className="py-20 text-center">

        <h2 className="text-xl font-semibold mb-12 text-black">
          Jump into featured interest
        </h2>

        <div className="flex justify-center gap-20">

          {[
            { name: "Bouquets", img: "/c1.png" },
            { name: "Flower", img: "/c2.png" },
            { name: "Ribbon", img: "/c3.png" },
            { name: "Headbands", img: "/c4.png" },
          ].map((cat, index) => (
            <div key={index} className="flex flex-col items-center w-[180px]">

              <div className="h-[150px] flex items-center justify-center">
                <Image
                  src={cat.img}
                  alt={cat.name}
                  width={130}
                  height={130}
                  className="object-contain"
                />
              </div>

              <p
                className="mt-4 text-xl text-black"
                style={{ fontFamily: "var(--font-pacifico)" }}
              >
                {cat.name}
              </p>

            </div>
          ))}

        </div>

      </div>

      {/* ================= PRODUCTS ================= */}
      <div className="text-center pb-24">

        <h2
          className="text-3xl mb-14 text-black"
          style={{ fontFamily: "var(--font-pacifico)" }}
        >
          Kate Handicrafts
        </h2>

        <div className="flex justify-center gap-14 flex-wrap">

          {[
            {
              name: "Lavender Grace",
              img: "/p1.png",
              price: "₱499",
              desc: "Soft pink pom-pom flowers, sweet and cute design",
            },
            {
              name: "Ruby & Sky",
              img: "/p2.png",
              price: "₱599",
              desc: "Red and baby blue tulips, bold but balanced",
            },
            {
              name: "Mint Serenity",
              img: "/p3.png",
              price: "₱569",
              desc: "Mint green tulips, clean and modern look",
            },
          ].map((product, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-2xl shadow-md w-[320px] hover:shadow-xl transition"
            >

              <Image
                src={product.img}
                alt={product.name}
                width={260}
                height={260}
                className="mx-auto"
              />

              <h3 className="mt-5 font-semibold text-lg text-black">
                {product.name}
              </h3>

              <p className="text-sm text-gray-700 mt-2">
                {product.desc}
              </p>

              <p className="text-black font-bold text-xl mt-3">
                {product.price}
              </p>

            </div>
          ))}

        </div>

        <Link href="/all-products">
          <button className="bg-black text-white px-12 py-3 rounded-full mt-16 hover:opacity-80 transition">
            View All Products
          </button>
        </Link>

      </div>

      {/* ================= FOOTER ================= */}
      <div className="bg-[#d8ced6] px-16 py-12 text-sm text-black">

        <div className="grid grid-cols-3 items-start">

          <div className="flex gap-4">
            <Image
              src="/logo.jpg"
              alt="Fuzzy Bloom Logo"
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

          <div className="text-center">
            <p className="font-medium">Kate Dorraine Ceniza</p>
            <p>katedorraineceniza@gmail.com</p>
          </div>

          <div className="text-right space-y-1">
            <p>About Us</p>
            <p>Category</p>
            <p>Shop</p>
            <p>Policies</p>
          </div>

        </div>

        <p className="text-center mt-8 text-gray-700">
          Copyright © 2026. Fuzzy Bloom Handicrafts by Kate. All right reserved.
        </p>

      </div>

    </div>
  );
}