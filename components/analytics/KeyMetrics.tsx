import React, { useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { formatCurrencyWithSettings } from '../../utils/helpers';
import { TrendingUp, TrendingDown, Percent, PiggyBank } from 'lucide-react';

const KeyMetrics: React.FC = () => {
  const { transactions, settings } = useAppContext();

  const metrics = useMemo(() => {
    if (transactions.length === 0) {
      return { totalIncome: 0, totalExpense: 0, avgMonthlyIncome: 0, avgMonthlyExpense: 0, savingsRate: 0, monthsOfData: 0 };
    }

    const monthlyData: { [key: string]: { income: number, expense: number } } = {};
    
    transactions.forEach(t => {
      const date = new Date(t.date);
      const monthYear = `${date.getFullYear()}-${date.getMonth()}`;
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = { income: 0, expense: 0 };
      }
      if (t.type === 'income') {
        monthlyData[monthYear].income += t.amount;
      } else if (t.type === 'expense') {
        monthlyData[monthYear].expense += t.amount;
      }
    });

    const numMonths = Math.max(1, Object.keys(monthlyData).length);
    const totalIncome = Object.values(monthlyData).reduce((sum, data) => sum + data.income, 0);
    const totalExpense = Object.values(monthlyData).reduce((sum, data) => sum + data.expense, 0);

    const avgMonthlyIncome = totalIncome / numMonths;
    const avgMonthlyExpense = totalExpense / numMonths;
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;
    
    return {
      totalIncome,
      totalExpense,
      avgMonthlyIncome,
      avgMonthlyExpense,
      savingsRate,
      monthsOfData: numMonths,
    };
  }, [transactions]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Avg. Monthly Inflow</span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp size={18} />
          </div>
        </div>
        <div className="text-2xl font-black text-slate-900 mt-2">
          {formatCurrencyWithSettings(metrics.avgMonthlyIncome, settings)}
        </div>
        <p className="text-xs text-slate-400 mt-1">Based on recorded history</p>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Avg. Monthly Outflow</span>
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <TrendingDown size={18} />
          </div>
        </div>
        <div className="text-2xl font-black text-slate-900 mt-2">
          {formatCurrencyWithSettings(metrics.avgMonthlyExpense, settings)}
        </div>
        <p className="text-xs text-slate-400 mt-1">Monthly average spend</p>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Historical Savings Rate</span>
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Percent size={18} />
          </div>
        </div>
        <div className="text-2xl font-black text-blue-600 mt-2">
          {metrics.savingsRate.toFixed(1)}%
        </div>
        <p className="text-xs text-slate-400 mt-1">Of total earned income preserved</p>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Cumulative Savings</span>
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <PiggyBank size={18} />
          </div>
        </div>
        <div className="text-2xl font-black text-purple-600 mt-2">
          {formatCurrencyWithSettings(metrics.totalIncome - metrics.totalExpense, settings)}
        </div>
        <p className="text-xs text-slate-400 mt-1">Lifetime net cash surplus</p>
      </div>
    </div>
  );
};

export default KeyMetrics;
