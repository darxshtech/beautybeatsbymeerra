"use client";

import { motion } from 'framer-motion';
import { 
  Users, 
  Calendar, 
  Banknote, 
  TrendingUp, 
  Clock, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

const stats = [
  { name: 'Total Revenue', value: '₹12,450', change: '+12.5%', icon: Banknote, color: 'text-green-600', bg: 'bg-green-50' },
  { name: 'Appointments', value: '48', change: '+4', icon: Calendar, color: 'text-primary', bg: 'bg-red-50' },
  { name: 'New Customers', value: '12', change: '+18%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
  { name: 'Reports', value: '98%', change: 'Normal', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
];

const recentAppointments = [
  { id: 1, customer: 'Meera Mam', service: 'Full Facial', time: '10:30 AM', status: 'Completed' },
  { id: 2, customer: 'Rahul Sharma', service: 'Hair Cut', time: '11:15 AM', status: 'In Progress' },
  { id: 3, customer: 'Anjali Gupta', service: 'Manicure', time: '12:00 PM', status: 'Pending' },
  { id: 4, customer: 'Suresh Patil', service: 'Spa Massage', time: '01:30 PM', status: 'Pending' },
];

export default function DashboardPage() {
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
              <span className={cn(
                "text-xs font-bold px-2 py-1 rounded-full",
                stat.change.startsWith('+') ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
              )}>
                {stat.change}
              </span>
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
            <button className="text-sm font-semibold text-primary hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {recentAppointments.map((apt) => (
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
                    apt.status === 'In Progress' ? "bg-blue-100 text-blue-700" :
                    "bg-amber-100 text-amber-700"
                  )}>
                    {apt.status}
                  </span>
                  {apt.status === 'Pending' && (
                    <div className="flex gap-1">
                      <button className="p-2 rounded-xl bg-green-50 text-green-600 hover:bg-green-100">
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100">
                        <AlertCircle className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
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
              <p className="text-sm text-white/70 mb-2">Today's Target</p>
              <div className="h-3 w-full bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white w-3/4 rounded-full" />
              </div>
              <p className="text-right text-xs mt-2 font-medium">75% Achieved</p>
            </div>
            <div className="pt-6 border-t border-white/10">
              <h4 className="font-bold mb-4">Quick Insights</h4>
              <ul className="space-y-4 text-sm text-white/80">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-white" />
                  Most booked: Hair Spa
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-white" />
                  Peak hours: 11 AM - 3 PM
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-white" />
                  3 staff members inactive
                </li>
              </ul>
            </div>
            <button className="w-full mt-4 py-3 rounded-2xl bg-white text-primary font-bold hover:bg-gray-50 transition-colors">
              Generate Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
