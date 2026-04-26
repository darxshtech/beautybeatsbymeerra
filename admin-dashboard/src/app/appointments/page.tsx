"use client";

import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Scissors, CheckCircle, XCircle, Search } from 'lucide-react';
import styles from '@/styles/layout/Dashboard.module.css';
import cardStyles from '@/styles/components/Card.module.css';
import { apiRequest } from '@/services/api';
import Table from '@/components/Table';
import Modal from '@/components/Modal';

export default function Appointments() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    customerId: '',
    serviceId: '',
    appointmentDate: '',
    timeSlot: '',
    notes: ''
  });

  const fetchData = async () => {
    try {
      const [appts, custs, servs] = await Promise.all([
        apiRequest(`/appointments?search=${search}`),
        apiRequest('/users/customers?limit=100'),
        apiRequest('/services?limit=100')
      ]);
      if (appts.success) setAppointments(appts.data);
      if (custs.success) setCustomers(custs.data);
      if (servs.success) setServices(servs.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search]);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const res = await apiRequest(`/appointments/${id}`, {
        method: 'PUT',
        body: { status }
      });
      if (res.success) fetchData();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiRequest('/appointments', {
        method: 'POST',
        body: {
          customerId: formData.customerId,
          service: formData.serviceId,
          appointmentDate: formData.appointmentDate,
          timeSlot: formData.timeSlot,
          notes: formData.notes
        }
      });
      if (res.success) {
        setIsModalOpen(false);
        fetchData();
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Scheduling failed');
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.sectionHeader} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
           <h2 className={styles.title}>Session Control</h2>
           <p className={styles.subtitle}>Track and manage individual appointments for your salon's daily operations.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
           <button style={{ 
              background: 'var(--bg-sidebar)', 
              color: 'var(--text-main)', 
              border: '1px solid var(--border-light)',
              padding: '12px 24px', 
              borderRadius: '16px', 
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer'
           }}>
              <Calendar size={20} />
              <span>Full Calendar</span>
           </button>
           <button 
             onClick={() => setIsModalOpen(true)}
             style={{ 
               background: 'var(--primary)', 
               color: 'white', 
               padding: '12px 24px', 
               borderRadius: '16px', 
               fontWeight: 800,
               border: 'none',
               cursor: 'pointer'
             }}
           >
              Schedule Session
           </button>
        </div>
      </header>

      <div className={cardStyles.card} style={{ flexDirection: 'row', padding: '12px 20px', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
         <Search size={20} color="var(--text-muted)" />
         <input 
            type="text" 
            placeholder="Search by customer name or service..."
            style={{ border: 'none', background: 'transparent', outline: 'none', flex: 1, fontSize: '15px', color: 'var(--text-main)', fontWeight: 600 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
         />
      </div>

      <Table 
        columns={[
          { key: 'appointmentDate', label: 'Date', render: (val) => (
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ 
                  width: '36px', 
                  height: '36px', 
                  background: 'rgba(255, 59, 48, 0.08)', 
                  color: 'var(--primary)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '13px'
                }}>
                   <Calendar size={18} />
                </div>
                <div>
                   <p style={{ fontWeight: 800 }}>{new Date(val.appointmentDate).toLocaleDateString()}</p>
                   <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{val.timeSlot}</p>
                </div>
             </div>
          )},
          { key: 'customer', label: 'Customer', render: (val) => (
             <span style={{ fontWeight: 700 }}>{val.customer?.name || 'Guest'}</span>
          )},
          { key: 'service', label: 'Service', render: (val) => (
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Scissors size={14} color="var(--text-muted)" />
                <span style={{ fontWeight: 600 }}>{val.service?.name}</span>
             </div>
          )},
          { key: 'staff', label: 'Assigned To', render: (val) => (
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <User size={14} color="var(--text-muted)" />
                <span style={{ fontWeight: 600 }}>{val.staff?.name || 'TBA'}</span>
             </div>
          )},
          { key: 'status', label: 'Status', render: (val) => {
             const statusColors: any = {
               'COMPLETED': { bg: 'rgba(52, 199, 89, 0.1)', color: '#34C759' },
               'IN_PROGRESS': { bg: 'rgba(0, 122, 255, 0.1)', color: '#007AFF' },
               'IN-PROGRESS': { bg: 'rgba(0, 122, 255, 0.1)', color: '#007AFF' },
               'CANCELLED': { bg: 'rgba(255, 59, 48, 0.1)', color: '#FF3B30' },
               'PENDING': { bg: 'rgba(255, 149, 0, 0.1)', color: '#FF9500' }
             };
             const style = statusColors[val.status] || { bg: 'rgba(142, 142, 147, 0.1)', color: '#8E8E93' };
             return (
              <span style={{ 
                background: style.bg,
                color: style.color,
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 800,
                textTransform: 'uppercase'
              }}>{val.status}</span>
             );
          }},
          { key: 'actions', label: 'Actions', render: (val) => (
             <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  className={styles.pageBtn} 
                  style={{ padding: '6px' }} 
                  title="Mark as In-Progress"
                  onClick={() => handleStatusChange(val._id, 'IN_PROGRESS')}
                >
                   <Clock size={18} />
                </button>
                <button 
                  className={styles.pageBtn} 
                  style={{ padding: '6px', color: '#34C759' }}
                  title="Mark Completed"
                  onClick={() => handleStatusChange(val._id, 'COMPLETED')}
                >
                   <CheckCircle size={18} />
                </button>
                <button 
                  className={styles.pageBtn} 
                  style={{ padding: '6px', color: 'var(--primary)' }}
                  title="Cancel Session"
                  onClick={() => handleStatusChange(val._id, 'CANCELLED')}
                >
                   <XCircle size={18} />
                </button>
             </div>
          )}
        ]}
        data={appointments}
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Schedule New Session">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Select Customer</label>
            <select 
              required
              className={styles.input}
              value={formData.customerId}
              onChange={e => setFormData({...formData, customerId: e.target.value})}
            >
              <option value="">Choose Customer...</option>
              {customers.map(c => <option key={c._id} value={c._id}>{c.name} - {c.phone}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Select Service</label>
            <select 
              required
              className={styles.input}
              value={formData.serviceId}
              onChange={e => setFormData({...formData, serviceId: e.target.value})}
            >
              <option value="">Choose Service...</option>
              {services.map(s => <option key={s._id} value={s._id}>{s.name} (₹{s.price})</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flexFlow: 'row' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
              <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Date</label>
              <input 
                type="date"
                required
                className={styles.input}
                value={formData.appointmentDate}
                onChange={e => setFormData({...formData, appointmentDate: e.target.value})}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
              <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Time Slot</label>
              <input 
                type="text"
                required
                className={styles.input}
                placeholder="e.g. 10:00 AM"
                value={formData.timeSlot}
                onChange={e => setFormData({...formData, timeSlot: e.target.value})}
              />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Notes</label>
            <textarea 
              className={styles.input}
              style={{ minHeight: '60px', resize: 'vertical' }}
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
              placeholder="Any special requests?"
            />
          </div>
          <button 
            type="submit"
            style={{ 
              background: 'var(--primary)', 
              color: 'white', 
              padding: '12px', 
              borderRadius: '12px', 
              fontWeight: 700,
              border: 'none',
              marginTop: '1rem',
              cursor: 'pointer'
            }}
          >
            Confirm Booking
          </button>
        </form>
      </Modal>
    </div>
  );
}
