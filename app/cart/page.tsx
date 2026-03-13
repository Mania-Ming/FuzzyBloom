"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

type CartItem = {
  name: string
  price: string
  img?: string
  qty: number
}

export default function CartPage(){

const [cartItems,setCartItems] = useState<CartItem[]>([])
const [menuOpen,setMenuOpen] = useState(false)

const shipping = 20
const router = useRouter()


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

const price = parseFloat(item.price.replace("₱",""))

return sum + price * item.qty

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
Shopping Cart
</h1>



<div className="max-w-6xl mx-auto grid grid-cols-3 gap-10 px-10">


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
className="bg-[#ead7dc] p-5 rounded-xl flex justify-between items-center"
>

<div className="flex gap-4 items-center">

<Image
src={item.img || "/p2.png"}
alt={item.name}
width={90}
height={90}
/>

<div>

<h3 className="font-semibold">
{item.name}
</h3>

<p className="text-red-600 font-bold">
{item.price}
</p>

</div>

</div>


<div className="flex items-center gap-4">

<div className="flex bg-[#d9aeb8] rounded-full overflow-hidden">

<button
onClick={()=>decreaseQty(index)}
className="px-3"
>
-
</button>

<span className="px-4 bg-white">
{item.qty}
</span>

<button
onClick={()=>increaseQty(index)}
className="px-3"
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
<div className="bg-[#ead7dc] p-6 rounded-xl h-fit">

<h2 className="text-xl mb-4">
Order Summary
</h2>

<div className="flex justify-between mb-2">
<span>Subtotal</span>
<span>₱{subtotal}</span>
</div>

<div className="flex justify-between mb-2">
<span>Shipping Fee</span>
<span>₱{cartItems.length > 0 ? shipping : 0}</span>
</div>

<div className="flex justify-between font-bold mb-6">
<span>Total</span>
<span className="text-red-600">
₱{total}
</span>
</div>


<button
onClick={handleCheckout}
className="w-full bg-[#d8ced6] py-2 rounded-full"
>
Checkout
</button>

</div>

</div>



<div className="text-center mt-10 mb-20">

<Link
href="/all-products"
className="text-sm"
>
Continue Shopping
</Link>

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