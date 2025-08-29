import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./styles/legacy-demo.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SynqChain - Procurement. Perfected. Synq'd.",
  description: "Modern ERP integration platform for streamlined procurement processes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <body className="antialiased">
        <div className="min-h-dvh bg-gray-50">
          <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
