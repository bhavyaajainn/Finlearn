import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const geistSans = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600"]
});


export const metadata: Metadata = {
  title: "Finlearn",
  description: "Learn money. Live smart. Every day, with FinLearn AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.className} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
