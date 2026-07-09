/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Category } from '../types';
import IconRenderer, { iconMap } from './IconRenderer';
import { Plus, Trash2, FolderPlus, X } from 'lucide-react';

interface CategoriesManagerProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
  onAddCategory: (category: Category) => void;
  onDeleteCategory: (id: string) => void;
  itemCounts: Record<string, number>;
}

export default function CategoriesManager({
  categories,
  selectedCategoryId,
  onSelectCategory,
  onAddCategory,
  onDeleteCategory,
  itemCounts,
}: CategoriesManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Sparkles');
  const [colorPreset, setColorPreset] = useState('gold');

  const colorPresets = [
    { id: 'gold', label: 'Dourado Imperial', text: 'text-gold-primary border-gold-primary/20', preview: '#D4AF37' },
    { id: 'silver', label: 'Prata Nobre', text: 'text-gray-300 border-gray-400/20', preview: '#E5E5E5' },
    { id: 'bronze', label: 'Bronze Antigo', text: 'text-amber-600 border-amber-600/20', preview: '#CD7F32' },
    { id: 'rose', label: 'Ouro Rosé', text: 'text-rose-300 border-rose-300/20', preview: '#B76E79' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const preset = colorPresets.find((p) => p.id === colorPreset) || colorPresets[0];

    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      name: name.trim(),
      color: preset.text,
      icon: selectedIcon,
    };

    onAddCategory(newCategory);
    setName('');
    setSelectedIcon('Sparkles');
    setColorPreset('gold');
    setIsAdding(false);
  };

  const availableIcons = ['Heart', 'Briefcase', 'BookOpen', 'Coins', 'Sparkles', 'Shield', 'User', 'Trophy', 'Activity', 'Map', 'Flame', 'Dumbbell', 'Zap'];

  return (
    <div id="categories-manager" className="bg-lux-card border border-lux-border rounded-xl p-5 gold-border-glow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif-lux text-sm font-semibold tracking-wider text-white uppercase flex items-center gap-2">
          <span className="w-1.5 h-3 bg-gold-primary rounded-full inline-block"></span>
          Categorias de Elite
        </h3>
        <button
          id="btn-toggle-add-cat"
          onClick={() => setIsAdding(!isAdding)}
          className="p-1.5 rounded-lg border border-lux-border hover:border-gold-primary/50 text-gold-primary transition-all duration-300 flex items-center gap-1 text-xs font-serif-lux tracking-wider hover:bg-gold-primary/5 cursor-pointer"
        >
          {isAdding ? <X size={14} /> : <Plus size={14} />}
          <span>{isAdding ? 'Fechar' : 'Nova'}</span>
        </button>
      </div>

      {/* Add New Category Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.form
            id="form-add-category"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleSubmit}
            className="overflow-hidden border border-gold-primary/10 rounded-lg p-3 mb-4 bg-black/40 space-y-3"
          >
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1 font-serif-lux">Nome da Categoria</label>
              <input
                id="input-cat-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Alta Performance, Meditação..."
                maxLength={24}
                className="w-full bg-lux-card border border-lux-border rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-gold-primary transition-all font-sans-lux"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1 font-serif-lux">Ícone de Prestígio</label>
              <div className="grid grid-cols-6 gap-1.5 max-h-24 overflow-y-auto p-1 border border-lux-border rounded bg-black/20">
                {availableIcons.map((iconName) => (
                  <button
                    key={iconName}
                    id={`btn-icon-select-${iconName}`}
                    type="button"
                    onClick={() => setSelectedIcon(iconName)}
                    className={`p-1.5 rounded flex items-center justify-center transition-all cursor-pointer ${
                      selectedIcon === iconName
                        ? 'bg-gold-primary/15 text-gold-primary border border-gold-primary/30'
                        : 'text-gray-400 hover:text-white hover:bg-lux-card-light'
                    }`}
                  >
                    <IconRenderer name={iconName} size={16} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1 font-serif-lux">Aura de Cor (Tom)</label>
              <div className="grid grid-cols-2 gap-2">
                {colorPresets.map((preset) => (
                  <button
                    key={preset.id}
                    id={`btn-preset-select-${preset.id}`}
                    type="button"
                    onClick={() => setColorPreset(preset.id)}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] border transition-all cursor-pointer ${
                      colorPreset === preset.id
                        ? 'bg-lux-card-light border-gold-primary text-white'
                        : 'bg-transparent border-lux-border text-gray-400 hover:text-white'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: preset.preview }}></span>
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              id="btn-save-category"
              type="submit"
              className="w-full bg-gold-primary hover:bg-gold-hover text-black font-serif-lux text-[11px] font-bold tracking-widest py-1.5 rounded transition-all flex items-center justify-center gap-1 hover:shadow-[0_0_10px_rgba(212,175,55,0.3)] cursor-pointer"
            >
              <FolderPlus size={14} />
              CRIAR CATEGORIA
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Categories List */}
      <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
        {/* "All" Option */}
        <button
          id="btn-cat-all"
          onClick={() => onSelectCategory(null)}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all text-left border cursor-pointer ${
            selectedCategoryId === null
              ? 'bg-white text-black border-white'
              : 'bg-transparent border-lux-border text-gray-400 hover:text-white hover:bg-lux-card-light'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span className={`w-1.5 h-1.5 rounded-full ${selectedCategoryId === null ? 'bg-black' : 'bg-gold-primary'}`}></span>
            <span className="text-xs font-medium tracking-wide font-sans-lux">Todas as Atividades</span>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/10 border border-current/10 font-mono">
            {Object.values(itemCounts).reduce((a, b) => a + b, 0)}
          </span>
        </button>

        {categories.map((category) => {
          const isSelected = selectedCategoryId === category.id;
          const count = itemCounts[category.id] || 0;
          const isDefault = ['cat-1', 'cat-2', 'cat-3', 'cat-4', 'cat-5'].includes(category.id);

          return (
            <div
              key={category.id}
              id={`cat-item-container-${category.id}`}
              className="group flex items-center justify-between gap-1"
            >
              <button
                id={`btn-cat-select-${category.id}`}
                onClick={() => onSelectCategory(category.id)}
                className={`flex-1 flex items-center justify-between px-3 py-2 rounded-lg transition-all text-left border cursor-pointer ${
                  isSelected
                    ? 'bg-gold-primary text-black border-gold-primary font-semibold'
                    : 'bg-transparent border-lux-border text-gray-300 hover:text-white hover:bg-lux-card-light'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={isSelected ? 'text-black' : category.color.split(' ')[0]}>
                    <IconRenderer name={category.icon} size={14} />
                  </span>
                  <span className="text-xs font-medium tracking-wide font-sans-lux">{category.name}</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                  isSelected ? 'bg-black/15 text-black border border-black/10' : 'bg-black/40 text-gray-400 border border-lux-border'
                }`}>
                  {count}
                </span>
              </button>

              {/* Allow delete for custom categories */}
              {!isDefault && (
                <button
                  id={`btn-cat-delete-${category.id}`}
                  onClick={() => onDeleteCategory(category.id)}
                  title="Excluir categoria"
                  className="opacity-0 group-hover:opacity-100 p-2 text-gray-500 hover:text-red-400 hover:bg-lux-card-light rounded-lg transition-all duration-300 cursor-pointer"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
