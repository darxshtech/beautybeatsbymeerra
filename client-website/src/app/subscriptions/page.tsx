"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Sparkles, Diamond, Crown, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api';

const getIcon = (code: string) => {
  if (code === 'PREMIUM') return Diamond;
  if (code === 'VIP') return Crown;
  return Sparkles;
};

export default function SubscriptionsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await apiClient.get('/subscriptions');
        if (res.data.success) {
          setPlans(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handleSubscribe = async (planCode: string) => {
    if (!user) {
      alert("Please login first to subscribe.");
      router.push('/login?redirect=/subscriptions');
      return;
    }
    
    try {
      const res = await apiClient.put('/users/profile', {
        subscription: {
          planName: planCode,
          status: 'ACTIVE',
          startDate: new Date().toISOString(),
          endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString()
        }
      });
      if (res.data?.success || res.status === 200) {
        alert(`Successfully subscribed to ${planCode}! Welcome to the club.`);
        // Reload page to reflect user subscription changes if necessary
        window.location.reload();
      } else {
        alert(res.data?.message || "Failed to subscribe");
      }
    } catch (err) {
      alert("Failed to subscribe");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
             className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-sm tracking-wide mb-6"
          >
            BEAUTYBEATS MEMBERSHIP
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black tracking-tighter text-gray-900 mb-6"
          >
            Unlock Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-500">Ultimate Glow</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-600 font-medium leading-relaxed"
          >
            Join our exclusive membership program and treat yourself to premium beauty services, massive product discounts, and a VIP experience you deserve.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {loading ? (
            <div className="col-span-3 text-center py-20 text-gray-500 font-bold">Loading plans...</div>
          ) : plans.map((plan, idx) => {
            const Icon = getIcon(plan.code);
            
            // Check if user is currently subscribed to this plan
            const isCurrentPlan = user?.subscription?.planName === plan.code && user?.subscription?.status === 'ACTIVE';

            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + (idx * 0.1) }}
                className={`relative flex flex-col rounded-3xl p-8 bg-white shadow-xl ${plan.popular ? 'border-4 border-primary shadow-primary/20 scale-105 z-10' : 'border border-gray-100 hover:shadow-2xl transition-all'}`}
              >
                {plan.popular && !isCurrentPlan && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-rose-600 text-white px-4 py-1 rounded-full text-xs font-black tracking-wider uppercase shadow-lg text-nowrap">
                    Most Popular
                  </div>
                )}
                {isCurrentPlan && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-4 py-1 rounded-full text-xs font-black tracking-wider uppercase shadow-lg text-nowrap">
                    Current Active Plan
                  </div>
                )}
                
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-6 shadow-lg shadow-gray-200/50 text-white`}>
                  <Icon size={28} strokeWidth={2.5} />
                </div>
                
                <h3 className="text-2xl font-black text-gray-900 mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-4xl font-black text-gray-900">{plan.price}</span>
                  <span className="text-gray-500 font-bold">/{plan.interval}</span>
                </div>
                
                <ul className="space-y-4 mb-8 flex-1">
                  {plan.features.map((feat: string) => (
                    <li key={feat} className="flex gap-3 text-gray-700 font-medium">
                      <CheckCircle2 className={`w-5 h-5 shrink-0 ${plan.popular ? 'text-primary' : 'text-emerald-500'}`} />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
                
                <button 
                  onClick={() => handleSubscribe(plan.code)}
                  disabled={isCurrentPlan}
                  className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all group ${
                    isCurrentPlan 
                      ? 'bg-emerald-50 text-emerald-600 cursor-default'
                      : plan.popular
                        ? 'bg-gradient-to-r from-primary to-rose-600 text-white hover:shadow-lg shadow-primary/30 hover:scale-[1.02]' 
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  <span>{isCurrentPlan ? 'Active Plan' : `Choose ${plan.name.split(' ')[0]}`}</span>
                  {!isCurrentPlan && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                </button>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  );
}
