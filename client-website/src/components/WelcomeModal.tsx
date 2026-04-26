"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Sparkles } from 'lucide-react';

export default function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasShown = localStorage.getItem('welcome-modal-shown');
    if (!hasShown) {
      const timer = setTimeout(() => setIsOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const close = () => {
    setIsOpen(false);
    localStorage.setItem('welcome-modal-shown', 'true');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-950/90 backdrop-blur-xl"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-5xl bg-white rounded-[60px] overflow-hidden shadow-2xl relative"
          >
            <button 
              onClick={close}
              className="absolute top-8 right-8 z-20 p-3 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full transition-all"
            >
              <X className="w-6 h-6 text-white md:text-gray-900" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-5 h-[80vh] md:h-[600px]">
               <div className="md:col-span-2 relative bg-black flex items-center justify-center overflow-hidden">
                  <iframe 
                    className="absolute inset-0 w-full h-full"
                    src="https://www.youtube.com/embed/6YaIHbbL4i0?autoplay=1&mute=1&controls=0&loop=1&playlist=6YaIHbbL4i0&rel=0"
                    title="Introduction Video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
               </div>
               <div className="md:col-span-3 p-12 flex flex-col justify-center bg-white relative z-10">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 text-primary text-xs font-black uppercase tracking-widest mb-6">
                    <Sparkles className="w-3 h-3" />
                    Special Welcome
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight tracking-tighter">
                    The Magic of <br />
                    <span className="text-gradient">Artistry</span>
                  </h2>
                  <p className="text-gray-500 font-medium mb-10 text-lg">
                    Discover how we bring your vision to life with precision and care. Watch our latest story.
                  </p>
                  <div className="flex flex-col gap-4">
                     <button onClick={close} className="py-5 bg-primary text-white rounded-3xl font-black text-lg shadow-2xl shadow-red-100 hover:scale-105 transition-all">
                        Experience the Glow
                     </button>
                     <button onClick={close} className="py-5 text-gray-400 font-bold hover:text-gray-900 transition-colors">
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
