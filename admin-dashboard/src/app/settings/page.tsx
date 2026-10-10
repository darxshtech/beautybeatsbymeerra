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
  Clock, 
  Save, 
  AlertCircle, 
  CheckCircle2, 
  Loader2 
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import apiClient from '@/lib/api';

const TIME_OPTIONS = [
  '07:00 AM', '07:30 AM', '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM',
  '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
  '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM',
  '07:00 PM', '07:30 PM', '08:00 PM', '08:30 PM', '09:00 PM', '09:30 PM',
  '10:00 PM', '10:30 PM', '11:00 PM'
];

export default function SettingsPage() {
  const [copied, setCopied] = useState(false);
  const bookingLink = "https://beautybeats.com/book/salon-01";

  // Operating Hours State
  const [openingTime, setOpeningTime] = useState('10:00 AM');
  const [closingTime, setClosingTime] = useState('08:00 PM');
  const [slotInterval, setSlotInterval] = useState(30);
  const [isClosedTodayOverride, setIsClosedTodayOverride] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoadingSettings(true);
        const res = await apiClient.get('/settings/salon');
        if (res.data.success && res.data.data) {
          setOpeningTime(res.data.data.openingTime || '10:00 AM');
          setClosingTime(res.data.data.closingTime || '08:00 PM');
          setSlotInterval(res.data.data.slotInterval || 30);
          setIsClosedTodayOverride(!!res.data.data.isClosedTodayOverride);
        }
      } catch (err: any) {
        console.error('Error fetching salon settings:', err);
      } finally {
        setLoadingSettings(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSaveHours = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSaveError('');
    setSaveSuccess(false);

    try {
      const res = await apiClient.put('/settings/salon', {
        openingTime,
        closingTime,
        slotInterval,
        isClosedTodayOverride
      });

      if (res.data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setSaveError(res.data.message || 'Failed to update schedule');
      }
    } catch (err: any) {
      setSaveError(err.response?.data?.message || 'Server error while saving settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(bookingLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Platform Settings</h2>
        <p className="text-gray-500 dark:text-gray-400">Configure salon working hours, booking schedule limits, and business rules.</p>
      </div>

      {/* Salon Operating Hours Configuration */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-gray-100 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Salon Operating Hours & Booking Cutoff</h3>
              <p className="text-xs text-gray-500">Controls customer slot generation and prevents bookings after closing time.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={cn(
              "px-3 py-1 rounded-full text-xs font-bold",
              isClosedTodayOverride ? "bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400" : "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
            )}>
              {isClosedTodayOverride ? "Closed Today (Emergency Override)" : "Open for Booking"}
            </span>
          </div>
        </div>

        {loadingSettings ? (
          <div className="flex items-center justify-center py-12 text-gray-400 font-bold gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-primary" /> Loading current salon hours...
          </div>
        ) : (
          <form onSubmit={handleSaveHours} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Opening Time */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                  Salon Opening Time
                </label>
                <select
                  value={openingTime}
                  onChange={(e) => setOpeningTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 font-bold text-sm text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {TIME_OPTIONS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <p className="text-[11px] text-gray-400">First appointment slot allowed.</p>
              </div>

              {/* Closing Time */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                  Salon Closing Time
                </label>
                <select
                  value={closingTime}
                  onChange={(e) => setClosingTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 font-bold text-sm text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {TIME_OPTIONS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <p className="text-[11px] text-gray-400">Past this time, booking starts from tomorrow.</p>
              </div>

              {/* Slot Interval */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                  Slot Interval
                </label>
                <select
                  value={slotInterval}
                  onChange={(e) => setSlotInterval(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 font-bold text-sm text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value={15}>15 Minutes</option>
                  <option value={30}>30 Minutes (Recommended)</option>
                  <option value={45}>45 Minutes</option>
                  <option value={60}>60 Minutes</option>
                </select>
                <p className="text-[11px] text-gray-400">Duration per booking block.</p>
              </div>
            </div>

            {/* Emergency Closed Today Override */}
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800 flex items-center justify-between border border-gray-100 dark:border-slate-700">
              <div>
                <p className="font-bold text-sm text-gray-900 dark:text-white">Emergency Closed Today Override</p>
                <p className="text-xs text-gray-500">Enable this if the salon has to close early today (e.g. holiday or maintenance). Clients will only see tomorrow onwards.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isClosedTodayOverride}
                  onChange={(e) => setIsClosedTodayOverride(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            {/* Feedback notifications */}
            {saveSuccess && (
              <div className="flex items-center gap-2 p-4 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 rounded-2xl text-sm font-bold border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-5 h-5" />
                Salon hours and booking schedule saved successfully!
              </div>
            )}

            {saveError && (
              <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 rounded-2xl text-sm font-bold border border-red-200 dark:border-red-800">
                <AlertCircle className="w-5 h-5" />
                {saveError}
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={savingSettings}
                className="px-8 py-3.5 bg-primary text-white font-bold rounded-2xl hover:bg-primary-dark transition-all shadow-lg shadow-red-200 flex items-center gap-2 disabled:opacity-50"
              >
                {savingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Operating Hours
              </button>
            </div>
          </form>
        )}
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* QR & Booking Link */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-xs">
            <QrCode className="w-4 h-4" />
            Booking Presence
          </div>
          <div className="p-8 rounded-4xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-xl flex flex-col items-center text-center">
            <div className="w-48 h-48 bg-gray-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center border-4 border-primary/10 mb-6 p-4">
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
              { label: 'Direct UPI Verification', icon: Shield, checked: true },
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
