"use client"; 

import { Poppins } from "next/font/google";
import "./globals.css";
import { Provider } from "react-redux";
import { store } from "@/app/store";

const geistSans = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.className} antialiased`}>
        <Provider store={store}>
          {children}
        </Provider>
      </body>
    </html>
  );
}