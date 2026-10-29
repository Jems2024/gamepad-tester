/* ============================================================
   STEP 4: WEBHID DEVICE INFORMATION & DUAL CALIBRATION MODULE
   File: webhid-calibration.js
   - Safe WebHID inspection (VID/PID, collections, connection type)
   - Strict non-accusatory authenticity & protocol statuses:
     * "Device identified."
     * "Authenticity not verified."
     * "Protocol not supported."
     * "Report read error."
     * "Possible replica — additional verification required."
   - Never sends undocumented or arbitrary firmware write commands
   - Modal "Calibrate Joysticks (WebHID)" with 2 modes:
     * Mode 1: Quick Center Calibration (Median, IQR/StdDev, Before/After, Software Profile vs Firmware distinction)
     * Mode 2: Guided Endpoint Calibration (7-step assistant: Rest, UL, UR, DR, DL, 360° Sweep, Summary & Confirmation)
   ============================================================ */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.WebHIDCalibrationModule = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const STORAGE_KEY_ENDPOINT = 'gamepad_tester_webhid_profiles_v1';

  const VERIFICATION_STATUSES = {
    IDENTIFIED: 'Device identified.',
    AUTH_UNVERIFIED: 'Authenticity not verified.',
    PROTOCOL_UNSUPPORTED: 'Protocol not supported.',
    REPORT_READ_ERROR: 'Report read error.',
    POSSIBLE_REPLICA: 'Possible replica — additional verification required.',
  };

  // Documented reference VID/PIDs (used for identification only; never assumes all devices with VID 0x054C share the same protocol)
  const KNOWN_VID_PIDS = {
    '054c:05c4': { vendor: 'Sony Corp. (VID 0x054C)', model: 'DualShock 4 (CUH-ZCT1)', family: 'ds4-v1' },
    '054c:09cc': { vendor: 'Sony Corp. (VID 0x054C)', model: 'DualShock 4 (CUH-ZCT2)', family: 'ds4-v2' },
    '054c:0ce6': { vendor: 'Sony Corp. (VID 0x054C)', model: 'DualSense Wireless Controller', family: 'dualsense' },
    '054c:0df2': { vendor: 'Sony Corp. (VID 0x054C)', model: 'DualSense Edge Wireless Controller', family: 'dualsense-edge' },
    '054c:0268': { vendor: 'Sony Corp. (VID 0x054C)', model: 'DualShock 3 / Sixaxis', family: 'ds3' },
    '045e:028e': { vendor: 'Microsoft Corp.', model: 'Xbox 360 Controller', family: 'xbox360' },
    '045e:02dd': { vendor: 'Microsoft Corp.', model: 'Xbox One Controller', family: 'xboxone' },
    '045e:0b12': { vendor: 'Microsoft Corp.', model: 'Xbox Series X|S Controller', family: 'xboxseries' },
  };

  const GUIDED_STEPS = [
    { id: 1, key: 'REST_CENTER', title: '1. Resting Center', instruction: 'Leave both analog sticks completely untouched in their natural resting position.' },
    { id: 2, key: 'UP_LEFT',     title: '2. Up-Left Corner', instruction: 'Hold both sticks firmly into the Up-Left (NW) corner.' },
    { id: 3, key: 'UP_RIGHT',    title: '3. Up-Right Corner', instruction: 'Hold both sticks firmly into the Up-Right (NE) corner.' },
    { id: 4, key: 'DOWN_RIGHT',  title: '4. Down-Right Corner', instruction: 'Hold both sticks firmly into the Down-Right (SE) corner.' },
    { id: 5, key: 'DOWN_LEFT',   title: '5. Down-Left Corner', instruction: 'Hold both sticks firmly into the Down-Left (SW) corner.' },
    { id: 6, key: 'ROTATE_360',  title: '6. Complete 360° Rotation', instruction: 'Rotate both sticks smoothly through a full 360° perimeter sweep.' },
    { id: 7, key: 'SUMMARY',     title: '7. Measurement Summary & Confirmation', instruction: 'Review observed axis limits, angular coverage, and sample quality before saving the software correction profile.' },
  ];

  function createInitialState() {
    return {
      envSupported: false,
      secureContext: true,
      connectedDevice: null,
      deviceInfo: {
        deviceName: '—',
        vidHex: '—',
        pidHex: '—',
        interfaceStatus: 'Not connected via WebHID',
        connectionType: 'Not determined',
        supportedOperations: 'Gamepad API Read + Local Software Profile',
        protocolStatus: VERIFICATION_STATUSES.PROTOCOL_UNSUPPORTED,
        identificationStatus: VERIFICATION_STATUSES.AUTH_UNVERIFIED,
        evidenceNote: 'Connect a controller via WebHID or use Gamepad API telemetry.',
        lastError: null,
      },
      modalOpen: false,
      activeMode: 'MODE_1', // 'MODE_1' (Quick Center) | 'MODE_2' (Guided Endpoint)
      mode1: {
        status: 'IDLE', // 'IDLE' | 'SAMPLING' | 'COMPLETED' | 'ERROR'
        samples: [],
        targetSamples: 60,
        beforeCenters: { lx: 0, ly: 0, rx: 0, ry: 0 },
        measuredCenters: null,
        dispersion: null,
        savedSoftwareProfile: false,
        firmwareWritePerformed: false, // Strictly false unless a verified hardware protocol write actually executed
        message: 'Leave both sticks untouched in resting position and click Start Center Measurement.',
      },
      mode2: {
        currentStep: 1, // 1..7
        samplingStep: false,
        stepSamples: [],
        targetStepSamples: 35,
        stepData: {
          1: { completed: false, samples: 0, lx: 0, ly: 0, rx: 0, ry: 0, quality: 'Pending' },
          2: { completed: false, samples: 0, lx: 0, ly: 0, rx: 0, ry: 0, quality: 'Pending' },
          3: { completed: false, samples: 0, lx: 0, ly: 0, rx: 0, ry: 0, quality: 'Pending' },
          4: { completed: false, samples: 0, lx: 0, ly: 0, rx: 0, ry: 0, quality: 'Pending' },
          5: { completed: false, samples: 0, lx: 0, ly: 0, rx: 0, ry: 0, quality: 'Pending' },
          6: {
            completed: false,
            samples: 0,
            sectorsL: new Array(36).fill(null),
            sectorsR: new Array(36).fill(null),
            coveragePctL: 0,
            coveragePctR: 0,
            boundsL: { minX: 0, maxX: 0, minY: 0, maxY: 0 },
            boundsR: { minX: 0, maxX: 0, minY: 0, maxY: 0 },
            quality: 'Pending'
          },
        },
        confirmed: false,
        firmwareWritePerformed: false,
      }
    };
  }

  let state = createInitialState();

  function formatHex16(n) {
    if (typeof n !== 'number' || !Number.isFinite(n)) return '—';
    return '0x' + n.toString(16).toUpperCase().padStart(4, '0');
  }

  function checkEnvironment(winObj, navObj) {
    const w = winObj || (typeof window !== 'undefined' ? window : null);
    const n = navObj || (typeof navigator !== 'undefined' ? navigator : null);

    const isSecure = w ? Boolean(w.isSecureContext !== false) : true;
    const hasHid = Boolean(n && n.hid && typeof n.hid.requestDevice === 'function');

    state.secureContext = isSecure;
    state.envSupported = isSecure && hasHid;

    if (!isSecure) {
      state.deviceInfo.interfaceStatus = 'Blocked (Insecure Context — HTTPS/localhost required)';
      state.deviceInfo.lastError = 'WebHID requires a secure context (HTTPS or localhost). Standard Gamepad API remains operational.';
    } else if (!hasHid) {
      state.deviceInfo.interfaceStatus = 'WebHID Unavailable in this Browser';
      state.deviceInfo.lastError = 'This browser does not expose navigator.hid (e.g., Firefox/iOS Safari). Standard Gamepad API and Software Calibration remain fully operational.';
    } else {
      state.deviceInfo.lastError = null;
    }

    return {
      secureContext: isSecure,
      webHidSupported: hasHid,
      operational: isSecure && hasHid,
    };
  }

  /**
   * Inspects a WebHID device descriptor without sending any arbitrary or undocumented commands.
   */
  function inspectHidDeviceDescriptor(device) {
    if (!device) {
      return {
        deviceName: '—',
        vidHex: '—',
        pidHex: '—',
        interfaceStatus: 'No WebHID device selected',
        connectionType: 'Not determined',
        supportedOperations: 'Standard Gamepad API Read + Software Profile',
        protocolStatus: VERIFICATION_STATUSES.PROTOCOL_UNSUPPORTED,
        identificationStatus: VERIFICATION_STATUSES.AUTH_UNVERIFIED,
        evidenceNote: 'No WebHID device selected.',
      };
    }

    const vid = device.vendorId;
    const pid = device.productId;
    const vidHex = formatHex16(vid);
    const pidHex = formatHex16(pid);
    const lookupKey = `${(vid || 0).toString(16).padStart(4, '0')}:${(pid || 0).toString(16).padStart(4, '0')}`.toLowerCase();
    const known = KNOWN_VID_PIDS[lookupKey] || null;

    // Inspect collections (Gamepad usage page 0x01, usage 0x05)
    const collections = Array.isArray(device.collections) ? device.collections : [];
    let hasGamepadCollection = false;
    let totalFeatureReports = 0;
    let totalInputReports = 0;

    for (let i = 0; i < collections.length; i++) {
      const c = collections[i];
      if (c.usagePage === 0x01 && (c.usage === 0x05 || c.usage === 0x04)) {
        hasGamepadCollection = true;
      }
      if (Array.isArray(c.featureReports)) totalFeatureReports += c.featureReports.length;
      if (Array.isArray(c.inputReports)) totalInputReports += c.inputReports.length;
    }

    // Determine connection type ONLY if descriptor structure reliably distinguishes USB vs Bluetooth
    let connectionType = 'Not reliably determinable from descriptor alone';
    if (known && (known.family === 'ds4-v1' || known.family === 'ds4-v2' || known.family === 'dualsense')) {
      if (totalFeatureReports > 0 && totalInputReports === 1) {
        connectionType = 'HID Composite (Likely USB / Direct HID)';
      } else if (totalInputReports > 1) {
        connectionType = 'HID Multi-Report (Likely Bluetooth / Wireless HID)';
      }
    }

    // Protocol & Authenticity statuses (never accuse a device of being counterfeit from a missing report)
    let identificationStatus = VERIFICATION_STATUSES.IDENTIFIED;
    let protocolStatus = VERIFICATION_STATUSES.PROTOCOL_UNSUPPORTED;
    let evidenceNote = '';

    if (vid === 0x054c) {
      if (known) {
        evidenceNote = `${known.vendor} — ${known.model}. Note: VID 0x054C identifies Sony USB/HID vendor assignment, but hardware board revision and factory NVS lock status vary across models. Authenticity is not conclusively proven by VID/PID alone (${VERIFICATION_STATUSES.AUTH_UNVERIFIED}).`;
        if (totalFeatureReports === 0) {
          // Documented technical indicator: genuine DS4/DualSense expose feature reports in their HID descriptor
          identificationStatus = VERIFICATION_STATUSES.POSSIBLE_REPLICA;
          evidenceNote = `VID 0x054C (${known.model}) detected, but the HID descriptor exposes 0 feature reports. Technical indicator: some third-party clones omit factory feature reports, though OS/driver filtering can also hide them. Additional physical/board verification is required.`;
        }
      } else {
        identificationStatus = VERIFICATION_STATUSES.AUTH_UNVERIFIED;
        evidenceNote = `Sony Vendor ID (0x054C) with unrecognized Product ID (${pidHex}). Do not assume protocol compatibility across all 0x054C devices.`;
      }
    } else if (known) {
      evidenceNote = `${known.vendor} — ${known.model}. Connected via standard HID/Gamepad interface.`;
    } else {
      identificationStatus = hasGamepadCollection ? VERIFICATION_STATUSES.IDENTIFIED : VERIFICATION_STATUSES.AUTH_UNVERIFIED;
      evidenceNote = `Generic/Third-Party HID device (${vidHex}:${pidHex}). Firmware calibration protocol is not documented; safe browser software calibration profile is available.`;
    }

    return {
      deviceName: device.productName || (known ? known.model : 'HID Controller'),
      vidHex,
      pidHex,
      interfaceStatus: device.opened ? 'Connected & Opened (WebHID)' : (hasGamepadCollection ? 'HID Gamepad Collection Detected' : 'Unsupported / Custom HID Interface'),
      connectionType,
      supportedOperations: 'Read-Only HID Inspection + Local Software Calibration Profile (Firmware EEPROM Write Disabled for Safety)',
      protocolStatus,
      identificationStatus,
      evidenceNote,
      lastError: null,
    };
  }

  /**
   * Requests a WebHID device using the browser's official chooser.
   * Handles cancellation, unsupported browsers, and open errors gracefully.
   */
  async function requestAndInspectDevice(customNav) {
    const nav = customNav || (typeof navigator !== 'undefined' ? navigator : null);
    const env = checkEnvironment(undefined, nav);
    if (!env.operational) {
      renderUI();
      return { ok: false, reason: env.secureContext ? 'WEBHID_UNAVAILABLE' : 'INSECURE_CONTEXT', info: state.deviceInfo };
    }

    try {
      const devices = await nav.hid.requestDevice({
        filters: [
          { usagePage: 0x01, usage: 0x05 }, // Standard Gamepad
          { usagePage: 0x01, usage: 0x04 }, // Standard Joystick
          { vendorId: 0x054c },             // Sony reference VID
        ]
      });

      if (!devices || devices.length === 0) {
        state.deviceInfo.lastError = 'Device chooser cancelled by user. Existing Gamepad API testing remains active.';
        renderUI();
        return { ok: false, reason: 'USER_CANCELLED', info: state.deviceInfo };
      }

      const device = devices[0];
      // Close any previously opened WebHID device to prevent concurrent access conflicts
      if (state.connectedDevice && state.connectedDevice !== device && state.connectedDevice.opened) {
        try { await state.connectedDevice.close(); } catch (_) {}
      }

      if (!device.opened) {
        try {
          await device.open();
        } catch (openErr) {
          state.connectedDevice = device;
          state.deviceInfo = inspectHidDeviceDescriptor(device);
          state.deviceInfo.protocolStatus = VERIFICATION_STATUSES.REPORT_READ_ERROR;
          state.deviceInfo.lastError = `Could not open WebHID interface (${openErr.message || 'Access denied by OS'}). Gamepad API remains operational.`;
          renderUI();
          return { ok: false, reason: 'OPEN_ERROR', info: state.deviceInfo };
        }
      }

      state.connectedDevice = device;
      state.deviceInfo = inspectHidDeviceDescriptor(device);
      renderUI();
      return { ok: true, reason: 'CONNECTED', info: state.deviceInfo };
    } catch (err) {
      const isCancel = err && (err.name === 'NotAllowedError' || String(err.message || '').toLowerCase().includes('cancel'));
      state.deviceInfo.lastError = isCancel
        ? 'Device chooser cancelled by user. Gamepad API remains operational.'
        : `WebHID communication error: ${err && err.message ? err.message : 'Unknown error'}`;
      renderUI();
      return { ok: false, reason: isCancel ? 'USER_CANCELLED' : 'COMMUNICATION_ERROR', info: state.deviceInfo };
    }
  }

  // ─────────────────────────────────────────────────────────────
  // STATISTICAL HELPERS FOR MODE 1 & MODE 2
  // ─────────────────────────────────────────────────────────────
  function median(arr) {
    if (!arr || arr.length === 0) return 0;
    const s = arr.slice().sort((a, b) => a - b);
    const mid = Math.floor(s.length / 2);
    return s.length % 2 === 0 ? (s[mid - 1] + s[mid]) / 2 : s[mid];
  }

  function computeDispersion(arr) {
    if (!arr || arr.length === 0) return { median: 0, iqr: 0, stdDev: 0, peakToPeak: 0 };
    const s = arr.slice().sort((a, b) => a - b);
    const med = median(s);
    const q1 = s[Math.floor(s.length * 0.25)];
    const q3 = s[Math.floor(s.length * 0.75)];
    const iqr = q3 - q1;
    const mean = s.reduce((a, b) => a + b, 0) / s.length;
    const variance = s.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / s.length;
    return {
      median: Number(med.toFixed(5)),
      iqr: Number(iqr.toFixed(5)),
      stdDev: Number(Math.sqrt(variance).toFixed(5)),
      peakToPeak: Number((s[s.length - 1] - s[0]).toFixed(5)),
    };
  }

  function startMode1CenterSampling(currentAxes) {
    state.mode1.status = 'SAMPLING';
    state.mode1.samples = [];
    state.mode1.measuredCenters = null;
    state.mode1.dispersion = null;
    state.mode1.savedSoftwareProfile = false;
    state.mode1.firmwareWritePerformed = false;
    if (currentAxes) {
      state.mode1.beforeCenters = {
        lx: Number((currentAxes.lx || 0).toFixed(4)),
        ly: Number((currentAxes.ly || 0).toFixed(4)),
        rx: Number((currentAxes.rx || 0).toFixed(4)),
        ry: Number((currentAxes.ry || 0).toFixed(4)),
      };
    }
    state.mode1.message = 'Sampling resting center… Keep both sticks untouched.';
    renderUI();
  }

  function confirmMode1Profile(gp) {
    if (!state.mode1.measuredCenters) return false;
    state.mode1.savedSoftwareProfile = true;
    state.mode1.firmwareWritePerformed = false; // Explicitly false: browser software profile only
    state.mode1.message = '✓ Software correction profile saved locally. Controller firmware memory (EEPROM/NVS) was NOT modified.';

    // Also persist in StickCenterCalibration store if available
    if (gp && typeof StickCenterCalibration === 'object' && StickCenterCalibration.CalibrationProfileStore) {
      StickCenterCalibration.CalibrationProfileStore.saveProfileForGamepad(gp, {
        ok: true,
        sampleCount: state.mode1.samples.length,
        maxJitter: state.mode1.dispersion ? state.mode1.dispersion.maxPeakToPeak : 0,
        centers: state.mode1.measuredCenters,
        means: state.mode1.measuredCenters,
      });
    }
    renderUI();
    return true;
  }

  // ─────────────────────────────────────────────────────────────
  // MODE 2: 7-STEP GUIDED ENDPOINT CALIBRATION ASSISTANT
  // ─────────────────────────────────────────────────────────────
  function startGuidedStepCapture(stepNum) {
    const s = stepNum || state.mode2.currentStep;
    if (s < 1 || s > 6) return;
    state.mode2.currentStep = s;
    state.mode2.samplingStep = true;
    state.mode2.stepSamples = [];
    if (s === 6) {
      state.mode2.stepData[6].sectorsL = new Array(36).fill(null);
      state.mode2.stepData[6].sectorsR = new Array(36).fill(null);
      state.mode2.stepData[6].boundsL = { minX: 0, maxX: 0, minY: 0, maxY: 0 };
      state.mode2.stepData[6].boundsR = { minX: 0, maxX: 0, minY: 0, maxY: 0 };
    }
    renderUI();
  }

  function repeatGuidedStep(stepNum) {
    const s = Math.max(1, Math.min(6, stepNum || state.mode2.currentStep));
    state.mode2.currentStep = s;
    state.mode2.confirmed = false;
    startGuidedStepCapture(s);
  }

  function cancelGuidedCalibration() {
    state.mode2.samplingStep = false;
    state.mode2.stepSamples = [];
    state.mode2.currentStep = 1;
    state.mode2.confirmed = false;
    renderUI();
  }

  function confirmGuidedCalibration() {
    state.mode2.confirmed = true;
    state.mode2.firmwareWritePerformed = false;
    try {
      if (typeof localStorage !== 'undefined') {
        const payload = {
          savedAt: new Date().toISOString(),
          mode: 'GUIDED_ENDPOINT_SOFTWARE_PROFILE',
          firmwareModified: false,
          stepData: state.mode2.stepData,
        };
        localStorage.setItem(STORAGE_KEY_ENDPOINT, JSON.stringify(payload));
      }
    } catch (_) {}
    renderUI();
    return true;
  }

  function onFrameTick(gp, axes) {
    if (!axes) return;

    // Mode 1 Sampling
    if (state.mode1.status === 'SAMPLING') {
      if (state.mode1.samples.length === 0) {
        state.mode1.beforeCenters = {
          lx: Number((axes.lx || 0).toFixed(4)),
          ly: Number((axes.ly || 0).toFixed(4)),
          rx: Number((axes.rx || 0).toFixed(4)),
          ry: Number((axes.ry || 0).toFixed(4)),
        };
      }

      // Reject if stick is intentionally deflected during rest sampling
      if (Math.hypot(axes.lx || 0, axes.ly || 0) > 0.45 || Math.hypot(axes.rx || 0, axes.ry || 0) > 0.45) {
        state.mode1.status = 'ERROR';
        state.mode1.message = '✕ Movement detected during resting center measurement. Leave sticks untouched and click Repeat.';
        renderUI();
        return;
      }

      state.mode1.samples.push({
        lx: axes.lx || 0,
        ly: axes.ly || 0,
        rx: axes.rx || 0,
        ry: axes.ry || 0,
      });

      if (state.mode1.samples.length >= state.mode1.targetSamples) {
        const lxD = computeDispersion(state.mode1.samples.map(s => s.lx));
        const lyD = computeDispersion(state.mode1.samples.map(s => s.ly));
        const rxD = computeDispersion(state.mode1.samples.map(s => s.rx));
        const ryD = computeDispersion(state.mode1.samples.map(s => s.ry));

        state.mode1.measuredCenters = {
          lx: lxD.median,
          ly: lyD.median,
          rx: rxD.median,
          ry: ryD.median,
        };
        state.mode1.dispersion = {
          lx: lxD,
          ly: lyD,
          rx: rxD,
          ry: ryD,
          maxPeakToPeak: Math.max(lxD.peakToPeak, lyD.peakToPeak, rxD.peakToPeak, ryD.peakToPeak),
        };
        state.mode1.status = 'COMPLETED';
        state.mode1.message = 'Measurement complete. Review Before/After values and click Confirm Software Profile.';
      }
      renderUI();
    }

    // Mode 2 Guided Endpoint Sampling
    if (state.mode2.samplingStep) {
      const step = state.mode2.currentStep;
      const lx = axes.lx || 0;
      const ly = axes.ly || 0;
      const rx = axes.rx || 0;
      const ry = axes.ry || 0;

      state.mode2.stepSamples.push({ lx, ly, rx, ry });

      if (step >= 1 && step <= 5) {
        if (state.mode2.stepSamples.length >= state.mode2.targetStepSamples) {
          const d = state.mode2.stepData[step];
          d.lx = median(state.mode2.stepSamples.map(s => s.lx));
          d.ly = median(state.mode2.stepSamples.map(s => s.ly));
          d.rx = median(state.mode2.stepSamples.map(s => s.rx));
          d.ry = median(state.mode2.stepSamples.map(s => s.ry));
          d.samples = state.mode2.stepSamples.length;
          d.completed = true;
          d.quality = 'Verified (' + d.samples + ' samples)';
          state.mode2.samplingStep = false;
          if (state.mode2.currentStep < 7) {
            state.mode2.currentStep = step + 1;
          }
        }
      } else if (step === 6) {
        const d6 = state.mode2.stepData[6];
        d6.samples = state.mode2.stepSamples.length;
        d6.boundsL.minX = Math.min(d6.boundsL.minX, lx);
        d6.boundsL.maxX = Math.max(d6.boundsL.maxX, lx);
        d6.boundsL.minY = Math.min(d6.boundsL.minY, ly);
        d6.boundsL.maxY = Math.max(d6.boundsL.maxY, ly);

        d6.boundsR.minX = Math.min(d6.boundsR.minX, rx);
        d6.boundsR.maxX = Math.max(d6.boundsR.maxX, rx);
        d6.boundsR.minY = Math.min(d6.boundsR.minY, ry);
        d6.boundsR.maxY = Math.max(d6.boundsR.maxY, ry);

        const rL = Math.hypot(lx, ly);
        const rR = Math.hypot(rx, ry);
        if (rL >= 0.45) {
          const idxL = Math.min(35, Math.floor((((Math.atan2(ly, lx) * 180) / Math.PI + 360) % 360) / 10));
          d6.sectorsL[idxL] = Math.max(d6.sectorsL[idxL] || 0, rL);
        }
        if (rR >= 0.45) {
          const idxR = Math.min(35, Math.floor((((Math.atan2(ry, rx) * 180) / Math.PI + 360) % 360) / 10));
          d6.sectorsR[idxR] = Math.max(d6.sectorsR[idxR] || 0, rR);
        }

        const covL = d6.sectorsL.filter(v => v !== null).length;
        const covR = d6.sectorsR.filter(v => v !== null).length;
        d6.coveragePctL = Math.round((covL / 36) * 100);
        d6.coveragePctR = Math.round((covR / 36) * 100);

        if (d6.coveragePctL >= 85 && d6.coveragePctR >= 85) {
          d6.completed = true;
          d6.quality = `360° Complete (L: ${d6.coveragePctL}%, R: ${d6.coveragePctR}%)`;
          state.mode2.samplingStep = false;
          state.mode2.currentStep = 7;
        }
      }
      renderUI();
    }
  }

  async function closeAndReleaseResources() {
    state.modalOpen = false;
    state.mode1.status = 'IDLE';
    state.mode2.samplingStep = false;
    if (state.connectedDevice && state.connectedDevice.opened) {
      try {
        await state.connectedDevice.close();
      } catch (_) {}
    }
    if (typeof document !== 'undefined') {
      const modal = document.getElementById('webhid-calibration-modal');
      if (modal) modal.style.display = 'none';
    }
    renderUI();
  }

  function openModal() {
    checkEnvironment();
    state.modalOpen = true;
    if (typeof document !== 'undefined') {
      const modal = document.getElementById('webhid-calibration-modal');
      if (modal) modal.style.display = 'flex';
    }
    renderUI();
  }

  function switchMode(mode) {
    if (mode === 'MODE_1' || mode === 'MODE_2') {
      state.activeMode = mode;
      renderUI();
    }
  }

  function renderUI() {
    if (typeof document === 'undefined') return;
    const setTxt = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };

    const info = state.deviceInfo;
    setTxt('webhid-info-name', info.deviceName);
    setTxt('webhid-info-vid', info.vidHex);
    setTxt('webhid-info-pid', info.pidHex);
    setTxt('webhid-info-interface', info.interfaceStatus);
    setTxt('webhid-info-conntype', info.connectionType);
    setTxt('webhid-info-ops', info.supportedOperations);
    setTxt('webhid-info-proto', info.protocolStatus);
    setTxt('webhid-info-auth', info.identificationStatus);
    setTxt('webhid-info-note', info.lastError || info.evidenceNote);

    const mode1Panel = document.getElementById('webhid-mode1-panel');
    const mode2Panel = document.getElementById('webhid-mode2-panel');
    const tab1 = document.getElementById('webhid-tab-mode1');
    const tab2 = document.getElementById('webhid-tab-mode2');

    if (mode1Panel && mode2Panel) {
      mode1Panel.style.display = state.activeMode === 'MODE_1' ? 'flex' : 'none';
      mode2Panel.style.display = state.activeMode === 'MODE_2' ? 'flex' : 'none';
    }
    if (tab1 && tab2) {
      tab1.classList.toggle('active', state.activeMode === 'MODE_1');
      tab2.classList.toggle('active', state.activeMode === 'MODE_2');
    }

    // Mode 1 UI
    const m1 = state.mode1;
    setTxt('webhid-m1-msg', m1.message);
    setTxt('webhid-m1-before', `LX: ${m1.beforeCenters.lx} | LY: ${m1.beforeCenters.ly} | RX: ${m1.beforeCenters.rx} | RY: ${m1.beforeCenters.ry}`);
    setTxt(
      'webhid-m1-after',
      m1.measuredCenters
        ? `Measured Center -> LX: ${m1.measuredCenters.lx} | LY: ${m1.measuredCenters.ly} | RX: ${m1.measuredCenters.rx} | RY: ${m1.measuredCenters.ry} (Calibrated preview: 0.0000)`
        : '— (Run measurement first)'
    );
    setTxt('webhid-m1-layer-meas', m1.measuredCenters ? `Completed (${m1.samples.length} samples)` : m1.status);
    setTxt('webhid-m1-layer-soft', m1.savedSoftwareProfile ? 'Saved in Browser localStorage (Active)' : 'Not saved yet');
    setTxt('webhid-m1-layer-hw', 'Not Modified (Protected — No undocumented firmware write executed)');

    // Mode 2 UI
    const m2 = state.mode2;
    const stepMeta = GUIDED_STEPS.find(s => s.id === m2.currentStep) || GUIDED_STEPS[0];
    setTxt('webhid-m2-step-title', stepMeta.title);
    setTxt('webhid-m2-step-instr', stepMeta.instruction);

    const summaryEl = document.getElementById('webhid-m2-summary-list');
    if (summaryEl) {
      const d6 = m2.stepData[6];
      summaryEl.innerHTML = [1, 2, 3, 4, 5].map(idx => {
        const d = m2.stepData[idx];
        const st = GUIDED_STEPS[idx - 1];
        return `<div class="webhid-step-row ${m2.currentStep === idx ? 'active' : ''}">
          <strong>${st.title}:</strong>
          <span>${d.completed ? `LX:${d.lx.toFixed(3)} LY:${d.ly.toFixed(3)} | RX:${d.rx.toFixed(3)} RY:${d.ry.toFixed(3)} (${d.quality})` : 'Pending'}</span>
        </div>`;
      }).join('') + `
        <div class="webhid-step-row ${m2.currentStep === 6 ? 'active' : ''}">
          <strong>6. 360° Rotation:</strong>
          <span>${d6.completed ? d6.quality : `L Coverage: ${d6.coveragePctL}% | R Coverage: ${d6.coveragePctR}%`}</span>
        </div>
        <div class="webhid-step-row ${m2.currentStep === 7 ? 'active' : ''}">
          <strong>7. Calibration Target:</strong>
          <span>${m2.confirmed ? '✓ Software Endpoint Profile Saved (Hardware Firmware Untouched)' : 'Awaiting Confirmation'}</span>
        </div>
      `;
    }
  }

  function initDOMListeners() {
    checkEnvironment();
    if (typeof document === 'undefined') return;

    const bind = (id, fn) => {
      const el = document.getElementById(id);
      if (el && !el.dataset.boundWebhid) {
        el.dataset.boundWebhid = 'true';
        el.addEventListener('click', fn);
      }
    };

    bind('btn-webhid-connect', () => requestAndInspectDevice());
    bind('btn-webhid-calibrate', () => openModal());
    bind('webhid-modal-close', () => closeAndReleaseResources());
    bind('webhid-tab-mode1', () => switchMode('MODE_1'));
    bind('webhid-tab-mode2', () => switchMode('MODE_2'));
    bind('webhid-m1-start-btn', () => startMode1CenterSampling());
    bind('webhid-m1-confirm-btn', () => {
      const gps = (typeof navigator !== 'undefined' && navigator.getGamepads) ? navigator.getGamepads() : [];
      const gp = (typeof state === 'object' && window.state && window.state.activeGpIndex !== null) ? gps[window.state.activeGpIndex] : gps[0];
      confirmMode1Profile(gp);
    });
    bind('webhid-m2-capture-btn', () => startGuidedStepCapture(state.mode2.currentStep));
    bind('webhid-m2-repeat-btn', () => repeatGuidedStep(state.mode2.currentStep));
    bind('webhid-m2-prev-btn', () => {
      state.mode2.currentStep = Math.max(1, state.mode2.currentStep - 1);
      state.mode2.samplingStep = false;
      renderUI();
    });
    bind('webhid-m2-next-btn', () => {
      state.mode2.currentStep = Math.min(7, state.mode2.currentStep + 1);
      state.mode2.samplingStep = false;
      renderUI();
    });
    bind('webhid-m2-cancel-btn', () => cancelGuidedCalibration());
    bind('webhid-m2-confirm-btn', () => confirmGuidedCalibration());

    renderUI();
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initDOMListeners);
    } else {
      initDOMListeners();
    }
  }

  return {
    VERIFICATION_STATUSES,
    KNOWN_VID_PIDS,
    GUIDED_STEPS,
    checkEnvironment,
    inspectHidDeviceDescriptor,
    requestAndInspectDevice,
    startMode1CenterSampling,
    confirmMode1Profile,
    startGuidedStepCapture,
    repeatGuidedStep,
    cancelGuidedCalibration,
    confirmGuidedCalibration,
    onFrameTick,
    openModal,
    closeAndReleaseResources,
    switchMode,
    getState: () => state,
    resetState: () => { state = createInitialState(); return state; },
    initDOMListeners,
  };
});
