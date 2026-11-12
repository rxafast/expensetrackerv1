import React, { useMemo, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import BudgetItem from './BudgetItem';
import CategoryManager from './CategoryManager';
import SavingsGoalsManager from './SavingsGoalsManager';
import AddCategoryModal from './AddCategoryModal';
import { formatCurrencyWithSettings } from '../../utils/helpers';
import { Target, TrendingDown, PiggyBank, Plus } from 'lucide-react';

const BudgetsPage: React.FC = () => {
  const { categories, budgets, transactions, settings } = useAppContext();
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const expenseCategories = categories.filter(c => c.type !== 'income' && c.name !== 'Salary');

  const now = new Date();
  const currentMonthTransactions = useMemo(() => {
    return transactions.filter(t => 
      t.type === 'expense' && 
      new Date(t.date).getMonth() === now.getMonth() && 
      new Date(t.date).getFullYear() === now.getFullYear()
    );
  }, [transactions]);

  const totalMonthlyBudget = useMemo(() => {
    return budgets.reduce((sum, b) => sum + b.amount, 0);
  }, [budgets]);

  const totalMonthlySpent = useMemo(() => {
    return currentMonthTransactions.reduce((sum, t) => sum + t.amount, 0);
  }, [currentMonthTransactions]);

  const overallBudgetRemaining = totalMonthlyBudget - totalMonthlySpent;
  const overallUsagePercent = totalMonthlyBudget > 0 ? Math.round((totalMonthlySpent / totalMonthlyBudget) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Budgets & Financial Targets
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Control monthly spending caps, manage categories, and reach your savings milestones.
          </p>
        </div>

        <button
          onClick={() => setIsAddCategoryOpen(true)}
          className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition-colors self-start sm:self-center"
        >
          <Plus size={16} />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Monthly Budget Cap</span>
            <Target size={18} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {formatCurrencyWithSettings(totalMonthlyBudget, settings)}
          </div>
          <p className="text-xs text-slate-400 mt-1">Across {budgets.length} budgeted categories</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Month Spend</span>
            <TrendingDown size={18} className="text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600 mt-2">
            {formatCurrencyWithSettings(totalMonthlySpent, settings)}
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
            <div 
              className={`h-full rounded-full ${overallUsagePercent > 100 ? 'bg-rose-600' : 'bg-emerald-500'}`}
              style={{ width: `${Math.min(100, overallUsagePercent)}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Safe to Spend</span>
            <PiggyBank size={18} className="text-blue-500" />
          </div>
          <div className={`text-2xl font-black mt-2 ${
            overallBudgetRemaining < 0 ? 'text-rose-600' : 'text-emerald-600'
          }`}>
            {formatCurrencyWithSettings(overallBudgetRemaining, settings)}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {overallBudgetRemaining >= 0 ? `${100 - overallUsagePercent}% of cap still remaining` : 'Exceeded monthly planned budget'}
          </p>
        </div>
      </div>

      {/* Savings Goals Component */}
      <div className="pt-2">
        <SavingsGoalsManager />
      </div>

      {/* Category Budgets & Manager Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        {/* Category Budgets */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Category Budgets</h2>
                <p className="text-xs text-slate-500">Set limits for individual categories to monitor pacing.</p>
              </div>
              <button
                onClick={() => setIsAddCategoryOpen(true)}
                className="text-xs font-semibold text-emerald-600 hover:underline flex items-center space-x-1"
              >
                <Plus size={13} />
                <span>New Category</span>
              </button>
            </div>

            <div className="space-y-3">
              {expenseCategories.map(category => (
                <BudgetItem key={category.id} category={category} />
              ))}
            </div>
          </div>
        </div>

        {/* Category Manager */}
        <div className="lg:col-span-1">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
            <div className="mb-4 pb-2 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Manage Categories</h2>
              <p className="text-xs text-slate-500">Add, recolor, and organize custom categories.</p>
            </div>
            <CategoryManager />
          </div>
        </div>
      </div>

      {/* Add Category Modal */}
      <AddCategoryModal
        isOpen={isAddCategoryOpen}
        onClose={() => setIsAddCategoryOpen(false)}
      />
    </div>
  );
};

export default BudgetsPage;