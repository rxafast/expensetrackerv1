import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { SavingsGoal } from '../../types';
import { formatCurrencyWithSettings, formatDate } from '../../utils/helpers';
import Modal from '../ui/Modal';
import { Plus, Target, CheckCircle2, Trash2, Edit2, TrendingUp, Calendar } from 'lucide-react';

const GOAL_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'];

const SavingsGoalsManager: React.FC = () => {
  const { savingsGoals, addSavingsGoal, updateSavingsGoal, deleteSavingsGoal, adjustGoalAmount, settings } = useAppContext();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [adjustingGoal, setAdjustingGoal] = useState<{ id: string; name: string } | null>(null);
  const [adjustDelta, setAdjustDelta] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [color, setColor] = useState(GOAL_COLORS[0]);
  const [notes, setNotes] = useState('');

  const handleOpenAdd = () => {
    setEditingGoal(null);
    setName('');
    setTargetAmount('');
    setCurrentAmount('0');
    setTargetDate('');
    setColor(GOAL_COLORS[Math.floor(Math.random() * GOAL_COLORS.length)]);
    setNotes('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    setName(goal.name);
    setTargetAmount(String(goal.targetAmount));
    setCurrentAmount(String(goal.currentAmount));
    setTargetDate(goal.targetDate);
    setColor(goal.color);
    setNotes(goal.notes || '');
    setIsAddModalOpen(true);
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const data = {
      name: name.trim(),
      targetAmount: parseFloat(targetAmount) || 0,
      currentAmount: parseFloat(currentAmount) || 0,
      targetDate: targetDate || new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
      color,
      notes: notes.trim() || undefined
    };

    if (editingGoal) {
      updateSavingsGoal({ ...data, id: editingGoal.id });
    } else {
      addSavingsGoal(data);
    }
    setIsAddModalOpen(false);
  };

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(adjustDelta);
    if (!isNaN(val) && adjustingGoal) {
      adjustGoalAmount(adjustingGoal.id, val);
    }
    setAdjustDelta('');
    setAdjustingGoal(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Savings & Milestones</h2>
          <p className="text-xs text-slate-500">Track and allocate funds for your big life targets.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
        >
          <Plus size={15} />
          <span>New Goal</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {savingsGoals.map(goal => {
          const progress = goal.targetAmount > 0 ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) : 0;
          const isComplete = progress >= 100;
          const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

          return (
            <div
              key={goal.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div 
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: goal.color }}
                    >
                      <Target size={18} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{goal.name}</h3>
                      <div className="flex items-center space-x-1 text-[11px] text-slate-500 mt-0.5">
                        <Calendar size={12} />
                        <span>Target: {formatDate(goal.targetDate)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenEdit(goal)}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => deleteSavingsGoal(goal.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Progress Ring / Bar */}
                <div className="mt-4">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-xs font-semibold text-slate-700">
                      {formatCurrencyWithSettings(goal.currentAmount, settings)}
                    </span>
                    <span className="text-xs text-slate-500">
                      of {formatCurrencyWithSettings(goal.targetAmount, settings)} ({progress}%)
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${progress}%`, backgroundColor: goal.color }}
                    />
                  </div>
                </div>

                {isComplete ? (
                  <div className="mt-2.5 flex items-center space-x-1 text-emerald-600 font-semibold text-xs">
                    <CheckCircle2 size={14} />
                    <span>Goal Reached! Congratulations 🎉</span>
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">{formatCurrencyWithSettings(remaining, settings)}</span> to reach goal.
                  </p>
                )}
              </div>

              {/* Quick Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => {
                    setAdjustingGoal({ id: goal.id, name: goal.name });
                    setAdjustDelta('5000');
                  }}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg hover:bg-emerald-100 transition-colors"
                >
                  + Add Funds
                </button>
                <button
                  onClick={() => {
                    setAdjustingGoal({ id: goal.id, name: goal.name });
                    setAdjustDelta('-5000');
                  }}
                  className="text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 px-2.5 py-1 rounded-lg transition-colors"
                >
                  - Withdraw
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Goal Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingGoal ? 'Edit Savings Goal' : 'Create Savings Goal'}
      >
        <form onSubmit={handleSaveGoal} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Goal Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Emergency Fund, Laptop Upgrade, Vacation"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Target Amount</label>
              <input
                type="number"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder="200000"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                required
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Currently Saved</label>
              <input
                type="number"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                required
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Target Date</label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">Color</label>
            <div className="flex space-x-2">
              {GOAL_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full ${color === c ? 'ring-2 ring-offset-2 ring-slate-800' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-xl text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700"
            >
              Save Goal
            </button>
          </div>
        </form>
      </Modal>

      {/* Quick Adjust Modal */}
      <Modal
        isOpen={Boolean(adjustingGoal)}
        onClose={() => setAdjustingGoal(null)}
        title={`Adjust Funds: ${adjustingGoal?.name}`}
      >
        <form onSubmit={handleAdjustSubmit} className="space-y-4">
          <p className="text-xs text-slate-500">
            Enter a positive amount to add to savings, or negative to withdraw.
          </p>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 font-bold text-sm">
              {settings.currencySymbol}
            </span>
            <input
              type="number"
              value={adjustDelta}
              onChange={(e) => setAdjustDelta(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-xl font-bold text-base"
              placeholder="+5000 or -5000"
              required
            />
          </div>
          <div className="flex justify-end space-x-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setAdjustingGoal(null)}
              className="px-4 py-2 border rounded-xl text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 text-white font-semibold rounded-xl text-sm"
            >
              Update Balance
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SavingsGoalsManager;
