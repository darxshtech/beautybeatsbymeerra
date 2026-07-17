"use client";

import { motion } from 'framer-motion';
import { Award, Users, Heart, Sparkles, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://beautybeatsbymeerra-bdk7.onrender.com/api';

const defaultHero = {
  title: "Where Science Meets Artistry",
  subtitle: "Experience state-of-the-art dermatological and clinical treatments designed for your skin and hair health, backed by professional medical expertise.",
  imageUrl: "https://res.cloudinary.com/dfcvnc77l/image/upload/v1784312800/beauty_beats_clinic/iukcp792he1ehijo26o0.jpg"
};

const defaultStats = [
  { label: "Satisfied Clients", value: "10k+" },
  { label: "Expert Stylists", value: "3 Doctors" }
];

const defaultValues = [
  { title: 'Premium Care', desc: 'We only use top-tier global products and advanced clinical equipment.', icon: Award },
  { title: 'Artistic Flair', desc: 'Our clinical treatments are custom-tailored by board-certified practitioners.', icon: Star },
  { title: 'Client First', desc: 'Every treatment is customized to your unique skin and hair needs.', icon: Heart },
];

const defaultTeam = [
  { name: 'Dr. Meera Patil', role: 'MD, Lead Dermatologist', initials: 'MP' },
  { name: 'Dr. Amit Sharma', role: 'Aesthetic Physician', initials: 'AS' },
  { name: 'Riya Kulkarni', role: 'Senior Therapist', initials: 'RK' },
];

export default function AboutPage() {
  const [hero, setHero] = useState(defaultHero);
  const [stats, setStats] = useState(defaultStats);
  const [values, setValues] = useState(defaultValues);
  const [team, setTeam] = useState(defaultTeam);

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const res = await axios.get(`${API}/website-content?branch=CLINIC`);
        if (res.data.success && res.data.data.length > 0) {
          const cmsData = res.data.data;

          // Hero
          const heroItem = cmsData.find((item: any) => item.type === 'ABOUT_HERO');
          if (heroItem) {
            setHero({
              title: heroItem.title || defaultHero.title,
              subtitle: heroItem.subtitle || defaultHero.subtitle,
              imageUrl: (heroItem.imageUrl && heroItem.imageUrl !== 'text-only') ? heroItem.imageUrl : defaultHero.imageUrl
            });
          }

          // Stats
          const stat1 = cmsData.find((item: any) => item.type === 'ABOUT_STAT_1');
          const stat2 = cmsData.find((item: any) => item.type === 'ABOUT_STAT_2');
          const newStats = [];
          if (stat1) newStats.push({ label: stat1.title, value: stat1.subtitle });
          if (stat2) newStats.push({ label: stat2.title, value: stat2.subtitle });
          if (newStats.length > 0) {
            setStats(newStats);
          }

          // Values
          const valuesItems = cmsData.filter((item: any) => item.type === 'ABOUT_VALUE');
          if (valuesItems.length > 0) {
            setValues(valuesItems.map((val: any) => ({
              title: val.title,
              desc: val.subtitle,
              icon: val.title.toLowerCase().includes('premium') ? Award : val.title.toLowerCase().includes('flair') ? Star : Heart
            })));
          }

          // Team
          const teamItems = cmsData.filter((item: any) => item.type === 'ABOUT_TEAM');
          if (teamItems.length > 0) {
            setTeam(teamItems.map((member: any) => ({
              name: member.title,
              role: member.subtitle,
              initials: member.title.split(' ').map((n: string) => n[0]).join('').substring(0, 2)
            })));
          }
        }
      } catch (err) {
        console.error('Failed to fetch CMS about data', err);
      }
    };
    fetchAboutData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-24 space-y-32">
       {/* Hero Section */}
       <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
          >
             <h2 className="text-5xl md:text-7xl font-black text-gray-900 mb-8 leading-[0.95]">
                {hero.title.split(' ').slice(0, -1).join(' ')} <span className="text-primary">{hero.title.split(' ').slice(-1)[0]}</span>
             </h2>
             <p className="text-xl text-gray-500 font-medium leading-relaxed mb-8">
                {hero.subtitle}
             </p>
             <div className="grid grid-cols-2 gap-8">
                {stats.map((stat, i) => (
                  <div key={i}>
                     <h4 className="text-4xl font-black text-gray-900 mb-1">{stat.value}</h4>
                     <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                  </div>
                ))}
             </div>
          </motion.div>
          <div className="aspect-[4/5] bg-gray-50 rounded-[60px] relative overflow-hidden shadow-2xl">
             <img src={hero.imageUrl} alt="About Hero" className="absolute inset-0 w-full h-full object-cover" />
             <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
          </div>
       </section>

       {/* Values */}
       <section className="text-center">
          <h3 className="text-4xl font-black mb-16">Our Core Values</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
             {values.map((val, i) => (
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
                   Our team is a blend of clinical dermatologists and visionary specialists, working together to achieve the perfect balance of health and beauty.
                </p>
                <button className="px-10 py-5 bg-white text-gray-950 rounded-full font-black hover:bg-gray-100 transition-all">
                   Join Our Team
                </button>
             </div>
             <div className="grid grid-cols-2 gap-6">
                {team.map((member) => (
                  <div key={member.name} className="aspect-square bg-white/5 rounded-[40px] border border-white/10 flex flex-col items-center justify-center gap-3 hover:bg-white/10 transition-all">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-rose-600 flex items-center justify-center text-white text-xl font-black shadow-lg">
                      {member.initials}
                    </div>
                    <h4 className="font-black text-sm text-center">{member.name}</h4>
                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest text-center">{member.role}</p>
                  </div>
                ))}
             </div>
          </div>
       </section>
    </div>
  );
}
