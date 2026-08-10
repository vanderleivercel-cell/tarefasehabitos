/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Category, Task, Habit, WeeklyGoal, Reminder } from './types';
import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';
import { Auth } from './components/Auth';
import AdminPanel from './components/AdminPanel';

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
  Clock,
  Loader2,
  Copy,
  MessageCircle
} from 'lucide-react';

function MainApp({ session, profile }: { session: Session; profile: any }) {
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

  // Hidden Admin Panel state
  const [adminClicks, setAdminClicks] = useState(0);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  const handleFooterClick = () => {
    if (profile?.role !== 'admin') return;
    setAdminClicks(prev => {
      if (prev + 1 >= 5) {
        setShowAdminPanel(true);
        return 0;
      }
      return prev + 1;
    });
  };

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

  // Reference to track the last checked minute
  const lastCheckedMinute = React.useRef<string | null>(null);

  // Check for due reminders
  useEffect(() => {
    const year = currentTime.getFullYear();
    const month = (currentTime.getMonth() + 1).toString().padStart(2, '0');
    const day = currentTime.getDate().toString().padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    const h = currentTime.getHours().toString().padStart(2, '0');
    const m = currentTime.getMinutes().toString().padStart(2, '0');
    const timeStr = `${h}:${m}`;
    
    // Only check once per minute, robust against browser tab throttling
    if (lastCheckedMinute.current !== timeStr) {
      lastCheckedMinute.current = timeStr;
      
      const dueReminders = reminders.filter(
        (r) => r.active && r.date === dateStr && r.time === timeStr
      );

      if (dueReminders.length > 0) {
        // Play luxury chime sound
        const audio = new Audio('/notification.mp3');
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
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <img 
              src="/logomarca-atual.png" 
              alt="Logo Tarefas e Hábitos" 
              className="h-16 md:h-24 w-auto object-contain rounded-xl"
            />
            <div className="flex items-center bg-lux-card/40 border border-gold-primary/20 rounded-xl px-4 py-2 shadow-[0_4px_15px_rgba(212,175,55,0.05)]">
              <div>
                <span className="block text-xs font-serif-lux text-gold-primary uppercase tracking-widest mb-0.5">
                  Taxa de Uso por 30 dias <strong className="text-white">R$ 14,90</strong>
                </span>
                <span className="block text-[10px] font-mono text-gray-400">
                  🎁 7 dias Grátis para testar!
                </span>
              </div>
            </div>
          </div>

          {/* Widgets */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            
            {profile?.expires_at && (
              <div className="flex items-center gap-4 bg-lux-card/40 border border-gold-primary/30 rounded-xl px-5 py-3 shadow-[0_4px_20px_rgba(212,175,55,0.1)]">
                <div className="text-right">
                  <span className="text-[10px] text-gray-500 block font-serif-lux uppercase tracking-widest">Validade</span>
                  <span className="text-sm font-mono font-bold text-white">
                    {new Date(profile.expires_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '').toUpperCase()}
                  </span>
                </div>
                <div className="w-[1px] h-8 bg-lux-border/50" />
                <a 
                  href={`https://wa.me/5512981152060?text=${encodeURIComponent(`Olá, gostaria de renovar minha assinatura!\n\nMeus Dados:\nNome: ${profile?.name || ''}\nEmail: ${profile?.email || ''}\nWhatsApp: ${profile?.whatsapp || ''}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-bold text-black gold-gradient-bg px-3 py-1.5 rounded uppercase tracking-widest hover:opacity-90 transition-opacity"
                >
                  Renovar
                </a>
              </div>
            )}

            {/* Admin Panel Button */}
            {profile?.role === 'admin' && (
              <button 
                onClick={() => setShowAdminPanel(true)}
                className="flex items-center justify-center gap-2 text-xs font-bold text-black gold-gradient-bg uppercase tracking-widest rounded-lg px-4 py-3 hover:opacity-90 transition-opacity shadow-[0_0_15px_rgba(212,175,55,0.3)]"
              >
                Painel Admin
              </button>
            )}

            {/* Luxury Clock & Logout Widget */}
            <div className="flex items-center gap-4 bg-lux-card/40 border border-lux-border rounded-xl px-5 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
              <div className="text-right">
                <span className="text-[10px] text-gray-500 block font-serif-lux uppercase tracking-widest">Tempo Presente</span>
                <span className="text-sm font-mono font-bold text-gold-primary gold-glow">
                  {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
              <div className="w-[1px] h-8 bg-lux-border/50" />
              <div className="text-left">
                <span className="text-[10px] text-gray-500 block font-serif-lux uppercase tracking-widest">Data</span>
                <span className="text-sm font-mono font-bold text-white">
                  {currentTime.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '').toUpperCase()}
                </span>
              </div>
            </div>

            <button 
              onClick={() => supabase.auth.signOut()}
              className="text-xs font-mono text-gray-400 hover:text-gold-primary uppercase tracking-widest border border-lux-border hover:border-gold-primary rounded-lg px-4 py-3 transition-colors bg-black/40"
            >
              Sair
            </button>
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
      {/* Footer with hidden admin trigger */}
      <footer 
        onClick={handleFooterClick} 
        className="pb-8 text-center text-[10px] text-gray-700 font-mono select-none cursor-default"
      >
        &copy; {new Date().getFullYear()} TAREFAS E HÁBITOS. TODOS OS DIREITOS RESERVADOS.
      </footer>

      {showAdminPanel && <AdminPanel onClose={() => setShowAdminPanel(false)} />}
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isRecovering, setIsRecovering] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes('type=recovery')) {
      setIsRecovering(true);
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setLoadingProfile(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (_event === 'PASSWORD_RECOVERY') {
        setIsRecovering(true);
      }
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setLoadingProfile(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    setLoadingProfile(true);
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) setProfile(data);
    setLoadingProfile(false);
  };

  if (!session) {
    return <Auth />;
  }

  if (isRecovering) {
    return (
      <div className="min-h-screen bg-lux-bg flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-lux-card/80 border border-lux-border rounded-2xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.8)] backdrop-blur-md">
          <h2 className="font-serif-lux text-2xl font-bold text-white uppercase tracking-widest text-center mb-6">
            Nova Senha
          </h2>
          <form 
            onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const password = formData.get('password') as string;
              
              try {
                const { error } = await supabase.auth.updateUser({ password });
                if (error) throw error;
                alert('Senha atualizada com sucesso!');
                setIsRecovering(false);
                window.location.hash = '';
              } catch (error: any) {
                alert(error.error_description || error.message);
              }
            }} 
            className="space-y-6"
          >
            <div>
              <label className="block text-xs font-serif-lux uppercase tracking-widest text-gold-primary mb-2">Digite sua nova senha</label>
              <input
                type="password"
                name="password"
                required
                className="w-full bg-black/50 border border-lux-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold-primary focus:ring-1 focus:ring-gold-primary transition-all font-mono"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 gold-gradient-bg text-black font-bold uppercase tracking-widest py-3 px-4 rounded-lg hover:opacity-90 transition-opacity"
            >
              Atualizar Senha
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-lux-bg flex items-center justify-center">
        <Loader2 className="animate-spin text-gold-primary" size={40} />
      </div>
    );
  }

  const isExpired = profile?.expires_at ? new Date(profile.expires_at) < new Date() : false;

  // Subscription Gate (Pix Checkout)
  if (profile?.status !== 'active' || isExpired) {
    const pixKey = "00020126580014BR.GOV.BCB.PIX0136c6ac4c13-eac3-4d96-88ca-09077ac09108520400005303986540514.905802BR5925Vanderlei Galvao da Silva6007Jacarei62070503***6304225D";
    const message = `Já efetuei o meu pagamento via PIX.\n\nMeus Dados:\nNome: ${profile?.name || 'Não informado'}\nEmail: ${profile?.email || 'Não informado'}\nWhatsApp: ${profile?.whatsapp || 'Não informado'}\n\nPode liberar meu acesso por favor?`;
    const whatsappUrl = `https://wa.me/5512981152060?text=${encodeURIComponent(message)}`;

    return (
      <div className="min-h-screen bg-lux-bg flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-lux-card/90 border border-gold-primary/30 rounded-2xl p-8 text-center shadow-[0_8px_32px_rgba(212,175,55,0.15)] backdrop-blur-md">
          
          <h2 className="font-serif-lux text-2xl font-bold text-white uppercase tracking-widest mb-2">
            {isExpired ? 'Tempo Esgotado' : 'Finalize seu Acesso'}
          </h2>
          <p className="text-gray-400 font-mono text-sm mb-6">
            {isExpired 
              ? 'Seu tempo de acesso expirou. Realize o pagamento de R$ 14,90 para liberar sua assinatura mensal e continuar evoluindo seus hábitos!' 
              : 'Para liberar seu aplicativo, realize o pagamento via PIX utilizando a chave abaixo.'}
          </p>

          {/* Pix Box */}
          <div className="bg-black/50 border border-lux-border rounded-xl p-6 mb-6 relative overflow-hidden">
            {/* Decoração sutil */}
            <div className="absolute top-0 left-0 w-full h-1 gold-gradient-bg" />
            
            <div className="w-48 h-48 bg-white p-2 mx-auto rounded-xl mb-6 flex flex-col items-center justify-center shadow-lg">
              <img src="/qr-pagamento-1490.png" alt="QR Code PIX" className="w-full h-full object-contain" />
            </div>
            
            <div className="text-left">
              <p className="text-[10px] font-serif-lux text-gold-primary uppercase tracking-widest mb-2">Chave Pix (Copia e Cola)</p>
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  readOnly 
                  value={pixKey}
                  className="w-full bg-black border border-lux-border rounded-lg px-3 py-3 text-gray-300 font-mono text-sm focus:outline-none focus:border-gold-primary/50 transition-colors"
                />
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(pixKey);
                    alert('Chave PIX copiada para a área de transferência!');
                  }}
                  className="bg-gold-primary text-black hover:bg-gold-primary/80 p-3 rounded-lg transition-colors flex items-center justify-center"
                  title="Copiar chave"
                >
                  <Copy size={20} />
                </button>
              </div>
            </div>
          </div>

          <a 
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1DA851] text-white font-bold text-sm tracking-wide py-4 px-4 rounded-xl transition-colors shadow-lg hover:shadow-xl mb-6 shadow-[#25D366]/20"
          >
            <MessageCircle size={24} />
            CLIQUE AQUI E CONFIRME O PAGAMENTO AGORA
          </a>

          <button onClick={() => supabase.auth.signOut()} className="text-gray-500 hover:text-white text-xs font-mono transition-colors uppercase tracking-widest underline decoration-gray-700 underline-offset-4">
            Sair e voltar depois
          </button>
        </div>
      </div>
    );
  }

  return <MainApp session={session} profile={profile} />;
}
