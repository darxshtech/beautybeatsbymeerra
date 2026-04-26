"use client";

import { useEffect, useState } from 'react';
import { 
  Users, 
  CalendarCheck, 
  IndianRupee, 
  TrendingUp, 
  Cake, 
  AlertCircle,
  Bell
} from 'lucide-react';
import styles from '@/styles/layout/Dashboard.module.css';
import cardStyles from '@/styles/components/Card.module.css';
import Table from '@/components/Table';
import { apiRequest } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const json = await apiRequest('/dashboard/stats');
      setData(json.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated]);

  const stats = data?.kpis;
  const upcomingAppointments = data?.upcomingAppointments || [];
  const notifications = data?.notifications || [];

  const kpis = [
    { 
      label: 'Total Revenue', 
      value: stats ? `₹${stats.totalRevenue.toLocaleString()}` : '₹0', 
      icon: IndianRupee,
      trend: '+12.5%' 
    },
    { 
      label: 'Appointments Today', 
      value: stats?.appointmentsToday?.toString() || '0', 
      icon: CalendarCheck,
      trend: '+4.3%' 
    },
    { 
      label: 'Active Customers', 
      value: stats?.activeCustomers?.toString() || '0', 
      icon: Users,
      trend: '+8.1%' 
    },
  ];

  const handleActionClick = async (notification: any) => {
    try {
      const res = await apiRequest('/notifications/trigger', {
        method: 'POST',
        body: { type: notification.type, metadata: notification.metadata || notification }
      });
      if (res.success) {
        alert(res.message);
        fetchDashboardData();
      }
    } catch (err) {
      alert('Action failed');
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.sectionHeader}>
        <h2 className={styles.title}>Control Center</h2>
        <p className={styles.subtitle}>Welcome back, BeautyBeats Admin. Here is your platform overview.</p>
      </header>

      <section className={styles.kpiGrid}>
        {kpis.map((kpi, i) => (
          <div key={i} className={cardStyles.card}>
            <div className={cardStyles.header}>
              <span className={cardStyles.label}>{kpi.label}</span>
              <div className={cardStyles.icon}>
                 <kpi.icon size={22} />
              </div>
            </div>
            <div className={cardStyles.value}>{loading ? '...' : kpi.value}</div>
            <div className={cardStyles.trending}>
               <TrendingUp size={14} />
               <span>{kpi.trend} from last month</span>
            </div>
          </div>
        ))}
      </section>

      <section className={styles.chartsGrid}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <header className={styles.sectionHeader} style={{ marginBottom: '0.5rem' }}>
             <h3 className={styles.subtitle} style={{ fontWeight: 700, fontSize: '1.1rem' }}>Upcoming Schedule</h3>
          </header>
          {upcomingAppointments.length > 0 ? (
            <Table 
               columns={[
                 { key: 'customer', label: 'Customer' },
                 { key: 'service', label: 'Service' },
                 { key: 'time', label: 'Time' },
                 { key: 'status', label: 'Status', render: (val) => (
                   <span style={{ 
                     background: val.statusRaw === 'COMPLETED' ? 'rgba(52, 199, 89, 0.1)' : 'rgba(255, 149, 0, 0.1)',
                     color: val.statusRaw === 'COMPLETED' ? '#34C759' : '#FF9500',
                     padding: '4px 12px',
                     borderRadius: '12px',
                     fontSize: '12px',
                     fontWeight: 700
                   }}>{val.status}</span>
                 )}
               ]}
               data={upcomingAppointments}
            />
          ) : (
            <div className={cardStyles.card} style={{ padding: '2rem', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)' }}>No upcoming appointments today.</p>
            </div>
          )}
        </div>

        <div className={cardStyles.card} style={{ gap: '1rem', height: 'fit-content' }}>
           <header style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className={cardStyles.icon} style={{ background: 'rgba(255, 59, 48, 0.1)', color: '#FF3B30' }}>
                 <Bell size={20} />
              </div>
              <h3 className={styles.subtitle} style={{ color: 'var(--text-main)', fontWeight: 700 }}>Action Required</h3>
           </header>
           
           <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {notifications.length > 0 ? (
                notifications.map((note: any, idx: number) => (
                  <div 
                    key={idx} 
                    onClick={() => handleActionClick(note)}
                    style={{ 
                      borderLeft: `4px solid ${note.type === 'BIRTHDAY' ? '#FF3B30' : '#FF9500'}`, 
                      padding: '12px 16px', 
                      background: 'var(--bg-main)', 
                      borderRadius: '0 8px 8px 0',
                      cursor: 'pointer',
                      transition: 'transform 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(4px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '4px' }}>
                       {note.type === 'BIRTHDAY' ? <Cake size={16} color="#FF3B30" /> : <AlertCircle size={16} color="#FF9500" />}
                       <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{note.title}</span>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-main)', fontWeight: 500 }}>{note.message}</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', fontStyle: 'italic' }}>Click to take action</p>
                  </div>
                ))
              ) : (
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>All sorted! No pending actions.</p>
              )}
           </div>
        </div>
      </section>
    </div>
  );
}
