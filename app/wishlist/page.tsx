"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"

export default function WishlistPage() {

  const [wishlist, setWishlist] = useState<any[]>([])

  // LOAD WISHLIST
  useEffect(() => {
    try{
      const data = JSON.parse(localStorage.getItem("wishlist") || "[]")
      setWishlist(data)
    }catch{
      setWishlist([])
    }
  }, [])

  // REMOVE ITEM
  function removeItem(index:number){

    const updated = wishlist.filter((_,i) => i !== index)

    setWishlist(updated)

    localStorage.setItem("wishlist", JSON.stringify(updated))
  }

  // ADD TO CART
  function addToCart(item:any){

    let cart = JSON.parse(localStorage.getItem("cart") || "[]")

    const exist = cart.find((c:any)=>c.name === item.name)

    if(!exist){

      cart.push({...item, qty:1})

      localStorage.setItem("cart", JSON.stringify(cart))

      alert("Added to Cart 🛒")

    }else{

      alert("Already in Cart")

    }
  }

  return (
    <div className="min-h-screen flex flex-col text-black">

      {/* NAVBAR */}
      <div className="sticky top-0 w-full h-[88px] flex items-center justify-between px-6 md:px-10 backdrop-blur-md bg-white/30 z-20">

        <Link href="/dashboard">
          <Image
            src="/logo.jpg"
            alt="logo"
            width={55}
            height={55}
            className="rounded-full"
          />
        </Link>

        <div className="flex items-center gap-6 md:gap-10 font-medium text-sm">

          <Link href="/about">About Us</Link>
          <Link href="/wishlist">Wishlist</Link>
          <Link href="/cart">Cart</Link>
          <Link href="/orders">Orders</Link>
          <Link href="/">Logout</Link>

        </div>

      </div>


      {/* TITLE */}
      <div className="px-6 md:px-20 pt-12 pb-6">

        <h1
          className="text-3xl md:text-4xl"
          style={{ fontFamily: "var(--font-pacifico)" }}
        >
          Wishlist
        </h1>

      </div>


      {/* WISHLIST ITEMS */}
      <div className="px-6 md:px-20 pb-20 space-y-6">

        {wishlist.length === 0 && (
          <p className="text-center text-gray-500 py-20">
            Your wishlist is empty
          </p>
        )}

        {wishlist.map((item,index)=>(

          <div
            key={index}
            className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow"
          >

            {/* LEFT SIDE */}
            <div className="flex items-center gap-5">

              <Image
                src={item.img || "/logo.jpg"}
                alt={item.name}
                width={80}
                height={80}
                className="rounded-lg"
              />

              <div>

                <h3 className="font-semibold text-lg">
                  {item.name}
                </h3>

                <p className="text-red-600 font-bold mt-1">
                  ₱{item.price}
                </p>

              </div>

            </div>


            {/* RIGHT SIDE BUTTONS */}
            <div className="flex items-center gap-3">

              <button
                onClick={()=>addToCart(item)}
                className="bg-[#4b343b] text-white px-4 py-2 rounded-lg text-sm hover:opacity-90"
              >
                🛒
              </button>

              <button
                onClick={()=>removeItem(index)}
                className="bg-gray-200 px-4 py-2 rounded-lg text-sm hover:bg-gray-300"
              >
                🗑
              </button>

            </div>

          </div>

        ))}

      </div>


      {/* FOOTER */}
      <div className="mt-auto border-t pt-12 px-6 md:px-16 pb-6 text-sm">

        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 items-start">

          <div className="flex gap-4">

            <Image
              src="/logo.jpg"
              alt="logo"
              width={70}
              height={70}
              className="rounded-full object-cover"
            />

            <div>
              <p className="font-semibold">Fuzzy Bloom</p>
              <p>Handicrafts by Kate</p>
              <p>fuzzybloom@gmail.com</p>
            </div>

          </div>

          <div>
            <p className="font-medium">Kate Dorrene Cristie</p>
            <p>katecristie@gmail.com</p>
            <p>katedorrene@yahoo.com</p>
          </div>

          <div>
            <p className="font-medium mb-2">About Us</p>
            <p>Our Story</p>
            <p>Contact</p>
          </div>

          <div>
            <p className="font-medium mb-2">Category</p>
            <p>Bouquets</p>
            <p>Flower Keychains</p>
            <p>Ribbon Keychains</p>
            <p>Headbands</p>
          </div>

        </div>

        <p className="text-center mt-10 text-gray-500 text-xs">
          Copyright © 2026. Fuzzy Bloom Handicrafts by Kate.
        </p>

      </div>

    </div>
  )
}