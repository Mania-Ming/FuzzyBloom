"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

type CartItem = {
name: string
price: number
img?: string
qty: number
}

export default function CheckoutPage(){

const router = useRouter()

const [cartItems,setCartItems] = useState<CartItem[]>([])

const [name,setName] = useState("")
const [street,setStreet] = useState("")
const [city,setCity] = useState("")
const [phone,setPhone] = useState("")

const [payment,setPayment] = useState("cod")

const shipping = 20

/* LOAD CART SAFELY */
useEffect(()=>{

if(typeof window !== "undefined"){

const storedCart:CartItem[] =
JSON.parse(localStorage.getItem("cart") || "[]")

setCartItems(storedCart)

}

},[])

/* CALCULATE SUBTOTAL */

const subtotal = cartItems.reduce((sum,item)=>{

return sum + item.price * item.qty

},0)

const total = subtotal + (cartItems.length > 0 ? shipping : 0)

/* PLACE ORDER */

function placeOrder(){

if(cartItems.length === 0){
alert("Cart is empty!")
return
}

if(!name || !street || !city || !phone){
alert("Please fill up delivery address")
return
}

const order = {

id: Date.now(),
items: cartItems,
total: total,
date: new Date().toLocaleDateString(),
status: "Pending",

address:{
name,
street,
city,
phone
},

payment:payment

}

let oldOrders:any = []

if(typeof window !== "undefined"){
oldOrders = JSON.parse(localStorage.getItem("orders") || "[]")
}

localStorage.setItem("orders",JSON.stringify([order,...oldOrders]))

localStorage.removeItem("cart")

alert("Order placed successfully!")

router.push("/orders")

}

return(

<div className="min-h-screen text-black">

{/* NAVBAR */}

<div className="sticky top-0 w-full h-[88px] flex items-center justify-between px-6 md:px-16 backdrop-blur-md bg-purple/25 z-20">

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

<h1 className="text-center text-3xl mt-10 mb-10">
Checkout
</h1>

<div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 px-6 md:px-16 mb-20">

{/* LEFT SIDE CART */}

<div>

<h2 className="text-xl font-semibold mb-6">
Shopping Cart
</h2>

{cartItems.length === 0 && (

<p className="text-gray-500">No items in cart</p>

)}

{cartItems.map((item,index)=>(

<div
key={index}
className="bg-white border border-gray-200 p-4 rounded-xl flex justify-between items-center mb-4"
>

<div className="flex items-center gap-4">

<Image
src={item.img || "/p2.png"}
alt={item.name}
width={60}
height={60}
className="rounded-lg object-cover"
/>

<div>

<p className="font-semibold">
{item.name}
</p>

<p className="text-sm text-gray-600">
Qty: {item.qty}
</p>

</div>

</div>

<p className="text-red-600 font-bold">
₱{item.price}
</p>

</div>

))}

<div className="bg-white border border-gray-200 p-4 rounded-xl flex justify-between mt-6">

<p className="font-semibold">Subtotal</p>

<p className="text-red-600 font-bold">
₱{subtotal}
</p>

</div>

</div>

{/* RIGHT SIDE */}

<div className="space-y-6">

{/* DELIVERY ADDRESS */}

<div className="bg-white border border-gray-200 p-6 rounded-xl">

<h2 className="font-semibold mb-4">
Delivery Address
</h2>

<input
placeholder="Full Name"
value={name}
onChange={(e)=>setName(e.target.value)}
className="w-full border p-3 rounded mb-3"
/>

<input
placeholder="Street Address"
value={street}
onChange={(e)=>setStreet(e.target.value)}
className="w-full border p-3 rounded mb-3"
/>

<input
placeholder="City"
value={city}
onChange={(e)=>setCity(e.target.value)}
className="w-full border p-3 rounded mb-3"
/>

<input
placeholder="Phone Number"
value={phone}
onChange={(e)=>setPhone(e.target.value)}
className="w-full border p-3 rounded"
/>

</div>

{/* PAYMENT */}

<div className="bg-white border border-gray-200 p-6 rounded-xl">

<h2 className="font-semibold mb-4">
Payment Method
</h2>

<div className="flex justify-between mb-2">

<span>Cash on Delivery</span>

<input
type="radio"
checked={payment==="cod"}
onChange={()=>setPayment("cod")}
/>

</div>

<div className="flex justify-between">

<span>GCash</span>

<input
type="radio"
checked={payment==="gcash"}
onChange={()=>setPayment("gcash")}
/>

</div>

</div>

{/* TOTAL */}

<div className="text-right space-y-1">

<p>Subtotal: ₱{subtotal}</p>

<p>Shipping Fee: ₱{cartItems.length > 0 ? shipping : 0}</p>

<p className="font-bold text-lg">
Total: <span className="text-red-600">₱{total}</span>
</p>

</div>

<button
onClick={placeOrder}
className="w-full bg-[#4b2e2e] text-white py-3 rounded-full hover:bg-[#3a2323]"

>

Place Order </button>

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
