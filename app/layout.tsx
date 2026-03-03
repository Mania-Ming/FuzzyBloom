import type { Metadata } from "next";
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
      <body className={`${pacifico.variable} bg-[#f2eef0]`}>
        {children}
      </body>
    </html>
  );
}