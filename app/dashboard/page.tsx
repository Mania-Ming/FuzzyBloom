import Image from "next/image";
import Link from "next/link";

export default function Dashboard() {
  return (
    <div className="min-h-screen text-gray-900">

      {/* ================= NAVBAR (FIXED) ================= */}
      <div className="fixed top-0 left-0 w-full bg-white flex items-center justify-between px-10 py-4 shadow-sm z-50">

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

        <div className="flex items-center border border-gray-300 rounded-full px-5 py-2 w-[350px]">
          <input
            type="text"
            placeholder="Search"
            className="outline-none w-full text-sm bg-transparent"
          />
        </div>

        <div className="flex items-center gap-8 font-medium">
          <Link href="#">Wishlist</Link>
          <Link href="#">Cart</Link>
          <Link href="/">Logout</Link>
        </div>
      </div>

      {/* Space for fixed navbar */}
      <div className="h-[90px]" />

      {/* ================= HERO SECTION ================= */}
      <div className="bg-[#d8ced6] px-16 py-16 flex justify-between items-center">

        <div className="max-w-lg">
          <h1
            className="text-4xl mb-3"
            style={{ fontFamily: "var(--font-pacifico)" }}
          >
            Fuzzy Bloom
          </h1>

          <p className="text-sm leading-relaxed mb-5">
            Handicrafts by Kate <br />
            Ms. Kate Dorraine Ceniza <br />
            Founder and Handmade Artist of Fuzzy Bloom,
            passionately creating handmade floral crafts
            and decorative pieces inspired by nature.
          </p>

          <button className="bg-black text-white px-8 py-2 rounded-full hover:opacity-80 transition">
            Shop now
          </button>
        </div>

        <Image
          src="/logo.jpg"
          alt="Fuzzy Bloom Logo"
          width={200}
          height={200}
          className="rounded-full"
        />
      </div>

      {/* ================= CATEGORIES ================= */}
      <div className="py-16 text-center">

        <h2 className="text-lg font-semibold text-purple-900 mb-12">
          Jump into featured interest
        </h2>

        <div className="flex justify-center gap-20">

          {[
            { name: "Bouquets", img: "/c1.png" },
            { name: "Flower", img: "/c2.png" },
            { name: "Ribbon", img: "/c3.png" },
            { name: "Headbands", img: "/c4.png" },
          ].map((item, index) => (
            <div key={index} className="flex flex-col items-center">
              <Image
                src={item.img}
                alt={item.name}
                width={140}   // ⬅ bigger image
                height={140}
                className="object-contain"
              />
              <p
                className="mt-4 text-xl text-purple-900"
                style={{ fontFamily: "var(--font-pacifico)" }}
              >
                {item.name}
              </p>
            </div>
          ))}

        </div>
      </div>

      {/* ================= PRODUCTS SECTION ================= */}
<div className="text-center pb-20">

  <h2
    className="text-3xl text-purple-900 mb-12"
    style={{ fontFamily: "var(--font-pacifico)" }}
  >
    Kate Handicrafts
  </h2>

  <div className="flex justify-center gap-14 flex-wrap">

    {[
      { 
        name: "Lavender Grace", 
        img: "/p1.png", 
        price: "₱499",
        desc: "Soft pink pom-pom flowers, sweet and cute design"
      },
      { 
        name: "Ruby & Sky", 
        img: "/p2.png", 
        price: "₱599",
        desc: "Red and baby blue tulips, bold but balanced"
      },
      { 
        name: "Mint Serenity", 
        img: "/p3.png", 
        price: "₱569",
        desc: "Mint green tulips, clean and modern look"
      },
    ].map((product, index) => (
      <div
        key={index}
        className="bg-white p-8 rounded-2xl shadow-md w-[300px] hover:shadow-xl transition"
      >
        <Image
          src={product.img}
          alt={product.name}
          width={240}
          height={240}
          className="mx-auto"
        />

        <h3 className="mt-5 font-semibold text-lg">
          {product.name}
        </h3>

        {/* DESCRIPTION BACK */}
        <p className="text-sm text-gray-600 mt-2 px-2">
          {product.desc}
        </p>

        <p className="text-red-600 font-bold text-xl mt-3">
          {product.price}
        </p>
      </div>
    ))}

  </div>

  <button className="bg-black text-white px-12 py-3 rounded-full mt-14 hover:opacity-80 transition">
    Load more
  </button>
</div>

      {/* ================= FOOTER (MATCH SECOND PHOTO) ================= */}
      <div className="bg-[#d8ced6] px-16 py-12 text-sm">

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
  );
}