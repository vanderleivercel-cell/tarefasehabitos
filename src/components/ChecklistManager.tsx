/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Task, Category, Priority } from '../types';
import IconRenderer from './IconRenderer';
import { Plus, Trash2, Search, Calendar, AlertTriangle, ArrowUpDown, Check, Clock } from 'lucide-react';

interface ChecklistManagerProps {
  tasks: Task[];
  categories: Category[];
  selectedCategoryId: string | null;
  onAddTask: (task: Task) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

type SortOption = 'createdAt' | 'dueDate' | 'priority' | 'completed';

export default function ChecklistManager({
  tasks,
  categories,
  selectedCategoryId,
  onAddTask,
  onToggleTask,
  onDeleteTask,
}: ChecklistManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [text, setText] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [priority, setPriority] = useState<Priority>('Média');
  const [dueDate, setDueDate] = useState('');
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('createdAt');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');

  // Set default category when modal opens or categories change
  React.useEffect(() => {
    if (categories.length > 0 && !categoryId) {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    if (!categoryId) {
      alert('⚠️ Por favor, crie pelo menos uma Categoria primeiro para poder adicionar tarefas!');
      return;
    }

    const newTask: Task = {
      id: `task-${Date.now()}`,
      text: text.trim(),
      completed: false,
      categoryId,
      priority,
      dueDate: dueDate || undefined,
      createdAt: new Date().toISOString(),
    };

    onAddTask(newTask);
    setText('');
    setDueDate('');
    setPriority('Média');
    setIsAdding(false);
  };

  // Filter tasks based on category and search query
  const filteredTasks = tasks.filter((task) => {
    const matchesCategory = selectedCategoryId === null || task.categoryId === selectedCategoryId;
    const matchesSearch = task.text.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterStatus === 'pending') {
      return matchesCategory && matchesSearch && !task.completed;
    } else if (filterStatus === 'completed') {
      return matchesCategory && matchesSearch && task.completed;
    }
    return matchesCategory && matchesSearch;
  });

  // Sort helper
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'completed') {
      return (a.completed ? 1 : 0) - (b.completed ? 1 : 0);
    }
    if (sortBy === 'dueDate') {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    }
    if (sortBy === 'priority') {
      const priorityWeight = { Alta: 3, Média: 2, Baixa: 1 };
      return priorityWeight[b.priority] - priorityWeight[a.priority];
    }
    // Default: creation date newest first
    return b.createdAt.localeCompare(a.createdAt);
  });

  const getPriorityColor = (p: Priority) => {
    switch (p) {
      case 'Alta':
        return 'text-red-400 bg-red-400/10 border-red-500/20';
      case 'Média':
        return 'text-amber-400 bg-amber-400/10 border-amber-500/20';
      case 'Baixa':
        return 'text-gray-400 bg-gray-400/10 border-gray-500/20';
    }
  };

  const getTaskStats = () => {
    const total = tasks.filter(t => selectedCategoryId === null || t.categoryId === selectedCategoryId).length;
    const completed = tasks.filter(t => (selectedCategoryId === null || t.categoryId === selectedCategoryId) && t.completed).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percent };
  };

  const stats = getTaskStats();

  return (
    <div id="checklist-manager" className="bg-lux-card border border-lux-border rounded-xl p-5 gold-border-glow">
      {/* Header and Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 pb-4 border-b border-lux-border">
        <div>
          <h3 className="font-serif-lux text-base font-semibold tracking-wider text-white uppercase flex items-center gap-2">
            <span className="w-1.5 h-4 bg-gold-primary rounded-full inline-block"></span>
            Checklist de Tarefas
          </h3>
          <p className="text-[11px] text-gray-400 mt-1 font-sans-lux">
            Atribua, conclua e conquiste metas com excelência.
          </p>
        </div>
        
        {/* Subtle Luxury Progress Indicator */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-widest text-gray-500 block font-serif-lux">Progresso de Elite</span>
            <span className="text-xs font-mono font-bold text-white">
              {stats.completed}/{stats.total} ({stats.percent}%)
            </span>
          </div>
          <div className="w-20 bg-black/50 border border-lux-border h-2 rounded-full overflow-hidden relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${stats.percent}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="gold-gradient-bg h-full rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Toolbar - Search, Sort, Filter & Add Toggle */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mb-5">
        {/* Search */}
        <div className="sm:col-span-4 relative">
          <Search size={14} className="absolute left-3 top-2.5 text-gray-500" />
          <input
            id="input-task-search"
            type="text"
            placeholder="Buscar tarefa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/30 border border-lux-border rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-gold-primary transition-all font-sans-lux"
          />
        </div>

        {/* Sort & Filter Controllers */}
        <div className="sm:col-span-5 flex gap-2">
          {/* Status Filter */}
          <select
            id="select-task-status-filter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="flex-1 bg-black/30 border border-lux-border rounded-lg px-2.5 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-gold-primary transition-all font-sans-lux cursor-pointer"
          >
            <option value="all">Todas as Tarefas</option>
            <option value="pending">Pendentes</option>
            <option value="completed">Concluídas</option>
          </select>

          {/* Sort selection */}
          <div className="relative flex items-center">
            <ArrowUpDown size={12} className="absolute right-3 text-gray-400 pointer-events-none" />
            <select
              id="select-task-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-black/30 border border-lux-border rounded-lg pl-2.5 pr-8 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-gold-primary transition-all font-sans-lux appearance-none cursor-pointer"
            >
              <option value="createdAt">Mais Recentes</option>
              <option value="dueDate">Data Limite</option>
              <option value="priority">Prioridade</option>
              <option value="completed">Conclusão</option>
            </select>
          </div>
        </div>

        {/* Add Trigger */}
        <button
          id="btn-toggle-add-task"
          onClick={() => setIsAdding(!isAdding)}
          className="sm:col-span-3 bg-white hover:bg-gray-100 text-black font-serif-lux font-bold tracking-widest text-[11px] py-1.5 px-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-1.5 hover:shadow-[0_0_12px_rgba(255,255,255,0.15)] cursor-pointer"
        >
          {isAdding ? 'CANCELAR' : 'NOVA TAREFA'}
        </button>
      </div>

      {/* Expandable Add Task Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.form
            id="form-add-task"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleSubmit}
            className="border border-gold-primary/20 rounded-xl p-4 mb-5 bg-black/50 space-y-4"
          >
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1.5 font-serif-lux">O que precisa ser realizado?</label>
              <input
                id="input-task-text"
                type="text"
                required
                placeholder="Ex: Assinar contratos estratégicos..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full bg-lux-card border border-lux-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-primary transition-all font-sans-lux"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Category selector */}
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1.5 font-serif-lux">Categoria</label>
                <select
                  id="select-task-category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-lux-card border border-lux-border rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-gold-primary cursor-pointer font-sans-lux"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority Selector */}
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1.5 font-serif-lux">Prioridade</label>
                <div className="grid grid-cols-3 gap-1">
                  {(['Baixa', 'Média', 'Alta'] as Priority[]).map((p) => (
                    <button
                      key={p}
                      id={`btn-priority-select-${p}`}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`text-[10px] py-2 rounded-lg border transition-all font-medium cursor-pointer ${
                        priority === p
                          ? 'bg-gold-primary/10 border-gold-primary text-gold-primary'
                          : 'bg-transparent border-lux-border text-gray-400 hover:text-white'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1.5 font-serif-lux">Prazo Limite</label>
                <input
                  id="input-task-due-date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-lux-card border border-lux-border rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-gold-primary font-sans-lux"
                />
              </div>
            </div>

            <button
              id="btn-save-task"
              type="submit"
              className="w-full bg-gold-primary hover:bg-gold-hover text-black font-serif-lux font-bold tracking-widest text-[11px] py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 hover:shadow-[0_0_15px_rgba(212,175,55,0.3)] cursor-pointer"
            >
              <Plus size={14} />
              ADICIONAR TAREFA
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Task List */}
      <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {sortedTasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8 border border-dashed border-lux-border rounded-xl bg-black/10"
            >
              <span className="text-gray-500 text-xs font-serif-lux tracking-wide">Nenhuma tarefa encontrada neste segmento.</span>
            </motion.div>
          ) : (
            sortedTasks.map((task) => {
              const category = categories.find((c) => c.id === task.categoryId);
              
              return (
                <motion.div
                  key={task.id}
                  id={`task-item-${task.id}`}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={`flex items-center justify-between p-3.5 rounded-lg border transition-all duration-300 ${
                    task.completed
                      ? 'bg-black/20 border-lux-border opacity-60'
                      : 'bg-lux-card-light border-lux-border hover:border-gold-primary/30'
                  }`}
                >
                  <div className="flex items-center gap-3.5 flex-1 mr-3">
                    {/* Custom Luxury Checkbox */}
                    <button
                      id={`btn-task-toggle-${task.id}`}
                      onClick={() => onToggleTask(task.id)}
                      className={`w-5.5 h-5.5 rounded-full border flex items-center justify-center transition-all duration-300 group cursor-pointer ${
                        task.completed
                          ? 'bg-gold-primary border-gold-primary text-black'
                          : 'border-gold-primary/40 hover:border-gold-primary bg-black/40 text-transparent hover:text-gold-primary/30'
                      }`}
                    >
                      <Check size={11} strokeWidth={3} className={task.completed ? 'block' : 'opacity-0 group-hover:opacity-100'} />
                    </button>

                    {/* Task Title and Subtext */}
                    <div className="flex-1">
                      <p
                        id={`task-text-display-${task.id}`}
                        className={`text-xs tracking-wide font-sans-lux transition-all duration-300 ${
                          task.completed ? 'line-through text-gray-500' : 'text-gray-100'
                        }`}
                      >
                        {task.text}
                      </p>
                      
                      {/* Meta Tags (Category & Due Date & Priority) */}
                      <div className="flex flex-wrap gap-2 mt-1.5 items-center">
                        {category && (
                          <span className={`text-[9px] font-sans-lux tracking-wider border rounded-full px-2 py-0.5 flex items-center gap-1 bg-black/40 ${category.color.split(' ')[0]} ${category.color.split(' ')[1] || 'border-lux-border'}`}>
                            <IconRenderer name={category.icon} size={10} />
                            {category.name}
                          </span>
                        )}

                        <span className={`text-[9px] font-sans-lux tracking-wider border rounded-full px-2 py-0.5 flex items-center gap-1 ${getPriorityColor(task.priority)}`}>
                          <AlertTriangle size={9} />
                          {task.priority}
                        </span>

                        {task.dueDate && (
                          <span className="text-[9px] font-mono text-gray-400 bg-black/40 border border-lux-border rounded-full px-2 py-0.5 flex items-center gap-1">
                            <Calendar size={10} className="text-gold-primary" />
                            {new Date(task.dueDate + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <button
                    id={`btn-task-delete-${task.id}`}
                    onClick={() => onDeleteTask(task.id)}
                    title="Excluir tarefa"
                    className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-black/30 rounded-lg transition-all duration-300 cursor-pointer"
                  >
                    <Trash2 size={13} />
                  </button>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
