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
  HelpCircle
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

  const webhookUrl = typeof window !== 'undefined' 
    ? `${window.location.protocol}//${window.location.hostname}:5000/api/transactions/webhook/bank-sms`
    : 'http://localhost:5000/api/transactions/webhook/bank-sms';

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setWebhookCopied(true);
    setTimeout(() => setWebhookCopied(false), 2000);
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

      {/* Bank Account & Automated Settlement Webhook Configuration */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-gray-100 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl flex items-center justify-center text-emerald-600">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Direct Bank Settlement & Live Statement Webhook</h3>
              <p className="text-xs text-gray-500">Configure bank credentials for customer UPI QR codes and automated live transaction matching.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300 text-xs font-bold">
            <Zap className="w-3.5 h-3.5 text-emerald-600" />
            0% Gateway Fees (Direct Bank)
          </div>
        </div>

        {loadingSettings ? (
          <div className="flex items-center justify-center py-12 text-gray-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading bank configuration...
          </div>
        ) : (
          <form onSubmit={handleSaveBank} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bank Details Fields */}
              <div className="space-y-4">
                <h4 className="text-sm font-black uppercase tracking-wider text-gray-400">Recipient Bank Account</h4>
                
                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1.5">Bank Name</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="e.g. Axis Bank, HDFC, SBI"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1.5">Account Holder Name</label>
                  <input
                    type="text"
                    value={accountHolderName}
                    onChange={(e) => setAccountHolderName(e.target.value)}
                    placeholder="e.g. BeautyBeats Salon"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1.5">Account Number</label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="e.g. 921020048192301"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1.5">IFSC Code</label>
                    <input
                      type="text"
                      value={ifscCode}
                      onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                      placeholder="e.g. UTIB0001234"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-primary/20 uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1.5">Primary UPI ID (VPA)</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. beautybeats320-3@okaxis"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-xs font-mono font-bold text-primary outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <span className="text-[10px] text-gray-400 mt-1 block">This UPI ID is embedded into customer booking QR codes for direct instant settlements.</span>
                </div>
              </div>

              {/* Automated Bank SMS Webhook Guide */}
              <div className="space-y-4">
                <h4 className="text-sm font-black uppercase tracking-wider text-gray-400">Zero-UTR Automated Sync Setup</h4>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                    <Key className="w-4 h-4 text-primary" /> Live Bank SMS Webhook URL
                  </div>
                  <div className="flex gap-2">
                    <input
                      readOnly
                      value={webhookUrl}
                      className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-[11px] font-mono outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleCopyWebhook}
                      className="px-3 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-colors flex items-center gap-1"
                    >
                      {webhookCopied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 block mb-1">Webhook Secret Key (Optional Security Header)</label>
                    <input
                      type="text"
                      value={webhookSecret}
                      onChange={(e) => setWebhookSecret(e.target.value)}
                      placeholder="bb_secure_webhook_key"
                      className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-xs font-mono outline-none"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-300 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold">
                    <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    How to enable 100% automatic statement syncing (No UTR typing):
                  </div>
                  <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-400">
                    Indian banking security prevents third-party apps from pulling private account statements using only Account No & IFSC without token keys.
                    To automatically match payments without typing UTRs, install a free SMS forwarder app on the salon phone that receives bank credit messages, and forward incoming credit alerts to the Webhook URL above. Credits will sync in 1-2 seconds!
                  </p>
                </div>
              </div>
            </div>

            {/* Feedback notifications */}
            {bankSuccess && (
              <div className="flex items-center gap-2 p-4 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 rounded-2xl text-sm font-bold border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-5 h-5" />
                Bank details and webhook configuration saved successfully!
              </div>
            )}

            {bankError && (
              <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 rounded-2xl text-sm font-bold border border-red-200 dark:border-red-800">
                <AlertCircle className="w-5 h-5" />
                {bankError}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={savingBank}
                className="px-8 py-3.5 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center gap-2 disabled:opacity-50"
              >
                {savingBank ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Bank Details
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
