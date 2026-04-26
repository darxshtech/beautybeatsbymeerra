"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Printer, 
  FileText,
  Calendar
} from 'lucide-react';
import layoutStyles from '@/styles/layout/Dashboard.module.css';
import reportStyles from '@/styles/layout/Reports.module.css';
import cardStyles from '@/styles/components/Card.module.css';
import { apiRequest } from '@/services/api';

export default function ReportsPage() {
  const [topServices, setTopServices] = useState<any[]>([]);
  const [revenue, setRevenue] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('month');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [servicesRes, revenueRes] = await Promise.all([
        apiRequest('/reports/top-services'),
        apiRequest(`/reports/revenue?filter=${filter}`)
      ]);
      if (servicesRes.success) setTopServices(servicesRes.data);
      if (revenueRes.success) setRevenue(revenueRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [filter]);

  const filters = [
    { key: 'today', label: 'Today' },
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
    { key: 'all', label: 'All Time' }
  ];

  const exportData = (type: 'csv' | 'pdf') => {
    if (type === 'pdf') {
      window.print();
    } else {
      let csv = 'Metric,Value\n';
      csv += `Revenue,${revenue?.revenue || 0}\n`;
      csv += `Expenses,${revenue?.expenses || 0}\n`;
      csv += `Net Profit,${revenue?.profit || 0}\n`;
      csv += `Appointments,${revenue?.appointments || 0}\n\n`;
      csv += 'Top Services\nName,Bookings,Revenue\n';
      topServices.forEach(s => {
        csv += `${s.name},${s.count},${s.revenue}\n`;
      });
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Business_Report_${filter}.csv`;
      a.click();
    }
  };

  if (loading) return <div className={layoutStyles.container}>Loading analysis...</div>;

  return (
    <div className={layoutStyles.container}>
      <header className={layoutStyles.sectionHeader} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 className={layoutStyles.title}>Business Intelligence</h2>
          <p className={layoutStyles.subtitle}>Deep dive into your salon's performance metrics.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {filters.map(f => (
            <button 
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                padding: '8px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: 700,
                border: filter === f.key ? 'none' : '1px solid var(--border-light)',
                background: filter === f.key ? 'var(--primary)' : 'transparent',
                color: filter === f.key ? 'white' : 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              {f.label}
            </button>
          ))}
          <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem', borderLeft: '1px solid var(--border-light)', paddingLeft: '1rem' }}>
            <button onClick={() => exportData('pdf')} style={{ background: 'var(--bg-sidebar)', border: '1px solid var(--border-light)', padding: '8px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)', fontWeight: 700, fontSize: '12px' }}>
              <Printer size={16} /> PDF
            </button>
            <button onClick={() => exportData('csv')} style={{ background: 'var(--bg-sidebar)', border: '1px solid var(--border-light)', padding: '8px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)', fontWeight: 700, fontSize: '12px' }}>
              <FileText size={16} /> Excel (CSV)
            </button>
          </div>
        </div>
      </header>

      {/* Revenue KPIs */}
      <section className={layoutStyles.kpiGrid} style={{ marginBottom: '2rem' }}>
        <div className={cardStyles.card}>
          <div className={cardStyles.header}>
            <span className={cardStyles.label}>Revenue</span>
            <div className={cardStyles.icon} style={{ background: 'rgba(52, 199, 89, 0.1)', color: '#34C759' }}>
              <ArrowUpRight size={20} />
            </div>
          </div>
          <div className={cardStyles.value}>₹{revenue?.revenue?.toLocaleString() || 0}</div>
          <div className={cardStyles.trending}>
            <Calendar size={14} />
            <span>{revenue?.invoiceCount || 0} invoices ({revenue?.filter})</span>
          </div>
        </div>
        <div className={cardStyles.card}>
          <div className={cardStyles.header}>
            <span className={cardStyles.label}>Expenses</span>
            <div className={cardStyles.icon} style={{ background: 'rgba(255, 59, 48, 0.1)', color: '#FF3B30' }}>
              <ArrowDownRight size={20} />
            </div>
          </div>
          <div className={cardStyles.value}>₹{revenue?.expenses?.toLocaleString() || 0}</div>
        </div>
        <div className={cardStyles.card}>
          <div className={cardStyles.header}>
            <span className={cardStyles.label}>Net Profit</span>
            <div className={cardStyles.icon} style={{ background: 'rgba(0, 122, 255, 0.1)', color: '#007AFF' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div className={cardStyles.value} style={{ color: (revenue?.profit || 0) >= 0 ? '#34C759' : '#FF3B30' }}>
            ₹{revenue?.profit?.toLocaleString() || 0}
          </div>
        </div>
      </section>

      {/* Top Services */}
      <section className={reportStyles.statsGrid}>
        <div className={cardStyles.card}>
           <h3 className={reportStyles.chartTitle} style={{ marginBottom: '1.5rem', fontSize: '1.125rem' }}>Top Performing Services</h3>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {topServices.length > 0 ? topServices.map((s, index) => (
              <div key={index} className={reportStyles.serviceItem}>
                <div className={reportStyles.serviceInfo}>
                  <span className={reportStyles.serviceName}>{s.name}</span>
                  <span className={reportStyles.serviceShare}>{s.count} bookings • ₹{s.revenue?.toLocaleString() || 0}</span>
                </div>
                <div className={reportStyles.progressBar}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(s.count / (topServices[0]?.count || 1)) * 100}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    className={reportStyles.progressFill} 
                    style={{ background: 'var(--primary)' }} 
                  />
                </div>
              </div>
            )) : <p style={{ color: 'var(--text-muted)' }}>No booking data yet. Services will appear here once appointments are made.</p>}
          </div>
        </div>

        <div className={cardStyles.card}>
          <h3 className={reportStyles.chartTitle} style={{ marginBottom: '1.5rem', fontSize: '1.125rem' }}>Period Summary</h3>
          <div className={reportStyles.metricsGrid}>
            <div className={reportStyles.metricCard}>
               <TrendingUp size={18} color="#34C759" />
               <p className={reportStyles.metricLabel}>Appointments</p>
               <h4 className={reportStyles.metricValue}>{revenue?.appointments || 0}</h4>
            </div>
            <div className={reportStyles.metricCard}>
               <ArrowUpRight size={18} color="#34C759" />
               <p className={reportStyles.metricLabel}>Avg Ticket</p>
               <h4 className={reportStyles.metricValue}>₹{revenue?.invoiceCount > 0 ? Math.round(revenue.revenue / revenue.invoiceCount) : 0}</h4>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
