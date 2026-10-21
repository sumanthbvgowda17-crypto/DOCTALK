import React from 'react';
import { useDemo } from '../../context/DemoContext';
import { User, Stethoscope } from 'lucide-react';
import { clsx } from 'clsx';
import { useNavigate } from 'react-router-dom';

export const RoleSwitcher: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { role, setRole } = useDemo();
  const navigate = useNavigate();

  const handleRoleChange = (newRole: 'patient' | 'doctor') => {
    if (newRole === role) return;
    setRole(newRole);
    if (newRole === 'doctor') {
      navigate('/doctor');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className={clsx(
      'p-1 bg-slate-100/90 dark:bg-slate-800/90 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex items-center shadow-inner',
      compact ? 'scale-90 origin-right' : ''
    )}>
      <button
        type="button"
        onClick={() => handleRoleChange('patient')}
        className={clsx(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200',
          role === 'patient'
            ? 'bg-white dark:bg-slate-900 text-cyan-700 dark:text-cyan-300 shadow-sm border border-slate-200/50 dark:border-slate-700'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        )}
      >
        <User className="w-3.5 h-3.5" />
        <span>Patient Demo</span>
      </button>

      <button
        type="button"
        onClick={() => handleRoleChange('doctor')}
        className={clsx(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200',
          role === 'doctor'
            ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-sm border border-slate-200/50 dark:border-slate-700'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        )}
      >
        <Stethoscope className="w-3.5 h-3.5" />
        <span>Doctor Demo</span>
      </button>
    </div>
  );
};
