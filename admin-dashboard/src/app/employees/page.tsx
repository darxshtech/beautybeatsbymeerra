"use client";

import { useState, useEffect } from 'react';
import { UserCheck, Plus, TrendingUp, Trash2, Search, CalendarOff, CalendarCheck, Pencil } from 'lucide-react';
import styles from '@/styles/layout/Dashboard.module.css';
import cardStyles from '@/styles/components/Card.module.css';
import Table from '@/components/Table';
import Modal from '@/components/Modal';
import { apiRequest } from '@/services/api';

// Admin-level personnel control and management dashboard
export default function Employees() {
  const [staff, setStaff] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'STAFF',
    specialization: [] as string[],
    password: ''
  });

  const fetchStaff = async () => {
    try {
      const json = await apiRequest('/users/staff?includeOff=true');
      if (json.success) setStaff(json.data);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleLeave = async (id: string, currentStatus: boolean) => {
    try {
      const res = await apiRequest(`/users/customers/${id}`, {
        method: 'PUT',
        body: { isOff: !currentStatus }
      });
      if (res.success) fetchStaff();
    } catch (err) {
      alert('Failed to update employee status');
    }
  };

  const handleEdit = (v: any) => {
    setEditingId(v._id);
    setIsEditing(true);
    setFormData({
      name: v.name,
      email: v.email || '',
      phone: v.phone || '',
      role: v.role || 'STAFF',
      specialization: v.specialization || [],
      password: '' // Keep empty unless updating
    });
    setIsModalOpen(true);
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const endpoint = isEditing ? `/users/customers/${editingId}` : '/users/staff';
      const method = isEditing ? 'PUT' : 'POST';
      
      const payload = { ...formData };
      if (isEditing && !payload.password) delete (payload as any).password;

      const res = await apiRequest(endpoint, {
        method,
        body: payload
      });
      
      if (res.success) {
        setIsModalOpen(false);
        setIsEditing(false);
        setEditingId(null);
        setFormData({ name: '', email: '', phone: '', role: 'STAFF', specialization: [], password: '' });
        fetchStaff();
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Action failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;
    try {
      const res = await apiRequest(`/users/${id}`, { method: 'DELETE' });
      if (res.success) fetchStaff();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed');
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.sectionHeader} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
           <h2 className={styles.title}>Personnel Control</h2>
           <p className={styles.subtitle}>Supervise your salon's professional team and assign operational roles.</p>
        </div>
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
          }}
        >
           <Plus size={20} />
           <span>Induct Team Member</span>
        </button>
      </header>

      <section className={styles.kpiGrid}>
        <div className={cardStyles.card} style={{ borderLeft: '4px solid #34C759' }}>
           <div className={cardStyles.header}>
              <span className={cardStyles.label}>Top Performer</span>
              <div className={cardStyles.icon} style={{ background: 'rgba(52, 199, 89, 0.1)', color: '#34C759' }}>
                 <TrendingUp size={20} />
              </div>
           </div>
           <div className={cardStyles.value}>{staff.length > 0 ? staff[0].name : 'None'}</div>
           <div className={cardStyles.trending}>{staff.length > 0 ? 'Top Specialist this month' : 'No staff inducted'}</div>
        </div>
        <div className={cardStyles.card} style={{ borderLeft: '4px solid var(--primary)' }}>
           <div className={cardStyles.header}>
              <span className={cardStyles.label}>Team Capacity</span>
           </div>
           <div className={cardStyles.value}>{staff.length} Active</div>
           <div className={cardStyles.trending} style={{ color: 'var(--text-muted)' }}>Full Operational Shift</div>
        </div>
      </section>

      <Table 
        columns={[
          { key: 'name', label: 'Professional Profile', render: (val: any) => (
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ 
                  width: '36px', 
                  height: '36px', 
                  background: val.isOff ? 'rgba(0,0,0,0.05)' : 'rgba(255, 59, 48, 0.08)', 
                  color: val.isOff ? '#999' : 'var(--primary)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: val.isOff ? 0.6 : 1
                }}>
                   {val.isOff ? <CalendarOff size={18} /> : <UserCheck size={18} />}
                </div>
                <div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <p style={{ fontWeight: 800, color: val.isOff ? '#999' : 'inherit' }}>{val.name}</p>
                      {val.isOff && (
                        <span style={{ 
                          fontSize: '8px', 
                          background: '#FF3B30', 
                          color: 'white', 
                          padding: '2px 6px', 
                          borderRadius: '4px',
                          fontWeight: 900
                        }}>ON LEAVE</span>
                      )}
                   </div>
                   <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 900 }}>{val.role}</p>
                </div>
             </div>
          )},
          { key: 'specialization', label: 'Core Expertise', render: (val) => (
             <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {val.specialization?.map((s: string, i: number) => (
                   <span key={i} style={{ 
                     background: 'var(--bg-main)', 
                     fontSize: '11px', 
                     padding: '2px 8px', 
                     borderRadius: '4px',
                     border: '1px solid var(--border-light)',
                     fontWeight: 700 
                    }}>{s}</span>
                )) || <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>General</span>}
             </div>
          )},
          { key: 'email', label: 'Access Credentials', render: (val) => (
            <div style={{ fontSize: '13px' }}>
              <p style={{ fontWeight: 800, color: 'var(--primary)' }}>{val.email || 'No Email'}</p>
              <p style={{ color: 'var(--text-main)', marginTop: '4px' }}><strong>ID:</strong> {val.phone || 'N/A'}</p>
              <p style={{ fontSize: '10px', color: 'var(--text-muted)', maxWidth: '180px', wordBreak: 'break-all', marginTop: '4px' }}>
                {val.password ? <strong>Key: Hashed Session 🔐</strong> : <strong style={{color:'#999'}}>Key: Not Set</strong>}
              </p>
            </div>
          )},
          { key: 'actions', label: 'Management', render: (val: any) => (
             <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  className={styles.pageBtn} 
                  style={{ padding: '6px' }} 
                  title="Edit Details"
                  onClick={() => handleEdit(val)}
                >
                   <Pencil size={18} />
                </button>
                <button 
                  className={styles.pageBtn} 
                  style={{ 
                    padding: '6px', 
                    color: val.isOff ? '#34C759' : '#FF9500',
                    background: val.isOff ? 'rgba(52, 199, 89, 0.1)' : 'rgba(255, 149, 0, 0.1)',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }} 
                  title={val.isOff ? "Mark as Active" : "Mark as Off"}
                  onClick={() => toggleLeave(val._id, !!val.isOff)}
                >
                   {val.isOff ? <CalendarCheck size={18} /> : <CalendarOff size={18} />}
                </button>
                <button 
                  className={styles.pageBtn} 
                  style={{ padding: '6px' }} 
                  title="Remove"
                  onClick={() => handleDelete(val._id)}
                >
                   <Trash2 size={18} />
                </button>
             </div>
          )}
        ]}
        data={staff}
      />

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setIsEditing(false);
          setEditingId(null);
          setFormData({ name: '', email: '', phone: '', role: 'STAFF', specialization: [], password: '' });
        }} 
        title={isEditing ? "Modify Team Member Details" : "Induct New Team Member"}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Full Name</label>
            <input 
              required
              className={styles.input}
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. Dr. Jane Smith"
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Email Address</label>
            <input 
              type="email"
              required
              className={styles.input}
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flexFlow: 'row' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
              <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Phone</label>
              <input 
                required
                className={styles.input}
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
              <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Role</label>
              <select 
                className={styles.input}
                value={formData.role}
                onChange={e => setFormData({...formData, role: e.target.value})}
              >
                <option value="STAFF">Staff</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Specializations (comma separated)</label>
            <input 
              className={styles.input}
              placeholder="e.g. Haircut, Massage, Facial"
              value={formData.specialization.join(', ')}
              onChange={e => setFormData({...formData, specialization: e.target.value.split(',').map(s => s.trim())})}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Account Password {isEditing && "(Leave blank to keep current)"}</label>
            <input 
              required={!isEditing}
              type="password"
              className={styles.input}
              placeholder={isEditing ? "Enter new password if changing" : "Minimum 6 characters"}
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
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
            {isEditing ? "Update Details" : "Induct Member"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
