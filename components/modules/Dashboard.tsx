'use client';

import { motion } from 'framer-motion';
import { mockPatient, mockHealthScore, mockDiagnoses, mockTreatmentPlan } from '@/lib/mockData';

type Module = 'dashboard' | 'patient' | 'scan' | 'diagnosis' | 'treatment' | 'score';

interface DashboardProps {
  onModuleChange: (module: Module) => void;
}

const urgencyConfig = {
  emergency: { label: 'Emergency', color: '#ff4757' },
  urgent: { label: 'Urgent', color: '#ff4757' },
  soon: { label: 'Soon', color: '#ffa502' },
  routine: { label: 'Routine', color: 'var(--accent)' },
};

const severityConfig = {
  mild: { color: 'var(--accent)', bg: 'var(--accent-dim)' },
  moderate: { color: '#ffa502', bg: 'rgba(255,165,2,0.1)' },
  severe: { color: '#ff4757', bg: 'rgba(255,71,87,0.1)' },
};

export default function Dashboard({ onModuleChange }: DashboardProps) {
  const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
  const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

  return (
    <div className="h-full overflow-y-auto p-6">
      <motion.div variants={stagger} initial="hidden" animate="show" className="max-w-6xl mx-auto space-y-6">

        {/* Welcome row */}
        <motion.div variants={item} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Consultation Overview
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Sunday, April 6, 2026 · Dr. K. Wallace
            </p>
          </div>
          <div
            className="px-4 py-2 rounded-lg text-sm font-medium"
            style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--accent-glow)' }}
          >
            Patient View: OFF
          </div>
        </motion.div>

        {/* Top KPI cards */}
        <motion.div variants={item} className="grid grid-cols-4 gap-4">
          {[
            { label: 'Health Score', value: mockHealthScore.overall, suffix: '', sub: mockHealthScore.tier, accent: true, onClick: () => onModuleChange('score') },
            { label: 'Active Diagnoses', value: mockDiagnoses.length, suffix: '', sub: '1 needs action soon', accent: false, onClick: () => onModuleChange('diagnosis') },
            { label: 'Treatment Phases', value: mockTreatmentPlan.phases.length, suffix: '', sub: 'Phase 1 active', accent: false, onClick: () => onModuleChange('treatment') },
            { label: 'Last Visit', value: 'Nov 2025', suffix: '', sub: '154 days ago', accent: false, onClick: () => onModuleChange('patient') },
          ].map((card) => (
            <motion.button
              key={card.label}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={card.onClick}
              className="rounded-xl p-5 text-left transition-all"
              style={{
                background: card.accent ? 'var(--accent-dim)' : 'var(--bg-elevated)',
                border: `1px solid ${card.accent ? 'var(--accent-glow)' : 'var(--border)'}`,
              }}
            >
              <p className="text-xs uppercase tracking-widest mb-2" style={{ color: card.accent ? 'var(--accent)' : 'var(--text-muted)' }}>
                {card.label}
              </p>
              <p className="text-3xl font-bold tracking-tight" style={{ color: card.accent ? 'var(--accent)' : 'var(--text-primary)' }}>
                {card.value}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{card.sub}</p>
            </motion.button>
          ))}
        </motion.div>

        {/* Main grid */}
        <div className="grid grid-cols-3 gap-4">

          {/* Diagnoses list */}
          <motion.div
            variants={item}
            className="col-span-2 rounded-xl p-5 space-y-4"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold tracking-wide uppercase" style={{ color: 'var(--text-muted)' }}>
                Active Findings
              </h2>
              <button
                onClick={() => onModuleChange('diagnosis')}
                className="text-xs transition-colors hover:opacity-80"
                style={{ color: 'var(--accent)' }}
              >
                View all →
              </button>
            </div>

            <div className="space-y-3">
              {mockDiagnoses.map((dx) => {
                const urg = urgencyConfig[dx.urgency];
                const sev = severityConfig[dx.severity];
                return (
                  <motion.div
                    key={dx.id}
                    whileHover={{ x: 3 }}
                    className="flex items-center justify-between p-3 rounded-lg cursor-pointer"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
                    onClick={() => onModuleChange('diagnosis')}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: sev.color }}
                      />
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                          {dx.plainEnglishName}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                          {dx.toothIds.join(', ')} · {dx.condition}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide"
                        style={{ background: sev.bg, color: sev.color }}
                      >
                        {dx.severity}
                      </span>
                      <span className="text-[10px] font-medium" style={{ color: urg.color }}>
                        {urg.label}
                      </span>
                      <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                        {Math.round(dx.combinedConfidence * 100)}%
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Quick actions */}
          <motion.div
            variants={item}
            className="rounded-xl p-5 flex flex-col gap-3"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
          >
            <h2 className="text-sm font-semibold tracking-wide uppercase" style={{ color: 'var(--text-muted)' }}>
              Quick Launch
            </h2>
            {[
              { label: 'Open Scan Viewer', sub: 'Review X-rays', module: 'scan' as Module, hot: '⌘1' },
              { label: 'AI Explain Mode', sub: 'Generate patient text', module: 'diagnosis' as Module, hot: '⌘2' },
              { label: 'Treatment Timeline', sub: 'Show care journey', module: 'treatment' as Module, hot: '⌘3' },
              { label: 'Health Score', sub: 'Score breakdown', module: 'score' as Module, hot: '⌘4' },
            ].map((item) => (
              <motion.button
                key={item.label}
                whileHover={{ x: 3 }}
                onClick={() => onModuleChange(item.module)}
                className="flex items-center justify-between p-3 rounded-lg text-left"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
              >
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{item.sub}</p>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
                  {item.hot}
                </span>
              </motion.button>
            ))}
          </motion.div>
        </div>

        {/* Health score mini-trend + patient alert */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            variants={item}
            className="rounded-xl p-5"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
          >
            <h2 className="text-sm font-semibold tracking-wide uppercase mb-4" style={{ color: 'var(--text-muted)' }}>
              Score Trend — 5 Visits
            </h2>
            <div className="flex items-end gap-2 h-16">
              {mockHealthScore.trend.map((score, i) => {
                const isLast = i === mockHealthScore.trend.length - 1;
                const height = `${(score / 100) * 100}%`;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full rounded-sm relative" style={{ height: '100%', background: 'var(--bg-card)' }}>
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height }}
                        transition={{ delay: i * 0.08, duration: 0.5 }}
                        className="absolute bottom-0 left-0 right-0 rounded-sm"
                        style={{ background: isLast ? 'var(--accent)' : 'var(--border)', boxShadow: isLast ? '0 0 8px var(--accent-glow)' : 'none' }}
                      />
                    </div>
                    <span className="text-[9px]" style={{ color: isLast ? 'var(--accent)' : 'var(--text-muted)' }}>
                      {mockHealthScore.trendDates[i]}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="text-xs mt-3" style={{ color: 'var(--text-secondary)' }}>
              +15 points improvement over 5 months
            </p>
          </motion.div>

          <motion.div
            variants={item}
            className="rounded-xl p-5"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
          >
            <h2 className="text-sm font-semibold tracking-wide uppercase mb-4" style={{ color: 'var(--text-muted)' }}>
              Patient Notes
            </h2>
            <div className="space-y-2">
              {[
                { icon: '⚠', text: 'Penicillin allergy — verify before any antibiotic prescription', color: '#ffa502' },
                { icon: '●', text: 'Moderate dental anxiety — use reassuring communication mode', color: 'var(--accent)' },
                { icon: '●', text: 'Systemic: Type 2 Diabetes — healing may be slower post-procedure', color: 'var(--text-secondary)' },
              ].map((note, i) => (
                <div key={i} className="flex items-start gap-2 text-xs p-2 rounded-lg" style={{ background: 'var(--bg-card)' }}>
                  <span style={{ color: note.color, flexShrink: 0, marginTop: '1px' }}>{note.icon}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{note.text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

      </motion.div>
    </div>
  );
}
