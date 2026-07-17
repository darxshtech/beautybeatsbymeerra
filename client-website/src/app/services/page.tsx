"use client";

import { motion } from 'framer-motion';
import { Scissors, Sparkles, Award, Star, Clock, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import apiClient from '@/lib/api';

const fallbackCategories = [
  {
    category: 'Hair',
    img: 'https://res.cloudinary.com/dfcvnc77l/image/upload/v1784312769/beauty_beats_salon/ogzsz5nytmzqkevoq5oq.jpg',
    items: [
      { name: 'Haircut & Styling', price: 150, duration: '45m', desc: 'Precision cuts and blowouts tailored to your face shape.' },
      { name: 'Hair Colouring', price: 500, duration: '90m', desc: 'Global, highlights, balayage and creative colour work.' },
      { name: 'Keratin Treatment', price: 1200, duration: '120m', desc: 'Smooth, frizz-free hair for up to 6 months.' },
    ]
  },
  {
    category: 'Skin',
    img: 'https://res.cloudinary.com/dfcvnc77l/image/upload/v1784312790/beauty_beats_salon/h3t6iyx59rjjjghzpg8w.jpg',
    items: [
      { name: 'Hydra Facial', price: 800, duration: '60m', desc: 'Deep cleansing, exfoliation and hydration for radiant skin.' },
      { name: 'Chemical Peel', price: 600, duration: '45m', desc: 'Clinical-grade peels for pigmentation and acne scars.' },
      { name: 'De-Tan Treatment', price: 350, duration: '30m', desc: 'Remove sun damage and restore your natural glow.' },
    ]
  },
  {
    category: 'Bridal',
    img: 'https://res.cloudinary.com/dfcvnc77l/image/upload/v1784312767/beauty_beats_salon/buvwbb1jplilqjjfrahf.jpg',
    items: [
      { name: 'Bridal Makeup', price: 3500, duration: '180m', desc: 'Premium HD/Airbrush makeup for your special day.' },
      { name: 'Pre-Bridal Package', price: 5000, duration: '5 sessions', desc: 'Complete skin and hair prep starting 2 months before the wedding.' },
      { name: 'Engagement Look', price: 2000, duration: '120m', desc: 'Elegant makeup and styling for your engagement ceremony.' },
    ]
  },
];

export default function ServicesPage() {
  const [categories, setCategories] = useState<any[]>(fallbackCategories);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, serRes] = await Promise.all([
          apiClient.get('/categories').catch(() => ({ data: { success: false } })),
          apiClient.get('/services?branch=SALON').catch(() => ({ data: { success: false } }))
        ]);

        let availableCategories: string[] = [];
        if (catRes.data && catRes.data.success && catRes.data.data?.length > 0) {
          availableCategories = catRes.data.data.map((c: any) => c.name);
        }

        if (serRes.data && serRes.data.success && serRes.data.data?.length > 0) {
          const services = serRes.data.data;
          
          if (availableCategories.length === 0) {
            availableCategories = Array.from(new Set(services.map((s: any) => s.category).filter(Boolean))) as string[];
          }

          const groupedCategories = availableCategories.map(catName => {
            const catImage = catName.toLowerCase().includes('skin') || catName.toLowerCase().includes('facial') || catName.toLowerCase().includes('clean up')
              ? 'https://res.cloudinary.com/dfcvnc77l/image/upload/v1784312790/beauty_beats_salon/h3t6iyx59rjjjghzpg8w.jpg'
              : catName.toLowerCase().includes('hair') || catName.toLowerCase().includes('keratin')
                ? 'https://res.cloudinary.com/dfcvnc77l/image/upload/v1784312769/beauty_beats_salon/ogzsz5nytmzqkevoq5oq.jpg'
                : 'https://res.cloudinary.com/dfcvnc77l/image/upload/v1784312767/beauty_beats_salon/buvwbb1jplilqjjfrahf.jpg';

            return {
              category: catName,
              img: catImage,
              items: services.filter((s: any) => s.category === catName)
            };
          }).filter(c => c.items.length > 0);

          if (groupedCategories.length > 0) {
            setCategories(groupedCategories);
          }
        }
      } catch {
        // Use fallback categories silently
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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
