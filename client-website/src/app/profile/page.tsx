"use client";

import { motion } from 'framer-motion';
import { 
  User as UserIcon, 
  History, 
  Award, 
  Settings, 
  Calendar, 
  ChevronRight, 
  Heart, 
  Smartphone,
  LogOut,
  AlertCircle,
  ClipboardCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import apiClient from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('My Appointments');
  const [settingsForm, setSettingsForm] = useState({ name: '', phone: '' });
  const [skinForm, setSkinForm] = useState({ skinType: '', concerns: '', notes: '' });
  
  // Reschedule Modal States
  const [rescheduleData, setRescheduleData] = useState<any>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [availableSlots, setAvailableSlots] = useState<{slot: string, available: boolean}[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    if (user) {
      setSettingsForm({ name: user.name || '', phone: user.phone || '' });
      setSkinForm({ 
        skinType: user.skinToneInfo?.skinType || 'Normal', 
        concerns: user.skinToneInfo?.concerns?.join(', ') || '',
        notes: user.skinToneInfo?.notes || ''
      });
    }
  }, [user]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (user) {
        try {
          const res = await apiClient.get(`/appointments?customerId=${user._id}`);
          if (res.data.success) setAppointments(res.data.data);
        } catch (err) {
          console.error(err);
        }
      }
    };
    fetchHistory();
  }, [user]);

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!rescheduleDate || !rescheduleData) return;
      setLoadingSlots(true);
      try {
        const staffId = rescheduleData.staff?._id || "";
        const res = await apiClient.get(`/appointments/availability?date=${rescheduleDate}&staffId=${staffId}&excludeAppId=${rescheduleData._id}`);
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
  }, [rescheduleDate, rescheduleData]);

  const handleUpdateProfile = async (type: 'settings' | 'skin') => {
    try {
      const payload = type === 'settings' 
        ? settingsForm 
        : { skinToneInfo: { ...skinForm, concerns: skinForm.concerns.split(',').map(c => c.trim()) } };
      const res = await apiClient.put('/users/profile', payload);
      if(res.data.success) {
        alert(`${type} updated successfully!`);
        window.location.reload();
      }
    } catch (err) {
      alert(`Failed to update ${type}.`);
    }
  };

  const submitReschedule = async () => {
    if(!rescheduleDate || !rescheduleTime) return;
    try {
      const res = await apiClient.put(`/appointments/${rescheduleData._id}`, { appointmentDate: rescheduleDate, timeSlot: rescheduleTime, status: 'PENDING' });
      if(res.data.success) {
        alert("Rescheduled successfully!");
        setRescheduleData(null);
        window.location.reload();
      }
    } catch (e: any) {
      alert(e.response?.data?.message || "Failed to reschedule.");
    }
  };

  if (loading || !user) return <div className="p-20 text-center font-black">Inducting Profile...</div>;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Profile Sidebar */}
        <div className="lg:col-span-1 space-y-8">
          <div className="p-8 rounded-[40px] bg-white border border-gray-100 shadow-sm text-center">
             <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary text-4xl font-black mx-auto mb-6">
                {user.name.charAt(0)}
             </div>
             <h2 className="text-2xl font-black text-gray-900">{user.name}</h2>
             <p className="text-sm text-gray-500 font-bold mb-8">{user.email}</p>
             
             <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-3xl bg-red-50 text-primary">
                   <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-red-400">Total Visits</p>
                   <p className="text-xl font-black">{user.visitCount || 0}</p>
                </div>
                <div className="p-4 rounded-3xl bg-gray-50 text-gray-900">
                   <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-gray-400">Join Date</p>
                   <p className="text-sm font-black">{new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
             </div>
          </div>

           <div className="p-4 rounded-[30px] bg-white border border-gray-100 shadow-sm overflow-hidden">
             {[
               { name: 'My Appointments', icon: Calendar },
               { name: 'Loyalty Rewards', icon: Award },
               { name: 'Skin Profile', icon: Heart },
               { name: 'Settings', icon: Settings },
             ].map((item) => (
               <button 
                 key={item.name} 
                 onClick={() => setActiveTab(item.name)}
                 className={cn(
                 "w-full flex items-center justify-between p-4 rounded-2xl transition-all",
                 activeTab === item.name ? "bg-primary text-white" : "hover:bg-gray-50 text-gray-600"
               )}>
                 <div className="flex items-center gap-3">
                   <item.icon className="w-5 h-5" />
                   <span className="font-black text-sm">{item.name}</span>
                 </div>
                 <ChevronRight className="w-4 h-4 opacity-50" />
               </button>
             ))}
             <button onClick={logout} className="w-full flex items-center gap-3 p-4 text-red-600 font-black text-sm mt-4">
                <LogOut className="w-5 h-5" />
                Sign Out
             </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-12">
           {activeTab === 'My Appointments' && (
             <>
               <section>
                  <div className="flex items-center justify-between mb-8">
                     <h3 className="text-3xl font-black text-gray-900">Recent Activity</h3>
                     <button className="text-primary font-black text-sm">View All History</button>
                  </div>
                  <div className="space-y-4">
                     {appointments.length > 0 ? appointments.map((b) => (
                       <motion.div 
                        key={b._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 rounded-[35px] bg-white border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6"
                       >
                         <div className="flex items-center gap-6">
                            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-primary">
                               <History className="w-8 h-8" />
                            </div>
                            <div>
                               <h4 className="text-xl font-black">{b.service?.name || 'Unspecified Service'}</h4>
                               <p className="text-sm text-gray-500 font-bold">{new Date(b.appointmentDate).toLocaleDateString()} • {b.timeSlot}</p>
                            </div>
                         </div>
                         <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-4 md:pt-0">
                            <span className={cn(
                              "px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest",
                              b.status === 'COMPLETED' ? "bg-green-100 text-green-700" : 
                              b.status === 'CANCELLED' ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                            )}>
                              {b.status}
                            </span>
                            <p className="text-xl font-black text-gray-900 mb-2">₹{b.service?.price || 0}</p>
                            {(b.status === 'PENDING' || b.status === 'CONFIRMED') && (() => {
                               const appDate = new Date(b.appointmentDate);
                               const [time, ampm] = b.timeSlot.split(' ');
                               let [h, m] = time.split(':').map(Number);
                               if (ampm === 'PM' && h < 12) h += 12;
                               if (ampm === 'AM' && h === 12) h = 0;
                               appDate.setHours(h, m, 0, 0);
                               const isLocked = (appDate.getTime() - Date.now()) < (12 * 60 * 60 * 1000);

                               return (
                                 <button 
                                   disabled={isLocked}
                                   onClick={() => {
                                     setRescheduleData(b);
                                     setRescheduleDate("");
                                     setRescheduleTime("");
                                   }}
                                   className={cn(
                                     "text-xs font-black underline transition-colors",
                                     isLocked ? "text-gray-300 cursor-not-allowed" : "text-primary hover:text-primary-dark"
                                   )}
                                   title={isLocked ? "Rescheduling locked (within 12h)" : "Change appointment"}
                                 >
                                   {isLocked ? "Locked (12h rule)" : "Reschedule"}
                                 </button>
                               );
                            })()}
                         </div>
                       </motion.div>
                     )) : (
                       <p className="text-gray-400 font-bold text-center py-10">No recent activity found.</p>
                     )}
                  </div>
               </section>
             </>
           )}

           {activeTab === 'Loyalty Rewards' && (
             <section className="space-y-6">
                 <h3 className="text-3xl font-black text-gray-900 mb-8">Loyalty Rewards</h3>
                 <div className="p-10 rounded-[45px] bg-gradient-to-br from-primary to-primary-dark text-white relative overflow-hidden">
                    <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                       <div className="flex-1 text-center md:text-left">
                          <div className="inline-block p-2 bg-white/20 rounded-xl mb-4">
                             <Award className="w-6 h-6" />
                          </div>
                          <h3 className="text-3xl font-black mb-2">Member Rewards</h3>
                          <p className="text-white/70 font-medium">You have <span className="text-white font-black">{user.loyaltyPoints || 0} points</span> available.</p>
                       </div>
                       <button className="px-8 py-4 bg-white text-primary rounded-full font-black shadow-xl">
                          Redeem Now
                       </button>
                    </div>
                 </div>
                 <div className="p-8 rounded-[35px] bg-white border border-gray-100 shadow-sm mt-6">
                    <h4 className="text-xl font-black mb-4">How it works</h4>
                    <p className="text-gray-500 font-medium leading-relaxed">
                      Earn 1 point for every ₹100 spent on services. Redeem your points for exclusive discounts and free complementary treatments. Check back often for special multiplier days!
                    </p>
                 </div>
             </section>
           )}

           {activeTab === 'Skin Profile' && (
             <section>
                 <h3 className="text-3xl font-black text-gray-900 mb-8">Skin Profile</h3>
                 <div className="p-8 rounded-[35px] bg-white border border-gray-100 shadow-sm space-y-6">
                     <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
                       <Heart className="text-primary w-8 h-8" />
                       <div className="flex-1">
                         <h4 className="text-lg font-black text-gray-900">Skin Type</h4>
                         <select 
                           value={skinForm.skinType}
                           onChange={e => setSkinForm({...skinForm, skinType: e.target.value})}
                           className="w-full mt-2 p-2 rounded-lg border font-bold"
                         >
                            <option>Normal</option>
                            <option>Dry</option>
                            <option>Oily</option>
                            <option>Combination</option>
                            <option>Sensitive</option>
                         </select>
                       </div>
                    </div>
                    <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
                       <AlertCircle className="text-orange-500 w-8 h-8" />
                       <div className="flex-1">
                         <h4 className="text-lg font-black text-gray-900">Key Concerns (Comma separated)</h4>
                         <input 
                           value={skinForm.concerns}
                           onChange={e => setSkinForm({...skinForm, concerns: e.target.value})}
                           className="w-full mt-2 p-2 rounded-lg border font-bold"
                         />
                       </div>
                    </div>
                    <div className="flex items-start gap-4">
                       <ClipboardCheck className="text-green-500 w-8 h-8" />
                       <div className="flex-1">
                         <h4 className="text-lg font-black text-gray-900">Specialist Notes</h4>
                         <textarea 
                           value={skinForm.notes}
                           onChange={e => setSkinForm({...skinForm, notes: e.target.value})}
                           className="w-full mt-2 p-2 rounded-lg border font-bold"
                           rows={3}
                         />
                       </div>
                    </div>
                    <button onClick={() => handleUpdateProfile('skin')} className="mt-4 px-6 py-3 bg-primary text-white rounded-full font-black text-sm hover:bg-primary-dark transition-colors">
                       Save Profile Updates
                    </button>
                 </div>
             </section>
           )}

           {activeTab === 'Settings' && (
             <section>
                 <h3 className="text-3xl font-black text-gray-900 mb-8">Account Settings</h3>
                 <div className="p-8 rounded-[35px] bg-white border border-gray-100 shadow-sm space-y-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-black uppercase text-gray-400 tracking-widest">Full Name</label>
                        <input 
                           value={settingsForm.name}
                           onChange={e => setSettingsForm({...settingsForm, name: e.target.value})}
                           className="w-full mt-1 p-2 rounded-lg border font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-black uppercase text-gray-400 tracking-widest">Email Address</label>
                        <p className="text-gray-900 font-bold">{user.email || 'Not provided'} (Cannot be changed)</p>
                      </div>
                      <div>
                        <label className="text-xs font-black uppercase text-gray-400 tracking-widest">Phone Number</label>
                        <input 
                           value={settingsForm.phone}
                           onChange={e => setSettingsForm({...settingsForm, phone: e.target.value})}
                           className="w-full mt-1 p-2 rounded-lg border font-bold"
                        />
                      </div>
                    </div>
                    <button onClick={() => handleUpdateProfile('settings')} className="mt-8 px-6 py-3 bg-gray-900 text-white rounded-full font-black text-sm hover:bg-gray-800 transition-colors">
                       Update Account Settings
                    </button>
                 </div>
             </section>
           )}
        </div>
      </div>

      {rescheduleData && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[35px] max-w-lg w-full p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black">Reschedule Appointment</h3>
              <button onClick={() => setRescheduleData(null)} className="font-bold text-gray-500">Cancel</button>
            </div>
            
            {/* Date Selection */}
            <div>
               <h4 className="font-black text-xs uppercase tracking-widest text-primary mb-3">1. Select New Date</h4>
               <div className="grid grid-cols-4 gap-2">
                 {Array.from({ length: 7 }).map((_, i) => {
                   const date = new Date();
                   date.setDate(date.getDate() + i);
                   const fullDate = date.toISOString().split('T')[0];
                   return (
                     <button
                       key={i}
                       onClick={() => { setRescheduleDate(fullDate); setRescheduleTime(""); }}
                       className={cn(
                         "py-3 rounded-2xl flex flex-col items-center justify-center font-black transition-all",
                         rescheduleDate === fullDate ? "bg-primary text-white shadow-lg" : "bg-gray-50 hover:bg-gray-100 text-gray-600"
                       )}
                     >
                       <span className="text-[10px] uppercase opacity-70 mb-1">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                       <span className="text-lg">{date.getDate()}</span>
                     </button>
                   )
                 })}
               </div>
            </div>

            {/* Time Selection */}
            <div className={cn(!rescheduleDate && "opacity-30 pointer-events-none")}>
               <h4 className="font-black text-xs uppercase tracking-widest text-primary mb-3 flex items-center gap-2">
                  2. Select New Time
                  {loadingSlots && <span className="lowercase font-bold text-[10px] animate-pulse text-gray-400">(syncing...)</span>}
               </h4>
               <div className="grid grid-cols-3 gap-2">
                  {loadingSlots ? (
                     <p className="col-span-3 text-center text-xs font-bold text-gray-400 py-4">Checking calendars...</p>
                  ) : availableSlots.length > 0 ? availableSlots.map(s => (
                    <button
                      key={s.slot}
                      disabled={!s.available}
                      onClick={() => setRescheduleTime(s.slot)}
                      className={cn(
                        "py-2 rounded-xl border-2 font-black text-sm transition-all relative overflow-hidden",
                        rescheduleTime === s.slot ? "border-primary bg-primary text-white shadow-md shadow-red-100" : 
                        s.available ? "border-transparent bg-gray-50 hover:bg-gray-100 text-gray-700" : "opacity-40 cursor-not-allowed bg-gray-100 text-gray-400 grayscale line-through"
                      )}
                    >
                      {s.slot}
                    </button>
                  )) : (
                     <p className="col-span-3 text-center text-xs font-bold text-gray-400 py-4">Select a date first.</p>
                  )}
               </div>
            </div>

            <button 
              disabled={!rescheduleDate || !rescheduleTime}
              onClick={submitReschedule} 
              className="w-full py-4 bg-primary text-white rounded-full font-black mt-4 disabled:opacity-50 hover:bg-primary-dark transition-all shadow-xl shadow-red-100"
            >
              Confirm Reschedule
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
