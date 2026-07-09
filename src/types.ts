/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Category {
  id: string;
  name: string;
  color: string; // Tailwind class or hex representing different shades of black/white/gold
  icon: string; // Lucide icon name
}

export type Priority = 'Baixa' | 'Média' | 'Alta';

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  categoryId: string;
  priority: Priority;
  dueDate?: string; // YYYY-MM-DD
  createdAt: string;
}

export interface Habit {
  id: string;
  name: string;
  categoryId: string;
  streak: number;
  completedDates: string[]; // List of YYYY-MM-DD when completed
  createdAt: string;
  frequency: 'daily' | 'weekly_3x' | 'weekly_5x';
}

export interface WeeklyGoal {
  id: string;
  title: string;
  currentValue: number;
  targetValue: number;
  unit: string; // e.g., "vezes", "km", "páginas", "horas"
  completed: boolean;
  createdAt: string;
}

export interface Reminder {
  id: string;
  text: string;
  time: string; // HH:MM
  date?: string; // YYYY-MM-DD (optional, if specific date)
  active: boolean;
  createdAt: string;
}
