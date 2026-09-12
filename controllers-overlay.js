/* ============================================================
   GAMEPAD TESTER — controllers-overlay.js
   Interactive Hotspot & Glow Overlay for Official Photos
   ============================================================ */

const OFFICIAL_OVERLAYS = {

  // ── PS4 (DualShock 4) ──────────────────────────────────────
  'ps4': {
    buttons: {
      0:  { type: 'circle', cx: 806, cy: 450, r: 36, color: '#2979ff', name: 'Cross: A Button' },
      1:  { type: 'circle', cx: 864, cy: 395, r: 36, color: '#ff1744', name: 'Circle: B Button' },
      2:  { type: 'circle', cx: 748, cy: 395, r: 36, color: '#ff4081', name: 'Square: X Button' },
      3:  { type: 'circle', cx: 806, cy: 340, r: 36, color: '#00e676', name: 'Triangle: Y Button' },
      4:  { type: 'rect',   x: 195, y: 242, w: 94, h: 46, rx: 14, color: '#2979ff', name: 'L1: Bumper Izquierdo' },
      5:  { type: 'rect',   x: 735, y: 242, w: 94, h: 46, rx: 14, color: '#2979ff', name: 'R1: Bumper Derecho' },
      6:  { type: 'trigger',x: 210, y: 168, w: 84, h: 68, rx: 16, color: '#ff9100', name: 'L2: Gatillo Izquierdo' },
      7:  { type: 'trigger',x: 730, y: 168, w: 84, h: 68, rx: 16, color: '#ff9100', name: 'R2: Gatillo Derecho' },
      8:  { type: 'pill',   cx: 320, cy: 308, rx: 14, ry: 26, color: '#ffffff', name: 'Share' },
      9:  { type: 'pill',   cx: 704, cy: 308, rx: 14, ry: 26, color: '#ffffff', name: 'Options' },
      10: { type: 'stick',  cx: 358, cy: 535, r: 52, color: '#2979ff', name: 'L3: Stick Izquierdo' },
      11: { type: 'stick',  cx: 666, cy: 535, r: 52, color: '#2979ff', name: 'R3: Stick Derecho' },
      12: { type: 'dpad',   cx: 226, cy: 355, w: 34, h: 40, dir: 'up',    name: 'D-Pad: Arriba' },
      13: { type: 'dpad',   cx: 226, cy: 440, w: 34, h: 40, dir: 'down',  name: 'D-Pad: Abajo' },
      14: { type: 'dpad',   cx: 184, cy: 398, w: 40, h: 34, dir: 'left',  name: 'D-Pad: Izquierda' },
      15: { type: 'dpad',   cx: 268, cy: 398, w: 40, h: 34, dir: 'right', name: 'D-Pad: Derecha' },
      16: { type: 'circle', cx: 512, cy: 535, r: 24, color: '#ffffff', name: 'Botón PS (Home)' },
      17: { type: 'rect',   x: 370, y: 275, w: 284, h: 160, rx: 16, color: '#00e5ff', name: 'Touchpad (Click)' },
    },
    lightbar: { x: 375, y: 255, w: 274, h: 18, rx: 6, color: '#0066ff' }
  },

  // ── PS5 (DualSense) ────────────────────────────────────────
  'ps5': {
    buttons: {
      0:  { type: 'circle', cx: 806, cy: 440, r: 36, color: '#2979ff', name: 'Cross: A Button' },
      1:  { type: 'circle', cx: 864, cy: 385, r: 36, color: '#ff1744', name: 'Circle: B Button' },
      2:  { type: 'circle', cx: 748, cy: 385, r: 36, color: '#ff4081', name: 'Square: X Button' },
      3:  { type: 'circle', cx: 806, cy: 330, r: 36, color: '#00e676', name: 'Triangle: Y Button' },
      4:  { type: 'rect',   x: 200, y: 232, w: 94, h: 46, rx: 14, color: '#2979ff', name: 'L1: Bumper Izquierdo' },
      5:  { type: 'rect',   x: 730, y: 232, w: 94, h: 46, rx: 14, color: '#2979ff', name: 'R1: Bumper Derecho' },
      6:  { type: 'trigger',x: 215, y: 160, w: 84, h: 68, rx: 16, color: '#ff9100', name: 'L2: Gatillo Izquierdo' },
      7:  { type: 'trigger',x: 725, y: 160, w: 84, h: 68, rx: 16, color: '#ff9100', name: 'R2: Gatillo Derecho' },
      8:  { type: 'pill',   cx: 315, cy: 305, rx: 12, ry: 24, color: '#ffffff', name: 'Create Button' },
      9:  { type: 'pill',   cx: 709, cy: 305, rx: 12, ry: 24, color: '#ffffff', name: 'Options Button' },
      10: { type: 'stick',  cx: 360, cy: 530, r: 52, color: '#2979ff', name: 'L3: Stick Izquierdo' },
      11: { type: 'stick',  cx: 664, cy: 530, r: 52, color: '#2979ff', name: 'R3: Stick Derecho' },
      12: { type: 'dpad',   cx: 226, cy: 345, w: 34, h: 40, dir: 'up',    name: 'D-Pad: Arriba' },
      13: { type: 'dpad',   cx: 226, cy: 430, w: 34, h: 40, dir: 'down',  name: 'D-Pad: Abajo' },
      14: { type: 'dpad',   cx: 184, cy: 388, w: 40, h: 34, dir: 'left',  name: 'D-Pad: Izquierda' },
      15: { type: 'dpad',   cx: 268, cy: 388, w: 40, h: 34, dir: 'right', name: 'D-Pad: Derecha' },
      16: { type: 'circle', cx: 512, cy: 510, r: 24, color: '#ffffff', name: 'Botón PS (Home)' },
      17: { type: 'rect',   x: 360, y: 260, w: 304, h: 170, rx: 16, color: '#00e5ff', name: 'Touchpad (Click)' },
    },
    lightbar: { x: 355, y: 255, w: 314, h: 14, rx: 7, color: '#0066ff' }
  },

  // ── PS3 (DualShock 3) ──────────────────────────────────────
  'ps3': {
    buttons: {
      0:  { type: 'circle', cx: 800, cy: 445, r: 36, color: '#2979ff', name: 'Cross: A Button' },
      1:  { type: 'circle', cx: 858, cy: 390, r: 36, color: '#ff1744', name: 'Circle: B Button' },
      2:  { type: 'circle', cx: 742, cy: 390, r: 36, color: '#ff4081', name: 'Square: X Button' },
      3:  { type: 'circle', cx: 800, cy: 335, r: 36, color: '#00e676', name: 'Triangle: Y Button' },
      4:  { type: 'rect',   x: 200, y: 245, w: 90, h: 44, rx: 12, color: '#2979ff', name: 'L1' },
      5:  { type: 'rect',   x: 734, y: 245, w: 90, h: 44, rx: 12, color: '#2979ff', name: 'R1' },
      6:  { type: 'trigger',x: 215, y: 178, w: 80, h: 64, rx: 14, color: '#ff9100', name: 'L2' },
      7:  { type: 'trigger',x: 729, y: 178, w: 80, h: 64, rx: 14, color: '#ff9100', name: 'R2' },
      8:  { type: 'rect',   x: 388, y: 342, w: 38, h: 22, rx: 6,  color: '#ffffff', name: 'Select' },
      9:  { type: 'rect',   x: 598, y: 342, w: 38, h: 22, rx: 6,  color: '#ffffff', name: 'Start' },
      10: { type: 'stick',  cx: 358, cy: 520, r: 52, color: '#2979ff', name: 'L3: Stick Izquierdo' },
      11: { type: 'stick',  cx: 666, cy: 520, r: 52, color: '#2979ff', name: 'R3: Stick Derecho' },
      12: { type: 'dpad',   cx: 224, cy: 345, w: 34, h: 40, dir: 'up',    name: 'D-Pad: Arriba' },
      13: { type: 'dpad',   cx: 224, cy: 430, w: 34, h: 40, dir: 'down',  name: 'D-Pad: Abajo' },
      14: { type: 'dpad',   cx: 180, cy: 388, w: 40, h: 34, dir: 'left',  name: 'D-Pad: Izquierda' },
      15: { type: 'dpad',   cx: 268, cy: 388, w: 40, h: 34, dir: 'right', name: 'D-Pad: Derecha' },
      16: { type: 'circle', cx: 512, cy: 390, r: 24, color: '#ffffff', name: 'Botón PS (Home)' },
    }
  },

  // ── PS2 (DualShock 2) ──────────────────────────────────────
  'ps2': {
    buttons: {
      0:  { type: 'circle', cx: 800, cy: 445, r: 36, color: '#2979ff', name: 'Cross: A Button' },
      1:  { type: 'circle', cx: 858, cy: 390, r: 36, color: '#ff1744', name: 'Circle: B Button' },
      2:  { type: 'circle', cx: 742, cy: 390, r: 36, color: '#ff4081', name: 'Square: X Button' },
      3:  { type: 'circle', cx: 800, cy: 335, r: 36, color: '#00e676', name: 'Triangle: Y Button' },
      4:  { type: 'rect',   x: 200, y: 245, w: 90, h: 44, rx: 12, color: '#2979ff', name: 'L1' },
      5:  { type: 'rect',   x: 734, y: 245, w: 90, h: 44, rx: 12, color: '#2979ff', name: 'R1' },
      6:  { type: 'trigger',x: 215, y: 178, w: 80, h: 64, rx: 14, color: '#ff9100', name: 'L2' },
      7:  { type: 'trigger',x: 729, y: 178, w: 80, h: 64, rx: 14, color: '#ff9100', name: 'R2' },
      8:  { type: 'rect',   x: 388, y: 342, w: 38, h: 22, rx: 6,  color: '#ffffff', name: 'Select' },
      9:  { type: 'rect',   x: 598, y: 342, w: 38, h: 22, rx: 6,  color: '#ffffff', name: 'Start' },
      10: { type: 'stick',  cx: 358, cy: 530, r: 52, color: '#2979ff', name: 'L3: Stick Izquierdo' },
      11: { type: 'stick',  cx: 666, cy: 530, r: 52, color: '#2979ff', name: 'R3: Stick Derecho' },
      12: { type: 'dpad',   cx: 224, cy: 345, w: 34, h: 40, dir: 'up',    name: 'D-Pad: Arriba' },
      13: { type: 'dpad',   cx: 224, cy: 430, w: 34, h: 40, dir: 'down',  name: 'D-Pad: Abajo' },
      14: { type: 'dpad',   cx: 180, cy: 388, w: 40, h: 34, dir: 'left',  name: 'D-Pad: Izquierda' },
      15: { type: 'dpad',   cx: 268, cy: 388, w: 40, h: 34, dir: 'right', name: 'D-Pad: Derecha' },
      16: { type: 'circle', cx: 512, cy: 390, r: 18, color: '#ff1744', name: 'ANALOG Button' },
    }
  },

  // ── Xbox Series S / Series X ───────────────────────────────
  'xbox-series-s': {
    buttons: {
      0:  { type: 'circle', cx: 740, cy: 435, r: 36, color: '#00e676', name: 'A Button (Verde)' },
      1:  { type: 'circle', cx: 795, cy: 380, r: 36, color: '#ff1744', name: 'B Button (Rojo)' },
      2:  { type: 'circle', cx: 685, cy: 380, r: 36, color: '#00b0ff', name: 'X Button (Azul)' },
      3:  { type: 'circle', cx: 740, cy: 325, r: 36, color: '#ffd600', name: 'Y Button (Amarillo)' },
      4:  { type: 'rect',   x: 185, y: 225, w: 98, h: 48, rx: 14, color: '#00e676', name: 'LB: Left Bumper' },
      5:  { type: 'rect',   x: 741, y: 225, w: 98, h: 48, rx: 14, color: '#00e676', name: 'RB: Right Bumper' },
      6:  { type: 'trigger',x: 195, y: 155, w: 84, h: 68, rx: 16, color: '#ff9100', name: 'LT: Left Trigger' },
      7:  { type: 'trigger',x: 745, y: 155, w: 84, h: 68, rx: 16, color: '#ff9100', name: 'RT: Right Trigger' },
      8:  { type: 'circle', cx: 420, cy: 385, r: 20, color: '#ffffff', name: 'View / Back' },
      9:  { type: 'circle', cx: 604, cy: 385, r: 20, color: '#ffffff', name: 'Menu / Start' },
      10: { type: 'stick',  cx: 300, cy: 380, r: 52, color: '#00e676', name: 'L3: Stick Izquierdo (Alto)' },
      11: { type: 'stick',  cx: 630, cy: 530, r: 52, color: '#00e676', name: 'R3: Stick Derecho (Bajo)' },
      12: { type: 'dpad',   cx: 400, cy: 490, w: 34, h: 40, dir: 'up',    name: 'D-Pad: Arriba' },
      13: { type: 'dpad',   cx: 400, cy: 570, w: 34, h: 40, dir: 'down',  name: 'D-Pad: Abajo' },
      14: { type: 'dpad',   cx: 360, cy: 530, w: 40, h: 34, dir: 'left',  name: 'D-Pad: Izquierda' },
      15: { type: 'dpad',   cx: 440, cy: 530, w: 40, h: 34, dir: 'right', name: 'D-Pad: Derecha' },
      16: { type: 'circle', cx: 512, cy: 290, r: 32, color: '#ffffff', name: 'Xbox Guía (Home)' },
      17: { type: 'pill',   cx: 512, cy: 450, rx: 12, ry: 18, color: '#ffffff', name: 'Share Button' },
    }
  },

  // ── Xbox One ───────────────────────────────────────────────
  'xbox-one': {
    buttons: {
      0:  { type: 'circle', cx: 740, cy: 440, r: 36, color: '#00e676', name: 'A Button (Verde)' },
      1:  { type: 'circle', cx: 795, cy: 385, r: 36, color: '#ff1744', name: 'B Button (Rojo)' },
      2:  { type: 'circle', cx: 685, cy: 385, r: 36, color: '#00b0ff', name: 'X Button (Azul)' },
      3:  { type: 'circle', cx: 740, cy: 330, r: 36, color: '#ffd600', name: 'Y Button (Amarillo)' },
      4:  { type: 'rect',   x: 185, y: 225, w: 98, h: 48, rx: 14, color: '#00e676', name: 'LB: Left Bumper' },
      5:  { type: 'rect',   x: 741, y: 225, w: 98, h: 48, rx: 14, color: '#00e676', name: 'RB: Right Bumper' },
      6:  { type: 'trigger',x: 195, y: 155, w: 84, h: 68, rx: 16, color: '#ff9100', name: 'LT: Left Trigger' },
      7:  { type: 'trigger',x: 745, y: 155, w: 84, h: 68, rx: 16, color: '#ff9100', name: 'RT: Right Trigger' },
      8:  { type: 'circle', cx: 420, cy: 390, r: 20, color: '#ffffff', name: 'View / Back' },
      9:  { type: 'circle', cx: 604, cy: 390, r: 20, color: '#ffffff', name: 'Menu / Start' },
      10: { type: 'stick',  cx: 300, cy: 385, r: 52, color: '#00e676', name: 'L3: Stick Izquierdo (Alto)' },
      11: { type: 'stick',  cx: 630, cy: 535, r: 52, color: '#00e676', name: 'R3: Stick Derecho (Bajo)' },
      12: { type: 'dpad',   cx: 400, cy: 495, w: 34, h: 40, dir: 'up',    name: 'D-Pad: Arriba' },
      13: { type: 'dpad',   cx: 400, cy: 575, w: 34, h: 40, dir: 'down',  name: 'D-Pad: Abajo' },
      14: { type: 'dpad',   cx: 360, cy: 535, w: 40, h: 34, dir: 'left',  name: 'D-Pad: Izquierda' },
      15: { type: 'dpad',   cx: 440, cy: 535, w: 40, h: 34, dir: 'right', name: 'D-Pad: Derecha' },
      16: { type: 'circle', cx: 512, cy: 295, r: 32, color: '#ffffff', name: 'Xbox Guía (Home)' },
    }
  },

  // ── Generic ────────────────────────────────────────────────
  'generic': {
    buttons: {
      0:  { type: 'circle', cx: 806, cy: 450, r: 36, color: '#2979ff', name: 'A / Cross' },
      1:  { type: 'circle', cx: 864, cy: 395, r: 36, color: '#ff1744', name: 'B / Circle' },
      2:  { type: 'circle', cx: 748, cy: 395, r: 36, color: '#ff4081', name: 'X / Square' },
      3:  { type: 'circle', cx: 806, cy: 340, r: 36, color: '#00e676', name: 'Y / Triangle' },
      4:  { type: 'rect',   x: 195, y: 242, w: 94, h: 46, rx: 14, color: '#2979ff', name: 'LB / L1' },
      5:  { type: 'rect',   x: 735, y: 242, w: 94, h: 46, rx: 14, color: '#2979ff', name: 'RB / R1' },
      6:  { type: 'trigger',x: 210, y: 168, w: 84, h: 68, rx: 16, color: '#ff9100', name: 'LT / L2' },
      7:  { type: 'trigger',x: 730, y: 168, w: 84, h: 68, rx: 16, color: '#ff9100', name: 'RT / R2' },
      8:  { type: 'pill',   cx: 320, cy: 308, rx: 14, ry: 26, color: '#ffffff', name: 'Select' },
      9:  { type: 'pill',   cx: 704, cy: 308, rx: 14, ry: 26, color: '#ffffff', name: 'Start' },
      10: { type: 'stick',  cx: 358, cy: 535, r: 52, color: '#2979ff', name: 'L3 (Stick Izq)' },
      11: { type: 'stick',  cx: 666, cy: 535, r: 52, color: '#2979ff', name: 'R3 (Stick Der)' },
      12: { type: 'dpad',   cx: 226, cy: 355, w: 34, h: 40, dir: 'up',    name: 'D-Pad: Arriba' },
      13: { type: 'dpad',   cx: 226, cy: 440, w: 34, h: 40, dir: 'down',  name: 'D-Pad: Abajo' },
      14: { type: 'dpad',   cx: 184, cy: 398, w: 40, h: 34, dir: 'left',  name: 'D-Pad: Izquierda' },
      15: { type: 'dpad',   cx: 268, cy: 398, w: 40, h: 34, dir: 'right', name: 'D-Pad: Derecha' },
      16: { type: 'circle', cx: 512, cy: 535, r: 24, color: '#ffffff', name: 'Home' },
    }
  }
};
