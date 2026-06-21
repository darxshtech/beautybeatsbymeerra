import { Inter } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/context/AuthContext";
import { GoogleOAuthProvider } from '@react-oauth/google';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BeautyBeats | Hydra Facial Clinic",
  description: "Advanced clinical skincare, hydra facials, and dermatological treatments.",
  manifest: "/manifest.json",
  themeColor: "#ffffff",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BeautyBeats",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
          <AuthProvider>
            <Navbar />
            <main className="min-h-screen pt-20">
              {children}
            </main>
          </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
