'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { mockHealthScore } from '@/lib/mockData';

function ScoreRing({ score, size = 180 }: { score: number; size?: number }) {
  const [displayed, setDisplayed] = useState(0);
  const r = (size - 24) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;

  useEffect(() => {
    let cur = 0;
    const id = setInterval(() => {
      cur += 2;
      if (cur >= score) { setDisplayed(score); clearInterval(id); return; }
      setDisplayed(cur);
    }, 16);
    return () => clearInterval(id);
  }, [score]);

  const color = score >= 70 ? 'var(--accent)' : score >= 55 ? 'var(--warning)' : 'var(--critical)';

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Outer glow ring */}
        <circle cx={size/2} cy={size/2} r={r + 6} fill="none"
          stroke={color} strokeWidth="1" opacity="0.1" />
        {/* Track */}
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke="var(--bg-card)" strokeWidth="12" />
        {/* Arc */}
        <motion.circle
          cx={size/2} cy={size/2} r={r} fill="none"
          stroke={color} strokeWidth="12" strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.4, ease: 'easeOut' }}
          transform={`rotate(-90 ${size/2} ${size/2})`}
          style={{ filter: `drop-shadow(0 0 10px ${color}55)` }}
        />
        {/* Tick marks at quarters */}
        {[0, 25, 50, 75].map((tick) => {
          const angle = (tick / 100) * 360 - 90;
          const rad = (angle * Math.PI) / 180;
          const inner = r - 8; const outer = r + 4;
          return <line key={tick}
            x1={size/2 + inner * Math.cos(rad)} y1={size/2 + inner * Math.sin(rad)}
            x2={size/2 + outer * Math.cos(rad)} y2={size/2 + outer * Math.sin(rad)}
            stroke="var(--border)" strokeWidth="1.5" />;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-bold tracking-tight" style={{
          fontSize: size * 0.26, color, textShadow: `0 0 24px ${color}60`, letterSpacing: '-0.03em'
        }}>
          {displayed}
        </span>
        <span className="text-[11px] mt-0.5 font-semibold uppercase tracking-[0.12em]" style={{ color: 'var(--text-muted)' }}>
          {mockHealthScore.tier}
        </span>
      </div>
    </div>
  );
}

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item    = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export default function HealthScore() {
  return (
    <div className="h-full overflow-y-auto" style={{ padding: '20px 24px' }}>
      <motion.div variants={stagger} initial="hidden" animate="show" className="max-w-[1040px] mx-auto space-y-5">

        <motion.div variants={item} className="flex items-center justify-between">
          <div>
            <h1 className="text-[20px] font-semibold tracking-tight" style={{ color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              Dental Health Score
            </h1>
            <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Composite across 6 clinical dimensions
            </p>
          </div>
        </motion.div>

        {/* Score ring + dimensions */}
        <div className="grid grid-cols-3 gap-4">
          <motion.div variants={item}
            className="col-span-1 rounded-2xl px-6 py-6 flex flex-col items-center justify-center gap-4"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            <ScoreRing score={mockHealthScore.overall} size={180} />
            <div className="text-center">
              <p className="text-[12px] font-semibold" style={{ color: 'var(--accent)' }}>
                Projected: {mockHealthScore.projectedScore}
              </p>
              <p className="text-[11px] mt-1 leading-snug" style={{ color: 'var(--text-muted)' }}>
                {mockHealthScore.projectionNote}
              </p>
            </div>
          </motion.div>

          <motion.div variants={item}
            className="col-span-2 rounded-2xl p-5 space-y-3.5"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            <h2 className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: 'var(--text-muted)' }}>
              Dimension Breakdown
            </h2>
            {mockHealthScore.dimensions.map((dim, i) => {
              const color = dim.score >= 80 ? 'var(--accent)' : dim.score >= 65 ? 'var(--warning)' : 'var(--critical)';
              return (
                <div key={dim.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>{dim.label}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md"
                        style={{ background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}>
                        {Math.round(dim.weight * 100)}% wt
                      </span>
                    </div>
                    <span className="text-[13px] font-mono font-bold" style={{ color }}>{dim.score}</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-card)' }}>
                    <motion.div
                      initial={{ width: 0 }} animate={{ width: `${dim.score}%` }}
                      transition={{ duration: 0.9, delay: 0.15 + i * 0.05, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ background: color, boxShadow: `0 0 6px ${color}45` }}
                    />
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>

        {/* Tier reference */}
        <motion.div variants={item}
          className="rounded-2xl p-5"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.16em] mb-4" style={{ color: 'var(--text-muted)' }}>
            Score Reference
          </h2>
          <div className="flex gap-2">
            {[
              { range: '85–100', tier: 'Excellent',  color: 'var(--accent)',   desc: 'Maintain habits' },
              { range: '70–84',  tier: 'Good',       color: '#22d3a5',         desc: 'Minor areas to watch' },
              { range: '55–69',  tier: 'Fair',       color: 'var(--warning)',  desc: 'Treatment recommended', active: true },
              { range: '40–54',  tier: 'Concerning', color: '#ff8c42',         desc: 'Prioritize care' },
              { range: '< 40',   tier: 'Critical',   color: 'var(--critical)', desc: 'Urgent attention' },
            ].map((tier) => (
              <div key={tier.tier}
                className="flex-1 p-3.5 rounded-xl relative overflow-hidden"
                style={{
                  background: tier.active ? `rgba(255,170,0,0.07)` : 'var(--bg-card)',
                  border: `1px solid ${tier.active ? 'rgba(255,170,0,0.28)' : 'var(--border-subtle)'}`,
                }}>
                {tier.active && (
                  <div className="absolute top-2 right-2">
                    <span className="text-[8px] px-1.5 py-0.5 rounded-full font-bold"
                      style={{ background: tier.color, color: '#000' }}>YOU</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: tier.color, boxShadow: `0 0 4px ${tier.color}` }} />
                  <span className="text-[12px] font-semibold" style={{ color: tier.color }}>{tier.tier}</span>
                </div>
                <p className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>{tier.range}</p>
                <p className="text-[11px] mt-1" style={{ color: 'var(--text-secondary)' }}>{tier.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Trend + improvements */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div variants={item}
            className="rounded-2xl p-5"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            <h2 className="text-[10px] font-semibold uppercase tracking-[0.16em] mb-4" style={{ color: 'var(--text-muted)' }}>
              Score History
            </h2>
            <svg width="100%" height="64" viewBox="0 0 240 64" preserveAspectRatio="none" className="overflow-visible">
              <defs>
                <linearGradient id="hGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00d4aa" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#00d4aa" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d={`M ${mockHealthScore.trend.map((v, i) => {
                  const x = (i / (mockHealthScore.trend.length - 1)) * 240;
                  const y = 64 - ((v - 46) / 26) * 58;
                  return `${x},${y}`;
                }).join(' L ')} L 240,64 L 0,64 Z`}
                fill="url(#hGrad)" />
              <polyline
                points={mockHealthScore.trend.map((v, i) => {
                  const x = (i / (mockHealthScore.trend.length - 1)) * 240;
                  const y = 64 - ((v - 46) / 26) * 58;
                  return `${x},${y}`;
                }).join(' ')}
                fill="none" stroke="#00d4aa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              {mockHealthScore.trend.map((v, i) => {
                const x = (i / (mockHealthScore.trend.length - 1)) * 240;
                const y = 64 - ((v - 46) / 26) * 58;
                const last = i === mockHealthScore.trend.length - 1;
                return <g key={i}>
                  {last && <circle cx={x} cy={y} r="7" fill="#00d4aa" fillOpacity="0.12" />}
                  <circle cx={x} cy={y} r={last ? 3.5 : 2.5}
                    fill={last ? '#00d4aa' : 'var(--bg-elevated)'} stroke="#00d4aa" strokeWidth="1.5" />
                </g>;
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

          <motion.div variants={item}
            className="rounded-2xl overflow-hidden"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            <div className="px-5 py-3.5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <h2 className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: 'var(--text-muted)' }}>
                Score Improvement Levers
              </h2>
            </div>
            <div className="px-4 py-3 space-y-2">
              {[
                { tip: 'Complete Phase 1 treatment plan', pts: '+8', dim: 'Restorative' },
                { tip: 'Daily flossing, 2× brushing',     pts: '+4', dim: 'Periodontal' },
                { tip: 'Deep cleaning (Phase 1)',          pts: '+5', dim: 'Hygiene' },
                { tip: 'Acid reflux management',           pts: '+3', dim: 'Structural' },
              ].map((t) => (
                <div key={t.tip}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                  <div>
                    <p className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>{t.tip}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{t.dim}</p>
                  </div>
                  <span className="text-[12px] font-bold font-mono" style={{ color: 'var(--accent)' }}>{t.pts}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

      </motion.div>
    </div>
  );
}
