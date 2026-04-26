"use client";

import React, { useState } from 'react';
import Modal from './Modal';
import styles from '@/styles/layout/Dashboard.module.css';
import { CreditCard, CheckCircle2, IndianRupee, AlertTriangle, ShieldCheck } from 'lucide-react';
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
    transactionId: "",
    paymentVerified: false
  });
  const [loading, setLoading] = useState(false);

  const requiresVerification = formData.paymentMethod === 'UPI' || formData.paymentMethod === 'CARD';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Block submission if UPI/Card is not verified by employee
    if (requiresVerification && !formData.paymentVerified) {
      alert('Please verify the payment before finishing the service.');
      return;
    }

    setLoading(true);

    try {
      const res = await apiRequest(`/appointments/${appointment._id}/finish`, {
        method: 'POST',
        body: {
          paymentMethod: formData.paymentMethod,
          amount: formData.amount,
          transactionId: formData.transactionId,
          paymentVerified: formData.paymentVerified
        }
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
             onChange={e => setFormData({...formData, paymentMethod: e.target.value, paymentVerified: false, transactionId: ''})}
           >
             <option value="CASH">Cash</option>
             <option value="UPI">UPI (GooglePay/PhonePe)</option>
             <option value="CARD">Debit/Credit Card</option>
             <option value="PREPAID">Prepaid/Balance</option>
           </select>
        </div>

        {/* UPI/Card Verification Section */}
        {requiresVerification && (
          <div style={{ 
            border: formData.paymentVerified ? '2px solid #34C759' : '2px solid #FF9500',
            borderRadius: '16px',
            padding: '1.25rem',
            background: formData.paymentVerified ? 'rgba(52, 199, 89, 0.04)' : 'rgba(255, 149, 0, 0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
              {formData.paymentVerified ? (
                <ShieldCheck size={20} color="#34C759" />
              ) : (
                <AlertTriangle size={20} color="#FF9500" />
              )}
              <span style={{ 
                fontWeight: 900, 
                fontSize: '0.85rem', 
                color: formData.paymentVerified ? '#34C759' : '#FF9500',
                textTransform: 'uppercase',
                letterSpacing: '0.03em'
              }}>
                {formData.paymentVerified ? 'Payment Verified ✓' : 'Verify Payment Before Finishing'}
              </span>
            </div>

            {formData.paymentMethod === 'UPI' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' }}>
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

            {formData.paymentMethod === 'CARD' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' }}>
                <label style={{ fontWeight: 700, fontSize: '0.85rem' }}>Card Transaction Ref / Last 4 Digits</label>
                <input 
                  required 
                  className={styles.input} 
                  placeholder="e.g. TXN-1234 or Card ending 5678"
                  value={formData.transactionId}
                  onChange={e => setFormData({...formData, transactionId: e.target.value})}
                />
              </div>
            )}

            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem', fontWeight: 600 }}>
              Please confirm that you have received/verified the {formData.paymentMethod} payment of ₹{formData.amount} from the customer.
            </p>

            <button
              type="button"
              onClick={() => setFormData({...formData, paymentVerified: !formData.paymentVerified})}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '12px',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: formData.paymentVerified ? '#34C759' : '#FF9500',
                color: 'white',
                transition: 'all 0.2s'
              }}
            >
              <ShieldCheck size={18} />
              {formData.paymentVerified ? 'Verified ✓ (tap to undo)' : 'I confirm payment is received'}
            </button>
          </div>
        )}

        <div className="glass" style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(52, 199, 89, 0.05)', border: '1px dashed #34C759' }}>
           <p style={{ fontSize: '0.8rem', color: '#34C759', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
             <CheckCircle2 size={16} /> 
             Admin will be notified about this payment. Slot will be freed after completion.
           </p>
        </div>

        <button 
          type="submit" 
          disabled={loading || (requiresVerification && !formData.paymentVerified)}
          style={{ 
            background: (requiresVerification && !formData.paymentVerified) ? 'rgba(0,0,0,0.15)' : '#34C759', 
            color: 'white', 
            padding: '12px', 
            borderRadius: '12px', 
            fontWeight: 800,
            gap: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: '0.5rem',
            cursor: (requiresVerification && !formData.paymentVerified) ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s'
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
