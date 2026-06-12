"use client";

import { motion } from 'framer-motion';
import { Award, CheckCircle2, Star, Sparkles, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const packages = [
  {
    name: 'Gold Bridal Glow',
    price: 450,
    save: 'Save ₹80',
    features: ['Premium Makeup', 'Hydra Facial', 'Hair Styling', 'Saree Draping', 'Nail Art'],
    popular: true
  },
  {
    name: 'Silver Celebration',
    price: 280,
    save: 'Save ₹45',
    features: ['Celebrity Makeup', 'Basic Facial', 'Hair Blowout', 'Nail Polish'],
    popular: false
  },
  {
    name: 'Skin Revival',
    price: 150,
    save: 'Save ₹30',
    features: ['Micro-Needling', 'Organic Peel', 'Serum Infusion'],
    popular: false
  }
];

export default function PackagesPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-24">
      <div className="text-center mb-20">
         <h2 className="text-5xl font-black text-gray-900 mb-6 tracking-tighter">Special Packages</h2>
         <p className="text-gray-500 text-lg max-w-2xl mx-auto">Unlock premium savings with our curated beauty combinations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {packages.map((pkg, i) => (
          <motion.div
            key={pkg.name}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className={`p-10 rounded-[50px] relative flex flex-col ${pkg.popular ? 'bg-primary text-white shadow-2xl shadow-red-200' : 'bg-white border border-gray-100 shadow-sm'}`}
          >
            {pkg.popular && (
              <div className="absolute top-0 right-6 md:right-10 -translate-y-1/2 bg-amber-400 text-amber-950 px-4 md:px-6 py-2 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest shadow-lg">
                Most Popular
              </div>
            )}
            
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 ${pkg.popular ? 'bg-white text-primary' : 'bg-red-50 text-primary'}`}>
               <Award className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-black mb-1">{pkg.name}</h3>
            <p className={`text-sm font-bold mb-8 ${pkg.popular ? 'text-white/70' : 'text-gray-400'}`}>{pkg.save}</p>

            <div className="flex items-baseline gap-1 mb-8">
               <span className="text-5xl font-black">₹{pkg.price}</span>
               <span className={`text-sm font-bold opacity-70`}>/package</span>
            </div>

            <ul className="space-y-4 mb-12 flex-1">
               {pkg.features.map(f => (
                 <li key={f} className="flex items-center gap-3 font-bold text-sm">
                   <CheckCircle2 className={`w-5 h-5 ${pkg.popular ? 'text-white' : 'text-primary'}`} />
                   {f}
                 </li>
               ))}
            </ul>

            <Link href="/book" className={`w-full py-4 rounded-full font-black flex items-center justify-center gap-2 transition-all ${pkg.popular ? 'bg-white text-primary hover:bg-red-50' : 'bg-gray-950 text-white hover:bg-primary'}`}>
               Book Package
               <ChevronRight className="w-5 h-5" />
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
