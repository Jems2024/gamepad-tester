/* ============================================================
   STICK CENTER CALIBRATION MODULE — stick-calibration.js
   - Isolated Analog Stick Center Measurement & Software Preview Layer
   - Statistical Resting Center Calculation (Median + Mean + Jitter)
   - Versioned Per-Unit / Hardware-Serial / Descriptor Profile Persistence
     with Non-Destructive Schema v1 -> v2 Migration
   - Explicit Opt-In Software-Corrected Preview (Raw Data Remains 100% Authoritative)
   - Honest Capability & Hardware Calibration Status Inspection
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
  const SCHEMA_VERSION = 2;

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
      bannerIdleSub: 'No toques, inclines ni presiones L3/R3 durante el muestreo. Los datos crudos siguen siendo la referencia oficial del diagnóstico.',
      bannerSamplingTitle: 'Muestreando centro de reposo en tiempo real… Mantén los sticks sueltos.',
      bannerSamplingSub: 'Capturando muestras estadísticas de LX, LY, RX y RY para calcular la mediana exacta de reposo.',
      bannerSuccessTitle: '✓ Medición completada y perfil software guardado en el navegador.',
      bannerSuccessSub: 'El ajuste se guarda localmente para vista previa opcional en este navegador (no modifica la consola ni los juegos).',
      bannerErrorMove: '✕ Movimiento detectado durante el muestreo. Deja ambos sticks totalmente quietos y pulsa Reintentar.',
      bannerErrorDisconnect: '✕ El mando se desconectó o dejó de enviar ejes válidos durante la calibración.',
      bannerErrorInsufficient: '✕ Muestras válidas insuficientes o fallo de almacenamiento local.',
      lblDevice: 'Mando:',
      lblProgress: 'Progreso de muestreo:',
      lblSamples: 'muestras',
      secMeasuredCenters: 'Centro en Reposo Medido (Mediana Estadística) y Vista Previa Software',
      lblCenterMeasured: 'Centro:',
      lblRawLive: 'Crudo (Oficial):',
      lblPreviewCal: 'Vista Previa SW:',
      lblJitter: 'Jitter:',
      cardAMitle: 'A. Medición de Centro',
      cardBMitle: 'B. Perfil Software (Navegador)',
      cardCMitle: 'C. Calibración Interna del Mando',
      badgePending: 'Pendiente',
      badgeSampling: 'Muestreando',
      badgeCompleted: 'Medición OK',
      badgeSaved: 'Perfil Guardado',
      badgeLoaded: 'Disponible',
      badgeApplied: 'Vista Previa Activa',
      badgeError: 'Error',
      badgeNotSupported: 'Solo Lectura API',
      badgeUsbWebHid: 'Disponible vía WebHID USB',
      descAIdle: 'Listo para capturar muestras de reposo en los 4 ejes (LX, LY, RX, RY).',
      descADone: 'Mediana calculada con {n} muestras estables (desviación máx: {j}).',
      descBIdle: 'Ningún perfil software activo para esta unidad.',
      descBSaved: 'Perfil software guardado ({idType}, {ts}). Solo aplica a la vista previa del navegador.',
      descBAmbiguous: 'Descriptor compartido por el modelo ({ts}). Pulsa "Aplicar Vista Previa" para usarlo en esta unidad.',
      hwXbox360Wired: 'Xbox 360 Wired (XInput): el navegador recibe ejes vía XInput; el interfaz USB XInput no expone comandos WebHID de calibración en firmware.',
      hwXbox360Wireless: 'Xbox 360 Wireless Receiver: conectado vía receptor XInput; sin soporte de calibración en hardware desde el navegador.',
      hwXboxOne: 'Xbox One Controller (GIP/XInput): el interfaz USB GIP (FF:47:D0) no es accesible desde WebHID; en Xbox One S (fw 5.22) el comando 0x1e es rechazado (0f 01).',
      hwXboxSeries: 'Xbox Series X|S (GIP 0x1e, fw ≥5.19.3221.0): requiere interfaz USB GIP (FF:47:D0) mediante app nativa (xboxctl / Accesorios de Xbox); no accesible por WebHID en navegador.',
      hwPs4: 'Sony DualShock 4 (PS4): soporta calibración real en dispositivo (0x90/0x91/0x92) por cable USB en el panel "Calibrate Joysticks (WebHID)".',
      hwPs5: 'Sony DualSense (PS5): soporta calibración real en dispositivo (0x82/0x83) y lectura de 12 palabras (0x80/0x81) por cable USB en el panel WebHID.',
      hwPs5Edge: 'Sony DualSense Edge: soporta calibración temporal en RAM por USB WebHID; los módulos de stick de serie tienen protección física contra escritura permanente.',
      hwPs3: 'Sony DualShock 3 (PS3): expuesto mediante driver HID/Sixaxis estándar; sin comando WebHID verificado de recalibración.',
      hwPs2: 'Adaptador PS2 a USB: el conversor traduce señal analógica y no dispone de memoria de calibración accesible.',
      hwGeneric: 'Mando Estándar / Genérico: conectado por Gamepad API sin protocolo WebHID de fabricante verificado para escritura en firmware.',
      btnStart: '▶ Iniciar Medición',
      btnRetry: '🔄 Retry (Reintentar)',
      btnCancel: 'Cancelar',
      btnFinish: '✓ Finish (Cerrar)',
      btnClearProfile: 'Borrar Perfil',
    },
    en: {
      modalTitle: 'Calibrate Stick Center — Analog Resting Center Calibration',
      btnTrigger: '🎯 Calibrate Stick Center',
      bannerIdleTitle: 'Leave both analog sticks completely untouched in their natural resting positions.',
      bannerIdleSub: 'Do not touch, tilt, or press L3/R3 during sampling. Raw controller readings remain authoritative for all diagnostics.',
      bannerSamplingTitle: 'Sampling resting center in real time… Keep both sticks untouched.',
      bannerSamplingSub: 'Collecting statistical samples for LX, LY, RX, and RY to compute the exact resting median.',
      bannerSuccessTitle: '✓ Center measurement completed and browser software profile saved.',
      bannerSuccessSub: 'Saved locally for optional browser preview only (does not modify the controller hardware or affect games/consoles).',
      bannerErrorMove: '✕ Stick movement detected during sampling. Leave both sticks untouched and click Retry.',
      bannerErrorDisconnect: '✕ Controller disconnected or stopped reporting valid axes during calibration.',
      bannerErrorInsufficient: '✕ Insufficient valid samples or local storage write failed.',
      lblDevice: 'Controller:',
      lblProgress: 'Sampling progress:',
      lblSamples: 'samples',
      secMeasuredCenters: 'Measured Resting Center (Statistical Median) & Software Preview',
      lblCenterMeasured: 'Center:',
      lblRawLive: 'Raw (Auth.):',
      lblPreviewCal: 'SW Preview:',
      lblJitter: 'Jitter:',
      cardAMitle: 'A. Center Measurement',
      cardBMitle: 'B. Browser Software Profile',
      cardCMitle: 'C. Device Hardware Calibration',
      badgePending: 'Pending',
      badgeSampling: 'Sampling',
      badgeCompleted: 'Measured',
      badgeSaved: 'Profile Saved',
      badgeLoaded: 'Available',
      badgeApplied: 'Preview Active',
      badgeError: 'Error',
      badgeNotSupported: 'API Read-Only',
      badgeUsbWebHid: 'Available via USB WebHID',
      descAIdle: 'Ready to collect resting samples across all 4 stick axes (LX, LY, RX, RY).',
      descADone: 'Statistical median computed across {n} stable samples (max jitter: {j}).',
      descBIdle: 'No active browser software profile for this unit.',
      descBSaved: 'Browser software profile saved ({idType}, {ts}). Applies only to local preview.',
      descBAmbiguous: 'Model descriptor profile available ({ts}). Click "Enable Software Preview" to apply to this unit.',
      hwXbox360Wired: 'Xbox 360 Wired (XInput): browser accesses axes via XInput; USB XInput does not expose WebHID firmware calibration commands.',
      hwXbox360Wireless: 'Xbox 360 Wireless Receiver: routed through OS XInput receiver driver; direct hardware calibration is not supported in browser.',
      hwXboxOne: 'Xbox One Controller (GIP/XInput): USB GIP interface (FF:47:D0) is not accessible via browser WebHID; Xbox One S (fw 5.22) rejects GIP 0x1e with [0f 01].',
      hwXboxSeries: 'Xbox Series X|S (GIP 0x1e, fw ≥5.19.3221.0): requires vendor USB interface FF:47:D0 via native tool (xboxctl / Xbox Accessories app); not accessible via browser WebHID.',
      hwPs4: 'Sony DualShock 4 (PS4): real device calibration (0x90/0x91/0x92) is supported over USB in the "Calibrate Joysticks (WebHID)" modal.',
      hwPs5: 'Sony DualSense (PS5): real device calibration (0x82/0x83) and 12-word finetune readout (0x80/0x81) are supported over USB in the WebHID modal.',
      hwPs5Edge: 'Sony DualSense Edge: temporary RAM calibration supported over USB WebHID; stock stick modules are hardware write-protected against permanent flash.',
      hwPs3: 'Sony DualShock 3 (PS3): exposed via standard HID/Sixaxis driver; no verified browser WebHID hardware calibration command exists.',
      hwPs2: 'PS2-to-USB Adapter: USB bridge translates analog voltages and has no software-writable calibration memory.',
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
      bannerIdleSub: 'Non toccare o premere L3/R3 durante il campionamento. I dati grezzi restano autorevoli per la diagnosi.',
      bannerSamplingTitle: 'Campionamento del centro a riposo in corso… Non toccare gli stick.',
      bannerSamplingSub: 'Raccolta campioni statistici per LX, LY, RX e RY per calcolare la mediana di riposo.',
      bannerSuccessTitle: '✓ Misurazione completata e profilo software salvato nel browser.',
      bannerSuccessSub: 'Il profilo viene applicato solo come anteprima locale nel browser.',
      bannerErrorMove: '✕ Movimento rilevato durante il campionamento. Lascia gli stick fermi e premi Retry.',
      bannerErrorDisconnect: '✕ Controller disconnesso durante la calibrazione.',
      bannerErrorInsufficient: '✕ Campioni validi insufficienti per calcolare il centro.',
      lblDevice: 'Controller:',
      lblProgress: 'Progresso campionamento:',
      lblSamples: 'campioni',
      secMeasuredCenters: 'Centro a Riposo Misurato (Mediana) e Anteprima Software',
      lblCenterMeasured: 'Centro:',
      lblRawLive: 'Grezzo:',
      lblPreviewCal: 'Anteprima SW:',
      lblJitter: 'Jitter:',
      cardAMitle: 'A. Misurazione Centro',
      cardBMitle: 'B. Profilo Software (Locale)',
      cardCMitle: 'C. Calibrazione Hardware',
      badgePending: 'In attesa',
      badgeSampling: 'In corso',
      badgeCompleted: 'Completato',
      badgeSaved: 'Salvato',
      badgeLoaded: 'Disponibile',
      badgeApplied: 'Attivo',
      badgeError: 'Errore',
      badgeNotSupported: 'Solo Lettura API',
      badgeUsbWebHid: 'Supportato via USB WebHID',
      descAIdle: 'Pronto per raccogliere campioni a riposo sui 4 assi (LX, LY, RX, RY).',
      descADone: 'Mediana calcolata su {n} campioni stabili (jitter max: {j}).',
      descBIdle: 'Nessun profilo attivo per questa unità.',
      descBSaved: 'Profilo software salvato ({idType}, {ts}).',
      descBAmbiguous: 'Profilo descrittore modello disponibile ({ts}).',
      hwXbox360Wired: 'Xbox 360 Wired (XInput): nessun comando WebHID di calibrazione hardware.',
      hwXbox360Wireless: 'Xbox 360 Wireless Receiver: calibrazione hardware non supportata nel browser.',
      hwXboxOne: 'Xbox One Controller (GIP): interfaccia USB FF:47:D0 non accessibile da WebHID.',
      hwXboxSeries: 'Xbox Series X|S (GIP 0x1e): richiede interfaccia USB FF:47:D0 nativa (xboxctl).',
      hwPs4: 'Sony DualShock 4 (PS4): calibrazione hardware supportata via USB nel pannello WebHID.',
      hwPs5: 'Sony DualSense (PS5): calibrazione hardware supportata via USB nel pannello WebHID.',
      hwPs5Edge: 'Sony DualSense Edge: calibrazione temporanea supportata via USB WebHID.',
      hwPs3: 'Sony DualShock 3 (PS3): nessun comando WebHID verificato.',
      hwPs2: 'Adattatore PS2-USB: nessuna memoria di calibrazione scrivibile.',
      hwGeneric: 'Controller Generico: connesso via Gamepad API.',
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
      bannerIdleSub: 'Ne touchez pas L3/R3 pendant l’échantillonnage. Les valeurs brutes restent la référence du diagnostic.',
      bannerSamplingTitle: 'Échantillonnage du centre au repos… Ne touchez pas aux sticks.',
      bannerSamplingSub: 'Collecte d’échantillons statistiques pour LX, LY, RX et RY.',
      bannerSuccessTitle: '✓ Mesure du centre et profil logiciel navigateur enregistrés.',
      bannerSuccessSub: 'Utilisé uniquement pour l’aperçu logiciel local.',
      bannerErrorMove: '✕ Mouvement détecté pendant l’échantillonnage.',
      bannerErrorDisconnect: '✕ Manette déconnectée pendant la calibration.',
      bannerErrorInsufficient: '✕ Échantillons insuffisants.',
      lblDevice: 'Manette:',
      lblProgress: 'Progression:',
      lblSamples: 'échantillons',
      secMeasuredCenters: 'Centre au Repos Mesuré (Médiane) et Aperçu Logiciel',
      lblCenterMeasured: 'Centre:',
      lblRawLive: 'Brut:',
      lblPreviewCal: 'Aperçu SW:',
      lblJitter: 'Jitter:',
      cardAMitle: 'A. Mesure du Centre',
      cardBMitle: 'B. Profil Logiciel (Local)',
      cardCMitle: 'C. Calibration Matérielle',
      badgePending: 'En attente',
      badgeSampling: 'En cours',
      badgeCompleted: 'Terminé',
      badgeSaved: 'Enregistré',
      badgeLoaded: 'Disponible',
      badgeApplied: 'Actif',
      badgeError: 'Erreur',
      badgeNotSupported: 'Lecture Seule API',
      badgeUsbWebHid: 'Disponible via USB WebHID',
      descAIdle: 'Prêt à capturer les échantillons au repos sur les 4 axes (LX, LY, RX, RY).',
      descADone: 'Médiane calculée sur {n} échantillons stables (jitter max: {j}).',
      descBIdle: 'Aucun profil enregistré pour cette unité.',
      descBSaved: 'Profil sauvegardé ({idType}, {ts}).',
      descBAmbiguous: 'Profil de modèle disponible ({ts}).',
      hwXbox360Wired: 'Xbox 360 Wired (XInput): aucune commande WebHID disponible.',
      hwXbox360Wireless: 'Xbox 360 Wireless Receiver: non supporté dans le navigateur.',
      hwXboxOne: 'Xbox One Controller (GIP): interface FF:47:D0 non accessible par WebHID.',
      hwXboxSeries: 'Xbox Series X|S (GIP 0x1e): requiert un outil USB natif (xboxctl).',
      hwPs4: 'Sony DualShock 4 (PS4): calibration matérielle supportée via USB WebHID.',
      hwPs5: 'Sony DualSense (PS5): calibration matérielle supportée via USB WebHID.',
      hwPs5Edge: 'Sony DualSense Edge: calibration RAM supportée via USB WebHID.',
      hwPs3: 'Sony DualShock 3 (PS3): aucune commande WebHID vérifiée.',
      hwPs2: 'Adaptateur PS2-USB: pas d’EEPROM de calibration.',
      hwGeneric: 'Manette Générique: connectée via Gamepad API.',
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
      bannerIdleSub: 'Berühren Sie L3/R3 während der Messung nicht. Rohdaten bleiben für die Diagnose maßgeblich.',
      bannerSamplingTitle: 'Ruhezentrum wird in Echtzeit gemessen… Sticks bitte nicht berühren.',
      bannerSamplingSub: 'Sammeln statistischer Proben für LX, LY, RX und RY.',
      bannerSuccessTitle: '✓ Mittelpunktsmessung und Browser-Softwareprofil gespeichert.',
      bannerSuccessSub: 'Nur für die lokale Browser-Vorschau (ändert nicht die Controller-Hardware).',
      bannerErrorMove: '✕ Stick-Bewegung während der Messung erkannt.',
      bannerErrorDisconnect: '✕ Controller wurde während der Kalibrierung getrennt.',
      bannerErrorInsufficient: '✕ Unzureichende gültige Messwerte.',
      lblDevice: 'Controller:',
      lblProgress: 'Messfortschritt:',
      lblSamples: 'Proben',
      secMeasuredCenters: 'Gemessenes Ruhezentrum (Median) & Software-Vorschau',
      lblCenterMeasured: 'Zentrum:',
      lblRawLive: 'Rohwert:',
      lblPreviewCal: 'SW-Vorschau:',
      lblJitter: 'Jitter:',
      cardAMitle: 'A. Zentrumsmessung',
      cardBMitle: 'B. Software-Profil (Browser)',
      cardCMitle: 'C. Hardware-Kalibrierung',
      badgePending: 'Ausstehend',
      badgeSampling: 'Messung',
      badgeCompleted: 'Fertig',
      badgeSaved: 'Gespeichert',
      badgeLoaded: 'Verfügbar',
      badgeApplied: 'Aktiv',
      badgeError: 'Fehler',
      badgeNotSupported: 'Nur-Lese API',
      badgeUsbWebHid: 'Verfügbar über USB WebHID',
      descAIdle: 'Bereit zur Erfassung der Ruhewerte auf allen 4 Achsen (LX, LY, RX, RY).',
      descADone: 'Statistischer Median aus {n} stabilen Proben berechnet (Max-Jitter: {j}).',
      descBIdle: 'Kein aktives Software-Profil für diese Einheit.',
      descBSaved: 'Profil gespeichert ({idType}, {ts}).',
      descBAmbiguous: 'Modell-Profil verfügbar ({ts}).',
      hwXbox360Wired: 'Xbox 360 Wired (XInput): keine WebHID-Firmware-Befehle verfügbar.',
      hwXbox360Wireless: 'Xbox 360 Wireless Receiver: nicht im Browser unterstützt.',
      hwXboxOne: 'Xbox One Controller (GIP): USB-Schnittstelle FF:47:D0 im Browser geschützt.',
      hwXboxSeries: 'Xbox Series X|S (GIP 0x1e): erfordert nativen USB-Zugriff (xboxctl).',
      hwPs4: 'Sony DualShock 4 (PS4): Hardware-Kalibrierung über USB WebHID unterstützt.',
      hwPs5: 'Sony DualSense (PS5): Hardware-Kalibrierung über USB WebHID unterstützt.',
      hwPs5Edge: 'Sony DualSense Edge: temporäre RAM-Kalibrierung über USB WebHID unterstützt.',
      hwPs3: 'Sony DualShock 3 (PS3): kein verifizierter WebHID-Befehl vorhanden.',
      hwPs2: 'PS2-zu-USB-Adapter: kein beschreibbarer Kalibrierungs-EEPROM.',
      hwGeneric: 'Standard-/Generischer Controller: über Gamepad-API verbunden.',
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
  // 1. CONTROLLER VALIDATION, IDENTITY RESOLUTION & CAPABILITIES
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

  /**
   * Builds the model-level descriptor key.
   * NOTE (Fixes Defect G): Different physical units of the same controller model share this descriptor.
   * Therefore, profiles keyed only by descriptor are marked `identityType: 'descriptor-ambiguous'`
   * unless bound to a verified WebHID hardware serial/MAC or an explicit workshop Unit/SKU ID.
   */
  function buildDeviceKey(gp, identityOptions) {
    if (!gp || !gp.id) return '';
    const opts = identityOptions || {};
    const rawId = String(gp.id).trim();
    const mapping = String(gp.mapping || 'nonstandard').trim();
    const axesLen = gp.axes && typeof gp.axes.length === 'number' ? gp.axes.length : 0;
    const btnsLen = gp.buttons && typeof gp.buttons.length === 'number' ? gp.buttons.length : 0;
    const baseDescriptor = `${rawId}|${mapping}|a:${axesLen}|b:${btnsLen}`;

    if (opts.hardwareSerial && String(opts.hardwareSerial).trim()) {
      return `hw:${String(opts.hardwareSerial).trim()}|${baseDescriptor}`;
    }
    if (opts.unitId && String(opts.unitId).trim()) {
      return `unit:${String(opts.unitId).trim()}|${baseDescriptor}`;
    }
    return baseDescriptor;
  }

  function resolveIdentityContext(explicitOpts) {
    const opts = explicitOpts || {};
    let hardwareSerial = opts.hardwareSerial || null;
    let unitId = opts.unitId || null;

    if (!hardwareSerial && typeof root !== 'undefined' && root.WebHIDCalibrationModule) {
      const whState = root.WebHIDCalibrationModule.getState ? root.WebHIDCalibrationModule.getState() : null;
      if (whState && whState.verifiedHardwareInfo && whState.verifiedHardwareInfo.serialNumber) {
        hardwareSerial = whState.verifiedHardwareInfo.serialNumber;
      }
    }
    if (!unitId && typeof window !== 'undefined' && window.GamepadSessionAPI && typeof window.GamepadSessionAPI.getUnitIdentifier === 'function') {
      unitId = window.GamepadSessionAPI.getUnitIdentifier();
    }

    const identityType = hardwareSerial
      ? 'hardware-serial'
      : (unitId ? 'unit-id' : 'descriptor-ambiguous');

    return {
      hardwareSerial: hardwareSerial || null,
      unitId: unitId || null,
      identityType,
      isUniqueUnitIdentity: identityType === 'hardware-serial' || identityType === 'unit-id',
    };
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
        canReadInput: false,
        canMeasureCenter: false,
        canMeasureRange: false,
        canPreviewSoftwareCorrection: false,
        canCalibrateDeviceCenter: false,
        canCalibrateDeviceRange: false,
        canSaveCalibration: false,
        canReadCalibrationBackup: false,
        hardwareStatusBadgeKey: 'badgeNotSupported',
        hardwareReasonKey: 'hwGeneric',
      };
    }

    const idLower = String(gp.id || '').toLowerCase();
    const model = modelHint || '';
    let family = 'generic';
    let hardwareReasonKey = 'hwGeneric';
    let hardwareStatusBadgeKey = 'badgeNotSupported';
    let sonyUsbCapableModel = false;

    if (idLower.includes('0df2') || idLower.includes('dualsense edge')) {
      family = 'ps5-edge';
      hardwareReasonKey = 'hwPs5Edge';
      hardwareStatusBadgeKey = 'badgeUsbWebHid';
      sonyUsbCapableModel = true;
    } else if (idLower.includes('dualsense') || idLower.includes('0ce6') || model === 'ps5') {
      family = 'ps5';
      hardwareReasonKey = 'hwPs5';
      hardwareStatusBadgeKey = 'badgeUsbWebHid';
      sonyUsbCapableModel = true;
    } else if (idLower.includes('dualshock 4') || idLower.includes('05c4') || idLower.includes('09cc') || model === 'ps4') {
      family = 'ps4';
      hardwareReasonKey = 'hwPs4';
      hardwareStatusBadgeKey = 'badgeUsbWebHid';
      sonyUsbCapableModel = true;
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
    } else if (idLower.includes('xbox') || idLower.includes('xinput') || idLower.includes('045e') || idLower.includes('02d1') || idLower.includes('02dd') || idLower.includes('02ea') || model === 'xbox-one') {
      family = 'xbox-one';
      hardwareReasonKey = 'hwXboxOne';
      hardwareStatusBadgeKey = 'badgeNotSupported';
    }

    // Query live WebHID capability state if WebHIDCalibrationModule is present
    let webHidCaps = null;
    if (typeof root !== 'undefined' && root.WebHIDCalibrationModule && typeof root.WebHIDCalibrationModule.getCapabilities === 'function') {
      webHidCaps = root.WebHIDCalibrationModule.getCapabilities({ gamepad: gp });
    }

    const hwActiveNow = Boolean(webHidCaps && webHidCaps.canCalibrateDeviceCenter);

    return {
      isCompatible: true,
      deviceKey: buildDeviceKey(gp),
      family,
      centerMeasurementSupported: true,
      softwareProfileSupported: true,
      hardwareCalibrationSupported: hwActiveNow,
      sonyUsbCapableModel,
      canReadInput: true,
      canMeasureCenter: true,
      canMeasureRange: true,
      canPreviewSoftwareCorrection: true,
      canCalibrateDeviceCenter: hwActiveNow,
      canCalibrateDeviceRange: Boolean(webHidCaps && webHidCaps.canCalibrateDeviceRange),
      canSaveCalibration: Boolean(webHidCaps && webHidCaps.canSaveCalibration),
      canReadCalibrationBackup: Boolean(webHidCaps && webHidCaps.canReadCalibrationBackup),
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

  function applyCalibrationOffset(rawAxes, centers, boundsL, boundsR) {
    if (!rawAxes || typeof rawAxes !== 'object') {
      return { lx: 0, ly: 0, rx: 0, ry: 0 };
    }
    const c = centers && typeof centers === 'object' ? centers : { lx: 0, ly: 0, rx: 0, ry: 0 };
    const clamp = (v) => Math.max(-1, Math.min(1, Number.isFinite(v) ? v : 0));

    const normalizeWithBounds = (rawVal, centerVal, minB, maxB) => {
      const shifted = (rawVal || 0) - (centerVal || 0);
      if (typeof minB === 'number' && typeof maxB === 'number' && minB < -0.25 && maxB > 0.25) {
        if (shifted >= 0) {
          const spanPos = Math.max(0.25, maxB - (centerVal || 0));
          return clamp(shifted / spanPos);
        }
        const spanNeg = Math.max(0.25, (centerVal || 0) - minB);
        return clamp(shifted / spanNeg);
      }
      return clamp(shifted);
    };

    return {
      lx: Number(normalizeWithBounds(rawAxes.lx, c.lx, boundsL && boundsL.minX, boundsL && boundsL.maxX).toFixed(6)),
      ly: Number(normalizeWithBounds(rawAxes.ly, c.ly, boundsL && boundsL.minY, boundsL && boundsL.maxY).toFixed(6)),
      rx: Number(normalizeWithBounds(rawAxes.rx, c.rx, boundsR && boundsR.minX, boundsR && boundsR.maxX).toFixed(6)),
      ry: Number(normalizeWithBounds(rawAxes.ry, c.ry, boundsR && boundsR.minY, boundsR && boundsR.maxY).toFixed(6)),
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 3. VERSIONED LOCALSTORAGE PERSISTENCE & MIGRATION (v1 -> v2)
  // ─────────────────────────────────────────────────────────────
  function migrateRecordIfNeeded(rec, key) {
    if (!rec || typeof rec !== 'object') return null;
    if (rec.version === 1) {
      // Non-destructive migration from Schema v1 to Schema v2
      return Object.assign({}, rec, {
        version: SCHEMA_VERSION,
        deviceKey: rec.deviceKey || key,
        identityType: rec.hardwareSerial ? 'hardware-serial' : (rec.unitId ? 'unit-id' : 'descriptor-ambiguous'),
        hardwareSerial: rec.hardwareSerial || null,
        unitId: rec.unitId || null,
        migratedFromV1: true,
      });
    }
    return rec;
  }

  function isValidProfileRecord(rec) {
    if (!rec || typeof rec !== 'object') return false;
    if (rec.version !== SCHEMA_VERSION && rec.version !== 1) return false;
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
        let migratedAny = false;
        for (const [key, val] of Object.entries(parsed)) {
          if (isValidProfileRecord(val)) {
            const migrated = migrateRecordIfNeeded(val, key);
            if (migrated && migrated.deviceKey === key) {
              if (val.version === 1) migratedAny = true;
              validMap[key] = migrated;
            }
          }
        }
        if (migratedAny) {
          try { store.setItem(STORAGE_KEY, JSON.stringify(validMap)); } catch (_) {}
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

    getProfileForGamepad(gp, storageObj, identityOpts) {
      if (!isCompatibleStickGamepad(gp)) return null;
      const map = this._readAll(storageObj);
      const idCtx = resolveIdentityContext(identityOpts);

      // 1. Check exact hardware-serial or unit-id key first
      if (idCtx.isUniqueUnitIdentity) {
        const specificKey = buildDeviceKey(gp, idCtx);
        if (map[specificKey]) return map[specificKey];
      }

      // 2. Fallback to descriptor key
      const descKey = buildDeviceKey(gp);
      const profile = map[descKey] || null;
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
      const idCtx = resolveIdentityContext({
        hardwareSerial: calcResult.hardwareSerial,
        unitId: calcResult.unitId,
      });
      const baseDescKey = buildDeviceKey(gp);
      const specificKey = idCtx.isUniqueUnitIdentity ? buildDeviceKey(gp, idCtx) : baseDescKey;

      const record = {
        version: SCHEMA_VERSION,
        deviceKey: specificKey,
        baseDescriptorKey: baseDescKey,
        identityType: idCtx.identityType,
        hardwareSerial: idCtx.hardwareSerial,
        unitId: idCtx.unitId,
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
        boundsL: calcResult.boundsL || null,
        boundsR: calcResult.boundsR || null,
      };
      if (!isValidProfileRecord(record)) return null;
      const map = this._readAll(storageObj);
      map[specificKey] = record;
      // Also store under base descriptor key for lookup compatibility while keeping `identityType` explicit
      if (specificKey !== baseDescKey) {
        map[baseDescKey] = Object.assign({}, record, { deviceKey: baseDescKey });
      }
      const wroteOk = this._writeAll(map, storageObj);
      if (!wroteOk) return null;
      return record;
    },

    removeProfileForGamepad(gp, storageObj, identityOpts) {
      if (!gp) return false;
      const idCtx = resolveIdentityContext(identityOpts);
      const specificKey = idCtx.isUniqueUnitIdentity ? buildDeviceKey(gp, idCtx) : null;
      const baseKey = buildDeviceKey(gp);
      const map = this._readAll(storageObj);
      let removed = false;
      if (specificKey && map[specificKey]) {
        delete map[specificKey];
        removed = true;
      }
      if (map[baseKey]) {
        delete map[baseKey];
        removed = true;
      }
      if (!removed) return false;
      return this._writeAll(map, storageObj);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // 4. UI CONTROLLER, OPT-IN SOFTWARE PREVIEW & MODAL STATE MACHINE
  // ─────────────────────────────────────────────────────────────
  const uiState = {
    isOpen: false,
    phase: 'IDLE', // 'IDLE' | 'SAMPLING' | 'COMPLETE' | 'ERROR'
    errorReason: null,
    samples: [],
    lastResult: null,
    activeProfile: null,
    profileExplicitlyApplied: false, // Prevents auto-applying ambiguous model profiles to another unit without user action
    softwarePreviewEnabled: false,   // Opt-in preview toggle; raw controller data remains authoritative for diagnostics
    activeDeviceKey: '',
    modelHint: 'ps4',
  };

  function getActiveBrowserGamepad() {
    if (typeof window !== 'undefined' && window.GamepadSessionAPI && typeof window.GamepadSessionAPI.getActiveGamepad === 'function') {
      return window.GamepadSessionAPI.getActiveGamepad();
    }
    if (typeof navigator === 'undefined' || !navigator.getGamepads) return null;
    const gps = navigator.getGamepads();
    if (typeof state === 'object' && state !== null && state.activeGpIndex !== null && gps[state.activeGpIndex]) {
      return gps[state.activeGpIndex];
    }
    if (typeof window !== 'undefined' && window.state && window.state.activeGpIndex !== null && gps[window.state.activeGpIndex]) {
      return gps[window.state.activeGpIndex];
    }
    return null;
  }

  function extractNormalizedAxes(gp, model) {
    if (typeof window !== 'undefined' && window.GamepadSessionAPI && typeof window.GamepadSessionAPI.getNormalizedAxes === 'function') {
      return window.GamepadSessionAPI.getNormalizedAxes(gp, model);
    }
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

  function isSamplingActive() {
    return uiState.isOpen && uiState.phase === 'SAMPLING';
  }

  function isSoftwarePreviewEnabled() {
    return Boolean(uiState.softwarePreviewEnabled && uiState.activeProfile && uiState.profileExplicitlyApplied);
  }

  function setSoftwarePreviewEnabled(enabled) {
    uiState.softwarePreviewEnabled = Boolean(enabled);
    if (enabled && uiState.activeProfile) {
      uiState.profileExplicitlyApplied = true;
    }
    renderSoftwarePreviewBanner();
    return uiState.softwarePreviewEnabled;
  }

  function getSoftwareCorrectedAxes(rawAxes, gp) {
    if (!rawAxes) return { lx: 0, ly: 0, rx: 0, ry: 0 };
    const profile = uiState.activeProfile || (gp ? CalibrationProfileStore.getProfileForGamepad(gp) : null);
    if (!profile || !profile.centers) return rawAxes;
    return applyCalibrationOffset(rawAxes, profile.centers, profile.boundsL, profile.boundsR);
  }

  function onControllerChanged(newGp) {
    // Reset temporary sampling state and require explicit activation if profile identity is ambiguous (Fixes Defects G & I)
    if (uiState.phase === 'SAMPLING') {
      uiState.phase = 'ERROR';
      uiState.errorReason = 'DISCONNECTED';
    } else {
      uiState.phase = 'IDLE';
      uiState.errorReason = null;
    }
    uiState.samples = [];
    uiState.lastResult = null;
    uiState.activeDeviceKey = newGp ? buildDeviceKey(newGp) : '';
    uiState.activeProfile = newGp ? CalibrationProfileStore.getProfileForGamepad(newGp) : null;

    // Only auto-enable profile if bound to a verified unique hardware serial or explicit unit ID
    if (uiState.activeProfile && (uiState.activeProfile.identityType === 'hardware-serial' || uiState.activeProfile.identityType === 'unit-id')) {
      uiState.profileExplicitlyApplied = true;
    } else {
      uiState.profileExplicitlyApplied = false;
      uiState.softwarePreviewEnabled = false;
    }
    updateTriggerButtonState(newGp);
    renderSoftwarePreviewBanner();
    if (uiState.isOpen) {
      renderModalDynamicState(newGp);
    }
  }

  function renderSoftwarePreviewBanner() {
    if (typeof document === 'undefined') return;
    const toggleBtn = document.getElementById('stick-sw-preview-toggle-btn');
    const previewNote = document.getElementById('stick-sw-preview-note');
    if (toggleBtn) {
      const hasProf = Boolean(uiState.activeProfile);
      toggleBtn.disabled = !hasProf;
      toggleBtn.classList.toggle('active', isSoftwarePreviewEnabled());
      toggleBtn.textContent = isSoftwarePreviewEnabled()
        ? '👁 SW Preview: ON (Raw Auth.)'
        : '👁 SW Preview: OFF';
    }
    if (previewNote) {
      previewNote.style.display = isSoftwarePreviewEnabled() ? 'block' : 'none';
    }
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
    const idCtx = resolveIdentityContext();
    const devNameEl = document.getElementById('calib-device-name');
    const devMetaEl = document.getElementById('calib-device-meta');
    if (devNameEl) {
      devNameEl.textContent = gp && gp.id ? gp.id : '—';
    }
    if (devMetaEl) {
      const idBadge = idCtx.hardwareSerial
        ? `HW Serial: ${idCtx.hardwareSerial}`
        : (idCtx.unitId ? `Unit ID: ${idCtx.unitId}` : 'Identity: Model Descriptor (Ambiguous across units)');
      devMetaEl.textContent = gp && gp.connected
        ? `Axes: ${gp.axes ? gp.axes.length : 0} | Family: ${caps.family.toUpperCase()} | ${idBadge}`
        : 'Disconnected';
    }

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

    const count = uiState.samples.length;
    const target = CALIBRATION_CONFIG.TARGET_SAMPLES;
    const pct = uiState.phase === 'COMPLETE' ? 100 : Math.min(100, Math.round((count / target) * 100));
    const progFill = document.getElementById('calib-progress-fill');
    const progText = document.getElementById('calib-progress-text');
    if (progFill) progFill.style.width = `${pct}%`;
    if (progText) progText.textContent = `${count} / ${target} ${ct('lblSamples')} (${pct}%)`;

    const activeCenters = (uiState.lastResult && uiState.lastResult.centers)
      ? uiState.lastResult.centers
      : (uiState.activeProfile ? uiState.activeProfile.centers : null);

    const rawAxes = caps.isCompatible ? extractNormalizedAxes(gp, uiState.modelHint) : { lx: 0, ly: 0, rx: 0, ry: 0 };
    const calAxes = activeCenters
      ? applyCalibrationOffset(
          rawAxes,
          activeCenters,
          uiState.activeProfile ? uiState.activeProfile.boundsL : null,
          uiState.activeProfile ? uiState.activeProfile.boundsR : null
        )
      : rawAxes;

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

    // Outcome B: Browser Software Calibration Profile
    const badgeB = document.getElementById('calib-card-b-badge');
    const descB = document.getElementById('calib-card-b-desc');
    const clearBtn = document.getElementById('calib-clear-profile-btn');
    if (badgeB && descB) {
      if (uiState.activeProfile) {
        badgeB.className = 'calib-outcome-badge calib-badge-ok';
        badgeB.textContent = uiState.phase === 'COMPLETE'
          ? ct('badgeSaved')
          : (uiState.profileExplicitlyApplied ? ct('badgeApplied') : ct('badgeLoaded'));
        const tsFormatted = uiState.activeProfile.timestamp
          ? new Date(uiState.activeProfile.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
          : 'OK';
        const idTypeLbl = uiState.activeProfile.identityType || 'descriptor-ambiguous';
        descB.textContent = uiState.profileExplicitlyApplied
          ? ct('descBSaved', { idType: idTypeLbl, ts: tsFormatted })
          : ct('descBAmbiguous', { ts: tsFormatted });
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
      badgeC.className = caps.sonyUsbCapableModel ? 'calib-outcome-badge calib-badge-info' : 'calib-outcome-badge calib-badge-warn';
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
    if (typeof window !== 'undefined' && window.GamepadSessionAPI && typeof window.GamepadSessionAPI.setOperationLock === 'function') {
      window.GamepadSessionAPI.setOperationLock(true, 'Stick Center Sampling');
    }
    renderModalDynamicState(gp);
  }

  function cancelOrCloseModal() {
    uiState.phase = 'IDLE';
    uiState.errorReason = null;
    uiState.samples = [];
    uiState.isOpen = false;
    if (typeof window !== 'undefined' && window.GamepadSessionAPI && typeof window.GamepadSessionAPI.setOperationLock === 'function') {
      window.GamepadSessionAPI.setOperationLock(false, null);
    }
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
    renderSoftwarePreviewBanner();

    if (!uiState.isOpen) return;

    if (!isCompatibleStickGamepad(gp) || (uiState.activeDeviceKey && buildDeviceKey(gp) !== uiState.activeDeviceKey)) {
      if (uiState.phase === 'SAMPLING') {
        uiState.phase = 'ERROR';
        uiState.errorReason = 'DISCONNECTED';
        uiState.samples = [];
        if (typeof window !== 'undefined' && window.GamepadSessionAPI && typeof window.GamepadSessionAPI.setOperationLock === 'function') {
          window.GamepadSessionAPI.setOperationLock(false, null);
        }
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
          if (typeof window !== 'undefined' && window.GamepadSessionAPI && typeof window.GamepadSessionAPI.setOperationLock === 'function') {
            window.GamepadSessionAPI.setOperationLock(false, null);
          }
          renderModalDynamicState(gp);
          return;
        }
      }

      if (uiState.samples.length >= CALIBRATION_CONFIG.TARGET_SAMPLES) {
        const res = computeCenterStatistics(uiState.samples);
        if (typeof window !== 'undefined' && window.GamepadSessionAPI && typeof window.GamepadSessionAPI.setOperationLock === 'function') {
          window.GamepadSessionAPI.setOperationLock(false, null);
        }
        if (res.ok) {
          const saved = CalibrationProfileStore.saveProfileForGamepad(gp, res);
          if (saved) {
            uiState.phase = 'COMPLETE';
            uiState.lastResult = res;
            uiState.activeProfile = saved;
            uiState.profileExplicitlyApplied = true;
          } else {
            uiState.phase = 'ERROR';
            uiState.errorReason = 'STORAGE_WRITE_FAILED';
          }
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
    const swPreviewBtn = document.getElementById('stick-sw-preview-toggle-btn');
    const modal = document.getElementById('stick-calibration-modal');
    const closeBtn = document.getElementById('calib-close-btn');
    const cancelBtn = document.getElementById('calib-cancel-btn');
    const retryBtn = document.getElementById('calib-retry-btn');
    const finishBtn = document.getElementById('calib-finish-btn');
    const clearProfileBtn = document.getElementById('calib-clear-profile-btn');

    if (triggerBtn && !triggerBtn.dataset.boundCalib) {
      triggerBtn.dataset.boundCalib = 'true';
      triggerBtn.addEventListener('click', () => {
        openCalibrationModal();
      });
    }
    if (swPreviewBtn && !swPreviewBtn.dataset.boundCalib) {
      swPreviewBtn.dataset.boundCalib = 'true';
      swPreviewBtn.addEventListener('click', () => {
        const gp = getActiveBrowserGamepad();
        if (!uiState.activeProfile && gp) {
          uiState.activeProfile = CalibrationProfileStore.getProfileForGamepad(gp);
        }
        if (uiState.activeProfile) {
          setSoftwarePreviewEnabled(!uiState.softwarePreviewEnabled);
        }
      });
    }
    if (closeBtn && !closeBtn.dataset.boundCalib) {
      closeBtn.dataset.boundCalib = 'true';
      closeBtn.addEventListener('click', cancelOrCloseModal);
    }
    if (cancelBtn && !cancelBtn.dataset.boundCalib) {
      cancelBtn.dataset.boundCalib = 'true';
      cancelBtn.addEventListener('click', cancelOrCloseModal);
    }
    if (finishBtn && !finishBtn.dataset.boundCalib) {
      finishBtn.dataset.boundCalib = 'true';
      finishBtn.addEventListener('click', cancelOrCloseModal);
    }
    if (retryBtn && !retryBtn.dataset.boundCalib) {
      retryBtn.dataset.boundCalib = 'true';
      retryBtn.addEventListener('click', () => {
        startSampling();
      });
    }
    if (clearProfileBtn && !clearProfileBtn.dataset.boundCalib) {
      clearProfileBtn.dataset.boundCalib = 'true';
      clearProfileBtn.addEventListener('click', () => {
        const gp = getActiveBrowserGamepad();
        if (gp) {
          CalibrationProfileStore.removeProfileForGamepad(gp);
          uiState.activeProfile = null;
          uiState.lastResult = null;
          uiState.profileExplicitlyApplied = false;
          uiState.softwarePreviewEnabled = false;
          uiState.phase = 'IDLE';
          renderSoftwarePreviewBanner();
          renderModalDynamicState(gp);
        }
      });
    }
    if (modal && !modal.dataset.boundCalib) {
      modal.dataset.boundCalib = 'true';
      modal.addEventListener('click', (e) => {
        if (e.target === modal) cancelOrCloseModal();
      });
    }

    updateTriggerButtonState(getActiveBrowserGamepad());
    renderSoftwarePreviewBanner();
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
    resolveIdentityContext,
    inspectControllerCapabilities,
    computeMedian,
    computeMean,
    computeCenterStatistics,
    applyCalibrationOffset,
    isValidProfileRecord,
    CalibrationProfileStore,
    isSamplingActive,
    isSoftwarePreviewEnabled,
    setSoftwarePreviewEnabled,
    getSoftwareCorrectedAxes,
    onControllerChanged,
    onFrameTick,
    updateTriggerButtonState,
    openCalibrationModal,
    cancelOrCloseModal,
    startSampling,
    renderModalStaticText,
    getUiState: () => uiState,
  };
});
