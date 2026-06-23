"use client";

import { useState, useEffect } from 'react';
import { IndianRupee, CreditCard, Wallet, Calendar, Search, FileText, CheckCircle, Clock, Filter, AlertCircle } from 'lucide-react';
import styles from '@/styles/layout/Dashboard.module.css';
import cardStyles from '@/styles/components/Card.module.css';
import Table from '@/components/Table';
import { apiRequest } from '@/services/api';

export default function Transactions() {
  const [bills, setBills] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("ALL"); // ALL, CASH, PREPAID, PENDING
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const json = await apiRequest(`/billing?search=${search}`);
      if (json.success) {
        setBills(json.data);
        setError(null);
      } else {
        setError('Failed to load transactions');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error fetching transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, [search]);

  // Calculations
  const paidBills = bills.filter(b => b.paymentStatus === 'PAID');
  const cashRevenue = paidBills
    .filter(b => b.paymentMethod === 'CASH')
    .reduce((sum, b) => sum + (b.total || 0), 0);
  
  const prepaidRevenue = paidBills
    .filter(b => b.paymentMethod === 'CARD' || b.paymentMethod === 'UPI')
    .reduce((sum, b) => sum + (b.total || 0), 0);

  const totalRevenue = cashRevenue + prepaidRevenue;

  const outstandingDues = bills
    .filter(b => b.paymentStatus !== 'PAID')
    .reduce((sum, b) => sum + (b.total || 0), 0);

  // Filter logic based on active tab
  const filteredBills = bills.filter(bill => {
    if (activeTab === 'CASH') {
      return bill.paymentMethod === 'CASH' && bill.paymentStatus === 'PAID';
    }
    if (activeTab === 'PREPAID') {
      return (bill.paymentMethod === 'CARD' || bill.paymentMethod === 'UPI') && bill.paymentStatus === 'PAID';
    }
    if (activeTab === 'PENDING') {
      return bill.paymentStatus !== 'PAID';
    }
    return true; // ALL
  });

  return (
    <div className={styles.container}>
      <header className={styles.sectionHeader}>
        <div>
          <h2 className={styles.title}>Transactions Ledger</h2>
          <p className={styles.subtitle}>Track all Cash and Prepaid transactions done yet by your customers.</p>
        </div>
      </header>

      {/* KPI Cards */}
      <section className={styles.kpiGrid} style={{ marginBottom: '2rem' }}>
        {/* Total Collected */}
        <div className={cardStyles.card} style={{ borderLeft: '4px solid #34C759' }}>
          <div className={cardStyles.header}>
            <span className={cardStyles.label}>Total Volume (Paid)</span>
            <div className={cardStyles.icon} style={{ background: 'rgba(52, 199, 89, 0.1)', color: '#34C759' }}>
              <IndianRupee size={18} />
            </div>
          </div>
          <div className={cardStyles.value}>₹{totalRevenue.toLocaleString()}</div>
          <div className={cardStyles.trending} style={{ color: '#34C759' }}>
            {paidBills.length} settled payments
          </div>
        </div>

        {/* Prepaid Volume */}
        <div className={cardStyles.card} style={{ borderLeft: '4px solid #007AFF' }}>
          <div className={cardStyles.header}>
            <span className={cardStyles.label}>Prepaid Volume (Card/UPI)</span>
            <div className={cardStyles.icon} style={{ background: 'rgba(0, 122, 255, 0.1)', color: '#007AFF' }}>
              <CreditCard size={18} />
            </div>
          </div>
          <div className={cardStyles.value}>₹{prepaidRevenue.toLocaleString()}</div>
          <div className={cardStyles.trending}>
            {paidBills.filter(b => b.paymentMethod === 'CARD' || b.paymentMethod === 'UPI').length} online transactions
          </div>
        </div>

        {/* Cash Volume */}
        <div className={cardStyles.card} style={{ borderLeft: '4px solid #FF9500' }}>
          <div className={cardStyles.header}>
            <span className={cardStyles.label}>Cash Volume</span>
            <div className={cardStyles.icon} style={{ background: 'rgba(255, 149, 0, 0.1)', color: '#FF9500' }}>
              <Wallet size={18} />
            </div>
          </div>
          <div className={cardStyles.value}>₹{cashRevenue.toLocaleString()}</div>
          <div className={cardStyles.trending}>
            {paidBills.filter(b => b.paymentMethod === 'CASH').length} cash collections
          </div>
        </div>

        {/* Outstanding Dues */}
        <div className={cardStyles.card} style={{ borderLeft: '4px solid #FF3B30' }}>
          <div className={cardStyles.header}>
            <span className={cardStyles.label}>Outstanding Dues</span>
            <div className={cardStyles.icon} style={{ background: 'rgba(255, 59, 48, 0.1)', color: '#FF3B30' }}>
              <Clock size={18} />
            </div>
          </div>
          <div className={cardStyles.value} style={{ color: '#FF3B30' }}>₹{outstandingDues.toLocaleString()}</div>
          <div className={cardStyles.trending}>
            {bills.filter(b => b.paymentStatus !== 'PAID').length} unpaid invoices
          </div>
        </div>
      </section>

      {/* Filter and Search Section */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-card)', padding: '6px', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
          <button 
            onClick={() => setActiveTab('ALL')}
            style={{
              padding: '8px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: 800, border: 'none', cursor: 'pointer',
              background: activeTab === 'ALL' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'ALL' ? 'white' : 'var(--text-muted)'
            }}
          >
            All Ledger
          </button>
          <button 
            onClick={() => setActiveTab('PREPAID')}
            style={{
              padding: '8px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: 800, border: 'none', cursor: 'pointer',
              background: activeTab === 'PREPAID' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'PREPAID' ? 'white' : 'var(--text-muted)'
            }}
          >
            Prepaid (Card/UPI)
          </button>
          <button 
            onClick={() => setActiveTab('CASH')}
            style={{
              padding: '8px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: 800, border: 'none', cursor: 'pointer',
              background: activeTab === 'CASH' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'CASH' ? 'white' : 'var(--text-muted)'
            }}
          >
            Cash Payments
          </button>
          <button 
            onClick={() => setActiveTab('PENDING')}
            style={{
              padding: '8px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: 800, border: 'none', cursor: 'pointer',
              background: activeTab === 'PENDING' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'PENDING' ? 'white' : 'var(--text-muted)'
            }}
          >
            Outstanding
          </button>
        </div>

        {/* Search */}
        <div className={cardStyles.card} style={{ flex: '1', minWidth: '250px', maxWidth: '400px', flexDirection: 'row', padding: '10px 18px', alignItems: 'center', gap: '0.75rem', marginBottom: 0 }}>
          <Search size={18} color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder="Search invoice or customer..."
            style={{ border: 'none', background: 'transparent', outline: 'none', flex: 1, fontSize: '14px', color: 'var(--text-main)', fontWeight: 600 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1.5rem', background: 'rgba(255, 59, 48, 0.05)', border: '1px solid rgba(255, 59, 48, 0.15)', borderRadius: '16px', color: '#FF3B30' }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      ) : filteredBills.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--bg-card)', borderRadius: '24px', border: '1px solid var(--border-light)' }}>
          <FileText size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <h3 style={{ fontWeight: 800, fontSize: '18px', marginBottom: '0.25rem' }}>No Transactions Found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>There are no records matching your current filter.</p>
        </div>
      ) : (
        <Table 
          columns={[
            { key: '_id', label: 'Invoice', render: (val: any) => (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ 
                  width: '32px', height: '32px', 
                  background: 'rgba(255, 59, 48, 0.08)', color: 'var(--primary)',
                  borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                   <FileText size={16} />
                </div>
                <div>
                   <p style={{ fontWeight: 800, fontSize: '13px' }}>INV-{val._id.substring(0, 8).toUpperCase()}</p>
                   <p style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{new Date(val.createdAt).toLocaleDateString('en-IN')}</p>
                </div>
              </div>
            )},
            { key: 'customer', label: 'Customer', render: (val: any) => (
              <div>
                <p style={{ fontWeight: 800, fontSize: '13px' }}>{val.customer?.name || 'Guest'}</p>
                <p style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{val.customer?.phone || '—'}</p>
              </div>
            )},
            { key: 'items', label: 'Item / Service Detail', render: (val: any) => (
              <div>
                <p style={{ fontWeight: 700, fontSize: '13px' }}>
                  {val.items?.map((item: any) => item.name).join(', ') || 'Service Detail'}
                </p>
                <p style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                  Branch: <span style={{ fontWeight: 700, textTransform: 'uppercase' }}>{val.branch}</span>
                </p>
              </div>
            )},
            { key: 'paymentMethod', label: 'Payment Method', render: (val: any) => {
              const method = val.paymentMethod || 'CASH';
              const isPrepaid = method === 'CARD' || method === 'UPI';
              return (
                <div>
                  <span style={{ 
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    fontWeight: 800, fontSize: '11px', textTransform: 'uppercase',
                    color: isPrepaid ? '#007AFF' : '#FF9500'
                  }}>
                    {isPrepaid ? <CreditCard size={12} /> : <Wallet size={12} />}
                    {method}
                  </span>
                  <p style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{isPrepaid ? 'Prepaid/Online' : 'Cash Desk'}</p>
                </div>
              );
            }},
            { key: 'paymentStatus', label: 'Status', render: (val: any) => (
              <span style={{ 
                background: val.paymentStatus === 'PAID' ? 'rgba(52, 199, 89, 0.1)' : 'rgba(255, 59, 48, 0.1)',
                color: val.paymentStatus === 'PAID' ? '#34C759' : '#FF3B30',
                padding: '4px 10px', borderRadius: '10px',
                fontSize: '10px', fontWeight: 800, textTransform: 'uppercase'
              }}>
                {val.paymentStatus}
              </span>
            )},
            { key: 'total', label: 'Amount', render: (val: any) => (
              <span style={{ fontWeight: 950, fontSize: '1rem', color: 'var(--text-main)' }}>₹{val.total}</span>
            )}
          ]}
          data={filteredBills}
        />
      )}
    </div>
  );
}
