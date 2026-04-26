"use client";

import { motion } from 'framer-motion';
import { Tag, Sparkles, Gift, Clock, ChevronRight, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const offers = [
  { id: 1, title: 'Festival Glow Up', desc: 'Get 25% off on all clinical facials this weekend.', code: 'GLOW25', color: 'bg-red-500', icon: Sparkles },
  { id: 2, title: 'New Member Gift', desc: 'Flat $20 off on your first bridal session.', code: 'WELCOME20', color: 'bg-amber-500', icon: Gift },
  { id: 3, title: 'Combo Special', desc: 'Hair Cut + Spa Massage at just $150.', code: 'COMBO150', color: 'bg-blue-500', icon: Tag },
];

export default function OffersPage() {
  const [copied, setCopied] = useState<number | null>(null);

  const handleCopy = (id: number, code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="text-center mb-16">
        <h2 className="text-5xl font-black text-gray-900 mb-4 tracking-tighter">Exclusive Offers</h2>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto">Premium deals and seasonal discounts designed just for you.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {offers.map((offer, index) => (
          <motion.div
            key={offer.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex flex-col bg-white rounded-[45px] border border-gray-100 shadow-sm overflow-hidden group hover:shadow-2xl hover:shadow-red-100 transition-all duration-500"
          >
            <div className={cn("h-48 w-full p-10 flex items-center justify-center text-white relative", offer.color)}>
               <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-125 transition-transform">
                  <offer.icon className="w-32 h-32" />
               </div>
               <offer.icon className="w-16 h-16 relative z-10" />
            </div>

            <div className="p-10 flex-1 flex flex-col">
               <h3 className="text-2xl font-black text-gray-900 mb-4">{offer.title}</h3>
               <p className="text-gray-500 font-medium mb-8 leading-relaxed">{offer.desc}</p>
               
               <div className="mt-auto space-y-6">
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                     <span className="px-4 font-black tracking-widest text-lg text-gray-400">{offer.code}</span>
                     <button 
                        onClick={() => handleCopy(offer.id, offer.code)}
                        className="px-6 py-2 bg-white text-gray-900 rounded-xl font-bold shadow-sm hover:bg-gray-50 transition-all flex items-center gap-2"
                     >
                        {copied === offer.id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        {copied === offer.id ? 'Copied' : 'Copy'}
                     </button>
                  </div>
                  
                  <Link href="/book" className="w-full py-4 bg-gray-950 text-white rounded-full font-black flex items-center justify-center gap-2 group-hover:bg-primary transition-colors">
                     Apply & Book Now
                     <ChevronRight className="w-5 h-5" />
                  </Link>
               </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-24 p-12 rounded-[60px] bg-red-50/50 border border-red-100 text-center space-y-6">
         <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-primary mx-auto shadow-sm">
            <Clock className="w-8 h-8" />
         </div>
         <h3 className="text-3xl font-black text-gray-900 tracking-tight">Hurry, these offers are limited!</h3>
         <p className="text-gray-500 font-bold max-w-lg mx-auto">Most our festival discounts expire within 48 hours. Secure your slot now to avail the best prices.</p>
         <button className="px-10 py-4 bg-primary text-white rounded-full font-black shadow-xl shadow-red-100">
            View All Services
         </button>
      </div>
    </div>
  );
}
