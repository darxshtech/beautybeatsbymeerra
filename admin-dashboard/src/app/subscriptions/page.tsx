"use client";

import { useState, useEffect } from 'react';
import { Pencil, Check, X, Tag } from 'lucide-react';
import Table from '@/components/Table';
import Modal from '@/components/Modal';
import { apiRequest } from '@/services/api';
import styles from '@/styles/layout/Dashboard.module.css';
import cardStyles from '@/styles/components/Card.module.css';

export default function AdminSubscriptions() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/subscriptions');
      if (res.success) setPlans(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlans(); }, []);

  const handleEdit = (plan: any) => {
    setEditingPlan(plan);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiRequest(`/subscriptions/${editingPlan._id}`, {
        method: 'PUT',
        body: editingPlan
      });
      if (res.success) {
        alert('Plan updated successfully!');
        setIsEditModalOpen(false);
        fetchPlans();
      } else {
        alert(res.message || 'Failed to update plan');
      }
    } catch (err) {
      alert('Error updating plan');
    }
  };

  const columns = [
    { key: 'name', label: 'Plan Name' },
    { key: 'code', label: 'Code' },
    { key: 'price', label: 'Price' },
    { key: 'interval', label: 'Billing Interval' },
    { key: 'popular', label: 'Most Popular', render: (val: any) => val.popular ? <Check color="green" /> : <X color="red" /> },
    { key: 'isActive', label: 'Active', render: (val: any) => val.isActive ? <Check color="green" /> : <X color="red" /> },
    { 
      key: 'actions', 
      label: 'Actions', 
      render: (val: any) => (
        <button className={styles.pageBtn} onClick={() => handleEdit(val)} style={{ padding: '6px 12px' }}>
          <Pencil size={14} style={{ marginRight: '4px' }} /> Edit
        </button>
      ) 
    }
  ];

  return (
    <div className={styles.container}>
      <header className={styles.sectionHeader}>
        <h2 className={styles.title}>Subscription Plans</h2>
        <p className={styles.subtitle}>Customize the membership plans offered on your client website.</p>
      </header>

      <div className={cardStyles.card}>
        {loading ? (
          <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading plans...</p>
        ) : (
          <Table columns={columns} data={plans} />
        )}
      </div>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Subscription Plan">
        {editingPlan && (
          <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700 }}>Plan Name</label>
              <input 
                type="text" 
                className={styles.input} 
                value={editingPlan.name} 
                onChange={e => setEditingPlan({...editingPlan, name: e.target.value})} 
                required 
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700 }}>Price</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  value={editingPlan.price} 
                  onChange={e => setEditingPlan({...editingPlan, price: e.target.value})} 
                  required 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700 }}>Interval</label>
                <select 
                  className={styles.input} 
                  value={editingPlan.interval} 
                  onChange={e => setEditingPlan({...editingPlan, interval: e.target.value})}
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700 }}>Features (comma separated)</label>
              <textarea 
                className={styles.input} 
                rows={4}
                value={editingPlan.features.join(', ')} 
                onChange={e => setEditingPlan({...editingPlan, features: e.target.value.split(',').map((f:string) => f.trim())})} 
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                <input 
                  type="checkbox" 
                  checked={editingPlan.popular} 
                  onChange={e => setEditingPlan({...editingPlan, popular: e.target.checked})} 
                />
                Mark as Most Popular
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                <input 
                  type="checkbox" 
                  checked={editingPlan.isActive} 
                  onChange={e => setEditingPlan({...editingPlan, isActive: e.target.checked})} 
                />
                Active (Visible to Clients)
              </label>
            </div>
            <button type="submit" className={styles.pageBtn} style={{ background: 'var(--primary)', color: 'white', marginTop: '1rem', padding: '12px' }}>
              Save Changes
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
}
