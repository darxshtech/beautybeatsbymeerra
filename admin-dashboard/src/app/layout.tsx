"use client";

import { Inter } from "next/font/google";
import "@/styles/globals.css";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const inter = Inter({ subsets: ["latin"] });

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // Check local storage directly for a more immediate guard
    const hasToken = !!localStorage.getItem('bb_token');
    
    if (!hasToken && pathname !== '/login') {
      router.push('/login');
    }
    
    setCheckingAuth(false);
  }, [pathname, router]);

  const isLoginPage = pathname === '/login';
  const showSidebar = isAuthenticated && !isLoginPage;

  // Don't render dashboard content if we are in the middle of a redirect
  if (checkingAuth || (!isAuthenticated && !isLoginPage && !localStorage.getItem('bb_token'))) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', width: '100%', background: 'var(--bg-main)' }}>
        <p style={{ fontWeight: 800, color: 'var(--text-muted)' }}>Security Check...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', background: 'var(--bg-main)', minHeight: '100vh' }}>
      {showSidebar && <Sidebar />}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {showSidebar && <Navbar />}
        <main style={{ 
          flex: 1, 
          padding: showSidebar ? '2.5rem' : '0', 
          width: '100%',
          maxWidth: '1200px',
          margin: showSidebar ? '0 auto' : '0'
        }}>
          {children}
        </main>
      </div>
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          <LayoutContent>
             {children}
          </LayoutContent>
        </AuthProvider>
      </body>
    </html>
  );
}
