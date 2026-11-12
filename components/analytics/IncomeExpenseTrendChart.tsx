import React, { useMemo } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { useAppContext } from '../../context/AppContext';
import { formatCurrencyWithSettings } from '../../utils/helpers';

const IncomeExpenseTrendChart: React.FC = () => {
  const { transactions, settings } = useAppContext();

  const chartData = useMemo(() => {
    if (transactions.length === 0) return [];
    
    const monthlyData: { [key: string]: { date: Date; income: number; expense: number } } = {};
    
    transactions.forEach(t => {
      const date = new Date(t.date);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthYear]) {
        const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        monthlyData[monthYear] = { date: firstDayOfMonth, income: 0, expense: 0 };
      }

      if (t.type === 'income') {
        monthlyData[monthYear].income += t.amount;
      } else if (t.type === 'expense') {
        monthlyData[monthYear].expense += t.amount;
      }
    });

    return Object.entries(monthlyData)
      .map(([monthYear, data]) => ({
        name: new Date(data.date).toLocaleString('default', { month: 'short', year: '2-digit' }),
        date: data.date,
        Income: data.income,
        Expense: data.expense,
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(-12);
  }, [transactions]);
  
  if (chartData.length < 1) {
    return (
      <div className="flex items-center justify-center h-full text-xs text-slate-400">
        Record transactions across different months to visualize trends.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={chartData}
        margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10B981" stopOpacity={0.25}/>
            <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#EF4444" stopOpacity={0.25}/>
            <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
        <YAxis 
          tick={{ fontSize: 11 }} 
          tickFormatter={(value) => `${Math.round(value / 1000)}k`}
        />
        <Tooltip 
          formatter={(value: any) => [formatCurrencyWithSettings(Number(value), settings)]}
          contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px' }}
        />
        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
        <Area 
          type="monotone" 
          dataKey="Income" 
          stroke="#10B981" 
          strokeWidth={2.5}
          fillOpacity={1} 
          fill="url(#colorIncome)" 
        />
        <Area 
          type="monotone" 
          dataKey="Expense" 
          stroke="#EF4444" 
          strokeWidth={2.5}
          fillOpacity={1} 
          fill="url(#colorExpense)" 
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default IncomeExpenseTrendChart;
