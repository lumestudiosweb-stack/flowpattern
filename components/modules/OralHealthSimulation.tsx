'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';

/* ─── data model ─── */
interface Stage {
  time: string;
  title: string;
  desc: string;
  healthScore: number;
  cumulativeCost: number;
  painLevel: number;        // 0–10
  severity: 'start' | 'mild' | 'moderate' | 'severe' | 'critical' | 'healed' | 'healthy';
  icon: string;
  actionLabel?: string;     // e.g. "Filling placed"
}

interface Scenario {
  id: 'untreated' | 'treated';
  label: string;
  tagline: string;
  accent: string;
  stages: Stage[];
}

interface Diagnosis {
  id: string;
  name: string;
  plain: string;
  toothId: string;
  scenarios: [Scenario, Scenario]; // [untreated, treated]
}

/* ─── simulation data ─── */
const DIAGNOSES: Diagnosis[] = [
  {
    id: 'cavity',
    name: 'Interproximal Caries',
    plain: 'Cavity Between Teeth',
    toothId: '#14',
    scenarios: [
      {
        id: 'untreated',
        label: 'Without Treatment',
        tagline: 'What happens if we wait',
        accent: '#ff4757',
        stages: [
          { time: 'Today',    title: 'Small Cavity',         desc: 'Decay confined to outer enamel — no pain yet.',          healthScore: 67, cumulativeCost: 0,    painLevel: 0, severity: 'start',    icon: '🦷' },
          { time: '3 months', title: 'Cavity Grows Deeper',  desc: 'Decay reaches dentin. Cold sensitivity begins.',          healthScore: 60, cumulativeCost: 0,    painLevel: 2, severity: 'mild',     icon: '⚠️' },
          { time: '6 months', title: 'Visible Darkening',    desc: 'Tooth visibly discoloured. Sharp pain with sweets.',      healthScore: 51, cumulativeCost: 0,    painLevel: 4, severity: 'moderate', icon: '😬' },
          { time: '1 year',   title: 'Pulp Exposed',         desc: 'Decay reaches nerve. Spontaneous throbbing pain.',        healthScore: 39, cumulativeCost: 0,    painLevel: 7, severity: 'severe',   icon: '🔴' },
          { time: '2 years',  title: 'Abscess Forms',        desc: 'Bacterial infection spreads to root and bone.',           healthScore: 24, cumulativeCost: 0,    painLevel: 9, severity: 'critical', icon: '💀' },
          { time: '3–5 yrs',  title: 'Tooth Extracted',      desc: 'Tooth cannot be saved. Adjacent bone loss begins.',       healthScore: 14, cumulativeCost: 0,    painLevel: 8, severity: 'critical', icon: '❌' },
        ],
      },
      {
        id: 'treated',
        label: 'With Early Treatment',
        tagline: 'One appointment changes everything',
        accent: '#00d4aa',
        stages: [
          { time: 'Today',    title: 'Cavity Detected',      desc: 'Caught early — decay still in outer enamel only.',       healthScore: 67, cumulativeCost: 0,    painLevel: 0, severity: 'start',   icon: '🦷' },
          { time: 'Week 1',   title: 'Filling Placed',        desc: '60-min appointment. Composite resin filling applied.',   healthScore: 74, cumulativeCost: 220,  painLevel: 0, severity: 'healed',  icon: '✅', actionLabel: 'White Filling · $220' },
          { time: '3 months', title: 'Full Recovery',         desc: 'Tooth completely sealed. Zero sensitivity.',             healthScore: 79, cumulativeCost: 220,  painLevel: 0, severity: 'healthy', icon: '🌿' },
          { time: '1 year',   title: 'Tooth Fully Healthy',   desc: 'Normal bite and function. Filling intact.',              healthScore: 83, cumulativeCost: 220,  painLevel: 0, severity: 'healthy', icon: '⭐' },
          { time: '5 years',  title: 'Lasting Protection',    desc: 'Filling intact. Health score improved by 16 pts.',       healthScore: 85, cumulativeCost: 220,  painLevel: 0, severity: 'healthy', icon: '🏆' },
        ],
      },
    ],
  },
  {
    id: 'gum',
    name: 'Generalized Mild Periodontitis',
    plain: 'Early Gum Disease',
    toothId: '#25–27',
    scenarios: [
      {
        id: 'untreated',
        label: 'Without Treatment',
        tagline: 'What happens if we wait',
        accent: '#ff4757',
        stages: [
          { time: 'Today',    title: 'Mild Gingivitis',       desc: 'Gums bleed on brushing. Bacterial plaque below gumline.', healthScore: 58, cumulativeCost: 0, painLevel: 1, severity: 'start',    icon: '🦷' },
          { time: '6 months', title: 'Periodontitis Starts',  desc: 'Gum pockets deepen. Bone loss becomes measurable.',       healthScore: 47, cumulativeCost: 0, painLevel: 2, severity: 'moderate', icon: '⚠️' },
          { time: '1 year',   title: 'Deep Pockets',          desc: 'Pockets exceed 5mm. Roots exposed. Persistent bad breath.',healthScore: 33, cumulativeCost: 0, painLevel: 4, severity: 'severe',   icon: '😬' },
          { time: '2 years',  title: 'Teeth Become Loose',    desc: 'Bone support critically reduced. Teeth shift.',           healthScore: 20, cumulativeCost: 0, painLevel: 6, severity: 'critical', icon: '🔴' },
          { time: '5 years',  title: 'Multiple Extractions',  desc: 'Several teeth lost. Dentures or implants needed.',        healthScore: 10, cumulativeCost: 0, painLevel: 7, severity: 'critical', icon: '❌' },
        ],
      },
      {
        id: 'treated',
        label: 'With Early Treatment',
        tagline: 'Reversible at this stage',
        accent: '#00d4aa',
        stages: [
          { time: 'Today',    title: 'Gingivitis Detected',   desc: 'Caught early — still fully reversible at this stage.',   healthScore: 58, cumulativeCost: 0,   painLevel: 1, severity: 'start',   icon: '🦷' },
          { time: 'Weeks 1–2',title: 'Deep Cleaning',         desc: 'Scaling & root planing across 2 visits.',                healthScore: 65, cumulativeCost: 380, painLevel: 1, severity: 'healed',  icon: '✅', actionLabel: 'Deep Cleaning · $380' },
          { time: '3 months', title: 'Gums Reattach',         desc: 'Inflammation resolved. Pockets reduced to healthy range.',healthScore: 72, cumulativeCost: 380, painLevel: 0, severity: 'healthy', icon: '🌿' },
          { time: '1 year',   title: 'Bone Loss Halted',      desc: 'Regular maintenance keeps bacteria under control.',      healthScore: 79, cumulativeCost: 560, painLevel: 0, severity: 'healthy', icon: '⭐' },
          { time: '5 years',  title: 'Full Gum Health',       desc: 'Sustained health with quarterly cleanings.',             healthScore: 82, cumulativeCost: 880, painLevel: 0, severity: 'healthy', icon: '🏆' },
        ],
      },
    ],
  },
  {
    id: 'crack',
    name: 'Cracked Tooth Syndrome',
    plain: 'Cracked Tooth',
    toothId: '#19',
    scenarios: [
      {
        id: 'untreated',
        label: 'Without Treatment',
        tagline: 'Cracks only get worse',
        accent: '#ff4757',
        stages: [
          { time: 'Today',    title: 'Hairline Crack',        desc: 'Microscopic crack in enamel. Occasional sharp pain.',    healthScore: 71, cumulativeCost: 0, painLevel: 2, severity: 'start',    icon: '🦷' },
          { time: '3 months', title: 'Crack Propagates',      desc: 'Crack deepens into dentin. Pain becomes more frequent.', healthScore: 62, cumulativeCost: 0, painLevel: 4, severity: 'mild',     icon: '⚠️' },
          { time: '6 months', title: 'Cusp Fractures',        desc: 'A piece of the tooth breaks off. Jagged sharp edge.',    healthScore: 50, cumulativeCost: 0, painLevel: 6, severity: 'moderate', icon: '😬' },
          { time: '1 year',   title: 'Pulp Exposed',          desc: 'Crack reaches nerve. Extreme sensitivity and throbbing.', healthScore: 36, cumulativeCost: 0, painLevel: 8, severity: 'severe',   icon: '🔴' },
          { time: '2 years',  title: 'Unsalvageable',         desc: 'Tooth splits vertically. Extraction is the only option.', healthScore: 20, cumulativeCost: 0, painLevel: 9, severity: 'critical', icon: '❌' },
        ],
      },
      {
        id: 'treated',
        label: 'With Early Treatment',
        tagline: 'Protect it before it splits',
        accent: '#00d4aa',
        stages: [
          { time: 'Today',    title: 'Crack Detected',        desc: 'Transillumination confirms hairline crack in enamel.',   healthScore: 71, cumulativeCost: 0,    painLevel: 2, severity: 'start',   icon: '🦷' },
          { time: 'Week 1',   title: 'Crown Placed',          desc: 'Porcelain crown bonds the tooth, preventing propagation.', healthScore: 76, cumulativeCost: 1200, painLevel: 0, severity: 'healed', icon: '✅', actionLabel: 'Ceramic Crown · $1,200' },
          { time: '3 months', title: 'Tooth Fully Protected',  desc: 'Crown distributes bite force evenly. Zero pain.',        healthScore: 81, cumulativeCost: 1200, painLevel: 0, severity: 'healthy', icon: '🌿' },
          { time: '5 years',  title: 'Crown Intact',          desc: 'Tooth preserved for 10–15 years with normal care.',     healthScore: 84, cumulativeCost: 1200, painLevel: 0, severity: 'healthy', icon: '🏆' },
        ],
      },
    ],
  },
];

/* ─── severity styles ─── */
const SEV: Record<Stage['severity'], { bg: string; border: string; text: string; dot: string }> = {
  start:    { bg: 'var(--bg-card)',             border: 'var(--border)',           text: 'var(--text-primary)',  dot: 'var(--text-muted)' },
  mild:     { bg: 'rgba(255,165,2,0.07)',       border: 'rgba(255,165,2,0.25)',    text: '#ffa502',              dot: '#ffa502' },
  moderate: { bg: 'rgba(255,140,66,0.08)',      border: 'rgba(255,140,66,0.28)',   text: '#ff8c42',              dot: '#ff8c42' },
  severe:   { bg: 'rgba(255,71,87,0.1)',        border: 'rgba(255,71,87,0.3)',     text: '#ff4757',              dot: '#ff4757' },
  critical: { bg: 'rgba(255,71,87,0.18)',       border: 'rgba(255,71,87,0.5)',     text: '#ff4757',              dot: '#ff4757' },
  healed:   { bg: 'rgba(0,212,170,0.1)',        border: 'rgba(0,212,170,0.3)',     text: 'var(--accent)',        dot: 'var(--accent)' },
  healthy:  { bg: 'rgba(0,212,170,0.07)',       border: 'rgba(0,212,170,0.2)',     text: 'var(--accent)',        dot: 'var(--accent)' },
};

const PAIN_LABEL = ['None','Minimal','','Mild','','Moderate','','Significant','','Severe','Extreme'];

/* ─── sub-components ─── */
function ScoreRingMini({ score, color }: { score: number; color: string }) {
  const r = 18; const circ = 2 * Math.PI * r;
  return (
    <svg width="44" height="44" viewBox="0 0 44 44">
      <circle cx="22" cy="22" r={r} fill="none" stroke="var(--bg-card)" strokeWidth="4" />
      <motion.circle
        cx="22" cy="22" r={r} fill="none" stroke={color} strokeWidth="4"
        strokeLinecap="round" strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - (score / 100) * circ }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        transform="rotate(-90 22 22)"
      />
      <text x="22" y="26" textAnchor="middle" fontSize="10" fontWeight="700" fill={color}>{score}</text>
    </svg>
  );
}

function PainBar({ level, color }: { level: number; color: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-card)' }}>
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${level * 10}%` }}
          transition={{ duration: 0.5 }}
          style={{ background: level >= 7 ? '#ff4757' : level >= 4 ? '#ffa502' : color }}
        />
      </div>
      <span className="text-[10px] w-16" style={{ color: 'var(--text-muted)' }}>
        {PAIN_LABEL[level]}
      </span>
    </div>
  );
}

function StageCard({
  stage, index, isActive, isVisible, scenarioAccent, delay,
}: {
  stage: Stage; index: number; isActive: boolean; isVisible: boolean;
  scenarioAccent: string; delay: number;
}) {
  const s = SEV[stage.severity];
  const isUntreated = stage.severity === 'severe' || stage.severity === 'critical';

  return (
    <motion.div
      initial={{ opacity: 0, x: scenarioAccent === '#ff4757' ? -16 : 16 }}
      animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0.2, x: scenarioAccent === '#ff4757' ? -8 : 8 }}
      transition={{ duration: 0.4, delay: isVisible ? delay : 0 }}
      className="relative"
    >
      {/* connecting line to next */}
      {index > 0 && (
        <div className="absolute -top-4 left-5 w-px h-4" style={{ background: s.border }} />
      )}

      <motion.div
        animate={isActive ? { scale: 1.01 } : { scale: 1 }}
        transition={{ duration: 0.2 }}
        className="rounded-xl p-4 relative overflow-hidden"
        style={{
          background: s.bg,
          border: `1px solid ${isActive ? scenarioAccent + '80' : s.border}`,
          boxShadow: isActive ? `0 0 16px ${scenarioAccent}20` : 'none',
        }}
      >
        {/* active glow sweep */}
        {isActive && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 2 }}
            className="absolute inset-0 pointer-events-none"
            style={{ background: `linear-gradient(90deg, transparent, ${scenarioAccent}15, transparent)` }}
          />
        )}

        <div className="flex items-start gap-3">
          {/* severity indicator + time */}
          <div className="flex flex-col items-center gap-1 shrink-0">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: isActive ? `${scenarioAccent}20` : 'var(--bg-elevated)' }}
            >
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.dot, boxShadow: isActive ? `0 0 6px ${s.dot}` : 'none' }} />
            </div>
            <span
              className="text-[9px] font-mono text-center leading-tight"
              style={{ color: isActive ? scenarioAccent : 'var(--text-muted)', maxWidth: '40px' }}
            >
              {stage.time}
            </span>
          </div>

          {/* content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p
                className="text-sm font-semibold leading-tight"
                style={{ color: isActive ? s.text : 'var(--text-primary)' }}
              >
                {stage.title}
              </p>
              <ScoreRingMini score={stage.healthScore} color={isActive ? scenarioAccent : 'var(--text-muted)'} />
            </div>

            <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {stage.desc}
            </p>

            {stage.actionLabel && (
              <div
                className="mt-2 px-2 py-1 rounded-md text-[10px] font-medium inline-block"
                style={{ background: `${scenarioAccent}18`, color: scenarioAccent }}
              >
                ✓ {stage.actionLabel}
              </div>
            )}

            {stage.painLevel > 0 && (
              <div className="mt-2">
                <p className="text-[9px] uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>Pain</p>
                <PainBar level={stage.painLevel} color={scenarioAccent} />
              </div>
            )}

            {stage.cumulativeCost > 0 && (
              <div className="mt-1.5 flex items-center gap-1">
                <span className="text-[9px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Cost</span>
                <span className="text-xs font-mono font-medium" style={{ color: scenarioAccent }}>
                  ${stage.cumulativeCost.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── divergence chart ─── */
function DivergenceChart({
  diagnosis, activeStep,
}: {
  diagnosis: Diagnosis; activeStep: number;
}) {
  const unt = diagnosis.scenarios[0];
  const trt = diagnosis.scenarios[1];
  const maxStages = Math.max(unt.stages.length, trt.stages.length);
  const chartW = 320;
  const chartH = 120;
  const padX = 24;
  const padY = 12;
  const innerW = chartW - padX * 2;
  const innerH = chartH - padY * 2;

  const toY = (score: number) => padY + innerH - ((score - 0) / 100) * innerH;
  const toX = (i: number, total: number) => padX + (i / (total - 1)) * innerW;

  const untPoints = unt.stages.map((s, i) => ({ x: toX(i, unt.stages.length), y: toY(s.healthScore) }));
  const trtPoints = trt.stages.map((s, i) => ({ x: toX(i, trt.stages.length), y: toY(s.healthScore) }));

  const toPath = (pts: { x: number; y: number }[], limit: number) => {
    const visible = pts.slice(0, limit + 1);
    if (visible.length < 2) return '';
    return visible.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  };

  return (
    <div
      className="rounded-xl p-4"
      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
    >
      <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
        Health Score Divergence
      </p>
      <svg width={chartW} height={chartH} className="w-full" viewBox={`0 0 ${chartW} ${chartH}`}>
        {/* grid lines */}
        {[25, 50, 75, 100].map(v => (
          <line key={v} x1={padX} y1={toY(v)} x2={chartW - padX} y2={toY(v)}
            stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3,3" />
        ))}
        {[25, 50, 75, 100].map(v => (
          <text key={v} x={padX - 4} y={toY(v) + 3} textAnchor="end"
            fontSize="7" fill="var(--text-muted)" fontFamily="monospace">{v}</text>
        ))}

        {/* untreated path */}
        <motion.path
          d={toPath(untPoints, unt.stages.length - 1)}
          fill="none" stroke="#ff4757" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray="1000" strokeDashoffset="1000"
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: 1.2, delay: 0.3 }}
          opacity="0.5"
        />
        <motion.path
          d={toPath(untPoints, activeStep)}
          fill="none" stroke="#ff4757" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        />

        {/* treated path */}
        <motion.path
          d={toPath(trtPoints, trt.stages.length - 1)}
          fill="none" stroke="#00d4aa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray="1000" strokeDashoffset="1000"
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: 1.2, delay: 0.3 }}
          opacity="0.3"
        />
        <motion.path
          d={toPath(trtPoints, activeStep)}
          fill="none" stroke="#00d4aa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        />

        {/* dots */}
        {untPoints.slice(0, activeStep + 1).map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={i === activeStep ? 4 : 2.5}
            fill="#ff4757" opacity={i === activeStep ? 1 : 0.6} />
        ))}
        {trtPoints.slice(0, activeStep + 1).map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={i === activeStep ? 4 : 2.5}
            fill="#00d4aa" opacity={i === activeStep ? 1 : 0.6} />
        ))}

        {/* legend */}
        <circle cx={padX} cy={chartH - 4} r="3" fill="#ff4757" />
        <text x={padX + 6} y={chartH - 1} fontSize="7" fill="#ff4757" fontFamily="monospace">Untreated</text>
        <circle cx={padX + 72} cy={chartH - 4} r="3" fill="#00d4aa" />
        <text x={padX + 78} y={chartH - 1} fontSize="7" fill="#00d4aa" fontFamily="monospace">Treated</text>
      </svg>
    </div>
  );
}

/* ─── main component ─── */
export default function OralHealthSimulation() {
  const [selectedDxId, setSelectedDxId] = useState('cavity');
  const [activeStep, setActiveStep]     = useState(0);
  const [isPlaying, setIsPlaying]       = useState(false);
  const intervalRef                     = useRef<ReturnType<typeof setInterval> | null>(null);

  const diagnosis = DIAGNOSES.find(d => d.id === selectedDxId)!;
  const unt       = diagnosis.scenarios[0];
  const trt       = diagnosis.scenarios[1];
  const maxSteps  = Math.max(unt.stages.length, trt.stages.length) - 1;

  const stopPlay = useCallback(() => {
    setIsPlaying(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const startPlay = useCallback(() => {
    setIsPlaying(true);
    intervalRef.current = setInterval(() => {
      setActiveStep(prev => {
        if (prev >= maxSteps) { stopPlay(); return prev; }
        return prev + 1;
      });
    }, 1600);
  }, [maxSteps, stopPlay]);

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  // reset on diagnosis change
  useEffect(() => {
    stopPlay();
    setActiveStep(0);
  }, [selectedDxId, stopPlay]);

  const togglePlay = () => {
    if (isPlaying) { stopPlay(); return; }
    if (activeStep >= maxSteps) setActiveStep(0);
    startPlay();
  };

  const untCurrent = unt.stages[Math.min(activeStep, unt.stages.length - 1)];
  const trtCurrent = trt.stages[Math.min(activeStep, trt.stages.length - 1)];

  return (
    <div className="h-full flex flex-col gap-0 overflow-hidden">

      {/* ── top bar ── */}
      <div
        className="shrink-0 flex items-center justify-between px-6 py-4 border-b"
        style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}
      >
        <div>
          <h1 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            Oral Health Future Simulation
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Show patients the two possible futures — let the evidence speak
          </p>
        </div>

        {/* diagnosis tabs */}
        <div className="flex items-center gap-1">
          {DIAGNOSES.map(d => (
            <button
              key={d.id}
              onClick={() => setSelectedDxId(d.id)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: selectedDxId === d.id ? 'var(--accent-dim)' : 'var(--bg-elevated)',
                color: selectedDxId === d.id ? 'var(--accent)' : 'var(--text-secondary)',
                border: `1px solid ${selectedDxId === d.id ? 'var(--accent-glow)' : 'var(--border)'}`,
              }}
            >
              {d.plain}
            </button>
          ))}
        </div>
      </div>

      {/* ── playhead control bar ── */}
      <div
        className="shrink-0 flex items-center gap-5 px-6 py-3 border-b"
        style={{ borderColor: 'var(--border)', background: 'var(--bg-elevated)' }}
      >
        {/* play/pause */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={togglePlay}
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: isPlaying ? 'var(--accent)' : 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          {isPlaying ? (
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4" style={{ color: '#000' }}>
              <rect x="3" y="2" width="4" height="12" rx="1" />
              <rect x="9" y="2" width="4" height="12" rx="1" />
            </svg>
          ) : (
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4" style={{ color: 'var(--accent)' }}>
              <path d="M4 2l10 6-10 6V2z" />
            </svg>
          )}
        </motion.button>

        {/* timeline scrubber */}
        <div className="flex-1 flex flex-col gap-1">
          <div className="relative h-2 rounded-full cursor-pointer" style={{ background: 'var(--bg-card)' }}
            onClick={e => {
              const r = e.currentTarget.getBoundingClientRect();
              const pct = (e.clientX - r.left) / r.width;
              setActiveStep(Math.round(pct * maxSteps));
              stopPlay();
            }}
          >
            <motion.div
              className="absolute left-0 top-0 h-full rounded-full"
              animate={{ width: `${(activeStep / maxSteps) * 100}%` }}
              transition={{ duration: 0.3 }}
              style={{ background: 'linear-gradient(90deg, var(--accent), #00a882)' }}
            />
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white"
              animate={{ left: `calc(${(activeStep / maxSteps) * 100}% - 8px)` }}
              transition={{ duration: 0.3 }}
              style={{ background: 'var(--accent)', boxShadow: '0 0 10px var(--accent-glow)' }}
            />
          </div>
          <div className="flex justify-between">
            <span className="text-[9px] font-mono" style={{ color: 'var(--text-muted)' }}>Today</span>
            <span className="text-[9px] font-mono" style={{ color: 'var(--text-muted)' }}>
              {activeStep === 0 ? 'Drag to simulate time →' :
               activeStep === maxSteps ? 'End of simulation' :
               `Step ${activeStep} of ${maxSteps}`}
            </span>
            <span className="text-[9px] font-mono" style={{ color: 'var(--text-muted)' }}>5 years</span>
          </div>
        </div>

        {/* step buttons */}
        <div className="flex gap-1">
          <button
            onClick={() => { stopPlay(); setActiveStep(s => Math.max(0, s - 1)); }}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
          >‹</button>
          <button
            onClick={() => { stopPlay(); setActiveStep(s => Math.min(maxSteps, s + 1)); }}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
          >›</button>
          <button
            onClick={() => { stopPlay(); setActiveStep(0); }}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
          >↺</button>
        </div>

        {/* current time label */}
        <div className="text-right shrink-0">
          <p className="text-[9px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Simulating</p>
          <p className="text-sm font-medium font-mono" style={{ color: 'var(--accent)' }}>
            {unt.stages[Math.min(activeStep, unt.stages.length - 1)].time}
          </p>
        </div>
      </div>

      {/* ── main body ── */}
      <div className="flex-1 overflow-hidden flex gap-0">

        {/* ── scenario columns ── */}
        {[unt, trt].map(scenario => {
          const current = scenario.stages[Math.min(activeStep, scenario.stages.length - 1)];
          return (
            <div
              key={scenario.id}
              className="flex-1 flex flex-col overflow-hidden border-r"
              style={{ borderColor: 'var(--border)' }}
            >
              {/* column header */}
              <div
                className="shrink-0 px-5 py-3 flex items-center justify-between border-b"
                style={{
                  borderColor: 'var(--border)',
                  background: `${scenario.accent}08`,
                }}
              >
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: scenario.accent }}>
                    {scenario.label}
                  </p>
                  <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                    {scenario.tagline}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-[9px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Score</p>
                    <motion.p
                      key={current.healthScore}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-xl font-bold font-mono"
                      style={{ color: scenario.accent }}
                    >
                      {current.healthScore}
                    </motion.p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Total cost</p>
                    <motion.p
                      key={current.cumulativeCost}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-sm font-bold font-mono"
                      style={{ color: current.cumulativeCost > 0 ? scenario.accent : 'var(--text-muted)' }}
                    >
                      ${current.cumulativeCost.toLocaleString()}
                    </motion.p>
                  </div>
                </div>
              </div>

              {/* stages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                {scenario.stages.map((stage, i) => (
                  <StageCard
                    key={i}
                    stage={stage}
                    index={i}
                    isActive={i === Math.min(activeStep, scenario.stages.length - 1)}
                    isVisible={i <= Math.min(activeStep, scenario.stages.length - 1)}
                    scenarioAccent={scenario.accent}
                    delay={i * 0.08}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {/* ── right panel ── */}
        <div className="w-72 shrink-0 flex flex-col gap-4 p-4 overflow-y-auto">

          {/* divergence chart */}
          <DivergenceChart diagnosis={diagnosis} activeStep={activeStep} />

          {/* comparison at current step */}
          <div
            className="rounded-xl p-4 space-y-3"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
              At This Point
            </p>
            {[
              { label: 'Health Score', untVal: untCurrent.healthScore, trtVal: trtCurrent.healthScore, unit: '', higher: true },
              { label: 'Pain Level', untVal: untCurrent.painLevel, trtVal: trtCurrent.painLevel, unit: '/10', higher: false },
              { label: 'Cumul. Cost', untVal: untCurrent.cumulativeCost, trtVal: trtCurrent.cumulativeCost, unit: '$', higher: false },
            ].map(row => (
              <div key={row.label}>
                <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>
                  {row.label}
                </p>
                <div className="flex items-center justify-between">
                  <span
                    className="text-sm font-mono font-bold"
                    style={{ color: '#ff4757' }}
                  >
                    {row.unit === '$' ? `$${row.untVal.toLocaleString()}` : `${row.untVal}${row.unit}`}
                  </span>
                  <div className="flex-1 mx-2 h-px" style={{ background: 'var(--border)' }} />
                  <span
                    className="text-sm font-mono font-bold"
                    style={{ color: 'var(--accent)' }}
                  >
                    {row.unit === '$' ? `$${row.trtVal.toLocaleString()}` : `${row.trtVal}${row.unit}`}
                  </span>
                </div>
                <div className="flex justify-between mt-0.5">
                  <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Untreated</span>
                  <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Treated</span>
                </div>
              </div>
            ))}
          </div>

          {/* bottom summary */}
          <AnimatePresence>
            {activeStep >= maxSteps && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                className="rounded-xl p-4"
                style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent-glow)' }}
              >
                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--accent)' }}>
                  The difference
                </p>
                {(() => {
                  const untFinal = unt.stages[unt.stages.length - 1];
                  const trtFinal = trt.stages[trt.stages.length - 1];
                  return (
                    <div className="space-y-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      <p>
                        Health score: <span style={{ color: '#ff4757' }}>↓ {untFinal.healthScore}</span>
                        {' vs '}
                        <span style={{ color: 'var(--accent)' }}>↑ {trtFinal.healthScore}</span>
                      </p>
                      <p>
                        Cost: <span style={{ color: '#ff4757' }}>${untFinal.cumulativeCost.toLocaleString()} (delayed emergency)</span>
                        {' vs '}
                        <span style={{ color: 'var(--accent)' }}>${trtFinal.cumulativeCost.toLocaleString()} (early treatment)</span>
                      </p>
                      <p>
                        Pain: <span style={{ color: '#ff4757' }}>{untFinal.painLevel}/10</span>
                        {' vs '}
                        <span style={{ color: 'var(--accent)' }}>{trtFinal.painLevel}/10</span>
                      </p>
                    </div>
                  );
                })()}
              </motion.div>
            )}
          </AnimatePresence>

          {/* instruction card */}
          <div
            className="rounded-xl p-3 text-xs space-y-1.5"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
          >
            {[
              ['▶ Play',   'Auto-advance timeline'],
              ['‹ ›',      'Step forward / backward'],
              ['↺',        'Reset to start'],
              ['Drag bar', 'Jump to any point in time'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="font-mono" style={{ color: 'var(--text-muted)' }}>{k}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
