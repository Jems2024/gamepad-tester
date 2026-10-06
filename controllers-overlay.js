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
      0:  { type: 'circle', cx: 762, cy: 475, r: 35, name: 'Cross (✕)', label: '✕' },
      1:  { type: 'circle', cx: 832, cy: 404, r: 35, name: 'Circle (○)', label: '○' },
      2:  { type: 'circle', cx: 699, cy: 402, r: 35, name: 'Square (□)', label: '□' },
      3:  { type: 'circle', cx: 761, cy: 339, r: 35, name: 'Triangle (△)', label: '△' },
      4:  { type: 'rect',   x: 178, y: 270, w: 102, h: 38, rx: 8,  name: 'L1 Bumper' },
      5:  { type: 'rect',   x: 744, y: 270, w: 102, h: 38, rx: 8,  name: 'R1 Bumper' },
      6:  { type: 'trigger',x: 186, y: 246, w: 90,  h: 24, rx: 6,  name: 'L2 Trigger', isAnalog: true },
      7:  { type: 'trigger',x: 748, y: 246, w: 90,  h: 24, rx: 6,  name: 'R2 Trigger', isAnalog: true },
      8:  { type: 'pill',   cx: 344, cy: 332, rx: 11, ry: 22,     name: 'Create' },
      9:  { type: 'pill',   cx: 680, cy: 331, rx: 11, ry: 22,     name: 'Options' },
      10: { type: 'stick',  cx: 375, cy: 543, r: 62,               name: 'L3 (Stick Izq.)' },
      11: { type: 'stick',  cx: 649, cy: 543, r: 62,               name: 'R3 (Stick Der.)' },
      12: { type: 'dpad',   cx: 250, cy: 354, w: 46, h: 54, dir: 'up',    name: 'D-Pad Arriba' },
      13: { type: 'dpad',   cx: 250, cy: 465, w: 46, h: 54, dir: 'down',  name: 'D-Pad Abajo' },
      14: { type: 'dpad',   cx: 194, cy: 411, w: 54, h: 46, dir: 'left',  name: 'D-Pad Izquierda' },
      15: { type: 'dpad',   cx: 306, cy: 410, w: 54, h: 46, dir: 'right', name: 'D-Pad Derecha' },
      16: { type: 'circle', cx: 513, cy: 521, r: 24,               name: 'PS Home' },
      17: { type: 'rect',   x: 352, y: 250, w: 320, h: 170, rx: 12, name: 'Touchpad' },
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
      0:  { type: 'circle', cx: 772, cy: 516, r: 35, name: 'Cross (✕)', label: '✕' },
      1:  { type: 'circle', cx: 844, cy: 453, r: 35, name: 'Circle (○)', label: '○' },
      2:  { type: 'circle', cx: 700, cy: 452, r: 35, name: 'Square (□)', label: '□' },
      3:  { type: 'circle', cx: 772, cy: 384, r: 35, name: 'Triangle (△)', label: '△' },
      4:  { type: 'rect',   x: 180, y: 268, w: 96, h: 36, rx: 6,  name: 'L1 Bumper' },
      5:  { type: 'rect',   x: 748, y: 268, w: 96, h: 36, rx: 6,  name: 'R1 Bumper' },
      6:  { type: 'trigger',x: 215, y: 243, w: 70, h: 24, rx: 6,  name: 'L2 Trigger', isAnalog: true },
      7:  { type: 'trigger',x: 739, y: 243, w: 70, h: 24, rx: 6,  name: 'R2 Trigger', isAnalog: true },
      8:  { type: 'rect',   x: 416, y: 444, w: 52, h: 28, rx: 5,  name: 'Select' },
      9:  { type: 'rect',   x: 556, y: 444, w: 52, h: 28, rx: 5,  name: 'Start' },
      10: { type: 'stick',  cx: 347, cy: 550, r: 60,               name: 'L3 (Stick Izq.)' },
      11: { type: 'stick',  cx: 674, cy: 550, r: 60,               name: 'R3 (Stick Der.)' },
      12: { type: 'dpad',   cx: 245, cy: 379, w: 44, h: 54, dir: 'up',    name: 'D-Pad Arriba' },
      13: { type: 'dpad',   cx: 244, cy: 521, w: 44, h: 54, dir: 'down',  name: 'D-Pad Abajo' },
      14: { type: 'dpad',   cx: 179, cy: 444, w: 54, h: 44, dir: 'left',  name: 'D-Pad Izquierda' },
      15: { type: 'dpad',   cx: 320, cy: 444, w: 54, h: 44, dir: 'right', name: 'D-Pad Derecha' },
      16: { type: 'circle', cx: 512, cy: 500, r: 24,               name: 'PS Home' },
    }
  },

  // ── PS2 (DualShock 2) ──────────────────────────────────────
  'ps2': {
    viewBox: '0 0 1024 1024',
    controls: {
      0:  { type: 'circle', cx: 769, cy: 503, r: 35, name: 'Cross (✕)', label: '✕' },
      1:  { type: 'circle', cx: 841, cy: 439, r: 35, name: 'Circle (○)', label: '○' },
      2:  { type: 'circle', cx: 701, cy: 441, r: 35, name: 'Square (□)', label: '□' },
      3:  { type: 'circle', cx: 769, cy: 371, r: 35, name: 'Triangle (△)', label: '△' },
      4:  { type: 'rect',   x: 180, y: 256, w: 96, h: 36, rx: 6,  name: 'L1 Bumper' },
      5:  { type: 'rect',   x: 748, y: 256, w: 96, h: 36, rx: 6,  name: 'R1 Bumper' },
      6:  { type: 'trigger',x: 215, y: 231, w: 70, h: 24, rx: 6,  name: 'L2 Trigger', isAnalog: true },
      7:  { type: 'trigger',x: 739, y: 231, w: 70, h: 24, rx: 6,  name: 'R2 Trigger', isAnalog: true },
      8:  { type: 'rect',   x: 412, y: 430, w: 52, h: 28, rx: 5,  name: 'Select' },
      9:  { type: 'rect',   x: 560, y: 430, w: 52, h: 28, rx: 5,  name: 'Start' },
      10: { type: 'stick',  cx: 335, cy: 542, r: 60,               name: 'L3 (Stick Izq.)' },
      11: { type: 'stick',  cx: 685, cy: 542, r: 60,               name: 'R3 (Stick Der.)' },
      12: { type: 'dpad',   cx: 245, cy: 379, w: 44, h: 54, dir: 'up',    name: 'D-Pad Arriba' },
      13: { type: 'dpad',   cx: 245, cy: 521, w: 44, h: 54, dir: 'down',  name: 'D-Pad Abajo' },
      14: { type: 'dpad',   cx: 180, cy: 445, w: 54, h: 44, dir: 'left',  name: 'D-Pad Izquierda' },
      15: { type: 'dpad',   cx: 321, cy: 445, w: 54, h: 44, dir: 'right', name: 'D-Pad Derecha' },
      16: { type: 'rect',   x: 486, y: 504, w: 46, h: 24, rx: 4,  name: 'Botón ANALOG' },
    }
  },

  // ── Xbox One ───────────────────────────────────────────────
  'xbox-one': {
    viewBox: '0 0 1024 1024',
    controls: {
      0:  { type: 'circle', cx: 733, cy: 456, r: 35, name: 'A Button', label: 'A' },
      1:  { type: 'circle', cx: 790, cy: 408, r: 35, name: 'B Button', label: 'B' },
      2:  { type: 'circle', cx: 675, cy: 402, r: 35, name: 'X Button', label: 'X' },
      3:  { type: 'circle', cx: 731, cy: 346, r: 35, name: 'Y Button', label: 'Y' },
      4:  { type: 'rect',   x: 216, y: 260, w: 104, h: 40, rx: 8,  name: 'LB Bumper' },
      5:  { type: 'rect',   x: 704, y: 260, w: 104, h: 40, rx: 8,  name: 'RB Bumper' },
      6:  { type: 'trigger',x: 242, y: 232, w: 86,  h: 26, rx: 6,  name: 'LT Trigger', isAnalog: true },
      7:  { type: 'trigger',x: 696, y: 232, w: 86,  h: 26, rx: 6,  name: 'RT Trigger', isAnalog: true },
      8:  { type: 'circle', cx: 432, cy: 399, r: 20,               name: 'View' },
      9:  { type: 'circle', cx: 587, cy: 399, r: 20,               name: 'Menu' },
      10: { type: 'stick',  cx: 290, cy: 412, r: 62,               name: 'L3 (Stick Izq.)' },
      11: { type: 'stick',  cx: 607, cy: 535, r: 62,               name: 'R3 (Stick Der.)' },
      12: { type: 'dpad',   cx: 385, cy: 511, w: 40, h: 50, dir: 'up',    name: 'D-Pad Arriba' },
      13: { type: 'dpad',   cx: 384, cy: 601, w: 40, h: 50, dir: 'down',  name: 'D-Pad Abajo' },
      14: { type: 'dpad',   cx: 334, cy: 561, w: 50, h: 40, dir: 'left',  name: 'D-Pad Izquierda' },
      15: { type: 'dpad',   cx: 434, cy: 560, w: 50, h: 40, dir: 'right', name: 'D-Pad Derecha' },
      16: { type: 'circle', cx: 512, cy: 317, r: 32,               name: 'Xbox Guía' },
    }
  },

  // ── Xbox Series X|S ────────────────────────────────────────
  'xbox-series-s': {
    viewBox: '0 0 1024 1024',
    controls: {
      0:  { type: 'circle', cx: 760, cy: 475, r: 35, name: 'A Button', label: 'A' },
      1:  { type: 'circle', cx: 825, cy: 414, r: 35, name: 'B Button', label: 'B' },
      2:  { type: 'circle', cx: 697, cy: 413, r: 35, name: 'X Button', label: 'X' },
      3:  { type: 'circle', cx: 765, cy: 349, r: 35, name: 'Y Button', label: 'Y' },
      4:  { type: 'rect',   x: 168, y: 218, w: 122, h: 44, rx: 8,  name: 'LB Bumper' },
      5:  { type: 'rect',   x: 734, y: 218, w: 122, h: 44, rx: 8,  name: 'RB Bumper' },
      6:  { type: 'trigger',x: 184, y: 165, w: 96,  h: 46, rx: 8,  name: 'LT Trigger', isAnalog: true },
      7:  { type: 'trigger',x: 744, y: 165, w: 96,  h: 46, rx: 8,  name: 'RT Trigger', isAnalog: true },
      8:  { type: 'circle', cx: 438, cy: 406, r: 20,               name: 'View' },
      9:  { type: 'circle', cx: 583, cy: 405, r: 20,               name: 'Menu' },
      10: { type: 'stick',  cx: 254, cy: 433, r: 62,               name: 'L3 (Stick Izq.)' },
      11: { type: 'stick',  cx: 639, cy: 578, r: 62,               name: 'R3 (Stick Der.)' },
      12: { type: 'dpad',   cx: 391, cy: 494, w: 40, h: 50, dir: 'up',    name: 'D-Pad Arriba' },
      13: { type: 'dpad',   cx: 391, cy: 590, w: 40, h: 50, dir: 'down',  name: 'D-Pad Abajo' },
      14: { type: 'dpad',   cx: 343, cy: 542, w: 50, h: 40, dir: 'left',  name: 'D-Pad Izquierda' },
      15: { type: 'dpad',   cx: 439, cy: 542, w: 50, h: 40, dir: 'right', name: 'D-Pad Derecha' },
      16: { type: 'circle', cx: 510, cy: 313, r: 32,               name: 'Xbox Guía' },
      17: { type: 'pill',   cx: 511, cy: 464, rx: 14, ry: 10,     name: 'Share' },
    }
  },

  // ── Unified Xbox (alias/fallback) ──────────────────────────
  'xbox': {
    viewBox: '0 0 1024 1024',
    controls: {
      0:  { type: 'circle', cx: 733, cy: 456, r: 35, name: 'A Button', label: 'A' },
      1:  { type: 'circle', cx: 790, cy: 408, r: 35, name: 'B Button', label: 'B' },
      2:  { type: 'circle', cx: 675, cy: 402, r: 35, name: 'X Button', label: 'X' },
      3:  { type: 'circle', cx: 731, cy: 346, r: 35, name: 'Y Button', label: 'Y' },
      4:  { type: 'rect',   x: 216, y: 260, w: 104, h: 40, rx: 8,  name: 'LB Bumper' },
      5:  { type: 'rect',   x: 704, y: 260, w: 104, h: 40, rx: 8,  name: 'RB Bumper' },
      6:  { type: 'trigger',x: 242, y: 232, w: 86,  h: 26, rx: 6,  name: 'LT Trigger', isAnalog: true },
      7:  { type: 'trigger',x: 696, y: 232, w: 86,  h: 26, rx: 6,  name: 'RT Trigger', isAnalog: true },
      8:  { type: 'circle', cx: 432, cy: 399, r: 20,               name: 'View' },
      9:  { type: 'circle', cx: 587, cy: 399, r: 20,               name: 'Menu' },
      10: { type: 'stick',  cx: 290, cy: 412, r: 62,               name: 'L3 (Stick Izq.)' },
      11: { type: 'stick',  cx: 607, cy: 535, r: 62,               name: 'R3 (Stick Der.)' },
      12: { type: 'dpad',   cx: 385, cy: 511, w: 40, h: 50, dir: 'up',    name: 'D-Pad Arriba' },
      13: { type: 'dpad',   cx: 384, cy: 601, w: 40, h: 50, dir: 'down',  name: 'D-Pad Abajo' },
      14: { type: 'dpad',   cx: 334, cy: 561, w: 50, h: 40, dir: 'left',  name: 'D-Pad Izquierda' },
      15: { type: 'dpad',   cx: 434, cy: 560, w: 50, h: 40, dir: 'right', name: 'D-Pad Derecha' },
      16: { type: 'circle', cx: 512, cy: 317, r: 32,               name: 'Xbox Guía' },
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

if (typeof window !== 'undefined') {
  window.CONTROLLER_PROFILES = CONTROLLER_PROFILES;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONTROLLER_PROFILES;
}
