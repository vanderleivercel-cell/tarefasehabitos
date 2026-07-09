/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WeeklyGoal } from '../types';
import { Plus, Trash2, Award, ChevronUp, ChevronDown, Check, Target } from 'lucide-react';

interface WeeklyGoalsManagerProps {
  goals: WeeklyGoal[];
  onAddGoal: (goal: WeeklyGoal) => void;
  onUpdateGoalProgress: (id: string, newValue: number) => void;
  onDeleteGoal: (id: string) => void;
}

export default function WeeklyGoalsManager({
  goals,
  onAddGoal,
  onUpdateGoalProgress,
  onDeleteGoal,
}: WeeklyGoalsManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [targetValue, setTargetValue] = useState<number>(5);
  const [unit, setUnit] = useState('vezes');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || targetValue <= 0) return;

    const newGoal: WeeklyGoal = {
      id: `goal-${Date.now()}`,
      title: title.trim(),
      currentValue: 0,
      targetValue,
      unit: unit.trim() || 'vezes',
      completed: false,
      createdAt: new Date().toISOString(),
    };

    onAddGoal(newGoal);
    setTitle('');
    setTargetValue(5);
    setUnit('vezes');
    setIsAdding(false);
  };

  const handleIncrement = (goal: WeeklyGoal) => {
    if (goal.currentValue < goal.targetValue) {
      onUpdateGoalProgress(goal.id, goal.currentValue + 1);
    }
  };

  const handleDecrement = (goal: WeeklyGoal) => {
    if (goal.currentValue > 0) {
      onUpdateGoalProgress(goal.id, goal.currentValue - 1);
    }
  };

  return (
    <div id="weekly-goals-manager" className="bg-lux-card border border-lux-border rounded-xl p-5 gold-border-glow">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-lux-border">
        <div>
          <h3 className="font-serif-lux text-base font-semibold tracking-wider text-white uppercase flex items-center gap-2">
            <span className="w-1.5 h-4 bg-gold-primary rounded-full inline-block"></span>
            Metas Semanais de Alto Impacto
          </h3>
          <p className="text-[11px] text-gray-400 mt-1 font-sans-lux">
            Foque nos grandes alvos da semana para progredir com clareza.
          </p>
        </div>

        <button
          id="btn-toggle-add-goal"
          onClick={() => setIsAdding(!isAdding)}
          className="p-1.5 rounded-lg border border-lux-border hover:border-gold-primary/50 text-gold-primary transition-all duration-300 flex items-center gap-1 text-xs font-serif-lux tracking-wider hover:bg-gold-primary/5 cursor-pointer"
        >
          {isAdding ? 'Fechar' : 'Nova Meta'}
        </button>
      </div>

      {/* Expandable Add Weekly Goal Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.form
            id="form-add-weekly-goal"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleSubmit}
            className="overflow-hidden border border-gold-primary/20 rounded-xl p-4 mb-5 bg-black/50 space-y-4"
          >
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1.5 font-serif-lux">O que deseja conquistar esta semana?</label>
              <input
                id="input-goal-title"
                type="text"
                required
                placeholder="Ex: Ler livro de investimentos, Nadar 10km..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-lux-card border border-lux-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-primary transition-all font-sans-lux"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Target Value */}
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1.5 font-serif-lux font-semibold">Valor Alvo (Quantidade)</label>
                <input
                  id="input-goal-target"
                  type="number"
                  min={1}
                  required
                  value={targetValue}
                  onChange={(e) => setTargetValue(parseInt(e.target.value) || 0)}
                  className="w-full bg-lux-card border border-lux-border rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-gold-primary font-sans-lux"
                />
              </div>

              {/* Unit */}
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1.5 font-serif-lux">Unidade de Medida</label>
                <input
                  id="input-goal-unit"
                  type="text"
                  required
                  placeholder="Ex: km, horas, páginas, vezes"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full bg-lux-card border border-lux-border rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-gold-primary font-sans-lux"
                />
              </div>
            </div>

            <button
              id="btn-save-goal"
              type="submit"
              className="w-full bg-gold-primary hover:bg-gold-hover text-black font-serif-lux font-bold tracking-widest text-[11px] py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 hover:shadow-[0_0_15px_rgba(212,175,55,0.3)] cursor-pointer"
            >
              <Target size={14} />
              CRIAR META SEMANAL
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Goals List */}
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
        {goals.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-lux-border rounded-xl bg-black/10">
            <span className="text-gray-500 text-xs font-serif-lux tracking-wide">Nenhuma meta semanal cadastrada. Defina seu próximo objetivo!</span>
          </div>
        ) : (
          goals.map((goal) => {
            const percent = Math.min(Math.round((goal.currentValue / goal.targetValue) * 100), 100);
            const isFinished = goal.currentValue >= goal.targetValue;

            return (
              <div
                key={goal.id}
                id={`weekly-goal-card-${goal.id}`}
                className={`bg-lux-card-light border rounded-xl p-4 hover:border-gold-primary/20 transition-all duration-300 relative group ${
                  isFinished ? 'border-gold-primary/20 bg-gold-primary/2' : 'border-lux-border'
                }`}
              >
                {/* Meta details & control buttons */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-3">
                    {/* Completion badge */}
                    <div
                      id={`weekly-goal-badge-${goal.id}`}
                      className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 transition-all duration-300 ${
                        isFinished
                          ? 'bg-gold-primary border-gold-primary text-black'
                          : 'border-lux-border text-gray-500 bg-black/40'
                      }`}
                    >
                      {isFinished ? <Check size={15} strokeWidth={2.5} /> : <Award size={15} />}
                    </div>

                    <div>
                      <h4 className={`text-xs font-semibold tracking-wide font-sans-lux transition-all duration-300 ${isFinished ? 'text-gray-400 line-through' : 'text-gray-100'}`}>
                        {goal.title}
                      </h4>
                      <p className="text-[10px] text-gray-500 mt-1 font-sans-lux font-medium">
                        Progresso: <span className="text-white font-mono font-bold">{goal.currentValue}</span> de <span className="text-gold-primary font-mono font-bold">{goal.targetValue}</span> {goal.unit}
                      </p>
                    </div>
                  </div>

                  {/* Increment/Decrement controllers & Delete */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="flex flex-col border border-lux-border rounded-lg bg-black/30 overflow-hidden">
                      <button
                        id={`btn-goal-increment-${goal.id}`}
                        onClick={() => handleIncrement(goal)}
                        disabled={isFinished}
                        title="Incrementar progresso"
                        className={`p-1 hover:bg-gold-primary/10 text-gray-400 hover:text-gold-primary border-b border-lux-border transition-all cursor-pointer ${
                          isFinished ? 'opacity-30 cursor-not-allowed' : ''
                        }`}
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        id={`btn-goal-decrement-${goal.id}`}
                        onClick={() => handleDecrement(goal)}
                        disabled={goal.currentValue <= 0}
                        title="Decrementar progresso"
                        className={`p-1 hover:bg-gold-primary/10 text-gray-400 hover:text-gold-primary transition-all cursor-pointer ${
                          goal.currentValue <= 0 ? 'opacity-30 cursor-not-allowed' : ''
                        }`}
                      >
                        <ChevronDown size={14} />
                      </button>
                    </div>

                    <button
                      id={`btn-goal-delete-${goal.id}`}
                      onClick={() => onDeleteGoal(goal.id)}
                      title="Excluir meta"
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-500 hover:text-red-400 hover:bg-black/30 rounded-lg transition-all duration-300 cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[9px] font-mono">
                    <span className="text-gray-500">Conclusão</span>
                    <span className={isFinished ? 'text-gold-primary font-bold' : 'text-gray-400'}>{percent}%</span>
                  </div>
                  <div className="w-full bg-black/40 border border-lux-border/60 h-2 rounded-full overflow-hidden relative">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      transition={{ duration: 0.4 }}
                      className="gold-gradient-bg h-full rounded-full"
                    />
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
