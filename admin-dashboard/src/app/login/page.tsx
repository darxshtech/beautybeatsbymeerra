"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import styles from '@/styles/layout/Login.module.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Dynamic Auth API Integration (Module 0/Security Requirement)
      const res = await fetch('http://127.0.0.1:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();
      if (json.success) {
        login(json);
      } else {
        alert(json.error || 'Authentication denied.');
      }
    } catch (err) {
      console.error(err);
      alert('Network failure. Please check the backend connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={`${styles.authCard} glass`}>
        <header className={styles.header}>
           <div style={{ 
             width: '64px', 
             height: '64px', 
             background: 'var(--primary)', 
             borderRadius: '18px', 
             display: 'flex', 
             alignItems: 'center', 
             justifyContent: 'center',
             margin: '0 auto 1.5rem',
             boxShadow: '0 8px 16px rgba(255, 59, 48, 0.2)'
           }}>
              <h1 style={{ color: 'white', fontWeight: 900, fontSize: '1.5rem', margin: 0 }}>B</h1>
           </div>
           <h2 className={styles.title}>System Control induction</h2>
           <p className={styles.subtitle}>Execute your administrative authority to manage the salon's ecosystem.</p>
        </header>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Control Email</label>
            <input 
              type="email" 
              className={styles.input} 
              placeholder="e.g. admin@beautybeats.in" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Induction Key</label>
            <input 
              type="password" 
              className={styles.input} 
              placeholder="••••••••••••" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button className={styles.submitBtn} type="submit" disabled={loading}>
            {loading ? 'Authenticating...' : 'Establish Session'}
          </button>
        </form>
      </div>
    </div>
  );
}
