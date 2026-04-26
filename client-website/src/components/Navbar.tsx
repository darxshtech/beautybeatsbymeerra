"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Scissors, Menu, X, ShoppingBag, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-[100] transition-all duration-300 px-6 py-4",
      scrolled ? "bg-white/80 backdrop-blur-md shadow-md py-3" : "bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-primary/20 group-hover:border-primary transition-all">
             <img src="/images/logo.jpeg" alt="BeautyBeats Logo" className="w-full h-full object-cover" />
          </div>
          <span className="text-xl md:text-2xl font-black tracking-tighter text-gray-900 group-hover:text-primary transition-colors hidden xs:block">
            BeautyBeats
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-8">
          {['Home', 'Services', 'Packages', 'Subscriptions', 'About', 'Contact'].map((item) => (
            <Link key={item} href={item === 'Home' ? '/' : `/${item.toLowerCase()}`} className="text-sm font-bold text-gray-600 hover:text-primary transition-colors">
              {item}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <Link href={user ? "/profile" : "/login"} className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-full hover:bg-gray-100 transition-colors">
             <User className="w-5 h-5 text-gray-700" />
             {!user && <span className="text-sm font-bold text-gray-700">Member Induction</span>}
          </Link>
          <Link href="/book" className="bg-primary text-white px-4 md:px-6 py-2 md:py-2.5 rounded-full font-bold text-xs md:text-sm shadow-lg shadow-red-100 hover:scale-105 transition-all text-nowrap">
            Book Now
          </Link>
          <button className="lg:hidden p-2" onClick={() => setMobileMenu(true)}>
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenu && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 bg-white z-[200] p-8 flex flex-col overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-12">
               <span className="text-2xl font-black tracking-tighter">BeautyBeats</span>
               <button onClick={() => setMobileMenu(false)} className="p-2 bg-gray-100 rounded-full">
                 <X className="w-6 h-6" />
               </button>
            </div>
            <div className="flex flex-col gap-6">
               {['Home', 'Services', 'Packages', 'Subscriptions', 'About', 'Contact', 'Profile'].map((item) => (
                <Link key={item} href={item === 'Home' ? '/' : `/${item.toLowerCase()}`} onClick={() => setMobileMenu(false)} className="text-3xl font-black text-gray-900 border-b border-gray-100 pb-4">
                  {item}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
