import Image from "next/image";
import Link from "next/link";

export default function Dashboard() {
  return (
    <div className="bg-[#f2eef0] min-h-screen">

      {/* NAVBAR */}
      <div className="bg-white flex items-center justify-between px-8 py-4 shadow-sm">
        <div className="flex items-center gap-4">
          <Image src="/logo.jpg" alt="Logo" width={50} height={50} className="rounded-full"/>
          <div className="text-2xl cursor-pointer">☰</div>
        </div>

        <div className="flex items-center border rounded-full px-4 py-2 w-[350px]">
          <input
            type="text"
            placeholder="Search"
            className="outline-none w-full text-sm"
          />
          🔍
        </div>

        <div className="flex items-center gap-6">
          🤍
          🛒
          <Link href="/" className="font-medium">Logout</Link>
        </div>
      </div>

      {/* HERO SECTION */}
      <div className="bg-[#d8ced6] px-16 py-12 flex justify-between items-center">
        <div className="max-w-md">
          <h1 className="text-3xl font-semibold mb-3">Fuzzy Bloom</h1>
          <p className="text-sm text-gray-700 mb-4">
            Handicrafts by Kate <br/>
            Ms. Kate Dorraine Ceniza <br/>
            Founder and Handmade Artist of Fuzzy Bloom.
          </p>
          <button className="bg-black text-white px-8 py-2 rounded-full">
            Shop now
          </button>
        </div>

        <Image src="/logo.jpg" alt="Logo" width={180} height={180} className="rounded-full"/>
      </div>

      {/* FEATURED */}
      <div className="text-center py-12">
        <h2 className="text-lg font-medium text-purple-800 mb-8">
          Jump into featured interest
        </h2>

        <div className="flex justify-center gap-16 mb-12">
          <div>
            <p className="font-semibold text-purple-800">Bouquets</p>
            🌸
          </div>
          <div>
            <p className="font-semibold text-purple-800">Flower</p>
            🌺
          </div>
          <div>
            <p className="font-semibold text-purple-800">Ribbon</p>
            🎀
          </div>
          <div>
            <p className="font-semibold text-purple-800">Headbands</p>
            👑
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-purple-800 mb-8">
          Kate Handicrafts
        </h2>

        {/* PRODUCTS */}
        <div className="flex justify-center gap-8 flex-wrap">

          {/* Product Card */}
          <div className="bg-white p-6 rounded-xl shadow-md w-[250px]">
            <Image src="/logo.jpg" alt="Product" width={200} height={200}/>
            <h3 className="mt-4 font-medium">Lavender Grace</h3>
            <p className="text-red-600 font-bold">₱499</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md w-[250px]">
            <Image src="/logo.jpg" alt="Product" width={200} height={200}/>
            <h3 className="mt-4 font-medium">Ruby & Sky</h3>
            <p className="text-red-600 font-bold">₱599</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md w-[250px]">
            <Image src="/logo.jpg" alt="Product" width={200} height={200}/>
            <h3 className="mt-4 font-medium">Mint Serenity</h3>
            <p className="text-red-600 font-bold">₱569</p>
          </div>

        </div>

        <button className="bg-black text-white px-8 py-3 rounded-full mt-10">
          Load more
        </button>
      </div>

      {/* FOOTER */}
      <div className="bg-[#d8ced6] px-16 py-8 text-sm">
        <div className="flex justify-between">
          <div>
            <p className="font-semibold">Fuzzy Bloom</p>
            <p>Handicrafts by Kate</p>
            <p>09054026505</p>
            <p>fuzzybloom@gmail.com</p>
          </div>

          <div>
            <p className="font-semibold">About Us</p>
            <p>Category</p>
            <p>Shop</p>
            <p>Policies</p>
          </div>
        </div>

        <p className="text-center mt-6">
          Copyright © 2026. Fuzzy Bloom Handicrafts by Kate.
        </p>
      </div>

    </div>
  );
}