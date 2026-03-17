"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import Navbar from "@/components/Navbar"
import ProtectedRoute from "@/components/ProtectedRoute"

type Product = {
name: string
img: string
}

export default function HeadbandsPage(){

const colors:Product[] = [
{ name:"Black", img:"/h1.png" },
{ name:"Pink", img:"/h2.png" },
{ name:"White", img:"/h3.png" },
{ name:"Purple", img:"/h4.png" },
{ name:"Blue", img:"/h5.png" }
]

const [selected,setSelected] = useState<Product>(colors[0])

/* ADD TO CART */

function addToCart(){

if(typeof window === "undefined") return

let cart = JSON.parse(localStorage.getItem("cart") || "[]")

cart.push({
name:"Headband - " + selected.name,
price:149,
img:selected.img,
qty:1
})

localStorage.setItem("cart",JSON.stringify(cart))

alert("Added to cart 🛒")

}

/* ADD TO WISHLIST */

function addToWishlist(){

if(typeof window === "undefined") return

let wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]")

wishlist.push({
name:"Headband - " + selected.name,
price:149,
img:selected.img
})

localStorage.setItem("wishlist",JSON.stringify(wishlist))

alert("Added to wishlist ❤️")

}

return(
<ProtectedRoute>
<div className="min-h-screen text-black">

<Navbar />

{/* PAGE CONTENT */}

<div className="max-w-7xl mx-auto px-6 md:px-16 pt-10">

{/* BACK BUTTON */}

<button
onClick={()=>window.history.back()}
className="text-sm mb-6 hover:underline"

>

← Back </button>

{/* BRAND */}

<h1
className="text-center text-4xl mb-10"
style={{ fontFamily: "var(--font-pacifico)" }}
>
Kate Handicrafts
</h1>

{/* CATEGORY */}

<div className="max-w-[1200px] mx-auto mb-10">

<h2
className="text-2xl"
style={{fontFamily:"var(--font-pacifico)"}}
>
Headbands
</h2>

<p className="text-gray-600 mt-1">
Choose your favorite headband color
</p>

</div>

{/* PRODUCT */}

<div className="grid grid-cols-1 md:grid-cols-2 gap-14 items-center max-w-[1200px] mx-auto">

{/* IMAGE */}

<div className="flex justify-center">

<Image
src={selected.img}
alt="Headband"
width={260}
height={260}
className="object-contain"
/>

</div>

{/* OPTIONS */}

<div>

<p className="text-red-500 font-bold text-2xl mb-6">
₱149
</p>

<p className="font-medium mb-3">
Choose Color
</p>

<div className="flex gap-4 mb-8 flex-wrap">

{colors.map((c,index)=>(

<div
key={index}
onClick={()=>setSelected(c)}
className={`cursor-pointer border rounded-lg p-2 ${
selected.name === c.name ? "border-black" : "border-gray-300"
}`}
>

<Image
src={c.img}
alt={c.name}
width={70}
height={70}
className="object-contain"
/>

</div>

))}

</div>

{/* BUTTONS */}

<div className="flex items-center gap-4">

<button
onClick={addToWishlist}
className="w-12 h-12 flex items-center justify-center border rounded-full hover:bg-gray-100"

>

❤️ </button>

<button
onClick={addToCart}
className="px-8 py-3 bg-pink-200 rounded-full hover:bg-pink-300 transition"

>

Add to Cart </button>

</div>

</div>

</div>

</div>

{/* FOOTER */}

<div className="mt-20 border-t pt-12 pb-6">

<div className="max-w-7xl mx-auto px-6 md:px-16 text-sm">

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 items-start">

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

<p>Our Story</p>
<p>Contact</p>

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

</div>
</ProtectedRoute>
)
}
