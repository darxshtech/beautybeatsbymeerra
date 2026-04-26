"use client";

import { useState, useEffect } from 'react';
import { IndianRupee, FileText, CheckCircle, CreditCard, Clock, Plus, Search, Send, ExternalLink, User, AlertCircle } from 'lucide-react';
import styles from '@/styles/layout/Dashboard.module.css';
import cardStyles from '@/styles/components/Card.module.css';
import Table from '@/components/Table';
import Modal from '@/components/Modal';
import { apiRequest } from '@/services/api';

export default function Billing() {
  const [bills, setBills] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [customerBills, setCustomerBills] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    customer: '',
    items: [{ name: '', price: 0 }],
    paymentMethod: 'CASH',
    paymentStatus: 'PAID',
    discount: 0
  });
  const [search, setSearch] = useState("");
  const [sendingId, setSendingId] = useState<string | null>(null);

  const fetchBills = async () => {
    try {
      const json = await apiRequest(`/billing?search=${search}`);
      if (json.success) setBills(json.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCustomers = async () => {
    try {
      const json = await apiRequest('/users/customers?limit=100');
      if (json.success) setCustomers(json.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBills();
    fetchCustomers();
  }, [search]);

  // When customer is selected in the form, fetch their recent bills/services
  const handleCustomerSelect = async (customerId: string) => {
    setFormData({ ...formData, customer: customerId });
    if (!customerId) {
      setSelectedCustomer(null);
      setCustomerBills([]);
      return;
    }
    const cust = customers.find(c => c._id === customerId);
    setSelectedCustomer(cust || null);

    try {
      const res = await apiRequest(`/billing?customer=${customerId}`);
      if (res.success) setCustomerBills(res.data.slice(0, 5));
    } catch {}
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await apiRequest(`/billing/${id}/status`, {
        method: 'PUT',
        body: { status }
      });
      if (res.success) fetchBills();
    } catch (err) {
      alert('Update failed');
    }
  };

  const handleSendBill = async (id: string) => {
    setSendingId(id);
    try {
      const res = await apiRequest(`/billing/${id}/send`, { method: 'POST' });
      if (res.success && res.whatsappUrl) {
        window.open(res.whatsappUrl, '_blank');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to generate bill link');
    } finally {
      setSendingId(null);
    }
  };

  const handleDownloadPDF = async () => {
    if (!selectedCustomer) return;
    try {
      const token = localStorage.getItem('bb_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/billing/customer/${selectedCustomer._id}/pdf`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `BeautyBeats_${selectedCustomer.name}_Statement.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        alert('Failed to download PDF');
      }
    } catch (err) {
      console.error(err);
      alert('Error downloading PDF');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const subtotal = formData.items.reduce((acc, curr) => acc + Number(curr.price), 0);
    const total = Math.max(0, subtotal - Number(formData.discount || 0));
    try {
      const res = await apiRequest('/billing', {
        method: 'POST',
        body: {
          ...formData,
          subtotal,
          total
        }
      });
      if (res.success) {
        setIsModalOpen(false);
        setFormData({
          customer: '',
          items: [{ name: '', price: 0 }],
          paymentMethod: 'CASH',
          paymentStatus: 'PAID',
          discount: 0
        });
        setSelectedCustomer(null);
        setCustomerBills([]);
        fetchBills();
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Billing failed');
    }
  };

  // KPI stats
  const totalRevenue = bills.filter(b => b.paymentStatus === 'PAID').reduce((a, b) => a + (b.total || 0), 0);
  const pendingAmount = bills.filter(b => b.paymentStatus !== 'PAID').reduce((a, b) => a + (b.total || 0), 0);
  const pendingCount = bills.filter(b => b.paymentStatus !== 'PAID').length;

  return (
    <div className={styles.container}>
      <header className={styles.sectionHeader} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
           <h2 className={styles.title}>Billing & Invoices</h2>
           <p className={styles.subtitle}>Track revenue, manage invoices, and send bills to customers via WhatsApp.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          style={{ 
            background: 'var(--primary)', color: 'white', 
            padding: '12px 24px', borderRadius: '16px', 
            fontWeight: 800, border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
           <Plus size={20} />
           <span>Generate Bill</span>
        </button>
      </header>

      {/* KPI Strip */}
      <section className={styles.kpiGrid} style={{ marginBottom: '1.5rem' }}>
        <div className={cardStyles.card} style={{ borderLeft: '4px solid #34C759' }}>
          <div className={cardStyles.header}>
            <span className={cardStyles.label}>Collected Revenue</span>
            <div className={cardStyles.icon} style={{ background: 'rgba(52, 199, 89, 0.1)', color: '#34C759' }}>
              <IndianRupee size={18} />
            </div>
          </div>
          <div className={cardStyles.value}>₹{totalRevenue.toLocaleString()}</div>
          <div className={cardStyles.trending} style={{ color: '#34C759' }}>
            {bills.filter(b => b.paymentStatus === 'PAID').length} paid invoices
          </div>
        </div>
        <div className={cardStyles.card} style={{ borderLeft: '4px solid #FF9500' }}>
          <div className={cardStyles.header}>
            <span className={cardStyles.label}>Pending Dues</span>
            <div className={cardStyles.icon} style={{ background: 'rgba(255, 149, 0, 0.1)', color: '#FF9500' }}>
              <Clock size={18} />
            </div>
          </div>
          <div className={cardStyles.value} style={{ color: pendingAmount > 0 ? '#FF9500' : 'inherit' }}>₹{pendingAmount.toLocaleString()}</div>
          <div className={cardStyles.trending}>
            {pendingCount} pending {pendingCount === 1 ? 'bill' : 'bills'}
          </div>
        </div>
        <div className={cardStyles.card} style={{ borderLeft: '4px solid var(--primary)' }}>
          <div className={cardStyles.header}>
            <span className={cardStyles.label}>Total Invoices</span>
            <div className={cardStyles.icon} style={{ background: 'rgba(255, 59, 48, 0.1)', color: 'var(--primary)' }}>
              <FileText size={18} />
            </div>
          </div>
          <div className={cardStyles.value}>{bills.length}</div>
          <div className={cardStyles.trending}>All time</div>
        </div>
      </section>

      {/* Search Bar */}
      <div className={cardStyles.card} style={{ flexDirection: 'row', padding: '12px 20px', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
         <Search size={20} color="var(--text-muted)" />
         <input 
            type="text" 
            placeholder="Search by invoice ID or customer name..."
            style={{ border: 'none', background: 'transparent', outline: 'none', flex: 1, fontSize: '15px', color: 'var(--text-main)', fontWeight: 600 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
         />
      </div>

      {/* Bills Table */}
      <Table 
        columns={[
          { key: 'createdAt', label: 'Invoice', render: (val: any) => (
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ 
                  width: '36px', height: '36px', 
                  background: 'rgba(255, 59, 48, 0.08)', color: 'var(--primary)',
                  borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                   <FileText size={18} />
                </div>
                <div>
                   <p style={{ fontWeight: 800, fontSize: '14px' }}>INV-{val._id.substring(0, 8).toUpperCase()}</p>
                   <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{new Date(val.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                </div>
             </div>
          )},
          { key: 'customer', label: 'Customer', render: (val: any) => (
             <div>
               <p style={{ fontWeight: 800 }}>{val.customer?.name || 'Guest'}</p>
               <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{val.customer?.phone || '—'}</p>
             </div>
          )},
          { key: 'service', label: 'Service', render: (val: any) => (
             <div>
               <p style={{ fontWeight: 700, fontSize: '13px' }}>
                 {val.appointment?.service?.name || val.items?.[0]?.name || '—'}
               </p>
               {val.appointment?.staff?.name && (
                 <p style={{ fontSize: '10px', color: 'var(--text-muted)' }}>by {val.appointment.staff.name}</p>
               )}
             </div>
          )},
          { key: 'total', label: 'Amount', render: (val: any) => (
             <div>
               <span style={{ fontWeight: 900, fontSize: '1.1rem' }}>₹{val.total}</span>
               {val.discount > 0 && (
                 <p style={{ fontSize: '10px', color: '#34C759', fontWeight: 700 }}>-₹{val.discount} discount</p>
               )}
             </div>
          )},
          { key: 'paymentMethod', label: 'Payment', render: (val: any) => (
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CreditCard size={14} color="var(--text-muted)" />
                <span style={{ fontWeight: 700, fontSize: '12px', textTransform: 'uppercase' }}>{val.paymentMethod}</span>
             </div>
          )},
          { key: 'paymentStatus', label: 'Status', render: (val: any) => (
             <span style={{ 
               background: val.paymentStatus === 'PAID' ? 'rgba(52, 199, 89, 0.1)' : val.paymentStatus === 'PARTIAL' ? 'rgba(255, 149, 0, 0.1)' : 'rgba(255, 59, 48, 0.1)',
               color: val.paymentStatus === 'PAID' ? '#34C759' : val.paymentStatus === 'PARTIAL' ? '#FF9500' : '#FF3B30',
               padding: '4px 12px', borderRadius: '12px',
               fontSize: '11px', fontWeight: 800, textTransform: 'uppercase'
             }}>{val.paymentStatus}</span>
          )},
          { key: 'actions', label: 'Actions', render: (val: any) => (
             <div style={{ display: 'flex', gap: '0.5rem' }}>
                {val.paymentStatus !== 'PAID' && (
                  <button 
                    className={styles.pageBtn} 
                    style={{ padding: '6px 12px', color: '#34C759', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 700 }} 
                    title="Mark as Paid"
                    onClick={() => handleUpdateStatus(val._id, 'PAID')}
                  >
                     <CheckCircle size={14} /> Paid
                  </button>
                )}
                <button 
                  className={styles.pageBtn} 
                  style={{ 
                    padding: '6px 12px', color: 'white', background: '#25D366', 
                    borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px', 
                    fontSize: '11px', fontWeight: 700, border: 'none', cursor: 'pointer',
                    opacity: sendingId === val._id ? 0.5 : 1
                  }} 
                  title="Send Bill via WhatsApp"
                  onClick={() => handleSendBill(val._id)}
                  disabled={sendingId === val._id}
                >
                   <Send size={12} /> {sendingId === val._id ? '...' : 'Send'}
                </button>
             </div>
          )}
        ]}
        data={bills}
      />

      {/* Generate Bill Modal */}
      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setSelectedCustomer(null); setCustomerBills([]); }} title="Generate Invoice">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Customer Select */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontWeight: 700, fontSize: '0.85rem' }}>Select Customer</label>
            <select 
              required
              className={styles.input}
              value={formData.customer}
              onChange={e => handleCustomerSelect(e.target.value)}
            >
              <option value="">Choose Customer...</option>
              {customers.map(c => <option key={c._id} value={c._id}>{c.name} — {c.phone}</option>)}
            </select>
          </div>

          {/* Customer Info Card */}
          {selectedCustomer && (
            <div style={{ 
              padding: '1rem', borderRadius: '14px', 
              background: 'rgba(52, 199, 89, 0.05)', border: '1px solid rgba(52, 199, 89, 0.15)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ 
                  width: '40px', height: '40px', borderRadius: '12px',
                  background: 'rgba(52, 199, 89, 0.1)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center'
                }}>
                  <User size={18} color="#34C759" />
                </div>
                <div>
                  <p style={{ fontWeight: 800 }}>{selectedCustomer.name}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{selectedCustomer.visitCount || 0} visits • {selectedCustomer.loyaltyPoints || 0} pts</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={handleDownloadPDF}
                style={{
                  background: 'white', color: 'var(--primary)', border: '1px solid var(--primary)',
                  padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 800,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                }}
              >
                <FileText size={14} /> Download Statement
              </button>
            </div>
          )}

          {/* Recent Services (auto-fetched) */}
          {customerBills.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={14} color="var(--primary)" /> Recent Services
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {customerBills.map((b: any) => (
                  <div key={b._id} style={{ 
                    padding: '8px 12px', borderRadius: '10px', background: 'var(--bg-main)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    border: '1px solid var(--border-light)', fontSize: '12px'
                  }}>
                    <span style={{ fontWeight: 700 }}>
                      {b.appointment?.service?.name || b.items?.[0]?.name || 'Service'}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontWeight: 800 }}>₹{b.total}</span>
                      <span style={{ 
                        fontSize: '9px', fontWeight: 800, textTransform: 'uppercase',
                        color: b.paymentStatus === 'PAID' ? '#34C759' : '#FF3B30' 
                      }}>{b.paymentStatus}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Service / Item */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontWeight: 700, fontSize: '0.85rem' }}>Service / Item</label>
            <input 
              required
              className={styles.input}
              value={formData.items[0].name}
              onChange={e => {
                const newItems = [...formData.items];
                newItems[0].name = e.target.value;
                setFormData({...formData, items: newItems});
              }}
              placeholder="e.g. Haircut & Facial"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontWeight: 700, fontSize: '0.85rem' }}>Amount (₹)</label>
              <input 
                type="number" required className={styles.input}
                value={formData.items[0].price}
                onChange={e => {
                  const newItems = [...formData.items];
                  newItems[0].price = Number(e.target.value);
                  setFormData({...formData, items: newItems});
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontWeight: 700, fontSize: '0.85rem' }}>Discount (₹)</label>
              <input 
                type="number" className={styles.input}
                value={formData.discount}
                onChange={e => setFormData({...formData, discount: Number(e.target.value)})}
                placeholder="0"
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontWeight: 700, fontSize: '0.85rem' }}>Payment Method</label>
              <select 
                className={styles.input}
                value={formData.paymentMethod}
                onChange={e => setFormData({...formData, paymentMethod: e.target.value})}
              >
                <option value="CASH">CASH</option>
                <option value="CARD">CARD</option>
                <option value="UPI">UPI</option>
                <option value="CREDIT">CREDIT</option>
              </select>
            </div>
          </div>

          {/* Total Preview */}
          <div style={{ 
            background: 'var(--bg-main)', padding: '1rem 1.25rem', borderRadius: '14px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-muted)' }}>TOTAL PAYABLE</span>
            <span style={{ fontWeight: 900, fontSize: '1.5rem', color: 'var(--primary)' }}>
              ₹{Math.max(0, Number(formData.items[0].price) - Number(formData.discount || 0))}
            </span>
          </div>

          <button 
            type="submit"
            style={{ 
              background: 'var(--primary)', color: 'white', 
              padding: '14px', borderRadius: '14px', fontWeight: 800,
              border: 'none', marginTop: '0.25rem', cursor: 'pointer',
              fontSize: '15px'
            }}
          >
            Finalize Invoice
          </button>
        </form>
      </Modal>
    </div>
  );
}
