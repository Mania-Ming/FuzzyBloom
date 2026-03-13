"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect,useState } from "react"

export default function OrdersPage(){

const [orders,setOrders] = useState<any[]>([])
const [menuOpen,setMenuOpen] = useState(false)

useEffect(()=>{

const storedOrders = JSON.parse(localStorage.getItem("orders") || "[]")

setOrders(storedOrders)

},[])


return(

<div className="min-h-screen">


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

<div
onClick={()=>setMenuOpen(!menuOpen)}
className="text-2xl cursor-pointer"
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



<h1 className="text-center text-2xl mt-10 mb-10">
Order History
</h1>



<div className="max-w-4xl mx-auto space-y-8 pb-24">


{orders.length === 0 && (

<p className="text-center text-gray-500">
No orders yet.
</p>

)}


{orders.map((order)=>(

<div
key={order.id}
className="bg-[#ead7dc] p-6 rounded-xl"
>

<div className="flex justify-between mb-4">

<p className="font-semibold">
Order Date: {order.date}
</p>

<p className="text-sm text-orange-600 font-semibold">
Status: {order.status}
</p>

</div>


<div className="space-y-4">

{order.items.map((item:any,index:number)=>(

<div
key={index}
className="flex items-center gap-4"
>

<Image
src={item.img || "/p2.png"}
alt={item.name}
width={60}
height={60}
/>

<div>

<p className="font-semibold">
{item.name}
</p>

<p className="text-sm">
Qty: {item.qty}
</p>

</div>

</div>

))}

</div>

</div>

))}

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

)
}