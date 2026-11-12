import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { useAppContext } from '../../context/AppContext';
import { CATEGORY_COLORS } from '../../constants';
import { Tag, Check } from 'lucide-react';

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: 'expense' | 'income' | 'both';
  onCategoryCreated?: (categoryName: string) => void;
}

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({ 
  isOpen, 
  onClose, 
  defaultType = 'expense',
  onCategoryCreated
}) => {
  const { addCategory, categories } = useAppContext();
  
  const [name, setName] = useState('');
  const [type, setType] = useState<'expense' | 'income' | 'both'>(defaultType);
  const [color, setColor] = useState(CATEGORY_COLORS[0]);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    // Check duplicate
    if (categories.some(c => c.name.toLowerCase() === trimmed.toLowerCase())) {
      setError(`Category "${trimmed}" already exists.`);
      return;
    }

    addCategory({
      name: trimmed,
      color,
      type
    });

    if (onCategoryCreated) {
      onCategoryCreated(trimmed);
    }

    setName('');
    setError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Category">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
            {error}
          </div>
        )}

        {/* Name */}
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
            Category Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError(null);
            }}
            placeholder="e.g. Freelance, Childcare, Gym, Gifts"
            className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-emerald-500 focus:border-emerald-500"
            required
            autoFocus
          />
        </div>

        {/* Type Selector */}
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">
            Applies To
          </label>
          <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            {[
              { id: 'expense' as const, label: 'Expense (-)' },
              { id: 'income' as const, label: 'Income (+)' },
              { id: 'both' as const, label: 'Both Types' },
            ].map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => setType(item.id)}
                className={`py-2 rounded-lg transition-colors ${
                  type === item.id ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Color Palette */}
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">
            Color Badge
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_COLORS.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform ${
                  color === c ? 'scale-125 ring-2 ring-offset-2 ring-slate-800' : 'hover:scale-110'
                }`}
                style={{ backgroundColor: c }}
              >
                {color === c && <Check size={14} className="text-white stroke-[3]" />}
              </button>
            ))}
          </div>
        </div>

        {/* Preview badge */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">Badge Preview:</span>
          <span
            className="px-2.5 py-1 rounded-full font-semibold"
            style={{ backgroundColor: `${color}20`, color: color }}
          >
            {name.trim() || 'Sample Category'}
          </span>
        </div>

        <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm"
          >
            Create Category
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddCategoryModal;
