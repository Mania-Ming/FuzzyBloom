"use client"

import Image from "next/image"
import Link from "next/link"

export default function About() {

return (

<div className="min-h-screen text-black">

{/* NAVBAR */}
<div className="sticky top-0 w-full h-[88px] flex items-center justify-between px-6 md:px-16 backdrop-blur-md bg-purple/25 z-20">

<Link href="/dashboard">
<Image
src="/logo.jpg"
alt="logo"
width={50}
height={50}
className="rounded-full object-cover"
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


{/* ABOUT CONTENT */}
<div className="max-w-7xl mx-auto px-6 md:px-16 py-16">

<div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

{/* LEFT SIDE */}
<div className="space-y-12">

{/* ABOUT FUZZY BLOOM */}
<div>

<h1
className="text-3xl mb-4"
style={{ fontFamily: "var(--font-pacifico)" }}
>
About Fuzzy Bloom
</h1>

<p className="leading-relaxed">
Fuzzy Bloom is a small handmade brand dedicated
to creating soft, heartfelt floral crafts that turn
simple moments into meaningful memories.
</p>

</div>


{/* OUR STORY */}
<div>

<div className="flex flex-col md:flex-row gap-6 items-start">

<Image
src="/kate.jpg"
alt="Kate"
width={150}
height={150}
className="rounded-xl object-cover"
/>

<div className="space-y-3 leading-relaxed">

<h2
className="text-2xl mb-2"
style={{ fontFamily: "var(--font-pacifico)" }}
>
Our Story
</h2>

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

</div>



{/* RIGHT SIDE */}
<div className="space-y-12">

{/* WHAT WE CREATE */}
<div>

<h2
className="text-2xl mb-4"
style={{ fontFamily: "var(--font-pacifico)" }}
>
What We Create
</h2>

<ul className="space-y-2">
<li>Handmade Bouquets</li>
<li>Flower Keychains</li>
<li>Ribbon Keychains</li>
<li>Headbands</li>
</ul>

</div>


{/* WHY CHOOSE */}
<div>

<h2
className="text-2xl mb-4"
style={{ fontFamily: "var(--font-pacifico)" }}
>
Why Choose Fuzzy Bloom?
</h2>

<ul className="space-y-2">
<li>Handmade with love</li>
<li>Quality over quantity</li>
<li>Soft aesthetic designs</li>
<li>Supporting small handmade art</li>
<li>Creating meaningful gifts</li>
</ul>

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

</div>

)

}