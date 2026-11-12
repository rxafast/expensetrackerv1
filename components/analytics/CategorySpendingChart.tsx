import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useAppContext } from '../../context/AppContext';
import { formatCurrencyWithSettings } from '../../utils/helpers';

type Period = 'this_month' | 'last_3_months' | 'this_year';

const CategorySpendingChart: React.FC = () => {
  const { transactions, categories, settings } = useAppContext();
  const [period, setPeriod] = useState<Period>('this_month');

  const chartData = useMemo(() => {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    const filteredTransactions = transactions.filter(t => {
      const tDate = new Date(t.date);
      if (t.type !== 'expense') return false;

      switch (period) {
        case 'this_month':
          return tDate >= firstDayOfMonth;
        case 'last_3_months':
          return tDate >= threeMonthsAgo;
        case 'this_year':
          return tDate >= firstDayOfYear;
        default:
          return true;
      }
    });

    const spending = filteredTransactions.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as { [key: string]: number });
    
    return Object.entries(spending)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 8);
  }, [transactions, period]);

  const categoryColorMap = useMemo(() => categories.reduce((acc, cat) => {
    acc[cat.name] = cat.color;
    return acc;
  }, {} as Record<string, string>), [categories]);

  return (
    <div className="h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Top Categories</span>
        <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200">
          {[
            { id: 'this_month' as const, label: 'Month' },
            { id: 'last_3_months' as const, label: '3M' },
            { id: 'this_year' as const, label: 'Year' },
          ].map(p => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                period === p.id ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-xs text-slate-400">
          No expense records for this selected timeframe.
        </div>
      ) : (
        <div className="h-56 sm:h-64 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ top: 0, right: 30, left: 20, bottom: 0 }}
            >
              <XAxis type="number" hide />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={110} 
                tick={{ fontSize: 11 }} 
                interval={0} 
              />
              <Tooltip 
                formatter={(value: any) => [formatCurrencyWithSettings(Number(value), settings), 'Spent']}
                contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px' }}
              />
              <Bar dataKey="amount" radius={[0, 6, 6, 0]} barSize={18}>
                {chartData.map((entry) => (
                  <Cell 
                    key={`cell-${entry.name}`} 
                    fill={categoryColorMap[entry.name] || '#6366F1'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default CategorySpendingChart;
