import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useDemo } from '../../context/DemoContext';
import {
  LayoutDashboard,
  Calendar,
  FolderHeart,
  Radio,
  Menu,
  X,
  Stethoscope,
  Layers,
  Bot,
  BarChart3,
  MessageSquareHeart,
  Bell,
  User,
  Settings,
  PlusCircle,
  Phone,
  PhoneCall
} from 'lucide-react';
import { clsx } from 'clsx';
import { RoleSwitcher } from './RoleSwitcher';
import { BrandLogo } from '../common/BrandLogo';

export const MobileBottomNavigation: React.FC = () => {
  const { role, pendingSyncCount, notifications } = useDemo();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const homePath = role === 'doctor' ? '/doctor' : '/dashboard';
  const consultPath = role === 'doctor' ? '/doctor/queue' : '/consultations';
  const consultLabel = role === 'doctor' ? 'Queue' : 'Consults';

  const moreItems = [
    { name: 'Call & SMS Assistance', path: '/assistance', icon: PhoneCall },
    { name: 'Communications (Twilio SMS)', path: '/communications', icon: Phone },
    { name: 'Symptom Triage (Bot)', path: '/triage', icon: Bot },
    { name: 'New Consultation Entry', path: '/consultations/new', icon: PlusCircle },
    { name: 'Clinical Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Feedback Hub', path: '/feedback', icon: MessageSquareHeart },
    { name: 'Notifications', path: '/notifications', icon: Bell, badge: unreadCount > 0 ? String(unreadCount) : undefined },
    { name: 'Account Profile', path: '/account', icon: User },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Bottom Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-lg">
        <NavLink
          to={homePath}
          end
          className={({ isActive }) =>
            clsx(
              'flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-semibold transition-colors',
              isActive
                ? 'text-cyan-600 dark:text-cyan-400'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            )
          }
        >
          {role === 'doctor' ? <Stethoscope className="w-5 h-5 mb-0.5" /> : <LayoutDashboard className="w-5 h-5 mb-0.5" />}
          <span>Home</span>
        </NavLink>

        <NavLink
          to={consultPath}
          className={({ isActive }) =>
            clsx(
              'flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-semibold transition-colors',
              isActive
                ? 'text-cyan-600 dark:text-cyan-400'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            )
          }
        >
          {role === 'doctor' ? <Layers className="w-5 h-5 mb-0.5" /> : <Calendar className="w-5 h-5 mb-0.5" />}
          <span>{consultLabel}</span>
        </NavLink>

        <NavLink
          to="/cases"
          className={({ isActive }) =>
            clsx(
              'flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-semibold transition-colors relative',
              isActive
                ? 'text-cyan-600 dark:text-cyan-400'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            )
          }
        >
          <FolderHeart className="w-5 h-5 mb-0.5" />
          <span>Cases</span>
          {pendingSyncCount > 0 && (
            <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
          )}
        </NavLink>

        <NavLink
          to="/connection"
          className={({ isActive }) =>
            clsx(
              'flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-semibold transition-colors',
              isActive
                ? 'text-cyan-600 dark:text-cyan-400'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            )
          }
        >
          <Radio className="w-5 h-5 mb-0.5 text-teal-600 dark:text-teal-400" />
          <span>Network</span>
        </NavLink>

        <button
          onClick={() => setDrawerOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white relative"
        >
          <Menu className="w-5 h-5 mb-0.5" />
          <span>More</span>
          {unreadCount > 0 && (
            <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-rose-500"></span>
          )}
        </button>
      </nav>

      {/* Mobile Drawer */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white dark:bg-slate-900 shadow-2xl p-4 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <BrandLogo variant="full" size="sm" />
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-3">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">
                  Demo Workspace
                </div>
                <RoleSwitcher />
              </div>

              <nav className="space-y-1 py-2">
                {moreItems.map(item => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setDrawerOpen(false)}
                      className={({ isActive }) =>
                        clsx(
                          'flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors',
                          isActive
                            ? 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        )
                      }
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-500 text-white">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 text-center">
              DocTalk Demo v2.4 • Offline First Architecture
            </div>
          </div>
        </div>
      )}
    </>
  );
};
