"use client";

import React, { useState, useRef, useEffect } from 'react';
import Modal from './Modal';
import styles from '@/styles/layout/Dashboard.module.css';
import { ClipboardCheck, Trash2, Eraser, Pen } from 'lucide-react';
import { apiRequest } from '@/services/api';

interface ConsentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: any;
  onSuccess: () => void;
}

export default function ConsentFormModal({ isOpen, onClose, appointment, onSuccess }: ConsentFormModalProps) {
  const [formData, setFormData] = useState({
    customerAge: "",
    skinType: "Normal",
    allergies: "None",
    treatmentType: appointment?.service?.category || "Skin",
    serviceRequested: appointment?.service?.name || "General Service",
    specialInstructions: "",
    consentGiven: true
  });
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Canvas drawing logic
  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [isOpen]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      const rect = canvas.getBoundingClientRect();
      const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.nativeEvent.offsetX;
      const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.nativeEvent.offsetY;
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      const rect = canvas.getBoundingClientRect();
      const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.nativeEvent.offsetX;
      const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.nativeEvent.offsetY;
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const canvas = canvasRef.current;
      if (!canvas) throw new Error("Canvas not found");
      
      const signature = canvas.toDataURL('image/png');
      const isEmpty = signature.length < 1000; // rough check for clear signature

      if (isEmpty) {
        alert("Please provide a digital signature for consent.");
        setLoading(false);
        return;
      }

      const res = await apiRequest('/consent-forms', {
        method: 'POST',
        body: {
          ...formData,
          appointmentId: appointment._id,
          customerName: appointment.customer?.name,
          customerPhone: appointment.customer?.phone,
          digitalSignature: signature
        }
      });

      if (res.success) {
        onSuccess();
        alert('Consent form submitted and service started.');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to submit consent form');
    } finally {
      setLoading(false);
    }
  };

  if (!appointment) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Customer Consent Form">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <p style={{ fontSize: '0.9rem', color: '#000', fontWeight: 500 }}>
          Attending: <strong>{appointment.customer?.name}</strong> for <strong>{appointment.service?.name}</strong>
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontWeight: 700, fontSize: '0.85rem' }}>Age</label>
              <input 
                required 
                type="number"
                className={styles.input} 
                value={formData.customerAge}
                onChange={e => setFormData({...formData, customerAge: e.target.value})}
              />
           </div>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontWeight: 700, fontSize: '0.85rem' }}>Skin Type</label>
              <select 
                className={styles.input}
                value={formData.skinType}
                onChange={e => setFormData({...formData, skinType: e.target.value})}
              >
                <option value="Normal">Normal</option>
                <option value="Dry">Dry</option>
                <option value="Oily">Oily</option>
                <option value="Combination">Combination</option>
                <option value="Sensitive">Sensitive</option>
              </select>
           </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
           <label style={{ fontWeight: 700, fontSize: '0.85rem' }}>Any Allergies?</label>
           <input 
             className={styles.input} 
             placeholder="e.g. Aloevera, certain fragrances"
             value={formData.allergies}
             onChange={e => setFormData({...formData, allergies: e.target.value})}
           />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
           <label style={{ fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
             <Pen size={14} color="var(--primary)" /> Digital Signature (Sign below)
           </label>
           <div style={{ 
             border: '2px dashed var(--border-light)', 
             borderRadius: '12px', 
             background: 'white',
             position: 'relative',
             height: '150px'
           }}>
             <canvas 
               ref={canvasRef}
               width={440}
               height={150}
               onMouseDown={startDrawing}
               onMouseMove={draw}
               onMouseUp={stopDrawing}
               onMouseOut={stopDrawing}
               onTouchStart={startDrawing}
               onTouchMove={draw}
               onTouchEnd={stopDrawing}
               style={{ cursor: 'crosshair', width: '100%', height: '100%', borderRadius: '12px' }}
             />
             <button 
               type="button" 
               onClick={clearCanvas}
               title="Clear signature"
               style={{ 
                 position: 'absolute', 
                 top: '8px', 
                 right: '8px', 
                 padding: '6px', 
                 background: 'rgba(0,0,0,0.05)', 
                 borderRadius: '8px',
                 color: 'var(--text-muted)'
               }}
             >
               <Eraser size={16} />
             </button>
           </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
           <input 
            type="checkbox" 
            required 
            checked={formData.consentGiven}
            onChange={e => setFormData({...formData, consentGiven: e.target.checked})}
            style={{ marginTop: '4px' }}
           />
           <p style={{ fontSize: '0.75rem', color: '#000', fontWeight: 500, lineHeight: '1.4' }}>
             I hereby confirm that all the information provided above is accurate. I consent to the treatment/service and understand the potential measures and information I gave to the salon.
           </p>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            background: 'var(--primary)', 
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
              <ClipboardCheck size={20} />
              Confirm Consent & Start
            </>
          )}
        </button>
      </form>
    </Modal>
  );
}
