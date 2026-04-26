"use client";

import { useState, useEffect, useRef } from 'react';
import { Search, User, Bell, LogOut, Moon, Sun, Clock, Check, CheckCheck } from 'lucide-react';
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

export default function Navbar() {
  const { user, logout, isAdmin, isAuthenticated } = useAuth();
  const router = useRouter();
  const [notifCount, setNotifCount] = useState(0);
  const [notifications, setNotifications] = useState<AdminNotif[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const lastSpokenRef = useRef<string>('');

  // Speaking Notification Bot using Web SpeechSynthesis API
  const speakNotification = (text: string) => {
    if (!text || text === lastSpokenRef.current) return;
    lastSpokenRef.current = text;
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // stop any ongoing speech
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        utterance.pitch = 1.1;
        utterance.volume = 1;
        // Try to pick a female English voice
        const voices = window.speechSynthesis.getVoices();
        const preferred = voices.find(v => v.name.includes('Female') || v.name.includes('Zira') || v.name.includes('Google UK English Female'));
        if (preferred) utterance.voice = preferred;
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      console.log('Speech not available:', e);
    }
  };

  // Fetch admin notifications (real-time speaking bot)
  useEffect(() => {
    // Ensure voices are loaded
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }

    const fetchNotifs = async () => {
      if (!isAuthenticated) return;
      try {
        if (isAdmin) {
          const countRes = await apiRequest('/admin-notifications/count');
          if (countRes.success) {
             if (countRes.count > notifCount && notifCount > 0) {
               // Fetch latest notification to speak it
               try {
                 const latest = await apiRequest('/admin-notifications?limit=1');
                 if (latest.success && latest.data?.[0]) {
                   const n = latest.data[0];
                   speakNotification(`New alert. ${n.title}. ${n.message}`);
                 }
               } catch {}
             }
             setNotifCount(countRes.count);
          }
        } else {
          const json = await apiRequest('/notifications');
          if (json.success && json.data?.length > notifCount && notifCount > 0) {
            speakNotification('You have new notifications waiting.');
          }
          if (json.success) setNotifCount(json.data?.length || 0);
        }
      } catch {}
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 10000); // Check every 10 seconds for real-time feel
    return () => clearInterval(interval);
  }, [isAdmin, isAuthenticated, notifCount]);

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

  // Close dropdown when clicking outside
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
       <div className={styles.searchBar}>
          <Search size={18} color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder="Search platform data..." 
            className={styles.searchInput}
          />
       </div>

       <div className={styles.rightNav}>
          <button className={styles.navIcon} title="Toggle Dark/Light Mode">
             <Sun size={20} />
          </button>
          
          {/* Notification Bell with Dropdown */}
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

            {/* Notification Dropdown */}
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
