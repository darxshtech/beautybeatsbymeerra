"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Scissors, 
  Calendar, 
  User, 
  Clock, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  Sparkles,
  Info,
  CreditCard,
  Wallet,
  IndianRupee,
  Tag,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import apiClient from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const steps = ['Service', 'Schedule', 'Details', 'Payment', 'Confirm'];

export default function BookingPage() {
  const router = useRouter();
  const [services, setServices] = useState<any[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [staff, setStaff] = useState<any[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<string>("");
  const [step, setStep] = useState(0);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [availableSlots, setAvailableSlots] = useState<{slot: string, available: boolean}[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponData, setCouponData] = useState<any>(null);
  const [couponError, setCouponError] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [redeemPoints, setRedeemPoints] = useState(false);

  const nextStep = () => setStep(s => Math.min(s + 1, steps.length - 1));
  const prevStep = () => setStep(s => Math.max(s - 1, 0));

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await apiClient.get('/services');
        if (res.data.success) setServices(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingServices(false);
      }
    };
    const fetchStaff = async () => {
      try {
        const res = await apiClient.get('/users/staff');
        if (res.data.success) setStaff(res.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchServices();
    fetchStaff();
  }, []);

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!selectedDate) return;
      setLoadingSlots(true);
      try {
        const res = await apiClient.get(`/appointments/availability?date=${selectedDate}&staffId=${selectedStaff}`);
        if (res.data.success) {
          setAvailableSlots(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching availability:', err);
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchAvailability();
  }, [selectedDate, selectedStaff]);

  const { user } = useAuth();
  
  useEffect(() => {
    if (user) {
      if (user.name && !name) setName(user.name);
      if (user.phone && !phone) setPhone(user.phone);
    }
  }, [user]);

  const handleBooking = async () => {
    if (user && user.isProfileComplete === false) {
      alert("Please complete your profile details first.");
      router.push('/complete-profile');
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await apiClient.post('/appointments', {
        service: selectedService?._id,
        appointmentDate: selectedDate,
        timeSlot: selectedTime,
        staff: selectedStaff,
        notes: notes,
        paymentMethod: paymentMethod,
        couponCode: couponData ? couponCode : undefined,
        pointsRedeemed: redeemPoints ? user?.loyaltyPoints : 0,
        customerInfo: {
          name,
          phone
        }
      });

      if (res.data.success) {
        setStep(4); // Move to Success/Confirm step
      } else {
        setError(res.data.message || "Booking failed");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 min-h-screen">
      {/* Progress Stepper */}
      <div className="flex items-center justify-between mb-16 relative">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-100 -z-10" />
        {steps.map((s, i) => (
          <div key={s} className="flex flex-col items-center gap-2">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500",
              step > i ? "bg-green-500 text-white" :
              step === i ? "bg-primary text-white scale-110 shadow-lg shadow-red-100" :
              "bg-white border-2 border-gray-100 text-gray-400"
            )}>
              {step > i ? <CheckCircle2 className="w-6 h-6" /> : i + 1}
            </div>
            <span className={cn(
               "text-xs font-black uppercase tracking-widest",
               step === i ? "text-primary" : "text-gray-400"
            )}>{s}</span>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
           key={step}
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           exit={{ opacity: 0, x: -20 }}
           className="bg-white rounded-[40px] border border-gray-100 p-8 md:p-12 shadow-sm"
        >
          {step === 0 && (
            <div className="space-y-8">
              <div className="text-center mb-12">
                 <h2 className="text-4xl font-black text-gray-900 mb-2">Select Your Treatment</h2>
                 <p className="text-gray-500">Choose from our signature range of services.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {services.map(s => (
                   <button
                    key={s._id}
                    onClick={() => { setSelectedService(s); nextStep(); }}
                    className={cn(
                      "p-6 rounded-3xl border-2 text-left transition-all hover:bg-red-50 group",
                      selectedService?._id === s._id ? "border-primary bg-red-50/50" : "border-gray-50 bg-gray-50/30"
                    )}
                   >
                     <div className="flex justify-between items-start">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary mb-4 shadow-sm">
                           <Scissors className="w-6 h-6" />
                        </div>
                        <p className="text-2xl font-black text-primary">₹{s.price}</p>
                     </div>
                     <h3 className="text-lg font-black text-gray-900 group-hover:text-primary transition-colors">{s.name}</h3>
                     <p className="text-sm text-gray-500 font-bold">{s.category} • {s.duration}m</p>
                   </button>
                 ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-8">
               <div className="text-center mb-12">
                 <h2 className="text-4xl font-black text-gray-900 mb-2">Build Your Schedule</h2>
                 <p className="text-gray-500">Pick an expert and time that works for you.</p>
               </div>
              
               <div className="flex flex-col gap-10">
                 {/* 1. Specialist Selection */}
                 <div>
                    <h4 className="font-black text-gray-900 mb-4 flex items-center gap-2 uppercase tracking-widest text-xs">
                      <User className="w-4 h-4 text-primary" />
                      1. Choose Specialist
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                       <button
                         onClick={() => setSelectedStaff("")}
                         className={cn(
                           "p-4 rounded-2xl border-2 text-center transition-all",
                           selectedStaff === "" ? "border-primary bg-red-50 shadow-sm" : "border-gray-50 bg-gray-50/50 hover:bg-gray-100"
                         )}
                       >
                         <p className="font-black text-[10px] uppercase">Any Specialist</p>
                         <p className="text-[10px] text-gray-500 mt-1 font-bold">Auto-Assign</p>
                       </button>
                       {staff.map(s => (
                         <button
                           key={s._id}
                           onClick={() => {
                             setSelectedStaff(s._id);
                             setSelectedTime(""); // Reset time if specialist changes
                           }}
                           className={cn(
                             "p-4 rounded-2xl border-2 text-center transition-all",
                             selectedStaff === s._id ? "border-primary bg-red-50 shadow-sm" : "border-gray-50 bg-gray-50/50 hover:bg-gray-100"
                           )}
                         >
                           <p className="font-black text-sm">{s.name}</p>
                           <p className="text-[10px] text-gray-500 font-bold truncate">{s.specialization?.[0] || 'Technician'}</p>
                         </button>
                       ))}
                    </div>
                 </div>

                 {/* 2. Date Selection */}
                 <div>
                    <h4 className="font-black text-gray-900 mb-4 flex items-center gap-2 uppercase tracking-widest text-xs">
                      <Calendar className="w-4 h-4 text-primary" />
                      2. Select Date
                    </h4>
                    <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                       {Array.from({ length: 7 }).map((_, i) => {
                         const date = new Date();
                         date.setDate(date.getDate() + i);
                         const d = date.toLocaleDateString('en-US', { weekday: 'short' });
                         const day = date.getDate();
                         const fullDate = date.toISOString().split('T')[0];

                         return (
                          <div key={i} className="flex flex-col items-center gap-2">
                             <span className="text-[10px] font-black uppercase text-gray-400">{d}</span>
                             <button 
                               onClick={() => {
                                 setSelectedDate(fullDate);
                                 setSelectedTime(""); // Reset time if date changes
                               }}
                               className={cn(
                                 "w-full aspect-square rounded-2xl flex items-center justify-center font-black text-lg transition-all",
                                 selectedDate === fullDate ? "bg-primary text-white shadow-lg" : "bg-gray-50 hover:bg-gray-100 text-gray-600"
                               )}
                             >
                               {day}
                             </button>
                          </div>
                         )
                       })}
                    </div>
                 </div>

                 {/* 3. Time Selection with Smart Availability */}
                 <div className={cn(!selectedDate && "opacity-30 pointer-events-none transition-opacity")}>
                    <h4 className="font-black text-gray-900 mb-4 flex items-center gap-2 uppercase tracking-widest text-xs">
                      <Clock className="w-4 h-4 text-primary" />
                      3. Available Slots
                      {loadingSlots && <span className="ml-2 text-[10px] text-primary animate-pulse font-black italic">Updating...</span>}
                    </h4>
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                       {loadingSlots ? (
                         <div className="col-span-4 py-8 text-center text-gray-400 font-bold animate-pulse">Syncing calendars...</div>
                       ) : availableSlots.length > 0 ? (
                         availableSlots.map(s => (
                           <button
                             key={s.slot}
                             disabled={!s.available}
                             onClick={() => setSelectedTime(s.slot)}
                             className={cn(
                               "py-3 rounded-2xl border-2 font-black text-sm transition-all relative overflow-hidden",
                               selectedTime === s.slot ? "border-primary bg-primary text-white shadow-md" : 
                               s.available ? "border-gray-50 bg-gray-50/50 hover:bg-gray-100" : "border-gray-50 bg-gray-100 text-gray-300 cursor-not-allowed grayscale"
                             )}
                           >
                             {s.slot}
                             {!s.available && <span className="absolute inset-0 flex items-center justify-center text-[10px] bg-white/50 font-bold text-red-500 rotate-12">Full</span>}
                           </button>
                         ))
                       ) : (
                         ['09:00 AM', '10:30 AM', '12:00 PM', '02:00 PM', '03:30 PM', '05:00 PM'].map(t => (
                          <button
                            key={t}
                            disabled={!selectedDate}
                            onClick={() => setSelectedTime(t)}
                            className={cn(
                              "py-3 rounded-2xl border-2 font-black text-sm transition-all",
                              selectedTime === t ? "border-primary bg-primary text-white shadow-md" : "border-gray-50 bg-gray-50/50 hover:bg-gray-100"
                            )}
                          >
                            {t}
                          </button>
                        ))
                       )}
                    </div>
                 </div>
               </div>

               <div className="flex justify-between pt-8">
                 <button onClick={prevStep} className="px-8 py-4 font-black flex items-center gap-2 text-gray-400 hover:text-gray-900">
                   <ChevronLeft className="w-5 h-5" /> Back
                 </button>
                 <button 
                   disabled={!selectedDate || !selectedTime}
                   onClick={nextStep} 
                   className="px-12 py-4 bg-primary text-white rounded-full font-black disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-dark shadow-xl shadow-red-100"
                 >
                   Continue
                 </button>
               </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8">
              <div className="text-center mb-12">
                 <h2 className="text-4xl font-black text-gray-900 mb-2">Final Details</h2>
                 <p className="text-gray-500">Confirm your contact information.</p>
              </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-500">Full Name</label>
                    <input 
                      type="text" 
                      placeholder="Your Name" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 outline-none font-bold" 
                    />
                 </div>
                  <div className="space-y-2">
                     <label className="text-xs font-black uppercase tracking-widest text-gray-500">Phone Number</label>
                     <input 
                       type="tel" 
                       placeholder="+91" 
                       value={phone} 
                       onChange={(e) => setPhone(e.target.value)} 
                       className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 outline-none font-bold" 
                     />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                     <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-500 mt-0.5" />
                        <div>
                          <p className="text-xs font-black text-blue-900 uppercase">Automated Assignment</p>
                          <p className="text-[11px] text-blue-800 font-bold leading-tight">
                            {selectedStaff ? `You've selected ${staff.find(s => s._id === selectedStaff)?.name}. If they become unavailable, we'll notify you.` : "You've chosen 'Any Specialist'. We will automatically assign the best expert available for your chosen time."}
                          </p>
                        </div>
                     </div>
                  </div>
                 <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-500">Any Special Requests?</label>
                    <textarea 
                      placeholder="e.g. Skin allergies..." 
                      rows={3} 
                      value={notes} 
                      onChange={(e) => setNotes(e.target.value)} 
                      className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 outline-none font-bold resize-none" 
                    />
                 </div>
              </div>

              <div className="flex justify-between pt-8">
                <button onClick={prevStep} className="px-8 py-4 font-black flex items-center gap-2 text-gray-400 hover:text-gray-900">
                   <ChevronLeft className="w-5 h-5" /> Back
                </button>
                <button 
                  onClick={nextStep} 
                  disabled={!name || !phone}
                  className="px-12 py-4 bg-primary text-white rounded-full font-black hover:bg-primary-dark shadow-xl shadow-red-100 flex items-center gap-2 disabled:opacity-50"
                >
                  Next to Payment
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
             <div className="space-y-8">
                <div className="text-center mb-12">
                   <h2 className="text-4xl font-black text-gray-900 mb-2">Secure Checkout</h2>
                   <p className="text-gray-500">Finalize your booking with pre-payment.</p>
                </div>

                {(() => {
                  const totalAmount = Math.max(0, (selectedService?.price || 0) - discount - (redeemPoints ? ((user?.loyaltyPoints || 0) * 10) : 0));
                  const qrData = encodeURIComponent(`upi://pay?pa=beautybeats@ybl&pn=BeautyBeats&am=${totalAmount}&cu=INR`);

                  return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                   <div className="md:col-span-2 space-y-6">
                      <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 space-y-4">
                         <h4 className="text-xs font-black uppercase tracking-widest text-gray-500">Select Payment Method</h4>
                         <div className="grid grid-cols-1 gap-3">
                            <button 
                               onClick={() => setPaymentMethod("UPI")}
                               className={cn(
                                  "p-4 rounded-2xl border-2 flex items-center gap-4 transition-all",
                                  paymentMethod === "UPI" ? "border-primary bg-white shadow-sm" : "border-transparent bg-white/50 hover:bg-white"
                               )}
                            >
                               <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-primary">
                                  <Wallet className="w-5 h-5" />
                               </div>
                               <div className="text-left">
                                  <p className="font-black text-sm">UPI / QR Code</p>
                                  <p className="text-[10px] text-gray-500 font-bold">Fast & Secure (Google Pay, PhonePe)</p>
                               </div>
                               {paymentMethod === "UPI" && <CheckCircle2 className="w-5 h-5 ml-auto text-primary" />}
                            </button>
                            <button 
                               onClick={() => setPaymentMethod("CARD")}
                               className={cn(
                                  "p-4 rounded-2xl border-2 flex items-center gap-4 transition-all",
                                  paymentMethod === "CARD" ? "border-primary bg-white shadow-sm" : "border-transparent bg-white/50 hover:bg-white"
                               )}
                            >
                               <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-primary">
                                  <CreditCard className="w-5 h-5" />
                               </div>
                               <div className="text-left">
                                  <p className="font-black text-sm">Debit / Credit Card</p>
                                  <p className="text-[10px] text-gray-500 font-bold">All major cards accepted</p>
                               </div>
                               {paymentMethod === "CARD" && <CheckCircle2 className="w-5 h-5 ml-auto text-primary" />}
                            </button>
                            <button 
                               onClick={() => setPaymentMethod("CASH")}
                               className={cn(
                                  "p-4 rounded-2xl border-2 flex items-center gap-4 transition-all",
                                  paymentMethod === "CASH" ? "border-primary bg-white shadow-sm" : "border-transparent bg-white/50 hover:bg-white"
                               )}
                            >
                               <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-primary">
                                  <IndianRupee className="w-5 h-5" />
                               </div>
                               <div className="text-left">
                                  <p className="font-black text-sm">Pay at Salon (Cash)</p>
                                  <p className="text-[10px] text-gray-500 font-bold">Confirm now, pay later</p>
                               </div>
                               {paymentMethod === "CASH" && <CheckCircle2 className="w-5 h-5 ml-auto text-primary" />}
                            </button>
                         </div>
                      </div>
                   </div>

                   <div className="bg-primary/5 p-8 rounded-3xl border border-primary/10 h-fit space-y-6">
                      <h4 className="text-xs font-black uppercase tracking-widest text-primary">Order Summary</h4>
                      <div className="space-y-3">
                         <div className="flex justify-between text-sm font-bold">
                            <span className="text-gray-600">{selectedService?.name}</span>
                            <span>₹{selectedService?.price}</span>
                         </div>
                         {discount > 0 && (
                           <div className="flex justify-between text-sm font-bold text-green-600">
                             <span>Coupon Discount ({couponData?.discountValue}%)</span>
                             <span>-₹{discount}</span>
                           </div>
                         )}
                         {redeemPoints && (user?.loyaltyPoints || 0) > 0 && (
                           <div className="flex justify-between text-sm font-bold text-primary">
                             <span>Loyalty Points Redeemed</span>
                             <span>-₹{(user?.loyaltyPoints || 0) * 10}</span>
                           </div>
                         )}
                         <div className="pt-3 border-t border-primary/20 flex justify-between text-lg font-black text-primary">
                            <span>Total</span>
                            <span>₹{totalAmount}</span>
                         </div>
                      </div>

                      {paymentMethod === "UPI" && totalAmount > 0 && (
                        <div className="pt-4 flex flex-col items-center border-t border-primary/20">
                          <p className="text-[10px] font-black uppercase text-gray-500 mb-2">Scan to Pay ₹{totalAmount}</p>
                          <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrData}`} alt="UPI QR" className="rounded-xl border-4 border-white shadow-sm" />
                        </div>
                      )}

                      {/* Loyalty Points Input */}
                      {(user?.loyaltyPoints || 0) > 0 && (
                        <div className="space-y-2 pt-2">
                           <label className="flex items-center gap-3 p-3 bg-red-50 rounded-xl cursor-pointer hover:bg-red-100 transition-colors">
                              <input 
                                type="checkbox" 
                                checked={redeemPoints}
                                onChange={(e) => setRedeemPoints(e.target.checked)}
                                className="w-4 h-4 text-primary focus:ring-primary rounded"
                              />
                              <div className="flex-1">
                                <p className="text-sm font-black text-primary">Redeem {user?.loyaltyPoints} Loyalty Points</p>
                                <p className="text-[10px] font-bold text-red-900">Get an instant ₹{(user?.loyaltyPoints || 0) * 10} off</p>
                              </div>
                           </label>
                        </div>
                      )}

                      {/* Coupon Code Input */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-black uppercase tracking-widest text-gray-500">Have a Coupon?</h4>
                        <div className="flex gap-2">
                          <div className="flex-1 relative">
                            <Tag className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Enter code..."
                              value={couponCode}
                              onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); setCouponData(null); setDiscount(0); }}
                              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-gray-200 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                            />
                          </div>
                          <button
                            type="button"
                            disabled={!couponCode || validatingCoupon}
                            onClick={async () => {
                              setValidatingCoupon(true);
                              setCouponError('');
                              try {
                                const res = await apiClient.get(`/coupons/validate/${couponCode}`);
                                if (res.data.success) {
                                  setCouponData(res.data.data);
                                  const disc = res.data.data.discountType === 'PERCENTAGE'
                                    ? Math.round((selectedService?.price * res.data.data.discountValue) / 100)
                                    : res.data.data.discountValue;
                                  setDiscount(disc);
                                }
                              } catch (err: any) {
                                setCouponError(err.response?.data?.message || 'Invalid coupon');
                                setCouponData(null);
                                setDiscount(0);
                              } finally {
                                setValidatingCoupon(false);
                              }
                            }}
                            className="px-5 py-3 bg-gray-900 text-white rounded-xl text-sm font-bold disabled:opacity-50"
                          >
                            {validatingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                          </button>
                        </div>
                        {couponError && <p className="text-red-500 text-xs font-bold">{couponError}</p>}
                        {couponData && <p className="text-green-600 text-xs font-bold">✅ Coupon applied! {couponData.discountValue}% off</p>}
                      </div>

                       <div className="p-3 bg-white rounded-xl flex items-start gap-2">
                          <Sparkles className="w-4 h-4 text-amber-500" />
                          <p className="text-[9px] font-bold text-gray-500">Confirming will securely link this payment to your appointment ID.</p>
                       </div>
                    </div>
                 </div>
                 );
                 })()}

                 {error && <p className="text-red-500 text-sm font-bold text-center mt-4">{error}</p>}

                <div className="flex justify-between pt-8">
                   <button onClick={prevStep} className="px-8 py-4 font-black flex items-center gap-2 text-gray-400 hover:text-gray-900">
                      <ChevronLeft className="w-5 h-5" /> Back
                   </button>
                   <button 
                     onClick={handleBooking} 
                     disabled={loading}
                     className="px-12 py-4 bg-primary text-white rounded-full font-black hover:bg-primary-dark shadow-xl shadow-red-100 flex items-center gap-2"
                   >
                     {loading ? 'Processing...' : (paymentMethod === "CASH" ? 'Confirm Booking' : 'Pay & Book Now')}
                     <CheckCircle2 className="w-5 h-5" />
                   </button>
                </div>
             </div>
          )}

          {step === 4 && (
            <div className="text-center py-12 space-y-8">
               <motion.div 
                 initial={{ scale: 0 }}
                 animate={{ scale: 1 }}
                 className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center text-white mx-auto shadow-2xl shadow-green-100"
               >
                 <CheckCircle2 className="w-12 h-12" />
               </motion.div>
               <div>
                  <h2 className="text-4xl font-black text-gray-900 mb-4">Payment Success!</h2>
                  <p className="text-gray-500 text-lg">Your appointment and invoice have been finalized.</p>
               </div>
               
               <div className="max-w-xs mx-auto p-6 bg-gray-50 rounded-3xl space-y-4 border border-gray-100">
                  <div className="flex justify-between text-sm font-bold">
                     <span className="text-gray-400">Order ID</span>
                     <span className="text-gray-900 font-mono text-[10px]">BTB-{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold">
                     <span className="text-gray-400">Status</span>
                     <span className="text-green-600 uppercase italic">Paid</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold">
                     <span className="text-gray-400">Amount</span>
                     <span className="text-gray-900 font-black">₹{selectedService?.price}</span>
                  </div>
               </div>

               <div className="flex flex-col gap-4 pt-8">
                  <Link href="/profile" className="px-12 py-4 bg-primary text-white rounded-full font-black shadow-xl shadow-red-100">
                     View My Invoices
                  </Link>
                  <Link href="/" className="font-bold text-gray-400 hover:text-gray-900">
                     Back to Home
                  </Link>
               </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
         <div className="p-4 rounded-2xl bg-red-50/50 flex items-center gap-3">
            <Info className="w-5 h-5 text-primary" />
            <p className="text-xs font-bold text-red-900">Real-time availability synced with our specialist calendars.</p>
         </div>
         <div className="p-4 rounded-2xl bg-amber-50/50 flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-amber-600" />
            <p className="text-xs font-bold text-amber-900">Book online and get 5% instant loyalty points.</p>
         </div>
      </div>
    </div>
  );
}
