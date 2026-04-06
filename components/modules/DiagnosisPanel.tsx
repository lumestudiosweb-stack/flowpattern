'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockDiagnoses } from '@/lib/mockData';

const severityColor = { mild: 'var(--accent)', moderate: '#ffa502', severe: '#ff4757' };
const urgencyLabel = { emergency: 'Emergency', urgent: 'Urgent', soon: 'Action Soon', routine: 'Routine' };
const urgencyColor = { emergency: '#ff4757', urgent: '#ff4757', soon: '#ffa502', routine: 'var(--accent)' };

function ConfidenceMeter({ value, label }: { value: number; label: string }) {
  const pct = Math.round(value * 100);
  const zone = pct >= 80 ? { color: 'var(--accent)', text: 'Confident Finding' }
    : pct >= 65 ? { color: '#ffa502', text: 'Likely — Monitoring Recommended' }
    : { color: '#888', text: 'Possible — Further Investigation Needed' };

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</span>
        <span className="text-xs font-mono font-medium" style={{ color: zone.color }}>{pct}%</span>
      </div>
      <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-card)' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: zone.color }}
        />
      </div>
      <p className="text-[10px]" style={{ color: zone.color }}>{zone.text}</p>
    </div>
  );
}

export default function DiagnosisPanel() {
  const [selectedId, setSelectedId] = useState<string>(mockDiagnoses[0].id);
  const [showAI, setShowAI] = useState(false);
  const [aiApproved, setAiApproved] = useState(false);

  const dx = mockDiagnoses.find((d) => d.id === selectedId) ?? mockDiagnoses[0];
  const sc = severityColor[dx.severity];
  const uc = urgencyColor[dx.urgency];

  return (
    <div className="h-full flex gap-4 p-6 overflow-hidden">

      {/* Left: diagnosis list */}
      <div className="w-72 flex flex-col gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
          Active Diagnoses
        </h2>
        <div className="space-y-2 overflow-y-auto flex-1">
          {mockDiagnoses.map((d) => {
            const isActive = d.id === selectedId;
            const sc2 = severityColor[d.severity];
            return (
              <motion.button
                key={d.id}
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setSelectedId(d.id); setShowAI(false); setAiApproved(false); }}
                className="w-full text-left p-4 rounded-xl transition-all"
                style={{
                  background: isActive ? 'var(--accent-dim)' : 'var(--bg-elevated)',
                  border: `1px solid ${isActive ? 'var(--accent-glow)' : 'var(--border)'}`,
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className="text-[10px] uppercase tracking-widest font-medium px-2 py-0.5 rounded"
                    style={{ background: `${sc2}20`, color: sc2 }}
                  >
                    {d.severity}
                  </span>
                  <span className="text-[10px]" style={{ color: urgencyColor[d.urgency] }}>
                    {urgencyLabel[d.urgency]}
                  </span>
                </div>
                <p className="text-sm font-medium mt-1" style={{ color: 'var(--text-primary)' }}>
                  {d.plainEnglishName}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {d.toothIds.join(', ')} · {d.condition}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <div className="flex-1 h-0.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                    <div className="h-full" style={{ width: `${d.combinedConfidence * 100}%`, background: sc2 }} />
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

      {/* Right: detail */}
      <AnimatePresence mode="wait">
        <motion.div
          key={dx.id}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -8 }}
          transition={{ duration: 0.3 }}
          className="flex-1 flex flex-col gap-4 overflow-y-auto"
        >
          {/* Header */}
          <div
            className="rounded-xl p-5"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] uppercase tracking-widest font-medium px-2 py-0.5 rounded" style={{ background: `${sc}20`, color: sc }}>
                    {dx.severity}
                  </span>
                  <span className="text-[10px] font-medium" style={{ color: uc }}>
                    ● {urgencyLabel[dx.urgency]}
                  </span>
                </div>
                <h1 className="text-xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                  {dx.plainEnglishName}
                </h1>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{dx.condition}</p>
                <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                  Teeth: {dx.toothIds.join(', ')} · {dx.location}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>
                  Reversibility
                </p>
                <span
                  className="text-xs font-medium px-3 py-1 rounded-full capitalize"
                  style={{
                    background: dx.reversibility === 'irreversible' ? 'rgba(255,71,87,0.12)' : 'var(--accent-dim)',
                    color: dx.reversibility === 'irreversible' ? '#ff4757' : 'var(--accent)',
                  }}
                >
                  {dx.reversibility}
                </span>
              </div>
            </div>
          </div>

          {/* Confidence meters */}
          <div
            className="rounded-xl p-5 space-y-4"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
          >
            <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
              Diagnosis Confidence Meter
            </h2>
            <ConfidenceMeter value={dx.dentistConfidence} label="Clinician Assessment" />
            <ConfidenceMeter value={dx.aiConfidence} label="AI Scan Analysis" />
            <div className="pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
              <ConfidenceMeter value={dx.combinedConfidence} label="Combined Confidence" />
            </div>
          </div>

          {/* If untreated */}
          <div
            className="rounded-xl p-5"
            style={{ background: 'rgba(255,71,87,0.05)', border: '1px solid rgba(255,71,87,0.15)' }}
          >
            <h2 className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#ff4757' }}>
              If Left Untreated
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {dx.ifUntreated}
            </p>
          </div>

          {/* AI Explanation Mode */}
          <div
            className="rounded-xl p-5 space-y-4"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                  AI Patient Explanation Mode
                </h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  Tailored to: Intermediate literacy · Moderate anxiety · English
                </p>
              </div>
              {!showAI && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowAI(true)}
                  className="px-4 py-2 rounded-lg text-sm font-medium"
                  style={{ background: 'var(--accent)', color: '#000' }}
                >
                  Generate Explanation
                </motion.button>
              )}
            </div>

            <AnimatePresence>
              {showAI && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3"
                >
                  <div
                    className="p-4 rounded-lg"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
                  >
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                      {dx.aiExplanation}
                    </p>
                  </div>

                  {!aiApproved ? (
                    <div className="flex items-center gap-3">
                      <p className="text-xs flex-1" style={{ color: 'var(--text-muted)' }}>
                        Review before displaying to patient
                      </p>
                      <button
                        onClick={() => setAiApproved(true)}
                        className="px-4 py-1.5 rounded-lg text-xs font-medium"
                        style={{ background: 'var(--accent)', color: '#000' }}
                      >
                        Approve & Show Patient
                      </button>
                      <button
                        onClick={() => setShowAI(false)}
                        className="px-3 py-1.5 rounded-lg text-xs"
                        style={{ background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                      >
                        Discard
                      </button>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2 text-xs"
                      style={{ color: 'var(--accent)' }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
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
