import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/common/GlassCard';
import { Home, ArrowLeft } from 'lucide-react';
import { BrandLogo } from '../components/common/BrandLogo';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="py-16 flex items-center justify-center">
      <GlassCard className="p-10 max-w-md w-full text-center space-y-4 shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto border border-slate-200/80 dark:border-slate-700/80">
          <BrandLogo variant="icon" size="md" />
        </div>

        <div className="text-4xl font-extrabold font-heading text-slate-900 dark:text-white">
          404
        </div>

        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
          Page Not Found
        </h3>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          The requested clinical section or consultation record does not exist or may have been archived.
        </p>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-700 text-white shadow-xs"
          >
            <Home className="w-4 h-4" />
            <span>Patient Home</span>
          </button>
        </div>
      </GlassCard>
    </div>
  );
};
