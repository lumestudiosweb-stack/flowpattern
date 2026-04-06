'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockScanAnnotations } from '@/lib/mockData';

/* ─── types ─── */
type OverlayTool = 'infection' | 'decay' | 'recession' | 'eraser';
type LayerId = 'anatomy' | 'findings' | 'heatmap' | 'ruler';

interface DrawnStroke {
  points: { x: number; y: number }[];
  color: string;
  lineWidth: number;
  tool: OverlayTool;
}

/* ─── constants ─── */
const OVERLAY_TOOLS: { id: OverlayTool; label: string; color: string; hex: string; desc: string }[] = [
  { id: 'infection', label: 'Infection', color: 'bg-red-500',    hex: '#ff4757', desc: 'Red — active infection or abscess' },
  { id: 'decay',     label: 'Decay',     color: 'bg-yellow-400', hex: '#ffa502', desc: 'Yellow — carious lesion / decay' },
  { id: 'recession', label: 'Recession', color: 'bg-blue-400',   hex: '#4a9eff', desc: 'Blue — gum recession area' },
  { id: 'eraser',    label: 'Eraser',    color: 'bg-zinc-600',   hex: '#555555', desc: 'Erase overlay marks' },
];

const SVG_LAYERS = [
  { id: 'anatomy'  as LayerId, label: 'Anatomy Guide',      color: '#4a9eff', defaultOn: true  },
  { id: 'findings' as LayerId, label: 'Finding Highlights', color: '#ffa502', defaultOn: true  },
  { id: 'heatmap'  as LayerId, label: 'AI Heatmap',         color: '#00d4aa', defaultOn: false },
  { id: 'ruler'    as LayerId, label: 'Measurements',       color: '#888888', defaultOn: false },
];

const SEV_STYLE: Record<string, { border: string; bg: string; dot: string }> = {
  critical: { border: '#ff4757', bg: 'rgba(255,71,87,0.18)',  dot: '#ff4757' },
  concern:  { border: '#ffa502', bg: 'rgba(255,165,2,0.15)', dot: '#ffa502' },
  watch:    { border: '#4a9eff', bg: 'rgba(74,158,255,0.12)', dot: '#4a9eff' },
  note:     { border: '#555',    bg: 'rgba(80,80,80,0.15)',  dot: '#888'    },
};

/* ─── sub-components ─── */
function ToothSVG({ x, y, width, height }: { x: number; y: number; width: number; height: number }) {
  return (
    <ellipse
      cx={`${x}%`} cy={`${y}%`}
      rx={`${width / 2}%`} ry={`${height / 2}%`}
      fill="rgba(200,200,200,0.1)"
      stroke="rgba(200,200,200,0.22)"
      strokeWidth="0.7"
    />
  );
}

/* ─── main component ─── */
export default function ScanViewer() {
  /* upload */
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging]       = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* drawing */
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const [activeTool, setActiveTool] = useState<OverlayTool>('infection');
  const [brushSize,  setBrushSize]  = useState(8);
  const [opacity,    setOpacity]    = useState(0.55);
  const [strokes,    setStrokes]    = useState<DrawnStroke[]>([]);
  const currentStroke = useRef<DrawnStroke | null>(null);
  const isDrawing     = useRef(false);

  /* svg layers / annotations */
  const [activeLayers, setActiveLayers] = useState<Record<LayerId, boolean>>(
    Object.fromEntries(SVG_LAYERS.map(l => [l.id, l.defaultOn])) as Record<LayerId, boolean>
  );
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);

  /* ── canvas helpers ── */
  const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const r = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const redrawCanvas = useCallback((extraStroke?: DrawnStroke) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const all = extraStroke ? [...strokes, extraStroke] : strokes;
    for (const stroke of all) {
      if (stroke.points.length < 2) continue;
      ctx.save();
      if (stroke.tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.globalAlpha = 1;
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = opacity;
      }
      ctx.strokeStyle  = stroke.color;
      ctx.lineWidth    = stroke.lineWidth;
      ctx.lineCap      = 'round';
      ctx.lineJoin     = 'round';
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
      ctx.restore();
    }
  }, [strokes, opacity]);

  useEffect(() => { redrawCanvas(); }, [redrawCanvas]);

  /* resize canvas to match container */
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const resize = () => {
      if (!canvasRef.current || !containerRef.current) return;
      canvasRef.current.width  = containerRef.current.offsetWidth;
      canvasRef.current.height = containerRef.current.offsetHeight;
      redrawCanvas();
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [redrawCanvas]);

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDrawing.current = true;
    const tool = OVERLAY_TOOLS.find(t => t.id === activeTool)!;
    currentStroke.current = {
      points: [getPos(e)],
      color: tool.hex,
      lineWidth: activeTool === 'eraser' ? brushSize * 3 : brushSize,
      tool: activeTool,
    };
  };

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || !currentStroke.current) return;
    currentStroke.current.points.push(getPos(e));
    redrawCanvas(currentStroke.current);
  };

  const onMouseUp = () => {
    if (!isDrawing.current || !currentStroke.current) return;
    isDrawing.current = false;
    setStrokes(prev => [...prev, currentStroke.current!]);
    currentStroke.current = null;
  };

  /* ── upload handlers ── */
  const loadFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = e => setUploadedImage(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) loadFile(file);
  };

  const clearCanvas = () => {
    setStrokes([]);
    const canvas = canvasRef.current;
    if (canvas) canvas.getContext('2d')!.clearRect(0, 0, canvas.width, canvas.height);
  };

  const toggleLayer = (id: LayerId) =>
    setActiveLayers(prev => ({ ...prev, [id]: !prev[id] }));

  const scanTeeth = [
    { x: 12, y: 32, width: 8, height: 14 }, { x: 21, y: 30, width: 8, height: 16 },
    { x: 30, y: 28, width: 8, height: 16 }, { x: 39, y: 27, width: 9, height: 18 },
    { x: 49, y: 27, width: 9, height: 18 }, { x: 59, y: 27, width: 9, height: 18 },
    { x: 69, y: 28, width: 8, height: 16 }, { x: 78, y: 30, width: 8, height: 14 },
    { x: 12, y: 68, width: 8, height: 14 }, { x: 21, y: 70, width: 8, height: 16 },
    { x: 30, y: 72, width: 8, height: 16 }, { x: 39, y: 73, width: 9, height: 18 },
    { x: 49, y: 73, width: 9, height: 18 }, { x: 59, y: 73, width: 9, height: 18 },
    { x: 69, y: 72, width: 8, height: 16 }, { x: 78, y: 70, width: 8, height: 14 },
  ];

  const currentToolInfo = OVERLAY_TOOLS.find(t => t.id === activeTool)!;

  return (
    <div className="h-full flex gap-4 p-6 overflow-hidden">

      {/* ── main canvas area ── */}
      <div className="flex-1 flex flex-col gap-3 min-w-0">

        {/* toolbar */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
              Scan Overlay Visualization
            </h1>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {uploadedImage ? 'Uploaded scan — draw overlays with tools below' : 'Panoramic X-ray · Mock · DR-7 System'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* zoom */}
            {[0.8, 1, 1.25, 1.5].map(z => (
              <button
                key={z}
                onClick={() => setZoom(z)}
                className="px-2 py-1 rounded text-xs font-mono transition-all"
                style={{
                  background: zoom === z ? 'var(--accent-dim)' : 'var(--bg-elevated)',
                  color: zoom === z ? 'var(--accent)' : 'var(--text-muted)',
                  border: `1px solid ${zoom === z ? 'var(--accent-glow)' : 'var(--border)'}`,
                }}
              >
                {z}×
              </button>
            ))}
            {/* upload button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all"
              style={{ background: 'var(--accent)', color: '#000' }}
            >
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3.5 h-3.5">
                <path d="M8 11V3M5 6l3-3 3 3M2 13h12" />
              </svg>
              Upload Scan
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) loadFile(f); }}
            />
          </div>
        </div>

        {/* ── overlay drawing tools ── */}
        <div
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
        >
          <span className="text-[10px] uppercase tracking-widest shrink-0" style={{ color: 'var(--text-muted)' }}>
            Overlay
          </span>
          <div className="flex gap-1">
            {OVERLAY_TOOLS.map(tool => (
              <motion.button
                key={tool.id}
                whileTap={{ scale: 0.92 }}
                onClick={() => setActiveTool(tool.id)}
                title={tool.desc}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: activeTool === tool.id ? (tool.id === 'eraser' ? 'var(--bg-card)' : `${tool.hex}22`) : 'transparent',
                  color: activeTool === tool.id ? (tool.id === 'eraser' ? 'var(--text-primary)' : tool.hex) : 'var(--text-muted)',
                  border: `1px solid ${activeTool === tool.id ? tool.hex + '55' : 'transparent'}`,
                }}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ background: tool.hex }}
                />
                {tool.label}
              </motion.button>
            ))}
          </div>
          <div className="flex items-center gap-2 ml-2">
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Size</span>
            <input
              type="range" min={3} max={24} value={brushSize}
              onChange={e => setBrushSize(Number(e.target.value))}
              className="w-16 accent-teal-400"
            />
            <span className="text-[10px] font-mono w-4" style={{ color: 'var(--text-muted)' }}>{brushSize}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Opacity</span>
            <input
              type="range" min={0.1} max={1} step={0.05} value={opacity}
              onChange={e => setOpacity(Number(e.target.value))}
              className="w-16 accent-teal-400"
            />
          </div>
          {strokes.length > 0 && (
            <button
              onClick={clearCanvas}
              className="ml-auto text-xs px-2.5 py-1 rounded-lg transition-all"
              style={{ background: 'rgba(255,71,87,0.1)', color: '#ff4757', border: '1px solid rgba(255,71,87,0.25)' }}
            >
              Clear
            </button>
          )}
        </div>

        {/* ── scan canvas ── */}
        <div
          ref={containerRef}
          className="relative flex-1 rounded-xl overflow-hidden scanline"
          style={{ background: '#050a07', border: '1px solid var(--border)' }}
          onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
        >
          {/* grid */}
          <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />

          {/* uploaded image */}
          {uploadedImage && (
            <img
              src={uploadedImage}
              alt="Uploaded scan"
              className="absolute inset-0 w-full h-full"
              style={{ objectFit: 'contain', opacity: 0.9 }}
            />
          )}

          {/* mock SVG scan (shown if no upload) */}
          {!uploadedImage && (
            <motion.div
              animate={{ scale: zoom }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
              className="absolute inset-0"
              style={{ transformOrigin: 'center' }}
            >
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
                <ellipse cx="45" cy="36" rx="38" ry="16" fill="none" stroke="rgba(160,160,160,0.12)" strokeWidth="0.5" />
                <ellipse cx="45" cy="64" rx="38" ry="16" fill="none" stroke="rgba(160,160,160,0.12)" strokeWidth="0.5" />
                <rect x="88" y="20" width="8" height="60" rx="2" fill="rgba(150,150,150,0.06)" stroke="rgba(150,150,150,0.1)" strokeWidth="0.5" />
                {scanTeeth.map((t, i) => <ToothSVG key={i} {...t} />)}
                {activeLayers.anatomy && (
                  <g>
                    <text x="45" y="8" textAnchor="middle" fill="rgba(74,158,255,0.55)" fontSize="2.2" fontFamily="monospace">MAXILLARY ARCH</text>
                    <text x="45" y="96" textAnchor="middle" fill="rgba(74,158,255,0.55)" fontSize="2.2" fontFamily="monospace">MANDIBULAR ARCH</text>
                    <line x1="7" y1="50" x2="85" y2="50" stroke="rgba(74,158,255,0.12)" strokeWidth="0.3" strokeDasharray="2,2" />
                    <text x="4" y="50.7" fill="rgba(74,158,255,0.35)" fontSize="1.8" fontFamily="monospace">MID</text>
                  </g>
                )}
                {activeLayers.heatmap && (
                  <g>
                    <ellipse cx="38" cy="28" rx="7" ry="5" fill="rgba(0,212,170,0.1)" />
                    <ellipse cx="55" cy="30" rx="12" ry="4" fill="rgba(0,212,170,0.06)" />
                    <ellipse cx="48" cy="72" rx="8" ry="4" fill="rgba(0,212,170,0.08)" />
                  </g>
                )}
                {activeLayers.ruler && (
                  <g>
                    <line x1="35" y1="20" x2="42" y2="20" stroke="rgba(136,136,136,0.45)" strokeWidth="0.4" />
                    <text x="38.5" y="18.5" textAnchor="middle" fill="rgba(136,136,136,0.55)" fontSize="1.8" fontFamily="monospace">3.2mm</text>
                  </g>
                )}
                {activeLayers.findings && mockScanAnnotations.map(ann => {
                  const s = SEV_STYLE[ann.severity];
                  const isSel = selectedAnnotation === ann.id;
                  return (
                    <g key={ann.id} onClick={() => setSelectedAnnotation(isSel ? null : ann.id)} style={{ cursor: 'pointer' }}>
                      <rect
                        x={`${ann.x}%`} y={`${ann.y}%`}
                        width={`${ann.width}%`} height={`${ann.height}%`}
                        rx="1" fill={s.bg} stroke={s.border}
                        strokeWidth={isSel ? '0.8' : '0.5'}
                        strokeDasharray={isSel ? '0' : '1.5,1'}
                      />
                      <circle cx={`${ann.x + 1}%`} cy={`${ann.y + 1}%`} r="0.8%" fill={s.dot} />
                    </g>
                  );
                })}
              </svg>
            </motion.div>
          )}

          {/* drawing canvas — always on top */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            style={{
              cursor: activeTool === 'eraser'
                ? 'cell'
                : `crosshair`,
              zIndex: 10,
            }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
          />

          {/* drag-over overlay */}
          <AnimatePresence>
            {isDragging && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center rounded-xl z-20"
                style={{ background: 'rgba(0,212,170,0.08)', border: '2px dashed var(--accent)' }}
              >
                <p className="text-lg font-medium" style={{ color: 'var(--accent)' }}>Drop scan here</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* annotation tooltip */}
          <AnimatePresence>
            {selectedAnnotation && (() => {
              const ann = mockScanAnnotations.find(a => a.id === selectedAnnotation);
              if (!ann) return null;
              const s = SEV_STYLE[ann.severity];
              return (
                <motion.div
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                  className="absolute bottom-4 left-4 right-4 rounded-xl p-4 flex items-center justify-between z-30"
                  style={{ background: 'var(--bg-elevated)', border: `1px solid ${s.border}40` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ background: s.dot }} />
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{ann.label}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        Severity: <span style={{ color: s.dot }}>{ann.severity}</span>
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedAnnotation(null)} style={{ color: 'var(--text-muted)' }}>✕</button>
                </motion.div>
              );
            })()}
          </AnimatePresence>

          {/* current tool indicator */}
          <div className="absolute top-3 left-3 flex items-center gap-2 z-20 pointer-events-none">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: currentToolInfo.hex, boxShadow: `0 0 6px ${currentToolInfo.hex}` }}
            />
            <span className="text-[10px] font-mono tracking-widest" style={{ color: currentToolInfo.hex }}>
              {currentToolInfo.label.toUpperCase()}
            </span>
          </div>
          <div className="absolute top-3 right-3 text-[9px] font-mono z-20 pointer-events-none" style={{ color: 'rgba(0,212,170,0.4)' }}>
            {uploadedImage ? 'UPLOADED SCAN' : 'PANORAMIC · FULL ARCH'} · R ←→ L
          </div>

          {/* legend */}
          <div className="absolute bottom-3 right-3 flex flex-col gap-1 z-20 pointer-events-none">
            {OVERLAY_TOOLS.filter(t => t.id !== 'eraser').map(t => (
              <div key={t.id} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: t.hex }} />
                <span className="text-[9px] font-mono" style={{ color: t.hex }}>{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── right panel ── */}
      <div className="w-60 flex flex-col gap-4">

        {/* layer controls */}
        <div className="rounded-xl p-4 space-y-3" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
          <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            Overlay Layers
          </h3>
          {SVG_LAYERS.map(layer => (
            <div key={layer.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: activeLayers[layer.id] ? layer.color : 'var(--border)' }} />
                <span className="text-xs" style={{ color: activeLayers[layer.id] ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  {layer.label}
                </span>
              </div>
              <button
                onClick={() => toggleLayer(layer.id)}
                className="w-8 h-4 rounded-full transition-all relative"
                style={{ background: activeLayers[layer.id] ? layer.color : 'var(--border)' }}
              >
                <motion.div
                  animate={{ x: activeLayers[layer.id] ? 16 : 2 }}
                  className="absolute top-0.5 w-3 h-3 bg-white rounded-full"
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                />
              </button>
            </div>
          ))}
        </div>

        {/* findings */}
        <div className="rounded-xl p-4 flex-1 overflow-y-auto" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
          <h3 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
            Findings ({mockScanAnnotations.length})
          </h3>
          <div className="space-y-2">
            {mockScanAnnotations.map(ann => {
              const s = SEV_STYLE[ann.severity];
              const isSel = selectedAnnotation === ann.id;
              return (
                <motion.button
                  key={ann.id}
                  whileHover={{ x: 2 }}
                  onClick={() => setSelectedAnnotation(isSel ? null : ann.id)}
                  className="w-full text-left p-3 rounded-lg flex items-start gap-2"
                  style={{
                    background: isSel ? s.bg : 'var(--bg-card)',
                    border: `1px solid ${isSel ? s.border + '60' : 'var(--border-subtle)'}`,
                  }}
                >
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: s.dot }} />
                  <div>
                    <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{ann.label}</p>
                    <p className="text-[10px] mt-0.5 capitalize" style={{ color: s.dot }}>{ann.severity}</p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* overlay color legend */}
        <div className="rounded-xl p-4 space-y-2" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
          <h3 className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
            Color Key
          </h3>
          {OVERLAY_TOOLS.filter(t => t.id !== 'eraser').map(t => (
            <div key={t.id} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: t.hex }} />
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{t.desc}</span>
            </div>
          ))}
        </div>

        {/* AI */}
        <div className="rounded-xl p-4" style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent-glow)' }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--accent)' }}>AI Analysis</p>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            3 findings detected. Model confidence: <strong style={{ color: 'var(--accent)' }}>87%</strong>
          </p>
          <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>DentalNet v2.4 · 0.8s</p>
        </div>
      </div>
    </div>
  );
}
