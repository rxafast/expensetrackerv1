import React, { useMemo, useState } from 'react';
import { 
  PieChart as RechartsPieChart, 
  Pie, 
  BarChart, 
  Bar, 
  Cell, 
  Tooltip, 
  ResponsiveContainer, 
  XAxis, 
  YAxis 
} from 'recharts';
import { Transaction } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { PieChart, BarChart3 } from 'lucide-react';
import { formatCurrencyWithSettings } from '../../utils/helpers';

interface ExpenseChartProps {
  transactions: Transaction[];
}

type ChartType = 'pie' | 'bar';
type TimePeriod = 'weekly' | 'monthly' | 'yearly';

const ExpenseChart: React.FC<ExpenseChartProps> = ({ transactions }) => {
  const { categories, settings } = useAppContext();
  const [chartType, setChartType] = useState<ChartType>('pie');
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('monthly');

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    
    if (timePeriod === 'monthly') {
      return transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
      });
    }

    if (timePeriod === 'yearly') {
      return transactions.filter(t => new Date(t.date).getFullYear() === now.getFullYear());
    }

    if (timePeriod === 'weekly') {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      return transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate >= startOfWeek && tDate <= endOfWeek;
      });
    }
    return [];
  }, [transactions, timePeriod]);

  const expenseData = useMemo(() => {
    return filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, transaction) => {
        const existing = acc.find(item => item.name.toLowerCase() === transaction.category.toLowerCase());
        if (existing) {
          existing.value += transaction.amount;
        } else {
          acc.push({ name: transaction.category, value: transaction.amount });
        }
        return acc;
      }, [] as { name: string; value: number }[])
      .sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  const categoryColorMap = useMemo(() => categories.reduce((acc, cat) => {
    acc[cat.name.toLowerCase()] = cat.color;
    return acc;
  }, {} as Record<string, string>), [categories]);

  const totalExpense = useMemo(() => {
    return expenseData.reduce((sum, item) => sum + item.value, 0);
  }, [expenseData]);

  return (
    <div className="h-full flex flex-col justify-between">
      {/* Controls */}
      <div className="flex flex-wrap justify-between items-center mb-3 gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">Spending Breakdown</h2>
          <p className="text-xs text-slate-500">
            Total {timePeriod} spend: <span className="font-bold text-rose-600">{formatCurrencyWithSettings(totalExpense, settings)}</span>
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Period selector */}
          <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200">
            {(['weekly', 'monthly', 'yearly'] as const).map(p => (
              <button
                key={p}
                onClick={() => setTimePeriod(p)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg capitalize transition-colors ${
                  timePeriod === p ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Chart type toggle */}
          <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200">
            <button
              onClick={() => setChartType('pie')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                chartType === 'pie' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Donut Chart"
            >
              <PieChart size={15} />
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                chartType === 'bar' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Bar Chart"
            >
              <BarChart3 size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Chart visualization */}
      <div className="h-56 sm:h-64 w-full">
        {expenseData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-xs text-slate-400">
            No expense recorded for this {timePeriod} period.
          </div>
        ) : chartType === 'pie' ? (
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
              <Pie
                data={expenseData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
                nameKey="name"
              >
                {expenseData.map((entry) => (
                  <Cell 
                    key={`cell-${entry.name}`} 
                    fill={categoryColorMap[entry.name.toLowerCase()] || '#10B981'} 
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: any) => [formatCurrencyWithSettings(Number(value), settings), 'Spent']}
                contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px' }}
              />
            </RechartsPieChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={expenseData.slice(0, 7)} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 11 }} 
                interval={0} 
                angle={-20} 
                textAnchor="end" 
              />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip 
                formatter={(value: any) => [formatCurrencyWithSettings(Number(value), settings), 'Spent']}
                contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px' }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {expenseData.slice(0, 7).map((entry) => (
                  <Cell 
                    key={`bar-${entry.name}`} 
                    fill={categoryColorMap[entry.name.toLowerCase()] || '#3B82F6'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Category Pills below chart */}
      {expenseData.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100 max-h-16 overflow-y-auto">
          {expenseData.slice(0, 6).map(item => {
            const percent = totalExpense > 0 ? Math.round((item.value / totalExpense) * 100) : 0;
            const color = categoryColorMap[item.name.toLowerCase()] || '#64748B';
            return (
              <span
                key={item.name}
                className="inline-flex items-center space-x-1.5 text-[11px] font-medium px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200"
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-slate-700">{item.name}:</span>
                <span className="font-bold text-slate-900">{percent}%</span>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ExpenseChart;