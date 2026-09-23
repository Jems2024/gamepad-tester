/* ============================================================
   GAMEPAD TESTER — controllers-overlay.js
   Interactive Hotspot & Glow Overlay for Official Photos
   ============================================================ */

const OFFICIAL_OVERLAYS = {

  // ── PS5 (DualSense) ────────────────────────────────────────
  'ps5': {
    buttons: {
      0:  { type: 'circle', cx: 783, cy: 471, r: 32, color: '#2979ff', name: 'Cross (Cruz)' },
      1:  { type: 'circle', cx: 845, cy: 406, r: 32, color: '#ff1744', name: 'Circle (Círculo)' },
      2:  { type: 'circle', cx: 720, cy: 406, r: 32, color: '#ff4081', name: 'Square (Cuadrado)' },
      3:  { type: 'circle', cx: 782, cy: 344, r: 32, color: '#00e676', name: 'Triangle (Triángulo)' },
      4:  { type: 'rect',   x: 205, y: 248, w: 85, h: 36, rx: 12, color: '#2979ff', name: 'L1: Bumper Izquierdo' },
      5:  { type: 'rect',   x: 720, y: 248, w: 85, h: 36, rx: 12, color: '#2979ff', name: 'R1: Bumper Derecho' },
      6:  { type: 'trigger',x: 212, y: 210, w: 78, h: 36, rx: 12, color: '#ff9100', name: 'L2: Gatillo Izquierdo' },
      7:  { type: 'trigger',x: 720, y: 210, w: 78, h: 36, rx: 12, color: '#ff9100', name: 'R2: Gatillo Derecho' },
      8:  { type: 'pill',   cx: 336, cy: 315, rx: 10, ry: 20, color: '#ffffff', name: 'Create Button' },
      9:  { type: 'pill',   cx: 689, cy: 315, rx: 10, ry: 20, color: '#ffffff', name: 'Options Button' },
      10: { type: 'stick',  cx: 371, cy: 577, r: 56, color: '#2979ff', name: 'L3: Stick Izquierdo' },
      11: { type: 'stick',  cx: 651, cy: 578, r: 56, color: '#2979ff', name: 'R3: Stick Derecho' },
      12: { type: 'dpad',   cx: 239, cy: 338, w: 36, h: 46, dir: 'up',    name: 'D-Pad: Arriba' },
      13: { type: 'dpad',   cx: 239, cy: 438, w: 36, h: 46, dir: 'down',  name: 'D-Pad: Abajo' },
      14: { type: 'dpad',   cx: 189, cy: 388, w: 46, h: 36, dir: 'left',  name: 'D-Pad: Izquierda' },
      15: { type: 'dpad',   cx: 289, cy: 388, w: 46, h: 36, dir: 'right', name: 'D-Pad: Derecha' },
      16: { type: 'circle', cx: 511, cy: 555, r: 20, color: '#ffffff', name: 'Botón PS (Home)' },
      17: { type: 'rect',   x: 350, y: 265, w: 310, h: 165, rx: 16, color: '#00e5ff', name: 'Touchpad (Click)' },
    },
    lightbar: { x: 355, y: 260, w: 300, h: 10, rx: 5, color: '#0066ff' }
  },

  // ── PS4 (DualShock 4) ──────────────────────────────────────
  'ps4': {
    buttons: {
      0:  { type: 'circle', cx: 807, cy: 481, r: 34, color: '#2979ff', name: 'Cross (Cruz)' },
      1:  { type: 'circle', cx: 877, cy: 410, r: 34, color: '#ff1744', name: 'Circle (Círculo)' },
      2:  { type: 'circle', cx: 738, cy: 410, r: 34, color: '#ff4081', name: 'Square (Cuadrado)' },
      3:  { type: 'circle', cx: 807, cy: 339, r: 34, color: '#00e676', name: 'Triangle (Triángulo)' },
      4:  { type: 'rect',   x: 200, y: 248, w: 85, h: 36, rx: 12, color: '#2979ff', name: 'L1: Bumper Izquierdo' },
      5:  { type: 'rect',   x: 725, y: 248, w: 85, h: 36, rx: 12, color: '#2979ff', name: 'R1: Bumper Derecho' },
      6:  { type: 'trigger',x: 205, y: 210, w: 78, h: 36, rx: 12, color: '#ff9100', name: 'L2: Gatillo Izquierdo' },
      7:  { type: 'trigger',x: 730, y: 210, w: 78, h: 36, rx: 12, color: '#ff9100', name: 'R2: Gatillo Derecho' },
      8:  { type: 'pill',   cx: 343, cy: 314, rx: 12, ry: 22, color: '#ffffff', name: 'Share' },
      9:  { type: 'pill',   cx: 686, cy: 314, rx: 12, ry: 22, color: '#ffffff', name: 'Options' },
      10: { type: 'stick',  cx: 360, cy: 589, r: 56, color: '#2979ff', name: 'L3: Stick Izquierdo' },
      11: { type: 'stick',  cx: 641, cy: 583, r: 56, color: '#2979ff', name: 'R3: Stick Derecho' },
      12: { type: 'dpad',   cx: 218, cy: 362, w: 36, h: 46, dir: 'up',    name: 'D-Pad: Arriba' },
      13: { type: 'dpad',   cx: 218, cy: 468, w: 36, h: 46, dir: 'down',  name: 'D-Pad: Abajo' },
      14: { type: 'dpad',   cx: 165, cy: 415, w: 46, h: 36, dir: 'left',  name: 'D-Pad: Izquierda' },
      15: { type: 'dpad',   cx: 271, cy: 415, w: 46, h: 36, dir: 'right', name: 'D-Pad: Derecha' },
      16: { type: 'circle', cx: 512, cy: 542, r: 22, color: '#ffffff', name: 'Botón PS (Home)' },
      17: { type: 'rect',   x: 350, y: 275, w: 310, h: 155, rx: 14, color: '#00e5ff', name: 'Touchpad (Click)' },
    },
    lightbar: { x: 360, y: 272, w: 290, h: 12, rx: 6, color: '#0066ff' }
  },

  // ── PS3 (DualShock 3) ──────────────────────────────────────
  'ps3': {
    buttons: {
      0:  { type: 'circle', cx: 772, cy: 521, r: 35, color: '#2979ff', name: 'Cross (Cruz)' },
      1:  { type: 'circle', cx: 844, cy: 452, r: 35, color: '#ff1744', name: 'Circle (Círculo)' },
      2:  { type: 'circle', cx: 700, cy: 451, r: 35, color: '#ff4081', name: 'Square (Cuadrado)' },
      3:  { type: 'circle', cx: 772, cy: 383, r: 35, color: '#00e676', name: 'Triangle (Triángulo)' },
      4:  { type: 'rect',   x: 215, y: 262, w: 80, h: 34, rx: 12, color: '#2979ff', name: 'L1' },
      5:  { type: 'rect',   x: 730, y: 262, w: 80, h: 34, rx: 12, color: '#2979ff', name: 'R1' },
      6:  { type: 'trigger',x: 218, y: 232, w: 75, h: 28, rx: 10, color: '#ff9100', name: 'L2' },
      7:  { type: 'trigger',x: 733, y: 232, w: 75, h: 28, rx: 10, color: '#ff9100', name: 'R2' },
      8:  { type: 'rect',   x: 410, y: 440, w: 44, h: 28, rx: 6,  color: '#ffffff', name: 'Select' },
      9:  { type: 'rect',   x: 570, y: 440, w: 44, h: 28, rx: 6,  color: '#ffffff', name: 'Start' },
      10: { type: 'stick',  cx: 377, cy: 600, r: 58, color: '#2979ff', name: 'L3: Stick Izquierdo' },
      11: { type: 'stick',  cx: 643, cy: 601, r: 58, color: '#2979ff', name: 'R3: Stick Derecho' },
      12: { type: 'dpad',   cx: 255, cy: 396, w: 48, h: 54, dir: 'up',    name: 'D-Pad: Arriba' },
      13: { type: 'dpad',   cx: 255, cy: 504, w: 48, h: 54, dir: 'down',  name: 'D-Pad: Abajo' },
      14: { type: 'dpad',   cx: 201, cy: 450, w: 54, h: 48, dir: 'left',  name: 'D-Pad: Izquierda' },
      15: { type: 'dpad',   cx: 309, cy: 450, w: 54, h: 48, dir: 'right', name: 'D-Pad: Derecha' },
      16: { type: 'circle', cx: 512, cy: 498, r: 24, color: '#ffffff', name: 'Botón PS (Home)' },
    }
  },

  // ── PS2 (DualShock 2) ──────────────────────────────────────
  'ps2': {
    buttons: {
      0:  { type: 'circle', cx: 769, cy: 508, r: 35, color: '#2979ff', name: 'Cross (Cruz)' },
      1:  { type: 'circle', cx: 841, cy: 439, r: 35, color: '#ff1744', name: 'Circle (Círculo)' },
      2:  { type: 'circle', cx: 696, cy: 439, r: 35, color: '#ff4081', name: 'Square (Cuadrado)' },
      3:  { type: 'circle', cx: 769, cy: 370, r: 35, color: '#00e676', name: 'Triangle (Triángulo)' },
      4:  { type: 'rect',   x: 215, y: 252, w: 78, h: 34, rx: 12, color: '#2979ff', name: 'L1' },
      5:  { type: 'rect',   x: 733, y: 252, w: 78, h: 34, rx: 12, color: '#2979ff', name: 'R1' },
      6:  { type: 'trigger',x: 218, y: 222, w: 75, h: 28, rx: 10, color: '#ff9100', name: 'L2' },
      7:  { type: 'trigger',x: 733, y: 222, w: 75, h: 28, rx: 10, color: '#ff9100', name: 'R2' },
      8:  { type: 'rect',   x: 412, y: 424, w: 46, h: 26, rx: 6,  color: '#ffffff', name: 'Select' },
      9:  { type: 'rect',   x: 566, y: 424, w: 46, h: 26, rx: 6,  color: '#ffffff', name: 'Start' },
      10: { type: 'stick',  cx: 378, cy: 584, r: 58, color: '#2979ff', name: 'L3: Stick Izquierdo' },
      11: { type: 'stick',  cx: 640, cy: 583, r: 58, color: '#2979ff', name: 'R3: Stick Derecho' },
      12: { type: 'dpad',   cx: 261, cy: 394, w: 48, h: 54, dir: 'up',    name: 'D-Pad: Arriba' },
      13: { type: 'dpad',   cx: 261, cy: 502, w: 48, h: 54, dir: 'down',  name: 'D-Pad: Abajo' },
      14: { type: 'dpad',   cx: 207, cy: 448, w: 54, h: 48, dir: 'left',  name: 'D-Pad: Izquierda' },
      15: { type: 'dpad',   cx: 315, cy: 448, w: 54, h: 48, dir: 'right', name: 'D-Pad: Derecha' },
      16: { type: 'rect',   x: 490, y: 512, w: 44, h: 24, rx: 6,  color: '#ff1744', name: 'Botón ANALOG' },
    }
  },

  // ── Xbox Series S / Series X ───────────────────────────────
  'xbox-series-s': {
    buttons: {
      0:  { type: 'circle', cx: 764, cy: 476, r: 34, color: '#00e676', name: 'A Button (Verde)' },
      1:  { type: 'circle', cx: 833, cy: 409, r: 34, color: '#ff1744', name: 'B Button (Rojo)' },
      2:  { type: 'circle', cx: 697, cy: 414, r: 34, color: '#00b0ff', name: 'X Button (Azul)' },
      3:  { type: 'circle', cx: 766, cy: 350, r: 34, color: '#ffd600', name: 'Y Button (Amarillo)' },
      4:  { type: 'rect',   x: 195, y: 210, w: 95, h: 42, rx: 12, color: '#00e676', name: 'LB: Left Bumper' },
      5:  { type: 'rect',   x: 720, y: 210, w: 95, h: 42, rx: 12, color: '#00e676', name: 'RB: Right Bumper' },
      6:  { type: 'trigger',x: 205, y: 160, w: 85, h: 48, rx: 14, color: '#ff9100', name: 'LT: Left Trigger' },
      7:  { type: 'trigger',x: 720, y: 160, w: 85, h: 48, rx: 14, color: '#ff9100', name: 'RT: Right Trigger' },
      8:  { type: 'circle', cx: 440, cy: 412, r: 18, color: '#ffffff', name: 'View / Back' },
      9:  { type: 'circle', cx: 580, cy: 412, r: 18, color: '#ffffff', name: 'Menu / Start' },
      10: { type: 'stick',  cx: 253, cy: 427, r: 56, color: '#00e676', name: 'L3: Stick Izquierdo (Alto)' },
      11: { type: 'stick',  cx: 637, cy: 571, r: 56, color: '#00e676', name: 'R3: Stick Derecho (Bajo)' },
      12: { type: 'dpad',   cx: 380, cy: 514, w: 36, h: 44, dir: 'up',    name: 'D-Pad: Arriba' },
      13: { type: 'dpad',   cx: 380, cy: 606, w: 36, h: 44, dir: 'down',  name: 'D-Pad: Abajo' },
      14: { type: 'dpad',   cx: 334, cy: 560, w: 44, h: 36, dir: 'left',  name: 'D-Pad: Izquierda' },
      15: { type: 'dpad',   cx: 426, cy: 560, w: 44, h: 36, dir: 'right', name: 'D-Pad: Derecha' },
      16: { type: 'circle', cx: 511, cy: 311, r: 36, color: '#ffffff', name: 'Xbox Guía (Home)' },
      17: { type: 'pill',   cx: 511, cy: 468, rx: 12, ry: 16, color: '#ffffff', name: 'Share Button' },
    }
  },

  // ── Xbox One ───────────────────────────────────────────────
  'xbox-one': {
    buttons: {
      0:  { type: 'circle', cx: 732, cy: 461, r: 34, color: '#00e676', name: 'A Button (Verde)' },
      1:  { type: 'circle', cx: 792, cy: 404, r: 34, color: '#ff1744', name: 'B Button (Rojo)' },
      2:  { type: 'circle', cx: 673, cy: 403, r: 34, color: '#00b0ff', name: 'X Button (Azul)' },
      3:  { type: 'circle', cx: 732, cy: 350, r: 34, color: '#ffd600', name: 'Y Button (Amarillo)' },
      4:  { type: 'rect',   x: 210, y: 245, w: 94, h: 38, rx: 12, color: '#00e676', name: 'LB: Left Bumper' },
      5:  { type: 'rect',   x: 700, y: 245, w: 94, h: 38, rx: 12, color: '#00e676', name: 'RB: Right Bumper' },
      6:  { type: 'trigger',x: 220, y: 210, w: 80, h: 32, rx: 10, color: '#ff9100', name: 'LT: Left Trigger' },
      7:  { type: 'trigger',x: 705, y: 210, w: 80, h: 32, rx: 10, color: '#ff9100', name: 'RT: Right Trigger' },
      8:  { type: 'circle', cx: 450, cy: 389, r: 18, color: '#ffffff', name: 'View / Back' },
      9:  { type: 'circle', cx: 581, cy: 388, r: 18, color: '#ffffff', name: 'Menu / Start' },
      10: { type: 'stick',  cx: 295, cy: 424, r: 56, color: '#00e676', name: 'L3: Stick Izquierdo (Alto)' },
      11: { type: 'stick',  cx: 616, cy: 557, r: 56, color: '#00e676', name: 'R3: Stick Derecho (Bajo)' },
      12: { type: 'dpad',   cx: 408, cy: 512, w: 36, h: 44, dir: 'up',    name: 'D-Pad: Arriba' },
      13: { type: 'dpad',   cx: 408, cy: 608, w: 36, h: 44, dir: 'down',  name: 'D-Pad: Abajo' },
      14: { type: 'dpad',   cx: 360, cy: 560, w: 44, h: 36, dir: 'left',  name: 'D-Pad: Izquierda' },
      15: { type: 'dpad',   cx: 456, cy: 560, w: 44, h: 36, dir: 'right', name: 'D-Pad: Derecha' },
      16: { type: 'circle', cx: 511, cy: 295, r: 34, color: '#ffffff', name: 'Xbox Guía (Home)' },
    }
  },

  // ── Generic ────────────────────────────────────────────────
  'generic': {
    buttons: {
      0:  { type: 'circle', cx: 807, cy: 481, r: 34, color: '#2979ff', name: 'A / Cross' },
      1:  { type: 'circle', cx: 877, cy: 410, r: 34, color: '#ff1744', name: 'B / Circle' },
      2:  { type: 'circle', cx: 738, cy: 410, r: 34, color: '#ff4081', name: 'X / Square' },
      3:  { type: 'circle', cx: 807, cy: 339, r: 34, color: '#00e676', name: 'Y / Triangle' },
      4:  { type: 'rect',   x: 200, y: 248, w: 85, h: 36, rx: 12, color: '#2979ff', name: 'LB / L1' },
      5:  { type: 'rect',   x: 725, y: 248, w: 85, h: 36, rx: 12, color: '#2979ff', name: 'RB / R1' },
      6:  { type: 'trigger',x: 205, y: 210, w: 78, h: 36, rx: 12, color: '#ff9100', name: 'LT / L2' },
      7:  { type: 'trigger',x: 730, y: 210, w: 78, h: 36, rx: 12, color: '#ff9100', name: 'RT / R2' },
      8:  { type: 'pill',   cx: 343, cy: 314, rx: 12, ry: 22, color: '#ffffff', name: 'Select' },
      9:  { type: 'pill',   cx: 686, cy: 314, rx: 12, ry: 22, color: '#ffffff', name: 'Start' },
      10: { type: 'stick',  cx: 360, cy: 589, r: 56, color: '#2979ff', name: 'L3 (Stick Izq)' },
      11: { type: 'stick',  cx: 641, cy: 583, r: 56, color: '#2979ff', name: 'R3 (Stick Der)' },
      12: { type: 'dpad',   cx: 218, cy: 362, w: 36, h: 46, dir: 'up',    name: 'D-Pad: Arriba' },
      13: { type: 'dpad',   cx: 218, cy: 468, w: 36, h: 46, dir: 'down',  name: 'D-Pad: Abajo' },
      14: { type: 'dpad',   cx: 165, cy: 415, w: 46, h: 36, dir: 'left',  name: 'D-Pad: Izquierda' },
      15: { type: 'dpad',   cx: 271, cy: 415, w: 46, h: 36, dir: 'right', name: 'D-Pad: Derecha' },
      16: { type: 'circle', cx: 512, cy: 542, r: 22, color: '#ffffff', name: 'Home' },
    }
  }
};
