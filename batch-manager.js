/* ============================================================
   STEP 5: LOCAL BATCH TESTING & PRODUCTIVITY BAR MODULE
   File: batch-manager.js
   - 7.1 Quick Identification ("Controller SKU / ID" + barcode scanner support)
   - 7.2 Global Three-State Indicator ("TEST INCOMPLETE" | "PASS" | "FAIL")
     * Strict mandatory PASS criteria:
       1. Every required button completed 3-press test (0 stuck)
       2. Every detected analog trigger reached >= 0.99
       3. Both sticks pass resting-center check with median radial deviation < 0.06
          over >= 25 actual resting samples (never uses default unmeasured values)
   - 7.3 Single-shot AudioContext beep when transitioning to "PASS"
   - 7.4 "Save to Batch" with duplicate-click guard & unmeasured field honesty
   - 7.5 Batch History Table + Excel-compatible UTF-8 BOM CSV export + Clear Batch
   ============================================================ */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.BatchManager = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const BATCH_STORAGE_KEY = 'gamepad_tester_batch_records_v1';
  const CENTER_DEVIATION_LIMIT = 0.06;
  const TRIGGER_FULL_TRAVEL_MIN = 0.99;
  const MIN_REST_SAMPLES_REQUIRED = 25;

  function createSessionTracker() {
    return {
      leftRestRadii: [],
      rightRestRadii: [],
      leftCenterDeviation: null,
      rightCenterDeviation: null,
      leftCenterSampled: false,
      rightCenterSampled: false,
      currentGlobalStatus: 'TEST INCOMPLETE', // 'TEST INCOMPLETE' | 'PASS' | 'FAIL'
      reasons: ['Waiting for controller measurements'],
      passBeepPlayed: false,
      lastSavedFingerprint: null,
      lastSaveTimeMs: 0,
    };
  }

  let session = createSessionTracker();

  function computeMedian(values) {
    if (!Array.isArray(values) || values.length === 0) return null;
    const sorted = values.slice().sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  }

  /**
   * Documented Resting-Center Deviation Calculation:
   *   d_center = median( Math.hypot(x_i, y_i) ) over >= 25 resting samples
   *   where the stick is untouched (instantaneous deflection <= 0.22).
   *   Never uses default 0.0000 values when fewer than 25 real samples have been collected.
   */
  function recordStickRestSample(axes) {
    if (!axes || typeof axes !== 'object') return;
    const lx = axes.lx;
    const ly = axes.ly;
    const rx = axes.rx;
    const ry = axes.ry;

    if (typeof lx === 'number' && typeof ly === 'number' && Number.isFinite(lx) && Number.isFinite(ly)) {
      const rL = Math.hypot(lx, ly);
      // Capture samples when stick is untouched (below active movement deflection threshold 0.22)
      if (rL <= 0.22) {
        session.leftRestRadii.push(rL);
        if (session.leftRestRadii.length > 180) session.leftRestRadii.shift();
        if (session.leftRestRadii.length >= MIN_REST_SAMPLES_REQUIRED) {
          session.leftCenterDeviation = Number(computeMedian(session.leftRestRadii).toFixed(5));
          session.leftCenterSampled = true;
        }
      }
    }

    if (typeof rx === 'number' && typeof ry === 'number' && Number.isFinite(rx) && Number.isFinite(ry)) {
      const rR = Math.hypot(rx, ry);
      if (rR <= 0.22) {
        session.rightRestRadii.push(rR);
        if (session.rightRestRadii.length > 180) session.rightRestRadii.shift();
        if (session.rightRestRadii.length >= MIN_REST_SAMPLES_REQUIRED) {
          session.rightCenterDeviation = Number(computeMedian(session.rightRestRadii).toFixed(5));
          session.rightCenterSampled = true;
        }
      }
    }
  }

  /**
   * Evaluates the strict 3-state Global Status ("TEST INCOMPLETE" | "PASS" | "FAIL").
   * Never returns "PASS" unless all 3 mandatory conditions are verified with real measurements.
   */
  function evaluateGlobalStatus(inputs) {
    const inp = inputs || {};
    const failReasons = [];
    const incompleteReasons = [];

    // Condition 1: Every required button has completed its 3-press test (and 0 stuck)
    const buttonStates = inp.buttonStates || {};
    const btnKeys = Object.keys(buttonStates);
    const totalBtns = typeof inp.totalButtons === 'number' ? inp.totalButtons : btnKeys.length;

    let passedBtns = 0;
    let stuckBtns = 0;
    for (let i = 0; i < btnKeys.length; i++) {
      const b = buttonStates[btnKeys[i]];
      if (b) {
        if (b.clicks >= 3) passedBtns++;
        if (b.isStuck) stuckBtns++;
      }
    }

    const buttonsComplete = totalBtns > 0 && passedBtns >= totalBtns && stuckBtns === 0;
    if (stuckBtns > 0) {
      failReasons.push(`Stuck button detected (${stuckBtns})`);
    } else if (totalBtns === 0 || passedBtns < totalBtns) {
      incompleteReasons.push(`Buttons: ${passedBtns}/${totalBtns || 16} verified (3 presses required)`);
    }

    // Condition 2: Every detected analog trigger has reached >= 0.99
    const trigL2Max = inp.triggerL2Max !== undefined && inp.triggerL2Max !== null ? inp.triggerL2Max : 0;
    const trigR2Max = inp.triggerR2Max !== undefined && inp.triggerR2Max !== null ? inp.triggerR2Max : 0;
    const trigL2Status = inp.triggerL2Status || 'PENDING';
    const trigR2Status = inp.triggerR2Status || 'PENDING';

    if (trigL2Status === 'REST_WARN' || trigL2Status === 'FAIL') {
      failReasons.push('L2/LT resting offset fault');
    } else if (trigL2Max < TRIGGER_FULL_TRAVEL_MIN) {
      incompleteReasons.push(`L2/LT max ${trigL2Max.toFixed(2)} (< 0.99 required)`);
    }

    if (trigR2Status === 'REST_WARN' || trigR2Status === 'FAIL') {
      failReasons.push('R2/RT resting offset fault');
    } else if (trigR2Max < TRIGGER_FULL_TRAVEL_MIN) {
      incompleteReasons.push(`R2/RT max ${trigR2Max.toFixed(2)} (< 0.99 required)`);
    }

    const triggersComplete =
      trigL2Max >= TRIGGER_FULL_TRAVEL_MIN &&
      trigR2Max >= TRIGGER_FULL_TRAVEL_MIN &&
      trigL2Status !== 'REST_WARN' &&
      trigR2Status !== 'REST_WARN';

    // Condition 3: Both sticks pass resting-center check with deviation < 0.06 (must be actually measured!)
    const lSampled = inp.leftCenterSampled !== undefined ? Boolean(inp.leftCenterSampled) : session.leftCenterSampled;
    const rSampled = inp.rightCenterSampled !== undefined ? Boolean(inp.rightCenterSampled) : session.rightCenterSampled;
    const lDev = inp.leftCenterDeviation !== undefined ? inp.leftCenterDeviation : session.leftCenterDeviation;
    const rDev = inp.rightCenterDeviation !== undefined ? inp.rightCenterDeviation : session.rightCenterDeviation;

    if (!lSampled || typeof lDev !== 'number' || !Number.isFinite(lDev)) {
      incompleteReasons.push('Left Stick resting center not yet measured');
    } else if (lDev >= CENTER_DEVIATION_LIMIT) {
      failReasons.push(`Left Stick center deviation ${lDev.toFixed(4)} (>= 0.06 limit)`);
    }

    if (!rSampled || typeof rDev !== 'number' || !Number.isFinite(rDev)) {
      incompleteReasons.push('Right Stick resting center not yet measured');
    } else if (rDev >= CENTER_DEVIATION_LIMIT) {
      failReasons.push(`Right Stick center deviation ${rDev.toFixed(4)} (>= 0.06 limit)`);
    }

    const centerComplete =
      lSampled && rSampled &&
      typeof lDev === 'number' && lDev < CENTER_DEVIATION_LIMIT &&
      typeof rDev === 'number' && rDev < CENTER_DEVIATION_LIMIT;

    let status = 'TEST INCOMPLETE';
    let reasons = [];

    if (failReasons.length > 0) {
      status = 'FAIL';
      reasons = failReasons.concat(incompleteReasons);
    } else if (buttonsComplete && triggersComplete && centerComplete) {
      status = 'PASS';
      reasons = ['All mandatory checks verified (Buttons 3/3, Triggers >= 0.99, Center < 0.06)'];
    } else {
      status = 'TEST INCOMPLETE';
      reasons = incompleteReasons;
    }

    return {
      status,
      reasons,
      failReasons,
      incompleteReasons,
      details: {
        buttonsComplete,
        passedBtns,
        totalBtns,
        stuckBtns,
        triggersComplete,
        trigL2Max,
        trigR2Max,
        centerComplete,
        leftCenterSampled: lSampled,
        rightCenterSampled: rSampled,
        leftCenterDeviation: lSafeNum(lDev),
        rightCenterDeviation: lSafeNum(rDev),
      }
    };
  }

  function lSafeNum(v) {
    return (typeof v === 'number' && Number.isFinite(v)) ? v : null;
  }

  /**
   * Plays a short confirmation beep via Web Audio API when global status transitions to PASS
   * for the first time in the current controller session.
   */
  function playPassBeepOnce() {
    if (session.passBeepPlayed) return false;
    session.passBeepPlayed = true;

    try {
      const W = typeof window !== 'undefined' ? window : null;
      if (!W) return false;
      const AudioCtx = W.AudioContext || W.webkitAudioContext;
      if (!AudioCtx) return false;

      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 crisp confirmation tone
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.17);
      setTimeout(() => {
        try { ctx.close(); } catch (_) {}
      }, 250);
      return true;
    } catch (_) {
      // Browser audio policy blocked or unavailable — preserve visual result without error
      return false;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // LOCALSTORAGE BATCH PERSISTENCE & CORRUPTION RECOVERY
  // ─────────────────────────────────────────────────────────────
  function getBatchRecords(customStorage) {
    const store = customStorage || (typeof localStorage !== 'undefined' ? localStorage : null);
    if (!store) return [];
    try {
      const raw = store.getItem(BATCH_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(r => r && typeof r === 'object' && typeof r.isoDate === 'string');
    } catch (_) {
      // Gracefully recover from corrupted JSON in localStorage
      return [];
    }
  }

  function writeBatchRecords(records, customStorage) {
    const store = customStorage || (typeof localStorage !== 'undefined' ? localStorage : null);
    if (!store || !Array.isArray(records)) return { ok: false, error: 'STORAGE_UNAVAILABLE' };
    try {
      store.setItem(BATCH_STORAGE_KEY, JSON.stringify(records));
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        error: err && err.name === 'QuotaExceededError' ? 'QUOTA_EXCEEDED' : 'WRITE_ERROR',
        message: err && err.message ? err.message : 'Storage write failed',
      };
    }
  }

  function extractVidPidFromGamepadId(idStr, webhidInfo) {
    if (webhidInfo && webhidInfo.vidHex && webhidInfo.vidHex !== '—') {
      return `${webhidInfo.vidHex}:${webhidInfo.pidHex || '—'}`;
    }
    if (typeof idStr !== 'string' || !idStr) return null;
    const match1 = idStr.match(/vendor:\s*([0-9a-f]{4}).*product:\s*([0-9a-f]{4})/i);
    if (match1) return `0x${match1[1].toUpperCase()}:0x${match1[2].toUpperCase()}`;
    const match2 = idStr.match(/\b([0-9a-f]{4}):([0-9a-f]{4})\b/i);
    if (match2) return `0x${match2[1].toUpperCase()}:0x${match2[2].toUpperCase()}`;
    return null;
  }

  function buildBatchRecord(context) {
    const ctx = context || {};
    const evalRes = evaluateGlobalStatus(ctx);
    const d = evalRes.details;

    const skuRaw = ctx.skuId !== undefined ? String(ctx.skuId).trim() : '';
    const notesRaw = ctx.notes !== undefined ? String(ctx.notes).trim() : '';

    const leftCirc = (typeof ctx.leftCircularityError === 'number' && Number.isFinite(ctx.leftCircularityError))
      ? Number(ctx.leftCircularityError.toFixed(2))
      : null;
    const rightCirc = (typeof ctx.rightCircularityError === 'number' && Number.isFinite(ctx.rightCircularityError))
      ? Number(ctx.rightCircularityError.toFixed(2))
      : null;
    const obsHz = (typeof ctx.observedUpdateHz === 'number' && Number.isFinite(ctx.observedUpdateHz))
      ? Number(ctx.observedUpdateHz.toFixed(1))
      : null;

    const centerStatusStr = (d.leftCenterSampled && d.rightCenterSampled)
      ? `L: ${d.leftCenterDeviation.toFixed(4)} (${d.leftCenterDeviation < CENTER_DEVIATION_LIMIT ? 'PASS' : 'FAIL'}), R: ${d.rightCenterDeviation.toFixed(4)} (${d.rightCenterDeviation < CENTER_DEVIATION_LIMIT ? 'PASS' : 'FAIL'})`
      : 'Not measured';

    const triggerStatusStr = (ctx.triggerSamples && ctx.triggerSamples > 0)
      ? `L2 Max: ${d.trigL2Max.toFixed(3)} (${d.trigL2Max >= TRIGGER_FULL_TRAVEL_MIN ? 'VERIFIED' : 'INCOMPLETE'}), R2 Max: ${d.trigR2Max.toFixed(3)} (${d.trigR2Max >= TRIGGER_FULL_TRAVEL_MIN ? 'VERIFIED' : 'INCOMPLETE'})`
      : 'Not measured';

    const buttonStatusStr = d.totalBtns > 0
      ? `${d.passedBtns}/${d.totalBtns} (${d.stuckBtns > 0 ? 'STUCK FAIL' : (d.buttonsComplete ? 'PASS' : 'INCOMPLETE')})`
      : 'Not measured';

    return {
      id: 'BATCH-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      isoDate: new Date().toISOString(),
      skuId: skuRaw || 'UNASSIGNED',
      deviceName: ctx.deviceName || null,
      vidPid: ctx.vidPid || extractVidPidFromGamepadId(ctx.deviceName, ctx.webhidInfo) || null,
      overallResult: evalRes.status,
      buttonStatus: buttonStatusStr,
      triggerResults: triggerStatusStr,
      leftCircularityError: leftCirc,
      rightCircularityError: rightCirc,
      centerStatus: centerStatusStr,
      jitterStatus: ctx.jitterStatus || null,
      observedUpdateHz: obsHz,
      notes: notesRaw || '',
      failureReasons: evalRes.reasons.join('; '),
    };
  }

  function saveToBatch(context, customStorage) {
    const now = Date.now();
    const rec = buildBatchRecord(context);

    // Prevent accidental duplicate saves from rapid double-clicks within 2.5s for identical state
    const fingerprint = `${rec.skuId}|${rec.deviceName}|${rec.overallResult}|${rec.buttonStatus}|${rec.triggerResults}|${rec.notes}`;
    if (session.lastSavedFingerprint === fingerprint && (now - session.lastSaveTimeMs < 2500)) {
      return { ok: false, reason: 'DUPLICATE_CLICK_PREVENTED', record: rec };
    }

    const list = getBatchRecords(customStorage);
    list.unshift(rec);
    const writeRes = writeBatchRecords(list, customStorage);
    if (!writeRes.ok) {
      return { ok: false, reason: writeRes.error, record: rec };
    }

    session.lastSavedFingerprint = fingerprint;
    session.lastSaveTimeMs = now;
    renderBatchTable();
    showSaveToast(`✓ Saved "${rec.skuId}" to batch (${rec.overallResult})`);
    return { ok: true, record: rec, totalRecords: list.length };
  }

  // ─────────────────────────────────────────────────────────────
  // RFC-4180 EXCEL-COMPATIBLE UTF-8 BOM CSV GENERATOR
  // ─────────────────────────────────────────────────────────────
  function escapeCsvCell(val) {
    if (val === null || val === undefined || val === '') {
      return '"Not measured"';
    }
    const str = String(val);
    const escaped = str.replace(/"/g, '""');
    return `"${escaped}"`;
  }

  function generateBatchCsv(recordsInput) {
    const records = Array.isArray(recordsInput) ? recordsInput : getBatchRecords();
    const headers = [
      'ISO Date & Time',
      'Controller SKU / ID',
      'Device Name',
      'VID / PID',
      'Overall Result',
      'Button Test Status',
      'Trigger Results (>=0.99)',
      'Left Stick Circularity Avg Error (%)',
      'Right Stick Circularity Avg Error (%)',
      'Center Deviation Status (<0.06)',
      'Jitter & Signal Stability',
      'Observed Update Frequency (Hz)',
      'Quick Notes',
      'Failure / Incomplete Reasons',
    ];

    const rows = [headers.map(h => `"${h.replace(/"/g, '""')}"`).join(',')];

    for (let i = 0; i < records.length; i++) {
      const r = records[i] || {};
      const row = [
        escapeCsvCell(r.isoDate),
        escapeCsvCell(r.skuId || 'UNASSIGNED'),
        escapeCsvCell(r.deviceName !== null && r.deviceName !== undefined ? r.deviceName : 'Not measured'),
        escapeCsvCell(r.vidPid !== null && r.vidPid !== undefined ? r.vidPid : 'Not measured'),
        escapeCsvCell(r.overallResult || 'TEST INCOMPLETE'),
        escapeCsvCell(r.buttonStatus || 'Not measured'),
        escapeCsvCell(r.triggerResults || 'Not measured'),
        escapeCsvCell(typeof r.leftCircularityError === 'number' ? `${r.leftCircularityError.toFixed(2)}%` : 'Not measured'),
        escapeCsvCell(typeof r.rightCircularityError === 'number' ? `${r.rightCircularityError.toFixed(2)}%` : 'Not measured'),
        escapeCsvCell(r.centerStatus || 'Not measured'),
        escapeCsvCell(r.jitterStatus || 'Not measured'),
        escapeCsvCell(typeof r.observedUpdateHz === 'number' ? `${r.observedUpdateHz.toFixed(1)} Hz` : 'Not measured'),
        escapeCsvCell(r.notes !== undefined && r.notes !== '' ? r.notes : '—'),
        escapeCsvCell(r.failureReasons || '—'),
      ];
      rows.push(row.join(','));
    }

    // Prepend UTF-8 BOM (\uFEFF) so Microsoft Excel opens Spanish accents/ñ properly
    return '\uFEFF' + rows.join('\r\n');
  }

  function exportBatchCsvInBrowser() {
    const records = getBatchRecords();
    const csvContent = generateBatchCsv(records);
    if (typeof Blob === 'undefined' || typeof URL === 'undefined' || typeof document === 'undefined') {
      return csvContent;
    }
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gamepad_batch_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return csvContent;
  }

  function clearBatchWithConfirmation(confirmFn, customStorage) {
    const ask = typeof confirmFn === 'function'
      ? confirmFn
      : (typeof window !== 'undefined' && typeof window.confirm === 'function'
          ? (msg) => window.confirm(msg)
          : () => false);

    if (!ask('Are you sure you want to permanently clear all saved batch records? / ¿Seguro que deseas vaciar todo el lote guardado?')) {
      return { cleared: false };
    }

    const store = customStorage || (typeof localStorage !== 'undefined' ? localStorage : null);
    if (store) {
      try {
        store.removeItem(BATCH_STORAGE_KEY);
      } catch (_) {}
    }
    session.lastSavedFingerprint = null;
    renderBatchTable();
    return { cleared: true };
  }

  function gatherLiveContext(gp) {
    const appState = (typeof state === 'object' && state !== null) ? state : {};
    const trigSnap = (typeof TriggerFullTravelValidator === 'object' && TriggerFullTravelValidator !== null)
      ? TriggerFullTravelValidator.getSnapshot()
      : null;
    const advSnap = (typeof AdvancedStickDiagnostics === 'object' && AdvancedStickDiagnostics !== null)
      ? AdvancedStickDiagnostics.getSnapshot()
      : null;
    const hidState = (typeof WebHIDCalibrationModule === 'object' && WebHIDCalibrationModule !== null)
      ? WebHIDCalibrationModule.getState()
      : null;

    const skuEl = typeof document !== 'undefined' ? document.getElementById('batch-sku-input') : null;
    const itemEl = typeof document !== 'undefined' ? document.getElementById('item-code-input') : null;
    const notesEl = typeof document !== 'undefined' ? document.getElementById('batch-notes-input') : null;

    const skuVal = (skuEl && skuEl.value ? skuEl.value.trim() : '') || (itemEl && itemEl.value ? itemEl.value.trim() : '18427');
    const notesVal = notesEl && notesEl.value ? notesEl.value.trim() : '';

    const l2Max = trigSnap ? trigSnap.l2.maxReached : (appState.triggers && appState.triggers.l2 ? appState.triggers.l2.max : 0);
    const r2Max = trigSnap ? trigSnap.r2.maxReached : (appState.triggers && appState.triggers.r2 ? appState.triggers.r2.max : 0);
    const trigSamples = trigSnap ? (trigSnap.l2.sampleCount + trigSnap.r2.sampleCount) : 0;

    return {
      skuId: skuVal,
      notes: notesVal,
      deviceName: gp && gp.id ? gp.id : null,
      webhidInfo: hidState ? hidState.deviceInfo : null,
      buttonStates: appState.buttonStates || {},
      totalButtons: Object.keys(appState.buttonStates || {}).length || (gp && gp.buttons ? gp.buttons.length : 16),
      triggerL2Max: l2Max,
      triggerR2Max: r2Max,
      triggerL2Status: trigSnap ? trigSnap.l2.status : 'PENDING',
      triggerR2Status: trigSnap ? trigSnap.r2.status : 'PENDING',
      triggerSamples: trigSamples,
      leftCenterSampled: session.leftCenterSampled,
      rightCenterSampled: session.rightCenterSampled,
      leftCenterDeviation: session.leftCenterDeviation,
      rightCenterDeviation: session.rightCenterDeviation,
      leftCircularityError: advSnap && advSnap.left.status === 'COMPLETED' ? advSnap.left.avgErrorPct : null,
      rightCircularityError: advSnap && advSnap.right.status === 'COMPLETED' ? advSnap.right.avgErrorPct : null,
      jitterStatus: advSnap ? advSnap.polling.signalStabilityStatus : null,
      observedUpdateHz: advSnap ? advSnap.polling.observedHz : null,
    };
  }

  function showSaveToast(msg) {
    if (typeof document === 'undefined') return;
    const el = document.getElementById('batch-save-feedback');
    if (el) {
      el.textContent = msg;
      el.style.opacity = '1';
      setTimeout(() => {
        if (el) el.style.opacity = '0.75';
      }, 3000);
    }
  }

  function renderBatchTable() {
    if (typeof document === 'undefined') return;
    const tbody = document.getElementById('batch-history-table-body');
    const countBadge = document.getElementById('batch-count-badge');
    const records = getBatchRecords();

    if (countBadge) {
      countBadge.textContent = `${records.length} saved`;
    }
    if (!tbody) return;

    if (records.length === 0) {
      tbody.innerHTML = `<tr><td colspan="10" style="text-align:center;color:var(--text-muted);padding:10px;">No controllers saved in current batch yet.</td></tr>`;
      return;
    }

    tbody.innerHTML = records.map(r => {
      const cls = r.overallResult === 'PASS' ? 'badge-pass' : (r.overallResult === 'FAIL' ? 'badge-fail' : 'badge-neutral');
      const lCircTxt = typeof r.leftCircularityError === 'number' ? `${r.leftCircularityError.toFixed(2)}%` : 'Not measured';
      const rCircTxt = typeof r.rightCircularityError === 'number' ? `${r.rightCircularityError.toFixed(2)}%` : 'Not measured';
      const hzTxt = typeof r.observedUpdateHz === 'number' ? `${r.observedUpdateHz.toFixed(1)} Hz` : 'Not measured';
      return `<tr>
        <td><strong>${escapeHtml(r.skuId)}</strong></td>
        <td>${escapeHtml(r.isoDate.slice(0, 19).replace('T', ' '))}</td>
        <td title="${escapeHtml(r.deviceName || 'Not measured')}" style="max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(r.deviceName || 'Not measured')}</td>
        <td><span class="stick-verdict-badge ${cls}">${escapeHtml(r.overallResult)}</span></td>
        <td>${escapeHtml(r.buttonStatus)}</td>
        <td>${escapeHtml(r.triggerResults)}</td>
        <td>L: ${lCircTxt} | R: ${rCircTxt}</td>
        <td>${escapeHtml(r.centerStatus)}</td>
        <td>${hzTxt}</td>
        <td>${escapeHtml(r.notes || '—')}</td>
      </tr>`;
    }).join('');
  }

  function escapeHtml(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function onFrameTick(gp, axes) {
    if (gp && gp.connected && axes) {
      recordStickRestSample(axes);
    }

    const ctx = gatherLiveContext(gp);
    const evalRes = evaluateGlobalStatus(ctx);
    const prevStatus = session.currentGlobalStatus;
    session.currentGlobalStatus = evalRes.status;
    session.reasons = evalRes.reasons;

    if (evalRes.status === 'PASS' && prevStatus !== 'PASS' && !session.passBeepPlayed) {
      playPassBeepOnce();
    }

    if (typeof document !== 'undefined') {
      const badgeEl = document.getElementById('batch-global-status-badge');
      const reasonEl = document.getElementById('batch-global-status-reasons');
      if (badgeEl) {
        badgeEl.textContent = evalRes.status;
        badgeEl.className = 'batch-global-badge ' + (
          evalRes.status === 'PASS'
            ? 'batch-status-pass'
            : (evalRes.status === 'FAIL' ? 'batch-status-fail' : 'batch-status-incomplete')
        );
      }
      if (reasonEl) {
        reasonEl.textContent = evalRes.reasons.join(' • ');
      }
    }

    return evalRes;
  }

  function onSessionReset(opts) {
    session = createSessionTracker();
    if (typeof document !== 'undefined') {
      if (opts && opts.clearSku) {
        const notesEl = document.getElementById('batch-notes-input');
        if (notesEl) notesEl.value = '';
      }
      const badgeEl = document.getElementById('batch-global-status-badge');
      const reasonEl = document.getElementById('batch-global-status-reasons');
      if (badgeEl) {
        badgeEl.textContent = 'TEST INCOMPLETE';
        badgeEl.className = 'batch-global-badge batch-status-incomplete';
      }
      if (reasonEl) {
        reasonEl.textContent = 'Session reset — Waiting for 3-press buttons, triggers >= 0.99, and stick rest center < 0.06';
      }
    }
  }

  function initDOMListeners() {
    if (typeof document === 'undefined') return;

    const skuInput = document.getElementById('batch-sku-input');
    const itemCodeInput = document.getElementById('item-code-input');

    // Keep SKU / ID and top Item Code synchronized and support barcode scanner Enter key
    if (skuInput && !skuInput.dataset.boundBatch) {
      skuInput.dataset.boundBatch = 'true';
      skuInput.addEventListener('input', () => {
        if (itemCodeInput) itemCodeInput.value = skuInput.value;
      });
      skuInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          skuInput.blur();
        }
      });
    }
    if (itemCodeInput && !itemCodeInput.dataset.boundBatchSync) {
      itemCodeInput.dataset.boundBatchSync = 'true';
      itemCodeInput.addEventListener('input', () => {
        if (skuInput) skuInput.value = itemCodeInput.value;
      });
    }

    const saveBtn = document.getElementById('btn-save-batch');
    if (saveBtn && !saveBtn.dataset.boundBatch) {
      saveBtn.dataset.boundBatch = 'true';
      saveBtn.addEventListener('click', () => {
        const gps = (typeof navigator !== 'undefined' && navigator.getGamepads) ? navigator.getGamepads() : [];
        const gp = (typeof state === 'object' && state !== null && state.activeGpIndex !== null) ? gps[state.activeGpIndex] : null;
        const ctx = gatherLiveContext(gp);
        const res = saveToBatch(ctx);
        if (!res.ok && res.reason === 'DUPLICATE_CLICK_PREVENTED') {
          showSaveToast('ℹ Record already saved for this state.');
        }
      });
    }

    const exportCsvBtn = document.getElementById('btn-export-batch-csv');
    if (exportCsvBtn && !exportCsvBtn.dataset.boundBatch) {
      exportCsvBtn.dataset.boundBatch = 'true';
      exportCsvBtn.addEventListener('click', () => {
        exportBatchCsvInBrowser();
      });
    }

    const clearBatchBtn = document.getElementById('btn-clear-batch');
    if (clearBatchBtn && !clearBatchBtn.dataset.boundBatch) {
      clearBatchBtn.dataset.boundBatch = 'true';
      clearBatchBtn.addEventListener('click', () => {
        clearBatchWithConfirmation();
      });
    }

    const toggleBatchPanelBtn = document.getElementById('btn-toggle-batch-panel');
    if (toggleBatchPanelBtn && !toggleBatchPanelBtn.dataset.boundBatch) {
      toggleBatchPanelBtn.dataset.boundBatch = 'true';
      toggleBatchPanelBtn.addEventListener('click', () => {
        const panel = document.getElementById('batch-history-card');
        if (panel) {
          const isHidden = panel.style.display === 'none';
          panel.style.display = isHidden ? 'flex' : 'none';
          if (isHidden) renderBatchTable();
        }
      });
    }

    renderBatchTable();
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initDOMListeners);
    } else {
      initDOMListeners();
    }
  }

  return {
    BATCH_STORAGE_KEY,
    CENTER_DEVIATION_LIMIT,
    TRIGGER_FULL_TRAVEL_MIN,
    MIN_REST_SAMPLES_REQUIRED,
    computeMedian,
    recordStickRestSample,
    evaluateGlobalStatus,
    playPassBeepOnce,
    getBatchRecords,
    writeBatchRecords,
    buildBatchRecord,
    saveToBatch,
    escapeCsvCell,
    generateBatchCsv,
    exportBatchCsvInBrowser,
    clearBatchWithConfirmation,
    onFrameTick,
    onSessionReset,
    getSessionState: () => Object.assign({}, session),
    initDOMListeners,
    renderBatchTable,
  };
});
