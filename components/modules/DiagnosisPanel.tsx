'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockDiagnoses } from '@/lib/mockData';

const severityColor = { mild: 'var(--accent)', moderate: 'var(--warning)', severe: 'var(--critical)' };
const severityBg    = { mild: 'var(--accent-dim)', moderate: 'var(--warning-dim)', severe: 'var(--critical-dim)' };
const urgencyLabel  = { emergency: 'Emergency', urgent: 'Urgent', soon: 'Action Soon', routine: 'Routine' };
const urgencyColor  = { emergency: 'var(--critical)', urgent: 'var(--critical)', soon: 'var(--warning)', routine: 'var(--accent)' };

function ConfidenceMeter({ value, label }: { value: number; label: string }) {
  const pct = Math.round(value * 100);
  const color = pct >= 80 ? 'var(--accent)' : pct >= 65 ? 'var(--warning)' : 'var(--text-secondary)';
  const tag   = pct >= 80 ? 'High confidence' : pct >= 65 ? 'Monitoring recommended' : 'Further investigation needed';
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>{label}</span>
        <span className="text-[12px] font-mono font-semibold" style={{ color }}>{pct}%</span>
      </div>
      <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-card)' }}>
        <motion.div
          initial={{ width: 0 }} animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: color, boxShadow: `0 0 6px ${color}60` }}
        />
      </div>
      <p className="text-[10px]" style={{ color, opacity: 0.8 }}>{tag}</p>
    </div>
  );
}

export default function DiagnosisPanel() {
  const [selectedId, setSelectedId] = useState<string>(mockDiagnoses[0].id);
  const [showAI, setShowAI] = useState(false);
  const [aiApproved, setAiApproved] = useState(false);

  const dx = mockDiagnoses.find((d) => d.id === selectedId) ?? mockDiagnoses[0];
  const sc = severityColor[dx.severity];
  const sb = severityBg[dx.severity];
  const uc = urgencyColor[dx.urgency];

  return (
    <div className="h-full flex gap-4 overflow-hidden" style={{ padding: '20px 24px' }}>

      {/* ── Left: list ── */}
      <div className="w-72 flex flex-col gap-3 shrink-0">
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: 'var(--text-muted)' }}>
          Active Diagnoses
        </h2>
        <div className="space-y-2 overflow-y-auto flex-1 pr-0.5">
          {mockDiagnoses.map((d) => {
            const isActive = d.id === selectedId;
            const c = severityColor[d.severity];
            return (
              <motion.button
                key={d.id}
                whileHover={{ x: 2 }} whileTap={{ scale: 0.98 }}
                onClick={() => { setSelectedId(d.id); setShowAI(false); setAiApproved(false); }}
                className="w-full text-left p-4 rounded-2xl transition-all"
                style={{
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(0,212,170,0.1) 0%, rgba(0,158,127,0.05) 100%)'
                    : 'var(--bg-elevated)',
                  border: `1px solid ${isActive ? 'rgba(0,212,170,0.24)' : 'var(--border)'}`,
                  boxShadow: isActive ? 'var(--shadow-accent)' : 'var(--shadow-sm)',
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase tracking-wide font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: `${c}18`, color: c, border: `1px solid ${c}28` }}>
                    {d.severity}
                  </span>
                  <span className="text-[10px] font-medium" style={{ color: urgencyColor[d.urgency] }}>
                    {urgencyLabel[d.urgency]}
                  </span>
                </div>
                <p className="text-[13px] font-semibold mt-1.5" style={{ color: 'var(--text-primary)' }}>
                  {d.plainEnglishName}
                </p>
                <p className="text-[11px] mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                  {d.toothIds.join(', ')} · {d.condition}
                </p>
                <div className="flex items-center gap-1.5 mt-2.5">
                  <div className="flex-1 h-0.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                    <div className="h-full rounded-full" style={{ width: `${d.combinedConfidence * 100}%`, background: c }} />
                  </div>
                  <span className="text-[9px] font-mono" style={{ color: 'var(--text-muted)' }}>
                    {Math.round(d.combinedConfidence * 100)}%
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── Right: detail ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={dx.id}
          initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.25 }}
          className="flex-1 flex flex-col gap-4 overflow-y-auto"
        >
          {/* Header card */}
          <div className="rounded-2xl p-5"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] uppercase tracking-wide font-semibold px-2.5 py-0.5 rounded-full"
                    style={{ background: sb, color: sc, border: `1px solid ${sc}28` }}>
                    {dx.severity}
                  </span>
                  <span className="text-[11px] font-semibold flex items-center gap-1.5" style={{ color: uc }}>
                    <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: uc, boxShadow: `0 0 5px ${uc}` }} />
                    {urgencyLabel[dx.urgency]}
                  </span>
                </div>
                <h1 className="text-[20px] font-semibold tracking-tight" style={{ color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                  {dx.plainEnglishName}
                </h1>
                <p className="text-[13px] mt-1" style={{ color: 'var(--text-secondary)' }}>{dx.condition}</p>
                <p className="text-[11px] mt-1.5" style={{ color: 'var(--text-muted)' }}>
                  Teeth: {dx.toothIds.join(', ')} · {dx.location}
                </p>
              </div>
              <div className="text-right shrink-0 ml-4">
                <p className="text-[10px] uppercase tracking-[0.14em] mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  Reversibility
                </p>
                <span className="text-[12px] font-semibold px-3 py-1.5 rounded-full capitalize"
                  style={{
                    background: dx.reversibility === 'irreversible' ? 'var(--critical-dim)' : 'var(--accent-dim)',
                    color: dx.reversibility === 'irreversible' ? 'var(--critical)' : 'var(--accent)',
                    border: `1px solid ${dx.reversibility === 'irreversible' ? 'rgba(255,77,94,0.25)' : 'var(--accent-glow)'}`,
                  }}>
                  {dx.reversibility}
                </span>
              </div>
            </div>
          </div>

          {/* Confidence meters */}
          <div className="rounded-2xl p-5 space-y-4"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            <h2 className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: 'var(--text-muted)' }}>
              Diagnosis Confidence
            </h2>
            <ConfidenceMeter value={dx.dentistConfidence} label="Clinician Assessment" />
            <ConfidenceMeter value={dx.aiConfidence}      label="AI Scan Analysis" />
            <div className="pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <ConfidenceMeter value={dx.combinedConfidence} label="Combined Confidence" />
            </div>
          </div>

          {/* If untreated */}
          <div className="rounded-2xl p-5"
            style={{ background: 'rgba(255,77,94,0.05)', border: '1px solid rgba(255,77,94,0.18)' }}>
            <h2 className="text-[10px] font-semibold uppercase tracking-[0.16em] mb-2.5" style={{ color: 'var(--critical)' }}>
              If Left Untreated
            </h2>
            <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {dx.ifUntreated}
            </p>
          </div>

          {/* AI Explanation */}
          <div className="rounded-2xl p-5 space-y-4"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: 'var(--text-muted)' }}>
                  AI Patient Explanation
                </h2>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  Tailored · Intermediate literacy · Moderate anxiety · English
                </p>
              </div>
              {!showAI && (
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setShowAI(true)}
                  className="px-4 py-2 rounded-xl text-[12px] font-semibold"
                  style={{
                    background: 'linear-gradient(135deg, #00d4aa, #009e7f)',
                    color: '#000',
                    boxShadow: '0 0 16px rgba(0,212,170,0.25)',
                  }}>
                  Generate Explanation
                </motion.button>
              )}
            </div>
            <AnimatePresence>
              {showAI && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }} className="space-y-3 overflow-hidden"
                >
                  <div className="p-4 rounded-xl"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                    <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                      {dx.aiExplanation}
                    </p>
                  </div>
                  {!aiApproved ? (
                    <div className="flex items-center gap-3">
                      <p className="text-[11px] flex-1" style={{ color: 'var(--text-muted)' }}>
                        Review before displaying to patient
                      </p>
                      <button onClick={() => setAiApproved(true)}
                        className="px-4 py-1.5 rounded-lg text-[12px] font-semibold"
                        style={{ background: 'linear-gradient(135deg, #00d4aa, #009e7f)', color: '#000' }}>
                        Approve & Show
                      </button>
                      <button onClick={() => setShowAI(false)}
                        className="px-3 py-1.5 rounded-lg text-[12px]"
                        style={{ background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                        Discard
                      </button>
                    </div>
                  ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="flex items-center gap-2 text-[12px]" style={{ color: 'var(--accent)' }}>
                      <div className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: 'var(--accent)' }} />
                      Showing on patient screen
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
