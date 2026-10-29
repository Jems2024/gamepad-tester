/* ============================================================
   STEP 3: ADVANCED JOYSTICK DIAGNOSTICS MODULE
   File: advanced-stick-diagnostics.js
   - 5.1 Circularity Test (36 / 72 angular sectors, Math.hypot(x,y), Avg Error %)
     * Strict unsampled sector tracking (null = unsampled, never fabricated)
     * Never marks COMPLETED when angular coverage is insufficient
     * Configurable reference visual classification:
       - Green: 7%–12%
       - Yellow: < 3% or 13%–16%
       - Red: > 17%
       - Intermediate / Indeterminate: 3% to <7%, and >16% to 17%
   - 5.2 Application-Observed Update Frequency (Hz) & Signal Stability
     * Uses performance.now() and gamepad.timestamp (when valid)
     * Distinguishes timing variability (ms) from positional X/Y jitter
     * Detects intentional stick movement and reports "Measurement unstable / Requires steady position"
   ============================================================ */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.AdvancedStickDiagnostics = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const CIRCULARITY_CONFIG = {
    BASE_SECTORS: 36,                // 10° per sector
    HIGH_RES_SECTORS: 72,            // 5° per sector when >= HIGH_RES_MIN_SAMPLES collected
    HIGH_RES_MIN_SAMPLES: 144,       // Minimum perimeter samples to switch to 72-sector resolution
    MIN_PERIMETER_RADIUS: 0.45,      // Minimum deflection radius to count as an outer-perimeter sample
    MIN_COMPLETION_COVERAGE: 0.8888, // At least 32/36 (88.9%) or 64/72 sectors must be actually sampled
    MIN_SAMPLES_FOR_COMPLETION: 36,  // Minimum outer-perimeter samples required before completion
    // Configurable visual classification reference ranges (in %)
    RANGES: {
      YELLOW_LOW_MAX: 3.0,           // < 3% -> Yellow
      INTERMEDIATE_LOW_MAX: 7.0,     // 3% to < 7% -> Intermediate / Indeterminate
      GREEN_MIN: 7.0,                // 7% to 12% -> Green
      GREEN_MAX: 12.0,
      YELLOW_HIGH_MIN: 13.0,         // 13% to 16% -> Yellow
      YELLOW_HIGH_MAX: 16.0,
      INTERMEDIATE_HIGH_MAX: 17.0,   // > 16% through 17% -> Intermediate / Indeterminate
      RED_MIN: 17.0,                 // > 17% -> Red
    }
  };

  const STABILITY_CONFIG = {
    WINDOW_MS: 1000,                 // 1000ms documented sliding window for positional jitter & timing
    MIN_SAMPLES_IN_WINDOW: 15,       // Minimum samples in window to evaluate stability
    STEADY_MAX_PEAK_TO_PEAK: 0.035,  // Max X/Y span allowed for "steady position" jitter test
    LOW_JITTER_STD_THRESHOLD: 0.004, // Positional stdDev threshold for stable signal
    ELEVATED_JITTER_THRESHOLD: 0.012 // Positional stdDev threshold for noisy signal
  };

  function createCircularityStickState() {
    return {
      status: 'PENDING', // 'PENDING' | 'RUNNING' | 'COMPLETED'
      sectors36: new Array(36).fill(null), // null = unsampled sector (never fabricated)
      sectors72: new Array(72).fill(null), // null = unsampled sector
      perimeterSampleCount: 0,
      totalSampleCount: 0,
      trace: [], // [{ x, y, r }]
      currentX: 0,
      currentY: 0,
      currentR: 0,
      activeSectorResolution: 36,
      sampledSectorCount: 0,
      coveragePct: 0,
      avgErrorPct: null,
      classification: 'UNMEASURED', // 'UNMEASURED' | 'GREEN' | 'YELLOW' | 'INTERMEDIATE' | 'RED'
      classificationLabel: 'Pending full 360° rotation',
    };
  }

  function createPollingAndStabilityState() {
    return {
      lastPerfNow: null,
      lastGpTimestamp: null,
      lastAxesSignature: '',
      frameIntervalsMs: [],
      reportIntervalsMs: [],
      usingHardwareTimestamp: false,
      observedHz: null,
      avgIntervalMs: null,
      timingVariabilityMs: null,
      windowSamples: [], // [{ t, lx, ly, rx, ry }] over last 1000ms
      leftJitter: {
        steady: false,
        status: 'WAITING_SAMPLES', // 'WAITING_SAMPLES' | 'UNSTABLE_MOVING' | 'STABLE' | 'MODERATE_NOISE' | 'HIGH_NOISE'
        statusText: 'Waiting for samples…',
        stdX: null,
        stdY: null,
        combinedJitter: null,
      },
      rightJitter: {
        steady: false,
        status: 'WAITING_SAMPLES',
        statusText: 'Waiting for samples…',
        stdX: null,
        stdY: null,
        combinedJitter: null,
      },
      signalStabilityStatus: 'PENDING',
    };
  }

  let state = {
    left: createCircularityStickState(),
    right: createCircularityStickState(),
    polling: createPollingAndStabilityState(),
  };

  /**
   * Classifies radial error (%) according to the configurable reference bands:
   * - Green: 7%–12%
   * - Yellow: < 3%, or 13%–16%
   * - Red: > 17%
   * - Intermediate / Indeterminate: [3%, 7%) and (12%, 13%) and (16%, 17%]
   * Never automatically classifies intermediate values as defective.
   */
  function classifyCircularityError(avgErrorPct, configRanges) {
    if (typeof avgErrorPct !== 'number' || !Number.isFinite(avgErrorPct) || avgErrorPct < 0) {
      return {
        category: 'UNMEASURED',
        badgeClass: 'badge-neutral',
        label: 'Not measured (Insufficient coverage)'
      };
    }

    const r = Object.assign({}, CIRCULARITY_CONFIG.RANGES, configRanges || {});

    if (avgErrorPct >= r.GREEN_MIN && avgErrorPct <= r.GREEN_MAX) {
      return {
        category: 'GREEN',
        badgeClass: 'badge-pass',
        label: 'Reference Band: 7%–12% (Standard Circularity)'
      };
    }

    if (avgErrorPct < r.YELLOW_LOW_MAX) {
      return {
        category: 'YELLOW',
        badgeClass: 'badge-review',
        label: 'Reference Band: < 3% (Clamped / Low Radial Error)'
      };
    }

    if (avgErrorPct >= r.YELLOW_HIGH_MIN && avgErrorPct <= r.YELLOW_HIGH_MAX) {
      return {
        category: 'YELLOW',
        badgeClass: 'badge-review',
        label: 'Reference Band: 13%–16% (Elevated Radial Deviation)'
      };
    }

    if (avgErrorPct > r.RED_MIN) {
      return {
        category: 'RED',
        badgeClass: 'badge-fail',
        label: 'Reference Band: > 17% (High Radial Deviation)'
      };
    }

    // Values from 3% to <7%, (12% to <13%), and >16% through 17%:
    // Clearly defined intermediate/indeterminate category (never classified as defective)
    return {
      category: 'INTERMEDIATE',
      badgeClass: 'badge-testing',
      label: 'Intermediate / Indeterminate Band (Non-defective transitional range)'
    };
  }

  /**
   * Updates circularity state for one stick with an actual (x, y) sample.
   * Formula:
   *   r = Math.hypot(x, y)
   *   Avg Error (%) = (1 / N_sampled) * sum(|r_sector - 1.0|) * 100
   * Unsampled sectors remain null and are never fabricated.
   */
  function updateStickCircularity(stickState, x, y) {
    if (typeof x !== 'number' || typeof y !== 'number' || !Number.isFinite(x) || !Number.isFinite(y)) {
      return stickState;
    }

    const r = Math.hypot(x, y);
    stickState.currentX = x;
    stickState.currentY = y;
    stickState.currentR = r;
    stickState.totalSampleCount++;

    // Keep movement trace for canvas rendering (cap at 500 points for 60fps performance)
    stickState.trace.push({ x, y, r });
    if (stickState.trace.length > 500) {
      stickState.trace.shift();
    }

    // Only record outer-perimeter radial samples when the stick is deflected past MIN_PERIMETER_RADIUS
    if (r >= CIRCULARITY_CONFIG.MIN_PERIMETER_RADIUS) {
      if (stickState.status === 'PENDING') {
        stickState.status = 'RUNNING';
      }
      stickState.perimeterSampleCount++;

      const angleDeg = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
      const idx36 = Math.min(35, Math.floor(angleDeg / 10));
      const idx72 = Math.min(71, Math.floor(angleDeg / 5));

      if (stickState.sectors36[idx36] === null || r > stickState.sectors36[idx36]) {
        stickState.sectors36[idx36] = r;
      }
      if (stickState.sectors72[idx72] === null || r > stickState.sectors72[idx72]) {
        stickState.sectors72[idx72] = r;
      }
    }

    // Select 72 sectors when enough samples are collected AND 72-sector coverage is representative, else 36
    const sampled36 = stickState.sectors36.filter((v) => v !== null);
    const sampled72 = stickState.sectors72.filter((v) => v !== null);

    const use72 =
      stickState.perimeterSampleCount >= CIRCULARITY_CONFIG.HIGH_RES_MIN_SAMPLES &&
      sampled72.length >= Math.ceil(72 * CIRCULARITY_CONFIG.MIN_COMPLETION_COVERAGE);

    const activeSectors = use72 ? stickState.sectors72 : stickState.sectors36;
    const sampledValues = use72 ? sampled72 : sampled36;
    const totalSectors = activeSectors.length;

    stickState.activeSectorResolution = totalSectors;
    stickState.sampledSectorCount = sampledValues.length;
    const coverageRatio = sampledValues.length / totalSectors;
    stickState.coveragePct = Math.round(coverageRatio * 100);

    // Compute Avg Error (%) across sampled sectors
    if (sampledValues.length > 0) {
      let absErrSum = 0;
      for (let i = 0; i < sampledValues.length; i++) {
        absErrSum += Math.abs(sampledValues[i] - 1.0);
      }
      const avgErr = (absErrSum / sampledValues.length) * 100;
      stickState.avgErrorPct = Number(avgErr.toFixed(2));
    } else {
      stickState.avgErrorPct = null;
    }

    // Completion rule: NEVER mark COMPLETED when angular coverage is insufficient!
    const hasSufficientCoverage =
      coverageRatio >= CIRCULARITY_CONFIG.MIN_COMPLETION_COVERAGE &&
      stickState.perimeterSampleCount >= CIRCULARITY_CONFIG.MIN_SAMPLES_FOR_COMPLETION;

    if (hasSufficientCoverage) {
      stickState.status = 'COMPLETED';
      const cls = classifyCircularityError(stickState.avgErrorPct);
      stickState.classification = cls.category;
      stickState.classificationLabel = cls.label;
    } else if (stickState.perimeterSampleCount > 0) {
      stickState.status = 'RUNNING';
      stickState.classification = 'INCOMPLETE_COVERAGE';
      stickState.classificationLabel = `Rotate 360° (${stickState.sampledSectorCount}/${totalSectors} sectors sampled)`;
    } else {
      stickState.status = 'PENDING';
      stickState.classification = 'UNMEASURED';
      stickState.classificationLabel = 'Pending 360° rotation';
    }

    return stickState;
  }

  /**
   * Evaluates positional X/Y dispersion over the 1000ms sliding window.
   * Explicitly checks whether the user is moving the stick vs holding steady.
   */
  function evaluateStickPositionalJitter(samples, xKey, yKey) {
    if (!Array.isArray(samples) || samples.length < STABILITY_CONFIG.MIN_SAMPLES_IN_WINDOW) {
      return {
        steady: false,
        status: 'WAITING_SAMPLES',
        statusText: 'Collecting window samples…',
        stdX: null,
        stdY: null,
        combinedJitter: null,
        spanX: 0,
        spanY: 0,
      };
    }

    let minX = Infinity, maxX = -Infinity, sumX = 0;
    let minY = Infinity, maxY = -Infinity, sumY = 0;
    const n = samples.length;

    for (let i = 0; i < n; i++) {
      const vx = samples[i][xKey];
      const vy = samples[i][yKey];
      if (vx < minX) minX = vx;
      if (vx > maxX) maxX = vx;
      if (vy < minY) minY = vy;
      if (vy > maxY) maxY = vy;
      sumX += vx;
      sumY += vy;
    }

    const spanX = maxX - minX;
    const spanY = maxY - minY;
    const maxSpan = Math.max(spanX, spanY);

    // Distinguish intentional stick movement from steady-state electrical noise
    if (maxSpan > STABILITY_CONFIG.STEADY_MAX_PEAK_TO_PEAK) {
      return {
        steady: false,
        status: 'UNSTABLE_MOVING',
        statusText: 'Measurement unstable — Requires steady position',
        stdX: null,
        stdY: null,
        combinedJitter: null,
        spanX: Number(spanX.toFixed(5)),
        spanY: Number(spanY.toFixed(5)),
      };
    }

    const meanX = sumX / n;
    const meanY = sumY / n;
    let sqX = 0;
    let sqY = 0;
    for (let i = 0; i < n; i++) {
      const dx = samples[i][xKey] - meanX;
      const dy = samples[i][yKey] - meanY;
      sqX += dx * dx;
      sqY += dy * dy;
    }

    const stdX = Math.sqrt(sqX / n);
    const stdY = Math.sqrt(sqY / n);
    const combined = Math.hypot(stdX, stdY);

    let status = 'STABLE';
    let statusText = 'Steady — Low Noise';
    if (combined > STABILITY_CONFIG.ELEVATED_JITTER_THRESHOLD) {
      status = 'HIGH_NOISE';
      statusText = 'Steady — Elevated Axis Noise';
    } else if (combined > STABILITY_CONFIG.LOW_JITTER_STD_THRESHOLD) {
      status = 'MODERATE_NOISE';
      statusText = 'Steady — Minor Jitter';
    }

    return {
      steady: true,
      status,
      statusText,
      stdX: Number(stdX.toFixed(5)),
      stdY: Number(stdY.toFixed(5)),
      combinedJitter: Number(combined.toFixed(5)),
      spanX: Number(spanX.toFixed(5)),
      spanY: Number(spanY.toFixed(5)),
    };
  }

  function updatePollingAndStability(axes, nowMs, gpTimestamp) {
    const p = state.polling;
    const t = typeof nowMs === 'number' && Number.isFinite(nowMs)
      ? nowMs
      : (typeof performance !== 'undefined' ? performance.now() : Date.now());

    // 1. Track application-observed update interval via performance.now()
    if (p.lastPerfNow !== null) {
      const dt = t - p.lastPerfNow;
      if (dt > 0.2 && dt < 500) {
        p.frameIntervalsMs.push(dt);
        if (p.frameIntervalsMs.length > 90) p.frameIntervalsMs.shift();
      }
    }
    p.lastPerfNow = t;

    // 2. Track gamepad.timestamp updates where valid & meaningful in current browser
    if (typeof gpTimestamp === 'number' && Number.isFinite(gpTimestamp) && gpTimestamp > 0) {
      if (p.lastGpTimestamp !== null && gpTimestamp > p.lastGpTimestamp) {
        const dtHw = gpTimestamp - p.lastGpTimestamp;
        if (dtHw > 0.2 && dtHw < 500) {
          p.reportIntervalsMs.push(dtHw);
          if (p.reportIntervalsMs.length > 90) p.reportIntervalsMs.shift();
          p.usingHardwareTimestamp = true;
        }
      }
      p.lastGpTimestamp = gpTimestamp;
    }

    const intervals = p.frameIntervalsMs;
    if (intervals.length >= 10) {
      const sum = intervals.reduce((a, b) => a + b, 0);
      const avg = sum / intervals.length;
      let sq = 0;
      for (let i = 0; i < intervals.length; i++) {
        const d = intervals[i] - avg;
        sq += d * d;
      }
      const timingStd = Math.sqrt(sq / intervals.length);
      p.avgIntervalMs = Number(avg.toFixed(2));
      p.observedHz = avg > 0 ? Number((1000 / avg).toFixed(1)) : null;
      p.timingVariabilityMs = Number(timingStd.toFixed(2));
    }

    // 3. Sliding 1000ms window for positional X/Y jitter analysis
    p.windowSamples.push({
      t,
      lx: axes.lx || 0,
      ly: axes.ly || 0,
      rx: axes.rx || 0,
      ry: axes.ry || 0,
    });
    const cutoff = t - STABILITY_CONFIG.WINDOW_MS;
    while (p.windowSamples.length > 0 && p.windowSamples[0].t < cutoff) {
      p.windowSamples.shift();
    }

    p.leftJitter = evaluateStickPositionalJitter(p.windowSamples, 'lx', 'ly');
    p.rightJitter = evaluateStickPositionalJitter(p.windowSamples, 'rx', 'ry');

    if (p.leftJitter.status === 'UNSTABLE_MOVING' || p.rightJitter.status === 'UNSTABLE_MOVING') {
      p.signalStabilityStatus = 'UNSTABLE_MOVING (Requires steady position)';
    } else if (p.leftJitter.status === 'HIGH_NOISE' || p.rightJitter.status === 'HIGH_NOISE') {
      p.signalStabilityStatus = 'ELEVATED_POSITIONAL_NOISE';
    } else if (p.leftJitter.status === 'STABLE' && p.rightJitter.status === 'STABLE') {
      p.signalStabilityStatus = 'STABLE';
    } else {
      p.signalStabilityStatus = 'SAMPLING';
    }

    return p;
  }

  function drawCircularityCanvas(canvas, stickState) {
    if (!canvas || typeof canvas.getContext !== 'function') return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const rUnit = (w / 2) * 0.68;

    ctx.clearRect(0, 0, w, h);

    // Background circle
    ctx.beginPath();
    ctx.arc(cx, cy, rUnit * 1.25, 0, Math.PI * 2);
    ctx.fillStyle = '#0d0e15';
    ctx.fill();
    ctx.strokeStyle = '#25263a';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Draw sampled angular sectors wedge polygon
    const sectors = stickState.activeSectorResolution === 72 ? stickState.sectors72 : stickState.sectors36;
    const n = sectors.length;
    const stepRad = (Math.PI * 2) / n;

    for (let i = 0; i < n; i++) {
      const val = sectors[i];
      const a0 = i * stepRad;
      const a1 = (i + 1) * stepRad;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      if (val !== null) {
        const rad = Math.min(rUnit * 1.22, val * rUnit);
        ctx.arc(cx, cy, rad, a0, a1);
        ctx.closePath();
        const err = Math.abs(val - 1.0);
        ctx.fillStyle = err <= 0.12 ? 'rgba(0, 229, 255, 0.22)' : 'rgba(245, 158, 11, 0.24)';
        ctx.fill();
      } else {
        // Unsampled sector indicator ring mark at outer perimeter
        ctx.arc(cx, cy, rUnit, a0, a1);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    // Ideal 1.00 normalized reference circle
    ctx.beginPath();
    ctx.arc(cx, cy, rUnit, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.setLineDash([3, 3]);
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.setLineDash([]);

    // Crosshairs & Center Indicator
    ctx.beginPath();
    ctx.moveTo(cx - rUnit * 1.15, cy);
    ctx.lineTo(cx + rUnit * 1.15, cy);
    ctx.moveTo(cx, cy - rUnit * 1.15);
    ctx.lineTo(cx, cy + rUnit * 1.15);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Movement trace
    if (stickState.trace.length > 1) {
      ctx.beginPath();
      for (let i = 0; i < stickState.trace.length; i++) {
        const pt = stickState.trace[i];
        const px = cx + pt.x * rUnit;
        const py = cy + pt.y * rUnit;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.55)';
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }

    // Center reference ring
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#a5b4fc';
    ctx.fill();

    // Live stick cursor
    const curX = cx + stickState.currentX * rUnit;
    const curY = cy + stickState.currentY * rUnit;
    ctx.beginPath();
    ctx.arc(curX, curY, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#00e5ff';
    ctx.fill();
  }

  /**
   * Renders the 36/72-sector radial circularity wedges and Avg Error (%) HUD
   * directly on top of the main Stick Testing Center radar canvases (#stick-l-canvas / #stick-r-canvas)
   * after drawLargeStick() has rendered the base radar.
   */
  function drawMainRadarCircularityOverlay(mainCanvas, stickState) {
    if (!mainCanvas || typeof mainCanvas.getContext !== 'function') return;
    const ctx = mainCanvas.getContext('2d');
    if (!ctx) return;

    const w = mainCanvas.width;
    const h = mainCanvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const r = (w / 2) * 0.63; // Matches drawLargeStick reference 1.0 circle radius

    const sectors = stickState.activeSectorResolution === 72 ? stickState.sectors72 : stickState.sectors36;
    const n = sectors.length;
    const stepRad = (Math.PI * 2) / n;

    // 1. Draw sampled angular sector wedges on the main radar
    for (let i = 0; i < n; i++) {
      const val = sectors[i];
      if (val !== null) {
        const a0 = i * stepRad;
        const a1 = (i + 1) * stepRad;
        const rad = Math.min(r * 1.18, val * r);
        const errPct = Math.abs(val - 1.0) * 100;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, rad, a0, a1);
        ctx.closePath();

        if (errPct >= 7 && errPct <= 12) {
          ctx.fillStyle = 'rgba(34, 197, 94, 0.20)';
          ctx.strokeStyle = 'rgba(34, 197, 94, 0.55)';
        } else if (errPct > 17) {
          ctx.fillStyle = 'rgba(239, 68, 68, 0.22)';
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.60)';
        } else if (errPct < 3 || (errPct >= 13 && errPct <= 16)) {
          ctx.fillStyle = 'rgba(245, 158, 11, 0.20)';
          ctx.strokeStyle = 'rgba(245, 158, 11, 0.55)';
        } else {
          ctx.fillStyle = 'rgba(0, 229, 255, 0.18)';
          ctx.strokeStyle = 'rgba(0, 229, 255, 0.50)';
        }
        ctx.lineWidth = 1;
        ctx.fill();
        ctx.stroke();
      }
    }

    // 2. Draw outer perimeter polygon connecting consecutive sampled sectors
    ctx.beginPath();
    let started = false;
    for (let i = 0; i <= n; i++) {
      const idx = i % n;
      const val = sectors[idx];
      if (val !== null) {
        const midAngle = (idx + 0.5) * stepRad;
        const rad = Math.min(r * 1.18, val * r);
        const px = cx + Math.cos(midAngle) * rad;
        const py = cy + Math.sin(midAngle) * rad;
        if (!started) {
          ctx.moveTo(px, py);
          started = true;
        } else {
          ctx.lineTo(px, py);
        }
      } else {
        started = false;
      }
    }
    ctx.strokeStyle = stickState.status === 'COMPLETED' ? '#22c55e' : '#00e5ff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 3. Draw compact HUD pill at the bottom of the main radar showing live Circularity Avg Error (%)
    const hudText = stickState.avgErrorPct !== null
      ? `Avg Error: ${stickState.avgErrorPct.toFixed(2)}% • ${stickState.sampledSectorCount}/${stickState.activeSectorResolution}`
      : `Circularidad: ${stickState.sampledSectorCount}/${stickState.activeSectorResolution} sectores`;

    ctx.save();
    ctx.font = 'bold 11px Consolas, monospace';
    const textWidth = ctx.measureText(hudText).width;
    const pillW = textWidth + 18;
    const pillH = 20;
    const pillX = cx - pillW / 2;
    const pillY = h - 26;

    ctx.fillStyle = 'rgba(12, 12, 18, 0.88)';
    ctx.strokeStyle = stickState.status === 'COMPLETED' ? '#22c55e' : 'rgba(0, 229, 255, 0.55)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(pillX, pillY, pillW, pillH, 6);
    } else {
      ctx.rect(pillX, pillY, pillW, pillH);
    }
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = stickState.status === 'COMPLETED' ? '#4ade80' : '#00e5ff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(hudText, cx, pillY + pillH / 2);
    ctx.restore();
  }

  function renderUI(drawMainOverlay) {
    if (typeof document === 'undefined') return;

    const renderStick = (prefix, st, jit) => {
      const canvas = document.getElementById(`adv-circ-canvas-${prefix}`);
      if (canvas) drawCircularityCanvas(canvas, st);

      if (drawMainOverlay) {
        const mainCanvas = document.getElementById(`stick-${prefix}-canvas`);
        if (mainCanvas) drawMainRadarCircularityOverlay(mainCanvas, st);
      }

      const setTxt = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
      };

      const errDisplay = st.avgErrorPct !== null
        ? `${st.avgErrorPct.toFixed(2)}%${st.status !== 'COMPLETED' ? ' (en curso)' : ''}`
        : '—';
      const covDisplay = `${st.sampledSectorCount}/${st.activeSectorResolution} (${st.coveragePct}%)`;

      setTxt(`adv-circ-${prefix}-xy`, `X: ${(st.currentX >= 0 ? '+' : '') + st.currentX.toFixed(3)} | Y: ${(st.currentY >= 0 ? '+' : '') + st.currentY.toFixed(3)}`);
      setTxt(`adv-circ-${prefix}-cov`, covDisplay);
      setTxt(`adv-circ-${prefix}-err`, errDisplay);
      setTxt(`adv-circ-${prefix}-status`, st.status);
      setTxt(`adv-circ-${prefix}-band`, st.classificationLabel);

      // Update inline circularity telemetry in the top Stick Testing Center card
      setTxt(`inline-circ-${prefix}-err`, errDisplay);
      setTxt(`inline-circ-${prefix}-cov`, covDisplay);
      setTxt(`inline-circ-${prefix}-band`, st.classificationLabel);

      const clsInfo = st.status === 'COMPLETED'
        ? classifyCircularityError(st.avgErrorPct)
        : { badgeClass: st.status === 'RUNNING' ? 'badge-testing' : 'badge-neutral' };
      const badgeText = st.status === 'COMPLETED'
        ? `${st.avgErrorPct.toFixed(2)}% (${st.classification})`
        : st.status;

      const badgeEl = document.getElementById(`adv-circ-${prefix}-badge`);
      if (badgeEl) {
        badgeEl.className = `stick-verdict-badge ${clsInfo.badgeClass}`;
        badgeEl.textContent = badgeText;
      }

      const inlineBadgeEl = document.getElementById(`inline-circ-${prefix}-badge`);
      if (inlineBadgeEl) {
        inlineBadgeEl.className = `stick-verdict-badge ${clsInfo.badgeClass}`;
        inlineBadgeEl.textContent = badgeText;
      }

      if (jit) {
        setTxt(
          `adv-jitter-${prefix}-val`,
          jit.steady && jit.combinedJitter !== null
            ? `${jit.combinedJitter.toFixed(5)} (${jit.statusText})`
            : jit.statusText
        );
      }
    };

    renderStick('l', state.left, state.polling.leftJitter);
    renderStick('r', state.right, state.polling.rightJitter);

    const p = state.polling;
    const setPollTxt = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };
    setPollTxt('adv-poll-hz', p.observedHz !== null ? `${p.observedHz.toFixed(1)} Hz` : '—');
    setPollTxt('adv-poll-interval', p.avgIntervalMs !== null ? `${p.avgIntervalMs.toFixed(2)} ms` : '—');
    setPollTxt('adv-poll-var', p.timingVariabilityMs !== null ? `±${p.timingVariabilityMs.toFixed(2)} ms` : '—');
    setPollTxt('adv-poll-stability', p.signalStabilityStatus);
  }

  function onFrameTick(gp, axes, nowMs) {
    if (!gp || !gp.connected || !axes) {
      return getSnapshot();
    }
    const lx = axes.lx || 0;
    const ly = axes.ly || 0;
    const rx = axes.rx || 0;
    const ry = axes.ry || 0;

    // Check if app.js global stick state machine is present; if so, only record circularity
    // when the stick test has been initiated (⚡ Suite Sticks / Step 3-4 / manual start)
    const hasAppState = (typeof window !== 'undefined' && typeof state === 'object' && state && state.stickMetrics);
    const leftActive = !hasAppState || state.left.manualArmed || (
      state.stickMetrics.l && (state.stickMetrics.l.phase === 'TESTING' || state.stickMetrics.l.phase === 'MOVE' || state.stickMetrics.l.phase === 'REST')
    );
    const rightActive = !hasAppState || state.right.manualArmed || (
      state.stickMetrics.r && (state.stickMetrics.r.phase === 'TESTING' || state.stickMetrics.r.phase === 'MOVE' || state.stickMetrics.r.phase === 'REST')
    );

    if (leftActive) {
      updateStickCircularity(state.left, lx, ly);
    } else {
      state.left.currentX = lx;
      state.left.currentY = ly;
      state.left.currentR = Math.hypot(lx, ly);
    }

    if (rightActive) {
      updateStickCircularity(state.right, rx, ry);
    } else {
      state.right.currentX = rx;
      state.right.currentY = ry;
      state.right.currentR = Math.hypot(rx, ry);
    }

    updatePollingAndStability(axes, nowMs, gp.timestamp);
    renderUI(true);
    return getSnapshot();
  }

  function resetStick(which, manualArm) {
    if (which === 'l' || which === 'left') {
      state.left = createCircularityStickState();
      if (manualArm) state.left.manualArmed = true;
    } else if (which === 'r' || which === 'right') {
      state.right = createCircularityStickState();
      if (manualArm) state.right.manualArmed = true;
    }
    renderUI(true);
  }

  function resetAll() {
    state.left = createCircularityStickState();
    state.right = createCircularityStickState();
    state.polling = createPollingAndStabilityState();
    renderUI(true);
  }

  function getSnapshot() {
    return {
      left: {
        status: state.left.status,
        activeSectorResolution: state.left.activeSectorResolution,
        sampledSectorCount: state.left.sampledSectorCount,
        coveragePct: state.left.coveragePct,
        avgErrorPct: state.left.completed || state.left.status === 'COMPLETED' ? state.left.avgErrorPct : null,
        liveAvgErrorPct: state.left.avgErrorPct,
        classification: state.left.classification,
      },
      right: {
        status: state.right.status,
        activeSectorResolution: state.right.activeSectorResolution,
        sampledSectorCount: state.right.sampledSectorCount,
        coveragePct: state.right.coveragePct,
        avgErrorPct: state.right.completed || state.right.status === 'COMPLETED' ? state.right.avgErrorPct : null,
        liveAvgErrorPct: state.right.avgErrorPct,
        classification: state.right.classification,
      },
      polling: {
        observedHz: state.polling.observedHz,
        avgIntervalMs: state.polling.avgIntervalMs,
        timingVariabilityMs: state.polling.timingVariabilityMs,
        signalStabilityStatus: state.polling.signalStabilityStatus,
        leftJitter: Object.assign({}, state.polling.leftJitter),
        rightJitter: Object.assign({}, state.polling.rightJitter),
      }
    };
  }

  function initDOMListeners() {
    if (typeof document === 'undefined') return;
    const bindReset = (id, side) => {
      const btn = document.getElementById(id);
      if (btn && !btn.dataset.bound) {
        btn.dataset.bound = 'true';
        btn.addEventListener('click', () => {
          resetStick(side, true);
          if (typeof resetStickDiagnostics === 'function' && typeof startStickPhase === 'function') {
            resetStickDiagnostics(side);
            startStickPhase(side, 'TESTING');
          }
        });
      }
    };
    bindReset('adv-circ-reset-l', 'l');
    bindReset('adv-circ-reset-r', 'r');
    bindReset('inline-circ-reset-l', 'l');
    bindReset('inline-circ-reset-r', 'r');
    renderUI();
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initDOMListeners);
    } else {
      initDOMListeners();
    }
  }

  return {
    CIRCULARITY_CONFIG,
    STABILITY_CONFIG,
    classifyCircularityError,
    updateStickCircularity,
    evaluateStickPositionalJitter,
    updatePollingAndStability,
    onFrameTick,
    resetStick,
    resetAll,
    getSnapshot,
    renderUI,
    initDOMListeners,
  };
});
