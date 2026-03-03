import Image from "next/image";
import Link from "next/link";

export default function Dashboard() {
  return (
    <div className="bg-[#f2eef0] min-h-screen text-gray-900">

      {/* NAVBAR */}
      <div className="bg-white flex items-center justify-between px-10 py-4 shadow-sm">

        {/* Left */}
        <div className="flex items-center gap-4">
          <Image
            src="/logo.jpg"
            alt="Logo"
            width={50}
            height={50}
            className="rounded-full"
          />
          <div className="text-2xl cursor-pointer">☰</div>
        </div>

        {/* Search */}
        <div className="flex items-center border border-gray-300 rounded-full px-5 py-2 w-[350px]">
          <input
            type="text"
            placeholder="Search"
            className="outline-none w-full text-sm bg-transparent"
          />
        </div>

        {/* Right */}
        <div className="flex items-center gap-8 font-medium">
          <Link href="#">Wishlist</Link>
          <Link href="#">Cart</Link>
          <Link href="/" className="hover:text-gray-600">Logout</Link>
        </div>
      </div>

      {/* HERO SECTION */}
      <div className="bg-[#d8ced6] px-16 py-14 flex justify-between items-center">

        <div className="max-w-lg">
          <h1 className="text-3xl font-semibold mb-3">
            Fuzzy Bloom
          </h1>

          <p className="text-sm leading-relaxed mb-5">
            Handicrafts by Kate <br />
            Ms. Kate Dorraine Ceniza <br />
            Founder and Handmade Artist of Fuzzy Bloom,
            passionately creating handmade floral crafts
            and decorative pieces inspired by nature,
            creativity, and the joy of meaningful gifting.
          </p>

          <button className="bg-black text-white px-8 py-2 rounded-full hover:opacity-80 transition">
            Shop now
          </button>
        </div>

        <Image
          src="/logo.jpg"
          alt="Fuzzy Bloom Logo"
          width={180}
          height={180}
          className="rounded-full"
        />
      </div>

      {/* FEATURED CATEGORIES */}
      <div className="py-14 text-center">

        <h2 className="text-lg font-semibold text-purple-900 mb-10">
          Jump into featured interest
        </h2>

        <div className="flex justify-center gap-16">

          {/* CATEGORY 1 */}
          <div className="flex flex-col items-center">
            <Image src="/c1.png" alt="Bouquets" width={80} height={80}/>
            <p className="mt-3 font-medium text-purple-900">Bouquets</p>
          </div>

          {/* CATEGORY 2 */}
          <div className="flex flex-col items-center">
            <Image src="/c2.png" alt="Flower" width={80} height={80}/>
            <p className="mt-3 font-medium text-purple-900">Flower</p>
          </div>

          {/* CATEGORY 3 */}
          <div className="flex flex-col items-center">
            <Image src="/c3.png" alt="Ribbon" width={80} height={80}/>
            <p className="mt-3 font-medium text-purple-900">Ribbon</p>
          </div>

          {/* CATEGORY 4 */}
          <div className="flex flex-col items-center">
            <Image src="/c4.png" alt="Headbands" width={80} height={80}/>
            <p className="mt-3 font-medium text-purple-900">Headbands</p>
          </div>

        </div>
      </div>

      {/* PRODUCTS SECTION */}
      <div className="text-center pb-16">

        <h2 className="text-2xl font-semibold text-purple-900 mb-10">
          Kate Handicrafts
        </h2>

        <div className="flex justify-center gap-10 flex-wrap">

          {/* PRODUCT CARD */}
          <div className="bg-white p-6 rounded-xl shadow-md w-[260px]">
            <Image src="/p1.png" alt="Lavender Grace" width={220} height={220}/>
            <h3 className="mt-4 font-semibold">Lavender Grace</h3>
            <p className="text-sm text-gray-600 mb-2">
              Soft pink pom-pom flowers, sweet and cute design
            </p>
            <p className="text-red-600 font-bold text-lg">₱499</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md w-[260px]">
            <Image src="/p2.png" alt="Ruby & Sky" width={220} height={220}/>
            <h3 className="mt-4 font-semibold">Ruby & Sky</h3>
            <p className="text-sm text-gray-600 mb-2">
              Red and baby blue tulips, bold but balanced
            </p>
            <p className="text-red-600 font-bold text-lg">₱599</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md w-[260px]">
            <Image src="/p3.png" alt="Mint Serenity" width={220} height={220}/>
            <h3 className="mt-4 font-semibold">Mint Serenity</h3>
            <p className="text-sm text-gray-600 mb-2">
              Mint green tulips, clean and modern look
            </p>
            <p className="text-red-600 font-bold text-lg">₱569</p>
          </div>

        </div>

        <button className="bg-black text-white px-10 py-3 rounded-full mt-12 hover:opacity-80 transition">
          Load more
        </button>
      </div>

      {/* FOOTER */}
      <div className="bg-[#d8ced6] px-16 py-10 text-sm">

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

        <p className="text-center mt-6 text-gray-700">
          Copyright © 2026. Fuzzy Bloom Handicrafts by Kate.
        </p>

      </div>

    </div>
  );
}