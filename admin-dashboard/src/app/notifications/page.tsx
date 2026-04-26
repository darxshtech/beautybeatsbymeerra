"use client";

import { useState, useEffect } from 'react';
import { Bell, Cake, AlertCircle, Send, MessageCircle, CalendarClock, Clock, Star, RefreshCw } from 'lucide-react';
import styles from '@/styles/layout/Dashboard.module.css';
import cardStyles from '@/styles/components/Card.module.css';
import Table from '@/components/Table';
import { apiRequest } from '@/services/api';

const TYPE_CONFIG: Record<string, { color: string; label: string }> = {
  SPECIAL_EVENT: { color: '#FF3B30', label: 'Send Discount' },
  REMINDER: { color: '#007AFF', label: 'Send Reminder' },
  FOLLOW_UP: { color: '#FF9500', label: 'Send Follow-up' },
  PAYMENT: { color: '#FF9500', label: 'Send Reminder' }
};

export default function Notifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState<string | null>(null);
  const [sendingAll, setSendingAll] = useState(false);
  
  const [activeTab, setActiveTab] = useState('SYSTEM');
  
  // WhatsApp Outbox State
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [historyType, setHistoryType] = useState('ALL');
  const [historyStatus, setHistoryStatus] = useState('ALL');

  // System Alerts State
  const [sysNotifs, setSysNotifs] = useState<any[]>([]);
  const [sysLoading, setSysLoading] = useState(false);
  const [sysFilter, setSysFilter] = useState('ALL');

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const json = await apiRequest('/notifications');
      if (json.success) setNotifications(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const json = await apiRequest(`/notifications/history?type=${historyType}&status=${historyStatus}`);
      if (json.success) setHistory(json.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSysNotifs = async () => {
    setSysLoading(true);
    try {
      const res = await apiRequest(`/admin-notifications?type=${sysFilter}&limit=1000`);
      if (res.success) setSysNotifs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setSysLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);
  useEffect(() => { if (showHistory && activeTab === 'WHATSAPP') fetchHistory(); }, [historyType, historyStatus, showHistory, activeTab]);
  useEffect(() => { if (activeTab === 'SYSTEM') fetchSysNotifs(); }, [activeTab, sysFilter]);

  const handleSendAll = async () => {
    if (!confirm('This will send ALL pending notifications via WhatsApp right now. Continue?')) return;
    setSendingAll(true);
    try {
      const res = await apiRequest('/notifications/send-all', { method: 'POST' });
      if (res.success) {
        alert('✅ ' + res.message);
        fetchNotifications();
        if (showHistory) fetchHistory();
      }
    } catch (err: any) {
      alert('❌ Failed: ' + (err.message || 'Error'));
    } finally {
      setSendingAll(false);
    }
  };

  const handleTrigger = async (note: any) => {
    setSending(note.id);
    try {
      const res = await apiRequest('/notifications/trigger', {
        method: 'POST',
        body: { type: note.type, metadata: note.metadata }
      });
      if (res.success) {
        alert(`✅ ${res.message}`);
        setNotifications(notifications.filter(n => n.id !== note.id));
      } else {
        alert(`❌ ${res.message || 'Failed to send'}`);
      }
    } catch (err: any) {
      alert(`❌ Failed: ${err.message || 'Network error'}`);
    } finally {
      setSending(null);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.sectionHeader} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h2 className={styles.title}>Notification Center</h2>
          <p className={styles.subtitle}>Manage system alerts and automated WhatsApp marketing.</p>
        </div>
        {activeTab === 'WHATSAPP' && (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button 
              onClick={() => { setShowHistory(!showHistory); if (!showHistory) fetchHistory(); }}
              style={{ 
                background: showHistory ? 'rgba(0,122,255,0.1)' : 'var(--bg-main)', border: '1px solid var(--border-light)',
                padding: '10px 20px', borderRadius: '12px', fontWeight: 700, fontSize: '13px',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                color: showHistory ? '#007AFF' : 'inherit'
              }}
            >
              <Clock size={16} /> {showHistory ? 'Hide History' : 'Send History'}
            </button>
            <button 
              onClick={fetchNotifications}
              style={{ 
                background: 'var(--bg-main)', border: '1px solid var(--border-light)',
                padding: '10px 20px', borderRadius: '12px', fontWeight: 700, fontSize: '13px',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
              }}
            >
              <RefreshCw size={16} /> Refresh
            </button>
            <button 
              onClick={handleSendAll}
              disabled={sendingAll || notifications.length === 0}
              style={{ 
                background: '#34C759', border: 'none', color: 'white',
                padding: '10px 20px', borderRadius: '12px', fontWeight: 700, fontSize: '13px',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                opacity: sendingAll || notifications.length === 0 ? 0.5 : 1
              }}
            >
              <Send size={16} /> {sendingAll ? 'Sending...' : 'Send All Now'}
            </button>
          </div>
        )}
      </header>

      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-light)', marginBottom: '2rem' }}>
        <button 
          onClick={() => setActiveTab('SYSTEM')}
          style={{ padding: '10px 20px', borderBottom: activeTab === 'SYSTEM' ? '2px solid var(--primary)' : 'none', fontWeight: 800, color: activeTab === 'SYSTEM' ? 'var(--primary)' : 'var(--text-muted)', background: 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none', cursor: 'pointer', fontSize: '14px' }}
        >System Alerts History</button>
        <button 
          onClick={() => setActiveTab('WHATSAPP')}
          style={{ padding: '10px 20px', borderBottom: activeTab === 'WHATSAPP' ? '2px solid var(--primary)' : 'none', fontWeight: 800, color: activeTab === 'WHATSAPP' ? 'var(--primary)' : 'var(--text-muted)', background: 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none', cursor: 'pointer', fontSize: '14px' }}
        >WhatsApp Messaging</button>
      </div>

      {activeTab === 'SYSTEM' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontWeight: 800, fontSize: '1.2rem' }}>Past System Notifications</h3>
            <select 
              value={sysFilter} 
              onChange={(e) => setSysFilter(e.target.value)}
              style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', fontWeight: 700, background: 'var(--bg-main)', color: 'var(--text-main)' }}
            >
              <option value="ALL">All Events</option>
              <option value="EMPLOYEE_CLOCK_IN">Clock Ins</option>
              <option value="EMPLOYEE_CLOCK_OUT">Clock Outs</option>
              <option value="SERVICE_FINISHED">Services Completed</option>
              <option value="PAYMENT_RECEIVED">Payments</option>
              <option value="APPOINTMENT_RESCHEDULED">Reschedules</option>
            </select>
          </div>
          
          {sysLoading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 700 }}>Loading history...</div>
          ) : sysNotifs.length === 0 ? (
            <div className={cardStyles.card} style={{ padding: '3rem', textAlign: 'center' }}>
              <p style={{ fontWeight: 700, color: 'var(--text-muted)' }}>No system notifications found for this filter.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {sysNotifs.map((n: any) => (
                <div key={n._id} className={cardStyles.card} style={{ 
                  padding: '16px 20px', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
                  borderLeft: `4px solid ${n.isRead ? 'var(--border-light)' : 'var(--primary)'}`
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '10px', fontWeight: 900, color: 'var(--primary)', background: 'rgba(255,59,48,0.1)', padding: '4px 8px', borderRadius: '6px' }}>
                        {n.type}
                      </span>
                      <span style={{ fontSize: '14px', fontWeight: 800 }}>{n.title}</span>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-main)', fontWeight: 500 }}>{n.message}</p>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                      {n.customer && <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>Customer: {n.customer.name}</span>}
                      {n.employee && <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>Staff: {n.employee.name}</span>}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>
                      {new Date(n.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'WHATSAPP' && (
        <>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className={cardStyles.card} style={{ padding: '3rem', textAlign: 'center' }}>
              <p style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '1.1rem' }}>✨ All clear! No pending notifications right now.</p>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Notifications will appear here when customers have birthdays, upcoming appointments, or treatment follow-ups are due.</p>
            </div>
          ) : (
            <Table 
              columns={[
                { key: 'type', label: 'Trigger Type', render: (val: any) => {
                  const config = TYPE_CONFIG[val.type] || { color: '#999', label: 'Send' };
                  return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ 
                        width: '32px', height: '32px', 
                        background: `${config.color}15`, color: config.color,
                        borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        {val.type === 'SPECIAL_EVENT' ? <Cake size={16} /> : 
                         val.type === 'REMINDER' ? <Clock size={16} /> : 
                         val.type === 'FOLLOW_UP' ? <Star size={16} /> :
                         <AlertCircle size={16} />}
                      </div>
                      <span style={{ fontWeight: 700, fontSize: '13px' }}>{val.title}</span>
                    </div>
                  );
                }},
                { key: 'customer', label: 'Target Customer', render: (val: any) => (
                  <div>
                    <p style={{ fontWeight: 800 }}>{val.customer}</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{val.phone}</p>
                  </div>
                )},
                { key: 'message', label: 'Notification' },
                { key: 'actions', label: 'Engagement', render: (val: any) => {
                  const config = TYPE_CONFIG[val.type] || { color: '#999', label: 'Send' };
                  return (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        className={styles.pageBtn} 
                        style={{ 
                          padding: '8px 16px', background: config.color, color: 'white',
                          display: 'flex', alignItems: 'center', gap: '6px',
                          borderRadius: '8px', fontSize: '12px', fontWeight: 700, border: 'none', cursor: 'pointer',
                          opacity: sending === val.id ? 0.5 : 1
                        }}
                        disabled={sending === val.id}
                        onClick={() => handleTrigger(val)}
                      >
                        <Send size={14} />
                        <span>{sending === val.id ? 'Sending...' : config.label}</span>
                      </button>
                    </div>
                  );
                }}
              ]}
              data={notifications}
            />
          )}

          <div className={styles.kpiGrid} style={{ marginTop: '2rem' }}>
             <div className={cardStyles.card} style={{ gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                   <div className={cardStyles.icon} style={{ background: 'rgba(52, 199, 89, 0.1)', color: '#34C759' }}>
                      <MessageCircle size={20} />
                   </div>
                   <div>
                      <h4 style={{ fontWeight: 800 }}>WhatsApp Integration</h4>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Connected & Active</p>
                   </div>
                </div>
             </div>
             <div className={cardStyles.card} style={{ gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                   <div className={cardStyles.icon} style={{ background: 'rgba(0, 122, 255, 0.1)', color: '#007AFF' }}>
                      <CalendarClock size={20} />
                   </div>
                   <div>
                      <h4 style={{ fontWeight: 800 }}>Auto-Send: Daily 9:00 AM</h4>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Notifications auto-fire each morning. No manual action needed.</p>
                   </div>
                </div>
             </div>
          </div>

          {/* Send History */}
          {showHistory && (
            <div style={{ marginTop: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontWeight: 800, fontSize: '1.1rem' }}>📋 Full Send History</h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <select 
                    value={historyType} 
                    onChange={(e) => setHistoryType(e.target.value)}
                    style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '12px', fontWeight: 700, background: 'var(--bg-main)', color: 'var(--text-main)' }}
                  >
                    <option value="ALL">All Types</option>
                    <option value="REMINDER">Reminders</option>
                    <option value="SPECIAL_EVENT">Events</option>
                    <option value="FOLLOW_UP">Follow-ups</option>
                  </select>
                  <select 
                    value={historyStatus} 
                    onChange={(e) => setHistoryStatus(e.target.value)}
                    style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '12px', fontWeight: 700, background: 'var(--bg-main)', color: 'var(--text-main)' }}
                  >
                    <option value="ALL">All Status</option>
                    <option value="SENT">Sent</option>
                    <option value="FAILED">Failed</option>
                  </select>
                </div>
              </div>
              {history.length === 0 ? (
                <div className={cardStyles.card} style={{ padding: '2rem', textAlign: 'center' }}>
                  <p style={{ color: 'var(--text-muted)', fontWeight: 700 }}>No notifications sent yet.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {history.map((h: any, i: number) => (
                    <div key={i} className={cardStyles.card} style={{ 
                      padding: '12px 20px', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                      borderLeft: `3px solid ${h.status === 'SENT' ? '#34C759' : '#FF3B30'}`
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ 
                          fontSize: '12px', fontWeight: 900, 
                          color: h.status === 'SENT' ? '#34C759' : '#FF3B30'
                        }}>{h.status}</span>
                        <span style={{ fontSize: '12px', fontWeight: 700 }}>{h.type}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>→ {h.recipient || 'N/A'}</span>
                      </div>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                        {new Date(h.sentAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
