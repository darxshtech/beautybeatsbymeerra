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
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const hasToken = !!localStorage.getItem('bb_token');
    if (!hasToken && pathname !== '/login') {
      router.push('/login');
    }
    setCheckingAuth(false);
  }, [pathname, router]);

  // Close sidebar on navigation
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  const isLoginPage = pathname === '/login';
  const showSidebar = isAuthenticated && !isLoginPage;

  if (checkingAuth || (!isAuthenticated && !isLoginPage && !localStorage.getItem('bb_token'))) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', width: '100%', background: 'var(--bg-main)' }}>
        <p style={{ fontWeight: 800, color: 'var(--text-muted)' }}>Security Check...</p>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      background: 'var(--bg-main)', 
      minHeight: '100vh', 
      position: 'relative',
      overflowX: 'hidden' // Prevent any horizontal scrolling
    }}>
      {showSidebar && (
        <>
          <Sidebar isOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />
          {mobileSidebarOpen && (
            <div 
              onClick={() => setMobileSidebarOpen(false)}
              style={{ 
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', 
                zIndex: 150, backdropFilter: 'blur(4px)' 
              }} 
            />
          )}
        </>
      )}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, width: '100%' }}>
        {showSidebar && <Navbar onMenuClick={() => setMobileSidebarOpen(true)} />}
        <main style={{ 
          flex: 1, 
          padding: showSidebar ? '1.25rem' : '0', // Default mobile-first padding
          width: '100%',
          maxWidth: '100%',
          margin: '0',
          // Desktop specific adjustments via media query logic in CSS is better, but keeping consistency
          display: 'flex',
          flexDirection: 'column'
        }} className="main-content-wrapper">
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
