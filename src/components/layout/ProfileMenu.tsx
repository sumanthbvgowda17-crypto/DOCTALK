import React, { useState, useRef, useEffect } from 'react';
import { useDemo } from '../../context/DemoContext';
import { useAuth } from '../../context/AuthContext';
import { User, Settings, RefreshCcw, ChevronDown, Check, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../common/GlassCard';

export const ProfileMenu: React.FC = () => {
  const { profile, role, setRole, resetAll } = useDemo();
  const { user, profile: authProfile, role: authRole, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const displayName = authProfile?.full_name || profile.name || user?.email?.split('@')[0] || 'User';
  const displayEmail = user?.email || profile.email;
  const effectiveRole = authProfile?.role || role;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .filter(p => !p.startsWith('Dr.'))
      .slice(0, 2)
      .map(p => p[0])
      .join('')
      .toUpperCase() || 'DT';
  };

  const handleSignOut = async () => {
    setIsOpen(false);
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 pl-2 rounded-xl border border-slate-200/80 dark:border-slate-700 hover:border-cyan-400 bg-white/70 dark:bg-slate-800/80 transition-all shadow-sm"
      >
        <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-600 to-teal-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
          {getInitials(displayName)}
        </div>
        <div className="hidden md:flex flex-col text-left">
          <span className="text-xs font-bold text-slate-800 dark:text-white leading-tight truncate max-w-[110px]">
            {displayName}
          </span>
          <span className="text-[10px] text-cyan-700 dark:text-cyan-400 font-semibold uppercase">
            {effectiveRole === 'doctor' ? 'Doctor' : 'Patient'}
          </span>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 z-50 animate-in fade-in zoom-in-95 duration-150">
          <GlassCard className="border border-slate-200/90 dark:border-slate-700 shadow-2xl p-0">
            <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-br from-cyan-50/50 to-teal-50/30 dark:from-slate-800 dark:to-slate-800/50">
              <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {displayName}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {displayEmail}
              </div>
              <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                Role: {effectiveRole.toUpperCase()}
              </div>
            </div>

            <div className="p-1.5">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/account');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <User className="w-4 h-4 text-slate-500" />
                <span>Account Profile</span>
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/settings');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4 text-slate-500" />
                <span>App Settings</span>
              </button>

              {/* Only show role toggle in development/demo mode if doctor role is granted or testing */}
              {authRole === 'doctor' && (
                <>
                  <div className="my-1 border-t border-slate-100 dark:border-slate-800"></div>
                  <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Clinical Workspace
                  </div>
                  <button
                    onClick={() => {
                      setRole('patient');
                      setIsOpen(false);
                      navigate('/dashboard');
                    }}
                    className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800 rounded-lg"
                  >
                    <span>Patient View</span>
                    {role === 'patient' && <Check className="w-3.5 h-3.5 text-cyan-600" />}
                  </button>
                  <button
                    onClick={() => {
                      setRole('doctor');
                      setIsOpen(false);
                      navigate('/doctor');
                    }}
                    className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800 rounded-lg"
                  >
                    <span>Doctor Clinical View</span>
                    {role === 'doctor' && <Check className="w-3.5 h-3.5 text-teal-600" />}
                  </button>
                </>
              )}

              <div className="my-1 border-t border-slate-100 dark:border-slate-800"></div>

              <button
                onClick={() => {
                  setIsOpen(false);
                  resetAll();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <RefreshCcw className="w-4 h-4" />
                <span>Reset Local Cache</span>
              </button>

              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};
