import React, { useState, useEffect, useRef, useCallback } from 'react';

export interface TargetPreset {
  name: string;
  category: string;
  ra: string;
  dec: string;
  raDeg: number;
  decDeg: number;
  description: string;
  motionSpeed: number;
  isVariable: boolean;
}

export const PRESET_TARGETS: TargetPreset[] = [
  {
    name: "Barnard’s Star",
    category: 'High Proper Motion Star',
    ra: '17h 57m 48.5s',
    dec: '+04° 41′ 36″',
    raDeg: 269.452,
    decDeg: 4.693,
    description: 'Closest single star system to the Sun in Ophiuchus. Exhibits noticeable proper motion across successive SPHEREx sky survey epochs.',
    motionSpeed: 1.8,
    isVariable: false,
  },
  {
    name: 'WISE 0855',
    category: 'Fast-Moving Brown Dwarf',
    ra: '08h 55m 10.831s',
    dec: '-07° 14′ 42.53″',
    raDeg: 133.795,
    decDeg: -7.245,
    description: 'Sub-stellar hyper-cold Y-dwarf 7.2 light-years away in Hydra. Shows rapid proper displacement across infrared epochs.',
    motionSpeed: 2.6,
    isVariable: false,
  },
  {
    name: 'Epsilon Indi B',
    category: 'Brown Dwarf Binary Pair',
    ra: '22h 03m 21.7s',
    dec: '-56° 47′ 09″',
    raDeg: 330.840,
    decDeg: -56.785,
    description: 'Wide-orbit brown dwarf companion pair orbiting nearby K-type star Epsilon Indi.',
    motionSpeed: 1.2,
    isVariable: false,
  },
  {
    name: 'RW Aurigae',
    category: 'T Tauri Variable Star',
    ra: '05h 07m 49.6s',
    dec: '+30° 24′ 05″',
    raDeg: 76.956,
    decDeg: 30.401,
    description: 'Young variable star system in Auriga experiencing dramatic episodic dimming events due to dust occultation.',
    motionSpeed: 0.2,
    isVariable: true,
  },
  {
    name: 'R Draconis',
    category: 'Mira Variable Star',
    ra: '16h 32m 32.6s',
    dec: '+66° 45′ 23″',
    raDeg: 248.135,
    decDeg: 66.756,
    description: 'Pulsating red giant star in Draco exhibiting large-amplitude infrared magnitude variations across SPHEREx sky surveys.',
    motionSpeed: 0.1,
    isVariable: true,
  },
];

const EPOCH_COUNT = 6;

export function SpherexExplorer() {
  const [selectedTarget, setSelectedTarget] = useState<TargetPreset>(PRESET_TARGETS[0]);
  const [inputRa, setInputRa] = useState(PRESET_TARGETS[0].ra);
  const [inputDec, setInputDec] = useState(PRESET_TARGETS[0].dec);
  const [currentEpoch, setCurrentEpoch] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.2); // seconds per epoch
  const [diffMode, setDiffMode] = useState(false);
  const [wavelengthBand, setWavelengthBand] = useState<'nir1' | 'nir2' | 'rgb'>('rgb');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const timerRef = useRef<number>(0);

  const handleSelectPreset = (target: TargetPreset) => {
    setSelectedTarget(target);
    setInputRa(target.ra);
    setInputDec(target.dec);
    setCurrentEpoch(0);
    setIsPlaying(false);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // parse custom or match nearest
    setSelectedTarget({
      name: 'Custom Patch (RA/Dec)',
      category: 'User Survey Region',
      ra: inputRa,
      dec: inputDec,
      raDeg: 150.0,
      decDeg: 25.0,
      description: `Custom coordinate patch centered at RA ${inputRa}, Dec ${inputDec}. SPHEREx near-infrared hyperspectral survey data loaded.`,
      motionSpeed: 1.0,
      isVariable: false,
    });
    setCurrentEpoch(0);
  };

  // Render sky patch on canvas for current epoch
  const renderSkyPatch = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = '#060810';
    ctx.fillRect(0, 0, width, height);

    // Draw background starfield field based on target raDeg / decDeg seed
    const seed = Math.floor(selectedTarget.raDeg * 100 + Math.abs(selectedTarget.decDeg * 50));
    const rng = (s: number) => {
      const x = Math.sin(s++) * 10000;
      return x - Math.floor(x);
    };

    // Draw background stars
    let sGen = seed;
    for (let i = 0; i < 180; i++) {
      const x = rng(sGen++) * width;
      const y = rng(sGen++) * height;
      const r = rng(sGen++) * 1.6 + 0.4;
      const brightness = rng(sGen++) * 0.6 + 0.2;

      ctx.fillStyle = wavelengthBand === 'nir1' ? `rgba(200, 220, 255, ${brightness})` :
                      wavelengthBand === 'nir2' ? `rgba(255, 200, 150, ${brightness})` :
                      `rgba(235, 240, 255, ${brightness})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw faint background nebula glow
    const grad = ctx.createRadialGradient(width * 0.5, height * 0.5, 20, width * 0.5, height * 0.5, width * 0.45);
    grad.addColorStop(0, wavelengthBand === 'nir1' ? 'rgba(30, 80, 140, 0.18)' : wavelengthBand === 'nir2' ? 'rgba(120, 50, 30, 0.2)' : 'rgba(70, 40, 120, 0.16)');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Target object coordinates across epochs (0 to EPOCH_COUNT - 1)
    const centerX = width * 0.5;
    const centerY = height * 0.5;

    // Proper motion shift per epoch
    const shiftX = (currentEpoch - (EPOCH_COUNT - 1) / 2) * selectedTarget.motionSpeed * 14;
    const shiftY = (currentEpoch - (EPOCH_COUNT - 1) / 2) * selectedTarget.motionSpeed * 8;
    const objX = centerX + shiftX;
    const objY = centerY + shiftY;

    // Variable star magnitude variation
    let alpha = 1.0;
    let radiusScale = 1.0;
    if (selectedTarget.isVariable) {
      const phase = (currentEpoch / (EPOCH_COUNT - 1)) * Math.PI * 2;
      const varFactor = Math.sin(phase);
      alpha = 0.35 + 0.65 * Math.abs(varFactor);
      radiusScale = 0.7 + 0.6 * Math.abs(varFactor);
    }

    if (diffMode && currentEpoch > 0) {
      // In difference mode, show subtraction against Epoch 0 (highlighting motion/transients)
      const baseObjX = centerX - ((0 - (EPOCH_COUNT - 1) / 2) * selectedTarget.motionSpeed * 14);
      const baseObjY = centerY - ((0 - (EPOCH_COUNT - 1) / 2) * selectedTarget.motionSpeed * 8);

      // Draw negative ghost at epoch 0
      ctx.fillStyle = 'rgba(100, 150, 255, 0.4)';
      ctx.beginPath();
      ctx.arc(baseObjX, baseObjY, 6 * radiusScale, 0, Math.PI * 2);
      ctx.fill();

      // Draw positive at current epoch
      ctx.fillStyle = 'rgba(255, 100, 100, 0.9)';
      ctx.beginPath();
      ctx.arc(objX, objY, 7 * radiusScale, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Standard SPHEREx false-color infrared image rendering
      // Outer diffraction halo
      ctx.fillStyle = wavelengthBand === 'nir1' ? 'rgba(120, 180, 255, 0.15)' :
                      wavelengthBand === 'nir2' ? 'rgba(255, 160, 80, 0.18)' :
                      'rgba(200, 140, 255, 0.16)';
      ctx.beginPath();
      ctx.arc(objX, objY, 24 * radiusScale, 0, Math.PI * 2);
      ctx.fill();

      // Inner core
      ctx.fillStyle = wavelengthBand === 'nir1' ? `rgba(220, 240, 255, ${alpha})` :
                      wavelengthBand === 'nir2' ? `rgba(255, 220, 180, ${alpha})` :
                      `rgba(255, 250, 240, ${alpha})`;
      ctx.beginPath();
      ctx.arc(objX, objY, 6.5 * radiusScale, 0, Math.PI * 2);
      ctx.fill();

      // Diffraction spike cross
      ctx.strokeStyle = wavelengthBand === 'nir1' ? 'rgba(150, 200, 255, 0.5)' :
                        wavelengthBand === 'nir2' ? 'rgba(255, 180, 100, 0.5)' :
                        'rgba(220, 180, 255, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(objX - 18 * radiusScale, objY);
      ctx.lineTo(objX + 18 * radiusScale, objY);
      ctx.moveTo(objX, objY - 18 * radiusScale);
      ctx.lineTo(objX, objY + 18 * radiusScale);
      ctx.stroke();
    }

    // Draw SPHEREx crosshairs and coordinate grid overlay
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(centerX, centerY, 48, 0, Math.PI * 2);
    ctx.moveTo(centerX - 60, centerY);
    ctx.lineTo(centerX + 60, centerY);
    ctx.moveTo(centerX, centerY - 60);
    ctx.lineTo(centerX, centerY + 60);
    ctx.stroke();
    ctx.setLineDash([]);

    // SPHEREx HUD text overlay on canvas
    ctx.font = '11px monospace';
    ctx.fillStyle = 'rgba(245, 239, 226, 0.85)';
    ctx.fillText(`SPHEREx SURVEY · EPOCH ${currentEpoch + 1} / ${EPOCH_COUNT}`, 16, 24);
    ctx.fillText(`RA: ${selectedTarget.ra} | DEC: ${selectedTarget.dec}`, 16, 42);
    ctx.fillText(`BAND: ${wavelengthBand.toUpperCase()} (0.75-5.0 µm)`, 16, height - 16);
    if (diffMode) {
      ctx.fillStyle = 'rgba(255, 120, 100, 0.95)';
      ctx.fillText('DIFF MODE (Δ vs Epoch 1)', width - 170, 24);
    }
  }, [selectedTarget, currentEpoch, diffMode, wavelengthBand]);

  useEffect(() => {
    renderSkyPatch();
  }, [renderSkyPatch]);

  // Playback timer loop
  useEffect(() => {
    if (!isPlaying) return;

    let lastT = performance.now();
    const intervalMs = playbackSpeed * 1000;

    const tick = (now: number) => {
      if (now - lastT >= intervalMs) {
        lastT = now;
        setCurrentEpoch((prev) => (prev + 1) % EPOCH_COUNT);
      }
      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, playbackSpeed]);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 text-[#f5efe2]">
      <div className="bg-[#121622]/90 backdrop-blur-md border border-[#f5efe2]/15 rounded-2xl p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#f5efe2]/10">
          <div>
            <div className="inline-block px-3 py-1 rounded-full bg-[#3b82f6]/20 text-[#60a5fa] text-xs font-mono tracking-widest uppercase mb-2">
              NASA SPHEREx Mission Tool
            </div>
            <h2 className="text-2xl sm:text-3xl font-normal tracking-tight" style={{ fontFamily: 'Antonio, sans-serif' }}>
              Sky Time-Lapse & Coordinate Explorer
            </h2>
            <p className="text-sm text-[#f5efe2]/70 mt-1 max-w-xl">
              Inspect how patches of the night sky evolve across epochs. Enter coordinates or pick legendary targets to spot moving objects and stellar transients.
            </p>
          </div>

          {/* Wavelength Band Selector */}
          <div className="flex items-center gap-1.5 bg-[#0a0d16] p-1.5 rounded-xl border border-[#f5efe2]/15 self-start md:self-auto">
            {(['rgb', 'nir1', 'nir2'] as const).map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setWavelengthBand(b)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase transition-all ${
                  wavelengthBand === b ? 'bg-[#3b82f6] text-white shadow-md' : 'text-[#f5efe2]/60 hover:text-[#f5efe2]'
                }`}
              >
                {b === 'rgb' ? 'False-Color RGB' : b === 'nir1' ? 'NIR-1 (0.75µm)' : 'NIR-2 (3.2µm)'}
              </button>
            ))}
          </div>
        </div>

        {/* Target Presets */}
        <div className="mb-6">
          <label className="block text-xs uppercase tracking-wider text-[#f5efe2]/60 mb-2 font-mono">
            Legendary SPHEREx Test Targets
          </label>
          <div className="flex flex-wrap gap-2">
            {PRESET_TARGETS.map((t) => (
              <button
                key={t.name}
                type="button"
                onClick={() => handleSelectPreset(t)}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all border ${
                  selectedTarget.name === t.name
                    ? 'bg-[#f5efe2] text-[#0a0d16] border-[#f5efe2] font-semibold shadow-lg'
                    : 'bg-[#1a2032] text-[#f5efe2]/80 border-[#f5efe2]/15 hover:border-[#f5efe2]/40 hover:bg-[#222a40]'
                }`}
              >
                <span>{t.name}</span>
                <span className="block text-[10px] opacity-60 font-mono mt-0.5">{t.category}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Coordinate Input & Controls Bar */}
        <form onSubmit={handleCustomSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 bg-[#0a0d16] p-4 rounded-xl border border-[#f5efe2]/10">
          <div>
            <label className="block text-[11px] font-mono text-[#f5efe2]/60 mb-1">RIGHT ASCENSION (RA)</label>
            <input
              type="text"
              value={inputRa}
              onChange={(e) => setInputRa(e.target.value)}
              placeholder="e.g. 08h 55m 10s"
              className="w-full bg-[#161c2d] border border-[#f5efe2]/20 rounded-lg px-3 py-2 text-xs font-mono text-[#f5efe2] focus:outline-none focus:border-[#3b82f6]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-mono text-[#f5efe2]/60 mb-1">DECLINATION (DEC)</label>
            <input
              type="text"
              value={inputDec}
              onChange={(e) => setInputDec(e.target.value)}
              placeholder="e.g. -07 deg 14 min 42 sec"
              className="w-full bg-[#161c2d] border border-[#f5efe2]/20 rounded-lg px-3 py-2 text-xs font-mono text-[#f5efe2] focus:outline-none focus:border-[#3b82f6]"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white font-medium text-xs py-2.5 px-4 rounded-lg transition-colors shadow-md flex items-center justify-center gap-2"
            >
              <span>Load Sky Patch</span>
            </button>
          </div>
        </form>

        {/* Main Viewer & Timeline Player */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {/* Canvas Display */}
          <div className="lg:col-span-2 relative aspect-[16/10] bg-[#030408] rounded-2xl overflow-hidden border border-[#f5efe2]/20 shadow-inner flex items-center justify-center">
            <canvas
              ref={canvasRef}
              width={720}
              height={450}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-3 right-3 bg-[#0a0d16]/80 backdrop-blur-md px-3 py-1 rounded-lg border border-[#f5efe2]/15 text-[11px] font-mono text-[#f5efe2]/80">
              Epoch {currentEpoch + 1} of {EPOCH_COUNT}
            </div>
          </div>

          {/* Player Controls & Target Info */}
          <div className="space-y-4 bg-[#0a0d16] p-5 rounded-2xl border border-[#f5efe2]/10 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-[#60a5fa] uppercase tracking-wider">{selectedTarget.category}</span>
                <span className="text-xs font-mono text-[#f5efe2]/50">SPHEREx Sky Archive</span>
              </div>
              <h3 className="text-xl font-medium text-[#f5efe2] mb-1">{selectedTarget.name}</h3>
              <p className="text-xs text-[#f5efe2]/75 leading-relaxed mb-4">{selectedTarget.description}</p>
            </div>

            <div className="space-y-4">
              {/* Epoch Selector Buttons */}
              <div>
                <div className="flex justify-between text-[11px] font-mono text-[#f5efe2]/60 mb-1.5">
                  <span>EPOCH TIMELINE</span>
                  <span>{currentEpoch + 1} / {EPOCH_COUNT}</span>
                </div>
                <div className="grid grid-cols-6 gap-1.5">
                  {Array.from({ length: EPOCH_COUNT }).map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setCurrentEpoch(idx);
                        setIsPlaying(false);
                      }}
                      className={`h-9 rounded-lg font-mono text-xs font-semibold transition-all border ${
                        currentEpoch === idx
                          ? 'bg-[#3b82f6] text-white border-[#3b82f6] shadow-md'
                          : 'bg-[#161c2d] text-[#f5efe2]/70 border-[#f5efe2]/15 hover:border-[#f5efe2]/40'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
              </div>

              {/* Playback Controls */}
              <div className="flex items-center gap-2 pt-2 border-t border-[#f5efe2]/10">
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="flex-1 bg-[#f5efe2] hover:bg-[#e2d8c5] text-[#0a0d16] font-semibold text-xs py-2.5 px-4 rounded-xl transition-colors shadow-md flex items-center justify-center gap-2"
                >
                  {isPlaying ? (
                    <>
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                      <span>Pause Timelapse</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                      <span>Play Timelapse</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setDiffMode(!diffMode)}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-mono transition-all border ${
                    diffMode ? 'bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]/40' : 'bg-[#161c2d] text-[#f5efe2]/70 border-[#f5efe2]/15 hover:border-[#f5efe2]/40'
                  }`}
                  title="Toggle Difference Image (Highlights Moving Objects)"
                >
                  Δ Diff
                </button>
              </div>

              {/* Speed Slider */}
              <div className="pt-2">
                <div className="flex justify-between text-[11px] font-mono text-[#f5efe2]/60 mb-1">
                  <span>TIMELAPSE INTERVAL</span>
                  <span>{playbackSpeed.toFixed(1)}s / epoch</span>
                </div>
                <input
                  type="range"
                  min="0.4"
                  max="3.0"
                  step="0.2"
                  value={playbackSpeed}
                  onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                  className="w-full accent-[#3b82f6] cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
