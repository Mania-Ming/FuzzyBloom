"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import Navbar from "@/components/Navbar"
import ProtectedRoute from "@/components/ProtectedRoute"

export default function OrdersPage() {

  const [orders, setOrders] = useState<any[]>([])

  useEffect(() => {
    try {
      const storedOrders = JSON.parse(localStorage.getItem("orders") || "[]")
      setOrders(storedOrders)
    } catch {
      setOrders([])
    }
  }, [])

  return (
    <ProtectedRoute>
    <div className="min-h-screen flex flex-col text-black">
      <Navbar />

      {/* TITLE */}
      <h1 className="text-center text-2xl mt-10 mb-10">
        Order History
      </h1>

      {/* ORDERS */}
      <div className="max-w-5xl mx-auto space-y-8 pb-24 px-4 md:px-6 w-full">

        {orders.length === 0 && (
          <p className="text-center text-gray-500">
            No orders yet.
          </p>
        )}

        {orders.map((order) => (

          <div
            key={order.id}
            className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm"
          >

            {/* ORDER HEADER */}
            <div className="flex justify-between items-center mb-6 flex-wrap gap-2">

              <div>
                <p className="font-semibold">
                  Order Date: {order.date}
                </p>

                <p className="text-sm text-gray-500">
                  Order ID: {order.id}
                </p>
              </div>

              <p className="text-sm text-orange-600 font-semibold">
                {order.status || "Processing"}
              </p>

            </div>

            {/* ITEMS */}
            <div className="space-y-4">

              {order.items?.map((item: any, index: number) => (

                <div
                  key={index}
                  className="flex items-center justify-between border-b pb-4 flex-wrap gap-4"
                >

                  <div className="flex items-center gap-4">

                    <Image
                      src={item.img || "/logo.jpg"}
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
                    ₱{item.price}
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
      <div className="mt-auto border-t pt-12 px-6 md:px-16 pb-6 text-sm">

        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 items-start">

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
    </ProtectedRoute>
  )
}