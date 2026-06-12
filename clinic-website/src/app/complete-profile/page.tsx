"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Phone, MapPin, Calendar, Sparkles, UserCheck } from 'lucide-react';

export default function CompleteProfile() {
  const { user, completeProfile } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    phone: '',
    address: '',
    birthday: '',
    skinType: 'Normal'
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { skinType, ...rest } = formData;
      await completeProfile({
        ...rest,
        skinToneInfo: { skinType }
      });
      router.push('/profile');
    } catch (err: any) {
      setError('Failed to update profile');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-20">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full p-12 rounded-[50px] bg-white border border-gray-100 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        
        <header className="mb-10">
           <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-primary mb-6">
              <Sparkles className="w-8 h-8" />
           </div>
           <h2 className="text-4xl font-black text-gray-900 tracking-tighter leading-none">Last Step, {user?.name?.split(' ')[0]}</h2>
           <p className="text-gray-500 font-bold text-lg mt-4">We just need a few more details to personalize your BeautyBeats experience.</p>
        </header>

        {error && <p className="text-red-500 text-sm font-bold mb-6">{error}</p>}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-4">Phone Number</label>
              <div className="relative">
                 <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                 <input 
                   required
                   type="text"
                   value={formData.phone}
                   onChange={e => setFormData({...formData, phone: e.target.value})}
                   className="w-full pl-14 pr-6 py-5 bg-gray-50 rounded-[25px] border-none outline-none focus:ring-2 ring-primary/20 transition-all font-bold text-gray-900"
                   placeholder="+91 98765 43210"
                 />
              </div>
           </div>

           <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-4">Date of Birth</label>
              <div className="relative">
                 <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                 <input 
                   required
                   type="date"
                   value={formData.birthday}
                   onChange={e => setFormData({...formData, birthday: e.target.value})}
                   className="w-full pl-14 pr-6 py-5 bg-gray-50 rounded-[25px] border-none outline-none focus:ring-2 ring-primary/20 transition-all font-bold text-gray-900"
                 />
              </div>
           </div>

           <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-4">Residential Address</label>
              <div className="relative">
                 <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                 <input 
                   required
                   type="text"
                   value={formData.address}
                   onChange={e => setFormData({...formData, address: e.target.value})}
                   className="w-full pl-14 pr-6 py-5 bg-gray-50 rounded-[25px] border-none outline-none focus:ring-2 ring-primary/20 transition-all font-bold text-gray-900"
                   placeholder="Your full address"
                 />
              </div>
           </div>

           <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-4">Core Skin Type</label>
              <select 
                value={formData.skinType}
                onChange={e => setFormData({...formData, skinType: e.target.value})}
                className="w-full px-6 py-5 bg-gray-50 rounded-[25px] border-none outline-none focus:ring-2 ring-primary/20 transition-all font-bold text-gray-900 appearance-none cursor-pointer"
              >
                <option value="Normal">Normal</option>
                <option value="Dry">Dry</option>
                <option value="Oily">Oily</option>
                <option value="Combination">Combination</option>
                <option value="Sensitive">Sensitive</option>
              </select>
           </div>

           <button 
             type="submit"
             className="md:col-span-2 w-full py-6 bg-primary text-white rounded-[30px] font-black text-xl shadow-2xl shadow-red-100 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 mt-4"
           >
              <UserCheck className="w-8 h-8" />
              Complete Member Induction
           </button>
        </form>
      </motion.div>
    </div>
  );
}
