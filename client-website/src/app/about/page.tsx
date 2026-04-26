"use client";

import { motion } from 'framer-motion';
import { Award, Users, Heart, Sparkles, Star } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-24 space-y-32">
       {/* Hero Section */}
       <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
          >
             <h2 className="text-5xl md:text-7xl font-black text-gray-900 mb-8 leading-[0.95]">
                Where Science Meets <span className="text-primary">Artistry</span>
             </h2>
             <p className="text-xl text-gray-500 font-medium leading-relaxed mb-8">
                Founded in 2024, BeautyBeats was born from a vision to provide clinical results in a luxury salon environment. We believe that every client deserves a personalized beauty journey.
             </p>
             <div className="grid grid-cols-2 gap-8">
                <div>
                   <h4 className="text-4xl font-black text-gray-900 mb-1">10k+</h4>
                   <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Satisfied Clients</p>
                </div>
                <div>
                   <h4 className="text-4xl font-black text-gray-900 mb-1">5</h4>
                   <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Expert Stylists</p>
                </div>
             </div>
          </motion.div>
          <div className="aspect-[4/5] bg-gray-50 rounded-[60px] relative overflow-hidden shadow-2xl">
             <img src="/images/hero.png" alt="About Hero" className="absolute inset-0 w-full h-full object-cover" />
             <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
          </div>
       </section>

       {/* Values */}
       <section className="text-center">
          <h3 className="text-4xl font-black mb-16">Our Core Values</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
             {[
               { title: 'Premium Care', desc: 'We only use top-tier global products and advanced clinical equipment.', icon: Award },
               { title: 'Artistic Flair', desc: 'Our stylists are trained by international industry masters.', icon: Star },
               { title: 'Client First', desc: 'Every treatment is customized to your unique skin and hair needs.', icon: Heart },
             ].map((val, i) => (
               <motion.div 
                key={val.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-12 rounded-[50px] bg-white border border-gray-100 shadow-sm"
               >
                  <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-primary mx-auto mb-8">
                     <val.icon className="w-8 h-8" />
                  </div>
                  <h4 className="text-2xl font-black mb-4">{val.title}</h4>
                  <p className="text-gray-500 font-medium">{val.desc}</p>
               </motion.div>
             ))}
          </div>
       </section>

       {/* Team */}
       <section className="bg-gray-950 rounded-[80px] p-24 text-white">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
             <div>
                <h3 className="text-5xl font-black mb-8 leading-tight">Meet the <br />Visionaries</h3>
                <p className="text-white/60 text-lg mb-12">
                   Our team is a blend of clinical dermatologists and visionary hair stylists, working together to achieve the perfect balance of health and beauty.
                </p>
                <button className="px-10 py-5 bg-white text-gray-950 rounded-full font-black hover:bg-gray-100 transition-all">
                   Join Our Team
                </button>
             </div>
             <div className="grid grid-cols-2 gap-6">
                {[1,2,3,4].map(i => (
                  <div key={i} className="aspect-square bg-white/5 rounded-[40px] border border-white/10" />
                ))}
             </div>
          </div>
       </section>
    </div>
  );
}
