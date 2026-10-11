"use client";

import { useState, useEffect } from 'react';
import { 
  IndianRupee, 
  CreditCard, 
  Wallet, 
  Search, 
  FileText, 
  CheckCircle, 
  Clock, 
  Filter, 
  AlertCircle, 
  Tag as TagIcon,
  RefreshCw,
  PlusCircle,
  X,
  CheckCircle2,
  Zap,
  ArrowDownLeft,
  ExternalLink,
  Landmark,
  Download,
  FileSpreadsheet,
  Sparkles,
  HelpCircle,
  Copy
} from 'lucide-react';
import Link from 'next/link';
import styles from '@/styles/layout/Dashboard.module.css';
import cardStyles from '@/styles/components/Card.module.css';
import Table from '@/components/Table';
import { apiRequest } from '@/services/api';

export default function Transactions() {
  const [viewMode, setViewMode] = useState<'LIVE_TRANSACTIONS' | 'BILLS'>('LIVE_TRANSACTIONS');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [bills, setBills] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalVolume: 0, upiVolume: 0, count: 0 });
  const [bankDetails, setBankDetails] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("ALL"); // ALL, CLIENT_WEBSITE_BOOKING, WALKIN_POS, OFFLINE_SALON, OTHER
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Statement Fetch & Sync State
  const [fetchingStatements, setFetchingStatements] = useState(false);
  const [statementSuccessMsg, setStatementSuccessMsg] = useState<string | null>(null);
  const [lastFetchedTime, setLastFetchedTime] = useState<Date | null>(null);
  const [autoFetchEnabled, setAutoFetchEnabled] = useState(false);

  // Statement Import Modal State
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState("");
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);

  // Sync Modal State
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncAmount, setSyncAmount] = useState("");
  const [syncCustomer, setSyncCustomer] = useState("");
  const [syncPhone, setSyncPhone] = useState("");
  const [syncUtr, setSyncUtr] = useState("");
  const [syncTag, setSyncTag] = useState("CLIENT_WEBSITE_BOOKING");
  const [syncing, setSyncing] = useState(false);

  const fetchData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError(null);

      // Fetch live transactions
      const res = await apiRequest(`/transactions?search=${search}&tag=${activeTag}`);
      if (res.success) {
        setTransactions(res.data || []);
        if (res.stats) setStats(res.stats);
      }

      // Fetch fallback bills ledger
      const billsRes = await apiRequest(`/billing?search=${search}`).catch(() => null);
      if (billsRes && billsRes.success) {
        setBills(billsRes.data || []);
      }

      // Fetch bank configuration
      const settingsRes = await apiRequest('/settings/salon').catch(() => null);
      if (settingsRes?.success && settingsRes.data?.bankDetails) {
        setBankDetails(settingsRes.data.bankDetails);
        if (settingsRes.data.bankDetails.lastStatementFetchedAt) {
          setLastFetchedTime(new Date(settingsRes.data.bankDetails.lastStatementFetchedAt));
        }
      }
    } catch (err: any) {
      console.error('Error fetching transactions:', err);
      if (!silent) setError(err.message || 'Error fetching transactions');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, activeTag]);

  // Fetch / Sync Live Statements from Bank Feed
  const handleFetchStatements = async (isBackground = false) => {
    if (!isBackground) setFetchingStatements(true);
    setStatementSuccessMsg(null);
    try {
      const res = await apiRequest('/transactions/fetch-statements');
      if (res.success) {
        setLastFetchedTime(new Date());
        if (!isBackground) {
          setStatementSuccessMsg(res.message);
          setTimeout(() => setStatementSuccessMsg(null), 6000);
        }
        await fetchData(true);
      }
    } catch (err: any) {
      if (!isBackground) {
        alert(err.message || 'Failed to fetch bank statements');
      }
    } finally {
      if (!isBackground) setFetchingStatements(false);
    }
  };

  // Automated Periodic Statement Fetch (when enabled)
  useEffect(() => {
    if (!autoFetchEnabled) return;
    const interval = setInterval(() => {
      handleFetchStatements(true);
    }, 20000);
    return () => clearInterval(interval);
  }, [autoFetchEnabled]);

  // Handle Statement CSV / SMS Import
  const handleImportStatement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importText.trim()) return;
    setImporting(true);
    setImportResult(null);

    try {
      const res = await apiRequest('/transactions/import-statement', {
        method: 'POST',
        body: { statementText: importText }
      });
      if (res.success) {
        setImportResult(res);
        setImportText("");
        await fetchData(true);
        setTimeout(() => {
          setShowImportModal(false);
          setImportResult(null);
        }, 3000);
      }
    } catch (err: any) {
      alert(err.message || 'Error processing statement');
    } finally {
      setImporting(false);
    }
  };

  const handleSyncSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!syncAmount) return;
    setSyncing(true);

    try {
      const res = await apiRequest('/transactions/sync', {
        method: 'POST',
        body: {
          amount: Number(syncAmount),
          customerName: syncCustomer || 'Bank Transfer / UPI',
          customerPhone: syncPhone,
          utrNumber: syncUtr || `UTR-${Date.now().toString().slice(-8)}`,
          tag: syncTag,
          paymentMethod: 'UPI',
          status: 'RECEIVED'
        }
      });

      if (res.success) {
        setShowSyncModal(false);
        setSyncAmount("");
        setSyncCustomer("");
        setSyncPhone("");
        setSyncUtr("");
        fetchData();
      }
    } catch (err: any) {
      alert(err.message || 'Error syncing transaction');
    } finally {
      setSyncing(false);
    }
  };

  const getTagBadge = (tag: string) => {
    switch (tag) {
      case 'CLIENT_WEBSITE_BOOKING':
        return { label: 'Website Booking (UPI)', bg: 'rgba(99, 102, 241, 0.1)', color: '#6366F1', border: 'rgba(99, 102, 241, 0.2)' };
      case 'WALKIN_POS':
        return { label: 'Walk-in POS', bg: 'rgba(16, 185, 129, 0.1)', color: '#10B981', border: 'rgba(16, 185, 129, 0.2)' };
      case 'OFFLINE_SALON':
        return { label: 'Salon Offline', bg: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B', border: 'rgba(245, 158, 11, 0.2)' };
      default:
        return { label: 'Other Account Credit', bg: 'rgba(14, 165, 233, 0.1)', color: '#0EA5E9', border: 'rgba(14, 165, 233, 0.2)' };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'MATCHED':
        return { label: 'Matched & Booked', bg: 'rgba(34, 197, 94, 0.1)', color: '#16A34A' };
      case 'RECEIVED':
        return { label: 'Live Received', bg: 'rgba(59, 130, 246, 0.1)', color: '#2563EB' };
      default:
        return { label: 'Pending Match', bg: 'rgba(249, 115, 22, 0.1)', color: '#EA580C' };
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.sectionHeader} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <div>
          <h2 className={styles.title}>Account Transactions & Live Sync</h2>
          <p className={styles.subtitle}>Direct UPI bank account sync and automatic statement fetching for client bookings.</p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
          {/* Fetch Live Statements Action */}
          <button
            onClick={() => handleFetchStatements(false)}
            disabled={fetchingStatements}
            style={{
              padding: '10px 18px',
              borderRadius: '14px',
              border: 'none',
              background: '#16A34A',
              color: 'white',
              fontWeight: 800,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(22, 163, 74, 0.28)',
              opacity: fetchingStatements ? 0.7 : 1
            }}
          >
            <Download size={14} className={fetchingStatements ? 'animate-bounce' : ''} />
            {fetchingStatements ? 'Fetching Statements...' : 'Fetch Statements'}
          </button>

          {/* Import Statement / Paste SMS */}
          <button
            onClick={() => setShowImportModal(true)}
            style={{
              padding: '10px 18px',
              borderRadius: '14px',
              border: '1px solid var(--border-light)',
              background: 'var(--bg-card)',
              color: 'var(--text-main)',
              fontWeight: 800,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <FileSpreadsheet size={14} /> Import Statement / SMS
          </button>

          <button
            onClick={() => fetchData()}
            style={{
              padding: '10px 16px',
              borderRadius: '14px',
              border: '1px solid var(--border-light)',
              background: 'var(--bg-card)',
              color: 'var(--text-main)',
              fontWeight: 800,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>

          <button
            onClick={() => setShowSyncModal(true)}
            style={{
              padding: '10px 18px',
              borderRadius: '14px',
              border: 'none',
              background: 'var(--primary)',
              color: 'white',
              fontWeight: 800,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(235, 30, 60, 0.25)'
            }}
          >
            <PlusCircle size={15} /> Manual Entry
          </button>
        </div>
      </header>

      {/* Statement Success Banner */}
      {statementSuccessMsg && (
        <div style={{
          padding: '1rem 1.25rem',
          borderRadius: '16px',
          background: 'rgba(34, 197, 94, 0.08)',
          border: '1px solid rgba(34, 197, 94, 0.25)',
          color: '#15803D',
          fontSize: '13px',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={18} />
            <span>{statementSuccessMsg}</span>
          </div>
          <button 
            onClick={() => setStatementSuccessMsg(null)}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#15803D' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Live Bank Settlement Status Banner */}
      <div style={{
        margin: '1rem 0 2rem 0',
        padding: '1.25rem 1.5rem',
        borderRadius: '20px',
        background: 'linear-gradient(135deg, rgba(235, 30, 60, 0.04) 0%, rgba(99, 102, 241, 0.04) 100%)',
        border: '1px solid rgba(235, 30, 60, 0.12)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '14px',
            background: 'rgba(235, 30, 60, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)'
          }}>
            <Landmark size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 800, fontSize: '15px', color: 'var(--text-main)' }}>
                {bankDetails?.bankName || 'Axis Bank'} • {bankDetails?.accountHolderName || 'BeautyBeats'}
              </span>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '3px 8px',
                borderRadius: '999px',
                background: 'rgba(34, 197, 94, 0.12)',
                color: '#16A34A',
                fontSize: '11px',
                fontWeight: 800
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16A34A' }} /> Live Settlement Active
              </span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <span>A/c: <strong style={{ color: 'var(--text-main)' }}>{bankDetails?.accountNumber ? '••••' + bankDetails.accountNumber.slice(-4) : '••••3201'}</strong></span>
              <span>IFSC: <strong style={{ color: 'var(--text-main)' }}>{bankDetails?.ifscCode || 'UTIB0001234'}</strong></span>
              <span>UPI ID: <strong style={{ color: 'var(--primary)', fontFamily: 'monospace' }}>{bankDetails?.upiId || 'beautybeats320-3@okaxis'}</strong></span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Auto-Sync Toggle */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            borderRadius: '12px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-light)',
            fontSize: '12px',
            fontWeight: 700
          }}>
            <span style={{ color: autoFetchEnabled ? '#16A34A' : 'var(--text-muted)' }}>
              Auto-Sync (20s)
            </span>
            <input 
              type="checkbox"
              checked={autoFetchEnabled}
              onChange={(e) => setAutoFetchEnabled(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
          </div>

          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Last Synced: <strong style={{ color: 'var(--text-main)' }}>{lastFetchedTime ? lastFetchedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Ready'}</strong>
          </div>

          <Link
            href="/settings"
            style={{
              padding: '8px 16px',
              borderRadius: '12px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-light)',
              color: 'var(--text-main)',
              fontSize: '12px',
              fontWeight: 800,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            Configure Bank & Webhook <ExternalLink size={12} />
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <section className={styles.kpiGrid} style={{ marginBottom: '2rem' }}>
        {/* Total Collected */}
        <div className={cardStyles.card} style={{ borderLeft: '4px solid #34C759' }}>
          <div className={cardStyles.header}>
            <span className={cardStyles.label}>Total Account Volume</span>
            <div className={cardStyles.icon} style={{ background: 'rgba(52, 199, 89, 0.1)', color: '#34C759' }}>
              <IndianRupee size={18} />
            </div>
          </div>
          <div className={cardStyles.value}>₹{(stats.totalVolume || 0).toLocaleString()}</div>
          <div className={cardStyles.trending} style={{ color: '#34C759' }}>
            {transactions.length} live synced entries
          </div>
        </div>

        {/* Website UPI Volume */}
        <div className={cardStyles.card} style={{ borderLeft: '4px solid #6366F1' }}>
          <div className={cardStyles.header}>
            <span className={cardStyles.label}>Website UPI Bookings</span>
            <div className={cardStyles.icon} style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366F1' }}>
              <Zap size={18} />
            </div>
          </div>
          <div className={cardStyles.value}>₹{(stats.upiVolume || 0).toLocaleString()}</div>
          <div className={cardStyles.trending} style={{ color: '#6366F1' }}>
            {transactions.filter(t => t.tag === 'CLIENT_WEBSITE_BOOKING').length} online bookings matched
          </div>
        </div>

        {/* Matched Success */}
        <div className={cardStyles.card} style={{ borderLeft: '4px solid #007AFF' }}>
          <div className={cardStyles.header}>
            <span className={cardStyles.label}>Matched & Settled</span>
            <div className={cardStyles.icon} style={{ background: 'rgba(0, 122, 255, 0.1)', color: '#007AFF' }}>
              <CheckCircle size={18} />
            </div>
          </div>
          <div className={cardStyles.value}>
            {transactions.filter(t => t.status === 'MATCHED').length}
          </div>
          <div className={cardStyles.trending} style={{ color: '#007AFF' }}>
            Direct 1:1 payment matches
          </div>
        </div>

        {/* Unmatched / Received */}
        <div className={cardStyles.card} style={{ borderLeft: '4px solid #FF9500' }}>
          <div className={cardStyles.header}>
            <span className={cardStyles.label}>Awaiting Client Match</span>
            <div className={cardStyles.icon} style={{ background: 'rgba(255, 149, 0, 0.1)', color: '#FF9500' }}>
              <Clock size={18} />
            </div>
          </div>
          <div className={cardStyles.value} style={{ color: '#FF9500' }}>
            {transactions.filter(t => t.status === 'RECEIVED').length}
          </div>
          <div className={cardStyles.trending}>
            Live credits ready to pair
          </div>
        </div>
      </section>

      {/* Filter and Search Section */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        {/* Tag Filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', background: 'var(--bg-card)', padding: '6px', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
          {[
            { id: 'ALL', label: 'All Channels' },
            { id: 'CLIENT_WEBSITE_BOOKING', label: 'Website Bookings (UPI)' },
            { id: 'WALKIN_POS', label: 'Walk-in POS' },
            { id: 'OFFLINE_SALON', label: 'Salon Offline' }
          ].map(tag => (
            <button
              key={tag.id}
              onClick={() => setActiveTag(tag.id)}
              style={{
                padding: '8px 16px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer',
                background: activeTag === tag.id ? 'var(--primary)' : 'transparent',
                color: activeTag === tag.id ? 'white' : 'var(--text-muted)'
              }}
            >
              {tag.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className={cardStyles.card} style={{ flex: '1', minWidth: '250px', maxWidth: '380px', flexDirection: 'row', padding: '10px 18px', alignItems: 'center', gap: '0.75rem', marginBottom: 0 }}>
          <Search size={18} color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder="Search Reference, UTR, or Customer..."
            style={{ border: 'none', background: 'transparent', outline: 'none', flex: 1, fontSize: '13px', color: 'var(--text-main)', fontWeight: 600 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1.5rem', background: 'rgba(255, 59, 48, 0.05)', border: '1px solid rgba(255, 59, 48, 0.15)', borderRadius: '16px', color: '#FF3B30' }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      ) : transactions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3.5rem', background: 'var(--bg-card)', borderRadius: '24px', border: '1px solid var(--border-light)' }}>
          <Zap size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <h3 style={{ fontWeight: 800, fontSize: '18px', marginBottom: '0.25rem' }}>No Transactions Synced Yet</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '450px', margin: '0 auto 1.5rem' }}>
            Live transactions from client website UPI payments will show here automatically. You can also fetch live statements or import bank SMS.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button
              onClick={() => handleFetchStatements(false)}
              style={{
                padding: '10px 20px',
                borderRadius: '12px',
                border: 'none',
                background: '#16A34A',
                color: 'white',
                fontWeight: 800,
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              Fetch Statements Now
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              style={{
                padding: '10px 20px',
                borderRadius: '12px',
                border: '1px solid var(--border-light)',
                background: 'var(--bg-card)',
                color: 'var(--text-main)',
                fontWeight: 800,
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              Import Statement / SMS
            </button>
          </div>
        </div>
      ) : (
        <Table 
          columns={[
            { key: 'referenceId', label: 'Transaction / Ref', render: (val: any) => (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ 
                  width: '34px', height: '34px', 
                  background: 'rgba(235, 30, 60, 0.08)', color: 'var(--primary)',
                  borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                   <ArrowDownLeft size={16} />
                </div>
                <div>
                   <p style={{ fontWeight: 800, fontSize: '13px', fontFamily: 'monospace' }}>{val.referenceId}</p>
                   <p style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                     {new Date(val.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true, month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                   </p>
                </div>
              </div>
            )},
            { key: 'tag', label: 'Payment Tag & Channel', render: (val: any) => {
              const badge = getTagBadge(val.tag);
              return (
                <div>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: 800,
                    background: badge.bg,
                    color: badge.color,
                    border: `1px solid ${badge.border}`
                  }}>
                    <TagIcon size={11} /> {badge.label}
                  </span>
                  {val.utrNumber && (
                    <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px', fontFamily: 'monospace' }}>
                      UTR: {val.utrNumber}
                    </p>
                  )}
                </div>
              );
            }},
            { key: 'customerName', label: 'Customer', render: (val: any) => (
              <div>
                <p style={{ fontWeight: 800, fontSize: '13px' }}>{val.customerName || 'Online Client'}</p>
                <p style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{val.customerPhone || '—'}</p>
              </div>
            )},
            { key: 'status', label: 'Match Status', render: (val: any) => {
              const badge = getStatusBadge(val.status);
              return (
                <span style={{ 
                  background: badge.bg,
                  color: badge.color,
                  padding: '5px 12px',
                  borderRadius: '10px',
                  fontSize: '11px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <CheckCircle2 size={12} /> {badge.label}
                </span>
              );
            }},
            { key: 'amount', label: 'Amount Received', render: (val: any) => (
              <span style={{ fontWeight: 950, fontSize: '1.05rem', color: 'var(--text-main)' }}>
                ₹{val.amount.toLocaleString()}
              </span>
            )}
          ]}
          data={transactions}
        />
      )}

      {/* Import Statement Modal */}
      {showImportModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-light)',
            borderRadius: '24px',
            padding: '2rem',
            width: '100%',
            maxWidth: '560px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 900 }}>Import Bank Statement or SMS Alert</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Paste bank credit SMS or CSV statement rows. Credits will be parsed & matched automatically.</p>
              </div>
              <button onClick={() => setShowImportModal(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleImportStatement} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  Paste Bank SMS Alert / CSV Rows *
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder={`Example SMS:
Dear Customer, A/c XX3201 is credited with Rs 500.00 on 11-Oct-26 by UPI/991122334455/BB-123456-7890/Axis Bank

Or CSV row:
11/10/2026, UPI-Client, 991122334455, 500, CR`}
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '14px',
                    border: '1px solid var(--border-light)',
                    background: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    lineHeight: '1.5',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>

              {importResult && (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '12px',
                  background: 'rgba(34, 197, 94, 0.1)',
                  color: '#16A34A',
                  fontSize: '12px',
                  fontWeight: 700
                }}>
                  {importResult.message}
                </div>
              )}

              <div style={{
                padding: '10px 14px',
                borderRadius: '12px',
                background: 'rgba(99, 102, 241, 0.05)',
                border: '1px solid rgba(99, 102, 241, 0.15)',
                fontSize: '11px',
                color: '#6366F1'
              }}>
                💡 <strong>Tip:</strong> You can paste multiple SMS alerts at once! Each credit is verified, logged, and checked against client appointments waiting for confirmation.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '12px',
                    border: '1px solid var(--border-light)',
                    background: 'transparent',
                    color: 'var(--text-muted)',
                    fontWeight: 800,
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={importing}
                  style={{
                    padding: '10px 22px',
                    borderRadius: '12px',
                    border: 'none',
                    background: '#16A34A',
                    color: 'white',
                    fontWeight: 800,
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  {importing ? 'Processing...' : 'Import & Match'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sync Transaction Modal */}
      {showSyncModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-light)',
            borderRadius: '24px',
            padding: '2rem',
            width: '100%',
            maxWidth: '480px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 900 }}>Sync Account Transaction</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Record incoming bank credit or UPI transfer to match with customer booking.</p>
              </div>
              <button onClick={() => setShowSyncModal(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSyncSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Amount Received (₹) *
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 500"
                  value={syncAmount}
                  onChange={(e) => setSyncAmount(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '14px',
                    border: '1px solid var(--border-light)',
                    background: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    fontSize: '15px',
                    fontWeight: 700,
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Channel / Tag *
                </label>
                <select
                  value={syncTag}
                  onChange={(e) => setSyncTag(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '14px',
                    border: '1px solid var(--border-light)',
                    background: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    fontSize: '13px',
                    fontWeight: 700,
                    outline: 'none'
                  }}
                >
                  <option value="CLIENT_WEBSITE_BOOKING">Client Website Booking (UPI)</option>
                  <option value="WALKIN_POS">Walk-in POS</option>
                  <option value="OFFLINE_SALON">Salon Offline</option>
                  <option value="OTHER">Other Bank Credit</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  UTR Number (Bank Ref)
                </label>
                <input
                  type="text"
                  placeholder="12-digit UPI UTR (e.g. 428190281923)"
                  value={syncUtr}
                  onChange={(e) => setSyncUtr(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '14px',
                    border: '1px solid var(--border-light)',
                    background: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    fontSize: '13px',
                    fontWeight: 600,
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Customer Name
                  </label>
                  <input
                    type="text"
                    placeholder="Sender Name"
                    value={syncCustomer}
                    onChange={(e) => setSyncCustomer(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '14px',
                      border: '1px solid var(--border-light)',
                      background: 'var(--bg-main)',
                      color: 'var(--text-main)',
                      fontSize: '13px',
                      fontWeight: 600,
                      outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Phone (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Phone"
                    value={syncPhone}
                    onChange={(e) => setSyncPhone(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '14px',
                      border: '1px solid var(--border-light)',
                      background: 'var(--bg-main)',
                      color: 'var(--text-main)',
                      fontSize: '13px',
                      fontWeight: 600,
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowSyncModal(false)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '12px',
                    border: '1px solid var(--border-light)',
                    background: 'transparent',
                    color: 'var(--text-muted)',
                    fontWeight: 800,
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={syncing}
                  style={{
                    padding: '10px 22px',
                    borderRadius: '12px',
                    border: 'none',
                    background: 'var(--primary)',
                    color: 'white',
                    fontWeight: 800,
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  {syncing ? 'Syncing...' : 'Confirm Sync'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
