"use client";

import { useRef, useEffect, useCallback, useState } from "react";

// ---- Types ----
interface FocusCatcherProps {
  progress: number;
  isComplete: boolean;
}

type GamePhase = "idle" | "playing" | "levelup" | "gameover";
type TargetType = "runner" | "cyclist" | "trailer" | "peloton" | "golden";
type ObstacleType = "spectator" | "pigeon" | "adPanel";
type PowerUpType = "burst" | "wideAngle" | "slowMotion" | "autoFocus";
type ShotQuality = "perfect" | "net" | "blur" | "miss";

interface Target {
  x: number;
  y: number;
  w: number;
  h: number;
  type: TargetType;
  speed: number;
  points: number;
  direction: number; // 1 = left-to-right, -1 = right-to-left
  sinOffset: number; // for trailer vertical movement
  sinAmplitude: number;
  baseY: number;
  blinkTimer: number; // for golden bib
  alive: boolean;
  pelotonIndex?: number; // index within peloton group
}

interface Obstacle {
  x: number;
  y: number;
  w: number;
  h: number;
  type: ObstacleType;
  speed: number;
  direction: number;
  alive: boolean;
  penalty: number;
  panelTimer: number; // for ad panel reveal/hide
  panelAlpha: number;
}

interface ShotEffect {
  x: number;
  y: number;
  quality: ShotQuality;
  points: number;
  timer: number;
  combo: number;
}

interface FlashEffect {
  timer: number;
  alpha: number;
}

interface PowerUp {
  type: PowerUpType;
  timer: number;
  duration: number;
}

interface GameStats {
  perfect: number;
  net: number;
  blur: number;
  miss: number;
  bestCombo: number;
  maxLevel: number;
  totalPoints: number;
}

interface GameData {
  phase: GamePhase;
  targets: Target[];
  obstacles: Obstacle[];
  shotEffects: ShotEffect[];
  flash: FlashEffect;
  score: number;
  combo: number;
  comboMultiplier: number;
  level: number;
  levelTimer: number;
  levelDuration: number;
  levelTransitionTimer: number;
  mouseX: number;
  mouseY: number;
  mouseInCanvas: boolean;
  powerUp: PowerUp | null;
  burstShots: number;
  stats: GameStats;
  spawnTimer: number;
  spawnInterval: number;
  obstacleSpawnTimer: number;
  canvasW: number;
  canvasH: number;
  viewfinderRadius: number;
  lastTime: number;
  shakeTimer: number;
  shakeIntensity: number;
}

// ---- Constants ----
const CANVAS_H = 400;
const MAX_CANVAS_W = 896;
const GROUND_Y = 340;
const LEVEL_DURATION = 30000; // 30s per level
const LEVEL_TRANSITION = 2000; // 2s transition
const VIEWFINDER_BASE_RADIUS = 30;

const LEVEL_NAMES = [
  "Echauffement",
  "5 km",
  "10 km",
  "Semi-Marathon",
  "Marathon",
  "Ultra Trail",
  "Ironman",
  "Legende",
];

const COMBO_THRESHOLDS = [
  { min: 0, multiplier: 1 },
  { min: 5, multiplier: 2 },
  { min: 10, multiplier: 3 },
  { min: 20, multiplier: 5 },
  { min: 50, multiplier: 10 },
];

const POWERUP_NAMES: Record<PowerUpType, string> = {
  burst: "Rafale",
  wideAngle: "Grand Angle",
  slowMotion: "Slow Motion",
  autoFocus: "Autofocus",
};

const POWERUP_DURATIONS: Record<PowerUpType, number> = {
  burst: 0,
  wideAngle: 8000,
  slowMotion: 5000,
  autoFocus: 5000,
};

const TITLE_THRESHOLDS = [
  { min: 0, title: "Photographe du Dimanche" },
  { min: 1000, title: "Amateur Prometteur" },
  { min: 3000, title: "Pro en Herbe" },
  { min: 6000, title: "Oeil Affute" },
  { min: 10000, title: "Sniper du Dossard" },
  { min: 20000, title: "Oeil de Lynx" },
  { min: 50000, title: "Focus Legend" },
];

// ---- Helpers ----
function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function randInt(min: number, max: number) {
  return Math.floor(rand(min, max + 1));
}

function getComboMultiplier(combo: number): number {
  let mult = 1;
  for (const t of COMBO_THRESHOLDS) {
    if (combo >= t.min) mult = t.multiplier;
  }
  return mult;
}

function getTitle(score: number): string {
  let title = TITLE_THRESHOLDS[0].title;
  for (const t of TITLE_THRESHOLDS) {
    if (score >= t.min) title = t.title;
  }
  return title;
}

function createGame(w: number, h: number): GameData {
  return {
    phase: "idle",
    targets: [],
    obstacles: [],
    shotEffects: [],
    flash: { timer: 0, alpha: 0 },
    score: 0,
    combo: 0,
    comboMultiplier: 1,
    level: 1,
    levelTimer: 0,
    levelDuration: LEVEL_DURATION,
    levelTransitionTimer: 0,
    mouseX: w / 2,
    mouseY: h / 2,
    mouseInCanvas: false,
    powerUp: null,
    burstShots: 0,
    stats: { perfect: 0, net: 0, blur: 0, miss: 0, bestCombo: 0, maxLevel: 1, totalPoints: 0 },
    spawnTimer: 0,
    spawnInterval: 2000,
    obstacleSpawnTimer: 0,
    canvasW: w,
    canvasH: h,
    viewfinderRadius: VIEWFINDER_BASE_RADIUS,
    lastTime: 0,
    shakeTimer: 0,
    shakeIntensity: 0,
  };
}

function spawnTarget(g: GameData): Target | null {
  const level = g.level;
  const types: TargetType[] = ["runner"];
  if (level >= 2) types.push("cyclist");
  if (level >= 3) types.push("trailer");
  if (level >= 4) types.push("peloton");
  if (level >= 2 && Math.random() < 0.08) types.push("golden");

  const type = types[randInt(0, types.length - 1)];
  const fromRight = level >= 5 ? Math.random() < 0.4 : false;
  const direction = fromRight ? -1 : 1;
  const x = fromRight ? g.canvasW + 40 : -60;

  switch (type) {
    case "runner": {
      const y = GROUND_Y - rand(30, 50);
      return {
        x, y, w: 28, h: 44, type, speed: rand(1.5, 2.5) * (1 + level * 0.1),
        points: 100, direction, sinOffset: 0, sinAmplitude: 0, baseY: y,
        blinkTimer: 0, alive: true,
      };
    }
    case "cyclist": {
      const y = GROUND_Y - rand(25, 40);
      return {
        x, y, w: 40, h: 35, type, speed: rand(3, 4.5) * (1 + level * 0.08),
        points: 150, direction, sinOffset: 0, sinAmplitude: 0, baseY: y,
        blinkTimer: 0, alive: true,
      };
    }
    case "trailer": {
      const baseY = GROUND_Y - rand(50, 90);
      return {
        x, y: baseY, w: 30, h: 48, type, speed: rand(1, 1.8) * (1 + level * 0.05),
        points: 75, direction, sinOffset: rand(0, Math.PI * 2), sinAmplitude: rand(15, 30),
        baseY, blinkTimer: 0, alive: true,
      };
    }
    case "peloton": {
      const baseX = fromRight ? g.canvasW + 40 : -120;
      const baseY = GROUND_Y - rand(30, 45);
      const count = randInt(3, 5);
      const targets: Target[] = [];
      for (let i = 0; i < count; i++) {
        targets.push({
          x: baseX + i * 25 * direction * -1,
          y: baseY + rand(-8, 8),
          w: 24, h: 40, type: "peloton", speed: rand(2, 3) * (1 + level * 0.08),
          points: 50, direction, sinOffset: 0, sinAmplitude: 0,
          baseY: baseY + rand(-8, 8), blinkTimer: 0, alive: true,
          pelotonIndex: i,
        });
      }
      g.targets.push(...targets);
      return null; // already added
    }
    case "golden": {
      const y = GROUND_Y - rand(40, 100);
      return {
        x, y, w: 26, h: 42, type, speed: rand(4, 6) * (1 + level * 0.1),
        points: 500, direction, sinOffset: 0, sinAmplitude: 0, baseY: y,
        blinkTimer: 0, alive: true,
      };
    }
  }
}

function spawnObstacle(g: GameData): Obstacle | null {
  if (g.level < 2) return null;
  const types: ObstacleType[] = ["spectator", "pigeon"];
  if (g.level >= 4) types.push("adPanel");

  const type = types[randInt(0, types.length - 1)];
  const fromRight = Math.random() < 0.5;
  const direction = fromRight ? -1 : 1;
  const x = fromRight ? g.canvasW + 30 : -50;

  switch (type) {
    case "spectator": {
      const y = GROUND_Y - rand(35, 55);
      return {
        x, y, w: 24, h: 50, type, speed: rand(0.8, 1.5),
        direction, alive: true, penalty: -50, panelTimer: 0, panelAlpha: 0,
      };
    }
    case "pigeon": {
      const y = GROUND_Y - rand(60, 120);
      return {
        x, y, w: 20, h: 16, type, speed: rand(1.5, 3),
        direction, alive: true, penalty: -30, panelTimer: 0, panelAlpha: 0,
      };
    }
    case "adPanel": {
      const y = rand(60, GROUND_Y - 100);
      const panelX = rand(100, g.canvasW - 200);
      return {
        x: panelX, y, w: rand(120, 200), h: rand(80, 120), type,
        speed: 0, direction: 0, alive: true, penalty: 0,
        panelTimer: rand(3000, 6000), panelAlpha: 0,
      };
    }
  }
}

function evaluateShot(
  g: GameData,
  mx: number,
  my: number
): { target: Target | Obstacle | null; quality: ShotQuality; points: number } {
  const vr = g.viewfinderRadius * (g.powerUp?.type === "wideAngle" ? 2 : 1);
  const autoFocus = g.powerUp?.type === "autoFocus";

  // Check obstacles first (penalty)
  for (const o of g.obstacles) {
    if (!o.alive || o.type === "adPanel") continue;
    const cx = o.x + o.w / 2;
    const cy = o.y + o.h / 2;
    const dist = Math.sqrt((mx - cx) ** 2 + (my - cy) ** 2);
    if (dist < vr + Math.max(o.w, o.h) / 2) {
      return { target: o, quality: "miss", points: o.penalty };
    }
  }

  // Check targets
  let bestTarget: Target | null = null;
  let bestDist = Infinity;
  let bestQuality: ShotQuality = "miss";

  for (const t of g.targets) {
    if (!t.alive) continue;
    const cx = t.x + t.w / 2;
    const cy = t.y + t.h / 2;
    const dist = Math.sqrt((mx - cx) ** 2 + (my - cy) ** 2);
    const hitRadius = Math.max(t.w, t.h) / 2;

    if (dist < hitRadius * 0.4 || autoFocus) {
      if (dist < bestDist || autoFocus) {
        bestTarget = t;
        bestDist = autoFocus ? 0 : dist;
        bestQuality = "perfect";
      }
    } else if (dist < hitRadius * 1.0) {
      if (dist < bestDist) {
        bestTarget = t;
        bestDist = dist;
        bestQuality = "net";
      }
    } else if (dist < hitRadius * 1.8 + vr * 0.5) {
      if (dist < bestDist) {
        bestTarget = t;
        bestDist = dist;
        bestQuality = "blur";
      }
    }
  }

  if (bestTarget) {
    let points = 0;
    switch (bestQuality) {
      case "perfect": points = bestTarget.points; break;
      case "net": points = Math.round(bestTarget.points * 0.5); break;
      case "blur": points = Math.round(bestTarget.points * 0.1); break;
    }
    return { target: bestTarget, quality: bestQuality, points };
  }

  return { target: null, quality: "miss", points: -20 };
}

function handleShot(g: GameData) {
  if (g.phase !== "playing") return;

  const mx = g.mouseX;
  const my = g.mouseY;
  const result = evaluateShot(g, mx, my);

  // Flash effect
  g.flash = { timer: 150, alpha: 0.6 };

  const multiplier = g.comboMultiplier;
  let finalPoints = result.points;

  if (result.quality === "perfect" || result.quality === "net") {
    finalPoints = result.points * multiplier;
    g.combo++;
    g.comboMultiplier = getComboMultiplier(g.combo);
    if (g.combo > g.stats.bestCombo) g.stats.bestCombo = g.combo;
  } else if (result.quality === "miss") {
    g.combo = 0;
    g.comboMultiplier = 1;
  }
  // blur: don't break combo, don't increment

  g.score += finalPoints;
  if (g.score < 0) g.score = 0;
  g.stats.totalPoints += Math.max(0, finalPoints);

  // Stats
  switch (result.quality) {
    case "perfect": g.stats.perfect++; break;
    case "net": g.stats.net++; break;
    case "blur": g.stats.blur++; break;
    case "miss": g.stats.miss++; break;
  }

  // Shot effect
  g.shotEffects.push({
    x: mx, y: my, quality: result.quality,
    points: finalPoints, timer: 1200, combo: multiplier,
  });

  // Kill target
  if (result.target && "points" in result.target && (result.target as Target).alive) {
    (result.target as Target).alive = false;
    // Check peloton bonus
    if ((result.target as Target).type === "peloton") {
      const aliveInPeloton = g.targets.filter(
        (t) => t.type === "peloton" && t.alive && t.pelotonIndex !== undefined
      );
      if (aliveInPeloton.length === 0) {
        const bonus = 300 * multiplier;
        g.score += bonus;
        g.stats.totalPoints += bonus;
        g.shotEffects.push({
          x: mx, y: my - 30, quality: "perfect",
          points: bonus, timer: 1500, combo: multiplier,
        });
      }
    }
    // Golden bib = power-up
    if ((result.target as Target).type === "golden") {
      const types: PowerUpType[] = ["burst", "wideAngle", "slowMotion", "autoFocus"];
      const puType = types[randInt(0, types.length - 1)];
      if (puType === "burst") {
        g.burstShots = 3;
      } else {
        g.powerUp = { type: puType, timer: POWERUP_DURATIONS[puType], duration: POWERUP_DURATIONS[puType] };
      }
    }
  }

  // Kill obstacle if shot
  if (result.target && "penalty" in result.target && (result.target as Obstacle).type !== "adPanel") {
    (result.target as Obstacle).alive = false;
  }

  // Screen shake for miss
  if (result.quality === "miss") {
    g.shakeTimer = 200;
    g.shakeIntensity = 3;
  }
}

// ---- Drawing helpers ----
function drawViewfinder(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, _combo: number) {
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.8)";
  ctx.lineWidth = 1.5;

  // Outer circle
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.stroke();

  // Inner circle
  ctx.beginPath();
  ctx.arc(x, y, radius * 0.4, 0, Math.PI * 2);
  ctx.stroke();

  // Crosshair lines
  const gap = radius * 0.2;
  ctx.beginPath();
  ctx.moveTo(x - radius, y);
  ctx.lineTo(x - gap, y);
  ctx.moveTo(x + gap, y);
  ctx.lineTo(x + radius, y);
  ctx.moveTo(x, y - radius);
  ctx.lineTo(x, y - gap);
  ctx.moveTo(x, y + gap);
  ctx.lineTo(x, y + radius);
  ctx.stroke();

  // Corner brackets
  const bLen = radius * 0.25;
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(16,185,129,0.9)";
  // top-left
  ctx.beginPath();
  ctx.moveTo(x - radius, y - radius + bLen);
  ctx.lineTo(x - radius, y - radius);
  ctx.lineTo(x - radius + bLen, y - radius);
  ctx.stroke();
  // top-right
  ctx.beginPath();
  ctx.moveTo(x + radius - bLen, y - radius);
  ctx.lineTo(x + radius, y - radius);
  ctx.lineTo(x + radius, y - radius + bLen);
  ctx.stroke();
  // bottom-left
  ctx.beginPath();
  ctx.moveTo(x - radius, y + radius - bLen);
  ctx.lineTo(x - radius, y + radius);
  ctx.lineTo(x - radius + bLen, y + radius);
  ctx.stroke();
  // bottom-right
  ctx.beginPath();
  ctx.moveTo(x + radius - bLen, y + radius);
  ctx.lineTo(x + radius, y + radius);
  ctx.lineTo(x + radius, y + radius - bLen);
  ctx.stroke();

  // Center dot
  ctx.fillStyle = "rgba(239,68,68,0.9)";
  ctx.beginPath();
  ctx.arc(x, y, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawRunner(ctx: CanvasRenderingContext2D, t: Target, now: number) {
  const cx = t.x + t.w / 2;
  const legAnim = Math.sin(now * 0.008 + t.sinOffset) * 5;

  // Body
  ctx.fillStyle = "#10B981";
  ctx.fillRect(t.x + 4, t.y + 12, t.w - 8, t.h - 20);

  // Head
  ctx.fillStyle = "#fbbf24";
  ctx.beginPath();
  ctx.arc(cx, t.y + 6, 7, 0, Math.PI * 2);
  ctx.fill();

  // Bib
  ctx.fillStyle = "#fff";
  ctx.fillRect(t.x + 7, t.y + 16, t.w - 14, 12);
  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 8px monospace";
  ctx.textAlign = "center";
  ctx.fillText(String(randInt(1, 999)), cx, t.y + 25);

  // Legs
  ctx.fillStyle = "#064e3b";
  ctx.fillRect(t.x + 6, t.y + t.h - 8, 5, 8 + legAnim);
  ctx.fillRect(t.x + t.w - 11, t.y + t.h - 8, 5, 8 - legAnim);
}

function drawCyclist(ctx: CanvasRenderingContext2D, t: Target, now: number) {
  const cx = t.x + t.w / 2;
  const wheelAnim = (now * 0.02) % (Math.PI * 2);

  // Wheels
  ctx.strokeStyle = "#475569";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(t.x + 8, t.y + t.h - 6, 7, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(t.x + t.w - 8, t.y + t.h - 6, 7, 0, Math.PI * 2);
  ctx.stroke();

  // Spokes
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#64748b";
  for (let i = 0; i < 3; i++) {
    const angle = wheelAnim + (i * Math.PI * 2) / 3;
    ctx.beginPath();
    ctx.moveTo(t.x + 8, t.y + t.h - 6);
    ctx.lineTo(t.x + 8 + Math.cos(angle) * 6, t.y + t.h - 6 + Math.sin(angle) * 6);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(t.x + t.w - 8, t.y + t.h - 6);
    ctx.lineTo(t.x + t.w - 8 + Math.cos(angle) * 6, t.y + t.h - 6 + Math.sin(angle) * 6);
    ctx.stroke();
  }

  // Frame
  ctx.strokeStyle = "#3b82f6";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(t.x + 8, t.y + t.h - 6);
  ctx.lineTo(cx, t.y + 10);
  ctx.lineTo(t.x + t.w - 8, t.y + t.h - 6);
  ctx.stroke();

  // Rider body
  ctx.fillStyle = "#ef4444";
  ctx.fillRect(cx - 6, t.y + 2, 12, 14);

  // Helmet
  ctx.fillStyle = "#e2e8f0";
  ctx.beginPath();
  ctx.arc(cx, t.y, 5, 0, Math.PI * 2);
  ctx.fill();
}

function drawTrailer(ctx: CanvasRenderingContext2D, t: Target, now: number) {
  const cx = t.x + t.w / 2;
  const breathe = Math.sin(now * 0.003) * 2;

  // Body (hiking/trail style)
  ctx.fillStyle = "#a855f7";
  ctx.fillRect(t.x + 3, t.y + 14 + breathe, t.w - 6, t.h - 22);

  // Head with headband
  ctx.fillStyle = "#fbbf24";
  ctx.beginPath();
  ctx.arc(cx, t.y + 8, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ef4444";
  ctx.fillRect(t.x + 5, t.y + 4, t.w - 10, 3);

  // Backpack
  ctx.fillStyle = "#7c3aed";
  ctx.fillRect(t.x + t.w - 4, t.y + 14, 6, 18);

  // Hiking poles
  ctx.strokeStyle = "#94a3b8";
  ctx.lineWidth = 1.5;
  const poleAnim = Math.sin(now * 0.006) * 8;
  ctx.beginPath();
  ctx.moveTo(t.x, t.y + 20);
  ctx.lineTo(t.x - 6, t.y + t.h + poleAnim);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(t.x + t.w, t.y + 20);
  ctx.lineTo(t.x + t.w + 6, t.y + t.h - poleAnim);
  ctx.stroke();

  // Legs
  ctx.fillStyle = "#581c87";
  ctx.fillRect(t.x + 5, t.y + t.h - 10, 5, 10 + breathe);
  ctx.fillRect(t.x + t.w - 10, t.y + t.h - 10, 5, 10 - breathe);
}

function drawGolden(ctx: CanvasRenderingContext2D, t: Target, now: number) {
  const cx = t.x + t.w / 2;
  const blink = Math.sin(now * 0.01) > 0;

  if (!blink) {
    ctx.globalAlpha = 0.4;
  }

  // Glow
  ctx.shadowColor = "#fbbf24";
  ctx.shadowBlur = 15;

  // Body (golden)
  ctx.fillStyle = "#fbbf24";
  ctx.fillRect(t.x + 4, t.y + 12, t.w - 8, t.h - 20);

  // Head
  ctx.fillStyle = "#fde68a";
  ctx.beginPath();
  ctx.arc(cx, t.y + 6, 7, 0, Math.PI * 2);
  ctx.fill();

  // Star on chest
  ctx.fillStyle = "#b45309";
  ctx.font = "bold 14px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("\u2605", cx, t.y + 26);

  // Legs
  ctx.fillStyle = "#92400e";
  const legAnim = Math.sin(now * 0.012) * 5;
  ctx.fillRect(t.x + 6, t.y + t.h - 8, 5, 8 + legAnim);
  ctx.fillRect(t.x + t.w - 11, t.y + t.h - 8, 5, 8 - legAnim);

  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
}

function drawSpectator(ctx: CanvasRenderingContext2D, o: Obstacle) {
  const cx = o.x + o.w / 2;

  // Body
  ctx.fillStyle = "#64748b";
  ctx.fillRect(o.x + 3, o.y + 14, o.w - 6, o.h - 20);

  // Head
  ctx.fillStyle = "#fbbf24";
  ctx.beginPath();
  ctx.arc(cx, o.y + 8, 7, 0, Math.PI * 2);
  ctx.fill();

  // Phone (held up)
  ctx.fillStyle = "#1e293b";
  ctx.fillRect(o.x + o.w - 2, o.y + 6, 8, 14);
  ctx.fillStyle = "#60a5fa";
  ctx.fillRect(o.x + o.w, o.y + 8, 4, 10);

  // Warning indicator
  ctx.fillStyle = "#ef4444";
  ctx.font = "bold 10px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("!", cx, o.y - 4);
}

function drawPigeon(ctx: CanvasRenderingContext2D, o: Obstacle, now: number) {
  const cx = o.x + o.w / 2;
  const cy = o.y + o.h / 2;
  const wingFlap = Math.sin(now * 0.015) * 4;

  // Body
  ctx.fillStyle = "#94a3b8";
  ctx.beginPath();
  ctx.ellipse(cx, cy, o.w / 2, o.h / 2.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Wings
  ctx.fillStyle = "#64748b";
  ctx.beginPath();
  ctx.ellipse(cx - 4, cy - 4, 8, 3 + wingFlap, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + 4, cy - 4, 8, 3 - wingFlap, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Head
  ctx.fillStyle = "#475569";
  ctx.beginPath();
  ctx.arc(cx + 6 * o.direction, cy - 2, 3, 0, Math.PI * 2);
  ctx.fill();

  // Beak
  ctx.fillStyle = "#f97316";
  ctx.beginPath();
  ctx.moveTo(cx + 8 * o.direction, cy - 2);
  ctx.lineTo(cx + 12 * o.direction, cy - 1);
  ctx.lineTo(cx + 8 * o.direction, cy);
  ctx.fill();
}

function drawAdPanel(ctx: CanvasRenderingContext2D, o: Obstacle) {
  if (o.panelAlpha <= 0) return;

  ctx.save();
  ctx.globalAlpha = o.panelAlpha;
  ctx.fillStyle = "#1e293b";
  ctx.fillRect(o.x, o.y, o.w, o.h);
  ctx.strokeStyle = "#475569";
  ctx.lineWidth = 2;
  ctx.strokeRect(o.x, o.y, o.w, o.h);

  ctx.fillStyle = "#f97316";
  ctx.font = "bold 14px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("PUB", o.x + o.w / 2, o.y + o.h / 2 - 8);
  ctx.fillStyle = "#94a3b8";
  ctx.font = "11px sans-serif";
  ctx.fillText("SPONSOR", o.x + o.w / 2, o.y + o.h / 2 + 10);
  ctx.restore();
}

function drawBackground(ctx: CanvasRenderingContext2D, W: number, H: number, level: number) {
  // Sky
  const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
  if (level <= 2) {
    skyGrad.addColorStop(0, "#0ea5e9");
    skyGrad.addColorStop(1, "#bae6fd");
  } else if (level <= 4) {
    skyGrad.addColorStop(0, "#0284c7");
    skyGrad.addColorStop(1, "#7dd3fc");
  } else if (level <= 6) {
    skyGrad.addColorStop(0, "#1e3a5f");
    skyGrad.addColorStop(1, "#475569");
  } else {
    skyGrad.addColorStop(0, "#0f172a");
    skyGrad.addColorStop(1, "#1e293b");
  }
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, W, H);

  // Mountains/hills
  ctx.fillStyle = level <= 4 ? "#22c55e" : level <= 6 ? "#365314" : "#1e293b";
  for (let i = 0; i < W + 120; i += 120) {
    ctx.beginPath();
    ctx.moveTo(i, GROUND_Y);
    const peak = GROUND_Y - rand(40, 80);
    ctx.quadraticCurveTo(i + 60, peak, i + 120, GROUND_Y);
    ctx.fill();
  }

  // Foreground hills
  ctx.fillStyle = level <= 4 ? "#16a34a" : level <= 6 ? "#1a2e05" : "#0f172a";
  for (let i = 0; i < W + 80; i += 80) {
    ctx.beginPath();
    ctx.moveTo(i, GROUND_Y);
    ctx.quadraticCurveTo(i + 40, GROUND_Y - rand(15, 35), i + 80, GROUND_Y);
    ctx.fill();
  }

  // Road/track
  ctx.fillStyle = "#475569";
  ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);

  // Road lines
  ctx.strokeStyle = "rgba(255,255,255,0.3)";
  ctx.lineWidth = 2;
  ctx.setLineDash([20, 15]);
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y + 20);
  ctx.lineTo(W, GROUND_Y + 20);
  ctx.stroke();
  ctx.setLineDash([]);

  // Road edge
  ctx.fillStyle = "#ef4444";
  ctx.fillRect(0, GROUND_Y, W, 3);

  // Crowd silhouettes along the back
  ctx.fillStyle = "rgba(0,0,0,0.15)";
  for (let i = 0; i < W; i += rand(8, 18)) {
    const h = rand(12, 25);
    ctx.fillRect(i, GROUND_Y - h, 6, h);
  }
}

function drawHUD(
  ctx: CanvasRenderingContext2D,
  g: GameData,
  progress: number,
  W: number
) {
  // Score
  ctx.fillStyle = "#f8fafc";
  ctx.font = "bold 16px monospace";
  ctx.textAlign = "right";
  ctx.fillText(`${Math.floor(g.score)} pts`, W - 12, 24);

  // Combo
  if (g.combo >= 5) {
    ctx.fillStyle = g.combo >= 50 ? "#f43f5e" : g.combo >= 20 ? "#f97316" : g.combo >= 10 ? "#eab308" : "#10b981";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText(`Combo x${g.comboMultiplier} (${g.combo})`, W - 12, 44);
  }

  // Level
  ctx.fillStyle = "#fbbf24";
  ctx.font = "bold 13px sans-serif";
  ctx.textAlign = "left";
  const levelName = LEVEL_NAMES[Math.min(g.level - 1, LEVEL_NAMES.length - 1)];
  ctx.fillText(`Niv. ${g.level} — ${levelName}`, 12, 24);

  // Level timer bar
  const timerFrac = g.levelTimer / g.levelDuration;
  const barW = 120;
  const barH = 4;
  ctx.fillStyle = "rgba(255,255,255,0.15)";
  ctx.fillRect(12, 30, barW, barH);
  ctx.fillStyle = "#fbbf24";
  ctx.fillRect(12, 30, barW * timerFrac, barH);

  // Progress (upload)
  ctx.fillStyle = "rgba(16,185,129,0.9)";
  ctx.font = "bold 12px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`${Math.round(progress)}%`, W / 2, 24);

  // Mini progress bar
  const pBarW = 60;
  ctx.fillStyle = "rgba(255,255,255,0.15)";
  ctx.fillRect(W / 2 - pBarW / 2, 30, pBarW, 4);
  ctx.fillStyle = "#10B981";
  ctx.fillRect(W / 2 - pBarW / 2, 30, pBarW * (progress / 100), 4);

  // Power-up indicator
  if (g.powerUp) {
    const pu = g.powerUp;
    const frac = pu.timer / pu.duration;
    ctx.fillStyle = "#f97316";
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`\u26A1 ${POWERUP_NAMES[pu.type]}`, 12, g.canvasH - 12);
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.fillRect(12, g.canvasH - 6, 80, 3);
    ctx.fillStyle = "#f97316";
    ctx.fillRect(12, g.canvasH - 6, 80 * frac, 3);
  }

  // Burst shots
  if (g.burstShots > 0) {
    ctx.fillStyle = "#f43f5e";
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(`Rafale: ${g.burstShots}`, W - 12, g.canvasH - 12);
  }
}

function drawShotEffects(ctx: CanvasRenderingContext2D, effects: ShotEffect[]) {
  for (const e of effects) {
    const frac = e.timer / 1200;
    const yOff = (1 - frac) * -40;
    ctx.globalAlpha = frac;

    let color = "#ef4444"; // miss
    let label = "Rate !";
    if (e.quality === "perfect") {
      color = "#10b981";
      label = "Parfait !";
    } else if (e.quality === "net") {
      color = "#3b82f6";
      label = "Net !";
    } else if (e.quality === "blur") {
      color = "#eab308";
      label = "Flou";
    }

    ctx.fillStyle = color;
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(label, e.x, e.y + yOff);

    const pointStr = e.points > 0 ? `+${e.points}` : String(e.points);
    ctx.font = "bold 11px monospace";
    ctx.fillText(pointStr, e.x, e.y + yOff + 16);

    if (e.combo > 1) {
      ctx.font = "bold 10px sans-serif";
      ctx.fillStyle = "#f97316";
      ctx.fillText(`x${e.combo}`, e.x, e.y + yOff + 28);
    }

    ctx.globalAlpha = 1;
  }
}

function drawOverlay(ctx: CanvasRenderingContext2D, W: number, H: number, lines: string[], subLines?: string[]) {
  ctx.fillStyle = "rgba(15,23,42,0.8)";
  ctx.fillRect(0, 0, W, H);

  ctx.textAlign = "center";
  let y = H / 2 - ((lines.length + (subLines?.length || 0)) * 20) / 2;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (i === 0) {
      ctx.fillStyle = "#10B981";
      ctx.font = "bold 22px sans-serif";
    } else if (line.includes("Score") || line.includes("pts")) {
      ctx.fillStyle = "#fbbf24";
      ctx.font = "bold 18px sans-serif";
    } else {
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "14px sans-serif";
    }
    ctx.fillText(line, W / 2, y + i * 22);
  }

  if (subLines) {
    y += lines.length * 22 + 10;
    for (let i = 0; i < subLines.length; i++) {
      ctx.fillStyle = "#94a3b8";
      ctx.font = "12px sans-serif";
      ctx.fillText(subLines[i], W / 2, y + i * 18);
    }
  }
}

function drawGameOverScreen(ctx: CanvasRenderingContext2D, g: GameData, W: number, H: number, isUploadComplete: boolean) {
  ctx.fillStyle = "rgba(15,23,42,0.9)";
  ctx.fillRect(0, 0, W, H);

  const title = isUploadComplete ? "Traitement termine !" : getTitle(g.score);
  const centerX = W / 2;
  let y = 50;

  // Title
  ctx.fillStyle = "#10B981";
  ctx.font = "bold 24px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(title, centerX, y);
  y += 40;

  // Score
  ctx.fillStyle = "#fbbf24";
  ctx.font = "bold 20px monospace";
  ctx.fillText(`${Math.floor(g.score)} pts`, centerX, y);
  y += 35;

  // Stats grid
  const stats = [
    { label: "Parfait", value: g.stats.perfect, color: "#10b981" },
    { label: "Net", value: g.stats.net, color: "#3b82f6" },
    { label: "Flou", value: g.stats.blur, color: "#eab308" },
    { label: "Rate", value: g.stats.miss, color: "#ef4444" },
  ];

  const gridW = 280;
  const startX = centerX - gridW / 2;
  const colW = gridW / 4;

  for (let i = 0; i < stats.length; i++) {
    const sx = startX + i * colW + colW / 2;
    ctx.fillStyle = stats[i].color;
    ctx.font = "bold 22px monospace";
    ctx.fillText(String(stats[i].value), sx, y);
    ctx.fillStyle = "#94a3b8";
    ctx.font = "10px sans-serif";
    ctx.fillText(stats[i].label, sx, y + 16);
  }
  y += 45;

  // Best combo & level
  ctx.fillStyle = "#e2e8f0";
  ctx.font = "14px sans-serif";
  ctx.fillText(`Meilleur combo : x${getComboMultiplier(g.stats.bestCombo)} (${g.stats.bestCombo})`, centerX, y);
  y += 22;
  ctx.fillText(`Niveau max : ${g.stats.maxLevel} — ${LEVEL_NAMES[Math.min(g.stats.maxLevel - 1, LEVEL_NAMES.length - 1)]}`, centerX, y);
  y += 35;

  // Restart instruction
  if (!isUploadComplete) {
    ctx.fillStyle = "#94a3b8";
    ctx.font = "13px sans-serif";
    ctx.fillText("Cliquez pour rejouer", centerX, y);
  }
}

// ---- Main Component ----
export default function FocusCatcher({ progress, isComplete }: FocusCatcherProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<GameData>(createGame(MAX_CANVAS_W, CANVAS_H));
  const rafRef = useRef<number>(0);
  const progressRef = useRef(progress);
  const completeRef = useRef(isComplete);
  const [, forceUpdate] = useState(0);

  progressRef.current = progress;
  completeRef.current = isComplete;

  const startGame = useCallback(() => {
    const g = gameRef.current;
    if (completeRef.current && g.phase === "gameover") return;
    Object.assign(g, {
      phase: "playing" as GamePhase,
      targets: [],
      obstacles: [],
      shotEffects: [],
      score: 0,
      combo: 0,
      comboMultiplier: 1,
      level: 1,
      levelTimer: 0,
      levelTransitionTimer: 0,
      powerUp: null,
      burstShots: 0,
      spawnTimer: 0,
      spawnInterval: 2000,
      obstacleSpawnTimer: 0,
      flash: { timer: 0, alpha: 0 },
      shakeTimer: 0,
      shakeIntensity: 0,
      stats: { perfect: 0, net: 0, blur: 0, miss: 0, bestCombo: 0, maxLevel: 1, totalPoints: 0 },
      lastTime: performance.now(),
    });
  }, []);

  // Mouse/touch handlers
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const getCanvasPos = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
      };
    };

    const handleMouseMove = (e: MouseEvent) => {
      const pos = getCanvasPos(e.clientX, e.clientY);
      gameRef.current.mouseX = pos.x;
      gameRef.current.mouseY = pos.y;
    };

    const handleMouseEnter = () => {
      gameRef.current.mouseInCanvas = true;
    };

    const handleMouseLeave = () => {
      gameRef.current.mouseInCanvas = false;
    };

    const handleClick = (e: MouseEvent) => {
      e.preventDefault();
      const g = gameRef.current;
      if (g.phase === "idle" || g.phase === "gameover") {
        startGame();
        return;
      }
      if (g.phase === "playing") {
        const pos = getCanvasPos(e.clientX, e.clientY);
        g.mouseX = pos.x;
        g.mouseY = pos.y;
        handleShot(g);
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const g = gameRef.current;
      const touch = e.touches[0];
      const pos = getCanvasPos(touch.clientX, touch.clientY);
      g.mouseX = pos.x;
      g.mouseY = pos.y;
      g.mouseInCanvas = true;

      if (g.phase === "idle" || g.phase === "gameover") {
        startGame();
        return;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      const pos = getCanvasPos(touch.clientX, touch.clientY);
      gameRef.current.mouseX = pos.x;
      gameRef.current.mouseY = pos.y;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      const g = gameRef.current;
      if (g.phase === "playing") {
        handleShot(g);
      }
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseenter", handleMouseEnter);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    canvas.addEventListener("click", handleClick);
    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("touchend", handleTouchEnd, { passive: false });

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseenter", handleMouseEnter);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      canvas.removeEventListener("click", handleClick);
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
    };
  }, [startGame]);

  // Resize
  useEffect(() => {
    const updateSize = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;
      const w = Math.min(container.clientWidth, MAX_CANVAS_W);
      canvas.width = w;
      canvas.height = CANVAS_H;
      gameRef.current.canvasW = w;
      gameRef.current.canvasH = CANVAS_H;
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Stop on upload complete
  useEffect(() => {
    if (isComplete) {
      const g = gameRef.current;
      if (g.phase === "playing" || g.phase === "levelup") {
        g.phase = "gameover";
        forceUpdate((n) => n + 1);
      }
    }
  }, [isComplete]);

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const loop = () => {
      const g = gameRef.current;
      const now = performance.now();
      const dt = g.lastTime > 0 ? Math.min(now - g.lastTime, 50) : 16;
      g.lastTime = now;
      const W = g.canvasW;
      const H = g.canvasH;

      const timeScale = g.powerUp?.type === "slowMotion" ? 0.5 : 1;
      const scaledDt = dt * timeScale;

      // ---- UPDATE ----
      if (g.phase === "playing") {
        // Level timer
        g.levelTimer += dt;
        if (g.levelTimer >= g.levelDuration) {
          g.level++;
          if (g.level > g.stats.maxLevel) g.stats.maxLevel = g.level;
          g.levelTimer = 0;
          g.levelTransitionTimer = LEVEL_TRANSITION;
          g.phase = "levelup";
          // Increase difficulty
          g.spawnInterval = Math.max(600, 2000 - g.level * 150);
        }

        // Spawn targets
        g.spawnTimer += scaledDt;
        if (g.spawnTimer >= g.spawnInterval) {
          g.spawnTimer = 0;
          const t = spawnTarget(g);
          if (t) g.targets.push(t);
        }

        // Spawn obstacles
        g.obstacleSpawnTimer += scaledDt;
        const obstacleInterval = Math.max(3000, 6000 - g.level * 400);
        if (g.obstacleSpawnTimer >= obstacleInterval) {
          g.obstacleSpawnTimer = 0;
          const o = spawnObstacle(g);
          if (o) g.obstacles.push(o);
        }

        // Update targets
        for (const t of g.targets) {
          if (!t.alive) continue;
          t.x += t.speed * t.direction * (scaledDt / 16);
          if (t.type === "trailer") {
            t.sinOffset += 0.003 * scaledDt;
            t.y = t.baseY + Math.sin(t.sinOffset) * t.sinAmplitude;
          }
          if (t.type === "golden") {
            t.blinkTimer += dt;
          }
        }
        // Remove off-screen targets
        g.targets = g.targets.filter(
          (t) => t.alive && t.x > -80 && t.x < W + 80
        );

        // Update obstacles
        for (const o of g.obstacles) {
          if (!o.alive) continue;
          if (o.type === "adPanel") {
            o.panelTimer -= dt;
            if (o.panelTimer <= 0) {
              o.panelAlpha = Math.min(1, o.panelAlpha + dt * 0.002);
              if (o.panelAlpha >= 1) {
                // Stay visible for 3s then fade
                o.panelTimer = -3000;
              }
            }
            if (o.panelTimer < -3000) {
              o.panelAlpha = Math.max(0, o.panelAlpha - dt * 0.003);
              if (o.panelAlpha <= 0) o.alive = false;
            }
          } else {
            o.x += o.speed * o.direction * (scaledDt / 16);
          }
        }
        g.obstacles = g.obstacles.filter(
          (o) => o.alive && (o.type === "adPanel" || (o.x > -60 && o.x < W + 60))
        );

        // Burst auto-shots
        if (g.burstShots > 0 && g.flash.timer <= 0) {
          g.burstShots--;
          handleShot(g);
        }

        // Power-up timer
        if (g.powerUp) {
          g.powerUp.timer -= dt;
          if (g.powerUp.timer <= 0) {
            g.powerUp = null;
          }
        }

        // Wide angle viewfinder
        const targetRadius = VIEWFINDER_BASE_RADIUS * (g.powerUp?.type === "wideAngle" ? 2 : 1);
        g.viewfinderRadius += (targetRadius - g.viewfinderRadius) * 0.1;
      }

      // Level-up transition
      if (g.phase === "levelup") {
        g.levelTransitionTimer -= dt;
        if (g.levelTransitionTimer <= 0) {
          g.phase = "playing";
          g.targets = [];
          g.obstacles = [];
        }
      }

      // Shot effects decay
      for (const e of g.shotEffects) {
        e.timer -= dt;
      }
      g.shotEffects = g.shotEffects.filter((e) => e.timer > 0);

      // Flash decay
      if (g.flash.timer > 0) {
        g.flash.timer -= dt;
        g.flash.alpha = (g.flash.timer / 150) * 0.6;
      }

      // Shake decay
      if (g.shakeTimer > 0) {
        g.shakeTimer -= dt;
      }

      // ---- DRAW ----
      ctx.save();

      // Screen shake
      if (g.shakeTimer > 0) {
        const intensity = g.shakeIntensity * (g.shakeTimer / 200);
        ctx.translate(rand(-intensity, intensity), rand(-intensity, intensity));
      }

      // Background
      drawBackground(ctx, W, H, g.level);

      // Obstacles (behind targets)
      for (const o of g.obstacles) {
        if (!o.alive) continue;
        switch (o.type) {
          case "spectator": drawSpectator(ctx, o); break;
          case "pigeon": drawPigeon(ctx, o, now); break;
          case "adPanel": drawAdPanel(ctx, o); break;
        }
      }

      // Targets
      for (const t of g.targets) {
        if (!t.alive) continue;
        ctx.save();
        if (t.direction === -1) {
          ctx.translate(t.x + t.w, 0);
          ctx.scale(-1, 1);
          const flipped = { ...t, x: 0 };
          switch (t.type) {
            case "runner": drawRunner(ctx, flipped, now); break;
            case "cyclist": drawCyclist(ctx, flipped, now); break;
            case "trailer": drawTrailer(ctx, flipped, now); break;
            case "peloton": drawRunner(ctx, flipped, now); break;
            case "golden": drawGolden(ctx, flipped, now); break;
          }
        } else {
          switch (t.type) {
            case "runner": drawRunner(ctx, t, now); break;
            case "cyclist": drawCyclist(ctx, t, now); break;
            case "trailer": drawTrailer(ctx, t, now); break;
            case "peloton": drawRunner(ctx, t, now); break;
            case "golden": drawGolden(ctx, t, now); break;
          }
        }
        ctx.restore();
      }

      // Flash effect
      if (g.flash.alpha > 0) {
        ctx.fillStyle = `rgba(255,255,255,${g.flash.alpha})`;
        ctx.fillRect(0, 0, W, H);
      }

      // Shot effects
      drawShotEffects(ctx, g.shotEffects);

      // HUD
      if (g.phase === "playing" || g.phase === "levelup") {
        drawHUD(ctx, g, progressRef.current, W);
      }

      // Viewfinder (on top of everything)
      if (g.phase === "playing" && g.mouseInCanvas) {
        drawViewfinder(ctx, g.mouseX, g.mouseY, g.viewfinderRadius, g.combo);
      }

      ctx.restore();

      // Overlays (outside shake transform)
      if (g.phase === "idle") {
        drawOverlay(ctx, W, H, [
          "Focus Catcher",
          "",
          "Capturez les sportifs avec votre viseur !",
        ], [
          "Souris = viseur | Clic = photo",
          "Mobile : touchez et relâchez pour tirer",
          "",
          "Cliquez pour commencer !",
        ]);
      }

      if (g.phase === "levelup") {
        const levelName = LEVEL_NAMES[Math.min(g.level - 1, LEVEL_NAMES.length - 1)];
        drawOverlay(ctx, W, H, [
          `Niveau ${g.level}`,
          levelName,
          "",
          `Score : ${Math.floor(g.score)} pts`,
        ]);
      }

      if (g.phase === "gameover") {
        drawGameOverScreen(ctx, g, W, H, completeRef.current);
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div ref={containerRef} className="w-full max-w-[896px] mx-auto select-none">
      <canvas
        ref={canvasRef}
        className="w-full rounded-xl border border-white/10"
        style={{
          height: `${CANVAS_H}px`,
          cursor: gameRef.current.phase === "playing" ? "none" : "pointer",
        }}
      />
    </div>
  );
}
