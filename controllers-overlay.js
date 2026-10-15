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
      0:  { type: 'circle', cx: 804, cy: 487, r: 32, name: 'Cross (✕)', label: '✕' },
      1:  { type: 'circle', cx: 867, cy: 424, r: 32, name: 'Circle (○)', label: '○' },
      2:  { type: 'circle', cx: 741, cy: 424, r: 32, name: 'Square (□)', label: '□' },
      3:  { type: 'circle', cx: 804, cy: 361, r: 32, name: 'Triangle (△)', label: '△' },
      4:  { type: 'rect',   x: 198, y: 268, w: 90,  h: 36, rx: 8,  name: 'L1 Bumper' },
      5:  { type: 'rect',   x: 736, y: 268, w: 90,  h: 36, rx: 8,  name: 'R1 Bumper' },
      6:  { type: 'trigger',x: 204, y: 236, w: 78,  h: 28, rx: 6,  name: 'L2 Trigger', isAnalog: true },
      7:  { type: 'trigger',x: 742, y: 236, w: 78,  h: 28, rx: 6,  name: 'R2 Trigger', isAnalog: true },
      8:  { type: 'pill',   cx: 346, cy: 334, rx: 11, ry: 20,     name: 'Create' },
      9:  { type: 'pill',   cx: 678, cy: 334, rx: 11, ry: 20,     name: 'Options' },
      10: { type: 'stick',  cx: 372, cy: 526, r: 58,               name: 'L3 (Stick Izq.)' },
      11: { type: 'stick',  cx: 652, cy: 526, r: 58,               name: 'R3 (Stick Der.)' },
      12: { type: 'dpad',   cx: 256, cy: 356, w: 40, h: 48, dir: 'up',    name: 'D-Pad Arriba' },
      13: { type: 'dpad',   cx: 256, cy: 452, w: 40, h: 48, dir: 'down',  name: 'D-Pad Abajo' },
      14: { type: 'dpad',   cx: 208, cy: 404, w: 48, h: 40, dir: 'left',  name: 'D-Pad Izquierda' },
      15: { type: 'dpad',   cx: 304, cy: 404, w: 48, h: 40, dir: 'right', name: 'D-Pad Derecha' },
      16: { type: 'circle', cx: 512, cy: 512, r: 22,               name: 'PS Home' },
      17: { type: 'rect',   x: 356, y: 250, w: 312, h: 160, rx: 12, name: 'Touchpad' },
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
      4:  { type: 'rect',   x: 188, y: 248, w: 86,  h: 32, rx: 8,  name: 'L1 Bumper' },
      5:  { type: 'rect',   x: 750, y: 248, w: 86,  h: 32, rx: 8,  name: 'R1 Bumper' },
      6:  { type: 'trigger',x: 200, y: 210, w: 74,  h: 32, rx: 8,  name: 'L2 Trigger', isAnalog: true },
      7:  { type: 'trigger',x: 750, y: 210, w: 74,  h: 32, rx: 8,  name: 'R2 Trigger', isAnalog: true },
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
      0:  { type: 'circle', cx: 788, cy: 535, r: 33, name: 'Cross (✕)', label: '✕' },
      1:  { type: 'circle', cx: 861, cy: 462, r: 33, name: 'Circle (○)', label: '○' },
      2:  { type: 'circle', cx: 715, cy: 462, r: 33, name: 'Square (□)', label: '□' },
      3:  { type: 'circle', cx: 788, cy: 389, r: 33, name: 'Triangle (△)', label: '△' },
      4:  { type: 'rect',   x: 192, y: 265, w: 88,  h: 32, rx: 6,  name: 'L1 Bumper' },
      5:  { type: 'rect',   x: 744, y: 265, w: 88,  h: 32, rx: 6,  name: 'R1 Bumper' },
      6:  { type: 'trigger',x: 204, y: 234, w: 74,  h: 28, rx: 6,  name: 'L2 Trigger', isAnalog: true },
      7:  { type: 'trigger',x: 746, y: 234, w: 74,  h: 28, rx: 6,  name: 'R2 Trigger', isAnalog: true },
      8:  { type: 'rect',   x: 422, y: 446, w: 48,  h: 26, rx: 5,  name: 'Select' },
      9:  { type: 'rect',   x: 554, y: 446, w: 48,  h: 26, rx: 5,  name: 'Start' },
      10: { type: 'stick',  cx: 380, cy: 582, r: 62,               name: 'L3 (Stick Izq.)' },
      11: { type: 'stick',  cx: 644, cy: 582, r: 62,               name: 'R3 (Stick Der.)' },
      12: { type: 'dpad',   cx: 238, cy: 390, w: 40, h: 48, dir: 'up',    name: 'D-Pad Arriba' },
      13: { type: 'dpad',   cx: 238, cy: 494, w: 40, h: 48, dir: 'down',  name: 'D-Pad Abajo' },
      14: { type: 'dpad',   cx: 186, cy: 442, w: 48, h: 40, dir: 'left',  name: 'D-Pad Izquierda' },
      15: { type: 'dpad',   cx: 290, cy: 442, w: 48, h: 40, dir: 'right', name: 'D-Pad Derecha' },
      16: { type: 'circle', cx: 512, cy: 504, r: 22,               name: 'PS Home' },
    }
  },

  // ── PS2 (DualShock 2) ──────────────────────────────────────
  'ps2': {
    viewBox: '0 0 1024 1024',
    controls: {
      0:  { type: 'circle', cx: 784, cy: 521, r: 33, name: 'Cross (✕)', label: '✕' },
      1:  { type: 'circle', cx: 855, cy: 450, r: 33, name: 'Circle (○)', label: '○' },
      2:  { type: 'circle', cx: 713, cy: 450, r: 33, name: 'Square (□)', label: '□' },
      3:  { type: 'circle', cx: 784, cy: 379, r: 33, name: 'Triangle (△)', label: '△' },
      4:  { type: 'rect',   x: 192, y: 254, w: 88,  h: 32, rx: 6,  name: 'L1 Bumper' },
      5:  { type: 'rect',   x: 744, y: 254, w: 88,  h: 32, rx: 6,  name: 'R1 Bumper' },
      6:  { type: 'trigger',x: 204, y: 222, w: 74,  h: 28, rx: 6,  name: 'L2 Trigger', isAnalog: true },
      7:  { type: 'trigger',x: 746, y: 222, w: 74,  h: 28, rx: 6,  name: 'R2 Trigger', isAnalog: true },
      8:  { type: 'rect',   x: 422, y: 434, w: 48,  h: 26, rx: 5,  name: 'Select' },
      9:  { type: 'rect',   x: 554, y: 434, w: 48,  h: 26, rx: 5,  name: 'Start' },
      10: { type: 'stick',  cx: 386, cy: 574, r: 62,               name: 'L3 (Stick Izq.)' },
      11: { type: 'stick',  cx: 638, cy: 574, r: 62,               name: 'R3 (Stick Der.)' },
      12: { type: 'dpad',   cx: 238, cy: 390, w: 40, h: 48, dir: 'up',    name: 'D-Pad Arriba' },
      13: { type: 'dpad',   cx: 238, cy: 494, w: 40, h: 48, dir: 'down',  name: 'D-Pad Abajo' },
      14: { type: 'dpad',   cx: 186, cy: 442, w: 48, h: 40, dir: 'left',  name: 'D-Pad Izquierda' },
      15: { type: 'dpad',   cx: 290, cy: 442, w: 48, h: 40, dir: 'right', name: 'D-Pad Derecha' },
      16: { type: 'rect',   x: 488, y: 506, w: 48,  h: 24, rx: 4,  name: 'Botón ANALOG' },
    }
  },

  // ── Xbox One ───────────────────────────────────────────────
  'xbox-one': {
    viewBox: '0 0 1024 1024',
    controls: {
      0:  { type: 'circle', cx: 738, cy: 461, r: 32, name: 'A Button', label: 'A' },
      1:  { type: 'circle', cx: 801, cy: 398, r: 32, name: 'B Button', label: 'B' },
      2:  { type: 'circle', cx: 675, cy: 398, r: 32, name: 'X Button', label: 'X' },
      3:  { type: 'circle', cx: 738, cy: 335, r: 32, name: 'Y Button', label: 'Y' },
      4:  { type: 'rect',   x: 230, y: 276, w: 92,  h: 36, rx: 8,  name: 'LB Bumper' },
      5:  { type: 'rect',   x: 702, y: 276, w: 92,  h: 36, rx: 8,  name: 'RB Bumper' },
      6:  { type: 'trigger',x: 240, y: 244, w: 80,  h: 28, rx: 6,  name: 'LT Trigger', isAnalog: true },
      7:  { type: 'trigger',x: 704, y: 244, w: 80,  h: 28, rx: 6,  name: 'RT Trigger', isAnalog: true },
      8:  { type: 'circle', cx: 436, cy: 388, r: 18,               name: 'View' },
      9:  { type: 'circle', cx: 588, cy: 388, r: 18,               name: 'Menu' },
      10: { type: 'stick',  cx: 296, cy: 404, r: 56,               name: 'L3 (Stick Izq.)' },
      11: { type: 'stick',  cx: 624, cy: 532, r: 56,               name: 'R3 (Stick Der.)' },
      12: { type: 'dpad',   cx: 406, cy: 494, w: 38, h: 44, dir: 'up',    name: 'D-Pad Arriba' },
      13: { type: 'dpad',   cx: 406, cy: 578, w: 38, h: 44, dir: 'down',  name: 'D-Pad Abajo' },
      14: { type: 'dpad',   cx: 364, cy: 536, w: 44, h: 38, dir: 'left',  name: 'D-Pad Izquierda' },
      15: { type: 'dpad',   cx: 448, cy: 536, w: 44, h: 38, dir: 'right', name: 'D-Pad Derecha' },
      16: { type: 'circle', cx: 512, cy: 314, r: 28,               name: 'Xbox Guía' },
    }
  },

  // ── Xbox Series X|S ────────────────────────────────────────
  'xbox-series-s': {
    viewBox: '0 0 1024 1024',
    controls: {
      0:  { type: 'circle', cx: 746, cy: 447, r: 33, name: 'A Button', label: 'A' },
      1:  { type: 'circle', cx: 813, cy: 380, r: 33, name: 'B Button', label: 'B' },
      2:  { type: 'circle', cx: 679, cy: 380, r: 33, name: 'X Button', label: 'X' },
      3:  { type: 'circle', cx: 746, cy: 313, r: 33, name: 'Y Button', label: 'Y' },
      4:  { type: 'rect',   x: 190, y: 172, w: 104, h: 42, rx: 8,  name: 'LB Bumper' },
      5:  { type: 'rect',   x: 730, y: 172, w: 104, h: 42, rx: 8,  name: 'RB Bumper' },
      6:  { type: 'trigger',x: 204, y: 136, w: 86,  h: 34, rx: 6,  name: 'LT Trigger', isAnalog: true },
      7:  { type: 'trigger',x: 734, y: 136, w: 86,  h: 34, rx: 6,  name: 'RT Trigger', isAnalog: true },
      8:  { type: 'circle', cx: 436, cy: 388, r: 18,               name: 'View' },
      9:  { type: 'circle', cx: 588, cy: 388, r: 18,               name: 'Menu' },
      10: { type: 'stick',  cx: 260, cy: 406, r: 62,               name: 'L3 (Stick Izq.)' },
      11: { type: 'stick',  cx: 640, cy: 560, r: 62,               name: 'R3 (Stick Der.)' },
      12: { type: 'dpad',   cx: 392, cy: 498, w: 38, h: 44, dir: 'up',    name: 'D-Pad Arriba' },
      13: { type: 'dpad',   cx: 392, cy: 590, w: 38, h: 44, dir: 'down',  name: 'D-Pad Abajo' },
      14: { type: 'dpad',   cx: 346, cy: 544, w: 44, h: 38, dir: 'left',  name: 'D-Pad Izquierda' },
      15: { type: 'dpad',   cx: 438, cy: 544, w: 44, h: 38, dir: 'right', name: 'D-Pad Derecha' },
      16: { type: 'circle', cx: 512, cy: 288, r: 28,               name: 'Xbox Guía' },
      17: { type: 'pill',   cx: 512, cy: 450, rx: 12, ry: 10,     name: 'Share' },
    }
  },

  // ── Unified Xbox (Fallback alias) ──────────────────────────
  'xbox': {
    viewBox: '0 0 1024 1024',
    controls: {
      0:  { type: 'circle', cx: 738, cy: 461, r: 32, name: 'A Button', label: 'A' },
      1:  { type: 'circle', cx: 801, cy: 398, r: 32, name: 'B Button', label: 'B' },
      2:  { type: 'circle', cx: 675, cy: 398, r: 32, name: 'X Button', label: 'X' },
      3:  { type: 'circle', cx: 738, cy: 335, r: 32, name: 'Y Button', label: 'Y' },
      4:  { type: 'rect',   x: 230, y: 276, w: 92,  h: 36, rx: 8,  name: 'LB Bumper' },
      5:  { type: 'rect',   x: 702, y: 276, w: 92,  h: 36, rx: 8,  name: 'RB Bumper' },
      6:  { type: 'trigger',x: 240, y: 244, w: 80,  h: 28, rx: 6,  name: 'LT Trigger', isAnalog: true },
      7:  { type: 'trigger',x: 704, y: 244, w: 80,  h: 28, rx: 6,  name: 'RT Trigger', isAnalog: true },
      8:  { type: 'circle', cx: 436, cy: 388, r: 18,               name: 'View' },
      9:  { type: 'circle', cx: 588, cy: 388, r: 18,               name: 'Menu' },
      10: { type: 'stick',  cx: 296, cy: 404, r: 56,               name: 'L3 (Stick Izq.)' },
      11: { type: 'stick',  cx: 624, cy: 532, r: 56,               name: 'R3 (Stick Der.)' },
      12: { type: 'dpad',   cx: 406, cy: 494, w: 38, h: 44, dir: 'up',    name: 'D-Pad Arriba' },
      13: { type: 'dpad',   cx: 406, cy: 578, w: 38, h: 44, dir: 'down',  name: 'D-Pad Abajo' },
      14: { type: 'dpad',   cx: 364, cy: 536, w: 44, h: 38, dir: 'left',  name: 'D-Pad Izquierda' },
      15: { type: 'dpad',   cx: 448, cy: 536, w: 44, h: 38, dir: 'right', name: 'D-Pad Derecha' },
      16: { type: 'circle', cx: 512, cy: 314, r: 28,               name: 'Xbox Guía' },
    }
  },

  // ── Generic / Fallback ──────────────────────────────────────
  'generic': {
    viewBox: '0 0 1024 1024',
    controls: {
      0:  { type: 'circle', cx: 738, cy: 461, r: 32, name: 'Botón 0 / A', label: '0' },
      1:  { type: 'circle', cx: 801, cy: 398, r: 32, name: 'Botón 1 / B', label: '1' },
      2:  { type: 'circle', cx: 675, cy: 398, r: 32, name: 'Botón 2 / X', label: '2' },
      3:  { type: 'circle', cx: 738, cy: 335, r: 32, name: 'Botón 3 / Y', label: '3' },
      4:  { type: 'rect',   x: 220, y: 260, w: 96,  h: 38, rx: 8,  name: 'Botón 4 / L1' },
      5:  { type: 'rect',   x: 708, y: 260, w: 96,  h: 38, rx: 8,  name: 'Botón 5 / R1' },
      6:  { type: 'trigger',x: 234, y: 228, w: 80,  h: 28, rx: 6,  name: 'Botón 6 / L2', isAnalog: true },
      7:  { type: 'trigger',x: 710, y: 228, w: 80,  h: 28, rx: 6,  name: 'Botón 7 / R2', isAnalog: true },
      8:  { type: 'circle', cx: 436, cy: 388, r: 18,               name: 'Botón 8 / Select' },
      9:  { type: 'circle', cx: 588, cy: 388, r: 18,               name: 'Botón 9 / Start' },
      10: { type: 'stick',  cx: 296, cy: 404, r: 56,               name: 'Botón 10 / L3' },
      11: { type: 'stick',  cx: 624, cy: 532, r: 56,               name: 'Botón 11 / R3' },
      12: { type: 'dpad',   cx: 406, cy: 494, w: 38, h: 44, dir: 'up',    name: 'Botón 12 / D-Pad Arriba' },
      13: { type: 'dpad',   cx: 406, cy: 578, w: 38, h: 44, dir: 'down',  name: 'Botón 13 / D-Pad Abajo' },
      14: { type: 'dpad',   cx: 364, cy: 536, w: 44, h: 38, dir: 'left',  name: 'Botón 14 / D-Pad Izq.' },
      15: { type: 'dpad',   cx: 448, cy: 536, w: 44, h: 38, dir: 'right', name: 'Botón 15 / D-Pad Der.' },
      16: { type: 'circle', cx: 512, cy: 314, r: 28,               name: 'Botón 16 / Home' },
    }
  }
};

if (typeof window !== 'undefined') {
  window.CONTROLLER_PROFILES = CONTROLLER_PROFILES;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONTROLLER_PROFILES;
}
