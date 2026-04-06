'use client';

import { motion } from 'framer-motion';
import { mockHealthScore, mockDiagnoses, mockTreatmentPlan } from '@/lib/mockData';

type Module = 'dashboard' | 'patient' | 'scan' | 'diagnosis' | 'treatment' | 'score' | 'tooth3d' | 'simulation';

interface DashboardProps {
  onModuleChange: (module: Module) => void;
}

const urgencyConfig = {
  emergency: { label: 'Emergency', color: 'var(--critical)' },
  urgent:    { label: 'Urgent',    color: 'var(--critical)' },
  soon:      { label: 'Soon',      color: 'var(--warning)'  },
  routine:   { label: 'Routine',   color: 'var(--accent)'   },
};

const severityConfig = {
  mild:     { color: 'var(--accent)',   bg: 'var(--accent-dim)'   },
  moderate: { color: 'var(--warning)',  bg: 'var(--warning-dim)'  },
  severe:   { color: 'var(--critical)', bg: 'var(--critical-dim)' },
};

function Sparkline({ values, color }: { values: number[]; color: string }) {
  const w = 64; const h = 24;
  const min = Math.min(...values); const max = Math.max(...values);
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / (max - min + 1)) * (h - 2) - 1;
    return `${x},${y}`;
  }).join(' ');
  const last = pts.split(' ').pop()!.split(',');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.75" />
      <circle cx={last[0]} cy={last[1]} r="2.5" fill={color} />
    </svg>
  );
}

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item    = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export default function Dashboard({ onModuleChange }: DashboardProps) {
  const activeDx = mockDiagnoses.find(d => d.urgency === 'soon');

  return (
    <div className="h-full overflow-y-auto" style={{ padding: '24px 28px' }}>
      <motion.div variants={stagger} initial="hidden" animate="show" className="max-w-[1120px] mx-auto space-y-5">

        {/* ── Page heading ── */}
        <motion.div variants={item} className="flex items-start justify-between">
          <div>
            <h1 className="text-[22px] font-semibold tracking-tight" style={{ color: 'var(--text-primary)', letterSpacing: '-0.015em' }}>
              Consultation Overview
            </h1>
            <p className="text-[13px] mt-1" style={{ color: 'var(--text-secondary)' }}>
              Monday, April 7, 2026 &nbsp;·&nbsp; Dr. K. Wallace &nbsp;·&nbsp; Active consultation
            </p>
          </div>
          {activeDx && (
            <motion.button
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={() => onModuleChange('diagnosis')}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl"
              style={{ background: 'rgba(255,170,0,0.08)', border: '1px solid rgba(255,170,0,0.22)' }}
            >
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--warning)', boxShadow: '0 0 6px rgba(255,170,0,0.8)' }} />
              <span className="text-[12px] font-semibold" style={{ color: 'var(--warning)' }}>
                {activeDx.plainEnglishName} requires action
              </span>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5" style={{ color: 'var(--warning)', opacity: 0.7 }}>
                <path d="M6 3l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.button>
          )}
        </motion.div>

        {/* ── KPI cards ── */}
        <motion.div variants={item} className="grid grid-cols-4 gap-3">
          {([
            { label: 'Health Score',     value: mockHealthScore.overall,          sub: mockHealthScore.tier,           trend: mockHealthScore.trend, trendColor: 'var(--accent)', accent: true, module: 'score' },
            { label: 'Active Diagnoses', value: mockDiagnoses.length,             sub: '1 needs action soon',          badge: { text: 'Review', color: 'var(--warning)' }, module: 'diagnosis' },
            { label: 'Treatment Phases', value: mockTreatmentPlan.phases.length,  sub: 'Phase 1 active — Apr 2026',    module: 'treatment' },
            { label: 'Last Visit',       value: 'Nov 03',                         sub: '154 days ago',                 module: 'patient' },
          ] as const).map((card) => (
            <motion.button
              key={card.label}
              whileHover={{ scale: 1.015, y: -1 }} whileTap={{ scale: 0.985 }}
              onClick={() => onModuleChange(card.module as Module)}
              className="rounded-2xl p-5 text-left relative overflow-hidden group transition-all"
              style={{
                background: 'accent' in card && card.accent
                  ? 'linear-gradient(135deg, rgba(0,212,170,0.12) 0%, rgba(0,158,127,0.06) 100%)'
                  : 'var(--bg-elevated)',
                border: 'accent' in card && card.accent ? '1px solid rgba(0,212,170,0.24)' : '1px solid var(--border)',
                boxShadow: 'accent' in card && card.accent ? 'var(--shadow-accent)' : 'var(--shadow-sm)',
              }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-2xl pointer-events-none"
                style={{ background: 'rgba(255,255,255,0.02)' }} />
              <div className="flex items-start justify-between mb-3">
                <p className="text-[10px] uppercase tracking-[0.14em] font-semibold"
                  style={{ color: 'accent' in card && card.accent ? 'rgba(0,212,170,0.65)' : 'var(--text-muted)' }}>
                  {card.label}
                </p>
                {'trend' in card && card.trend && <Sparkline values={card.trend} color={card.trendColor ?? 'var(--accent)'} />}
                {'badge' in card && card.badge && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(255,170,0,0.1)', color: card.badge.color, border: '1px solid rgba(255,170,0,0.2)' }}>
                    {card.badge.text}
                  </span>
                )}
              </div>
              <p className="text-[32px] font-bold tracking-tight leading-none"
                style={{ color: 'accent' in card && card.accent ? 'var(--accent)' : 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                {card.value}
              </p>
              <p className="text-[12px] mt-2" style={{ color: 'var(--text-secondary)' }}>{card.sub}</p>
            </motion.button>
          ))}
        </motion.div>

        {/* ── Main grid ── */}
        <div className="grid grid-cols-3 gap-4">

          {/* Active findings */}
          <motion.div
            variants={item}
            className="col-span-2 rounded-2xl overflow-hidden"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
          >
            <div className="flex items-center justify-between px-5 py-3.5"
              style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--critical)', boxShadow: '0 0 5px rgba(255,77,94,0.7)' }} />
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: 'var(--text-muted)' }}>
                  Active Findings
                </h2>
              </div>
              <button onClick={() => onModuleChange('diagnosis')}
                className="text-[12px] font-medium hover:opacity-70 transition-opacity"
                style={{ color: 'var(--accent)' }}>
                Full details →
              </button>
            </div>
            <div className="px-4 py-3 space-y-2">
              {mockDiagnoses.map((dx, i) => {
                const urg = urgencyConfig[dx.urgency];
                const sev = severityConfig[dx.severity];
                return (
                  <motion.div
                    key={dx.id}
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.08 }}
                    whileHover={{ x: 2 }}
                    onClick={() => onModuleChange('diagnosis')}
                    className="flex items-center gap-4 px-4 py-3.5 rounded-xl cursor-pointer transition-all"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: sev.color, boxShadow: `0 0 5px ${sev.color}` }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {dx.plainEnglishName}
                      </p>
                      <p className="text-[11px] mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                        {dx.condition} · Teeth {dx.toothIds.join(', ')}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wide"
                        style={{ background: sev.bg, color: sev.color, border: `1px solid ${sev.color}28` }}>
                        {dx.severity}
                      </span>
                      <span className="text-[11px] font-medium" style={{ color: urg.color }}>{urg.label}</span>
                      <div className="flex items-center gap-1.5">
                        <div className="w-12 h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-overlay)' }}>
                          <div className="h-full rounded-full" style={{ width: `${dx.combinedConfidence * 100}%`, background: sev.color, opacity: 0.7 }} />
                        </div>
                        <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                          {Math.round(dx.combinedConfidence * 100)}%
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Quick launch */}
          <motion.div
            variants={item}
            className="rounded-2xl overflow-hidden"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
          >
            <div className="px-5 py-3.5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: 'var(--text-muted)' }}>
                Quick Launch
              </h2>
            </div>
            <div className="px-3 py-3 space-y-1.5">
              {[
                { label: 'Scan Viewer',       sub: 'Review X-rays & overlays',      module: 'scan'      as Module, hot: '⌘1', c: 'var(--info)'      },
                { label: 'AI Diagnosis',      sub: 'Generate patient explanations',  module: 'diagnosis' as Module, hot: '⌘2', c: 'var(--warning)'   },
                { label: 'Treatment Journey', sub: 'View care roadmap',              module: 'treatment' as Module, hot: '⌘3', c: 'var(--accent)'    },
                { label: 'Health Score',      sub: 'Dimension breakdown',            module: 'score'     as Module, hot: '⌘4', c: '#bf8bff'          },
              ].map((q) => (
                <motion.button key={q.label}
                  whileHover={{ x: 2 }} whileTap={{ scale: 0.98 }}
                  onClick={() => onModuleChange(q.module)}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
                >
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: q.c }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>{q.label}</p>
                    <p className="text-[11px] truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>{q.sub}</p>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md"
                    style={{ background: 'var(--bg-overlay)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}>
                    {q.hot}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── Bottom row ── */}
        <div className="grid grid-cols-2 gap-4">

          {/* Score trend line chart */}
          <motion.div
            variants={item}
            className="rounded-2xl px-5 py-4"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: 'var(--text-muted)' }}>
                Score Trend — 5 Visits
              </h2>
              <span className="text-[11px] font-semibold" style={{ color: 'var(--accent)' }}>+15 pts</span>
            </div>
            <svg width="100%" height="64" viewBox="0 0 280 64" preserveAspectRatio="none" className="overflow-visible">
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00d4aa" stopOpacity="0.16" />
                  <stop offset="100%" stopColor="#00d4aa" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d={`M ${mockHealthScore.trend.map((v, i) => {
                  const x = (i / (mockHealthScore.trend.length - 1)) * 280;
                  const y = 64 - ((v - 46) / 26) * 58;
                  return `${x},${y}`;
                }).join(' L ')} L 280,64 L 0,64 Z`}
                fill="url(#areaGrad)"
              />
              <polyline
                points={mockHealthScore.trend.map((v, i) => {
                  const x = (i / (mockHealthScore.trend.length - 1)) * 280;
                  const y = 64 - ((v - 46) / 26) * 58;
                  return `${x},${y}`;
                }).join(' ')}
                fill="none" stroke="#00d4aa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              />
              {mockHealthScore.trend.map((v, i) => {
                const x = (i / (mockHealthScore.trend.length - 1)) * 280;
                const y = 64 - ((v - 46) / 26) * 58;
                const isLast = i === mockHealthScore.trend.length - 1;
                return (
                  <g key={i}>
                    {isLast && <circle cx={x} cy={y} r="7" fill="#00d4aa" fillOpacity="0.15" />}
                    <circle cx={x} cy={y} r={isLast ? 3.5 : 2.5}
                      fill={isLast ? '#00d4aa' : 'var(--bg-elevated)'} stroke="#00d4aa" strokeWidth="1.5" />
                  </g>
                );
              })}
            </svg>
            <div className="flex justify-between mt-2">
              {mockHealthScore.trendDates.map((d, i) => (
                <span key={i} className="text-[10px]"
                  style={{ color: i === mockHealthScore.trendDates.length - 1 ? 'var(--accent)' : 'var(--text-muted)' }}>
                  {d}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Clinical alerts */}
          <motion.div
            variants={item}
            className="rounded-2xl overflow-hidden"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
          >
            <div className="px-5 py-3.5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: 'var(--text-muted)' }}>
                Clinical Alerts
              </h2>
            </div>
            <div className="px-4 py-3 space-y-2">
              {[
                { icon: '⚠', text: 'Penicillin allergy — confirm before prescribing', color: 'var(--critical)', bg: 'var(--critical-dim)', border: 'rgba(255,77,94,0.18)' },
                { icon: '○', text: 'Moderate dental anxiety — use reassuring communication', color: 'var(--warning)', bg: 'var(--warning-dim)', border: 'rgba(255,170,0,0.18)' },
                { icon: '·', text: 'Type 2 Diabetes — healing may be slower post-procedure', color: 'var(--text-secondary)', bg: 'rgba(255,255,255,0.025)', border: 'var(--border-subtle)' },
              ].map((note, i) => (
                <div key={i} className="flex items-start gap-3 px-3 py-2.5 rounded-xl text-[12px]"
                  style={{ background: note.bg, border: `1px solid ${note.border}` }}>
                  <span className="flex-shrink-0 mt-0.5" style={{ color: note.color }}>{note.icon}</span>
                  <span style={{ color: 'var(--text-secondary)', lineHeight: 1.45 }}>{note.text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

      </motion.div>
    </div>
  );
}
