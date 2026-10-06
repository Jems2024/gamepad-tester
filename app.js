/* ============================================================
   GAMEPAD TESTER — app.js (Professional Diagnostic Station)
   - Streamlined Diagnostic UX for High-Volume Controller Testing
   - Pixel-accurate Scalable Interactive Overlay Map (CONTROLLER_PROFILES)
   - Live Multi-State Control Feedback (Inactive, Pressed, Validated Green, Stuck Red)
   - 5-Step Guided Progression Bar + Dynamic Single-Line Instruction Banner
   - Minimal Floating Language Selector with Flag Emojis (ES, EN, IT, FR, DE)
   - Instant Quality Certification Verdict (APTO / REVISIÓN / DEFECTUOSO)
   - Zero-Refresh Robust Gamepad API Lifecycle & Hot-Swapping
   - High-Precision Cartesian Stick Benchmarking (Drift, Jitter, Circularity, Snapback)
   - Analog Trigger Pressure Diagnostics (L2 / R2)
   - Diagnostic History Persistence & Official A4 Printable Quality Report
   ============================================================ */

'use strict';

// ─────────────────────────────────────────────────────────────
// 1. MULTILINGUAL DICTIONARY (i18n)
// ─────────────────────────────────────────────────────────────
const TRANSLATIONS = {
  es: {
    appTitle: "Gamepad Tester Pro",
    waitingGamepad: "Esperando mando…",
    emptyStateConnectMsg: "Conecta tu mando y pulsa cualquier botón",
    connectedMsg: "Mando conectado",
    itemCodeLabel: "Nº Art:",
    activeCtrlLabel: "Mando Activo:",
    none: "Ninguno",
    noConnectedGamepads: "Sin mandos conectados",
    modelAuto: "🔍 Auto",
    btnSaveDiag: "Guardar",
    btnPrintReport: "Imprimir",
    btnHistory: "Historial",
    btnDetails: "Detalles",
    stepButtons: "Botones",
    stepTriggers: "Gatillos",
    stepStickL: "Stick Izq.",
    stepStickR: "Stick Der.",
    stepCert: "Certificación",
    lblOverallVerdict: "CERTIFICACIÓN TÉCNICA:",
    chipConnected: "Conectado",
    stickTestTitle: "Sticks Analógicos — Análisis Cartesiano",
    btnZoomCenter: "🔍 Micro-Centro",
    btnFullSuite: "⚡ Suite Sticks",
    btnDriftTest: "▶ Reposo (3s)",
    btnClearTrace: "🔄 Limpiar",
    stickLeftLabel: "STICK IZQUIERDO",
    stickRightLabel: "STICK DERECHO",
    metricOffset: "Desvío:",
    metricCircularity: "Circ:",
    triggersTestTitle: "Gatillos Analógicos (L2 / R2)",
    triggersPending: "Pendiente",
    lblLive: "Actual:",
    lblMax: "Máx:",
    buttonsTestTitle: "Matriz de Botones",
    btnResetValidation: "🔄",
    rawDiagTitle: "Detalles Técnicos (Hardware / Raw)",
    rawAxesTitle: "Ejes Crudos (Axes 0..N):",
    rawButtonsTitle: "Botones Crudos (Buttons 0..N):",
    historyModalTitle: "Historial de Revisiones Guardadas",
    btnExportJson: "💾 Exportar JSON",
    btnClearHistory: "🗑 Vaciar",
    historyFilterPlaceholder: "Filtrar por Nº Artículo o Mando...",
    thCode: "Nº Art.",
    thDate: "Fecha / Hora",
    thDevice: "Mando",
    thStickL: "Stick L",
    thStickR: "Stick R",
    thTriggers: "Gatillos",
    thButtons: "Botones",
    thResult: "Resultado",
    thActions: "Acción",
    verdictPass: "APTO (PASS)",
    verdictReview: "REVISIÓN",
    verdictFail: "DEFECTUOSO",
    verdictPending: "PENDIENTE",
    verdictTesting: "EN PRUEBA",
    suiteStepRest: "PASO 1/3: No toques los sticks. Midiendo reposo y jitter (3s)...",
    suiteStepCirc: "PASO 2/3: Gira ambos sticks lentamente en círculos completos de 360°...",
    suiteStepSnap: "PASO 3/3: Mueve el stick al extremo y suéltalo de golpe...",
    suiteDone: "✓ Diagnóstico de sticks completado.",
    savedSuccess: "✓ Diagnóstico guardado para el artículo:",
    instructionStep1: "Paso 1: Pulsa todos los botones en el mando hasta verlos en verde.",
    instructionStep2: "Paso 2: Presiona a fondo ambos gatillos analógicos (L2 y R2).",
    instructionStep3: "Paso 3: Gira el Stick Izquierdo en círculos completos de 360°.",
    instructionStep4: "Paso 4: Gira el Stick Derecho en círculos completos de 360°.",
    instructionStep5: "Paso 5: Revisión completada. Pulsa Guardar o Imprimir informe.",
  },
  en: {
    appTitle: "Gamepad Tester Pro",
    waitingGamepad: "Waiting for controller…",
    emptyStateConnectMsg: "Connect your controller and press any button",
    connectedMsg: "Controller connected",
    itemCodeLabel: "Item #:",
    activeCtrlLabel: "Active Controller:",
    none: "None",
    noConnectedGamepads: "No connected controllers",
    modelAuto: "🔍 Auto",
    btnSaveDiag: "Save",
    btnPrintReport: "Print",
    btnHistory: "History",
    btnDetails: "Details",
    stepButtons: "Buttons",
    stepTriggers: "Triggers",
    stepStickL: "Stick L",
    stepStickR: "Stick R",
    stepCert: "Certification",
    lblOverallVerdict: "TECHNICAL CERTIFICATION:",
    chipConnected: "Connected",
    stickTestTitle: "Analog Sticks — Cartesian Analysis",
    btnZoomCenter: "🔍 Micro-Center",
    btnFullSuite: "⚡ Sticks Suite",
    btnDriftTest: "▶ Rest Test (3s)",
    btnClearTrace: "🔄 Clear",
    stickLeftLabel: "LEFT STICK",
    stickRightLabel: "RIGHT STICK",
    metricOffset: "Offset:",
    metricCircularity: "Circ:",
    triggersTestTitle: "Analog Triggers (L2 / R2)",
    triggersPending: "Pending",
    lblLive: "Live:",
    lblMax: "Max:",
    buttonsTestTitle: "Buttons Matrix",
    btnResetValidation: "🔄",
    rawDiagTitle: "Technical Details (Hardware / Raw)",
    rawAxesTitle: "Raw Axes (Axes 0..N):",
    rawButtonsTitle: "Raw Buttons (Buttons 0..N):",
    historyModalTitle: "Saved Diagnostic Records",
    btnExportJson: "💾 Export JSON",
    btnClearHistory: "🗑 Clear All",
    historyFilterPlaceholder: "Filter by Item Code or Controller...",
    thCode: "Item #",
    thDate: "Date / Time",
    thDevice: "Controller",
    thStickL: "Stick L",
    thStickR: "Stick R",
    thTriggers: "Triggers",
    thButtons: "Buttons",
    thResult: "Result",
    thActions: "Action",
    verdictPass: "PASS",
    verdictReview: "REVIEW",
    verdictFail: "DEFECTIVE",
    verdictPending: "PENDING",
    verdictTesting: "TESTING",
    suiteStepRest: "STEP 1/3: Do not touch sticks. Measuring rest drift and jitter (3s)...",
    suiteStepCirc: "STEP 2/3: Slowly rotate both sticks in full 360° edge circles...",
    suiteStepSnap: "STEP 3/3: Push stick to extreme edge and release abruptly...",
    suiteDone: "✓ Sticks diagnostics completed.",
    savedSuccess: "✓ Diagnostic record saved for item:",
    instructionStep1: "Step 1: Press all physical buttons until they turn green.",
    instructionStep2: "Step 2: Fully pull both analog triggers (L2 and R2).",
    instructionStep3: "Step 3: Rotate Left Stick in full 360° edge circles.",
    instructionStep4: "Step 4: Rotate Right Stick in full 360° edge circles.",
    instructionStep5: "Step 5: Inspection complete. Click Save or Print report.",
  },
  it: {
    appTitle: "Gamepad Tester Pro",
    waitingGamepad: "In attesa del controller…",
    emptyStateConnectMsg: "Collega il controller e premi qualsiasi tasto",
    connectedMsg: "Controller connesso",
    itemCodeLabel: "Cod. Art:",
    activeCtrlLabel: "Controller Attivo:",
    none: "Nessuno",
    noConnectedGamepads: "Nessun controller connesso",
    modelAuto: "🔍 Auto",
    btnSaveDiag: "Salva",
    btnPrintReport: "Stampa",
    btnHistory: "Cronologia",
    btnDetails: "Dettagli",
    stepButtons: "Pulsanti",
    stepTriggers: "Grilletti",
    stepStickL: "Stick Sin.",
    stepStickR: "Stick Des.",
    stepCert: "Certificazione",
    lblOverallVerdict: "CERTIFICAZIONE TECNICA:",
    chipConnected: "Collegato",
    stickTestTitle: "Stick Analogici — Analisi Cartesiana",
    btnZoomCenter: "🔍 Micro-Centro",
    btnFullSuite: "⚡ Suite Stick",
    btnDriftTest: "▶ Riposo (3s)",
    btnClearTrace: "🔄 Reimposta",
    stickLeftLabel: "STICK SINISTRO",
    stickRightLabel: "STICK DESTRO",
    metricOffset: "Deriva:",
    metricCircularity: "Circ:",
    triggersTestTitle: "Grilletti Analogici (L2 / R2)",
    triggersPending: "In sospeso",
    lblLive: "Attuale:",
    lblMax: "Max:",
    buttonsTestTitle: "Matrice di Pulsanti",
    btnResetValidation: "🔄",
    rawDiagTitle: "Dettagli Tecnici (Hardware / Raw)",
    rawAxesTitle: "Assi Grezzi (Axes 0..N):",
    rawButtonsTitle: "Pulsanti Grezzi (Buttons 0..N):",
    historyModalTitle: "Cronologia Revisioni Salvate",
    btnExportJson: "💾 Esporta JSON",
    btnClearHistory: "🗑 Svuota",
    historyFilterPlaceholder: "Filtra per Codice Articolo o Controller...",
    thCode: "Cod. Art.",
    thDate: "Data / Ora",
    thDevice: "Controller",
    thStickL: "Stick L",
    thStickR: "Stick R",
    thTriggers: "Grilletti",
    thButtons: "Pulsanti",
    thResult: "Risultato",
    thActions: "Azione",
    verdictPass: "CONFORME",
    verdictReview: "REVISIONE",
    verdictFail: "DIFETTOSO",
    verdictPending: "IN SOSPESO",
    suiteStepRest: "PASSO 1/3: Non toccare gli stick. Misurazione riposo e jitter (3s)...",
    suiteStepCirc: "PASSO 2/3: Ruota entrambi gli stick lentamente a 360°...",
    suiteStepSnap: "PASSO 3/3: Sposta lo stick al limite e rilascialo di colpo...",
    suiteDone: "✓ Diagnostica stick completata.",
    savedSuccess: "✓ Diagnostica salvata per l'articolo:",
    instructionStep1: "Passo 1: Premi tutti i pulsanti finché non diventano verdi.",
    instructionStep2: "Passo 2: Premi a fondo entrambi i grilletti (L2 e R2).",
    instructionStep3: "Passo 3: Ruota lo Stick Sinistro in cerchi completi a 360°.",
    instructionStep4: "Passo 4: Ruota lo Stick Destro in cerchi completi a 360°.",
    instructionStep5: "Passo 5: Revisione completata. Clicca Salva o Stampa rapporto.",
  },
  fr: {
    appTitle: "Gamepad Tester Pro",
    waitingGamepad: "En attente de la manette…",
    emptyStateConnectMsg: "Connectez votre manette et appuyez sur un bouton",
    connectedMsg: "Manette connectée",
    itemCodeLabel: "Code Art:",
    activeCtrlLabel: "Manette Active:",
    none: "Aucun",
    noConnectedGamepads: "Aucune manette connectée",
    modelAuto: "🔍 Auto",
    btnSaveDiag: "Sauvegarder",
    btnPrintReport: "Imprimer",
    btnHistory: "Historique",
    btnDetails: "Détails",
    stepButtons: "Boutons",
    stepTriggers: "Gâchettes",
    stepStickL: "Stick G",
    stepStickR: "Stick D",
    stepCert: "Certification",
    lblOverallVerdict: "CERTIFICATION TECHNIQUE :",
    chipConnected: "Connecté",
    stickTestTitle: "Sticks Analogiques — Analyse Cartésienne",
    btnZoomCenter: "🔍 Micro-Centre",
    btnFullSuite: "⚡ Suite Sticks",
    btnDriftTest: "▶ Test Repos (3s)",
    btnClearTrace: "🔄 Effacer",
    stickLeftLabel: "STICK GAUCHE",
    stickRightLabel: "STICK DROIT",
    metricOffset: "Déviation:",
    metricCircularity: "Circ:",
    triggersTestTitle: "Gâchettes Analogiques (L2 / R2)",
    triggersPending: "En attente",
    lblLive: "Actuel:",
    lblMax: "Max:",
    buttonsTestTitle: "Matrice des Boutons",
    btnResetValidation: "🔄",
    rawDiagTitle: "Détails Techniques (Hardware / Raw)",
    rawAxesTitle: "Axes Bruts (Axes 0..N):",
    rawButtonsTitle: "Boutons Bruts (Buttons 0..N):",
    historyModalTitle: "Historique des Diagnostics Enregistrés",
    btnExportJson: "💾 Exporter JSON",
    btnClearHistory: "🗑 Vider",
    historyFilterPlaceholder: "Filtrer par Code Article ou Manette...",
    thCode: "Code Art.",
    thDate: "Date / Heure",
    thDevice: "Manette",
    thStickL: "Stick G",
    thStickR: "Stick D",
    thTriggers: "Gâchettes",
    thButtons: "Boutons",
    thResult: "Résultat",
    thActions: "Action",
    verdictPass: "CONFORME",
    verdictReview: "RÉVISION",
    verdictFail: "DÉFECTUEUX",
    verdictPending: "EN ATTENTE",
    suiteStepRest: "ÉTAPE 1/3: Ne touchez pas aux sticks. Mesure repos et jitter (3s)...",
    suiteStepCirc: "ÉTAPE 2/3: Tournez lentement les deux sticks à 360° sur le bord...",
    suiteStepSnap: "ÉTAPE 3/3: Poussez le stick au bord et relâchez-le d'un coup...",
    suiteDone: "✓ Diagnostic des sticks terminé.",
    savedSuccess: "✓ Diagnostic enregistré pour l'article:",
    instructionStep1: "Étape 1: Appuyez sur tous les boutons jusqu'à ce qu'ils soient verts.",
    instructionStep2: "Étape 2: Pressez à fond les deux gâchettes (L2 et R2).",
    instructionStep3: "Étape 3: Tournez le Stick Gauche en cercles complets à 360°.",
    instructionStep4: "Étape 4: Tournez le Stick Droit en cercles complets à 360°.",
    instructionStep5: "Étape 5: Inspection terminée. Cliquez sur Sauvegarder ou Imprimer.",
  },
  de: {
    appTitle: "Gamepad Tester Pro",
    waitingGamepad: "Warte auf Controller…",
    emptyStateConnectMsg: "Schließe deinen Controller an und drücke eine Taste",
    connectedMsg: "Controller verbunden",
    itemCodeLabel: "Art.-Nr:",
    activeCtrlLabel: "Aktiver Controller:",
    none: "Keiner",
    noConnectedGamepads: "Keine Controller verbunden",
    modelAuto: "🔍 Auto",
    btnSaveDiag: "Speichern",
    btnPrintReport: "Drucken",
    btnHistory: "Verlauf",
    btnDetails: "Details",
    stepButtons: "Tasten",
    stepTriggers: "Trigger",
    stepStickL: "Stick L",
    stepStickR: "Stick R",
    stepCert: "Zertifizierung",
    lblOverallVerdict: "TECHNISCHE ZERTIFIZIERUNG:",
    chipConnected: "Verbunden",
    stickTestTitle: "Analogsticks — Kartesische Analyse",
    btnZoomCenter: "🔍 Mikro-Zentrum",
    btnFullSuite: "⚡ Stick-Suite",
    btnDriftTest: "▶ Ruhe-Test (3s)",
    btnClearTrace: "🔄 Löschen",
    stickLeftLabel: "LINKER STICK",
    stickRightLabel: "RECHTER STICK",
    metricOffset: "Abweichung:",
    metricCircularity: "Rundheit:",
    triggersTestTitle: "Analoge Trigger (L2 / R2)",
    triggersPending: "Ausstehend",
    lblLive: "Aktuell:",
    lblMax: "Max:",
    buttonsTestTitle: "Tastenmatrix",
    btnResetValidation: "🔄",
    rawDiagTitle: "Technische Details (Hardware / Raw)",
    rawAxesTitle: "Rohe Achsen (Axes 0..N):",
    rawButtonsTitle: "Rohe Tasten (Buttons 0..N):",
    historyModalTitle: "Gespeicherter Prüfungsverlauf",
    btnExportJson: "💾 JSON exportieren",
    btnClearHistory: "🗑 Leeren",
    historyFilterPlaceholder: "Nach Artikel-Nr. oder Controller filtern...",
    thCode: "Art.-Nr.",
    thDate: "Datum / Zeit",
    thDevice: "Controller",
    thStickL: "Stick L",
    thStickR: "Stick R",
    thTriggers: "Trigger",
    thButtons: "Tasten",
    thResult: "Ergebnis",
    thActions: "Aktion",
    verdictPass: "BESTANDEN",
    verdictReview: "PRÜFUNG",
    verdictFail: "DEFEKT",
    verdictPending: "AUSSTEHEND",
    suiteStepRest: "SCHRITT 1/3: Sticks nicht berühren. Messung Ruhe und Jitter (3s)...",
    suiteStepCirc: "SCHRITT 2/3: Beide Sticks langsam in vollständigen 360°-Kreisen drehen...",
    suiteStepSnap: "SCHRITT 3/3: Stick an den Rand drücken und schlagartig loslassen...",
    suiteDone: "✓ Stick-Diagnose abgeschlossen.",
    savedSuccess: "✓ Prüfbericht gespeichert für Artikel:",
    instructionStep1: "Schritt 1: Alle Tasten drücken, bis sie grün aufleuchten.",
    instructionStep2: "Schritt 2: Beide analogen Trigger voll durchdrücken (L2 und R2).",
    instructionStep3: "Schritt 3: Den linken Stick in vollen 360°-Kreisen drehen.",
    instructionStep4: "Schritt 4: Den rechten Stick in vollen 360°-Kreisen drehen.",
    instructionStep5: "Schritt 5: Prüfung abgeschlossen. Prüfbericht speichern oder drucken.",
  }
};

const LANG_FLAGS = {
  es: '🇪🇸',
  en: '🇬🇧',
  it: '🇮🇹',
  fr: '🇫🇷',
  de: '🇩🇪'
};

let currentLang = 'es';

function t(key) {
  const dict = TRANSLATIONS[currentLang] || TRANSLATIONS['es'];
  return dict[key] || TRANSLATIONS['es'][key] || key;
}

function setLanguage(lang) {
  if (!TRANSLATIONS[lang]) lang = 'es';
  currentLang = lang;
  try {
    localStorage.setItem('gamepad_tester_lang', lang);
  } catch (e) {}

  // Update floating trigger button flag
  const flag = LANG_FLAGS[lang] || '🇪🇸';
  if (dom.langTrigger) {
    dom.langTrigger.textContent = flag;
  }

  // Update DOM elements with data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });

  // Update placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    el.placeholder = t(key);
  });

  if (state.activeGpIndex === null && dom.statusText) {
    dom.statusText.textContent = t('waitingGamepad');
  }

  updateVerdictBadgesUI();
  updateWorkflowProgress();
  updateOverallVerdict();
}

function initLanguage() {
  let saved = 'es';
  try {
    saved = localStorage.getItem('gamepad_tester_lang');
  } catch (e) {}

  if (!saved) {
    const nav = (navigator.language || 'es').slice(0, 2).toLowerCase();
    if (TRANSLATIONS[nav]) saved = nav;
  }
  setLanguage(saved || 'es');
}

// ─────────────────────────────────────────────────────────────
// 2. CONFIGURATION & BENCHMARK THRESHOLDS
// ─────────────────────────────────────────────────────────────
const BENCHMARKS = {
  STICK: {
    // 1. Center / Drift thresholds (radial distance from 0,0)
    DRIFT_EXCELLENT:  0.045, // <= 4.5% radial offset = PASS
    DRIFT_ACCEPTABLE: 0.095, // <= 9.5% radial offset = REVIEW, > 9.5% = FAIL
    
    // 2. Resting noise / jitter (standard deviation during rest test)
    JITTER_MAX:       0.018, // <= 0.018 noise std dev = PASS, > 0.018 = REVIEW
    
    // 3. Angular Coverage (36 sectors = 10 deg each)
    COVERAGE_MIN_PASS:   90.0, // >= 90% angular coverage = PASS
    COVERAGE_MIN_REVIEW: 70.0, // >= 70% angular coverage = REVIEW, < 70% = FAIL
    
    // 4. True Circularity / Uniformity (Radial deviation & average outer radius)
    CIRCULARITY_AVG_MIN_PASS:   0.85, // Avg outer radius must reach at least 0.85
    CIRCULARITY_AVG_MIN_REVIEW: 0.72,
    CIRCULARITY_UNIFORM_MAX_ERR: 0.22, // Max deviation between sectors (uniformity)
    
    // 5. Directional Range (8 main compass sectors: N, NE, E, SE, S, SW, W, NW)
    RANGE_MIN_SECTOR_PASS:   0.80, // Every sector should reach at least 0.80
    RANGE_MIN_SECTOR_REVIEW: 0.65, // Below 0.65 is weak sector FAIL
    
    // 6. Return to Center / Snapback (duration & stabilization)
    SNAPBACK_PASS_MS:   180, // <= 180ms normal return = PASS
    SNAPBACK_REVIEW_MS: 320, // 181-320ms slightly slow return = REVIEW, > 320ms = FAIL
    SNAPBACK_CENTER_REST_MAX: 0.08, // Must stabilize within 0.08 radius
    
    // 7. Movement Smoothness (abnormal jumps during deliberate tracking)
    SMOOTHNESS_MAX_DELTA: 0.45, // Unusually huge delta between consecutive frames
  },
  TRIGGER: {
    REST_MAX: 0.03,         // Must be near 0 at rest
    MAX_MIN:  0.94,         // Must reach near 1.0 at full press
  },
  ACTIVITY_THRESHOLD_AXIS: 0.25,
  ACTIVITY_THRESHOLD_BTN:  0.35,
  ACTIVITY_DEBOUNCE_MS:    350,
};

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
      0: 'Cross (✕)',
      1: 'Circle (○)',
      2: 'Square (□)',
      3: 'Triangle (△)',
      4: 'L1',
      5: 'R1',
      6: 'L2',
      7: 'R2',
      8: model === 'ps5' ? 'Create' : model === 'ps4' ? 'Share' : 'Select',
      9: model === 'ps5' || model === 'ps4' ? 'Options' : 'Start',
      10: 'L3 (Stick Izq.)',
      11: 'R3 (Stick Der.)',
      12: 'D-Pad Arriba',
      13: 'D-Pad Abajo',
      14: 'D-Pad Izquierda',
      15: 'D-Pad Derecha',
      16: 'PS Button',
      17: 'Touchpad',
    };
    return psNames[index] || `Botón ${index}`;
  }

  if (isXbox) {
    const xbNames = {
      0: 'A Button',
      1: 'B Button',
      2: 'X Button',
      3: 'Y Button',
      4: 'LB (Bumper Izq.)',
      5: 'RB (Bumper Der.)',
      6: 'LT (Gatillo Izq.)',
      7: 'RT (Gatillo Der.)',
      8: 'View / Back',
      9: 'Menu / Start',
      10: 'L3 (Stick Izq.)',
      11: 'R3 (Stick Der.)',
      12: 'D-Pad Arriba',
      13: 'D-Pad Abajo',
      14: 'D-Pad Izquierda',
      15: 'D-Pad Derecha',
      16: 'Xbox Guía',
      17: 'Share Button',
    };
    return xbNames[index] || `Botón ${index}`;
  }

  return BTN_NAMES[index] || `Botón ${index}`;
}

function getControllerFriendlyName(model) {
  const names = {
    'ps5': 'PlayStation 5 (DualSense)',
    'ps4': 'PlayStation 4 (DualShock 4)',
    'ps3': 'PlayStation 3 (DualShock 3)',
    'ps2': 'PlayStation 2 (DualShock 2)',
    'xbox': 'Xbox (Series / One / 360)',
    'xbox-series-s': 'Xbox Series X|S',
    'xbox-one': 'Xbox One',
    'generic': 'Mando Genérico'
  };
  return names[model] || model.toUpperCase();
}

// ─────────────────────────────────────────────────────────────
// 3. HARDWARE DETECTION & NORMALIZATION
// ─────────────────────────────────────────────────────────────
function detectControllerModel(id = '', mapping = '') {
  const s = id.toLowerCase();

  // PS5
  if (s.includes('dualsense') || s.includes('0ce6') || s.includes('0df2')) return 'ps5';

  // PS4
  if (s.includes('dualshock 4') || s.includes('wireless controller') || s.includes('05c4') || s.includes('09cc')) return 'ps4';

  // PS3
  if (s.includes('ps3') || s.includes('playstation 3') || s.includes('dualshock 3') || s.includes('0268') || s.includes('054c:0268')) return 'ps3';

  // PS2 & PS2-to-USB Adapters:
  // PS2 controllers use USB adapters with hardware IDs or generic names:
  // - "Twin USB Joystick" / "Twin USB" (VID: 0810, PID: 0001)
  // - "DragonRise Inc. Generic USB" (VID: 0079)
  // - "GreenAsia Inc. USB" (VID: 0e8f)
  // - "Mayflash" (VID: 11ff / 0b43)
  // - "ShanWan" / "PS Creator" / "TigerGame" / "Vibration Joystick"
  // - Hardware IDs: 0810, 0079, 0e8f, 11ff, 2563, 0b43, 1345
  if (
    s.includes('ps2') ||
    s.includes('playstation 2') ||
    s.includes('dualshock 2') ||
    s.includes('ps creator') ||
    s.includes('twin usb') ||
    s.includes('dragonrise') ||
    s.includes('greenasia') ||
    s.includes('mayflash') ||
    s.includes('shanwan') ||
    s.includes('tigergame') ||
    s.includes('vibration joystick') ||
    s.includes('0810') ||
    s.includes('0079') ||
    s.includes('0e8f') ||
    s.includes('11ff') ||
    s.includes('2563') ||
    s.includes('0b43') ||
    s.includes('1345')
  ) return 'ps2';

  // Unified Xbox (Xbox Series, Xbox One, Xbox 360, XInput)
  if (
    s.includes('xbox') ||
    s.includes('xinput') ||
    s.includes('360') ||
    s.includes('series') ||
    s.includes('045e') ||
    s.includes('0b12') ||
    s.includes('0b13')
  ) return 'xbox';

  // Fallback for generic USB adapters (many cheap PS2-to-USB converters report as "usb gamepad" or "generic usb joystick")
  if (s.includes('usb gamepad') || s.includes('generic usb') || s.includes('usb joystick')) {
    return 'ps2';
  }

  return 'generic';
}

function getNormalizedAxes(gp, profile) {
  if (!gp || !gp.axes) return { lx: 0, ly: 0, rx: 0, ry: 0 };
  const a = gp.axes;

  if (gp.mapping === 'standard' || a.length >= 4) {
    return {
      lx: a[0] !== undefined ? a[0] : 0,
      ly: a[1] !== undefined ? a[1] : 0,
      rx: a[2] !== undefined ? a[2] : 0,
      ry: a[3] !== undefined ? a[3] : 0,
    };
  }

  if (profile === 'ps3' && a.length >= 6) {
    return {
      lx: a[0] || 0,
      ly: a[1] || 0,
      rx: a[2] || 0,
      ry: a[5] !== undefined ? a[5] : (a[3] || 0)
    };
  }

  return {
    lx: a[0] !== undefined ? a[0] : 0,
    ly: a[1] !== undefined ? a[1] : 0,
    rx: a[2] !== undefined ? a[2] : 0,
    ry: a[3] !== undefined ? a[3] : 0,
  };
}

// ─────────────────────────────────────────────────────────────
// 4. DOM REFERENCES
// ─────────────────────────────────────────────────────────────
const dom = {
  // Top Navbar
  statusDot:           document.getElementById('status-dot'),
  statusText:          document.getElementById('status-text'),
  itemCodeInput:       document.getElementById('item-code-input'),
  activeGamepadSelect: document.getElementById('active-gamepad-select'),
  modelSelect:         document.getElementById('model-select'),
  btnSaveDiag:         document.getElementById('btn-save-diag'),
  btnPrintReport:      document.getElementById('btn-print-report'),
  btnOpenHistory:      document.getElementById('btn-open-history'),
  btnToggleDetails:    document.getElementById('btn-toggle-details'),

  // Guided Workflow
  workflowBar:         document.querySelector('.workflow-bar'),
  stepBtn:             document.getElementById('step-btn'),
  checkBtn:            document.getElementById('check-btn'),
  stepTrig:            document.getElementById('step-trig'),
  checkTrig:           document.getElementById('check-trig'),
  stepStickL:          document.getElementById('step-stick-l'),
  checkStickL:         document.getElementById('check-stick-l'),
  stepStickR:          document.getElementById('step-stick-r'),
  checkStickR:         document.getElementById('check-stick-r'),
  stepCert:            document.getElementById('step-cert'),
  checkCert:           document.getElementById('check-cert'),
  guidedInstructionBanner: document.getElementById('guided-instruction-banner'),
  guidedInstructionText:   document.getElementById('guided-instruction-text'),

  // Stage Left
  emptyStateView:      document.getElementById('empty-state-view'),
  photoViewBox:        document.getElementById('photo-view-box'),
  photoImg:            document.getElementById('photo-img'),
  photoOverlaySvg:     document.getElementById('photo-overlay-svg'),

  // Compact Under-Controller Chip
  ctrlBottomChip:      document.getElementById('ctrl-bottom-chip'),
  chipModelName:       document.getElementById('chip-model-name'),
  chipStatusText:      document.getElementById('chip-status-text'),
  chipBtnProgress:     document.getElementById('chip-btn-progress'),

  // Large Stick Testing Center
  stickZoomBtn:        document.getElementById('stick-zoom-btn'),
  stickSuiteBtn:       document.getElementById('stick-suite-btn'),
  driftBtn:            document.getElementById('drift-btn'),
  stickClearTraceBtn:  document.getElementById('stick-clear-trace-btn'),
  stickLCanvas:        document.getElementById('stick-l-canvas'),
  stickRCanvas:        document.getElementById('stick-r-canvas'),
  stickLStatusDot:     document.getElementById('stick-l-status-dot'),
  stickRStatusDot:     document.getElementById('stick-r-status-dot'),
  stickLVerdict:       document.getElementById('stick-l-verdict'),
  stickRVerdict:       document.getElementById('stick-r-verdict'),
  stickLX:             document.getElementById('stick-l-x'),
  stickLY:             document.getElementById('stick-l-y'),
  stickLDist:          document.getElementById('stick-l-dist'),
  stickRX:             document.getElementById('stick-r-x'),
  stickRY:             document.getElementById('stick-r-y'),
  stickRDist:          document.getElementById('stick-r-dist'),
  stickLCircVal:       document.getElementById('stick-l-circ-val'),
  stickRCircVal:       document.getElementById('stick-r-circ-val'),
  stickLDriftVal:      document.getElementById('stick-l-drift-val'),
  stickLJitterVal:     document.getElementById('stick-l-jitter-val'),
  stickLSnapVal:       document.getElementById('stick-l-snap-val'),
  stickRDriftVal:      document.getElementById('stick-r-drift-val'),
  stickRJitterVal:     document.getElementById('stick-r-jitter-val'),
  stickRSnapVal:       document.getElementById('stick-r-snap-val'),
  driftResult:         document.getElementById('drift-result'),

  // Triggers
  triggersSummaryTag:  document.getElementById('triggers-summary-tag'),
  triggerL2Status:     document.getElementById('trigger-l2-status'),
  triggerR2Status:     document.getElementById('trigger-r2-status'),
  triggerL2Bar:        document.getElementById('trigger-l2-bar'),
  triggerR2Bar:        document.getElementById('trigger-r2-bar'),
  triggerL2Val:        document.getElementById('trigger-l2-val'),
  triggerL2Rest:       document.getElementById('trigger-l2-rest'),
  triggerL2Max:        document.getElementById('trigger-l2-max'),
  triggerL2Ramp:       document.getElementById('trigger-l2-ramp'),
  triggerR2Val:        document.getElementById('trigger-r2-val'),
  triggerR2Rest:       document.getElementById('trigger-r2-rest'),
  triggerR2Max:        document.getElementById('trigger-r2-max'),
  triggerR2Ramp:       document.getElementById('trigger-r2-ramp'),

  // Buttons Matrix
  buttonsGrid:         document.getElementById('buttons-grid'),
  buttonsSummaryBadge: document.getElementById('buttons-summary-badge'),
  btnResetButtonsTest: document.getElementById('btn-reset-buttons-test'),

  // Overall Quality Verdict Card
  cardVerdict:         document.getElementById('card-verdict'),
  overallVerdictStamp: document.getElementById('overall-verdict-stamp'),
  btnQuickSave:        document.getElementById('btn-quick-save'),

  // Raw Technical Drawer
  rawDiagCard:         document.getElementById('raw-diag-card'),
  btnCloseDetails:     document.getElementById('btn-close-details'),
  rawId:               document.getElementById('raw-id'),
  rawIndex:            document.getElementById('raw-index'),
  rawMapping:          document.getElementById('raw-mapping'),
  rawTotalBtns:        document.getElementById('raw-total-btns'),
  rawTotalAxes:        document.getElementById('raw-total-axes'),
  rawAxesList:         document.getElementById('raw-axes-list'),
  rawButtonsList:      document.getElementById('raw-buttons-list'),

  // Floating Language Selector
  floatingLang:        document.getElementById('floating-lang'),
  langTrigger:         document.getElementById('lang-trigger'),
  langMenu:            document.getElementById('lang-menu'),

  // History Modal
  historyModal:        document.getElementById('history-modal'),
  modalCloseBtn:       document.getElementById('modal-close-btn'),
  historySearchInput:  document.getElementById('history-search-input'),
  btnExportJson:       document.getElementById('btn-export-json'),
  btnClearHistory:     document.getElementById('btn-clear-history'),
  historyTableBody:    document.getElementById('history-table-body'),

  // Printable Report
  printableReport:     document.getElementById('printable-report'),
  printBarcodeSvg:     document.getElementById('print-barcode-svg'),
  printBarcodeText:    document.getElementById('print-barcode-text'),
  printItemCode:       document.getElementById('print-item-code'),
  printDate:           document.getElementById('print-date'),
  printDeviceName:     document.getElementById('print-device-name'),
  printDeviceProfile:  document.getElementById('print-device-profile'),
  printDeviceId:       document.getElementById('print-device-id'),
  printSlDrift:        document.getElementById('print-sl-drift'),
  printSlJitter:       document.getElementById('print-sl-jitter'),
  printSlCirc:         document.getElementById('print-sl-circ'),
  printSlSnap:         document.getElementById('print-sl-snap'),
  printSlVerdict:      document.getElementById('print-sl-verdict'),
  printSrDrift:        document.getElementById('print-sr-drift'),
  printSrJitter:       document.getElementById('print-sr-jitter'),
  printSrCirc:         document.getElementById('print-sr-circ'),
  printSrSnap:         document.getElementById('print-sr-snap'),
  printSrVerdict:      document.getElementById('print-sr-verdict'),
  printL2Rest:         document.getElementById('print-l2-rest'),
  printL2Max:          document.getElementById('print-l2-max'),
  printL2Ramp:         document.getElementById('print-l2-ramp'),
  printL2Verdict:      document.getElementById('print-l2-verdict'),
  printR2Rest:         document.getElementById('print-r2-rest'),
  printR2Max:          document.getElementById('print-r2-max'),
  printR2Ramp:         document.getElementById('print-r2-ramp'),
  printR2Verdict:      document.getElementById('print-r2-verdict'),
  printBtnCount:       document.getElementById('print-btn-count'),
  printBtnStuck:       document.getElementById('print-btn-stuck'),
  printBtnVerdict:     document.getElementById('print-btn-verdict'),
  printFinalStamp:     document.getElementById('print-final-stamp'),
};

// ─────────────────────────────────────────────────────────────
// 5. APPLICATION STATE
// ─────────────────────────────────────────────────────────────
let state = {
  activeGpIndex:        null,
  knownGamepads:        new Map(),
  model:                'ps4',
  centerZoom:           true,
  rawAccordionOpen:     false,
  lastActiveSwitchTime: 0,
  rafId:                null,

  // Sticks Diagnostic Telemetry & Buffers
  stickHistoryL:        [],
  stickHistoryR:        [],
  stickMetrics: {
    l: { 
      drift: null, 
      jitter: null, 
      coverage: null, 
      circularity: null, 
      range: null, 
      returnTime: null, 
      verdict: 'PENDING',
      tests: { center: null, range: null, noise: null, smoothness: null, coverage: null, circularity: null, returnToCenter: null },
      reviewReasons: [],
      failReasons: [],
    },
    r: { 
      drift: null, 
      jitter: null, 
      coverage: null, 
      circularity: null, 
      range: null, 
      returnTime: null, 
      verdict: 'PENDING',
      tests: { center: null, range: null, noise: null, smoothness: null, coverage: null, circularity: null, returnToCenter: null },
      reviewReasons: [],
      failReasons: [],
    },
  },
  // Circular coverage radial bins (36 sectors = 10 deg each)
  circleBinsL:          new Array(36).fill(0),
  circleBinsR:          new Array(36).fill(0),
  
  // Return-to-center state machines (IDLE -> EXTREME_REACHED -> RETURNING -> STABILIZING -> COMPLETE)
  snapL: {
    state: 'IDLE',
    startTime: 0,
    peakDist: 0,
    lastDist: 0,
    stabilizeStartTime: 0,
    done: false
  },
  snapR: {
    state: 'IDLE',
    startTime: 0,
    peakDist: 0,
    lastDist: 0,
    stabilizeStartTime: 0,
    done: false
  },

  // Suite state
  suite: {
    running: false,
    step: 0,
    startTime: 0,
  },

  // Drift capture (3s)
  drift: {
    capturing: false,
    startTime: 0,
    samplesL:  [],
    samplesR:  [],
  },

  // Trigger Validation State
  triggers: {
    l2: { min: 1.0, max: 0.0, restOk: null, maxOk: null, smoothOk: true, samples: 0, verdict: 'PENDING' },
    r2: { min: 1.0, max: 0.0, restOk: null, maxOk: null, smoothOk: true, samples: 0, verdict: 'PENDING' },
  },

  // Button Validation Matrix
  buttonStates:         {}, // idx -> { pressed: false, clicks: 0, pressStartTime: 0, isStuck: false }

  // Overall Quality Certification
  overallVerdict:       'PENDING',

  // Visual caches
  photoBtns:            {},
  photoStickL:          null,
  photoStickR:          null,
  photoLightbar:        null,
};

// ─────────────────────────────────────────────────────────────
// 6. GAMEPAD API LIFECYCLE & ZERO-REFRESH HOT-SWAPPING
// ─────────────────────────────────────────────────────────────
function initGamepadLifecycle() {
  window.addEventListener('gamepadconnected', (e) => {
    handleGamepadConnection(e.gamepad);
  });

  window.addEventListener('gamepaddisconnected', (e) => {
    handleGamepadDisconnection(e.gamepad);
  });

  // Start continuous 60fps telemetry loop
  if (!state.rafId) {
    state.rafId = requestAnimationFrame(pollGamepads);
  }
}

function handleGamepadConnection(gp) {
  if (!gp) return;
  state.knownGamepads.set(gp.index, {
    id: gp.id,
    mapping: gp.mapping,
    axesCount: gp.axes ? gp.axes.length : 0,
    btnCount: gp.buttons ? gp.buttons.length : 0
  });

  updateGamepadSelectorUI();

  // If no controller is active, auto-activate this one
  if (state.activeGpIndex === null || !state.knownGamepads.has(state.activeGpIndex)) {
    setActiveGamepad(gp.index);
  }
}

function handleGamepadDisconnection(gp) {
  if (!gp) return;
  state.knownGamepads.delete(gp.index);
  updateGamepadSelectorUI();

  if (state.activeGpIndex === gp.index) {
    // Switch to another connected gamepad if any exists
    const remaining = Array.from(state.knownGamepads.keys());
    if (remaining.length > 0) {
      setActiveGamepad(remaining[0]);
    } else {
      setActiveGamepad(null);
    }
  }
}

function updateGamepadSelectorUI() {
  const select = dom.activeGamepadSelect;
  if (!select) return;

  select.innerHTML = '';
  const list = Array.from(state.knownGamepads.entries()).sort((a, b) => a[0] - b[0]);

  if (list.length === 0) {
    const opt = document.createElement('option');
    opt.value = '-1';
    opt.textContent = t('noConnectedGamepads');
    select.appendChild(opt);
    return;
  }

  for (const [idx, info] of list) {
    const opt = document.createElement('option');
    opt.value = String(idx);
    const shortName = info.id.length > 24 ? info.id.slice(0, 24) + '…' : info.id;
    opt.textContent = `Mando ${idx} — ${shortName}`;
    select.appendChild(opt);
  }

  if (state.activeGpIndex !== null && state.knownGamepads.has(state.activeGpIndex)) {
    select.value = String(state.activeGpIndex);
  }
}

function setActiveGamepad(idx) {
  if (idx === null || idx === undefined || idx < 0) {
    state.activeGpIndex = null;
    if (dom.statusDot) dom.statusDot.className = 'status-dot disconnected';
    if (dom.statusText) dom.statusText.textContent = t('waitingGamepad');
    
    const choice = dom.modelSelect ? dom.modelSelect.value : 'auto';
    if (choice === 'auto') {
      if (dom.emptyStateView) dom.emptyStateView.style.display = 'flex';
      if (dom.photoViewBox) dom.photoViewBox.style.display   = 'none';
      if (dom.ctrlBottomChip) dom.ctrlBottomChip.style.display = 'none';
    } else {
      if (dom.emptyStateView) dom.emptyStateView.style.display = 'none';
      if (dom.photoViewBox) dom.photoViewBox.style.display   = 'flex';
      if (dom.ctrlBottomChip) dom.ctrlBottomChip.style.display = 'flex';
    }

    drawLargeStick(dom.stickLCanvas, 0, 0, true);
    drawLargeStick(dom.stickRCanvas, 0, 0, false);
    resetAllValidationStates();
    resolveModel();
    updateWorkflowProgress();
    updateOverallVerdict();
    return;
  }

  state.activeGpIndex = idx;
  const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
  const gp = gamepads[idx];
  const id = gp ? gp.id : t('connectedMsg');

  if (dom.statusDot) dom.statusDot.className = 'status-dot connected';
  if (dom.statusText) dom.statusText.textContent = id.length > 28 ? id.slice(0, 28) + '…' : id;

  if (dom.emptyStateView) dom.emptyStateView.style.display = 'none';
  if (dom.photoViewBox) dom.photoViewBox.style.display   = 'flex';
  if (dom.ctrlBottomChip) dom.ctrlBottomChip.style.display = 'flex';

  if (dom.activeGamepadSelect && dom.activeGamepadSelect.value !== String(idx)) {
    dom.activeGamepadSelect.value = String(idx);
  }

  resetAllValidationStates();
  resolveModel();

  const btnCount = gp ? Math.min(gp.buttons.length, BTN_NAMES.length + 4) : BTN_NAMES.length;
  buildButtonChips(btnCount);
  updateWorkflowProgress();
  updateOverallVerdict();
}

function resetAllValidationStates() {
  state.stickHistoryL = [];
  state.stickHistoryR = [];
  state.circleBinsL = new Array(36).fill(0);
  state.circleBinsR = new Array(36).fill(0);
  state.stickMetrics = {
    l: { 
      drift: null, 
      jitter: null, 
      coverage: null, 
      circularity: null, 
      range: null, 
      returnTime: null, 
      verdict: 'PENDING',
      tests: { center: null, range: null, noise: null, smoothness: null, coverage: null, circularity: null, returnToCenter: null },
      reviewReasons: [],
      failReasons: [],
    },
    r: { 
      drift: null, 
      jitter: null, 
      coverage: null, 
      circularity: null, 
      range: null, 
      returnTime: null, 
      verdict: 'PENDING',
      tests: { center: null, range: null, noise: null, smoothness: null, coverage: null, circularity: null, returnToCenter: null },
      reviewReasons: [],
      failReasons: [],
    },
  };
  state.snapL = {
    state: 'IDLE',
    startTime: 0,
    peakDist: 0,
    lastDist: 0,
    stabilizeStartTime: 0,
    done: false
  };
  state.snapR = {
    state: 'IDLE',
    startTime: 0,
    peakDist: 0,
    lastDist: 0,
    stabilizeStartTime: 0,
    done: false
  };
  state.triggers = {
    l2: { min: 1.0, max: 0.0, restOk: null, maxOk: null, smoothOk: true, samples: 0, verdict: 'PENDING' },
    r2: { min: 1.0, max: 0.0, restOk: null, maxOk: null, smoothOk: true, samples: 0, verdict: 'PENDING' },
  };
  state.buttonStates = {};
  state.drift.capturing = false;
  state.suite.running = false;

  if (dom.stickLCircVal) dom.stickLCircVal.textContent = '—';
  if (dom.stickRCircVal) dom.stickRCircVal.textContent = '—';
  if (dom.stickLDriftVal) dom.stickLDriftVal.textContent = '—';
  if (dom.stickRDriftVal) dom.stickRDriftVal.textContent = '—';
  if (dom.stickLJitterVal) dom.stickLJitterVal.textContent = '—';
  if (dom.stickRJitterVal) dom.stickRJitterVal.textContent = '—';
  if (dom.stickLSnapVal) dom.stickLSnapVal.textContent = '—';
  if (dom.stickRSnapVal) dom.stickRSnapVal.textContent = '—';
  if (dom.driftResult) dom.driftResult.innerHTML = '';

  updateVerdictBadgesUI();
  updateButtonsSummaryBadge();
  updateTriggersUI();
  updateWorkflowProgress();
  updateOverallVerdict();
}

// ─────────────────────────────────────────────────────────────
// 7. CONTINUOUS LIVE TELEMETRY LOOP
// ─────────────────────────────────────────────────────────────
function pollGamepads() {
  const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
  let connectedIndices = [];

  for (let i = 0; i < gamepads.length; i++) {
    const gp = gamepads[i];
    if (gp && gp.connected) {
      connectedIndices.push(i);
      if (!state.knownGamepads.has(i)) {
        handleGamepadConnection(gp);
      }
    }
  }

  // Handle gamepads that disappeared without event
  for (const knownIdx of state.knownGamepads.keys()) {
    if (!connectedIndices.includes(knownIdx)) {
      handleGamepadDisconnection({ index: knownIdx });
    }
  }

  // Automatic activity-based controller switching
  const now = performance.now();
  if (connectedIndices.length > 1 && (now - state.lastActiveSwitchTime > BENCHMARKS.ACTIVITY_DEBOUNCE_MS)) {
    for (const idx of connectedIndices) {
      if (idx !== state.activeGpIndex) {
        const gp = gamepads[idx];
        if (hasSignificantInput(gp)) {
          state.lastActiveSwitchTime = now;
          setActiveGamepad(idx);
          break;
        }
      }
    }
  }

  // Process live data for active gamepad
  if (state.activeGpIndex !== null && gamepads[state.activeGpIndex]) {
    const gp = gamepads[state.activeGpIndex];
    processLiveGamepadInput(gp);
  }

  state.rafId = requestAnimationFrame(pollGamepads);
}

function hasSignificantInput(gp) {
  if (!gp) return false;
  if (gp.axes) {
    for (let i = 0; i < gp.axes.length; i++) {
      if (Math.abs(gp.axes[i]) > BENCHMARKS.ACTIVITY_THRESHOLD_AXIS) return true;
    }
  }
  if (gp.buttons) {
    for (let i = 0; i < gp.buttons.length; i++) {
      const b = gp.buttons[i];
      const val = typeof b === 'object' ? b.value : b;
      if (val > BENCHMARKS.ACTIVITY_THRESHOLD_BTN) return true;
    }
  }
  return false;
}

// ─────────────────────────────────────────────────────────────
// 8. LIVE INPUT PROCESSING (STICKS, TRIGGERS, BUTTONS, RAW)
// ─────────────────────────────────────────────────────────────
function processLiveGamepadInput(gp) {
  const axes = getNormalizedAxes(gp, state.model);
  const now = performance.now();

  // 1. Process Sticks
  processStickData(axes, now);

  // 2. Process Triggers (L2 / R2)
  processTriggersData(gp);

  // 3. Process Buttons
  processButtonsData(gp, now);

  // 4. Update Raw diagnostics if drawer is open
  if (state.rawAccordionOpen) {
    updateRawDiagnostics(gp);
  }

  // 5. Update Photo overlay interactive highlights
  highlightActiveOverlay(gp, axes);
}

function processStickData(axes, now) {
  const { lx, ly, rx, ry } = axes;

  // Distances and angles
  const lDist = Math.sqrt(lx * lx + ly * ly);
  const lAngle = (Math.atan2(ly, lx) * 180 / Math.PI + 360) % 360;

  const rDist = Math.sqrt(rx * rx + ry * ry);
  const rAngle = (Math.atan2(ry, rx) * 180 / Math.PI + 360) % 360;

  // Real-time telemetry output (Live updates every frame)
  if (dom.stickLX) dom.stickLX.textContent    = (lx >= 0 ? '+' : '') + lx.toFixed(4);
  if (dom.stickLY) dom.stickLY.textContent    = (ly >= 0 ? '+' : '') + ly.toFixed(4);
  if (dom.stickLDist) dom.stickLDist.textContent = lDist.toFixed(4);

  if (dom.stickRX) dom.stickRX.textContent    = (rx >= 0 ? '+' : '') + rx.toFixed(4);
  if (dom.stickRY) dom.stickRY.textContent    = (ry >= 0 ? '+' : '') + ry.toFixed(4);
  if (dom.stickRDist) dom.stickRDist.textContent = rDist.toFixed(4);

  // Status dots
  if (dom.stickLStatusDot) dom.stickLStatusDot.className = 'stick-status-dot' + (lDist > 0.08 ? ' active' : '');
  if (dom.stickRStatusDot) dom.stickRStatusDot.className = 'stick-status-dot' + (rDist > 0.08 ? ' active' : '');

  // Record path trace (max 400 points)
  state.stickHistoryL.push({ x: lx, y: ly });
  if (state.stickHistoryL.length > 400) state.stickHistoryL.shift();

  state.stickHistoryR.push({ x: rx, y: ry });
  if (state.stickHistoryR.length > 400) state.stickHistoryR.shift();

  // 1. Angular Coverage & Circularity Sampling (36 sectors = 10 deg each)
  // Only sample sector outer radius when stick is pushed towards outer perimeter (> 0.65)
  if (lDist > 0.65) {
    const binIdx = Math.floor(lAngle / 10) % 36;
    state.circleBinsL[binIdx] = Math.max(state.circleBinsL[binIdx], lDist);
    updateStickCoverageAndCircularity('l');
  }
  if (rDist > 0.65) {
    const binIdx = Math.floor(rAngle / 10) % 36;
    state.circleBinsR[binIdx] = Math.max(state.circleBinsR[binIdx], rDist);
    updateStickCoverageAndCircularity('r');
  }

  // 2. Movement Smoothness Tracking (Detect signal jumps during movement)
  checkMovementSmoothness('l', lx, ly, lDist);
  checkMovementSmoothness('r', rx, ry, rDist);

  // 3. Return-to-Center / Snapback State Machine (Independent for L and R)
  processSnapbackStateMachine('l', lDist, now);
  processSnapbackStateMachine('r', rDist, now);

  // 4. Dedicated 3s Drift Capture sampling (Only during rest test)
  if (state.drift.capturing) {
    state.drift.samplesL.push({ x: lx, y: ly, dist: lDist });
    state.drift.samplesR.push({ x: rx, y: ry, dist: rDist });
    const elapsed = (now - state.drift.startTime) / 1000;
    if (elapsed >= 3.0) {
      finalizeDriftCapture();
    }
  }

  // Draw Canvases
  drawLargeStick(dom.stickLCanvas, lx, ly, true, state.stickHistoryL);
  drawLargeStick(dom.stickRCanvas, rx, ry, false, state.stickHistoryR);
}

// ─────────────────────────────────────────────────────────────
// MOVEMENT SMOOTHNESS TRACKING
// ─────────────────────────────────────────────────────────────
let lastSmoothPos = {
  l: { x: 0, y: 0, time: 0 },
  r: { x: 0, y: 0, time: 0 },
};

function checkMovementSmoothness(stick, x, y, dist) {
  const m = state.stickMetrics[stick];
  // Only evaluate during active movement
  if (dist < 0.15) return;
  
  const prev = lastSmoothPos[stick];
  if (prev.time > 0) {
    const dx = x - prev.x;
    const dy = y - prev.y;
    const step = Math.sqrt(dx * dx + dy * dy);
    // If an impossible sudden jump occurs without release
    if (step > BENCHMARKS.STICK.SMOOTHNESS_MAX_DELTA && dist > 0.4) {
      m.tests.smoothness = 'REVIEW';
      if (!m.reviewReasons.some(r => r.test === 'smoothness')) {
        m.reviewReasons.push({ test: 'smoothness', value: step.toFixed(3), threshold: BENCHMARKS.STICK.SMOOTHNESS_MAX_DELTA });
      }
    } else if (m.tests.smoothness === null && step > 0.05) {
      m.tests.smoothness = 'PASS';
    }
  }
  prev.x = x;
  prev.y = y;
  prev.time = performance.now();
}

// ─────────────────────────────────────────────────────────────
// RETURN-TO-CENTER / SNAPBACK STATE MACHINE
// IDLE -> EXTREME_REACHED -> WAITING_FOR_RELEASE -> RETURNING -> STABILIZING -> COMPLETE
// ─────────────────────────────────────────────────────────────
function processSnapbackStateMachine(stick, dist, now) {
  const snap = stick === 'l' ? state.snapL : state.snapR;
  const m = state.stickMetrics[stick];
  const snapEl = stick === 'l' ? dom.stickLSnapVal : dom.stickRSnapVal;

  switch (snap.state) {
    case 'IDLE':
      // 1. Detect that the stick reached a meaningful outer radius (>= 0.80)
      if (dist >= 0.80) {
        snap.state = 'EXTREME_REACHED';
        snap.peakDist = dist;
        snap.lastDist = dist;
      }
      break;

    case 'EXTREME_REACHED':
      // While stick remains near the edge, update peak; do NOT start return timing!
      if (dist > snap.peakDist) {
        snap.peakDist = dist;
      }
      // 2. Detect actual release: radius decreases significantly toward center
      if (dist < snap.lastDist - 0.15 || dist < 0.65) {
        snap.state = 'RETURNING';
        snap.startTime = now;
      }
      snap.lastDist = dist;
      break;

    case 'RETURNING':
      // 3. Stick is returning. Check if it reaches center threshold (<= 0.08)
      if (dist <= BENCHMARKS.STICK.SNAPBACK_CENTER_REST_MAX) {
        const durationMs = Math.round(now - snap.startTime);
        snap.state = 'STABILIZING';
        snap.stabilizeStartTime = now;
        snap.tempDurationMs = durationMs;
      } else if (now - snap.startTime > 800) {
        // Return timed out / stick didn't return to center
        snap.state = 'IDLE';
      }
      break;

    case 'STABILIZING':
      // 4. Require stable center for at least 180ms
      if (dist > BENCHMARKS.STICK.SNAPBACK_CENTER_REST_MAX + 0.04) {
        // Stick bounced out or was touched again
        snap.state = 'IDLE';
      } else if (now - snap.stabilizeStartTime >= 180) {
        // Successfully stabilized!
        snap.state = 'COMPLETE';
        snap.done = true;
        const returnTime = snap.tempDurationMs;
        m.returnTime = returnTime;

        if (snapEl) snapEl.textContent = `${returnTime}ms`;

        // Evaluate return to center test
        if (returnTime <= BENCHMARKS.STICK.SNAPBACK_PASS_MS) {
          m.tests.returnToCenter = 'PASS';
        } else if (returnTime <= BENCHMARKS.STICK.SNAPBACK_REVIEW_MS) {
          m.tests.returnToCenter = 'REVIEW';
          m.reviewReasons.push({ test: 'returnToCenter', value: returnTime, threshold: BENCHMARKS.STICK.SNAPBACK_PASS_MS });
        } else {
          m.tests.returnToCenter = 'FAIL';
          m.failReasons.push({ test: 'returnToCenter', value: returnTime, threshold: BENCHMARKS.STICK.SNAPBACK_REVIEW_MS });
        }

        evaluateStickOverall(stick);
      }
      break;

    case 'COMPLETE':
      // If user reaches extreme again, allow a new measurement
      if (dist >= 0.85) {
        snap.state = 'EXTREME_REACHED';
        snap.peakDist = dist;
        snap.lastDist = dist;
      }
      break;
  }
}

// ─────────────────────────────────────────────────────────────
// ANGULAR COVERAGE, RANGE, AND TRUE CIRCULARITY / UNIFORMITY
// ─────────────────────────────────────────────────────────────
function updateStickCoverageAndCircularity(stick) {
  const bins = stick === 'l' ? state.circleBinsL : state.circleBinsR;
  const m = state.stickMetrics[stick];
  const circEl = stick === 'l' ? dom.stickLCircVal : dom.stickRCircVal;

  const totalSectors = 36;
  const visitedSectors = bins.filter(r => r > 0).length;
  const coveragePct = Math.round((visitedSectors / totalSectors) * 100);
  m.coverage = coveragePct;

  // Show live progress during movement
  if (circEl) circEl.textContent = `${coveragePct}%`;

  // Track max range reached across all directions
  const maxRange = Math.max(...bins);
  m.range = maxRange > 0 ? parseFloat(maxRange.toFixed(3)) : 0;

  // Check 8 main compass directions for directional range:
  // 0: N (90°), 4: NE (45°), 9: E (0°), 13: SE (315°), 18: S (270°), 22: SW (225°), 27: W (180°), 31: NW (135°)
  const compassIndices = [0, 4, 9, 13, 18, 22, 27, 31];
  let weakSectorsCount = 0;
  for (const idx of compassIndices) {
    if (bins[idx] > 0 && bins[idx] < BENCHMARKS.STICK.RANGE_MIN_SECTOR_REVIEW) {
      weakSectorsCount++;
    }
  }

  // Range test evaluation
  if (maxRange >= BENCHMARKS.STICK.RANGE_MIN_SECTOR_PASS && weakSectorsCount === 0) {
    m.tests.range = 'PASS';
  } else if (weakSectorsCount > 0) {
    m.tests.range = 'REVIEW';
    if (!m.reviewReasons.some(r => r.test === 'range')) {
      m.reviewReasons.push({ test: 'range', weakSectors: weakSectorsCount });
    }
  }

  // Evaluate Coverage Test
  if (coveragePct >= BENCHMARKS.STICK.COVERAGE_MIN_PASS) {
    m.tests.coverage = 'PASS';
  } else if (coveragePct >= BENCHMARKS.STICK.COVERAGE_MIN_REVIEW) {
    m.tests.coverage = 'REVIEW';
  }

  // Calculate True Circularity / Uniformity once coverage is sufficient (>= 75%)
  if (visitedSectors >= 27) {
    const visitedRadii = bins.filter(r => r > 0);
    const avgRadius = visitedRadii.reduce((a, b) => a + b, 0) / visitedRadii.length;
    const minRadius = Math.min(...visitedRadii);
    const maxRadius = Math.max(...visitedRadii);
    const radialDeviation = maxRadius - minRadius;

    // True circularity is the uniformity error percentage (100% minus deviation penalty)
    const circularityScore = Math.max(0, Math.min(100, Math.round((1 - (radialDeviation / 2)) * 100)));
    m.circularity = circularityScore;

    if (circEl) circEl.textContent = `${circularityScore}%`;

    // Uniformity evaluation
    if (avgRadius >= BENCHMARKS.STICK.CIRCULARITY_AVG_MIN_PASS && radialDeviation <= BENCHMARKS.STICK.CIRCULARITY_UNIFORM_MAX_ERR) {
      m.tests.circularity = 'PASS';
    } else if (avgRadius >= BENCHMARKS.STICK.CIRCULARITY_AVG_MIN_REVIEW) {
      m.tests.circularity = 'REVIEW';
      if (!m.reviewReasons.some(r => r.test === 'circularity')) {
        m.reviewReasons.push({ test: 'circularity', avgRadius: avgRadius.toFixed(2), radialDev: radialDeviation.toFixed(2) });
      }
    } else {
      m.tests.circularity = 'FAIL';
      if (!m.failReasons.some(r => r.test === 'circularity')) {
        m.failReasons.push({ test: 'circularity', avgRadius: avgRadius.toFixed(2) });
      }
    }
  }

  evaluateStickOverall(stick);
}

// ─────────────────────────────────────────────────────────────
// RIGOROUS STICK EVALUATION STATE MACHINE (ONE SOURCE OF TRUTH)
// ─────────────────────────────────────────────────────────────
function evaluateStickOverall(stick) {
  const m = state.stickMetrics[stick];
  const badgeEl = stick === 'l' ? dom.stickLVerdict : dom.stickRVerdict;

  if (!m.tests) {
    m.tests = { center: null, range: null, noise: null, smoothness: null, coverage: null, circularity: null, returnToCenter: null };
  }

  // Required tests for a stick to receive a final verdict:
  // 1. center (Drift rest test)
  // 2. coverage (Angular coverage)
  // 3. circularity (True circularity / uniformity)
  // Optional / supplemental: range, noise, smoothness, returnToCenter

  const allTestKeys = ['center', 'coverage', 'circularity', 'returnToCenter'];
  const testVals = allTestKeys.map(k => m.tests[k]).filter(v => v !== null);

  let verdict = 'PENDING';
  let css = 'badge-pending';
  let text = t('verdictPending');

  // Any confirmed FAIL immediately marks stick as FAIL
  if (Object.values(m.tests).includes('FAIL')) {
    verdict = 'FAIL';
    css = 'badge-fail';
    text = t('verdictFail');
  } 
  // If tests are currently in progress or some are complete, but not all required tests have run
  else if (m.tests.center === null || m.tests.coverage === null || m.tests.circularity === null) {
    if (testVals.length > 0 || (m.coverage && m.coverage > 10)) {
      verdict = 'TESTING';
      css = 'badge-testing';
      text = t('verdictTesting') || 'EN PRUEBA';
    } else {
      verdict = 'PENDING';
      css = 'badge-pending';
      text = t('verdictPending');
    }
  }
  // All required diagnostic phases are complete!
  else {
    const hasReview = Object.values(m.tests).some(v => v === 'REVIEW');
    if (hasReview) {
      verdict = 'REVIEW';
      css = 'badge-review';
      text = t('verdictReview');
    } else {
      verdict = 'PASS';
      css = 'badge-pass';
      text = t('verdictPass');
    }
  }

  m.verdict = verdict;
  if (badgeEl) {
    badgeEl.className = `stick-verdict-badge ${css}`;
    badgeEl.textContent = text;
  }

  updateWorkflowProgress();
  updateOverallVerdict();
}

// ─────────────────────────────────────────────────────────────
// 9. TRIGGER ANALOG DIAGNOSTICS (L2 / R2)
// ─────────────────────────────────────────────────────────────
function processTriggersData(gp) {
  if (!gp || !gp.buttons) return;

  const btnL2 = gp.buttons[6];
  const btnR2 = gp.buttons[7];

  const l2Val = typeof btnL2 === 'object' ? btnL2.value : (btnL2 ? 1 : 0);
  const r2Val = typeof btnR2 === 'object' ? btnR2.value : (btnR2 ? 1 : 0);

  // L2
  const tL = state.triggers.l2;
  tL.min = Math.min(tL.min, l2Val);
  tL.max = Math.max(tL.max, l2Val);
  tL.samples++;

  if (dom.triggerL2Val)  dom.triggerL2Val.textContent = l2Val.toFixed(2);
  if (dom.triggerL2Bar)  dom.triggerL2Bar.style.width = `${Math.round(l2Val * 100)}%`;
  if (dom.triggerL2Rest) dom.triggerL2Rest.textContent = tL.min.toFixed(3);
  if (dom.triggerL2Max)  dom.triggerL2Max.textContent  = tL.max.toFixed(2);

  // R2
  const tR = state.triggers.r2;
  tR.min = Math.min(tR.min, r2Val);
  tR.max = Math.max(tR.max, r2Val);
  tR.samples++;

  if (dom.triggerR2Val)  dom.triggerR2Val.textContent = r2Val.toFixed(2);
  if (dom.triggerR2Bar)  dom.triggerR2Bar.style.width = `${Math.round(r2Val * 100)}%`;
  if (dom.triggerR2Rest) dom.triggerR2Rest.textContent = tR.min.toFixed(3);
  if (dom.triggerR2Max)  dom.triggerR2Max.textContent  = tR.max.toFixed(2);

  // Evaluate Triggers
  evaluateTrigger('l2', tL, dom.triggerL2Status, dom.triggerL2Ramp);
  evaluateTrigger('r2', tR, dom.triggerR2Status, dom.triggerR2Ramp);

  updateTriggersSummaryBadge();
  updateWorkflowProgress();
  updateOverallVerdict();
}

function evaluateTrigger(key, trig, badgeEl, rampEl) {
  if (trig.samples < 20) return;

  let restOk = trig.min <= BENCHMARKS.TRIGGER.REST_MAX;
  let maxOk  = trig.max >= BENCHMARKS.TRIGGER.MAX_MIN;

  let verdict = 'PENDING';
  let css = 'badge-neutral';
  let text = t('verdictPending');

  if (maxOk && restOk) {
    verdict = 'PASS';
    css = 'badge-pass';
    text = t('verdictPass');
    if (rampEl) rampEl.textContent = '100% Ok';
  } else if (!restOk) {
    verdict = 'FAIL';
    css = 'badge-fail';
    text = t('verdictFail');
    if (rampEl) rampEl.textContent = 'Fallo Reposo';
  } else if (trig.max > 0.4 && !maxOk) {
    verdict = 'REVIEW';
    css = 'badge-review';
    text = t('verdictReview');
    if (rampEl) rampEl.textContent = 'No llega al 100%';
  }

  trig.verdict = verdict;
  if (badgeEl) {
    badgeEl.className = `trigger-badge ${css}`;
    badgeEl.textContent = text;
  }
}

function updateTriggersSummaryBadge() {
  const l2 = state.triggers.l2.verdict;
  const r2 = state.triggers.r2.verdict;
  const tag = dom.triggersSummaryTag;
  if (!tag) return;

  if (l2 === 'PASS' && r2 === 'PASS') {
    tag.textContent = `✓ ${t('verdictPass')}`;
    tag.style.color = 'var(--green)';
    tag.style.borderColor = 'var(--green)';
  } else if (l2 === 'FAIL' || r2 === 'FAIL') {
    tag.textContent = `✕ ${t('verdictFail')}`;
    tag.style.color = 'var(--red)';
    tag.style.borderColor = 'var(--red)';
  } else if (l2 === 'REVIEW' || r2 === 'REVIEW') {
    tag.textContent = `! ${t('verdictReview')}`;
    tag.style.color = 'var(--yellow)';
    tag.style.borderColor = 'var(--yellow)';
  } else {
    tag.textContent = t('triggersPending');
    tag.style.color = 'var(--text-muted)';
    tag.style.borderColor = 'var(--border)';
  }
}

function updateTriggersUI() {
  if (dom.triggerL2Val)  dom.triggerL2Val.textContent = '0.00';
  if (dom.triggerL2Bar)  dom.triggerL2Bar.style.width = '0%';
  if (dom.triggerL2Max)  dom.triggerL2Max.textContent = '0.00';
  if (dom.triggerL2Ramp) dom.triggerL2Ramp.textContent = '—';
  if (dom.triggerL2Status) {
    dom.triggerL2Status.className = 'trigger-badge badge-neutral';
    dom.triggerL2Status.textContent = t('verdictPending');
  }

  if (dom.triggerR2Val)  dom.triggerR2Val.textContent = '0.00';
  if (dom.triggerR2Bar)  dom.triggerR2Bar.style.width = '0%';
  if (dom.triggerR2Max)  dom.triggerR2Max.textContent = '0.00';
  if (dom.triggerR2Ramp) dom.triggerR2Ramp.textContent = '—';
  if (dom.triggerR2Status) {
    dom.triggerR2Status.className = 'trigger-badge badge-neutral';
    dom.triggerR2Status.textContent = t('verdictPending');
  }

  updateTriggersSummaryBadge();
}

// ─────────────────────────────────────────────────────────────
// 10. FULL BUTTON TESTING MATRIX & STUCK DETECTION
// ─────────────────────────────────────────────────────────────
function buildButtonChips(count) {
  if (!dom.buttonsGrid) return;
  dom.buttonsGrid.innerHTML = '';

  for (let i = 0; i < count; i++) {
    const chip = document.createElement('div');
    chip.className = 'btn-chip';
    chip.id = `btn-chip-${i}`;

    const label = getButtonLabel(state.model, i);

    chip.innerHTML = `
      <div class="btn-chip-header">
        <span class="btn-name" title="${label}">${label}</span>
        <span class="chip-check" id="btn-check-${i}">0/3</span>
      </div>
      <span class="btn-val" id="btn-val-${i}">0.00</span>
      <div class="bar-wrap">
        <div class="bar-fill" id="btn-bar-${i}" style="width: 0%;"></div>
      </div>
    `;
    dom.buttonsGrid.appendChild(chip);

    if (!state.buttonStates[i]) {
      state.buttonStates[i] = { pressed: false, clicks: 0, pressStartTime: 0, isStuck: false };
    }
  }
  updateButtonsSummaryBadge();
}

function processButtonsData(gp, now) {
  if (!gp || !gp.buttons) return;

  let validatedCount = 0;
  let stuckCount = 0;
  const total = gp.buttons.length;

  for (let i = 0; i < total; i++) {
    const b = gp.buttons[i];
    const val = typeof b === 'object' ? b.value : (b ? 1 : 0);
    const isPressed = typeof b === 'object' ? b.pressed : (val > 0.4);

    const chip = document.getElementById(`btn-chip-${i}`);
    const valEl = document.getElementById(`btn-val-${i}`);
    const barEl = document.getElementById(`btn-bar-${i}`);
    const checkEl = document.getElementById(`btn-check-${i}`);

    if (valEl) valEl.textContent = val.toFixed(2);
    if (barEl) barEl.style.width = `${Math.round(val * 100)}%`;

    if (!state.buttonStates[i]) {
      state.buttonStates[i] = { pressed: false, clicks: 0, pressStartTime: 0, isStuck: false };
    }
    const bState = state.buttonStates[i];

    // Edge Detection:
    // Rising edge: false -> true = press
    if (isPressed && !bState.pressed) {
      bState.pressed = true;
      bState.pressStartTime = now;
    }
    // Falling edge: true -> false = release (increment count ONLY on complete release cycle)
    else if (!isPressed && bState.pressed) {
      bState.pressed = false;
      bState.isStuck = false;
      // Require 3 complete cycles
      if (bState.clicks < 3) {
        bState.clicks++;
      }
    }

    // Stuck button detection (> 3.5s held down)
    if (isPressed && (now - bState.pressStartTime > 3500)) {
      bState.isStuck = true;
    }

    const isValidated = bState.clicks >= 3;

    if (chip) {
      chip.classList.toggle('pressed', isPressed);
      chip.classList.toggle('testing', bState.clicks > 0 && !isValidated);
      chip.classList.toggle('passed', isValidated);
      chip.classList.toggle('validated', isValidated);
      chip.classList.toggle('stuck', bState.isStuck);
    }
    if (checkEl) {
      if (bState.isStuck) {
        checkEl.textContent = '⚠';
        checkEl.style.color = 'var(--red)';
      } else if (isValidated) {
        checkEl.textContent = '✓';
        checkEl.style.color = '#22c55e';
      } else if (bState.clicks > 0) {
        checkEl.textContent = `${bState.clicks}/3`;
        checkEl.style.color = 'var(--cyan)';
      } else {
        checkEl.textContent = '0/3';
        checkEl.style.color = 'var(--text-muted)';
      }
    }

    if (isValidated) validatedCount++;
    if (bState.isStuck) stuckCount++;
  }

  // Update compact progress chip under controller
  if (dom.chipBtnProgress) {
    dom.chipBtnProgress.textContent = `${validatedCount} / ${total} ✓`;
  }

  updateButtonsSummaryBadge();
  updateWorkflowProgress();
  updateOverallVerdict();
}

function updateButtonsSummaryBadge() {
  if (!dom.buttonsSummaryBadge) return;
  const total = Object.keys(state.buttonStates).length;
  if (total === 0) {
    dom.buttonsSummaryBadge.textContent = '0 / 0 ✓';
    return;
  }

  let passed = 0;
  let stuck = 0;
  for (const s of Object.values(state.buttonStates)) {
    if (s.clicks >= 3) passed++;
    if (s.isStuck) stuck++;
  }

  if (stuck > 0) {
    dom.buttonsSummaryBadge.textContent = `⚠ ${stuck} Atascado(s) • ${passed}/${total} ✓`;
    dom.buttonsSummaryBadge.style.color = 'var(--red)';
  } else {
    dom.buttonsSummaryBadge.textContent = `${passed} / ${total} ✓`;
    dom.buttonsSummaryBadge.style.color = (passed === total) ? '#22c55e' : 'var(--cyan)';
  }
}

// ─────────────────────────────────────────────────────────────
// 11. ADVANCED DRIFT BENCHMARK & FULL DIAGNOSTIC SUITE
// ─────────────────────────────────────────────────────────────
function startDriftCapture() {
  if (state.drift.capturing) return;

  state.drift.capturing = true;
  state.drift.startTime = performance.now();
  state.drift.samplesL = [];
  state.drift.samplesR = [];

  if (dom.driftResult) {
    dom.driftResult.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;justify-content:center;color:#a5b4fc;font-weight:700;">
        <span class="icon">⏱</span>
        <span>${t('suiteStepRest')}</span>
      </div>
    `;
  }
  if (dom.guidedInstructionText) {
    dom.guidedInstructionText.textContent = t('suiteStepRest');
  }
}

function finalizeDriftCapture() {
  state.drift.capturing = false;

  const sL = state.drift.samplesL;
  const sR = state.drift.samplesR;

  if (sL.length === 0 || sR.length === 0) return;

  // Left stick resting metrics
  const meanXL = sL.reduce((a, b) => a + b.x, 0) / sL.length;
  const meanYL = sL.reduce((a, b) => a + b.y, 0) / sL.length;
  const meanRadiusL = sL.reduce((a, b) => a + b.dist, 0) / sL.length;
  const maxRadiusL = Math.max(...sL.map(s => s.dist));
  const varianceL = sL.reduce((a, b) => a + Math.pow(b.dist - meanRadiusL, 2), 0) / sL.length;
  const jitterL = Math.sqrt(varianceL);

  // Right stick resting metrics
  const meanXR = sR.reduce((a, b) => a + b.x, 0) / sR.length;
  const meanYR = sR.reduce((a, b) => a + b.y, 0) / sR.length;
  const meanRadiusR = sR.reduce((a, b) => a + b.dist, 0) / sR.length;
  const maxRadiusR = Math.max(...sR.map(s => s.dist));
  const varianceR = sR.reduce((a, b) => a + Math.pow(b.dist - meanRadiusR, 2), 0) / sR.length;
  const jitterR = Math.sqrt(varianceR);

  // Save metrics persistently
  state.stickMetrics.l.drift  = maxRadiusL;
  state.stickMetrics.l.jitter = jitterL;
  if (dom.stickLDriftVal) dom.stickLDriftVal.textContent  = maxRadiusL.toFixed(3);
  if (dom.stickLJitterVal) dom.stickLJitterVal.textContent = jitterL.toFixed(3);

  // Evaluate L Center test
  if (maxRadiusL <= BENCHMARKS.STICK.DRIFT_EXCELLENT) {
    state.stickMetrics.l.tests.center = 'PASS';
  } else if (maxRadiusL <= BENCHMARKS.STICK.DRIFT_ACCEPTABLE) {
    state.stickMetrics.l.tests.center = 'REVIEW';
    state.stickMetrics.l.reviewReasons.push({ test: 'center', value: maxRadiusL.toFixed(4), threshold: BENCHMARKS.STICK.DRIFT_EXCELLENT });
  } else {
    state.stickMetrics.l.tests.center = 'FAIL';
    state.stickMetrics.l.failReasons.push({ test: 'center', value: maxRadiusL.toFixed(4), threshold: BENCHMARKS.STICK.DRIFT_ACCEPTABLE });
  }

  // Evaluate L Noise/Jitter test
  if (jitterL <= BENCHMARKS.STICK.JITTER_MAX) {
    state.stickMetrics.l.tests.noise = 'PASS';
  } else {
    state.stickMetrics.l.tests.noise = 'REVIEW';
    state.stickMetrics.l.reviewReasons.push({ test: 'noise', value: jitterL.toFixed(4), threshold: BENCHMARKS.STICK.JITTER_MAX });
  }

  // Save R metrics persistently
  state.stickMetrics.r.drift  = maxRadiusR;
  state.stickMetrics.r.jitter = jitterR;
  if (dom.stickRDriftVal) dom.stickRDriftVal.textContent  = maxRadiusR.toFixed(3);
  if (dom.stickRJitterVal) dom.stickRJitterVal.textContent = jitterR.toFixed(3);

  // Evaluate R Center test
  if (maxRadiusR <= BENCHMARKS.STICK.DRIFT_EXCELLENT) {
    state.stickMetrics.r.tests.center = 'PASS';
  } else if (maxRadiusR <= BENCHMARKS.STICK.DRIFT_ACCEPTABLE) {
    state.stickMetrics.r.tests.center = 'REVIEW';
    state.stickMetrics.r.reviewReasons.push({ test: 'center', value: maxRadiusR.toFixed(4), threshold: BENCHMARKS.STICK.DRIFT_EXCELLENT });
  } else {
    state.stickMetrics.r.tests.center = 'FAIL';
    state.stickMetrics.r.failReasons.push({ test: 'center', value: maxRadiusR.toFixed(4), threshold: BENCHMARKS.STICK.DRIFT_ACCEPTABLE });
  }

  // Evaluate R Noise/Jitter test
  if (jitterR <= BENCHMARKS.STICK.JITTER_MAX) {
    state.stickMetrics.r.tests.noise = 'PASS';
  } else {
    state.stickMetrics.r.tests.noise = 'REVIEW';
    state.stickMetrics.r.reviewReasons.push({ test: 'noise', value: jitterR.toFixed(4), threshold: BENCHMARKS.STICK.JITTER_MAX });
  }

  evaluateStickOverall('l');
  evaluateStickOverall('r');

  const centerPassL = state.stickMetrics.l.tests.center;
  const centerPassR = state.stickMetrics.r.tests.center;
  const isGood = centerPassL === 'PASS' && centerPassR === 'PASS';
  const hasFail = centerPassL === 'FAIL' || centerPassR === 'FAIL';

  if (dom.driftResult) {
    const badgeClass = hasFail ? 'badge-fail' : (isGood ? 'badge-pass' : 'badge-review');
    const badgeText = hasFail ? t('verdictFail') : (isGood ? t('verdictPass') : t('verdictReview'));
    dom.driftResult.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:4px 8px;">
        <div>
          <strong>Drift:</strong> L: ${maxRadiusL.toFixed(3)} | R: ${maxRadiusR.toFixed(3)}
        </div>
        <span class="stick-verdict-badge ${badgeClass}">
          ${badgeText}
        </span>
      </div>
    `;
  }
}

function startFullSuite() {
  state.suite.running = true;
  state.suite.step = 1;
  state.suite.startTime = performance.now();

  startDriftCapture();

  // Step 2: Circularity
  setTimeout(() => {
    state.suite.step = 2;
    if (dom.driftResult) {
      dom.driftResult.innerHTML = `
        <div style="color:var(--accent);font-weight:700;text-align:center;">
          ${t('suiteStepCirc')}
        </div>
      `;
    }
    if (dom.guidedInstructionText) {
      dom.guidedInstructionText.textContent = t('suiteStepCirc');
    }
  }, 3200);

  // Step 3: Snapback
  setTimeout(() => {
    state.suite.step = 3;
    if (dom.driftResult) {
      dom.driftResult.innerHTML = `
        <div style="color:#00e5ff;font-weight:700;text-align:center;">
          ${t('suiteStepSnap')}
        </div>
      `;
    }
    if (dom.guidedInstructionText) {
      dom.guidedInstructionText.textContent = t('suiteStepSnap');
    }
  }, 7500);

  // Suite completion
  setTimeout(() => {
    state.suite.running = false;
    if (dom.driftResult) {
      dom.driftResult.innerHTML = `
        <div style="color:var(--green);font-weight:700;text-align:center;">
          ${t('suiteDone')}
        </div>
      `;
    }
    updateWorkflowProgress();
    updateOverallVerdict();
  }, 12000);
}

// ─────────────────────────────────────────────────────────────
// 12. CANVAS HIGH-DPI CARTESIAN STICK RENDERING
// ─────────────────────────────────────────────────────────────
function drawLargeStick(canvas, rawX, rawY, isLeft, history = []) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const cx = w / 2;
  const cy = h / 2;
  const r = (w / 2) - 10;

  ctx.clearRect(0, 0, w, h);

  // Background Dial
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = '#101018';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#2b2b3e';
  ctx.stroke();

  // Grid Concentric Circles (25%, 50%, 75%, 100%)
  const steps = [0.25, 0.50, 0.75, 1.0];
  steps.forEach(s => {
    ctx.beginPath();
    ctx.arc(cx, cy, r * s, 0, Math.PI * 2);
    ctx.strokeStyle = s === 1.0 ? '#3f3f58' : 'rgba(255,255,255,0.06)';
    ctx.lineWidth = s === 1.0 ? 1.5 : 1;
    ctx.stroke();
  });

  // Center Deadzone threshold ring (5% factory threshold)
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.05, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Cartesian Crosshair Axes
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.lineTo(cx, cy + r);
  ctx.moveTo(cx - r, cy);
  ctx.lineTo(cx + r, cy);
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Trace Trajectory history
  if (history && history.length > 1) {
    ctx.beginPath();
    for (let i = 0; i < history.length; i++) {
      const px = cx + history[i].x * r;
      const py = cy + history[i].y * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // Live Position Vector line
  const posX = cx + rawX * r;
  const posY = cy + rawY * r;

  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(posX, posY);
  ctx.strokeStyle = 'rgba(0, 229, 255, 0.6)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Current Position Puck
  ctx.beginPath();
  ctx.arc(posX, posY, 10, 0, Math.PI * 2);
  ctx.fillStyle = '#00e5ff';
  ctx.shadowColor = '#00e5ff';
  ctx.shadowBlur = 10;
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.beginPath();
  ctx.arc(posX, posY, 4, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
}

// ─────────────────────────────────────────────────────────────
// 13. RAW INPUT TECHNICAL DIAGNOSTICS (DRAWER)
// ─────────────────────────────────────────────────────────────
function updateRawDiagnostics(gp) {
  if (!gp || !state.rawAccordionOpen) return;
  if (dom.rawId) dom.rawId.textContent = gp.id || '—';
  if (dom.rawIndex) dom.rawIndex.textContent = String(gp.index);
  if (dom.rawMapping) dom.rawMapping.textContent = gp.mapping || 'non-standard';
  if (dom.rawTotalBtns) dom.rawTotalBtns.textContent = String(gp.buttons.length);
  if (dom.rawTotalAxes) dom.rawTotalAxes.textContent = String(gp.axes.length);

  // Raw Axes list
  if (dom.rawAxesList) {
    let axesHtml = '';
    for (let i = 0; i < gp.axes.length; i++) {
      const val = gp.axes[i] || 0;
      const pct = Math.round(((val + 1) / 2) * 100);
      axesHtml += `
        <div class="raw-axis-row">
          <span class="raw-axis-tag">Axis ${i}:</span>
          <span class="raw-axis-val">${val >= 0 ? '+' : ''}${val.toFixed(3)}</span>
          <div class="raw-axis-bar-bg">
            <div class="raw-axis-bar-fill" style="width:${pct}%;"></div>
          </div>
        </div>
      `;
    }
    dom.rawAxesList.innerHTML = axesHtml;
  }

  // Raw Buttons list
  if (dom.rawButtonsList) {
    let btnsHtml = '';
    for (let i = 0; i < gp.buttons.length; i++) {
      const b = gp.buttons[i];
      const val = typeof b === 'object' ? b.value : (b ? 1 : 0);
      const on = typeof b === 'object' ? b.pressed : (val > 0.5);
      btnsHtml += `
        <div class="raw-btn-row">
          <span class="raw-btn-tag">Btn ${i}:</span>
          <span class="raw-btn-val">${val.toFixed(2)}</span>
          <div class="raw-btn-indicator ${on ? 'on' : ''}"></div>
        </div>
      `;
    }
    dom.rawButtonsList.innerHTML = btnsHtml;
  }
}

// ─────────────────────────────────────────────────────────────
// 14. PHOTO OVERLAY & REAL-TIME CONTROLS FEEDBACK
// ─────────────────────────────────────────────────────────────
function buildPhotoOverlay(model) {
  const allProfiles = (typeof CONTROLLER_PROFILES !== 'undefined' && CONTROLLER_PROFILES)
    || (typeof window !== 'undefined' && window.CONTROLLER_PROFILES)
    || {};
  const profile = allProfiles[model] || allProfiles['generic'] || { controls: {} };

  if (dom.photoOverlaySvg) {
    dom.photoOverlaySvg.setAttribute('viewBox', profile.viewBox || '0 0 1024 1024');
    dom.photoOverlaySvg.setAttribute('preserveAspectRatio', 'none');
  }
  fitPhotoStage();

  let svgHtml = `
    <defs>
      <filter id="photo-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="8" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  `;

  if (profile.lightbar) {
    const lb = profile.lightbar;
    svgHtml += `<rect id="photo-lightbar" x="${lb.x}" y="${lb.y}" width="${lb.w}" height="${lb.h}" rx="${lb.rx || 4}" class="photo-lightbar" />`;
  }

  if (profile.controls) {
    for (const [idxStr, c] of Object.entries(profile.controls)) {
      const i = parseInt(idxStr, 10);
      const title = c.name || `Botón ${i}`;
      const isAnalogTrig = !!c.isAnalog;

      if (c.type === 'circle') {
        svgHtml += `<circle id="photo-btn-${i}" cx="${c.cx}" cy="${c.cy}" r="${c.r}" class="photo-btn" data-btn="${i}" data-title="${title}"><title>${title}</title></circle>`;
      } else if (c.type === 'rect') {
        svgHtml += `<rect id="photo-btn-${i}" x="${c.x}" y="${c.y}" width="${c.w}" height="${c.h}" rx="${c.rx || 8}" class="photo-btn" data-btn="${i}" data-title="${title}"><title>${title}</title></rect>`;
      } else if (c.type === 'trigger') {
        svgHtml += `<rect id="photo-btn-${i}" x="${c.x}" y="${c.y}" width="${c.w}" height="${c.h}" rx="${c.rx || 10}" class="photo-btn photo-trigger" data-btn="${i}" data-analog="${isAnalogTrig}" data-title="${title}"><title>${title}</title></rect>`;
      } else if (c.type === 'pill') {
        svgHtml += `<ellipse id="photo-btn-${i}" cx="${c.cx}" cy="${c.cy}" rx="${c.rx}" ry="${c.ry}" class="photo-btn photo-pill" data-btn="${i}" data-title="${title}"><title>${title}</title></ellipse>`;
      } else if (c.type === 'dpad') {
        const x = c.cx - (c.w / 2);
        const y = c.cy - (c.h / 2);
        svgHtml += `<rect id="photo-btn-${i}" x="${x}" y="${y}" width="${c.w}" height="${c.h}" rx="6" class="photo-btn photo-dpad" data-btn="${i}" data-dir="${c.dir || ''}" data-title="${title}"><title>${title}</title></rect>`;
      } else if (c.type === 'stick') {
        const stickId = (i === 10) ? 'photo-stick-l' : 'photo-stick-r';
        svgHtml += `
          <circle id="photo-btn-${i}" cx="${c.cx}" cy="${c.cy}" r="${c.r}" class="photo-btn photo-stick" data-btn="${i}" stroke-dasharray="4 4" data-title="${title}"><title>${title}</title></circle>
          <circle id="${stickId}" cx="${c.cx}" cy="${c.cy}" r="${c.r * 0.55}" class="photo-stick-puck" style="transform-origin:${c.cx}px ${c.cy}px;" />
        `;
      }
    }
  }

  if (dom.photoOverlaySvg) {
    dom.photoOverlaySvg.innerHTML = svgHtml;
  }

  state.photoBtns = {};
  for (let i = 0; i <= 20; i++) {
    const el = document.getElementById(`photo-btn-${i}`);
    if (el) {
      state.photoBtns[i] = el;
      // Re-apply passed / stuck status if already checked
      const bState = state.buttonStates[i];
      if (bState) {
        if (bState.isStuck) el.classList.add('stuck');
        else if (bState.clicks >= 3) el.classList.add('passed');
      }
    }
  }
  state.photoStickL   = document.getElementById('photo-stick-l');
  state.photoStickR   = document.getElementById('photo-stick-r');
  state.photoLightbar = document.getElementById('photo-lightbar');
}

function highlightActiveOverlay(gp, axes) {
  if (!gp) return;

  for (let i = 0; i < gp.buttons.length; i++) {
    const b = gp.buttons[i];
    const val = typeof b === 'object' ? b.value : (b ? 1 : 0);
    const isPressed = typeof b === 'object' ? b.pressed : (val > 0.4);
    const el = state.photoBtns[i];
    const bState = state.buttonStates[i];

    if (el) {
      if (isPressed) {
        el.classList.add('pressed');
      } else {
        el.classList.remove('pressed');
      }

      if (bState) {
        if (bState.isStuck) {
          el.classList.add('stuck');
          el.classList.remove('passed');
        } else if (bState.clicks >= 3) {
          el.classList.add('passed');
          el.classList.remove('stuck');
        }
      }
    }
  }

  // Move stick pucks on photo overlay
  if (state.photoStickL) {
    const tx = axes.lx * 20;
    const ty = axes.ly * 20;
    state.photoStickL.style.transform = `translate(${tx}px, ${ty}px)`;
    const btn10 = gp.buttons[10];
    const isL3 = btn10 ? (typeof btn10 === 'object' ? btn10.pressed : btn10 > 0.5) : false;
    state.photoStickL.classList.toggle('pressed', isL3);
  }
  if (state.photoStickR) {
    const tx = axes.rx * 20;
    const ty = axes.ry * 20;
    state.photoStickR.style.transform = `translate(${tx}px, ${ty}px)`;
    const btn11 = gp.buttons[11];
    const isR3 = btn11 ? (typeof btn11 === 'object' ? btn11.pressed : btn11 > 0.5) : false;
    state.photoStickR.classList.toggle('pressed', isR3);
  }
}

function resolveModel() {
  const choice = dom.modelSelect ? dom.modelSelect.value : 'auto';
  if (choice !== 'auto') {
    state.model = choice;
    if (dom.emptyStateView) dom.emptyStateView.style.display = 'none';
    if (dom.photoViewBox) dom.photoViewBox.style.display   = 'flex';
    if (dom.ctrlBottomChip) dom.ctrlBottomChip.style.display = 'flex';
  } else {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gp = state.activeGpIndex !== null ? gamepads[state.activeGpIndex] : null;
    state.model = gp ? detectControllerModel(gp.id, gp.mapping) : 'ps4';
    if (!gp) {
      if (dom.emptyStateView) dom.emptyStateView.style.display = 'flex';
      if (dom.photoViewBox) dom.photoViewBox.style.display   = 'none';
      if (dom.ctrlBottomChip) dom.ctrlBottomChip.style.display = 'none';
    }
  }

  if (dom.chipModelName) {
    dom.chipModelName.textContent = getControllerFriendlyName(state.model);
  }

  // Load photo
  if (dom.photoImg) {
    dom.photoImg.src = `assets/controllers/${state.model}.png`;
  }
  buildPhotoOverlay(state.model);
  fitPhotoStage();
}

// ─────────────────────────────────────────────────────────────
// 15. GUIDED WORKFLOW PROGRESSION & REAL-TIME CERTIFICATION
// ─────────────────────────────────────────────────────────────
function updateWorkflowProgress() {
  if (state.activeGpIndex === null) {
    // Empty state
    if (dom.stepBtn)    { dom.stepBtn.className = 'step-chip'; if (dom.checkBtn) dom.checkBtn.textContent = '○'; }
    if (dom.stepTrig)   { dom.stepTrig.className = 'step-chip'; if (dom.checkTrig) dom.checkTrig.textContent = '○'; }
    if (dom.stepStickL) { dom.stepStickL.className = 'step-chip'; if (dom.checkStickL) dom.checkStickL.textContent = '○'; }
    if (dom.stepStickR) { dom.stepStickR.className = 'step-chip'; if (dom.checkStickR) dom.checkStickR.textContent = '○'; }
    if (dom.stepCert)   { dom.stepCert.className = 'step-chip'; if (dom.checkCert) dom.checkCert.textContent = '○'; }

    if (dom.guidedInstructionText) {
      dom.guidedInstructionText.textContent = t('emptyStateConnectMsg');
    }
    return;
  }

  const totalBtns = Object.keys(state.buttonStates).length || 16;
  const passedBtns = Object.values(state.buttonStates).filter(b => b.clicks >= 3).length;
  const stuckBtns = Object.values(state.buttonStates).filter(b => b.isStuck).length;
  const buttonsDone = (totalBtns > 0 && passedBtns >= totalBtns && stuckBtns === 0);

  const tL = state.triggers.l2;
  const tR = state.triggers.r2;
  const triggersDone = (tL.verdict === 'PASS' && tR.verdict === 'PASS') || (tL.max >= 0.94 && tR.max >= 0.94);

  const sl = state.stickMetrics.l;
  const sr = state.stickMetrics.r;
  const stickLDone = (sl.verdict === 'PASS');
  const stickRDone = (sr.verdict === 'PASS');

  const certDone = buttonsDone && triggersDone && stickLDone && stickRDone;

  // Determine current active step
  let activeStep = 1;
  if (!buttonsDone) activeStep = 1;
  else if (!triggersDone) activeStep = 2;
  else if (!stickLDone) activeStep = 3;
  else if (!stickRDone) activeStep = 4;
  else activeStep = 5;

  // Step 1: Buttons
  if (dom.stepBtn) {
    dom.stepBtn.className = buttonsDone ? 'step-chip passed' : (activeStep === 1 ? 'step-chip active' : 'step-chip');
    if (dom.checkBtn) dom.checkBtn.textContent = buttonsDone ? '✓' : '○';
  }
  // Step 2: Triggers
  if (dom.stepTrig) {
    dom.stepTrig.className = triggersDone ? 'step-chip passed' : (activeStep === 2 ? 'step-chip active' : 'step-chip');
    if (dom.checkTrig) dom.checkTrig.textContent = triggersDone ? '✓' : '○';
  }
  // Step 3: Stick L
  if (dom.stepStickL) {
    dom.stepStickL.className = stickLDone ? 'step-chip passed' : (activeStep === 3 ? 'step-chip active' : 'step-chip');
    if (dom.checkStickL) dom.checkStickL.textContent = stickLDone ? '✓' : '○';
  }
  // Step 4: Stick R
  if (dom.stepStickR) {
    dom.stepStickR.className = stickRDone ? 'step-chip passed' : (activeStep === 4 ? 'step-chip active' : 'step-chip');
    if (dom.checkStickR) dom.checkStickR.textContent = stickRDone ? '✓' : '○';
  }
  // Step 5: Cert
  if (dom.stepCert) {
    dom.stepCert.className = certDone ? 'step-chip passed' : (activeStep === 5 ? 'step-chip active' : 'step-chip');
    if (dom.checkCert) dom.checkCert.textContent = certDone ? '✓' : '○';
  }

  // Dynamic instruction banner (only update if not running diagnostic suite)
  if (dom.guidedInstructionText && !state.suite.running) {
    if (activeStep === 1) {
      dom.guidedInstructionText.textContent = `${t('instructionStep1')} (${passedBtns}/${totalBtns})`;
    } else if (activeStep === 2) {
      dom.guidedInstructionText.textContent = t('instructionStep2');
    } else if (activeStep === 3) {
      dom.guidedInstructionText.textContent = t('instructionStep3');
    } else if (activeStep === 4) {
      dom.guidedInstructionText.textContent = t('instructionStep4');
    } else {
      dom.guidedInstructionText.textContent = t('instructionStep5');
    }
  }
}

// ─────────────────────────────────────────────────────────────
// 15. AUTHORITATIVE QUALITY CERTIFICATION & WORKFLOW
// ─────────────────────────────────────────────────────────────
function calculateAuthoritativeOverallVerdict() {
  const sl = state.stickMetrics.l;
  const sr = state.stickMetrics.r;
  const tL = state.triggers.l2;
  const tR = state.triggers.r2;

  const totalBtns = Object.keys(state.buttonStates).length || 16;
  const passedBtns = Object.values(state.buttonStates).filter(b => b.clicks >= 3).length;
  const stuckBtns = Object.values(state.buttonStates).filter(b => b.isStuck).length;

  let btnVerdict = 'PENDING';
  if (stuckBtns > 0) {
    btnVerdict = 'FAIL';
  } else if (totalBtns > 0 && passedBtns >= totalBtns) {
    btnVerdict = 'PASS';
  } else if (passedBtns > 0) {
    btnVerdict = 'TESTING';
  }

  // Check Failures first
  if (sl.verdict === 'FAIL' || sr.verdict === 'FAIL' || tL.verdict === 'FAIL' || tR.verdict === 'FAIL' || btnVerdict === 'FAIL') {
    return 'FAIL';
  }

  // Check Review
  if (sl.verdict === 'REVIEW' || sr.verdict === 'REVIEW' || tL.verdict === 'REVIEW' || tR.verdict === 'REVIEW') {
    return 'REVIEW';
  }

  // Check all PASS
  const triggersPassed = (tL.verdict === 'PASS' || tL.samples < 2) && (tR.verdict === 'PASS' || tR.samples < 2);
  if (btnVerdict === 'PASS' && triggersPassed && sl.verdict === 'PASS' && sr.verdict === 'PASS') {
    return 'PASS';
  }

  // If any testing is happening
  if (passedBtns > 0 || sl.verdict === 'TESTING' || sr.verdict === 'TESTING' || btnVerdict === 'TESTING') {
    return 'TESTING';
  }

  return 'PENDING';
}

function updateOverallVerdict() {
  const overall = calculateAuthoritativeOverallVerdict();
  state.overallVerdict = overall;

  let stampText = t('verdictPending');
  let stampClass = 'stamp-pending';

  if (overall === 'FAIL') {
    stampText = `✕ ${t('verdictFail')}`;
    stampClass = 'stamp-fail';
  } else if (overall === 'REVIEW') {
    stampText = `! ${t('verdictReview')}`;
    stampClass = 'stamp-review';
  } else if (overall === 'PASS') {
    stampText = `✓ ${t('verdictPass')}`;
    stampClass = 'stamp-pass';
  } else if (overall === 'TESTING') {
    stampText = `⏳ ${t('verdictTesting') || 'EN PRUEBA'}`;
    stampClass = 'stamp-pending';
  }

  if (dom.overallVerdictStamp) {
    dom.overallVerdictStamp.className = `verdict-stamp ${stampClass}`;
    dom.overallVerdictStamp.textContent = stampText;
  }
}

// ─────────────────────────────────────────────────────────────
// 16. PERSISTENCE & HISTORY STORE (DiagnosticStore)
// ─────────────────────────────────────────────────────────────
const DiagnosticStore = {
  KEY: 'gamepad_diagnostics_records',

  getAll() {
    try {
      const raw = localStorage.getItem(this.KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  },

  save(record) {
    const list = this.getAll();
    list.unshift(record);
    if (list.length > 100) list.pop(); // Keep last 100
    try {
      localStorage.setItem(this.KEY, JSON.stringify(list));
    } catch (e) {}
    return record;
  },

  delete(id) {
    let list = this.getAll();
    list = list.filter(r => r.id !== id);
    try {
      localStorage.setItem(this.KEY, JSON.stringify(list));
    } catch (e) {}
  },

  clear() {
    try {
      localStorage.removeItem(this.KEY);
    } catch (e) {}
  }
};

function saveCurrentSessionDiagnostic() {
  const itemCode = (dom.itemCodeInput && dom.itemCodeInput.value ? dom.itemCodeInput.value : '18427').trim();
  const dateStr = new Date().toLocaleString();

  const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
  const gp = state.activeGpIndex !== null ? gamepads[state.activeGpIndex] : null;
  const devName = gp ? gp.id : 'Mando Genérico';

  const sl = state.stickMetrics.l;
  const sr = state.stickMetrics.r;
  const tL = state.triggers.l2;
  const tR = state.triggers.r2;

  const totalBtns = Object.keys(state.buttonStates).length || 16;
  const passedBtns = Object.values(state.buttonStates).filter(b => b.clicks >= 3).length;
  const stuckBtns = Object.values(state.buttonStates).filter(b => b.isStuck).length;
  const btnVerdict = stuckBtns > 0 ? 'FAIL' : (passedBtns >= totalBtns ? 'PASS' : 'REVIEW');

  // Authoritative Overall Verdict
  const overall = calculateAuthoritativeOverallVerdict();

  const record = {
    id: 'DIAG-' + Date.now(),
    itemCode,
    date: dateStr,
    timestamp: Date.now(),
    device: devName,
    profile: state.model,
    stickL: { 
      drift: sl.drift, 
      jitter: sl.jitter, 
      coverage: sl.coverage, 
      circularity: sl.circularity, 
      range: sl.range, 
      returnTime: sl.returnTime, 
      verdict: sl.verdict 
    },
    stickR: { 
      drift: sr.drift, 
      jitter: sr.jitter, 
      coverage: sr.coverage, 
      circularity: sr.circularity, 
      range: sr.range, 
      returnTime: sr.returnTime, 
      verdict: sr.verdict 
    },
    triggers: { l2Verdict: tL.verdict, r2Verdict: tR.verdict },
    buttons: { passed: passedBtns, total: totalBtns, stuck: stuckBtns, verdict: btnVerdict },
    overallVerdict: overall
  };

  DiagnosticStore.save(record);
  alert(`${t('savedSuccess')} ${itemCode}\nResultado: ${overall}`);
}

function renderHistoryTable(filter = '') {
  const records = DiagnosticStore.getAll();
  const f = filter.toLowerCase();

  let filtered = records;
  if (f) {
    filtered = records.filter(r => 
      (r.itemCode && r.itemCode.toLowerCase().includes(f)) ||
      (r.device && r.device.toLowerCase().includes(f)) ||
      (r.id && r.id.toLowerCase().includes(f))
    );
  }

  if (!dom.historyTableBody) return;
  dom.historyTableBody.innerHTML = '';

  if (filtered.length === 0) {
    dom.historyTableBody.innerHTML = `<tr><td colspan="9" style="text-align:center;color:var(--text-muted);padding:14px;">No hay diagnósticos guardados</td></tr>`;
    return;
  }

  filtered.forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${r.itemCode}</strong></td>
      <td>${r.date}</td>
      <td style="max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${r.device}">${r.device}</td>
      <td><span class="stick-verdict-badge badge-${(r.stickL.verdict || 'pending').toLowerCase()}">${r.stickL.verdict || '—'}</span></td>
      <td><span class="stick-verdict-badge badge-${(r.stickR.verdict || 'pending').toLowerCase()}">${r.stickR.verdict || '—'}</span></td>
      <td><span class="stick-verdict-badge badge-${(r.triggers.l2Verdict || 'pending').toLowerCase()}">${r.triggers.l2Verdict || '—'}</span></td>
      <td>${r.buttons.passed}/${r.buttons.total}</td>
      <td><span class="stick-verdict-badge badge-${(r.overallVerdict || 'pending').toLowerCase()}">${r.overallVerdict}</span></td>
      <td>
        <button class="mini-btn" onclick="printSavedRecord('${r.id}')" title="Imprimir este informe">🖨</button>
        <button class="mini-btn-danger" onclick="deleteSavedRecord('${r.id}')" title="Eliminar">✕</button>
      </td>
    `;
    dom.historyTableBody.appendChild(tr);
  });
}

window.printSavedRecord = function(id) {
  const records = DiagnosticStore.getAll();
  const r = records.find(rec => rec.id === id);
  if (!r) return;
  populatePrintReport(r);
  window.print();
};

window.deleteSavedRecord = function(id) {
  if (confirm('¿Eliminar este registro del historial?')) {
    DiagnosticStore.delete(id);
    renderHistoryTable(dom.historySearchInput ? dom.historySearchInput.value : '');
  }
};

// ─────────────────────────────────────────────────────────────
// 17. A4 PRINTABLE REPORT GENERATOR & SVG BARCODE
// ─────────────────────────────────────────────────────────────
function generateSvgBarcode(code) {
  const clean = String(code).replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  let bars = '';
  let x = 10;
  for (let i = 0; i < clean.length; i++) {
    const charCode = clean.charCodeAt(i);
    const pattern = [(charCode % 3) + 1, ((charCode >> 1) % 2) + 1, ((charCode >> 2) % 3) + 1, 2];
    pattern.forEach((w, idx) => {
      if (idx % 2 === 0) {
        bars += `<rect x="${x}" y="5" width="${w * 1.5}" height="35" fill="#000" />`;
      }
      x += w * 2.2;
    });
  }
  return `<svg width="${x + 10}" height="45" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="5" width="2" height="35" fill="#000"/>
    <rect x="6" y="5" width="2" height="35" fill="#000"/>
    ${bars}
    <rect x="${x}" y="5" width="2" height="35" fill="#000"/>
    <rect x="${x + 4}" y="5" width="2" height="35" fill="#000"/>
  </svg>`;
}

function populatePrintReport(record) {
  const itemCode = record ? record.itemCode : ((dom.itemCodeInput && dom.itemCodeInput.value) || '18427').trim();
  const dateStr  = record ? record.date : new Date().toLocaleString();
  const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
  const gp = state.activeGpIndex !== null ? gamepads[state.activeGpIndex] : null;
  const devName  = record ? record.device : (gp ? gp.id : 'Mando Genérico');
  const profile  = record ? record.profile : state.model;

  if (dom.printBarcodeSvg)  dom.printBarcodeSvg.innerHTML = generateSvgBarcode(itemCode);
  if (dom.printBarcodeText) dom.printBarcodeText.textContent = `ART-${itemCode}`;
  if (dom.printItemCode)    dom.printItemCode.textContent = itemCode;
  if (dom.printDate)        dom.printDate.textContent = dateStr;
  if (dom.printDeviceName)  dom.printDeviceName.textContent = devName;
  if (dom.printDeviceProfile) dom.printDeviceProfile.textContent = profile.toUpperCase();
  if (dom.printDeviceId)    dom.printDeviceId.textContent = devName;

  const sl = record ? record.stickL : state.stickMetrics.l;
  const sr = record ? record.stickR : state.stickMetrics.r;

  // Real measured values only - NO fake defaults!
  // Support both new schema (circularity/coverage/returnTime) and historical keys if present
  const slCirc = sl.circularity !== undefined ? sl.circularity : (sl.circ !== undefined ? sl.circ : null);
  const slSnap = sl.returnTime !== undefined ? sl.returnTime : (sl.snap !== undefined ? sl.snap : null);
  const srCirc = sr.circularity !== undefined ? sr.circularity : (sr.circ !== undefined ? sr.circ : null);
  const srSnap = sr.returnTime !== undefined ? sr.returnTime : (sr.snap !== undefined ? sr.snap : null);

  if (dom.printSlDrift)   dom.printSlDrift.textContent   = sl.drift !== null && sl.drift !== undefined ? sl.drift.toFixed(3) : '—';
  if (dom.printSlJitter)  dom.printSlJitter.textContent  = sl.jitter !== null && sl.jitter !== undefined ? sl.jitter.toFixed(3) : '—';
  if (dom.printSlCirc)    dom.printSlCirc.textContent    = slCirc !== null && slCirc !== undefined ? `${slCirc}%` : '—';
  if (dom.printSlSnap)    dom.printSlSnap.textContent    = slSnap !== null && slSnap !== undefined ? `${slSnap}ms` : '—';
  if (dom.printSlVerdict) dom.printSlVerdict.textContent = sl.verdict || 'PENDING';

  if (dom.printSrDrift)   dom.printSrDrift.textContent   = sr.drift !== null && sr.drift !== undefined ? sr.drift.toFixed(3) : '—';
  if (dom.printSrJitter)  dom.printSrJitter.textContent  = sr.jitter !== null && sr.jitter !== undefined ? sr.jitter.toFixed(3) : '—';
  if (dom.printSrCirc)    dom.printSrCirc.textContent    = srCirc !== null && srCirc !== undefined ? `${srCirc}%` : '—';
  if (dom.printSrSnap)    dom.printSrSnap.textContent    = srSnap !== null && srSnap !== undefined ? `${srSnap}ms` : '—';
  if (dom.printSrVerdict) dom.printSrVerdict.textContent = sr.verdict || 'PENDING';

  const tL = record ? record.triggers.l2Verdict : state.triggers.l2.verdict;
  const tR = record ? record.triggers.r2Verdict : state.triggers.r2.verdict;
  if (dom.printL2Verdict) dom.printL2Verdict.textContent = tL || 'PENDING';
  if (dom.printR2Verdict) dom.printR2Verdict.textContent = tR || 'PENDING';

  const btnTotal = record ? record.buttons.total : Object.keys(state.buttonStates).length || 16;
  const btnPassed= record ? record.buttons.passed : Object.values(state.buttonStates).filter(b => b.clicks >= 3).length;
  const btnStuck = record ? record.buttons.stuck : Object.values(state.buttonStates).filter(b => b.isStuck).length;

  if (dom.printBtnCount)   dom.printBtnCount.textContent = `${btnPassed} / ${btnTotal}`;
  if (dom.printBtnStuck)   dom.printBtnStuck.textContent = `${btnStuck} (${btnStuck === 0 ? 'Ninguno' : 'Defecto'})`;
  if (dom.printBtnVerdict) dom.printBtnVerdict.textContent = btnStuck > 0 ? 'FAIL' : (btnPassed >= btnTotal ? 'PASS' : 'REVIEW');

  // Exact Authoritative Verdict mapping - NEVER map REVIEW to PASS!
  const overall = record ? record.overallVerdict : calculateAuthoritativeOverallVerdict();
  if (dom.printFinalStamp) {
    if (overall === 'PASS') {
      dom.printFinalStamp.textContent = 'APTO (PASS)';
      dom.printFinalStamp.className = 'verdict-stamp stamp-pass';
    } else if (overall === 'REVIEW') {
      dom.printFinalStamp.textContent = 'A REVISIÓN (REVIEW)';
      dom.printFinalStamp.className = 'verdict-stamp stamp-review';
    } else if (overall === 'FAIL') {
      dom.printFinalStamp.textContent = 'NO APTO (FAIL)';
      dom.printFinalStamp.className = 'verdict-stamp stamp-fail';
    } else {
      dom.printFinalStamp.textContent = 'PENDIENTE (INCOMPLETO)';
      dom.printFinalStamp.className = 'verdict-stamp stamp-pending';
    }
  }
}

function updateVerdictBadgesUI() {
  evaluateStickOverall('l');
  evaluateStickOverall('r');
  updateTriggersSummaryBadge();
}

// ─────────────────────────────────────────────────────────────
// 18. INITIALIZATION & EVENT LISTENERS
// ─────────────────────────────────────────────────────────────
function initEventListeners() {
  // Floating Language Switcher menu items
  document.querySelectorAll('#lang-menu button[data-lang]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = e.currentTarget || e.target;
      setLanguage(target.dataset.lang);
    });
  });

  // Active Gamepad Select
  if (dom.activeGamepadSelect) {
    dom.activeGamepadSelect.addEventListener('change', (e) => {
      const val = parseInt(e.target.value, 10);
      setActiveGamepad(val >= 0 ? val : null);
    });
  }

  // Model Profile Select
  if (dom.modelSelect) {
    dom.modelSelect.addEventListener('change', () => {
      resolveModel();
    });
  }

  // Toggle Technical Details Drawer
  if (dom.btnToggleDetails) {
    dom.btnToggleDetails.addEventListener('click', () => {
      state.rawAccordionOpen = !state.rawAccordionOpen;
      if (dom.rawDiagCard) {
        dom.rawDiagCard.style.display = state.rawAccordionOpen ? 'flex' : 'none';
      }
      dom.btnToggleDetails.classList.toggle('active', state.rawAccordionOpen);
    });
  }

  if (dom.btnCloseDetails) {
    dom.btnCloseDetails.addEventListener('click', () => {
      state.rawAccordionOpen = false;
      if (dom.rawDiagCard) {
        dom.rawDiagCard.style.display = 'none';
      }
      if (dom.btnToggleDetails) {
        dom.btnToggleDetails.classList.remove('active');
      }
    });
  }

  // Micro-Center Zoom button
  if (dom.stickZoomBtn) {
    dom.stickZoomBtn.addEventListener('click', () => {
      state.centerZoom = !state.centerZoom;
      dom.stickZoomBtn.classList.toggle('active', state.centerZoom);
    });
  }

  // Diagnostic Stick Suite & Drift buttons
  if (dom.stickSuiteBtn) dom.stickSuiteBtn.addEventListener('click', startFullSuite);
  if (dom.driftBtn)      dom.driftBtn.addEventListener('click', startDriftCapture);
  if (dom.stickClearTraceBtn) {
    dom.stickClearTraceBtn.addEventListener('click', () => {
      state.stickHistoryL = [];
      state.stickHistoryR = [];
      state.circleBinsL = new Array(36).fill(0);
      state.circleBinsR = new Array(36).fill(0);
      state.snapL = { state: 'IDLE', startTime: 0, peakDist: 0, lastDist: 0, stabilizeStartTime: 0, done: false };
      state.snapR = { state: 'IDLE', startTime: 0, peakDist: 0, lastDist: 0, stabilizeStartTime: 0, done: false };
      if (dom.stickLCircVal) dom.stickLCircVal.textContent = '—';
      if (dom.stickRCircVal) dom.stickRCircVal.textContent = '—';
      if (dom.stickLSnapVal) dom.stickLSnapVal.textContent = '—';
      if (dom.stickRSnapVal) dom.stickRSnapVal.textContent = '—';
      if (dom.stickLCanvas) drawLargeStick(dom.stickLCanvas, 0, 0, true, []);
      if (dom.stickRCanvas) drawLargeStick(dom.stickRCanvas, 0, 0, false, []);
    });
  }

  // Reset button testing matrix
  if (dom.btnResetButtonsTest) {
    dom.btnResetButtonsTest.addEventListener('click', () => {
      for (const b of Object.values(state.buttonStates)) {
        b.clicks = 0;
        b.isStuck = false;
      }
      if (dom.photoOverlaySvg) {
        dom.photoOverlaySvg.querySelectorAll('.photo-btn').forEach(btn => {
          btn.classList.remove('passed', 'stuck', 'pressed');
        });
      }
      buildButtonChips(Object.keys(state.buttonStates).length || 16);
      updateWorkflowProgress();
      updateOverallVerdict();
    });
  }

  // Session Actions
  if (dom.btnSaveDiag)  dom.btnSaveDiag.addEventListener('click', saveCurrentSessionDiagnostic);
  if (dom.btnQuickSave) dom.btnQuickSave.addEventListener('click', saveCurrentSessionDiagnostic);
  if (dom.btnPrintReport) {
    dom.btnPrintReport.addEventListener('click', () => {
      populatePrintReport(null);
      window.print();
    });
  }

  // History Modal
  if (dom.btnOpenHistory) {
    dom.btnOpenHistory.addEventListener('click', () => {
      if (dom.historyModal) dom.historyModal.style.display = 'flex';
      renderHistoryTable();
    });
  }
  if (dom.modalCloseBtn) {
    dom.modalCloseBtn.addEventListener('click', () => {
      if (dom.historyModal) dom.historyModal.style.display = 'none';
    });
  }
  if (dom.historyModal) {
    dom.historyModal.addEventListener('click', (e) => {
      if (e.target === dom.historyModal) dom.historyModal.style.display = 'none';
    });
  }

  if (dom.historySearchInput) {
    dom.historySearchInput.addEventListener('input', (e) => {
      renderHistoryTable(e.target.value);
    });
  }

  if (dom.btnExportJson) {
    dom.btnExportJson.addEventListener('click', () => {
      const records = DiagnosticStore.getAll();
      const blob = new Blob([JSON.stringify(records, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gamepad_diagnostics_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  if (dom.btnClearHistory) {
    dom.btnClearHistory.addEventListener('click', () => {
      if (confirm('¿Vaciar todo el historial de diagnósticos locales?')) {
        DiagnosticStore.clear();
        renderHistoryTable();
      }
    });
  }
}

function fitPhotoStage() {
  const container = dom.photoViewBox;
  const wrapper = document.querySelector('.photo-stage-wrapper');
  if (!container || !wrapper) return;
  const rect = container.getBoundingClientRect();
  const size = Math.floor(Math.min(rect.width, rect.height));
  if (size > 50) {
    wrapper.style.width = `${size}px`;
    wrapper.style.height = `${size}px`;
  }
}

// ─────────────────────────────────────────────────────────────
// 19. DOM CONTENT LOADED ENTRY POINT
// ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initLanguage();
  initEventListeners();
  initGamepadLifecycle();
  resolveModel();
  buildButtonChips(16);
  drawLargeStick(dom.stickLCanvas, 0, 0, true);
  drawLargeStick(dom.stickRCanvas, 0, 0, false);
  updateWorkflowProgress();
  updateOverallVerdict();
  fitPhotoStage();

  window.addEventListener('resize', fitPhotoStage);
  if (window.ResizeObserver && dom.photoViewBox) {
    new ResizeObserver(fitPhotoStage).observe(dom.photoViewBox);
  }
});
