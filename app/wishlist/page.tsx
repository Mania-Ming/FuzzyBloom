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
          <Link href="/wishlist">Wishlist</Link>
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
          My Wishlist
        </h1>

        <p className="text-gray-600 mt-2">
          Your saved favorite handicrafts
        </p>

      </div>

      {/* ================= WISHLIST ITEMS ================= */}
      <div className="px-16 pb-20">

        <div className="grid grid-cols-4 gap-8">

          {[

            {
              name:"Lavender Grace",
              img:"/p1.png",
              price:"₱499"
            },

            {
              name:"Ruby & Sky",
              img:"/p2.png",
              price:"₱499"
            },

            {
              name:"Mint Serenity",
              img:"/p3.png",
              price:"₱499"
            },

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

              <p className="text-red-600 font-bold mt-2">{item.price}</p>

              <div className="flex justify-center gap-3 mt-3">

                <button className="bg-[#f3d9e5] px-4 py-1 rounded-full text-sm">
                  Add to Cart
                </button>

                <button className="bg-gray-200 px-4 py-1 rounded-full text-sm">
                  Remove
                </button>

              </div>

            </div>

          ))}

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