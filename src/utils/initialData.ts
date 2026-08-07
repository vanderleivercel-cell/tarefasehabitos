/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Category, Task, Habit, WeeklyGoal, Reminder } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Saúde & Físico', color: 'text-emerald-400 border-emerald-500/20', icon: 'Heart' },
  { id: 'cat-2', name: 'Trabalho & Foco', color: 'text-amber-400 border-amber-500/20', icon: 'Briefcase' },
  { id: 'cat-3', name: 'Mente & Sabedoria', color: 'text-indigo-400 border-indigo-500/20', icon: 'BookOpen' },
  { id: 'cat-4', name: 'Riqueza & Finanças', color: 'text-yellow-500 border-yellow-500/20', icon: 'Coins' },
  { id: 'cat-5', name: 'Rotina & Essencial', color: 'text-gold-primary border-gold-primary/20', icon: 'Sparkles' },
];

export const DEFAULT_TASKS: Task[] = [];

export const DEFAULT_HABITS: Habit[] = [];

export const DEFAULT_WEEKLY_GOALS: WeeklyGoal[] = [];

export const DEFAULT_REMINDERS: Reminder[] = [];
