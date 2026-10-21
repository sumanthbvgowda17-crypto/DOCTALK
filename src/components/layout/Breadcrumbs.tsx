import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const routeLabels: Record<string, string> = {
  dashboard: 'Patient Dashboard',
  consultations: 'Consultations',
  new: 'New Consultation',
  cases: 'Case Management',
  triage: 'Symptom Triage',
  connection: 'Resilience Simulator',
  doctor: 'Doctor Workspace',
  queue: 'Case Queue',
  analytics: 'Analytics',
  feedback: 'Feedback Hub',
  notifications: 'Notifications',
  account: 'Account Profile',
  settings: 'Settings'
};

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  if (pathnames.length === 0 || (pathnames.length === 1 && pathnames[0] === 'dashboard')) {
    return null;
  }

  return (
    <nav className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400 py-1" aria-label="Breadcrumb">
      <Link
        to="/dashboard"
        className="hover:text-cyan-600 dark:hover:text-cyan-400 flex items-center gap-1 transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Home</span>
      </Link>

      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const label = routeLabels[name] || name;

        return (
          <React.Fragment key={routeTo}>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            {isLast ? (
              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[150px] sm:max-w-none">
                {label}
              </span>
            ) : (
              <Link
                to={routeTo}
                className="hover:text-cyan-600 dark:hover:text-cyan-400 truncate max-w-[120px] transition-colors"
              >
                {label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
