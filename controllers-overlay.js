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
      0:  { type: 'circle', cx: 766, cy: 460, r: 33, name: 'Cross (✕)', label: '✕' },
      1:  { type: 'circle', cx: 827, cy: 399, r: 33, name: 'Circle (○)', label: '○' },
      2:  { type: 'circle', cx: 705, cy: 399, r: 33, name: 'Square (□)', label: '□' },
      3:  { type: 'circle', cx: 766, cy: 338, r: 33, name: 'Triangle (△)', label: '△' },
      4:  { type: 'rect',   x: 210, y: 235, w: 90, h: 30, rx: 8,  name: 'L1 Bumper' },
      5:  { type: 'rect',   x: 680, y: 235, w: 90, h: 30, rx: 8,  name: 'R1 Bumper' },
      6:  { type: 'trigger',x: 220, y: 205, w: 80, h: 26, rx: 6,  name: 'L2 Trigger', isAnalog: true },
      7:  { type: 'trigger',x: 680, y: 205, w: 80, h: 26, rx: 6,  name: 'R2 Trigger', isAnalog: true },
      8:  { type: 'pill',   cx: 300, cy: 302, rx: 10, ry: 20,     name: 'Create' },
      9:  { type: 'pill',   cx: 700, cy: 302, rx: 10, ry: 20,     name: 'Options' },
      10: { type: 'stick',  cx: 360, cy: 526, r: 58,               name: 'L3 (Stick Izq.)' },
      11: { type: 'stick',  cx: 636, cy: 526, r: 58,               name: 'R3 (Stick Der.)' },
      12: { type: 'dpad',   cx: 234, cy: 345, w: 38, h: 48, dir: 'up',    name: 'D-Pad Arriba' },
      13: { type: 'dpad',   cx: 234, cy: 452, w: 38, h: 48, dir: 'down',  name: 'D-Pad Abajo' },
      14: { type: 'dpad',   cx: 180, cy: 398, w: 48, h: 38, dir: 'left',  name: 'D-Pad Izquierda' },
      15: { type: 'dpad',   cx: 288, cy: 398, w: 48, h: 38, dir: 'right', name: 'D-Pad Derecha' },
      16: { type: 'circle', cx: 500, cy: 506, r: 24,               name: 'PS Home' },
      17: { type: 'rect',   x: 348, y: 266, w: 304, h: 162, rx: 12, name: 'Touchpad' },
    }
  },

  // ── PS4 (DualShock 4) ──────────────────────────────────────
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
      0:  { type: 'circle', cx: 750, cy: 506, r: 36, name: 'Cross (✕)', label: '✕' },
      1:  { type: 'circle', cx: 823, cy: 436, r: 36, name: 'Circle (○)', label: '○' },
      2:  { type: 'circle', cx: 680, cy: 436, r: 36, name: 'Square (□)', label: '□' },
      3:  { type: 'circle', cx: 750, cy: 368, r: 36, name: 'Triangle (△)', label: '△' },
      4:  { type: 'rect',   x: 206, y: 252, w: 86, h: 32, rx: 6,  name: 'L1 Bumper' },
      5:  { type: 'rect',   x: 684, y: 252, w: 86, h: 32, rx: 6,  name: 'R1 Bumper' },
      6:  { type: 'trigger',x: 206, y: 218, w: 80, h: 30, rx: 6,  name: 'L2 Trigger', isAnalog: true },
      7:  { type: 'trigger',x: 690, y: 218, w: 80, h: 30, rx: 6,  name: 'R2 Trigger', isAnalog: true },
      8:  { type: 'rect',   x: 416, y: 440, w: 44, h: 26, rx: 5,  name: 'Select' },
      9:  { type: 'rect',   x: 562, y: 440, w: 44, h: 26, rx: 5,  name: 'Start' },
      10: { type: 'stick',  cx: 362, cy: 560, r: 58,               name: 'L3 (Stick Izq.)' },
      11: { type: 'stick',  cx: 624, cy: 560, r: 58,               name: 'R3 (Stick Der.)' },
      12: { type: 'dpad',   cx: 242, cy: 370, w: 44, h: 48, dir: 'up',    name: 'D-Pad Arriba' },
      13: { type: 'dpad',   cx: 242, cy: 482, w: 44, h: 48, dir: 'down',  name: 'D-Pad Abajo' },
      14: { type: 'dpad',   cx: 186, cy: 426, w: 48, h: 44, dir: 'left',  name: 'D-Pad Izquierda' },
      15: { type: 'dpad',   cx: 298, cy: 426, w: 48, h: 44, dir: 'right', name: 'D-Pad Derecha' },
      16: { type: 'circle', cx: 495, cy: 492, r: 24,               name: 'PS Home' },
    }
  },

  // ── PS2 (DualShock 2) ──────────────────────────────────────
  'ps2': {
    viewBox: '0 0 1024 1024',
    controls: {
      0:  { type: 'circle', cx: 746, cy: 492, r: 36, name: 'Cross (✕)', label: '✕' },
      1:  { type: 'circle', cx: 819, cy: 422, r: 36, name: 'Circle (○)', label: '○' },
      2:  { type: 'circle', cx: 675, cy: 422, r: 36, name: 'Square (□)', label: '□' },
      3:  { type: 'circle', cx: 746, cy: 350, r: 36, name: 'Triangle (△)', label: '△' },
      4:  { type: 'rect',   x: 208, y: 244, w: 86, h: 34, rx: 6,  name: 'L1 Bumper' },
      5:  { type: 'rect',   x: 684, y: 244, w: 86, h: 34, rx: 6,  name: 'R1 Bumper' },
      6:  { type: 'trigger',x: 208, y: 210, w: 80, h: 30, rx: 6,  name: 'L2 Trigger', isAnalog: true },
      7:  { type: 'trigger',x: 690, y: 210, w: 80, h: 30, rx: 6,  name: 'R2 Trigger', isAnalog: true },
      8:  { type: 'rect',   x: 414, y: 424, w: 46, h: 28, rx: 5,  name: 'Select' },
      9:  { type: 'rect',   x: 562, y: 424, w: 46, h: 28, rx: 5,  name: 'Start' },
      10: { type: 'stick',  cx: 360, cy: 555, r: 58,               name: 'L3 (Stick Izq.)' },
      11: { type: 'stick',  cx: 618, cy: 555, r: 58,               name: 'R3 (Stick Der.)' },
      12: { type: 'dpad',   cx: 244, cy: 360, w: 44, h: 48, dir: 'up',    name: 'D-Pad Arriba' },
      13: { type: 'dpad',   cx: 244, cy: 488, w: 44, h: 48, dir: 'down',  name: 'D-Pad Abajo' },
      14: { type: 'dpad',   cx: 180, cy: 424, w: 48, h: 44, dir: 'left',  name: 'D-Pad Izquierda' },
      15: { type: 'dpad',   cx: 306, cy: 424, w: 48, h: 44, dir: 'right', name: 'D-Pad Derecha' },
      16: { type: 'rect',   x: 490, y: 508, w: 46, h: 26, rx: 5,  name: 'Botón ANALOG' },
    }
  },

  // ── Xbox Series S / Series X ───────────────────────────────
  'xbox-series-s': {
    viewBox: '0 0 1024 1024',
    controls: {
      0:  { type: 'circle', cx: 738, cy: 460, r: 34, name: 'A Button', label: 'A' },
      1:  { type: 'circle', cx: 803, cy: 398, r: 34, name: 'B Button', label: 'B' },
      2:  { type: 'circle', cx: 673, cy: 398, r: 34, name: 'X Button', label: 'X' },
      3:  { type: 'circle', cx: 738, cy: 335, r: 34, name: 'Y Button', label: 'Y' },
      4:  { type: 'rect',   x: 194, y: 200, w: 94, h: 38, rx: 10, name: 'LB Bumper' },
      5:  { type: 'rect',   x: 690, y: 200, w: 94, h: 38, rx: 10, name: 'RB Bumper' },
      6:  { type: 'trigger',x: 204, y: 148, w: 84, h: 44, rx: 10, name: 'LT Trigger', isAnalog: true },
      7:  { type: 'trigger',x: 690, y: 148, w: 84, h: 44, rx: 10, name: 'RT Trigger', isAnalog: true },
      8:  { type: 'circle', cx: 428, cy: 398, r: 20,               name: 'View' },
      9:  { type: 'circle', cx: 565, cy: 398, r: 20,               name: 'Menu' },
      10: { type: 'stick',  cx: 253, cy: 396, r: 56,               name: 'L3 (Stick Izq.)' },
      11: { type: 'stick',  cx: 618, cy: 542, r: 56,               name: 'R3 (Stick Der.)' },
      12: { type: 'dpad',   cx: 374, cy: 508, w: 36, h: 44, dir: 'up',    name: 'D-Pad Arriba' },
      13: { type: 'dpad',   cx: 374, cy: 596, w: 36, h: 44, dir: 'down',  name: 'D-Pad Abajo' },
      14: { type: 'dpad',   cx: 330, cy: 552, w: 44, h: 36, dir: 'left',  name: 'D-Pad Izquierda' },
      15: { type: 'dpad',   cx: 418, cy: 552, w: 44, h: 36, dir: 'right', name: 'D-Pad Derecha' },
      16: { type: 'circle', cx: 498, cy: 298, r: 38,               name: 'Xbox Guía' },
      17: { type: 'pill',   cx: 498, cy: 448, rx: 14, ry: 10,     name: 'Share' },
    }
  },

  // ── Xbox One ───────────────────────────────────────────────
  'xbox-one': {
    viewBox: '0 0 1024 1024',
    controls: {
      0:  { type: 'circle', cx: 714, cy: 454, r: 34, name: 'A Button', label: 'A' },
      1:  { type: 'circle', cx: 771, cy: 396, r: 34, name: 'B Button', label: 'B' },
      2:  { type: 'circle', cx: 657, cy: 396, r: 34, name: 'X Button', label: 'X' },
      3:  { type: 'circle', cx: 714, cy: 338, r: 34, name: 'Y Button', label: 'Y' },
      4:  { type: 'rect',   x: 204, y: 230, w: 92, h: 34, rx: 8,  name: 'LB Bumper' },
      5:  { type: 'rect',   x: 684, y: 230, w: 92, h: 34, rx: 8,  name: 'RB Bumper' },
      6:  { type: 'trigger',x: 214, y: 196, w: 78, h: 30, rx: 8,  name: 'LT Trigger', isAnalog: true },
      7:  { type: 'trigger',x: 688, y: 196, w: 78, h: 30, rx: 8,  name: 'RT Trigger', isAnalog: true },
      8:  { type: 'circle', cx: 432, cy: 386, r: 18,               name: 'View' },
      9:  { type: 'circle', cx: 556, cy: 386, r: 18,               name: 'Menu' },
      10: { type: 'stick',  cx: 282, cy: 394, r: 56,               name: 'L3 (Stick Izq.)' },
      11: { type: 'stick',  cx: 602, cy: 516, r: 56,               name: 'R3 (Stick Der.)' },
      12: { type: 'dpad',   cx: 388, cy: 470, w: 36, h: 44, dir: 'up',    name: 'D-Pad Arriba' },
      13: { type: 'dpad',   cx: 388, cy: 562, w: 36, h: 44, dir: 'down',  name: 'D-Pad Abajo' },
      14: { type: 'dpad',   cx: 342, cy: 516, w: 44, h: 36, dir: 'left',  name: 'D-Pad Izquierda' },
      15: { type: 'dpad',   cx: 434, cy: 516, w: 44, h: 36, dir: 'right', name: 'D-Pad Derecha' },
      16: { type: 'circle', cx: 500, cy: 308, r: 34,               name: 'Xbox Guía' },
    }
  },

  // ── Generic / Fallback ──────────────────────────────────────
  'generic': {
    viewBox: '0 0 1024 1024',
    controls: {
      0:  { type: 'circle', cx: 806, cy: 480, r: 34, name: 'A / Cross' },
      1:  { type: 'circle', cx: 876, cy: 410, r: 34, name: 'B / Circle' },
      2:  { type: 'circle', cx: 736, cy: 410, r: 34, name: 'X / Square' },
      3:  { type: 'circle', cx: 806, cy: 340, r: 34, name: 'Y / Triangle' },
      4:  { type: 'rect',   x: 188, y: 248, w: 86, h: 32, rx: 8,  name: 'LB / L1' },
      5:  { type: 'rect',   x: 750, y: 248, w: 86, h: 32, rx: 8,  name: 'RB / R1' },
      6:  { type: 'trigger',x: 200, y: 210, w: 74, h: 32, rx: 8,  name: 'LT / L2', isAnalog: true },
      7:  { type: 'trigger',x: 750, y: 210, w: 74, h: 32, rx: 8,  name: 'RT / R2', isAnalog: true },
      8:  { type: 'pill',   cx: 326, cy: 318, rx: 10, ry: 18,     name: 'Select' },
      9:  { type: 'pill',   cx: 698, cy: 318, rx: 10, ry: 18,     name: 'Start' },
      10: { type: 'stick',  cx: 352, cy: 542, r: 58,               name: 'L3 (Stick Izq.)' },
      11: { type: 'stick',  cx: 672, cy: 542, r: 58,               name: 'R3 (Stick Der.)' },
      12: { type: 'dpad',   cx: 218, cy: 355, w: 40, h: 48, dir: 'up',    name: 'D-Pad Arriba' },
      13: { type: 'dpad',   cx: 218, cy: 455, w: 40, h: 48, dir: 'down',  name: 'D-Pad Abajo' },
      14: { type: 'dpad',   cx: 168, cy: 405, w: 48, h: 40, dir: 'left',  name: 'D-Pad Izquierda' },
      15: { type: 'dpad',   cx: 268, cy: 405, w: 48, h: 40, dir: 'right', name: 'D-Pad Derecha' },
      16: { type: 'circle', cx: 513, cy: 547, r: 20,               name: 'Home' },
    }
  }
};
