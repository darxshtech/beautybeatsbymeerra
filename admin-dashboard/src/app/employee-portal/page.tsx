"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiRequest } from '@/services/api';
import styles from '@/styles/layout/Dashboard.module.css';
import cardStyles from '@/styles/components/Card.module.css';
import { Clock, UserCheck, CalendarDays, ClipboardCheck, CreditCard, CheckCircle2, AlertCircle } from 'lucide-react';
import ConsentFormModal from '@/components/ConsentFormModal';
import PaymentModal from '@/components/PaymentModal';

interface Appointment {
  _id: string;
  timeSlot: string;
  customer: {
    _id: string;
    name: string;
    phone: string;
    skinToneInfo?: { 
      skinType?: string; 
      concerns?: string[]; 
      notes?: string;
    };
    birthday?: string;
    anniversary?: string;
    visitCount?: number;
    lastVisit?: string;
    loyaltyPoints?: number;
  };
  service: {
    name: string;
    price: number;
    category: string;
  };
  status: string;
}

export default function EmployeePortal() {
  const { user, isAuthenticated } = useAuth();
  const [attendanceStatus, setAttendanceStatus] = useState<any>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [activePortalTab, setActivePortalTab] = useState<'queue' | 'attendance' | 'notifications' | 'clients'>('queue');
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);
  const [clientStats, setClientStats] = useState<any>(null);
  const [clientFilter, setClientFilter] = useState<'week' | 'month' | 'year'>('month');

  // Speaking Notification Bot
  const speakNotification = (text: string) => {
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        utterance.pitch = 1.1;
        utterance.volume = 1;
        const voices = window.speechSynthesis.getVoices();
        const preferred = voices.find(v => v.name.includes('Female') || v.name.includes('Zira'));
        if (preferred) utterance.voice = preferred;
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      console.log('Speech not available');
    }
  };

  const fetchAttendance = async () => {
    try {
      const res = await apiRequest('/attendance/status');
      if (res.success) setAttendanceStatus(res.data);
      
      const logsRes = await apiRequest('/attendance/my-logs');
      if (logsRes.success) setAttendanceLogs(logsRes.data);
    } catch (err) {
      console.error('Failed to fetch attendance:', err);
    }
  };

  const fetchClientStats = async () => {
    try {
      const res = await apiRequest(`/reports/staff-clients?filter=${clientFilter}`);
      if (res.success) setClientStats(res.data);
    } catch (err) {
      console.error('Failed to fetch client stats:', err);
    }
  };

  const fetchAppointments = async () => {
    try {
      const res = await apiRequest('/appointments/my-customers');
      if (res.success) {
        const sorted = [...res.data].sort((a,b) => a.timeSlot.localeCompare(b.timeSlot));
        if (sorted.length > appointments.length && appointments.length > 0) {
          const newest = sorted[sorted.length - 1];
          speakNotification(`Attention. New customer assigned. ${newest.customer?.name || 'A customer'} for ${newest.service?.name || 'service'}.`);
        }
        setAppointments(sorted);
      }
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAttendance();
      fetchAppointments();
      fetchClientStats();
    }
    const interval = setInterval(() => {
      if (isAuthenticated) fetchAppointments();
    }, 60000); 
    return () => clearInterval(interval);
  }, [isAuthenticated, clientFilter]);

  const handleClockAction = async (action: 'clock-in' | 'clock-out') => {
    try {
      const res = await apiRequest(`/attendance/${action}`, { method: 'POST' });
      if (res.success) {
        setAttendanceStatus(res.data);
        fetchAttendance(); // Refresh logs
        alert(`Successfully ${action === 'clock-in' ? 'clocked in' : 'clocked out'}.`);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const openConsentForm = (app: Appointment) => {
    setSelectedAppointment(app);
    setIsConsentModalOpen(true);
  };

  const openPaymentModal = (app: Appointment) => {
    setSelectedAppointment(app);
    setIsPaymentModalOpen(true);
  };

  const handleConsentSubmit = async () => {
    setIsConsentModalOpen(false);
    fetchAppointments(); // Refresh to update status
  };

  const handlePaymentSubmit = async () => {
    setIsPaymentModalOpen(false);
    fetchAppointments(); // Refresh to update status
    fetchClientStats(); // Update stats
  };

  const isClockedIn = attendanceStatus?.status === 'CLOCKED_IN';
  const hasInProgress = appointments.some(a => a.status === 'IN_PROGRESS' || a.status === 'IN-PROGRESS');

  return (
    <div className={styles.container}>
      <header className={`${styles.sectionHeader} flex-mobile-column`} style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className={styles.title}>Welcome, {user?.name}</h2>
          <p className={styles.subtitle}>Your personalized service dashboard and attendance control.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', width: '100%', maxWidth: 'max-content', marginTop: '1rem' }}>
          <button 
             onClick={() => setActivePortalTab('queue')}
             className="glass"
             style={{ 
               padding: '10px 18px', 
               borderRadius: '14px', 
               fontWeight: 800,
               background: activePortalTab === 'queue' ? 'var(--primary)' : 'rgba(255,255,255,0.5)',
               color: activePortalTab === 'queue' ? 'white' : 'var(--text-main)',
               transition: 'all 0.3s'
             }}
          >Queue</button>
          <button 
             onClick={() => setActivePortalTab('clients')}
             className="glass"
             style={{ 
               padding: '10px 18px', 
               borderRadius: '14px', 
               fontWeight: 800,
               background: activePortalTab === 'clients' ? 'var(--primary)' : 'rgba(255,255,255,0.5)',
               color: activePortalTab === 'clients' ? 'white' : 'var(--text-main)',
               transition: 'all 0.3s'
             }}
          >My Clients</button>
          <button 
             onClick={() => setActivePortalTab('attendance')}
             className="glass"
             style={{ 
               padding: '10px 18px', 
               borderRadius: '14px', 
               fontWeight: 800,
               background: activePortalTab === 'attendance' ? 'var(--primary)' : 'rgba(255,255,255,0.5)',
               color: activePortalTab === 'attendance' ? 'white' : 'var(--text-main)',
               transition: 'all 0.3s'
             }}
          >Attendance</button>
          <button 
             onClick={() => setActivePortalTab('notifications')}
             className="glass"
             style={{ 
               padding: '10px 18px', 
               borderRadius: '14px', 
               fontWeight: 800,
               background: activePortalTab === 'notifications' ? 'var(--primary)' : 'rgba(255,255,255,0.5)',
               color: activePortalTab === 'notifications' ? 'white' : 'var(--text-main)',
               transition: 'all 0.3s'
             }}
          >Notifications</button>

          {!isClockedIn ? (
            <button 
              onClick={() => handleClockAction('clock-in')}
              style={{ 
                background: '#34C759', 
                color: 'white', 
                padding: '12px 24px', 
                borderRadius: '16px', 
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 8px 20px rgba(52, 199, 89, 0.2)'
              }}
            >
              <Clock size={20} />
              <span>In Time</span>
            </button>
          ) : (
            <button 
              onClick={() => handleClockAction('clock-out')}
              style={{ 
                background: '#FF3B30', 
                color: 'white', 
                padding: '12px 24px', 
                borderRadius: '16px', 
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 8px 20px rgba(255, 59, 48, 0.2)'
              }}
            >
              <Clock size={20} />
              <span>Out Time</span>
            </button>
          )}
        </div>
      </header>

      {activePortalTab === 'queue' && (
      <>
      <section className={styles.kpiGrid}>
        <div className={cardStyles.card} style={{ borderLeft: '4px solid #FF9500' }}>
          <div className={cardStyles.header}>
            <span className={cardStyles.label}>Today's Status</span>
            <div className={cardStyles.icon} style={{ background: 'rgba(255, 149, 0, 0.1)', color: '#FF9500' }}>
              <CalendarDays size={20} />
            </div>
          </div>
          <div className={cardStyles.value}>{isClockedIn ? 'Active Now' : 'Off Duty'}</div>
          <div className={cardStyles.trending}>
            {isClockedIn ? `In since ${new Date(attendanceStatus.clockIn).toLocaleTimeString()}` : 'Please clock in to attend customers'}
          </div>
        </div>
        <div className={cardStyles.card} style={{ borderLeft: '4px solid var(--primary)' }}>
          <div className={cardStyles.header}>
            <span className={cardStyles.label}>Today's Queue</span>
          </div>
          <div className={cardStyles.value}>{appointments.length} Total</div>
          <div className={cardStyles.trending} style={{ color: 'var(--text-muted)' }}>Assigned to you</div>
        </div>
      </section>

      <section>
        <h3 style={{ marginBottom: '1.5rem', fontWeight: 900, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
          <UserCheck size={28} color="var(--primary)" />
          Live Queue
        </h3>

        {loading ? (
          <p>Loading your schedule...</p>
        ) : appointments.length === 0 ? (
          <div className="glass" style={{ padding: '4rem', borderRadius: '32px', textAlign: 'center' }}>
            <AlertCircle size={64} color="var(--text-muted)" style={{ margin: '0 auto 1.5rem', opacity: 0.5 }} />
            <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', fontWeight: 700 }}>No customers assigned for today.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {appointments.map((app) => (
              <div 
                key={app._id} 
                className={`glass flex-mobile-column`} 
                style={{ 
                  padding: '1.75rem', 
                  borderRadius: '24px', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  gap: '1.5rem',
                  background: app.status === 'IN_PROGRESS' || app.status === 'IN-PROGRESS' ? 'rgba(255, 59, 48, 0.05)' : 'rgba(255,255,255,0.6)',
                  border: app.status === 'IN_PROGRESS' || app.status === 'IN-PROGRESS' ? '2px solid var(--primary)' : '1px solid var(--border-light)',
                  boxShadow: app.status === 'IN_PROGRESS' || app.status === 'IN-PROGRESS' ? '0 10px 30px rgba(255, 59, 48, 0.15)' : 'none'
                }}
              >
                <div style={{ display: 'flex', gap: '1.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ 
                    width: '72px', 
                    height: '72px', 
                    background: app.status === 'COMPLETED' ? 'rgba(52, 199, 89, 0.08)' : 'white', 
                    borderRadius: '20px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    border: app.status === 'COMPLETED' ? '2px solid #34C759' : '1px solid var(--border-light)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                  }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 900, color: app.status === 'COMPLETED' ? '#34C759' : 'var(--primary)' }}>{app.status === 'COMPLETED' ? 'FREE' : 'SLOT'}</span>
                    <span style={{ fontWeight: 900, fontSize: '1.25rem' }}>{app.timeSlot.split(' ')[0]}</span>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.35rem', fontWeight: 900 }}>{app.customer?.name}</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                      {app.service?.name} • ₹{app.service?.price}
                    </p>
                    
                    <div style={{ display: 'flex', gap: '12px', fontSize: '0.85rem', marginBottom: '0.85rem', color: 'var(--text-muted)' }}>
                      <span className="glass" style={{ padding: '2px 8px', borderRadius: '8px' }}><strong>Visits:</strong> {app.customer?.visitCount || 0}</span>
                      {app.customer?.lastVisit && (
                        <span className="glass" style={{ padding: '2px 8px', borderRadius: '8px' }}><strong>Last:</strong> {new Date(app.customer.lastVisit).toLocaleDateString()}</span>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        padding: '4px 10px', 
                        borderRadius: '8px', 
                        background: 'rgba(0,0,0,0.08)', 
                        fontWeight: 900,
                        textTransform: 'uppercase'
                      }}>{app.status}</span>
                      
                      {app.customer?.skinToneInfo?.skinType && (
                         <span style={{ 
                          fontSize: '0.75rem', 
                          padding: '4px 10px', 
                          borderRadius: '8px', 
                          background: 'rgba(52, 199, 89, 0.15)', 
                          color: '#28a745',
                          fontWeight: 900 
                        }}>{app.customer.skinToneInfo.skinType}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.85rem', width: '100%', maxWidth: 'max-content', justifyContent: 'flex-end' }}>
                   {(app.status === 'CONFIRMED' || app.status === 'PENDING') && (
                    <button 
                      className={styles.pageBtn}
                      disabled={!isClockedIn || hasInProgress}
                      onClick={() => openConsentForm(app)}
                      style={{ 
                        padding: '12px 24px', 
                        flex: 1,
                        background: (isClockedIn && !hasInProgress) ? 'var(--primary)' : 'rgba(0,0,0,0.1)', 
                        color: 'white',
                        fontWeight: 800,
                        borderRadius: '16px',
                        gap: '8px',
                        cursor: (isClockedIn && !hasInProgress) ? 'pointer' : 'not-allowed',
                        transition: 'all 0.3s'
                      }}
                    >
                      <ClipboardCheck size={20} />
                      {hasInProgress ? 'Active' : 'Attend'}
                    </button>
                  )}
                  {(app.status === 'IN_PROGRESS' || app.status === 'IN-PROGRESS') && (
                    <button 
                      className={styles.pageBtn}
                      onClick={() => openPaymentModal(app)}
                      style={{ 
                        padding: '12px 24px', 
                        flex: 1,
                        background: '#34C759', 
                        color: 'white',
                        fontWeight: 800,
                        borderRadius: '16px',
                        gap: '8px',
                        boxShadow: '0 8px 20px rgba(52, 199, 89, 0.2)'
                      }}
                    >
                      <CreditCard size={20} />
                      Finish
                    </button>
                  )}
                  {app.status === 'COMPLETED' && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                      <div style={{ color: '#34C759', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 900 }}>
                        <CheckCircle2 size={24} />
                        COMPLETED
                      </div>
                      <span style={{ 
                        fontSize: '0.7rem', 
                        fontWeight: 800, 
                        color: '#34C759', 
                        background: 'rgba(52, 199, 89, 0.1)', 
                        padding: '3px 10px', 
                        borderRadius: '8px'
                      }}>Slot Available</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      </>
      )}

      {activePortalTab === 'clients' && (
        <section>
          <div className="glass" style={{ padding: '2rem', borderRadius: '24px', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontWeight: 900, fontSize: '1.5rem' }}>Clients Served</h3>
              <p className="text-muted">History of clients you have professionally attended.</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {(['week', 'month', 'year'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setClientFilter(f)}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '12px',
                    fontWeight: 800,
                    textTransform: 'capitalize',
                    background: clientFilter === f ? 'var(--primary)' : 'rgba(0,0,0,0.05)',
                    color: clientFilter === f ? 'white' : 'var(--text-main)',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >{f}</button>
              ))}
            </div>
          </div>

          <section className={styles.kpiGrid} style={{ marginBottom: '2rem' }}>
            <div className={cardStyles.card}>
              <span className={cardStyles.label}>Unique Clients</span>
              <div className={cardStyles.value}>{clientStats?.totalUniqueClients || 0}</div>
            </div>
            <div className={cardStyles.card}>
              <span className={cardStyles.label}>Total Sessions</span>
              <div className={cardStyles.value}>{clientStats?.totalSessions || 0}</div>
            </div>
          </section>

          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {clientStats?.clients?.map((item: any) => (
              <div key={item.profile._id} className="glass" style={{ padding: '1.5rem', borderRadius: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', background: 'var(--primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>
                    {item.profile.name.charAt(0)}
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 800 }}>{item.profile.name}</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.profile.phone}</p>
                  </div>
                  <div style={{ marginLeft: 'auto', textAlign: 'right' }} className="mobile-hide-margin">
                    <span style={{ fontSize: '14px', fontWeight: 900, color: 'var(--primary)' }}>{item.count}</span>
                    <p style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 800 }}>SESSIONS</p>
                  </div>
                </div>
                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem' }}>
                   <p style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>RECENT SERVICES</p>
                   {item.sessions.slice(0, 2).map((s: any, idx: number) => (
                     <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 700 }}>{s.service}</span>
                        <span style={{ color: 'var(--text-muted)' }}>{new Date(s.date).toLocaleDateString()}</span>
                     </div>
                   ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {activePortalTab === 'attendance' && (
         <section className="glass" style={{ padding: '2.5rem', borderRadius: '32px' }}>
            <h3 style={{ fontWeight: 900, marginBottom: '1.5rem', fontSize: '1.5rem' }}>Attendance Timeline</h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
               {attendanceLogs.length === 0 ? (
                 <p className="text-muted">No attendance logs found for this month.</p>
               ) : (
                 attendanceLogs.map((log) => (
                   <div key={log._id} className="flex-mobile-column" style={{ display: 'flex', justifyContent: 'space-between', padding: '1.25rem', background: 'white', borderRadius: '18px', border: '1px solid var(--border-light)', gap: '1rem' }}>
                      <div>
                        <p style={{ fontWeight: 900, fontSize: '1.1rem' }}>{new Date(log.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', gap: '10px', marginTop: '4px' }}>
                          <span><strong>IN:</strong> {new Date(log.clockIn).toLocaleTimeString()}</span>
                          {log.clockOut && <span><strong>OUT:</strong> {new Date(log.clockOut).toLocaleTimeString()}</span>}
                        </p>
                        <div style={{ marginTop: '0.75rem', fontSize: '11px', color: '#555' }}>
                          <span className="glass" style={{ padding: '3px 8px', borderRadius: '6px' }}>{log.deviceName || 'Local Browser'}</span>
                          <span style={{ marginLeft: '10px', color: 'var(--text-muted)' }}>IP: {log.ipAddress || '127.0.0.1'}</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)' }}>{log.totalHours || '--'}</p>
                        <p style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 800 }}>TOTAL HOURS</p>
                      </div>
                   </div>
                 ))
               )}
            </div>
         </section>
      )}

      {activePortalTab === 'notifications' && (
         <section className="glass" style={{ padding: '2rem', borderRadius: '24px' }}>
            <h3 style={{ fontWeight: 900, marginBottom: '1.5rem', fontSize: '1.5rem' }}>System Alerts</h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
               <div style={{ padding: '1.5rem', background: 'white', borderRadius: '18px', borderLeft: '4px solid var(--primary)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                  <p style={{ fontWeight: 900, fontSize: '1.1rem', marginBottom: '4px' }}>Ready for Service</p>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Keep this portal open to receive live voice-alerts for new client assignments.</p>
               </div>
            </div>
         </section>
      )}

      {selectedAppointment && (
        <>
          <ConsentFormModal 
            isOpen={isConsentModalOpen} 
            onClose={() => setIsConsentModalOpen(false)} 
            appointment={selectedAppointment}
            onSuccess={handleConsentSubmit}
          />
          <PaymentModal 
            isOpen={isPaymentModalOpen} 
            onClose={() => setIsPaymentModalOpen(false)} 
            appointment={selectedAppointment}
            onSuccess={handlePaymentSubmit}
          />
        </>
      )}
    </div>
  );
}
