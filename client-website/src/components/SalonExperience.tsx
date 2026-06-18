"use client";

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ShieldCheck, Clock, Play, Users, ChevronRight } from 'lucide-react';

const gallery = [
  { img: "/images/ambience.png", title: "Luxury Ambience", desc: "A serene and sophisticated environment designed for your relaxation." },
  { img: "/images/hygiene.png", title: "Clinical Hygiene", desc: "Highest standards of cleanliness and sterilized equipment for your safety." },
  { img: "/images/waiting.png", title: "Premium Lounge", desc: "Relax in our comfortable waiting area with high-end hospitality." },
  { img: "/images/staff.png", title: "Expert Care", desc: "Our professional staff values your time and provides personalized attention." },
];

const videoReviews = [
  { id: 1, title: "Bridal Makeover", duration: "Premium Experience", url: "/images/IMG_5453.MOV" },
  { id: 2, title: "Hair Styling", duration: "Expert Artistry", url: "/images/IMG_5456.MOV" },
  { id: 3, title: "Nail & Lash Glamour", duration: "Signature Touch", url: "/images/IMG_5464.MOV" },
  { id: 4, title: "Advanced Skin Care", duration: "Clinical Results", url: "/images/IMG_5471.MOV" },
  { id: 5, title: "Hair Highlights", duration: "Trending Looks", url: "/images/IMG_5476.MOV" },
];

function VideoCard({ v }: { v: typeof videoReviews[0] }) {
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isHovered) {
      videoRef.current?.play().catch(() => {});
    } else {
      videoRef.current?.pause();
    }
  }, [isHovered]);

  return (
    <motion.div
      whileHover={{ scale: 1.1, zIndex: 50 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative aspect-video rounded-[40px] overflow-hidden shadow-2xl bg-black border-4 border-white transition-all duration-300 ease-out"
    >
       {/* Cropping Wrapper */}
       <div className="absolute inset-[-20%] w-[140%] h-[140%] pointer-events-none">
          <video 
            ref={videoRef}
            className={`w-full h-full object-cover transition-all duration-700 ${isHovered ? 'opacity-100' : 'opacity-40'}`}
            src={v.url}
            muted
            loop
            playsInline
          />
       </div>
       
       <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
       
       <div className="absolute bottom-6 left-8 right-8 flex justify-between items-end text-white z-10 pointer-events-none">
          <div>
             <p className="font-black text-2xl mb-1 drop-shadow-xl tracking-tight">{v.title}</p>
             <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">{v.duration}</p>
          </div>
          {!isHovered && (
             <div className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/20 shadow-xl">
                <Play className="w-6 h-6 text-white fill-white ml-1" />
             </div>
          )}
       </div>

       {/* Interactive Overlay to capture hover but allow iframe hidden play */}
       <div className="absolute inset-0 z-20" />
    </motion.div>
  );
}

export default function SalonExperience() {
  return (
    <div className="space-y-16 md:space-y-32 py-12 md:py-24">
       {/* Ambience & Experience Grid */}
       <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6 text-center lg:text-left"
          >
             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 text-primary text-xs font-black uppercase tracking-widest mx-auto lg:mx-0">
                <ShieldCheck className="w-3 h-3" />
                Wait-Free Experience
             </div>
             <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">
                Your Time is <span className="text-gradient">Precious</span>
             </h2>
             <p className="text-base md:text-lg text-gray-500 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
                At BeautyBeats, we manage every appointment with clinical precision. Our streamlined management ensures you never have to wait.
             </p>
             <div className="grid grid-cols-2 gap-6 md:gap-8 pt-4">
                <div className="space-y-3">
                   <div className="w-10 h-10 md:w-12 md:h-12 bg-red-50 rounded-2xl flex items-center justify-center text-primary mx-auto lg:mx-0">
                      <Clock className="w-5 h-5 md:w-6 md:h-6" />
                   </div>
                   <div>
                      <h4 className="text-lg md:text-xl font-black">Punctual</h4>
                      <p className="text-[10px] md:text-xs text-gray-400 font-black uppercase tracking-widest">Zero Wait</p>
                   </div>
                </div>
                <div className="space-y-3">
                   <div className="w-10 h-10 md:w-12 md:h-12 bg-red-50 rounded-2xl flex items-center justify-center text-primary mx-auto lg:mx-0">
                      <Sparkles className="w-5 h-5 md:w-6 md:h-6" />
                   </div>
                   <div>
                      <h4 className="text-lg md:text-xl font-black">Sterile</h4>
                      <p className="text-[10px] md:text-xs text-gray-400 font-black uppercase tracking-widest">Certified</p>
                   </div>
                </div>
             </div>
          </motion.div>

          <div className="grid grid-cols-2 gap-3 md:gap-4">
             {gallery.map((item, i) => (
               <motion.div
                 key={i}
                 initial={{ opacity: 0, scale: 0.9 }}
                 whileInView={{ opacity: 1, scale: 1 }}
                 viewport={{ once: true }}
                 transition={{ delay: i * 0.1 }}
                 className="group relative aspect-[3/4] rounded-2xl md:rounded-[30px] overflow-hidden shadow-xl border-2 md:border-4 border-white"
               >
                  <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 p-4 md:p-6 flex flex-col justify-end">
                     <p className="text-white font-black text-sm md:text-lg mb-1">{item.title}</p>
                     <p className="text-white/70 text-[10px] md:text-xs font-bold leading-tight">{item.desc}</p>
                  </div>
               </motion.div>
             ))}
          </div>
       </div>

       {/* Video Hub Slider/Grid */}
       <div className="bg-gray-50 py-16 md:py-24 rounded-3xl md:rounded-[60px] mx-4 md:mx-0">
          <div className="max-w-7xl mx-auto px-6">
             <div className="text-center mb-12 md:mb-16">
                <h3 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 tracking-tight">Our Stories in Motion</h3>
                <p className="text-sm md:text-base text-gray-500 font-medium">Watch what our customers and staff have to say about the BeautyBeats experience.</p>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {videoReviews.map((v, idx) => (
                  <div key={v.id} className={idx === 0 ? 'lg:col-span-2' : ''}>
                    <VideoCard v={v} />
                  </div>
                ))}
             </div>
          </div>
       </div>
    </div>
  );
}
