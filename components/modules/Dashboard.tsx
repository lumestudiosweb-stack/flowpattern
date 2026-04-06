'use client';

import { motion } from 'framer-motion';
import { mockHealthScore, mockDiagnoses, mockTreatmentPlan, mockPatient } from '@/lib/mockData';

type Module = 'dashboard' | 'patient' | 'scan' | 'diagnosis' | 'treatment' | 'score' | 'tooth3d' | 'simulation' | 'story';
interface DashboardProps { onModuleChange: (m: Module) => void; }

const SevColor: Record<string, string> = { mild: 'var(--accent)', moderate: 'var(--warning)', severe: 'var(--critical)' };
const UrgColor: Record<string, string> = { emergency: 'var(--critical)', urgent: 'var(--critical)', soon: 'var(--warning)', routine: 'var(--accent)' };
const UrgLabel: Record<string, string> = { emergency: 'Emergency', urgent: 'Urgent', soon: 'Act Soon', routine: 'Routine' };

function ScoreArc({ score }: { score: number }) {
  const r = 52; const circ = 2 * Math.PI * r;
  const color = score >= 70 ? 'var(--accent)' : score >= 55 ? 'var(--warning)' : 'var(--critical)';
  return (
    <svg width="120" height="120" viewBox="0 0 120 120">
      <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
      <motion.circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="8"
        strokeLinecap="round" strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - (score / 100) * circ }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        transform="rotate(-90 60 60)"
        style={{ filter: `drop-shadow(0 0 10px ${color}70)` }} />
      <text x="60" y="57" textAnchor="middle" fontSize="26" fontWeight="800" fill={color}>{score}</text>
      <text x="60" y="71" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.4)" letterSpacing="2">SCORE</text>
    </svg>
  );
}

const s = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const i = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export default function Dashboard({ onModuleChange }: DashboardProps) {
  return (
    <div className="h-full overflow-y-auto" style={{ padding: '28px 32px' }}>
      <motion.div variants={s} initial="hidden" animate="show" className="max-w-[1140px] mx-auto space-y-6">

        {/* ── Heading ── */}
        <motion.div variants={i} className="flex items-end justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>
              Live Consultation
            </p>
            <h1 className="text-[32px] font-black tracking-tight mt-1" style={{ color: 'var(--text-primary)', letterSpacing: '-0.025em' }}>
              Good morning, Dr. Wallace
            </h1>
            <p className="text-[14px] mt-1" style={{ color: 'var(--text-secondary)' }}>
              {mockPatient.name} · {mockPatient.age} yrs · {mockPatient.insuranceProvider}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => onModuleChange('story')}
            className="flex items-center gap-2.5 px-6 py-3 rounded-full text-[13px] font-bold"
            style={{ background: 'var(--accent)', color: '#000', boxShadow: '0 0 30px rgba(0,255,179,0.4)' }}
          >
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path d="M10 2.5L12.5 8h6l-5 3.5 2 6.5-5.5-4-5.5 4 2-6.5-5-3.5h6z" strokeLinejoin="round"/>
            </svg>
            Start Story Mode
          </motion.button>
        </motion.div>

        {/* ── KPI row ── */}
        <motion.div variants={i} className="grid grid-cols-4 gap-4">
          {([
            { label: 'Oral Health Score', big: `${mockHealthScore.overall}`, sub: `${mockHealthScore.tier} · Target: ${mockHealthScore.projectedScore}`, color: 'var(--accent)', mod: 'score', ring: true },
            { label: 'Active Diagnoses',  big: `${mockDiagnoses.length}`,    sub: '1 requires action soon',  color: 'var(--warning)', mod: 'diagnosis' },
            { label: 'Treatment Phases',  big: `${mockTreatmentPlan.phases.length}`, sub: `Duration: ${mockTreatmentPlan.totalDuration}`, color: 'var(--text-primary)', mod: 'treatment' },
            { label: 'Next Appointment',  big: 'Apr 20', sub: '154 days since last visit', color: 'var(--text-primary)', mod: 'patient' },
          ] as const).map((card) => (
            <motion.button key={card.label}
              whileHover={{ scale: 1.015, y: -2 }} whileTap={{ scale: 0.985 }}
              onClick={() => onModuleChange(card.mod as Module)}
              className="rounded-2xl p-5 text-left relative overflow-hidden group"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
            >
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'rgba(255,255,255,0.02)' }} />
              <p className="text-[10px] uppercase tracking-[0.16em] font-semibold" style={{ color: 'var(--text-muted)' }}>
                {card.label}
              </p>
              <p className="text-[38px] font-black mt-2 leading-none tracking-tight"
                style={{ color: card.color, letterSpacing: '-0.03em' }}>
                {card.big}
              </p>
              <p className="text-[11px] mt-2" style={{ color: 'var(--text-muted)' }}>{card.sub}</p>
            </motion.button>
          ))}
        </motion.div>

        {/* ── Main grid ── */}
        <div className="grid grid-cols-3 gap-5">

          {/* Score ring + trend */}
          <motion.div variants={i}
            className="rounded-2xl p-6 flex flex-col gap-4"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
          >
            <p className="text-[10px] uppercase tracking-[0.16em] font-semibold" style={{ color: 'var(--text-muted)' }}>Oral Health Score</p>
            <div className="flex items-center gap-5">
              <ScoreArc score={mockHealthScore.overall} />
              <div className="flex flex-col gap-2 flex-1">
                {mockHealthScore.dimensions.slice(0, 4).map(d => {
                  const c = d.score >= 80 ? 'var(--accent)' : d.score >= 60 ? 'var(--warning)' : 'var(--critical)';
                  return (
                    <div key={d.label}>
                      <div className="flex justify-between mb-1">
                        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{d.label}</span>
                        <span className="text-[10px] font-mono font-bold" style={{ color: c }}>{d.score}</span>
                      </div>
                      <div className="h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <motion.div className="h-full rounded-full"
                          initial={{ width: 0 }} animate={{ width: `${d.score}%` }}
                          transition={{ duration: 0.8, delay: 0.3 }}
                          style={{ background: c }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                Completing treatment plan → <span style={{ color: 'var(--accent)' }}>+12 pts projected</span>
              </p>
            </div>
          </motion.div>

          {/* Active findings */}
          <motion.div variants={i}
            className="col-span-2 rounded-2xl overflow-hidden"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--critical)', boxShadow: '0 0 6px rgba(255,77,77,0.8)' }} />
                <h2 className="text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: 'var(--text-muted)' }}>Active Findings</h2>
              </div>
              <button onClick={() => onModuleChange('diagnosis')}
                className="text-[12px] font-bold hover:opacity-70 transition-opacity"
                style={{ color: 'var(--accent)' }}>Open Diagnosis →</button>
            </div>
            <div className="px-4 py-3 space-y-2">
              {mockDiagnoses.map((dx, idx) => {
                const sc = SevColor[dx.severity] ?? 'white';
                const uc = UrgColor[dx.urgency];
                return (
                  <motion.div key={dx.id}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + idx * 0.08 }}
                    whileHover={{ x: 3 }}
                    onClick={() => onModuleChange('diagnosis')}
                    className="flex items-center gap-4 px-5 py-4 rounded-xl cursor-pointer group transition-all"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
                  >
                    <div className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: sc, boxShadow: `0 0 6px ${sc}` }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-bold" style={{ color: 'var(--text-primary)' }}>
                        {dx.plainEnglishName}
                      </p>
                      <p className="text-[11px] mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                        {dx.condition} · Teeth {dx.toothIds.join(', ')}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <span className="text-[11px] font-bold uppercase tracking-wide"
                        style={{ color: sc }}>{dx.severity}</span>
                      <span className="text-[11px] font-bold" style={{ color: uc }}>{UrgLabel[dx.urgency]}</span>
                      <div className="flex items-center gap-1.5">
                        <div className="w-16 h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                          <div className="h-full rounded-full" style={{ width: `${dx.combinedConfidence * 100}%`, background: sc }} />
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
        </div>

        {/* ── Bottom row ── */}
        <div className="grid grid-cols-3 gap-5">

          {/* Treatment roadmap */}
          <motion.div variants={i}
            className="col-span-2 rounded-2xl p-6"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center justify-between mb-5">
              <p className="text-[11px] uppercase tracking-[0.16em] font-bold" style={{ color: 'var(--text-muted)' }}>Treatment Roadmap</p>
              <button onClick={() => onModuleChange('treatment')} className="text-[12px] font-bold hover:opacity-70 transition-opacity" style={{ color: 'var(--accent)' }}>Details →</button>
            </div>
            <div className="flex items-start gap-4">
              {mockTreatmentPlan.phases.map((ph, idx) => (
                <div key={ph.id} className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black"
                      style={{
                        background: ph.isActive ? 'var(--accent)' : 'rgba(255,255,255,0.06)',
                        color: ph.isActive ? '#000' : 'var(--text-muted)',
                        boxShadow: ph.isActive ? '0 0 16px rgba(0,255,179,0.5)' : 'none',
                      }}>
                      {idx + 1}
                    </div>
                    <div className="flex-1 h-px" style={{ background: idx < mockTreatmentPlan.phases.length - 1 ? 'var(--border)' : 'transparent' }} />
                  </div>
                  <p className="text-[13px] font-bold" style={{ color: ph.isActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{ph.title}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{ph.dateRange}</p>
                  {ph.isActive && (
                    <span className="inline-block mt-1.5 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide"
                      style={{ background: 'var(--accent)', color: '#000' }}>Active</span>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Clinical alerts */}
          <motion.div variants={i}
            className="rounded-2xl overflow-hidden"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
          >
            <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <p className="text-[11px] uppercase tracking-[0.16em] font-bold" style={{ color: 'var(--text-muted)' }}>Clinical Alerts</p>
            </div>
            <div className="px-4 py-3 space-y-2">
              {[
                { text: 'Penicillin allergy', detail: 'Confirm before prescribing', color: 'var(--critical)' },
                { text: 'Dental anxiety', detail: 'Use reassuring language', color: 'var(--warning)' },
                { text: 'Type 2 Diabetes', detail: 'Slower healing post-procedure', color: 'var(--text-secondary)' },
              ].map((a, k) => (
                <div key={k} className="flex items-start gap-3 px-3 py-2.5 rounded-xl"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                  <div className="w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0" style={{ background: a.color }} />
                  <div>
                    <p className="text-[12px] font-bold" style={{ color: 'var(--text-primary)' }}>{a.text}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{a.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

      </motion.div>
    </div>
  );
}
