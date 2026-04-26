"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Phone, LogIn, Sparkles } from 'lucide-react';
import Link from 'next/link';

import { GoogleLogin } from '@react-oauth/google';
import ReCAPTCHA from 'react-google-recaptcha';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setIsLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const { login, googleLogin } = useAuth();
  const router = useRouter();

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setIsLoading(true);
    setError('');
    try {
      const isComplete = await googleLogin(credentialResponse.credential);
      if (isComplete) {
        router.push('/profile');
      } else {
        router.push('/complete-profile');
      }
    } catch (err) {
      setError('Google Sign-In failed. Please try again.');
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recaptchaToken) {
      setError('Please complete the ReCaptcha');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await login(email, phone);
      router.push('/profile');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid credentials');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-10">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full p-10 rounded-[45px] bg-white border border-gray-100 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
        
        <header className="text-center mb-10">
           <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6">
              <Sparkles className="w-8 h-8" />
           </div>
           <h2 className="text-3xl font-black text-gray-900 tracking-tighter">Member Access</h2>
           <p className="text-gray-500 font-bold text-sm mt-2">Welcome back to the BeautyBeats enclave.</p>
        </header>

        {error && <p className="text-red-500 text-center text-sm font-bold mb-6">{error}</p>}

        <div className="flex flex-col gap-4 mb-8">
           <GoogleLogin
             onSuccess={handleGoogleSuccess}
             onError={() => setError('Google Sign-In failed')}
             shape="circle"
             width="350"
             use_fedcm_for_prompt={true}
           />
           <div className="flex items-center gap-4 py-2">
              <div className="flex-1 h-[1px] bg-gray-100" />
              <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Or Manual Induction</span>
              <div className="flex-1 h-[1px] bg-gray-100" />
           </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
           <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-4">Identifier (Email)</label>
              <div className="relative">
                 <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                 <input 
                   required
                   type="email"
                   value={email}
                   onChange={e => setEmail(e.target.value)}
                   className="w-full pl-14 pr-6 py-5 bg-gray-50 rounded-[25px] border-none outline-none focus:ring-2 ring-primary/20 transition-all font-bold text-gray-900"
                   placeholder="meera@example.com"
                 />
              </div>
           </div>

           <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-4">Secret Code (Phone)</label>
              <div className="relative">
                 <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                 <input 
                   required
                   type="password"
                   value={phone}
                   onChange={e => setPhone(e.target.value)}
                   className="w-full pl-14 pr-6 py-5 bg-gray-50 rounded-[25px] border-none outline-none focus:ring-2 ring-primary/20 transition-all font-bold text-gray-900"
                   placeholder="Enter your phone"
                 />
              </div>
           </div>

           <div className="flex justify-center scale-90 -mx-10">
              {process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ? (
                <ReCAPTCHA
                  sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
                  onChange={(token: string | null) => setRecaptchaToken(token)}
                />
              ) : (
                <div className="text-[10px] text-amber-600 font-black uppercase tracking-widest bg-amber-50 px-4 py-2 rounded-lg border border-amber-100">
                  ReCaptcha Configuration Missing
                </div>
              )}
           </div>

           <button 
             type="submit"
             disabled={!recaptchaToken || loading}
             className="w-full py-5 bg-primary text-white rounded-[25px] font-black text-lg shadow-xl shadow-red-100 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
           >
              {loading ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <LogIn className="w-6 h-6" />
              )}
              {loading ? 'Processing...' : 'Sign Induction'}
           </button>
        </form>

        <p className="text-center mt-10 text-sm font-bold text-gray-400">
           Not a member? <Link href="/book" className="text-primary hover:underline">Book your first session</Link>
        </p>
      </motion.div>
    </div>
  );
}
