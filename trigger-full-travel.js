/* ============================================================
   STEP 1: ANALOG TRIGGER FULL-TRAVEL VALIDATION MODULE
   File: trigger-full-travel.js
   - Independent validation module for L2/LT and R2/RT full travel
   - Verifies full travel strictly at >= 0.99
   - Distinguishes PENDING, LIMITED_TRAVEL (incomplete), PASSED, and REST_WARN
   - Never declares a trigger defective from a single sample
   - Handles cross-browser/OS trigger mappings (GamepadButton.value + axis fallbacks)
   ============================================================ */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.TriggerFullTravelValidator = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const FULL_TRAVEL_THRESHOLD = 0.99;
  const ACTUATION_MIN_THRESHOLD = 0.05;
  const REST_FAULT_THRESHOLD = 0.08;
  const MIN_SUSTAINED_REST_FAULT_SAMPLES = 35;

  const I18N = {
    es: {
      moduleTitle: 'Validación de Recorrido Completo (Umbral ≥ 0.99)',
      pending: 'PENDIENTE',
      passed: 'VERIFICADO (≥ 0.99)',
      limited: 'RECORRIDO INCOMPLETO',
      restWarn: 'DERIVA EN REPOSO',
      notVerifiedMsg: 'Recorrido completo no verificado (máx: {max} < 0.99)',
      verifiedMsg: 'Recorrido completo 100% verificado (máx: {max})',
      waitingMsg: 'Presiona el gatillo a fondo para verificar ≥ 0.99',
      restWarnMsg: 'Lectura sostenida en reposo elevada ({rest}). Suelta el gatillo.',
      analogDetected: 'Analógico (Progresivo)',
      digitalOrUnverified: 'Sin escalones intermedios aún',
    },
    en: {
      moduleTitle: 'Full-Travel Validation (Threshold ≥ 0.99)',
      pending: 'PENDING',
      passed: 'VERIFIED (≥ 0.99)',
      limited: 'LIMITED TRAVEL',
      restWarn: 'REST OFFSET WARNING',
      notVerifiedMsg: 'Full travel not verified (max: {max} < 0.99)',
      verifiedMsg: 'Full travel verified (max: {max} ≥ 0.99)',
      waitingMsg: 'Pull trigger fully to verify ≥ 0.99 travel',
      restWarnMsg: 'Sustained elevated resting reading ({rest}). Release trigger.',
      analogDetected: 'Analog (Progressive)',
      digitalOrUnverified: 'No fractional steps observed yet',
    }
  };

  function tr(key, vars) {
    const lang = (typeof currentLang === 'string' && I18N[currentLang]) ? currentLang : 'en';
    const dict = I18N[lang] || I18N.en;
    let s = dict[key] || I18N.en[key] || key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        s = s.replace(`{${k}}`, String(v));
      }
    }
    return s;
  }

  function createSingleTriggerState() {
    return {
      currentValue: 0,
      maxReached: 0,
      minObserved: null,
      sampleCount: 0,
      fractionalSamples: 0,
      elevatedRestStreak: 0,
      hasTouchedRest: false,
      hasActuated: false,
      fullTravelVerified: false,
      sourceType: 'button', // 'button' | 'axis-fallback'
      status: 'PENDING',    // 'PENDING' | 'LIMITED_TRAVEL' | 'PASSED' | 'REST_WARN'
    };
  }

  let state = {
    l2: createSingleTriggerState(),
    r2: createSingleTriggerState(),
  };

  /**
   * Extracts normalized [0.0 .. 1.0] trigger readings across browsers, controllers, and OS drivers.
   * Priority 1: Standard GamepadButton.value on buttons[6] (L2/LT) and buttons[7] (R2/RT).
   * Priority 2: Fallback for DirectInput / Linux / macOS non-standard mappings where triggers
   *             report on axes[4]/axes[5] or axes[2]/axes[5] in [-1.0 .. +1.0] while buttons[6]/[7] stay 0.
   */
  function readTriggerValues(gp) {
    if (!gp) {
      return {
        l2: { value: 0, source: 'none' },
        r2: { value: 0, source: 'none' }
      };
    }

    let l2Val = 0;
    let r2Val = 0;
    let l2Source = 'button';
    let r2Source = 'button';

    if (gp.buttons && gp.buttons.length >= 8) {
      const b6 = gp.buttons[6];
      const b7 = gp.buttons[7];
      l2Val = typeof b6 === 'object' && b6 !== null
        ? (typeof b6.value === 'number' && Number.isFinite(b6.value) ? b6.value : (b6.pressed ? 1 : 0))
        : (typeof b6 === 'number' ? b6 : 0);
      r2Val = typeof b7 === 'object' && b7 !== null
        ? (typeof b7.value === 'number' && Number.isFinite(b7.value) ? b7.value : (b7.pressed ? 1 : 0))
        : (typeof b7 === 'number' ? b7 : 0);
    }

    // Fallback check for non-standard mappings where triggers are mapped to axes[4]/axes[5] in [-1, 1]
    if (gp.mapping !== 'standard' && Array.isArray(gp.axes) && gp.axes.length >= 6) {
      const ax4 = gp.axes[4];
      const ax5 = gp.axes[5];
      if (l2Val === 0 && typeof ax4 === 'number' && Number.isFinite(ax4) && ax4 > -0.98 && ax4 <= 1.0) {
        const normL = (ax4 + 1) / 2;
        if (normL > 0.05) {
          l2Val = normL;
          l2Source = 'axis-fallback';
        }
      }
      if (r2Val === 0 && typeof ax5 === 'number' && Number.isFinite(ax5) && ax5 > -0.98 && ax5 <= 1.0) {
        const normR = (ax5 + 1) / 2;
        if (normR > 0.05) {
          r2Val = normR;
          r2Source = 'axis-fallback';
        }
      }
    }

    const clamp01 = (v) => Math.max(0, Math.min(1, Number.isFinite(v) ? v : 0));
    return {
      l2: { value: clamp01(l2Val), source: l2Source },
      r2: { value: clamp01(r2Val), source: r2Source },
    };
  }

  function updateSingleTrigger(trigState, rawValue, source) {
    const val = Math.max(0, Math.min(1, Number.isFinite(rawValue) ? rawValue : 0));
    trigState.currentValue = val;
    trigState.sourceType = source || 'button';
    trigState.sampleCount++;

    if (trigState.minObserved === null || val < trigState.minObserved) {
      trigState.minObserved = val;
    }
    if (val > trigState.maxReached) {
      trigState.maxReached = val;
    }

    if (val <= 0.04) {
      trigState.hasTouchedRest = true;
      trigState.elevatedRestStreak = 0;
    } else if (!trigState.hasTouchedRest && val > REST_FAULT_THRESHOLD && val < 0.45) {
      trigState.elevatedRestStreak++;
    } else {
      trigState.elevatedRestStreak = 0;
    }

    if (val > 0.02 && val < 0.98) {
      trigState.fractionalSamples++;
    }

    if (val >= ACTUATION_MIN_THRESHOLD) {
      trigState.hasActuated = true;
    }

    if (trigState.maxReached >= FULL_TRAVEL_THRESHOLD) {
      trigState.fullTravelVerified = true;
    }

    // Determine multi-sample status (never fail on a single sample)
    if (trigState.fullTravelVerified && (trigState.hasTouchedRest || (trigState.minObserved !== null && trigState.minObserved <= REST_FAULT_THRESHOLD))) {
      trigState.status = 'PASSED';
    } else if (!trigState.hasTouchedRest && trigState.elevatedRestStreak >= MIN_SUSTAINED_REST_FAULT_SAMPLES) {
      trigState.status = 'REST_WARN';
    } else if (trigState.hasActuated && trigState.maxReached < FULL_TRAVEL_THRESHOLD) {
      trigState.status = 'LIMITED_TRAVEL';
    } else {
      trigState.status = 'PENDING';
    }

    return trigState;
  }

  function onFrameTick(gp) {
    if (!gp || !gp.connected) {
      renderUI();
      return getSnapshot();
    }
    const readings = readTriggerValues(gp);
    updateSingleTrigger(state.l2, readings.l2.value, readings.l2.source);
    updateSingleTrigger(state.r2, readings.r2.value, readings.r2.source);
    renderUI();
    return getSnapshot();
  }

  function reset() {
    state.l2 = createSingleTriggerState();
    state.r2 = createSingleTriggerState();
    renderUI();
  }

  function getSnapshot() {
    return {
      threshold: FULL_TRAVEL_THRESHOLD,
      l2: Object.assign({}, state.l2),
      r2: Object.assign({}, state.r2),
      bothPassed: state.l2.status === 'PASSED' && state.r2.status === 'PASSED',
    };
  }

  function formatStatusBadge(tState) {
    if (tState.status === 'PASSED') {
      return { text: tr('passed'), cls: 'badge-pass', detail: tr('verifiedMsg', { max: tState.maxReached.toFixed(3) }) };
    }
    if (tState.status === 'LIMITED_TRAVEL') {
      return { text: tr('limited'), cls: 'badge-review', detail: tr('notVerifiedMsg', { max: tState.maxReached.toFixed(3) }) };
    }
    if (tState.status === 'REST_WARN') {
      return {
        text: tr('restWarn'),
        cls: 'badge-fail',
        detail: tr('restWarnMsg', { rest: (tState.minObserved !== null ? tState.minObserved : tState.currentValue).toFixed(3) })
      };
    }
    return { text: tr('pending'), cls: 'badge-neutral', detail: tr('waitingMsg') };
  }

  function renderUI() {
    if (typeof document === 'undefined') return;
    const renderKey = (key, tState) => {
      const badgeEl = document.getElementById(`full-travel-${key}-badge`);
      const detailEl = document.getElementById(`full-travel-${key}-detail`);
      const maxEl = document.getElementById(`full-travel-${key}-max`);
      const modeEl = document.getElementById(`full-travel-${key}-mode`);
      const info = formatStatusBadge(tState);

      if (badgeEl) {
        badgeEl.className = `trigger-badge ${info.cls}`;
        badgeEl.textContent = info.text;
      }
      if (detailEl) {
        detailEl.textContent = info.detail;
      }
      if (maxEl) {
        maxEl.textContent = tState.maxReached.toFixed(3);
      }
      if (modeEl) {
        modeEl.textContent = tState.fractionalSamples >= 2 ? tr('analogDetected') : tr('digitalOrUnverified');
      }
    };

    const titleEl = document.getElementById('full-travel-module-title');
    if (titleEl) titleEl.textContent = tr('moduleTitle');

    renderKey('l2', state.l2);
    renderKey('r2', state.r2);
  }

  return {
    FULL_TRAVEL_THRESHOLD,
    ACTUATION_MIN_THRESHOLD,
    REST_FAULT_THRESHOLD,
    MIN_SUSTAINED_REST_FAULT_SAMPLES,
    readTriggerValues,
    updateSingleTrigger,
    onFrameTick,
    reset,
    getSnapshot,
    renderUI,
  };
});
