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
        <div className="fixed top-0 left-0 w-64 h-full bg-white/20 backdrop-blur-md text-dark flex flex-col justify-center items-center space-y-8 text-2xl z-50">   
          <Link href="#">About</Link>
          <Link href="#">Contact</Link>
          <Link href="#">Terms</Link>
        </div>
      )}

      {/* ================= NAVBAR ================= */}
      <div className="sticky top-0 w-full h-[88px] bg-white flex items-center justify-between px-10 shadow-sm z-50">

        <div className="flex items-center gap-4">

          {/* LOGO → DASHBOARD */}
          <Link href="/dashboard">
            <Image
              src="/logo.jpg"
              alt="Logo"
              width={55}
              height={55}
              className="rounded-full cursor-pointer"
            />
          </Link>

          {/* HAMBURGER */}
          <div
            className="text-2xl cursor-pointer"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </div>

        </div>

        <div className="flex items-center border border-gray-300 rounded-full overflow-hidden w-[420px]">
          <input
            type="text"
            placeholder="Search"
            className="outline-none w-full px-5 py-2 text-sm"
          />
          <button className="bg-black text-white px-6 py-2 text-sm">
            Search
          </button>
        </div>

        <div className="flex items-center gap-8 font-medium">
          <Link href="#">Wishlist</Link>
          <Link href="#">Cart</Link>
          <Link href="/">Logout</Link>
        </div>

      </div>

      {/* ================= TITLE ================= */}
      <div className="text-center py-10">
        <h1
          className="text-4xl"
          style={{ fontFamily: "var(--font-pacifico)" }}
        >
          Kate Handicrafts
        </h1>
      </div>

      {/* ================= REST OF YOUR CODE (UNCHANGED) ================= */}

      {/* ================= BOUQUETS ================= */}
      <div className="px-16 mb-16">

        <h2
          className="text-2xl mb-6"
          style={{ fontFamily: "var(--font-pacifico)" }}
        >
          Bouquets
        </h2>
        <p className="text-sm mb-4 text-gray-600">
          Handmade floral keychain with soft pipe-cleaner petals and pearl accent.
          Available in assorted colors.
        </p>

        <div className="grid grid-cols-5 gap-8">

          {[
            { name:"Lavender Grace", img:"/p1.png", price:"₱499", desc:"Soft pink pom-pom flowers, sweet and cute design" },
            { name:"Ruby & Sky", img:"/p2.png", price:"₱499", desc:"Red and baby blue tulips, bold but balanced" },
            { name:"Mint Serenity", img:"/p3.png", price:"₱499", desc:"Mint green tulips, clean and modern look" },
            { name:"Baby Blue Bliss", img:"/p4.png", price:"₱499", desc:"Sky-blue pom-pom flowers, fresh and minimalist" },
            { name:"Golden Sun", img:"/p5.png", price:"₱499", desc:"Yellow blossoms bright and cheerful bouquet" },
          ].map((item,i)=>(
            <div key={i} className="bg-white p-4 rounded-xl shadow text-center">

              <Image
                src={item.img}
                alt={item.name}
                width={200}
                height={200}
                className="mx-auto"
              />

              <h3 className="mt-3 font-semibold">{item.name}</h3>

              {/* DESCRIPTION */}
              <p className="text-sm text-gray-600 mt-1">
                {item.desc}
              </p>

              <p className="text-red-600 font-bold mt-2">{item.price}</p>

              <button className="mt-2 text-sm bg-[#f3d9e5] px-4 py-1 rounded-full">
                Add to Cart
              </button>

            </div>
          ))}

        </div>
      </div>

      {/* ================= FLOWER KEYCHAINS ================= */}
      <div className="px-16 mb-16">

        <h2
          className="text-2xl mb-2"
          style={{ fontFamily: "var(--font-pacifico)" }}
        >
          Flower Keychains
        </h2>

        <p className="text-sm mb-2 text-gray-600">
          Petal Pop Keychain
        </p>

        <p className="text-sm mb-4 text-gray-600">
          Handmade floral keychain with soft pipe-cleaner petals and pearl accent.
          Available in assorted colors.
        </p>

        <p className="text-red-600 font-bold text-xl mb-2">₱129</p>

        <p className="text-sm text-gray-500 mb-4">
          We can customize colors.
        </p>

        <button className="mb-6 text-sm bg-[#f3d9e5] px-4 py-2 rounded-full">
          Add to Cart
        </button>

        <div className="grid grid-cols-6 gap-6">

          {[
            "/k1.png",
            "/k2.png",
            "/k3.png",
            "/k4.png",
            "/k5.png",
            "/k6.png",
          ].map((img,i)=>(
            <div key={i} className="bg-white p-3 rounded-lg shadow">

              <Image
                src={img}
                alt="keychain"
                width={150}
                height={150}
              />

            </div>
          ))}

        </div>

      </div>

      {/* ================= RIBBON KEYCHAINS ================= */}
      <div className="px-16 mb-16">

        <h2
          className="text-2xl mb-2"
          style={{ fontFamily: "var(--font-pacifico)" }}
        >
          Ribbon Keychains
        </h2>

        <p className="text-sm mb-2 text-gray-600">
          Pearl Bow Keychain
        </p>

        <p className="text-sm mb-4 text-gray-600">
          Handmade fluffy ribbon keychain with pearl center. Soft, cute, and perfect for bags, keys, or gifts.
        </p>

        <p className="text-red-600 font-bold text-xl mb-2">₱99</p>

        <p className="text-sm text-gray-500 mb-4">
          We can customize colors.
        </p>

        <button className="mb-6 text-sm bg-[#f3d9e5] px-4 py-2 rounded-full">
          Add to Cart
        </button>

        <div className="grid grid-cols-6 gap-6">

          {[
            "/r1.png",
            "/r2.png",
            "/r3.png",
            "/r4.png",
            "/r5.png",
          ].map((img,i)=>(
            <div key={i} className="bg-white p-3 rounded-lg shadow">

              <Image
                src={img}
                alt="keychain"
                width={150}
                height={150}
              />

            </div>
          ))}

        </div>

      </div>


      {/* ================= HEADBANDS ================= */}
      <div className="px-16 mb-16">

        <h2
          className="text-2xl mb-2"
          style={{ fontFamily: "var(--font-pacifico)" }}
        >
          Headband
        </h2>

        <p className="text-sm mb-2 text-gray-600">
          Sunflower Bloom Headband
        </p>

        <p className="text-sm mb-4 text-gray-600">
          (Handmade fluffy headband with sunflower details. Cute, comfy, and perfect for daily wear or gifts.)
        </p>

        <p className="text-red-600 font-bold text-xl mb-2">₱99</p>

        <p className="text-sm text-gray-500 mb-4">
          We can customize colors.
        </p>

        <button className="mb-6 text-sm bg-[#f3d9e5] px-4 py-2 rounded-full">
          Add to Cart
        </button>

        <div className="grid grid-cols-4 gap-8">

          <div className="bg-white p-4 rounded-xl shadow text-center">

            <Image
              src="/h1.png"
              alt="headband"
              width={200}
              height={200}
              className="mx-auto"
            />

          </div>

        </div>

      </div>
            {/* ================= FOOTER ================= */}
                  <div className="bg-[#d8ced6] px-16 py-12 text-sm text-black">
            
                    <div className="grid grid-cols-3 items-start">
            
                      {/* LEFT */}
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
            
                      {/* CENTER */}
                      <div className="text-center">
                        <p className="font-medium">Kate Dorraine Ceniza</p>
                        <p>katedorraineceniza@gmail.com</p>
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
                      Copyright © 2026. Fuzzy Bloom Handicrafts by Kate. All right reserved.
                    </p>
                  </div>
    </div>
  );
}