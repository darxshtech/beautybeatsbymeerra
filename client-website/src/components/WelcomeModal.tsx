"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://beautybeatsbymeerra-bdk7.onrender.com/api';

export default function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<any>(null);

  useEffect(() => {
    const fetchWelcome = async () => {
      try {
        const res = await axios.get(`${API_URL}/website-content?type=WELCOME_POPUP&isActive=true&branch=SALON`);
        if (res.data.success && res.data.data.length > 0) {
          setContent(res.data.data[0]);
          const hasShown = localStorage.getItem(`welcome-modal-shown-${res.data.data[0]._id}`);
          if (!hasShown) {
            const timer = setTimeout(() => setIsOpen(true), 1500);
            return () => clearTimeout(timer);
          }
        }
      } catch (err) {
        // Silently fail
      }
    };
    fetchWelcome();
  }, []);

  const close = () => {
    setIsOpen(false);
    if (content?._id) {
      localStorage.setItem(`welcome-modal-shown-${content._id}`, 'true');
    }
  };

  if (!content) return null;

  const isVideo = content.imageUrl?.endsWith('.mp4') || content.imageUrl?.endsWith('.webm') || content.imageUrl?.includes('/video/upload/');

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-gray-950/90 backdrop-blur-xl"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-5xl bg-white rounded-[30px] md:rounded-[60px] overflow-hidden shadow-2xl relative max-h-[95vh] overflow-y-auto"
          >
            <button 
              onClick={close}
              className="absolute top-4 right-4 md:top-8 md:right-8 z-20 p-2 md:p-3 bg-black/40 md:bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full transition-all"
            >
              <X className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </button>

            {/* Mobile: stacked vertically. Desktop: side-by-side grid */}
            <div className="flex flex-col md:grid md:grid-cols-5 md:h-[600px]">
               {/* Video/Image Section */}
               <div className="md:col-span-2 relative bg-black flex items-center justify-center overflow-hidden aspect-video md:aspect-auto">
                  {isVideo ? (
                    <video 
                      className="absolute inset-0 w-full h-full object-cover"
                      src={content.imageUrl}
                      autoPlay
                      muted
                      loop
                      playsInline
                    />
                  ) : (
                    <img 
                      className="absolute inset-0 w-full h-full object-cover"
                      src={content.imageUrl}
                      alt="Welcome"
                    />
                  )}
               </div>
               {/* Text Section */}
               <div className="md:col-span-3 p-6 md:p-12 flex flex-col justify-center bg-white relative z-10">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 text-primary text-xs font-black uppercase tracking-widest mb-4 md:mb-6 w-fit">
                    <Sparkles className="w-3 h-3" />
                    Special Welcome
                  </div>
                  <h2 className="text-2xl md:text-5xl font-black text-gray-900 mb-4 md:mb-6 leading-tight tracking-tighter">
                    {content.title}
                  </h2>
                  <p className="text-gray-500 font-medium mb-6 md:mb-10 text-base md:text-lg">
                    {content.subtitle || "Discover how we bring your vision to life with precision and care."}
                  </p>
                  <div className="flex flex-col gap-3 md:gap-4">
                     <button onClick={close} className="py-4 md:py-5 bg-primary text-white rounded-2xl md:rounded-3xl font-black text-base md:text-lg shadow-2xl shadow-red-100 hover:scale-105 transition-all">
                        Experience the Glow
                     </button>
                     <button onClick={close} className="py-3 md:py-5 text-gray-400 font-bold hover:text-gray-900 transition-colors text-sm md:text-base">
                        Close Preview
                     </button>
                  </div>
               </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
