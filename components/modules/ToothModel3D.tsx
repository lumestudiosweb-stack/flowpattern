'use client';

import { Suspense, useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── types ─── */
type HighlightZone = 'infection' | 'decay' | 'recession';
type ViewMode = 'full' | 'cross-section';
type ActiveLabel = 'enamel' | 'dentin' | 'pulp' | 'root' | null;

interface ToothConfig {
  highlights: Set<HighlightZone>;
  crossSection: boolean;
  labeledLayer: ActiveLabel;
}

/* ─── helpers ─── */
const HIGHLIGHT_META: Record<HighlightZone, { color: string; hex: number; label: string; desc: string }> = {
  infection: { color: '#ff4757', hex: 0xff4757, label: 'Infection / Abscess', desc: 'Active bacterial infection at the root apex' },
  decay:     { color: '#ffa502', hex: 0xffa502, label: 'Carious Decay',       desc: 'Demineralised enamel/dentin — cavity present'   },
  recession: { color: '#4a9eff', hex: 0x4a9eff, label: 'Gum Recession',       desc: 'Exposed root surface due to gum tissue loss'    },
};

const LAYER_META = {
  enamel: { color: '#e8e8e0', label: 'Enamel',  desc: 'Hardest tissue — protects the crown' },
  dentin: { color: '#f5d48a', label: 'Dentin',  desc: 'Porous layer beneath enamel, sensitive to stimuli' },
  pulp:   { color: '#e87878', label: 'Pulp',    desc: 'Vascular core containing nerves and blood vessels' },
  root:   { color: '#c8a870', label: 'Cementum / Root', desc: 'Anchors tooth to alveolar bone via periodontal ligament' },
};

/* ─── geometry builders ─── */
function buildToothProfile(scale = 1): THREE.Vector2[] {
  return [
    new THREE.Vector2(0.00 * scale, 2.60 * scale),   // cusp apex
    new THREE.Vector2(0.12 * scale, 2.45 * scale),
    new THREE.Vector2(0.42 * scale, 2.00 * scale),
    new THREE.Vector2(0.64 * scale, 1.40 * scale),
    new THREE.Vector2(0.70 * scale, 0.75 * scale),
    new THREE.Vector2(0.65 * scale, 0.15 * scale),
    new THREE.Vector2(0.50 * scale, -0.20 * scale),  // cervix
    new THREE.Vector2(0.38 * scale, -0.65 * scale),
    new THREE.Vector2(0.30 * scale, -1.30 * scale),
    new THREE.Vector2(0.20 * scale, -2.00 * scale),
    new THREE.Vector2(0.08 * scale, -2.50 * scale),
    new THREE.Vector2(0.00 * scale, -2.65 * scale),  // root apex
  ];
}

function buildDentinProfile(scale = 1): THREE.Vector2[] {
  return [
    new THREE.Vector2(0.00 * scale, 2.20 * scale),
    new THREE.Vector2(0.08 * scale, 2.08 * scale),
    new THREE.Vector2(0.28 * scale, 1.75 * scale),
    new THREE.Vector2(0.44 * scale, 1.20 * scale),
    new THREE.Vector2(0.48 * scale, 0.65 * scale),
    new THREE.Vector2(0.44 * scale, 0.10 * scale),
    new THREE.Vector2(0.33 * scale, -0.22 * scale),
    new THREE.Vector2(0.25 * scale, -0.68 * scale),
    new THREE.Vector2(0.18 * scale, -1.35 * scale),
    new THREE.Vector2(0.10 * scale, -1.90 * scale),
    new THREE.Vector2(0.03 * scale, -2.30 * scale),
    new THREE.Vector2(0.00 * scale, -2.40 * scale),
  ];
}

function buildPulpProfile(scale = 1): THREE.Vector2[] {
  return [
    new THREE.Vector2(0.00 * scale, 1.80 * scale),
    new THREE.Vector2(0.05 * scale, 1.65 * scale),
    new THREE.Vector2(0.18 * scale, 1.25 * scale),
    new THREE.Vector2(0.26 * scale, 0.70 * scale),
    new THREE.Vector2(0.28 * scale, 0.10 * scale),
    new THREE.Vector2(0.22 * scale, -0.30 * scale),
    new THREE.Vector2(0.15 * scale, -0.80 * scale),
    new THREE.Vector2(0.08 * scale, -1.40 * scale),
    new THREE.Vector2(0.02 * scale, -1.80 * scale),
    new THREE.Vector2(0.00 * scale, -1.90 * scale),
  ];
}

/* ─── 3D tooth scene ─── */
function ToothScene({ config, onLayerClick }: { config: ToothConfig; onLayerClick: (l: ActiveLabel) => void }) {
  const groupRef   = useRef<THREE.Group>(null);
  const { gl }     = useThree();

  useEffect(() => { gl.localClippingEnabled = true; }, [gl]);

  const clipPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(1, 0, 0), 0), []);
  const planes    = config.crossSection ? [clipPlane] : [];

  /* geometries */
  const enamelGeo  = useMemo(() => new THREE.LatheGeometry(buildToothProfile(1),  48), []);
  const dentinGeo  = useMemo(() => new THREE.LatheGeometry(buildDentinProfile(1), 48), []);
  const pulpGeo    = useMemo(() => new THREE.LatheGeometry(buildPulpProfile(1),   36), []);

  /* second root geometry (mesial) */
  const root2Geo = useMemo(() => {
    const g = new THREE.CylinderGeometry(0.18, 0.06, 1.4, 20);
    return g;
  }, []);

  /* highlight zones */
  const infectionGeo = useMemo(() => new THREE.SphereGeometry(0.28, 16, 16), []);
  const decay1Geo    = useMemo(() => new THREE.SphereGeometry(0.22, 14, 14), []);
  const decay2Geo    = useMemo(() => new THREE.SphereGeometry(0.18, 12, 12), []);
  const recessionGeo = useMemo(() => new THREE.TorusGeometry(0.54, 0.08, 10, 48), []);

  /* slow auto-rotate when idle */
  useFrame((_, dt) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += dt * 0.15;
    }
  });

  const isHL = (z: HighlightZone) => config.highlights.has(z);

  return (
    <group ref={groupRef} position={[0, 0.2, 0]}>
      {/* ── enamel (outer shell) ── */}
      <mesh
        geometry={enamelGeo}
        onClick={() => onLayerClick('enamel')}
        renderOrder={1}
      >
        <meshPhysicalMaterial
          color={config.labeledLayer === 'enamel' ? '#a8d8ea' : '#ddddd5'}
          roughness={0.15}
          metalness={0.0}
          transmission={config.crossSection ? 0.0 : 0.06}
          thickness={0.4}
          side={config.crossSection ? THREE.DoubleSide : THREE.FrontSide}
          clippingPlanes={planes}
          transparent
          opacity={config.crossSection ? 0.82 : 1.0}
        />
      </mesh>

      {/* ── dentin (visible in cross-section) ── */}
      {config.crossSection && (
        <mesh geometry={dentinGeo} onClick={() => onLayerClick('dentin')} renderOrder={2}>
          <meshPhongMaterial
            color={config.labeledLayer === 'dentin' ? '#f0c060' : '#e8c878'}
            shininess={30}
            side={THREE.DoubleSide}
            clippingPlanes={planes}
          />
        </mesh>
      )}

      {/* ── pulp (visible in cross-section) ── */}
      {config.crossSection && (
        <mesh geometry={pulpGeo} onClick={() => onLayerClick('pulp')} renderOrder={3}>
          <meshPhongMaterial
            color={config.labeledLayer === 'pulp' ? '#ff8888' : '#d46060'}
            shininess={60}
            side={THREE.DoubleSide}
            clippingPlanes={planes}
          />
        </mesh>
      )}

      {/* ── second root (mesial) ── */}
      <mesh
        geometry={root2Geo}
        position={[0.22, -2.7, 0.10]}
        rotation={[0.2, 0, 0.2]}
        onClick={() => onLayerClick('root')}
      >
        <meshPhongMaterial
          color={config.labeledLayer === 'root' ? '#d4a860' : '#b89050'}
          shininess={20}
          side={config.crossSection ? THREE.DoubleSide : THREE.FrontSide}
          clippingPlanes={planes}
        />
      </mesh>

      {/* ── highlight: infection (root apex) ── */}
      <AnimatedHighlight
        show={isHL('infection')}
        geometry={infectionGeo}
        color={0xff4757}
        position={[0, -2.6, 0]}
        pulseSpeed={2.2}
      />

      {/* ── highlight: decay (crown surface patches) ── */}
      <AnimatedHighlight
        show={isHL('decay')}
        geometry={decay1Geo}
        color={0xffa502}
        position={[0.46, 1.6, 0.15]}
        pulseSpeed={1.6}
      />
      <AnimatedHighlight
        show={isHL('decay')}
        geometry={decay2Geo}
        color={0xffa502}
        position={[-0.32, 1.9, 0.28]}
        pulseSpeed={1.8}
      />

      {/* ── highlight: recession (cervical ring) ── */}
      <AnimatedHighlight
        show={isHL('recession')}
        geometry={recessionGeo}
        color={0x4a9eff}
        position={[0, -0.18, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        pulseSpeed={1.4}
      />

      {/* cross-section cut plane indicator */}
      {config.crossSection && (
        <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <planeGeometry args={[5.6, 5.6]} />
          <meshBasicMaterial color="#00d4aa" transparent opacity={0.04} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

/* animated highlight sphere/ring */
function AnimatedHighlight({
  show, geometry, color, position, rotation, pulseSpeed,
}: {
  show: boolean;
  geometry: THREE.BufferGeometry;
  color: number;
  position: [number, number, number];
  rotation?: [number, number, number];
  pulseSpeed: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!meshRef.current || !show) return;
    const t = clock.getElapsedTime() * pulseSpeed;
    (meshRef.current.material as THREE.MeshBasicMaterial).opacity =
      0.45 + Math.sin(t) * 0.3;
    const s = 1 + Math.sin(t * 0.7) * 0.06;
    meshRef.current.scale.setScalar(s);
  });

  if (!show) return null;

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      position={position}
      rotation={rotation as THREE.Euler | undefined}
    >
      <meshBasicMaterial color={color} transparent opacity={0.6} depthWrite={false} />
    </mesh>
  );
}

/* ─── main export ─── */
export default function ToothModel3D() {
  const [config, setConfig] = useState<ToothConfig>({
    highlights: new Set(),
    crossSection: false,
    labeledLayer: null,
  });
  const [activeInfo, setActiveInfo] = useState<{ title: string; desc: string; color: string } | null>(null);

  const toggleHighlight = (zone: HighlightZone) => {
    setConfig(prev => {
      const next = new Set(prev.highlights);
      if (next.has(zone)) {
        next.delete(zone);
        setActiveInfo(null);
      } else {
        next.add(zone);
        setActiveInfo({ title: HIGHLIGHT_META[zone].label, desc: HIGHLIGHT_META[zone].desc, color: HIGHLIGHT_META[zone].color });
      }
      return { ...prev, highlights: next };
    });
  };

  const handleLayerClick = (layer: ActiveLabel) => {
    setConfig(prev => ({ ...prev, labeledLayer: prev.labeledLayer === layer ? null : layer }));
    if (layer && LAYER_META[layer]) {
      const m = LAYER_META[layer];
      setActiveInfo({ title: m.label, desc: m.desc, color: '#00d4aa' });
    }
  };

  return (
    <div className="h-full flex gap-4 p-6 overflow-hidden">

      {/* ── 3D canvas ── */}
      <div className="flex-1 flex flex-col gap-3 min-w-0">
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
              Interactive 3D Tooth Model
            </h1>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Drag to rotate · Scroll to zoom · Click surfaces to identify layers
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="px-2 py-1 rounded text-[10px] font-mono"
              style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
            >
              Upper Central Incisor · #8
            </span>
            {config.crossSection && (
              <span
                className="px-2 py-1 rounded text-[10px] font-medium"
                style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--accent-glow)' }}
              >
                CROSS-SECTION
              </span>
            )}
          </div>
        </div>

        <div
          className="flex-1 rounded-xl overflow-hidden relative"
          style={{ background: '#0a0f0d', border: '1px solid var(--border)' }}
        >
          {/* grid bg hint */}
          <div className="absolute inset-0 grid-bg opacity-15 pointer-events-none" />

          <Canvas
            camera={{ position: [0, 1, 7], fov: 35 }}
            gl={{ antialias: true, localClippingEnabled: true }}
            shadows
          >
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow />
            <pointLight position={[-4, 3, 3]} intensity={0.5} color="#a0e8ff" />
            <pointLight position={[3, -2, 4]} intensity={0.3} color="#ffe0a0" />

            <Suspense fallback={null}>
              <ToothScene config={config} onLayerClick={handleLayerClick} />
              <ContactShadows position={[0, -3.4, 0]} opacity={0.35} scale={6} blur={2} far={5} />
              <Environment preset="city" />
            </Suspense>

            <OrbitControls
              enablePan={false}
              minDistance={3}
              maxDistance={14}
              autoRotate={false}
              enableDamping
              dampingFactor={0.06}
            />
          </Canvas>

          {/* floating info card */}
          <AnimatePresence>
            {activeInfo && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="absolute bottom-4 left-4 rounded-xl px-4 py-3 flex items-center gap-3"
                style={{ background: 'var(--bg-elevated)', border: `1px solid ${activeInfo.color}40` }}
              >
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: activeInfo.color, boxShadow: `0 0 8px ${activeInfo.color}` }} />
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{activeInfo.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{activeInfo.desc}</p>
                </div>
                <button className="ml-2" onClick={() => setActiveInfo(null)} style={{ color: 'var(--text-muted)' }}>✕</button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* corner label */}
          <div className="absolute top-3 left-3 text-[9px] font-mono tracking-widest pointer-events-none" style={{ color: 'rgba(0,212,170,0.35)' }}>
            THREE.JS · REAL-TIME
          </div>
        </div>
      </div>

      {/* ── right controls ── */}
      <div className="w-64 flex flex-col gap-4">

        {/* cross-section */}
        <div className="rounded-xl p-4" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
          <h3 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
            View Mode
          </h3>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setConfig(prev => ({ ...prev, crossSection: !prev.crossSection, labeledLayer: null }))}
            className="w-full flex items-center justify-between p-3 rounded-lg transition-all"
            style={{
              background: config.crossSection ? 'var(--accent-dim)' : 'var(--bg-card)',
              border: `1px solid ${config.crossSection ? 'var(--accent-glow)' : 'var(--border-subtle)'}`,
            }}
          >
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4" style={{ color: config.crossSection ? 'var(--accent)' : 'var(--text-muted)' }}>
                <circle cx="10" cy="10" r="8" />
                <line x1="10" y1="2" x2="10" y2="18" strokeDasharray="2,1.5" />
                <path d="M10 6 C12 6 14 8 14 10 C14 12 12 14 10 14" fill="currentColor" fillOpacity="0.15" />
              </svg>
              <span className="text-sm" style={{ color: config.crossSection ? 'var(--accent)' : 'var(--text-secondary)' }}>
                Cross-Section
              </span>
            </div>
            <div className="w-8 h-4 rounded-full relative" style={{ background: config.crossSection ? 'var(--accent)' : 'var(--border)' }}>
              <motion.div
                animate={{ x: config.crossSection ? 16 : 2 }}
                className="absolute top-0.5 w-3 h-3 bg-white rounded-full"
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              />
            </div>
          </motion.button>
          {config.crossSection && (
            <p className="text-[10px] mt-2 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Click enamel, dentin, or pulp layers to identify them for the patient.
            </p>
          )}
        </div>

        {/* highlight zones */}
        <div className="rounded-xl p-4 space-y-2" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
          <h3 className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>
            Highlight Zones
          </h3>
          {(Object.keys(HIGHLIGHT_META) as HighlightZone[]).map(zone => {
            const m    = HIGHLIGHT_META[zone];
            const isOn = config.highlights.has(zone);
            return (
              <motion.button
                key={zone}
                whileTap={{ scale: 0.97 }}
                onClick={() => toggleHighlight(zone)}
                className="w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all"
                style={{
                  background: isOn ? `${m.color}18` : 'var(--bg-card)',
                  border: `1px solid ${isOn ? m.color + '55' : 'var(--border-subtle)'}`,
                }}
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{
                    background: m.color,
                    boxShadow: isOn ? `0 0 8px ${m.color}` : 'none',
                  }}
                />
                <div className="flex-1">
                  <p className="text-xs font-medium" style={{ color: isOn ? m.color : 'var(--text-secondary)' }}>
                    {m.label}
                  </p>
                  <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{m.desc}</p>
                </div>
                {isOn && (
                  <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: m.color }} />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* tooth layers legend */}
        <div className="rounded-xl p-4 space-y-2" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
          <h3 className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>
            Tooth Anatomy
          </h3>
          {(Object.keys(LAYER_META) as (keyof typeof LAYER_META)[]).map(key => {
            const m       = LAYER_META[key];
            const isLabel = config.labeledLayer === key;
            return (
              <div key={key} className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-sm flex-shrink-0"
                  style={{
                    background: m.color,
                    boxShadow: isLabel ? `0 0 6px ${m.color}` : 'none',
                  }}
                />
                <div>
                  <span className="text-xs font-medium" style={{ color: isLabel ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                    {m.label}
                  </span>
                  {isLabel && (
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{m.desc}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* usage hint */}
        <div
          className="rounded-xl p-3 text-xs space-y-1.5"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
        >
          {[
            ['Drag', 'Rotate model'],
            ['Scroll', 'Zoom in / out'],
            ['Click surface', 'Identify layer'],
            ['Cross-section', 'Reveal internals'],
          ].map(([key, val]) => (
            <div key={key} className="flex justify-between">
              <span className="font-mono" style={{ color: 'var(--text-muted)' }}>{key}</span>
              <span style={{ color: 'var(--text-secondary)' }}>{val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
