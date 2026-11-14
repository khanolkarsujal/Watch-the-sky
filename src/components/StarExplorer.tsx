/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  computeBarnardPosition,
  computeEpsilonIndiOrbit,
  computeWise0855Position,
  computeRwAurigaeOccultation,
  computeRDraconisPulsation,
} from '../valley/valleyMath';

export interface StarTarget {
  id: string;
  name: string;
  shortName: string;
  badge: string;
  category: 'Proper Motion' | 'Brown Dwarf Pair' | 'Sub-Brown Dwarf' | 'Variable Star';
  tagline: string;
  coordinates: {
    ra: string;
    dec: string;
    distance: string;
    constellation: string;
  };
  metrics: {
    motionOrPeriod: string;
    velocityOrMagnitude: string;
    spectralType: string;
  };
  summary: string;
  scientificDetail: string;
  simulationType: 'drift' | 'binary' | 'infrared' | 'variable-dip' | 'pulsation';
}

export const SHOWCASE_STARS: StarTarget[] = [
  {
    id: 'barnards-star',
    name: "Barnard's Star",
    shortName: "Barnard's Star",
    badge: 'High Proper Motion',
    category: 'Proper Motion',
    tagline: "Fastest apparent motion of any star in Earth's sky",
    coordinates: {
      ra: '17h 57m 48.5s',
      dec: '+04° 41′ 36″',
      distance: '5.96 LY',
      constellation: 'Ophiuchus',
    },
    metrics: {
      motionOrPeriod: '10.36″ / yr (Proper Motion)',
      velocityOrMagnitude: '-110.6 km/s (Radial Velocity)',
      spectralType: 'M4.0V Red Dwarf',
    },
    summary:
      "Barnard's Star has the largest proper motion of any known star relative to the Sun. Moving at 10.36 arcseconds per year, its rapid angular shift allows astronomers to directly witness stellar motion across background galactic coordinates in just a few seasons.",
    scientificDetail:
      'High-velocity runaway M-dwarf with a space velocity of 142.6 km/s approaching our solar system. Used as the gold standard for calibrating high-precision astrometric reference frames.',
    simulationType: 'drift',
  },
  {
    id: 'epsilon-indi-b',
    name: 'Epsilon Indi B',
    shortName: 'Epsilon Indi B',
    badge: 'Brown Dwarf Pair',
    category: 'Brown Dwarf Pair',
    tagline: 'A pair of brown dwarfs orbiting a star',
    coordinates: {
      ra: '22h 04m 10.5s',
      dec: '-56° 46′ 58″',
      distance: '12.0 LY',
      constellation: 'Indus',
    },
    metrics: {
      motionOrPeriod: '15.0-Year Mutual Orbit',
      velocityOrMagnitude: '4.70″ / yr (Common Motion)',
      spectralType: 'T1V + T6V Binary Pair',
    },
    summary:
      'A pair of substellar brown dwarfs (Epsilon Indi Ba and Bb) gravitationally locked in mutual orbit around each other, while together orbiting the early K-type main-sequence star Epsilon Indi A. Their atmospheres exhibit dense methane and water-vapor absorption bands.',
    scientificDetail:
      'Binary brown dwarf benchmark system with combined mass of ~75 Jupiter masses. Provides critical empirical calibration for substellar cooling models and ultracool atmospheric spectroscopy.',
    simulationType: 'binary',
  },
  {
    id: 'wise-0855',
    name: 'WISE 0855−0714',
    shortName: 'WISE 0855',
    badge: 'Ultra-Cold Sub-Brown Dwarf',
    category: 'Sub-Brown Dwarf',
    tagline: 'Fast-moving brown dwarf with water-ice atmospheric clouds',
    coordinates: {
      ra: '08h 55m 10.831s',
      dec: '-07° 14′ 42.53″',
      distance: '7.43 LY',
      constellation: 'Hydra',
    },
    metrics: {
      motionOrPeriod: '8.11″ / yr (Proper Motion)',
      velocityOrMagnitude: 'Temp: -48°C to -13°C (225–260 K)',
      spectralType: 'Spectral Class Y (Sub-Brown Dwarf)',
    },
    summary:
      'Fourth-closest stellar system to the Sun. One of the coldest substellar objects ever recorded, moving across deep sky telemetry at a blistering 8.11 arcseconds per year. Spectroscopic signatures confirm atmospheric water vapor and sub-zero ice clouds.',
    scientificDetail:
      'Discovered via Wide-field Infrared Survey Explorer (WISE). With a mass of only 3 to 10 Jupiter masses, it bridges the boundary between gas giant planets and brown dwarfs.',
    simulationType: 'infrared',
  },
  {
    id: 'rw-aurigae',
    name: 'RW Aurigae',
    shortName: 'RW Aurigae',
    badge: 'Variable Star (Binary)',
    category: 'Variable Star',
    tagline: 'Classical T Tauri binary with violent tidal occultation events',
    coordinates: {
      ra: '05h 07m 49.5s',
      dec: '+30° 24′ 05″',
      distance: '530 LY',
      constellation: 'Auriga',
    },
    metrics: {
      motionOrPeriod: 'Episodic Dimming Events',
      velocityOrMagnitude: 'V Mag: 9.6 → 13.6 (4 Mag Dip)',
      spectralType: 'Classical T Tauri Young Binary',
    },
    summary:
      'A young eruptive variable star system in the Taurus-Auriga star-forming nursery. Gravitational flybys between the binary components strip out colossal tidal gas-and-dust bridges, producing catastrophic multi-magnitude occultation events.',
    scientificDetail:
      'Millimeter ALMA and optical spectroscopy reveal dynamic tidal arms connecting the binary stars. Occultations cause optical brightness to plunge by up to 40 times before slowly recovering.',
    simulationType: 'variable-dip',
  },
  {
    id: 'r-draconis',
    name: 'R Draconis',
    shortName: 'R Draconis',
    badge: 'Variable Star (Mira Giant)',
    category: 'Variable Star',
    tagline: 'Mira-type pulsating red giant undergoing massive 245-day cycles',
    coordinates: {
      ra: '16h 32m 40.2s',
      dec: '+66° 45′ 18″',
      distance: '2,100 LY',
      constellation: 'Draco',
    },
    metrics: {
      motionOrPeriod: '245.6-Day Pulsation Period',
      velocityOrMagnitude: 'V Mag: 6.7 → 13.2 (6.5 Mag Amplitude)',
      spectralType: 'M3e–M9e III Mira Giant',
    },
    summary:
      'A long-period pulsating red giant of the Mira variable class. Over its 245.6-day cycle, the star rhythmically expands and contracts by tens of millions of kilometers, driving enormous visual luminosity oscillations spanning 6.5 magnitudes.',
    scientificDetail:
      'Asymptotic Giant Branch (AGB) star undergoing periodic radial pulsations powered by the helium-shell flash mechanism, ejecting enriched stellar winds into the interstellar medium.',
    simulationType: 'pulsation',
  },
];

interface StarExplorerProps {
  onSelectForWarp: (target: StarTarget) => void;
}

export function StarExplorer({ onSelectForWarp }: StarExplorerProps) {
  const [selectedId, setSelectedId] = useState<string>('barnards-star');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [warpFeedback, setWarpFeedback] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const simTimeRef = useRef<number>(0);
  const lastTimestampRef = useRef<number>(0);

  const currentStar = SHOWCASE_STARS.find((s) => s.id === selectedId) ?? SHOWCASE_STARS[0];

  const handleSpeedToggle = () => {
    setSpeedMultiplier((prev) => (prev === 1 ? 5 : prev === 5 ? 25 : 1));
  };

  const handleResetSim = () => {
    simTimeRef.current = 0;
  };

  const handleLaunchWarp = (star: StarTarget) => {
    onSelectForWarp(star);
    setWarpFeedback(`✦ Telemetry locked on ${star.name}. 3D warp jump triggered!`);
    setTimeout(() => {
      setWarpFeedback(null);
    }, 4500);
  };

  // Render Canvas Simulation at 60fps
  const renderSimulation = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number, t: number) => {
      ctx.clearRect(0, 0, width, height);

      // Deep space grid background
      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, width, height);

      // Fine astrometric grid lines
      ctx.strokeStyle = 'rgba(146, 180, 255, 0.08)';
      ctx.lineWidth = 1;
      const gridSize = 36;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Background reference stars (stationary)
      const refStars = [
        { x: width * 0.18, y: height * 0.22, r: 1.5, alpha: 0.4 },
        { x: width * 0.32, y: height * 0.78, r: 1.8, alpha: 0.5 },
        { x: width * 0.82, y: height * 0.28, r: 1.4, alpha: 0.35 },
        { x: width * 0.88, y: height * 0.82, r: 2.0, alpha: 0.6 },
        { x: width * 0.52, y: height * 0.16, r: 1.2, alpha: 0.45 },
        { x: width * 0.68, y: height * 0.64, r: 1.6, alpha: 0.5 },
      ];
      refStars.forEach((star) => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(245, 239, 226, ${star.alpha})`;
        ctx.fill();
      });

      if (currentStar.simulationType === 'drift') {
        // 1. Barnard's Star: Proper motion vector & drift path
        const pos = computeBarnardPosition(t, speedMultiplier);
        const startX = width * 0.2;
        const startY = height * 0.75;
        const currentX = width * pos.x;
        const currentY = height * pos.y;

        // Motion vector trail
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(currentX, currentY);
        ctx.strokeStyle = 'rgba(235, 120, 100, 0.65)';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Origin marker
        ctx.beginPath();
        ctx.arc(startX, startY, 4, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(245, 239, 226, 0.4)';
        ctx.stroke();

        // Star glow & core
        const grad = ctx.createRadialGradient(currentX, currentY, 1, currentX, currentY, 24);
        grad.addColorStop(0, 'rgba(255, 160, 130, 0.95)');
        grad.addColorStop(0.3, 'rgba(235, 90, 70, 0.5)');
        grad.addColorStop(1, 'rgba(235, 90, 70, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(currentX, currentY, 24, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(currentX, currentY, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffeedd';
        ctx.fill();

        // Vector arrow head
        ctx.beginPath();
        ctx.arc(currentX, currentY, 12, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 140, 110, 0.8)';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Live telemetry text HUD
        ctx.fillStyle = '#e8c98e';
        ctx.font = '600 11px system-ui, sans-serif';
        ctx.fillText(`EPOCH: ${pos.epochYear}`, 16, 26);
        ctx.fillStyle = 'rgba(245, 239, 226, 0.75)';
        ctx.font = '10px system-ui, sans-serif';
        ctx.fillText(`DRIFT: +${pos.driftArcsec.toFixed(1)}″ (${(pos.driftArcsec / 60).toFixed(2)}′)`, 16, 42);
        ctx.fillText(`RATE: 10.36″/year · 142.6 km/s`, 16, 56);
      } else if (currentStar.simulationType === 'binary') {
        // 2. Epsilon Indi B: Pair of brown dwarfs orbiting a star
        const orbit = computeEpsilonIndiOrbit(t, speedMultiplier);

        // Distant host star Epsilon Indi A in corner
        const hostX = width * 0.12;
        const hostY = height * 0.2;
        const hostGrad = ctx.createRadialGradient(hostX, hostY, 2, hostX, hostY, 45);
        hostGrad.addColorStop(0, 'rgba(255, 215, 140, 0.95)');
        hostGrad.addColorStop(0.3, 'rgba(240, 160, 60, 0.35)');
        hostGrad.addColorStop(1, 'rgba(240, 160, 60, 0)');
        ctx.fillStyle = hostGrad;
        ctx.beginPath();
        ctx.arc(hostX, hostY, 45, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff4db';
        ctx.beginPath();
        ctx.arc(hostX, hostY, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(245, 239, 226, 0.55)';
        ctx.font = '9px system-ui, sans-serif';
        ctx.fillText('Host: Epsilon Indi A (K5V)', hostX + 12, hostY + 3);

        // Brown Dwarf Mutual Center of Mass (Barycenter)
        const cx = width * 0.58;
        const cy = height * 0.52;

        // Orbit ellipse
        ctx.beginPath();
        ctx.ellipse(cx, cy, width * 0.18, height * 0.22, 0.2, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(146, 180, 255, 0.25)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Barycenter crosshair
        ctx.strokeStyle = 'rgba(232, 201, 142, 0.4)';
        ctx.beginPath();
        ctx.moveTo(cx - 5, cy);
        ctx.lineTo(cx + 5, cy);
        ctx.moveTo(cx, cy - 5);
        ctx.lineTo(cx, cy + 5);
        ctx.stroke();

        // Brown Dwarf Ba (T1V)
        const bax = cx + (orbit.ba.x - 0.5) * width;
        const bay = cy + (orbit.ba.y - 0.5) * height;
        const baGrad = ctx.createRadialGradient(bax, bay, 1, bax, bay, 16);
        baGrad.addColorStop(0, 'rgba(200, 110, 80, 0.95)');
        baGrad.addColorStop(0.5, 'rgba(120, 60, 50, 0.4)');
        baGrad.addColorStop(1, 'rgba(120, 60, 50, 0)');
        ctx.fillStyle = baGrad;
        ctx.beginPath();
        ctx.arc(bax, bay, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffcfbe';
        ctx.beginPath();
        ctx.arc(bax, bay, 3.8, 0, Math.PI * 2);
        ctx.fill();

        // Brown Dwarf Bb (T6V)
        const bbx = cx + (orbit.bb.x - 0.5) * width;
        const bby = cy + (orbit.bb.y - 0.5) * height;
        const bbGrad = ctx.createRadialGradient(bbx, bby, 1, bbx, bby, 14);
        bbGrad.addColorStop(0, 'rgba(120, 80, 180, 0.95)');
        bbGrad.addColorStop(0.5, 'rgba(70, 50, 140, 0.4)');
        bbGrad.addColorStop(1, 'rgba(70, 50, 140, 0)');
        ctx.fillStyle = bbGrad;
        ctx.beginPath();
        ctx.arc(bbx, bby, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#e2d4ff';
        ctx.beginPath();
        ctx.arc(bbx, bby, 3.2, 0, Math.PI * 2);
        ctx.fill();

        // Labels
        ctx.fillStyle = 'rgba(255, 180, 140, 0.85)';
        ctx.font = '9px system-ui, sans-serif';
        ctx.fillText('Ba (T1)', bax + 8, bay - 6);
        ctx.fillStyle = 'rgba(180, 160, 240, 0.85)';
        ctx.fillText('Bb (T6)', bbx + 8, bby + 12);

        // Live Telemetry text HUD
        ctx.fillStyle = '#a8c6ff';
        ctx.font = '600 11px system-ui, sans-serif';
        ctx.fillText('SYSTEM: Binary Brown Dwarf Pair', 16, 26);
        ctx.fillStyle = 'rgba(245, 239, 226, 0.75)';
        ctx.font = '10px system-ui, sans-serif';
        ctx.fillText(`ORBIT PHASE: ${(orbit.orbitPhase * 15.0).toFixed(1)} / 15.0 yrs`, 16, 42);
        ctx.fillText(`SEPARATION: ~2.1 AU · Methane Bands Detected`, 16, 56);
      } else if (currentStar.simulationType === 'infrared') {
        // 3. WISE 0855: Sub-brown dwarf coordinates and cold IR thermal sweep
        const pos = computeWise0855Position(t, speedMultiplier);
        const curX = width * pos.x;
        const curY = height * pos.y;

        // False color thermal infrared sweep beam
        ctx.save();
        const beamGrad = ctx.createLinearGradient(0, 0, width, height);
        beamGrad.addColorStop(0, 'rgba(30, 20, 60, 0.15)');
        beamGrad.addColorStop(0.5, 'rgba(70, 30, 90, 0.25)');
        beamGrad.addColorStop(1, 'rgba(20, 40, 70, 0.15)');
        ctx.fillStyle = beamGrad;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();

        // Drift trajectory line
        ctx.beginPath();
        ctx.moveTo(width * 0.15, height * 0.35);
        ctx.lineTo(curX, curY);
        ctx.strokeStyle = 'rgba(160, 100, 255, 0.55)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Sub-zero ice cloud halo (cold violet/cyan)
        const irGrad = ctx.createRadialGradient(curX, curY, 2, curX, curY, 28);
        irGrad.addColorStop(0, 'rgba(180, 160, 255, 0.95)');
        irGrad.addColorStop(0.4, 'rgba(100, 60, 200, 0.45)');
        irGrad.addColorStop(0.8, 'rgba(40, 120, 180, 0.2)');
        irGrad.addColorStop(1, 'rgba(40, 120, 180, 0)');
        ctx.fillStyle = irGrad;
        ctx.beginPath();
        ctx.arc(curX, curY, 28, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#f0e8ff';
        ctx.beginPath();
        ctx.arc(curX, curY, 4, 0, Math.PI * 2);
        ctx.fill();

        // Reticle
        ctx.strokeStyle = 'rgba(160, 220, 255, 0.6)';
        ctx.strokeRect(curX - 14, curY - 14, 28, 28);

        // Live Telemetry text HUD with exact requested coordinates
        ctx.fillStyle = '#c5a8ff';
        ctx.font = '600 11px system-ui, sans-serif';
        ctx.fillText('TARGET: WISE 0855−0714 (Fast-Moving Brown Dwarf)', 16, 26);
        ctx.fillStyle = 'rgba(245, 239, 226, 0.85)';
        ctx.font = '10px system-ui, sans-serif';
        ctx.fillText('RA: 08h 55m 10.831s  |  DEC: -07° 14′ 42.53″', 16, 42);
        ctx.fillText(
          `TEMP: ${pos.temperatureKelvin.toFixed(0)} K (${(pos.temperatureKelvin - 273.15).toFixed(0)}°C) · DRIFT: +${pos.apparentArcsec.toFixed(1)}″`,
          16,
          56,
        );
      } else if (currentStar.simulationType === 'variable-dip') {
        // 4. RW Aurigae: Young binary with tidal stream + live photometric light curve
        const rw = computeRwAurigaeOccultation(t, speedMultiplier);

        // Binary pair stars
        const starAx = width * 0.35;
        const starAy = height * 0.32;
        const starBx = width * 0.65;
        const starBy = height * 0.28;

        // Circumstellar tidal gas and dust bridge
        ctx.beginPath();
        ctx.moveTo(starAx, starAy);
        ctx.bezierCurveTo(
          width * 0.45,
          height * (0.12 + rw.occultationFactor * 0.2),
          width * 0.55,
          height * (0.45 + rw.occultationFactor * 0.15),
          starBx,
          starBy,
        );
        ctx.strokeStyle = `rgba(235, 170, 90, ${rw.streamDensity * 0.8})`;
        ctx.lineWidth = 10 * rw.streamDensity;
        ctx.stroke();

        // Star A (primary)
        const primaryDim = 1 - rw.occultationFactor * 0.6;
        const aGrad = ctx.createRadialGradient(starAx, starAy, 1, starAx, starAy, 26 * primaryDim);
        aGrad.addColorStop(0, `rgba(255, 230, 180, ${primaryDim})`);
        aGrad.addColorStop(0.5, `rgba(240, 150, 70, ${primaryDim * 0.5})`);
        aGrad.addColorStop(1, 'rgba(240, 150, 70, 0)');
        ctx.fillStyle = aGrad;
        ctx.beginPath();
        ctx.arc(starAx, starAy, 26 * primaryDim, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(starAx, starAy, 4 * primaryDim, 0, Math.PI * 2);
        ctx.fill();

        // Star B (secondary)
        ctx.beginPath();
        ctx.arc(starBx, starBy, 16, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(245, 190, 110, 0.4)';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(starBx, starBy, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#fff0dd';
        ctx.fill();

        // Photometric Light Curve Graph in lower half
        const graphY = height * 0.72;
        const graphH = height * 0.22;
        ctx.fillStyle = 'rgba(4, 8, 20, 0.7)';
        ctx.fillRect(16, graphY, width - 32, graphH);
        ctx.strokeStyle = 'rgba(146, 180, 255, 0.2)';
        ctx.strokeRect(16, graphY, width - 32, graphH);

        // Plot photometric curve
        ctx.beginPath();
        ctx.strokeStyle = '#e8c98e';
        ctx.lineWidth = 1.5;
        for (let gx = 0; gx < width - 32; gx += 2) {
          const sampleProg = gx / (width - 32);
          let sampleDip = 0;
          if (sampleProg >= 0.3 && sampleProg <= 0.7) {
            sampleDip = Math.sin(((sampleProg - 0.3) / 0.4) * Math.PI);
          }
          const gy = graphY + 6 + sampleDip * (graphH - 12);
          if (gx === 0) ctx.moveTo(16 + gx, gy);
          else ctx.lineTo(16 + gx, gy);
        }
        ctx.stroke();

        // Scan cursor representing current phase
        const curPhase = ((t * speedMultiplier) % 12) / 12;
        const scanX = 16 + curPhase * (width - 32);
        ctx.strokeStyle = '#ff6b4a';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(scanX, graphY);
        ctx.lineTo(scanX, graphY + graphH);
        ctx.stroke();

        // Live Telemetry text HUD
        ctx.fillStyle = '#ebd19e';
        ctx.font = '600 11px system-ui, sans-serif';
        ctx.fillText('VARIABLE: RW Aurigae (T Tauri Binary Occultation)', 16, 26);
        ctx.fillStyle = 'rgba(245, 239, 226, 0.85)';
        ctx.font = '10px system-ui, sans-serif';
        ctx.fillText(
          `PHOTOMETRY: V Mag ${rw.magnitude.toFixed(2)}  |  DIMMING: ${(rw.occultationFactor * 100).toFixed(0)}%`,
          16,
          42,
        );
        ctx.fillText(`TIDAL STREAM: Circumstellar Dust Bridge Occulting Primary`, 16, 56);
      } else if (currentStar.simulationType === 'pulsation') {
        // 5. R Draconis: Mira-type pulsating variable red giant
        const rd = computeRDraconisPulsation(t, speedMultiplier);

        const cx = width * 0.5;
        const cy = height * 0.4;
        const baseRadius = 26;
        const r = baseRadius * rd.radiusScale;

        // Stellar thermal coronal expansion waves
        const flareCount = 6;
        for (let i = 0; i < flareCount; i++) {
          const flareR = r + (i + 1) * 8 * rd.radiusScale;
          const flareAlpha = 0.25 / (i + 1);
          ctx.beginPath();
          ctx.arc(cx, cy, flareR, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(235, 70, 50, ${flareAlpha})`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Giant star core gradient
        const giantGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, r * 1.6);
        giantGrad.addColorStop(0, '#fff4ee');
        giantGrad.addColorStop(0.35, 'rgba(255, 140, 70, 0.95)');
        giantGrad.addColorStop(0.7, 'rgba(210, 50, 40, 0.8)');
        giantGrad.addColorStop(1, 'rgba(150, 20, 20, 0)');
        ctx.fillStyle = giantGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, r * 1.6, 0, Math.PI * 2);
        ctx.fill();

        // Photometric Light Curve Graph in lower quadrant
        const graphY = height * 0.72;
        const graphH = height * 0.22;
        ctx.fillStyle = 'rgba(4, 8, 20, 0.7)';
        ctx.fillRect(16, graphY, width - 32, graphH);
        ctx.strokeStyle = 'rgba(146, 180, 255, 0.2)';
        ctx.strokeRect(16, graphY, width - 32, graphH);

        // Plot 245-day pulsation sine curve
        ctx.beginPath();
        ctx.strokeStyle = '#ff7050';
        ctx.lineWidth = 1.5;
        for (let gx = 0; gx < width - 32; gx += 2) {
          const sampleProg = gx / (width - 32);
          const sampleOsc = Math.sin(sampleProg * Math.PI * 2);
          // Brightest (top of chart) when osc is +1
          const gy = graphY + graphH * 0.5 - sampleOsc * (graphH * 0.42);
          if (gx === 0) ctx.moveTo(16 + gx, gy);
          else ctx.lineTo(16 + gx, gy);
        }
        ctx.stroke();

        // Scan line for current pulsation phase
        const curPhase = ((t * speedMultiplier) % 10) / 10;
        const scanX = 16 + curPhase * (width - 32);
        ctx.strokeStyle = '#ebd19e';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(scanX, graphY);
        ctx.lineTo(scanX, graphY + graphH);
        ctx.stroke();

        // Live Telemetry text HUD
        ctx.fillStyle = '#ff9980';
        ctx.font = '600 11px system-ui, sans-serif';
        ctx.fillText('PULSATOR: R Draconis (Mira-Class Variable Giant)', 16, 26);
        ctx.fillStyle = 'rgba(245, 239, 226, 0.85)';
        ctx.font = '10px system-ui, sans-serif';
        ctx.fillText(
          `CYCLE: Day ${rd.phaseDays} / 245.6 d  |  RADIUS SWELL: +${((rd.radiusScale - 1) * 100).toFixed(0)}%`,
          16,
          42,
        );
        ctx.fillText(
          `MAGNITUDE: V Mag ${rd.magnitude.toFixed(1)} (6.7 Maxima ↔ 13.2 Minima)`,
          16,
          56,
        );
      }
    },
    [currentStar, speedMultiplier],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let mounted = true;

    const animate = (timestamp: number) => {
      if (!mounted) return;
      if (!lastTimestampRef.current) lastTimestampRef.current = timestamp;
      const dt = (timestamp - lastTimestampRef.current) / 1000;
      lastTimestampRef.current = timestamp;

      if (isPlaying) {
        simTimeRef.current += dt;
      }

      renderSimulation(ctx, canvas.width, canvas.height, simTimeRef.current);
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      mounted = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isPlaying, renderSimulation]);

  return (
    <div className="star-explorer-root">
      {/* Target Selector Tabs */}
      <div className="star-chips-bar" role="tablist" aria-label="Showcase Stars">
        {SHOWCASE_STARS.map((star) => {
          const isActive = star.id === selectedId;
          return (
            <button
              key={star.id}
              role="tab"
              aria-selected={isActive}
              type="button"
              className={`star-chip${isActive ? ' star-chip--active' : ''}`}
              onClick={() => setSelectedId(star.id)}
            >
              <span className="star-chip-name">{star.shortName}</span>
              <span className="star-chip-badge">{star.badge}</span>
            </button>
          );
        })}
      </div>

      {/* Active Target Console Card */}
      <div className="star-active-card">
        <div className="star-active-header">
          <div className="star-active-meta">
            <span className="star-kicker">{currentStar.category}</span>
            <h3 className="star-name">{currentStar.name}</h3>
            <p className="star-tagline">{currentStar.tagline}</p>
          </div>
          <button
            type="button"
            className="star-warp-btn"
            onClick={() => handleLaunchWarp(currentStar)}
            title="Launch 3D warp jump and load star telemetry into simulator"
          >
            <svg viewBox="0 0 24 24" className="star-warp-icon" aria-hidden="true">
              <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" />
            </svg>
            Try in Simulator
          </button>
        </div>

        {/* Live Dynamics Simulation Screen */}
        <div className="star-sim-container">
          <canvas
            ref={canvasRef}
            width={620}
            height={260}
            className="star-sim-canvas"
            aria-label={`${currentStar.name} live dynamics simulation`}
          />
          <div className="star-sim-toolbar">
            <div className="star-sim-controls">
              <button
                type="button"
                className="star-sim-btn"
                onClick={() => setIsPlaying((p) => !p)}
                aria-label={isPlaying ? 'Pause simulation' : 'Play simulation'}
              >
                {isPlaying ? '❚❚ Pause' : '▶ Play'}
              </button>
              <button
                type="button"
                className="star-sim-btn"
                onClick={handleSpeedToggle}
                title="Toggle time-lapse acceleration"
              >
                Speed: {speedMultiplier}×
              </button>
              <button
                type="button"
                className="star-sim-btn"
                onClick={handleResetSim}
                title="Reset simulation loop"
              >
                Reset
              </button>
            </div>
            <span className="star-sim-indicator">
              <span className="star-live-dot" /> Live Astronomical Model
            </span>
          </div>
        </div>

        {/* Astrometric & Spectral Telemetry Grid */}
        <div className="star-data-grid">
          <div className="star-data-cell">
            <span className="star-data-label">Right Ascension</span>
            <span className="star-data-val star-data-val--mono">{currentStar.coordinates.ra}</span>
          </div>
          <div className="star-data-cell">
            <span className="star-data-label">Declination</span>
            <span className="star-data-val star-data-val--mono">{currentStar.coordinates.dec}</span>
          </div>
          <div className="star-data-cell">
            <span className="star-data-label">Distance / Field</span>
            <span className="star-data-val">
              {currentStar.coordinates.distance} · {currentStar.coordinates.constellation}
            </span>
          </div>
          <div className="star-data-cell">
            <span className="star-data-label">Dynamics / Class</span>
            <span className="star-data-val star-data-val--highlight">
              {currentStar.metrics.motionOrPeriod}
            </span>
          </div>
        </div>

        <p className="star-summary-text">{currentStar.summary}</p>
        <p className="star-detail-text">
          <strong className="star-detail-lead">SPHEREx Telemetry Note:</strong>{' '}
          {currentStar.scientificDetail}
        </p>

        {warpFeedback && (
          <div className="star-feedback-toast" role="status">
            {warpFeedback}
          </div>
        )}
      </div>
    </div>
  );
}
