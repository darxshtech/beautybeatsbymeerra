"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Star, Quote } from 'lucide-react';
import axios from 'axios';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api';

const fallbackReviews = [
  {
    name: "Ananya Sharma",
    text: "The bridal package was worth every rupee! The team at BeautyBeats understood exactly what I wanted for my engagement. The glow lasted for days!",
    rating: 5,
    service: "Bridal Package"
  },
  {
    name: "Priya Patil",
    text: "I've been coming here for skin treatments for 6 months. My acne scars have faded significantly. Truly clinical results with a salon feel.",
    rating: 5,
    service: "Skin Treatment"
  },
  {
    name: "Sneha Kulkarni",
    text: "The hair transformation was incredible. They used premium products and the styling was very trendy. Highly recommend their keratin treatment!",
    rating: 4,
    service: "Hair Transformation"
  }
];

export default function CustomerReviews() {
  const [reviews, setReviews] = useState(fallbackReviews);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axios.get(`${API}/feedback/public`);
        if (res.data.success && res.data.data.length > 0) {
          const apiReviews = res.data.data.map((r: any) => ({
            name: r.customer?.name || 'Happy Client',
            text: r.comment || 'Great experience at BeautyBeats!',
            rating: r.rating,
            service: r.service?.name || 'Beauty Service'
          }));
          setReviews(apiReviews);
        }
      } catch {
        // Silently fall back to default reviews
      }
    };
    fetchReviews();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % reviews.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [reviews]);

  const currentReview = reviews[index] || reviews[0];

  return (
    <div className="py-24 bg-red-600 rounded-[60px] overflow-hidden relative shadow-2xl premium-shadow text-white">
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl" />
      <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
         <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-white text-xs font-black uppercase tracking-widest mb-8 backdrop-blur-md">
            <Star className="w-4 h-4 fill-white" />
            Real Client Reviews
         </div>
         
         <div className="relative h-[280px] md:h-[220px] flex items-center justify-center">
           <AnimatePresence mode="wait">
             <motion.div
               key={index}
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               className="space-y-6"
             >
                <Quote className="w-12 h-12 text-white/30 mx-auto" />
                <p className="text-2xl md:text-3xl font-black italic leading-tight">
                   "{currentReview.text}"
                </p>
                {/* Star Rating Display */}
                <div className="flex justify-center gap-1 mb-2">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className={`w-5 h-5 ${s <= currentReview.rating ? 'fill-yellow-400 text-yellow-400' : 'text-white/30'}`} />
                  ))}
                </div>
                <div>
                   <h4 className="text-xl font-bold">{currentReview.name}</h4>
                   <p className="text-white/60 text-sm">{currentReview.service}</p>
                </div>
             </motion.div>
           </AnimatePresence>
         </div>

         <div className="flex justify-center gap-2 mt-12">
            {reviews.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`w-3 h-3 rounded-full transition-all ${index === i ? 'bg-white w-12' : 'bg-white/30'}`}
              />
            ))}
         </div>
      </div>
    </div>
  );
}
