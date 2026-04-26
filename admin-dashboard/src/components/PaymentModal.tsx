"use client";

import React, { useState } from 'react';
import Modal from './Modal';
import styles from '@/styles/layout/Dashboard.module.css';
import { CreditCard, CheckCircle2, IndianRupee } from 'lucide-react';
import { apiRequest } from '@/services/api';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: any;
  onSuccess: () => void;
}

export default function PaymentModal({ isOpen, onClose, appointment, onSuccess }: PaymentModalProps) {
  const [formData, setFormData] = useState({
    paymentMethod: "CASH",
    amount: (appointment?.service?.price || 0).toString(),
    transactionId: ""
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await apiRequest(`/appointments/${appointment._id}/finish`, {
        method: 'POST',
        body: formData
      });

      if (res.success) {
        onSuccess();
        alert(`Service finished! Payment of ₹${formData.amount} recorded via ${formData.paymentMethod}.`);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  if (!appointment) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Complete Customer Service">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Finalizing session for: <strong>{appointment.customer?.name}</strong>
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
           <label style={{ fontWeight: 700, fontSize: '0.85rem' }}>Billed Amount (₹)</label>
           <div style={{ position: 'relative' }}>
             <IndianRupee size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
             <input 
               required 
               type="number"
               className={styles.input} 
               style={{ paddingLeft: '36px' }}
               value={formData.amount}
               onChange={e => setFormData({...formData, amount: e.target.value})}
             />
           </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
           <label style={{ fontWeight: 700, fontSize: '0.85rem' }}>Payment Method</label>
           <select 
             className={styles.input}
             value={formData.paymentMethod}
             onChange={e => setFormData({...formData, paymentMethod: e.target.value})}
           >
             <option value="CASH">Cash</option>
             <option value="UPI">UPI (GooglePay/PhonePe)</option>
             <option value="CARD">Debit/Credit Card</option>
             <option value="PREPAID">Prepaid/Balance</option>
           </select>
        </div>

        {formData.paymentMethod === 'UPI' && (
           <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontWeight: 700, fontSize: '0.85rem' }}>UPI Transaction ID / Ref No.</label>
              <input 
                required 
                className={styles.input} 
                placeholder="e.g. 123456789012"
                value={formData.transactionId}
                onChange={e => setFormData({...formData, transactionId: e.target.value})}
              />
           </div>
        )}

        <div className="glass" style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(52, 199, 89, 0.05)', border: '1px dashed #34C759' }}>
           <p style={{ fontSize: '0.8rem', color: '#34C759', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
             <CheckCircle2 size={16} /> 
             Admin will be notified about this payment.
           </p>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            background: '#34C759', 
            color: 'white', 
            padding: '12px', 
            borderRadius: '12px', 
            fontWeight: 800,
            gap: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: '0.5rem'
          }}
        >
          {loading ? 'Processing...' : (
            <>
              <CreditCard size={20} />
              Finish Service & Record Payment
            </>
          )}
        </button>
      </form>
    </Modal>
  );
}
