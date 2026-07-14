// src/app/layout.js
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { AppProvider } from "@/context/AppContext";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false
};

export const metadata = {
  title: "NeedNow | Local Location-Based Community App",
  description: "Find items and services nearby immediately through local people and shop owners. Raise urgent requests, get rapid responses, and build your neighborhood trust score.",
  metadataBase: new URL("http://localhost:3000")
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 transition-colors">
        <AuthProvider>
          <AppProvider>
            {/* Header */}
            <Header />
            
            {/* Main scrollable body */}
            <main className="flex-1 w-full max-w-2xl mx-auto px-4 pt-4 pb-28">
              {children}
            </main>

            {/* Sticky navigation */}
            <BottomNav />
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
