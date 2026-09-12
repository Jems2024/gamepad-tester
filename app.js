/* ============================================================
   GAMEPAD TESTER — app.js
   Full diagnostic with official photo view and technical diagram
   ============================================================ */

'use strict';

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
      0: 'Cross: A Button (✕)',
      1: 'Circle: B Button (○)',
      2: 'Square: X Button (□)',
      3: 'Triangle: Y Button (△)',
      4: 'L1: Bumper Izquierdo',
      5: 'R1: Bumper Derecho',
      6: 'L2: Gatillo Izquierdo',
      7: 'R2: Gatillo Derecho',
      8: model === 'ps5' ? 'Create' : model === 'ps4' ? 'Share' : 'Select',
      9: model === 'ps5' || model === 'ps4' ? 'Options' : 'Start',
      10: 'L3: Stick Izquierdo (Click)',
      11: 'R3: Stick Derecho (Click)',
      12: 'D-Pad: Arriba',
      13: 'D-Pad: Abajo',
      14: 'D-Pad: Izquierda',
      15: 'D-Pad: Derecha',
      16: 'Botón PS (Home)',
      17: 'Touchpad (Click)',
    };
    return psNames[index] || `Botón ${index}`;
  } else if (isXbox) {
    const xbNames = {
      0: 'A Button (Verde)',
      1: 'B Button (Rojo)',
      2: 'X Button (Azul)',
      3: 'Y Button (Amarillo)',
      4: 'LB: Left Bumper',
      5: 'RB: Right Bumper',
      6: 'LT: Left Trigger',
      7: 'RT: Right Trigger',
      8: 'View / Back',
      9: 'Menu / Start',
      10: 'L3: Left Stick Click',
      11: 'R3: Right Stick Click',
      12: 'D-Pad: Arriba',
      13: 'D-Pad: Abajo',
      14: 'D-Pad: Izquierda',
      15: 'D-Pad: Derecha',
      16: 'Xbox Guía (Home)',
      17: 'Share Button',
    };
    return xbNames[index] || `Botón ${index}`;
  }
  return BTN_NAMES[index] || `Botón ${index}`;
}

// ─────────────────────────────────────────────────────────────
// CONTROLLER DETECTION
// ─────────────────────────────────────────────────────────────
function parseVidPid(id) {
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
  if (ids.includes('dualsense') || (vid === '054c' && pid === '0ce6')) return 'ps5';

  // PS4 DualShock 4
  if ((ids.includes('wireless controller') && vid === '054c' && (pid === '05c4' || pid === '09cc'))
    || (vid === '054c' && (pid === '05c4' || pid === '09cc'))) return 'ps4';

  // PS3 DualShock 3
  if (ids.includes('playstation(r)3') || ids.includes('dualshock 3') || (vid === '054c' && pid === '0268')) return 'ps3';

  // Xbox Series S / Series X
  if (ids.includes('series') || ids.includes('0b12') || ids.includes('0b13')) return 'xbox-series-s';

  // Xbox One / 360 / XInput
  if (vid === '045e' || ids.includes('xbox') || ids.includes('xinput')) return 'xbox-one';

  // Broad PS fallback
  if (vid === '054c') return 'ps4';

  return 'generic';
}

// ─────────────────────────────────────────────────────────────
// DOM REFS
// ─────────────────────────────────────────────────────────────
const dom = {
  statusDot:       document.getElementById('status-dot'),
  statusText:      document.getElementById('status-text'),
  modelSelect:     document.getElementById('model-select'),
  debugToggle:     document.getElementById('debug-toggle'),
  btnViewPhoto:    document.getElementById('btn-view-photo'),
  btnViewDiagram:  document.getElementById('btn-view-diagram'),
  photoViewBox:    document.getElementById('photo-view-box'),
  diagramViewBox:  document.getElementById('diagram-view-box'),
  photoImg:        document.getElementById('photo-img'),
  photoOverlaySvg: document.getElementById('photo-overlay-svg'),
  svgContainer:    document.getElementById('svg-container'),
  feedbackLabel:   document.getElementById('controller-feedback-label'),
  noGamepadMsg:    document.getElementById('no-gamepad-msg'),
  ctrlIdInfo:      document.getElementById('ctrl-id-info'),
  buttonsGrid:     document.getElementById('buttons-grid'),
  stickLCanvas:    document.getElementById('stick-l-canvas'),
  stickRCanvas:    document.getElementById('stick-r-canvas'),
  stickLVals:      document.getElementById('stick-l-vals'),
  stickRVals:      document.getElementById('stick-r-vals'),
  driftResult:     document.getElementById('drift-result'),
  resLUniq:        document.getElementById('res-l-uniq'),
  resLBits:        document.getElementById('res-l-bits'),
  resLVerdict:     document.getElementById('res-l-verdict'),
  resRUniq:        document.getElementById('res-r-uniq'),
  resRBits:        document.getElementById('res-r-bits'),
  resRVerdict:     document.getElementById('res-r-verdict'),
};

// ─────────────────────────────────────────────────────────────
// STATE
// ─────────────────────────────────────────────────────────────
let state = {
  gpIndex:       null,
  model:         'ps4',
  viewMode:      'photo', // 'photo' | 'diagram'
  debugMode:     false,
  rafId:         null,
  // Photo overlay cache
  photoBtns:     {},
  photoStickL:   null,
  photoStickR:   null,
  photoLightbar: null,
  // Diagram cache
  diagramRendered: false,
  diagramBtns:   {},
  diagramStickL: null,
  diagramStickR: null,
  diagramLightbar: null,
  // Diagnostics
  driftSamples:  [],
  driftCapturing:false,
  driftInterval: null,
  axisValues:    { lx: new Set(), ly: new Set(), rx: new Set(), ry: new Set() },
};

// ─────────────────────────────────────────────────────────────
// BUTTON CHIPS
// ─────────────────────────────────────────────────────────────
function buildButtonChips(count) {
  dom.buttonsGrid.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const chip = document.createElement('div');
    chip.className = 'btn-chip';
    chip.id = `btn-chip-${i}`;
    chip.innerHTML = `
      <span class="btn-name">${BTN_NAMES[i] || `Btn ${i}`}</span>
      <span class="btn-val" id="btn-val-${i}">0.00</span>
      <div class="bar-wrap"><div class="bar-fill" id="btn-bar-${i}" style="width:0%"></div></div>`;
    dom.buttonsGrid.appendChild(chip);
  }
}

// ─────────────────────────────────────────────────────────────
// BUILD PHOTO OVERLAY
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

  // Render lightbar if present
  if (overlayData.lightbar) {
    const lb = overlayData.lightbar;
    svgHtml += `<rect id="photo-lightbar" x="${lb.x}" y="${lb.y}" width="${lb.w}" height="${lb.h}" rx="${lb.rx}" class="photo-lightbar" style="color:${lb.color};" />`;
  }

  // Render buttons and hotspots
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
      // Stick well & animated puck
      const stickId = (i === 10) ? 'photo-stick-l' : 'photo-stick-r';
      svgHtml += `
        <circle id="photo-btn-${i}" cx="${b.cx}" cy="${b.cy}" r="${b.r}" class="photo-btn" data-btn="${i}" data-color="${color}" style="color:${color}; stroke-dasharray:4 4;" />
        <circle id="${stickId}" cx="${b.cx}" cy="${b.cy}" r="${b.r * 0.6}" class="photo-stick-puck" style="transform-origin:${b.cx}px ${b.cy}px;" />
      `;
    }
  }

  dom.photoOverlaySvg.innerHTML = svgHtml;

  // Cache elements
  state.photoBtns = {};
  for (let i = 0; i <= 17; i++) {
    const el = document.getElementById(`photo-btn-${i}`);
    if (el) state.photoBtns[i] = el;
  }
  state.photoStickL   = document.getElementById('photo-stick-l');
  state.photoStickR   = document.getElementById('photo-stick-r');
  state.photoLightbar = document.getElementById('photo-lightbar');

  // Add click-to-test listeners on photo hotspots
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
    el.style.fill = 'rgba(0,0,0,0.01)';
    el.style.fillOpacity = 0;
    el.style.stroke = state.debugMode ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.08)';
    el.style.strokeOpacity = state.debugMode ? 0.8 : 0.2;
    if (dom.feedbackLabel) dom.feedbackLabel.textContent = 'Pulsa cualquier botón para probar';
  }
}

// ─────────────────────────────────────────────────────────────
// BUILD TECHNICAL DIAGRAM (ALTERNATIVE VIEW)
// ─────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────
// SHOW CONTROLLER MODEL
// ─────────────────────────────────────────────────────────────
function showControllerModel(model) {
  state.model = model;

  // 1. Update official photo image source
  const imageModel = (model === 'generic') ? 'ps4' : model;
  dom.photoImg.src = `assets/controllers/${imageModel}.png`;

  // 2. Rebuild interactive photo overlay
  buildPhotoOverlay(model);

  // 3. Rebuild technical diagram
  buildDiagramView(model);
}

function resolveModel() {
  const manual = dom.modelSelect.value;
  if (manual !== 'auto') {
    showControllerModel(manual);
    return;
  }
  if (state.gpIndex !== null) {
    const gp = navigator.getGamepads()[state.gpIndex];
    showControllerModel(detectController(gp));
  } else {
    showControllerModel('ps4');
  }
}

// ─────────────────────────────────────────────────────────────
// VIEW SWITCHER (PHOTO VS DIAGRAM)
// ─────────────────────────────────────────────────────────────
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
// FRAME UPDATE: PHOTO OVERLAY
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

    // Sticks
    const lx = gp.axes[0] || 0, ly = gp.axes[1] || 0;
    const rx = gp.axes[2] || 0, ry = gp.axes[3] || 0;
    const maxPixels = 26;

    if (state.photoStickL) {
      state.photoStickL.style.transform = `translate(${lx * maxPixels}px, ${ly * maxPixels}px)`;
      const l3 = gp.buttons[10];
      const l3Prs = l3 && (typeof l3 === 'object' ? l3.pressed : l3 > 0.5);
      state.photoStickL.classList.toggle('pressed', !!l3Prs);
    }
    if (state.photoStickR) {
      state.photoStickR.style.transform = `translate(${rx * maxPixels}px, ${ry * maxPixels}px)`;
      const r3 = gp.buttons[11];
      const r3Prs = r3 && (typeof r3 === 'object' ? r3.pressed : r3 > 0.5);
      state.photoStickR.classList.toggle('pressed', !!r3Prs);
    }

    // Lightbar
    if (state.photoLightbar) {
      state.photoLightbar.classList.toggle('active', anyPressed);
    }
  }

  // Update label
  if (dom.feedbackLabel) {
    if (activeLabel) {
      dom.feedbackLabel.textContent = activeLabel;
    } else if (gp) {
      dom.feedbackLabel.textContent = `Mando Conectado: ${getControllerDisplayName(state.model)}`;
    } else {
      dom.feedbackLabel.textContent = 'Pulsa cualquier botón para probar';
    }
  }
}

// ─────────────────────────────────────────────────────────────
// FRAME UPDATE: TECHNICAL DIAGRAM
// ─────────────────────────────────────────────────────────────
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

  const lx = gp.axes[0] || 0, ly = gp.axes[1] || 0;
  const rx = gp.axes[2] || 0, ry = gp.axes[3] || 0;
  if (state.diagramStickL) state.diagramStickL.style.transform = `translate(${lx * 20}px, ${ly * 20}px)`;
  if (state.diagramStickR) state.diagramStickR.style.transform = `translate(${rx * 20}px, ${ry * 20}px)`;
  if (state.diagramLightbar) state.diagramLightbar.classList.toggle('lightbar-on', anyPressed);
}

function getControllerDisplayName(m) {
  const names = {
    'ps5': 'PlayStation 5 (DualSense)',
    'ps4': 'PlayStation 4 (DualShock 4)',
    'ps3': 'PlayStation 3 (DualShock 3)',
    'ps2': 'PlayStation 2 (DualShock 2)',
    'xbox-series-s': 'Xbox Series S / X',
    'xbox-one': 'Xbox One',
    'generic': 'Gamepad Genérico'
  };
  return names[m] || m.toUpperCase();
}

// ─────────────────────────────────────────────────────────────
// STICK CANVAS (PERFECTLY CENTERED CONCENTRIC RADAR)
// ─────────────────────────────────────────────────────────────
function drawStick(canvas, x, y) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width || 90;
  const h = canvas.height || 90;
  const cx = w / 2;
  const cy = h / 2;
  const radius = (w / 2) - 4;

  ctx.clearRect(0, 0, w, h);

  // Background radar circle
  ctx.fillStyle = '#171724';
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();

  // Crosshairs
  ctx.strokeStyle = '#2b2b3e';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx - radius + 2, cy); ctx.lineTo(cx + radius - 2, cy);
  ctx.moveTo(cx, cy - radius + 2); ctx.lineTo(cx, cy + radius - 2);
  ctx.stroke();

  // Deadzone ring (8%)
  ctx.strokeStyle = '#383850';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.08, 0, Math.PI * 2);
  ctx.stroke();

  // Outer boundary rim (drawn directly on canvas, zero misalignment!)
  ctx.strokeStyle = '#42425e';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();

  // Dot position & clamp
  const clampedX = Math.max(-1, Math.min(1, x));
  const clampedY = Math.max(-1, Math.min(1, y));
  const dotX = cx + clampedX * (radius - 7);
  const dotY = cy + clampedY * (radius - 7);
  const dist = Math.sqrt(x * x + y * y);

  // Tether line from center
  if (dist > 0.03) {
    ctx.strokeStyle = dist < 0.15 ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(dotX, dotY);
    ctx.stroke();
  }

  // Active deflection dot
  const color = dist < 0.05 ? '#10b981' : (dist < 0.15 ? '#f59e0b' : '#ef4444');
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(dotX, dotY, 5.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

// ─────────────────────────────────────────────────────────────
// DRIFT TEST
// ─────────────────────────────────────────────────────────────
const DRIFT_SECONDS = 3;

function startDriftCapture() {
  state.driftSamples   = [];
  state.driftCapturing = true;
  dom.driftResult.className = 'drift-result';
  dom.driftResult.textContent = '⏱ Capturando… suelta los sticks durante 3 s';
  clearInterval(state.driftInterval);
  state.driftInterval = setTimeout(() => {
    state.driftCapturing = false;
    showDriftResult();
  }, DRIFT_SECONDS * 1000);
}

function recordDriftSample(gp) {
  if (!state.driftCapturing || !gp) return;
  state.driftSamples.push({
    lx: gp.axes[0] || 0, ly: gp.axes[1] || 0,
    rx: gp.axes[2] || 0, ry: gp.axes[3] || 0,
  });
}

function showDriftResult() {
  const s = state.driftSamples;
  if (!s.length) { dom.driftResult.textContent = 'Sin datos.'; return; }
  const max = (arr) => Math.max(...arr.map(Math.abs));
  const lxV = s.map(e=>e.lx), lyV = s.map(e=>e.ly),
        rxV = s.map(e=>e.rx), ryV = s.map(e=>e.ry);
  const maxL = Math.max(max(lxV), max(lyV));
  const maxR = Math.max(max(rxV), max(ryV));
  const overall = Math.max(maxL, maxR);

  let cls = 'drift-ok', icon = '✅', label = 'Sin drift detectable';
  if (overall > 0.15) { cls='drift-bad'; icon='🔴'; label='Drift severo'; }
  else if (overall > 0.04) { cls='drift-warn'; icon='🟡'; label='Drift leve'; }

  dom.driftResult.className = `drift-result ${cls}`;
  dom.driftResult.innerHTML = `
    ${icon} <strong>${label}</strong><br>
    Stick Izquierdo máx: ${maxL.toFixed(4)} &nbsp; Stick Derecho máx: ${maxR.toFixed(4)}<br>
    Muestras capturadas: ${s.length}`;
}

// ─────────────────────────────────────────────────────────────
// ANALOG RESOLUTION
// ─────────────────────────────────────────────────────────────
function updateResolution(gp) {
  if (!gp) return;
  const a = gp.axes;
  if (a[0] !== undefined) { state.axisValues.lx.add(+a[0].toFixed(5)); state.axisValues.ly.add(+a[1].toFixed(5)); }
  if (a[2] !== undefined) { state.axisValues.rx.add(+a[2].toFixed(5)); state.axisValues.ry.add(+a[3].toFixed(5)); }

  function renderCell(elUniq, elBits, elVerdict, setA, setB) {
    const uniq = Math.max(setA.size, setB.size);
    const bits = uniq > 1 ? Math.log2(uniq).toFixed(1) : '—';
    elUniq.textContent = uniq;
    elBits.textContent = uniq > 1 ? bits + ' bits' : '—';
    let vc = 'verdict-warn', vt = 'Moviendo…';
    if (uniq > 200) { vc='verdict-ok'; vt='✅ Analógico real'; }
    else if (uniq > 10) { vc='verdict-warn'; vt='⚠ Posible limitación'; }
    else if (uniq <= 3 && uniq > 0) { vc='verdict-bad'; vt='❌ Parece digital/falso'; }
    elVerdict.className = `res-verdict ${vc}`;
    elVerdict.textContent = vt;
  }

  renderCell(dom.resLUniq, dom.resLBits, dom.resLVerdict, state.axisValues.lx, state.axisValues.ly);
  renderCell(dom.resRUniq, dom.resRBits, dom.resRVerdict, state.axisValues.rx, state.axisValues.ry);
}



// ─────────────────────────────────────────────────────────────
// MAIN ANIMATION LOOP
// ─────────────────────────────────────────────────────────────
function tick() {
  const gamepads = navigator.getGamepads();
  const gp = state.gpIndex !== null ? gamepads[state.gpIndex] : null;

  if (gp) {
    // Buttons Grid
    const count = Math.min(gp.buttons.length, BTN_NAMES.length + 2);
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

    // Sticks Canvas
    const lx = gp.axes[0] || 0, ly = gp.axes[1] || 0;
    const rx = gp.axes[2] || 0, ry = gp.axes[3] || 0;
    drawStick(dom.stickLCanvas, lx, ly);
    drawStick(dom.stickRCanvas, rx, ry);
    dom.stickLVals.textContent = `X: ${lx.toFixed(4)}  Y: ${ly.toFixed(4)}`;
    dom.stickRVals.textContent = `X: ${rx.toFixed(4)}  Y: ${ry.toFixed(4)}`;

    // Drift & Resolution
    recordDriftSample(gp);
    updateResolution(gp);
  }

  // Update Visualizers
  updatePhotoOverlay(gp);
  updateDiagram(gp);

  state.rafId = requestAnimationFrame(tick);
}

// ─────────────────────────────────────────────────────────────
// GAMEPAD CONNECT / DISCONNECT
// ─────────────────────────────────────────────────────────────
function onConnect(e) {
  const gp = e.gamepad;
  console.log('[GamepadTester] Connected:', gp.id);
  if (state.gpIndex === null) state.gpIndex = gp.index;

  dom.statusDot.className  = 'status-dot connected';
  dom.statusText.textContent = gp.id.length > 40 ? gp.id.slice(0, 40) + '…' : gp.id;
  dom.noGamepadMsg.style.display = 'none';

  buildButtonChips(Math.min(gp.buttons.length, BTN_NAMES.length + 2));
  resolveModel();

  if (dom.ctrlIdInfo) dom.ctrlIdInfo.textContent = 'ID: ' + gp.id;

  state.axisValues = { lx: new Set(), ly: new Set(), rx: new Set(), ry: new Set() };
  if (!state.rafId) state.rafId = requestAnimationFrame(tick);
}

function onDisconnect(e) {
  const gp = e.gamepad;
  console.log('[GamepadTester] Disconnected:', gp.id);
  if (state.gpIndex === gp.index) {
    state.gpIndex = null;
    for (const g of navigator.getGamepads()) {
      if (g) { state.gpIndex = g.index; break; }
    }
  }
  if (state.gpIndex === null) {
    dom.statusDot.className   = 'status-dot disconnected';
    dom.statusText.textContent = 'Sin mando conectado';
    dom.noGamepadMsg.style.display = 'flex';
    resolveModel();
  }
}

// ─────────────────────────────────────────────────────────────
// EVENT LISTENERS
// ─────────────────────────────────────────────────────────────
window.addEventListener('gamepadconnected',    onConnect);
window.addEventListener('gamepaddisconnected', onDisconnect);

dom.modelSelect.addEventListener('change', resolveModel);

dom.btnViewPhoto.addEventListener('click', () => setViewMode('photo'));
dom.btnViewDiagram.addEventListener('click', () => setViewMode('diagram'));

dom.debugToggle.addEventListener('click', () => {
  state.debugMode = !state.debugMode;
  dom.debugToggle.classList.toggle('active', state.debugMode);
  dom.debugToggle.textContent = state.debugMode ? '🔵 Guías ON' : '🔵 Debug';
  // Redraw photo overlay to show/hide debug outlines
  buildPhotoOverlay(state.model);
});



document.getElementById('drift-btn').addEventListener('click', startDriftCapture);
document.getElementById('res-btn').addEventListener('click', () => {
  state.axisValues = { lx: new Set(), ly: new Set(), rx: new Set(), ry: new Set() };
  if (dom.resLUniq) dom.resLUniq.textContent = '0';
  if (dom.resRUniq) dom.resRUniq.textContent = '0';
});

// ─────────────────────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────────────────────
(function init() {
  drawStick(dom.stickLCanvas, 0, 0);
  drawStick(dom.stickRCanvas, 0, 0);
  buildButtonChips(BTN_NAMES.length);

  // Initialize both visualizers
  resolveModel();
  setViewMode('photo');

  if (!state.rafId) state.rafId = requestAnimationFrame(tick);

  // Check if gamepads already connected (e.g. page reload)
  for (const gp of navigator.getGamepads()) {
    if (gp) {
      state.gpIndex = gp.index;
      dom.statusDot.className    = 'status-dot connected';
      dom.statusText.textContent = gp.id.length > 40 ? gp.id.slice(0, 40) + '…' : gp.id;
      dom.noGamepadMsg.style.display = 'none';
      buildButtonChips(Math.min(gp.buttons.length, BTN_NAMES.length + 2));
      resolveModel();
      break;
    }
  }
})();
