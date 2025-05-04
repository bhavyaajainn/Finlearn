"use client"; 

import { Poppins } from "next/font/google";
import "./globals.css";
import { Provider } from "react-redux";
import { store } from "@/app/store";
import { useEffect } from "react";
import { checkAuthState } from "@/app/store/slices/authSlice"; 

const geistSans = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// This component initializes auth checking
function AuthInitializer() {
  useEffect(() => {
    // Check authentication state when the app loads
    store.dispatch(checkAuthState());
  }, []);

  return null;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.className} antialiased`}>
        <Provider store={store}>
          <AuthInitializer />
          {children}
        </Provider>
      </body>
    </html>
  );
}