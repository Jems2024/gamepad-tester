/* ============================================================
   GAMEPAD TESTER — controllers-overlay.js
   Interactive Hotspot & Glow Overlay for Official Photos
   ============================================================ */

const OFFICIAL_OVERLAYS = {

  // ── PS5 (DualSense) ────────────────────────────────────────
  'ps5': {
    buttons: {
      0:  { type: 'circle', cx: 765, cy: 460, r: 32, color: '#2979ff', name: 'Cross (Cruz)' },
      1:  { type: 'circle', cx: 825, cy: 398, r: 32, color: '#ff1744', name: 'Circle (Círculo)' },
      2:  { type: 'circle', cx: 705, cy: 398, r: 32, color: '#ff4081', name: 'Square (Cuadrado)' },
      3:  { type: 'circle', cx: 765, cy: 335, r: 32, color: '#00e676', name: 'Triangle (Triángulo)' },
      4:  { type: 'rect',   x: 195, y: 232, w: 85, h: 36, rx: 12, color: '#2979ff', name: 'L1: Bumper Izquierdo' },
      5:  { type: 'rect',   x: 720, y: 232, w: 85, h: 36, rx: 12, color: '#2979ff', name: 'R1: Bumper Derecho' },
      6:  { type: 'trigger',x: 205, y: 188, w: 75, h: 42, rx: 14, color: '#ff9100', name: 'L2: Gatillo Izquierdo' },
      7:  { type: 'trigger',x: 720, y: 188, w: 75, h: 42, rx: 14, color: '#ff9100', name: 'R2: Gatillo Derecho' },
      8:  { type: 'pill',   cx: 305, cy: 305, rx: 12, ry: 20, color: '#ffffff', name: 'Create Button' },
      9:  { type: 'pill',   cx: 695, cy: 305, rx: 12, ry: 20, color: '#ffffff', name: 'Options Button' },
      10: { type: 'stick',  cx: 363, cy: 520, r: 54, color: '#2979ff', name: 'L3: Stick Izquierdo' },
      11: { type: 'stick',  cx: 637, cy: 520, r: 54, color: '#2979ff', name: 'R3: Stick Derecho' },
      12: { type: 'dpad',   cx: 236, cy: 345, w: 36, h: 46, dir: 'up',    name: 'D-Pad: Arriba' },
      13: { type: 'dpad',   cx: 236, cy: 445, w: 36, h: 46, dir: 'down',  name: 'D-Pad: Abajo' },
      14: { type: 'dpad',   cx: 186, cy: 395, w: 46, h: 36, dir: 'left',  name: 'D-Pad: Izquierda' },
      15: { type: 'dpad',   cx: 286, cy: 395, w: 46, h: 36, dir: 'right', name: 'D-Pad: Derecha' },
      16: { type: 'circle', cx: 500, cy: 506, r: 20, color: '#ffffff', name: 'Botón PS (Home)' },
      17: { type: 'rect',   x: 350, y: 255, w: 300, h: 165, rx: 16, color: '#00e5ff', name: 'Touchpad (Click)' },
    },
    lightbar: { x: 350, y: 250, w: 300, h: 12, rx: 6, color: '#0066ff' }
  },

  // ── PS4 (DualShock 4) ──────────────────────────────────────
  'ps4': {
    buttons: {
      0:  { type: 'circle', cx: 785, cy: 460, r: 34, color: '#2979ff', name: 'Cross (Cruz)' },
      1:  { type: 'circle', cx: 848, cy: 400, r: 34, color: '#ff1744', name: 'Circle (Círculo)' },
      2:  { type: 'circle', cx: 722, cy: 400, r: 34, color: '#ff4081', name: 'Square (Cuadrado)' },
      3:  { type: 'circle', cx: 785, cy: 338, r: 34, color: '#00e676', name: 'Triangle (Triángulo)' },
      4:  { type: 'rect',   x: 200, y: 228, w: 85, h: 36, rx: 12, color: '#2979ff', name: 'L1: Bumper Izquierdo' },
      5:  { type: 'rect',   x: 715, y: 228, w: 85, h: 36, rx: 12, color: '#2979ff', name: 'R1: Bumper Derecho' },
      6:  { type: 'trigger',x: 215, y: 185, w: 75, h: 42, rx: 14, color: '#ff9100', name: 'L2: Gatillo Izquierdo' },
      7:  { type: 'trigger',x: 710, y: 185, w: 75, h: 42, rx: 14, color: '#ff9100', name: 'R2: Gatillo Derecho' },
      8:  { type: 'pill',   cx: 315, cy: 312, rx: 12, ry: 24, color: '#ffffff', name: 'Share' },
      9:  { type: 'pill',   cx: 680, cy: 312, rx: 12, ry: 24, color: '#ffffff', name: 'Options' },
      10: { type: 'stick',  cx: 356, cy: 538, r: 54, color: '#2979ff', name: 'L3: Stick Izquierdo' },
      11: { type: 'stick',  cx: 644, cy: 538, r: 54, color: '#2979ff', name: 'R3: Stick Derecho' },
      12: { type: 'dpad',   cx: 212, cy: 348, w: 36, h: 46, dir: 'up',    name: 'D-Pad: Arriba' },
      13: { type: 'dpad',   cx: 212, cy: 446, w: 36, h: 46, dir: 'down',  name: 'D-Pad: Abajo' },
      14: { type: 'dpad',   cx: 162, cy: 397, w: 46, h: 36, dir: 'left',  name: 'D-Pad: Izquierda' },
      15: { type: 'dpad',   cx: 262, cy: 397, w: 46, h: 36, dir: 'right', name: 'D-Pad: Derecha' },
      16: { type: 'circle', cx: 500, cy: 532, r: 22, color: '#ffffff', name: 'Botón PS (Home)' },
      17: { type: 'rect',   x: 350, y: 270, w: 300, h: 155, rx: 14, color: '#00e5ff', name: 'Touchpad (Click)' },
    },
    lightbar: { x: 355, y: 268, w: 290, h: 14, rx: 6, color: '#0066ff' }
  },

  // ── PS3 (DualShock 3) ──────────────────────────────────────
  'ps3': {
    buttons: {
      0:  { type: 'circle', cx: 772, cy: 521, r: 35, color: '#2979ff', name: 'Cross (Cruz)' },
      1:  { type: 'circle', cx: 843, cy: 453, r: 35, color: '#ff1744', name: 'Circle (Círculo)' },
      2:  { type: 'circle', cx: 700, cy: 452, r: 35, color: '#ff4081', name: 'Square (Cuadrado)' },
      3:  { type: 'circle', cx: 773, cy: 384, r: 35, color: '#00e676', name: 'Triangle (Triángulo)' },
      4:  { type: 'rect',   x: 215, y: 272, w: 76, h: 36, rx: 12, color: '#2979ff', name: 'L1' },
      5:  { type: 'rect',   x: 733, y: 272, w: 76, h: 36, rx: 12, color: '#2979ff', name: 'R1' },
      6:  { type: 'trigger',x: 215, y: 240, w: 76, h: 30, rx: 10, color: '#ff9100', name: 'L2' },
      7:  { type: 'trigger',x: 733, y: 240, w: 76, h: 30, rx: 10, color: '#ff9100', name: 'R2' },
      8:  { type: 'rect',   x: 412, y: 440, w: 44, h: 28, rx: 6,  color: '#ffffff', name: 'Select' },
      9:  { type: 'rect',   x: 568, y: 440, w: 44, h: 28, rx: 6,  color: '#ffffff', name: 'Start' },
      10: { type: 'stick',  cx: 374, cy: 586, r: 58, color: '#2979ff', name: 'L3: Stick Izquierdo' },
      11: { type: 'stick',  cx: 642, cy: 588, r: 58, color: '#2979ff', name: 'R3: Stick Derecho' },
      12: { type: 'dpad',   cx: 252, cy: 396, w: 48, h: 54, dir: 'up',    name: 'D-Pad: Arriba' },
      13: { type: 'dpad',   cx: 252, cy: 508, w: 48, h: 54, dir: 'down',  name: 'D-Pad: Abajo' },
      14: { type: 'dpad',   cx: 196, cy: 452, w: 54, h: 48, dir: 'left',  name: 'D-Pad: Izquierda' },
      15: { type: 'dpad',   cx: 308, cy: 452, w: 54, h: 48, dir: 'right', name: 'D-Pad: Derecha' },
      16: { type: 'circle', cx: 512, cy: 504, r: 24, color: '#ffffff', name: 'Botón PS (Home)' },
    }
  },

  // ── PS2 (DualShock 2) ──────────────────────────────────────
  'ps2': {
    buttons: {
      0:  { type: 'circle', cx: 769, cy: 508, r: 35, color: '#2979ff', name: 'Cross (Cruz)' },
      1:  { type: 'circle', cx: 840, cy: 440, r: 35, color: '#ff1744', name: 'Circle (Círculo)' },
      2:  { type: 'circle', cx: 698, cy: 440, r: 35, color: '#ff4081', name: 'Square (Cuadrado)' },
      3:  { type: 'circle', cx: 769, cy: 371, r: 35, color: '#00e676', name: 'Triangle (Triángulo)' },
      4:  { type: 'rect',   x: 215, y: 260, w: 75, h: 36, rx: 12, color: '#2979ff', name: 'L1' },
      5:  { type: 'rect',   x: 734, y: 260, w: 75, h: 36, rx: 12, color: '#2979ff', name: 'R1' },
      6:  { type: 'trigger',x: 215, y: 228, w: 75, h: 30, rx: 10, color: '#ff9100', name: 'L2' },
      7:  { type: 'trigger',x: 734, y: 228, w: 75, h: 30, rx: 10, color: '#ff9100', name: 'R2' },
      8:  { type: 'rect',   x: 414, y: 426, w: 44, h: 26, rx: 6,  color: '#ffffff', name: 'Select' },
      9:  { type: 'rect',   x: 566, y: 426, w: 44, h: 26, rx: 6,  color: '#ffffff', name: 'Start' },
      10: { type: 'stick',  cx: 384, cy: 576, r: 58, color: '#2979ff', name: 'L3: Stick Izquierdo' },
      11: { type: 'stick',  cx: 640, cy: 576, r: 58, color: '#2979ff', name: 'R3: Stick Derecho' },
      12: { type: 'dpad',   cx: 255, cy: 382, w: 48, h: 54, dir: 'up',    name: 'D-Pad: Arriba' },
      13: { type: 'dpad',   cx: 255, cy: 494, w: 48, h: 54, dir: 'down',  name: 'D-Pad: Abajo' },
      14: { type: 'dpad',   cx: 199, cy: 438, w: 54, h: 48, dir: 'left',  name: 'D-Pad: Izquierda' },
      15: { type: 'dpad',   cx: 311, cy: 438, w: 54, h: 48, dir: 'right', name: 'D-Pad: Derecha' },
      16: { type: 'rect',   x: 487, y: 508, w: 50, h: 26, rx: 6,  color: '#ff1744', name: 'Botón ANALOG' },
    }
  },

  // ── Xbox Series S / Series X ───────────────────────────────
  'xbox-series-s': {
    buttons: {
      0:  { type: 'circle', cx: 746, cy: 466, r: 34, color: '#00e676', name: 'A Button (Verde)' },
      1:  { type: 'circle', cx: 812, cy: 400, r: 34, color: '#ff1744', name: 'B Button (Rojo)' },
      2:  { type: 'circle', cx: 680, cy: 400, r: 34, color: '#00b0ff', name: 'X Button (Azul)' },
      3:  { type: 'circle', cx: 746, cy: 334, r: 34, color: '#ffd600', name: 'Y Button (Amarillo)' },
      4:  { type: 'rect',   x: 180, y: 195, w: 90, h: 36, rx: 12, color: '#00e676', name: 'LB: Left Bumper' },
      5:  { type: 'rect',   x: 730, y: 195, w: 90, h: 36, rx: 12, color: '#00e676', name: 'RB: Right Bumper' },
      6:  { type: 'trigger',x: 190, y: 145, w: 85, h: 48, rx: 14, color: '#ff9100', name: 'LT: Left Trigger' },
      7:  { type: 'trigger',x: 725, y: 145, w: 85, h: 48, rx: 14, color: '#ff9100', name: 'RT: Right Trigger' },
      8:  { type: 'circle', cx: 430, cy: 400, r: 18, color: '#ffffff', name: 'View / Back' },
      9:  { type: 'circle', cx: 570, cy: 400, r: 18, color: '#ffffff', name: 'Menu / Start' },
      10: { type: 'stick',  cx: 254, cy: 398, r: 56, color: '#00e676', name: 'L3: Stick Izquierdo (Alto)' },
      11: { type: 'stick',  cx: 624, cy: 546, r: 56, color: '#00e676', name: 'R3: Stick Derecho (Bajo)' },
      12: { type: 'dpad',   cx: 374, cy: 512, w: 36, h: 42, dir: 'up',    name: 'D-Pad: Arriba' },
      13: { type: 'dpad',   cx: 374, cy: 596, w: 36, h: 42, dir: 'down',  name: 'D-Pad: Abajo' },
      14: { type: 'dpad',   cx: 332, cy: 554, w: 42, h: 36, dir: 'left',  name: 'D-Pad: Izquierda' },
      15: { type: 'dpad',   cx: 416, cy: 554, w: 42, h: 36, dir: 'right', name: 'D-Pad: Derecha' },
      16: { type: 'circle', cx: 500, cy: 304, r: 36, color: '#ffffff', name: 'Xbox Guía (Home)' },
      17: { type: 'pill',   cx: 500, cy: 450, rx: 12, ry: 16, color: '#ffffff', name: 'Share Button' },
    }
  },

  // ── Xbox One ───────────────────────────────────────────────
  'xbox-one': {
    buttons: {
      0:  { type: 'circle', cx: 726, cy: 456, r: 34, color: '#00e676', name: 'A Button (Verde)' },
      1:  { type: 'circle', cx: 790, cy: 396, r: 34, color: '#ff1744', name: 'B Button (Rojo)' },
      2:  { type: 'circle', cx: 662, cy: 396, r: 34, color: '#00b0ff', name: 'X Button (Azul)' },
      3:  { type: 'circle', cx: 726, cy: 336, r: 34, color: '#ffd600', name: 'Y Button (Amarillo)' },
      4:  { type: 'rect',   x: 212, y: 248, w: 92, h: 34, rx: 12, color: '#00e676', name: 'LB: Left Bumper' },
      5:  { type: 'rect',   x: 696, y: 248, w: 92, h: 34, rx: 12, color: '#00e676', name: 'RB: Right Bumper' },
      6:  { type: 'trigger',x: 220, y: 218, w: 78, h: 28, rx: 10, color: '#ff9100', name: 'LT: Left Trigger' },
      7:  { type: 'trigger',x: 702, y: 218, w: 78, h: 28, rx: 10, color: '#ff9100', name: 'RT: Right Trigger' },
      8:  { type: 'circle', cx: 438, cy: 395, r: 18, color: '#ffffff', name: 'View / Back' },
      9:  { type: 'circle', cx: 562, cy: 395, r: 18, color: '#ffffff', name: 'Menu / Start' },
      10: { type: 'stick',  cx: 290, cy: 394, r: 54, color: '#00e676', name: 'L3: Stick Izquierdo (Alto)' },
      11: { type: 'stick',  cx: 610, cy: 528, r: 54, color: '#00e676', name: 'R3: Stick Derecho (Bajo)' },
      12: { type: 'dpad',   cx: 390, cy: 486, w: 34, h: 42, dir: 'up',    name: 'D-Pad: Arriba' },
      13: { type: 'dpad',   cx: 390, cy: 570, w: 34, h: 42, dir: 'down',  name: 'D-Pad: Abajo' },
      14: { type: 'dpad',   cx: 348, cy: 528, w: 42, h: 34, dir: 'left',  name: 'D-Pad: Izquierda' },
      15: { type: 'dpad',   cx: 432, cy: 528, w: 42, h: 34, dir: 'right', name: 'D-Pad: Derecha' },
      16: { type: 'circle', cx: 500, cy: 306, r: 34, color: '#ffffff', name: 'Xbox Guía (Home)' },
    }
  },

  // ── Generic ────────────────────────────────────────────────
  'generic': {
    buttons: {
      0:  { type: 'circle', cx: 785, cy: 460, r: 34, color: '#2979ff', name: 'A / Cross' },
      1:  { type: 'circle', cx: 848, cy: 400, r: 34, color: '#ff1744', name: 'B / Circle' },
      2:  { type: 'circle', cx: 722, cy: 400, r: 34, color: '#ff4081', name: 'X / Square' },
      3:  { type: 'circle', cx: 785, cy: 338, r: 34, color: '#00e676', name: 'Y / Triangle' },
      4:  { type: 'rect',   x: 205, y: 230, w: 85, h: 40, rx: 12, color: '#2979ff', name: 'LB / L1' },
      5:  { type: 'rect',   x: 710, y: 230, w: 85, h: 40, rx: 12, color: '#2979ff', name: 'RB / R1' },
      6:  { type: 'trigger',x: 220, y: 175, w: 75, h: 52, rx: 14, color: '#ff9100', name: 'LT / L2' },
      7:  { type: 'trigger',x: 705, y: 175, w: 75, h: 52, rx: 14, color: '#ff9100', name: 'RT / R2' },
      8:  { type: 'pill',   cx: 315, cy: 312, rx: 12, ry: 24, color: '#ffffff', name: 'Select' },
      9:  { type: 'pill',   cx: 680, cy: 312, rx: 12, ry: 24, color: '#ffffff', name: 'Start' },
      10: { type: 'stick',  cx: 356, cy: 538, r: 54, color: '#2979ff', name: 'L3 (Stick Izq)' },
      11: { type: 'stick',  cx: 644, cy: 538, r: 54, color: '#2979ff', name: 'R3 (Stick Der)' },
      12: { type: 'dpad',   cx: 212, cy: 348, w: 36, h: 46, dir: 'up',    name: 'D-Pad: Arriba' },
      13: { type: 'dpad',   cx: 212, cy: 446, w: 36, h: 46, dir: 'down',  name: 'D-Pad: Abajo' },
      14: { type: 'dpad',   cx: 162, cy: 397, w: 46, h: 36, dir: 'left',  name: 'D-Pad: Izquierda' },
      15: { type: 'dpad',   cx: 262, cy: 397, w: 46, h: 36, dir: 'right', name: 'D-Pad: Derecha' },
      16: { type: 'circle', cx: 500, cy: 532, r: 22, color: '#ffffff', name: 'Home' },
    }
  }
};
