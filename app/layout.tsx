import QueryProvider from "@/lib/QueryProvider"
import type { Metadata } from "next"
import { Pacifico } from "next/font/google";
import "./globals.css";

const pacifico = Pacifico({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-pacifico",
});

export const metadata: Metadata = {
  title: "Fuzzy Bloom | Handicrafts by Kate",
  description: "Fuzzy Bloom Handicrafts by Kate",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${pacifico.variable}`}
        style={{
          backgroundImage: "url('/bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="min-h-screen bg-white/60 backdrop-blur-sm">
          <QueryProvider>
          {children}
        </QueryProvider>
        </div>
      </body>
    </html>
  );
}