/* ============================================================================
   WEBHID DEVICE CALIBRATION, CAPABILITY MATRIX & SOFTWARE ENDPOINT MODULE
   File: webhid-calibration.js

   ATTRIBUTION & EXTERNAL PROTOCOL REFERENCES:
   1. Sony DualShock 4, DualSense, and DualSense Edge WebHID Calibration Protocol
      Adapted from: https://github.com/dualshock-tools/dualshock-tools.github.io
      Commit SHA: b7cdcfaacfadfac5e80f4f40b16e85503a488e63
      License: MIT License
      Copyright (c) dualshock-tools contributors
      Permission is hereby granted, free of charge, to any person obtaining a copy
      of this software and associated documentation files (the "Software"), to deal
      in the Software without restriction, including without limitation the rights
      to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
      copies of the Software, and to permit persons to whom the Software is
      furnished to do so, subject to the following conditions:
      The above copyright notice and this permission notice shall be included in all
      copies or substantial portions of the Software.

   2. Microsoft Xbox GIP Calibration Protocol Research & Transport Boundary
      Documented from: https://github.com/bb441db/xboxctl
      Commit SHA: dd2918cd274cbbe2411113f792f49e1034a2f26f
      License: ISC License (Copyright (C) 2026 by bb441db)
      Used for accurate Xbox Series X|S / Xbox One GIP command 0x1e capability
      reporting, firmware version constraints, and USB interface (FF:47:D0) boundary.
   ============================================================================ */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.WebHIDCalibrationModule = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const STORAGE_KEY_ENDPOINT = 'gamepad_tester_webhid_profiles_v1';
  const STORAGE_KEY_HW_AUDIT = 'gamepad_tester_hw_calib_audit_v1';
  const ENDPOINT_SCHEMA_VERSION = 2;

  const EXTERNAL_REFERENCES = {
    dualshockTools: {
      repo: 'https://github.com/dualshock-tools/dualshock-tools.github.io',
      commitSha: 'b7cdcfaacfadfac5e80f4f40b16e85503a488e63',
      license: 'MIT',
    },
    xboxctl: {
      repo: 'https://github.com/bb441db/xboxctl',
      commitSha: 'dd2918cd274cbbe2411113f792f49e1034a2f26f',
      license: 'ISC',
    },
  };

  const VERIFICATION_STATUSES = {
    IDENTIFIED: 'Device identified.',
    AUTH_UNVERIFIED: 'Authenticity not verified.',
    PROTOCOL_UNSUPPORTED: 'Protocol not supported.',
    PROTOCOL_SUPPORTED_SONY_USB: 'Sony USB WebHID calibration protocol supported.',
    PROTOCOL_BLUETOOTH_READONLY: 'Bluetooth HID detected — USB required for device calibration.',
    PROTOCOL_XBOX_GIP_BOUNDARY: 'Xbox GIP interface (FF:47:D0) not accessible via browser WebHID.',
    REPORT_READ_ERROR: 'Report read error.',
    POSSIBLE_REPLICA: 'Possible replica — additional verification required.',
  };

  const CALIBRATION_OUTCOME_STATES = {
    NONE: 'Not started',
    MEASUREMENTS_COMPLETED: 'Measurements completed',
    BROWSER_PROFILE_SAVED: 'Browser software profile saved',
    TEMP_DEVICE_CALIBRATED: 'Temporary device calibration completed (RAM)',
    PERMANENT_SAVE_ACKNOWLEDGED: 'Permanent NVS save command acknowledged',
    PERSISTENCE_VERIFIED_RECONNECT: 'Persistence verified after reconnect',
    FAILED: 'Operation failed',
  };

  const KNOWN_VID_PIDS = {
    '054c:05c4': { vendor: 'Sony Corp. (VID 0x054C)', model: 'DualShock 4 (CUH-ZCT1)', family: 'ds4-v1', sonyAdapter: 'DS4' },
    '054c:09cc': { vendor: 'Sony Corp. (VID 0x054C)', model: 'DualShock 4 (CUH-ZCT2)', family: 'ds4-v2', sonyAdapter: 'DS4' },
    '054c:0ce6': { vendor: 'Sony Corp. (VID 0x054C)', model: 'DualSense Wireless Controller', family: 'dualsense', sonyAdapter: 'DS5' },
    '054c:0df2': { vendor: 'Sony Corp. (VID 0x054C)', model: 'DualSense Edge Wireless Controller', family: 'dualsense-edge', sonyAdapter: 'DS5_Edge' },
    '054c:0268': { vendor: 'Sony Corp. (VID 0x054C)', model: 'DualShock 3 / Sixaxis', family: 'ds3', sonyAdapter: null },
    '045e:028e': { vendor: 'Microsoft Corp.', model: 'Xbox 360 Controller', family: 'xbox360', sonyAdapter: null },
    '045e:02d1': { vendor: 'Microsoft Corp.', model: 'Xbox One Controller (ARGO)', family: 'xboxone', sonyAdapter: null },
    '045e:02dd': { vendor: 'Microsoft Corp.', model: 'Xbox One Controller 2015 (LANG)', family: 'xboxone', sonyAdapter: null },
    '045e:02e3': { vendor: 'Microsoft Corp.', model: 'Xbox One Elite Controller (TROY)', family: 'xboxone-elite', sonyAdapter: null },
    '045e:02ea': { vendor: 'Microsoft Corp.', model: 'Xbox One S Controller (CRET)', family: 'xboxone-s', sonyAdapter: null },
    '045e:0b00': { vendor: 'Microsoft Corp.', model: 'Xbox Elite Controller Series 2 (DELP)', family: 'xbox-elite-2', sonyAdapter: null },
    '045e:0b12': { vendor: 'Microsoft Corp.', model: 'Xbox Series X|S Controller (MERL)', family: 'xboxseries', sonyAdapter: null },
    '045e:0b13': { vendor: 'Microsoft Corp.', model: 'Xbox Series X|S Controller (BLE)', family: 'xboxseries', sonyAdapter: null },
  };

  /**
   * Documented Xbox GIP calibration findings from bb441db/xboxctl (commit dd2918cd274cbbe2411113f792f49e1034a2f26f)
   */
  const XBOX_GIP_RESEARCH = {
    referenceCommit: 'dd2918cd274cbbe2411113f792f49e1034a2f26f',
    usbInterfaceClass: { classCode: 0xff, subclassCode: 0x47, protocolCode: 0xd0, endpoints: { in: 0x82, out: 0x02 } },
    gipCommand: 0x1e,
    gipFlags: 0x10, // FLAG_ACME (ACK requested)
    subCommands: {
      read: 0x0f,     // Payload: [0x0f, mask] -> Reply: [0x0f, 0x00, status, ...blocks]
      recenter: 0x10, // Payload: [0x10, mask] -> Reply: [0x10, status, mask] (erases stored limits immediately)
    },
    controlMasks: {
      leftStick: 0x01,
      rightStick: 0x02,
      bothSticks: 0x03,
      leftTrigger: 0x04,
      rightTrigger: 0x08,
      bothTriggers: 0x0c,
    },
    modelEvidence: {
      '045e:0b12': {
        codename: 'MERL',
        name: 'Xbox Series X|S Controller',
        minSupportedFirmware: '5.19.3221.0',
        verifiedFirmware: '5.23.6.0',
        olderFirmwareBehavior: 'Firmware 5.13.3146.0 silently ignores command 0x1e without ACK.',
        persistence: 'Stored in non-volatile record 0x11 outside the firmware image; survives full power cycle and firmware downgrade/upgrade.',
        interruptionBehavior: 'Starting calibration (0x10) immediately erases stored limits for selected controls; if interrupted before ~6 CW and ~5 CCW turns complete, limits remain erased (0) until recalibrated or reset (GIP Set Device State 0x05 [0x07]).',
      },
      '045e:02ea': {
        codename: 'CRET',
        name: 'Xbox One S Controller',
        testedFirmware: '5.22',
        behavior: 'Explicitly rejects calibration read/recenter requests with [0x0f, 0x01] (Response::Rejected).',
      },
    },
    browserFeasibility: {
      supportedInBrowser: false,
      requiresNativeHelperOrApp: true,
      explanation: 'Xbox USB controllers communicate over Microsoft GIP (USB interface class FF:47:D0, interrupt endpoints 0x82/0x02), which is not a standard HID interface (class 0x03) and is claimed by OS kernel drivers (Windows GameInput/xinputhid, Linux xpad/xone, macOS driver). Browser WebHID cannot enumerate FF:47:D0 interfaces, and browser WebUSB cannot detach OS kernel drivers. Hardware calibration requires native libusb access (e.g., xboxctl CLI or Xbox Accessories app).',
    },
  };

  const DS5_FINETUNE_KEYS = [
    'LL', 'LT', 'LR', 'LB',
    'RL', 'RT', 'RR', 'RB',
    'LX', 'LY', 'RX', 'RY'
  ];

  const GUIDED_STEPS = [
    { id: 1, key: 'REST_CENTER', title: '1. Resting Center', instruction: 'Leave both analog sticks completely untouched in their natural resting position.' },
    { id: 2, key: 'UP_LEFT',     title: '2. Up-Left Corner', instruction: 'Hold both sticks firmly into the Up-Left (NW: X < 0, Y < 0) corner.' },
    { id: 3, key: 'UP_RIGHT',    title: '3. Up-Right Corner', instruction: 'Hold both sticks firmly into the Up-Right (NE: X > 0, Y < 0) corner.' },
    { id: 4, key: 'DOWN_RIGHT',  title: '4. Down-Right Corner', instruction: 'Hold both sticks firmly into the Down-Right (SE: X > 0, Y > 0) corner.' },
    { id: 5, key: 'DOWN_LEFT',   title: '5. Down-Left Corner', instruction: 'Hold both sticks firmly into the Down-Left (SW: X < 0, Y > 0) corner.' },
    { id: 6, key: 'ROTATE_360',  title: '6. Complete 360° Rotation', instruction: 'Rotate both sticks smoothly through a full 360° perimeter sweep (≥85% sector coverage).' },
    { id: 7, key: 'SUMMARY',     title: '7. Measurement Summary & Confirmation', instruction: 'Review observed axis limits, angular coverage, and sample quality before saving the local software correction profile.' },
  ];

  // ─────────────────────────────────────────────────────────────
  // LOW-LEVEL WEBHID HELPERS & COMMAND SERIALIZER (from dualshock-tools)
  // ─────────────────────────────────────────────────────────────
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function dec2hex(i) {
    return (i + 0x10000).toString(16).substr(-4).toUpperCase();
  }

  function dec2hex8(i) {
    return (i + 0x100).toString(16).substr(-2).toUpperCase();
  }

  function dec2hex32(i) {
    return ((i >>> 0) + 0x100000000).toString(16).substr(-8).toUpperCase();
  }

  function formatHex16(n) {
    if (typeof n !== 'number' || !Number.isFinite(n)) return '—';
    return '0x' + n.toString(16).toUpperCase().padStart(4, '0');
  }

  /**
   * Allocates a feature report buffer padded to the descriptor's reportCount for reportId.
   * Ported from dualshock-tools/js/controllers/base-controller.js (commit b7cdcfaacfadfac5e80f4f40b16e85503a488e63).
   */
  function allocFeatureReportBuffer(device, reportId, data) {
    const src = data instanceof Uint8Array ? data : new Uint8Array(data || []);
    let maxLen = src.length;
    try {
      const collections = device && Array.isArray(device.collections) ? device.collections : [];
      for (let c = 0; c < collections.length; c++) {
        const reports = collections[c] && Array.isArray(collections[c].featureReports)
          ? collections[c].featureReports
          : [];
        const match = reports.find((fr) => fr && fr.reportId === reportId);
        if (match && typeof match.reportCount === 'number' && match.reportCount > maxLen) {
          maxLen = match.reportCount;
          break;
        }
      }
    } catch (_) {}
    const out = new Uint8Array(maxLen);
    out.set(src.slice(0, maxLen));
    return out;
  }

  function withTimeout(promise, timeoutMs, operationLabel) {
    const ms = typeof timeoutMs === 'number' && timeoutMs > 0 ? timeoutMs : 1500;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Timeout (${ms}ms) during ${operationLabel || 'WebHID operation'}`));
      }, ms);
      Promise.resolve(promise).then(
        (val) => {
          clearTimeout(timer);
          resolve(val);
        },
        (err) => {
          clearTimeout(timer);
          reject(err);
        }
      );
    });
  }

  function getFeatureReportIds(device) {
    const ids = new Set();
    const collections = device && Array.isArray(device.collections) ? device.collections : [];
    for (let i = 0; i < collections.length; i++) {
      const frs = collections[i] && Array.isArray(collections[i].featureReports) ? collections[i].featureReports : [];
      for (let j = 0; j < frs.length; j++) {
        if (typeof frs[j].reportId === 'number') {
          ids.add(frs[j].reportId);
        }
      }
    }
    return ids;
  }

  // Serialized command queue to prevent concurrent mutating operations or duplicate clicks
  let _commandLock = false;
  async function runSerializedHardwareOp(operationName, asyncFn) {
    if (_commandLock) {
      return {
        ok: false,
        code: 'BUSY',
        error: `Another hardware operation is already in progress (attempted: ${operationName}).`,
      };
    }
    _commandLock = true;
    setSessionOperationLock(true, `WebHID: ${operationName}`);
    try {
      return await asyncFn();
    } catch (err) {
      return {
        ok: false,
        code: 'EXCEPTION',
        error: err && err.message ? err.message : String(err),
      };
    } finally {
      _commandLock = false;
      updateSessionLockFromState();
    }
  }

  // ─────────────────────────────────────────────────────────────
  // SONY WEBHID HARDWARE CALIBRATION ADAPTERS
  // Adapted from dualshock-tools (MIT License, commit b7cdcfaacfadfac5e80f4f40b16e85503a488e63)
  // ─────────────────────────────────────────────────────────────
  class BaseSonyHidAdapter {
    constructor(device) {
      this.device = device;
      this.model = 'Unknown';
    }

    ensureOpen() {
      if (!this.device || !this.device.opened) {
        throw new Error('WebHID device is not open or was disconnected.');
      }
    }

    async sendFeatureReport(reportId, data, timeoutMs = 1500) {
      this.ensureOpen();
      const payload = allocFeatureReportBuffer(this.device, reportId, data);
      return await withTimeout(
        this.device.sendFeatureReport(reportId, payload),
        timeoutMs,
        `sendFeatureReport(0x${dec2hex8(reportId)})`
      );
    }

    async receiveFeatureReport(reportId, timeoutMs = 1500) {
      this.ensureOpen();
      const raw = await withTimeout(
        this.device.receiveFeatureReport(reportId),
        timeoutMs,
        `receiveFeatureReport(0x${dec2hex8(reportId)})`
      );
      if (raw instanceof DataView) return raw;
      if (raw && raw.buffer) return new DataView(raw.buffer, raw.byteOffset || 0, raw.byteLength);
      throw new Error(`Invalid DataView returned from receiveFeatureReport(0x${dec2hex8(reportId)})`);
    }
  }

  /**
   * DualShock 4 Adapter (VID 0x054C, PID 0x05C4 / 0x09CC)
   * Uses feature report 0x90 for stick center/range calibration, responses on 0x91 & 0x92,
   * and feature report 0xa0 for NVS unlock/lock.
   */
  class DS4CalibrationAdapter extends BaseSonyHidAdapter {
    constructor(device) {
      super(device);
      this.model = 'DS4';
    }

    supportsCalibrationDescriptor() {
      const ids = getFeatureReportIds(this.device);
      // If browser exposes feature report IDs in collections, verify 0x90, 0x91, 0x92 exist
      if (ids.size > 0) {
        return ids.has(0x90) && ids.has(0x91) && ids.has(0x92);
      }
      return true;
    }

    async verifyGenuineAndInfo() {
      try {
        const view = await this.receiveFeatureReport(0xa3, 1500);
        const cmd = view.getUint8(0);
        if (cmd !== 0xa3 || view.byteLength < 49) {
          return {
            ok: false,
            isClone: true,
            reason: `Feature report 0xA3 returned unexpected header/length (cmd=0x${dec2hex8(cmd)}, len=${view.byteLength}, expected 49).`,
          };
        }
        // Check 0x81 response as in upstream ds4-controller.js
        try {
          await this.receiveFeatureReport(0x81, 1000);
        } catch (err) {
          return {
            ok: false,
            isClone: true,
            reason: `Feature report 0x81 failed (${err.message || 'timeout'}) — device may be a non-genuine DS4 clone.`,
          };
        }
        let serialMac = null;
        try {
          const macView = await this.receiveFeatureReport(0x12, 1000);
          if (macView.byteLength >= 7) {
            serialMac = [6, 5, 4, 3, 2, 1]
              .map((i) => macView.getUint8(i).toString(16).padStart(2, '0'))
              .join(':')
              .toUpperCase();
          }
        } catch (_) {}

        const hwVer = view.getUint16(35, true);
        const swVer = view.getUint32(37, true);
        const nvStatus = await this.queryNvStatus();

        return {
          ok: true,
          isClone: false,
          model: 'DS4',
          serialNumber: serialMac,
          hwVersion: dec2hex(hwVer),
          fwVersion: dec2hex32(swVer),
          nvStatus,
        };
      } catch (err) {
        return {
          ok: false,
          isClone: false,
          reason: `DS4 verification read failed: ${err.message || String(err)}`,
        };
      }
    }

    async queryNvStatus() {
      try {
        await this.sendFeatureReport(0x08, [0xff, 0, 12], 1200);
        const data = await this.receiveFeatureReport(0x11, 1200);
        const ret = data.getUint8(1);
        const res = { device: 'ds4', code: ret };
        if (ret === 1) {
          return { ...res, ok: true, status: 'locked', mode: 'temporary', raw: ret };
        } else if (ret === 0) {
          return { ...res, ok: true, status: 'unlocked', mode: 'permanent', raw: ret };
        }
        return { ...res, ok: false, status: 'unknown', code: 2, raw: ret };
      } catch (error) {
        return { device: 'ds4', ok: false, status: 'error', code: 2, error };
      }
    }

    async nvsUnlock() {
      await this.sendFeatureReport(0xa0, [10, 2, 0x3e, 0x71, 0x7f, 0x89]);
      return { ok: true };
    }

    async nvsLock() {
      await this.sendFeatureReport(0xa0, [10, 1, 0]);
      return { ok: true };
    }

    async flashPermanent() {
      await this.nvsUnlock();
      await sleep(100);
      await this.nvsLock();
      const nv = await this.queryNvStatus();
      return {
        ok: true,
        status: CALIBRATION_OUTCOME_STATES.PERMANENT_SAVE_ACKNOWLEDGED,
        nvStatus: nv,
        message: 'DS4 NVS unlock + lock sequence acknowledged by controller.',
      };
    }

    async calibrateSticksBegin() {
      await this.sendFeatureReport(0x90, [1, 1, 1]);
      await sleep(200);
      const data = await this.receiveFeatureReport(0x91);
      const data2 = await this.receiveFeatureReport(0x92);
      const d1 = data.getUint32(0, false);
      const d2 = data2.getUint32(0, false);
      if (d1 !== 0x91010101 || d2 !== 0x920101ff) {
        return {
          ok: false,
          code: 1,
          d1: dec2hex32(d1),
          d2: dec2hex32(d2),
          error: `DS4 calibrateSticksBegin unexpected reply: d1=0x${dec2hex32(d1)}, d2=0x${dec2hex32(d2)}`,
        };
      }
      return { ok: true, d1: dec2hex32(d1), d2: dec2hex32(d2) };
    }

    async calibrateSticksSample() {
      await this.sendFeatureReport(0x90, [3, 1, 1]);
      await sleep(200);
      const data = await this.receiveFeatureReport(0x91);
      const data2 = await this.receiveFeatureReport(0x92);
      const d1 = data.getUint32(0, false);
      const d2 = data2.getUint32(0, false);
      if (d1 !== 0x91010101 || d2 !== 0x920101ff) {
        return {
          ok: false,
          code: 2,
          d1: dec2hex32(d1),
          d2: dec2hex32(d2),
          error: `DS4 calibrateSticksSample unexpected reply: d1=0x${dec2hex32(d1)}, d2=0x${dec2hex32(d2)}`,
        };
      }
      return { ok: true, d1: dec2hex32(d1), d2: dec2hex32(d2) };
    }

    async calibrateSticksEnd() {
      await this.sendFeatureReport(0x90, [2, 1, 1]);
      await sleep(200);
      const data = await this.receiveFeatureReport(0x91);
      const data2 = await this.receiveFeatureReport(0x92);
      const d1 = data.getUint32(0, false);
      const d2 = data2.getUint32(0, false);
      if (d1 !== 0x91010102 || d2 !== 0x92010101) {
        return {
          ok: false,
          code: 3,
          d1: dec2hex32(d1),
          d2: dec2hex32(d2),
          error: `DS4 calibrateSticksEnd unexpected reply: d1=0x${dec2hex32(d1)}, d2=0x${dec2hex32(d2)}`,
        };
      }
      return {
        ok: true,
        status: CALIBRATION_OUTCOME_STATES.TEMP_DEVICE_CALIBRATED,
        d1: dec2hex32(d1),
        d2: dec2hex32(d2),
      };
    }

    async calibrateRangeBegin() {
      await this.sendFeatureReport(0x90, [1, 1, 2]);
      await sleep(200);
      const data = await this.receiveFeatureReport(0x91);
      const data2 = await this.receiveFeatureReport(0x92);
      const d1 = data.getUint32(0, false);
      const d2 = data2.getUint32(0, false);
      if (d1 !== 0x91010201 || d2 !== 0x920102ff) {
        return {
          ok: false,
          code: 1,
          d1: dec2hex32(d1),
          d2: dec2hex32(d2),
          error: `DS4 calibrateRangeBegin unexpected reply: d1=0x${dec2hex32(d1)}, d2=0x${dec2hex32(d2)}`,
        };
      }
      return { ok: true, d1: dec2hex32(d1), d2: dec2hex32(d2) };
    }

    async calibrateRangeEnd() {
      await this.sendFeatureReport(0x90, [2, 1, 2]);
      await sleep(200);
      const data = await this.receiveFeatureReport(0x91);
      const data2 = await this.receiveFeatureReport(0x92);
      const d1 = data.getUint32(0, false);
      const d2 = data2.getUint32(0, false);
      if (d1 !== 0x91010202 || d2 !== 0x92010201) {
        return {
          ok: false,
          code: 3,
          d1: dec2hex32(d1),
          d2: dec2hex32(d2),
          error: `DS4 calibrateRangeEnd unexpected reply: d1=0x${dec2hex32(d1)}, d2=0x${dec2hex32(d2)}`,
        };
      }
      return {
        ok: true,
        status: CALIBRATION_OUTCOME_STATES.TEMP_DEVICE_CALIBRATED,
        d1: dec2hex32(d1),
        d2: dec2hex32(d2),
      };
    }
  }

  /**
   * DualSense Adapter (VID 0x054C, PID 0x0CE6)
   * Uses feature report 0x82 for stick center/range calibration, responses on 0x83,
   * and feature report 0x80/0x81 for system info, 12-word finetune readout, and NVS unlock/lock.
   */
  class DS5CalibrationAdapter extends BaseSonyHidAdapter {
    constructor(device) {
      super(device);
      this.model = 'DS5';
    }

    supportsCalibrationDescriptor() {
      const ids = getFeatureReportIds(this.device);
      if (ids.size > 0) {
        return ids.has(0x80) && ids.has(0x81) && ids.has(0x82) && ids.has(0x83);
      }
      return true;
    }

    getFinetuneMaxValue() {
      return 65535;
    }

    async verifyGenuineAndInfo() {
      try {
        const view = await this.receiveFeatureReport(0x20, 1500);
        const cmd = view.getUint8(0);
        if (cmd !== 0x20 || view.byteLength !== 64) {
          return {
            ok: false,
            isClone: true,
            reason: `Feature report 0x20 returned unexpected header/length (cmd=0x${dec2hex8(cmd)}, len=${view.byteLength}, expected 64).`,
          };
        }

        const hwInfo = view.getUint32(24, true);
        const fwVersion = view.getUint32(28, true);

        let serialNumber = null;
        try {
          await this.sendFeatureReport(0x80, [1, 19], 1000);
          await sleep(100);
          const serData = await this.receiveFeatureReport(0x81, 1000);
          if (serData.getUint8(0) === 0x81 && serData.getUint8(1) === 1 && serData.getUint8(2) === 19) {
            const chars = [];
            for (let i = 4; i < 4 + 17 && i < serData.byteLength; i++) {
              const c = serData.getUint8(i);
              if (c >= 32 && c <= 126) chars.push(String.fromCharCode(c));
            }
            serialNumber = chars.join('').trim() || null;
          }
        } catch (_) {}

        const nvStatus = await this.queryNvStatus();
        let finetuneBackup = null;
        try {
          finetuneBackup = await this.readFinetuneData();
        } catch (_) {}

        return {
          ok: true,
          isClone: false,
          model: this.model,
          serialNumber,
          hwVersion: dec2hex32(hwInfo),
          fwVersion: dec2hex32(fwVersion),
          nvStatus,
          finetuneBackup,
        };
      } catch (err) {
        return {
          ok: false,
          isClone: false,
          reason: `${this.model} verification read failed: ${err.message || String(err)}`,
        };
      }
    }

    async queryNvStatus() {
      try {
        await this.sendFeatureReport(0x80, [3, 3], 1200);
        await sleep(50);
        const data = await this.receiveFeatureReport(0x81, 1200);
        const ret = data.getUint32(1, false);
        const res = { device: this.model.toLowerCase(), raw: dec2hex32(ret) };
        if (ret === 0x15010100) {
          return { ...res, ok: false, status: 'pending_reboot', code: 4 };
        }
        if (ret === 0x03030201) {
          return { ...res, ok: true, status: 'locked', mode: 'temporary', code: 1 };
        }
        if (ret === 0x03030200) {
          return { ...res, ok: true, status: 'unlocked', mode: 'permanent', code: 0 };
        }
        return { ...res, ok: false, status: 'unknown', code: 2 };
      } catch (error) {
        return { device: this.model.toLowerCase(), ok: false, status: 'error', code: 2, error };
      }
    }

    async readFinetuneData() {
      await this.sendFeatureReport(0x80, [12, 2], 1200);
      await sleep(100);
      const data = await this.receiveFeatureReport(0x81, 1200);
      const cmd = data.getUint8(0);
      const p1 = data.getUint8(1);
      const p2 = data.getUint8(2);
      const p3 = data.getUint8(3);
      if (cmd !== 0x81 || p1 !== 12 || p2 !== 2 || p3 !== 2) {
        return null;
      }
      const words = [];
      for (let i = 0; i < 12; i++) {
        words.push(data.getUint16(4 + i * 2, true));
      }
      const mapped = {};
      DS5_FINETUNE_KEYS.forEach((k, idx) => {
        mapped[k] = words[idx];
      });
      return { words, mapped, timestamp: new Date().toISOString() };
    }

    async writeFinetuneData(words) {
      if (!Array.isArray(words) || words.length !== 12) {
        throw new Error('Finetune data must be an array of 12 uint16 values.');
      }
      const pkg = words.reduce((acc, val) => acc.concat([val & 0xff, (val >> 8) & 0xff]), [12, 1]);
      await this.sendFeatureReport(0x80, pkg, 1500);
      return { ok: true };
    }

    async nvsUnlock() {
      await this.sendFeatureReport(0x80, [3, 2, 101, 50, 64, 12], 1500);
      await sleep(100);
      const data = await this.receiveFeatureReport(0x81, 1500);
      return { ok: true, raw: dec2hex32(data.getUint32(0, false)) };
    }

    async nvsLock() {
      await this.sendFeatureReport(0x80, [3, 1], 1500);
      await sleep(100);
      const data = await this.receiveFeatureReport(0x81, 1500);
      const ret = data.getUint32(0, false);
      if (ret !== 0x81030102) {
        return {
          ok: false,
          code: 1,
          d1: dec2hex32(ret),
          error: `DS5 nvsLock unexpected response: 0x${dec2hex32(ret)}`,
        };
      }
      return { ok: true, d1: dec2hex32(ret) };
    }

    async flashPermanent() {
      const nv = await this.queryNvStatus();
      if (nv.status !== 'unlocked') {
        await this.nvsUnlock();
      }
      await sleep(80);
      const lockRes = await this.nvsLock();
      const postNv = await this.queryNvStatus();
      if (!lockRes.ok) {
        return {
          ok: false,
          status: CALIBRATION_OUTCOME_STATES.FAILED,
          error: lockRes.error || 'Failed to lock DS5 NVS after unlock.',
          nvStatus: postNv,
        };
      }
      return {
        ok: true,
        status: CALIBRATION_OUTCOME_STATES.PERMANENT_SAVE_ACKNOWLEDGED,
        nvStatus: postNv,
        message: 'DualSense NVS unlock + lock sequence acknowledged by controller.',
      };
    }

    async calibrateSticksBegin() {
      await this.sendFeatureReport(0x82, [1, 1, 1]);
      await sleep(100);
      const data = await this.receiveFeatureReport(0x83);
      const d1 = data.getUint32(0, false);
      if (d1 !== 0x83010101) {
        return {
          ok: false,
          code: 1,
          d1: dec2hex32(d1),
          error: `DS5 calibrateSticksBegin unexpected reply: 0x${dec2hex32(d1)}`,
        };
      }
      return { ok: true, d1: dec2hex32(d1) };
    }

    async calibrateSticksSample() {
      await this.sendFeatureReport(0x82, [3, 1, 1]);
      await sleep(100);
      const data = await this.receiveFeatureReport(0x83);
      const d1 = data.getUint32(0, false);
      if (d1 !== 0x83010101) {
        return {
          ok: false,
          code: 2,
          d1: dec2hex32(d1),
          error: `DS5 calibrateSticksSample unexpected reply: 0x${dec2hex32(d1)}`,
        };
      }
      return { ok: true, d1: dec2hex32(d1) };
    }

    async calibrateSticksEnd() {
      await this.sendFeatureReport(0x82, [2, 1, 1]);
      await sleep(100);
      const data = await this.receiveFeatureReport(0x83);
      const d1 = data.getUint32(0, false);
      if (d1 !== 0x83010102) {
        return {
          ok: false,
          code: 3,
          d1: dec2hex32(d1),
          error: `DS5 calibrateSticksEnd unexpected reply: 0x${dec2hex32(d1)}`,
        };
      }
      return {
        ok: true,
        status: CALIBRATION_OUTCOME_STATES.TEMP_DEVICE_CALIBRATED,
        d1: dec2hex32(d1),
      };
    }

    async calibrateRangeBegin() {
      await this.sendFeatureReport(0x82, [1, 1, 2]);
      await sleep(100);
      const data = await this.receiveFeatureReport(0x83);
      const d1 = data.getUint32(0, false);
      if (d1 !== 0x83010201) {
        return {
          ok: false,
          code: 1,
          d1: dec2hex32(d1),
          error: `DS5 calibrateRangeBegin unexpected reply: 0x${dec2hex32(d1)}`,
        };
      }
      return { ok: true, d1: dec2hex32(d1) };
    }

    async calibrateRangeEnd() {
      await this.sendFeatureReport(0x82, [2, 1, 2]);
      await sleep(100);
      const data = await this.receiveFeatureReport(0x83);
      const d1 = data.getUint32(0, false);
      if (d1 !== 0x83010202) {
        return {
          ok: false,
          code: 3,
          d1: dec2hex32(d1),
          error: `DS5 calibrateRangeEnd unexpected reply: 0x${dec2hex32(d1)}`,
        };
      }
      return {
        ok: true,
        status: CALIBRATION_OUTCOME_STATES.TEMP_DEVICE_CALIBRATED,
        d1: dec2hex32(d1),
      };
    }
  }

  /**
   * DualSense Edge Adapter (VID 0x054C, PID 0x0DF2)
   * Ported from dualshock-tools/js/controllers/ds5-edge-controller.js (commit b7cdcfaacfadfac5e80f4f40b16e85503a488e63).
   * - Requires two-step End commands for both center and range calibration.
   * - Uses [12, 4] for 12-bit in-memory finetune module readout.
   * - Stick modules have hardware write-protection on stock units; permanent module persistence
   *   requires physical write-protect modification on the stick modules.
   */
  class DS5EdgeCalibrationAdapter extends DS5CalibrationAdapter {
    constructor(device) {
      super(device);
      this.model = 'DS5_Edge';
    }

    getFinetuneMaxValue() {
      return 4095;
    }

    async readFinetuneData() {
      await this.sendFeatureReport(0x80, [12, 4], 1200);
      await sleep(100);
      const data = await this.receiveFeatureReport(0x81, 1200);
      const cmd = data.getUint8(0);
      const p1 = data.getUint8(1);
      const p2 = data.getUint8(2);
      const p3 = data.getUint8(3);
      if (cmd !== 0x81 || p1 !== 12 || p2 !== 4 || p3 !== 2) {
        return null;
      }
      const words = [];
      for (let i = 0; i < 12; i++) {
        words.push(data.getUint16(4 + i * 2, true));
      }
      const mapped = {};
      DS5_FINETUNE_KEYS.forEach((k, idx) => {
        mapped[k] = words[idx];
      });
      return { words, mapped, timestamp: new Date().toISOString() };
    }

    async calibrateSticksEnd() {
      await this.sendFeatureReport(0x82, [2, 1, 1]);
      await sleep(100);
      let data = await this.receiveFeatureReport(0x83);
      const d1 = data.getUint32(0, false);
      if (d1 !== 0x83010101) {
        return {
          ok: false,
          code: 4,
          d1: dec2hex32(d1),
          error: `DS5 Edge calibrateSticksEnd step 1 unexpected reply: 0x${dec2hex32(d1)}`,
        };
      }
      await sleep(200);
      await this.sendFeatureReport(0x82, [2, 1, 1]);
      await sleep(100);
      data = await this.receiveFeatureReport(0x83);
      const d2 = data.getUint32(0, false);
      if (d2 !== 0x83010103 && d2 !== 0x83010312) {
        return {
          ok: false,
          code: 5,
          d1: dec2hex32(d1),
          d2: dec2hex32(d2),
          error: `DS5 Edge calibrateSticksEnd step 2 unexpected reply: 0x${dec2hex32(d2)}`,
        };
      }
      return {
        ok: true,
        status: CALIBRATION_OUTCOME_STATES.TEMP_DEVICE_CALIBRATED,
        d1: dec2hex32(d1),
        d2: dec2hex32(d2),
        edgeWarning: 'DualSense Edge calibration is active in session RAM. Permanent storage into replaceable stick modules requires hardware write-enable modification on the modules.',
      };
    }

    async calibrateRangeEnd() {
      await this.sendFeatureReport(0x82, [2, 1, 2]);
      await sleep(100);
      let data = await this.receiveFeatureReport(0x83);
      const d1 = data.getUint32(0, false);
      if (d1 !== 0x83010201) {
        return {
          ok: false,
          code: 4,
          d1: dec2hex32(d1),
          error: `DS5 Edge calibrateRangeEnd step 1 unexpected reply: 0x${dec2hex32(d1)}`,
        };
      }
      await sleep(200);
      await this.sendFeatureReport(0x82, [2, 1, 2]);
      await sleep(100);
      data = await this.receiveFeatureReport(0x83);
      const d2 = data.getUint32(0, false);
      if (d2 !== 0x83010203) {
        return {
          ok: false,
          code: 5,
          d1: dec2hex32(d1),
          d2: dec2hex32(d2),
          error: `DS5 Edge calibrateRangeEnd step 2 unexpected reply: 0x${dec2hex32(d2)}`,
        };
      }
      return {
        ok: true,
        status: CALIBRATION_OUTCOME_STATES.TEMP_DEVICE_CALIBRATED,
        d1: dec2hex32(d1),
        d2: dec2hex32(d2),
        edgeWarning: 'DualSense Edge range calibration is active in session RAM. Stock Edge modules are hardware write-protected against permanent flash unless modified.',
      };
    }

    async unlockModule(i) {
      await this.sendFeatureReport(0x80, [21, 6, i, 11]);
      await sleep(200);
      const data = await this.receiveFeatureReport(0x81);
      const ret = data.getUint32(0, false);
      if ((ret & 0xffffff00) !== 0x81150600) {
        throw new Error(`Cannot unlock DualSense Edge stick module ${i} (reply: 0x${dec2hex32(ret)})`);
      }
    }

    async lockModule(i) {
      await this.sendFeatureReport(0x80, [21, 4, i, 8]);
      await sleep(200);
      const data = await this.receiveFeatureReport(0x81);
      const ret = data.getUint32(0, false);
      if ((ret & 0xffffff00) !== 0x81150400) {
        throw new Error(`Cannot lock DualSense Edge stick module ${i} (reply: 0x${dec2hex32(ret)})`);
      }
    }

    async storeDataIntoModule(i) {
      await this.sendFeatureReport(0x80, [21, 5, i]);
      await sleep(200);
      const res = await this.receiveFeatureReport(0x81);
      const ret = res.getUint32(0, false);
      if (ret !== 0x81150502) {
        throw new Error(`DualSense Edge module ${i} rejected store command (reply: 0x${dec2hex32(ret)}). Stock modules are hardware write-protected unless physically modified.`);
      }
    }

    async flashPermanent() {
      // Unlock both stick modules (0 and 1) and NVS, copy in-memory finetune data, and lock
      for (const i of [0, 1]) {
        await this.unlockModule(i);
        await sleep(50);
      }
      const nv = await this.queryNvStatus();
      if (nv.status !== 'unlocked') {
        await this.nvsUnlock();
      }
      await sleep(50);
      const modData = await this.readFinetuneData();
      if (modData && Array.isArray(modData.words) && modData.words.length === 12) {
        await this.writeFinetuneData(modData.words);
      }
      await sleep(50);
      let moduleStoreWarning = null;
      for (const i of [0, 1]) {
        try {
          await this.storeDataIntoModule(i);
        } catch (err) {
          moduleStoreWarning = err.message;
        }
        await this.lockModule(i);
        await sleep(50);
      }
      if (nv.status === 'locked') {
        await this.nvsLock();
      }
      const postNv = await this.queryNvStatus();
      return {
        ok: !moduleStoreWarning,
        status: moduleStoreWarning
          ? CALIBRATION_OUTCOME_STATES.TEMP_DEVICE_CALIBRATED
          : CALIBRATION_OUTCOME_STATES.PERMANENT_SAVE_ACKNOWLEDGED,
        nvStatus: postNv,
        warning: moduleStoreWarning || 'DualSense Edge module flash sequence acknowledged. Reconnect and verify persistence.',
        message: moduleStoreWarning
          ? `Edge NVS updated, but stick module EEPROM rejected write (${moduleStoreWarning})`
          : 'DualSense Edge module flash command acknowledged. Reconnect to verify persistence.',
      };
    }
  }

  function createSonyAdapter(device) {
    if (!device || device.vendorId !== 0x054c) return null;
    const pid = device.productId;
    if (pid === 0x05c4 || pid === 0x09cc) return new DS4CalibrationAdapter(device);
    if (pid === 0x0ce6) return new DS5CalibrationAdapter(device);
    if (pid === 0x0df2) return new DS5EdgeCalibrationAdapter(device);
    return null;
  }

  // ─────────────────────────────────────────────────────────────
  // XBOX GIP ADAPTER BOUNDARY (Browser vs Native Transport)
  // ─────────────────────────────────────────────────────────────
  const XboxGipAdapterBoundary = {
    isXboxVid(vid) {
      return vid === 0x045e;
    },
    getProtocolSpecification() {
      return XBOX_GIP_RESEARCH;
    },
    buildReadPacket(sequence, mask) {
      const seq = (sequence & 0xff) || 1;
      const m = mask & 0x0f;
      return new Uint8Array([0x1e, 0x10, seq, 0x02, 0x0f, m]);
    },
    buildRecenterPacket(sequence, mask) {
      const seq = (sequence & 0xff) || 1;
      const m = mask & 0x0f;
      return new Uint8Array([0x1e, 0x10, seq, 0x02, 0x10, m]);
    },
    parseCalibrationResponse(bytes) {
      const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes || []);
      if (arr.length < 6 || arr[0] !== 0x1e) return null;
      const payloadLen = arr[3];
      const payload = arr.slice(4, 4 + payloadLen);
      if (payload.length === 2 && (payload[0] === 0x0f || payload[0] === 0x10) && payload[1] !== 0) {
        return { type: 'Rejected', subCommand: payload[0], code: payload[1] };
      }
      if (payload[0] === 0x10 && payload.length >= 3) {
        return { type: 'Recenter', status: payload[1], mask: payload[2] };
      }
      if (payload[0] === 0x0f && payload.length >= 3) {
        const status = payload[2];
        const result = { type: 'Read', status, left: null, right: null, leftTrigger: null, rightTrigger: null };
        let offset = 3;
        while (offset < payload.length) {
          const mask = payload[offset++];
          const size = (mask === 1 || mask === 2) ? 8 : ((mask === 4 || mask === 8) ? 5 : 0);
          if (!size || offset + size > payload.length) return null;
          const view = new DataView(payload.buffer, payload.byteOffset + offset, size);
          offset += size;
          if (mask === 1 || mask === 2) {
            const limits = {
              horizontalMin: view.getUint16(0, true),
              horizontalMax: view.getUint16(2, true),
              verticalMin: view.getUint16(4, true),
              verticalMax: view.getUint16(6, true),
            };
            if (mask === 1) result.left = limits;
            else result.right = limits;
          } else {
            const trig = {
              flag: view.getUint8(0),
              min: view.getUint16(1, true),
              max: view.getUint16(3, true),
            };
            if (mask === 4) result.leftTrigger = trig;
            else result.rightTrigger = trig;
          }
        }
        return result;
      }
      return null;
    },
  };

  // ─────────────────────────────────────────────────────────────
  // CAPABILITY DESCRIPTOR ENGINE (Section 2 & 5)
  // ─────────────────────────────────────────────────────────────
  function getCapabilities(options) {
    const opts = options || {};
    const gp = opts.gamepad !== undefined ? opts.gamepad : getActiveSessionGamepad();
    const hidDevice = opts.hidDevice !== undefined ? opts.hidDevice : state.connectedDevice;
    const verifiedInfo = opts.verifiedInfo !== undefined ? opts.verifiedInfo : state.verifiedHardwareInfo;

    const hasValidGamepad = Boolean(gp && gp.connected && gp.axes && gp.axes.length >= 4);
    const gpIdLower = gp && gp.id ? String(gp.id).toLowerCase() : '';

    // Determine controller family
    let family = 'generic';
    let vid = hidDevice ? hidDevice.vendorId : null;
    let pid = hidDevice ? hidDevice.productId : null;

    if (!vid && gpIdLower) {
      if (gpIdLower.includes('054c') || gpIdLower.includes('dualshock') || gpIdLower.includes('dualsense') || gpIdLower.includes('wireless controller')) {
        vid = 0x054c;
        if (gpIdLower.includes('0df2') || gpIdLower.includes('edge')) pid = 0x0df2;
        else if (gpIdLower.includes('0ce6') || gpIdLower.includes('dualsense')) pid = 0x0ce6;
        else if (gpIdLower.includes('09cc')) pid = 0x09cc;
        else if (gpIdLower.includes('05c4') || gpIdLower.includes('dualshock 4')) pid = 0x05c4;
      } else if (gpIdLower.includes('045e') || gpIdLower.includes('xbox') || gpIdLower.includes('xinput')) {
        vid = 0x045e;
        if (gpIdLower.includes('0b12') || gpIdLower.includes('0b13') || gpIdLower.includes('series')) pid = 0x0b12;
        else if (gpIdLower.includes('02ea')) pid = 0x02ea;
        else if (gpIdLower.includes('02dd') || gpIdLower.includes('02d1')) pid = 0x02dd;
      }
    }

    const lookupKey = (vid && pid)
      ? `${vid.toString(16).padStart(4, '0')}:${pid.toString(16).padStart(4, '0')}`.toLowerCase()
      : '';
    const known = KNOWN_VID_PIDS[lookupKey] || null;
    if (known) family = known.family;

    const isSony = vid === 0x054c && (pid === 0x05c4 || pid === 0x09cc || pid === 0x0ce6 || pid === 0x0df2);
    const isXbox = vid === 0x045e || gpIdLower.includes('xbox') || gpIdLower.includes('xinput');

    // Check WebHID USB transport readiness for Sony
    let sonyUsbReady = false;
    let sonyTransportReason = 'Connect controller via USB and click "Inspect / Connect WebHID" to enable hardware calibration.';

    if (isSony && hidDevice && hidDevice.opened) {
      const adapter = createSonyAdapter(hidDevice);
      const collections = Array.isArray(hidDevice.collections) ? hidDevice.collections : [];
      let totalInputReports = 0;
      let totalFeatureReports = 0;
      for (let i = 0; i < collections.length; i++) {
        if (Array.isArray(collections[i].inputReports)) totalInputReports += collections[i].inputReports.length;
        if (Array.isArray(collections[i].featureReports)) totalFeatureReports += collections[i].featureReports.length;
      }
      const isLikelyBluetooth = totalInputReports > 1 && totalFeatureReports === 0;
      if (isLikelyBluetooth || (adapter && !adapter.supportsCalibrationDescriptor())) {
        sonyUsbReady = false;
        sonyTransportReason = 'Controller is connected via Bluetooth or missing USB feature reports. Connect via USB cable for hardware calibration.';
      } else if (verifiedInfo && verifiedInfo.isClone) {
        sonyUsbReady = false;
        sonyTransportReason = verifiedInfo.reason || 'Device failed Sony feature report verification (possible third-party clone). Hardware writes disabled for safety.';
      } else {
        sonyUsbReady = true;
        sonyTransportReason = 'Supported via Sony USB WebHID feature reports.';
      }
    } else if (isXbox) {
      if (family === 'xboxone-s') {
        sonyTransportReason = 'Xbox One S (045e:02ea) firmware 5.22 rejects GIP calibration command 0x1e with [0x0f, 0x01], and Xbox GIP interface FF:47:D0 is not accessible via browser WebHID.';
      } else if (family === 'xboxseries') {
        sonyTransportReason = 'Xbox Series X|S (045e:0b12, fw ≥5.19.3221.0) uses GIP command 0x1e over vendor USB interface FF:47:D0 (endpoints 0x82/0x02), which browser WebHID cannot access without a native USB helper (xboxctl / Xbox Accessories app).';
      } else {
        sonyTransportReason = 'Xbox controllers use XInput/GIP interfaces not exposed to browser WebHID. Only input diagnostics and local software preview are available in browser.';
      }
    } else if (!isSony) {
      sonyTransportReason = 'No verified vendor WebHID calibration protocol exists for this controller model.';
    }

    const canReadInput = hasValidGamepad || Boolean(hidDevice && hidDevice.opened);
    const canMeasureCenter = hasValidGamepad;
    const canMeasureRange = hasValidGamepad;
    const canPreviewSoftwareCorrection = hasValidGamepad;
    const canCalibrateDeviceCenter = Boolean(isSony && sonyUsbReady);
    const canCalibrateDeviceRange = Boolean(isSony && sonyUsbReady);
    const canSaveCalibration = Boolean(isSony && sonyUsbReady);
    const canReadCalibrationBackup = Boolean(isSony && sonyUsbReady && (pid === 0x0ce6 || pid === 0x0df2));

    const reasons = {
      canReadInput: canReadInput ? 'Available via W3C Gamepad API / WebHID.' : 'No connected controller with valid analog axes detected.',
      canMeasureCenter: canMeasureCenter ? 'Statistical resting center measurement available.' : 'Connect a controller with 4 analog stick axes.',
      canMeasureRange: canMeasureRange ? '360° angular coverage and extrema measurement available.' : 'Connect a controller with 4 analog stick axes.',
      canPreviewSoftwareCorrection: canPreviewSoftwareCorrection ? 'Local browser software correction preview available (does not alter raw diagnostics or console/game input).' : 'Connect a controller first.',
      canCalibrateDeviceCenter: canCalibrateDeviceCenter ? sonyTransportReason : sonyTransportReason,
      canCalibrateDeviceRange: canCalibrateDeviceRange ? sonyTransportReason : sonyTransportReason,
      canSaveCalibration: canSaveCalibration
        ? (pid === 0x0df2
          ? 'DualSense Edge NVS + module flash available, but stock stick modules have hardware write-protection unless physically modified.'
          : 'Permanent NVS flash (unlock + lock) available via opt-in command.')
        : sonyTransportReason,
      canReadCalibrationBackup: canReadCalibrationBackup
        ? '12-word finetune calibration data readout available via feature report 0x80/0x81.'
        : (isSony && (pid === 0x05c4 || pid === 0x09cc)
          ? 'DualShock 4 firmware does not expose a feature report to read back existing stick calibration values.'
          : sonyTransportReason),
    };

    return {
      family,
      vid,
      pid,
      canReadInput,
      canMeasureCenter,
      canMeasureRange,
      canPreviewSoftwareCorrection,
      canCalibrateDeviceCenter,
      canCalibrateDeviceRange,
      canSaveCalibration,
      canReadCalibrationBackup,
      reasons,
    };
  }

  // ─────────────────────────────────────────────────────────────
  // SESSION & ACTIVE CONTROLLER ACCESS (Fixes Defects H & I)
  // ─────────────────────────────────────────────────────────────
  function getActiveSessionGamepad() {
    if (typeof window !== 'undefined' && window.GamepadSessionAPI && typeof window.GamepadSessionAPI.getActiveGamepad === 'function') {
      return window.GamepadSessionAPI.getActiveGamepad();
    }
    if (typeof navigator !== 'undefined' && typeof navigator.getGamepads === 'function') {
      const gps = navigator.getGamepads();
      if (typeof window !== 'undefined' && window.state && typeof window.state.activeGpIndex === 'number' && window.state.activeGpIndex >= 0) {
        return gps[window.state.activeGpIndex] || null;
      }
    }
    return null;
  }

  function getActiveUnitIdentifier() {
    if (typeof window !== 'undefined' && window.GamepadSessionAPI && typeof window.GamepadSessionAPI.getUnitIdentifier === 'function') {
      return window.GamepadSessionAPI.getUnitIdentifier();
    }
    if (typeof document !== 'undefined') {
      const skuEl = document.getElementById('batch-sku-input');
      const itemEl = document.getElementById('item-code-input');
      const val = (skuEl && skuEl.value ? skuEl.value.trim() : '') || (itemEl && itemEl.value ? itemEl.value.trim() : '');
      return val || null;
    }
    return null;
  }

  function setSessionOperationLock(locked, reason) {
    if (typeof window !== 'undefined' && window.GamepadSessionAPI && typeof window.GamepadSessionAPI.setOperationLock === 'function') {
      window.GamepadSessionAPI.setOperationLock(locked, reason);
    }
  }

  function isOperationLocked() {
    return Boolean(
      _commandLock ||
      state.mode1.status === 'SAMPLING' ||
      state.mode2.samplingStep ||
      state.hardwareCalib.rangeInProgress ||
      state.hardwareCalib.centerInProgress
    );
  }

  function updateSessionLockFromState() {
    const locked = isOperationLocked();
    setSessionOperationLock(locked, locked ? 'Calibration in progress' : null);
  }

  // ─────────────────────────────────────────────────────────────
  // MODULE STATE
  // ─────────────────────────────────────────────────────────────
  function createInitialState() {
    return {
      envSupported: false,
      secureContext: true,
      connectedDevice: null,
      activeAdapter: null,
      verifiedHardwareInfo: null,
      linkedGamepadIndex: null,
      pairingAmbiguous: false,
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
      activeMode: 'MODE_1', // 'MODE_1' (Quick Center) | 'MODE_2' (Guided Endpoint) | 'MODE_HW' (Sony Device Calibration)
      outcomeTracker: {
        measurements: CALIBRATION_OUTCOME_STATES.NONE,
        softwareProfile: CALIBRATION_OUTCOME_STATES.NONE,
        tempDeviceCalib: CALIBRATION_OUTCOME_STATES.NONE,
        permanentSaveAck: CALIBRATION_OUTCOME_STATES.NONE,
        persistenceVerified: CALIBRATION_OUTCOME_STATES.NONE,
      },
      hardwareCalib: {
        centerInProgress: false,
        rangeInProgress: false,
        lastActionStatus: 'Idle',
        lastError: null,
        nvStatus: null,
        preCalibFinetune: null,
        postCalibFinetune: null,
        permanentOptInConfirmed: false,
        temporaryCompleted: false,
        permanentAcknowledged: false,
        persistenceVerifiedAfterReconnect: false,
      },
      mode1: {
        status: 'IDLE', // 'IDLE' | 'SAMPLING' | 'COMPLETED' | 'ERROR'
        samples: [],
        targetSamples: 60,
        beforeCenters: { lx: 0, ly: 0, rx: 0, ry: 0 },
        measuredCenters: null,
        dispersion: null,
        savedSoftwareProfile: false,
        firmwareWritePerformed: false,
        message: 'Leave both sticks untouched in resting position and click Start Center Measurement.',
      },
      mode2: {
        currentStep: 1, // 1..7
        samplingStep: false,
        stepSamples: [],
        targetStepSamples: 35,
        stepError: null,
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
   * Inspects a WebHID device descriptor without sending arbitrary commands.
   */
  function inspectHidDeviceDescriptor(device, verifiedInfo) {
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

    let connectionType = 'Not reliably determinable from descriptor alone';
    let isUsbSony = false;
    if (known && known.sonyAdapter) {
      if (totalFeatureReports > 0 && totalInputReports === 1) {
        connectionType = 'USB HID Composite (Direct USB)';
        isUsbSony = true;
      } else if (totalInputReports > 1) {
        connectionType = 'Bluetooth HID Multi-Report (Wireless)';
        isUsbSony = false;
      } else if (device.opened) {
        connectionType = 'USB / Direct WebHID';
        isUsbSony = true;
      }
    }

    let identificationStatus = VERIFICATION_STATUSES.IDENTIFIED;
    let protocolStatus = VERIFICATION_STATUSES.PROTOCOL_UNSUPPORTED;
    let supportedOperations = 'Read-Only HID Inspection + Local Software Calibration Preview';
    let evidenceNote = '';

    if (vid === 0x054c) {
      if (known && known.sonyAdapter) {
        if (totalFeatureReports === 0 && collections.length > 0) {
          identificationStatus = VERIFICATION_STATUSES.POSSIBLE_REPLICA;
          protocolStatus = VERIFICATION_STATUSES.PROTOCOL_UNSUPPORTED;
          evidenceNote = `VID 0x054C (${known.model}) detected, but HID descriptor exposes 0 feature reports. Technical indicator: third-party clones or Bluetooth-only modes omit USB calibration feature reports.`;
        } else if (verifiedInfo && verifiedInfo.isClone) {
          identificationStatus = VERIFICATION_STATUSES.POSSIBLE_REPLICA;
          protocolStatus = VERIFICATION_STATUSES.REPORT_READ_ERROR;
          evidenceNote = verifiedInfo.reason;
        } else if (!isUsbSony && totalInputReports > 1) {
          protocolStatus = VERIFICATION_STATUSES.PROTOCOL_BLUETOOTH_READONLY;
          evidenceNote = `${known.model} detected via Bluetooth HID. Connect via USB cable to enable Sony WebHID device center/range calibration.`;
        } else {
          protocolStatus = VERIFICATION_STATUSES.PROTOCOL_SUPPORTED_SONY_USB;
          supportedOperations = known.sonyAdapter === 'DS5_Edge'
            ? 'Sony USB Device Calibration (Center & Range in RAM) + Module/NVS Flash (Stock Edge modules write-protected)'
            : 'Sony USB Device Calibration (Temporary RAM Center & Range + Opt-In Permanent NVS Flash)';
          const serialStr = verifiedInfo && verifiedInfo.serialNumber ? ` | Serial/MAC: ${verifiedInfo.serialNumber}` : '';
          const nvStr = verifiedInfo && verifiedInfo.nvStatus && verifiedInfo.nvStatus.status ? ` | NVS: ${verifiedInfo.nvStatus.status.toUpperCase()}` : '';
          evidenceNote = `${known.vendor} — ${known.model}${serialStr}${nvStr}. Genuine Sony USB feature report calibration supported.`;
        }
      } else {
        identificationStatus = VERIFICATION_STATUSES.AUTH_UNVERIFIED;
        evidenceNote = `Sony Vendor ID (0x054C) with Product ID (${pidHex}) without a supported WebHID calibration adapter.`;
      }
    } else if (vid === 0x045e) {
      protocolStatus = VERIFICATION_STATUSES.PROTOCOL_XBOX_GIP_BOUNDARY;
      evidenceNote = XBOX_GIP_RESEARCH.browserFeasibility.explanation;
    } else {
      identificationStatus = hasGamepadCollection ? VERIFICATION_STATUSES.IDENTIFIED : VERIFICATION_STATUSES.AUTH_UNVERIFIED;
      evidenceNote = `Generic/Third-Party HID device (${vidHex}:${pidHex}). Hardware firmware calibration protocol not supported; local browser software correction preview is available.`;
    }

    return {
      deviceName: device.productName || (known ? known.model : 'HID Controller'),
      vidHex,
      pidHex,
      interfaceStatus: device.opened ? 'Connected & Opened (WebHID)' : (hasGamepadCollection ? 'HID Gamepad Collection Detected' : 'Unsupported / Custom HID Interface'),
      connectionType,
      supportedOperations,
      protocolStatus,
      identificationStatus,
      evidenceNote,
      lastError: null,
    };
  }

  /**
   * Requests a WebHID device using the browser's official chooser, opens it,
   * runs Sony genuine feature-report verification if applicable, and checks for
   * post-reconnect persistence verification if a previous calibration audit exists.
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
          { vendorId: 0x054c, productId: 0x05c4 }, // DualShock 4 v1
          { vendorId: 0x054c, productId: 0x09cc }, // DualShock 4 v2
          { vendorId: 0x054c, productId: 0x0ce6 }, // DualSense
          { vendorId: 0x054c, productId: 0x0df2 }, // DualSense Edge
          { usagePage: 0x01, usage: 0x05 },        // Standard Gamepad
          { usagePage: 0x01, usage: 0x04 },        // Standard Joystick
        ]
      });

      if (!devices || devices.length === 0) {
        state.deviceInfo.lastError = 'Device chooser cancelled by user. Existing Gamepad API testing remains active.';
        renderUI();
        return { ok: false, reason: 'USER_CANCELLED', info: state.deviceInfo };
      }

      const device = devices[0];
      if (state.connectedDevice && state.connectedDevice !== device && state.connectedDevice.opened) {
        try { await state.connectedDevice.close(); } catch (_) {}
      }

      if (!device.opened) {
        try {
          await device.open();
        } catch (openErr) {
          state.connectedDevice = device;
          state.activeAdapter = null;
          state.deviceInfo = inspectHidDeviceDescriptor(device);
          state.deviceInfo.protocolStatus = VERIFICATION_STATUSES.REPORT_READ_ERROR;
          state.deviceInfo.lastError = `Could not open WebHID interface (${openErr.message || 'Access denied by OS'}). Gamepad API remains operational.`;
          renderUI();
          return { ok: false, reason: 'OPEN_ERROR', info: state.deviceInfo };
        }
      }

      state.connectedDevice = device;
      state.activeAdapter = createSonyAdapter(device);
      state.verifiedHardwareInfo = null;

      if (state.activeAdapter && state.activeAdapter.supportsCalibrationDescriptor()) {
        const vInfo = await state.activeAdapter.verifyGenuineAndInfo();
        state.verifiedHardwareInfo = vInfo;
        if (vInfo.ok) {
          state.hardwareCalib.nvStatus = vInfo.nvStatus || null;
          if (vInfo.finetuneBackup) {
            state.hardwareCalib.preCalibFinetune = vInfo.finetuneBackup;
            checkPostReconnectPersistence(vInfo);
          }
        }
      }

      state.deviceInfo = inspectHidDeviceDescriptor(device, state.verifiedHardwareInfo);
      resolveGamepadHidPairing(device);
      renderUI();
      return {
        ok: true,
        reason: 'CONNECTED',
        info: state.deviceInfo,
        capabilities: getCapabilities(),
      };
    } catch (err) {
      const isCancel = err && (err.name === 'NotAllowedError' || String(err.message || '').toLowerCase().includes('cancel'));
      state.deviceInfo.lastError = isCancel
        ? 'Device chooser cancelled by user. Gamepad API remains operational.'
        : `WebHID communication error: ${err && err.message ? err.message : 'Unknown error'}`;
      renderUI();
      return { ok: false, reason: isCancel ? 'USER_CANCELLED' : 'COMMUNICATION_ERROR', info: state.deviceInfo };
    }
  }

  function resolveGamepadHidPairing(hidDevice) {
    const gps = (typeof navigator !== 'undefined' && navigator.getGamepads) ? Array.from(navigator.getGamepads()).filter(Boolean) : [];
    const activeGp = getActiveSessionGamepad();
    if (!hidDevice || gps.length === 0) {
      state.linkedGamepadIndex = activeGp ? activeGp.index : null;
      state.pairingAmbiguous = false;
      return;
    }
    const vidHex = (hidDevice.vendorId || 0).toString(16).padStart(4, '0').toLowerCase();
    const pidHex = (hidDevice.productId || 0).toString(16).padStart(4, '0').toLowerCase();
    const matchingGps = gps.filter((g) => {
      const id = String(g.id || '').toLowerCase();
      return id.includes(vidHex) && id.includes(pidHex);
    });

    if (matchingGps.length > 1) {
      state.pairingAmbiguous = true;
      state.linkedGamepadIndex = activeGp ? activeGp.index : matchingGps[0].index;
    } else if (matchingGps.length === 1) {
      state.pairingAmbiguous = false;
      state.linkedGamepadIndex = matchingGps[0].index;
    } else {
      state.pairingAmbiguous = gps.length > 1;
      state.linkedGamepadIndex = activeGp ? activeGp.index : null;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // SONY HARDWARE CALIBRATION OPERATIONS (Center, Range, Permanent Flash, Reconnect Check)
  // ─────────────────────────────────────────────────────────────
  async function runHardwareCenterCalibration() {
    const caps = getCapabilities();
    if (!caps.canCalibrateDeviceCenter || !state.activeAdapter) {
      state.hardwareCalib.lastError = caps.reasons.canCalibrateDeviceCenter;
      state.outcomeTracker.tempDeviceCalib = CALIBRATION_OUTCOME_STATES.FAILED;
      renderUI();
      return { ok: false, reason: 'CAPABILITY_UNAVAILABLE', error: caps.reasons.canCalibrateDeviceCenter };
    }

    return await runSerializedHardwareOp('Device Stick Center Calibration', async () => {
      state.hardwareCalib.centerInProgress = true;
      state.hardwareCalib.lastError = null;
      state.hardwareCalib.lastActionStatus = 'Running Sony device stick center calibration (Begin -> Sample -> End)...';
      renderUI();

      try {
        if (typeof state.activeAdapter.readFinetuneData === 'function') {
          state.hardwareCalib.preCalibFinetune = await state.activeAdapter.readFinetuneData();
        }

        const beginRes = await state.activeAdapter.calibrateSticksBegin();
        if (!beginRes.ok) {
          throw new Error(beginRes.error || 'calibrateSticksBegin failed');
        }

        // Perform 4 resting center samples as in dualshock-tools CalibCenterModal
        for (let i = 0; i < 4; i++) {
          await sleep(120);
          const sampleRes = await state.activeAdapter.calibrateSticksSample();
          if (!sampleRes.ok) {
            throw new Error(sampleRes.error || `calibrateSticksSample failed at step ${i + 1}`);
          }
        }

        await sleep(150);
        const endRes = await state.activeAdapter.calibrateSticksEnd();
        if (!endRes.ok) {
          throw new Error(endRes.error || 'calibrateSticksEnd failed');
        }

        if (typeof state.activeAdapter.readFinetuneData === 'function') {
          state.hardwareCalib.postCalibFinetune = await state.activeAdapter.readFinetuneData();
        }
        state.hardwareCalib.nvStatus = await state.activeAdapter.queryNvStatus();
        state.hardwareCalib.centerInProgress = false;
        state.hardwareCalib.temporaryCompleted = true;
        state.hardwareCalib.lastActionStatus = endRes.edgeWarning || 'Temporary device center calibration completed in controller RAM.';
        state.outcomeTracker.tempDeviceCalib = CALIBRATION_OUTCOME_STATES.TEMP_DEVICE_CALIBRATED;
        renderUI();
        return {
          ok: true,
          status: CALIBRATION_OUTCOME_STATES.TEMP_DEVICE_CALIBRATED,
          preCalibFinetune: state.hardwareCalib.preCalibFinetune,
          postCalibFinetune: state.hardwareCalib.postCalibFinetune,
          nvStatus: state.hardwareCalib.nvStatus,
        };
      } catch (err) {
        state.hardwareCalib.centerInProgress = false;
        state.hardwareCalib.lastError = err.message || String(err);
        state.hardwareCalib.lastActionStatus = 'Device center calibration failed.';
        state.outcomeTracker.tempDeviceCalib = CALIBRATION_OUTCOME_STATES.FAILED;
        renderUI();
        return { ok: false, reason: 'DEVICE_COMMAND_FAILED', error: state.hardwareCalib.lastError };
      }
    });
  }

  async function startHardwareRangeCalibration() {
    const caps = getCapabilities();
    if (!caps.canCalibrateDeviceRange || !state.activeAdapter) {
      state.hardwareCalib.lastError = caps.reasons.canCalibrateDeviceRange;
      renderUI();
      return { ok: false, reason: 'CAPABILITY_UNAVAILABLE', error: caps.reasons.canCalibrateDeviceRange };
    }

    return await runSerializedHardwareOp('Device Stick Range Calibration Begin', async () => {
      state.hardwareCalib.lastError = null;
      if (typeof state.activeAdapter.readFinetuneData === 'function') {
        state.hardwareCalib.preCalibFinetune = await state.activeAdapter.readFinetuneData();
      }
      const res = await state.activeAdapter.calibrateRangeBegin();
      if (!res.ok) {
        state.hardwareCalib.rangeInProgress = false;
        state.hardwareCalib.lastError = res.error || 'calibrateRangeBegin failed';
        state.outcomeTracker.tempDeviceCalib = CALIBRATION_OUTCOME_STATES.FAILED;
        renderUI();
        return { ok: false, reason: 'DEVICE_COMMAND_FAILED', error: state.hardwareCalib.lastError };
      }
      state.hardwareCalib.rangeInProgress = true;
      state.hardwareCalib.lastActionStatus = 'Controller is now sampling stick range. Rotate both sticks in full circles, then click Finish Device Range Calibration.';
      renderUI();
      return { ok: true, status: 'RANGE_SAMPLING_ACTIVE' };
    });
  }

  async function finishHardwareRangeCalibration() {
    if (!state.activeAdapter || !state.hardwareCalib.rangeInProgress) {
      return { ok: false, reason: 'RANGE_NOT_STARTED', error: 'Range calibration has not been started.' };
    }

    return await runSerializedHardwareOp('Device Stick Range Calibration End', async () => {
      try {
        const res = await state.activeAdapter.calibrateRangeEnd();
        state.hardwareCalib.rangeInProgress = false;
        if (!res.ok) {
          state.hardwareCalib.lastError = res.error || 'calibrateRangeEnd failed';
          state.outcomeTracker.tempDeviceCalib = CALIBRATION_OUTCOME_STATES.FAILED;
          renderUI();
          return { ok: false, reason: 'DEVICE_COMMAND_FAILED', error: state.hardwareCalib.lastError };
        }
        if (typeof state.activeAdapter.readFinetuneData === 'function') {
          state.hardwareCalib.postCalibFinetune = await state.activeAdapter.readFinetuneData();
        }
        state.hardwareCalib.nvStatus = await state.activeAdapter.queryNvStatus();
        state.hardwareCalib.temporaryCompleted = true;
        state.hardwareCalib.lastActionStatus = res.edgeWarning || 'Temporary device range calibration completed in controller RAM.';
        state.outcomeTracker.tempDeviceCalib = CALIBRATION_OUTCOME_STATES.TEMP_DEVICE_CALIBRATED;
        renderUI();
        return {
          ok: true,
          status: CALIBRATION_OUTCOME_STATES.TEMP_DEVICE_CALIBRATED,
          postCalibFinetune: state.hardwareCalib.postCalibFinetune,
        };
      } catch (err) {
        state.hardwareCalib.rangeInProgress = false;
        state.hardwareCalib.lastError = err.message || String(err);
        state.outcomeTracker.tempDeviceCalib = CALIBRATION_OUTCOME_STATES.FAILED;
        renderUI();
        return { ok: false, reason: 'DEVICE_COMMAND_FAILED', error: state.hardwareCalib.lastError };
      }
    });
  }

  async function saveCalibrationPermanentlyToDevice(explicitUserConsent) {
    const consent = explicitUserConsent !== undefined ? Boolean(explicitUserConsent) : state.hardwareCalib.permanentOptInConfirmed;
    if (!consent) {
      return {
        ok: false,
        reason: 'CONSENT_REQUIRED',
        error: 'Permanent NVS write requires explicit user opt-in confirmation.',
      };
    }
    if (!state.hardwareCalib.temporaryCompleted) {
      return {
        ok: false,
        reason: 'PREREQUISITE_NOT_MET',
        error: 'Run temporary device center or range calibration before flashing permanent NVS.',
      };
    }
    const caps = getCapabilities();
    if (!caps.canSaveCalibration || !state.activeAdapter) {
      return {
        ok: false,
        reason: 'CAPABILITY_UNAVAILABLE',
        error: caps.reasons.canSaveCalibration,
      };
    }

    return await runSerializedHardwareOp('Permanent NVS Save', async () => {
      const res = await state.activeAdapter.flashPermanent();
      state.hardwareCalib.nvStatus = res.nvStatus || state.hardwareCalib.nvStatus;
      if (!res.ok) {
        state.hardwareCalib.lastError = res.error || res.warning || 'Permanent NVS save failed.';
        state.outcomeTracker.permanentSaveAck = CALIBRATION_OUTCOME_STATES.FAILED;
        renderUI();
        return { ok: false, reason: 'FLASH_FAILED', error: state.hardwareCalib.lastError, details: res };
      }

      state.hardwareCalib.permanentAcknowledged = true;
      state.mode1.firmwareWritePerformed = true;
      state.outcomeTracker.permanentSaveAck = CALIBRATION_OUTCOME_STATES.PERMANENT_SAVE_ACKNOWLEDGED;
      state.outcomeTracker.persistenceVerified = 'Pending disconnect & reconnect verification';
      state.hardwareCalib.lastActionStatus = `${res.message} Unplug and reconnect the controller via USB, then click "Inspect WebHID Device" to verify persistence across power cycle.`;

      saveHardwareAuditRecord({
        serialNumber: state.verifiedHardwareInfo ? state.verifiedHardwareInfo.serialNumber : null,
        model: state.activeAdapter.model,
        finetuneWords: state.hardwareCalib.postCalibFinetune ? state.hardwareCalib.postCalibFinetune.words : null,
        timestamp: new Date().toISOString(),
      });

      renderUI();
      return {
        ok: true,
        status: CALIBRATION_OUTCOME_STATES.PERMANENT_SAVE_ACKNOWLEDGED,
        nvStatus: state.hardwareCalib.nvStatus,
      };
    });
  }

  function saveHardwareAuditRecord(record) {
    try {
      if (typeof localStorage !== 'undefined' && record) {
        localStorage.setItem(STORAGE_KEY_HW_AUDIT, JSON.stringify(record));
      }
    } catch (_) {}
  }

  function checkPostReconnectPersistence(verifiedInfo) {
    try {
      if (typeof localStorage === 'undefined' || !verifiedInfo || !verifiedInfo.finetuneBackup) return false;
      const raw = localStorage.getItem(STORAGE_KEY_HW_AUDIT);
      if (!raw) return false;
      const saved = JSON.parse(raw);
      if (!saved || !Array.isArray(saved.finetuneWords)) return false;
      if (saved.serialNumber && verifiedInfo.serialNumber && saved.serialNumber !== verifiedInfo.serialNumber) {
        return false;
      }
      const currentWords = verifiedInfo.finetuneBackup.words;
      if (!Array.isArray(currentWords) || currentWords.length !== 12) return false;
      const matches = saved.finetuneWords.every((w, idx) => w === currentWords[idx]);
      if (matches) {
        state.hardwareCalib.persistenceVerifiedAfterReconnect = true;
        state.outcomeTracker.persistenceVerified = CALIBRATION_OUTCOME_STATES.PERSISTENCE_VERIFIED_RECONNECT;
        state.hardwareCalib.lastActionStatus = '✓ Persistence verified after reconnect: 12-word finetune calibration data matches stored NVS values.';
        return true;
      }
    } catch (_) {}
    return false;
  }

  // ─────────────────────────────────────────────────────────────
  // STATISTICAL HELPERS & DIRECTIONAL / RANGE VALIDATION (Fixes Defects B, C, D, E)
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

  /**
   * Validates directional corner step samples relative to measured center (Fixes Defect B).
   * Prevents neutral (0,0) samples or wrong quadrants from passing as a corner!
   */
  function validateGuidedStepSamples(stepNum, samples, restCenter) {
    if (!Array.isArray(samples) || samples.length < state.mode2.targetStepSamples) {
      return { ok: false, reason: 'INSUFFICIENT_SAMPLES', error: `Insufficient samples (${samples ? samples.length : 0}/${state.mode2.targetStepSamples}).` };
    }

    const lxMed = median(samples.map((s) => s.lx));
    const lyMed = median(samples.map((s) => s.ly));
    const rxMed = median(samples.map((s) => s.rx));
    const ryMed = median(samples.map((s) => s.ry));

    const lxDisp = computeDispersion(samples.map((s) => s.lx));
    const lyDisp = computeDispersion(samples.map((s) => s.ly));
    const rxDisp = computeDispersion(samples.map((s) => s.rx));
    const ryDisp = computeDispersion(samples.map((s) => s.ry));
    const maxP2P = Math.max(lxDisp.peakToPeak, lyDisp.peakToPeak, rxDisp.peakToPeak, ryDisp.peakToPeak);

    if (stepNum === 1) {
      // Step 1: Resting Center
      if (Math.hypot(lxMed, lyMed) > 0.45 || Math.hypot(rxMed, ryMed) > 0.45) {
        return {
          ok: false,
          reason: 'REST_DISPLACEMENT_TOO_HIGH',
          error: 'Sticks are deflected too far from neutral during resting center step. Leave both sticks untouched.',
        };
      }
      if (maxP2P > 0.12) {
        return {
          ok: false,
          reason: 'REST_UNSTABLE',
          error: `Excessive movement during rest capture (peak-to-peak: ${maxP2P.toFixed(3)} > 0.120). Hold sticks untouched.`,
        };
      }
      return { ok: true, lx: lxMed, ly: lyMed, rx: rxMed, ry: ryMed, maxPeakToPeak: maxP2P };
    }

    // Steps 2..5: Directional Corners relative to Step 1 center
    const cxL = restCenter ? (restCenter.lx || 0) : 0;
    const cyL = restCenter ? (restCenter.ly || 0) : 0;
    const cxR = restCenter ? (restCenter.rx || 0) : 0;
    const cyR = restCenter ? (restCenter.ry || 0) : 0;

    const dxL = lxMed - cxL;
    const dyL = lyMed - cyL;
    const dxR = rxMed - cxR;
    const dyR = ryMed - cyR;

    const magL = Math.hypot(dxL, dyL);
    const magR = Math.hypot(dxR, dyR);
    const MIN_CORNER_AXIS = 0.35;
    const MIN_CORNER_MAG = 0.55;

    if (magL < MIN_CORNER_MAG || magR < MIN_CORNER_MAG) {
      return {
        ok: false,
        reason: 'INSUFFICIENT_DEFLECTION',
        error: `Insufficient stick deflection (L: ${magL.toFixed(2)}, R: ${magR.toFixed(2)}; required ≥ ${MIN_CORNER_MAG}). Push both sticks firmly into the requested corner.`,
      };
    }

    const checkDir = (dx, dy) => {
      if (stepNum === 2) return dx <= -MIN_CORNER_AXIS && dy <= -MIN_CORNER_AXIS; // UP_LEFT (NW)
      if (stepNum === 3) return dx >= MIN_CORNER_AXIS && dy <= -MIN_CORNER_AXIS;  // UP_RIGHT (NE)
      if (stepNum === 4) return dx >= MIN_CORNER_AXIS && dy >= MIN_CORNER_AXIS;   // DOWN_RIGHT (SE)
      if (stepNum === 5) return dx <= -MIN_CORNER_AXIS && dy >= MIN_CORNER_AXIS;  // DOWN_LEFT (SW)
      return false;
    };

    if (!checkDir(dxL, dyL) || !checkDir(dxR, dyR)) {
      const stepMeta = GUIDED_STEPS.find((s) => s.id === stepNum);
      return {
        ok: false,
        reason: 'WRONG_DIRECTION',
        error: `Measured position (L: ${dxL.toFixed(2)}, ${dyL.toFixed(2)} | R: ${dxR.toFixed(2)}, ${dyR.toFixed(2)}) does not match ${stepMeta ? stepMeta.title : 'requested corner'}.`,
      };
    }

    return { ok: true, lx: lxMed, ly: lyMed, rx: rxMed, ry: ryMed, maxPeakToPeak: maxP2P };
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
    updateSessionLockFromState();
    renderUI();
  }

  /**
   * Confirms and saves Mode 1 Quick Center software profile.
   * Enforces completion prerequisites, valid active gamepad, and verified storage write (Fixes Defects C, D, H).
   */
  function confirmMode1Profile(gp, storageObj) {
    if (state.mode1.status !== 'COMPLETED' || !state.mode1.measuredCenters) {
      state.mode1.message = '✕ Complete center measurement before confirming the software profile.';
      renderUI();
      return false;
    }

    const targetGp = gp || getActiveSessionGamepad();
    if (!targetGp || !targetGp.connected || !targetGp.axes || targetGp.axes.length < 4) {
      state.mode1.savedSoftwareProfile = false;
      state.mode1.message = '✕ Cannot save profile: no valid connected controller selected.';
      renderUI();
      return false;
    }

    let storedRecord = null;
    const unitId = getActiveUnitIdentifier();
    const hwSerial = state.verifiedHardwareInfo ? state.verifiedHardwareInfo.serialNumber : null;

    if (typeof root !== 'undefined' && root.StickCenterCalibration && root.StickCenterCalibration.CalibrationProfileStore) {
      storedRecord = root.StickCenterCalibration.CalibrationProfileStore.saveProfileForGamepad(
        targetGp,
        {
          ok: true,
          sampleCount: state.mode1.samples.length,
          maxJitter: state.mode1.dispersion ? state.mode1.dispersion.maxPeakToPeak : 0,
          centers: state.mode1.measuredCenters,
          means: state.mode1.measuredCenters,
          unitId,
          hardwareSerial: hwSerial,
        },
        storageObj
      );
    } else {
      // Standalone storage write when StickCenterCalibration is not loaded in unit tests
      const store = storageObj || (typeof localStorage !== 'undefined' ? localStorage : null);
      if (store && typeof store.setItem === 'function') {
        try {
          const payload = {
            version: ENDPOINT_SCHEMA_VERSION,
            savedAt: new Date().toISOString(),
            deviceId: String(targetGp.id || '').trim(),
            unitId: unitId || null,
            hardwareSerial: hwSerial || null,
            centers: state.mode1.measuredCenters,
          };
          store.setItem('gamepad_tester_mode1_center_v2', JSON.stringify(payload));
          storedRecord = payload;
        } catch (_) {
          storedRecord = null;
        }
      }
    }

    if (!storedRecord) {
      state.mode1.savedSoftwareProfile = false;
      state.mode1.message = '✕ Could not save browser software profile (localStorage unavailable or write failed).';
      renderUI();
      return false;
    }

    state.mode1.savedSoftwareProfile = true;
    state.mode1.firmwareWritePerformed = false;
    state.outcomeTracker.measurements = CALIBRATION_OUTCOME_STATES.MEASUREMENTS_COMPLETED;
    state.outcomeTracker.softwareProfile = CALIBRATION_OUTCOME_STATES.BROWSER_PROFILE_SAVED;
    state.mode1.message = '✓ Browser software profile saved locally. Controller hardware memory (NVS/EEPROM) was NOT modified.';
    renderUI();
    return true;
  }

  // ─────────────────────────────────────────────────────────────
  // MODE 2: 7-STEP GUIDED ENDPOINT CALIBRATION ASSISTANT
  // ─────────────────────────────────────────────────────────────
  function startGuidedStepCapture(stepNum) {
    const s = stepNum || state.mode2.currentStep;
    if (s < 1 || s > 6) return false;
    if (s > 1 && !state.mode2.stepData[1].completed) {
      state.mode2.stepError = 'Complete Step 1 (Resting Center) first so directional corners are validated relative to your controller’s resting center.';
      renderUI();
      return false;
    }
    state.mode2.currentStep = s;
    state.mode2.samplingStep = true;
    state.mode2.stepSamples = [];
    state.mode2.stepError = null;
    if (s === 6) {
      state.mode2.stepData[6].sectorsL = new Array(36).fill(null);
      state.mode2.stepData[6].sectorsR = new Array(36).fill(null);
      state.mode2.stepData[6].boundsL = { minX: 0, maxX: 0, minY: 0, maxY: 0 };
      state.mode2.stepData[6].boundsR = { minX: 0, maxX: 0, minY: 0, maxY: 0 };
    }
    updateSessionLockFromState();
    renderUI();
    return true;
  }

  function repeatGuidedStep(stepNum) {
    const s = Math.max(1, Math.min(6, stepNum || state.mode2.currentStep));
    state.mode2.currentStep = s;
    state.mode2.confirmed = false;
    state.mode2.stepData[s].completed = false;
    return startGuidedStepCapture(s);
  }

  function cancelGuidedCalibration() {
    state.mode2.samplingStep = false;
    state.mode2.stepSamples = [];
    state.mode2.stepError = null;
    state.mode2.currentStep = 1;
    state.mode2.confirmed = false;
    updateSessionLockFromState();
    renderUI();
  }

  function areAllGuidedStepsCompleted() {
    for (let i = 1; i <= 6; i++) {
      if (!state.mode2.stepData[i] || !state.mode2.stepData[i].completed) {
        return false;
      }
    }
    return true;
  }

  /**
   * Confirms and saves the 7-step Guided Endpoint Software Profile.
   * Enforces that all 6 measurement steps are completed and verified (Fixes Defects C, D, E).
   */
  function confirmGuidedCalibration(gp, storageObj) {
    if (!areAllGuidedStepsCompleted()) {
      state.mode2.confirmed = false;
      state.mode2.stepError = 'Cannot confirm profile: all 6 measurement steps (Rest, 4 Corners, and 360° Sweep) must be completed and validated first.';
      renderUI();
      return false;
    }

    const store = storageObj || (typeof localStorage !== 'undefined' ? localStorage : null);
    if (!store || typeof store.setItem !== 'function') {
      state.mode2.confirmed = false;
      state.mode2.stepError = 'Cannot save software endpoint profile: browser localStorage is unavailable.';
      renderUI();
      return false;
    }

    const targetGp = gp || getActiveSessionGamepad();
    const unitId = getActiveUnitIdentifier();
    const hwSerial = state.verifiedHardwareInfo ? state.verifiedHardwareInfo.serialNumber : null;
    const d1 = state.mode2.stepData[1];
    const d6 = state.mode2.stepData[6];

    const payload = {
      version: ENDPOINT_SCHEMA_VERSION,
      savedAt: new Date().toISOString(),
      mode: 'GUIDED_ENDPOINT_SOFTWARE_PROFILE',
      firmwareModified: false,
      deviceId: targetGp && targetGp.id ? String(targetGp.id).trim() : 'unknown',
      unitId: unitId || null,
      hardwareSerial: hwSerial || null,
      centers: { lx: d1.lx, ly: d1.ly, rx: d1.rx, ry: d1.ry },
      boundsL: { ...d6.boundsL },
      boundsR: { ...d6.boundsR },
      stepData: state.mode2.stepData,
    };

    try {
      store.setItem(STORAGE_KEY_ENDPOINT, JSON.stringify(payload));
    } catch (err) {
      state.mode2.confirmed = false;
      state.mode2.stepError = `Failed to write endpoint profile to storage: ${err.message || String(err)}`;
      renderUI();
      return false;
    }

    // Also update StickCenterCalibration profile if available so software preview uses both center & range bounds
    if (targetGp && typeof root !== 'undefined' && root.StickCenterCalibration && root.StickCenterCalibration.CalibrationProfileStore) {
      root.StickCenterCalibration.CalibrationProfileStore.saveProfileForGamepad(
        targetGp,
        {
          ok: true,
          sampleCount: d1.samples || 35,
          maxJitter: 0.01,
          centers: payload.centers,
          means: payload.centers,
          boundsL: payload.boundsL,
          boundsR: payload.boundsR,
          unitId,
          hardwareSerial: hwSerial,
        },
        store
      );
    }

    state.mode2.confirmed = true;
    state.mode2.firmwareWritePerformed = false;
    state.mode2.stepError = null;
    state.outcomeTracker.measurements = CALIBRATION_OUTCOME_STATES.MEASUREMENTS_COMPLETED;
    state.outcomeTracker.softwareProfile = CALIBRATION_OUTCOME_STATES.BROWSER_PROFILE_SAVED;
    renderUI();
    return true;
  }

  /**
   * Reads the saved Guided Endpoint software profile and applies center + range scaling
   * for the opt-in Software-Corrected Preview (Fixes Defect E & F).
   */
  function getSavedEndpointProfile(storageObj) {
    const store = storageObj || (typeof localStorage !== 'undefined' ? localStorage : null);
    if (!store || typeof store.getItem !== 'function') return null;
    try {
      const raw = store.getItem(STORAGE_KEY_ENDPOINT);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || !parsed.centers || !parsed.boundsL || !parsed.boundsR) return null;
      return parsed;
    } catch (_) {
      return null;
    }
  }

  function applyEndpointSoftwareCorrection(rawAxes, endpointProfile) {
    if (!rawAxes || typeof rawAxes !== 'object') return { lx: 0, ly: 0, rx: 0, ry: 0 };
    if (!endpointProfile || !endpointProfile.centers) {
      return {
        lx: Number((rawAxes.lx || 0).toFixed(6)),
        ly: Number((rawAxes.ly || 0).toFixed(6)),
        rx: Number((rawAxes.rx || 0).toFixed(6)),
        ry: Number((rawAxes.ry || 0).toFixed(6)),
      };
    }

    const c = endpointProfile.centers;
    const bL = endpointProfile.boundsL || { minX: -1, maxX: 1, minY: -1, maxY: 1 };
    const bR = endpointProfile.boundsR || { minX: -1, maxX: 1, minY: -1, maxY: 1 };

    const scaleAxis = (val, center, minBound, maxBound) => {
      const shifted = (val || 0) - (center || 0);
      if (shifted >= 0) {
        const spanPos = Math.max(0.25, (maxBound || 1) - (center || 0));
        return Math.max(-1, Math.min(1, shifted / spanPos));
      } else {
        const spanNeg = Math.max(0.25, (center || 0) - (minBound || -1));
        return Math.max(-1, Math.min(1, shifted / spanNeg));
      }
    };

    return {
      lx: Number(scaleAxis(rawAxes.lx, c.lx, bL.minX, bL.maxX).toFixed(6)),
      ly: Number(scaleAxis(rawAxes.ly, c.ly, bL.minY, bL.maxY).toFixed(6)),
      rx: Number(scaleAxis(rawAxes.rx, c.rx, bR.minX, bR.maxX).toFixed(6)),
      ry: Number(scaleAxis(rawAxes.ry, c.ry, bR.minY, bR.maxY).toFixed(6)),
    };
  }

  function onFrameTick(gp, axes) {
    if (!axes) return;

    // Mode 1 Sampling
    if (state.mode1.status === 'SAMPLING') {
      if (!gp || !gp.connected) {
        state.mode1.status = 'ERROR';
        state.mode1.message = '✕ Controller disconnected during sampling.';
        updateSessionLockFromState();
        renderUI();
        return;
      }

      if (state.mode1.samples.length === 0) {
        state.mode1.beforeCenters = {
          lx: Number((axes.lx || 0).toFixed(4)),
          ly: Number((axes.ly || 0).toFixed(4)),
          rx: Number((axes.rx || 0).toFixed(4)),
          ry: Number((axes.ry || 0).toFixed(4)),
        };
      }

      if (Math.hypot(axes.lx || 0, axes.ly || 0) > 0.45 || Math.hypot(axes.rx || 0, axes.ry || 0) > 0.45) {
        state.mode1.status = 'ERROR';
        state.mode1.message = '✕ Movement detected during resting center measurement. Leave sticks untouched and click Repeat.';
        updateSessionLockFromState();
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
        const lxD = computeDispersion(state.mode1.samples.map((s) => s.lx));
        const lyD = computeDispersion(state.mode1.samples.map((s) => s.ly));
        const rxD = computeDispersion(state.mode1.samples.map((s) => s.rx));
        const ryD = computeDispersion(state.mode1.samples.map((s) => s.ry));
        const maxP2P = Math.max(lxD.peakToPeak, lyD.peakToPeak, rxD.peakToPeak, ryD.peakToPeak);

        if (maxP2P > 0.12) {
          state.mode1.status = 'ERROR';
          state.mode1.message = `✕ Resting signal was unstable (peak-to-peak ${maxP2P.toFixed(4)} > 0.1200). Leave sticks untouched and retry.`;
          updateSessionLockFromState();
          renderUI();
          return;
        }

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
          maxPeakToPeak: maxP2P,
        };
        state.mode1.status = 'COMPLETED';
        state.outcomeTracker.measurements = CALIBRATION_OUTCOME_STATES.MEASUREMENTS_COMPLETED;
        state.mode1.message = 'Measurement complete. Review Before/After values and click Confirm Software Profile.';
        updateSessionLockFromState();
      }
      renderUI();
    }

    // Mode 2 Guided Endpoint Sampling (with strict directional & coverage validation)
    if (state.mode2.samplingStep) {
      if (!gp || !gp.connected) {
        state.mode2.samplingStep = false;
        state.mode2.stepError = 'Controller disconnected during guided step capture.';
        updateSessionLockFromState();
        renderUI();
        return;
      }

      const step = state.mode2.currentStep;
      const lx = axes.lx || 0;
      const ly = axes.ly || 0;
      const rx = axes.rx || 0;
      const ry = axes.ry || 0;

      state.mode2.stepSamples.push({ lx, ly, rx, ry });

      if (step >= 1 && step <= 5) {
        if (state.mode2.stepSamples.length >= state.mode2.targetStepSamples) {
          const restCenter = step === 1 ? null : state.mode2.stepData[1];
          const check = validateGuidedStepSamples(step, state.mode2.stepSamples, restCenter);
          state.mode2.samplingStep = false;
          updateSessionLockFromState();

          if (!check.ok) {
            state.mode2.stepData[step].completed = false;
            state.mode2.stepData[step].quality = `Rejected: ${check.reason}`;
            state.mode2.stepError = check.error;
            state.mode2.stepSamples = [];
          } else {
            const d = state.mode2.stepData[step];
            d.lx = check.lx;
            d.ly = check.ly;
            d.rx = check.rx;
            d.ry = check.ry;
            d.samples = state.mode2.stepSamples.length;
            d.completed = true;
            d.quality = `Verified (${d.samples} samples)`;
            state.mode2.stepError = null;
            if (state.mode2.currentStep < 7) {
              state.mode2.currentStep = step + 1;
            }
          }
        }
      } else if (step === 6) {
        const d6 = state.mode2.stepData[6];
        const d1 = state.mode2.stepData[1];
        const dxL = lx - (d1.lx || 0);
        const dyL = ly - (d1.ly || 0);
        const dxR = rx - (d1.rx || 0);
        const dyR = ry - (d1.ry || 0);

        d6.samples = state.mode2.stepSamples.length;
        d6.boundsL.minX = Math.min(d6.boundsL.minX, lx);
        d6.boundsL.maxX = Math.max(d6.boundsL.maxX, lx);
        d6.boundsL.minY = Math.min(d6.boundsL.minY, ly);
        d6.boundsL.maxY = Math.max(d6.boundsL.maxY, ly);

        d6.boundsR.minX = Math.min(d6.boundsR.minX, rx);
        d6.boundsR.maxX = Math.max(d6.boundsR.maxX, rx);
        d6.boundsR.minY = Math.min(d6.boundsR.minY, ry);
        d6.boundsR.maxY = Math.max(d6.boundsR.maxY, ry);

        const rL = Math.hypot(dxL, dyL);
        const rR = Math.hypot(dxR, dyR);
        if (rL >= 0.55) {
          const idxL = Math.min(35, Math.floor((((Math.atan2(dyL, dxL) * 180) / Math.PI + 360) % 360) / 10));
          d6.sectorsL[idxL] = Math.max(d6.sectorsL[idxL] || 0, rL);
        }
        if (rR >= 0.55) {
          const idxR = Math.min(35, Math.floor((((Math.atan2(dyR, dxR) * 180) / Math.PI + 360) % 360) / 10));
          d6.sectorsR[idxR] = Math.max(d6.sectorsR[idxR] || 0, rR);
        }

        const covL = d6.sectorsL.filter((v) => v !== null).length;
        const covR = d6.sectorsR.filter((v) => v !== null).length;
        d6.coveragePctL = Math.round((covL / 36) * 100);
        d6.coveragePctR = Math.round((covR / 36) * 100);

        const validExtremaL = d6.boundsL.minX <= -0.60 && d6.boundsL.maxX >= 0.60 && d6.boundsL.minY <= -0.60 && d6.boundsL.maxY >= 0.60;
        const validExtremaR = d6.boundsR.minX <= -0.60 && d6.boundsR.maxX >= 0.60 && d6.boundsR.minY <= -0.60 && d6.boundsR.maxY >= 0.60;

        if (d6.coveragePctL >= 85 && d6.coveragePctR >= 85 && validExtremaL && validExtremaR) {
          d6.completed = true;
          d6.quality = `360° Complete (L: ${d6.coveragePctL}%, R: ${d6.coveragePctR}%)`;
          state.mode2.samplingStep = false;
          state.mode2.stepError = null;
          state.mode2.currentStep = 7;
          state.outcomeTracker.measurements = CALIBRATION_OUTCOME_STATES.MEASUREMENTS_COMPLETED;
          updateSessionLockFromState();
        }
      }
      renderUI();
    }
  }

  /**
   * Resets temporary session calibration state when controller switches or disconnects (Fixes Defect I).
   */
  function onControllerChanged(newGp) {
    state.mode1.status = 'IDLE';
    state.mode1.samples = [];
    state.mode1.measuredCenters = null;
    state.mode1.savedSoftwareProfile = false;
    state.mode2.samplingStep = false;
    state.mode2.stepSamples = [];
    state.mode2.stepError = null;
    state.mode2.confirmed = false;
    for (let i = 1; i <= 5; i++) {
      state.mode2.stepData[i] = { completed: false, samples: 0, lx: 0, ly: 0, rx: 0, ry: 0, quality: 'Pending' };
    }
    state.mode2.stepData[6] = {
      completed: false,
      samples: 0,
      sectorsL: new Array(36).fill(null),
      sectorsR: new Array(36).fill(null),
      coveragePctL: 0,
      coveragePctR: 0,
      boundsL: { minX: 0, maxX: 0, minY: 0, maxY: 0 },
      boundsR: { minX: 0, maxX: 0, minY: 0, maxY: 0 },
      quality: 'Pending'
    };
    state.outcomeTracker.measurements = CALIBRATION_OUTCOME_STATES.NONE;
    state.outcomeTracker.softwareProfile = CALIBRATION_OUTCOME_STATES.NONE;
    if (state.connectedDevice) {
      resolveGamepadHidPairing(state.connectedDevice);
    }
    updateSessionLockFromState();
    renderUI();
  }

  async function closeAndReleaseResources() {
    state.modalOpen = false;
    state.mode1.status = 'IDLE';
    state.mode2.samplingStep = false;
    state.hardwareCalib.rangeInProgress = false;
    state.hardwareCalib.centerInProgress = false;
    updateSessionLockFromState();
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
    if (mode === 'MODE_1' || mode === 'MODE_2' || mode === 'MODE_HW') {
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
    const caps = getCapabilities();
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
    const modeHwPanel = document.getElementById('webhid-mode-hw-panel');
    const tab1 = document.getElementById('webhid-tab-mode1');
    const tab2 = document.getElementById('webhid-tab-mode2');
    const tabHw = document.getElementById('webhid-tab-mode-hw');

    if (mode1Panel) mode1Panel.style.display = state.activeMode === 'MODE_1' ? 'flex' : 'none';
    if (mode2Panel) mode2Panel.style.display = state.activeMode === 'MODE_2' ? 'flex' : 'none';
    if (modeHwPanel) modeHwPanel.style.display = state.activeMode === 'MODE_HW' ? 'flex' : 'none';

    if (tab1) tab1.classList.toggle('active', state.activeMode === 'MODE_1');
    if (tab2) tab2.classList.toggle('active', state.activeMode === 'MODE_2');
    if (tabHw) tabHw.classList.toggle('active', state.activeMode === 'MODE_HW');

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
    setTxt('webhid-m1-layer-meas', m1.measuredCenters ? `Measurements completed (${m1.samples.length} samples)` : m1.status);
    setTxt('webhid-m1-layer-soft', m1.savedSoftwareProfile ? CALIBRATION_OUTCOME_STATES.BROWSER_PROFILE_SAVED : 'Not saved yet');
    setTxt(
      'webhid-m1-layer-hw',
      state.hardwareCalib.permanentAcknowledged
        ? CALIBRATION_OUTCOME_STATES.PERMANENT_SAVE_ACKNOWLEDGED
        : (state.hardwareCalib.temporaryCompleted
          ? CALIBRATION_OUTCOME_STATES.TEMP_DEVICE_CALIBRATED
          : 'Not Modified (Use Hardware Tab for Sony USB calibration)')
    );

    const m1ConfirmBtn = document.getElementById('webhid-m1-confirm-btn');
    if (m1ConfirmBtn) {
      m1ConfirmBtn.disabled = m1.status !== 'COMPLETED' || !m1.measuredCenters;
    }

    // Mode 2 UI
    const m2 = state.mode2;
    const stepMeta = GUIDED_STEPS.find((s) => s.id === m2.currentStep) || GUIDED_STEPS[0];
    setTxt('webhid-m2-step-title', stepMeta.title);
    setTxt('webhid-m2-step-instr', m2.stepError ? `✕ ${m2.stepError}` : stepMeta.instruction);

    const m2ConfirmBtn = document.getElementById('webhid-m2-confirm-btn');
    if (m2ConfirmBtn) {
      m2ConfirmBtn.disabled = !areAllGuidedStepsCompleted();
    }

    const summaryEl = document.getElementById('webhid-m2-summary-list');
    if (summaryEl) {
      const d6 = m2.stepData[6];
      summaryEl.innerHTML = [1, 2, 3, 4, 5].map((idx) => {
        const d = m2.stepData[idx];
        const st = GUIDED_STEPS[idx - 1];
        return `<div class="webhid-step-row ${m2.currentStep === idx ? 'active' : ''}">
          <strong>${st.title}:</strong>
          <span>${d.completed ? `LX:${d.lx.toFixed(3)} LY:${d.ly.toFixed(3)} | RX:${d.rx.toFixed(3)} RY:${d.ry.toFixed(3)} (${d.quality})` : d.quality}</span>
        </div>`;
      }).join('') + `
        <div class="webhid-step-row ${m2.currentStep === 6 ? 'active' : ''}">
          <strong>6. 360° Rotation:</strong>
          <span>${d6.completed ? d6.quality : `L Coverage: ${d6.coveragePctL}% | R Coverage: ${d6.coveragePctR}% (Requires ≥85% + extrema)`}</span>
        </div>
        <div class="webhid-step-row ${m2.currentStep === 7 ? 'active' : ''}">
          <strong>7. Calibration Target:</strong>
          <span>${m2.confirmed ? '✓ Browser Software Endpoint Profile Saved (Hardware Untouched)' : (areAllGuidedStepsCompleted() ? 'Ready to Confirm Software Profile' : 'Complete Steps 1–6 First')}</span>
        </div>
      `;
    }

    // Hardware Mode UI
    const hw = state.hardwareCalib;
    setTxt('webhid-hw-status-msg', hw.lastError ? `✕ ${hw.lastError}` : hw.lastActionStatus);
    setTxt('webhid-hw-cap-center', caps.canCalibrateDeviceCenter ? 'Supported (Sony USB WebHID)' : `Unavailable (${caps.reasons.canCalibrateDeviceCenter})`);
    setTxt('webhid-hw-cap-range', caps.canCalibrateDeviceRange ? 'Supported (Sony USB WebHID)' : `Unavailable (${caps.reasons.canCalibrateDeviceRange})`);
    setTxt('webhid-hw-cap-save', caps.canSaveCalibration ? (caps.pid === 0x0df2 ? 'DualSense Edge (Stock Modules Write-Protected)' : 'Supported (Opt-In NVS Flash)') : 'Unavailable');
    setTxt('webhid-hw-outcome-temp', state.outcomeTracker.tempDeviceCalib);
    setTxt('webhid-hw-outcome-perm', state.outcomeTracker.permanentSaveAck);
    setTxt('webhid-hw-outcome-verify', state.outcomeTracker.persistenceVerified);

    const finetuneEl = document.getElementById('webhid-hw-finetune-readout');
    if (finetuneEl) {
      const ft = hw.postCalibFinetune || hw.preCalibFinetune;
      if (ft && ft.mapped) {
        finetuneEl.textContent = DS5_FINETUNE_KEYS.map((k) => `${k}:${ft.mapped[k]}`).join(' | ');
      } else {
        finetuneEl.textContent = caps.canReadCalibrationBackup ? 'Connect DualSense via USB to read 12-word calibration data.' : caps.reasons.canReadCalibrationBackup;
      }
    }

    const btnHwCenter = document.getElementById('webhid-hw-center-btn');
    const btnHwRangeStart = document.getElementById('webhid-hw-range-start-btn');
    const btnHwRangeEnd = document.getElementById('webhid-hw-range-end-btn');
    const btnHwFlash = document.getElementById('webhid-hw-flash-btn');

    if (btnHwCenter) btnHwCenter.disabled = !caps.canCalibrateDeviceCenter || _commandLock;
    if (btnHwRangeStart) btnHwRangeStart.disabled = !caps.canCalibrateDeviceRange || hw.rangeInProgress || _commandLock;
    if (btnHwRangeEnd) btnHwRangeEnd.disabled = !caps.canCalibrateDeviceRange || !hw.rangeInProgress || _commandLock;
    if (btnHwFlash) btnHwFlash.disabled = !caps.canSaveCalibration || !hw.temporaryCompleted || !hw.permanentOptInConfirmed || _commandLock;
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
    bind('webhid-tab-mode-hw', () => switchMode('MODE_HW'));
    bind('webhid-m1-start-btn', () => startMode1CenterSampling());
    bind('webhid-m1-confirm-btn', () => {
      confirmMode1Profile(getActiveSessionGamepad());
    });
    bind('webhid-m2-capture-btn', () => startGuidedStepCapture(state.mode2.currentStep));
    bind('webhid-m2-repeat-btn', () => repeatGuidedStep(state.mode2.currentStep));
    bind('webhid-m2-prev-btn', () => {
      state.mode2.currentStep = Math.max(1, state.mode2.currentStep - 1);
      state.mode2.samplingStep = false;
      updateSessionLockFromState();
      renderUI();
    });
    bind('webhid-m2-next-btn', () => {
      state.mode2.currentStep = Math.min(7, state.mode2.currentStep + 1);
      state.mode2.samplingStep = false;
      updateSessionLockFromState();
      renderUI();
    });
    bind('webhid-m2-cancel-btn', () => cancelGuidedCalibration());
    bind('webhid-m2-confirm-btn', () => confirmGuidedCalibration(getActiveSessionGamepad()));

    // Hardware calibration buttons
    bind('webhid-hw-center-btn', () => runHardwareCenterCalibration());
    bind('webhid-hw-range-start-btn', () => startHardwareRangeCalibration());
    bind('webhid-hw-range-end-btn', () => finishHardwareRangeCalibration());
    bind('webhid-hw-flash-btn', () => saveCalibrationPermanentlyToDevice(state.hardwareCalib.permanentOptInConfirmed));

    const optInCheckbox = document.getElementById('webhid-hw-optin-checkbox');
    if (optInCheckbox && !optInCheckbox.dataset.boundWebhid) {
      optInCheckbox.dataset.boundWebhid = 'true';
      optInCheckbox.addEventListener('change', (e) => {
        state.hardwareCalib.permanentOptInConfirmed = Boolean(e.target.checked);
        renderUI();
      });
    }

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
    EXTERNAL_REFERENCES,
    VERIFICATION_STATUSES,
    CALIBRATION_OUTCOME_STATES,
    KNOWN_VID_PIDS,
    XBOX_GIP_RESEARCH,
    GUIDED_STEPS,
    DS4CalibrationAdapter,
    DS5CalibrationAdapter,
    DS5EdgeCalibrationAdapter,
    XboxGipAdapterBoundary,
    createSonyAdapter,
    allocFeatureReportBuffer,
    getCapabilities,
    checkEnvironment,
    inspectHidDeviceDescriptor,
    requestAndInspectDevice,
    runHardwareCenterCalibration,
    startHardwareRangeCalibration,
    finishHardwareRangeCalibration,
    saveCalibrationPermanentlyToDevice,
    checkPostReconnectPersistence,
    validateGuidedStepSamples,
    areAllGuidedStepsCompleted,
    startMode1CenterSampling,
    confirmMode1Profile,
    startGuidedStepCapture,
    repeatGuidedStep,
    cancelGuidedCalibration,
    confirmGuidedCalibration,
    getSavedEndpointProfile,
    applyEndpointSoftwareCorrection,
    onFrameTick,
    onControllerChanged,
    isOperationLocked,
    openModal,
    closeAndReleaseResources,
    switchMode,
    getState: () => state,
    resetState: () => {
      _commandLock = false;
      state = createInitialState();
      return state;
    },
    initDOMListeners,
  };
});
