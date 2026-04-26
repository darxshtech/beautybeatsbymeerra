"use client";

import { motion } from 'framer-motion';
import { 
  Settings, 
  QrCode, 
  Share2, 
  Bell, 
  Shield, 
  Smartphone, 
  Globe, 
  Copy, 
  Check, 
  Users,
  Award, 
  Scissors,
  Calendar, 
  User, 
  Clock, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  Sparkles,
  Info
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const [copied, setCopied] = useState(false);
  const bookingLink = "https://beautybeats.com/book/salon-01";

  const handleCopy = () => {
    navigator.clipboard.writeText(bookingLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Platform Settings</h2>
        <p className="text-gray-500 dark:text-gray-400">Configure your business rules and integration.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* QR & Booking Link */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-xs">
            <QrCode className="w-4 h-4" />
            Booking Presence
          </div>
          <div className="p-8 rounded-4xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-xl flex flex-col items-center text-center">
            <div className="w-48 h-48 bg-gray-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center border-4 border-primary/10 mb-6 p-4">
              {/* Mock QR Code */}
              <div className="w-full h-full bg-slate-900 rounded-xl relative overflow-hidden">
                <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 gap-1 p-2">
                  {Array.from({ length: 64 }).map((_, i) => (
                    <div key={i} className={cn("rounded-sm", Math.random() > 0.5 ? "bg-white" : "bg-transparent")} />
                  ))}
                </div>
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-black">
                        <Scissors className="text-white w-4 h-4" />
                    </div>
                </div>
              </div>
            </div>
            <h4 className="text-xl font-bold mb-2">Unique Booking QR</h4>
            <p className="text-sm text-gray-500 mb-6">Customers can scan this to open your booking page instantly.</p>
            <div className="w-full flex gap-2 p-2 bg-gray-50 dark:bg-slate-800 rounded-2xl mb-4">
              <input readOnly value={bookingLink} className="bg-transparent flex-1 text-xs px-2 outline-none font-medium truncate" />
              <button 
                onClick={handleCopy}
                className="p-2 bg-white dark:bg-slate-700 rounded-xl shadow-sm hover:bg-gray-50 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
              </button>
            </div>
            <button className="w-full py-3 rounded-2xl bg-primary text-white font-bold hover:bg-primary-dark transition-all flex items-center justify-center gap-2">
               <Share2 className="w-4 h-4" />
               Download High-Res QR
            </button>
          </div>
        </section>

        {/* Global Config */}
        <section className="space-y-6">
           <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-xs">
            <Settings className="w-4 h-4" />
            Business Logic
          </div>
          <div className="space-y-4">
            {[
              { label: 'Auto SMS Reminders', icon: Bell, checked: true },
              { label: 'Loyalty Program', icon: Award, checked: true },
              { label: 'Online Payments', icon: Shield, checked: false },
              { label: 'Staff Management', icon: Users, checked: true },
              { label: 'Multi-device Sync', icon: Smartphone, checked: true },
              { label: 'Cloud Hosting', icon: Globe, checked: true },
            ].map((config) => (
              <div key={config.label} className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-500">
                    <config.icon className="w-5 h-5" />
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">{config.label}</span>
                </div>
                <div className={cn(
                  "w-12 h-6 rounded-full p-1 transition-colors relative cursor-pointer",
                  config.checked ? "bg-primary" : "bg-gray-200"
                )}>
                  <div className={cn(
                    "w-4 h-4 bg-white rounded-full transition-transform",
                    config.checked ? "translate-x-6" : "translate-x-0"
                  )} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
