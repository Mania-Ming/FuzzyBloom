"use client"

import Image from "next/image"
import Link from "next/link"
import { useState,useEffect } from "react"

type CartItem = {
name:string
price:string
img?:string
qty:number
}

export default function CheckoutPage(){

const [cartItems,setCartItems] = useState<CartItem[]>([])
const [menuOpen,setMenuOpen] = useState(false)

const [name,setName] = useState("")
const [street,setStreet] = useState("")
const [city,setCity] = useState("")
const [phone,setPhone] = useState("")

const [payment,setPayment] = useState("cod")

const shipping = 20


// LOAD CART
useEffect(()=>{

const storedCart = JSON.parse(localStorage.getItem("cart") || "[]")

setCartItems(storedCart)

},[])



// CALCULATE TOTAL
const subtotal = cartItems.reduce((sum,item)=>{

const price = parseFloat(item.price.replace("₱",""))

return sum + price * item.qty

},0)

const total = subtotal + (cartItems.length > 0 ? shipping : 0)



// PLACE ORDER
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

// GET OLD ORDERS
const oldOrders = JSON.parse(localStorage.getItem("orders") || "[]")


// SAVE NEW ORDER
localStorage.setItem("orders",JSON.stringify([order,...oldOrders]))


// CLEAR CART
localStorage.removeItem("cart")


alert("Order placed successfully!")

window.location.href = "/orders"

}



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
Checkout
</h1>



<div className="max-w-3xl mx-auto space-y-8 px-6">


{/* DELIVERY ADDRESS */}
<div className="bg-[#ead7dc] p-6 rounded-xl">

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
<div>

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



{/* ORDER SUMMARY */}
<div>

<h2 className="text-xl mb-4">
Order Summary
</h2>


{cartItems.length === 0 && (

<p className="text-gray-500">
No items in cart
</p>

)}


{cartItems.map((item,index)=>(

<div
key={index}
className="bg-[#ead7dc] p-4 rounded-xl flex justify-between items-center mb-4"
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

<p className="text-sm text-gray-600">
Qty: {item.qty}
</p>

</div>

</div>

<p className="text-red-600 font-bold">
{item.price}
</p>

</div>

))}

</div>



{/* TOTAL */}
<div className="text-right space-y-1">

<p>Subtotal: ₱{subtotal}</p>

<p>Shipping Fee: ₱{cartItems.length > 0 ? shipping : 0}</p>

<p className="font-bold text-lg">
Total: <span className="text-red-600">₱{total}</span>
</p>

</div>



{/* PLACE ORDER */}
<button
onClick={placeOrder}
className="w-full bg-[#d8ced6] py-3 rounded-full mt-4 mb-20"
>
Place Order
</button>


</div>



{/* ================= FOOTER ================= */}
<div className="bg-[#d8ced6] px-16 py-12 text-sm text-black">

<div className="grid grid-cols-3 items-start">

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
Copyright © 2026. Fuzzy Bloom Handicrafts by Kate. All right reserved.
</p>

</div>

</div>

)
}