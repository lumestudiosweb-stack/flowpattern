'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockPatient, mockHealthScore, mockDiagnoses, mockTreatmentPlan } from '@/lib/mockData';

interface Props {
  onClose: () => void;
}

/* ─── slide transition ─── */
const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.45, ease: 'easeOut' as const } },
  exit:  (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0, transition: { duration: 0.3 } }),
};

/* ─── helpers ─── */
function ScoreRing({ score, projected, size = 140 }: { score: number; projected?: number; size?: number }) {
  const r = size / 2 - 12;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* track */}
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
      {/* projected ghost */}
      {projected && (
        <motion.circle
          cx={size/2} cy={size/2} r={r} fill="none"
          stroke="rgba(0,212,170,0.18)" strokeWidth="10"
          strokeLinecap="round" strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - (projected / 100) * circ }}
          transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
          transform={`rotate(-90 ${size/2} ${size/2})`}
        />
      )}
      {/* score arc */}
      <motion.circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke="#00d4aa" strokeWidth="10"
        strokeLinecap="round" strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - (score / 100) * circ }}
        transition={{ duration: 1.0, ease: 'easeOut' }}
        transform={`rotate(-90 ${size/2} ${size/2})`}
      />
      <text x={size/2} y={size/2 - 4} textAnchor="middle" fontSize={size * 0.22} fontWeight="700" fill="#00d4aa">{score}</text>
      <text x={size/2} y={size/2 + 16} textAnchor="middle" fontSize={size * 0.1} fill="rgba(255,255,255,0.5)">out of 100</text>
    </svg>
  );
}

function Pill({ children, color = '#00d4aa' }: { children: React.ReactNode; color?: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}
    >
      {children}
    </span>
  );
}

function PathFork({ label, good, bad }: { label: string; good: string; bad: string }) {
  return (
    <div className="flex gap-4 w-full max-w-xl">
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="flex-1 rounded-2xl p-4 flex flex-col gap-2"
        style={{ background: 'rgba(255,71,87,0.09)', border: '1px solid rgba(255,71,87,0.25)' }}
      >
        <p className="text-sm font-semibold text-red-400">If we wait…</p>
        <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>{bad}</p>
      </motion.div>
      <div className="flex items-center justify-center w-8 shrink-0">
        <div className="w-0.5 h-full rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }} />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="flex-1 rounded-2xl p-4 flex flex-col gap-2"
        style={{ background: 'rgba(0,212,170,0.09)', border: '1px solid rgba(0,212,170,0.25)' }}
      >
        <p className="text-sm font-semibold" style={{ color: '#00d4aa' }}>If we treat it now…</p>
        <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>{good}</p>
      </motion.div>
    </div>
  );
}

/* ─── slides ─── */
function Slide1() {
  return (
    <div className="flex flex-col items-center gap-8 text-center">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}>
        <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-2"
          style={{ background: 'rgba(0,212,170,0.15)', border: '2px solid rgba(0,212,170,0.4)', color: '#00d4aa' }}>
          {mockPatient.avatar}
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-white">
          Hi {mockPatient.name.split(' ')[0]}
        </h1>
        <p className="mt-2 text-lg" style={{ color: 'rgba(255,255,255,0.55)' }}>
          Let's walk through what we found today
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        className="flex flex-col items-center gap-3">
        <ScoreRing score={mockHealthScore.overall} />
        <div className="flex flex-col items-center gap-1">
          <span className="text-xl font-semibold text-white">Your dental health score</span>
          <span className="text-base" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {mockHealthScore.tier} — there's room to improve, and we have a plan
          </span>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
        className="flex gap-3 flex-wrap justify-center">
        <Pill>{mockDiagnoses.length} things to discuss</Pill>
        <Pill color="#ffa502">Next visit: {mockPatient.nextAppointment}</Pill>
        <Pill>{mockPatient.insuranceProvider}</Pill>
      </motion.div>
    </div>
  );
}

function Slide2() {
  const urgencyMap: Record<string, { label: string; color: string }> = {
    soon:    { label: 'Needs attention soon',  color: '#ff4757' },
    routine: { label: 'Keep an eye on it',     color: '#ffa502' },
    urgent:  { label: 'Act quickly',           color: '#ff4757' },
    monitor: { label: 'Just monitoring',       color: '#00d4aa' },
  };
  return (
    <div className="flex flex-col items-center gap-7 text-center w-full max-w-xl">
      <div>
        <h2 className="text-3xl font-bold text-white">What We Found</h2>
        <p className="mt-1 text-base" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Here are the {mockDiagnoses.length} things we noticed in your mouth today
        </p>
      </div>
      <div className="flex flex-col gap-4 w-full">
        {mockDiagnoses.map((dx, i) => {
          const u = urgencyMap[dx.urgency] ?? urgencyMap.routine;
          return (
            <motion.div
              key={dx.id}
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15 + 0.1 }}
              className="rounded-2xl p-5 text-left flex gap-4 items-start"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }}
            >
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-2" style={{ background: u.color, boxShadow: `0 0 6px ${u.color}80` }} />
              <div className="flex flex-col gap-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-lg font-semibold text-white">{dx.plainEnglishName}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ background: `${u.color}22`, color: u.color, border: `1px solid ${u.color}44` }}>
                    {u.label}
                  </span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
                  {dx.aiExplanation}
                </p>
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  Tooth {dx.toothIds.join(', ')}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function Slide3() {
  const primary = mockDiagnoses[0];
  return (
    <div className="flex flex-col items-center gap-7 text-center w-full max-w-xl">
      <div>
        <h2 className="text-3xl font-bold text-white">What Could Happen</h2>
        <p className="mt-1 text-base" style={{ color: 'rgba(255,255,255,0.5)' }}>
          The most important one to act on: <strong className="text-white">{primary.plainEnglishName}</strong>
        </p>
      </div>

      <PathFork
        label={primary.plainEnglishName}
        bad="The small cavity keeps growing, hits the nerve in 6–12 months, needs a root canal ($1,000+) and may cost you the tooth."
        good="One 60-minute filling appointment seals it completely. Pain-free, costs ~$220, and the tooth lasts another 10+ years."
      />

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
        className="rounded-2xl px-6 py-4 text-sm leading-relaxed max-w-sm text-center"
        style={{ background: 'rgba(0,212,170,0.07)', border: '1px solid rgba(0,212,170,0.2)', color: 'rgba(255,255,255,0.7)' }}>
        <strong className="text-white">The good news:</strong> {primary.aiExplanation}
      </motion.div>
    </div>
  );
}

function Slide4() {
  const allTreatments = mockTreatmentPlan.phases.flatMap(p => p.treatments);
  const painIcons: Record<string, string> = { none: 'No pain', minimal: 'Almost nothing', mild: 'Mild discomfort', moderate: 'Noticeable' };
  return (
    <div className="flex flex-col items-center gap-7 text-center w-full max-w-xl">
      <div>
        <h2 className="text-3xl font-bold text-white">Your Treatment Plan</h2>
        <p className="mt-1 text-base" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Simple steps — spread over {mockTreatmentPlan.totalDuration}
        </p>
      </div>

      <div className="flex flex-col gap-4 w-full">
        {allTreatments.map((tx, i) => (
          <motion.div
            key={tx.id}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15 + 0.1 }}
            className="rounded-2xl p-5 text-left flex gap-4 items-start"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }}
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 mt-0.5"
              style={{ background: 'rgba(0,212,170,0.15)', color: '#00d4aa', border: '1px solid rgba(0,212,170,0.3)' }}>
              {i + 1}
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-base font-semibold text-white">{tx.plainEnglishName}</span>
                {tx.insuranceCovered && <Pill color="#00d4aa">✓ Covered by insurance</Pill>}
              </div>
              <div className="flex gap-3 flex-wrap text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                <span>{tx.durationMinutes} min</span>
                <span>{tx.costRange}</span>
                <span>{painIcons[tx.painLevel] ?? tx.painLevel}</span>
              </div>
              <ul className="mt-1 flex flex-col gap-1">
                {tx.steps.slice(0, 3).map((step, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    <span className="mt-0.5 text-xs" style={{ color: '#00d4aa' }}>▸</span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function Slide5({ onClose }: { onClose: () => void }) {
  const [counting, setCounting] = useState(mockHealthScore.overall);
  useEffect(() => {
    const target = mockHealthScore.projectedScore;
    const step = (target - mockHealthScore.overall) / 30;
    let cur = mockHealthScore.overall;
    const id = setInterval(() => {
      cur += step;
      if (cur >= target) { setCounting(target); clearInterval(id); return; }
      setCounting(Math.round(cur));
    }, 40);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col items-center gap-8 text-center">
      <div>
        <h2 className="text-3xl font-bold text-white">Your Healthy Future</h2>
        <p className="mt-1 text-base" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Here's what completing your treatment plan means for you
        </p>
      </div>

      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
        className="flex items-center gap-8">
        <div className="flex flex-col items-center gap-1">
          <ScoreRing score={mockHealthScore.overall} size={110} />
          <span className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Today</span>
        </div>
        <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}
          className="flex flex-col items-center gap-1">
          <span className="text-4xl">→</span>
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>4–5 months</span>
        </motion.div>
        <div className="flex flex-col items-center gap-1">
          <ScoreRing score={counting} projected={mockHealthScore.projectedScore} size={110} />
          <span className="text-sm" style={{ color: '#00d4aa' }}>After treatment</span>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
        className="flex flex-col gap-3 w-full max-w-sm">
        {[
          'No more cavity growing — the tooth is protected for 10+ years',
          'Gums strengthened — no bone loss with regular maintenance',
          'Tooth sensitivity gone — enjoy hot and cold foods again',
        ].map((text, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 + i * 0.12 }}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-left"
            style={{ background: 'rgba(0,212,170,0.07)', border: '1px solid rgba(0,212,170,0.15)' }}>
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#00d4aa' }} />
            <span className="text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>{text}</span>
          </motion.div>
        ))}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}
        className="flex flex-col items-center gap-3 mt-2">
        <p className="text-base font-medium text-white">
          Your next appointment is <span style={{ color: '#00d4aa' }}>{mockPatient.nextAppointment}</span>
        </p>
        <button onClick={onClose}
          className="px-8 py-3 rounded-full text-base font-semibold transition-all hover:scale-105 active:scale-95"
          style={{ background: '#00d4aa', color: '#000' }}>
          Got it — I'm ready!
        </button>
      </motion.div>
    </div>
  );
}

/* ─── main component ─── */
const SLIDE_LABELS = [
  'Your Score',
  'What We Found',
  'Future Risk',
  'Your Plan',
  'Your Future',
];

export default function PatientExplanationMode({ onClose }: Props) {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const total = SLIDE_LABELS.length;

  const go = (next: number) => {
    setDir(next > step ? 1 : -1);
    setStep(next);
  };

  const slides = [
    <Slide1 key="s1" />,
    <Slide2 key="s2" />,
    <Slide3 key="s3" />,
    <Slide4 key="s4" />,
    <Slide5 key="s5" onClose={onClose} />,
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: '#09100f' }}
    >
      {/* Ambient top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(0,212,170,0.12) 0%, transparent 70%)', filter: 'blur(40px)' }} />

      {/* Top bar */}
      <div className="relative flex items-center justify-between px-6 py-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
            style={{ background: '#00d4aa', color: '#000' }}>FP</div>
          <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>Patient Explanation Mode</span>
        </div>
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium transition-all hover:opacity-80"
          style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
            <path d="M10 3H6a2 2 0 00-2 2v14a2 2 0 002 2h4M14 17l5-5-5-5M19 12H9" />
          </svg>
          Dentist View
        </button>
      </div>

      {/* Progress bar + step labels */}
      <div className="relative px-6 shrink-0">
        <div className="flex items-center gap-0 mb-2">
          {SLIDE_LABELS.map((label, i) => (
            <button key={i} onClick={() => go(i)}
              className="flex-1 flex flex-col items-center gap-1.5 group"
            >
              <div className="w-full h-0.5 rounded-full transition-all duration-500"
                style={{ background: i <= step ? '#00d4aa' : 'rgba(255,255,255,0.1)' }} />
              <span className={`text-[10px] font-medium tracking-wide transition-all duration-300 ${i === step ? 'opacity-100' : 'opacity-30'}`}
                style={{ color: i === step ? '#00d4aa' : '#fff' }}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Slide content */}
      <div className="flex-1 overflow-y-auto flex items-start justify-center px-4 pt-6 pb-24">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            className="w-full max-w-xl flex flex-col items-center"
          >
            {slides[step]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom nav */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-6 py-5 shrink-0"
        style={{ background: 'linear-gradient(to top, #09100f 60%, transparent)' }}>
        <button
          onClick={() => go(step - 1)}
          disabled={step === 0}
          className="px-6 py-2.5 rounded-full text-sm font-medium transition-all disabled:opacity-0"
          style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          ← Back
        </button>

        <div className="flex items-center gap-2">
          {Array.from({ length: total }).map((_, i) => (
            <button key={i} onClick={() => go(i)}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === step ? 20 : 6,
                height: 6,
                background: i === step ? '#00d4aa' : 'rgba(255,255,255,0.15)',
              }} />
          ))}
        </div>

        {step < total - 1 ? (
          <button
            onClick={() => go(step + 1)}
            className="px-6 py-2.5 rounded-full text-sm font-semibold transition-all hover:scale-105 active:scale-95"
            style={{ background: '#00d4aa', color: '#000' }}
          >
            Next →
          </button>
        ) : (
          <div className="w-24" /> /* spacer on last slide */
        )}
      </div>
    </motion.div>
  );
}
