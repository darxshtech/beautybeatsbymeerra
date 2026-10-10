"use client";

import { useState, useEffect, useRef } from 'react';
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
  Wallet, 
  IndianRupee, 
  Tag, 
  Loader2, 
  AlertCircle, 
  ShieldCheck, 
  X, 
  RefreshCw, 
  QrCode 
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import apiClient from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const steps = ['Type', 'Category', 'Services', 'Schedule', 'Details', 'Payment', 'Confirm'];

const fallbackBookingServices = [
  { _id: 'fb-1', name: 'Haircut & Styling', price: 150, category: 'Hair', duration: 45 },
  { _id: 'fb-2', name: 'Hair Colouring', price: 500, category: 'Hair', duration: 90 },
  { _id: 'fb-3', name: 'Hydra Facial', price: 800, category: 'Skin', duration: 60 },
  { _id: 'fb-4', name: 'Chemical Peel', price: 600, category: 'Skin', duration: 45 },
  { _id: 'fb-5', name: 'Bridal Makeup', price: 3500, category: 'Bridal', duration: 180 },
  { _id: 'fb-6', name: 'Keratin Treatment', price: 1200, category: 'Hair', duration: 120 },
];

const fallbackStaff = [
  { _id: 'fs-1', name: 'Meera Patil', specialization: ['Lead Stylist'] },
  { _id: 'fs-2', name: 'Anjali Sharma', specialization: ['Skin Specialist'] },
  { _id: 'fs-3', name: 'Riya Kulkarni', specialization: ['Hair Colorist'] },
];

// Helper to convert "10:00 AM" to minutes from 00:00
function parseTimeToMinutes(timeStr: string) {
  if (!timeStr) return 0;
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return 0;
  let [_, hours, minutes, ampm] = match;
  let h = parseInt(hours, 10);
  const m = parseInt(minutes, 10);
  if (ampm) {
    const isPM = ampm.toUpperCase() === 'PM';
    const isAM = ampm.toUpperCase() === 'AM';
    if (isPM && h < 12) h += 12;
    if (isAM && h === 12) h = 0;
  }
  return h * 60 + m;
}

export default function BookingPage() {
  const router = useRouter();
  const [services, setServices] = useState<any[]>(fallbackBookingServices);
  const [loadingServices, setLoadingServices] = useState(true);
  const [activeMainCategory, setActiveMainCategory] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [categories, setCategories] = useState<any[]>([]);
  const [isUsingFallback, setIsUsingFallback] = useState(true);
  const [staff, setStaff] = useState<any[]>(fallbackStaff);
  const [selectedStaff, setSelectedStaff] = useState<string>("");
  const [step, setStep] = useState(0);
  const [selectedServices, setSelectedServices] = useState<any[]>([]);
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

  // Salon Settings & Schedule Cutoff State
  const [salonSettings, setSalonSettings] = useState<{
    openingTime: string;
    closingTime: string;
    slotInterval: number;
    closedDays: string[];
    isClosedTodayOverride: boolean;
  } | null>(null);
  const [isClosedToday, setIsClosedToday] = useState(false);

  // Dynamic UPI Payment & Verification State
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [paymentRefId, setPaymentRefId] = useState("");
  const [timerSeconds, setTimerSeconds] = useState(300); // 5 minutes
  const [pollingActive, setPollingActive] = useState(false);
  const [paymentMatched, setPaymentMatched] = useState(false);
  const [manualUtr, setManualUtr] = useState("");
  const [verifyingUtr, setVerifyingUtr] = useState(false);
  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      alert("You need an account to book an appointment.");
      router.push('/login?redirect=/book');
    }
  }, [user, authLoading, router]);

  const nextStep = () => setStep(s => Math.min(s + 1, steps.length - 1));
  const prevStep = () => setStep(s => Math.max(s - 1, 0));

  // Fetch Services, Categories, Staff, and Salon Settings
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await apiClient.get('/services?branch=SALON');
        if (res.data.success && res.data.data?.length > 0) {
          setServices(res.data.data);
          setIsUsingFallback(false);
        }
      } catch {
        // Use fallback services silently
      } finally {
        setLoadingServices(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await apiClient.get('/categories');
        if (res.data.success && res.data.data?.length > 0) {
          setCategories(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    const fetchStaff = async () => {
      try {
        const res = await apiClient.get('/users/staff');
        if (res.data.success && res.data.data?.length > 0) setStaff(res.data.data);
      } catch {
        // Use fallback staff silently
      }
    };

    const fetchSalonSettings = async () => {
      try {
        const res = await apiClient.get('/settings/salon?branch=SALON');
        if (res.data.success && res.data.data) {
          setSalonSettings(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching salon settings:', err);
      }
    };

    fetchServices();
    fetchCategories();
    fetchStaff();
    fetchSalonSettings();
  }, []);

  // Compute whether salon is closed for today based on IST timezone and salonSettings
  useEffect(() => {
    const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0) || 30;

    const computeIsClosedToday = () => {
      if (salonSettings?.isClosedTodayOverride) return true;

      // Current time in IST (Asia/Kolkata)
      const now = new Date();
      const istTimeString = now.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour12: false });
      const [h, m] = istTimeString.split(':').map(Number);
      const currentISTMinutes = h * 60 + m;

      const dayName = now.toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata', weekday: 'long' });
      if (salonSettings?.closedDays && salonSettings.closedDays.includes(dayName)) return true;

      const closeTime = salonSettings?.closingTime || '08:00 PM';
      const closeMinutes = parseTimeToMinutes(closeTime);

      // If current IST time + required service duration is at or past closing time: salon is closed for today!
      if (currentISTMinutes + totalDuration >= closeMinutes) {
        return true;
      }

      return false;
    };

    const closed = computeIsClosedToday();
    setIsClosedToday(closed);

    // Auto-select starting date if none chosen yet or if today was selected but now closed
    const dateObj = new Date();
    if (closed) {
      dateObj.setDate(dateObj.getDate() + 1); // Start from tomorrow
      const tomorrowStr = dateObj.toISOString().split('T')[0];
      if (!selectedDate || selectedDate === new Date().toISOString().split('T')[0]) {
        setSelectedDate(tomorrowStr);
      }
    } else {
      const todayStr = dateObj.toISOString().split('T')[0];
      if (!selectedDate) {
        setSelectedDate(todayStr);
      }
    }
  }, [salonSettings, selectedServices]);

  // Fetch Available Slots when Date or Staff changes
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!selectedDate || selectedServices.length === 0) return;
      setLoadingSlots(true);
      const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0);
      try {
        const res = await apiClient.get(`/appointments/availability?date=${selectedDate}&staffId=${selectedStaff}&duration=${totalDuration}`);
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
  }, [selectedDate, selectedStaff, selectedServices]);

  useEffect(() => {
    if (user) {
      if (user.name && !name) setName(user.name);
      if (user.phone && !phone) setPhone(user.phone);
    }
  }, [user]);

  // Calculate order total
  const totalAmount = Math.max(0, selectedServices.reduce((sum, s) => sum + s.price, 0) - discount - (redeemPoints ? ((user?.loyaltyPoints || 0) * 10) : 0));

  // Trigger Booking Submission
  const handleBooking = async (txRef?: string) => {
    if (user && user.isProfileComplete === false) {
      alert("Please complete your profile details first.");
      router.push('/complete-profile');
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await apiClient.post('/appointments', {
        services: selectedServices.map(s => s._id),
        appointmentDate: selectedDate,
        timeSlot: selectedTime,
        staff: selectedStaff,
        notes: notes,
        paymentMethod: paymentMethod,
        transactionRef: txRef || paymentRefId,
        couponCode: couponData ? couponCode : undefined,
        pointsRedeemed: redeemPoints ? user?.loyaltyPoints : 0,
        customerInfo: {
          name,
          phone
        }
      });

      if (res.data.success) {
        setShowUpiModal(false);
        setStep(6); // Move to Success/Confirm step
      } else {
        setError(res.data.message || "Booking failed");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Launch Dynamic UPI QR Modal & 5-minute Polling
  const handleInitiatePayment = () => {
    if (paymentMethod === "CASH") {
      handleBooking();
      return;
    }

    // Generate unique Reference ID with 5-minute expiry
    const refId = `BB-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
    setPaymentRefId(refId);
    setTimerSeconds(300); // 5 minutes (300 seconds)
    setPaymentMatched(false);
    setManualUtr("");
    setShowUpiModal(true);
    setPollingActive(true);
  };

  // 5-Minute Countdown Timer & Live Polling Effect
  useEffect(() => {
    if (!showUpiModal || !pollingActive) {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
      return;
    }

    // Countdown timer every second
    countdownTimerRef.current = setInterval(() => {
      setTimerSeconds(prev => {
        if (prev <= 1) {
          clearInterval(countdownTimerRef.current!);
          clearInterval(pollingTimerRef.current!);
          setPollingActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Poll payment matching API every 3 seconds
    pollingTimerRef.current = setInterval(async () => {
      try {
        const res = await apiClient.get(`/transactions/check-match?referenceId=${paymentRefId}&amount=${totalAmount}`);
        if (res.data?.success && res.data?.matched) {
          setPaymentMatched(true);
          setPollingActive(false);
          clearInterval(pollingTimerRef.current!);
          clearInterval(countdownTimerRef.current!);
          
          // Complete booking automatically
          setTimeout(() => {
            handleBooking(paymentRefId);
          }, 1500);
        }
      } catch (err) {
        console.error('Polling payment error:', err);
      }
    }, 3000);

    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
    };
  }, [showUpiModal, pollingActive, paymentRefId, totalAmount]);

  // Handle Manual UTR Submission in Modal
  const handleVerifyManualUtr = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualUtr.trim()) return;
    setVerifyingUtr(true);

    try {
      const res = await apiClient.post('/transactions/verify-customer-utr', {
        referenceId: paymentRefId,
        amount: totalAmount,
        utrNumber: manualUtr.trim(),
        customerName: name,
        customerPhone: phone
      });

      if (res.data?.success && res.data?.matched) {
        setPaymentMatched(true);
        setPollingActive(false);
        if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
        if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);

        setTimeout(() => {
          handleBooking(paymentRefId);
        }, 1200);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error validating transaction reference');
    } finally {
      setVerifyingUtr(false);
    }
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // UPI QR Data URL
  const qrUri = `upi://pay?pa=beautybeats320-3@okaxis&pn=BeautyBeats&am=${totalAmount}&tr=${paymentRefId}&tn=BB_${paymentRefId}&cu=INR`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrUri)}`;

  if (authLoading || !user) return <div className="max-w-4xl mx-auto px-6 py-20 min-h-screen text-center text-xl font-bold text-gray-400">Please log in to book...</div>;

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
                 <h2 className="text-4xl font-black text-gray-900 mb-2">Select Type</h2>
                 <p className="text-gray-500">What kind of treatment are you looking for?</p>
              </div>
              {(() => {
                const displayMainCategories = isUsingFallback
                  ? ['Hair', 'Skin', 'Bridal']
                  : Array.from(new Set(categories.map(c => c.mainCategory || 'General')));

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {displayMainCategories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => { setActiveMainCategory(cat); nextStep(); }}
                        className={cn(
                          "p-8 rounded-3xl border-2 text-center transition-all hover:bg-red-50 group",
                          activeMainCategory?.toLowerCase() === cat?.toLowerCase() ? "border-primary bg-red-50/50" : "border-gray-50 bg-gray-50/30"
                        )}
                      >
                        <h3 className="text-2xl font-black text-gray-900 group-hover:text-primary transition-colors uppercase tracking-widest">{cat}</h3>
                      </button>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-8">
              <div className="text-center mb-12">
                 <h2 className="text-4xl font-black text-gray-900 mb-2">Select Category</h2>
                 <p className="text-gray-500">Choose a specific domain for {activeMainCategory}.</p>
              </div>
              {(() => {
                const availableSubCategories = categories.filter(c => 
                  !activeMainCategory || c.mainCategory?.toLowerCase() === activeMainCategory?.toLowerCase()
                );

                return (
                  <div>
                    {availableSubCategories.length === 0 ? (
                      <div className="py-12 text-center text-gray-400 font-bold">
                        <p>No subcategories found for {activeMainCategory}.</p>
                        <button onClick={nextStep} className="mt-4 px-6 py-2 bg-primary text-white rounded-full font-bold">
                          View All Services
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {availableSubCategories.map(cat => (
                          <button
                            key={cat._id}
                            onClick={() => { setActiveCategory(cat.name); nextStep(); }}
                            className={cn(
                              "p-6 rounded-3xl border-2 text-center transition-all hover:bg-red-50 group",
                              activeCategory === cat.name ? "border-primary bg-red-50/50" : "border-gray-50 bg-gray-50/30"
                            )}
                          >
                            <h4 className="text-lg font-black text-gray-900 group-hover:text-primary transition-colors">{cat.name}</h4>
                            <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-wider">{cat.gender}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
              <div className="flex justify-between pt-8">
                <button onClick={prevStep} className="px-8 py-4 font-black flex items-center gap-2 text-gray-400 hover:text-gray-900">
                  <ChevronLeft className="w-5 h-5" /> Back
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8">
              <div className="text-center mb-12">
                 <h2 className="text-4xl font-black text-gray-900 mb-2">Choose Services</h2>
                 <p className="text-gray-500">Select one or more services to add to your appointment.</p>
              </div>
              {(() => {
                const filteredServices = services.filter(s => {
                  if (activeCategory) {
                    const sCat = typeof s.category === 'object' ? s.category?.name : s.category;
                    return sCat?.toLowerCase() === activeCategory?.toLowerCase();
                  }
                  if (activeMainCategory) {
                    const sMain = s.mainCategory || (typeof s.category === 'object' ? s.category?.mainCategory : s.category);
                    return sMain?.toLowerCase() === activeMainCategory?.toLowerCase();
                  }
                  return true;
                });

                return (
                  <div className="space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredServices.length === 0 ? (
                          <div className="col-span-2 py-12 text-center text-gray-400 font-bold">No services found in this category.</div>
                        ) : (
                          filteredServices.map(s => {
                            const isSelected = selectedServices.some(item => item._id === s._id);
                            return (
                              <button
                                key={s._id}
                                onClick={() => {
                                  if (isSelected) {
                                    setSelectedServices(selectedServices.filter(item => item._id !== s._id));
                                  } else {
                                    setSelectedServices([...selectedServices, s]);
                                  }
                                }}
                                className={cn(
                                  "p-6 rounded-3xl border-2 text-left transition-all relative overflow-hidden flex flex-col justify-between h-40",
                                  isSelected ? "border-primary bg-red-50/30" : "border-gray-50 bg-gray-50/30 hover:bg-gray-50"
                                )}
                              >
                                <div>
                                  <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-black text-gray-900 text-lg leading-tight">{s.name}</h4>
                                    <span className="text-primary font-black text-lg">₹{s.price}</span>
                                  </div>
                                  <p className="text-xs text-gray-400 font-bold flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" /> {s.duration} mins
                                  </p>
                                </div>
                                <div className="flex items-center justify-between mt-auto">
                                   <span className="text-[10px] font-black uppercase text-gray-400">{s.category?.name || s.category}</span>
                                   <div className={cn(
                                     "w-6 h-6 rounded-full flex items-center justify-center transition-all",
                                     isSelected ? "bg-primary text-white" : "border-2 border-gray-200"
                                   )}>
                                     {isSelected && <CheckCircle2 className="w-4 h-4" />}
                                   </div>
                                </div>
                                {isSelected && <div className="absolute inset-0 bg-red-50/20 pointer-events-none" />}
                              </button>
                            );
                          })
                        )}
                     </div>
                     {selectedServices.length > 0 && (
                       <div className="flex justify-between pt-4 border-t border-gray-100">
                         <div className="text-left">
                           <p className="text-xs font-black uppercase text-gray-400">Total Services: {selectedServices.length}</p>
                           <p className="text-2xl font-black text-primary">₹{selectedServices.reduce((sum, s) => sum + s.price, 0)}</p>
                         </div>
                         <button 
                           onClick={nextStep} 
                           className="px-8 py-3 bg-primary text-white rounded-full font-black shadow-lg shadow-red-100 flex items-center gap-2"
                         >
                           Continue to Schedule <ChevronRight className="w-5 h-5" />
                         </button>
                       </div>
                     )}
                  </div>
                );
              })()}
            </div>
          )}

          {/* STEP 3: SCHEDULE (Smart Salon Open/Close Time and Today Cutoff) */}
          {step === 3 && (
            <div className="space-y-8">
               <div className="text-center mb-10">
                 <h2 className="text-4xl font-black text-gray-900 mb-2">Build Your Schedule</h2>
                 <p className="text-gray-500">Pick an expert and time that works for you.</p>

                 {/* Salon Hours Pill */}
                 <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 border border-primary/20 text-xs font-black text-primary">
                   <Clock className="w-3.5 h-3.5" />
                   Salon Hours: {salonSettings?.openingTime || '10:00 AM'} – {salonSettings?.closingTime || '08:00 PM'}
                 </div>
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
                             setSelectedTime("");
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

                 {/* 2. Date Selection (Hides Today if salon is closed, starts from Tomorrow) */}
                 <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                      <h4 className="font-black text-gray-900 flex items-center gap-2 uppercase tracking-widest text-xs">
                        <Calendar className="w-4 h-4 text-primary" />
                        2. Select Date
                      </h4>
                      {isClosedToday && (
                        <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 flex items-center gap-1.5 self-start sm:self-auto">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                          Salon closed for today • Booking available from tomorrow
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                       {Array.from({ length: 7 }).map((_, i) => {
                         // If salon is closed today, offset by 1 so dates start from Tomorrow onwards!
                         const offset = isClosedToday ? i + 1 : i;
                         const date = new Date();
                         date.setDate(date.getDate() + offset);
                         const d = date.toLocaleDateString('en-US', { weekday: 'short' });
                         const day = date.getDate();
                         const fullDate = date.toISOString().split('T')[0];

                         return (
                          <div key={i} className="flex flex-col items-center gap-2">
                             <span className="text-[10px] font-black uppercase text-gray-400">{d}</span>
                             <button 
                               onClick={() => {
                                 setSelectedDate(fullDate);
                                 setSelectedTime("");
                               }}
                               className={cn(
                                 "w-full aspect-square rounded-2xl flex items-center justify-center font-black text-lg transition-all",
                                 selectedDate === fullDate ? "bg-primary text-white shadow-lg shadow-red-100" : "bg-gray-50 hover:bg-gray-100 text-gray-600"
                               )}
                             >
                               {day}
                             </button>
                          </div>
                         );
                       })}
                    </div>
                 </div>

                 {/* 3. Available Slots (Strictly bounded between Opening & Closing times) */}
                 <div className={cn(!selectedDate && "opacity-30 pointer-events-none transition-opacity")}>
                    <h4 className="font-black text-gray-900 mb-4 flex items-center gap-2 uppercase tracking-widest text-xs">
                      <Clock className="w-4 h-4 text-primary" />
                      3. Available Slots
                      {loadingSlots && <span className="ml-2 text-[10px] text-primary animate-pulse font-black italic">Syncing live availability...</span>}
                    </h4>
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                       {loadingSlots ? (
                         <div className="col-span-4 py-8 text-center text-gray-400 font-bold animate-pulse">Checking specialist schedules...</div>
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
                             {!s.available && <span className="absolute inset-0 flex items-center justify-center text-[10px] bg-white/60 font-bold text-red-500 rotate-12">Full</span>}
                           </button>
                         ))
                       ) : (
                         <div className="col-span-4 py-8 text-center text-gray-400 font-bold">
                           No slots available for this date.
                         </div>
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

          {step === 4 && (
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

          {/* STEP 5: SECURE CHECKOUT (Debit/Credit Card Removed, Dynamic UPI QR with 5-minute Match) */}
          {step === 5 && (
             <div className="space-y-8">
                <div className="text-center mb-12">
                   <h2 className="text-4xl font-black text-gray-900 mb-2">Secure Checkout</h2>
                   <p className="text-gray-500">Pay via Direct UPI or Pay at Salon on arrival.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                   <div className="md:col-span-2 space-y-6">
                      <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 space-y-4">
                         <h4 className="text-xs font-black uppercase tracking-widest text-gray-500">Select Payment Method</h4>
                         <div className="grid grid-cols-1 gap-3">
                            {/* UPI / QR Option */}
                            <button 
                               onClick={() => setPaymentMethod("UPI")}
                               className={cn(
                                  "p-4 rounded-2xl border-2 flex items-center gap-4 transition-all text-left",
                                  paymentMethod === "UPI" ? "border-primary bg-white shadow-sm" : "border-transparent bg-white/50 hover:bg-white"
                               )}
                            >
                               <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-primary">
                                  <Wallet className="w-5 h-5" />
                               </div>
                               <div className="flex-1">
                                  <p className="font-black text-sm">UPI / Dynamic QR Code</p>
                                  <p className="text-[10px] text-gray-500 font-bold">Instant verification (Google Pay, PhonePe, Paytm, CRED)</p>
                               </div>
                               {paymentMethod === "UPI" && <CheckCircle2 className="w-5 h-5 text-primary" />}
                            </button>

                            {/* Cash Option */}
                            <button 
                               onClick={() => setPaymentMethod("CASH")}
                               className={cn(
                                  "p-4 rounded-2xl border-2 flex items-center gap-4 transition-all text-left",
                                  paymentMethod === "CASH" ? "border-primary bg-white shadow-sm" : "border-transparent bg-white/50 hover:bg-white"
                               )}
                            >
                               <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-primary">
                                  <IndianRupee className="w-5 h-5" />
                               </div>
                               <div className="flex-1">
                                  <p className="font-black text-sm">Pay at Salon (Cash)</p>
                                  <p className="text-[10px] text-gray-500 font-bold">Reserve slot now, pay in person upon arrival</p>
                               </div>
                               {paymentMethod === "CASH" && <CheckCircle2 className="w-5 h-5 text-primary" />}
                            </button>
                         </div>
                      </div>

                      {/* Direct Verification Notice */}
                      <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-start gap-3">
                         <ShieldCheck className="w-5 h-5 text-indigo-600 mt-0.5" />
                         <div>
                            <p className="text-xs font-black text-indigo-950 uppercase">Direct Bank Sync Technology</p>
                            <p className="text-[11px] text-indigo-800 font-bold leading-relaxed">
                              When you click <strong>Pay & Book Now</strong>, a personalized 5-minute dynamic QR code will be generated. Our live ledger automatically matches your payment amount and confirms your booking immediately!
                            </p>
                         </div>
                      </div>
                   </div>

                   {/* Order Summary Column */}
                   <div className="bg-primary/5 p-8 rounded-3xl border border-primary/10 h-fit space-y-6">
                      <h4 className="text-xs font-black uppercase tracking-widest text-primary">Order Summary</h4>
                      <div className="space-y-3">
                         <div className="flex justify-between text-sm font-bold">
                            <span className="text-gray-600">{selectedServices.map(s => s.name).join(', ')}</span>
                            <span>₹{selectedServices.reduce((sum, s) => sum + s.price, 0)}</span>
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
                            <span>Total Payable</span>
                            <span>₹{totalAmount}</span>
                         </div>
                      </div>

                      {/* Loyalty Points Toggle */}
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
                                <p className="text-sm font-black text-primary">Redeem {user?.loyaltyPoints} Points</p>
                                <p className="text-[10px] font-bold text-red-900">Get instant ₹{(user?.loyaltyPoints || 0) * 10} off</p>
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
                                    ? Math.round((selectedServices.reduce((sum, s) => sum + s.price, 0) * res.data.data.discountValue) / 100)
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
                   </div>
                </div>

                {error && <p className="text-red-500 text-sm font-bold text-center mt-4">{error}</p>}

                <div className="flex justify-between pt-8">
                   <button onClick={prevStep} className="px-8 py-4 font-black flex items-center gap-2 text-gray-400 hover:text-gray-900">
                      <ChevronLeft className="w-5 h-5" /> Back
                   </button>
                   <button 
                     onClick={handleInitiatePayment} 
                     disabled={loading}
                     className="px-12 py-4 bg-primary text-white rounded-full font-black hover:bg-primary-dark shadow-xl shadow-red-100 flex items-center gap-2"
                   >
                     {loading ? (
                       <><Loader2 className="w-5 h-5 animate-spin" /> Finalizing...</>
                     ) : paymentMethod === "CASH" ? (
                       <>Confirm Booking & Pay at Salon <CheckCircle2 className="w-5 h-5" /></>
                     ) : (
                       <>Pay ₹{totalAmount} via UPI & Book Now <ChevronRight className="w-5 h-5" /></>
                     )}
                   </button>
                </div>
             </div>
          )}

          {/* STEP 6: SUCCESSFUL BOOKING */}
          {step === 6 && (
            <div className="text-center py-12 space-y-8">
               <motion.div 
                 initial={{ scale: 0 }}
                 animate={{ scale: 1 }}
                 className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center text-white mx-auto shadow-2xl shadow-green-100"
               >
                 <CheckCircle2 className="w-12 h-12" />
               </motion.div>
               <div>
                  <h2 className="text-4xl font-black text-gray-900 mb-4">
                    {paymentMethod === "CASH" ? "Booking Confirmed!" : "Payment & Booking Success!"}
                  </h2>
                  <p className="text-gray-500 text-lg">
                    {paymentMethod === "CASH" 
                      ? "Your appointment has been reserved. You can pay in cash at the salon desk."
                      : "Your payment has been verified directly on our bank ledger and your appointment is locked in!"}
                  </p>
               </div>
               
               <div className="max-w-xs mx-auto p-6 bg-gray-50 rounded-3xl space-y-4 border border-gray-100">
                  <div className="flex justify-between text-sm font-bold">
                     <span className="text-gray-400">Order / Ref</span>
                     <span className="text-gray-900 font-mono text-[10px]">{paymentRefId || `BTB-${Math.random().toString(36).substr(2, 8).toUpperCase()}`}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold">
                     <span className="text-gray-400">Status</span>
                     <span className={cn("uppercase italic font-black", paymentMethod === "CASH" ? "text-amber-600" : "text-green-600")}>
                        {paymentMethod === "CASH" ? "Pending (Pay at Salon)" : "Paid via UPI"}
                     </span>
                  </div>
                  <div className="flex justify-between text-sm font-bold">
                     <span className="text-gray-400">Amount</span>
                     <span className="text-gray-900 font-black">₹{totalAmount}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold">
                     <span className="text-gray-400">Specialist</span>
                     <span className="text-gray-900 font-black">{selectedStaff ? staff.find(s => s._id === selectedStaff)?.name : 'Any Specialist'}</span>
                  </div>
               </div>

               <div className="flex flex-col gap-4 pt-8">
                  <Link href="/profile" className="px-12 py-4 bg-primary text-white rounded-full font-black shadow-xl shadow-red-100">
                     View My Appointments
                  </Link>
                  <Link href="/" className="font-bold text-gray-400 hover:text-gray-900">
                     Back to Home
                  </Link>
               </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* DYNAMIC UPI QR MODAL (5-Minute Expiry & Auto-Match Polling) */}
      <AnimatePresence>
        {showUpiModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-4xl p-8 max-w-md w-full shadow-2xl relative border border-gray-100 text-center space-y-6"
            >
              <button 
                onClick={() => { setShowUpiModal(false); setPollingActive(false); }}
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-900"
              >
                <X className="w-6 h-6" />
              </button>

              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-primary text-xs font-black uppercase tracking-wider mb-2">
                  <QrCode className="w-3.5 h-3.5" /> Direct Account UPI
                </div>
                <h3 className="text-2xl font-black text-gray-900">Scan & Pay ₹{totalAmount}</h3>
                <p className="text-xs text-gray-500 font-bold mt-1">
                  Pay to: <span className="font-mono text-gray-900">beautybeats320-3@okaxis</span>
                </p>
              </div>

              {/* QR Image with Countdown */}
              <div className="relative flex flex-col items-center justify-center">
                <div className="p-3 bg-white rounded-3xl border-4 border-primary/20 shadow-lg">
                  <img 
                    src={qrCodeUrl} 
                    alt="Dynamic UPI QR" 
                    className="w-48 h-48 rounded-2xl" 
                  />
                </div>

                {/* 5-Minute Timer Badge */}
                <div className="mt-4 flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-xs font-black">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Session Expires In: <strong className="text-primary font-mono">{formatTimer(timerSeconds)}</strong></span>
                </div>
              </div>

              {/* Live Polling Status */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
                {paymentMatched ? (
                  <div className="flex items-center justify-center gap-2 text-green-600 font-black text-sm">
                    <CheckCircle2 className="w-5 h-5" />
                    Payment Matched! Finalizing appointment...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-indigo-600 font-bold text-xs">
                    <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                    Listening for incoming ₹{totalAmount} credit on account...
                  </div>
                )}
                <p className="text-[10px] text-gray-400 font-mono">
                  Order Ref: {paymentRefId}
                </p>
              </div>

              {/* Manual 12-Digit UTR Fallback */}
              <form onSubmit={handleVerifyManualUtr} className="space-y-3 pt-2 border-t border-gray-100 text-left">
                <label className="text-[11px] font-black uppercase tracking-wider text-gray-500 block">
                  Already paid? Enter 12-Digit UTR / UPI Ref:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. 428190281923"
                    value={manualUtr}
                    onChange={(e) => setManualUtr(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    type="submit"
                    disabled={verifyingUtr || !manualUtr.trim()}
                    className="px-4 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-black disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {verifyingUtr ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Confirm'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
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
