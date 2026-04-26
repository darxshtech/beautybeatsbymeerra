"use client";

import { useState, useEffect } from 'react';
import { IndianRupee, TrendingDown, Plus, Filter, FileText, Search } from 'lucide-react';
import styles from '@/styles/layout/Dashboard.module.css';
import cardStyles from '@/styles/components/Card.module.css';
import Table from '@/components/Table';
import Modal from '@/components/Modal';
import { apiRequest } from '@/services/api';

export default function Expenses() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    category: 'Supplies/Utilities',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });

  const fetchExpenses = async () => {
    try {
      const json = await apiRequest('/expenses');
      if (json.success) setExpenses(json.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiRequest('/expenses', {
        method: 'POST',
        body: formData
      });
      if (res.success) {
        setIsModalOpen(false);
        setFormData({ description: '', category: 'Supplies/Utilities', amount: '', date: new Date().toISOString().split('T')[0] });
        fetchExpenses();
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Action failed');
    }
  };

  const exportData = (type: 'csv' | 'pdf') => {
    if (type === 'pdf') {
      window.print();
    } else {
      let csv = 'Date,Item,Category,Amount,Recorded By\n';
      expenses.forEach(e => {
        csv += `${new Date(e.date).toLocaleDateString()},"${e.description}",${e.category},${e.amount},"${e.recordedBy?.name || 'Admin'}"\n`;
      });
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Expenses_Report.csv`;
      a.click();
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.sectionHeader} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
           <h2 className={styles.title}>Operation Cost Control</h2>
           <p className={styles.subtitle}>Audit your salon's monthly expenditures and categorize operational costs.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
           <div style={{ display: 'flex', gap: '0.5rem', marginRight: '1rem', borderRight: '1px solid var(--border-light)', paddingRight: '1rem' }}>
              <button onClick={() => exportData('pdf')} style={{ background: 'var(--bg-sidebar)', border: '1px solid var(--border-light)', padding: '8px 12px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)', fontWeight: 700, fontSize: '12px' }}>
                <FileText size={16} /> PDF
              </button>
              <button onClick={() => exportData('csv')} style={{ background: 'var(--bg-sidebar)', border: '1px solid var(--border-light)', padding: '8px 12px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)', fontWeight: 700, fontSize: '12px' }}>
                <FileText size={16} /> CSV
              </button>
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
            }}>
               <Plus size={20} />
               <span>Record Expense</span>
            </button>
        </div>
      </header>

      <Table 
        columns={[
          { key: 'date', label: 'Billing Period', render: (val) => (
             <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
                {new Date(val.date).toLocaleDateString()}
             </span>
          )},
          { key: 'description', label: 'Expenditure Description', render: (val) => (
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
                   <IndianRupee size={18} />
                </div>
                <div>
                   <p style={{ fontWeight: 800 }}>{val.description}</p>
                   <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 900 }}>{val.category}</p>
                </div>
             </div>
          )},
          { key: 'amount', label: 'Commercial Outflow', render: (val) => (
             <span style={{ fontWeight: 900, color: 'var(--primary)', fontSize: '1.25rem' }}>-₹{val.amount}</span>
          )},
          { key: 'recordedBy', label: 'Audited By', render: (val) => (
             <span style={{ fontSize: '13px', fontWeight: 700 }}>{val.recordedBy?.name || 'Admin'}</span>
          )}
        ]}
        data={expenses}
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record New Expense">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Expense Item</label>
            <input 
              required
              className={styles.input}
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="e.g. Rent, Electricity"
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flexFlow: 'row' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
              <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Amount (₹)</label>
              <input 
                type="number"
                required
                className={styles.input}
                value={formData.amount}
                onChange={e => setFormData({...formData, amount: e.target.value})}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
              <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Category</label>
              <select 
                className={styles.input}
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                <option value="Salaries/Rent">Salaries/Rent</option>
                <option value="Supplies/Utilities">Supplies/Utilities</option>
                <option value="Marketing">Marketing</option>
                <option value="Miscellaneous">Miscellaneous</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Date</label>
            <input 
              type="date"
              required
              className={styles.input}
              value={formData.date}
              onChange={e => setFormData({...formData, date: e.target.value})}
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
            Record Transaction
          </button>
        </form>
      </Modal>
    </div>
  );
}
