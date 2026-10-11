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
  Loader2,
  Landmark,
  Key,
  Zap,
  HelpCircle,
  ExternalLink,
  Calendar,
  Sparkles,
  Download
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import apiClient from '@/lib/api';
import styles from '@/styles/layout/Dashboard.module.css';

const TIME_OPTIONS = [
  '07:00 AM', '07:30 AM', '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM',
  '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
  '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM',
  '07:00 PM', '07:30 PM', '08:00 PM', '08:30 PM', '09:00 PM', '09:30 PM',
  '10:00 PM', '10:30 PM', '11:00 PM'
];

const DAYS_OF_WEEK = [
  { id: 'Monday', label: 'Mon' },
  { id: 'Tuesday', label: 'Tue' },
  { id: 'Wednesday', label: 'Wed' },
  { id: 'Thursday', label: 'Thu' },
  { id: 'Friday', label: 'Fri' },
  { id: 'Saturday', label: 'Sat' },
  { id: 'Sunday', label: 'Sun' }
];

export default function SettingsPage() {
  const [copied, setCopied] = useState(false);
  
  // Dynamic client booking link
  const [bookingLink, setBookingLink] = useState('https://beautybeatsbymeerra.vercel.app/book');
  const [webhookUrl, setWebhookUrl] = useState('http://localhost:5000/api/transactions/webhook/bank-sms');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      setBookingLink(isLocal ? 'http://localhost:3000/book' : 'https://beautybeatsbymeerra.vercel.app/book');
      setWebhookUrl(isLocal 
        ? `${window.location.protocol}//${window.location.hostname}:5000/api/transactions/webhook/bank-sms`
        : 'https://beautybeatsbymeerra-backend.onrender.com/api/transactions/webhook/bank-sms'
      );
    }
  }, []);

  // Operating Hours State
  const [openingTime, setOpeningTime] = useState('10:00 AM');
  const [closingTime, setClosingTime] = useState('08:00 PM');
  const [slotInterval, setSlotInterval] = useState(30);
  const [closedDays, setClosedDays] = useState<string[]>([]);
  const [isClosedTodayOverride, setIsClosedTodayOverride] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Bank & Automated Settlement State
  const [bankName, setBankName] = useState('Axis Bank');
  const [accountHolderName, setAccountHolderName] = useState('BeautyBeats');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [upiId, setUpiId] = useState('beautybeats320-3@okaxis');
  const [webhookSecret, setWebhookSecret] = useState('bb_secure_webhook_key');
  const [savingBank, setSavingBank] = useState(false);
  const [bankSuccess, setBankSuccess] = useState(false);
  const [bankError, setBankError] = useState('');
  const [webhookCopied, setWebhookCopied] = useState(false);

  // Business Rules Toggles
  const [businessRules, setBusinessRules] = useState<{ [key: string]: boolean }>({
    'Auto SMS Reminders': true,
    'Loyalty Program': true,
    'Direct UPI Verification': true,
    'Staff Management': true,
    'Multi-device Sync': true,
    'Cloud Hosting': true,
  });

  useEffect(() => {
    // Load local toggle preferences if saved
    try {
      const saved = localStorage.getItem('bb_business_rules');
      if (saved) setBusinessRules(JSON.parse(saved));
    } catch (_) {}
  }, []);

  const toggleBusinessRule = (label: string) => {
    setBusinessRules(prev => {
      const updated = { ...prev, [label]: !prev[label] };
      try {
        localStorage.setItem('bb_business_rules', JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoadingSettings(true);
        const res = await apiClient.get('/settings/salon');
        if (res.data.success && res.data.data) {
          setOpeningTime(res.data.data.openingTime || '10:00 AM');
          setClosingTime(res.data.data.closingTime || '08:00 PM');
          setSlotInterval(res.data.data.slotInterval || 30);
          setClosedDays(res.data.data.closedDays || []);
          setIsClosedTodayOverride(!!res.data.data.isClosedTodayOverride);

          if (res.data.data.bankDetails) {
            setBankName(res.data.data.bankDetails.bankName || 'Axis Bank');
            setAccountHolderName(res.data.data.bankDetails.accountHolderName || 'BeautyBeats');
            setAccountNumber(res.data.data.bankDetails.accountNumber || '');
            setIfscCode(res.data.data.bankDetails.ifscCode || '');
            setUpiId(res.data.data.bankDetails.upiId || 'beautybeats320-3@okaxis');
            setWebhookSecret(res.data.data.bankDetails.webhookSecret || 'bb_secure_webhook_key');
          }
        }
      } catch (err: any) {
        console.error('Error fetching salon settings:', err);
      } finally {
        setLoadingSettings(false);
      }
    };
    fetchSettings();
  }, []);

  const toggleClosedDay = (day: string) => {
    setClosedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

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
        closedDays,
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

  const handleSaveBank = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingBank(true);
    setBankError('');
    setBankSuccess(false);

    try {
      const res = await apiClient.put('/settings/salon', {
        bankDetails: {
          bankName,
          accountHolderName,
          accountNumber,
          ifscCode,
          upiId,
          webhookSecret
        }
      });

      if (res.data.success) {
        setBankSuccess(true);
        setTimeout(() => setBankSuccess(false), 3000);
      } else {
        setBankError(res.data.message || 'Failed to update bank details');
      }
    } catch (err: any) {
      setBankError(err.response?.data?.message || 'Server error while saving bank details');
    } finally {
      setSavingBank(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(bookingLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setWebhookCopied(true);
    setTimeout(() => setWebhookCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(bookingLink)}`;
    const a = document.createElement('a');
    a.href = qrUrl;
    a.download = 'BeautyBeats-Booking-QR.png';
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className={styles.container}>
      {/* Page Header */}
      <header className={styles.sectionHeader}>
        <div>
          <h2 className={styles.title}>Platform Settings</h2>
          <p className={styles.subtitle}>
            Configure salon working hours, booking schedule limits, direct bank settlements, and business rules.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={cn(
            "inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-extrabold uppercase tracking-wider",
            isClosedTodayOverride 
              ? "bg-red-50 text-red-600 border border-red-200" 
              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
          )}>
            <span className={cn("w-2 h-2 rounded-full", isClosedTodayOverride ? "bg-red-500 animate-pulse" : "bg-emerald-500")} />
            {isClosedTodayOverride ? "Closed Today (Emergency Override)" : "Open for Booking"}
          </span>
        </div>
      </header>

      {/* Salon Operating Hours Configuration */}
      <section className="bg-white rounded-3xl p-6 md:p-8 border border-gray-200/80 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-primary shadow-xs">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">Salon Operating Hours & Booking Cutoff</h3>
              <p className="text-xs text-gray-500 mt-0.5">Controls online appointment slot generation and automatically cuts off bookings after closing.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Interval: {slotInterval} min</span>
          </div>
        </div>

        {loadingSettings ? (
          <div className="flex items-center justify-center py-16 text-gray-400 font-bold gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-primary" /> Loading salon schedule...
          </div>
        ) : (
          <form onSubmit={handleSaveHours} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Opening Time */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600 block">
                  Salon Opening Time
                </label>
                <div className="relative">
                  <select
                    value={openingTime}
                    onChange={(e) => setOpeningTime(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 font-bold text-sm text-gray-900 outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all appearance-none cursor-pointer"
                  >
                    {TIME_OPTIONS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                    <Clock className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
                <p className="text-[11px] text-gray-400">First appointment slot allowed each day.</p>
              </div>

              {/* Closing Time */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600 block">
                  Salon Closing Time
                </label>
                <div className="relative">
                  <select
                    value={closingTime}
                    onChange={(e) => setClosingTime(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 font-bold text-sm text-gray-900 outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all appearance-none cursor-pointer"
                  >
                    {TIME_OPTIONS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                    <Clock className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
                <p className="text-[11px] text-gray-400">Past this time, slots only open from tomorrow onwards.</p>
              </div>

              {/* Slot Interval */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600 block">
                  Booking Slot Interval
                </label>
                <div className="relative">
                  <select
                    value={slotInterval}
                    onChange={(e) => setSlotInterval(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 font-bold text-sm text-gray-900 outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all appearance-none cursor-pointer"
                  >
                    <option value={15}>15 Minutes (Express slots)</option>
                    <option value={30}>30 Minutes (Standard - Recommended)</option>
                    <option value={45}>45 Minutes (Extended)</option>
                    <option value={60}>60 Minutes (1 Hour blocks)</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                    <Calendar className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
                <p className="text-[11px] text-gray-400">Duration step between selectable client timeslots.</p>
              </div>
            </div>

            {/* Weekly Closed Days */}
            <div className="p-5 rounded-2xl bg-gray-50/70 border border-gray-200/80 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <p className="font-extrabold text-sm text-gray-900">Weekly Scheduled Off Days</p>
                  <p className="text-xs text-gray-500">Clients cannot book slots on routinely closed days (e.g. Salon weekly off).</p>
                </div>
                <span className="text-xs font-semibold text-gray-400">
                  {closedDays.length === 0 ? "Open 7 Days a Week" : `${closedDays.length} day(s) off`}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {DAYS_OF_WEEK.map((d) => {
                  const isOff = closedDays.includes(d.id);
                  return (
                    <button
                      type="button"
                      key={d.id}
                      onClick={() => toggleClosedDay(d.id)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-xs font-extrabold transition-all border flex items-center gap-1.5",
                        isOff 
                          ? "bg-red-500 text-white border-red-500 shadow-xs" 
                          : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-100/50"
                      )}
                    >
                      {d.label}
                      {isOff && <span className="text-[10px] opacity-90 font-black">OFF</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Emergency Closed Today Override */}
            <div className="p-5 rounded-2xl bg-gray-50/70 border border-gray-200/80 flex items-center justify-between">
              <div>
                <p className="font-extrabold text-sm text-gray-900">Emergency Closed Today Override</p>
                <p className="text-xs text-gray-500">
                  Enable this if the salon has to close early today (e.g. holiday or maintenance). Clients will only see slots starting tomorrow.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-4">
                <input
                  type="checkbox"
                  checked={isClosedTodayOverride}
                  onChange={(e) => setIsClosedTodayOverride(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            {/* Notifications */}
            {saveSuccess && (
              <div className="flex items-center gap-2 p-4 bg-emerald-50 text-emerald-800 rounded-2xl text-sm font-bold border border-emerald-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Salon hours and booking schedule saved successfully!
              </div>
            )}

            {saveError && (
              <div className="flex items-center gap-2 p-4 bg-red-50 text-red-800 rounded-2xl text-sm font-bold border border-red-200">
                <AlertCircle className="w-5 h-5 text-red-600" />
                {saveError}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={savingSettings}
                className="px-8 py-3.5 bg-primary text-white font-extrabold rounded-2xl hover:bg-primary-dark transition-all shadow-md shadow-red-200 flex items-center gap-2 disabled:opacity-50 text-sm cursor-pointer"
              >
                {savingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Operating Hours
              </button>
            </div>
          </form>
        )}
      </section>

      {/* Bank Account & Automated Settlement Webhook Configuration */}
      <section className="bg-white rounded-3xl p-6 md:p-8 border border-gray-200/80 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-xs">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">Direct Bank Settlement & Live Statement Webhook</h3>
              <p className="text-xs text-gray-500 mt-0.5">Configure bank credentials for customer UPI QR codes and automated live transaction matching.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-extrabold border border-emerald-200">
            <Zap className="w-3.5 h-3.5 text-emerald-600" />
            0% Gateway Fees (Direct Bank Account)
          </div>
        </div>

        {loadingSettings ? (
          <div className="flex items-center justify-center py-16 text-gray-400 font-bold gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" /> Loading bank configuration...
          </div>
        ) : (
          <form onSubmit={handleSaveBank} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Bank Details Fields */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">Recipient Bank Account</h4>
                  <span className="text-[11px] font-bold text-gray-400">Embedded in Payment QR</span>
                </div>
                
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1.5">Bank Name</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="e.g. Axis Bank, HDFC, SBI"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-bold text-gray-900 outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1.5">Account Holder Name</label>
                  <input
                    type="text"
                    value={accountHolderName}
                    onChange={(e) => setAccountHolderName(e.target.value)}
                    placeholder="e.g. BeautyBeats Salon"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-bold text-gray-900 outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1.5">Account Number</label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="e.g. 921020048192301"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-mono font-bold text-gray-900 outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1.5">IFSC Code</label>
                    <input
                      type="text"
                      value={ifscCode}
                      onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                      placeholder="e.g. UTIB0001234"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-mono font-bold text-gray-900 outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1.5">Primary UPI ID (VPA)</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. beautybeats320-3@okaxis"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-mono font-bold text-primary outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                  />
                  <div className="mt-2 p-2.5 rounded-xl bg-gray-100/70 border border-gray-200/60 flex items-center justify-between text-[11px]">
                    <span className="text-gray-500 font-medium">Customer UPI Payment String:</span>
                    <span className="font-mono text-gray-700 font-bold">upi://pay?pa={upiId}&pn={encodeURIComponent(accountHolderName)}</span>
                  </div>
                </div>
              </div>

              {/* Automated Bank SMS Webhook Guide */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">Zero-UTR Automated Sync Setup</h4>
                  <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Live Sync
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-gray-50/80 border border-gray-200/80 space-y-3.5">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-gray-900">
                    <Key className="w-4 h-4 text-primary" /> Live Bank SMS Webhook URL
                  </div>
                  <div className="flex gap-2">
                    <input
                      readOnly
                      value={webhookUrl}
                      className="flex-1 px-3 py-2 rounded-xl bg-white border border-gray-200 text-[11px] font-mono text-gray-700 outline-none select-all"
                    />
                    <button
                      type="button"
                      onClick={handleCopyWebhook}
                      className="px-3.5 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      {webhookCopied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {webhookCopied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-600 block mb-1">Webhook Secret Key (Optional Security Header)</label>
                    <input
                      type="text"
                      value={webhookSecret}
                      onChange={(e) => setWebhookSecret(e.target.value)}
                      placeholder="bb_secure_webhook_key"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-xs font-mono text-gray-800 outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
                  <div className="flex items-center gap-1.5 font-extrabold">
                    <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    How to enable 100% automatic statement syncing (No UTR typing):
                  </div>
                  <p className="text-[11px] leading-relaxed text-amber-800 font-medium">
                    Indian banking security prevents third-party apps from pulling private account statements using only Account No & IFSC without token keys.
                    To automatically match payments without typing UTRs, install a free SMS forwarder app on the salon phone that receives bank credit messages, and forward incoming credit alerts to the Webhook URL above. Credits will sync in 1-2 seconds!
                  </p>
                </div>
              </div>
            </div>

            {/* Notifications */}
            {bankSuccess && (
              <div className="flex items-center gap-2 p-4 bg-emerald-50 text-emerald-800 rounded-2xl text-sm font-bold border border-emerald-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Bank details and webhook configuration saved successfully!
              </div>
            )}

            {bankError && (
              <div className="flex items-center gap-2 p-4 bg-red-50 text-red-800 rounded-2xl text-sm font-bold border border-red-200">
                <AlertCircle className="w-5 h-5 text-red-600" />
                {bankError}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={savingBank}
                className="px-8 py-3.5 bg-emerald-600 text-white font-extrabold rounded-2xl hover:bg-emerald-700 transition-all shadow-md shadow-emerald-200 flex items-center gap-2 disabled:opacity-50 text-sm cursor-pointer"
              >
                {savingBank ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Bank Details
              </button>
            </div>
          </form>
        )}
      </section>

      {/* Booking Presence & Business Rules Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* QR & Booking Link */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-xs">
            <QrCode className="w-4 h-4" />
            Booking Presence
          </div>
          <div className="p-8 rounded-3xl bg-white border border-gray-200/80 shadow-sm flex flex-col items-center text-center">
            {/* Visual QR Code Container */}
            <div className="w-48 h-48 bg-gray-50 rounded-3xl flex items-center justify-center border-2 border-gray-100 mb-6 p-3 shadow-inner relative group">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(bookingLink)}`}
                alt="Salon Booking QR Code"
                className="w-full h-full object-contain rounded-2xl"
              />
              <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl flex items-center justify-center">
                <span className="bg-gray-900 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">Scan to Book</span>
              </div>
            </div>

            <h4 className="text-xl font-extrabold text-gray-900 mb-1">Unique Booking QR</h4>
            <p className="text-xs text-gray-500 mb-6 max-w-sm">
              Place this QR code at your salon counter, marketing flyers, or Instagram stories. Clients can scan to open the booking page instantly.
            </p>

            <div className="w-full flex gap-2 p-2 bg-gray-50 border border-gray-200 rounded-2xl mb-4">
              <input 
                readOnly 
                value={bookingLink} 
                className="bg-transparent flex-1 text-xs px-3 outline-none font-medium text-gray-700 truncate select-all" 
              />
              <button 
                type="button"
                onClick={handleCopy}
                className="px-3 py-2 bg-white rounded-xl shadow-xs border border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-1 text-xs font-bold text-gray-700 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-gray-500" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <div className="w-full grid grid-cols-2 gap-3">
              <button 
                type="button"
                onClick={handleDownloadQR}
                className="w-full py-3 px-4 rounded-2xl bg-primary text-white font-extrabold hover:bg-primary-dark transition-all flex items-center justify-center gap-2 text-xs shadow-md shadow-red-200 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Download QR Code
              </button>
              <a 
                href={bookingLink}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 px-4 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-extrabold transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                Test Booking Page
              </a>
            </div>
          </div>
        </section>

        {/* Global Business Logic */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-xs">
            <Settings className="w-4 h-4" />
            Business Logic & Module Features
          </div>
          <div className="space-y-3">
            {[
              { 
                label: 'Auto SMS Reminders', 
                icon: Bell, 
                desc: 'Sends automated booking confirmation & 2h appointment reminder SMS' 
              },
              { 
                label: 'Loyalty Program', 
                icon: Award, 
                desc: 'Credits 5% cashback points to client wallet on confirmed bills' 
              },
              { 
                label: 'Direct UPI Verification', 
                icon: Shield, 
                desc: 'Instant QR code verification directly connected to bank account' 
              },
              { 
                label: 'Staff Management', 
                icon: Users, 
                desc: 'Assign appointments to specific stylists, aestheticians and doctors' 
              },
              { 
                label: 'Multi-device Sync', 
                icon: Smartphone, 
                desc: 'Sync real-time calendar updates across reception tablets and phones' 
              },
              { 
                label: 'Cloud Hosting', 
                icon: Globe, 
                desc: 'Active 99.9% SLA high availability with automated hourly backups' 
              },
            ].map((config) => {
              const isChecked = !!businessRules[config.label];
              return (
                <div 
                  key={config.label} 
                  onClick={() => toggleBusinessRule(config.label)}
                  className="flex items-center justify-between p-4 rounded-2xl bg-white border border-gray-200/80 hover:border-gray-300 transition-all shadow-xs cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-600 border border-gray-100 shrink-0">
                      <config.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-extrabold text-sm text-gray-900 block leading-tight">{config.label}</span>
                      <span className="text-[11px] text-gray-400 font-medium">{config.desc}</span>
                    </div>
                  </div>
                  <div className={cn(
                    "w-12 h-6 rounded-full p-1 transition-colors relative cursor-pointer ml-3 shrink-0",
                    isChecked ? "bg-primary" : "bg-gray-200"
                  )}>
                    <div className={cn(
                      "w-4 h-4 bg-white rounded-full transition-transform shadow-xs",
                      isChecked ? "translate-x-6" : "translate-x-0"
                    )} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
