'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockTreatmentPlan } from '@/lib/mockData';

const categoryColor: Record<string, string> = {
  restorative: '#4a9eff',
  periodontal: '#ffa502',
  preventive: 'var(--accent)',
  endodontic: '#ff4757',
  cosmetic: '#bf8bff',
  surgical: '#ff4757',
  orthodontic: '#4a9eff',
};

const painColor: Record<string, string> = {
  none: 'var(--accent)',
  minimal: 'var(--accent)',
  mild: '#ffa502',
  moderate: '#ffa502',
  significant: '#ff4757',
};

export default function TreatmentJourney() {
  const [selectedPhase, setSelectedPhase] = useState<string>(mockTreatmentPlan.phases[0].id);
  const [selectedTx, setSelectedTx] = useState<string | null>(null);

  const phase = mockTreatmentPlan.phases.find((p) => p.id === selectedPhase)!;

  return (
    <div className="h-full flex flex-col gap-5 p-6 overflow-hidden">

      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Treatment Journey</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {mockTreatmentPlan.phases.length} phases · Estimated duration: {mockTreatmentPlan.totalDuration}
          </p>
        </div>
        <div
          className="px-4 py-2 rounded-lg text-sm font-medium"
          style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--accent-glow)' }}
        >
          Score projection: 67 → {67 + 12}
        </div>
      </div>

      {/* Phase selector timeline */}
      <div className="shrink-0 flex items-stretch gap-0">
        {mockTreatmentPlan.phases.map((p, i) => {
          const isActive = p.id === selectedPhase;
          const isDone = p.isCompleted;
          return (
            <div key={p.id} className="flex-1 flex flex-col">
              <div className="flex items-center">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={() => setSelectedPhase(p.id)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 z-10 transition-all"
                  style={{
                    background: isActive ? 'var(--accent)' : isDone ? 'var(--accent-dim)' : 'var(--bg-elevated)',
                    color: isActive ? '#000' : isDone ? 'var(--accent)' : 'var(--text-muted)',
                    border: `2px solid ${isActive ? 'var(--accent)' : isDone ? 'var(--accent-glow)' : 'var(--border)'}`,
                    boxShadow: isActive ? '0 0 16px var(--accent-glow)' : 'none',
                  }}
                >
                  {isDone ? '✓' : i + 1}
                </motion.button>
                {i < mockTreatmentPlan.phases.length - 1 && (
                  <div className="flex-1 h-px mx-1" style={{ background: 'var(--border)' }} />
                )}
              </div>
              <div className="mt-2 pr-4">
                <p className="text-xs font-medium" style={{ color: isActive ? 'var(--accent)' : 'var(--text-secondary)' }}>
                  {p.title}
                </p>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{p.dateRange}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Phase detail */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedPhase}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="flex-1 overflow-y-auto space-y-4"
        >
          {/* Phase header */}
          <div
            className="rounded-xl p-4 flex items-center justify-between"
            style={{
              background: phase.isActive ? 'var(--accent-dim)' : 'var(--bg-elevated)',
              border: `1px solid ${phase.isActive ? 'var(--accent-glow)' : 'var(--border)'}`,
            }}
          >
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Phase {mockTreatmentPlan.phases.indexOf(phase) + 1}: {phase.title}
                </p>
                {phase.isActive && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wide" style={{ background: 'var(--accent)', color: '#000' }}>
                    Active
                  </span>
                )}
              </div>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{phase.subtitle}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Timeframe</p>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{phase.dateRange}</p>
            </div>
          </div>

          {/* Treatment cards */}
          <div className="grid grid-cols-2 gap-4">
            {phase.treatments.map((tx) => {
              const isSelected = selectedTx === tx.id;
              const catColor = categoryColor[tx.category] ?? 'var(--text-secondary)';
              return (
                <motion.div
                  key={tx.id}
                  layout
                  className="rounded-xl overflow-hidden"
                  style={{ background: 'var(--bg-elevated)', border: `1px solid ${isSelected ? catColor + '50' : 'var(--border)'}` }}
                >
                  {/* Card header */}
                  <button
                    onClick={() => setSelectedTx(isSelected ? null : tx.id)}
                    className="w-full p-4 text-left"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className="text-[10px] uppercase tracking-widest font-medium px-2 py-0.5 rounded"
                        style={{ background: `${catColor}15`, color: catColor }}
                      >
                        {tx.category}
                      </span>
                      <div className="flex items-center gap-2">
                        {tx.isUrgent && (
                          <span className="text-[10px]" style={{ color: '#ffa502' }}>Urgent</span>
                        )}
                        {tx.insuranceCovered && (
                          <span className="text-[10px]" style={{ color: 'var(--accent)' }}>Covered</span>
                        )}
                      </div>
                    </div>
                    <p className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>{tx.plainEnglishName}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{tx.name}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Duration</p>
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{tx.durationMinutes} min</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Visits</p>
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{tx.appointments}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Discomfort</p>
                        <p className="text-sm font-medium capitalize" style={{ color: painColor[tx.painLevel] }}>
                          {tx.painLevel}
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* Expanded steps */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 pt-0 space-y-3 border-t" style={{ borderColor: 'var(--border)' }}>
                          <p className="text-xs font-semibold uppercase tracking-widest pt-3" style={{ color: 'var(--text-muted)' }}>
                            What Happens
                          </p>
                          <div className="space-y-2">
                            {tx.steps.map((step, i) => (
                              <div key={i} className="flex items-start gap-3">
                                <span
                                  className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 mt-0.5"
                                  style={{ background: catColor + '20', color: catColor }}
                                >
                                  {i + 1}
                                </span>
                                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{step}</p>
                              </div>
                            ))}
                          </div>
                          <div className="grid grid-cols-2 gap-2 pt-2">
                            <div className="p-2 rounded-lg" style={{ background: 'var(--bg-card)' }}>
                              <p className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Cost Est.</p>
                              <p className="text-sm font-medium mt-0.5" style={{ color: 'var(--text-primary)' }}>{tx.costRange}</p>
                            </div>
                            <div className="p-2 rounded-lg" style={{ background: 'var(--bg-card)' }}>
                              <p className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Longevity</p>
                              <p className="text-sm font-medium mt-0.5" style={{ color: 'var(--text-primary)' }}>{tx.longevity}</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
