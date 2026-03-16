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

export default function CartPage(){

const [cartItems,setCartItems] = useState<CartItem[]>([])
const router = useRouter()

const shipping = 20


// LOAD CART
useEffect(()=>{

const storedCart = JSON.parse(localStorage.getItem("cart") || "[]")

setCartItems(storedCart)

},[])


// SAVE CART
function saveCart(updated:CartItem[]){

setCartItems(updated)

localStorage.setItem("cart",JSON.stringify(updated))

}


// INCREASE QTY
function increaseQty(index:number){

const updated = [...cartItems]

updated[index].qty += 1

saveCart(updated)

}


// DECREASE QTY
function decreaseQty(index:number){

const updated = [...cartItems]

if(updated[index].qty > 1){
updated[index].qty -= 1
}

saveCart(updated)

}


// REMOVE ITEM
function removeItem(index:number){

const updated = [...cartItems]

updated.splice(index,1)

saveCart(updated)

}


// CALCULATE TOTAL
const subtotal = cartItems.reduce((sum,item)=>{

return sum + item.price * item.qty

},0)

const total = subtotal + (cartItems.length > 0 ? shipping : 0)


// CHECKOUT
function handleCheckout(){

if(cartItems.length === 0){

alert("Your cart is empty!")

return

}

router.push("/checkout")

}


return(

<div className="min-h-screen text-black">

{/* ================= NAVBAR ================= */}
<div className="sticky top-0 w-full h-[88px] flex items-center justify-between px-10 backdrop-blur-md bg-purple/25 z-20">

<Link href="/dashboard">
<Image
src="/logo.jpg"
alt="logo"
width={55}
height={55}
className="rounded-full"
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



{/* TITLE */}
<div className="px-20 pt-12 pb-6">

<h1
className="text-4xl"
style={{ fontFamily: "var(--font-pacifico)" }}
>
Shopping Cart
</h1>

</div>



<div className="max-w-6xl mx-auto grid grid-cols-3 gap-10 px-10 pb-20">


{/* CART ITEMS */}
<div className="col-span-2 space-y-6">

{cartItems.length === 0 && (

<p className="text-gray-500">
Your cart is empty.
</p>

)}


{cartItems.map((item,index)=>(

<div
key={index}
className="flex justify-between items-center bg-white p-5 rounded-2xl shadow"
>

<div className="flex items-center gap-5">

<Image
src={item.img || "/p2.png"}
alt={item.name}
width={90}
height={90}
className="rounded-lg"
/>

<div>

<h3 className="font-semibold text-lg">
{item.name}
</h3>

<p className="text-red-600 font-bold">
₱{item.price}
</p>

</div>

</div>


<div className="flex items-center gap-6">

<div className="flex items-center border rounded-full overflow-hidden">

<button
onClick={()=>decreaseQty(index)}
className="px-3 py-1"
>
-
</button>

<span className="px-4">
{item.qty}
</span>

<button
onClick={()=>increaseQty(index)}
className="px-3 py-1"
>
+
</button>

</div>


<button
onClick={()=>removeItem(index)}
className="text-red-500 text-sm"
>
Remove
</button>

</div>

</div>

))}

</div>



{/* ORDER SUMMARY */}
<div className="bg-white p-6 rounded-2xl shadow h-fit">

<h2 className="text-xl mb-5 font-semibold">
Order Summary
</h2>

<div className="flex justify-between mb-2">
<span>Subtotal</span>
<span>₱{subtotal}</span>
</div>

<div className="flex justify-between mb-2">
<span>Shipping</span>
<span>₱{cartItems.length > 0 ? shipping : 0}</span>
</div>

<div className="flex justify-between font-bold mb-6 text-lg">
<span>Total</span>
<span className="text-red-600">
₱{total}
</span>
</div>


<button
onClick={handleCheckout}
className="w-full bg-black text-white py-2 rounded-full"
>
Checkout
</button>

</div>

</div>



{/* CONTINUE SHOPPING */}
<div className="text-center mb-20">

<Link
href="/dashboard"
className="text-sm underline"
>
Continue Shopping
</Link>

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