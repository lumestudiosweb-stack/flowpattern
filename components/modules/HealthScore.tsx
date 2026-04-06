'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { mockHealthScore } from '@/lib/mockData';

function ScoreRing({ score, size = 180 }: { score: number; size?: number }) {
  const [displayed, setDisplayed] = useState(0);
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  useEffect(() => {
    let start = 0;
    const target = score;
    const step = () => {
      start += 2;
      if (start >= target) { setDisplayed(target); return; }
      setDisplayed(start);
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [score]);

  const tierColor =
    score >= 85 ? 'var(--accent)' :
    score >= 70 ? 'var(--accent)' :
    score >= 55 ? '#ffa502' :
    score >= 40 ? '#ff8c42' :
    '#ff4757';

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background track */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="var(--bg-card)" strokeWidth="10"
        />
        {/* Score arc */}
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={tierColor} strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ filter: `drop-shadow(0 0 8px ${tierColor}60)` }}
        />
        {/* Tick marks */}
        {[0, 25, 50, 75, 100].map((tick) => {
          const angle = (tick / 100) * 360 - 90;
          const rad = (angle * Math.PI) / 180;
          const inner = radius - 8;
          const outer = radius + 2;
          return (
            <line
              key={tick}
              x1={size / 2 + inner * Math.cos(rad)}
              y1={size / 2 + inner * Math.sin(rad)}
              x2={size / 2 + outer * Math.cos(rad)}
              y2={size / 2 + outer * Math.sin(rad)}
              stroke="var(--border)"
              strokeWidth="1.5"
            />
          );
        })}
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-5xl font-bold tracking-tight"
          style={{ color: tierColor, textShadow: `0 0 20px ${tierColor}60` }}
        >
          {displayed}
        </span>
        <span className="text-xs mt-1 uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
          {mockHealthScore.tier}
        </span>
      </div>
    </div>
  );
}

export default function HealthScore() {
  const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
  const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

  return (
    <div className="h-full overflow-y-auto p-6">
      <motion.div variants={stagger} initial="hidden" animate="show" className="max-w-5xl mx-auto space-y-5">

        <motion.div variants={item} className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Dental Health Score</h1>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Composite score across 6 clinical dimensions</p>
          </div>
        </motion.div>

        {/* Score + projection row */}
        <div className="grid grid-cols-3 gap-4">
          <motion.div
            variants={item}
            className="col-span-1 rounded-xl p-6 flex flex-col items-center justify-center"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
          >
            <ScoreRing score={mockHealthScore.overall} size={180} />
            <p className="text-xs mt-4 text-center leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              {mockHealthScore.projectionNote}
            </p>
          </motion.div>

          <motion.div
            variants={item}
            className="col-span-2 rounded-xl p-5 space-y-3"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
          >
            <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
              Dimension Breakdown
            </h2>
            {mockHealthScore.dimensions.map((dim) => {
              const color =
                dim.score >= 80 ? 'var(--accent)' :
                dim.score >= 65 ? '#ffa502' :
                '#ff4757';
              return (
                <div key={dim.label}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{dim.label}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-card)', color: 'var(--text-muted)' }}>
                        {Math.round(dim.weight * 100)}% wt
                      </span>
                    </div>
                    <span className="text-sm font-mono font-semibold" style={{ color }}>{dim.score}</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-card)' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${dim.score}%` }}
                      transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ background: color, boxShadow: `0 0 6px ${color}50` }}
                    />
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>

        {/* Score tier guide */}
        <motion.div
          variants={item}
          className="rounded-xl p-5"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
        >
          <h2 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>
            Score Tiers
          </h2>
          <div className="flex gap-2">
            {[
              { range: '85–100', tier: 'Excellent', color: 'var(--accent)', desc: 'Maintain habits' },
              { range: '70–84', tier: 'Good', color: '#2ed573', desc: 'Minor areas to address' },
              { range: '55–69', tier: 'Fair', color: '#ffa502', desc: 'Active treatment recommended', active: true },
              { range: '40–54', tier: 'Concerning', color: '#ff8c42', desc: 'Prioritize treatment' },
              { range: '< 40', tier: 'Critical', color: '#ff4757', desc: 'Urgent care needed' },
            ].map((tier) => (
              <div
                key={tier.tier}
                className="flex-1 p-3 rounded-lg"
                style={{
                  background: tier.active ? `${tier.color}15` : 'var(--bg-card)',
                  border: `1px solid ${tier.active ? tier.color + '40' : 'var(--border-subtle)'}`,
                }}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-2 h-2 rounded-full" style={{ background: tier.color }} />
                  <span className="text-xs font-medium" style={{ color: tier.color }}>{tier.tier}</span>
                  {tier.active && (
                    <span className="text-[9px] px-1.5 rounded-full" style={{ background: tier.color, color: '#000' }}>You</span>
                  )}
                </div>
                <p className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>{tier.range}</p>
                <p className="text-[10px] mt-1" style={{ color: 'var(--text-secondary)' }}>{tier.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Trend + improvement tips */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            variants={item}
            className="rounded-xl p-5"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
          >
            <h2 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>
              Score History
            </h2>
            <div className="flex items-end gap-3 h-20">
              {mockHealthScore.trend.map((score, i) => {
                const isLast = i === mockHealthScore.trend.length - 1;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] font-mono" style={{ color: isLast ? 'var(--accent)' : 'var(--text-muted)' }}>
                      {score}
                    </span>
                    <div className="w-full relative" style={{ height: '56px', background: 'var(--bg-card)', borderRadius: '4px' }}>
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(score / 100) * 100}%` }}
                        transition={{ delay: i * 0.08, duration: 0.5 }}
                        className="absolute bottom-0 left-0 right-0 rounded-sm"
                        style={{
                          background: isLast ? 'var(--accent)' : 'var(--border)',
                          boxShadow: isLast ? '0 0 8px var(--accent-glow)' : 'none',
                        }}
                      />
                    </div>
                    <span className="text-[9px]" style={{ color: isLast ? 'var(--accent)' : 'var(--text-muted)' }}>
                      {mockHealthScore.trendDates[i]}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            variants={item}
            className="rounded-xl p-5"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
          >
            <h2 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
              How to Improve Your Score
            </h2>
            <div className="space-y-2">
              {[
                { tip: 'Complete Phase 1 treatment plan', points: '+8 pts', dim: 'Restorative' },
                { tip: 'Daily flossing, 2× per day', points: '+4 pts', dim: 'Periodontal' },
                { tip: 'Deep cleaning (Phase 1)', points: '+5 pts', dim: 'Hygiene' },
                { tip: 'Acid reflux management', points: '+3 pts', dim: 'Structural' },
              ].map((t) => (
                <div
                  key={t.tip}
                  className="flex items-center justify-between p-2.5 rounded-lg"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
                >
                  <div>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{t.tip}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{t.dim}</p>
                  </div>
                  <span className="text-xs font-medium font-mono" style={{ color: 'var(--accent)' }}>{t.points}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

      </motion.div>
    </div>
  );
}
