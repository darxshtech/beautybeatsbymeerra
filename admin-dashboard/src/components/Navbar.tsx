"use client";

import { useState, useEffect, useRef } from 'react';
import { Search, User, Bell, LogOut, Moon, Sun, Clock, Check, CheckCheck, Volume2, VolumeX, Menu } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/services/api';
import styles from '@/styles/layout/Navbar.module.css';

interface AdminNotif {
  _id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  paymentInfo?: { method: string; amount: number; transactionId: string };
}

interface NavbarProps {
  onMenuClick?: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { user, logout, isAdmin, isAuthenticated } = useAuth();
  const router = useRouter();
  const [notifCount, setNotifCount] = useState(0);
  const [notifications, setNotifications] = useState<AdminNotif[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Voice & Real-time State
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const spokenNotifsRef = useRef<Set<string>>(new Set());
  const speechQueueRef = useRef<string[]>([]);
  const isSpeakingRef = useRef(false);

  // Load voices immediately and on change + Auto-Unlock for browsers
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadVoices = () => window.speechSynthesis.getVoices();
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;

      // Browser "Auto-Unlock" logic - first interaction enables speech
      const unlockSpeech = () => {
        const dummy = new SpeechSynthesisUtterance(" ");
        dummy.volume = 0;
        window.speechSynthesis.speak(dummy);
        window.removeEventListener('click', unlockSpeech);
      };
      window.addEventListener('click', unlockSpeech);
      return () => window.removeEventListener('click', unlockSpeech);
    }
  }, []);

  // Advanced Voice Queue System
  const processQueue = () => {
    if (!voiceEnabled || isSpeakingRef.current || speechQueueRef.current.length === 0) return;
    
    const text = speechQueueRef.current.shift();
    if (!text) return;

    try {
      if ('speechSynthesis' in window) {
        // Cancel current if any, but better to queue
        isSpeakingRef.current = true;
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1;
        
        const voices = window.speechSynthesis.getVoices();
        const preferred = voices.find(v => 
          v.name.includes('Female') || 
          v.name.includes('Zira') || 
          v.name.includes('Google UK English Female') ||
          v.lang.startsWith('en-GB')
        );
        if (preferred) utterance.voice = preferred;

        utterance.onend = () => {
          isSpeakingRef.current = false;
          setTimeout(processQueue, 500); 
        };

        utterance.onerror = () => {
          isSpeakingRef.current = false;
          processQueue();
        };

        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      isSpeakingRef.current = false;
      console.error('Speech error:', e);
    }
  };

  const speakNotification = (text: string) => {
    if (!voiceEnabled) return;
    speechQueueRef.current.push(text);
    processQueue();
  };

  // Real-time Fetching
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchNotifs = async () => {
      try {
        if (isAdmin) {
          const res = await apiRequest('/admin-notifications?limit=5');
          if (res.success && res.data) {
            const newNotifs = res.data.filter((n: AdminNotif) => !n.isRead && !spokenNotifsRef.current.has(n._id));
            
            if (newNotifs.length > 0) {
              [...newNotifs].reverse().forEach((n: AdminNotif) => {
                spokenNotifsRef.current.add(n._id);
                // Only queue if voice is actually enabled
                if (voiceEnabled) speakNotification(`${n.title}. ${n.message}`);
              });
            }
            
            const countRes = await apiRequest('/admin-notifications/count');
            if (countRes.success) setNotifCount(countRes.count);
          }
        } else {
          const json = await apiRequest('/notifications');
          if (json.success && json.data) {
             const unread = json.data.filter((n: any) => !n.isRead && !spokenNotifsRef.current.has(n._id));
             if (unread.length > 0) {
                if (voiceEnabled) speakNotification(`Attention. You have ${unread.length} new notifications.`);
                unread.forEach((n: any) => spokenNotifsRef.current.add(n._id));
             }
             setNotifCount(json.data.length || 0);
          }
        }
      } catch (err) {
        console.error('Notification fetching failed:', err);
      }
    };

    fetchNotifs();
    const interval = setInterval(fetchNotifs, 4000); 
    return () => clearInterval(interval);
  }, [isAdmin, isAuthenticated, voiceEnabled]);

  const toggleVoice = () => {
    if (!voiceEnabled) {
      // satisfy browser gesture requirement
      const dummy = new SpeechSynthesisUtterance("Voice alerts enabled");
      dummy.volume = 0; // Silent first speak to unlock
      window.speechSynthesis.speak(dummy);
      setVoiceEnabled(true);
    } else {
      window.speechSynthesis.cancel();
      setVoiceEnabled(false);
      speechQueueRef.current = [];
    }
  };

  const fetchDropdownNotifs = async () => {
    try {
      if (isAdmin) {
        const res = await apiRequest('/admin-notifications');
        if (res.success) setNotifications(res.data || []);
      }
    } catch {}
  };

  const toggleDropdown = () => {
    if (!showDropdown) fetchDropdownNotifs();
    setShowDropdown(!showDropdown);
  };

  const markAllRead = async () => {
    try {
      await apiRequest('/admin-notifications/read-all', { method: 'PUT' });
      setNotifCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch {}
  };

  const markOneRead = async (id: string) => {
    try {
      await apiRequest(`/admin-notifications/${id}/read`, { method: 'PUT' });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setNotifCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'EMPLOYEE_CLOCK_IN': return '🟢';
      case 'EMPLOYEE_CLOCK_OUT': return '🔴';
      case 'CONSENT_FORM_DONE': return '📋';
      case 'SERVICE_STARTED': return '🔄';
      case 'SERVICE_FINISHED': return '✅';
      case 'PAYMENT_RECEIVED': return '💰';
      case 'APPOINTMENT_RESCHEDULED': return '📅';
      default: return '🔔';
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <header className={styles.navbar}>
       <div className="flex items-center gap-3">
          <button className="lg:hidden p-2 -ml-2 text-gray-900" onClick={onMenuClick}>
             <Menu className="w-6 h-6" />
          </button>
          <div className={styles.searchBar}>
             <Search size={18} color="var(--text-muted)" />
             <input 
               type="text" 
               placeholder="Search..." 
               className={styles.searchInput}
             />
          </div>
       </div>

       <div className={styles.rightNav}>
          {/* Voice Toggle Button */}
          <button 
            className={`${styles.navIcon} ${voiceEnabled ? styles.voiceActive : ''}`} 
            onClick={toggleVoice}
            title={voiceEnabled ? "Mute Voice Alerts" : "Enable Voice Alerts"}
          >
             {voiceEnabled ? <Volume2 size={20} color="var(--primary)" /> : <VolumeX size={20} />}
          </button>

          <button className={styles.navIcon} title="Toggle Dark/Light Mode">
             <Sun size={20} />
          </button>
          
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button 
              className={`${styles.navIcon} ${notifCount > 0 ? styles.bellActive : ''}`}
              title="Notification Center"
              onClick={toggleDropdown}
              style={{ position: 'relative' }}
            >
               {notifCount > 0 && (
                 <span className={styles.notifBadge}>
                   {notifCount > 9 ? '9+' : notifCount}
                 </span>
               )}
               <Bell size={20} className={notifCount > 0 ? styles.bellRing : ''} />
            </button>

            {showDropdown && isAdmin && (
              <div className={styles.notifDropdown}>
                <div className={styles.notifHeader}>
                  <h4 style={{ fontWeight: 900, fontSize: '0.95rem' }}>Notifications</h4>
                  {notifCount > 0 && (
                    <button 
                      onClick={markAllRead}
                      style={{ 
                        fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)',
                        display: 'flex', alignItems: 'center', gap: '4px'
                      }}
                    >
                      <CheckCheck size={14} /> Mark all read
                    </button>
                  )}
                </div>
                <div className={styles.notifList}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No notifications
                    </div>
                  ) : (
                    notifications.slice(0, 15).map(n => (
                      <div 
                        key={n._id} 
                        className={`${styles.notifItem} ${!n.isRead ? styles.notifUnread : ''}`}
                        onClick={() => markOneRead(n._id)}
                      >
                        <span className={styles.notifEmoji}>{getNotifIcon(n.type)}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p className={styles.notifTitle}>{n.title}</p>
                          <p className={styles.notifMessage}>{n.message}</p>
                          <p className={styles.notifTime}>
                            <Clock size={10} /> {formatTimeAgo(n.createdAt)}
                          </p>
                        </div>
                        {!n.isRead && <span className={styles.notifDot}></span>}
                      </div>
                    ))
                  )}
                </div>
                <div className={styles.notifFooter}>
                  <button 
                    onClick={() => { router.push('/notifications'); setShowDropdown(false); }}
                    style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)' }}
                  >
                    View All Notifications →
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className={styles.userSection}>
             <div className={styles.userInfo}>
                <p className={styles.userName}>{user?.name || 'System Admin'}</p>
                <p className={styles.userRole}>{user?.role || 'SUPER_ADMIN'}</p>
             </div>
             <div className={styles.avatar}>
                <User size={18} />
             </div>
          </div>

          <button className={styles.logoutBtn} onClick={logout} title="Sign Out">
             <LogOut size={20} />
          </button>
       </div>
    </header>
  );
}
