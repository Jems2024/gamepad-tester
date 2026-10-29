/* ============================================================
   STEP 2: CONTROLLER SESSION MANAGEMENT, MANUAL RESET & DISCONNECT HANDLING
   File: session-reset.js
   - Manual reset button: "Next Controller / Reset Test"
   - Resets only temporary session state without reloading page
   - Never deletes saved batch history or persistent preferences
   - Handles gamepadconnected / gamepaddisconnected without duplicates
   - Shows clear disconnect notification and invalidates stale readings
   ============================================================ */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.SessionResetManager = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  let listenersRegistered = false;
  let sessionState = {
    sessionId: 'SES-' + Date.now(),
    disconnectedBannerVisible: false,
    lastDisconnectedDeviceName: '',
    lastDisconnectedIndex: null,
    lastDisconnectedAt: null,
    staleReadingsBlocked: false,
    resetCount: 0,
  };

  const I18N = {
    es: {
      btnNextReset: '⏭ Next Controller / Reset Test',
      disconnectTitle: '⚠ Mando desconectado durante la sesión:',
      disconnectSub: 'Las mediciones en curso de este dispositivo se han detenido para evitar lecturas obsoletas. Los lotes e historiales guardados se conservan intactos. Conecta otro mando para iniciar una nueva sesión.',
      reconnectedMsg: '✓ Nuevo mando detectado — Sesión lista.',
      resetDoneToast: '✓ Sesión reiniciada para el siguiente mando (historial de lotes conservado).',
    },
    en: {
      btnNextReset: '⏭ Next Controller / Reset Test',
      disconnectTitle: '⚠ Controller disconnected during test:',
      disconnectSub: 'Active measurements for this device were stopped to prevent stale readings. Saved batch records remain intact. Connect another controller to start a new session.',
      reconnectedMsg: '✓ Controller connected — Fresh session ready.',
      resetDoneToast: '✓ Session reset for next controller (saved batch history preserved).',
    }
  };

  function tr(key) {
    const lang = (typeof currentLang === 'string' && I18N[currentLang]) ? currentLang : 'en';
    const dict = I18N[lang] || I18N.en;
    return dict[key] || I18N.en[key] || key;
  }

  /**
   * Resets only the current controller session's temporary state.
   * Never deletes localStorage batch records, diagnostic history, or calibration profiles.
   */
  function resetCurrentSession(options) {
    const opts = Object.assign({ clearSkuForNext: false, reason: 'manual' }, options || {});
    sessionState.sessionId = 'SES-' + Date.now() + '-' + (++sessionState.resetCount);
    sessionState.staleReadingsBlocked = false;

    if (opts.reason === 'manual') {
      hideDisconnectBanner();
    }

    // 1. Reset core app.js temporary session state if present
    if (typeof resetAllValidationStates === 'function') {
      resetAllValidationStates();
    }

    // Rebuild button chips to clear visual '.passed', '.pressed', '.testing', '.stuck' classes
    if (typeof state === 'object' && state !== null) {
      const gps = (typeof navigator !== 'undefined' && navigator.getGamepads) ? navigator.getGamepads() : [];
      const gp = (state.activeGpIndex !== null && gps[state.activeGpIndex]) ? gps[state.activeGpIndex] : null;
      const btnCount = gp && gp.buttons ? Math.min(gp.buttons.length, 22) : 16;
      if (typeof buildButtonChips === 'function') {
        buildButtonChips(btnCount);
      }
      if (typeof buildPhotoOverlay === 'function') {
        buildPhotoOverlay(state.model || 'ps4');
      }
      if (typeof dom === 'object' && dom !== null) {
        if (dom.stickLCanvas && typeof drawLargeStick === 'function') {
          drawLargeStick(dom.stickLCanvas, 0, 0, true, []);
        }
        if (dom.stickRCanvas && typeof drawLargeStick === 'function') {
          drawLargeStick(dom.stickRCanvas, 0, 0, false, []);
        }
        if (dom.chipBtnProgress) {
          dom.chipBtnProgress.textContent = `0 / ${btnCount} ✓`;
        }
      }
    }

    // 2. Reset Step 1 Trigger Full-Travel Validator
    if (typeof TriggerFullTravelValidator === 'object' && TriggerFullTravelValidator !== null) {
      TriggerFullTravelValidator.reset();
    } else if (typeof window !== 'undefined' && window.TriggerFullTravelValidator) {
      window.TriggerFullTravelValidator.reset();
    }

    // 3. Reset Step 3 Advanced Stick Diagnostics (Circularity & Polling/Jitter)
    if (typeof AdvancedStickDiagnostics === 'object' && AdvancedStickDiagnostics !== null) {
      AdvancedStickDiagnostics.resetAll();
    } else if (typeof window !== 'undefined' && window.AdvancedStickDiagnostics) {
      window.AdvancedStickDiagnostics.resetAll();
    }

    // 4. Reset Step 5 Batch Manager session flags (without touching saved batch localStorage!)
    if (typeof BatchManager === 'object' && BatchManager !== null) {
      BatchManager.onSessionReset({ clearSku: opts.clearSkuForNext });
    } else if (typeof window !== 'undefined' && window.BatchManager) {
      window.BatchManager.onSessionReset({ clearSku: opts.clearSkuForNext });
    }

    return sessionState;
  }

  function showDisconnectBanner(deviceName, index) {
    sessionState.disconnectedBannerVisible = true;
    sessionState.lastDisconnectedDeviceName = deviceName || `Gamepad #${index !== undefined ? index : '?'}`;
    sessionState.lastDisconnectedIndex = index !== undefined ? index : null;
    sessionState.lastDisconnectedAt = new Date().toISOString();
    sessionState.staleReadingsBlocked = true;

    if (typeof document === 'undefined') return;
    const banner = document.getElementById('disconnect-notification-banner');
    const titleEl = document.getElementById('disconnect-banner-title');
    const subEl = document.getElementById('disconnect-banner-sub');
    if (banner) {
      banner.style.display = 'flex';
      if (titleEl) {
        titleEl.textContent = `${tr('disconnectTitle')} ${sessionState.lastDisconnectedDeviceName}`;
      }
      if (subEl) {
        subEl.textContent = tr('disconnectSub');
      }
    }
  }

  function hideDisconnectBanner() {
    sessionState.disconnectedBannerVisible = false;
    sessionState.staleReadingsBlocked = false;
    if (typeof document === 'undefined') return;
    const banner = document.getElementById('disconnect-notification-banner');
    if (banner) {
      banner.style.display = 'none';
    }
  }

  function onControllerDisconnected(gp) {
    const devId = gp && gp.id ? gp.id : `Index ${gp && gp.index !== undefined ? gp.index : 0}`;
    const idx = gp && gp.index !== undefined ? gp.index : null;

    // Invalidate current temporary measurements so partial/stale values do not persist
    resetCurrentSession({ clearSkuForNext: false, reason: 'disconnect' });
    showDisconnectBanner(devId, idx);
  }

  function onControllerConnected(gp) {
    if (!gp) return;
    hideDisconnectBanner();
    resetCurrentSession({ clearSkuForNext: false, reason: 'connect' });
  }

  function initListeners() {
    if (listenersRegistered) return;
    listenersRegistered = true;

    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('gamepaddisconnected', (e) => {
        onControllerDisconnected(e.gamepad);
      });
      window.addEventListener('gamepadconnected', (e) => {
        onControllerConnected(e.gamepad);
      });
    }

    if (typeof document !== 'undefined') {
      const bindButtons = () => {
        const nextBtn = document.getElementById('btn-next-controller-reset');
        const nextBtnBar = document.getElementById('batch-next-controller-btn');
        const dismissBtn = document.getElementById('disconnect-banner-dismiss');

        const handleManualClick = () => {
          resetCurrentSession({ clearSkuForNext: true, reason: 'manual' });
          const skuInput = document.getElementById('batch-sku-input');
          if (skuInput) {
            skuInput.focus();
            skuInput.select();
          }
        };

        if (nextBtn && !nextBtn.dataset.boundReset) {
          nextBtn.dataset.boundReset = 'true';
          nextBtn.addEventListener('click', handleManualClick);
        }
        if (nextBtnBar && !nextBtnBar.dataset.boundReset) {
          nextBtnBar.dataset.boundReset = 'true';
          nextBtnBar.addEventListener('click', handleManualClick);
        }
        if (dismissBtn && !dismissBtn.dataset.boundDismiss) {
          dismissBtn.dataset.boundDismiss = 'true';
          dismissBtn.addEventListener('click', hideDisconnectBanner);
        }
      };

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bindButtons);
      } else {
        bindButtons();
      }
    }
  }

  function getSessionState() {
    return Object.assign({}, sessionState);
  }

  if (typeof window !== 'undefined') {
    initListeners();
  }

  return {
    resetCurrentSession,
    onControllerDisconnected,
    onControllerConnected,
    showDisconnectBanner,
    hideDisconnectBanner,
    initListeners,
    getSessionState,
  };
});
