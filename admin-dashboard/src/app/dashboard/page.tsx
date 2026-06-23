"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Calendar, 
  Banknote, 
  TrendingUp, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Wallet
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiRequest } from '@/services/api';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const json = await apiRequest('/dashboard/stats');
      if (json.success) {
        setData(json.data);
        setError(null);
      } else {
        setError('Failed to fetch dashboard data');
      }
    } catch (err: any) {
      console.error('Error fetching dashboard stats:', err);
      setError(err.message || 'Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 rounded-3xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 text-red-700 dark:text-red-400 flex items-center gap-4">
        <AlertCircle className="w-6 h-6 shrink-0" />
        <div>
          <h4 className="font-bold">Failed to load dashboard</h4>
          <p className="text-sm">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="mt-2 text-xs font-semibold underline hover:no-underline"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const kpis = data?.kpis || {
    totalRevenue: 0,
    totalCashRevenue: 0,
    totalPrepaidRevenue: 0,
    appointmentsToday: 0,
    activeCustomers: 0
  };

  const upcomingAppointments = data?.upcomingAppointments || [];

  const stats = [
    { name: 'Total Revenue', value: `₹${kpis.totalRevenue.toLocaleString()}`, icon: Banknote, color: 'text-green-600', bg: 'bg-green-50' },
    { name: 'Cash Revenue (Paid)', value: `₹${kpis.totalCashRevenue.toLocaleString()}`, icon: Wallet, color: 'text-amber-600', bg: 'bg-amber-50' },
    { name: 'Prepaid Revenue (Paid)', value: `₹${kpis.totalPrepaidRevenue.toLocaleString()}`, icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-50' },
    { name: 'Appointments Today', value: String(kpis.appointmentsToday), icon: Calendar, color: 'text-primary', bg: 'bg-red-50' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h2>
        <p className="text-gray-500 dark:text-gray-400">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-3 rounded-2xl", stat.bg)}>
                <stat.icon className={cn("w-6 h-6", stat.color)} />
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{stat.name}</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Appointments */}
        <div className="lg:col-span-2 p-8 rounded-3xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Upcoming Appointments</h3>
            <a href="/appointments" className="text-sm font-semibold text-primary hover:underline">View All</a>
          </div>
          <div className="space-y-4">
            {upcomingAppointments.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 py-4">No upcoming appointments scheduled.</p>
            ) : (
              upcomingAppointments.map((apt: any) => (
                <div key={apt.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-slate-700">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center font-bold text-gray-600 dark:text-gray-300">
                      {apt.customer.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">{apt.customer}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{apt.service} • {apt.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "text-xs font-bold px-3 py-1 rounded-full",
                      apt.status === 'Completed' ? "bg-green-100 text-green-700" :
                      apt.status === 'In-Progress' ? "bg-blue-100 text-blue-700" :
                      "bg-amber-100 text-amber-700"
                    )}>
                      {apt.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Business Pulse */}
        <div className="p-8 rounded-3xl bg-gradient-to-br from-primary to-primary-dark text-white shadow-xl shadow-red-200 dark:shadow-none">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold">Business Pulse</h3>
            <Clock className="w-6 h-6 text-white/70" />
          </div>
          <div className="space-y-6">
            <div>
              <p className="text-sm text-white/70 mb-2">Active Customers</p>
              <h4 className="text-3xl font-extrabold">{kpis.activeCustomers}</h4>
              <p className="text-xs text-white/60 mt-1">Total registered clients</p>
            </div>
            <div className="pt-6 border-t border-white/10">
              <h4 className="font-bold mb-4">Quick Insights</h4>
              <ul className="space-y-4 text-sm text-white/80">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-white" />
                  Supports Salon & Clinic views
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-white" />
                  Realtime transaction values
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-white" />
                  Unified payment tracking
                </li>
              </ul>
            </div>
            <a href="/reports" className="block w-full mt-4 py-3 rounded-2xl bg-white text-primary text-center font-bold hover:bg-gray-50 transition-colors">
              View Detailed Reports
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
