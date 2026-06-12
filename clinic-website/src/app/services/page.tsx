"use client";

import { motion } from 'framer-motion';
import { Scissors, Sparkles, Award, Star, Clock, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import apiClient from '@/lib/api';

export default function ServicesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await apiClient.get('/services');
        if (res.data.success) {
          // Group by category
          const grouped = res.data.data.reduce((acc: any, service: any) => {
            const cat = service.category || 'General';
            if (!acc[cat]) acc[cat] = { category: cat, items: [], img: '/images/hair.png' };
            acc[cat].items.push(service);
            return acc;
          }, {});
          setCategories(Object.values(grouped));
        }
      } catch (err) {
        console.error('Fetch services error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  if (loading) return <div className="p-20 text-center font-black text-gray-400">Curating Services...</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-24">
      <div className="text-center mb-24">
         <h2 className="text-5xl font-black text-gray-900 mb-6 tracking-tighter">Our Services</h2>
         <p className="text-gray-500 text-lg max-w-2xl mx-auto">From clinical precision to artistic flair, we offer a comprehensive range of beauty treatments.</p>
      </div>

      <div className="space-y-24">
        {categories.map((cat, idx) => (
          <section key={cat.category}>
            <div className="flex flex-col md:flex-row gap-12 items-center mb-16">
               <div className="flex-1 space-y-4">
                  <h3 className="text-4xl font-black text-gray-900">{cat.category}</h3>
                  <div className="w-24 h-1 bg-primary rounded-full" />
                  <p className="text-gray-500 max-w-md">Our {cat.category.toLowerCase()} services combine medical precision with artistic vision.</p>
               </div>
               <div className="flex-1 w-full h-48 md:h-64 rounded-[40px] overflow-hidden shadow-xl border-4 border-white">
                  <img src={cat.img} alt={cat.category} className="w-full h-full object-cover" />
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {cat.items.map((item: any, i: number) => (
                 <motion.div
                   key={item.name}
                   initial={{ opacity: 0, y: 20 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   transition={{ delay: i * 0.1 }}
                   className="p-8 rounded-[40px] bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all"
                 >
                   <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-primary">
                         {idx === 0 ? <Scissors className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
                      </div>
                      <div className="text-right">
                         <p className="text-2xl font-black text-gray-900">₹{item.price}</p>
                         <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{item.duration}</p>
                      </div>
                   </div>
                   <h4 className="text-xl font-black text-gray-900 mb-4">{item.name}</h4>
                   <p className="text-gray-500 font-medium mb-8 text-sm line-clamp-2">{item.desc}</p>
                   <Link href="/book" className="flex items-center gap-2 text-primary font-black group">
                      Book Choice
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                   </Link>
                 </motion.div>
               ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
