"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Scissors, 
  Sparkles, 
  Clock, 
  Award, 
  ChevronRight, 
  Star, 
  MapPin, 
  Phone,
  Instagram,
  Facebook,
  Twitter
} from 'lucide-react';
import { cn } from '@/lib/utils';
import BeforeAfter from '@/components/BeforeAfter';
import WelcomeModal from '@/components/WelcomeModal';
import CustomerReviews from '@/components/CustomerReviews';
import SalonExperience from '@/components/SalonExperience';
import { useState, useEffect } from 'react';

const slides = [
  {
    title: "Redefine Your",
    highlight: "Natural Glow",
    desc: "BeautyBeats combines advanced clinic technology with premium salon artistry to create a transformation you can feel.",
    img: "/images/hero.png"
  },
  {
    title: "Elegance in Every",
    highlight: "Bridal Stroke",
    desc: "Unleash your inner goddess with our premium bridal packages tailored for your special day.",
    img: "/images/bridal.png"
  },
  {
    title: "Revolutionary",
    highlight: "Skin Science",
    desc: "Experience the next level of skincare with our clinical-grade treatments and expert dermatologists.",
    img: "/images/skin.png"
  }
];

const services = [
  { name: 'Hair Transformation', price: '₹45+', icon: Scissors, desc: 'Expert cuts and coloring tailored to your style.' },
  { name: 'Skin Rejuvenation', price: '₹120+', icon: Sparkles, desc: 'Advanced facials and clinical skin treatments.' },
  { name: 'Bridal Artistry', price: '₹350+', icon: Award, desc: 'Make your special day more beautiful with us.' },
];

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch('http://127.0.0.1:5000/api/services?limit=3');
        const json = await res.json();
        if (json.success) setServices(json.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchServices();

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col w-full overflow-x-hidden">
      <WelcomeModal />
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-12 overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-red-50 -z-10 rounded-l-[100px] hidden md:block" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-50/50 -z-10 rounded-full blur-3xl -ml-32 -mb-32" />

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            key={`hero-text-${currentSlide}`}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 text-primary text-xs font-black uppercase tracking-widest mb-6">
              <Sparkles className="w-3 h-3" />
              The Premium Salon Experience
            </div>
            <h1 className="text-5xl md:text-8xl font-black text-gray-900 leading-[0.95] tracking-tighter mb-8">
              {slides[currentSlide].title} <br />
              <span className="text-gradient leading-tight">{slides[currentSlide].highlight}</span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-lg leading-relaxed font-medium">
              {slides[currentSlide].desc}
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link href="/book" className="w-full sm:w-auto px-10 py-5 bg-primary text-white rounded-full font-black text-lg shadow-2xl shadow-red-200 hover:scale-105 transition-all flex items-center justify-center gap-2">
                Book Appointment
                <ChevronRight className="w-5 h-5" />
              </Link>
              <Link href="/services" className="w-full sm:w-auto px-10 py-5 bg-white text-gray-900 border-2 border-gray-100 rounded-full font-black text-lg hover:bg-gray-50 transition-all flex items-center justify-center">
                Explore Services
              </Link>
            </div>
            
            <div className="mt-12 flex items-center gap-6">
               <div className="flex -space-x-3">
                 {[1,2,3,4].map(i => (
                   <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                      <img src={`/images/hero.png`} className="w-full h-full object-cover" />
                   </div>
                 ))}
               </div>
               <p className="text-sm font-bold text-gray-500">
                 <span className="text-gray-900">5k+</span> Happy Clients
               </p>
            </div>
          </motion.div>

          <motion.div 
            key={`hero-img-${currentSlide}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="relative"
          >
            <div className="aspect-square bg-slate-100 rounded-[60px] relative overflow-hidden shadow-2xl premium-shadow">
               <img src={slides[currentSlide].img} alt="Salon Hero" className="absolute inset-0 w-full h-full object-cover" />
               <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-transparent" />
            </div>
            {/* Float Card */}
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-3xl shadow-xl flex items-center gap-4 border border-red-50">
               <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white">
                  <Star className="w-6 h-6" />
               </div>
               <div>
                  <p className="text-sm font-black">4.9/5 Rating</p>
                  <p className="text-xs text-gray-400">Trusted by Beauty Pros</p>
               </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Showcase */}
      <section className="py-24 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">Our Signature Services</h2>
            <p className="text-gray-500 max-w-2xl mx-auto mb-16 text-lg">Curated beauty treatments designed for your unique personality and skin type.</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((s, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="bg-white rounded-[40px] shadow-sm hover:shadow-xl transition-all border border-gray-100 flex flex-col items-center group overflow-hidden"
              >
                <div className="w-full h-48 relative overflow-hidden">
                   <img src={`/images/${s.category?.toLowerCase() === 'skin' ? 'skin' : s.category?.toLowerCase() === 'hair' ? 'hair' : 'bridal'}.png`} alt={s.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                   <div className="absolute inset-0 bg-black/10" />
                </div>
                <div className="p-10 flex flex-col items-center">
                   <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-primary mb-6 -mt-16 relative z-10 shadow-lg">
                      {s.category === 'Hair' ? <Scissors className="w-8 h-8" /> : s.category === 'Skin' ? <Sparkles className="w-8 h-8" /> : <Award className="w-8 h-8" />}
                   </div>
                   <h3 className="text-2xl font-black mb-4">{s.name}</h3>
                   <p className="text-gray-500 mb-8 line-clamp-2">{s.description}</p>
                   <p className="text-3xl font-black text-primary mb-6">₹{s.price}</p>
                   <Link href="/book" className="text-primary font-black flex items-center gap-1 hover:gap-2 transition-all">
                      Book Now <ChevronRight className="w-5 h-5" />
                   </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Salon Experience Section */}
      <section className="bg-white">
         <div className="max-w-7xl mx-auto px-6">
            <SalonExperience />
         </div>
      </section>

      {/* Before/After Section */}
      <section className="py-24 bg-white">
         <div className="max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
               <BeforeAfter />
            </motion.div>
         </div>
      </section>

      {/* Customer Reviews Slider */}
      <section className="py-24">
         <div className="max-w-7xl mx-auto px-6">
            <CustomerReviews />
         </div>
      </section>

      {/* Footer */}
      <footer className="py-24 border-t border-gray-100">
         <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="md:col-span-2">
               <h2 className="text-3xl font-black mb-6">BeautyBeats</h2>
               <p className="text-gray-500 text-lg max-w-sm mb-8">
                  Premium Salon & Clinic Management for the modern era. Experience beauty with technology.
               </p>
               <div className="flex gap-4">
                  {[Instagram, Facebook, Twitter].map((Icon, i) => (
                    <button key={i} className="p-3 bg-gray-50 hover:bg-primary hover:text-white rounded-2xl transition-all">
                       <Icon className="w-6 h-6" />
                    </button>
                  ))}
               </div>
            </div>
            <div>
               <h4 className="font-black text-xl mb-6 uppercase tracking-widest text-xs">Navigation</h4>
               <ul className="space-y-4 font-bold text-gray-500">
                  {['Services', 'About Us', 'Booking', 'FAQ', 'Privacy Policy'].map(item => (
                    <li key={item}><Link href="#" className="hover:text-primary transition-colors">{item}</Link></li>
                  ))}
               </ul>
            </div>
            <div>
               <h4 className="font-black text-xl mb-6 uppercase tracking-widest text-xs">Visit Us</h4>
               <div className="space-y-4 font-bold text-gray-500">
                  <p className="flex items-start gap-3">
                     <MapPin className="w-5 h-5 text-primary shrink-0" />
                     Talegoan, Pune, Maharashtra, India 410506
                  </p>
                  <p className="flex items-center gap-3">
                     <Phone className="w-5 h-5 text-primary" />
                     +91 9028414428
                  </p>
               </div>
            </div>
         </div>
         <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center text-sm font-bold text-gray-400 gap-4">
            <p>© 2026 BeautyBeats. All rights reserved.</p>
            <p>Developed and Designed by chaitanya Patil | Billing Softwares</p>
            <p>Designed with ❤️ for Meera Mam.</p>
         </div>
      </footer>
    </div>
  );
}
