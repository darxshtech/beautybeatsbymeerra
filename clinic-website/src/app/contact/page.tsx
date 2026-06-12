"use client";

import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Instagram, Facebook, Clock, Send } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-24 space-y-24">
       <div className="text-center">
          <h2 className="text-5xl font-black text-gray-900 mb-6 tracking-tighter">Get in Touch</h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">Have questions? We'd love to hear from you. Stop by or send us a message.</p>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Details */}
          <div className="space-y-12">
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="p-8 rounded-[40px] bg-white border border-gray-100 shadow-sm space-y-4">
                   <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-primary">
                      <MapPin className="w-6 h-6" />
                   </div>
                   <h4 className="text-xl font-black">Our Address</h4>
                   <p className="text-gray-500 font-medium text-sm">Talegoan, Pune, Maharashtra, India 410506</p>
                </div>
                <div className="p-8 rounded-[40px] bg-white border border-gray-100 shadow-sm space-y-4">
                   <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-primary">
                      <Phone className="w-6 h-6" />
                   </div>
                   <h4 className="text-xl font-black">Call Us</h4>
                   <p className="text-gray-500 font-medium text-sm">+91 90284 14428</p>
                </div>
                <div className="p-8 rounded-[40px] bg-white border border-gray-100 shadow-sm space-y-4">
                   <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-primary">
                      <Mail className="w-6 h-6" />
                   </div>
                   <h4 className="text-xl font-black">Email</h4>
                   <p className="text-gray-500 font-medium text-sm">hello@beautybeats.in</p>
                </div>
                <div className="p-8 rounded-[40px] bg-white border border-gray-100 shadow-sm space-y-4">
                   <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-primary">
                      <Clock className="w-6 h-6" />
                   </div>
                   <h4 className="text-xl font-black">Open Hours</h4>
                   <p className="text-gray-500 font-medium text-sm">10:00 AM - 08:30 PM</p>
                </div>
             </div>

             <div className="p-10 rounded-[50px] bg-gray-950 text-white flex items-center justify-between">
                <div>
                   <h4 className="text-2xl font-black mb-2">Follow our Journey</h4>
                   <p className="text-white/60 text-sm">Stay updated with latest trends.</p>
                </div>
                <div className="flex gap-4">
                   <button className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all">
                      <Instagram className="w-6 h-6" />
                   </button>
                   <button className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all">
                      <Facebook className="w-6 h-6" />
                   </button>
                </div>
             </div>
          </div>

          {/* Form */}
          <div className="p-12 rounded-[60px] bg-white border border-gray-100 shadow-2xl shadow-red-50">
             <h3 className="text-2xl font-black mb-8">Send a Message</h3>
             <form className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black tracking-widest text-gray-400">Name</label>
                      <input type="text" className="w-full px-6 py-4 rounded-2xl bg-gray-50 outline-none focus:ring-2 focus:ring-primary/20 font-bold" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black tracking-widest text-gray-400">Email</label>
                      <input type="email" className="w-full px-6 py-4 rounded-2xl bg-gray-50 outline-none focus:ring-2 focus:ring-primary/20 font-bold" />
                   </div>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] uppercase font-black tracking-widest text-gray-400">Subject</label>
                   <input type="text" className="w-full px-6 py-4 rounded-2xl bg-gray-50 outline-none focus:ring-2 focus:ring-primary/20 font-bold" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] uppercase font-black tracking-widest text-gray-400">Message</label>
                   <textarea rows={4} className="w-full px-6 py-4 rounded-2xl bg-gray-50 outline-none focus:ring-2 focus:ring-primary/20 font-bold resize-none" />
                </div>
                <button className="w-full py-5 bg-primary text-white rounded-full font-black shadow-xl shadow-red-200 flex items-center justify-center gap-2">
                   Send Message
                   <Send className="w-5 h-5" />
                </button>
             </form>
          </div>
       </div>
    </div>
  );
}
