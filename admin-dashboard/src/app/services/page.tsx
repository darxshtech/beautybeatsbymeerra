"use client";

import { useState, useEffect } from 'react';
import { Scissors, Plus, Settings, TrendingUp, Filter, Search, Trash2 } from 'lucide-react';
import styles from '@/styles/layout/Dashboard.module.css';
import cardStyles from '@/styles/components/Card.module.css';
import Table from '@/components/Table';
import Modal from '@/components/Modal';
import { apiRequest } from '@/services/api';

export default function Services() {
  const [services, setServices] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Haircut',
    price: '',
    duration: '',
    description: '',
    followUpDays: 0
  });

  const [search, setSearch] = useState("");

  const fetchServices = async () => {
    try {
      const json = await apiRequest(`/services?search=${search}`);
      if (json.success) setServices(json.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [search]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    try {
      const res = await apiRequest(`/services/${id}`, { method: 'DELETE' });
      if (res.success) fetchServices();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiRequest('/services', {
        method: 'POST',
        body: formData
      });
      if (res.success) {
        setIsModalOpen(false);
        setFormData({ name: '', category: 'Haircut', price: '', duration: '', description: '', followUpDays: 0 });
        fetchServices();
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Action failed');
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.sectionHeader} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
           <h2 className={styles.title}>Service Repository</h2>
           <p className={styles.subtitle}>Configure your salon's service menu, dynamic pricing, and bundled packages.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
           <button 
             onClick={() => setIsModalOpen(true)}
             style={{ 
               background: 'var(--primary)', 
               color: 'white', 
               padding: '12px 24px', 
               borderRadius: '16px', 
               fontWeight: 800,
               border: 'none',
               cursor: 'pointer',
               display: 'flex',
               alignItems: 'center',
               gap: '8px'
            }}>
               <Scissors size={20} />
               <span>Catalog New Service</span>
            </button>
        </div>
      </header>

      <div className={cardStyles.card} style={{ flexDirection: 'row', padding: '12px 20px', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
         <Search size={20} color="var(--text-muted)" />
         <input 
            type="text" 
            placeholder="Search services..."
            style={{ border: 'none', background: 'transparent', outline: 'none', flex: 1, fontSize: '15px', color: 'var(--text-main)', fontWeight: 600 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
         />
      </div>

      <Table 
        columns={[
          { key: 'name', label: 'Item Description', render: (val) => (
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ 
                  width: '36px', 
                  height: '36px', 
                  background: 'rgba(255, 59, 48, 0.08)', 
                  color: 'var(--primary)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                   {val.category === 'Package' ? <TrendingUp size={18} /> : <Scissors size={18} />}
                </div>
                <div>
                   <p style={{ fontWeight: 800, fontSize: '15px' }}>{val.name}</p>
                   <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{val.category}</p>
                </div>
             </div>
          )},
          { key: 'duration', label: 'Duration Allocation', render: (val) => (
             <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>{val.duration} Mins</span>
          )},
          { key: 'price', label: 'Commercial Value', render: (val) => (
             <span style={{ fontWeight: 900, fontSize: '1.25rem' }}>₹{val.price}</span>
          )},
          { key: 'isActive', label: 'Market Availability', render: (val) => (
             <span style={{ 
               background: val.isActive ? 'rgba(52, 199, 89, 0.1)' : 'rgba(255, 149, 0, 0.1)',
               color: val.isActive ? '#34C759' : '#FF9500',
               padding: '4px 12px',
               borderRadius: '12px',
               fontSize: '12px',
               fontWeight: 800,
               textTransform: 'uppercase'
             }}>{val.isActive ? 'In-Market' : 'Suspended'}</span>
          )},
          { key: 'actions', label: 'Configuration', render: (val) => (
             <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className={styles.pageBtn} style={{ padding: '6px' }} title="Modify Pricing">
                   <Settings size={18} />
                </button>
                <button 
                  className={styles.pageBtn} 
                  style={{ padding: '6px', color: 'var(--primary)' }} 
                  title="Delete Service"
                  onClick={() => handleDelete(val._id)}
                >
                   <Trash2 size={18} />
                </button>
             </div>
          )}
        ]}
        data={services}
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Catalog New Service">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Service Name</label>
            <input 
              required
              className={styles.input}
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. Classic Haircut"
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flexFlow: 'row' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
              <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Price (₹)</label>
              <input 
                type="number"
                required
                className={styles.input}
                value={formData.price}
                onChange={e => setFormData({...formData, price: e.target.value})}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
              <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Duration (mins)</label>
              <input 
                type="number"
                required
                className={styles.input}
                value={formData.duration}
                onChange={e => setFormData({...formData, duration: e.target.value})}
              />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Category</label>
            <select 
              className={styles.input}
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value})}
            >
              <option value="Haircut">Haircut</option>
              <option value="Hair Color">Hair Color</option>
              <option value="Facial">Facial</option>
              <option value="Massage">Massage</option>
              <option value="Pedicure">Pedicure</option>
              <option value="Manicure">Manicure</option>
              <option value="Package">Package</option>
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Description</label>
            <textarea 
              className={styles.input}
              style={{ minHeight: '80px', paddingTop: '8px' }}
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Follow-Up Gap (days)</label>
            <input 
              type="number"
              className={styles.input}
              value={formData.followUpDays}
              onChange={e => setFormData({...formData, followUpDays: parseInt(e.target.value) || 0})}
              placeholder="0 = No follow-up, e.g. 14 for Facial"
              min={0}
            />
            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Set to 0 for no follow-up. System auto-sends reminder this many days after treatment completion.</p>
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
            Catalog Service
          </button>
        </form>
      </Modal>
    </div>
  );
}
