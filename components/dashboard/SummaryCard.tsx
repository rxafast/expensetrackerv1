import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { formatCurrencyWithSettings } from '../../utils/helpers';

interface SummaryCardProps {
  title: string;
  amount: number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: string;
  trendPositive?: boolean;
  color?: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ 
  title, 
  amount, 
  subtitle,
  icon, 
  trend,
  trendPositive,
  color = 'text-slate-900' 
}) => {
  const { settings } = useAppContext();

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</span>
        <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
          {icon}
        </div>
      </div>

      <div className="mt-3">
        <div className={`text-2xl sm:text-3xl font-black tracking-tight ${color}`}>
          {formatCurrencyWithSettings(amount, settings)}
        </div>
        
        <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
          <span>{subtitle || 'This month to date'}</span>
          {trend && (
            <span className={`font-semibold ${trendPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
              {trend}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;
