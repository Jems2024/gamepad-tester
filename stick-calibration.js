/* ============================================================
   STICK CENTER CALIBRATION MODULE — stick-calibration.js
   - Isolated Analog Stick Center Measurement & Calibration Layer
   - Statistical Resting Center Calculation (Median + Mean + Jitter)
   - Strict Per-Controller Fingerprint Profile Persistence (localStorage)
   - Honest Hardware Calibration Capability Inspection (No Fake Writes)
   ============================================================ */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.StickCenterCalibration = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const STORAGE_KEY = 'gamepad_tester_center_calibrations_v1';
  const SCHEMA_VERSION = 1;

  const CALIBRATION_CONFIG = {
    TARGET_SAMPLES: 90,          // ~1.5s at 60Hz
    MIN_VALID_SAMPLES: 30,       // Minimum samples required for valid statistical center
    MAX_PEAK_TO_PEAK: 0.12,      // Maximum allowed peak-to-peak movement during rest sampling
    MAX_REST_DISPLACEMENT: 0.65, // Rejects if a stick is held near full deflection during rest
  };

  const CALIB_I18N = {
    es: {
      modalTitle: 'Calibrate Stick Center — Calibración de Centro Analógico',
      btnTrigger: '🎯 Calibrate Stick Center',
      bannerIdleTitle: 'Deja ambos sticks completamente sueltos en su posición natural de reposo.',
      bannerIdleSub: 'No toques, inclines ni presiones L3/R3 durante el muestreo. Esta función mide el centro en reposo (LX, LY, RX, RY) sin alterar las lecturas crudas del diagnóstico.',
      bannerSamplingTitle: 'Muestreando centro de reposo en tiempo real… Mantén los sticks sueltos.',
      bannerSamplingSub: 'Capturando muestras estadísticas de LX, LY, RX y RY para calcular la mediana exacta de reposo.',
      bannerSuccessTitle: '✓ Medición de centro y perfil de calibración completados.',
      bannerSuccessSub: 'El centro medido se ha guardado en el perfil local de este mando sin modificar las métricas crudas del test.',
      bannerErrorMove: '✕ Movimiento detectado durante el muestreo. Deja ambos sticks totalmente quietos y pulsa Reintentar.',
      bannerErrorDisconnect: '✕ El mando se desconectó o dejó de enviar ejes válidos durante la calibración.',
      bannerErrorInsufficient: '✕ Muestras válidas insuficientes para calcular un centro fiable.',
      lblDevice: 'Mando:',
      lblProgress: 'Progreso de muestreo:',
      lblSamples: 'muestras',
      secMeasuredCenters: 'Centro en Reposo Medido (Mediana Estadística) y Vista Previa',
      lblCenterMeasured: 'Centro:',
      lblRawLive: 'Crudo:',
      lblPreviewCal: 'Calibrado:',
      lblJitter: 'Jitter:',
      cardAMitle: 'A. Medición de Centro',
      cardBMitle: 'B. Perfil Software (Local)',
      cardCMitle: 'C. Calibración Hardware',
      badgePending: 'Pendiente',
      badgeSampling: 'Muestreando',
      badgeCompleted: 'Completado',
      badgeSaved: 'Guardado',
      badgeLoaded: 'Activo',
      badgeError: 'Error',
      badgeNotSupported: 'Solo Lectura API',
      badgeSafeMode: 'Protegido (Sin EEPROM)',
      descAIdle: 'Listo para capturar muestras de reposo en los 4 ejes (LX, LY, RX, RY).',
      descADone: 'Mediana calculada con {n} muestras estables (desviación máx: {j}).',
      descBIdle: 'Ningún perfil de centro guardado todavía para la huella de este mando.',
      descBSaved: 'Perfil guardado en localStorage para este identificador de hardware ({ts}).',
      hwXbox360Wired: 'Xbox 360 Wired (XInput): el navegador recibe ejes normalizados vía XInput; el protocolo USB XInput no expone comandos WebHID de calibración de centro en firmware.',
      hwXbox360Wireless: 'Xbox 360 Wireless Receiver: conectado vía receptor propietario XInput; sin soporte de escritura de centro en hardware desde el navegador.',
      hwXboxOne: 'Xbox One Controller (GIP/XInput): el protocolo Microsoft GIP está bloqueado en WebHID por seguridad del navegador y no permite escritura directa de centro en EEPROM.',
      hwXboxSeries: 'Xbox Series X|S Controller (GIP/BLE): gestionado por el driver del sistema (XInput/GameInput); no expone comandos verificados de calibración de hardware en navegador.',
      hwPs4: 'Sony DualShock 4 (PS4): conectado mediante Gamepad API estándar. No se envían comandos de escritura EEPROM/NVS sin verificación de placa para evitar corromper el firmware.',
      hwPs5: 'Sony DualSense (PS5): conectado mediante Gamepad API estándar. La calibración permanente en memoria flash interna requiere sesión de fábrica verificada; se aplica perfil software seguro.',
      hwPs3: 'Sony DualShock 3 (PS3): expuesto mediante driver HID/Sixaxis estándar; el hardware no ofrece comando WebHID verificado de recalibración de centro.',
      hwPs2: 'Adaptador PS2 a USB (Twin USB / DragonRise / Mayflash): el conversor USB traduce la señal analógica y no dispone de EEPROM de calibración accesible por software.',
      hwGeneric: 'Mando Estándar / Genérico: conectado por Gamepad API sin protocolo WebHID de fabricante verificado para escritura en firmware.',
      btnStart: '▶ Iniciar Medición',
      btnRetry: '🔄 Retry (Reintentar)',
      btnCancel: 'Cancelar',
      btnFinish: '✓ Finish (Finalizar)',
      btnClearProfile: 'Borrar Perfil',
    },
    en: {
      modalTitle: 'Calibrate Stick Center — Analog Resting Center Calibration',
      btnTrigger: '🎯 Calibrate Stick Center',
      bannerIdleTitle: 'Leave both analog sticks completely untouched in their natural resting positions.',
      bannerIdleSub: 'Do not touch, tilt, or press L3/R3 during sampling. This feature measures the resting center (LX, LY, RX, RY) without altering raw diagnostic readings.',
      bannerSamplingTitle: 'Sampling resting center in real time… Keep both sticks untouched.',
      bannerSamplingSub: 'Collecting statistical samples for LX, LY, RX, and RY to compute the exact resting median.',
      bannerSuccessTitle: '✓ Center measurement and software calibration profile completed.',
      bannerSuccessSub: 'Measured center values are saved for this controller without modifying raw diagnostic calculations.',
      bannerErrorMove: '✕ Stick movement detected during sampling. Leave both sticks untouched and click Retry.',
      bannerErrorDisconnect: '✕ Controller disconnected or stopped reporting valid axes during calibration.',
      bannerErrorInsufficient: '✕ Insufficient valid samples to compute a reliable resting center.',
      lblDevice: 'Controller:',
      lblProgress: 'Sampling progress:',
      lblSamples: 'samples',
      secMeasuredCenters: 'Measured Resting Center (Statistical Median) & Live Preview',
      lblCenterMeasured: 'Center:',
      lblRawLive: 'Raw:',
      lblPreviewCal: 'Calibrated:',
      lblJitter: 'Jitter:',
      cardAMitle: 'A. Center Measurement',
      cardBMitle: 'B. Software Profile (Local)',
      cardCMitle: 'C. Hardware Calibration',
      badgePending: 'Pending',
      badgeSampling: 'Sampling',
      badgeCompleted: 'Completed',
      badgeSaved: 'Saved',
      badgeLoaded: 'Active',
      badgeError: 'Error',
      badgeNotSupported: 'API Read-Only',
      badgeSafeMode: 'Protected (No EEPROM)',
      descAIdle: 'Ready to collect resting samples across all 4 stick axes (LX, LY, RX, RY).',
      descADone: 'Statistical median computed across {n} stable samples (max jitter: {j}).',
      descBIdle: 'No saved center profile yet for this controller hardware fingerprint.',
      descBSaved: 'Profile saved in localStorage for this exact hardware signature ({ts}).',
      hwXbox360Wired: 'Xbox 360 Wired (XInput): browser accesses axes via XInput; the USB XInput interface does not expose WebHID firmware center-calibration commands.',
      hwXbox360Wireless: 'Xbox 360 Wireless Receiver: routed through OS XInput receiver driver; direct hardware center calibration is not supported in browser.',
      hwXboxOne: 'Xbox One Controller (GIP/XInput): Microsoft GIP usages are protected by browser WebHID rules and do not expose direct EEPROM center writes.',
      hwXboxSeries: 'Xbox Series X|S Controller (GIP/BLE): managed by OS GameInput/XInput driver; verified browser hardware calibration is not available.',
      hwPs4: 'Sony DualShock 4 (PS4): connected via standard Gamepad API. Undocumented NVS/EEPROM writes are blocked to prevent firmware corruption on retail/clone boards.',
      hwPs5: 'Sony DualSense (PS5): connected via standard Gamepad API. Permanent flash center writes require factory-unlocked HID sessions; using safe software profile.',
      hwPs3: 'Sony DualShock 3 (PS3): exposed via standard HID/Sixaxis driver; no verified browser WebHID hardware center-calibration command exists.',
      hwPs2: 'PS2-to-USB Adapter (Twin USB / DragonRise / Mayflash): USB bridge translates analog voltages and has no software-writable calibration EEPROM.',
      hwGeneric: 'Generic / Standard Controller: connected via Gamepad API without a verified vendor WebHID firmware calibration protocol.',
      btnStart: '▶ Start Measurement',
      btnRetry: '🔄 Retry',
      btnCancel: 'Cancel',
      btnFinish: '✓ Finish',
      btnClearProfile: 'Clear Profile',
    },
    it: {
      modalTitle: 'Calibrate Stick Center — Calibrazione Centro Stick Analogici',
      btnTrigger: '🎯 Calibrate Stick Center',
      bannerIdleTitle: 'Lascia entrambi gli stick analogici completamente fermi nella posizione naturale di riposo.',
      bannerIdleSub: 'Non toccare, inclinare o premere L3/R3 durante il campionamento. Misura il centro (LX, LY, RX, RY) senza alterare le letture diagnostiche grezze.',
      bannerSamplingTitle: 'Campionamento del centro a riposo in corso… Non toccare gli stick.',
      bannerSamplingSub: 'Raccolta campioni statistici per LX, LY, RX e RY per calcolare la mediana di riposo.',
      bannerSuccessTitle: '✓ Misurazione del centro e profilo di calibrazione completati.',
      bannerSuccessSub: 'Il centro misurato è stato salvato per questo controller senza modificare i calcoli diagnostici.',
      bannerErrorMove: '✕ Movimento rilevato durante il campionamento. Lascia gli stick fermi e premi Retry.',
      bannerErrorDisconnect: '✕ Controller disconnesso durante la calibrazione.',
      bannerErrorInsufficient: '✕ Campioni validi insufficienti per calcolare il centro.',
      lblDevice: 'Controller:',
      lblProgress: 'Progresso campionamento:',
      lblSamples: 'campioni',
      secMeasuredCenters: 'Centro a Riposo Misurato (Mediana) e Anteprima',
      lblCenterMeasured: 'Centro:',
      lblRawLive: 'Grezzo:',
      lblPreviewCal: 'Calibrato:',
      lblJitter: 'Jitter:',
      cardAMitle: 'A. Misurazione Centro',
      cardBMitle: 'B. Profilo Software (Locale)',
      cardCMitle: 'C. Calibrazione Hardware',
      badgePending: 'In attesa',
      badgeSampling: 'In corso',
      badgeCompleted: 'Completato',
      badgeSaved: 'Salvato',
      badgeLoaded: 'Attivo',
      badgeError: 'Errore',
      badgeNotSupported: 'Solo Lettura API',
      badgeSafeMode: 'Protetto (No EEPROM)',
      descAIdle: 'Pronto per raccogliere campioni a riposo sui 4 assi (LX, LY, RX, RY).',
      descADone: 'Mediana calcolata su {n} campioni stabili (jitter max: {j}).',
      descBIdle: 'Nessun profilo salvato per questo identificatore hardware.',
      descBSaved: 'Profilo salvato in localStorage per questo controller ({ts}).',
      hwXbox360Wired: 'Xbox 360 Wired (XInput): gestito tramite driver XInput; non espone comandi WebHID di calibrazione hardware.',
      hwXbox360Wireless: 'Xbox 360 Wireless Receiver: connesso tramite ricevitore XInput; calibrazione hardware non supportata nel browser.',
      hwXboxOne: 'Xbox One Controller (GIP/XInput): il protocollo GIP è protetto nel browser e non consente scritture EEPROM dirette.',
      hwXboxSeries: 'Xbox Series X|S Controller (GIP/BLE): gestito dal driver di sistema; calibrazione hardware non disponibile via browser.',
      hwPs4: 'Sony DualShock 4 (PS4): connesso via Gamepad API. Scritture EEPROM/NVS disabilitate per prevenire corruzione firmware.',
      hwPs5: 'Sony DualSense (PS5): connesso via Gamepad API. La scrittura flash richiede sessione di fabbrica; attivo profilo software sicuro.',
      hwPs3: 'Sony DualShock 3 (PS3): nessun comando WebHID verificato per la calibrazione hardware del centro.',
      hwPs2: 'Adattatore PS2-USB: il convertitore USB non dispone di EEPROM di calibrazione scrivibile.',
      hwGeneric: 'Controller Generico: connesso via Gamepad API senza protocollo WebHID di calibrazione firmware.',
      btnStart: '▶ Avvia Misurazione',
      btnRetry: '🔄 Retry',
      btnCancel: 'Cancel',
      btnFinish: '✓ Finish',
      btnClearProfile: 'Elimina Profilo',
    },
    fr: {
      modalTitle: 'Calibrate Stick Center — Calibration du Centre des Sticks',
      btnTrigger: '🎯 Calibrate Stick Center',
      bannerIdleTitle: 'Laissez les deux sticks analogiques complètement relâchés dans leur position de repos.',
      bannerIdleSub: 'Ne touchez pas et n’appuyez pas sur L3/R3 pendant l’échantillonnage. Mesure le centre (LX, LY, RX, RY) sans modifier les valeurs brutes.',
      bannerSamplingTitle: 'Échantillonnage du centre au repos… Ne touchez pas aux sticks.',
      bannerSamplingSub: 'Collecte d’échantillons statistiques pour LX, LY, RX et RY afin de calculer la médiane.',
      bannerSuccessTitle: '✓ Mesure du centre et profil de calibration terminés.',
      bannerSuccessSub: 'Les valeurs centrales sont enregistrées localement sans altérer les calculs de diagnostic.',
      bannerErrorMove: '✕ Mouvement détecté pendant l’échantillonnage. Gardez les sticks immobiles et cliquez sur Retry.',
      bannerErrorDisconnect: '✕ Manette déconnectée pendant la calibration.',
      bannerErrorInsufficient: '✕ Échantillons insuffisants pour calculer un centre fiable.',
      lblDevice: 'Manette:',
      lblProgress: 'Progression:',
      lblSamples: 'échantillons',
      secMeasuredCenters: 'Centre au Repos Mesuré (Médiane) et Aperçu',
      lblCenterMeasured: 'Centre:',
      lblRawLive: 'Brut:',
      lblPreviewCal: 'Calibré:',
      lblJitter: 'Jitter:',
      cardAMitle: 'A. Mesure du Centre',
      cardBMitle: 'B. Profil Logiciel (Local)',
      cardCMitle: 'C. Calibration Matérielle',
      badgePending: 'En attente',
      badgeSampling: 'En cours',
      badgeCompleted: 'Terminé',
      badgeSaved: 'Enregistré',
      badgeLoaded: 'Actif',
      badgeError: 'Erreur',
      badgeNotSupported: 'Lecture Seule API',
      badgeSafeMode: 'Protégé (Sans EEPROM)',
      descAIdle: 'Prêt à capturer les échantillons au repos sur les 4 axes (LX, LY, RX, RY).',
      descADone: 'Médiane calculée sur {n} échantillons stables (jitter max: {j}).',
      descBIdle: 'Aucun profil enregistré pour cette empreinte matérielle.',
      descBSaved: 'Profil sauvegardé dans localStorage pour ce matériel ({ts}).',
      hwXbox360Wired: 'Xbox 360 Wired (XInput): géré via XInput; aucune commande WebHID de calibration matérielle disponible.',
      hwXbox360Wireless: 'Xbox 360 Wireless Receiver: récepteur XInput; calibration matérielle non supportée dans le navigateur.',
      hwXboxOne: 'Xbox One Controller (GIP/XInput): protocole GIP protégé par le navigateur, sans écriture EEPROM directe.',
      hwXboxSeries: 'Xbox Series X|S Controller (GIP/BLE): géré par le pilote système; calibration matérielle non disponible via navigateur.',
      hwPs4: 'Sony DualShock 4 (PS4): connecté via Gamepad API. Écritures EEPROM/NVS bloquées par sécurité.',
      hwPs5: 'Sony DualSense (PS5): connecté via Gamepad API. Profil logiciel sécurisé utilisé.',
      hwPs3: 'Sony DualShock 3 (PS3): aucune commande WebHID vérifiée pour la calibration matérielle.',
      hwPs2: 'Adaptateur PS2-USB: le convertisseur USB ne possède pas d’EEPROM de calibration.',
      hwGeneric: 'Manette Générique: connectée via Gamepad API sans protocole WebHID de calibration firmware.',
      btnStart: '▶ Démarrer',
      btnRetry: '🔄 Retry',
      btnCancel: 'Cancel',
      btnFinish: '✓ Finish',
      btnClearProfile: 'Effacer Profil',
    },
    de: {
      modalTitle: 'Calibrate Stick Center — Analogstick-Mittelpunktkalibrierung',
      btnTrigger: '🎯 Calibrate Stick Center',
      bannerIdleTitle: 'Lassen Sie beide Analogsticks völlig unberührt in ihrer natürlichen Ruheposition.',
      bannerIdleSub: 'Berühren oder drücken Sie L3/R3 während der Messung nicht. Misst das Ruhezentrum (LX, LY, RX, RY), ohne die Rohdaten zu verändern.',
      bannerSamplingTitle: 'Ruhezentrum wird in Echtzeit gemessen… Sticks bitte nicht berühren.',
      bannerSamplingSub: 'Sammeln statistischer Proben für LX, LY, RX und RY zur Berechnung des Medians.',
      bannerSuccessTitle: '✓ Mittelpunktsmessung und Kalibrierungsprofil abgeschlossen.',
      bannerSuccessSub: 'Die gemessenen Mittelpunkte wurden gespeichert, ohne die bestehenden Diagnosewerte zu verändern.',
      bannerErrorMove: '✕ Stick-Bewegung während der Messung erkannt. Sticks ruhig lassen und Retry klicken.',
      bannerErrorDisconnect: '✕ Controller wurde während der Kalibrierung getrennt.',
      bannerErrorInsufficient: '✕ Unzureichende gültige Messwerte für eine zuverlässige Berechnung.',
      lblDevice: 'Controller:',
      lblProgress: 'Messfortschritt:',
      lblSamples: 'Proben',
      secMeasuredCenters: 'Gemessenes Ruhezentrum (Statistischer Median) & Vorschau',
      lblCenterMeasured: 'Zentrum:',
      lblRawLive: 'Rohwert:',
      lblPreviewCal: 'Kalibriert:',
      lblJitter: 'Jitter:',
      cardAMitle: 'A. Zentrumsmessung',
      cardBMitle: 'B. Software-Profil (Lokal)',
      cardCMitle: 'C. Hardware-Kalibrierung',
      badgePending: 'Ausstehend',
      badgeSampling: 'Messung',
      badgeCompleted: 'Fertig',
      badgeSaved: 'Gespeichert',
      badgeLoaded: 'Aktiv',
      badgeError: 'Fehler',
      badgeNotSupported: 'Nur-Lese API',
      badgeSafeMode: 'Geschützt (Ohne EEPROM)',
      descAIdle: 'Bereit zur Erfassung der Ruhewerte auf allen 4 Achsen (LX, LY, RX, RY).',
      descADone: 'Statistischer Median aus {n} stabilen Proben berechnet (Max-Jitter: {j}).',
      descBIdle: 'Noch kein gespeichertes Profil für diese Hardware-Kennung vorhanden.',
      descBSaved: 'Profil in localStorage für diese Hardware-Signatur gespeichert ({ts}).',
      hwXbox360Wired: 'Xbox 360 Wired (XInput): Zugriff über XInput; keine WebHID-Firmware-Kalibrierungsbefehle verfügbar.',
      hwXbox360Wireless: 'Xbox 360 Wireless Receiver: XInput-Empfänger; keine Hardware-Kalibrierung im Browser unterstützt.',
      hwXboxOne: 'Xbox One Controller (GIP/XInput): Microsoft GIP ist im Browser geschützt; kein direkter EEPROM-Schreibzugriff.',
      hwXboxSeries: 'Xbox Series X|S Controller (GIP/BLE): vom Systemtreiber verwaltet; keine Browser-Hardwarekalibrierung verfügbar.',
      hwPs4: 'Sony DualShock 4 (PS4): über Standard-Gamepad-API verbunden. Keine ungesicherten EEPROM/NVS-Schreibzugriffe.',
      hwPs5: 'Sony DualSense (PS5): über Standard-Gamepad-API verbunden. Sicheres Software-Kalibrierungsprofil aktiv.',
      hwPs3: 'Sony DualShock 3 (PS3): kein verifizierter WebHID-Befehl zur Hardware-Mittelpunktkalibrierung vorhanden.',
      hwPs2: 'PS2-zu-USB-Adapter: USB-Konverter besitzt keinen beschreibbaren Kalibrierungs-EEPROM.',
      hwGeneric: 'Standard-/Generischer Controller: über Gamepad-API ohne verifiziertes Firmware-Kalibrierungsprotokoll verbunden.',
      btnStart: '▶ Messung starten',
      btnRetry: '🔄 Retry',
      btnCancel: 'Cancel',
      btnFinish: '✓ Finish',
      btnClearProfile: 'Profil löschen',
    }
  };

  function getLang() {
    if (typeof currentLang === 'string' && CALIB_I18N[currentLang]) {
      return currentLang;
    }
    return 'es';
  }

  function ct(key, replacements) {
    const lang = getLang();
    const dict = CALIB_I18N[lang] || CALIB_I18N.es;
    let str = dict[key] || CALIB_I18N.en[key] || CALIB_I18N.es[key] || key;
    if (replacements) {
      for (const [k, v] of Object.entries(replacements)) {
        str = str.replace(`{${k}}`, String(v));
      }
    }
    return str;
  }

  // ─────────────────────────────────────────────────────────────
  // 1. CONTROLLER VALIDATION & HARDWARE CAPABILITY INSPECTION
  // ─────────────────────────────────────────────────────────────
  function isCompatibleStickGamepad(gp) {
    if (!gp || !gp.connected) return false;
    if (!Array.isArray(gp.axes) && !(gp.axes && typeof gp.axes.length === 'number')) return false;
    if (gp.axes.length < 4) return false;
    for (let i = 0; i < 4; i++) {
      if (typeof gp.axes[i] !== 'number' || !Number.isFinite(gp.axes[i])) {
        return false;
      }
    }
    return true;
  }

  function buildDeviceKey(gp) {
    if (!gp || !gp.id) return '';
    const rawId = String(gp.id).trim();
    const mapping = String(gp.mapping || 'nonstandard').trim();
    const axesLen = gp.axes && typeof gp.axes.length === 'number' ? gp.axes.length : 0;
    const btnsLen = gp.buttons && typeof gp.buttons.length === 'number' ? gp.buttons.length : 0;
    return `${rawId}|${mapping}|a:${axesLen}|b:${btnsLen}`;
  }

  function inspectControllerCapabilities(gp, modelHint) {
    const valid = isCompatibleStickGamepad(gp);
    if (!valid) {
      return {
        isCompatible: false,
        deviceKey: '',
        family: 'none',
        centerMeasurementSupported: false,
        softwareProfileSupported: false,
        hardwareCalibrationSupported: false,
        hardwareStatusBadgeKey: 'badgeNotSupported',
        hardwareReasonKey: 'hwGeneric',
      };
    }

    const idLower = String(gp.id || '').toLowerCase();
    const model = modelHint || '';
    let family = 'generic';
    let hardwareReasonKey = 'hwGeneric';
    let hardwareStatusBadgeKey = 'badgeNotSupported';

    if (idLower.includes('dualsense') || idLower.includes('0ce6') || idLower.includes('0df2') || model === 'ps5') {
      family = 'ps5';
      hardwareReasonKey = 'hwPs5';
      hardwareStatusBadgeKey = 'badgeSafeMode';
    } else if (idLower.includes('dualshock 4') || idLower.includes('05c4') || idLower.includes('09cc') || model === 'ps4') {
      family = 'ps4';
      hardwareReasonKey = 'hwPs4';
      hardwareStatusBadgeKey = 'badgeSafeMode';
    } else if (idLower.includes('ps3') || idLower.includes('dualshock 3') || idLower.includes('0268') || model === 'ps3') {
      family = 'ps3';
      hardwareReasonKey = 'hwPs3';
      hardwareStatusBadgeKey = 'badgeNotSupported';
    } else if (
      idLower.includes('ps2') ||
      idLower.includes('twin usb') ||
      idLower.includes('dragonrise') ||
      idLower.includes('greenasia') ||
      idLower.includes('mayflash') ||
      idLower.includes('0810') ||
      idLower.includes('0079') ||
      model === 'ps2'
    ) {
      family = 'ps2-adapter';
      hardwareReasonKey = 'hwPs2';
      hardwareStatusBadgeKey = 'badgeNotSupported';
    } else if (idLower.includes('360') && (idLower.includes('wireless') || idLower.includes('receiver') || idLower.includes('0719') || idLower.includes('0291'))) {
      family = 'xbox-360-wireless';
      hardwareReasonKey = 'hwXbox360Wireless';
      hardwareStatusBadgeKey = 'badgeNotSupported';
    } else if (idLower.includes('360') || idLower.includes('028e')) {
      family = 'xbox-360-wired';
      hardwareReasonKey = 'hwXbox360Wired';
      hardwareStatusBadgeKey = 'badgeNotSupported';
    } else if (idLower.includes('series') || idLower.includes('0b12') || idLower.includes('0b13') || model === 'xbox-series-s') {
      family = 'xbox-series';
      hardwareReasonKey = 'hwXboxSeries';
      hardwareStatusBadgeKey = 'badgeNotSupported';
    } else if (idLower.includes('xbox') || idLower.includes('xinput') || idLower.includes('045e') || idLower.includes('02d1') || idLower.includes('02dd') || model === 'xbox-one') {
      family = 'xbox-one';
      hardwareReasonKey = 'hwXboxOne';
      hardwareStatusBadgeKey = 'badgeNotSupported';
    }

    return {
      isCompatible: true,
      deviceKey: buildDeviceKey(gp),
      family,
      centerMeasurementSupported: true,
      softwareProfileSupported: true,
      hardwareCalibrationSupported: false,
      hardwareStatusBadgeKey,
      hardwareReasonKey,
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 2. STATISTICAL CENTER CALCULATION & SAMPLE VALIDATION
  // ─────────────────────────────────────────────────────────────
  function computeMedian(values) {
    if (!Array.isArray(values) || values.length === 0) return 0;
    const sorted = values.slice().sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0) {
      return (sorted[mid - 1] + sorted[mid]) / 2;
    }
    return sorted[mid];
  }

  function computeMean(values) {
    if (!Array.isArray(values) || values.length === 0) return 0;
    let sum = 0;
    for (let i = 0; i < values.length; i++) sum += values[i];
    return sum / values.length;
  }

  function computeAxisStats(values) {
    const median = computeMedian(values);
    const mean = computeMean(values);
    let min = Infinity;
    let max = -Infinity;
    let sqDiffSum = 0;
    for (let i = 0; i < values.length; i++) {
      const v = values[i];
      if (v < min) min = v;
      if (v > max) max = v;
      const d = v - mean;
      sqDiffSum += d * d;
    }
    const peakToPeak = max - min;
    const stdDev = Math.sqrt(sqDiffSum / values.length);
    return {
      median: Number(median.toFixed(6)),
      mean: Number(mean.toFixed(6)),
      min: Number(min.toFixed(6)),
      max: Number(max.toFixed(6)),
      peakToPeak: Number(peakToPeak.toFixed(6)),
      stdDev: Number(stdDev.toFixed(6)),
    };
  }

  function computeCenterStatistics(samples, options) {
    const cfg = Object.assign({}, CALIBRATION_CONFIG, options || {});
    if (!Array.isArray(samples) || samples.length < cfg.MIN_VALID_SAMPLES) {
      return {
        ok: false,
        reason: 'INSUFFICIENT_SAMPLES',
        sampleCount: Array.isArray(samples) ? samples.length : 0,
      };
    }

    const lxArr = [];
    const lyArr = [];
    const rxArr = [];
    const ryArr = [];

    for (let i = 0; i < samples.length; i++) {
      const s = samples[i];
      if (
        !s ||
        typeof s.lx !== 'number' || !Number.isFinite(s.lx) ||
        typeof s.ly !== 'number' || !Number.isFinite(s.ly) ||
        typeof s.rx !== 'number' || !Number.isFinite(s.rx) ||
        typeof s.ry !== 'number' || !Number.isFinite(s.ry) ||
        Math.abs(s.lx) > 1.05 || Math.abs(s.ly) > 1.05 ||
        Math.abs(s.rx) > 1.05 || Math.abs(s.ry) > 1.05
      ) {
        continue;
      }

      if (
        Math.hypot(s.lx, s.ly) > cfg.MAX_REST_DISPLACEMENT ||
        Math.hypot(s.rx, s.ry) > cfg.MAX_REST_DISPLACEMENT
      ) {
        return {
          ok: false,
          reason: 'EXCESSIVE_MOVEMENT',
          sampleCount: lxArr.length,
        };
      }

      lxArr.push(s.lx);
      lyArr.push(s.ly);
      rxArr.push(s.rx);
      ryArr.push(s.ry);
    }

    if (lxArr.length < cfg.MIN_VALID_SAMPLES) {
      return {
        ok: false,
        reason: 'INSUFFICIENT_SAMPLES',
        sampleCount: lxArr.length,
      };
    }

    const stats = {
      lx: computeAxisStats(lxArr),
      ly: computeAxisStats(lyArr),
      rx: computeAxisStats(rxArr),
      ry: computeAxisStats(ryArr),
    };

    const maxPeakToPeak = Math.max(
      stats.lx.peakToPeak,
      stats.ly.peakToPeak,
      stats.rx.peakToPeak,
      stats.ry.peakToPeak
    );

    if (maxPeakToPeak > cfg.MAX_PEAK_TO_PEAK) {
      return {
        ok: false,
        reason: 'EXCESSIVE_MOVEMENT',
        sampleCount: lxArr.length,
        maxPeakToPeak: Number(maxPeakToPeak.toFixed(6)),
        stats,
      };
    }

    return {
      ok: true,
      sampleCount: lxArr.length,
      centers: {
        lx: stats.lx.median,
        ly: stats.ly.median,
        rx: stats.rx.median,
        ry: stats.ry.median,
      },
      means: {
        lx: stats.lx.mean,
        ly: stats.ly.mean,
        rx: stats.rx.mean,
        ry: stats.ry.mean,
      },
      maxJitter: Number(maxPeakToPeak.toFixed(6)),
      stats,
    };
  }

  function applyCalibrationOffset(rawAxes, centers) {
    if (!rawAxes || typeof rawAxes !== 'object') {
      return { lx: 0, ly: 0, rx: 0, ry: 0 };
    }
    const c = centers && typeof centers === 'object' ? centers : { lx: 0, ly: 0, rx: 0, ry: 0 };
    const clamp = (v) => Math.max(-1, Math.min(1, Number.isFinite(v) ? v : 0));
    return {
      lx: Number(clamp((rawAxes.lx || 0) - (c.lx || 0)).toFixed(6)),
      ly: Number(clamp((rawAxes.ly || 0) - (c.ly || 0)).toFixed(6)),
      rx: Number(clamp((rawAxes.rx || 0) - (c.rx || 0)).toFixed(6)),
      ry: Number(clamp((rawAxes.ry || 0) - (c.ry || 0)).toFixed(6)),
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 3. LOCALSTORAGE PROFILE PERSISTENCE & VALIDATION
  // ─────────────────────────────────────────────────────────────
  function isValidProfileRecord(rec) {
    if (!rec || typeof rec !== 'object') return false;
    if (rec.version !== SCHEMA_VERSION) return false;
    if (typeof rec.deviceKey !== 'string' || !rec.deviceKey.includes('|a:')) return false;
    if (typeof rec.deviceId !== 'string' || rec.deviceId.length === 0) return false;
    if (typeof rec.axesCount !== 'number' || rec.axesCount < 4) return false;
    if (typeof rec.sampleCount !== 'number' || rec.sampleCount < 1) return false;
    if (!rec.centers || typeof rec.centers !== 'object') return false;
    const axes = ['lx', 'ly', 'rx', 'ry'];
    for (const k of axes) {
      const v = rec.centers[k];
      if (typeof v !== 'number' || !Number.isFinite(v) || Math.abs(v) > 1) {
        return false;
      }
    }
    return true;
  }

  const CalibrationProfileStore = {
    _readAll(storageObj) {
      const store = storageObj || (typeof localStorage !== 'undefined' ? localStorage : null);
      if (!store) return {};
      try {
        const raw = store.getItem(STORAGE_KEY);
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
        const validMap = {};
        for (const [key, val] of Object.entries(parsed)) {
          if (isValidProfileRecord(val) && val.deviceKey === key) {
            validMap[key] = val;
          }
        }
        return validMap;
      } catch (e) {
        return {};
      }
    },

    _writeAll(map, storageObj) {
      const store = storageObj || (typeof localStorage !== 'undefined' ? localStorage : null);
      if (!store) return false;
      try {
        store.setItem(STORAGE_KEY, JSON.stringify(map));
        return true;
      } catch (e) {
        return false;
      }
    },

    getProfileForGamepad(gp, storageObj) {
      if (!isCompatibleStickGamepad(gp)) return null;
      const key = buildDeviceKey(gp);
      const map = this._readAll(storageObj);
      const profile = map[key] || null;
      if (!profile) return null;
      if (
        profile.deviceId !== String(gp.id).trim() ||
        profile.axesCount !== gp.axes.length ||
        profile.buttonsCount !== (gp.buttons ? gp.buttons.length : 0)
      ) {
        return null;
      }
      return profile;
    },

    saveProfileForGamepad(gp, calcResult, storageObj) {
      if (!isCompatibleStickGamepad(gp) || !calcResult || !calcResult.ok) return null;
      const key = buildDeviceKey(gp);
      const record = {
        version: SCHEMA_VERSION,
        deviceKey: key,
        deviceId: String(gp.id).trim(),
        mapping: String(gp.mapping || 'nonstandard').trim(),
        axesCount: gp.axes.length,
        buttonsCount: gp.buttons ? gp.buttons.length : 0,
        timestamp: new Date().toISOString(),
        sampleCount: calcResult.sampleCount,
        maxJitter: calcResult.maxJitter,
        centers: {
          lx: calcResult.centers.lx,
          ly: calcResult.centers.ly,
          rx: calcResult.centers.rx,
          ry: calcResult.centers.ry,
        },
        means: calcResult.means,
      };
      if (!isValidProfileRecord(record)) return null;
      const map = this._readAll(storageObj);
      map[key] = record;
      this._writeAll(map, storageObj);
      return record;
    },

    removeProfileForGamepad(gp, storageObj) {
      if (!gp) return false;
      const key = buildDeviceKey(gp);
      const map = this._readAll(storageObj);
      if (!map[key]) return false;
      delete map[key];
      return this._writeAll(map, storageObj);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // 4. UI CONTROLLER & MODAL STATE MACHINE
  // ─────────────────────────────────────────────────────────────
  const uiState = {
    isOpen: false,
    phase: 'IDLE', // 'IDLE' | 'SAMPLING' | 'COMPLETE' | 'ERROR'
    errorReason: null,
    samples: [],
    lastResult: null,
    activeProfile: null,
    activeDeviceKey: '',
    modelHint: 'ps4',
  };

  function getActiveBrowserGamepad() {
    if (typeof navigator === 'undefined' || !navigator.getGamepads) return null;
    const gps = navigator.getGamepads();
    if (typeof state === 'object' && state !== null && state.activeGpIndex !== null && gps[state.activeGpIndex]) {
      return gps[state.activeGpIndex];
    }
    for (let i = 0; i < gps.length; i++) {
      if (gps[i] && gps[i].connected) return gps[i];
    }
    return null;
  }

  function extractNormalizedAxes(gp, model) {
    if (typeof getNormalizedAxes === 'function') {
      return getNormalizedAxes(gp, model);
    }
    if (!gp || !gp.axes) return { lx: 0, ly: 0, rx: 0, ry: 0 };
    return {
      lx: gp.axes[0] || 0,
      ly: gp.axes[1] || 0,
      rx: gp.axes[2] || 0,
      ry: gp.axes[3] || 0,
    };
  }

  function fmtSigned(val) {
    if (typeof val !== 'number' || !Number.isFinite(val)) return '—';
    return (val >= 0 ? '+' : '') + val.toFixed(4);
  }

  function updateTriggerButtonState(gp) {
    if (typeof document === 'undefined') return;
    const btn = document.getElementById('stick-calibrate-center-btn');
    if (!btn) return;
    const compatible = isCompatibleStickGamepad(gp);
    btn.disabled = !compatible;
    btn.setAttribute('aria-disabled', String(!compatible));
  }

  function renderModalStaticText() {
    if (typeof document === 'undefined') return;
    const setTxt = (id, key) => {
      const el = document.getElementById(id);
      if (el) el.textContent = ct(key);
    };
    setTxt('calib-modal-title', 'modalTitle');
    setTxt('calib-lbl-device', 'lblDevice');
    setTxt('calib-lbl-progress', 'lblProgress');
    setTxt('calib-sec-centers-title', 'secMeasuredCenters');
    setTxt('calib-card-a-title', 'cardAMitle');
    setTxt('calib-card-b-title', 'cardBMitle');
    setTxt('calib-card-c-title', 'cardCMitle');
    setTxt('calib-cancel-btn', 'btnCancel');
    setTxt('calib-finish-btn', 'btnFinish');
    setTxt('calib-clear-profile-btn', 'btnClearProfile');

    ['lx', 'ly', 'rx', 'ry'].forEach((ax) => {
      setTxt(`calib-lbl-center-${ax}`, 'lblCenterMeasured');
      setTxt(`calib-lbl-raw-${ax}`, 'lblRawLive');
      setTxt(`calib-lbl-cal-${ax}`, 'lblPreviewCal');
      setTxt(`calib-lbl-jit-${ax}`, 'lblJitter');
    });
  }

  function renderModalDynamicState(gp) {
    if (typeof document === 'undefined' || !uiState.isOpen) return;
    renderModalStaticText();

    const caps = inspectControllerCapabilities(gp, uiState.modelHint);
    const devNameEl = document.getElementById('calib-device-name');
    const devMetaEl = document.getElementById('calib-device-meta');
    if (devNameEl) {
      devNameEl.textContent = gp && gp.id ? gp.id : '—';
    }
    if (devMetaEl) {
      devMetaEl.textContent = gp && gp.connected
        ? `Axes: ${gp.axes ? gp.axes.length : 0} | Mapping: ${gp.mapping || 'standard'} | Family: ${caps.family.toUpperCase()}`
        : 'Disconnected';
    }

    // Banner state
    const banner = document.getElementById('calib-instruction-banner');
    const bannerTitle = document.getElementById('calib-banner-title');
    const bannerSub = document.getElementById('calib-banner-sub');
    const bannerIcon = document.getElementById('calib-banner-icon');

    if (banner && bannerTitle && bannerSub && bannerIcon) {
      banner.className = 'calib-instruction-banner';
      if (uiState.phase === 'SAMPLING') {
        banner.classList.add('status-sampling');
        bannerIcon.textContent = '⏳';
        bannerTitle.textContent = ct('bannerSamplingTitle');
        bannerSub.textContent = ct('bannerSamplingSub');
      } else if (uiState.phase === 'COMPLETE') {
        banner.classList.add('status-success');
        bannerIcon.textContent = '✅';
        bannerTitle.textContent = ct('bannerSuccessTitle');
        bannerSub.textContent = ct('bannerSuccessSub');
      } else if (uiState.phase === 'ERROR') {
        banner.classList.add('status-error');
        bannerIcon.textContent = '⚠️';
        if (uiState.errorReason === 'EXCESSIVE_MOVEMENT') {
          bannerTitle.textContent = ct('bannerErrorMove');
        } else if (uiState.errorReason === 'DISCONNECTED') {
          bannerTitle.textContent = ct('bannerErrorDisconnect');
        } else {
          bannerTitle.textContent = ct('bannerErrorInsufficient');
        }
        bannerSub.textContent = ct('bannerIdleSub');
      } else {
        bannerIcon.textContent = '🎯';
        bannerTitle.textContent = ct('bannerIdleTitle');
        bannerSub.textContent = ct('bannerIdleSub');
      }
    }

    // Progress bar
    const count = uiState.samples.length;
    const target = CALIBRATION_CONFIG.TARGET_SAMPLES;
    const pct = uiState.phase === 'COMPLETE' ? 100 : Math.min(100, Math.round((count / target) * 100));
    const progFill = document.getElementById('calib-progress-fill');
    const progText = document.getElementById('calib-progress-text');
    if (progFill) progFill.style.width = `${pct}%`;
    if (progText) progText.textContent = `${count} / ${target} ${ct('lblSamples')} (${pct}%)`;

    // Centers & Live Preview
    const activeCenters = (uiState.lastResult && uiState.lastResult.centers)
      ? uiState.lastResult.centers
      : (uiState.activeProfile ? uiState.activeProfile.centers : null);

    const rawAxes = caps.isCompatible ? extractNormalizedAxes(gp, uiState.modelHint) : { lx: 0, ly: 0, rx: 0, ry: 0 };
    const calAxes = activeCenters ? applyCalibrationOffset(rawAxes, activeCenters) : rawAxes;

    ['lx', 'ly', 'rx', 'ry'].forEach((ax) => {
      const centerEl = document.getElementById(`calib-val-center-${ax}`);
      const rawEl = document.getElementById(`calib-val-raw-${ax}`);
      const calEl = document.getElementById(`calib-val-cal-${ax}`);
      const jitEl = document.getElementById(`calib-val-jit-${ax}`);

      if (centerEl) centerEl.textContent = activeCenters ? fmtSigned(activeCenters[ax]) : '—';
      if (rawEl) rawEl.textContent = caps.isCompatible ? fmtSigned(rawAxes[ax]) : '—';
      if (calEl) calEl.textContent = (caps.isCompatible && activeCenters) ? fmtSigned(calAxes[ax]) : '—';
      if (jitEl) {
        const st = uiState.lastResult && uiState.lastResult.stats && uiState.lastResult.stats[ax];
        jitEl.textContent = st ? st.peakToPeak.toFixed(4) : '—';
      }
    });

    // Outcome A: Center Measurement
    const badgeA = document.getElementById('calib-card-a-badge');
    const descA = document.getElementById('calib-card-a-desc');
    if (badgeA && descA) {
      if (uiState.phase === 'COMPLETE' && uiState.lastResult) {
        badgeA.className = 'calib-outcome-badge calib-badge-ok';
        badgeA.textContent = ct('badgeCompleted');
        descA.textContent = ct('descADone', {
          n: uiState.lastResult.sampleCount,
          j: uiState.lastResult.maxJitter.toFixed(4),
        });
      } else if (uiState.phase === 'SAMPLING') {
        badgeA.className = 'calib-outcome-badge calib-badge-info';
        badgeA.textContent = ct('badgeSampling');
        descA.textContent = ct('bannerSamplingSub');
      } else if (uiState.phase === 'ERROR') {
        badgeA.className = 'calib-outcome-badge calib-badge-warn';
        badgeA.textContent = ct('badgeError');
        descA.textContent = ct('bannerErrorMove');
      } else {
        badgeA.className = 'calib-outcome-badge calib-badge-muted';
        badgeA.textContent = ct('badgePending');
        descA.textContent = ct('descAIdle');
      }
    }

    // Outcome B: Software Calibration Profile
    const badgeB = document.getElementById('calib-card-b-badge');
    const descB = document.getElementById('calib-card-b-desc');
    const clearBtn = document.getElementById('calib-clear-profile-btn');
    if (badgeB && descB) {
      if (uiState.activeProfile) {
        badgeB.className = 'calib-outcome-badge calib-badge-ok';
        badgeB.textContent = uiState.phase === 'COMPLETE' ? ct('badgeSaved') : ct('badgeLoaded');
        const tsFormatted = uiState.activeProfile.timestamp
          ? new Date(uiState.activeProfile.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
          : 'OK';
        descB.textContent = ct('descBSaved', { ts: tsFormatted });
        if (clearBtn) clearBtn.style.display = 'inline-block';
      } else {
        badgeB.className = 'calib-outcome-badge calib-badge-muted';
        badgeB.textContent = ct('badgePending');
        descB.textContent = ct('descBIdle');
        if (clearBtn) clearBtn.style.display = 'none';
      }
    }

    // Outcome C: Hardware Calibration
    const badgeC = document.getElementById('calib-card-c-badge');
    const descC = document.getElementById('calib-card-c-desc');
    if (badgeC && descC) {
      badgeC.className = 'calib-outcome-badge calib-badge-warn';
      badgeC.textContent = ct(caps.hardwareStatusBadgeKey);
      descC.textContent = ct(caps.hardwareReasonKey);
    }

    // Action Buttons
    const retryBtn = document.getElementById('calib-retry-btn');
    const finishBtn = document.getElementById('calib-finish-btn');
    if (retryBtn) {
      retryBtn.disabled = !caps.isCompatible || uiState.phase === 'SAMPLING';
      retryBtn.textContent = (uiState.phase === 'IDLE' && !uiState.lastResult) ? ct('btnStart') : ct('btnRetry');
    }
    if (finishBtn) {
      finishBtn.disabled = uiState.phase === 'SAMPLING';
    }
  }

  function startSampling() {
    const gp = getActiveBrowserGamepad();
    if (!isCompatibleStickGamepad(gp)) {
      uiState.phase = 'ERROR';
      uiState.errorReason = 'DISCONNECTED';
      uiState.samples = [];
      renderModalDynamicState(null);
      return;
    }

    uiState.phase = 'SAMPLING';
    uiState.errorReason = null;
    uiState.samples = [];
    uiState.lastResult = null;
    uiState.activeDeviceKey = buildDeviceKey(gp);
    renderModalDynamicState(gp);
  }

  function cancelOrCloseModal() {
    uiState.phase = 'IDLE';
    uiState.errorReason = null;
    uiState.samples = [];
    uiState.isOpen = false;
    if (typeof document !== 'undefined') {
      const modal = document.getElementById('stick-calibration-modal');
      if (modal) modal.style.display = 'none';
    }
  }

  function openCalibrationModal() {
    const gp = getActiveBrowserGamepad();
    if (!isCompatibleStickGamepad(gp)) {
      updateTriggerButtonState(gp);
      return;
    }
    uiState.isOpen = true;
    uiState.phase = 'IDLE';
    uiState.errorReason = null;
    uiState.samples = [];
    uiState.lastResult = null;
    uiState.activeDeviceKey = buildDeviceKey(gp);
    uiState.activeProfile = CalibrationProfileStore.getProfileForGamepad(gp);

    if (typeof document !== 'undefined') {
      const modal = document.getElementById('stick-calibration-modal');
      if (modal) modal.style.display = 'flex';
    }
    renderModalDynamicState(gp);
  }

  function onFrameTick(gp, modelHint) {
    if (modelHint) uiState.modelHint = modelHint;
    updateTriggerButtonState(gp);

    if (!uiState.isOpen) return;

    // Check if controller disconnected or changed mid-calibration
    if (!isCompatibleStickGamepad(gp) || (uiState.activeDeviceKey && buildDeviceKey(gp) !== uiState.activeDeviceKey)) {
      if (uiState.phase === 'SAMPLING') {
        uiState.phase = 'ERROR';
        uiState.errorReason = 'DISCONNECTED';
        uiState.samples = [];
      }
      renderModalDynamicState(gp);
      return;
    }

    if (uiState.phase === 'SAMPLING') {
      const axes = extractNormalizedAxes(gp, uiState.modelHint);
      uiState.samples.push({
        lx: axes.lx,
        ly: axes.ly,
        rx: axes.rx,
        ry: axes.ry,
      });

      // Live movement guard: abort early if user moves stick significantly during rest sampling
      if (uiState.samples.length >= 4) {
        const first = uiState.samples[0];
        const delta = Math.max(
          Math.abs(axes.lx - first.lx),
          Math.abs(axes.ly - first.ly),
          Math.abs(axes.rx - first.rx),
          Math.abs(axes.ry - first.ry)
        );
        if (
          delta > CALIBRATION_CONFIG.MAX_PEAK_TO_PEAK ||
          Math.hypot(axes.lx, axes.ly) > CALIBRATION_CONFIG.MAX_REST_DISPLACEMENT ||
          Math.hypot(axes.rx, axes.ry) > CALIBRATION_CONFIG.MAX_REST_DISPLACEMENT
        ) {
          uiState.phase = 'ERROR';
          uiState.errorReason = 'EXCESSIVE_MOVEMENT';
          renderModalDynamicState(gp);
          return;
        }
      }

      if (uiState.samples.length >= CALIBRATION_CONFIG.TARGET_SAMPLES) {
        const res = computeCenterStatistics(uiState.samples);
        if (res.ok) {
          uiState.phase = 'COMPLETE';
          uiState.lastResult = res;
          uiState.activeProfile = CalibrationProfileStore.saveProfileForGamepad(gp, res);
        } else {
          uiState.phase = 'ERROR';
          uiState.errorReason = res.reason;
        }
      }
    }

    renderModalDynamicState(gp);
  }

  function initDOMListeners() {
    if (typeof document === 'undefined') return;
    const triggerBtn = document.getElementById('stick-calibrate-center-btn');
    const modal = document.getElementById('stick-calibration-modal');
    const closeBtn = document.getElementById('calib-close-btn');
    const cancelBtn = document.getElementById('calib-cancel-btn');
    const retryBtn = document.getElementById('calib-retry-btn');
    const finishBtn = document.getElementById('calib-finish-btn');
    const clearProfileBtn = document.getElementById('calib-clear-profile-btn');

    if (triggerBtn) {
      triggerBtn.addEventListener('click', () => {
        openCalibrationModal();
      });
    }
    if (closeBtn) {
      closeBtn.addEventListener('click', cancelOrCloseModal);
    }
    if (cancelBtn) {
      cancelBtn.addEventListener('click', cancelOrCloseModal);
    }
    if (finishBtn) {
      finishBtn.addEventListener('click', cancelOrCloseModal);
    }
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        startSampling();
      });
    }
    if (clearProfileBtn) {
      clearProfileBtn.addEventListener('click', () => {
        const gp = getActiveBrowserGamepad();
        if (gp) {
          CalibrationProfileStore.removeProfileForGamepad(gp);
          uiState.activeProfile = null;
          uiState.lastResult = null;
          uiState.phase = 'IDLE';
          renderModalDynamicState(gp);
        }
      });
    }
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) cancelOrCloseModal();
      });
    }

    updateTriggerButtonState(getActiveBrowserGamepad());
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initDOMListeners);
    } else {
      initDOMListeners();
    }
  }

  return {
    STORAGE_KEY,
    SCHEMA_VERSION,
    CALIBRATION_CONFIG,
    isCompatibleStickGamepad,
    buildDeviceKey,
    inspectControllerCapabilities,
    computeMedian,
    computeMean,
    computeCenterStatistics,
    applyCalibrationOffset,
    isValidProfileRecord,
    CalibrationProfileStore,
    onFrameTick,
    updateTriggerButtonState,
    openCalibrationModal,
    cancelOrCloseModal,
    startSampling,
    renderModalStaticText,
  };
});
