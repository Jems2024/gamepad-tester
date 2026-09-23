/* ============================================================
   GAMEPAD TESTER — controllers-overlay.js
   Pixel-Accurate Scalable Interactive Hotspot Overlay Map
   Calibrated directly to 1024x1024 official controller photography
   ============================================================ */

const CONTROLLER_PROFILES = {

  // ── PS5 (DualSense) ────────────────────────────────────────
  'ps5': {
    viewBox: '0 0 1024 1024',
    controls: {
      0:  { type: 'circle', cx: 764, cy: 476, r: 34, name: 'Cross (✕)', label: '✕' },
      1:  { type: 'circle', cx: 825, cy: 406, r: 34, name: 'Circle (○)', label: '○' },
      2:  { type: 'circle', cx: 694, cy: 406, r: 34, name: 'Square (□)', label: '□' },
      3:  { type: 'circle', cx: 764, cy: 336, r: 34, name: 'Triangle (△)', label: '△' },
      4:  { type: 'rect',   x: 172, y: 232, w: 96, h: 32, rx: 8,  name: 'L1 Bumper' },
      5:  { type: 'rect',   x: 756, y: 232, w: 96, h: 32, rx: 8,  name: 'R1 Bumper' },
      6:  { type: 'trigger',x: 180, y: 196, w: 80, h: 32, rx: 6,  name: 'L2 Trigger', isAnalog: true },
      7:  { type: 'trigger',x: 764, y: 196, w: 80, h: 32, rx: 6,  name: 'R2 Trigger', isAnalog: true },
      8:  { type: 'pill',   cx: 316, cy: 310, rx: 11, ry: 22,     name: 'Create' },
      9:  { type: 'pill',   cx: 708, cy: 310, rx: 11, ry: 22,     name: 'Options' },
      10: { type: 'stick',  cx: 360, cy: 520, r: 60,               name: 'L3 (Stick Izq.)' },
      11: { type: 'stick',  cx: 664, cy: 520, r: 60,               name: 'R3 (Stick Der.)' },
      12: { type: 'dpad',   cx: 248, cy: 344, w: 44, h: 50, dir: 'up',    name: 'D-Pad Arriba' },
      13: { type: 'dpad',   cx: 248, cy: 468, w: 44, h: 50, dir: 'down',  name: 'D-Pad Abajo' },
      14: { type: 'dpad',   cx: 186, cy: 406, w: 50, h: 44, dir: 'left',  name: 'D-Pad Izquierda' },
      15: { type: 'dpad',   cx: 310, cy: 406, w: 50, h: 44, dir: 'right', name: 'D-Pad Derecha' },
      16: { type: 'circle', cx: 506, cy: 513, r: 22,               name: 'PS Home' },
      17: { type: 'rect',   x: 320, y: 248, w: 384, h: 160, rx: 10, name: 'Touchpad' },
    }
  },

  // ── PS4 (DualShock 4) ──────────────────────────────────────
  // REFERENCE STANDARD — 100% untouched
  'ps4': {
    viewBox: '0 0 1024 1024',
    controls: {
      0:  { type: 'circle', cx: 806, cy: 480, r: 34, name: 'Cross (✕)', label: '✕' },
      1:  { type: 'circle', cx: 876, cy: 410, r: 34, name: 'Circle (○)', label: '○' },
      2:  { type: 'circle', cx: 736, cy: 410, r: 34, name: 'Square (□)', label: '□' },
      3:  { type: 'circle', cx: 806, cy: 340, r: 34, name: 'Triangle (△)', label: '△' },
      4:  { type: 'rect',   x: 188, y: 248, w: 86, h: 32, rx: 8,  name: 'L1 Bumper' },
      5:  { type: 'rect',   x: 750, y: 248, w: 86, h: 32, rx: 8,  name: 'R1 Bumper' },
      6:  { type: 'trigger',x: 200, y: 210, w: 74, h: 32, rx: 8,  name: 'L2 Trigger', isAnalog: true },
      7:  { type: 'trigger',x: 750, y: 210, w: 74, h: 32, rx: 8,  name: 'R2 Trigger', isAnalog: true },
      8:  { type: 'pill',   cx: 326, cy: 318, rx: 10, ry: 18,     name: 'Share' },
      9:  { type: 'pill',   cx: 698, cy: 318, rx: 10, ry: 18,     name: 'Options' },
      10: { type: 'stick',  cx: 352, cy: 542, r: 58,               name: 'L3 (Stick Izq.)' },
      11: { type: 'stick',  cx: 672, cy: 542, r: 58,               name: 'R3 (Stick Der.)' },
      12: { type: 'dpad',   cx: 218, cy: 355, w: 40, h: 48, dir: 'up',    name: 'D-Pad Arriba' },
      13: { type: 'dpad',   cx: 218, cy: 455, w: 40, h: 48, dir: 'down',  name: 'D-Pad Abajo' },
      14: { type: 'dpad',   cx: 168, cy: 405, w: 48, h: 40, dir: 'left',  name: 'D-Pad Izquierda' },
      15: { type: 'dpad',   cx: 268, cy: 405, w: 48, h: 40, dir: 'right', name: 'D-Pad Derecha' },
      16: { type: 'circle', cx: 513, cy: 547, r: 20,               name: 'PS Home' },
      17: { type: 'rect',   x: 362, y: 292, w: 300, h: 146, rx: 10, name: 'Touchpad' },
    },
    lightbar: { x: 388, y: 282, w: 248, h: 10, rx: 5 }
  },

  // ── PS3 (DualShock 3) ──────────────────────────────────────
  'ps3': {
    viewBox: '0 0 1024 1024',
    controls: {
      0:  { type: 'circle', cx: 756, cy: 522, r: 35, name: 'Cross (✕)', label: '✕' },
      1:  { type: 'circle', cx: 830, cy: 446, r: 35, name: 'Circle (○)', label: '○' },
      2:  { type: 'circle', cx: 682, cy: 446, r: 35, name: 'Square (□)', label: '□' },
      3:  { type: 'circle', cx: 756, cy: 370, r: 35, name: 'Triangle (△)', label: '△' },
      4:  { type: 'rect',   x: 172, y: 270, w: 92, h: 38, rx: 6,  name: 'L1 Bumper' },
      5:  { type: 'rect',   x: 760, y: 270, w: 92, h: 38, rx: 6,  name: 'R1 Bumper' },
      6:  { type: 'trigger',x: 190, y: 236, w: 68, h: 28, rx: 6,  name: 'L2 Trigger', isAnalog: true },
      7:  { type: 'trigger',x: 766, y: 236, w: 68, h: 28, rx: 6,  name: 'R2 Trigger', isAnalog: true },
      8:  { type: 'rect',   x: 412, y: 442, w: 48, h: 26, rx: 5,  name: 'Select' },
      9:  { type: 'rect',   x: 566, y: 442, w: 54, h: 26, rx: 5,  name: 'Start' },
      10: { type: 'stick',  cx: 352, cy: 550, r: 60,               name: 'L3 (Stick Izq.)' },
      11: { type: 'stick',  cx: 672, cy: 550, r: 60,               name: 'R3 (Stick Der.)' },
      12: { type: 'dpad',   cx: 244, cy: 370, w: 44, h: 54, dir: 'up',    name: 'D-Pad Arriba' },
      13: { type: 'dpad',   cx: 244, cy: 522, w: 44, h: 54, dir: 'down',  name: 'D-Pad Abajo' },
      14: { type: 'dpad',   cx: 168, cy: 446, w: 54, h: 44, dir: 'left',  name: 'D-Pad Izquierda' },
      15: { type: 'dpad',   cx: 320, cy: 446, w: 54, h: 44, dir: 'right', name: 'D-Pad Derecha' },
      16: { type: 'circle', cx: 500, cy: 494, r: 24,               name: 'PS Home' },
    }
  },

  // ── PS2 (DualShock 2) ──────────────────────────────────────
  'ps2': {
    viewBox: '0 0 1024 1024',
    controls: {
      0:  { type: 'circle', cx: 756, cy: 522, r: 35, name: 'Cross (✕)', label: '✕' },
      1:  { type: 'circle', cx: 830, cy: 446, r: 35, name: 'Circle (○)', label: '○' },
      2:  { type: 'circle', cx: 682, cy: 446, r: 35, name: 'Square (□)', label: '□' },
      3:  { type: 'circle', cx: 756, cy: 370, r: 35, name: 'Triangle (△)', label: '△' },
      4:  { type: 'rect',   x: 172, y: 260, w: 92, h: 38, rx: 6,  name: 'L1 Bumper' },
      5:  { type: 'rect',   x: 760, y: 260, w: 92, h: 38, rx: 6,  name: 'R1 Bumper' },
      6:  { type: 'trigger',x: 190, y: 228, w: 68, h: 28, rx: 6,  name: 'L2 Trigger', isAnalog: true },
      7:  { type: 'trigger',x: 766, y: 228, w: 68, h: 28, rx: 6,  name: 'R2 Trigger', isAnalog: true },
      8:  { type: 'rect',   x: 412, y: 422, w: 50, h: 28, rx: 5,  name: 'Select' },
      9:  { type: 'rect',   x: 566, y: 422, w: 58, h: 28, rx: 5,  name: 'Start' },
      10: { type: 'stick',  cx: 352, cy: 550, r: 60,               name: 'L3 (Stick Izq.)' },
      11: { type: 'stick',  cx: 672, cy: 550, r: 60,               name: 'R3 (Stick Der.)' },
      12: { type: 'dpad',   cx: 244, cy: 370, w: 44, h: 54, dir: 'up',    name: 'D-Pad Arriba' },
      13: { type: 'dpad',   cx: 244, cy: 522, w: 44, h: 54, dir: 'down',  name: 'D-Pad Abajo' },
      14: { type: 'dpad',   cx: 168, cy: 446, w: 54, h: 44, dir: 'left',  name: 'D-Pad Izquierda' },
      15: { type: 'dpad',   cx: 320, cy: 446, w: 54, h: 44, dir: 'right', name: 'D-Pad Derecha' },
      16: { type: 'rect',   x: 476, y: 512, w: 48, h: 26, rx: 5,  name: 'Botón ANALOG' },
    }
  },

  // ── Unified Xbox (Series / One / 360) ──────────────────────
  'xbox': {
    viewBox: '0 0 1024 1024',
    controls: {
      0:  { type: 'circle', cx: 715, cy: 474, r: 34, name: 'A Button', label: 'A' },
      1:  { type: 'circle', cx: 780, cy: 406, r: 34, name: 'B Button', label: 'B' },
      2:  { type: 'circle', cx: 650, cy: 406, r: 34, name: 'X Button', label: 'X' },
      3:  { type: 'circle', cx: 715, cy: 338, r: 34, name: 'Y Button', label: 'Y' },
      4:  { type: 'rect',   x: 190, y: 260, w: 96,  h: 36, rx: 8,  name: 'LB Bumper' },
      5:  { type: 'rect',   x: 738, y: 260, w: 96,  h: 36, rx: 8,  name: 'RB Bumper' },
      6:  { type: 'trigger',x: 198, y: 218, w: 82,  h: 34, rx: 8,  name: 'LT Trigger', isAnalog: true },
      7:  { type: 'trigger',x: 744, y: 218, w: 82,  h: 34, rx: 8,  name: 'RT Trigger', isAnalog: true },
      8:  { type: 'circle', cx: 438, cy: 400, r: 18,               name: 'View' },
      9:  { type: 'circle', cx: 562, cy: 400, r: 18,               name: 'Menu' },
      10: { type: 'stick',  cx: 284, cy: 400, r: 60,               name: 'L3 (Stick Izq.)' },
      11: { type: 'stick',  cx: 610, cy: 526, r: 60,               name: 'R3 (Stick Der.)' },
      12: { type: 'dpad',   cx: 382, cy: 484, w: 38, h: 48, dir: 'up',    name: 'D-Pad Arriba' },
      13: { type: 'dpad',   cx: 382, cy: 580, w: 38, h: 48, dir: 'down',  name: 'D-Pad Abajo' },
      14: { type: 'dpad',   cx: 334, cy: 532, w: 48, h: 38, dir: 'left',  name: 'D-Pad Izquierda' },
      15: { type: 'dpad',   cx: 430, cy: 532, w: 48, h: 38, dir: 'right', name: 'D-Pad Derecha' },
      16: { type: 'circle', cx: 500, cy: 300, r: 34,               name: 'Xbox Guía' },
    }
  },

  // ── Generic / Fallback ──────────────────────────────────────
  'generic': {
    viewBox: '0 0 1024 1024',
    controls: {
      0:  { type: 'circle', cx: 715, cy: 474, r: 34, name: 'Botón 0 / A', label: '0' },
      1:  { type: 'circle', cx: 780, cy: 406, r: 34, name: 'Botón 1 / B', label: '1' },
      2:  { type: 'circle', cx: 650, cy: 406, r: 34, name: 'Botón 2 / X', label: '2' },
      3:  { type: 'circle', cx: 715, cy: 338, r: 34, name: 'Botón 3 / Y', label: '3' },
      4:  { type: 'rect',   x: 190, y: 260, w: 96,  h: 36, rx: 8,  name: 'Botón 4 / L1' },
      5:  { type: 'rect',   x: 738, y: 260, w: 96,  h: 36, rx: 8,  name: 'Botón 5 / R1' },
      6:  { type: 'trigger',x: 198, y: 218, w: 82,  h: 34, rx: 8,  name: 'Botón 6 / L2', isAnalog: true },
      7:  { type: 'trigger',x: 744, y: 218, w: 82,  h: 34, rx: 8,  name: 'Botón 7 / R2', isAnalog: true },
      8:  { type: 'circle', cx: 438, cy: 400, r: 18,               name: 'Botón 8 / Select' },
      9:  { type: 'circle', cx: 562, cy: 400, r: 18,               name: 'Botón 9 / Start' },
      10: { type: 'stick',  cx: 284, cy: 400, r: 60,               name: 'Botón 10 / L3' },
      11: { type: 'stick',  cx: 610, cy: 526, r: 60,               name: 'Botón 11 / R3' },
      12: { type: 'dpad',   cx: 382, cy: 484, w: 38, h: 48, dir: 'up',    name: 'Botón 12 / D-Pad Arriba' },
      13: { type: 'dpad',   cx: 382, cy: 580, w: 38, h: 48, dir: 'down',  name: 'Botón 13 / D-Pad Abajo' },
      14: { type: 'dpad',   cx: 334, cy: 532, w: 48, h: 38, dir: 'left',  name: 'Botón 14 / D-Pad Izq.' },
      15: { type: 'dpad',   cx: 430, cy: 532, w: 48, h: 38, dir: 'right', name: 'Botón 15 / D-Pad Der.' },
      16: { type: 'circle', cx: 500, cy: 300, r: 34,               name: 'Botón 16 / Home' },
    }
  }
};

// Aliases for compatibility
CONTROLLER_PROFILES['xbox-one'] = CONTROLLER_PROFILES['xbox'];
CONTROLLER_PROFILES['xbox-series-s'] = CONTROLLER_PROFILES['xbox'];

if (typeof window !== 'undefined') {
  window.CONTROLLER_PROFILES = CONTROLLER_PROFILES;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONTROLLER_PROFILES;
}
