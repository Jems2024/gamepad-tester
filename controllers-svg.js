/* ============================================================
   GAMEPAD TESTER — controllers-svg.js
   Interactive Vector Models for all controllers
   ============================================================ */

const CONTROLLER_SVGS = {

  // ───────────────────────────────────────────────────────────
  // PS4 (DualShock 4) — matching the reference style
  // ───────────────────────────────────────────────────────────
  'ps4': `
<svg id="controller-svg" viewBox="0 0 800 560" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="ps4-body-grad" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#4a4a50"/>
      <stop offset="100%" stop-color="#2c2c30"/>
    </radialGradient>
    <radialGradient id="ps4-stick-base" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#242428"/>
      <stop offset="100%" stop-color="#141416"/>
    </radialGradient>
    <radialGradient id="ps4-stick-cap" cx="45%" cy="45%" r="50%">
      <stop offset="0%" stop-color="#3c3c42"/>
      <stop offset="75%" stop-color="#222226"/>
      <stop offset="100%" stop-color="#121214"/>
    </radialGradient>
    <pattern id="touchpad-dots" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
      <circle cx="4" cy="4" r="1" fill="#202024"/>
    </pattern>
  </defs>

  <style>
    .ctrl-stroke { stroke: #121215; stroke-width: 3.5; stroke-linecap: round; stroke-linejoin: round; }
    .ctrl-thin { stroke: #121215; stroke-width: 2; fill: none; }
    .btn-shape { fill: #34343a; transition: fill 0.05s; }
    .btn-symbol { stroke: #9999a2; stroke-width: 2.2; fill: none; stroke-linecap: round; stroke-linejoin: round; pointer-events: none; }
    .btn-text { fill: #9999a2; font-family: system-ui, sans-serif; font-size: 11px; font-weight: 700; text-anchor: middle; user-select: none; pointer-events: none; }
    .lightbar-off { fill: #1c2b3a; stroke: #121215; stroke-width: 2.5; transition: fill 0.1s; }
    .stick-cap { cursor: pointer; transition: transform 0.04s ease-out; }
  </style>

  <!-- Triggers (L2 / R2) behind body -->
  <g id="svg-btn-6" class="ctrl-btn" data-btn="6">
    <path d="M 210,120 C 205,70 240,50 270,48 C 290,47 298,65 292,120 Z" class="btn-shape ctrl-stroke"/>
    <text x="250" y="85" class="btn-text">L2</text>
  </g>
  <g id="svg-btn-7" class="ctrl-btn" data-btn="7">
    <path d="M 590,120 C 595,70 560,50 530,48 C 510,47 502,65 508,120 Z" class="btn-shape ctrl-stroke"/>
    <text x="550" y="85" class="btn-text">R2</text>
  </g>

  <!-- Bumpers (L1 / R1) -->
  <g id="svg-btn-4" class="ctrl-btn" data-btn="4">
    <path d="M 195,142 C 190,118 215,95 275,98 C 300,99 308,115 305,145 C 265,140 220,138 195,142 Z" class="btn-shape ctrl-stroke"/>
    <text x="250" y="125" class="btn-text">L1</text>
  </g>
  <g id="svg-btn-5" class="ctrl-btn" data-btn="5">
    <path d="M 605,142 C 610,118 585,95 525,98 C 500,99 492,115 495,145 C 535,140 580,138 605,142 Z" class="btn-shape ctrl-stroke"/>
    <text x="550" y="125" class="btn-text">R1</text>
  </g>

  <!-- Main Controller Body Shell -->
  <path d="M 290,140 
           C 330,135 470,135 510,140 
           C 545,140 610,150 645,185 
           C 685,225 725,320 740,410 
           C 748,455 725,485 680,485 
           C 645,485 615,445 585,395 
           C 555,345 530,340 480,345 
           C 440,350 360,350 320,345 
           C 270,340 245,345 215,395 
           C 185,445 155,485 120,485 
           C 75,485 52,455 60,410 
           C 75,320 115,225 155,185 
           C 190,150 255,140 290,140 Z" 
        fill="url(#ps4-body-grad)" class="ctrl-stroke"/>

  <!-- Left/Right Grip Seams -->
  <path d="M 125,480 C 160,450 185,385 180,320 C 178,290 160,260 145,230" class="ctrl-thin"/>
  <path d="M 675,480 C 640,450 615,385 620,320 C 622,290 640,260 655,230" class="ctrl-thin"/>

  <!-- Lightbar at top of Touchpad -->
  <g id="svg-lightbar">
    <path id="svg-lightbar-path" d="M 330,146 C 365,143 435,143 470,146 L 476,160 C 430,158 370,158 324,160 Z" class="lightbar-off"/>
  </g>

  <!-- Touchpad (Button 17) -->
  <g id="svg-btn-17" class="ctrl-btn" data-btn="17">
    <path d="M 320,165 L 480,165 C 488,165 492,170 490,180 L 476,285 C 474,295 466,298 455,298 L 345,298 C 334,298 326,295 324,285 L 310,180 C 308,170 312,165 320,165 Z"
          class="btn-shape ctrl-stroke"/>
    <rect x="330" y="175" width="140" height="110" rx="6" fill="url(#touchpad-dots)" pointer-events="none"/>
  </g>

  <!-- Share Button (Button 8) -->
  <g id="svg-btn-8" class="ctrl-btn" data-btn="8">
    <rect x="286" y="175" width="16" height="32" rx="7" class="btn-shape ctrl-stroke"/>
    <text x="294" y="165" class="btn-text" style="font-size:9px;">SHARE</text>
  </g>

  <!-- Options Button (Button 9) -->
  <g id="svg-btn-9" class="ctrl-btn" data-btn="9">
    <rect x="498" y="175" width="16" height="32" rx="7" class="btn-shape ctrl-stroke"/>
    <text x="506" y="165" class="btn-text" style="font-size:9px;">OPTIONS</text>
  </g>

  <!-- D-PAD Circular Base Well -->
  <circle cx="225" cy="245" r="75" fill="#2d2d32" class="ctrl-stroke"/>

  <!-- D-PAD Buttons (12, 13, 14, 15) -->
  <g id="svg-btn-12" class="ctrl-btn" data-btn="12">
    <path d="M 213,178 C 213,174 237,174 237,178 L 237,215 L 213,215 Z" class="btn-shape ctrl-stroke"/>
    <polygon points="225,183 232,193 218,193" fill="#888892"/>
  </g>
  <g id="svg-btn-13" class="ctrl-btn" data-btn="13">
    <path d="M 213,312 C 213,316 237,316 237,312 L 237,275 L 213,275 Z" class="btn-shape ctrl-stroke"/>
    <polygon points="225,307 232,297 218,297" fill="#888892"/>
  </g>
  <g id="svg-btn-14" class="ctrl-btn" data-btn="14">
    <path d="M 158,233 C 154,233 154,257 158,257 L 195,257 L 195,233 Z" class="btn-shape ctrl-stroke"/>
    <polygon points="163,245 173,238 173,252" fill="#888892"/>
  </g>
  <g id="svg-btn-15" class="ctrl-btn" data-btn="15">
    <path d="M 292,233 C 296,233 296,257 292,257 L 255,257 L 255,233 Z" class="btn-shape ctrl-stroke"/>
    <polygon points="287,245 277,238 277,252" fill="#888892"/>
  </g>
  <circle cx="225" cy="245" r="14" fill="#2d2d32"/>

  <!-- Face Buttons Circular Well -->
  <circle cx="575" cy="245" r="75" fill="#2d2d32" class="ctrl-stroke"/>

  <!-- Triangle (Button 3) -->
  <g id="svg-btn-3" class="ctrl-btn" data-btn="3">
    <circle cx="575" cy="188" r="19" class="btn-shape ctrl-stroke"/>
    <polygon points="575,178 585,195 565,195" class="btn-symbol" style="stroke:#39d98a;"/>
  </g>
  <!-- Circle (Button 1) -->
  <g id="svg-btn-1" class="ctrl-btn" data-btn="1">
    <circle cx="632" cy="245" r="19" class="btn-shape ctrl-stroke"/>
    <circle cx="632" cy="245" r="9" class="btn-symbol" style="stroke:#ff4d6d;"/>
  </g>
  <!-- Cross (Button 0) -->
  <g id="svg-btn-0" class="ctrl-btn" data-btn="0">
    <circle cx="575" cy="302" r="19" class="btn-shape ctrl-stroke"/>
    <line x1="568" y1="295" x2="582" y2="309" class="btn-symbol" style="stroke:#6c63ff;"/>
    <line x1="582" y1="295" x2="568" y2="309" class="btn-symbol" style="stroke:#6c63ff;"/>
  </g>
  <!-- Square (Button 2) -->
  <g id="svg-btn-2" class="ctrl-btn" data-btn="2">
    <circle cx="518" cy="245" r="19" class="btn-shape ctrl-stroke"/>
    <rect x="510" y="237" width="16" height="16" rx="2" class="btn-symbol" style="stroke:#ff70a6;"/>
  </g>

  <!-- PS Logo Home Button (Button 16) -->
  <g id="svg-btn-16" class="ctrl-btn" data-btn="16">
    <circle cx="400" cy="335" r="18" class="btn-shape ctrl-stroke"/>
    <path d="M 397,325 L 397,345 M 397,325 C 404,324 406,328 406,331 C 406,335 401,336 397,336 M 394,339 C 390,341 386,344 394,345 C 405,346 412,342 411,338" 
          class="btn-symbol" style="stroke-width:2; stroke:#e0e0e0;"/>
  </g>

  <!-- Left Analog Stick (L3 - Button 10) -->
  <g id="svg-stick-l-well">
    <circle cx="310" cy="365" r="54" fill="url(#ps4-stick-base)" class="ctrl-stroke"/>
  </g>
  <g id="svg-stick-l" class="stick-cap ctrl-btn" data-btn="10" style="transform-origin: 310px 365px;">
    <circle cx="310" cy="365" r="42" fill="url(#ps4-stick-cap)" class="ctrl-stroke"/>
    <circle cx="310" cy="365" r="30" fill="none" stroke="#252528" stroke-width="2"/>
    <circle cx="310" cy="365" r="22" fill="#18181b"/>
  </g>

  <!-- Right Analog Stick (R3 - Button 11) -->
  <g id="svg-stick-r-well">
    <circle cx="490" cy="365" r="54" fill="url(#ps4-stick-base)" class="ctrl-stroke"/>
  </g>
  <g id="svg-stick-r" class="stick-cap ctrl-btn" data-btn="11" style="transform-origin: 490px 365px;">
    <circle cx="490" cy="365" r="42" fill="url(#ps4-stick-cap)" class="ctrl-stroke"/>
    <circle cx="490" cy="365" r="30" fill="none" stroke="#252528" stroke-width="2"/>
    <circle cx="490" cy="365" r="22" fill="#18181b"/>
  </g>
</svg>
`,

  // ───────────────────────────────────────────────────────────
  // PS5 (DualSense)
  // ───────────────────────────────────────────────────────────
  'ps5': `
<svg id="controller-svg" viewBox="0 0 800 560" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="ps5-white-body" cx="50%" cy="30%" r="65%">
      <stop offset="0%" stop-color="#f2f2f6"/>
      <stop offset="70%" stop-color="#d9dae0"/>
      <stop offset="100%" stop-color="#bcc0c8"/>
    </radialGradient>
    <radialGradient id="ps5-black-center" cx="50%" cy="60%" r="45%">
      <stop offset="0%" stop-color="#34343a"/>
      <stop offset="100%" stop-color="#18181b"/>
    </radialGradient>
  </defs>

  <style>
    .ctrl-stroke { stroke: #121214; stroke-width: 3.5; stroke-linecap: round; stroke-linejoin: round; }
    .ctrl-thin { stroke: #121214; stroke-width: 2; fill: none; }
    .btn-shape { fill: #dcdde2; transition: fill 0.05s; }
    .btn-shape-dark { fill: #2c2c30; transition: fill 0.05s; }
    .btn-symbol { stroke: #666670; stroke-width: 2.2; fill: none; stroke-linecap: round; stroke-linejoin: round; pointer-events: none; }
    .btn-text { fill: #666670; font-family: system-ui, sans-serif; font-size: 11px; font-weight: 700; text-anchor: middle; user-select: none; pointer-events: none; }
    .stick-cap { cursor: pointer; transition: transform 0.04s ease-out; }
  </style>

  <!-- Triggers (L2 / R2) -->
  <g id="svg-btn-6" class="ctrl-btn" data-btn="6">
    <path d="M 215,110 C 210,60 245,40 275,38 C 295,37 302,55 296,110 Z" class="btn-shape-dark ctrl-stroke"/>
    <text x="255" y="78" class="btn-text" style="fill:#aaa;">L2</text>
  </g>
  <g id="svg-btn-7" class="ctrl-btn" data-btn="7">
    <path d="M 585,110 C 590,60 555,40 525,38 C 505,37 498,55 504,110 Z" class="btn-shape-dark ctrl-stroke"/>
    <text x="545" y="78" class="btn-text" style="fill:#aaa;">R2</text>
  </g>

  <!-- Bumpers (L1 / R1) -->
  <g id="svg-btn-4" class="ctrl-btn" data-btn="4">
    <path d="M 200,135 C 195,110 220,88 280,90 C 305,91 312,108 308,138 C 270,132 225,130 200,135 Z" class="btn-shape-dark ctrl-stroke"/>
    <text x="255" y="118" class="btn-text" style="fill:#aaa;">L1</text>
  </g>
  <g id="svg-btn-5" class="ctrl-btn" data-btn="5">
    <path d="M 600,135 C 605,110 580,88 520,90 C 495,91 488,108 492,138 C 530,132 575,130 600,135 Z" class="btn-shape-dark ctrl-stroke"/>
    <text x="545" y="118" class="btn-text" style="fill:#aaa;">R1</text>
  </g>

  <!-- Outer White Shell -->
  <path d="M 290,130 
           C 335,125 465,125 510,130 
           C 550,130 615,140 650,180 
           C 690,225 735,320 748,415 
           C 755,465 725,495 680,490 
           C 645,485 615,440 585,390 
           C 555,340 525,335 480,340 
           C 440,345 360,345 320,340 
           C 275,335 245,340 215,390 
           C 185,440 155,485 120,490 
           C 75,495 45,465 52,415 
           C 65,320 110,225 150,180 
           C 185,140 250,130 290,130 Z" 
        fill="url(#ps5-white-body)" class="ctrl-stroke"/>

  <!-- Inner Black Center Piece -->
  <path d="M 270,290 
           C 255,345 235,390 195,440 
           C 160,480 145,485 120,490 
           C 145,450 170,390 205,330 
           C 230,290 260,265 290,270 
           C 340,280 460,280 510,270 
           C 540,265 570,290 595,330 
           C 630,390 655,450 680,490 
           C 655,485 640,480 605,440 
           C 565,390 545,345 530,290 
           C 480,340 320,340 270,290 Z" 
        fill="url(#ps5-black-center)" class="ctrl-stroke"/>

  <!-- Touchpad -->
  <g id="svg-btn-17" class="ctrl-btn" data-btn="17">
    <path d="M 315,150 L 485,150 C 495,150 500,155 496,168 L 480,278 C 476,288 468,292 455,292 L 345,292 C 332,292 324,288 320,278 L 304,168 C 300,155 305,150 315,150 Z"
          fill="#d8d9de" class="ctrl-stroke"/>
  </g>

  <!-- Create Button (Button 8) -->
  <g id="svg-btn-8" class="ctrl-btn" data-btn="8">
    <ellipse cx="282" cy="180" rx="7" ry="14" class="btn-shape ctrl-stroke"/>
    <text x="282" y="160" class="btn-text" style="font-size:9px;">CREATE</text>
  </g>
  <!-- Options Button (Button 9) -->
  <g id="svg-btn-9" class="ctrl-btn" data-btn="9">
    <ellipse cx="518" cy="180" rx="7" ry="14" class="btn-shape ctrl-stroke"/>
    <text x="518" y="160" class="btn-text" style="font-size:9px;">OPTIONS</text>
  </g>

  <!-- D-PAD Buttons -->
  <g id="svg-btn-12" class="ctrl-btn" data-btn="12"><path d="M 213,178 C 213,172 237,172 237,178 L 237,215 L 213,215 Z" class="btn-shape ctrl-stroke"/><polygon points="225,183 232,193 218,193" fill="#666"/></g>
  <g id="svg-btn-13" class="ctrl-btn" data-btn="13"><path d="M 213,312 C 213,318 237,318 237,312 L 237,275 L 213,275 Z" class="btn-shape ctrl-stroke"/><polygon points="225,307 232,297 218,297" fill="#666"/></g>
  <g id="svg-btn-14" class="ctrl-btn" data-btn="14"><path d="M 158,233 C 152,233 152,257 158,257 L 195,257 L 195,233 Z" class="btn-shape ctrl-stroke"/><polygon points="163,245 173,238 173,252" fill="#666"/></g>
  <g id="svg-btn-15" class="ctrl-btn" data-btn="15"><path d="M 292,233 C 298,233 298,257 292,257 L 255,257 L 255,233 Z" class="btn-shape ctrl-stroke"/><polygon points="287,245 277,238 277,252" fill="#666"/></g>

  <!-- Face Buttons -->
  <g id="svg-btn-3" class="ctrl-btn" data-btn="3"><circle cx="575" cy="188" r="19" class="btn-shape ctrl-stroke"/><polygon points="575,178 585,195 565,195" class="btn-symbol"/></g>
  <g id="svg-btn-1" class="ctrl-btn" data-btn="1"><circle cx="632" cy="245" r="19" class="btn-shape ctrl-stroke"/><circle cx="632" cy="245" r="9" class="btn-symbol"/></g>
  <g id="svg-btn-0" class="ctrl-btn" data-btn="0"><circle cx="575" cy="302" r="19" class="btn-shape ctrl-stroke"/><line x1="568" y1="295" x2="582" y2="309" class="btn-symbol"/><line x1="582" y1="295" x2="568" y2="309" class="btn-symbol"/></g>
  <g id="svg-btn-2" class="ctrl-btn" data-btn="2"><circle cx="518" cy="245" r="19" class="btn-shape ctrl-stroke"/><rect x="510" y="237" width="16" height="16" rx="2" class="btn-symbol"/></g>

  <!-- PS Logo Home Button (Button 16) -->
  <g id="svg-btn-16" class="ctrl-btn" data-btn="16">
    <path d="M 396,330 L 396,350 M 396,330 C 403,329 406,333 406,336 C 406,340 401,341 396,341 M 393,344 C 389,346 385,349 393,350 C 404,351 411,347 410,343" 
          class="ctrl-stroke" style="stroke-width:2.8; stroke:#111;"/>
  </g>

  <!-- Sticks -->
  <g id="svg-stick-l" class="stick-cap ctrl-btn" data-btn="10" style="transform-origin: 320px 385px;">
    <circle cx="320" cy="385" r="48" fill="#202024" class="ctrl-stroke"/>
    <circle cx="320" cy="385" r="38" fill="#323238" class="ctrl-stroke"/>
    <circle cx="320" cy="385" r="24" fill="#1b1b1e"/>
  </g>
  <g id="svg-stick-r" class="stick-cap ctrl-btn" data-btn="11" style="transform-origin: 480px 385px;">
    <circle cx="480" cy="385" r="48" fill="#202024" class="ctrl-stroke"/>
    <circle cx="480" cy="385" r="38" fill="#323238" class="ctrl-stroke"/>
    <circle cx="480" cy="385" r="24" fill="#1b1b1e"/>
  </g>
</svg>
`,

  // ───────────────────────────────────────────────────────────
  // PS3 (DualShock 3)
  // ───────────────────────────────────────────────────────────
  'ps3': `
<svg id="controller-svg" viewBox="0 0 800 560" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="ps3-body-grad" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#3c3c40"/>
      <stop offset="100%" stop-color="#202024"/>
    </radialGradient>
  </defs>
  <style>
    .ctrl-stroke { stroke: #111113; stroke-width: 3.5; stroke-linecap: round; stroke-linejoin: round; }
    .btn-shape { fill: #2c2c30; transition: fill 0.05s; }
    .btn-symbol { stroke: #aaa; stroke-width: 2.2; fill: none; stroke-linecap: round; stroke-linejoin: round; pointer-events: none; }
    .btn-text { fill: #9e9ea6; font-family: system-ui, sans-serif; font-size: 11px; font-weight: 700; text-anchor: middle; user-select: none; pointer-events: none; }
    .stick-cap { cursor: pointer; transition: transform 0.04s ease-out; }
  </style>

  <g id="svg-btn-6" class="ctrl-btn" data-btn="6"><path d="M 220,130 C 215,80 245,60 270,58 C 290,57 298,75 294,130 Z" class="btn-shape ctrl-stroke"/><text x="255" y="95" class="btn-text">L2</text></g>
  <g id="svg-btn-7" class="ctrl-btn" data-btn="7"><path d="M 580,130 C 585,80 555,60 530,58 C 510,57 502,75 506,130 Z" class="btn-shape ctrl-stroke"/><text x="545" y="95" class="btn-text">R2</text></g>
  <g id="svg-btn-4" class="ctrl-btn" data-btn="4"><path d="M 210,150 C 205,128 230,110 275,112 C 295,113 302,125 300,150 Z" class="btn-shape ctrl-stroke"/><text x="255" y="135" class="btn-text">L1</text></g>
  <g id="svg-btn-5" class="ctrl-btn" data-btn="5"><path d="M 590,150 C 595,128 570,110 525,112 C 505,113 498,125 500,150 Z" class="btn-shape ctrl-stroke"/><text x="545" y="135" class="btn-text">R1</text></g>

  <path d="M 280,150 C 330,145 470,145 520,150 C 560,150 620,165 650,200 C 690,240 730,330 740,420 C 746,460 720,490 680,490 C 645,490 615,445 585,395 C 555,345 520,340 480,345 C 440,350 360,350 320,345 C 280,340 245,345 215,395 C 185,445 155,490 120,490 C 80,490 54,460 60,420 C 70,330 110,240 150,200 C 180,165 240,150 280,150 Z"
        fill="url(#ps3-body-grad)" class="ctrl-stroke"/>

  <g id="svg-btn-8" class="ctrl-btn" data-btn="8"><rect x="335" y="240" width="26" height="14" rx="4" class="btn-shape ctrl-stroke"/><text x="348" y="232" class="btn-text" style="font-size:9px;">SELECT</text></g>
  <g id="svg-btn-9" class="ctrl-btn" data-btn="9"><polygon points="440,240 466,247 440,254" class="btn-shape ctrl-stroke"/><text x="453" y="232" class="btn-text" style="font-size:9px;">START</text></g>
  <g id="svg-btn-16" class="ctrl-btn" data-btn="16"><circle cx="400" cy="275" r="18" class="btn-shape ctrl-stroke"/><path d="M 397,268 L 397,284 M 397,268 C 403,267 405,270 405,273 C 405,276 401,277 397,277" class="btn-symbol" style="stroke:#ddd;"/></g>

  <g id="svg-btn-12" class="ctrl-btn" data-btn="12"><path d="M 205,188 C 205,184 225,184 225,188 L 225,220 L 205,220 Z" class="btn-shape ctrl-stroke"/></g>
  <g id="svg-btn-13" class="ctrl-btn" data-btn="13"><path d="M 205,302 C 205,306 225,306 225,302 L 225,270 L 205,270 Z" class="btn-shape ctrl-stroke"/></g>
  <g id="svg-btn-14" class="ctrl-btn" data-btn="14"><path d="M 158,235 C 154,235 154,255 158,255 L 190,255 L 190,235 Z" class="btn-shape ctrl-stroke"/></g>
  <g id="svg-btn-15" class="ctrl-btn" data-btn="15"><path d="M 272,235 C 276,235 276,255 272,255 L 240,255 L 240,235 Z" class="btn-shape ctrl-stroke"/></g>

  <g id="svg-btn-3" class="ctrl-btn" data-btn="3"><circle cx="585" cy="195" r="18" class="btn-shape ctrl-stroke"/><polygon points="585,186 594,202 576,202" class="btn-symbol" style="stroke:#39d98a;"/></g>
  <g id="svg-btn-1" class="ctrl-btn" data-btn="1"><circle cx="640" cy="245" r="18" class="btn-shape ctrl-stroke"/><circle cx="640" cy="245" r="8" class="btn-symbol" style="stroke:#ff4d6d;"/></g>
  <g id="svg-btn-0" class="ctrl-btn" data-btn="0"><circle cx="585" cy="295" r="18" class="btn-shape ctrl-stroke"/><line x1="578" y1="288" x2="592" y2="302" class="btn-symbol" style="stroke:#6c63ff;"/><line x1="592" y1="288" x2="578" y2="302" class="btn-symbol" style="stroke:#6c63ff;"/></g>
  <g id="svg-btn-2" class="ctrl-btn" data-btn="2"><circle cx="530" cy="245" r="18" class="btn-shape ctrl-stroke"/><rect x="523" y="238" width="14" height="14" rx="2" class="btn-symbol" style="stroke:#ff70a6;"/></g>

  <g id="svg-stick-l" class="stick-cap ctrl-btn" data-btn="10" style="transform-origin: 320px 365px;"><circle cx="320" cy="365" r="44" fill="#202024" class="ctrl-stroke"/><circle cx="320" cy="365" r="32" fill="#2c2c32" class="ctrl-stroke"/><circle cx="320" cy="365" r="18" fill="#18181a"/></g>
  <g id="svg-stick-r" class="stick-cap ctrl-btn" data-btn="11" style="transform-origin: 480px 365px;"><circle cx="480" cy="365" r="44" fill="#202024" class="ctrl-stroke"/><circle cx="480" cy="365" r="32" fill="#2c2c32" class="ctrl-stroke"/><circle cx="480" cy="365" r="18" fill="#18181a"/></g>
</svg>
`,

  // ───────────────────────────────────────────────────────────
  // PS2 (DualShock 2)
  // ───────────────────────────────────────────────────────────
  'ps2': `
<svg id="controller-svg" viewBox="0 0 800 560" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="ps2-body-grad" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#303034"/>
      <stop offset="100%" stop-color="#18181a"/>
    </radialGradient>
  </defs>
  <style>
    .ctrl-stroke { stroke: #0a0a0c; stroke-width: 3.5; stroke-linecap: round; stroke-linejoin: round; }
    .btn-shape { fill: #222226; transition: fill 0.05s; }
    .btn-symbol { stroke: #aaa; stroke-width: 2.2; fill: none; stroke-linecap: round; stroke-linejoin: round; pointer-events: none; }
    .btn-text { fill: #888892; font-family: system-ui, sans-serif; font-size: 11px; font-weight: 700; text-anchor: middle; user-select: none; pointer-events: none; }
    .stick-cap { cursor: pointer; transition: transform 0.04s ease-out; }
  </style>

  <g id="svg-btn-6" class="ctrl-btn" data-btn="6"><path d="M 220,130 C 215,85 245,65 270,63 C 290,62 298,80 294,130 Z" class="btn-shape ctrl-stroke"/><text x="255" y="100" class="btn-text">L2</text></g>
  <g id="svg-btn-7" class="ctrl-btn" data-btn="7"><path d="M 580,130 C 585,85 555,65 530,63 C 510,62 502,80 506,130 Z" class="btn-shape ctrl-stroke"/><text x="545" y="100" class="btn-text">R2</text></g>
  <g id="svg-btn-4" class="ctrl-btn" data-btn="4"><path d="M 210,152 C 205,130 230,115 275,117 C 295,118 302,130 300,152 Z" class="btn-shape ctrl-stroke"/><text x="255" y="138" class="btn-text">L1</text></g>
  <g id="svg-btn-5" class="ctrl-btn" data-btn="5"><path d="M 590,152 C 595,130 570,115 525,117 C 505,118 498,130 500,152 Z" class="btn-shape ctrl-stroke"/><text x="545" y="138" class="btn-text">R1</text></g>

  <path d="M 280,152 C 330,147 470,147 520,152 C 560,152 620,167 650,202 C 690,242 730,332 740,422 C 746,462 720,492 680,492 C 645,492 615,447 585,397 C 555,347 520,342 480,347 C 440,352 360,352 320,347 C 280,342 245,347 215,397 C 185,447 155,492 120,492 C 80,492 54,462 60,422 C 70,332 110,242 150,202 C 180,167 240,152 280,152 Z"
        fill="url(#ps2-body-grad)" class="ctrl-stroke"/>

  <g id="svg-btn-8" class="ctrl-btn" data-btn="8"><rect x="335" y="240" width="26" height="14" rx="4" class="btn-shape ctrl-stroke"/><text x="348" y="232" class="btn-text" style="font-size:9px;">SELECT</text></g>
  <g id="svg-btn-9" class="ctrl-btn" data-btn="9"><polygon points="440,240 466,247 440,254" class="btn-shape ctrl-stroke"/><text x="453" y="232" class="btn-text" style="font-size:9px;">START</text></g>

  <circle cx="400" cy="275" r="10" fill="#222" class="ctrl-stroke"/>
  <rect x="394" y="295" width="12" height="6" rx="2" fill="#ff1744"/>
  <text x="400" y="315" class="btn-text" style="font-size:9px;">ANALOG</text>

  <g id="svg-btn-12" class="ctrl-btn" data-btn="12"><path d="M 205,188 C 205,184 225,184 225,188 L 225,220 L 205,220 Z" class="btn-shape ctrl-stroke"/></g>
  <g id="svg-btn-13" class="ctrl-btn" data-btn="13"><path d="M 205,302 C 205,306 225,306 225,302 L 225,270 L 205,270 Z" class="btn-shape ctrl-stroke"/></g>
  <g id="svg-btn-14" class="ctrl-btn" data-btn="14"><path d="M 158,235 C 154,235 154,255 158,255 L 190,255 L 190,235 Z" class="btn-shape ctrl-stroke"/></g>
  <g id="svg-btn-15" class="ctrl-btn" data-btn="15"><path d="M 272,235 C 276,235 276,255 272,255 L 240,255 L 240,235 Z" class="btn-shape ctrl-stroke"/></g>

  <g id="svg-btn-3" class="ctrl-btn" data-btn="3"><circle cx="585" cy="195" r="18" class="btn-shape ctrl-stroke"/><polygon points="585,186 594,202 576,202" class="btn-symbol" style="stroke:#39d98a;"/></g>
  <g id="svg-btn-1" class="ctrl-btn" data-btn="1"><circle cx="640" cy="245" r="18" class="btn-shape ctrl-stroke"/><circle cx="640" cy="245" r="8" class="btn-symbol" style="stroke:#ff4d6d;"/></g>
  <g id="svg-btn-0" class="ctrl-btn" data-btn="0"><circle cx="585" cy="295" r="18" class="btn-shape ctrl-stroke"/><line x1="578" y1="288" x2="592" y2="302" class="btn-symbol" style="stroke:#6c63ff;"/><line x1="592" y1="288" x2="578" y2="302" class="btn-symbol" style="stroke:#6c63ff;"/></g>
  <g id="svg-btn-2" class="ctrl-btn" data-btn="2"><circle cx="530" cy="245" r="18" class="btn-shape ctrl-stroke"/><rect x="523" y="238" width="14" height="14" rx="2" class="btn-symbol" style="stroke:#ff70a6;"/></g>

  <g id="svg-stick-l" class="stick-cap ctrl-btn" data-btn="10" style="transform-origin: 320px 365px;"><circle cx="320" cy="365" r="44" fill="#1b1b1e" class="ctrl-stroke"/><circle cx="320" cy="365" r="32" fill="#242428" class="ctrl-stroke"/><circle cx="320" cy="365" r="18" fill="#111113"/></g>
  <g id="svg-stick-r" class="stick-cap ctrl-btn" data-btn="11" style="transform-origin: 480px 365px;"><circle cx="480" cy="365" r="44" fill="#1b1b1e" class="ctrl-stroke"/><circle cx="480" cy="365" r="32" fill="#242428" class="ctrl-stroke"/><circle cx="480" cy="365" r="18" fill="#111113"/></g>
</svg>
`,

  // ───────────────────────────────────────────────────────────
  // Xbox Series S / Series X (Asymmetrical layout)
  // ───────────────────────────────────────────────────────────
  'xbox-series-s': `
<svg id="controller-svg" viewBox="0 0 800 560" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="xb-white-body" cx="50%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#f5f6f8"/>
      <stop offset="70%" stop-color="#d8dae0"/>
      <stop offset="100%" stop-color="#bcc0c8"/>
    </radialGradient>
    <radialGradient id="xb-stick-cap" cx="45%" cy="45%" r="50%">
      <stop offset="0%" stop-color="#3d3d42"/>
      <stop offset="75%" stop-color="#242428"/>
      <stop offset="100%" stop-color="#141416"/>
    </radialGradient>
  </defs>
  <style>
    .ctrl-stroke { stroke: #151518; stroke-width: 3.5; stroke-linecap: round; stroke-linejoin: round; }
    .btn-shape { fill: #e2e4e9; transition: fill 0.05s; }
    .btn-shape-dark { fill: #28282c; transition: fill 0.05s; }
    .btn-text { font-family: system-ui, sans-serif; font-size: 13px; font-weight: 900; text-anchor: middle; user-select: none; pointer-events: none; }
    .stick-cap { cursor: pointer; transition: transform 0.04s ease-out; }
  </style>

  <g id="svg-btn-6" class="ctrl-btn" data-btn="6"><path d="M 190,110 C 185,55 225,35 260,35 C 280,35 288,55 282,110 Z" class="btn-shape-dark ctrl-stroke"/><text x="236" y="80" class="btn-text" style="fill:#aaa;">LT</text></g>
  <g id="svg-btn-7" class="ctrl-btn" data-btn="7"><path d="M 610,110 C 615,55 575,35 540,35 C 520,35 512,55 518,110 Z" class="btn-shape-dark ctrl-stroke"/><text x="564" y="80" class="btn-text" style="fill:#aaa;">RT</text></g>
  <g id="svg-btn-4" class="ctrl-btn" data-btn="4"><path d="M 175,135 C 170,110 205,90 270,90 C 295,90 305,108 300,135 Z" class="btn-shape-dark ctrl-stroke"/><text x="240" y="118" class="btn-text" style="fill:#aaa;">LB</text></g>
  <g id="svg-btn-5" class="ctrl-btn" data-btn="5"><path d="M 625,135 C 630,110 595,90 530,90 C 505,90 495,108 500,135 Z" class="btn-shape-dark ctrl-stroke"/><text x="560" y="118" class="btn-text" style="fill:#aaa;">RB</text></g>

  <path d="M 300,128 C 340,124 460,124 500,128 C 550,130 625,145 665,185 C 705,225 745,335 750,425 C 754,475 715,505 670,495 C 630,485 595,430 560,375 C 525,325 475,325 400,325 C 325,325 275,325 240,375 C 205,430 170,485 130,495 C 85,505 46,475 50,425 C 55,335 95,225 135,185 C 175,145 250,130 300,128 Z"
        fill="url(#xb-white-body)" class="ctrl-stroke"/>

  <g id="svg-btn-16" class="ctrl-btn" data-btn="16">
    <circle cx="400" cy="180" r="24" fill="#222" class="ctrl-stroke"/>
    <path d="M 388,170 C 394,178 397,188 390,196 M 412,170 C 406,178 403,188 410,196 M 392,168 C 398,172 402,172 408,168" stroke="#f0f0f0" stroke-width="3" fill="none" stroke-linecap="round"/>
  </g>

  <g id="svg-btn-8" class="ctrl-btn" data-btn="8"><circle cx="340" cy="245" r="14" class="btn-shape ctrl-stroke"/><rect x="334" y="240" width="10" height="7" fill="none" stroke="#666" stroke-width="1.5"/><rect x="337" y="243" width="10" height="7" fill="none" stroke="#666" stroke-width="1.5"/></g>
  <g id="svg-btn-9" class="ctrl-btn" data-btn="9"><circle cx="460" cy="245" r="14" class="btn-shape ctrl-stroke"/><line x1="454" y1="240" x2="466" y2="240" stroke="#666" stroke-width="2"/><line x1="454" y1="245" x2="466" y2="245" stroke="#666" stroke-width="2"/><line x1="454" y1="250" x2="466" y2="250" stroke="#666" stroke-width="2"/></g>
  <g id="svg-btn-17" class="ctrl-btn" data-btn="17"><rect x="390" y="260" width="20" height="14" rx="4" class="btn-shape ctrl-stroke"/><polygon points="400,263 405,268 395,268" fill="#666"/></g>

  <!-- Left Stick (UPPER-LEFT for Xbox) -->
  <g id="svg-stick-l-well"><circle cx="230" cy="235" r="54" fill="#25252a" class="ctrl-stroke"/></g>
  <g id="svg-stick-l" class="stick-cap ctrl-btn" data-btn="10" style="transform-origin: 230px 235px;">
    <circle cx="230" cy="235" r="42" fill="url(#xb-stick-cap)" class="ctrl-stroke"/>
    <circle cx="230" cy="235" r="30" fill="none" stroke="#333" stroke-width="2"/>
    <circle cx="230" cy="235" r="20" fill="#18181b"/>
  </g>

  <!-- D-Pad (LOWER-LEFT for Xbox) -->
  <circle cx="315" cy="360" r="52" fill="#222226" class="ctrl-stroke"/>
  <g id="svg-btn-12" class="ctrl-btn" data-btn="12"><polygon points="305,315 325,315 325,345 305,345" class="btn-shape-dark ctrl-stroke"/></g>
  <g id="svg-btn-13" class="ctrl-btn" data-btn="13"><polygon points="305,405 325,405 325,375 305,375" class="btn-shape-dark ctrl-stroke"/></g>
  <g id="svg-btn-14" class="ctrl-btn" data-btn="14"><polygon points="270,350 270,370 300,370 300,350" class="btn-shape-dark ctrl-stroke"/></g>
  <g id="svg-btn-15" class="ctrl-btn" data-btn="15"><polygon points="360,350 360,370 330,370 330,350" class="btn-shape-dark ctrl-stroke"/></g>
  <circle cx="315" cy="360" r="14" fill="#28282e"/>

  <!-- ABXY (Top-Right) -->
  <g id="svg-btn-3" class="ctrl-btn" data-btn="3"><circle cx="585" cy="180" r="20" class="btn-shape ctrl-stroke"/><text x="585" y="185" class="btn-text" style="fill:#ffcc00;">Y</text></g>
  <g id="svg-btn-1" class="ctrl-btn" data-btn="1"><circle cx="640" cy="235" r="20" class="btn-shape ctrl-stroke"/><text x="640" y="240" class="btn-text" style="fill:#ff3b5c;">B</text></g>
  <g id="svg-btn-0" class="ctrl-btn" data-btn="0"><circle cx="585" cy="290" r="20" class="btn-shape ctrl-stroke"/><text x="585" y="295" class="btn-text" style="fill:#39d98a;">A</text></g>
  <g id="svg-btn-2" class="ctrl-btn" data-btn="2"><circle cx="530" cy="235" r="20" class="btn-shape ctrl-stroke"/><text x="530" y="240" class="btn-text" style="fill:#3a86ff;">X</text></g>

  <!-- Right Stick (LOWER-RIGHT for Xbox) -->
  <g id="svg-stick-r-well"><circle cx="490" cy="345" r="54" fill="#25252a" class="ctrl-stroke"/></g>
  <g id="svg-stick-r" class="stick-cap ctrl-btn" data-btn="11" style="transform-origin: 490px 345px;">
    <circle cx="490" cy="345" r="42" fill="url(#xb-stick-cap)" class="ctrl-stroke"/>
    <circle cx="490" cy="345" r="30" fill="none" stroke="#333" stroke-width="2"/>
    <circle cx="490" cy="345" r="20" fill="#18181b"/>
  </g>
</svg>
`,

  // ───────────────────────────────────────────────────────────
  // Xbox One (Classic Black)
  // ───────────────────────────────────────────────────────────
  'xbox-one': `
<svg id="controller-svg" viewBox="0 0 800 560" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="xb-black-body" cx="50%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#3c3c40"/>
      <stop offset="70%" stop-color="#242428"/>
      <stop offset="100%" stop-color="#141416"/>
    </radialGradient>
    <radialGradient id="xb-black-stick" cx="45%" cy="45%" r="50%">
      <stop offset="0%" stop-color="#2d2d30"/>
      <stop offset="75%" stop-color="#18181a"/>
      <stop offset="100%" stop-color="#0a0a0c"/>
    </radialGradient>
  </defs>
  <style>
    .ctrl-stroke { stroke: #0a0a0c; stroke-width: 3.5; stroke-linecap: round; stroke-linejoin: round; }
    .btn-shape { fill: #222226; transition: fill 0.05s; }
    .btn-text { font-family: system-ui, sans-serif; font-size: 13px; font-weight: 900; text-anchor: middle; user-select: none; pointer-events: none; }
    .stick-cap { cursor: pointer; transition: transform 0.04s ease-out; }
  </style>

  <g id="svg-btn-6" class="ctrl-btn" data-btn="6"><path d="M 190,110 C 185,55 225,35 260,35 C 280,35 288,55 282,110 Z" class="btn-shape ctrl-stroke"/><text x="236" y="80" class="btn-text" style="fill:#888;">LT</text></g>
  <g id="svg-btn-7" class="ctrl-btn" data-btn="7"><path d="M 610,110 C 615,55 575,35 540,35 C 520,35 512,55 518,110 Z" class="btn-shape ctrl-stroke"/><text x="564" y="80" class="btn-text" style="fill:#888;">RT</text></g>
  <g id="svg-btn-4" class="ctrl-btn" data-btn="4"><path d="M 175,135 C 170,110 205,90 270,90 C 295,90 305,108 300,135 Z" class="btn-shape ctrl-stroke"/><text x="240" y="118" class="btn-text" style="fill:#888;">LB</text></g>
  <g id="svg-btn-5" class="ctrl-btn" data-btn="5"><path d="M 625,135 C 630,110 595,90 530,90 C 505,90 495,108 500,135 Z" class="btn-shape ctrl-stroke"/><text x="560" y="118" class="btn-text" style="fill:#888;">RB</text></g>

  <path d="M 300,128 C 340,124 460,124 500,128 C 550,130 625,145 665,185 C 705,225 745,335 750,425 C 754,475 715,505 670,495 C 630,485 595,430 560,375 C 525,325 475,325 400,325 C 325,325 275,325 240,375 C 205,430 170,485 130,495 C 85,505 46,475 50,425 C 55,335 95,225 135,185 C 175,145 250,130 300,128 Z"
        fill="url(#xb-black-body)" class="ctrl-stroke"/>

  <g id="svg-btn-16" class="ctrl-btn" data-btn="16">
    <circle cx="400" cy="180" r="24" fill="#141416" class="ctrl-stroke"/>
    <path d="M 388,170 C 394,178 397,188 390,196 M 412,170 C 406,178 403,188 410,196 M 392,168 C 398,172 402,172 408,168" stroke="#f0f0f0" stroke-width="3" fill="none" stroke-linecap="round"/>
  </g>

  <g id="svg-btn-8" class="ctrl-btn" data-btn="8"><circle cx="340" cy="245" r="14" class="btn-shape ctrl-stroke"/><rect x="334" y="240" width="10" height="7" fill="none" stroke="#888" stroke-width="1.5"/><rect x="337" y="243" width="10" height="7" fill="none" stroke="#888" stroke-width="1.5"/></g>
  <g id="svg-btn-9" class="ctrl-btn" data-btn="9"><circle cx="460" cy="245" r="14" class="btn-shape ctrl-stroke"/><line x1="454" y1="240" x2="466" y2="240" stroke="#888" stroke-width="2"/><line x1="454" y1="245" x2="466" y2="245" stroke="#888" stroke-width="2"/><line x1="454" y1="250" x2="466" y2="250" stroke="#888" stroke-width="2"/></g>

  <!-- Left Stick -->
  <g id="svg-stick-l-well"><circle cx="230" cy="235" r="54" fill="#141416" class="ctrl-stroke"/></g>
  <g id="svg-stick-l" class="stick-cap ctrl-btn" data-btn="10" style="transform-origin: 230px 235px;">
    <circle cx="230" cy="235" r="42" fill="url(#xb-black-stick)" class="ctrl-stroke"/>
    <circle cx="230" cy="235" r="30" fill="none" stroke="#222" stroke-width="2"/>
    <circle cx="230" cy="235" r="20" fill="#0d0d0f"/>
  </g>

  <!-- D-Pad -->
  <g id="svg-btn-12" class="ctrl-btn" data-btn="12"><path d="M 305,315 C 305,310 325,310 325,315 L 325,348 L 305,348 Z" class="btn-shape ctrl-stroke"/></g>
  <g id="svg-btn-13" class="ctrl-btn" data-btn="13"><path d="M 305,405 C 305,410 325,410 325,405 L 325,372 L 305,372 Z" class="btn-shape ctrl-stroke"/></g>
  <g id="svg-btn-14" class="ctrl-btn" data-btn="14"><path d="M 270,350 C 265,350 265,370 270,370 L 303,370 L 303,350 Z" class="btn-shape ctrl-stroke"/></g>
  <g id="svg-btn-15" class="ctrl-btn" data-btn="15"><path d="M 360,350 C 365,350 365,370 360,370 L 327,370 L 327,350 Z" class="btn-shape ctrl-stroke"/></g>
  <rect x="303" y="348" width="24" height="24" fill="#222226"/>

  <!-- ABXY -->
  <g id="svg-btn-3" class="ctrl-btn" data-btn="3"><circle cx="585" cy="180" r="20" class="btn-shape ctrl-stroke"/><text x="585" y="185" class="btn-text" style="fill:#ffcc00;">Y</text></g>
  <g id="svg-btn-1" class="ctrl-btn" data-btn="1"><circle cx="640" cy="235" r="20" class="btn-shape ctrl-stroke"/><text x="640" y="240" class="btn-text" style="fill:#ff3b5c;">B</text></g>
  <g id="svg-btn-0" class="ctrl-btn" data-btn="0"><circle cx="585" cy="290" r="20" class="btn-shape ctrl-stroke"/><text x="585" y="295" class="btn-text" style="fill:#39d98a;">A</text></g>
  <g id="svg-btn-2" class="ctrl-btn" data-btn="2"><circle cx="530" cy="235" r="20" class="btn-shape ctrl-stroke"/><text x="530" y="240" class="btn-text" style="fill:#3a86ff;">X</text></g>

  <!-- Right Stick -->
  <g id="svg-stick-r-well"><circle cx="490" cy="345" r="54" fill="#141416" class="ctrl-stroke"/></g>
  <g id="svg-stick-r" class="stick-cap ctrl-btn" data-btn="11" style="transform-origin: 490px 345px;">
    <circle cx="490" cy="345" r="42" fill="url(#xb-black-stick)" class="ctrl-stroke"/>
    <circle cx="490" cy="345" r="30" fill="none" stroke="#222" stroke-width="2"/>
    <circle cx="490" cy="345" r="20" fill="#0d0d0f"/>
  </g>
</svg>
`,

  // ───────────────────────────────────────────────────────────
  // Generic
  // ───────────────────────────────────────────────────────────
  'generic': `
<svg id="controller-svg" viewBox="0 0 800 560" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="gen-body" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#3e3e46"/>
      <stop offset="100%" stop-color="#202026"/>
    </radialGradient>
  </defs>
  <style>
    .ctrl-stroke { stroke: #121215; stroke-width: 3.5; stroke-linecap: round; stroke-linejoin: round; }
    .btn-shape { fill: #2c2c32; transition: fill 0.05s; }
    .btn-text { font-family: system-ui, sans-serif; font-size: 12px; font-weight: 700; text-anchor: middle; user-select: none; pointer-events: none; fill:#aaa; }
    .stick-cap { cursor: pointer; transition: transform 0.04s ease-out; }
  </style>

  <g id="svg-btn-6" class="ctrl-btn" data-btn="6"><path d="M 220,130 C 215,80 245,60 270,58 C 290,57 298,75 294,130 Z" class="btn-shape ctrl-stroke"/><text x="255" y="95" class="btn-text">L2</text></g>
  <g id="svg-btn-7" class="ctrl-btn" data-btn="7"><path d="M 580,130 C 585,80 555,60 530,58 C 510,57 502,75 506,130 Z" class="btn-shape ctrl-stroke"/><text x="545" y="95" class="btn-text">R2</text></g>
  <g id="svg-btn-4" class="ctrl-btn" data-btn="4"><path d="M 210,150 C 205,128 230,110 275,112 C 295,113 302,125 300,150 Z" class="btn-shape ctrl-stroke"/><text x="255" y="135" class="btn-text">L1</text></g>
  <g id="svg-btn-5" class="ctrl-btn" data-btn="5"><path d="M 590,150 C 595,128 570,110 525,112 C 505,113 498,125 500,150 Z" class="btn-shape ctrl-stroke"/><text x="545" y="135" class="btn-text">R1</text></g>

  <path d="M 280,150 C 330,145 470,145 520,150 C 560,150 620,165 650,200 C 690,240 730,330 740,420 C 746,460 720,490 680,490 C 645,490 615,445 585,395 C 555,345 520,340 480,345 C 440,350 360,350 320,345 C 280,340 245,345 215,395 C 185,445 155,490 120,490 C 80,490 54,460 60,420 C 70,330 110,240 150,200 C 180,165 240,150 280,150 Z"
        fill="url(#gen-body)" class="ctrl-stroke"/>

  <g id="svg-btn-8" class="ctrl-btn" data-btn="8"><rect x="330" y="240" width="28" height="16" rx="4" class="btn-shape ctrl-stroke"/><text x="344" y="232" class="btn-text" style="font-size:9px;">SELECT</text></g>
  <g id="svg-btn-9" class="ctrl-btn" data-btn="9"><rect x="442" y="240" width="28" height="16" rx="4" class="btn-shape ctrl-stroke"/><text x="456" y="232" class="btn-text" style="font-size:9px;">START</text></g>
  <g id="svg-btn-16" class="ctrl-btn" data-btn="16"><circle cx="400" cy="275" r="18" class="btn-shape ctrl-stroke"/><text x="400" y="280" class="btn-text" style="font-size:11px;">HOME</text></g>

  <g id="svg-btn-12" class="ctrl-btn" data-btn="12"><path d="M 205,188 C 205,184 225,184 225,188 L 225,220 L 205,220 Z" class="btn-shape ctrl-stroke"/></g>
  <g id="svg-btn-13" class="ctrl-btn" data-btn="13"><path d="M 205,302 C 205,306 225,306 225,302 L 225,270 L 205,270 Z" class="btn-shape ctrl-stroke"/></g>
  <g id="svg-btn-14" class="ctrl-btn" data-btn="14"><path d="M 158,235 C 154,235 154,255 158,255 L 190,255 L 190,235 Z" class="btn-shape ctrl-stroke"/></g>
  <g id="svg-btn-15" class="ctrl-btn" data-btn="15"><path d="M 272,235 C 276,235 276,255 272,255 L 240,255 L 240,235 Z" class="btn-shape ctrl-stroke"/></g>

  <g id="svg-btn-3" class="ctrl-btn" data-btn="3"><circle cx="585" cy="195" r="18" class="btn-shape ctrl-stroke"/><text x="585" y="200" class="btn-text">3 / Y</text></g>
  <g id="svg-btn-1" class="ctrl-btn" data-btn="1"><circle cx="640" cy="245" r="18" class="btn-shape ctrl-stroke"/><text x="640" y="250" class="btn-text">1 / B</text></g>
  <g id="svg-btn-0" class="ctrl-btn" data-btn="0"><circle cx="585" cy="295" r="18" class="btn-shape ctrl-stroke"/><text x="585" y="300" class="btn-text">0 / A</text></g>
  <g id="svg-btn-2" class="ctrl-btn" data-btn="2"><circle cx="530" cy="245" r="18" class="btn-shape ctrl-stroke"/><text x="530" y="250" class="btn-text">2 / X</text></g>

  <g id="svg-stick-l" class="stick-cap ctrl-btn" data-btn="10" style="transform-origin: 320px 365px;"><circle cx="320" cy="365" r="44" fill="#202024" class="ctrl-stroke"/><circle cx="320" cy="365" r="32" fill="#2c2c32" class="ctrl-stroke"/><circle cx="320" cy="365" r="18" fill="#18181a"/></g>
  <g id="svg-stick-r" class="stick-cap ctrl-btn" data-btn="11" style="transform-origin: 480px 365px;"><circle cx="480" cy="365" r="44" fill="#202024" class="ctrl-stroke"/><circle cx="480" cy="365" r="32" fill="#2c2c32" class="ctrl-stroke"/><circle cx="480" cy="365" r="18" fill="#18181a"/></g>
</svg>
`
};
