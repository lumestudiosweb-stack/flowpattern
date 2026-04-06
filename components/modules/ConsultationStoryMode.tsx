'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockPatient, mockHealthScore, mockDiagnoses, mockTreatmentPlan } from '@/lib/mockData';

/* ── Transition variants ── */
const slide = {
  enter:  (d: number) => ({ opacity: 0, x: d > 0 ? 60 : -60 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] } },
  exit:   (d: number) => ({ opacity: 0, x: d > 0 ? -60 : 60, transition: { duration: 0.35 } }),
};

/* ── Score ring ── */
function BigRing({ score, size = 200 }: { score: number; size?: number }) {
  const r = size / 2 - 14; const c = 2 * Math.PI * r;
  const color = score >= 70 ? '#00FFB3' : score >= 55 ? '#FFD966' : '#FF4D4D';
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12"/>
      <motion.circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="12"
        strokeLinecap="round" strokeDasharray={c}
        initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c - (score/100)*c }}
        transition={{ duration: 1.4, ease: 'easeOut' }}
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ filter: `drop-shadow(0 0 18px ${color}70)` }}/>
      <text x={size/2} y={size/2 - 8} textAnchor="middle" fontSize={size*0.22} fontWeight="900" fill={color}>{score}</text>
      <text x={size/2} y={size/2 + 16} textAnchor="middle" fontSize={size*0.09} fill="rgba(255,255,255,0.4)" letterSpacing="3">OUT OF 100</text>
    </svg>
  );
}

/* ── Chapter definitions ── */
const chapters = [
  { id: 'welcome',   label: 'Hello', dot: '#00FFB3' },
  { id: 'findings',  label: 'Findings', dot: '#FF4D4D' },
  { id: 'risk',      label: 'The Risk', dot: '#FFD966' },
  { id: 'plan',      label: 'The Plan', dot: '#00FFB3' },
  { id: 'future',    label: 'Your Future', dot: '#00FFB3' },
];

/* ── Chapter screens ── */
function ChapterWelcome() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let n = 0;
    const id = setInterval(() => {
      n += 1; setCount(n);
      if (n >= mockHealthScore.overall) clearInterval(id);
    }, 18);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="flex flex-col items-center gap-10 text-center">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <p className="text-[13px] font-semibold uppercase tracking-[0.3em]" style={{ color: 'rgba(255,255,255,0.3)' }}>
          Today's Consultation
        </p>
        <h1 className="text-[52px] font-black tracking-tight mt-2" style={{ letterSpacing: '-0.03em' }}>
          Hello, {mockPatient.name.split(' ')[0]}
        </h1>
        <p className="text-[18px] mt-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Here's a full picture of your oral health today.
        </p>
      </motion.div>
      <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.25, type: 'spring', stiffness: 180 }}>
        <BigRing score={count} size={220} />
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="flex gap-6">
        {[
          { n: `${mockDiagnoses.length}`, label: 'Conditions Found', c: '#FF4D4D' },
          { n: `${mockTreatmentPlan.phases.length}`, label: 'Treatment Phases', c: '#FFD966' },
          { n: mockHealthScore.tier, label: 'Current Status', c: '#00FFB3' },
        ].map((stat) => (
          <div key={stat.label} className="flex flex-col items-center gap-1">
            <span className="text-[32px] font-black" style={{ color: stat.c, letterSpacing: '-0.02em' }}>{stat.n}</span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ color: 'rgba(255,255,255,0.35)' }}>{stat.label}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

function ChapterFindings() {
  const sevColor: Record<string, string> = { mild: '#00FFB3', moderate: '#FFD966', severe: '#FF4D4D' };
  return (
    <div className="flex flex-col items-center gap-8 text-center w-full max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-[13px] font-semibold uppercase tracking-[0.3em]" style={{ color: 'rgba(255,255,255,0.3)' }}>
          What We Discovered
        </p>
        <h2 className="text-[44px] font-black tracking-tight mt-2" style={{ letterSpacing: '-0.025em' }}>
          {mockDiagnoses.length} Conditions Found
        </h2>
      </motion.div>
      <div className="flex flex-col gap-4 w-full">
        {mockDiagnoses.map((dx, i) => {
          const c = sevColor[dx.severity] ?? '#fff';
          return (
            <motion.div key={dx.id}
              initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.14 + 0.1 }}
              className="flex items-center gap-5 px-7 py-5 rounded-2xl text-left"
              style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid rgba(255,255,255,0.07)` }}
            >
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: c, boxShadow: `0 0 12px ${c}` }} />
              <div className="flex-1">
                <p className="text-[20px] font-black" style={{ color: '#fff' }}>{dx.plainEnglishName}</p>
                <p className="text-[13px] mt-1 leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>{dx.aiExplanation}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-[13px] font-bold uppercase tracking-wide" style={{ color: c }}>{dx.severity}</p>
                <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>Teeth {dx.toothIds.join(', ')}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function ChapterRisk() {
  const primary = mockDiagnoses[0];
  return (
    <div className="flex flex-col items-center gap-8 text-center w-full max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-[13px] font-semibold uppercase tracking-[0.3em]" style={{ color: '#FF4D4D' }}>
          The Risk
        </p>
        <h2 className="text-[40px] font-black tracking-tight mt-2" style={{ letterSpacing: '-0.025em' }}>
          {primary.plainEnglishName}
        </h2>
        <p className="text-[16px] mt-2" style={{ color: 'rgba(255,255,255,0.45)' }}>
          Here's what happens if we leave this untreated
        </p>
      </motion.div>
      <div className="grid grid-cols-2 gap-4 w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="rounded-2xl p-6 text-left"
          style={{ background: 'rgba(255,77,77,0.07)', border: '1px solid rgba(255,77,77,0.2)' }}>
          <p className="text-[28px] mb-1">😬</p>
          <p className="text-[16px] font-black" style={{ color: '#FF4D4D' }}>Without Treatment</p>
          <p className="text-[13px] mt-2 leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {primary.ifUntreated}
          </p>
          <div className="mt-4 space-y-1.5">
            {['3 months — spreading decay','12 months — root canal needed','2+ years — possible tooth loss'].map((t) => (
              <div key={t} className="flex items-center gap-2 text-[11px]" style={{ color: 'rgba(255,77,77,0.8)' }}>
                <span>→</span><span>{t}</span>
              </div>
            ))}
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-2xl p-6 text-left"
          style={{ background: 'rgba(0,255,179,0.06)', border: '1px solid rgba(0,255,179,0.2)' }}>
          <p className="text-[28px] mb-1">✓</p>
          <p className="text-[16px] font-black" style={{ color: '#00FFB3' }}>With Treatment</p>
          <p className="text-[13px] mt-2 leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
            One appointment. The cavity is sealed — the tooth is protected for over 10 years.
          </p>
          <div className="mt-4 space-y-1.5">
            {['Week 1 — Filling placed (~60 min)','3 months — Full recovery','5 years — Tooth fully protected'].map((t) => (
              <div key={t} className="flex items-center gap-2 text-[11px]" style={{ color: 'rgba(0,255,179,0.8)' }}>
                <span>→</span><span>{t}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        className="px-6 py-4 rounded-2xl"
        style={{ background: 'rgba(255,217,102,0.06)', border: '1px solid rgba(255,217,102,0.2)' }}>
        <p className="text-[13px]" style={{ color: 'rgba(255,255,255,0.6)' }}>
          💡 <strong style={{ color: '#FFD966' }}>Cost comparison:</strong>&nbsp;
          Filling now ~$220 vs. Root canal if delayed ~$1,200+
        </p>
      </motion.div>
    </div>
  );
}

function ChapterPlan() {
  const all = mockTreatmentPlan.phases.flatMap(p => p.treatments);
  const painCol: Record<string, string> = { none: '#00FFB3', minimal: '#00FFB3', mild: '#FFD966', moderate: '#FFD966', significant: '#FF4D4D' };
  return (
    <div className="flex flex-col items-center gap-8 text-center w-full max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-[13px] font-semibold uppercase tracking-[0.3em]" style={{ color: '#00FFB3' }}>The Plan</p>
        <h2 className="text-[44px] font-black tracking-tight mt-2" style={{ letterSpacing: '-0.025em' }}>
          {all.length} Simple Steps
        </h2>
        <p className="text-[16px] mt-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Spread over {mockTreatmentPlan.totalDuration}
        </p>
      </motion.div>
      <div className="flex flex-col gap-3 w-full">
        {all.map((tx, i) => (
          <motion.div key={tx.id}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.12 + 0.1 }}
            className="flex items-center gap-5 px-6 py-4 rounded-2xl text-left"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-[14px] font-black flex-shrink-0"
              style={{ background: 'rgba(0,255,179,0.12)', color: '#00FFB3', border: '1px solid rgba(0,255,179,0.25)' }}>
              {i + 1}
            </div>
            <div className="flex-1">
              <p className="text-[18px] font-black" style={{ color: '#fff' }}>{tx.plainEnglishName}</p>
              <div className="flex gap-4 mt-1 text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                <span>⏱ {tx.durationMinutes} min</span>
                <span>💰 {tx.costRange}</span>
                <span style={{ color: painCol[tx.painLevel] }}>● {tx.painLevel} discomfort</span>
              </div>
            </div>
            {tx.insuranceCovered && (
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0"
                style={{ background: 'rgba(0,255,179,0.12)', color: '#00FFB3', border: '1px solid rgba(0,255,179,0.25)' }}>
                ✓ Covered
              </span>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ChapterFuture() {
  const [count, setCount] = useState(mockHealthScore.overall);
  useEffect(() => {
    const target = mockHealthScore.projectedScore;
    let n = mockHealthScore.overall;
    const id = setInterval(() => {
      n += 0.5; setCount(Math.min(Math.round(n), target));
      if (n >= target) clearInterval(id);
    }, 40);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="flex flex-col items-center gap-10 text-center">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-[13px] font-semibold uppercase tracking-[0.3em]" style={{ color: '#00FFB3' }}>Your Future</p>
        <h2 className="text-[44px] font-black tracking-tight mt-2" style={{ letterSpacing: '-0.025em' }}>After Treatment</h2>
        <p className="text-[16px] mt-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Here's what completing your plan means for you
        </p>
      </motion.div>
      <div className="flex items-center gap-8">
        <div className="flex flex-col items-center gap-2">
          <BigRing score={mockHealthScore.overall} size={140} />
          <span className="text-[12px] font-semibold" style={{ color: 'rgba(255,255,255,0.4)' }}>Today</span>
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}
          className="text-[40px] font-black" style={{ color: 'rgba(255,255,255,0.2)' }}>→</motion.div>
        <div className="flex flex-col items-center gap-2">
          <BigRing score={count} size={140} />
          <span className="text-[12px] font-semibold" style={{ color: '#00FFB3' }}>After Treatment</span>
        </div>
      </div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
        className="flex flex-col gap-3 w-full max-w-lg">
        {[
          { icon: '🚫', text: 'Cavity fully sealed — no more decay spreading' },
          { icon: '🦷', text: 'Gums strengthened — bone loss halted with maintenance' },
          { icon: '✓', text: 'Tooth sensitivity gone — enjoy hot and cold again' },
        ].map((item, k) => (
          <motion.div key={k} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 + k * 0.1 }}
            className="flex items-center gap-4 px-5 py-3.5 rounded-xl text-left"
            style={{ background: 'rgba(0,255,179,0.05)', border: '1px solid rgba(0,255,179,0.12)' }}>
            <span className="text-xl">{item.icon}</span>
            <span className="text-[14px]" style={{ color: 'rgba(255,255,255,0.7)' }}>{item.text}</span>
          </motion.div>
        ))}
      </motion.div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}>
        <p className="text-[16px] font-bold">
          Next appointment: <span style={{ color: '#00FFB3' }}>{mockPatient.nextAppointment}</span> 📅
        </p>
      </motion.div>
    </div>
  );
}

/* ── Main ── */
export default function ConsultationStoryMode() {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const total = chapters.length;

  const go = (n: number) => {
    if (n < 0 || n >= total) return;
    setDir(n > step ? 1 : -1);
    setStep(n);
  };

  const screens = [
    <ChapterWelcome key="w" />,
    <ChapterFindings key="f" />,
    <ChapterRisk key="r" />,
    <ChapterPlan key="p" />,
    <ChapterFuture key="fu" />,
  ];

  return (
    <div className="h-full flex flex-col" style={{ background: '#000', position: 'relative' }}>
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(0,255,179,0.07) 0%, transparent 70%)', filter: 'blur(60px)' }} />

      {/* Chapter progress bar */}
      <div className="relative flex items-stretch px-8 pt-6 shrink-0 gap-0">
        {chapters.map((ch, i) => (
          <button key={ch.id} onClick={() => go(i)}
            className="flex-1 flex flex-col items-center gap-2 pb-4 group">
            <div className="w-full h-0.5 rounded-full transition-all duration-500"
              style={{ background: i <= step ? ch.dot : 'rgba(255,255,255,0.08)' }} />
            <span className={`text-[10px] font-semibold uppercase tracking-[0.14em] transition-all duration-300`}
              style={{ color: i === step ? ch.dot : 'rgba(255,255,255,0.25)' }}>
              {ch.label}
            </span>
          </button>
        ))}
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto flex items-center justify-center px-8 py-4">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            className="w-full max-w-2xl flex flex-col items-center"
          >
            {screens[step]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="relative flex items-center justify-between px-8 pb-6 pt-3 shrink-0">
        <button onClick={() => go(step - 1)} disabled={step === 0}
          className="px-6 py-2.5 rounded-full text-[13px] font-bold transition-all disabled:opacity-0"
          style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}>
          ← Back
        </button>

        {/* Dot nav */}
        <div className="flex items-center gap-2">
          {Array.from({ length: total }).map((_, i) => (
            <button key={i} onClick={() => go(i)}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === step ? 22 : 6,
                height: 6,
                background: i === step ? chapters[step].dot : 'rgba(255,255,255,0.15)',
                boxShadow: i === step ? `0 0 10px ${chapters[step].dot}80` : 'none',
              }} />
          ))}
        </div>

        {step < total - 1 ? (
          <button onClick={() => go(step + 1)}
            className="px-6 py-2.5 rounded-full text-[13px] font-bold transition-all hover:scale-105 active:scale-95"
            style={{ background: chapters[step].dot, color: '#000', boxShadow: `0 0 20px ${chapters[step].dot}50` }}>
            Next →
          </button>
        ) : (
          <button onClick={() => go(0)}
            className="px-6 py-2.5 rounded-full text-[13px] font-bold transition-all hover:scale-105 active:scale-95"
            style={{ background: '#00FFB3', color: '#000', boxShadow: '0 0 20px rgba(0,255,179,0.4)' }}>
            Start Over ↺
          </button>
        )}
      </div>
    </div>
  );
}
