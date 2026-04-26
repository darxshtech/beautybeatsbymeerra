"use client";

import { useState, useEffect } from 'react';
import { Search, UserPlus, FileText, Trash2, Edit3, ChevronRight, Store } from 'lucide-react';
import styles from '@/styles/layout/Dashboard.module.css';
import cardStyles from '@/styles/components/Card.module.css';
import { apiRequest } from '@/services/api';
import Table from '@/components/Table';
import Modal from '@/components/Modal';

export default function WalkinCustomers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: ''
  });

  const fetchCustomers = async () => {
    try {
      const json = await apiRequest(`/users/customers?search=${search}&page=${page}&limit=10&source=WALKIN`);
      if (json.success) {
        setCustomers(json.data);
        setTotalPages(json.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search, page]);

  const handleOpenModal = (customer: any = null) => {
    if (customer) {
      setEditingCustomer(customer);
      const bday = customer.birthday || customer.dateOfBirth;
      setFormData({
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || '',
        dateOfBirth: bday ? new Date(bday).toISOString().split('T')[0] : ''
      });
    } else {
      setEditingCustomer(null);
      setFormData({ name: '', email: '', phone: '', address: '', dateOfBirth: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const endpoint = editingCustomer ? `/users/customers/${editingCustomer._id}` : '/users/customers';
      const method = editingCustomer ? 'PUT' : 'POST';
      
      const submitData = { 
        ...formData,
        registrationSource: 'WALKIN' // Ensure new registrations from this screen are marked as WALKIN
      };
      if (submitData.dateOfBirth) {
        submitData.dateOfBirth = submitData.dateOfBirth + 'T12:00:00.000Z';
      }

      const res = await apiRequest(endpoint, {
        method,
        body: submitData
      });

      if (res.success) {
        setIsModalOpen(false);
        fetchCustomers();
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    try {
      const res = await apiRequest(`/users/${id}`, { method: 'DELETE' });
      if (res.success) fetchCustomers();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.sectionHeader} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
           <h2 className={styles.title}>Walk-in Customers</h2>
           <p className={styles.subtitle}>Management specifically for clients acquired physically via the POS terminal.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          style={{ 
            background: 'var(--primary)', 
            color: 'white', 
            padding: '12px 24px', 
            borderRadius: '16px', 
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            border: 'none',
            cursor: 'pointer'
          }}
        >
           <UserPlus size={20} />
           <span>Add Walk-in Client</span>
        </button>
      </header>

      <div className={cardStyles.card} style={{ flexDirection: 'row', padding: '12px 20px', alignItems: 'center', gap: '1rem' }}>
         <Search size={20} color="var(--text-muted)" />
         <input 
            type="text" 
            placeholder="Search walk-in clients..."
            style={{ border: 'none', background: 'transparent', outline: 'none', flex: 1, fontSize: '15px', color: 'var(--text-main)', fontWeight: 600 }}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
         />
      </div>

      <Table 
        columns={[
          { key: 'name', label: 'Customer Name', render: (val) => (
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ 
                  width: '36px', 
                  height: '36px', 
                  background: 'rgba(52, 199, 89, 0.08)', 
                  color: '#34C759',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '13px'
                }}>
                   {val.name.charAt(0)}
                </div>
                <div>
                   <p style={{ fontWeight: 800 }}>{val.name}</p>
                   <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{val.phone}</p>
                </div>
             </div>
          )},
          { key: 'loyaltyPoints', label: 'Loyalty Points', render: (val) => (
             <span style={{ 
               background: 'rgba(255, 149, 0, 0.1)', 
               color: '#FF9500', 
               padding: '4px 12px', 
               borderRadius: '12px', 
               fontSize: '12px', 
               fontWeight: 800 
             }}>★ {val.loyaltyPoints}</span>
          )},
          { key: 'visitCount', label: 'Walk-ins' },
          { key: 'lastVisit', label: 'Last Presence', render: (val) => (
             <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                {val.lastVisit ? new Date(val.lastVisit).toLocaleDateString() : 'First Time'}
             </span>
          )},
          { key: 'actions', label: 'Operations', render: (val) => (
             <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  className={styles.pageBtn} 
                  style={{ padding: '6px' }} 
                  title="Edit Profile"
                  onClick={() => handleOpenModal(val)}
                >
                   <Edit3 size={18} />
                </button>
                <button 
                  className={styles.pageBtn} 
                  style={{ padding: '6px', color: 'var(--primary)' }} 
                  title="Delete Record"
                  onClick={() => handleDelete(val._id)}
                >
                   <Trash2 size={18} />
                </button>
                <button className={styles.pageBtn} style={{ padding: '6px', background: 'var(--primary)', color: 'white', border: 'none' }} title="View Profile">
                   <ChevronRight size={18} />
                </button>
             </div>
          )}
        ]}
        data={customers}
        pagination={{
            page,
            totalPages,
            onPageChange: (p) => setPage(p)
        }}
      />

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingCustomer ? 'Edit Walk-in Client' : 'Add Walk-in Client'}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Full Name</label>
            <input 
              required
              className={styles.input}
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. Walk-in Guest"
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Phone Number</label>
            <input 
              required
              className={styles.input}
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
              placeholder="+91 9876543210"
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Optional Email</label>
            <input 
              type="email"
              className={styles.input}
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              placeholder="customer@email.com"
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Address (Optional)</label>
            <textarea 
              className={styles.input}
              style={{ minHeight: '60px', resize: 'vertical' }}
              value={formData.address}
              onChange={e => setFormData({...formData, address: e.target.value})}
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
            {editingCustomer ? 'Update Client' : 'Save Client'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
