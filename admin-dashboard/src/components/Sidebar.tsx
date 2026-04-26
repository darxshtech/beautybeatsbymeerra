"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  CalendarDays, 
  Settings, 
  BarChart3, 
  CreditCard,
  UserCheck, 
  Package, 
  Receipt, 
  Bell, 
  ChevronLeft, 
  ChevronRight,
  TrendingDown,
  MessageSquare,
  Clock,
  Store,
  X
} from 'lucide-react';
import styles from '@/styles/layout/Sidebar.module.css';

const adminMenuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: Receipt, label: 'POS Terminal', href: '/pos' },
  { icon: Users, label: 'Customers', href: '/customers' },
  { icon: Store, label: 'Walk-ins', href: '/walkins' },
  { icon: CalendarDays, label: 'Appointments', href: '/appointments' },
  { icon: Package, label: 'Services', href: '/services' },
  { icon: Receipt, label: 'Billing', href: '/billing' },
  { icon: UserCheck, label: 'Employees', href: '/employees' },
  { icon: Clock, label: 'Attendance Logs', href: '/attendance-logs' },
  { icon: BarChart3, label: 'Inventory', href: '/inventory' },
  { icon: TrendingDown, label: 'Expenses', href: '/expenses' },
  { icon: Bell, label: 'Notifications', href: '/notifications' },
  { icon: MessageSquare, label: 'Message Formats', href: '/message-formats' },
  { icon: BarChart3, label: 'Reports', href: '/reports' },
  { icon: CreditCard, label: 'Subscriptions', href: '/subscriptions' },
];

const staffMenuItems = [
  { icon: LayoutDashboard, label: 'My Portal', href: '/employee-portal' },
  { icon: Clock, label: 'Attendance', href: '/employee-portal?tab=attendance' },
  { icon: Bell, label: 'Notifications', href: '/employee-portal?tab=notifications' },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();

  const isStaff = user?.role === 'STAFF';
  const menuItems = isStaff ? staffMenuItems : adminMenuItems;

  return (
    <aside className={`${collapsed ? styles.sidebarCollapsed : styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
      <div className={styles.header}>
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-gray-100">
               <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <h1 className={styles.logo}>BeautyBeats</h1>
          </div>
        )}
        
        {/* Mobile Close Button */}
        <button className="lg:hidden p-2 text-gray-500" onClick={onClose}>
          <X size={24} />
        </button>

        {/* Desktop Collapse Button */}
        <button className={`${styles.collapseBtn} hidden lg:flex`} onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className={styles.nav}>
        {menuItems.map((item) => {
          const active = pathname === item.href || (item.href.includes('?') && pathname === item.href.split('?')[0]);
          return (
            <Link key={item.label} href={item.href} className={active ? styles.linkActive : styles.link}>
              <item.icon size={22} className={active ? styles.iconActive : styles.icon} />
              {(!collapsed || isOpen) && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
