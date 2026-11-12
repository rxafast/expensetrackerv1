import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Trash2, GripVertical, Plus } from 'lucide-react';
import { Category } from '../../types';
import AddCategoryModal from './AddCategoryModal';

const CategoryManager: React.FC = () => {
  const { categories, deleteCategory, updateCategory, setAllCategories } = useAppContext();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [draggedCategory, setDraggedCategory] = useState<Category | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);

  const handleColorChange = (category: Category, newColor: string) => {
    updateCategory({ ...category, color: newColor });
  };

  const handleDragStart = (category: Category) => {
    setDraggedCategory(category);
  };

  const handleDragEnd = () => {
    setDraggedCategory(null);
    setDropTargetId(null);
  };
  
  const handleDragOver = (e: React.DragEvent, category: Category) => {
    e.preventDefault();
    if (draggedCategory && draggedCategory.id !== category.id) {
      setDropTargetId(category.id);
    }
  };

  const handleDrop = (targetCategory: Category) => {
    if (!draggedCategory || draggedCategory.id === targetCategory.id) return;

    const currentCategories = [...categories];
    const draggedIndex = currentCategories.findIndex(c => c.id === draggedCategory.id);
    const targetIndex = currentCategories.findIndex(c => c.id === targetCategory.id);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const [removed] = currentCategories.splice(draggedIndex, 1);
    currentCategories.splice(targetIndex, 0, removed);
    
    setAllCategories(currentCategories);
    setDraggedCategory(null);
    setDropTargetId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <span className="text-xs font-bold uppercase text-slate-500">Categories ({categories.length})</span>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus size={14} />
          <span>Add Category</span>
        </button>
      </div>

      <ul className="space-y-2 max-h-96 overflow-y-auto pr-1">
        {categories.map(category => (
          <li 
            key={category.id}
            draggable
            onDragStart={() => handleDragStart(category)}
            onDragOver={(e) => handleDragOver(e, category)}
            onDragLeave={() => setDropTargetId(null)}
            onDrop={() => handleDrop(category)}
            onDragEnd={handleDragEnd}
            className={`flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all ${
              draggedCategory?.id === category.id ? 'opacity-50 bg-slate-100' : ''
            }`}
          >
            {dropTargetId === category.id && (
              <div className="absolute -top-1 left-0 right-0 h-1 bg-emerald-500 rounded-full" />
            )}
            <div className="flex items-center space-x-2.5">
              <GripVertical size={16} className="text-slate-400 cursor-grab" />
              <label className="cursor-pointer relative flex items-center">
                <span 
                  className="w-4 h-4 rounded-full border border-slate-300 shadow-xs" 
                  style={{ backgroundColor: category.color }}
                />
                <input
                  type="color"
                  value={category.color}
                  onChange={(e) => handleColorChange(category, e.target.value)}
                  className="absolute w-4 h-4 opacity-0 cursor-pointer"
                  title="Change color"
                />
              </label>
              <span className="text-xs sm:text-sm font-semibold text-slate-800">{category.name}</span>
              <span className="text-[10px] uppercase font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                {category.type || 'expense'}
              </span>
            </div>
            
            <button 
              onClick={() => deleteCategory(category.id)} 
              className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors"
              title="Delete category"
            >
              <Trash2 size={15} />
            </button>
          </li>
        ))}
      </ul>

      {/* Add Category Modal */}
      <AddCategoryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
};

export default CategoryManager;