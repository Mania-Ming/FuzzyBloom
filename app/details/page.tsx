"use client"

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function ProductDetails() {

  const [menuOpen,setMenuOpen] = useState(false)

  const product = {
    name: "Lavender Grace",
    price: "₱499",
    img: "/p1.png",
    qty: 1
  }


  // ADD TO CART
  function addToCart(){

    const cart = JSON.parse(localStorage.getItem("cart") || "[]")

    cart.push(product)

    localStorage.setItem("cart",JSON.stringify(cart))

    alert("Added to Cart!")

  }


  // ADD TO WISHLIST
  function addToWishlist(){

    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]")

    wishlist.push(product)

    localStorage.setItem("wishlist",JSON.stringify(wishlist))

    alert("Added to Wishlist!")

  }



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



      {/* PRODUCT DETAILS */}
      <div className="px-20 py-14 grid grid-cols-2 gap-16 items-start">

        {/* IMAGE */}
        <div className="bg-white rounded-xl p-8 shadow flex justify-center">

          <Image
            src="/p1.png"
            alt="Lavender Grace"
            width={320}
            height={320}
          />

        </div>


        {/* INFO */}
        <div>

          <h2 className="text-3xl font-semibold mb-3">
            Lavender Grace
          </h2>

          <p className="text-gray-700 mb-3">
            Soft pink pom-pom flowers, sweet and cute design
          </p>

          <p className="text-gray-600 mb-4">
            Handmade bouquet crafted with care and creativity,
            perfect for expressing gentle love and appreciation.
          </p>


          <div className="mb-6 text-sm">
            <p>Perfect for Gifts</p>
            <p>Anniversary / Birthday</p>
            <p>Handmade with Love</p>
          </div>


          <div className="bg-[#efe6ea] rounded-xl p-4 text-sm mb-6">

            <p><b>Product Details</b></p>
            <p>Type: Handmade Pipe Cleaner Bouquet</p>
            <p>Color Theme: Lavender & Soft Pink</p>
            <p>Size: Medium</p>
            <p>Material: Pipe cleaner flowers, premium wrap, ribbon</p>

          </div>


          <div className="flex items-center gap-4 mb-4">

            <p className="text-3xl text-red-600 font-bold">
              ₱499
            </p>

            <p className="text-sm text-gray-600">
              Limited handmade stocks available
            </p>

          </div>


          {/* BUTTONS */}
          <div className="flex gap-4">

            <button
              onClick={addToWishlist}
              className="bg-[#e6cfd8] px-5 py-2 rounded-full text-sm"
            >
              Add to Wishlist
            </button>

            <button
              onClick={addToCart}
              className="bg-[#e6cfd8] px-5 py-2 rounded-full text-sm"
            >
              Add to Cart
            </button>

          </div>

        </div>

      </div>



      {/* FOOTER */}
      <div className="bg-[#d8ced6] px-16 py-12 text-sm text-black">

        <div className="grid grid-cols-3 items-start">

          <div className="flex gap-4">
            <Image
              src="/logo.jpg"
              alt="Logo"
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
          Copyright © 2026. Fuzzy Bloom Handicrafts by Kate.
        </p>

      </div>

    </div>
  );
}