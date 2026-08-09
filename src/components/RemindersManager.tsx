/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Reminder } from '../types';
import { Plus, Trash2, Bell, BellOff, Clock, Calendar } from 'lucide-react';

interface RemindersManagerProps {
  reminders: Reminder[];
  onAddReminder: (reminder: Reminder) => void;
  onToggleReminder: (id: string) => void;
  onDeleteReminder: (id: string) => void;
}

export default function RemindersManager({
  reminders,
  onAddReminder,
  onToggleReminder,
  onDeleteReminder,
}: RemindersManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [text, setText] = useState('');
  const [time, setTime] = useState('12:00');
  const [date, setDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !time) return;

    const newReminder: Reminder = {
      id: `rem-${Date.now()}`,
      text: text.trim(),
      time,
      date: date || undefined,
      active: true,
      createdAt: new Date().toISOString(),
    };

    onAddReminder(newReminder);
    setText('');
    setTime('12:00');
    setDate('');
    setIsAdding(false);
  };

  return (
    <div id="reminders-manager" className="bg-lux-card border border-lux-border rounded-xl p-5 gold-border-glow">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-lux-border">
        <div>
          <h3 className="font-serif-lux text-base font-semibold tracking-wider text-white uppercase flex items-center gap-2">
            <span className="w-1.5 h-4 bg-gold-primary rounded-full inline-block"></span>
            Lembretes de Foco
          </h3>
          <p className="text-[11px] text-gray-400 mt-1 font-sans-lux">
            Notificações pontuais para manter seu alinhamento diário.
          </p>
        </div>

        <button
          id="btn-toggle-add-reminder"
          onClick={() => setIsAdding(!isAdding)}
          className="p-1.5 rounded-lg border border-lux-border hover:border-gold-primary/50 text-gold-primary transition-all duration-300 flex items-center gap-1 text-xs font-serif-lux tracking-wider hover:bg-gold-primary/5 cursor-pointer"
        >
          {isAdding ? 'Fechar' : 'Novo Alerta'}
        </button>
      </div>

      {/* Expandable Add Reminder Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.form
            id="form-add-reminder"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleSubmit}
            className="overflow-hidden border border-gold-primary/20 rounded-xl p-4 mb-5 bg-black/50 space-y-4"
          >
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1.5 font-serif-lux">O que lembrar?</label>
              <input
                id="input-reminder-text"
                type="text"
                required
                placeholder="Ex: Tomar água alcalina, Meditação da tarde..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full bg-lux-card border border-lux-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-primary transition-all font-sans-lux"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Time */}
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1.5 font-serif-lux">Horário</label>
                <input
                  id="input-reminder-time"
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-lux-card border border-lux-border rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-gold-primary font-sans-lux cursor-pointer"
                />
              </div>

              {/* Optional Date */}
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1.5 font-serif-lux">Data (Opcional)</label>
                <input
                  id="input-reminder-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-lux-card border border-lux-border rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-gold-primary font-sans-lux"
                />
              </div>
            </div>

            <button
              id="btn-save-reminder"
              type="submit"
              className="w-full bg-gold-primary hover:bg-gold-hover text-black font-serif-lux font-bold tracking-widest text-[11px] py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 hover:shadow-[0_0_15px_rgba(212,175,55,0.3)] cursor-pointer"
            >
              <Bell size={14} />
              HABILITAR LEMBRETE
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Reminders List */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
        {reminders.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-lux-border rounded-xl bg-black/10">
            <span className="text-gray-400 text-sm font-serif-lux tracking-widest leading-relaxed text-center block px-4">Sem lembretes configurados.<br/>Agende seus momentos cruciais.</span>
          </div>
        ) : (
          reminders.map((reminder) => {
            return (
              <div
                key={reminder.id}
                id={`reminder-card-${reminder.id}`}
                className={`bg-lux-card-light border rounded-xl p-3.5 hover:border-gold-primary/20 transition-all duration-300 relative group flex items-center justify-between ${
                  reminder.active ? 'border-lux-border' : 'border-lux-border/40 opacity-50'
                }`}
              >
                <div className="flex items-center gap-3.5 flex-1 min-w-0 mr-2">
                  {/* Alarm status bell */}
                  <button
                    id={`btn-reminder-toggle-${reminder.id}`}
                    onClick={() => onToggleReminder(reminder.id)}
                    className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 transition-all duration-300 cursor-pointer ${
                      reminder.active
                        ? 'bg-gold-primary/10 border-gold-primary/30 text-gold-primary'
                        : 'border-lux-border text-gray-500 bg-black/40'
                    }`}
                  >
                    {reminder.active ? <Bell size={15} className="animate-pulse" /> : <BellOff size={15} />}
                  </button>

                  <div className="min-w-0">
                    <h4 className={`text-xs font-semibold tracking-wide font-sans-lux truncate ${reminder.active ? 'text-gray-100' : 'text-gray-500 line-through'}`}>
                      {reminder.text}
                    </h4>
                    
                    <div className="flex gap-2.5 mt-1 items-center">
                      <span className="text-[10px] text-gold-primary font-mono font-bold flex items-center gap-1">
                        <Clock size={11} />
                        {reminder.time}
                      </span>
                      
                      {reminder.date && (
                        <span className="text-[9px] text-gray-400 font-mono flex items-center gap-1">
                          <Calendar size={10} />
                          {new Date(reminder.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Switch & Delete buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Switch */}
                  <button
                    id={`btn-reminder-switch-${reminder.id}`}
                    onClick={() => onToggleReminder(reminder.id)}
                    className={`w-8 h-4.5 rounded-full p-0.5 transition-colors duration-300 focus:outline-none cursor-pointer ${
                      reminder.active ? 'bg-gold-primary' : 'bg-zinc-800 border border-lux-border'
                    }`}
                  >
                    <motion.div
                      layout
                      className="bg-black w-3.5 h-3.5 rounded-full"
                      animate={{ x: reminder.active ? 14 : 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </button>

                  <button
                    id={`btn-reminder-delete-${reminder.id}`}
                    onClick={() => onDeleteReminder(reminder.id)}
                    title="Excluir lembrete"
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-500 hover:text-red-400 hover:bg-black/30 rounded-lg transition-all duration-300 cursor-pointer"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
