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

<h1 className="text-center text-2xl mt-10 mb-10">
Order History
</h1>

<div className="max-w-5xl mx-auto space-y-8 pb-24 px-6">

{orders.length === 0 && (

<p className="text-center text-gray-500">
No orders yet.
</p>

)}

{orders.map((order)=>(

<div
key={order.id}
className="bg-white/80 backdrop-blur-md border border-gray-200 p-6 rounded-xl shadow-sm"
>

{/* ORDER HEADER */}

<div className="flex justify-between items-center mb-6">

<div>
<p className="font-semibold">
Order Date: {order.date}
</p>
<p className="text-sm text-gray-500">
Order ID: {order.id}
</p>
</div>

<p className="text-sm text-orange-600 font-semibold">
{order.status}
</p>

</div>

{/* ITEMS */}

<div className="space-y-4">

{order.items.map((item:any,index:number)=>(

<div
key={index}
className="flex items-center justify-between border-b pb-4"
>

<div className="flex items-center gap-4">

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

<p className="text-sm text-gray-500">
Qty: {item.qty}
</p>

</div>

</div>

<p className="font-semibold text-red-600">
{item.price}
</p>

</div>

))}

</div>

{/* TOTAL */}

<div className="text-right mt-6">

<p className="font-semibold text-lg">
Total: <span className="text-red-600">₱{order.total}</span>
</p>

</div>

</div>

))}

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