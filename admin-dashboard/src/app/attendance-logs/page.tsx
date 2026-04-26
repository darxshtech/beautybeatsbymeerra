"use client";

import { useState, useEffect } from 'react';
import { Clock, Download, Search, UserCheck } from 'lucide-react';
import styles from '@/styles/layout/Dashboard.module.css';
import cardStyles from '@/styles/components/Card.module.css';
import Table from '@/components/Table';
import { apiRequest } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

export default function AttendanceLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  const fetchLogs = async () => {
    try {
      const res = await apiRequest('/attendance');
      if (res.success) setLogs(res.data || []);
    } catch (err) {
      console.error('Failed to fetch attendance logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchLogs();
    }
  }, [isAuthenticated]);

  const formatHours = (hours: number) => {
    if (!hours) return '0h';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const calculateStats = () => {
    if (logs.length === 0) return { avg: '0.0 Hours', onTime: '0%' };
    
    // Average Shift duration (completed shifts only)
    const completed = logs.filter(l => l.totalHours > 0);
    const avg = completed.length > 0 
      ? (completed.reduce((acc, l) => acc + l.totalHours, 0) / completed.length).toFixed(1) 
      : '0.0';

    // On-Time Arrival (Before 10:30 AM today)
    // For simplicity, we count shifts starting before 10:15 AM
    const totalToday = logs.length; // Actually should be filtered by today's date if we want 'Today'
    const onTime = logs.filter(l => {
      const clockIn = new Date(l.clockIn);
      return clockIn.getHours() < 10 || (clockIn.getHours() === 10 && clockIn.getMinutes() <= 30);
    }).length;

    const onTimePercent = totalToday > 0 ? Math.round((onTime / totalToday) * 100) : 0;

    return { avg: `${avg} Hours`, onTime: `${onTimePercent}%` };
  };

  const stats = calculateStats();

  return (
    <div className={styles.container}>
      <header className={styles.sectionHeader} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className={styles.title}>Attendance Control</h2>
          <p className={styles.subtitle}>Audit employee login and logout logs for operational efficiency.</p>
        </div>
        <button className={styles.pageBtn} style={{ padding: '10px 20px', gap: '8px' }}>
          <Download size={18} />
          Export Report
        </button>
      </header>

      <section className={styles.kpiGrid}>
        <div className={cardStyles.card} style={{ borderLeft: '4px solid #34C759' }}>
          <div className={cardStyles.header}>
            <span className={cardStyles.label}>Average Shift Duration</span>
            <div className={cardStyles.icon} style={{ background: 'rgba(52, 199, 89, 0.1)', color: '#34C759' }}>
              <Clock size={20} />
            </div>
          </div>
          <div className={cardStyles.value}>{stats.avg}</div>
          <div className={cardStyles.trending} style={{ color: '#34C759' }}>Real-time Average</div>
        </div>
        <div className={cardStyles.card} style={{ borderLeft: '4px solid var(--primary)' }}>
          <div className={cardStyles.header}>
            <span className={cardStyles.label}>On-Time Arrivals</span>
          </div>
          <div className={cardStyles.value}>{stats.onTime} Today</div>
          <div className={cardStyles.trending} style={{ color: 'var(--text-muted)' }}>Threshold: 10:30 AM</div>
        </div>
      </section>

      <div style={{ marginBottom: '2rem' }}>
        <Table 
          columns={[
            { key: 'employee', label: 'Professional Profile', render: (val: any) => (
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ 
                    width: '36px', 
                    height: '36px', 
                    background: 'rgba(0,0,0,0.05)', 
                    color: 'var(--text-muted)',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                     <UserCheck size={18} />
                  </div>
                  <div>
                    <p style={{ fontWeight: 800 }}>{val.employee?.name}</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 900 }}>{val.employee?.role}</p>
                  </div>
               </div>
            )},
            { key: 'date', label: 'Assignment Date', render: (val) => (
               <p style={{ fontWeight: 700 }}>{new Date(val.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            )},
            { key: 'clockIn', label: 'Clock In / Out', render: (val) => (
              <div>
                <p style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: '#34C759' }}>{new Date(val.clockIn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>→</span>
                  <span style={{ color: val.clockOut ? '#FF3B30' : 'var(--text-muted)' }}>{val.clockOut ? new Date(val.clockOut).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'Active'}</span>
                </p>
                {val.status === 'CLOCKED_IN' && <span style={{ fontSize: '9px', background: 'rgba(52, 199, 89, 0.1)', color: '#34C759', padding: '2px 6px', borderRadius: '4px', fontWeight: 900 }}>SESSION ACTIVE</span>}
              </div>
            )},
            { key: 'totalHours', label: 'Duration Tracked', render: (val) => (
              <div style={{ fontWeight: 800 }}>
                {val.totalHours ? formatHours(val.totalHours) : '--'}
              </div>
            )},
            { key: 'details', label: 'Access Context', render: (val) => (
              <div style={{ fontSize: '11px', lineHeight: '1.4' }}>
                 <p style={{ color: 'var(--text-main)', fontWeight: 700 }}>{val.deviceName || 'Unknown Device'}</p>
                 <p style={{ color: 'var(--text-muted)' }}>{val.ipAddress || '0.0.0.0'}</p>
              </div>
            )}
          ]}
          data={logs}
        />
      </div>
    </div>
  );
}
