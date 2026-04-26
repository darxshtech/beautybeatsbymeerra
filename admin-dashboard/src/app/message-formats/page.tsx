"use client";

import { useState, useEffect } from 'react';
import { MessageSquare, Save, Eye, Sparkles, Clock, Star } from 'lucide-react';
import styles from '@/styles/layout/Dashboard.module.css';
import cardStyles from '@/styles/components/Card.module.css';
import { apiRequest } from '@/services/api';

const ICONS: Record<string, any> = {
  SPECIAL_EVENT: Sparkles,
  APPOINTMENT_REMINDER: Clock,
  REVIEW_REQUEST: Star
};

const COLORS: Record<string, string> = {
  SPECIAL_EVENT: '#FF3B30',
  APPOINTMENT_REMINDER: '#007AFF',
  REVIEW_REQUEST: '#34C759'
};

export default function MessageFormats() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const fetchTemplates = async () => {
    try {
      const json = await apiRequest('/message-templates');
      if (json.success) setTemplates(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTemplates(); }, []);

  const handleSave = async (key: string) => {
    const tpl = templates.find(t => t.key === key);
    if (!tpl) return;
    setSaving(key);
    try {
      const res = await apiRequest(`/message-templates/${key}`, {
        method: 'PUT',
        body: {
          messageBody: tpl.messageBody,
          discountPercent: tpl.discountPercent,
          isActive: tpl.isActive
        }
      });
      if (res.success) {
        alert('Template saved successfully!');
        fetchTemplates();
      }
    } catch (err) {
      alert('Failed to save template');
    } finally {
      setSaving(null);
    }
  };

  const updateField = (key: string, field: string, value: any) => {
    setTemplates(prev => prev.map(t => t.key === key ? { ...t, [field]: value } : t));
  };

  const getPreview = (tpl: any) => {
    return tpl.messageBody
      .replace(/\{\{name\}\}/g, 'Priya')
      .replace(/\{\{event\}\}/g, 'Birthday')
      .replace(/\{\{coupon\}\}/g, 'BB-BDAY-A1B2C3')
      .replace(/\{\{discount\}\}/g, tpl.discountPercent?.toString() || '20')
      .replace(/\{\{service\}\}/g, 'Facial Treatment')
      .replace(/\{\{time\}\}/g, '10:00 AM')
      .replace(/\{\{reviewLink\}\}/g, 'beautybeats.in/review');
  };

  if (loading) return <div className={styles.container}>Loading templates...</div>;

  return (
    <div className={styles.container}>
      <header className={styles.sectionHeader}>
        <h2 className={styles.title}>Message Format Editor</h2>
        <p className={styles.subtitle}>Customize your WhatsApp message templates for each notification type. Use placeholders like {'{{name}}'}, {'{{service}}'}, {'{{coupon}}'} etc.</p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {templates.map(tpl => {
          const Icon = ICONS[tpl.key] || MessageSquare;
          const color = COLORS[tpl.key] || '#FF9500';
          
          return (
            <div key={tpl.key} className={cardStyles.card} style={{ gap: '1.5rem', borderLeft: `4px solid ${color}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ 
                    width: '42px', height: '42px', borderRadius: '12px',
                    background: `${color}15`, color: color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Icon size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 800, fontSize: '1.1rem' }}>{tpl.label}</h3>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>{tpl.key}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    onClick={() => setPreview(preview === tpl.key ? null : tpl.key)}
                    style={{ 
                      padding: '8px 16px', borderRadius: '10px', border: '1px solid var(--border-light)',
                      background: preview === tpl.key ? `${color}15` : 'transparent', color: preview === tpl.key ? color : 'var(--text-muted)',
                      fontWeight: 700, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                    }}
                  >
                    <Eye size={14} /> {preview === tpl.key ? 'Hide' : 'Preview'}
                  </button>
                  <button 
                    onClick={() => handleSave(tpl.key)}
                    disabled={saving === tpl.key}
                    style={{ 
                      padding: '8px 16px', borderRadius: '10px', border: 'none',
                      background: color, color: 'white',
                      fontWeight: 700, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                      opacity: saving === tpl.key ? 0.5 : 1
                    }}
                  >
                    <Save size={14} /> {saving === tpl.key ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>

              {/* Message Body Editor */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Message Body</label>
                <textarea
                  className={styles.input}
                  style={{ minHeight: '120px', resize: 'vertical', lineHeight: '1.6', fontFamily: 'inherit' }}
                  value={tpl.messageBody}
                  onChange={e => updateField(tpl.key, 'messageBody', e.target.value)}
                />
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {['{{name}}', '{{event}}', '{{coupon}}', '{{discount}}', '{{service}}', '{{time}}', '{{reviewLink}}'].map(tag => (
                    <span key={tag} style={{ 
                      background: 'var(--bg-main)', padding: '2px 8px', borderRadius: '6px', 
                      fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', border: '1px solid var(--border-light)'
                    }}>{tag}</span>
                  ))}
                </div>
              </div>

              {/* Discount % (only for SPECIAL_EVENT) */}
              {tpl.key === 'SPECIAL_EVENT' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <label style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Discount %</label>
                  <input
                    type="number"
                    className={styles.input}
                    style={{ maxWidth: '100px' }}
                    value={tpl.discountPercent}
                    onChange={e => updateField(tpl.key, 'discountPercent', parseInt(e.target.value) || 0)}
                    min={0}
                    max={100}
                  />
                </div>
              )}

              {/* Live Preview */}
              {preview === tpl.key && (
                <div style={{ 
                  background: '#DCF8C6', padding: '16px 20px', borderRadius: '0 16px 16px 16px',
                  maxWidth: '80%', position: 'relative', fontFamily: 'system-ui', fontSize: '14px', lineHeight: '1.5',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }}>
                  <p style={{ fontWeight: 500, color: '#111', whiteSpace: 'pre-wrap' }}>{getPreview(tpl)}</p>
                  <span style={{ fontSize: '10px', color: '#999', float: 'right', marginTop: '4px' }}>
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ✓✓
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
