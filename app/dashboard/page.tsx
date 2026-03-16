"use client"

import Image from "next/image";
import Link from "next/link";


export default function Dashboard() {

  const products = [
    {
      name: "Lavender Grace",
      img: "/p1.png",
      price: "₱499",
    },
    {
      name: "Rose Romance",
      img: "/p2.png",
      price: "₱549",
    },
    {
      name: "Daisy Delight",
      img: "/p3.png",
      price: "₱449",
    },
    {
      name: "Pink Petal Keychain",
      img: "/p4.png",
      price: "₱129",
    },
  ];

  
function addToCart(product:any){

let cart = JSON.parse(localStorage.getItem("cart") || "[]")

cart.push({
name: product.name,
price: product.price,
img: product.img,
qty:1
})

localStorage.setItem("cart",JSON.stringify(cart))

alert("Added to cart 🛒")

}

function addToWishlist(product:any){

let wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]")

wishlist.push(product)

localStorage.setItem("wishlist",JSON.stringify(wishlist))

alert("Added to wishlist ❤️")

}

  return (
    <div className="min-h-screen text-black">

      {/* NAVBAR */}
      <div className="sticky top-0 w-full h-[88px] flex items-center justify-between px-10 backdrop-blur-md bg-purple/25 z-25">

        <Link href="/dashboard">
          <Image
            src="/logo.jpg"
            alt="logo"
            width={50}
            height={50}
            className="rounded-full object-cover"
          />
        </Link>

        <div className="flex items-center gap-10 font-medium text-sm">

          <Link href="/about">
            About Us
          </Link>

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

      {/* HERO */}
<div className="bg-[#cfc6cf] px-50 py-10 flex items-center justify-between mx-0 mt-0">

  {/* LEFT TEXT */}
  <div className="max-w-md">

    <h1
      className="text-4xl mb-2"
      style={{ fontFamily: "var(--font-pacifico)" }}
    >
      Fuzzy Bloom
    </h1>

    <p className="text-sm mb-3">
      Handicrafts by Kate
    </p>

    <p className="text-sm mb-6 leading-relaxed">
      Ms. Kate Dorraine Ceniza <br />
      Founder and Handmade Artist of Fuzzy Bloom,
      passionately creating handmade floral crafts
      and decorative pieces inspired by nature,
      creativity, and the joy of meaningful gifts.
    </p>

    <Link href="/all-products">
      <button className="bg-black text-white px-8 py-2 rounded-full">
        Shop now
      </button>
    </Link>

  </div>

  {/* RIGHT LOGO */}
  <Image
    src="/logo.jpg"
    alt="Fuzzy Bloom Logo"
    width={180}
    height={180}
    className="rounded-full object-cover"
  />

</div>
{/* CATEGORIES */}
<div className="flex justify-center gap-20 py-16">

  {[
    { name: "Bouquets", icon: "🌸", link: "/bouquets" },
    { name: "Flower Keychains", icon: "🌼", link: "/flower-keychains" },
    { name: "Ribbon Keychains", icon: "🎀", link: "/ribbon-keychains" },
    { name: "Headbands", icon: "👑", link: "/headbands" },
  ].map((cat, index) => (

    <Link key={index} href={cat.link}>

      <div className="flex flex-col items-center cursor-pointer">

        <div className="w-[70px] h-[70px] rounded-full border border-gray-300 flex items-center justify-center text-2xl bg-white shadow-sm hover:scale-110 transition">

          {cat.icon}

        </div>

        <p className="text-sm mt-3">
          {cat.name}
        </p>

      </div>

    </Link>

  ))}

</div>


      {/* PRODUCTS */}
      <div className="px-16 mt-16">

        <h2
          className="text-3xl mb-10"
          style={{ fontFamily: "var(--font-pacifico)" }}
        >
          Hot Handicrafts
        </h2>

        <div className="grid grid-cols-4 gap-10">

          {products.map((product, index) => (

            <div
              key={index}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition"
            >

              <div className="h-[250px] flex items-center justify-center">
                <Image
                  src={product.img}
                  alt={product.name}
                  width={220}
                  height={220}
                  className="object-contain"
                />
              </div>

              {/* Added spacing here */}
              <div className="flex justify-between items-center mt-5">

                <div>

                  <p className="text-sm font-medium">
                    {product.name}
                  </p>

                  <p className="text-red-600 font-medium text-sm mt-1">
                    {product.price}
                  </p>

                </div>

                <div className="flex gap-3 text-lg">

                 <button
              onClick={() => addToWishlist(product)}
              className="hover:scale-125 transition"
              >
              ♡
              </button>

              <button
              onClick={() => addToCart(product)}
              className="hover:scale-125 transition"
              >
              🛒
              </button>

                </div>

              </div>

            </div>

          ))}

        </div>

        <div className="text-center mt-12">
          
                <Link 
      href="/bouquets"
      className="bg-[#4b2f2f] text-white px-8 py-2 rounded-full inline-block"
      >
      View All
      </Link>

        </div>

      </div>


      {/* FOOTER */}
      <div className="mt-20 border-t pt-12 px-16 pb-6 text-sm">

        <div className="grid grid-cols-4 items-start">

          <div className="flex gap-4">

            <Image
              src="/logo.jpg"
              alt="logo"
              width={70}
              height={70}
              className="rounded-full object-cover"
            />

            <div>

              <p className="font-semibold">
                Fuzzy Bloom
              </p>

              <p>
                Handicrafts by Kate
              </p>

              <p>
                fuzzybloom@gmail.com
              </p>

            </div>

          </div>

          <div>

            <p className="font-medium">
              Kate Dorrene Cristie
            </p>

            <p>
              katecristie@gmail.com
            </p>

            <p>
              katedorrene@yahoo.com
            </p>

          </div>

          <div>

            <p className="font-medium mb-2">
              About Us
            </p>

            <p>
              Our Story
            </p>

            <p>
              Contact
            </p>

          </div>

          <div>

            <p className="font-medium mb-2">
              Category
            </p>

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
  );
}