"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

export default function BouquetsPage(){

const [menuOpen,setMenuOpen] = useState(false)

const products = [

{
name:"Lavender Grace",
desc:"Soft pink pom-pom flowers, sweet & cute",
price:499,
img:"/p1.png"
},

{
name:"Ruby & Sky",
desc:"Red and baby blue tulips, bold but balanced",
price:499,
img:"/p2.png"
},

{
name:"Mint Serenity",
desc:"Mint green tulips, clean and modern look",
price:499,
img:"/p3.png"
},

{
name:"Baby Blue Bliss",
desc:"Sky-blue flowers, fresh and minimalist",
price:499,
img:"/p4.png"
},

{
name:"Golden Sun",
desc:"Yellow blossoms bright and cheerful bouquet",
price:499,
img:"/p5.png"
}

]

function addToCart(product:any){

let cart = JSON.parse(localStorage.getItem("cart") || "[]")

cart.push({
...product,
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

return(
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

<Link href="/about">About Us</Link>
<Link href="/wishlist">Wishlist</Link>
<Link href="/cart">Cart</Link>
<Link href="/orders">Orders</Link>
<Link href="/">Logout</Link>

</div>

</div>


{/* PAGE CONTENT */}

<div className="px-16 pt-10">

{/* BACK */}
<button
onClick={() => window.history.back()}
className="flex items-center text-sm mb-6 hover:underline"
>
← Back
</button>

{/* BRAND */}
<h1
className="text-center text-4xl mb-10"
style={{ fontFamily: "var(--font-pacifico)" }}
>
Kate Handicrafts
</h1>

<h2
className="text-2xl mb-2"
style={{fontFamily:"var(--font-pacifico)"}}
>
Bouquets
</h2>

<p className="text-gray-600 mb-10">
Handmade floral keychain with soft pipe-cleaner petals and pearl accent. Available in assorted colors.
</p>


{/* PRODUCT GRID */}

<div className="grid grid-cols-5 gap-8">

{products.map((product,index)=>(

<div
key={index}
className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow text-center"
>

<Image
src={product.img}
alt={product.name}
width={220}
height={220}
className="mx-auto"
/>

<h3 className="mt-4 font-semibold text-lg">
{product.name}
</h3>

<p className="text-sm text-gray-600 mt-1">
{product.desc}
</p>

<p className="text-red-500 font-bold mt-2">
₱{product.price}
</p>

{/* BUTTONS */}
<div className="flex justify-center gap-3 mt-4">

<button
onClick={()=>addToWishlist(product)}
className="w-10 h-10 flex items-center justify-center border rounded-full hover:bg-pink-100"
>
❤️
</button>

<button
onClick={()=>addToCart(product)}
className="px-3 py-2 bg-pink-200 rounded-full hover:bg-pink-300 transition text-sm"
>
Add to Cart
</button>

</div>

</div>

))}

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
)
}