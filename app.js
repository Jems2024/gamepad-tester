/* ============================================================
   GAMEPAD TESTER — app.js (Professional Bench Edition)
   - Multi-Controller Tracking & Zero-Refresh Hot-Swapping
   - Large High-DPI Cartesian Stick Testing (Left & Right)
   - Professional 3s Drift Test with Configurable Benchmarks
   - Activity Detection (Auto-Switch on Input)
   - Controller Compatibility Profiles (PS5, PS4, PS3, Xbox, Nintendo, Raw)
   - Advanced Diagnostics (Raw Input Mode)
   ============================================================ */

'use strict';

// ─────────────────────────────────────────────────────────────
// CONFIGURATION & THRESHOLDS
// ─────────────────────────────────────────────────────────────
const DRIFT_CONFIG = {
  DURATION_SEC: 3.0,
  THRESHOLDS: {
    EXCELLENT: {
      maxDev: 0.050,
      jitter: 0.020,
      label: 'EXCELENTE',
      cssClass: 'drift-excellent',
      icon: '🟢',
      summary: 'Sin drift perceptible. Centro óptimo para juego competitivo.'
    },
    ACCEPTABLE: {
      maxDev: 0.120,
      jitter: 0.045,
      label: 'ACEPTABLE',
      cssClass: 'drift-acceptable',
      icon: '🟡',
      summary: 'Desvío leve dentro de tolerancias estándar de fábrica.'
    },
    REVIEW: {
      maxDev: 0.220,
      jitter: 0.080,
      label: 'REVISAR',
      cssClass: 'drift-review',
      icon: '🟠',
      summary: 'Desvío o ruido notable en reposo. Se aconseja calibración o limpieza.'
    },
    FAIL: {
      maxDev: Infinity,
      jitter: Infinity,
      label: 'FALLO',
      cssClass: 'drift-fail',
      icon: '🔴',
      summary: 'Drift severo / defecto mecánico. Requiere cambio de potenciómetro/módulo.'
    }
  }
};

const ACTIVITY_THRESHOLD_AXIS = 0.24;   // Above resting drift to avoid false auto-switch
const ACTIVITY_THRESHOLD_BTN  = 0.35;   // Button actuation threshold
const ACTIVITY_DEBOUNCE_MS    = 350;    // Min ms between automatic controller switches

// ─────────────────────────────────────────────────────────────
// BUTTON NAMES & LABELS
// ─────────────────────────────────────────────────────────────
const BTN_NAMES = [
  'A / Cross',       // 0
  'B / Circle',      // 1
  'X / Square',      // 2
  'Y / Triangle',    // 3
  'LB / L1',         // 4
  'RB / R1',         // 5
  'LT / L2',         // 6
  'RT / R2',         // 7
  'Select / Share',  // 8
  'Start / Options', // 9
  'L3 (Left Stick)', // 10
  'R3 (Right Stick)',// 11
  'D-Pad Up',        // 12
  'D-Pad Down',      // 13
  'D-Pad Left',      // 14
  'D-Pad Right',     // 15
  'Home / PS / Xbox',// 16
  'Touchpad / Share',// 17
];

function getButtonLabel(model, index) {
  const isXbox = model.startsWith('xbox');
  const isPs   = model.startsWith('ps');

  if (isPs) {
    const psNames = {
      0: 'Cross (✕)',
      1: 'Circle (○)',
      2: 'Square (□)',
      3: 'Triangle (△)',
      4: 'L1 (Bumper Izq.)',
      5: 'R1 (Bumper Der.)',
      6: 'L2 (Gatillo Izq.)',
      7: 'R2 (Gatillo Der.)',
      8: model === 'ps5' ? 'Create' : model === 'ps4' ? 'Share' : 'Select',
      9: model === 'ps5' || model === 'ps4' ? 'Options' : 'Start',
      10: 'L3 (Stick Izq. Click)',
      11: 'R3 (Stick Der. Click)',
      12: 'D-Pad Arriba',
      13: 'D-Pad Abajo',
      14: 'D-Pad Izquierda',
      15: 'D-Pad Derecha',
      16: 'Botón PS (Home)',
      17: 'Touchpad Click',
    };
    return psNames[index] || `Botón ${index}`;
  } else if (isXbox) {
    const xbNames = {
      0: 'A Button (Verde)',
      1: 'B Button (Rojo)',
      2: 'X Button (Azul)',
      3: 'Y Button (Amarillo)',
      4: 'LB (Left Bumper)',
      5: 'RB (Right Bumper)',
      6: 'LT (Left Trigger)',
      7: 'RT (Right Trigger)',
      8: 'View / Back',
      9: 'Menu / Start',
      10: 'L3 (Left Stick Click)',
      11: 'R3 (Right Stick Click)',
      12: 'D-Pad Arriba',
      13: 'D-Pad Abajo',
      14: 'D-Pad Izquierda',
      15: 'D-Pad Derecha',
      16: 'Xbox Guía (Home)',
      17: 'Share Button',
    };
    return xbNames[index] || `Botón ${index}`;
  }
  return BTN_NAMES[index] || `Botón ${index}`;
}

// ─────────────────────────────────────────────────────────────
// CONTROLLER PROFILES & DETECTION
// ─────────────────────────────────────────────────────────────
function parseVidPid(id) {
  if (!id) return null;
  const m = id.match(/vendor[:\s]+([0-9a-f]{4}).*product[:\s]+([0-9a-f]{4})/i)
         || id.match(/([0-9a-f]{4})-([0-9a-f]{4})-/i);
  if (m) return { vid: m[1].toLowerCase(), pid: m[2].toLowerCase() };
  return null;
}

function detectController(gp) {
  if (!gp) return 'ps4';
  const id  = gp.id || '';
  const ids = id.toLowerCase();
  const vp  = parseVidPid(id);
  const vid = vp ? vp.vid : null;
  const pid = vp ? vp.pid : null;

  // PS5 DualSense
  if (ids.includes('dualsense') || (vid === '054c' && pid === '0ce6') || (vid === '054c' && pid === '0df2')) {
    return 'ps5';
  }

  // PS4 DualShock 4
  if (ids.includes('dualshock 4') || (ids.includes('wireless controller') && vid === '054c')
      || (vid === '054c' && (pid === '05c4' || pid === '09cc'))) {
    return 'ps4';
  }

  // PS3 DualShock 3
  if (ids.includes('playstation(r)3') || ids.includes('dualshock 3') || ids.includes('ps3')
      || (vid === '054c' && pid === '0268')) {
    return 'ps3';
  }

  // Xbox Series S / Series X
  if (ids.includes('series') || ids.includes('0b12') || ids.includes('0b13')) {
    return 'xbox-series-s';
  }

  // Xbox One / 360 / XInput
  if (vid === '045e' || ids.includes('xbox') || ids.includes('xinput')) {
    return 'xbox-one';
  }

  // Broad Sony PS fallback
  if (vid === '054c') {
    return 'ps4';
  }

  return 'generic';
}

function getControllerDisplayName(m) {
  const names = {
    'ps5': 'PlayStation 5 (DualSense)',
    'ps4': 'PlayStation 4 (DualShock 4)',
    'ps3': 'PlayStation 3 (DualShock 3)',
    'ps2': 'PlayStation 2 (DualShock 2)',
    'xbox-series-s': 'Xbox Series S / X',
    'xbox-one': 'Xbox One / 360',
    'generic': 'Mando USB Genérico',
    'raw': 'Modo RAW (DirectInput / Sin Mapeo)'
  };
  return names[m] || m.toUpperCase();
}

/**
 * Normalizes axes readings depending on controller profile and mapping
 */
function getNormalizedAxes(gp, profile) {
  if (!gp || !gp.axes) return { lx: 0, ly: 0, rx: 0, ry: 0 };
  const a = gp.axes;

  // Standard or unknown controllers with >= 4 axes
  if (gp.mapping === 'standard' || a.length >= 4) {
    return {
      lx: a[0] !== undefined ? a[0] : 0,
      ly: a[1] !== undefined ? a[1] : 0,
      rx: a[2] !== undefined ? a[2] : 0,
      ry: a[3] !== undefined ? a[3] : 0,
    };
  }

  // Some DirectInput / PS3 drivers on Windows expose RX on axis 2 and RY on axis 5
  if (profile === 'ps3' && a.length >= 6) {
    return {
      lx: a[0] || 0,
      ly: a[1] || 0,
      rx: a[2] || 0,
      ry: a[5] !== undefined ? a[5] : (a[3] || 0)
    };
  }

  // Generic fallback with fewer axes
  return {
    lx: a[0] !== undefined ? a[0] : 0,
    ly: a[1] !== undefined ? a[1] : 0,
    rx: a[2] !== undefined ? a[2] : 0,
    ry: a[3] !== undefined ? a[3] : 0,
  };
}

// ─────────────────────────────────────────────────────────────
// DOM REFS
// ─────────────────────────────────────────────────────────────
const dom = {
  statusDot:           document.getElementById('status-dot'),
  statusText:          document.getElementById('status-text'),
  activeCtrlName:      document.getElementById('active-ctrl-name'),
  activeCtrlIdx:       document.getElementById('active-ctrl-idx'),
  activeGamepadSelect: document.getElementById('active-gamepad-select'),
  modelSelect:         document.getElementById('model-select'),
  debugToggle:         document.getElementById('debug-toggle'),
  btnViewPhoto:        document.getElementById('btn-view-photo'),
  btnViewDiagram:      document.getElementById('btn-view-diagram'),
  stickZoomBtn:        document.getElementById('stick-zoom-btn'),

  // Stage Left
  photoViewBox:        document.getElementById('photo-view-box'),
  diagramViewBox:      document.getElementById('diagram-view-box'),
  photoImg:            document.getElementById('photo-img'),
  photoOverlaySvg:     document.getElementById('photo-overlay-svg'),
  svgContainer:        document.getElementById('svg-container'),
  feedbackLabel:       document.getElementById('controller-feedback-label'),
  noGamepadMsg:        document.getElementById('no-gamepad-msg'),
  ctrlIdInfo:          document.getElementById('ctrl-id-info'),
  ctrlProfileBadge:    document.getElementById('ctrl-profile-badge'),
  ds3DriverHint:       document.getElementById('ds3-driver-hint'),

  // Large Stick Testing Center
  stickLCanvas:        document.getElementById('stick-l-canvas'),
  stickRCanvas:        document.getElementById('stick-r-canvas'),
  stickLStatusDot:     document.getElementById('stick-l-status-dot'),
  stickRStatusDot:     document.getElementById('stick-r-status-dot'),
  stickLX:             document.getElementById('stick-l-x'),
  stickLY:             document.getElementById('stick-l-y'),
  stickLDist:          document.getElementById('stick-l-dist'),
  stickLAngle:         document.getElementById('stick-l-angle'),
  stickRX:             document.getElementById('stick-r-x'),
  stickRY:             document.getElementById('stick-r-y'),
  stickRDist:          document.getElementById('stick-r-dist'),
  stickRAngle:         document.getElementById('stick-r-angle'),

  // Drift
  driftBtn:            document.getElementById('drift-btn'),
  driftResult:         document.getElementById('drift-result'),

  // Buttons Grid
  buttonsGrid:         document.getElementById('buttons-grid'),

  // Raw Diagnostics
  rawDiagToggle:       document.getElementById('raw-diag-toggle'),
  rawDiagArrow:        document.getElementById('raw-diag-arrow'),
  rawDiagBody:         document.getElementById('raw-diag-body'),
  rawId:               document.getElementById('raw-id'),
  rawIndex:            document.getElementById('raw-index'),
  rawMapping:          document.getElementById('raw-mapping'),
  rawConnected:        document.getElementById('raw-connected'),
  rawTotalBtns:        document.getElementById('raw-total-btns'),
  rawTotalAxes:        document.getElementById('raw-total-axes'),
  rawTimestamp:        document.getElementById('raw-timestamp'),
  rawAxesList:         document.getElementById('raw-axes-list'),
  rawButtonsList:      document.getElementById('raw-buttons-list'),
};

// ─────────────────────────────────────────────────────────────
// STATE
// ─────────────────────────────────────────────────────────────
let state = {
  activeGpIndex:        null,          // Currently tested gamepad index (integer or null)
  knownGamepads:        new Map(),     // index -> { id, mapping, axesCount, btnCount }
  model:                'ps4',         // Resolved controller profile
  viewMode:             'photo',       // 'photo' | 'diagram'
  debugMode:            false,         // Button guides toggle
  centerZoom:           true,          // Visual magnification of resting center
  rawAccordionOpen:     false,         // Raw input view toggle
  lastActiveSwitchTime: 0,             // Throttle auto-switching on activity
  rafId:                null,

  // Photo overlay cache
  photoBtns:            {},
  photoStickL:          null,
  photoStickR:          null,
  photoLightbar:        null,

  // Diagram cache
  diagramRendered:      false,
  diagramBtns:          {},
  diagramStickL:        null,
  diagramStickR:        null,
  diagramLightbar:      null,

  // Drift Benchmark
  drift: {
    capturing: false,
    startTime: 0,
    timerId:   null,
    samples:   [],
  },
};

// ─────────────────────────────────────────────────────────────
// RESET CONTROLLER TELEMETRY (WHEN SWAPPING OR ON DEMAND)
// ─────────────────────────────────────────────────────────────
function resetControllerTelemetry() {

  // Cancel any active drift capture cleanly
  if (state.drift.capturing) {
    clearTimeout(state.drift.timerId);
    state.drift.capturing = false;
  }
  state.drift.samples = [];
  if (dom.driftResult) {
    dom.driftResult.innerHTML = `
      <div class="drift-initial-hint">
        <span>ℹ Suelta ambos sticks y pulsa <strong>"▶ Test Drift (3s)"</strong> para calcular desviación y jitter en reposo.</span>
      </div>`;
  }
}

// ─────────────────────────────────────────────────────────────
// MULTI-CONTROLLER REGISTRY & DEVICE SELECTOR
// ─────────────────────────────────────────────────────────────
function updateGamepadSelectorUI() {
  const select = dom.activeGamepadSelect;
  if (!select) return;

  const prevVal = select.value;
  select.innerHTML = '';

  const connectedList = [];
  for (const [idx, info] of state.knownGamepads.entries()) {
    connectedList.push({ idx, info });
  }

  if (connectedList.length === 0) {
    const opt = document.createElement('option');
    opt.value = '-1';
    opt.textContent = 'Sin mandos conectados';
    select.appendChild(opt);
    dom.activeCtrlName.textContent = 'Ninguno';
    dom.activeCtrlIdx.textContent  = '—';
    return;
  }

  connectedList.sort((a, b) => a.idx - b.idx);
  for (const { idx, info } of connectedList) {
    const opt = document.createElement('option');
    opt.value = String(idx);
    const shortName = info.id.length > 24 ? info.id.slice(0, 24) + '…' : info.id;
    opt.textContent = `Mando ${idx} — ${shortName}`;
    select.appendChild(opt);
  }

  if (state.activeGpIndex !== null && state.knownGamepads.has(state.activeGpIndex)) {
    select.value = String(state.activeGpIndex);
    const activeInfo = state.knownGamepads.get(state.activeGpIndex);
    dom.activeCtrlName.textContent = activeInfo.id.length > 20 ? activeInfo.id.slice(0, 20) + '…' : activeInfo.id;
    dom.activeCtrlIdx.textContent  = `Índice: ${state.activeGpIndex}`;
  } else {
    // Select first available
    const firstIdx = connectedList[0].idx;
    setActiveGamepad(firstIdx);
  }
}

function setActiveGamepad(idx) {
  if (idx === null || idx === undefined || idx < 0) {
    state.activeGpIndex = null;
    dom.statusDot.className    = 'status-dot disconnected';
    dom.statusText.textContent = 'Esperando mando…';
    dom.noGamepadMsg.style.display = 'flex';
    dom.activeCtrlName.textContent = 'Ninguno';
    dom.activeCtrlIdx.textContent  = '—';
    dom.ctrlIdInfo.textContent     = '';
    dom.ctrlProfileBadge.textContent = 'Perfil: Ninguno';
    dom.ds3DriverHint.style.display  = 'none';

    // Reset sticks and buttons UI
    drawLargeStick(dom.stickLCanvas, 0, 0, true);
    drawLargeStick(dom.stickRCanvas, 0, 0, false);
    clearButtonChipsValues();
    resetControllerTelemetry();
    resolveModel();
    return;
  }

  state.activeGpIndex = idx;
  const gp = navigator.getGamepads()[idx];
  const id = gp ? gp.id : 'Mando conectado';

  dom.statusDot.className    = 'status-dot connected';
  dom.statusText.textContent = id.length > 34 ? id.slice(0, 34) + '…' : id;
  dom.noGamepadMsg.style.display = 'none';

  dom.activeCtrlName.textContent = id.length > 20 ? id.slice(0, 20) + '…' : id;
  dom.activeCtrlIdx.textContent  = `Índice: ${idx}`;
  dom.ctrlIdInfo.textContent     = `ID: ${id}`;

  if (dom.activeGamepadSelect && dom.activeGamepadSelect.value !== String(idx)) {
    dom.activeGamepadSelect.value = String(idx);
  }

  // Reset measurements for fresh controller
  resetControllerTelemetry();

  // Adapt button grid size
  const btnCount = gp ? Math.min(gp.buttons.length, BTN_NAMES.length + 4) : BTN_NAMES.length;
  buildButtonChips(btnCount);

  // Model & Profiles
  resolveModel();
}

/**
 * Continuous fallback scanner inside tick() loop.
 * Detects hot-plugged / hot-swapped controllers that didn't fire browser events.
 */
function scanControllersLifecycle() {
  const currentList = navigator.getGamepads ? navigator.getGamepads() : [];
  let registryChanged = false;

  // 1. Check for newly discovered gamepads
  for (let i = 0; i < currentList.length; i++) {
    const gp = currentList[i];
    if (gp && !state.knownGamepads.has(gp.index)) {
      state.knownGamepads.set(gp.index, {
        id: gp.id,
        mapping: gp.mapping || '',
        axesCount: gp.axes ? gp.axes.length : 0,
        btnCount: gp.buttons ? gp.buttons.length : 0,
      });
      registryChanged = true;
      console.log(`[GamepadTester] Registered gamepad at index ${gp.index}: ${gp.id}`);

      // Auto-activate if no active gamepad
      if (state.activeGpIndex === null) {
        state.activeGpIndex = gp.index;
      }
    }
  }

  // 2. Check for disconnected gamepads
  for (const idx of state.knownGamepads.keys()) {
    const gp = currentList[idx];
    if (!gp) {
      state.knownGamepads.delete(idx);
      registryChanged = true;
      console.log(`[GamepadTester] Removed disconnected gamepad at index ${idx}`);

      // If active gamepad was disconnected, switch to next available or null
      if (state.activeGpIndex === idx) {
        state.activeGpIndex = null;
        for (const remIdx of state.knownGamepads.keys()) {
          state.activeGpIndex = remIdx;
          break;
        }
      }
    }
  }

  if (registryChanged) {
    updateGamepadSelectorUI();
    if (state.activeGpIndex !== null) {
      setActiveGamepad(state.activeGpIndex);
    } else {
      setActiveGamepad(null);
    }
  }
}

/**
 * Automatically activates whichever controller the technician moves or presses
 */
function checkActivitySwitch(gamepads) {
  if (state.knownGamepads.size <= 1) return; // Only relevant when multiple controllers exist
  const now = performance.now();
  if (now - state.lastActiveSwitchTime < ACTIVITY_DEBOUNCE_MS) return;

  for (let i = 0; i < gamepads.length; i++) {
    const gp = gamepads[i];
    if (!gp || gp.index === state.activeGpIndex) continue;

    // Check significant button press
    let hasButton = false;
    for (let b = 0; b < gp.buttons.length; b++) {
      const btn = gp.buttons[b];
      const val = typeof btn === 'object' ? btn.value : (btn ? 1 : 0);
      if (val > ACTIVITY_THRESHOLD_BTN) {
        hasButton = true;
        break;
      }
    }

    // Check significant stick movement
    let hasStick = false;
    for (let a = 0; a < gp.axes.length; a++) {
      if (Math.abs(gp.axes[a] || 0) > ACTIVITY_THRESHOLD_AXIS) {
        hasStick = true;
        break;
      }
    }

    if (hasButton || hasStick) {
      state.lastActiveSwitchTime = now;
      console.log(`[GamepadTester] Activity detected on gamepad ${gp.index} (${gp.id}) -> Auto switching active`);
      setActiveGamepad(gp.index);
      break;
    }
  }
}

// ─────────────────────────────────────────────────────────────
// BUTTON CHIPS UI
// ─────────────────────────────────────────────────────────────
function buildButtonChips(count) {
  dom.buttonsGrid.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const chip = document.createElement('div');
    chip.className = 'btn-chip';
    chip.id = `btn-chip-${i}`;
    chip.innerHTML = `
      <span class="btn-name">${getButtonLabel(state.model, i)}</span>
      <span class="btn-val" id="btn-val-${i}">0.00</span>
      <div class="bar-wrap"><div class="bar-fill" id="btn-bar-${i}" style="width:0%"></div></div>`;
    dom.buttonsGrid.appendChild(chip);
  }
}

function clearButtonChipsValues() {
  for (let i = 0; i < 24; i++) {
    const chip = document.getElementById(`btn-chip-${i}`);
    const valEl= document.getElementById(`btn-val-${i}`);
    const barEl= document.getElementById(`btn-bar-${i}`);
    if (chip) chip.classList.remove('pressed');
    if (valEl) valEl.textContent = '0.00';
    if (barEl) barEl.style.width = '0%';
  }
}

// ─────────────────────────────────────────────────────────────
// PHOTO & DIAGRAM VIEW RENDERING
// ─────────────────────────────────────────────────────────────
function buildPhotoOverlay(model) {
  const overlayData = (typeof OFFICIAL_OVERLAYS !== 'undefined' && OFFICIAL_OVERLAYS[model])
    ? OFFICIAL_OVERLAYS[model]
    : ((typeof OFFICIAL_OVERLAYS !== 'undefined' && OFFICIAL_OVERLAYS['ps4']) || { buttons: {} });

  let svgHtml = `
    <defs>
      <filter id="photo-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="10" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  `;

  if (overlayData.lightbar) {
    const lb = overlayData.lightbar;
    svgHtml += `<rect id="photo-lightbar" x="${lb.x}" y="${lb.y}" width="${lb.w}" height="${lb.h}" rx="${lb.rx}" class="photo-lightbar" style="color:${lb.color};" />`;
  }

  for (const [idx, b] of Object.entries(overlayData.buttons)) {
    const i = parseInt(idx, 10);
    const color = b.color || '#2979ff';

    if (b.type === 'circle') {
      svgHtml += `<circle id="photo-btn-${i}" cx="${b.cx}" cy="${b.cy}" r="${b.r}" class="photo-btn" data-btn="${i}" data-color="${color}" style="color:${color};" />`;
    } else if (b.type === 'rect') {
      svgHtml += `<rect id="photo-btn-${i}" x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="${b.rx || 10}" class="photo-btn" data-btn="${i}" data-color="${color}" style="color:${color};" />`;
    } else if (b.type === 'pill') {
      svgHtml += `<ellipse id="photo-btn-${i}" cx="${b.cx}" cy="${b.cy}" rx="${b.rx}" ry="${b.ry}" class="photo-btn" data-btn="${i}" data-color="${color}" style="color:${color};" />`;
    } else if (b.type === 'trigger') {
      svgHtml += `<rect id="photo-btn-${i}" x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="${b.rx || 12}" class="photo-btn photo-trigger" data-btn="${i}" data-color="${color}" style="color:${color};" />`;
    } else if (b.type === 'dpad') {
      const x = b.cx - b.w / 2;
      const y = b.cy - b.h / 2;
      svgHtml += `<rect id="photo-btn-${i}" x="${x}" y="${y}" width="${b.w}" height="${b.h}" rx="6" class="photo-btn" data-btn="${i}" data-color="#ffffff" style="color:#ffffff;" />`;
    } else if (b.type === 'stick') {
      const stickId = (i === 10) ? 'photo-stick-l' : 'photo-stick-r';
      svgHtml += `
        <circle id="photo-btn-${i}" cx="${b.cx}" cy="${b.cy}" r="${b.r}" class="photo-btn" data-btn="${i}" data-color="${color}" style="color:${color}; stroke-dasharray:4 4;" />
        <circle id="${stickId}" cx="${b.cx}" cy="${b.cy}" r="${b.r * 0.6}" class="photo-stick-puck" style="transform-origin:${b.cx}px ${b.cy}px;" />
      `;
    }
  }

  dom.photoOverlaySvg.innerHTML = svgHtml;
  dom.photoOverlaySvg.classList.toggle('debug-guides', !!state.debugMode);

  // Cache elements
  state.photoBtns = {};
  for (let i = 0; i <= 17; i++) {
    const el = document.getElementById(`photo-btn-${i}`);
    if (el) state.photoBtns[i] = el;
  }
  state.photoStickL   = document.getElementById('photo-stick-l');
  state.photoStickR   = document.getElementById('photo-stick-r');
  state.photoLightbar = document.getElementById('photo-lightbar');

  // Interactive click testing on photo overlay
  dom.photoOverlaySvg.querySelectorAll('.photo-btn').forEach(el => {
    el.addEventListener('mousedown', () => {
      const idx = parseInt(el.dataset.btn, 10);
      setPhotoBtnActive(idx, 1.0, true);
    });
    el.addEventListener('mouseup', () => {
      const idx = parseInt(el.dataset.btn, 10);
      setPhotoBtnActive(idx, 0, false);
    });
  });
}

function setPhotoBtnActive(idx, val, isActive) {
  const el = state.photoBtns[idx];
  if (!el) return;
  const color = el.dataset.color || '#2979ff';
  if (isActive) {
    el.classList.add('active');
    el.style.fill = color;
    el.style.fillOpacity = Math.max(0.4, val);
    el.style.stroke = color;
    el.style.strokeOpacity = 1.0;
    if (dom.feedbackLabel) dom.feedbackLabel.textContent = `${getButtonLabel(state.model, idx)} (${val.toFixed(2)})`;
  } else {
    el.classList.remove('active');
    el.style.fill = '';
    el.style.fillOpacity = '';
    el.style.stroke = '';
    el.style.strokeOpacity = '';
    if (dom.feedbackLabel) dom.feedbackLabel.textContent = 'Pulsa cualquier botón para probar';
  }
}

function buildDiagramView(model) {
  const markup = (typeof CONTROLLER_SVGS !== 'undefined' && CONTROLLER_SVGS[model])
    ? CONTROLLER_SVGS[model]
    : ((typeof CONTROLLER_SVGS !== 'undefined' && CONTROLLER_SVGS['ps4']) || '');

  dom.svgContainer.innerHTML = markup;
  state.diagramRendered = true;

  state.diagramBtns = {};
  for (let i = 0; i <= 17; i++) {
    const el = document.getElementById(`svg-btn-${i}`);
    if (el) state.diagramBtns[i] = el;
  }
  state.diagramStickL   = document.getElementById('svg-stick-l');
  state.diagramStickR   = document.getElementById('svg-stick-r');
  state.diagramLightbar = document.getElementById('svg-lightbar-path');
}

function showControllerModel(model) {
  state.model = model;

  // 1. Photo image source
  const validImages = ['ps5', 'ps4', 'ps3', 'ps2', 'xbox-series-s', 'xbox-one'];
  const imageModel = validImages.includes(model) ? model : 'ps4';
  dom.photoImg.src = `assets/controllers/${imageModel}.png`;

  // 2. Overlay
  buildPhotoOverlay(model);

  // 3. Vector Diagram
  buildDiagramView(model);

  // 4. Update Profile Tag & Driver hint
  const displayName = getControllerDisplayName(model);
  dom.ctrlProfileBadge.textContent = `Perfil: ${displayName}`;

  if (model === 'ps3') {
    dom.ds3DriverHint.style.display = 'block';
  } else {
    dom.ds3DriverHint.style.display = 'none';
  }
}

function resolveModel() {
  const manual = dom.modelSelect.value;
  if (manual !== 'auto') {
    showControllerModel(manual);
    return;
  }

  if (state.activeGpIndex !== null) {
    const gp = navigator.getGamepads()[state.activeGpIndex];
    if (gp) {
      showControllerModel(detectController(gp));
      return;
    }
  }
  showControllerModel('ps4');
}

function setViewMode(mode) {
  state.viewMode = mode;
  if (mode === 'photo') {
    dom.photoViewBox.style.display   = 'flex';
    dom.diagramViewBox.style.display = 'none';
    dom.btnViewPhoto.classList.add('active');
    dom.btnViewDiagram.classList.remove('active');
  } else {
    dom.photoViewBox.style.display   = 'none';
    dom.diagramViewBox.style.display = 'flex';
    dom.btnViewPhoto.classList.remove('active');
    dom.btnViewDiagram.classList.add('active');
  }
}

// ─────────────────────────────────────────────────────────────
// LARGE CARTESIAN STICK TESTER (HIGH-DPI 400x400)
// ─────────────────────────────────────────────────────────────
function drawLargeStick(canvas, x, y, isLeft) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const cx = w / 2;
  const cy = h / 2;
  const radius = (w / 2) - 10;

  ctx.clearRect(0, 0, w, h);

  // 1. Radar Circular Background
  const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  bgGrad.addColorStop(0, '#1c1c28');
  bgGrad.addColorStop(0.85, '#12121b');
  bgGrad.addColorStop(1, '#0b0b10');
  ctx.fillStyle = bgGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();

  // 2. Concentric Range Rings (25%, 50%, 75%, 100%)
  const rings = [0.25, 0.50, 0.75, 1.0];
  ctx.strokeStyle = '#272738';
  ctx.lineWidth = 1.2;
  rings.forEach(r => {
    ctx.beginPath();
    ctx.arc(cx, cy, radius * r, 0, Math.PI * 2);
    ctx.stroke();
  });

  // 3. Cartesian Crosshairs with tick marks
  ctx.strokeStyle = '#323248';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx - radius, cy); ctx.lineTo(cx + radius, cy); // X-axis
  ctx.moveTo(cx, cy - radius); ctx.lineTo(cx, cy + radius); // Y-axis
  ctx.stroke();

  // Calibration tick marks on axes
  ctx.strokeStyle = '#444460';
  ctx.lineWidth = 1.2;
  const ticks = [-0.75, -0.5, -0.25, 0.25, 0.5, 0.75];
  ticks.forEach(t => {
    const px = cx + t * radius;
    const py = cy + t * radius;
    // X ticks
    ctx.beginPath(); ctx.moveTo(px, cy - 4); ctx.lineTo(px, cy + 4); ctx.stroke();
    // Y ticks
    ctx.beginPath(); ctx.moveTo(cx - 4, py); ctx.lineTo(cx + 4, py); ctx.stroke();
  });

  // 4. Deadzone Ring (8% = 0.08)
  const deadzoneRadius = radius * 0.08;
  ctx.fillStyle = 'rgba(99, 102, 241, 0.08)';
  ctx.beginPath();
  ctx.arc(cx, cy, deadzoneRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#6366f1';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 3]);
  ctx.stroke();
  ctx.setLineDash([]); // Reset line dash

  // 5. Outer Physical Boundary Rim
  ctx.strokeStyle = '#4e4e70';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();

  // 6. Coordinates & Clamping
  const clampedX = Math.max(-1, Math.min(1, x));
  const clampedY = Math.max(-1, Math.min(1, y));
  const dotX = cx + clampedX * (radius - 8);
  const dotY = cy + clampedY * (radius - 8);
  const dist = Math.sqrt(x * x + y * y);

  // 7. Micro-Center Visual Magnification:
  // Amplifies resting drift within the center region so 0.015 deviation is instantly obvious
  if (state.centerZoom && dist > 0.002 && dist < 0.22) {
    const zoomFactor = 2.4; // Visual multiplier for center resting zone
    const visualZoomDist = Math.min(radius * 0.40, dist * radius * zoomFactor);
    const angle = Math.atan2(clampedY, clampedX);
    const zoomDotX = cx + Math.cos(angle) * visualZoomDist;
    const zoomDotY = cy + Math.sin(angle) * visualZoomDist;

    // Amplified vector ray
    ctx.strokeStyle = dist < 0.05 ? 'rgba(16, 185, 129, 0.35)' : 'rgba(245, 158, 11, 0.45)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(zoomDotX, zoomDotY);
    ctx.stroke();

    // Amplified indicator ring
    ctx.fillStyle = dist < 0.05 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.2)';
    ctx.beginPath();
    ctx.arc(zoomDotX, zoomDotY, 9, 0, Math.PI * 2);
    ctx.fill();
  }

  // 8. Physical Deflection Line from Center
  if (dist > 0.02) {
    ctx.strokeStyle = dist < 0.05 ? 'rgba(16, 185, 129, 0.5)' : (dist < 0.12 ? 'rgba(245, 158, 11, 0.6)' : 'rgba(239, 68, 68, 0.7)');
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(dotX, dotY);
    ctx.stroke();
  }

  // 9. Active Puck Dot
  let dotColor = '#10b981'; // Green: perfect center (< 0.05)
  if (dist >= 0.12) {
    dotColor = '#ef4444';   // Red: high deflection / drift
  } else if (dist >= 0.05) {
    dotColor = '#f59e0b';   // Amber: slight drift
  }

  // Shadow glow
  ctx.shadowColor = dotColor;
  ctx.shadowBlur = 12;
  ctx.fillStyle = dotColor;
  ctx.beginPath();
  ctx.arc(dotX, dotY, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0; // Reset shadow

  // White inner core
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(dotX, dotY, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // 10. Center origin point cross
  ctx.fillStyle = '#6366f1';
  ctx.beginPath();
  ctx.arc(cx, cy, 3, 0, Math.PI * 2);
  ctx.fill();
}

// ─────────────────────────────────────────────────────────────
// DRIFT BENCHMARK TEST (PROFESSIONAL 3S)
// ─────────────────────────────────────────────────────────────
function startDriftCapture() {
  if (state.activeGpIndex === null) {
    dom.driftResult.innerHTML = '<span style="color:var(--yellow)">⚠ Conecta un mando primero para realizar el test de drift.</span>';
    return;
  }

  state.drift.capturing = true;
  state.drift.startTime = performance.now();
  state.drift.samples   = [];

  dom.driftBtn.disabled = true;
  dom.driftBtn.textContent = '⏱ Grabando…';

  clearInterval(state.drift.timerId);
  const endTime = performance.now() + DRIFT_CONFIG.DURATION_SEC * 1000;

  state.drift.timerId = setInterval(() => {
    const remainingMs = Math.max(0, endTime - performance.now());
    const remSec = (remainingMs / 1000).toFixed(1);

    if (remainingMs > 0) {
      dom.driftResult.innerHTML = `
        <div class="drift-initial-hint" style="color:#a5b4fc;">
          ⏱ <strong>Muestreando ambos sticks: ${remSec}s</strong> — ¡No toques los mandos para medir reposo!
        </div>`;
    } else {
      clearInterval(state.drift.timerId);
      state.drift.capturing = false;
      dom.driftBtn.disabled = false;
      dom.driftBtn.textContent = '▶ Test Drift (3s)';
      evaluateDriftResults();
    }
  }, 100);
}

function recordDriftSample(axes) {
  if (!state.drift.capturing) return;
  state.drift.samples.push({
    lx: axes.lx,
    ly: axes.ly,
    rx: axes.rx,
    ry: axes.ry,
    distL: Math.sqrt(axes.lx * axes.lx + axes.ly * axes.ly),
    distR: Math.sqrt(axes.rx * axes.rx + axes.ry * axes.ry)
  });
}

function evaluateDriftResults() {
  const s = state.drift.samples;
  if (!s.length) {
    dom.driftResult.innerHTML = '<span>Sin muestras suficientes. Repite la prueba.</span>';
    return;
  }

  // Left Stick Stats
  const distsL = s.map(e => e.distL);
  const maxDevL = Math.max(...distsL);
  const avgDevL = distsL.reduce((a, b) => a + b, 0) / distsL.length;
  const meanLx  = s.reduce((a, b) => a + b.lx, 0) / s.length;
  const meanLy  = s.reduce((a, b) => a + b.ly, 0) / s.length;
  const offsetL = Math.sqrt(meanLx * meanLx + meanLy * meanLy);
  const jitterL = Math.max(...distsL) - Math.min(...distsL);

  // Right Stick Stats
  const distsR = s.map(e => e.distR);
  const maxDevR = Math.max(...distsR);
  const avgDevR = distsR.reduce((a, b) => a + b, 0) / distsR.length;
  const meanRx  = s.reduce((a, b) => a + b.rx, 0) / s.length;
  const meanRy  = s.reduce((a, b) => a + b.ry, 0) / s.length;
  const offsetR = Math.sqrt(meanRx * meanRx + meanRy * meanRy);
  const jitterR = Math.max(...distsR) - Math.min(...distsR);

  // Overall Worst-Case Metric
  const worstMaxDev = Math.max(maxDevL, maxDevR);
  const worstJitter = Math.max(jitterL, jitterR);

  // Determine Grade
  const cfg = DRIFT_CONFIG.THRESHOLDS;
  let grade = cfg.FAIL;

  if (worstMaxDev <= cfg.EXCELLENT.maxDev && worstJitter <= cfg.EXCELLENT.jitter) {
    grade = cfg.EXCELLENT;
  } else if (worstMaxDev <= cfg.ACCEPTABLE.maxDev && worstJitter <= cfg.ACCEPTABLE.jitter) {
    grade = cfg.ACCEPTABLE;
  } else if (worstMaxDev <= cfg.REVIEW.maxDev) {
    grade = cfg.REVIEW;
  }

  dom.driftResult.innerHTML = `
    <div class="drift-report-wrap">
      <div class="drift-report-header">
        <span class="drift-badge ${grade.cssClass}">${grade.icon} ${grade.label}</span>
        <span style="color:var(--text-muted);font-size:.68rem;">${s.length} muestras (${DRIFT_CONFIG.DURATION_SEC}s)</span>
      </div>
      <div class="drift-report-grid">
        <div class="drift-stick-card">
          <div class="drift-stick-title">Stick Izquierdo (L):</div>
          <div class="drift-stat-row"><span>Desvío Máx:</span><strong>${maxDevL.toFixed(4)}</strong></div>
          <div class="drift-stat-row"><span>Desvío Promedio:</span><strong>${avgDevL.toFixed(4)}</strong></div>
          <div class="drift-stat-row"><span>Centro Estático:</span><strong>${offsetL.toFixed(4)}</strong></div>
          <div class="drift-stat-row"><span>Jitter (Ruido):</span><strong>${jitterL.toFixed(4)}</strong></div>
        </div>
        <div class="drift-stick-card">
          <div class="drift-stick-title">Stick Derecho (R):</div>
          <div class="drift-stat-row"><span>Desvío Máx:</span><strong>${maxDevR.toFixed(4)}</strong></div>
          <div class="drift-stat-row"><span>Desvío Promedio:</span><strong>${avgDevR.toFixed(4)}</strong></div>
          <div class="drift-stat-row"><span>Centro Estático:</span><strong>${offsetR.toFixed(4)}</strong></div>
          <div class="drift-stat-row"><span>Jitter (Ruido):</span><strong>${jitterR.toFixed(4)}</strong></div>
        </div>
      </div>
      <div style="font-size:0.64rem;color:var(--text-muted);margin-top:2px;">
        ${grade.summary}
      </div>
    </div>
  `;
}



// ─────────────────────────────────────────────────────────────
// RAW DIAGNOSTICS (COLLAPSIBLE ACCORDION)
// ─────────────────────────────────────────────────────────────
function updateRawDiagnostics(gp) {
  if (!state.rawAccordionOpen || !gp) return;

  dom.rawId.textContent         = gp.id || 'N/A';
  dom.rawIndex.textContent      = String(gp.index);
  dom.rawMapping.textContent    = gp.mapping || '"" (Raw/Sin mapeo)';
  dom.rawConnected.textContent  = gp.connected ? 'Sí' : 'No';
  dom.rawTotalBtns.textContent  = String(gp.buttons.length);
  dom.rawTotalAxes.textContent  = String(gp.axes.length);
  dom.rawTimestamp.textContent  = gp.timestamp ? gp.timestamp.toFixed(1) : '0';

  // Render raw axes
  let axesHtml = '';
  for (let i = 0; i < gp.axes.length; i++) {
    const val = gp.axes[i] || 0;
    const sign = val >= 0 ? '+' : '';
    const pct = ((val + 1) / 2) * 100; // Map -1..1 to 0..100%
    axesHtml += `
      <div class="raw-axis-row">
        <span class="raw-axis-tag">Eje ${i}:</span>
        <span class="raw-axis-val">${sign}${val.toFixed(4)}</span>
        <div class="raw-axis-bar-bg">
          <div class="raw-axis-bar-fill" style="width:${Math.abs(val)*50}%; left:${val >= 0 ? '50%' : (50 - Math.abs(val)*50)+'%'};"></div>
        </div>
      </div>`;
  }
  dom.rawAxesList.innerHTML = axesHtml || '<div style="color:var(--text-muted)">Sin ejes</div>';

  // Render raw buttons
  let btnsHtml = '';
  for (let i = 0; i < gp.buttons.length; i++) {
    const btn = gp.buttons[i];
    const val = typeof btn === 'object' ? btn.value : (btn ? 1 : 0);
    const prs = typeof btn === 'object' ? btn.pressed : val > 0.5;
    btnsHtml += `
      <div class="raw-btn-row">
        <span class="raw-btn-indicator ${prs ? 'on' : ''}"></span>
        <span class="raw-btn-tag">Btn ${i}:</span>
        <span class="raw-btn-val">${val.toFixed(2)}</span>
      </div>`;
  }
  dom.rawButtonsList.innerHTML = btnsHtml || '<div style="color:var(--text-muted)">Sin botones</div>';
}

// ─────────────────────────────────────────────────────────────
// MAIN ANIMATION TICK LOOP
// ─────────────────────────────────────────────────────────────
function tick() {
  // 1. Fallback scan for hot-swap discovery without events
  scanControllersLifecycle();

  const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];

  // 2. Activity check (Auto-switch if technician picks up another controller)
  checkActivitySwitch(gamepads);

  // 3. Live testing on active controller
  const gp = (state.activeGpIndex !== null && gamepads[state.activeGpIndex])
    ? gamepads[state.activeGpIndex]
    : null;

  if (gp) {
    // A. Buttons Grid
    const count = Math.min(gp.buttons.length, 24);
    for (let i = 0; i < count; i++) {
      const btn  = gp.buttons[i];
      const val  = typeof btn === 'object' ? btn.value : (btn ? 1 : 0);
      const prs  = typeof btn === 'object' ? btn.pressed : !!btn;
      const chip = document.getElementById(`btn-chip-${i}`);
      const valEl= document.getElementById(`btn-val-${i}`);
      const barEl= document.getElementById(`btn-bar-${i}`);
      if (chip) {
        chip.classList.toggle('pressed', prs);
        if (valEl) valEl.textContent = val.toFixed(2);
        if (barEl) barEl.style.width = (val * 100).toFixed(1) + '%';
      }
    }

    // B. Normalized Sticks
    const axes = getNormalizedAxes(gp, state.model);
    const lx = axes.lx, ly = axes.ly;
    const rx = axes.rx, ry = axes.ry;

    drawLargeStick(dom.stickLCanvas, lx, ly, true);
    drawLargeStick(dom.stickRCanvas, rx, ry, false);

    // Update Stick telemetry text
    const distL = Math.sqrt(lx * lx + ly * ly);
    const distR = Math.sqrt(rx * rx + ry * ry);
    const angleL = ((Math.atan2(ly, lx) * 180 / Math.PI) + 360) % 360;
    const angleR = ((Math.atan2(ry, rx) * 180 / Math.PI) + 360) % 360;

    dom.stickLX.textContent    = (lx >= 0 ? '+' : '') + lx.toFixed(4);
    dom.stickLY.textContent    = (ly >= 0 ? '+' : '') + ly.toFixed(4);
    dom.stickLDist.textContent = distL.toFixed(4);
    dom.stickLAngle.textContent= angleL.toFixed(1) + '°';

    dom.stickRX.textContent    = (rx >= 0 ? '+' : '') + rx.toFixed(4);
    dom.stickRY.textContent    = (ry >= 0 ? '+' : '') + ry.toFixed(4);
    dom.stickRDist.textContent = distR.toFixed(4);
    dom.stickRAngle.textContent= angleR.toFixed(1) + '°';

    dom.stickLStatusDot.classList.toggle('active', distL > 0.05);
    dom.stickRStatusDot.classList.toggle('active', distR > 0.05);

    // C. Drift Benchmark
    recordDriftSample(axes);

    // D. Visualizers
    updatePhotoOverlay(gp);
    updateDiagram(gp);

    // E. Raw Diagnostics
    updateRawDiagnostics(gp);
  }

  state.rafId = requestAnimationFrame(tick);
}

// ─────────────────────────────────────────────────────────────
// FRAME UPDATE: PHOTO OVERLAY & DIAGRAM
// ─────────────────────────────────────────────────────────────
function updatePhotoOverlay(gp) {
  let activeLabel = '';
  let highestVal = 0;
  let anyPressed = false;

  if (gp) {
    const count = Math.min(gp.buttons.length, 18);
    for (let i = 0; i < count; i++) {
      const btn = gp.buttons[i];
      const val = typeof btn === 'object' ? btn.value : (btn ? 1 : 0);
      const prs = typeof btn === 'object' ? btn.pressed : val > 0.15;
      const el  = state.photoBtns[i];

      if (el) {
        if (prs || val > 0.05) {
          anyPressed = true;
          const color = el.dataset.color || '#2979ff';
          el.classList.add('active');
          el.style.fill = color;
          el.style.fillOpacity = Math.max(0.4, val * 0.85);
          el.style.stroke = color;
          el.style.strokeOpacity = 1.0;

          if (val > highestVal) {
            highestVal = val;
            activeLabel = `${getButtonLabel(state.model, i)} (${val.toFixed(2)})`;
          }
        } else {
          el.classList.remove('active');
          el.style.fill = 'rgba(0,0,0,0.01)';
          el.style.fillOpacity = 0;
          el.style.stroke = state.debugMode ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.08)';
          el.style.strokeOpacity = state.debugMode ? 0.8 : 0.2;
        }
      }
    }

    // Sticks on photo
    const axes = getNormalizedAxes(gp, state.model);
    const maxPixels = 26;

    if (state.photoStickL) {
      state.photoStickL.style.transform = `translate(${axes.lx * maxPixels}px, ${axes.ly * maxPixels}px)`;
      const l3 = gp.buttons[10];
      const l3Prs = l3 && (typeof l3 === 'object' ? l3.pressed : l3 > 0.5);
      state.photoStickL.classList.toggle('pressed', !!l3Prs);
    }
    if (state.photoStickR) {
      state.photoStickR.style.transform = `translate(${axes.rx * maxPixels}px, ${axes.ry * maxPixels}px)`;
      const r3 = gp.buttons[11];
      const r3Prs = r3 && (typeof r3 === 'object' ? r3.pressed : r3 > 0.5);
      state.photoStickR.classList.toggle('pressed', !!r3Prs);
    }

    if (state.photoLightbar) {
      state.photoLightbar.classList.toggle('active', anyPressed);
    }
  }

  if (dom.feedbackLabel) {
    if (activeLabel) {
      dom.feedbackLabel.textContent = activeLabel;
    } else if (gp) {
      dom.feedbackLabel.textContent = `Mando Activo: ${getControllerDisplayName(state.model)}`;
    } else {
      dom.feedbackLabel.textContent = 'Listo — esperando interacción';
    }
  }
}

function updateDiagram(gp) {
  if (!state.diagramRendered || !gp) return;

  let anyPressed = false;
  const count = Math.min(gp.buttons.length, 18);
  for (let i = 0; i < count; i++) {
    const btn = gp.buttons[i];
    const val = typeof btn === 'object' ? btn.value : (btn ? 1 : 0);
    const prs = typeof btn === 'object' ? btn.pressed : val > 0.15;
    const el  = state.diagramBtns[i];

    if (el) {
      if (prs || val > 0.05) {
        anyPressed = true;
        el.classList.add('btn-active');
        if (state.model.startsWith('ps')) {
          if (i === 0) el.classList.add('ps-cross');
          if (i === 1) el.classList.add('ps-circle');
          if (i === 2) el.classList.add('ps-square');
          if (i === 3) el.classList.add('ps-tri');
        } else if (state.model.startsWith('xbox')) {
          if (i === 0) el.classList.add('xb-a');
          if (i === 1) el.classList.add('xb-b');
          if (i === 2) el.classList.add('xb-x');
          if (i === 3) el.classList.add('xb-y');
        }
      } else {
        el.classList.remove('btn-active', 'ps-cross', 'ps-circle', 'ps-square', 'ps-tri', 'xb-a', 'xb-b', 'xb-x', 'xb-y');
      }
    }
  }

  const axes = getNormalizedAxes(gp, state.model);
  if (state.diagramStickL) state.diagramStickL.style.transform = `translate(${axes.lx * 20}px, ${axes.ly * 20}px)`;
  if (state.diagramStickR) state.diagramStickR.style.transform = `translate(${axes.rx * 20}px, ${axes.ry * 20}px)`;
  if (state.diagramLightbar) state.diagramLightbar.classList.toggle('lightbar-on', anyPressed);
}

// ─────────────────────────────────────────────────────────────
// EVENT LISTENERS & WIRING
// ─────────────────────────────────────────────────────────────
window.addEventListener('gamepadconnected', (e) => {
  const gp = e.gamepad;
  console.log('[GamepadTester] gamepadconnected event:', gp.index, gp.id);
  state.knownGamepads.set(gp.index, {
    id: gp.id,
    mapping: gp.mapping || '',
    axesCount: gp.axes ? gp.axes.length : 0,
    btnCount: gp.buttons ? gp.buttons.length : 0,
  });
  updateGamepadSelectorUI();
  if (state.activeGpIndex === null) {
    setActiveGamepad(gp.index);
  }
});

window.addEventListener('gamepaddisconnected', (e) => {
  const gp = e.gamepad;
  console.log('[GamepadTester] gamepaddisconnected event:', gp.index, gp.id);
  state.knownGamepads.delete(gp.index);
  if (state.activeGpIndex === gp.index) {
    state.activeGpIndex = null;
    for (const remIdx of state.knownGamepads.keys()) {
      state.activeGpIndex = remIdx;
      break;
    }
  }
  updateGamepadSelectorUI();
  if (state.activeGpIndex !== null) {
    setActiveGamepad(state.activeGpIndex);
  } else {
    setActiveGamepad(null);
  }
});

// Device Selector
dom.activeGamepadSelect.addEventListener('change', (e) => {
  const val = parseInt(e.target.value, 10);
  if (val >= 0 && state.knownGamepads.has(val)) {
    setActiveGamepad(val);
  }
});

// Model selection & view controls
dom.modelSelect.addEventListener('change', resolveModel);
dom.btnViewPhoto.addEventListener('click', () => setViewMode('photo'));
dom.btnViewDiagram.addEventListener('click', () => setViewMode('diagram'));

dom.debugToggle.addEventListener('click', () => {
  state.debugMode = !state.debugMode;
  dom.debugToggle.classList.toggle('active', state.debugMode);
  dom.debugToggle.textContent = state.debugMode ? '🔵 Guías ON' : '🔵 Guías';
  dom.photoOverlaySvg.classList.toggle('debug-guides', state.debugMode);
  buildPhotoOverlay(state.model);
});

// Stick Center Zoom toggle
dom.stickZoomBtn.addEventListener('click', () => {
  state.centerZoom = !state.centerZoom;
  dom.stickZoomBtn.classList.toggle('active', state.centerZoom);
  dom.stickZoomBtn.textContent = state.centerZoom ? '🔍 Micro-Centro ON' : '🔍 Micro-Centro OFF';
});

// Drift Button
dom.driftBtn.addEventListener('click', startDriftCapture);



// Raw Diagnostics Accordion
dom.rawDiagToggle.addEventListener('click', () => {
  state.rawAccordionOpen = !state.rawAccordionOpen;
  dom.rawDiagBody.style.display = state.rawAccordionOpen ? 'flex' : 'none';
  dom.rawDiagArrow.classList.toggle('open', state.rawAccordionOpen);
});

// ─────────────────────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────────────────────
(function init() {
  drawLargeStick(dom.stickLCanvas, 0, 0, true);
  drawLargeStick(dom.stickRCanvas, 0, 0, false);
  buildButtonChips(BTN_NAMES.length);

  // Initialize visualizers
  resolveModel();
  setViewMode('photo');

  // Discover any already-connected gamepads
  scanControllersLifecycle();

  if (!state.rafId) {
    state.rafId = requestAnimationFrame(tick);
  }
})();
