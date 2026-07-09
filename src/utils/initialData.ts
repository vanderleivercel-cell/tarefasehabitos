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

export const DEFAULT_TASKS: Task[] = [
  {
    id: 'task-1',
    text: 'Revisar orçamento e metas de investimento mensais',
    completed: false,
    categoryId: 'cat-4',
    priority: 'Alta',
    dueDate: new Date().toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'task-2',
    text: 'Finalizar planejamento estratégico do novo projeto',
    completed: true,
    categoryId: 'cat-2',
    priority: 'Alta',
    dueDate: new Date().toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 'task-3',
    text: 'Organizar mesa de trabalho e arquivos digitais',
    completed: false,
    categoryId: 'cat-5',
    priority: 'Baixa',
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-4',
    text: 'Comprar suplementação diária (Vitamina D, Ômega 3)',
    completed: false,
    categoryId: 'cat-1',
    priority: 'Média',
    dueDate: new Date(Date.now() + 172800000).toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
  }
];

export const DEFAULT_HABITS: Habit[] = [
  {
    id: 'habit-1',
    name: 'Prática de Meditação Transcendental',
    categoryId: 'cat-3',
    streak: 8,
    completedDates: [
      new Date(Date.now() - 86400000).toISOString().split('T')[0],
      new Date(Date.now() - 172800000).toISOString().split('T')[0],
      new Date(Date.now() - 259200000).toISOString().split('T')[0],
    ],
    createdAt: new Date(Date.now() - 864000000).toISOString(),
    frequency: 'daily',
  },
  {
    id: 'habit-2',
    name: 'Treino de Força e Mobilidade',
    categoryId: 'cat-1',
    streak: 5,
    completedDates: [
      new Date(Date.now() - 86400000).toISOString().split('T')[0],
      new Date(Date.now() - 259200000).toISOString().split('T')[0],
    ],
    createdAt: new Date(Date.now() - 518400000).toISOString(),
    frequency: 'weekly_3x',
  },
  {
    id: 'habit-3',
    name: 'Leitura de Livro de Desenvolvimento ou Negócios',
    categoryId: 'cat-3',
    streak: 12,
    completedDates: [
      new Date().toISOString().split('T')[0],
      new Date(Date.now() - 86400000).toISOString().split('T')[0],
      new Date(Date.now() - 172800000).toISOString().split('T')[0],
    ],
    createdAt: new Date(Date.now() - 1209600000).toISOString(),
    frequency: 'daily',
  }
];

export const DEFAULT_WEEKLY_GOALS: WeeklyGoal[] = [
  {
    id: 'goal-1',
    title: 'Correr 20 quilômetros acumulados',
    currentValue: 12,
    targetValue: 20,
    unit: 'km',
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'goal-2',
    title: 'Estudar inglês / espanhol por 5 horas',
    currentValue: 5,
    targetValue: 5,
    unit: 'horas',
    completed: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'goal-3',
    title: 'Manter jejum intermitente de 16h',
    currentValue: 4,
    targetValue: 6,
    unit: 'vezes',
    completed: false,
    createdAt: new Date().toISOString(),
  }
];

export const DEFAULT_REMINDERS: Reminder[] = [
  {
    id: 'rem-1',
    text: 'Beber 500ml de água mineral alcalina',
    time: '10:00',
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'rem-2',
    text: 'Alongamento rápido e descanso visual (20-20-20)',
    time: '15:30',
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'rem-3',
    text: 'Revisão diária de conquistas e diário de gratidão',
    time: '21:30',
    active: false,
    createdAt: new Date().toISOString(),
  }
];
