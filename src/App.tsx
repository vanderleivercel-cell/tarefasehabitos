/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Category, Task, Habit, WeeklyGoal, Reminder } from './types';
import { supabase } from './lib/supabase';

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
  Calendar,
  Trophy,
  Flame,
  Bell,
  RefreshCw,
} from 'lucide-react';

export default function App() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [goals, setGoals] = useState<WeeklyGoal[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  // Navigation & Filtering
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'checklist' | 'habits' | 'goals_reminders'>('all');

  // Live luxury clock
  const [currentTime, setCurrentTime] = useState(new Date());

  // Fetch Data from Supabase
  const fetchData = async () => {
    setLoading(true);
    const [catsRes, tasksRes, habitsRes, goalsRes, remsRes] = await Promise.all([
      supabase.from('categories').select('*').order('name'),
      supabase.from('tasks').select('*').order('created_at', { ascending: false }),
      supabase.from('habits').select('*').order('created_at', { ascending: false }),
      supabase.from('weekly_goals').select('*').order('created_at', { ascending: false }),
      supabase.from('reminders').select('*').order('created_at', { ascending: false })
    ]);

    if (catsRes.data) setCategories(catsRes.data);
    if (tasksRes.data) setTasks(tasksRes.data.map(t => ({ id: t.id, text: t.text, completed: t.completed, categoryId: t.category_id, priority: t.priority as any, dueDate: t.due_date, createdAt: t.created_at })));
    if (habitsRes.data) setHabits(habitsRes.data.map(h => ({ id: h.id, name: h.name, categoryId: h.category_id, streak: h.streak, completedDates: h.completed_dates || [], frequency: h.frequency as any, createdAt: h.created_at })));
    if (goalsRes.data) setGoals(goalsRes.data.map(g => ({ id: g.id, title: g.title, currentValue: g.current_value, targetValue: g.target_value, unit: g.unit, completed: g.completed, createdAt: g.created_at })));
    if (remsRes.data) setReminders(remsRes.data.map(r => ({ id: r.id, text: r.text, time: r.time, date: r.date, active: r.active, createdAt: r.created_at })));
    
    setLoading(false);
  };

  useEffect(() => {
    fetchData();

    // Request Notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Set up Realtime subscriptions
    const subCategories = supabase.channel('categories_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, fetchData).subscribe();
    const subTasks = supabase.channel('tasks_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, fetchData).subscribe();
    const subHabits = supabase.channel('habits_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'habits' }, fetchData).subscribe();
    const subGoals = supabase.channel('goals_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'weekly_goals' }, fetchData).subscribe();
    const subReminders = supabase.channel('reminders_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'reminders' }, fetchData).subscribe();

    return () => {
      supabase.removeChannel(subCategories);
      supabase.removeChannel(subTasks);
      supabase.removeChannel(subHabits);
      supabase.removeChannel(subGoals);
      supabase.removeChannel(subReminders);
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Check for due reminders
  useEffect(() => {
    // Only check when seconds hit 00 to avoid multiple triggers in the same minute
    if (currentTime.getSeconds() === 0) {
      const dateStr = currentTime.toISOString().split('T')[0];
      const timeStr = currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      
      const dueReminders = reminders.filter(
        (r) => r.active && r.date === dateStr && r.time === timeStr
      );

      if (dueReminders.length > 0) {
        // Play luxury chime sound
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(err => console.log('Áudio bloqueado pelo navegador:', err));

        // Show native notifications
        dueReminders.forEach(r => {
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Lembrete de Elite', { body: r.text, icon: '/vite.svg' });
          } else {
            // Fallback if notifications are not enabled
            alert(`🔔 Lembrete: ${r.text}`);
          }
        });
      }
    }
  }, [currentTime, reminders]);

  // --- STATE MANIPULATORS ---

  // Categories
  const handleAddCategory = async (newCat: Category) => {
    // Generate UUID implicitly by Supabase or pass it
    const { data } = await supabase.from('categories').insert([{ name: newCat.name, color: newCat.color, icon: newCat.icon }]).select().single();
    if (data) setCategories(prev => [...prev, data]);
  };

  const handleDeleteCategory = async (catId: string) => {
    await supabase.from('categories').delete().eq('id', catId);
    setCategories(prev => prev.filter(c => c.id !== catId));
    if (selectedCategoryId === catId) setSelectedCategoryId(null);
  };

  // Checklist Tasks
  const handleAddTask = async (newTask: Task) => {
    const { data } = await supabase.from('tasks').insert([{ text: newTask.text, completed: newTask.completed, category_id: newTask.categoryId, priority: newTask.priority, due_date: newTask.dueDate }]).select().single();
    if (data) setTasks(prev => [{ id: data.id, text: data.text, completed: data.completed, categoryId: data.category_id, priority: data.priority as any, dueDate: data.due_date, createdAt: data.created_at }, ...prev]);
  };

  const handleToggleTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const newStatus = !task.completed;
    setTasks(prev => prev.map(t => (t.id === taskId ? { ...t, completed: newStatus } : t)));
    await supabase.from('tasks').update({ completed: newStatus }).eq('id', taskId);
  };

  const handleDeleteTask = async (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    await supabase.from('tasks').delete().eq('id', taskId);
  };

  // Daily Habits
  const handleAddHabit = async (newHabit: Habit) => {
    const { data } = await supabase.from('habits').insert([{ name: newHabit.name, category_id: newHabit.categoryId, frequency: newHabit.frequency }]).select().single();
    if (data) setHabits(prev => [{ id: data.id, name: data.name, categoryId: data.category_id, streak: data.streak, completedDates: data.completed_dates || [], frequency: data.frequency as any, createdAt: data.created_at }, ...prev]);
  };

  const handleToggleHabitDate = async (habitId: string, dateStr: string) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;
    const exists = habit.completedDates.includes(dateStr);
    const newCompletedDates = exists ? habit.completedDates.filter(d => d !== dateStr) : [...habit.completedDates, dateStr];
    setHabits(prev => prev.map(h => h.id === habitId ? { ...h, completedDates: newCompletedDates } : h));
    await supabase.from('habits').update({ completed_dates: newCompletedDates }).eq('id', habitId);
  };

  const handleDeleteHabit = async (habitId: string) => {
    setHabits(prev => prev.filter(h => h.id !== habitId));
    await supabase.from('habits').delete().eq('id', habitId);
  };

  // Weekly Goals
  const handleAddGoal = async (newGoal: WeeklyGoal) => {
    const { data } = await supabase.from('weekly_goals').insert([{ title: newGoal.title, target_value: newGoal.targetValue, unit: newGoal.unit }]).select().single();
    if (data) setGoals(prev => [{ id: data.id, title: data.title, currentValue: data.current_value, targetValue: data.target_value, unit: data.unit, completed: data.completed, createdAt: data.created_at }, ...prev]);
  };

  const handleUpdateGoalProgress = async (goalId: string, newValue: number) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;
    const isCompleted = newValue >= goal.targetValue;
    setGoals(prev => prev.map(g => g.id === goalId ? { ...g, currentValue: newValue, completed: isCompleted } : g));
    await supabase.from('weekly_goals').update({ current_value: newValue, completed: isCompleted }).eq('id', goalId);
  };

  const handleDeleteGoal = async (goalId: string) => {
    setGoals(prev => prev.filter(g => g.id !== goalId));
    await supabase.from('weekly_goals').delete().eq('id', goalId);
  };

  // Reminders
  const handleAddReminder = async (newReminder: Reminder) => {
    const { data } = await supabase.from('reminders').insert([{ text: newReminder.text, time: newReminder.time, date: newReminder.date, active: newReminder.active }]).select().single();
    if (data) setReminders(prev => [{ id: data.id, text: data.text, time: data.time, date: data.date, active: data.active, createdAt: data.created_at }, ...prev]);
  };

  const handleToggleReminder = async (remId: string) => {
    const rem = reminders.find(r => r.id === remId);
    if (!rem) return;
    const newStatus = !rem.active;
    setReminders(prev => prev.map(r => (r.id === remId ? { ...r, active: newStatus } : r)));
    await supabase.from('reminders').update({ active: newStatus }).eq('id', remId);
  };

  const handleDeleteReminder = async (remId: string) => {
    setReminders(prev => prev.filter(r => r.id !== remId));
    await supabase.from('reminders').delete().eq('id', remId);
  };

  const handleResetAll = async () => {
    if (window.confirm('Deseja EXCLUIR TODOS OS DADOS da nuvem permanentemente?')) {
      await supabase.from('tasks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('habits').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('weekly_goals').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('reminders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      fetchData();
    }
  };

  // --- STATS COMPUTATION ---
  const todayStr = new Date().toISOString().split('T')[0];

  const getItemCountsPerCategory = () => {
    const counts: Record<string, number> = {};
    categories.forEach(c => { counts[c.id] = 0; });
    tasks.forEach(t => { if (!t.completed && counts[t.categoryId] !== undefined) counts[t.categoryId]++; });
    habits.forEach(h => {
      const doneToday = h.completedDates.includes(todayStr);
      if (!doneToday && counts[h.categoryId] !== undefined) counts[h.categoryId]++;
    });
    return counts;
  };

  const itemCounts = getItemCountsPerCategory();

  const completedTasksCount = tasks.filter(t => t.completed).length;
  const totalTasksCount = tasks.length;
  const tasksPercent = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  const completedHabitsToday = habits.filter(h => h.completedDates.includes(todayStr)).length;
  const totalHabitsCount = habits.length;
  const habitsPercent = totalHabitsCount > 0 ? Math.round((completedHabitsToday / totalHabitsCount) * 100) : 0;

  const completedGoalsCount = goals.filter(g => g.completed).length;
  const totalGoalsCount = goals.length;
  const goalsPercent = totalGoalsCount > 0 ? Math.round((completedGoalsCount / totalGoalsCount) * 100) : 0;

  const activeRemindersCount = reminders.filter(r => r.active).length;

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
              <span className="text-[11px] sm:text-xs uppercase tracking-widest text-gray-300 font-bold font-serif-lux block">Checklist de Tarefas</span>
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
              <span className="text-[11px] sm:text-xs uppercase tracking-widest text-gray-300 font-bold font-serif-lux block">Hábitos de Hoje</span>
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
              <span className="text-[11px] sm:text-xs uppercase tracking-widest text-gray-300 font-bold font-serif-lux block">Metas Semanais</span>
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
              <span className="text-[11px] sm:text-xs uppercase tracking-widest text-gray-300 font-bold font-serif-lux block">Sinais Ativos</span>
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
