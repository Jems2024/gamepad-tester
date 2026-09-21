/* ============================================================
   GAMEPAD TESTER — controllers-overlay.js
   Interactive Hotspot & Glow Overlay for Official Photos
   ============================================================ */

const OFFICIAL_OVERLAYS = {

  // ── PS5 (DualSense) ────────────────────────────────────────
  'ps5': {
    buttons: {
      0:  { type: 'circle', cx: 785, cy: 470, r: 34, color: '#2979ff', name: 'Cross (Cruz)' },
      1:  { type: 'circle', cx: 868, cy: 395, r: 34, color: '#ff1744', name: 'Circle (Círculo)' },
      2:  { type: 'circle', cx: 732, cy: 410, r: 34, color: '#ff4081', name: 'Square (Cuadrado)' },
      3:  { type: 'circle', cx: 785, cy: 345, r: 34, color: '#00e676', name: 'Triangle (Triángulo)' },
      4:  { type: 'rect',   x: 215, y: 220, w: 90, h: 44, rx: 14, color: '#2979ff', name: 'L1: Bumper Izquierdo' },
      5:  { type: 'rect',   x: 719, y: 220, w: 90, h: 44, rx: 14, color: '#2979ff', name: 'R1: Bumper Derecho' },
      6:  { type: 'trigger',x: 230, y: 155, w: 80, h: 62, rx: 16, color: '#ff9100', name: 'L2: Gatillo Izquierdo' },
      7:  { type: 'trigger',x: 714, y: 155, w: 80, h: 62, rx: 16, color: '#ff9100', name: 'R2: Gatillo Derecho' },
      8:  { type: 'pill',   cx: 330, cy: 320, rx: 12, ry: 24, color: '#ffffff', name: 'Create Button' },
      9:  { type: 'pill',   cx: 694, cy: 320, rx: 12, ry: 24, color: '#ffffff', name: 'Options Button' },
      10: { type: 'stick',  cx: 374, cy: 525, r: 52, color: '#2979ff', name: 'L3: Stick Izquierdo' },
      11: { type: 'stick',  cx: 650, cy: 525, r: 52, color: '#2979ff', name: 'R3: Stick Derecho' },
      12: { type: 'dpad',   cx: 236, cy: 340, w: 32, h: 38, dir: 'up',    name: 'D-Pad: Arriba' },
      13: { type: 'dpad',   cx: 236, cy: 432, w: 32, h: 38, dir: 'down',  name: 'D-Pad: Abajo' },
      14: { type: 'dpad',   cx: 190, cy: 386, w: 38, h: 32, dir: 'left',  name: 'D-Pad: Izquierda' },
      15: { type: 'dpad',   cx: 282, cy: 386, w: 38, h: 32, dir: 'right', name: 'D-Pad: Derecha' },
      16: { type: 'circle', cx: 512, cy: 520, r: 20, color: '#ffffff', name: 'Botón PS (Home)' },
      17: { type: 'rect',   x: 360, y: 260, w: 304, h: 160, rx: 16, color: '#00e5ff', name: 'Touchpad (Click)' },
    },
    lightbar: { x: 355, y: 255, w: 314, h: 14, rx: 7, color: '#0066ff' }
  },

  // ── PS4 (DualShock 4) ──────────────────────────────────────
  'ps4': {
    buttons: {
      0:  { type: 'circle', cx: 803, cy: 463, r: 34, color: '#2979ff', name: 'Cross (Cruz)' },
      1:  { type: 'circle', cx: 864, cy: 407, r: 34, color: '#ff1744', name: 'Circle (Círculo)' },
      2:  { type: 'circle', cx: 738, cy: 411, r: 34, color: '#ff4081', name: 'Square (Cuadrado)' },
      3:  { type: 'circle', cx: 807, cy: 341, r: 34, color: '#00e676', name: 'Triangle (Triángulo)' },
      4:  { type: 'rect',   x: 210, y: 235, w: 90, h: 44, rx: 14, color: '#2979ff', name: 'L1: Bumper Izquierdo' },
      5:  { type: 'rect',   x: 724, y: 235, w: 90, h: 44, rx: 14, color: '#2979ff', name: 'R1: Bumper Derecho' },
      6:  { type: 'trigger',x: 225, y: 165, w: 80, h: 65, rx: 16, color: '#ff9100', name: 'L2: Gatillo Izquierdo' },
      7:  { type: 'trigger',x: 719, y: 165, w: 80, h: 65, rx: 16, color: '#ff9100', name: 'R2: Gatillo Derecho' },
      8:  { type: 'pill',   cx: 335, cy: 325, rx: 12, ry: 24, color: '#ffffff', name: 'Share' },
      9:  { type: 'pill',   cx: 689, cy: 325, rx: 12, ry: 24, color: '#ffffff', name: 'Options' },
      10: { type: 'stick',  cx: 363, cy: 542, r: 52, color: '#2979ff', name: 'L3: Stick Izquierdo' },
      11: { type: 'stick',  cx: 665, cy: 542, r: 52, color: '#2979ff', name: 'R3: Stick Derecho' },
      12: { type: 'dpad',   cx: 236, cy: 345, w: 32, h: 38, dir: 'up',    name: 'D-Pad: Arriba' },
      13: { type: 'dpad',   cx: 236, cy: 438, w: 32, h: 38, dir: 'down',  name: 'D-Pad: Abajo' },
      14: { type: 'dpad',   cx: 189, cy: 392, w: 38, h: 32, dir: 'left',  name: 'D-Pad: Izquierda' },
      15: { type: 'dpad',   cx: 283, cy: 392, w: 38, h: 32, dir: 'right', name: 'D-Pad: Derecha' },
      16: { type: 'circle', cx: 512, cy: 540, r: 22, color: '#ffffff', name: 'Botón PS (Home)' },
      17: { type: 'rect',   x: 370, y: 275, w: 284, h: 160, rx: 16, color: '#00e5ff', name: 'Touchpad (Click)' },
    },
    lightbar: { x: 375, y: 255, w: 274, h: 18, rx: 6, color: '#0066ff' }
  },

  // ── PS3 (DualShock 3) ──────────────────────────────────────
  'ps3': {
    buttons: {
      0:  { type: 'circle', cx: 800, cy: 470, r: 34, color: '#2979ff', name: 'Cross (Cruz)' },
      1:  { type: 'circle', cx: 875, cy: 412, r: 34, color: '#ff1744', name: 'Circle (Círculo)' },
      2:  { type: 'circle', cx: 755, cy: 382, r: 34, color: '#ff4081', name: 'Square (Cuadrado)' },
      3:  { type: 'circle', cx: 788, cy: 363, r: 34, color: '#00e676', name: 'Triangle (Triángulo)' },
      4:  { type: 'rect',   x: 215, y: 225, w: 85, h: 40, rx: 12, color: '#2979ff', name: 'L1' },
      5:  { type: 'rect',   x: 724, y: 225, w: 85, h: 40, rx: 12, color: '#2979ff', name: 'R1' },
      6:  { type: 'trigger',x: 230, y: 165, w: 75, h: 58, rx: 14, color: '#ff9100', name: 'L2' },
      7:  { type: 'trigger',x: 719, y: 165, w: 75, h: 58, rx: 14, color: '#ff9100', name: 'R2' },
      8:  { type: 'rect',   x: 415, y: 385, w: 38, h: 22, rx: 6,  color: '#ffffff', name: 'Select' },
      9:  { type: 'rect',   x: 575, y: 385, w: 38, h: 22, rx: 6,  color: '#ffffff', name: 'Start' },
      10: { type: 'stick',  cx: 365, cy: 545, r: 50, color: '#2979ff', name: 'L3: Stick Izquierdo' },
      11: { type: 'stick',  cx: 648, cy: 545, r: 50, color: '#2979ff', name: 'R3: Stick Derecho' },
      12: { type: 'dpad',   cx: 246, cy: 335, w: 34, h: 40, dir: 'up',    name: 'D-Pad: Arriba' },
      13: { type: 'dpad',   cx: 246, cy: 445, w: 34, h: 40, dir: 'down',  name: 'D-Pad: Abajo' },
      14: { type: 'dpad',   cx: 200, cy: 395, w: 40, h: 34, dir: 'left',  name: 'D-Pad: Izquierda' },
      15: { type: 'dpad',   cx: 287, cy: 395, w: 40, h: 34, dir: 'right', name: 'D-Pad: Derecha' },
      16: { type: 'circle', cx: 512, cy: 448, r: 20, color: '#ffffff', name: 'Botón PS (Home)' },
    }
  },

  // ── PS2 (DualShock 2) ──────────────────────────────────────
  'ps2': {
    buttons: {
      0:  { type: 'circle', cx: 800, cy: 470, r: 34, color: '#2979ff', name: 'Cross (Cruz)' },
      1:  { type: 'circle', cx: 875, cy: 412, r: 34, color: '#ff1744', name: 'Circle (Círculo)' },
      2:  { type: 'circle', cx: 755, cy: 382, r: 34, color: '#ff4081', name: 'Square (Cuadrado)' },
      3:  { type: 'circle', cx: 788, cy: 363, r: 34, color: '#00e676', name: 'Triangle (Triángulo)' },
      4:  { type: 'rect',   x: 215, y: 225, w: 85, h: 40, rx: 12, color: '#2979ff', name: 'L1' },
      5:  { type: 'rect',   x: 724, y: 225, w: 85, h: 40, rx: 12, color: '#2979ff', name: 'R1' },
      6:  { type: 'trigger',x: 230, y: 165, w: 75, h: 58, rx: 14, color: '#ff9100', name: 'L2' },
      7:  { type: 'trigger',x: 719, y: 165, w: 75, h: 58, rx: 14, color: '#ff9100', name: 'R2' },
      8:  { type: 'rect',   x: 415, y: 385, w: 38, h: 22, rx: 6,  color: '#ffffff', name: 'Select' },
      9:  { type: 'rect',   x: 575, y: 385, w: 38, h: 22, rx: 6,  color: '#ffffff', name: 'Start' },
      10: { type: 'stick',  cx: 365, cy: 545, r: 50, color: '#2979ff', name: 'L3: Stick Izquierdo' },
      11: { type: 'stick',  cx: 648, cy: 545, r: 50, color: '#2979ff', name: 'R3: Stick Derecho' },
      12: { type: 'dpad',   cx: 246, cy: 335, w: 34, h: 40, dir: 'up',    name: 'D-Pad: Arriba' },
      13: { type: 'dpad',   cx: 246, cy: 445, w: 34, h: 40, dir: 'down',  name: 'D-Pad: Abajo' },
      14: { type: 'dpad',   cx: 200, cy: 395, w: 40, h: 34, dir: 'left',  name: 'D-Pad: Izquierda' },
      15: { type: 'dpad',   cx: 287, cy: 395, w: 40, h: 34, dir: 'right', name: 'D-Pad: Derecha' },
      16: { type: 'circle', cx: 512, cy: 448, r: 18, color: '#ff1744', name: 'Botón ANALOG' },
    }
  },

  // ── Xbox Series S / Series X ───────────────────────────────
  'xbox-series-s': {
    buttons: {
      0:  { type: 'circle', cx: 761, cy: 490, r: 34, color: '#00e676', name: 'A Button (Verde)' },
      1:  { type: 'circle', cx: 844, cy: 416, r: 34, color: '#ff1744', name: 'B Button (Rojo)' },
      2:  { type: 'circle', cx: 710, cy: 412, r: 34, color: '#00b0ff', name: 'X Button (Azul)' },
      3:  { type: 'circle', cx: 751, cy: 335, r: 34, color: '#ffd600', name: 'Y Button (Amarillo)' },
      4:  { type: 'rect',   x: 195, y: 195, w: 105, h: 48, rx: 14, color: '#00e676', name: 'LB: Left Bumper' },
      5:  { type: 'rect',   x: 724, y: 195, w: 105, h: 48, rx: 14, color: '#00e676', name: 'RB: Right Bumper' },
      6:  { type: 'trigger',x: 205, y: 130, w: 85,  h: 62, rx: 16, color: '#ff9100', name: 'LT: Left Trigger' },
      7:  { type: 'trigger',x: 734, y: 130, w: 85,  h: 62, rx: 16, color: '#ff9100', name: 'RT: Right Trigger' },
      8:  { type: 'circle', cx: 430, cy: 400, r: 18, color: '#ffffff', name: 'View / Back' },
      9:  { type: 'circle', cx: 594, cy: 400, r: 18, color: '#ffffff', name: 'Menu / Start' },
      10: { type: 'stick',  cx: 275, cy: 375, r: 52, color: '#00e676', name: 'L3: Stick Izquierdo (Alto)' },
      11: { type: 'stick',  cx: 638, cy: 525, r: 52, color: '#00e676', name: 'R3: Stick Derecho (Bajo)' },
      12: { type: 'dpad',   cx: 388, cy: 462, w: 32, h: 36, dir: 'up',    name: 'D-Pad: Arriba' },
      13: { type: 'dpad',   cx: 388, cy: 548, w: 32, h: 36, dir: 'down',  name: 'D-Pad: Abajo' },
      14: { type: 'dpad',   cx: 345, cy: 505, w: 36, h: 32, dir: 'left',  name: 'D-Pad: Izquierda' },
      15: { type: 'dpad',   cx: 431, cy: 505, w: 36, h: 32, dir: 'right', name: 'D-Pad: Derecha' },
      16: { type: 'circle', cx: 512, cy: 285, r: 30, color: '#ffffff', name: 'Xbox Guía (Home)' },
      17: { type: 'pill',   cx: 512, cy: 450, rx: 12, ry: 16, color: '#ffffff', name: 'Share Button' },
    }
  },

  // ── Xbox One ───────────────────────────────────────────────
  'xbox-one': {
    buttons: {
      0:  { type: 'circle', cx: 743, cy: 460, r: 34, color: '#00e676', name: 'A Button (Verde)' },
      1:  { type: 'circle', cx: 838, cy: 400, r: 34, color: '#ff1744', name: 'B Button (Rojo)' },
      2:  { type: 'circle', cx: 680, cy: 408, r: 34, color: '#00b0ff', name: 'X Button (Azul)' },
      3:  { type: 'circle', cx: 749, cy: 349, r: 34, color: '#ffd600', name: 'Y Button (Amarillo)' },
      4:  { type: 'rect',   x: 195, y: 205, w: 105, h: 48, rx: 14, color: '#00e676', name: 'LB: Left Bumper' },
      5:  { type: 'rect',   x: 724, y: 205, w: 105, h: 48, rx: 14, color: '#00e676', name: 'RB: Right Bumper' },
      6:  { type: 'trigger',x: 205, y: 140, w: 85,  h: 62, rx: 16, color: '#ff9100', name: 'LT: Left Trigger' },
      7:  { type: 'trigger',x: 734, y: 140, w: 85,  h: 62, rx: 16, color: '#ff9100', name: 'RT: Right Trigger' },
      8:  { type: 'circle', cx: 430, cy: 400, r: 18, color: '#ffffff', name: 'View / Back' },
      9:  { type: 'circle', cx: 594, cy: 400, r: 18, color: '#ffffff', name: 'Menu / Start' },
      10: { type: 'stick',  cx: 296, cy: 392, r: 52, color: '#00e676', name: 'L3: Stick Izquierdo (Alto)' },
      11: { type: 'stick',  cx: 632, cy: 529, r: 52, color: '#00e676', name: 'R3: Stick Derecho (Bajo)' },
      12: { type: 'dpad',   cx: 397, cy: 474, w: 32, h: 36, dir: 'up',    name: 'D-Pad: Arriba' },
      13: { type: 'dpad',   cx: 397, cy: 560, w: 32, h: 36, dir: 'down',  name: 'D-Pad: Abajo' },
      14: { type: 'dpad',   cx: 354, cy: 517, w: 36, h: 32, dir: 'left',  name: 'D-Pad: Izquierda' },
      15: { type: 'dpad',   cx: 440, cy: 517, w: 36, h: 32, dir: 'right', name: 'D-Pad: Derecha' },
      16: { type: 'circle', cx: 512, cy: 295, r: 30, color: '#ffffff', name: 'Xbox Guía (Home)' },
    }
  },

  // ── Generic ────────────────────────────────────────────────
  'generic': {
    buttons: {
      0:  { type: 'circle', cx: 803, cy: 463, r: 34, color: '#2979ff', name: 'A / Cross' },
      1:  { type: 'circle', cx: 864, cy: 407, r: 34, color: '#ff1744', name: 'B / Circle' },
      2:  { type: 'circle', cx: 738, cy: 411, r: 34, color: '#ff4081', name: 'X / Square' },
      3:  { type: 'circle', cx: 807, cy: 341, r: 34, color: '#00e676', name: 'Y / Triangle' },
      4:  { type: 'rect',   x: 210, y: 235, w: 90, h: 44, rx: 14, color: '#2979ff', name: 'LB / L1' },
      5:  { type: 'rect',   x: 724, y: 235, w: 90, h: 44, rx: 14, color: '#2979ff', name: 'RB / R1' },
      6:  { type: 'trigger',x: 225, y: 165, w: 80, h: 65, rx: 16, color: '#ff9100', name: 'LT / L2' },
      7:  { type: 'trigger',x: 719, y: 165, w: 80, h: 65, rx: 16, color: '#ff9100', name: 'RT / R2' },
      8:  { type: 'pill',   cx: 335, cy: 325, rx: 12, ry: 24, color: '#ffffff', name: 'Select' },
      9:  { type: 'pill',   cx: 689, cy: 325, rx: 12, ry: 24, color: '#ffffff', name: 'Start' },
      10: { type: 'stick',  cx: 363, cy: 542, r: 52, color: '#2979ff', name: 'L3 (Stick Izq)' },
      11: { type: 'stick',  cx: 665, cy: 542, r: 52, color: '#2979ff', name: 'R3 (Stick Der)' },
      12: { type: 'dpad',   cx: 236, cy: 345, w: 32, h: 38, dir: 'up',    name: 'D-Pad: Arriba' },
      13: { type: 'dpad',   cx: 236, cy: 438, w: 32, h: 38, dir: 'down',  name: 'D-Pad: Abajo' },
      14: { type: 'dpad',   cx: 189, cy: 392, w: 38, h: 32, dir: 'left',  name: 'D-Pad: Izquierda' },
      15: { type: 'dpad',   cx: 283, cy: 392, w: 38, h: 32, dir: 'right', name: 'D-Pad: Derecha' },
      16: { type: 'circle', cx: 512, cy: 540, r: 22, color: '#ffffff', name: 'Home' },
    }
  }
};
