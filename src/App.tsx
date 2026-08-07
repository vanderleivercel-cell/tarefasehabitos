/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Category, Task, Habit, WeeklyGoal, Reminder } from './types';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_TASKS,
  DEFAULT_HABITS,
  DEFAULT_WEEKLY_GOALS,
  DEFAULT_REMINDERS,
} from './utils/initialData';

// Component Imports
import CategoriesManager from './components/CategoriesManager';
import ChecklistManager from './components/ChecklistManager';
import HabitsManager from './components/HabitsManager';
import WeeklyGoalsManager from './components/WeeklyGoalsManager';
import RemindersManager from './components/RemindersManager';

// Icon Imports
import {
  LayoutDashboard,
  CheckSquare,
  Sparkles,
  Target,
  Clock,
  Calendar,
  Compass,
  Trophy,
  Flame,
  Award,
  Bell,
  RefreshCw,
} from 'lucide-react';

export default function App() {
  // --- STATE INITIALIZATION & DURABLE PERSISTENCE ---
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('lux_categories');
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('lux_tasks');
    return saved ? JSON.parse(saved) : DEFAULT_TASKS;
  });

  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem('lux_habits');
    return saved ? JSON.parse(saved) : DEFAULT_HABITS;
  });

  const [goals, setGoals] = useState<WeeklyGoal[]>(() => {
    const saved = localStorage.getItem('lux_goals');
    return saved ? JSON.parse(saved) : DEFAULT_WEEKLY_GOALS;
  });

  const [reminders, setReminders] = useState<Reminder[]>(() => {
    const saved = localStorage.getItem('lux_reminders');
    return saved ? JSON.parse(saved) : DEFAULT_REMINDERS;
  });

  // Navigation & Filtering
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'checklist' | 'habits' | 'goals_reminders'>('all');

  // Live luxury clock
  const [currentTime, setCurrentTime] = useState(new Date());

  // --- PERSISTENCE SYNCHRONIZATION ---
  useEffect(() => {
    localStorage.setItem('lux_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('lux_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('lux_habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('lux_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('lux_reminders', JSON.stringify(reminders));
  }, [reminders]);

  // Live clock interval
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // --- STATE MANIPULATORS ---

  // Categories
  const handleAddCategory = (newCat: Category) => {
    setCategories((prev) => [...prev, newCat]);
  };

  const handleDeleteCategory = (catId: string) => {
    // Prevent deleting default categories
    if (['cat-1', 'cat-2', 'cat-3', 'cat-4', 'cat-5'].includes(catId)) return;
    setCategories((prev) => prev.filter((c) => c.id !== catId));
    // Reset selection if deleted
    if (selectedCategoryId === catId) {
      setSelectedCategoryId(null);
    }
    // Remap tasks and habits under deleted category to "Rotina & Essencial"
    setTasks((prev) =>
      prev.map((t) => (t.categoryId === catId ? { ...t, categoryId: 'cat-5' } : t))
    );
    setHabits((prev) =>
      prev.map((h) => (h.categoryId === catId ? { ...h, categoryId: 'cat-5' } : h))
    );
  };

  // Checklist Tasks
  const handleAddTask = (newTask: Task) => {
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleToggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  // Daily Habits
  const handleAddHabit = (newHabit: Habit) => {
    setHabits((prev) => [newHabit, ...prev]);
  };

  const handleToggleHabitDate = (habitId: string, dateStr: string) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== habitId) return h;
        const exists = h.completedDates.includes(dateStr);
        const newCompletedDates = exists
          ? h.completedDates.filter((d) => d !== dateStr)
          : [...h.completedDates, dateStr];

        return {
          ...h,
          completedDates: newCompletedDates,
        };
      })
    );
  };

  const handleDeleteHabit = (habitId: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== habitId));
  };

  // Weekly Goals
  const handleAddGoal = (newGoal: WeeklyGoal) => {
    setGoals((prev) => [newGoal, ...prev]);
  };

  const handleUpdateGoalProgress = (goalId: string, newValue: number) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== goalId) return g;
        const isCompleted = newValue >= g.targetValue;
        return {
          ...g,
          currentValue: newValue,
          completed: isCompleted,
        };
      })
    );
  };

  const handleDeleteGoal = (goalId: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== goalId));
  };

  // Reminders
  const handleAddReminder = (newReminder: Reminder) => {
    setReminders((prev) => [newReminder, ...prev]);
  };

  const handleToggleReminder = (remId: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === remId ? { ...r, active: !r.active } : r))
    );
  };

  const handleDeleteReminder = (remId: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== remId));
  };

  // Reset all to default (Prudential restart)
  const handleResetAll = () => {
    if (window.confirm('Deseja redefinir todos os dados para o padrão de fábrica?')) {
      setCategories(DEFAULT_CATEGORIES);
      setTasks(DEFAULT_TASKS);
      setHabits(DEFAULT_HABITS);
      setGoals(DEFAULT_WEEKLY_GOALS);
      setReminders(DEFAULT_REMINDERS);
      setSelectedCategoryId(null);
      setActiveTab('all');
    }
  };

  // --- STATS COMPUTATION ---
  const todayStr = new Date().toISOString().split('T')[0];

  // Category counts
  const getItemCountsPerCategory = () => {
    const counts: Record<string, number> = {};
    categories.forEach((c) => {
      counts[c.id] = 0;
    });

    tasks.forEach((t) => {
      if (!t.completed && counts[t.categoryId] !== undefined) {
        counts[t.categoryId]++;
      }
    });

    habits.forEach((h) => {
      const doneToday = h.completedDates.includes(todayStr);
      if (!doneToday && counts[h.categoryId] !== undefined) {
        counts[h.categoryId]++;
      }
    });

    return counts;
  };

  const itemCounts = getItemCountsPerCategory();

  // Tasks progress stats
  const completedTasksCount = tasks.filter((t) => t.completed).length;
  const totalTasksCount = tasks.length;
  const tasksPercent = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  // Habits completed today count
  const completedHabitsToday = habits.filter((h) => h.completedDates.includes(todayStr)).length;
  const totalHabitsCount = habits.length;
  const habitsPercent = totalHabitsCount > 0 ? Math.round((completedHabitsToday / totalHabitsCount) * 100) : 0;

  // Weekly Goals completed
  const completedGoalsCount = goals.filter((g) => g.completed).length;
  const totalGoalsCount = goals.length;
  const goalsPercent = totalGoalsCount > 0 ? Math.round((completedGoalsCount / totalGoalsCount) * 100) : 0;

  // Active reminders
  const activeRemindersCount = reminders.filter((r) => r.active).length;

  return (
    <div className="min-h-screen bg-lux-bg text-gray-200 selection:bg-gold-primary selection:text-black pb-12">
      {/* Background radial highlight */}
      <div className="absolute top-0 left-0 right-0 h-[450px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gold-primary/5 via-transparent to-transparent pointer-events-none" />

      {/* Luxury Brand Top Accent Line */}
      <div className="w-full h-[3px] gold-gradient-bg" />

      <header className="max-w-7xl mx-auto px-4 pt-8 pb-4">
        {/* Upper Brand bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-lux-border/60">
          <div>
            <h1 className="font-serif-lux text-2xl md:text-3xl font-extrabold tracking-[0.25em] text-white flex items-center gap-1.5 uppercase">
              TAREFAS E HÁBITOS
            </h1>
          </div>

          {/* Luxury Clock / Calendar Widget */}
          <div className="flex items-center gap-4 bg-lux-card/40 border border-lux-border rounded-xl px-5 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
            <div className="text-right">
              <span className="text-[10px] text-gray-500 block font-serif-lux uppercase tracking-widest">Tempo Presente</span>
              <span className="text-sm font-mono font-bold text-gold-primary gold-glow">
                {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
            <div className="h-8 w-px bg-lux-border" />
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-gold-primary" />
              <div>
                <span className="text-[9px] text-gray-500 block font-serif-lux uppercase tracking-widest">Data Imperial</span>
                <span className="text-xs font-sans-lux font-semibold text-white capitalize">
                  {currentTime.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Summary Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {/* Card 1: Checklist */}
          <div className="bg-lux-card border border-lux-border rounded-xl p-4 flex items-center justify-between hover:border-gold-primary/25 transition-all duration-300">
            <div>
              <span className="text-[9px] uppercase tracking-widest text-gray-500 font-serif-lux block">Checklist de Tarefas</span>
              <span className="text-xl font-mono font-bold text-white mt-1 block">
                {completedTasksCount} <span className="text-xs text-gray-500">/ {totalTasksCount}</span>
              </span>
              <span className="text-[10px] text-gray-400 mt-1 block font-sans-lux">{tasksPercent}% concluído</span>
            </div>
            <div className="relative flex items-center justify-center">
              <CheckSquare size={22} className="text-gold-primary opacity-80" />
              <div className="absolute inset-0 bg-gold-primary/10 rounded-full filter blur-md" />
            </div>
          </div>

          {/* Card 2: Habits */}
          <div className="bg-lux-card border border-lux-border rounded-xl p-4 flex items-center justify-between hover:border-gold-primary/25 transition-all duration-300">
            <div>
              <span className="text-[9px] uppercase tracking-widest text-gray-500 font-serif-lux block">Hábitos de Hoje</span>
              <span className="text-xl font-mono font-bold text-white mt-1 block">
                {completedHabitsToday} <span className="text-xs text-gray-500">/ {totalHabitsCount}</span>
              </span>
              <span className="text-[10px] text-gray-400 mt-1 block font-sans-lux">{habitsPercent}% de consistência</span>
            </div>
            <div className="relative flex items-center justify-center">
              <Flame size={22} className="text-amber-500 opacity-85" />
              <div className="absolute inset-0 bg-amber-500/10 rounded-full filter blur-md" />
            </div>
          </div>

          {/* Card 3: Weekly Goals */}
          <div className="bg-lux-card border border-lux-border rounded-xl p-4 flex items-center justify-between hover:border-gold-primary/25 transition-all duration-300">
            <div>
              <span className="text-[9px] uppercase tracking-widest text-gray-500 font-serif-lux block">Metas Semanais</span>
              <span className="text-xl font-mono font-bold text-white mt-1 block">
                {completedGoalsCount} <span className="text-xs text-gray-500">/ {totalGoalsCount}</span>
              </span>
              <span className="text-[10px] text-gray-400 mt-1 block font-sans-lux">{goalsPercent}% da meta atingida</span>
            </div>
            <div className="relative flex items-center justify-center">
              <Trophy size={22} className="text-gold-primary opacity-80" />
              <div className="absolute inset-0 bg-gold-primary/10 rounded-full filter blur-md" />
            </div>
          </div>

          {/* Card 4: Focus Alerts */}
          <div className="bg-lux-card border border-lux-border rounded-xl p-4 flex items-center justify-between hover:border-gold-primary/25 transition-all duration-300">
            <div>
              <span className="text-[9px] uppercase tracking-widest text-gray-500 font-serif-lux block">Sinais Ativos</span>
              <span className="text-xl font-mono font-bold text-white mt-1 block">
                {activeRemindersCount} <span className="text-xs text-gray-500">/ {reminders.length}</span>
              </span>
              <span className="text-[10px] text-gray-400 mt-1 block font-sans-lux">Lembretes programados</span>
            </div>
            <div className="relative flex items-center justify-center">
              <Bell size={22} className="text-white opacity-80" />
              <div className="absolute inset-0 bg-white/5 rounded-full filter blur-md" />
            </div>
          </div>
        </div>

        {/* Tab Selector & Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mt-8 gap-4 pb-4 border-b border-lux-border">
          <div className="flex overflow-x-auto p-1 bg-black/40 border border-lux-border/80 rounded-xl space-x-1">
            <button
              id="tab-all"
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg text-xs font-serif-lux tracking-wider transition-all duration-300 cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === 'all'
                  ? 'bg-gold-primary text-black font-bold shadow-[0_0_8px_rgba(212,175,55,0.2)]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <LayoutDashboard size={14} />
              VISÃO GERAL
            </button>
            <button
              id="tab-checklist"
              onClick={() => setActiveTab('checklist')}
              className={`px-4 py-2 rounded-lg text-xs font-serif-lux tracking-wider transition-all duration-300 cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === 'checklist'
                  ? 'bg-gold-primary text-black font-bold shadow-[0_0_8px_rgba(212,175,55,0.2)]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <CheckSquare size={14} />
              CHECKLIST
            </button>
            <button
              id="tab-habits"
              onClick={() => setActiveTab('habits')}
              className={`px-4 py-2 rounded-lg text-xs font-serif-lux tracking-wider transition-all duration-300 cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === 'habits'
                  ? 'bg-gold-primary text-black font-bold shadow-[0_0_8px_rgba(212,175,55,0.2)]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Sparkles size={14} />
              HÁBITOS & ROTINA
            </button>
            <button
              id="tab-goals-reminders"
              onClick={() => setActiveTab('goals_reminders')}
              className={`px-4 py-2 rounded-lg text-xs font-serif-lux tracking-wider transition-all duration-300 cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === 'goals_reminders'
                  ? 'bg-gold-primary text-black font-bold shadow-[0_0_8px_rgba(212,175,55,0.2)]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Target size={14} />
              METAS & ALERTAS
            </button>
          </div>

          {/* Reset button */}
          <button
            id="btn-factory-reset"
            onClick={handleResetAll}
            title="Redefinir aplicativo"
            className="px-3 py-2 bg-transparent border border-lux-border hover:border-red-500/40 hover:bg-red-500/5 text-gray-500 hover:text-red-400 rounded-xl text-xs font-serif-lux tracking-widest transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <RefreshCw size={13} />
            LIMPAR DADOS
          </button>
        </div>
      </header>

      {/* Main Dashboard Panel Layout */}
      <main className="max-w-7xl mx-auto px-4 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Categories Panel (3 Cols) */}
          <div className="lg:col-span-3">
            <div className="sticky top-6 space-y-6">
              <CategoriesManager
                categories={categories}
                selectedCategoryId={selectedCategoryId}
                onSelectCategory={setSelectedCategoryId}
                onAddCategory={handleAddCategory}
                onDeleteCategory={handleDeleteCategory}
                itemCounts={itemCounts}
              />
              
              {/* Luxury Quote */}
              <div className="bg-gradient-to-br from-lux-card to-black border border-lux-border rounded-xl p-4 text-center">
                <span className="text-[8px] uppercase tracking-[0.2em] text-gold-primary font-serif-lux font-bold block mb-2">Máxima Diária</span>
                <p className="text-xs font-serif-lux text-gray-300 leading-relaxed italic">
                  "Somos o que repetidamente fazemos. A excelência, portanto, não é um ato, mas um hábito."
                </p>
                <span className="text-[9px] text-gray-500 block mt-2 font-sans-lux font-medium">— Aristóteles</span>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Content Grid (9 Cols) */}
          <div className="lg:col-span-9 space-y-6">
            <AnimatePresence mode="wait">
              {/* TAB 1: ALL-IN-ONE BENTO DASHBOARD */}
              {activeTab === 'all' && (
                <motion.div
                  key="bento"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  {/* Checklist widget */}
                  <div className="md:col-span-2">
                    <ChecklistManager
                      tasks={tasks}
                      categories={categories}
                      selectedCategoryId={selectedCategoryId}
                      onAddTask={handleAddTask}
                      onToggleTask={handleToggleTask}
                      onDeleteTask={handleDeleteTask}
                    />
                  </div>

                  {/* Routine widget */}
                  <div>
                    <HabitsManager
                      habits={habits}
                      categories={categories}
                      selectedCategoryId={selectedCategoryId}
                      onAddHabit={handleAddHabit}
                      onToggleHabitDate={handleToggleHabitDate}
                      onDeleteHabit={handleDeleteHabit}
                    />
                  </div>

                  {/* Right hand double widgets */}
                  <div className="space-y-6">
                    <WeeklyGoalsManager
                      goals={goals}
                      onAddGoal={handleAddGoal}
                      onUpdateGoalProgress={handleUpdateGoalProgress}
                      onDeleteGoal={handleDeleteGoal}
                    />

                    <RemindersManager
                      reminders={reminders}
                      onAddReminder={handleAddReminder}
                      onToggleReminder={handleToggleReminder}
                      onDeleteReminder={handleDeleteReminder}
                    />
                  </div>
                </motion.div>
              )}

              {/* TAB 2: CHECKLIST DETAILS */}
              {activeTab === 'checklist' && (
                <motion.div
                  key="checklist-details"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChecklistManager
                    tasks={tasks}
                    categories={categories}
                    selectedCategoryId={selectedCategoryId}
                    onAddTask={handleAddTask}
                    onToggleTask={handleToggleTask}
                    onDeleteTask={handleDeleteTask}
                  />
                </motion.div>
              )}

              {/* TAB 3: HÁBITOS & ROTINA DETAILS */}
              {activeTab === 'habits' && (
                <motion.div
                  key="habits-details"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                >
                  <HabitsManager
                    habits={habits}
                    categories={categories}
                    selectedCategoryId={selectedCategoryId}
                    onAddHabit={handleAddHabit}
                    onToggleHabitDate={handleToggleHabitDate}
                    onDeleteHabit={handleDeleteHabit}
                  />
                </motion.div>
              )}

              {/* TAB 4: GOALS & REMINDERS */}
              {activeTab === 'goals_reminders' && (
                <motion.div
                  key="goals-reminders-details"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  <WeeklyGoalsManager
                    goals={goals}
                    onAddGoal={handleAddGoal}
                    onUpdateGoalProgress={handleUpdateGoalProgress}
                    onDeleteGoal={handleDeleteGoal}
                  />

                  <RemindersManager
                    reminders={reminders}
                    onAddReminder={handleAddReminder}
                    onToggleReminder={handleToggleReminder}
                    onDeleteReminder={handleDeleteReminder}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
