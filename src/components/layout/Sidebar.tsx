import React from 'react';
import { NavLink } from 'react-router-dom';
import { useDemo } from '../../context/DemoContext';
import {
  LayoutDashboard,
  Calendar,
  PlusCircle,
  FolderHeart,
  Bot,
  Radio,
  Stethoscope,
  BarChart3,
  MessageSquareHeart,
  Bell,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  Layers,
  Sparkles,
  Phone,
  PhoneCall
} from 'lucide-react';
import { clsx } from 'clsx';
import { BrandLogo } from '../common/BrandLogo';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const { role, pendingSyncCount, notifications } = useDemo();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const patientNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Call & SMS Assistance', path: '/assistance', icon: PhoneCall, special: true },
    { name: 'Consultations', path: '/consultations', icon: Calendar },
    { name: 'New Consultation', path: '/consultations/new', icon: PlusCircle, highlight: true },
    { name: 'My Cases', path: '/cases', icon: FolderHeart, badge: pendingSyncCount > 0 ? `${pendingSyncCount} sync` : undefined },
    { name: 'Symptom Triage', path: '/triage', icon: Bot },
    { name: 'Network Simulator', path: '/connection', icon: Radio, special: true },
    { name: 'Communications', path: '/communications', icon: Phone },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Feedback Hub', path: '/feedback', icon: MessageSquareHeart },
  ];

  const doctorNavItems = [
    { name: 'Doctor Dashboard', path: '/doctor', icon: Stethoscope },
    { name: 'Call & SMS Assistance', path: '/assistance', icon: PhoneCall, special: true },
    { name: 'Triage Queue', path: '/doctor/queue', icon: Layers, badge: 'Active' },
    { name: 'All Patient Cases', path: '/cases', icon: FolderHeart },
    { name: 'Network Simulator', path: '/connection', icon: Radio, special: true },
    { name: 'Communications', path: '/communications', icon: Phone },
    { name: 'Clinical Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Patient Feedback', path: '/feedback', icon: MessageSquareHeart },
  ];

  const navItems = role === 'doctor' ? doctorNavItems : patientNavItems;

  const bottomNavItems = [
    { name: 'Notifications', path: '/notifications', icon: Bell, badge: unreadCount > 0 ? String(unreadCount) : undefined },
    { name: 'Account Profile', path: '/account', icon: User },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside
      className={clsx(
        'hidden lg:flex flex-col border-r border-neutral-200/80 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/80 backdrop-blur-xl transition-all duration-300 z-30 sticky top-0 h-screen',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-neutral-100 dark:border-neutral-800">
        {!collapsed ? (
          <NavLink to={role === 'doctor' ? '/doctor' : '/dashboard'} className="flex items-center group py-1">
            <BrandLogo variant="full" size="md" className="group-hover:scale-[1.02] transition-transform" />
          </NavLink>
        ) : (
          <NavLink to={role === 'doctor' ? '/doctor' : '/dashboard'} className="mx-auto" title="DocTalk">
            <div className="w-10 h-10 rounded-xl bg-neutral-100/90 dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700/80 flex items-center justify-center shadow-xs hover:scale-105 transition-transform">
              <BrandLogo variant="icon" size="xs" />
            </div>
          </NavLink>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Role Indicator (cleaned up, no "Demo") */}
      {!collapsed && (
        <div className="px-4 py-2.5 border-b border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-800/30">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">
              Active Role
            </span>
            <span className={clsx(
              'px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1',
              role === 'doctor'
                ? 'bg-neutral-100 text-neutral-700 border border-neutral-300 dark:bg-neutral-800 dark:text-neutral-300'
                : 'bg-neutral-100 text-neutral-700 border border-neutral-300 dark:bg-neutral-800 dark:text-neutral-300'
            )}>
              <span className={clsx('w-1.5 h-1.5 rounded-full', role === 'doctor' ? 'bg-neutral-500' : 'bg-neutral-500')}></span>
              {role === 'doctor' ? 'Doctor' : 'Patient'}
            </span>
          </div>
        </div>
      )}

      {/* Main Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className={clsx('text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2 px-3', collapsed && 'text-center')}>
          {collapsed ? '•' : 'Main Menu'}
        </div>

        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/dashboard' || item.path === '/doctor'}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 relative group',
                  isActive
                    ? 'bg-gradient-to-r from-neutral-800 to-neutral-700 dark:from-neutral-200 dark:to-neutral-300 text-white dark:text-black shadow-sm shadow-black/10'
                    : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100/80 dark:hover:bg-neutral-800/60',
                  item.special && !isActive && 'text-neutral-700 dark:text-neutral-300 bg-neutral-50/60 dark:bg-neutral-800/30 border border-neutral-200/50 dark:border-neutral-700/40'
                )
              }
              title={collapsed ? item.name : undefined}
            >
              <Icon className={clsx('w-4 h-4 shrink-0 transition-transform group-hover:scale-110')} />

              {!collapsed && (
                <div className="flex-1 flex items-center justify-between">
                  <span className="truncate">{item.name}</span>
                  {item.badge && (
                    <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200">
                      {item.badge}
                    </span>
                  )}
                  {item.special && !item.badge && (
                    <Sparkles className="w-3.5 h-3.5 text-neutral-400 animate-pulse ml-2" />
                  )}
                </div>
              )}
            </NavLink>
          );
        })}

        <div className={clsx('pt-4 text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2 px-3', collapsed && 'text-center')}>
          {collapsed ? '•' : 'System'}
        </div>

        {bottomNavItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 group',
                  isActive
                    ? 'bg-neutral-200/80 dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold'
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100/60 dark:hover:bg-neutral-800/40'
                )
              }
              title={collapsed ? item.name : undefined}
            >
              <Icon className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform" />
              {!collapsed && (
                <div className="flex-1 flex items-center justify-between">
                  <span>{item.name}</span>
                  {item.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-rose-500 text-white">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Callout */}
      {!collapsed && (
        <div className="p-3 m-3 rounded-2xl bg-gradient-to-br from-neutral-50/90 to-neutral-100/90 dark:from-neutral-800/90 dark:to-neutral-800/50 border border-neutral-200 dark:border-neutral-700/60 text-xs">
          <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300 font-bold mb-1">
            <Radio className="w-3.5 h-3.5 animate-spin" />
            <span>Zero-Drop Engine</span>
          </div>
          <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-snug">
            Adaptive fallback switches audio & offline queue when signals drop.
          </p>
          <NavLink
            to="/connection"
            className="inline-block mt-2 text-[11px] font-bold text-neutral-700 dark:text-neutral-400 hover:underline"
          >
            Test Network Simulator →
          </NavLink>
        </div>
      )}
    </aside>
  );
};
