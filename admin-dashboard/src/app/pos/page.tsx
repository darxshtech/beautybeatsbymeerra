"use client";

import { useState, useEffect } from 'react';
import { apiRequest } from '@/services/api';
import styles from '@/styles/layout/Dashboard.module.css';
import cardStyles from '@/styles/components/Card.module.css';
import { Search, ShoppingCart, Percent, CheckCircle2, UserCheck, Phone, Star, Gift } from 'lucide-react';

export default function POSPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [customer, setCustomer] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [redeemPoints, setRedeemPoints] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await apiRequest('/services');
        if (res.success) setServices(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchServices();
  }, []);

  const searchCustomer = async () => {
    if (!phoneNumber) return;
    setLoading(true);
    try {
      const res = await apiRequest(`/users/customers?phone=${phoneNumber}`);
      if (res.success && res.data.length > 0) {
        setCustomer(res.data[0]);
      } else {
        setCustomer({ name: '', phone: phoneNumber, isNew: true });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!selectedService) return 0;
    let total = selectedService.price;
    if (redeemPoints && customer?.loyaltyPoints) {
      total = Math.max(0, total - (customer.loyaltyPoints * 10));
    }
    return total;
  };

  const handleBooking = async () => {
    if (!selectedService || !phoneNumber) return alert("Please select service and customer");
    
    try {
      const payload = {
        service: selectedService._id,
        appointmentDate: new Date().toISOString().split('T')[0],
        timeSlot: 'Immediate',
        type: 'WALKIN',
        customerInfo: customer.isNew ? { name: customer.name, phone: phoneNumber } : undefined,
        customerId: customer.isNew ? undefined : customer._id,
        pointsRedeemed: redeemPoints ? customer?.loyaltyPoints : 0
      };

      const res = await apiRequest('/appointments', {
        method: 'POST',
        body: payload
      });

      if (res.success) {
        setBookingSuccess(true);
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (err: any) {
      alert(err.message || "Booking failed");
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.sectionHeader}>
        <div>
          <h2 className={styles.title}>POS Terminal</h2>
          <p className={styles.subtitle}>Instant walk-in booking, loyalty redemption, and bill generation.</p>
        </div>
        <div style={{ 
          padding: '8px 20px', 
          background: 'rgba(255, 59, 48, 0.08)', 
          borderRadius: '12px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          marginTop: '1rem'
        }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34C759', animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary)' }}>LIVE TERMINAL</span>
        </div>
      </header>

      {/* Success Overlay */}
      {bookingSuccess && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 999,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: 'white', borderRadius: '32px', padding: '3rem', textAlign: 'center',
            maxWidth: '400px', width: '90%'
          }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(52, 199, 89, 0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem'
            }}>
              <CheckCircle2 size={40} color="#34C759" />
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>Booking Confirmed!</h3>
            <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Customer added to walk-in queue.</p>
          </div>
        </div>
      )}

      <div className="grid-mobile-1" style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1.5rem', alignItems: 'start' }}>
        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0 }}>

          {/* STEP 1: Customer Search */}
          <div className={cardStyles.card} style={{ padding: '1.5rem', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div style={{ 
                width: '36px', height: '36px', borderRadius: '10px', 
                background: 'rgba(255, 59, 48, 0.08)', color: 'var(--primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center' 
              }}>
                <Search size={18} />
              </div>
              <div>
                <h3 style={{ fontWeight: 900, fontSize: '1rem' }}>Step 1 — Find or Add Customer</h3>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Enter mobile number to look up existing customer or register new.</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ 
                flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: '240px',
                background: 'var(--bg-main)', borderRadius: '14px', padding: '0 16px',
                border: '1px solid var(--border-light)'
              }}>
                <Phone size={16} color="var(--text-muted)" />
                <input 
                  type="text" 
                  placeholder="Enter Mobile Number..."
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchCustomer()}
                  style={{ 
                    border: 'none', background: 'transparent', outline: 'none', 
                    flex: 1, fontSize: '15px', color: 'var(--text-main)', 
                    fontWeight: 700, padding: '14px 0'
                  }}
                />
              </div>
              <button 
                onClick={searchCustomer}
                disabled={loading || !phoneNumber}
                style={{ 
                  background: 'var(--primary)', color: 'white', 
                  padding: '14px 28px', borderRadius: '14px', 
                  flex: 1, minWidth: '120px',
                  fontWeight: 800, fontSize: '14px', border: 'none', cursor: 'pointer',
                  opacity: loading || !phoneNumber ? 0.5 : 1,
                  transition: 'all 0.2s'
                }}
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>

            {/* Customer Result */}
            {customer && (
              <div style={{ 
                marginTop: '0.5rem', padding: '1.25rem', borderRadius: '16px',
                background: customer.isNew ? 'rgba(255, 149, 0, 0.06)' : 'rgba(52, 199, 89, 0.06)',
                border: `1px solid ${customer.isNew ? 'rgba(255, 149, 0, 0.15)' : 'rgba(52, 199, 89, 0.15)'}`,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div>
                  {customer.isNew ? (
                    <div>
                      <span style={{ 
                        background: '#FF9500', color: 'white', padding: '3px 10px', 
                        borderRadius: '8px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase'
                      }}>New Client</span>
                      <input 
                        placeholder="Full Name" 
                        value={customer.name}
                        onChange={(e) => setCustomer({...customer, name: e.target.value})}
                        style={{ 
                          display: 'block', width: '100%', padding: '10px 14px', borderRadius: '10px',
                          border: '1px solid var(--border-light)', marginTop: '10px', fontWeight: 700,
                          fontSize: '14px', outline: 'none'
                        }}
                      />
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <UserCheck size={16} color="#34C759" />
                        <span style={{ fontSize: '10px', fontWeight: 900, color: '#34C759', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Returning Client</span>
                      </div>
                      <h4 style={{ fontWeight: 900, fontSize: '1.25rem' }}>{customer.name}</h4>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>{customer.phone} • {customer.visitCount || 0} visits</p>
                    </div>
                  )}
                </div>
                {!customer.isNew && (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ 
                      background: 'rgba(255, 59, 48, 0.08)', padding: '12px 20px', 
                      borderRadius: '16px', display: 'inline-block' 
                    }}>
                      <p style={{ fontSize: '9px', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>Loyalty Balance</p>
                      <p style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--primary)', lineHeight: 1 }}>{customer.loyaltyPoints || 0}</p>
                      <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)' }}>pts (₹{(customer.loyaltyPoints || 0) * 10})</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* STEP 2: Service Selection */}
          <div className={cardStyles.card} style={{ padding: '1.5rem', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div style={{ 
                width: '36px', height: '36px', borderRadius: '10px', 
                background: 'rgba(0, 122, 255, 0.08)', color: '#007AFF',
                display: 'flex', alignItems: 'center', justifyContent: 'center' 
              }}>
                <ShoppingCart size={18} />
              </div>
              <div>
                <h3 style={{ fontWeight: 900, fontSize: '1rem' }}>Step 2 — Select Package / Service</h3>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Choose from available services below.</p>
              </div>
            </div>

            <div className="grid-mobile-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
              {services.map(s => (
                <button 
                  key={s._id}
                  onClick={() => setSelectedService(s)}
                  style={{ 
                    padding: '1.25rem', borderRadius: '16px', textAlign: 'left',
                    border: selectedService?._id === s._id ? '2px solid var(--primary)' : '2px solid transparent',
                    background: selectedService?._id === s._id ? 'rgba(255, 59, 48, 0.04)' : 'var(--bg-main)',
                    cursor: 'pointer', transition: 'all 0.2s ease',
                    position: 'relative', overflow: 'hidden'
                  }}
                >
                  {selectedService?._id === s._id && (
                    <div style={{ 
                      position: 'absolute', top: '10px', right: '10px', 
                      width: '20px', height: '20px', borderRadius: '50%',
                      background: 'var(--primary)', display: 'flex', 
                      alignItems: 'center', justifyContent: 'center' 
                    }}>
                      <CheckCircle2 size={12} color="white" />
                    </div>
                  )}
                  <p style={{ 
                    fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', 
                    color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: '6px' 
                  }}>
                    {s.category}{s.isPackage ? ' • PACKAGE' : ''}
                  </p>
                  <h5 style={{ fontWeight: 800, fontSize: '14px', color: 'var(--text-main)', marginBottom: '8px', lineHeight: 1.3 }}>
                    {s.name}
                  </h5>
                  <p style={{ fontWeight: 900, fontSize: '1.25rem', color: 'var(--primary)' }}>₹{s.price}</p>
                  {s.duration && (
                    <p style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, marginTop: '4px' }}>{s.duration} min</p>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN — Checkout Summary */}
        <div className="mobile-no-sticky" style={{ position: 'sticky', top: '2rem' }}>
          <div style={{ 
            background: 'white', borderRadius: '24px', padding: '2rem',
            border: '2px solid rgba(255, 59, 48, 0.12)', 
            boxShadow: '0 20px 60px rgba(255, 59, 48, 0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-light)' }}>
              <Gift size={20} color="var(--primary)" />
              <h3 style={{ fontWeight: 900, fontSize: '1.1rem' }}>Checkout Summary</h3>
            </div>

            {/* Summary Lines */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Service</span>
                <span style={{ fontSize: '14px', fontWeight: 800 }}>{selectedService?.name || '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Base Price</span>
                <span style={{ fontSize: '14px', fontWeight: 800 }}>₹{selectedService?.price || 0}</span>
              </div>
              {customer && !customer.isNew && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Customer</span>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#34C759' }}>{customer.name}</span>
                </div>
              )}

              {redeemPoints && customer?.loyaltyPoints > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#34C759' }}>Points Discount</span>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#34C759' }}>- ₹{customer.loyaltyPoints * 10}</span>
                </div>
              )}
            </div>

            {/* Loyalty Points Toggle */}
            {customer && !customer.isNew && customer.loyaltyPoints > 0 && (
              <div 
                onClick={() => setRedeemPoints(!redeemPoints)}
                style={{ 
                  padding: '1rem', borderRadius: '14px', cursor: 'pointer',
                  background: redeemPoints ? 'rgba(255, 59, 48, 0.06)' : 'var(--bg-main)',
                  border: redeemPoints ? '2px solid var(--primary)' : '2px solid transparent',
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  marginBottom: '1.5rem', transition: 'all 0.2s'
                }}
              >
                <div style={{ 
                  width: '22px', height: '22px', borderRadius: '6px',
                  border: redeemPoints ? 'none' : '2px solid var(--border-light)',
                  background: redeemPoints ? 'var(--primary)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s', flexShrink: 0
                }}>
                  {redeemPoints && <Percent size={12} color="white" />}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '13px', fontWeight: 800 }}>Redeem {customer.loyaltyPoints} Points</p>
                  <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--primary)' }}>Save ₹{customer.loyaltyPoints * 10} on this bill</p>
                </div>
                <Star size={16} color="var(--primary)" />
              </div>
            )}

            {/* Grand Total */}
            <div style={{ 
              background: 'var(--bg-main)', padding: '1.25rem 1.5rem', 
              borderRadius: '16px', marginBottom: '1.5rem',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <span style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>Grand Total</span>
              <span style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--primary)' }}>₹{calculateTotal()}</span>
            </div>

            {/* Book Button */}
            <button 
              onClick={handleBooking}
              disabled={!selectedService || !phoneNumber}
              style={{ 
                width: '100%', padding: '16px', background: 'var(--primary)', 
                color: 'white', border: 'none', borderRadius: '16px', 
                fontWeight: 900, fontSize: '15px', cursor: 'pointer',
                opacity: !selectedService || !phoneNumber ? 0.4 : 1,
                transition: 'all 0.2s', letterSpacing: '0.02em'
              }}
            >
              Complete Walk-in Booking
            </button>

            <p style={{ 
              textAlign: 'center', fontSize: '10px', fontWeight: 700, 
              color: 'var(--text-muted)', marginTop: '1rem',
              textTransform: 'uppercase', letterSpacing: '0.1em'
            }}>
              Walk-ins are handled on immediate priority
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
