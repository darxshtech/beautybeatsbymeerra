"use client";

import { useState, useEffect } from 'react';
import { Package, Search, AlertCircle, TrendingUp, TrendingDown, ClipboardList } from 'lucide-react';
import styles from '@/styles/layout/Dashboard.module.css';
import cardStyles from '@/styles/components/Card.module.css';
import { apiRequest } from '@/services/api';
import Table from '@/components/Table';
import Modal from '@/components/Modal';

export default function Inventory() {
  const [items, setItems] = useState<any[]>([]);
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    itemName: '',
    description: '',
    stockCount: 0,
    unit: 'pcs',
    reorderLevel: 5
  });

  const [search, setSearch] = useState("");

  const fetchInventory = async () => {
    try {
      const json = await apiRequest(`/inventory?search=${search}&lowStock=${lowStockOnly}`);
      if (json.success) {
        setItems(json.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [lowStockOnly, search]);

  const handleAdjustStock = async (id: string, mode: 'IN' | 'OUT') => {
    const amountStr = prompt(`Enter quantity to ${mode}:`, "1");
    const amount = parseInt(amountStr || '0');
    if (isNaN(amount) || amount <= 0) return;

    try {
      const res = await apiRequest(`/inventory/${id}/adjust`, {
        method: 'POST',
        body: { amount, mode }
      });
      if (res.success) fetchInventory();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Adjustment failed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiRequest('/inventory', {
        method: 'POST',
        body: formData
      });
      if (res.success) {
        setIsModalOpen(false);
        setFormData({ itemName: '', description: '', stockCount: 0, unit: 'pcs', reorderLevel: 5 });
        fetchInventory();
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Adding item failed');
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.sectionHeader}>
        <div>
           <h2 className={styles.title}>Supply Repository</h2>
           <p className={styles.subtitle}>Maintain your salon's product stock and inventory levels.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
           <button 
             onClick={() => setLowStockOnly(!lowStockOnly)}
             className={cardStyles.card} 
             style={{ 
               flexDirection: 'row', 
               padding: '10px 20px', 
               alignItems: 'center', 
               gap: '8px', 
               background: lowStockOnly ? 'rgba(255, 59, 48, 0.1)' : 'var(--bg-sidebar)',
               borderColor: lowStockOnly ? 'var(--primary)' : 'var(--border-light)',
               cursor: 'pointer',
               boxShadow: 'none',
               margin: 0
             }}
           >
              <AlertCircle size={18} color={lowStockOnly ? 'var(--primary)' : 'var(--text-muted)'} />
              <span style={{ fontSize: '14px', fontWeight: 700, color: lowStockOnly ? 'var(--primary)' : 'var(--text-main)' }}>Low Stock Scan</span>
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
               cursor: 'pointer',
               display: 'flex',
               alignItems: 'center',
               gap: '8px'
             }}
           >
              <Package size={20} />
              <span>Catalog New Item</span>
           </button>
        </div>
      </header>

      <div className={cardStyles.card} style={{ display: 'flex', padding: '12px 20px', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
         <Search size={20} color="var(--text-muted)" />
         <input 
            type="text" 
            placeholder="Search inventory..."
            style={{ border: 'none', background: 'transparent', outline: 'none', flex: 1, fontSize: '15px', color: 'var(--text-main)', fontWeight: 600 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
         />
      </div>

      <Table 
        columns={[
          { key: 'itemName', label: 'Item Description', render: (val) => (
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
                   <Package size={18} />
                </div>
                <div>
                   <p style={{ fontWeight: 800, fontSize: '15px' }}>{val.itemName}</p>
                   <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{val.unit}</p>
                </div>
             </div>
          )},
          { key: 'stockCount', label: 'Availability', render: (val) => {
             const isLow = val.stockCount <= val.reorderLevel;
             return (
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ 
                    fontSize: '18px', 
                    fontWeight: 900, 
                    color: isLow ? 'var(--primary)' : 'var(--text-main)' 
                  }}>{val.stockCount}</span>
                  {isLow && (
                    <span style={{ 
                      background: 'rgba(255, 59, 48, 0.1)', 
                      color: 'var(--primary)', 
                      padding: '2px 8px', 
                      borderRadius: '6px', 
                      fontSize: '10px', 
                      fontWeight: 900 
                    }}>LOW</span>
                  )}
               </div>
             );
          }},
          { key: 'reorderLevel', label: 'Threshold' },
          { key: 'actions', label: 'Quick Operations', render: (val) => (
             <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  className={styles.pageBtn} 
                  style={{ padding: '6px', color: '#34C759' }} 
                  title="Stock In"
                  onClick={() => handleAdjustStock(val._id, 'IN')}
                >
                   <TrendingUp size={18} />
                </button>
                <button 
                  className={styles.pageBtn} 
                  style={{ padding: '6px', color: 'var(--primary)' }} 
                  title="Stock Out"
                  onClick={() => handleAdjustStock(val._id, 'OUT')}
                >
                   <TrendingDown size={18} />
                </button>
             </div>
          )}
        ]}
        data={items}
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Catalog New Supply Item">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Item Name</label>
            <input 
              required
              className={styles.input}
              value={formData.itemName}
              onChange={e => setFormData({...formData, itemName: e.target.value})}
              placeholder="e.g. Shampoo bottle 500ml"
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flexFlow: 'row' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
              <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Initial Stock</label>
              <input 
                type="number"
                required
                className={styles.input}
                value={formData.stockCount}
                onChange={e => setFormData({...formData, stockCount: parseInt(e.target.value)})}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
              <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Unit</label>
              <input 
                type="text"
                required
                className={styles.input}
                value={formData.unit}
                onChange={e => setFormData({...formData, unit: e.target.value})}
                placeholder="pcs, ml, liters"
              />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Low Stock Threshold</label>
            <input 
              type="number"
              required
              className={styles.input}
              value={formData.reorderLevel}
              onChange={e => setFormData({...formData, reorderLevel: parseInt(e.target.value)})}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Description</label>
            <textarea 
              className={styles.input}
              style={{ minHeight: '60px', resize: 'vertical' }}
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="Source or details"
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
            Add to Inventory
          </button>
        </form>
      </Modal>
    </div>
  );
}
