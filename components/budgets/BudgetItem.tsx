import React, { useState, useMemo } from 'react';
import { Category } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { formatCurrencyWithSettings } from '../../utils/helpers';
import { Edit2, Check, X, AlertTriangle, AlertCircle, Trash2 } from 'lucide-react';

interface BudgetItemProps {
  category: Category;
}

const BudgetItem: React.FC<BudgetItemProps> = ({ category }) => {
  const { budgets, setBudget, deleteBudget, transactions, settings } = useAppContext();
  const [isEditing, setIsEditing] = useState(false);

  const budget = useMemo(() => 
    budgets.find(b => b.categoryId === category.id) || { id: '', amount: 0, period: 'monthly' as const }, 
    [budgets, category.id]
  );
  
  const [newAmount, setNewAmount] = useState(String(budget.amount || ''));

  const spentAmount = useMemo(() => {
    const now = new Date();
    return transactions
      .filter(t => 
        t.category.toLowerCase() === category.name.toLowerCase() && 
        t.type === 'expense' &&
        new Date(t.date).getMonth() === now.getMonth() &&
        new Date(t.date).getFullYear() === now.getFullYear()
      )
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, category.name]);

  const progress = budget.amount > 0 ? (spentAmount / budget.amount) * 100 : 0;
  const remaining = budget.amount - spentAmount;
  const isOverBudget = remaining < 0 && budget.amount > 0;
  const isWarning = progress >= 80 && progress < 100;

  const handleSave = () => {
    const parsed = parseFloat(newAmount);
    if (!isNaN(parsed) && parsed >= 0) {
      setBudget({ categoryId: category.id, amount: parsed, period: 'monthly' });
    }
    setIsEditing(false);
  };

  return (
    <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:border-slate-300 transition-all">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2.5">
          <span 
            className="w-3.5 h-3.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: category.color }}
          />
          <span className="font-bold text-slate-900 text-sm">{category.name}</span>
          {isOverBudget && (
            <span className="flex items-center text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
              <AlertCircle size={11} className="mr-1" />
              Over Budget
            </span>
          )}
          {isWarning && (
            <span className="flex items-center text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              <AlertTriangle size={11} className="mr-1" />
              80%+ Used
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {!isEditing ? (
            <div className="text-right">
              <span className="text-xs text-slate-500">
                <span className="font-bold text-slate-800">{formatCurrencyWithSettings(spentAmount, settings)}</span> / {formatCurrencyWithSettings(budget.amount, settings)}
              </span>
            </div>
          ) : null}

          {!isEditing ? (
            <button
              onClick={() => {
                setNewAmount(String(budget.amount || ''));
                setIsEditing(true);
              }}
              className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              title="Set or change budget"
            >
              <Edit2 size={14} />
            </button>
          ) : null}
        </div>
      </div>

      {isEditing ? (
        <div className="flex items-center space-x-2 my-2 bg-slate-50 p-2 rounded-xl">
          <span className="text-xs font-semibold text-slate-500">{settings.currencySymbol}</span>
          <input
            type="number"
            value={newAmount}
            onChange={(e) => setNewAmount(e.target.value)}
            placeholder="Set monthly budget"
            className="flex-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-sm font-semibold"
            autoFocus
          />
          <button
            onClick={handleSave}
            className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
          >
            <Check size={14} />
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="p-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div>
          {/* Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden mt-1">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isOverBudget ? 'bg-rose-600' :
                isWarning ? 'bg-amber-500' :
                'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[11px] mt-1.5 text-slate-500">
            <span>
              {budget.amount > 0 ? `${Math.round(progress)}% of monthly limit` : 'No budget set yet'}
            </span>
            <span className={isOverBudget ? 'font-bold text-rose-600' : 'text-slate-600 font-medium'}>
              {budget.amount > 0 ? (
                isOverBudget 
                  ? `${formatCurrencyWithSettings(Math.abs(remaining), settings)} over limit` 
                  : `${formatCurrencyWithSettings(remaining, settings)} remaining`
              ) : (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="text-emerald-600 hover:underline font-semibold"
                >
                  + Set Limit
                </button>
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetItem;