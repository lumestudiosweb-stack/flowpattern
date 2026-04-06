'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockTreatmentPlan } from '@/lib/mockData';

const categoryColor: Record<string, string> = {
  restorative: 'var(--info)',
  periodontal: 'var(--warning)',
  preventive:  'var(--accent)',
  endodontic:  'var(--critical)',
  cosmetic:    '#bf8bff',
  surgical:    'var(--critical)',
  orthodontic: 'var(--info)',
};

const painIcon: Record<string, string> = {
  none: '● None', minimal: '● Minimal', mild: '● Mild', moderate: '● Moderate', significant: '● Significant',
};
const painColor: Record<string, string> = {
  none: 'var(--accent)', minimal: 'var(--accent)', mild: 'var(--warning)', moderate: 'var(--warning)', significant: 'var(--critical)',
};

export default function TreatmentJourney() {
  const [selectedPhase, setSelectedPhase] = useState(mockTreatmentPlan.phases[0].id);
  const [selectedTx, setSelectedTx] = useState<string | null>(null);
  const phase = mockTreatmentPlan.phases.find((p) => p.id === selectedPhase)!;

  return (
    <div className="h-full flex flex-col gap-5 overflow-hidden" style={{ padding: '20px 24px' }}>

      {/* ── Header row ── */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-[20px] font-semibold tracking-tight" style={{ color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
            Treatment Journey
          </h1>
          <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {mockTreatmentPlan.phases.length} phases · {mockTreatmentPlan.totalDuration}
          </p>
        </div>
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl"
          style={{ background: 'var(--accent-dim-strong)', border: '1px solid var(--accent-glow)' }}>
          <span className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>Score projection</span>
          <span className="text-[13px] font-bold" style={{ color: 'var(--accent)' }}>67 → 79</span>
        </div>
      </div>

      {/* ── Phase timeline ── */}
      <div className="shrink-0 flex items-start gap-0">
        {mockTreatmentPlan.phases.map((p, i) => {
          const isActive = p.id === selectedPhase;
          const isDone = p.isCompleted;
          const isLast = i === mockTreatmentPlan.phases.length - 1;
          return (
            <div key={p.id} className="flex-1 flex flex-col gap-2">
              <div className="flex items-center">
                <motion.button
                  whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}
                  onClick={() => setSelectedPhase(p.id)}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0 z-10 transition-all"
                  style={{
                    background: isActive ? 'linear-gradient(135deg, #00d4aa, #009e7f)' : isDone ? 'var(--accent-dim)' : 'var(--bg-elevated)',
                    color: isActive ? '#000' : isDone ? 'var(--accent)' : 'var(--text-muted)',
                    border: `2px solid ${isActive ? 'transparent' : isDone ? 'var(--accent-glow)' : 'var(--border)'}`,
                    boxShadow: isActive ? '0 0 20px rgba(0,212,170,0.4)' : 'none',
                  }}
                >
                  {isDone ? '✓' : i + 1}
                </motion.button>
                {!isLast && (
                  <div className="flex-1 h-px mx-2"
                    style={{ background: 'linear-gradient(to right, var(--accent-glow), var(--border))' }} />
                )}
              </div>
              <div className="pr-4">
                <p className="text-[12px] font-semibold" style={{ color: isActive ? 'var(--accent)' : 'var(--text-secondary)' }}>
                  {p.title}
                </p>
                <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{p.dateRange}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Phase detail ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedPhase}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}
          className="flex-1 overflow-y-auto space-y-4"
        >
          {/* Phase banner */}
          <div className="rounded-2xl px-5 py-4 flex items-center justify-between"
            style={{
              background: phase.isActive
                ? 'linear-gradient(135deg, rgba(0,212,170,0.1) 0%, rgba(0,158,127,0.05) 100%)'
                : 'var(--bg-elevated)',
              border: `1px solid ${phase.isActive ? 'rgba(0,212,170,0.24)' : 'var(--border)'}`,
              boxShadow: phase.isActive ? 'var(--shadow-accent)' : 'var(--shadow-sm)',
            }}>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Phase {mockTreatmentPlan.phases.indexOf(phase) + 1}: {phase.title}
                </p>
                {phase.isActive && (
                  <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide"
                    style={{ background: 'var(--accent)', color: '#000' }}>
                    Active
                  </span>
                )}
              </div>
              <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>{phase.subtitle}</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] uppercase tracking-[0.14em]" style={{ color: 'var(--text-muted)' }}>Timeframe</p>
              <p className="text-[13px] font-semibold mt-0.5" style={{ color: 'var(--text-primary)' }}>{phase.dateRange}</p>
            </div>
          </div>

          {/* Treatment cards */}
          <div className="grid grid-cols-2 gap-4">
            {phase.treatments.map((tx) => {
              const isSelected = selectedTx === tx.id;
              const cc = categoryColor[tx.category] ?? 'var(--text-secondary)';
              return (
                <motion.div
                  key={tx.id} layout
                  className="rounded-2xl overflow-hidden transition-all"
                  style={{
                    background: 'var(--bg-elevated)',
                    border: `1px solid ${isSelected ? cc + '40' : 'var(--border)'}`,
                    boxShadow: isSelected ? `0 0 20px ${cc}18` : 'var(--shadow-sm)',
                  }}
                >
                  <button onClick={() => setSelectedTx(isSelected ? null : tx.id)}
                    className="w-full p-4 text-left">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] uppercase tracking-wide font-semibold px-2.5 py-0.5 rounded-full"
                        style={{ background: `${cc}15`, color: cc, border: `1px solid ${cc}28` }}>
                        {tx.category}
                      </span>
                      <div className="flex items-center gap-2">
                        {tx.isUrgent && <span className="text-[10px] font-semibold" style={{ color: 'var(--warning)' }}>Urgent</span>}
                        {tx.insuranceCovered && <span className="text-[10px] font-semibold" style={{ color: 'var(--accent)' }}>Covered ✓</span>}
                      </div>
                    </div>
                    <p className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>{tx.plainEnglishName}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{tx.name}</p>
                    <div className="flex items-center gap-4 mt-3.5">
                      {[
                        { label: 'Duration', value: `${tx.durationMinutes} min` },
                        { label: 'Visits',   value: String(tx.appointments) },
                        { label: 'Pain',     value: painIcon[tx.painLevel], color: painColor[tx.painLevel] },
                      ].map((stat) => (
                        <div key={stat.label}>
                          <p className="text-[9px] uppercase tracking-[0.14em]" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
                          <p className="text-[13px] font-semibold mt-0.5"
                            style={{ color: stat.color ?? 'var(--text-primary)' }}>{stat.value}</p>
                        </div>
                      ))}
                    </div>
                  </button>

                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 space-y-3" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 16 }}>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: 'var(--text-muted)' }}>
                            Step by Step
                          </p>
                          <div className="space-y-2">
                            {tx.steps.map((step, i) => (
                              <div key={i} className="flex items-start gap-3">
                                <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 mt-0.5"
                                  style={{ background: `${cc}18`, color: cc, border: `1px solid ${cc}28` }}>
                                  {i + 1}
                                </span>
                                <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{step}</p>
                              </div>
                            ))}
                          </div>
                          <div className="grid grid-cols-2 gap-2 pt-1">
                            {[
                              { label: 'Cost Estimate', value: tx.costRange },
                              { label: 'Longevity',     value: tx.longevity },
                            ].map((stat) => (
                              <div key={stat.label} className="p-2.5 rounded-xl"
                                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                                <p className="text-[9px] uppercase tracking-[0.12em]" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
                                <p className="text-[12px] font-semibold mt-0.5" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
                              </div>
                            ))}
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
