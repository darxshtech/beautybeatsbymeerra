"use client";

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function BeforeAfter() {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = 'touches' in e ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
    const position = ((x - rect.left) / rect.width) * 100;
    setSliderPos(Math.max(0, Math.min(100, position)));
  };

  return (
    <div className="space-y-6 md:space-y-12 py-12">
       <div className="text-center px-6">
          <h3 className="text-3xl md:text-4xl font-black text-gray-900 mb-2 tracking-tight">Transformation Spotlight</h3>
          <p className="text-sm md:text-lg text-gray-500 font-medium">Drag the slider to see the magic of our bridal artistry.</p>
       </div>
       
       <div 
         ref={containerRef}
         onMouseMove={handleMove}
         onTouchMove={handleMove}
         className="relative aspect-[4/5] md:aspect-video w-[92%] md:max-w-4xl mx-auto rounded-[30px] md:rounded-[40px] overflow-hidden cursor-ew-resize select-none border-4 md:border-8 border-white shadow-2xl"
       >
         {/* After Image (Background) */}
         <img 
            src="/images/after.png" 
            alt="After Makeup" 
            className="absolute inset-0 w-full h-full object-cover"
         />
         
         {/* Before Image (Overlay with Clip) */}
         <div 
            className="absolute inset-0 w-full h-full overflow-hidden"
            style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
         >
            <img 
              src="/images/before.png" 
              alt="Before Makeup" 
              className="absolute inset-0 w-full h-full object-cover"
            />
         </div>

         {/* Slider Line */}
         <div 
            className="absolute top-0 bottom-0 w-1 md:w-1.5 bg-white shadow-xl z-20"
            style={{ left: `${sliderPos}%` }}
         >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 md:w-12 md:h-12 bg-white rounded-full shadow-2xl flex items-center justify-center border-4 border-white">
               <div className="flex gap-1">
                  <div className="w-1 h-3 md:h-4 bg-red-200 rounded-full" />
                  <div className="w-1 h-3 md:h-4 bg-red-200 rounded-full" />
               </div>
            </div>
         </div>

         {/* Labels */}
         <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8 px-3 py-1.5 md:px-6 md:py-3 bg-black/40 backdrop-blur-md rounded-full text-white text-[10px] md:text-xs font-black uppercase tracking-widest pointer-events-none z-30">
            Before
         </div>
         <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8 px-3 py-1.5 md:px-6 md:py-3 bg-primary/90 backdrop-blur-md rounded-full text-white text-[10px] md:text-xs font-black uppercase tracking-widest pointer-events-none z-30">
            After
         </div>
       </div>
    </div>
  );
}
