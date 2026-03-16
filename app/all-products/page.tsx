"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

export default function AllProducts(){

const [menuOpen,setMenuOpen] = useState(false)

/* ---------------- CART FUNCTION ---------------- */

function addToCart(item:any){

let cart = JSON.parse(localStorage.getItem("cart") || "[]")

cart.push({
name:item.name,
price:item.price,
img:item.img,
qty:1
})

localStorage.setItem("cart",JSON.stringify(cart))

alert("Added to Cart 🛒")

}

/* ---------------- FLOWER VARIANTS ---------------- */

const flowerVariants = [
{img:"/k1.png",color:"White"},
{img:"/k2.png",color:"Yellow"},
{img:"/k3.png",color:"Blue"},
{img:"/k4.png",color:"Red"},
{img:"/k5.png",color:"Purple"},
{img:"/k6.png",color:"Pink"},
]

const [flowerSelected,setFlowerSelected] = useState(flowerVariants[0])

/* ---------------- RIBBON VARIANTS ---------------- */

const ribbonVariants = [
{img:"/r1.png",color:"Blue / Pink"},
{img:"/r2.png",color:"Purple / Pink"},
]

const [ribbonSelected,setRibbonSelected] = useState(ribbonVariants[0])


return(

<div className="min-h-screen text-black">

{/* ================= NAVBAR ================= */}

<div className="sticky top-0 w-full h-[88px] bg-white/40 backdrop-blur-md flex items-center justify-between px-10 shadow-sm">

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

<div className="text-2xl">☰</div>

</div>


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


<div className="flex items-center gap-8 font-medium">

<Link href="/wishlist">Wishlist</Link>
<Link href="/cart">Cart</Link>
<Link href="/orders">Orders</Link>
<Link href="/">Logout</Link>

</div>

</div>


{/* ================= TITLE ================= */}

<div className="text-center py-10">

<h1
className="text-4xl"
style={{fontFamily:"var(--font-pacifico)"}}
>
Kate Handicrafts
</h1>

</div>


{/* ================= BOUQUETS ================= */}

<div className="px-16 mb-20">

<h2 className="text-3xl mb-6" style={{fontFamily:"var(--font-pacifico)"}}>
Bouquets
</h2>

<div className="grid grid-cols-5 gap-8">

{[
{name:"Lavender Grace",img:"/p1.png",price:"₱499"},
{name:"Ruby & Sky",img:"/p2.png",price:"₱499"},
{name:"Mint Serenity",img:"/p3.png",price:"₱499"},
{name:"Baby Blue Bliss",img:"/p4.png",price:"₱499"},
{name:"Golden Sun",img:"/p5.png",price:"₱499"},
].map((item,i)=>(

<div key={i} className="bg-white p-4 rounded-xl shadow text-center">

<Image
src={item.img}
alt={item.name}
width={200}
height={200}
className="mx-auto object-contain h-[200px]"
/>

<h3 className="mt-3 font-semibold">{item.name}</h3>

<p className="text-red-600 font-bold mt-2">{item.price}</p>

<button
onClick={()=>addToCart(item)}
className="mt-2 bg-[#f3d9e5] px-4 py-1 rounded-full text-sm"
>
Add to Cart
</button>

</div>

))}

</div>

</div>


{/* ================= FLOWER KEYCHAIN ================= */}

<div className="px-16 mb-20">

<h2 className="text-3xl mb-4" style={{fontFamily:"var(--font-pacifico)"}}>
Flower Keychains
</h2>

<p className="text-gray-600 mb-4">
Handmade floral keychain with soft pipe-cleaner petals.
</p>

<p className="text-xl text-[#c55a73] font-bold mb-4">
₱129
</p>


<Image
src={flowerSelected.img}
alt="flower"
width={220}
height={220}
/>


<p className="mt-6 mb-2 font-medium">
Choose Color
</p>

<div className="flex gap-4">

{flowerVariants.map((item,i)=>(

<div
key={i}
onClick={()=>setFlowerSelected(item)}
className={`cursor-pointer border rounded-lg p-2
${flowerSelected.img===item.img ? "border-pink-500":"border-gray-300"}
`}
>

<Image
src={item.img}
alt={item.color}
width={70}
height={70}
/>

</div>

))}

</div>


<button
onClick={()=>addToCart({
name:"Flower Keychain - "+flowerSelected.color,
price:"₱129",
img:flowerSelected.img
})}
className="mt-6 bg-[#4b2e2e] text-white px-6 py-2 rounded-full"
>
Add to Cart
</button>

</div>


{/* ================= RIBBON KEYCHAIN ================= */}

<div className="px-16 mb-20">

<h2 className="text-3xl mb-4" style={{fontFamily:"var(--font-pacifico)"}}>
Ribbon Keychains
</h2>

<p className="text-gray-600 mb-4">
Elegant handmade satin ribbon bow keychain.
</p>

<p className="text-xl text-[#c55a73] font-bold mb-4">
₱99
</p>


<Image
src={ribbonSelected.img}
alt="ribbon"
width={220}
height={220}
/>


<p className="mt-6 mb-2 font-medium">
Choose Style
</p>

<div className="flex gap-4">

{ribbonVariants.map((item,i)=>(

<div
key={i}
onClick={()=>setRibbonSelected(item)}
className={`cursor-pointer border rounded-lg p-2
${ribbonSelected.img===item.img ? "border-pink-500":"border-gray-300"}
`}
>

<Image
src={item.img}
alt={item.color}
width={70}
height={70}
/>

</div>

))}

</div>


<button
onClick={()=>addToCart({
name:"Ribbon Keychain - "+ribbonSelected.color,
price:"₱99",
img:ribbonSelected.img
})}
className="mt-6 bg-[#4b2e2e] text-white px-6 py-2 rounded-full"
>
Add to Cart
</button>

</div>


{/* ================= HEADBAND ================= */}

<div className="px-16 mb-20">

<h2 className="text-3xl mb-4" style={{fontFamily:"var(--font-pacifico)"}}>
Headband
</h2>

<p className="text-gray-600 mb-4">
Sunflower Bloom Headband
</p>

<p className="text-xl text-[#c55a73] font-bold mb-4">
₱99
</p>

<Image
src="/h1.png"
alt="headband"
width={220}
height={220}
/>

<button
onClick={()=>addToCart({
name:"Sunflower Headband",
price:"₱99",
img:"/h1.png"
})}
className="mt-6 bg-[#4b2e2e] text-white px-6 py-2 rounded-full"
>
Add to Cart
</button>

</div>

</div>

)

}