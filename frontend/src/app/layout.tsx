import type { Metadata } from "next";
import "./globals.css";
import StoreProvider from "@/components/StoreProvider";

export const metadata: Metadata = {
  title: "Receivers Dashboard",
  description: "Transaction receivers dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50 min-h-screen">
        {/* StoreProvider is a client component that gives all children access to the Redux store */}
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
