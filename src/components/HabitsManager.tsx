/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Habit, Category } from '../types';
import IconRenderer from './IconRenderer';
import { Plus, Trash2, Flame, Sparkles, Check, ChevronRight, HelpCircle, CalendarDays } from 'lucide-react';

interface HabitsManagerProps {
  habits: Habit[];
  categories: Category[];
  selectedCategoryId: string | null;
  onAddHabit: (habit: Habit) => void;
  onToggleHabitDate: (id: string, dateStr: string) => void;
  onDeleteHabit: (id: string) => void;
}

export default function HabitsManager({
  habits,
  categories,
  selectedCategoryId,
  onAddHabit,
  onToggleHabitDate,
  onDeleteHabit,
}: HabitsManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly_3x' | 'weekly_5x'>('daily');

  // Set default category when modal opens
  React.useEffect(() => {
    if (categories.length > 0 && !categoryId) {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (!categoryId) {
      alert('⚠️ Por favor, crie pelo menos uma Categoria primeiro para poder adicionar hábitos!');
      return;
    }

    const newHabit: Habit = {
      id: `habit-${Date.now()}`,
      name: name.trim(),
      categoryId,
      streak: 0,
      completedDates: [],
      createdAt: new Date().toISOString(),
      frequency,
    };

    onAddHabit(newHabit);
    setName('');
    setFrequency('daily');
    setIsAdding(false);
  };

  // Generate last 7 days of the week in Portuguese
  const getPast7Days = () => {
    const days = [];
    const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      days.push({
        dateStr,
        dayName: weekdays[d.getDay()],
        dayNum: d.getDate(),
        isToday: i === 0,
      });
    }
    return days;
  };

  const past7Days = getPast7Days();
  const todayStr = past7Days[6].dateStr;

  // Filter habits based on selected category
  const filteredHabits = habits.filter(
    (habit) => selectedCategoryId === null || habit.categoryId === selectedCategoryId
  );

  // Helper to calculate exact current consecutive streak backwards
  const calculateStreak = (completedDates: string[]): number => {
    if (completedDates.length === 0) return 0;
    
    // Set of completed date strings
    const completedSet = new Set(completedDates);
    let streak = 0;
    const checkDate = new Date();
    
    // Check if completed today or yesterday to keep streak alive
    const todayISO = checkDate.toISOString().split('T')[0];
    checkDate.setDate(checkDate.getDate() - 1);
    const yesterdayISO = checkDate.toISOString().split('T')[0];
    
    let startCheckingFromToday = completedSet.has(todayISO);
    let startCheckingFromYesterday = completedSet.has(yesterdayISO);
    
    if (!startCheckingFromToday && !startCheckingFromYesterday) {
      return 0; // Streak is broken
    }
    
    // Re-verify from today backwards
    const cursor = new Date();
    if (!startCheckingFromToday) {
      cursor.setDate(cursor.getDate() - 1); // Start yesterday if not completed today
    }
    
    while (true) {
      const cursorStr = cursor.toISOString().split('T')[0];
      if (completedSet.has(cursorStr)) {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  };

  return (
    <div id="habits-manager" className="bg-lux-card border border-lux-border rounded-xl p-5 gold-border-glow">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 pb-4 border-b border-lux-border">
        <div>
          <h3 className="font-serif-lux text-base font-semibold tracking-wider text-white uppercase flex items-center gap-2">
            <span className="w-1.5 h-4 bg-gold-primary rounded-full inline-block"></span>
            Hábitos & Rotina Diária
          </h3>
          <p className="text-[11px] text-gray-400 mt-1 font-sans-lux">
            Construa consistência inabalável através de rituais recorrentes.
          </p>
        </div>

        <button
          id="btn-toggle-add-habit"
          onClick={() => setIsAdding(!isAdding)}
          className="bg-transparent border border-gold-primary/30 hover:border-gold-primary hover:bg-gold-primary/5 text-gold-primary font-serif-lux font-bold tracking-widest text-[11px] py-1.5 px-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer"
        >
          {isAdding ? 'CANCELAR' : 'NOVO HÁBITO'}
        </button>
      </div>

      {/* Expandable Add Habit Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.form
            id="form-add-habit"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleSubmit}
            className="border border-gold-primary/20 rounded-xl p-4 mb-5 bg-black/50 space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Habit Name */}
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1.5 font-serif-lux">Nome do Ritual / Hábito</label>
                <input
                  id="input-habit-name"
                  type="text"
                  required
                  placeholder="Ex: Treino de Alta Performance, Beber Água..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-lux-card border border-lux-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-primary transition-all font-sans-lux"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1.5 font-serif-lux">Categoria Associada</label>
                <select
                  id="select-habit-category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-lux-card border border-lux-border rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-gold-primary font-sans-lux cursor-pointer"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1.5 font-serif-lux">Frequência Semanal</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'daily', label: 'Diário' },
                  { id: 'weekly_3x', label: '3x por Semana' },
                  { id: 'weekly_5x', label: '5x por Semana' },
                ].map((freq) => (
                  <button
                    key={freq.id}
                    id={`btn-freq-select-${freq.id}`}
                    type="button"
                    onClick={() => setFrequency(freq.id as any)}
                    className={`text-xs py-2 rounded-lg border transition-all font-sans-lux cursor-pointer ${
                      frequency === freq.id
                        ? 'bg-gold-primary/10 border-gold-primary text-gold-primary font-semibold'
                        : 'bg-transparent border-lux-border text-gray-400 hover:text-white'
                    }`}
                  >
                    {freq.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              id="btn-save-habit"
              type="submit"
              className="w-full bg-gold-primary hover:bg-gold-hover text-black font-serif-lux font-bold tracking-widest text-[11px] py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 hover:shadow-[0_0_15px_rgba(212,175,55,0.3)] cursor-pointer"
            >
              <Plus size={14} />
              CRIAR RITUAL DIÁRIO
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Habits List */}
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
        {filteredHabits.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-lux-border rounded-xl bg-black/10">
            <span className="text-gray-400 text-sm font-serif-lux tracking-widest">Nenhum hábito cadastrado nesta categoria.</span>
          </div>
        ) : (
          filteredHabits.map((habit) => {
            const category = categories.find((c) => c.id === habit.categoryId);
            const isCompletedToday = habit.completedDates.includes(todayStr);
            const currentStreak = calculateStreak(habit.completedDates);

            return (
              <div
                key={habit.id}
                id={`habit-card-${habit.id}`}
                className="bg-lux-card-light border border-lux-border rounded-xl p-4 hover:border-gold-primary/20 transition-all duration-300 relative group"
              >
                {/* Header Info */}
                <div className="flex items-start justify-between gap-3 mb-3.5">
                  <div className="flex items-start gap-3">
                    {/* Checkbox for today */}
                    <button
                      id={`btn-habit-check-today-${habit.id}`}
                      onClick={() => onToggleHabitDate(habit.id, todayStr)}
                      className={`w-10 h-10 rounded-xl border flex flex-col items-center justify-center transition-all duration-300 cursor-pointer ${
                        isCompletedToday
                          ? 'bg-gold-primary border-gold-primary text-black hover:bg-gold-hover'
                          : 'border-gold-primary/30 text-gold-primary hover:border-gold-primary hover:bg-gold-primary/5 bg-black/40'
                      }`}
                    >
                      <Check size={18} strokeWidth={2.5} />
                    </button>

                    <div>
                      <h4 className={`text-xs font-semibold tracking-wide font-sans-lux transition-all duration-300 ${isCompletedToday ? 'text-gray-400 line-through' : 'text-gray-100'}`}>
                        {habit.name}
                      </h4>
                      <div className="flex gap-2 mt-1 items-center">
                        {category && (
                          <span className={`text-[9px] font-sans-lux tracking-wider border rounded-full px-2 py-0.5 flex items-center gap-1 bg-black/40 ${category.color.split(' ')[0]} ${category.color.split(' ')[1] || 'border-lux-border'}`}>
                            <IconRenderer name={category.icon} size={9} />
                            {category.name}
                          </span>
                        )}
                        <span className="text-[9px] text-gray-500 font-sans-lux uppercase tracking-wider bg-black/40 px-2 py-0.5 rounded-full border border-lux-border">
                          {habit.frequency === 'daily' ? 'Diário' : habit.frequency === 'weekly_3x' ? '3x / Semana' : '5x / Semana'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Streak display & Delete Button */}
                  <div className="flex items-center gap-2">
                    <div className="bg-black/50 border border-lux-border px-2 py-1 rounded-lg flex items-center gap-1">
                      <Flame size={12} className="text-gold-primary fill-gold-primary/20" />
                      <span className="text-xs font-mono font-bold text-gold-primary">{currentStreak} dias</span>
                    </div>

                    <button
                      id={`btn-habit-delete-${habit.id}`}
                      onClick={() => onDeleteHabit(habit.id)}
                      title="Excluir hábito"
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-500 hover:text-red-400 hover:bg-black/30 rounded-lg transition-all duration-300 cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* 7-day Visual Matrix (Compliance grid) */}
                <div className="bg-black/30 border border-lux-border/40 rounded-lg p-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <CalendarDays size={12} className="text-gray-500" />
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest font-serif-lux">Últimos 7 dias</span>
                  </div>

                  <div className="flex gap-2">
                    {past7Days.map((day) => {
                      const completedOnDay = habit.completedDates.includes(day.dateStr);
                      return (
                        <div
                          key={day.dateStr}
                          id={`habit-${habit.id}-day-${day.dateStr}`}
                          className="flex flex-col items-center"
                        >
                          <span className="text-[8px] font-mono text-gray-500 mb-1">{day.dayName}</span>
                          <button
                            id={`btn-habit-${habit.id}-toggle-day-${day.dateStr}`}
                            onClick={() => onToggleHabitDate(habit.id, day.dateStr)}
                            className={`w-5.5 h-5.5 rounded-full border flex items-center justify-center text-[9px] font-mono transition-all duration-300 cursor-pointer ${
                              completedOnDay
                                ? 'bg-gold-primary/90 border-gold-primary text-black font-bold scale-110 shadow-[0_0_8px_rgba(212,175,55,0.25)]'
                                : day.isToday
                                ? 'border-gold-primary/50 text-gold-primary hover:border-gold-primary'
                                : 'border-lux-border text-gray-500 hover:border-gold-primary/30 hover:text-white'
                            }`}
                          >
                            {day.dayNum}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
