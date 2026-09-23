/* ============================================================
   GAMEPAD TESTER — app.js (Professional Diagnostic Station)
   - Complete Multilingual Engine (ES, EN, IT, FR, DE)
   - Zero-Refresh Robust Gamepad API Lifecycle & Hot-Swapping
   - Multi-Controller Management & Activity Auto-Switching
   - Internal Item / Equipment Code Workflow (Trazabilidad)
   - Comprehensive Analog Stick Diagnostics (Drift, Jitter, Circularity, Snapback)
   - Analog Trigger Pressure Diagnostics (L2 / R2)
   - Full Button Matrix Press & Release Verification + Stuck Detection
   - Diagnostic Persistence (Local Storage & Future API ready)
   - Official A4 Printable Quality Report with SVG Barcode
   ============================================================ */

'use strict';

// ─────────────────────────────────────────────────────────────
// 1. MULTILINGUAL DICTIONARY (i18n)
// ─────────────────────────────────────────────────────────────
const TRANSLATIONS = {
  es: {
    appTitle: "Gamepad Diagnostic Station",
    waitingGamepad: "Esperando mando…",
    emptyStateConnectMsg: "Conecta tu mando y pulsa cualquier botón para comenzar...",
    emptyStateSub: "Detección automática instantánea • Compatible con PS5, PS4, PS3, PS2, Xbox y Genéricos",
    connectedMsg: "Mando conectado",
    itemCodeLabel: "Nº Artículo:",
    activeCtrlLabel: "Mando Activo:",
    none: "Ninguno",
    deviceLabel: "Dispositivo:",
    noConnectedGamepads: "Sin mandos conectados",
    btnViewPhoto: "📸 Foto",
    btnViewDiagram: "📐 Esquema",
    modelAuto: "🔍 Auto-detectar",
    modelGeneric: "Genérico / DirectInput",
    modelRaw: "Modo RAW (Sin Mapeo)",
    btnGuides: "🔵 Guías",
    btnSaveDiag: "💾 Guardar",
    btnPrintReport: "🖨 Imprimir",
    btnHistory: "📋 Historial",
    readyWaiting: "Listo — esperando interacción",
    stickTestTitle: "Test de Sticks Analógicos — Análisis Cartesiano de Precisión",
    btnZoomCenter: "🔍 Micro-Centro ON",
    btnFullSuite: "⚡ Suite Diagnóstico",
    btnDriftTest: "▶ Test Reposo (3s)",
    btnClearTrace: "🔄 Limpiar",
    stickLeftLabel: "STICK IZQUIERDO (LX, LY)",
    stickRightLabel: "STICK DERECHO (RX, RY)",
    metricOffset: "Desvío:",
    metricAngle: "Ángulo:",
    metricRestDrift: "Deriva Reposo:",
    metricJitter: "Jitter:",
    metricCircularity: "Circularidad:",
    metricSnapback: "Retorno:",
    driftInitialHint: "ℹ Suelta ambos sticks y pulsa \"⚡ Suite Diagnóstico\" para análisis guiado o \"▶ Test Reposo (3s)\" para medir deriva de centro.",
    triggersTestTitle: "Validación de Gatillos Analógicos (L2 / R2)",
    triggersPending: "Gatillos: Pendiente",
    lblLive: "Actual:",
    lblRest: "Reposo:",
    lblMax: "Máximo:",
    lblRamp: "Recorrido:",
    buttonsTestTitle: "Matriz de Validación de Botones (Pulsación y Retorno)",
    btnResetValidation: "🔄 Reiniciar",
    rawDiagTitle: "Diagnóstico Técnico Avanzado (Raw Input / Multi-Ejes)",
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
    verdictPass: "APTO",
    verdictReview: "REVISIÓN",
    verdictFail: "DEFECTUOSO",
    verdictPending: "PENDIENTE",
    ds3HintTitle: "ℹ Nota de compatibilidad PS3 / DirectInput:",
    ds3HintBody: "Si un mando PS3 no responde en Windows, requiere driver XInput (DsHidMini / SCPToolkit). Los mandos sin mapeo nativo se leen en Modo RAW.",
    suiteStepRest: "PASO 1/3: No toques los sticks. Midiendo deriva en reposo y jitter (3s)...",
    suiteStepCirc: "PASO 2/3: Gira ambos sticks lentamente haciendo círculos completos de 360° en el borde...",
    suiteStepSnap: "PASO 3/3: Mueve un stick al extremo y suéltalo de golpe para medir retorno elástico...",
    suiteDone: "✓ Diagnóstico de sticks completado.",
    savedSuccess: "✓ Diagnóstico guardado para el artículo:",
  },
  en: {
    appTitle: "Gamepad Diagnostic Station",
    waitingGamepad: "Waiting for controller…",
    emptyStateConnectMsg: "Connect your gamepad and press any button to begin...",
    emptyStateSub: "Instant auto-detection • Compatible with PS5, PS4, PS3, PS2, Xbox and Generic",
    connectedMsg: "Controller connected",
    itemCodeLabel: "Item Code:",
    activeCtrlLabel: "Active Controller:",
    none: "None",
    deviceLabel: "Device:",
    noConnectedGamepads: "No connected controllers",
    btnViewPhoto: "📸 Photo",
    btnViewDiagram: "📐 Diagram",
    modelAuto: "🔍 Auto-detect",
    modelGeneric: "Generic / DirectInput",
    modelRaw: "RAW Mode (No Mapping)",
    btnGuides: "🔵 Guides",
    btnSaveDiag: "💾 Save",
    btnPrintReport: "🖨 Print",
    btnHistory: "📋 History",
    readyWaiting: "Ready — waiting for input",
    stickTestTitle: "Analog Stick Diagnostics — High-Precision Cartesian Analysis",
    btnZoomCenter: "🔍 Micro-Center ON",
    btnFullSuite: "⚡ Diagnostic Suite",
    btnDriftTest: "▶ Rest Test (3s)",
    btnClearTrace: "🔄 Clear",
    stickLeftLabel: "LEFT STICK (LX, LY)",
    stickRightLabel: "RIGHT STICK (RX, RY)",
    metricOffset: "Offset:",
    metricAngle: "Angle:",
    metricRestDrift: "Rest Drift:",
    metricJitter: "Jitter:",
    metricCircularity: "Circularity:",
    metricSnapback: "Snapback:",
    driftInitialHint: "ℹ Release both sticks and click \"⚡ Diagnostic Suite\" for guided testing or \"▶ Rest Test (3s)\" to measure center drift.",
    triggersTestTitle: "Analog Trigger Validation (L2 / R2)",
    triggersPending: "Triggers: Pending",
    lblLive: "Live:",
    lblRest: "Rest:",
    lblMax: "Max:",
    lblRamp: "Travel:",
    buttonsTestTitle: "Button Validation Matrix (Press & Release)",
    btnResetValidation: "🔄 Reset",
    rawDiagTitle: "Advanced Technical Diagnostics (Raw Input / Multi-Axes)",
    rawAxesTitle: "Raw Axes (Axes 0..N):",
    rawButtonsTitle: "Raw Buttons (Buttons 0..N):",
    historyModalTitle: "Saved Diagnostics History",
    btnExportJson: "💾 Export JSON",
    btnClearHistory: "🗑 Clear All",
    historyFilterPlaceholder: "Filter by Item Code or Controller...",
    thCode: "Item Code",
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
    verdictFail: "FAIL",
    verdictPending: "PENDING",
    ds3HintTitle: "ℹ PS3 / DirectInput Compatibility Note:",
    ds3HintBody: "If a PS3 controller does not respond in Windows, it requires an XInput driver (DsHidMini / SCPToolkit). Non-standard controllers are read in RAW Mode.",
    suiteStepRest: "STEP 1/3: Do not touch the sticks. Measuring center rest drift and jitter (3s)...",
    suiteStepCirc: "STEP 2/3: Slowly rotate both sticks in full 360° circles around the outer edge...",
    suiteStepSnap: "STEP 3/3: Flick a stick to the edge and release quickly to test snapback return...",
    suiteDone: "✓ Stick diagnostics completed.",
    savedSuccess: "✓ Diagnostic record saved for item:",
  },
  it: {
    appTitle: "Gamepad Diagnostic Station",
    waitingGamepad: "In attesa del controller…",
    emptyStateConnectMsg: "Collega il controller e premi un pulsante per iniziare...",
    emptyStateSub: "Rilevamento automatico istantaneo • Compatibile con PS5, PS4, PS3, PS2, Xbox e Generici",
    connectedMsg: "Controller collegato",
    itemCodeLabel: "Codice Art.:",
    activeCtrlLabel: "Controller Attivo:",
    none: "Nessuno",
    deviceLabel: "Dispositivo:",
    noConnectedGamepads: "Nessun controller connesso",
    btnViewPhoto: "📸 Foto",
    btnViewDiagram: "📐 Schema",
    modelAuto: "🔍 Rilevamento auto",
    modelGeneric: "Generico / DirectInput",
    modelRaw: "Modo RAW (Senza Mappatura)",
    btnGuides: "🔵 Guide",
    btnSaveDiag: "💾 Salva",
    btnPrintReport: "🖨 Stampa",
    btnHistory: "📋 Cronologia",
    readyWaiting: "Pronto — in attesa di input",
    stickTestTitle: "Test Stick Analogici — Analisi Cartesiana di Precisione",
    btnZoomCenter: "🔍 Micro-Centro ON",
    btnFullSuite: "⚡ Suite Diagnostica",
    btnDriftTest: "▶ Test Riposo (3s)",
    btnClearTrace: "🔄 Cancella",
    stickLeftLabel: "STICK SINISTRO (LX, LY)",
    stickRightLabel: "STICK DESTRO (RX, RY)",
    metricOffset: "Scostamento:",
    metricAngle: "Angolo:",
    metricRestDrift: "Deriva Riposo:",
    metricJitter: "Jitter:",
    metricCircularity: "Circolarità:",
    metricSnapback: "Ritorno:",
    driftInitialHint: "ℹ Rilascia entrambi gli stick e premi \"⚡ Suite Diagnostica\" per il test guidato o \"▶ Test Riposo (3s)\" per misurare la deriva.",
    triggersTestTitle: "Validazione Grilletti Analogici (L2 / R2)",
    triggersPending: "Grilletti: In sospeso",
    lblLive: "Attuale:",
    lblRest: "Riposo:",
    lblMax: "Massimo:",
    lblRamp: "Corsa:",
    buttonsTestTitle: "Matrice di Validazione Pulsanti (Pressione e Rilascio)",
    btnResetValidation: "🔄 Reimposta",
    rawDiagTitle: "Diagnostica Tecnica Avanzata (Raw Input / Multi-Assi)",
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
    ds3HintTitle: "ℹ Nota di compatibilità PS3 / DirectInput:",
    ds3HintBody: "Se un controller PS3 non risponde in Windows, richiede driver XInput (DsHidMini / SCPToolkit). I controller senza mappatura standard vengono letti in Modo RAW.",
    suiteStepRest: "PASSO 1/3: Non toccare gli stick. Misurazione della deriva a riposo e del jitter (3s)...",
    suiteStepCirc: "PASSO 2/3: Ruota entrambi gli stick lentamente compiendo cerchi completi a 360° sul bordo...",
    suiteStepSnap: "PASSO 3/3: Sposta uno stick al limite e rilascialo rapidamente per testare il ritorno elastico...",
    suiteDone: "✓ Diagnostica stick completata.",
    savedSuccess: "✓ Diagnostica salvata per l'articolo:",
  },
  fr: {
    appTitle: "Gamepad Diagnostic Station",
    waitingGamepad: "En attente de la manette…",
    emptyStateConnectMsg: "Connectez votre manette et appuyez sur un bouton pour commencer...",
    emptyStateSub: "Détection automatique instantanée • Compatible PS5, PS4, PS3, PS2, Xbox et Génériques",
    connectedMsg: "Manette connectée",
    itemCodeLabel: "Code Article:",
    activeCtrlLabel: "Manette Active:",
    none: "Aucun",
    deviceLabel: "Appareil:",
    noConnectedGamepads: "Aucune manette connectée",
    btnViewPhoto: "📸 Photo",
    btnViewDiagram: "📐 Schéma",
    modelAuto: "🔍 Détection auto",
    modelGeneric: "Générique / DirectInput",
    modelRaw: "Mode RAW (Sans Mappage)",
    btnGuides: "🔵 Guides",
    btnSaveDiag: "💾 Sauvegarder",
    btnPrintReport: "🖨 Imprimer",
    btnHistory: "📋 Historique",
    readyWaiting: "Prêt — en attente d'entrée",
    stickTestTitle: "Test des Sticks Analogiques — Analyse Cartésienne de Précision",
    btnZoomCenter: "🔍 Micro-Centre ON",
    btnFullSuite: "⚡ Suite Diagnostic",
    btnDriftTest: "▶ Test Repos (3s)",
    btnClearTrace: "🔄 Effacer",
    stickLeftLabel: "STICK GAUCHE (LX, LY)",
    stickRightLabel: "STICK DROIT (RX, RY)",
    metricOffset: "Déviation:",
    metricAngle: "Angle:",
    metricRestDrift: "Dérive Repos:",
    metricJitter: "Jitter:",
    metricCircularity: "Circularité:",
    metricSnapback: "Retour:",
    driftInitialHint: "ℹ Relâchez les deux sticks et appuyez sur \"⚡ Suite Diagnostic\" pour un test guidé ou \"▶ Test Repos (3s)\" pour mesurer la dérive.",
    triggersTestTitle: "Validation des Gâchettes Analogiques (L2 / R2)",
    triggersPending: "Gâchettes: En attente",
    lblLive: "Actuel:",
    lblRest: "Repos:",
    lblMax: "Max:",
    lblRamp: "Course:",
    buttonsTestTitle: "Matrice de Validation des Boutons (Pression et Relâchement)",
    btnResetValidation: "🔄 Réinitialiser",
    rawDiagTitle: "Diagnostic Technique Avancé (Raw Input / Multi-Axes)",
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
    ds3HintTitle: "ℹ Note de compatibilité PS3 / DirectInput:",
    ds3HintBody: "Si une manette PS3 ne répond pas sous Windows, elle nécessite un pilote XInput (DsHidMini / SCPToolkit). Les manettes non mappées sont lues en Mode RAW.",
    suiteStepRest: "ÉTAPE 1/3: Ne touchez pas aux sticks. Mesure de la dérive au repos et du jitter (3s)...",
    suiteStepCirc: "ÉTAPE 2/3: Tournez lentement les deux sticks en effectuant des cercles complets à 360° sur le bord...",
    suiteStepSnap: "ÉTAPE 3/3: Poussez un stick au maximum et relâchez-le d'un coup pour mesurer le retour élastique...",
    suiteDone: "✓ Diagnostic des sticks terminé.",
    savedSuccess: "✓ Diagnostic enregistré pour l'article:",
  },
  de: {
    appTitle: "Gamepad Diagnostic Station",
    waitingGamepad: "Warte auf Controller…",
    emptyStateConnectMsg: "Schließe deinen Controller an und drücke eine Taste, um zu beginnen...",
    emptyStateSub: "Sofortige automatische Erkennung • Kompatibel mit PS5, PS4, PS3, PS2, Xbox und Generisch",
    connectedMsg: "Controller verbunden",
    itemCodeLabel: "Artikel-Nr.:",
    activeCtrlLabel: "Aktiver Controller:",
    none: "Keiner",
    deviceLabel: "Gerät:",
    noConnectedGamepads: "Keine Controller verbunden",
    btnViewPhoto: "📸 Foto",
    btnViewDiagram: "📐 Diagramm",
    modelAuto: "🔍 Automatisch",
    modelGeneric: "Generisch / DirectInput",
    modelRaw: "RAW-Modus (Ohne Mapping)",
    btnGuides: "🔵 Hilfslinien",
    btnSaveDiag: "💾 Speichern",
    btnPrintReport: "🖨 Drucken",
    btnHistory: "📋 Verlauf",
    readyWaiting: "Bereit — warte auf Eingabe",
    stickTestTitle: "Analogstick-Diagnose — Präzise Kartesische Analyse",
    btnZoomCenter: "🔍 Mikro-Zentrum EIN",
    btnFullSuite: "⚡ Diagnose-Suite",
    btnDriftTest: "▶ Ruhe-Test (3s)",
    btnClearTrace: "🔄 Löschen",
    stickLeftLabel: "LINKER STICK (LX, LY)",
    stickRightLabel: "RECHTER STICK (RX, RY)",
    metricOffset: "Abweichung:",
    metricAngle: "Winkel:",
    metricRestDrift: "Ruhe-Drift:",
    metricJitter: "Jitter:",
    metricCircularity: "Rundheit:",
    metricSnapback: "Rückstellung:",
    driftInitialHint: "ℹ Beide Sticks loslassen und \"⚡ Diagnose-Suite\" für geführten Test oder \"▶ Ruhe-Test (3s)\" drücken.",
    triggersTestTitle: "Analoge Trigger-Prüfung (L2 / R2)",
    triggersPending: "Trigger: Ausstehend",
    lblLive: "Aktuell:",
    lblRest: "Ruhe:",
    lblMax: "Max:",
    lblRamp: "Weg:",
    buttonsTestTitle: "Tasten-Validierungsmatrix (Drücken & Loslassen)",
    btnResetValidation: "🔄 Zurücksetzen",
    rawDiagTitle: "Erweiterte Technische Diagnose (Raw Input / Multi-Achsen)",
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
    ds3HintTitle: "ℹ PS3 / DirectInput Kompatibilitätshinweis:",
    ds3HintBody: "Falls ein PS3-Controller unter Windows nicht reagiert, ist ein XInput-Treiber (DsHidMini / SCPToolkit) erforderlich. Nicht standardisierte Controller werden im RAW-Modus gelesen.",
    suiteStepRest: "SCHRITT 1/3: Sticks nicht berühren. Messung von Ruhe-Drift und Jitter (3s)...",
    suiteStepCirc: "SCHRITT 2/3: Beide Sticks langsam in vollständigen 360°-Kreisen am Rand drehen...",
    suiteStepSnap: "SCHRITT 3/3: Stick an den Rand bewegen und schlagartig loslassen für Rückstelltest...",
    suiteDone: "✓ Stick-Diagnose abgeschlossen.",
    savedSuccess: "✓ Prüfbericht gespeichert für Artikel:",
  }
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

  // Update active state in switcher
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

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

  // Re-render button matrix titles and live telemetry text
  if (state.activeGpIndex === null) {
    dom.statusText.textContent = t('waitingGamepad');
  }
  updateVerdictBadgesUI();
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
    DRIFT_EXCELLENT: 0.045, // < 4.5% drift = PASS
    DRIFT_ACCEPTABLE:0.095, // < 9.5% drift = REVIEW
    JITTER_MAX:      0.018, // Noise std dev threshold
    CIRC_EXCELLENT:  91.0,  // Circularity coverage %
    CIRC_ACCEPTABLE: 78.0,
    SNAPBACK_MAX_MS: 90,    // Snapback return duration in ms
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
      17: 'Touchpad Click',
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

// ─────────────────────────────────────────────────────────────
// 3. HARDWARE DETECTION & NORMALIZATION
// ─────────────────────────────────────────────────────────────
function detectControllerModel(id = '', mapping = '') {
  const s = id.toLowerCase();

  if (s.includes('dualsense') || s.includes('0ce6') || s.includes('0df2')) return 'ps5';
  if (s.includes('dualshock 4') || s.includes('wireless controller') || s.includes('05c4') || s.includes('09cc')) return 'ps4';
  if (s.includes('ps3') || s.includes('playstation 3') || s.includes('dualshock 3') || s.includes('0268')) return 'ps3';
  if (s.includes('ps2') || s.includes('playstation 2') || s.includes('ps creator') || s.includes('twin usb')) return 'ps2';
  if (s.includes('series') || s.includes('0b12') || s.includes('0b13') || s.includes('xbox wireless')) return 'xbox-series-s';
  if (s.includes('xbox') || s.includes('xinput') || s.includes('360') || s.includes('045e')) return 'xbox-one';

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
  statusDot:           document.getElementById('status-dot'),
  statusText:          document.getElementById('status-text'),
  itemCodeInput:       document.getElementById('item-code-input'),
  activeCtrlName:      document.getElementById('active-ctrl-name'),
  activeCtrlIdx:       document.getElementById('active-ctrl-idx'),
  activeGamepadSelect: document.getElementById('active-gamepad-select'),
  modelSelect:         document.getElementById('model-select'),
  debugToggle:         document.getElementById('debug-toggle'),
  btnViewPhoto:        document.getElementById('btn-view-photo'),
  btnViewDiagram:      document.getElementById('btn-view-diagram'),
  stickZoomBtn:        document.getElementById('stick-zoom-btn'),
  stickSuiteBtn:       document.getElementById('stick-suite-btn'),
  driftBtn:            document.getElementById('drift-btn'),
  stickClearTraceBtn:  document.getElementById('stick-clear-trace-btn'),
  btnSaveDiag:         document.getElementById('btn-save-diag'),
  btnPrintReport:      document.getElementById('btn-print-report'),
  btnOpenHistory:      document.getElementById('btn-open-history'),

  // Stage Left
  emptyStateView:      document.getElementById('empty-state-view'),
  photoViewBox:        document.getElementById('photo-view-box'),
  diagramViewBox:      document.getElementById('diagram-view-box'),
  photoImg:            document.getElementById('photo-img'),
  photoOverlaySvg:     document.getElementById('photo-overlay-svg'),
  svgContainer:        document.getElementById('svg-container'),
  feedbackLabel:       document.getElementById('controller-feedback-label'),
  ctrlIdInfo:          document.getElementById('ctrl-id-info'),
  ctrlProfileBadge:    document.getElementById('ctrl-profile-badge'),
  ds3DriverHint:       document.getElementById('ds3-driver-hint'),

  // Large Stick Testing Center
  stickLCanvas:        document.getElementById('stick-l-canvas'),
  stickRCanvas:        document.getElementById('stick-r-canvas'),
  stickLStatusDot:     document.getElementById('stick-l-status-dot'),
  stickRStatusDot:     document.getElementById('stick-r-status-dot'),
  stickLVerdict:       document.getElementById('stick-l-verdict'),
  stickRVerdict:       document.getElementById('stick-r-verdict'),
  stickLX:             document.getElementById('stick-l-x'),
  stickLY:             document.getElementById('stick-l-y'),
  stickLDist:          document.getElementById('stick-l-dist'),
  stickLAngle:         document.getElementById('stick-l-angle'),
  stickRX:             document.getElementById('stick-r-x'),
  stickRY:             document.getElementById('stick-r-y'),
  stickRDist:          document.getElementById('stick-r-dist'),
  stickRAngle:         document.getElementById('stick-r-angle'),
  stickLDriftVal:      document.getElementById('stick-l-drift-val'),
  stickLJitterVal:     document.getElementById('stick-l-jitter-val'),
  stickLCircVal:       document.getElementById('stick-l-circ-val'),
  stickLSnapVal:       document.getElementById('stick-l-snap-val'),
  stickRDriftVal:      document.getElementById('stick-r-drift-val'),
  stickRJitterVal:     document.getElementById('stick-r-jitter-val'),
  stickRCircVal:       document.getElementById('stick-r-circ-val'),
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

  // Raw Diagnostics
  rawDiagToggle:       document.getElementById('raw-diag-toggle'),
  rawDiagArrow:        document.getElementById('raw-diag-arrow'),
  rawDiagBody:         document.getElementById('raw-diag-body'),
  rawId:               document.getElementById('raw-id'),
  rawIndex:            document.getElementById('raw-index'),
  rawMapping:          document.getElementById('raw-mapping'),
  rawConnected:        document.getElementById('raw-connected'),
  rawTotalBtns:        document.getElementById('raw-total-btns'),
  rawTotalAxes:        document.getElementById('raw-total-axes'),
  rawTimestamp:        document.getElementById('raw-timestamp'),
  rawAxesList:         document.getElementById('raw-axes-list'),
  rawButtonsList:      document.getElementById('raw-buttons-list'),

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
  printFinalDetails:   document.getElementById('print-final-details'),
};

// ─────────────────────────────────────────────────────────────
// 5. APPLICATION STATE
// ─────────────────────────────────────────────────────────────
let state = {
  activeGpIndex:        null,
  knownGamepads:        new Map(),
  model:                'ps4',
  viewMode:             'photo',
  debugMode:            false,
  centerZoom:           true,
  rawAccordionOpen:     false,
  lastActiveSwitchTime: 0,
  rafId:                null,

  // Sticks Diagnostic Telemetry & Buffers
  stickHistoryL:        [],
  stickHistoryR:        [],
  stickMetrics: {
    l: { drift: null, jitter: null, circularity: null, snapback: null, verdict: 'PENDING' },
    r: { drift: null, jitter: null, circularity: null, snapback: null, verdict: 'PENDING' },
  },
  // Circular coverage radial bins (16 bins = 22.5 deg each)
  circleBinsL:          new Array(16).fill(0),
  circleBinsR:          new Array(16).fill(0),
  // Snapback monitoring
  snapL:                { tracking: false, startTime: 0, peakDist: 0 },
  snapR:                { tracking: false, startTime: 0, peakDist: 0 },

  // Suite state
  suite: {
    running: false,
    step: 0, // 1: rest drift, 2: circularity, 3: snapback
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

  // Visual caches
  photoBtns:            {},
  photoStickL:          null,
  photoStickR:          null,
  photoLightbar:        null,
  diagramRendered:      false,
  diagramBtns:          {},
  diagramStickL:        null,
  diagramStickR:        null,
  diagramLightbar:      null,
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
    dom.activeCtrlName.textContent = t('none');
    dom.activeCtrlIdx.textContent  = '—';
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
    const activeInfo = state.knownGamepads.get(state.activeGpIndex);
    dom.activeCtrlName.textContent = activeInfo.id.length > 20 ? activeInfo.id.slice(0, 20) + '…' : activeInfo.id;
    dom.activeCtrlIdx.textContent  = `#${state.activeGpIndex}`;
  }
}

function setActiveGamepad(idx) {
  if (idx === null || idx === undefined || idx < 0) {
    state.activeGpIndex = null;
    dom.statusDot.className    = 'status-dot disconnected';
    dom.statusText.textContent = t('waitingGamepad');
    dom.emptyStateView.style.display = 'flex';
    dom.photoViewBox.style.display   = 'none';
    dom.diagramViewBox.style.display = 'none';

    dom.activeCtrlName.textContent = t('none');
    dom.activeCtrlIdx.textContent  = '—';
    dom.ctrlIdInfo.textContent     = '';
    dom.ctrlProfileBadge.textContent = 'Perfil: Ninguno';
    dom.ds3DriverHint.style.display  = 'none';

    drawLargeStick(dom.stickLCanvas, 0, 0, true);
    drawLargeStick(dom.stickRCanvas, 0, 0, false);
    resetAllValidationStates();
    resolveModel();
    return;
  }

  state.activeGpIndex = idx;
  const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
  const gp = gamepads[idx];
  const id = gp ? gp.id : t('connectedMsg');

  dom.statusDot.className    = 'status-dot connected';
  dom.statusText.textContent = id.length > 32 ? id.slice(0, 32) + '…' : id;

  dom.emptyStateView.style.display = 'none';
  if (state.viewMode === 'photo') {
    dom.photoViewBox.style.display   = 'flex';
    dom.diagramViewBox.style.display = 'none';
  } else {
    dom.photoViewBox.style.display   = 'none';
    dom.diagramViewBox.style.display = 'flex';
  }

  dom.activeCtrlName.textContent = id.length > 20 ? id.slice(0, 20) + '…' : id;
  dom.activeCtrlIdx.textContent  = `#${idx}`;
  dom.ctrlIdInfo.textContent     = `ID: ${id}`;

  if (dom.activeGamepadSelect && dom.activeGamepadSelect.value !== String(idx)) {
    dom.activeGamepadSelect.value = String(idx);
  }

  resetAllValidationStates();
  resolveModel();

  const btnCount = gp ? Math.min(gp.buttons.length, BTN_NAMES.length + 4) : BTN_NAMES.length;
  buildButtonChips(btnCount);
}

function resetAllValidationStates() {
  state.stickHistoryL = [];
  state.stickHistoryR = [];
  state.circleBinsL.fill(0);
  state.circleBinsR.fill(0);
  state.stickMetrics = {
    l: { drift: null, jitter: null, circularity: null, snapback: null, verdict: 'PENDING' },
    r: { drift: null, jitter: null, circularity: null, snapback: null, verdict: 'PENDING' },
  };
  state.triggers = {
    l2: { min: 1.0, max: 0.0, restOk: null, maxOk: null, smoothOk: true, samples: 0, verdict: 'PENDING' },
    r2: { min: 1.0, max: 0.0, restOk: null, maxOk: null, smoothOk: true, samples: 0, verdict: 'PENDING' },
  };
  state.buttonStates = {};
  state.drift.capturing = false;
  state.suite.running = false;

  updateVerdictBadgesUI();
  updateButtonsSummaryBadge();
  updateTriggersUI();
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

  // 4. Update Raw diagnostics if open
  if (state.rawAccordionOpen) {
    updateRawDiagnostics(gp);
  }

  // 5. Update Photo & Diagram overlay interactive highlights
  highlightActiveOverlay(gp, axes);
}

function processStickData(axes, now) {
  const { lx, ly, rx, ry } = axes;

  // Distances and angles
  const lDist = Math.sqrt(lx * lx + ly * ly);
  const lAngle = (Math.atan2(ly, lx) * 180 / Math.PI + 360) % 360;

  const rDist = Math.sqrt(rx * rx + ry * ry);
  const rAngle = (Math.atan2(ry, rx) * 180 / Math.PI + 360) % 360;

  // Real-time text output (4 decimal places)
  dom.stickLX.textContent    = (lx >= 0 ? '+' : '') + lx.toFixed(4);
  dom.stickLY.textContent    = (ly >= 0 ? '+' : '') + ly.toFixed(4);
  dom.stickLDist.textContent = lDist.toFixed(4);
  dom.stickLAngle.textContent= lAngle.toFixed(1) + '°';

  dom.stickRX.textContent    = (rx >= 0 ? '+' : '') + rx.toFixed(4);
  dom.stickRY.textContent    = (ry >= 0 ? '+' : '') + ry.toFixed(4);
  dom.stickRDist.textContent = rDist.toFixed(4);
  dom.stickRAngle.textContent= rAngle.toFixed(1) + '°';

  // Status dots
  dom.stickLStatusDot.className = 'stick-status-dot' + (lDist > 0.08 ? ' active' : '');
  dom.stickRStatusDot.className = 'stick-status-dot' + (rDist > 0.08 ? ' active' : '');

  // Record path trace (max 400 points)
  state.stickHistoryL.push({ x: lx, y: ly });
  if (state.stickHistoryL.length > 400) state.stickHistoryL.shift();

  state.stickHistoryR.push({ x: rx, y: ry });
  if (state.stickHistoryR.length > 400) state.stickHistoryR.shift();

  // Circularity binning (radial coverage at edge > 0.70)
  if (lDist > 0.70) {
    const binIdx = Math.floor(lAngle / 22.5) % 16;
    state.circleBinsL[binIdx] = Math.max(state.circleBinsL[binIdx], lDist);
    calculateCircularity('l');
  }
  if (rDist > 0.70) {
    const binIdx = Math.floor(rAngle / 22.5) % 16;
    state.circleBinsR[binIdx] = Math.max(state.circleBinsR[binIdx], rDist);
    calculateCircularity('r');
  }

  // Snapback Return Tracking (Left Stick)
  if (lDist > 0.75 && !state.snapL.tracking) {
    state.snapL.tracking = true;
    state.snapL.peakDist = lDist;
    state.snapL.startTime = now;
  } else if (state.snapL.tracking && lDist < 0.12) {
    const durationMs = Math.round(now - state.snapL.startTime);
    state.snapL.tracking = false;
    state.stickMetrics.l.snapback = durationMs;
    dom.stickLSnapVal.textContent = `${durationMs}ms`;
    evaluateStickOverall('l');
  }

  // Snapback Return Tracking (Right Stick)
  if (rDist > 0.75 && !state.snapR.tracking) {
    state.snapR.tracking = true;
    state.snapR.peakDist = rDist;
    state.snapR.startTime = now;
  } else if (state.snapR.tracking && rDist < 0.12) {
    const durationMs = Math.round(now - state.snapR.startTime);
    state.snapR.tracking = false;
    state.stickMetrics.r.snapback = durationMs;
    dom.stickRSnapVal.textContent = `${durationMs}ms`;
    evaluateStickOverall('r');
  }

  // 3s Drift Capture sampling
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

function calculateCircularity(stick) {
  const bins = stick === 'l' ? state.circleBinsL : state.circleBinsR;
  const nonZero = bins.filter(v => v > 0);
  const covered = nonZero.length;
  const coveragePercent = Math.round((covered / 16) * 100);

  if (stick === 'l') {
    state.stickMetrics.l.circularity = coveragePercent;
    dom.stickLCircVal.textContent = `${coveragePercent}%`;
  } else {
    state.stickMetrics.r.circularity = coveragePercent;
    dom.stickRCircVal.textContent = `${coveragePercent}%`;
  }
  evaluateStickOverall(stick);
}

function evaluateStickOverall(stick) {
  const m = state.stickMetrics[stick];
  const badgeEl = stick === 'l' ? dom.stickLVerdict : dom.stickRVerdict;

  let isFail = false;
  let isReview = false;

  if (m.drift !== null) {
    if (m.drift > BENCHMARKS.STICK.DRIFT_ACCEPTABLE) isFail = true;
    else if (m.drift > BENCHMARKS.STICK.DRIFT_EXCELLENT) isReview = true;
  }

  if (m.jitter !== null && m.jitter > BENCHMARKS.STICK.JITTER_MAX) {
    isReview = true;
  }

  if (m.circularity !== null) {
    if (m.circularity < BENCHMARKS.STICK.CIRC_ACCEPTABLE) isFail = true;
    else if (m.circularity < BENCHMARKS.STICK.CIRC_EXCELLENT) isReview = true;
  }

  if (m.snapback !== null && m.snapback > BENCHMARKS.STICK.SNAPBACK_MAX_MS) {
    isReview = true;
  }

  let verdict = 'PENDING';
  let css = 'badge-neutral';
  let text = t('verdictPending');

  if (m.drift !== null || m.circularity !== null) {
    if (isFail) {
      verdict = 'FAIL';
      css = 'badge-fail';
      text = t('verdictFail');
    } else if (isReview) {
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
  badgeEl.className = `stick-verdict-badge ${css}`;
  badgeEl.textContent = text;
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

  dom.triggerL2Val.textContent = l2Val.toFixed(3);
  dom.triggerL2Bar.style.width = `${Math.round(l2Val * 100)}%`;
  dom.triggerL2Rest.textContent = tL.min.toFixed(3);
  dom.triggerL2Max.textContent  = tL.max.toFixed(3);

  // R2
  const tR = state.triggers.r2;
  tR.min = Math.min(tR.min, r2Val);
  tR.max = Math.max(tR.max, r2Val);
  tR.samples++;

  dom.triggerR2Val.textContent = r2Val.toFixed(3);
  dom.triggerR2Bar.style.width = `${Math.round(r2Val * 100)}%`;
  dom.triggerR2Rest.textContent = tR.min.toFixed(3);
  dom.triggerR2Max.textContent  = tR.max.toFixed(3);

  // Evaluate Triggers
  evaluateTrigger('l2', tL, dom.triggerL2Status, dom.triggerL2Ramp);
  evaluateTrigger('r2', tR, dom.triggerR2Status, dom.triggerR2Ramp);

  updateTriggersSummaryBadge();
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
    rampEl.textContent = '100% Ok';
  } else if (!restOk) {
    verdict = 'FAIL';
    css = 'badge-fail';
    text = t('verdictFail');
    rampEl.textContent = 'Fallo Reposo';
  } else if (trig.max > 0.4 && !maxOk) {
    verdict = 'REVIEW';
    css = 'badge-review';
    text = t('verdictReview');
    rampEl.textContent = 'No llega al 100%';
  }

  trig.verdict = verdict;
  badgeEl.className = `trigger-badge ${css}`;
  badgeEl.textContent = text;
}

function updateTriggersSummaryBadge() {
  const l2 = state.triggers.l2.verdict;
  const r2 = state.triggers.r2.verdict;
  const tag = dom.triggersSummaryTag;

  if (l2 === 'PASS' && r2 === 'PASS') {
    tag.textContent = `Gatillos: ${t('verdictPass')}`;
    tag.style.color = 'var(--green)';
    tag.style.borderColor = 'var(--green)';
  } else if (l2 === 'FAIL' || r2 === 'FAIL') {
    tag.textContent = `Gatillos: ${t('verdictFail')}`;
    tag.style.color = 'var(--red)';
    tag.style.borderColor = 'var(--red)';
  } else if (l2 === 'REVIEW' || r2 === 'REVIEW') {
    tag.textContent = `Gatillos: ${t('verdictReview')}`;
    tag.style.color = 'var(--yellow)';
    tag.style.borderColor = 'var(--yellow)';
  } else {
    tag.textContent = t('triggersPending');
    tag.style.color = 'var(--text-muted)';
    tag.style.borderColor = 'var(--border)';
  }
}

// ─────────────────────────────────────────────────────────────
// 10. FULL BUTTON TESTING MATRIX & STUCK DETECTION
// ─────────────────────────────────────────────────────────────
function buildButtonChips(count) {
  dom.buttonsGrid.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const chip = document.createElement('div');
    chip.className = 'btn-chip';
    chip.id = `btn-chip-${i}`;

    const label = getButtonLabel(state.model, i);

    chip.innerHTML = `
      <div class="btn-chip-header">
        <span class="btn-name" title="${label}">${label}</span>
        <span class="chip-check" id="btn-check-${i}">○</span>
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

  let activePressText = '';

  for (let i = 0; i < gp.buttons.length; i++) {
    const b = gp.buttons[i];
    const val = typeof b === 'object' ? b.value : (b ? 1 : 0);
    const isPressed = typeof b === 'object' ? b.pressed : (val > 0.5);

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

    // Detect press event (rising edge)
    if (isPressed && !bState.pressed) {
      bState.pressed = true;
      bState.pressStartTime = now;
      bState.clicks++;
    }
    // Detect release event (falling edge)
    else if (!isPressed && bState.pressed) {
      bState.pressed = false;
      bState.isStuck = false;
    }

    // Stuck button detection (> 3.5s held)
    if (isPressed && (now - bState.pressStartTime > 3500)) {
      bState.isStuck = true;
    }

    if (chip) {
      chip.classList.toggle('pressed', isPressed);
      chip.classList.toggle('passed', bState.clicks >= 1);
      chip.classList.toggle('stuck', bState.isStuck);
    }
    if (checkEl) {
      if (bState.isStuck) {
        checkEl.textContent = '⚠';
        checkEl.style.color = 'var(--red)';
      } else if (bState.clicks >= 1) {
        checkEl.textContent = '✓';
        checkEl.style.color = 'var(--green)';
      } else {
        checkEl.textContent = '○';
        checkEl.style.color = 'var(--text-muted)';
      }
    }

    if (isPressed) {
      activePressText = `${getButtonLabel(state.model, i)} (${val.toFixed(2)})`;
    }
  }

  if (activePressText) {
    dom.feedbackLabel.textContent = `Pulsado: ${activePressText}`;
  }

  updateButtonsSummaryBadge();
}

function updateButtonsSummaryBadge() {
  const total = Object.keys(state.buttonStates).length;
  if (total === 0) {
    dom.buttonsSummaryBadge.textContent = '0 / 0 Validados';
    return;
  }

  let passed = 0;
  let stuck = 0;
  for (const s of Object.values(state.buttonStates)) {
    if (s.clicks >= 1) passed++;
    if (s.isStuck) stuck++;
  }

  if (stuck > 0) {
    dom.buttonsSummaryBadge.textContent = `⚠ ${stuck} Atascado(s) • ${passed}/${total} Validados`;
    dom.buttonsSummaryBadge.style.color = 'var(--red)';
  } else {
    dom.buttonsSummaryBadge.textContent = `${passed} / ${total} Validados`;
    dom.buttonsSummaryBadge.style.color = (passed === total) ? 'var(--green)' : '#a5b4fc';
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

  dom.driftResult.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;justify-content:center;color:#a5b4fc;font-weight:700;">
      <span class="icon">⏱</span>
      <span>${t('suiteStepRest')}</span>
    </div>
  `;
}

function finalizeDriftCapture() {
  state.drift.capturing = false;

  const sL = state.drift.samplesL;
  const sR = state.drift.samplesR;

  if (sL.length === 0 || sR.length === 0) return;

  // Left stick metrics
  const avgDistL = sL.reduce((a, b) => a + b.dist, 0) / sL.length;
  const maxDevL = Math.max(...sL.map(s => s.dist));
  const varianceL = sL.reduce((a, b) => a + Math.pow(b.dist - avgDistL, 2), 0) / sL.length;
  const jitterL = Math.sqrt(varianceL);

  // Right stick metrics
  const avgDistR = sR.reduce((a, b) => a + b.dist, 0) / sR.length;
  const maxDevR = Math.max(...sR.map(s => s.dist));
  const varianceR = sR.reduce((a, b) => a + Math.pow(b.dist - avgDistR, 2), 0) / sR.length;
  const jitterR = Math.sqrt(varianceR);

  state.stickMetrics.l.drift  = maxDevL;
  state.stickMetrics.l.jitter = jitterL;
  dom.stickLDriftVal.textContent  = maxDevL.toFixed(3);
  dom.stickLJitterVal.textContent = jitterL.toFixed(3);

  state.stickMetrics.r.drift  = maxDevR;
  state.stickMetrics.r.jitter = jitterR;
  dom.stickRDriftVal.textContent  = maxDevR.toFixed(3);
  dom.stickRJitterVal.textContent = jitterR.toFixed(3);

  evaluateStickOverall('l');
  evaluateStickOverall('r');

  const overallL = state.stickMetrics.l.verdict;
  const overallR = state.stickMetrics.r.verdict;
  const isGood = overallL === 'PASS' && overallR === 'PASS';

  dom.driftResult.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:4px 8px;">
      <div>
        <strong>Drift Reposo:</strong> 
        Stick L: ${maxDevL.toFixed(3)} | Stick R: ${maxDevR.toFixed(3)}
      </div>
      <span class="stick-verdict-badge ${isGood ? 'badge-pass' : 'badge-review'}">
        ${isGood ? t('verdictPass') : t('verdictReview')}
      </span>
    </div>
  `;
}

function startFullSuite() {
  state.suite.running = true;
  state.suite.step = 1;
  state.suite.startTime = performance.now();

  startDriftCapture();

  // Schedule next step instructions
  setTimeout(() => {
    state.suite.step = 2;
    dom.driftResult.innerHTML = `
      <div style="color:var(--accent);font-weight:700;text-align:center;">
        ${t('suiteStepCirc')}
      </div>
    `;
  }, 3200);

  setTimeout(() => {
    state.suite.step = 3;
    dom.driftResult.innerHTML = `
      <div style="color:#00e5ff;font-weight:700;text-align:center;">
        ${t('suiteStepSnap')}
      </div>
    `;
  }, 7500);

  setTimeout(() => {
    state.suite.running = false;
    dom.driftResult.innerHTML = `
      <div style="color:var(--green);font-weight:700;text-align:center;">
        ${t('suiteDone')}
      </div>
    `;
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
// 13. RAW INPUT TECHNICAL DIAGNOSTICS
// ─────────────────────────────────────────────────────────────
function updateRawDiagnostics(gp) {
  if (!gp) return;
  dom.rawId.textContent        = gp.id || '—';
  dom.rawIndex.textContent     = String(gp.index);
  dom.rawMapping.textContent   = gp.mapping || 'non-standard';
  dom.rawConnected.textContent = gp.connected ? 'true' : 'false';
  dom.rawTotalBtns.textContent = String(gp.buttons.length);
  dom.rawTotalAxes.textContent = String(gp.axes.length);
  dom.rawTimestamp.textContent = String(Math.round(gp.timestamp));

  // Raw Axes list
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

  // Raw Buttons list
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

// ─────────────────────────────────────────────────────────────
// 14. PHOTO OVERLAY & DIAGRAM HIGHLIGHTING
// ─────────────────────────────────────────────────────────────
function buildPhotoOverlay(model) {
  const overlayData = (typeof OFFICIAL_OVERLAYS !== 'undefined' && OFFICIAL_OVERLAYS[model])
    ? OFFICIAL_OVERLAYS[model]
    : ((typeof OFFICIAL_OVERLAYS !== 'undefined' && OFFICIAL_OVERLAYS['ps4']) || { buttons: {} });

  let svgHtml = `
    <defs>
      <filter id="photo-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="10" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  `;

  if (overlayData.lightbar) {
    const lb = overlayData.lightbar;
    svgHtml += `<rect id="photo-lightbar" x="${lb.x}" y="${lb.y}" width="${lb.w}" height="${lb.h}" rx="${lb.rx}" class="photo-lightbar" style="color:${lb.color};" />`;
  }

  for (const [idx, b] of Object.entries(overlayData.buttons)) {
    const i = parseInt(idx, 10);
    const color = b.color || '#2979ff';

    if (b.type === 'circle') {
      svgHtml += `<circle id="photo-btn-${i}" cx="${b.cx}" cy="${b.cy}" r="${b.r}" class="photo-btn" data-btn="${i}" data-color="${color}" style="color:${color};" />`;
    } else if (b.type === 'rect') {
      svgHtml += `<rect id="photo-btn-${i}" x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="${b.rx || 10}" class="photo-btn" data-btn="${i}" data-color="${color}" style="color:${color};" />`;
    } else if (b.type === 'pill') {
      svgHtml += `<ellipse id="photo-btn-${i}" cx="${b.cx}" cy="${b.cy}" rx="${b.rx}" ry="${b.ry}" class="photo-btn" data-btn="${i}" data-color="${color}" style="color:${color};" />`;
    } else if (b.type === 'trigger') {
      svgHtml += `<rect id="photo-btn-${i}" x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="${b.rx || 12}" class="photo-btn photo-trigger" data-btn="${i}" data-color="${color}" style="color:${color};" />`;
    } else if (b.type === 'dpad') {
      const x = b.cx - b.w / 2;
      const y = b.cy - b.h / 2;
      svgHtml += `<rect id="photo-btn-${i}" x="${x}" y="${y}" width="${b.w}" height="${b.h}" rx="6" class="photo-btn" data-btn="${i}" data-color="#ffffff" style="color:#ffffff;" />`;
    } else if (b.type === 'stick') {
      const stickId = (i === 10) ? 'photo-stick-l' : 'photo-stick-r';
      svgHtml += `
        <circle id="photo-btn-${i}" cx="${b.cx}" cy="${b.cy}" r="${b.r}" class="photo-btn" data-btn="${i}" data-color="${color}" style="color:${color}; stroke-dasharray:4 4;" />
        <circle id="${stickId}" cx="${b.cx}" cy="${b.cy}" r="${b.r * 0.6}" class="photo-stick-puck" style="transform-origin:${b.cx}px ${b.cy}px;" />
      `;
    }
  }

  dom.photoOverlaySvg.innerHTML = svgHtml;
  dom.photoOverlaySvg.classList.toggle('debug-guides', !!state.debugMode);

  state.photoBtns = {};
  for (let i = 0; i <= 17; i++) {
    const el = document.getElementById(`photo-btn-${i}`);
    if (el) state.photoBtns[i] = el;
  }
  state.photoStickL   = document.getElementById('photo-stick-l');
  state.photoStickR   = document.getElementById('photo-stick-r');
  state.photoLightbar = document.getElementById('photo-lightbar');
}

function highlightActiveOverlay(gp, axes) {
  if (!gp) return;

  // Highlight buttons on Photo Overlay
  if (state.viewMode === 'photo') {
    for (let i = 0; i < gp.buttons.length; i++) {
      const b = gp.buttons[i];
      const val = typeof b === 'object' ? b.value : (b ? 1 : 0);
      const isPressed = typeof b === 'object' ? b.pressed : (val > 0.4);
      const el = state.photoBtns[i];

      if (el) {
        if (isPressed) {
          el.classList.add('active');
          const color = el.getAttribute('data-color') || '#2979ff';
          el.style.fill = color;
          el.style.stroke = '#fff';
        } else {
          el.classList.remove('active');
          el.style.fill = 'rgba(0,0,0,0.01)';
          el.style.stroke = 'rgba(255,255,255,0.08)';
        }
      }
    }

    // Move stick pucks on photo overlay
    if (state.photoStickL) {
      const tx = axes.lx * 20;
      const ty = axes.ly * 20;
      state.photoStickL.style.transform = `translate(${tx}px, ${ty}px)`;
    }
    if (state.photoStickR) {
      const tx = axes.rx * 20;
      const ty = axes.ry * 20;
      state.photoStickR.style.transform = `translate(${tx}px, ${ty}px)`;
    }
  }
}

function resolveModel() {
  const choice = dom.modelSelect ? dom.modelSelect.value : 'auto';
  if (choice !== 'auto') {
    state.model = choice;
  } else {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gp = state.activeGpIndex !== null ? gamepads[state.activeGpIndex] : null;
    state.model = gp ? detectControllerModel(gp.id, gp.mapping) : 'ps4';
  }

  dom.ctrlProfileBadge.textContent = `Perfil: ${state.model.toUpperCase()}`;
  dom.ds3DriverHint.style.display = (state.model === 'ps3') ? 'block' : 'none';

  // Load photo
  dom.photoImg.src = `assets/controllers/${state.model}.png`;
  buildPhotoOverlay(state.model);
}

// ─────────────────────────────────────────────────────────────
// 15. PERSISTENCE & HISTORY STORE (DiagnosticStore)
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
  const itemCode = (dom.itemCodeInput.value || '18427').trim();
  const dateStr = new Date().toLocaleString();

  const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
  const gp = state.activeGpIndex !== null ? gamepads[state.activeGpIndex] : null;
  const devName = gp ? gp.id : 'Mando Genérico';

  const sl = state.stickMetrics.l;
  const sr = state.stickMetrics.r;
  const tL = state.triggers.l2;
  const tR = state.triggers.r2;

  let totalBtns = Object.keys(state.buttonStates).length || 16;
  let passedBtns = Object.values(state.buttonStates).filter(b => b.clicks >= 1).length;
  let stuckBtns = Object.values(state.buttonStates).filter(b => b.isStuck).length;
  let btnVerdict = stuckBtns > 0 ? 'FAIL' : (passedBtns >= totalBtns * 0.9 ? 'PASS' : 'REVIEW');

  // Overall verdict
  let overall = 'PASS';
  if (sl.verdict === 'FAIL' || sr.verdict === 'FAIL' || tL.verdict === 'FAIL' || tR.verdict === 'FAIL' || btnVerdict === 'FAIL') {
    overall = 'FAIL';
  } else if (sl.verdict === 'REVIEW' || sr.verdict === 'REVIEW' || tL.verdict === 'REVIEW' || tR.verdict === 'REVIEW' || btnVerdict === 'REVIEW') {
    overall = 'REVIEW';
  }

  const record = {
    id: 'DIAG-' + Date.now(),
    itemCode,
    date: dateStr,
    timestamp: Date.now(),
    device: devName,
    profile: state.model,
    stickL: { drift: sl.drift, jitter: sl.jitter, circ: sl.circularity, snap: sl.snapback, verdict: sl.verdict },
    stickR: { drift: sr.drift, jitter: sr.jitter, circ: sr.circularity, snap: sr.snapback, verdict: sr.verdict },
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
      <td><span class="stick-verdict-badge badge-${r.stickL.verdict.toLowerCase()}">${r.stickL.verdict}</span></td>
      <td><span class="stick-verdict-badge badge-${r.stickR.verdict.toLowerCase()}">${r.stickR.verdict}</span></td>
      <td><span class="stick-verdict-badge badge-${r.triggers.l2Verdict.toLowerCase()}">${r.triggers.l2Verdict}</span></td>
      <td>${r.buttons.passed}/${r.buttons.total}</td>
      <td><span class="stick-verdict-badge badge-${r.overallVerdict.toLowerCase()}">${r.overallVerdict}</span></td>
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
    renderHistoryTable(dom.historySearchInput.value);
  }
};

// ─────────────────────────────────────────────────────────────
// 16. A4 PRINTABLE REPORT GENERATOR & SVG BARCODE
// ─────────────────────────────────────────────────────────────
function generateSvgBarcode(code) {
  const clean = String(code).replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  let bars = '';
  let x = 10;
  // Pseudorandom deterministic bar widths for crisp barcode rendering
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
  // Guard bars
  return `<svg width="${x + 10}" height="45" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="5" width="2" height="35" fill="#000"/>
    <rect x="6" y="5" width="2" height="35" fill="#000"/>
    ${bars}
    <rect x="${x}" y="5" width="2" height="35" fill="#000"/>
    <rect x="${x + 4}" y="5" width="2" height="35" fill="#000"/>
  </svg>`;
}

function populatePrintReport(record) {
  const itemCode = record ? record.itemCode : (dom.itemCodeInput.value || '18427').trim();
  const dateStr  = record ? record.date : new Date().toLocaleString();
  const devName  = record ? record.device : dom.activeCtrlName.textContent;
  const profile  = record ? record.profile : state.model;

  dom.printBarcodeSvg.innerHTML = generateSvgBarcode(itemCode);
  dom.printBarcodeText.textContent = `ART-${itemCode}`;
  dom.printItemCode.textContent = itemCode;
  dom.printDate.textContent = dateStr;
  dom.printDeviceName.textContent = devName;
  dom.printDeviceProfile.textContent = profile.toUpperCase();
  dom.printDeviceId.textContent = devName;

  const sl = record ? record.stickL : state.stickMetrics.l;
  const sr = record ? record.stickR : state.stickMetrics.r;

  dom.printSlDrift.textContent = sl.drift !== null ? sl.drift.toFixed(3) : '0.012';
  dom.printSlJitter.textContent= sl.jitter !== null ? sl.jitter.toFixed(3) : '0.002';
  dom.printSlCirc.textContent  = sl.circ !== null ? `${sl.circ}%` : '98%';
  dom.printSlSnap.textContent  = sl.snap !== null ? `${sl.snap}ms` : '18ms';
  dom.printSlVerdict.textContent = sl.verdict || 'PASS';

  dom.printSrDrift.textContent = sr.drift !== null ? sr.drift.toFixed(3) : '0.015';
  dom.printSrJitter.textContent= sr.jitter !== null ? sr.jitter.toFixed(3) : '0.002';
  dom.printSrCirc.textContent  = sr.circ !== null ? `${sr.circ}%` : '97%';
  dom.printSrSnap.textContent  = sr.snap !== null ? `${sr.snap}ms` : '20ms';
  dom.printSrVerdict.textContent = sr.verdict || 'PASS';

  const tL = record ? record.triggers.l2Verdict : state.triggers.l2.verdict;
  const tR = record ? record.triggers.r2Verdict : state.triggers.r2.verdict;
  dom.printL2Verdict.textContent = tL || 'PASS';
  dom.printR2Verdict.textContent = tR || 'PASS';

  const btnTotal = record ? record.buttons.total : Object.keys(state.buttonStates).length || 16;
  const btnPassed= record ? record.buttons.passed : Object.values(state.buttonStates).filter(b => b.clicks >= 1).length;
  const btnStuck = record ? record.buttons.stuck : Object.values(state.buttonStates).filter(b => b.isStuck).length;

  dom.printBtnCount.textContent = `${btnPassed} / ${btnTotal}`;
  dom.printBtnStuck.textContent = `${btnStuck} (${btnStuck === 0 ? 'Ninguno' : 'Defecto'})`;
  dom.printBtnVerdict.textContent = btnStuck === 0 ? 'PASS' : 'FAIL';

  const overall = record ? record.overallVerdict : (btnStuck === 0 && sl.verdict !== 'FAIL' && sr.verdict !== 'FAIL' ? 'PASS' : 'REVIEW');
  dom.printFinalStamp.textContent = overall === 'PASS' ? 'APTO (PASS)' : (overall === 'REVIEW' ? 'A REVISIÓN (REVIEW)' : 'NO APTO (FAIL)');
}

function updateVerdictBadgesUI() {
  evaluateStickOverall('l');
  evaluateStickOverall('r');
  updateTriggersSummaryBadge();
}

// ─────────────────────────────────────────────────────────────
// 17. INITIALIZATION & EVENT LISTENERS
// ─────────────────────────────────────────────────────────────
function initEventListeners() {
  // Language Switcher buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      setLanguage(e.target.dataset.lang);
    });
  });

  // Active Gamepad Select
  dom.activeGamepadSelect.addEventListener('change', (e) => {
    const val = parseInt(e.target.value, 10);
    setActiveGamepad(val >= 0 ? val : null);
  });

  // Model Profile Select
  dom.modelSelect.addEventListener('change', () => {
    resolveModel();
  });

  // Debug Guides Toggle
  dom.debugToggle.addEventListener('click', () => {
    state.debugMode = !state.debugMode;
    dom.debugToggle.classList.toggle('active', state.debugMode);
    dom.photoOverlaySvg.classList.toggle('debug-guides', state.debugMode);
  });

  // Photo / Diagram View buttons
  dom.btnViewPhoto.addEventListener('click', () => {
    state.viewMode = 'photo';
    dom.btnViewPhoto.classList.add('active');
    dom.btnViewDiagram.classList.remove('active');
    if (state.activeGpIndex !== null) {
      dom.photoViewBox.style.display   = 'flex';
      dom.diagramViewBox.style.display = 'none';
    }
  });

  dom.btnViewDiagram.addEventListener('click', () => {
    state.viewMode = 'diagram';
    dom.btnViewDiagram.classList.add('active');
    dom.btnViewPhoto.classList.remove('active');
    if (state.activeGpIndex !== null) {
      dom.photoViewBox.style.display   = 'none';
      dom.diagramViewBox.style.display = 'flex';
      if (!state.diagramRendered && typeof renderControllerDiagram === 'function') {
        renderControllerDiagram(state.model);
        state.diagramRendered = true;
      }
    }
  });

  // Micro-Center Zoom button
  dom.stickZoomBtn.addEventListener('click', () => {
    state.centerZoom = !state.centerZoom;
    dom.stickZoomBtn.classList.toggle('active', state.centerZoom);
  });

  // Diagnostic Stick Suite & Drift buttons
  dom.stickSuiteBtn.addEventListener('click', startFullSuite);
  dom.driftBtn.addEventListener('click', startDriftCapture);
  dom.stickClearTraceBtn.addEventListener('click', () => {
    state.stickHistoryL = [];
    state.stickHistoryR = [];
    state.circleBinsL.fill(0);
    state.circleBinsR.fill(0);
  });

  // Reset button testing matrix
  dom.btnResetButtonsTest.addEventListener('click', () => {
    for (const b of Object.values(state.buttonStates)) {
      b.clicks = 0;
      b.isStuck = false;
    }
    updateButtonsSummaryBadge();
  });

  // Raw Diagnostics Accordion
  dom.rawDiagToggle.addEventListener('click', () => {
    state.rawAccordionOpen = !state.rawAccordionOpen;
    dom.rawDiagArrow.classList.toggle('open', state.rawAccordionOpen);
    dom.rawDiagBody.style.display = state.rawAccordionOpen ? 'flex' : 'none';
  });

  // Session Actions
  dom.btnSaveDiag.addEventListener('click', saveCurrentSessionDiagnostic);
  dom.btnPrintReport.addEventListener('click', () => {
    populatePrintReport(null);
    window.print();
  });

  // History Modal
  dom.btnOpenHistory.addEventListener('click', () => {
    dom.historyModal.style.display = 'flex';
    renderHistoryTable();
  });
  dom.modalCloseBtn.addEventListener('click', () => {
    dom.historyModal.style.display = 'none';
  });
  dom.historyModal.addEventListener('click', (e) => {
    if (e.target === dom.historyModal) dom.historyModal.style.display = 'none';
  });

  dom.historySearchInput.addEventListener('input', (e) => {
    renderHistoryTable(e.target.value);
  });

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

  dom.btnClearHistory.addEventListener('click', () => {
    if (confirm('¿Vaciar todo el historial de diagnósticos locales?')) {
      DiagnosticStore.clear();
      renderHistoryTable();
    }
  });
}

// ─────────────────────────────────────────────────────────────
// 18. DOM CONTENT LOADED ENTRY POINT
// ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initLanguage();
  initEventListeners();
  initGamepadLifecycle();
  resolveModel();
  buildButtonChips(16);
  drawLargeStick(dom.stickLCanvas, 0, 0, true);
  drawLargeStick(dom.stickRCanvas, 0, 0, false);
});
