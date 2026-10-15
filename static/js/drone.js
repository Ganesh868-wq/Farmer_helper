// ==============================================================
// RYTHU MITRA AI (రైతు మిత్ర AI) — AGRICULTURAL DRONE CONTROLLER
// Real Drone Connection (MAVLink / DJI Cloud) & Demo Mode Simulation
// ==============================================================

class DroneController {
  constructor() {
    this.modal = document.getElementById('droneConnectionModal');
    this.hudBtn = document.getElementById('btnConnectDrone');
    this.closeBtn = document.getElementById('droneModalCloseBtn');
    
    // Tab controls
    this.tabReal = document.getElementById('tabRealDrone');
    this.tabDemo = document.getElementById('tabDemoDrone');
    this.currentMode = 'real'; // 'real' or 'demo'

    // Action buttons
    this.btnConnect = document.getElementById('btnDroneConnect');
    this.btnDisconnect = document.getElementById('btnDroneDisconnect');
    this.btnRetry = document.getElementById('btnDroneRetry');
    this.btnRefresh = document.getElementById('btnDroneRefresh');

    // Banners & Status
    this.demoBanner = document.getElementById('droneDemoBanner');
    this.errorBanner = document.getElementById('droneErrorBanner');
    this.errorText = document.getElementById('droneErrorText');
    this.statusDot = document.getElementById('droneStatusDot');
    this.statusBadge = document.getElementById('droneStatusBadge');

    // Polling state
    this.pollTimer = null;
    this.isPolling = false;
    this.lastState = 'disconnected';
    this.isConnected = false;

    this.init();
  }

  init() {
    this.bindEvents();
    // Fetch initial status on startup to reflect any running session
    this.fetchStatus(true);
  }

  bindEvents() {
    // HUD Connect Drone button opens modal
    this.hudBtn?.addEventListener('click', () => {
      this.openModal();
    });

    // Close modal
    this.closeBtn?.addEventListener('click', () => {
      this.closeModal();
    });

    this.modal?.addEventListener('click', (e) => {
      if (e.target === this.modal) this.closeModal();
    });

    // Switch Tabs
    this.tabReal?.addEventListener('click', () => this.setMode('real'));
    this.tabDemo?.addEventListener('click', () => this.setMode('demo'));

    // Action button clicks
    this.btnConnect?.addEventListener('click', () => this.connectDrone());
    this.btnDisconnect?.addEventListener('click', () => this.disconnectDrone());
    this.btnRetry?.addEventListener('click', () => this.connectDrone());
    this.btnRefresh?.addEventListener('click', () => this.fetchStatus(true));

    // Listen for language change to update labels dynamically
    window.addEventListener('language:changed', () => {
      if (this.lastStatusData) this.renderStatus(this.lastStatusData);
    });
  }

  getTranslation(key, fallback = '') {
    const lang = window.farmApp?.currentLang || localStorage.getItem('rythu_lang') || 'en';
    if (typeof TRANSLATIONS !== 'undefined' && TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) {
      return TRANSLATIONS[lang][key];
    }
    if (typeof TRANSLATIONS !== 'undefined' && TRANSLATIONS['en'] && TRANSLATIONS['en'][key]) {
      return TRANSLATIONS['en'][key];
    }
    return fallback;
  }

  setMode(mode) {
    this.currentMode = mode;
    this.tabReal?.classList.toggle('active', mode === 'real');
    this.tabDemo?.classList.toggle('active', mode === 'demo');

    if (mode === 'demo') {
      if (this.errorBanner) this.errorBanner.style.display = 'none';
      if (this.demoBanner) this.demoBanner.style.display = 'flex';
      if (!this.isConnected || !this.lastStatusData?.is_demo) {
        this.connectDrone();
      }
    } else {
      if (this.demoBanner) this.demoBanner.style.display = 'none';
      if (this.isConnected && this.lastStatusData?.is_demo) {
        this.disconnectDrone();
      } else {
        const state = (this.lastState === 'error') ? 'waiting' : 'disconnected';
        if (this.statusDot) this.statusDot.className = `status-dot ${state}`;
        if (this.statusBadge) {
          this.statusBadge.className = `status-val-pill ${state}`;
          this.statusBadge.textContent = (state === 'waiting')
            ? this.getTranslation('drone_status_waiting', 'Waiting for Hardware')
            : this.getTranslation('drone_status_disconnected', 'Disconnected');
        }
        if (this.errorBanner) {
          this.errorBanner.style.display = (state === 'waiting' && this.lastStatusData?.error_message) ? 'flex' : 'none';
        }
        if (this.btnConnect) {
          this.btnConnect.style.display = 'inline-flex';
          this.btnConnect.disabled = false;
          this.btnConnect.innerHTML = `📡 <span>${this.getTranslation('drone_btn_connect', 'Connect Drone')}</span>`;
        }
        if (this.btnRetry) this.btnRetry.style.display = 'none';
        if (this.btnDisconnect) this.btnDisconnect.style.display = 'none';
      }
    }
  }

  openModal() {
    if (!this.modal) return;
    this.modal.classList.add('active');
    this.fetchStatus(true);
    this.startPolling(1500);
  }

  closeModal() {
    if (!this.modal) return;
    this.modal.classList.remove('active');
    // If connected, continue polling in background at a relaxed 3s interval for HUD status
    if (this.isConnected) {
      this.startPolling(3000);
    } else {
      this.stopPolling();
    }
  }

  startPolling(intervalMs = 2000) {
    this.stopPolling();
    this.pollTimer = setInterval(() => this.fetchStatus(false), intervalMs);
    this.isPolling = true;
  }

  stopPolling() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
    this.isPolling = false;
  }

  async fetchStatus(showLoading = false) {
    try {
      const endpoint = window.apiEndpoint ? window.apiEndpoint('/api/drone/status') : '/api/drone/status';
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
      const data = await res.json();
      this.lastStatusData = data;
      this.renderStatus(data);
    } catch (err) {
      console.warn('[DroneController] Status fetch warning:', err);
    }
  }

  async connectDrone() {
    const isDemo = (this.currentMode === 'demo');
    const endpoint = window.apiEndpoint ? window.apiEndpoint('/api/drone/connect') : '/api/drone/connect';

    // Show connecting state in UI
    this.setConnectingState();

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: isDemo ? 'demo' : 'real' })
      });
      const data = await res.json();
      this.lastStatusData = data.status || data;
      this.renderStatus(this.lastStatusData);
      
      // Keep polling active
      this.startPolling(1500);
    } catch (err) {
      console.error('[DroneController] Connection error:', err);
      this.renderError('Network connection failed while reaching drone server.');
    }
  }

  async disconnectDrone() {
    const endpoint = window.apiEndpoint ? window.apiEndpoint('/api/drone/disconnect') : '/api/drone/disconnect';
    try {
      const res = await fetch(endpoint, { method: 'POST' });
      const data = await res.json();
      this.lastStatusData = data.status || data;
      this.renderStatus(this.lastStatusData);
      
      // Slow down or stop polling
      if (!this.modal?.classList.contains('active')) {
        this.stopPolling();
      }
    } catch (err) {
      console.error('[DroneController] Disconnect error:', err);
    }
  }

  setConnectingState() {
    if (this.statusDot) {
      this.statusDot.className = 'status-dot connecting';
    }
    if (this.statusBadge) {
      this.statusBadge.className = 'status-val-pill connecting';
      this.statusBadge.textContent = this.getTranslation('drone_status_connecting', 'Connecting...');
    }
    if (this.btnConnect) {
      this.btnConnect.disabled = true;
      this.btnConnect.innerHTML = `⏳ <span>${this.getTranslation('drone_status_connecting', 'Connecting...')}</span>`;
    }
    if (this.errorBanner) this.errorBanner.style.display = 'none';
  }

  renderStatus(data) {
    if (!data) return;
    const state = data.state || 'disconnected';
    const isDemo = !!data.is_demo;
    this.lastState = state;
    this.isConnected = (state === 'connected');

    // Synchronize mode tabs with current active state
    if (isDemo && state === 'connected' && this.currentMode !== 'demo') {
      this.setMode('demo');
    } else if (!isDemo && state === 'connected' && this.currentMode !== 'real') {
      this.setMode('real');
    }

    // 1. Update Status Badge & Dot
    const notAvail = this.getTranslation('drone_not_available', 'Not available');
    const getVal = (v) => (!v || v === 'Not available') ? notAvail : v;

    if (this.currentMode === 'demo' && !this.isConnected) {
      if (this.statusDot) this.statusDot.className = 'status-dot demo';
      if (this.statusBadge) {
        this.statusBadge.className = 'status-val-pill demo';
        this.statusBadge.textContent = this.getTranslation('drone_status_demo_ready', 'Demo Ready (Click Start)');
      }
    } else {
      const dotClass = isDemo ? 'demo' : (state === 'connected' ? 'connected' : (state === 'connecting' ? 'connecting' : (state === 'error' ? 'waiting' : 'disconnected')));
      if (this.statusDot) {
        this.statusDot.className = `status-dot ${dotClass}`;
      }
      if (this.statusBadge) {
        this.statusBadge.className = `status-val-pill ${dotClass}`;
        if (state === 'connected') {
          this.statusBadge.textContent = isDemo 
            ? this.getTranslation('drone_status_demo', 'Simulation Active') 
            : this.getTranslation('drone_status_connected', 'Connected');
        } else if (state === 'connecting') {
          this.statusBadge.textContent = this.getTranslation('drone_status_connecting', 'Connecting...');
        } else if (state === 'error') {
          this.statusBadge.textContent = this.getTranslation('drone_status_waiting', 'Waiting for Hardware');
        } else {
          this.statusBadge.textContent = this.getTranslation('drone_status_disconnected', 'Disconnected');
        }
      }
    }

    // 2. Update HUD Button on 3D farm view
    if (this.hudBtn) {
      this.hudBtn.className = `hud-btn hud-btn-drone-connect ${isDemo ? 'demo' : (state === 'connected' ? 'connected' : '')}`;
      const battPct = data.telemetry?.battery_pct;
      if (state === 'connected') {
        if (isDemo) {
          this.hudBtn.innerHTML = `🟡 <span>${this.getTranslation('drone_status_demo', 'Demo Drone')} (${battPct != null ? battPct + '%' : 'Sim'})</span>`;
        } else {
          this.hudBtn.innerHTML = `🟢 <span>${this.getTranslation('drone_status_connected', 'Drone Online')} (${battPct != null ? battPct + '%' : '100%'})</span>`;
        }
      } else if (state === 'connecting') {
        this.hudBtn.innerHTML = `⏳ <span>${this.getTranslation('drone_status_connecting', 'Connecting...')}</span>`;
      } else {
        this.hudBtn.innerHTML = `📡 <span data-i18n="btn_connect_drone">${this.getTranslation('btn_connect_drone', 'Connect Drone')}</span>`;
      }
    }

    // 3. Demo Banner
    if (this.demoBanner) {
      this.demoBanner.style.display = (isDemo || this.currentMode === 'demo') ? 'flex' : 'none';
    }

    // 4. Error / Hardware Guidance Banner
    if (this.errorBanner) {
      if (this.currentMode === 'real' && (state === 'error' || state === 'waiting') && data.error_message) {
        this.errorBanner.style.display = 'flex';
        let displayMsg = this.getTranslation('drone_hardware_waiting_hint', data.error_message);
        if (this.errorText) this.errorText.textContent = displayMsg;
      } else {
        this.errorBanner.style.display = 'none';
      }
    }

    // 5. Action Buttons visibility
    if (this.btnConnect) {
      this.btnConnect.disabled = false;
      if (state === 'connected') {
        this.btnConnect.style.display = 'none';
      } else if (state === 'connecting') {
        this.btnConnect.style.display = 'inline-flex';
        this.btnConnect.disabled = true;
      } else {
        this.btnConnect.style.display = 'inline-flex';
        const label = (this.currentMode === 'demo')
          ? this.getTranslation('drone_btn_start_demo', 'Start Demo Mode')
          : this.getTranslation('drone_btn_connect', 'Connect Drone');
        this.btnConnect.innerHTML = `${this.currentMode === 'demo' ? '🎮' : '📡'} <span>${label}</span>`;
      }
    }

    if (this.btnDisconnect) {
      this.btnDisconnect.style.display = (state === 'connected') ? 'inline-flex' : 'none';
      if (isDemo) {
        this.btnDisconnect.innerHTML = `🛑 <span>${this.getTranslation('drone_btn_stop_demo', 'Stop Simulation')}</span>`;
      } else {
        this.btnDisconnect.innerHTML = `🔌 <span>${this.getTranslation('drone_btn_disconnect', 'Disconnect Drone')}</span>`;
      }
    }

    if (this.btnRetry) {
      this.btnRetry.style.display = 'none';
    }

    // 6. Device Hardware Metadata
    const dev = data.device_info || {};
    this.setText('valDroneName', getVal(dev.name));
    this.setText('valDroneManufacturer', getVal(dev.manufacturer));
    this.setText('valDroneModel', getVal(dev.model));
    this.setText('valDroneDeviceId', getVal(dev.device_id));
    this.setText('valDroneProtocol', getVal(dev.protocol));

    // Format timestamps
    if (data.last_connection_time) {
      try {
        const d = new Date(data.last_connection_time);
        this.setText('valDroneLastConnected', d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      } catch (e) {
        this.setText('valDroneLastConnected', data.last_connection_time);
      }
    } else {
      this.setText('valDroneLastConnected', notAvail);
    }

    if (data.last_heartbeat) {
      try {
        const d = new Date(data.last_heartbeat);
        this.setText('valDroneLastHeartbeat', d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      } catch (e) {
        this.setText('valDroneLastHeartbeat', data.last_heartbeat);
      }
    } else {
      this.setText('valDroneLastHeartbeat', notAvail);
    }

    // 7. Telemetry Fields
    const telem = data.telemetry || {};

    // Battery
    const batt = telem.battery_pct;
    const battBar = document.getElementById('valDroneBatteryBar');
    if (batt !== null && batt !== undefined) {
      this.setText('valDroneBatteryPct', `${batt}%`);
      if (battBar) {
        battBar.style.width = `${Math.min(100, Math.max(0, batt))}%`;
        battBar.style.backgroundColor = batt > 50 ? '#10b981' : batt > 20 ? '#f59e0b' : '#ef4444';
      }
    } else {
      this.setText('valDroneBatteryPct', notAvail);
      if (battBar) battBar.style.width = '0%';
    }

    const volt = telem.battery_voltage;
    this.setText('valDroneBatteryVoltage', volt !== null && volt !== undefined ? `${volt} V` : notAvail);

    // GPS & Position
    const lat = telem.gps_lat;
    const lon = telem.gps_lon;
    if (lat !== null && lon !== null && lat !== undefined && lon !== undefined) {
      this.setText('valDroneGpsCoords', `${lat.toFixed(6)}° N, ${lon.toFixed(6)}° E`);
    } else {
      this.setText('valDroneGpsCoords', notAvail);
    }

    const sats = telem.satellites_visible;
    const fix = telem.gps_fix_type;
    if (sats !== null && sats !== undefined) {
      this.setText('valDroneGpsFix', `${sats} Sats (${fix || '3D Fix'})`);
    } else {
      this.setText('valDroneGpsFix', getVal(fix));
    }

    const sig = telem.signal_strength_pct;
    this.setText('valDroneSignal', sig !== null && sig !== undefined ? `${sig}%` : notAvail);

    // Altitude
    const alt = telem.altitude_m;
    this.setText('valDroneAltitude', alt !== null && alt !== undefined ? `${alt} m AGL` : notAvail);

    const altMsl = telem.altitude_msl_m;
    this.setText('valDroneAltitudeMsl', altMsl !== null && altMsl !== undefined ? `${altMsl} m MSL` : notAvail);

    // Dynamics & Mode
    this.setText('valDroneFlightMode', getVal(telem.flight_mode));

    const spd = telem.ground_speed_mps;
    this.setText('valDroneSpeed', spd !== null && spd !== undefined ? `${spd} m/s (${(spd * 3.6).toFixed(1)} km/h)` : notAvail);

    const hdg = telem.heading_deg;
    this.setText('valDroneHeading', hdg !== null && hdg !== undefined ? `${hdg}°` : notAvail);

    // 8. Visual feedback on 3D Farm Visualizer
    this.syncWith3DFarm(data);
  }

  syncWith3DFarm(data) {
    const farm3d = window.farmApp?.farm3d;
    if (!farm3d || !farm3d.drone) return;

    if (data.state === 'connected' && data.telemetry) {
      const alt = data.telemetry.altitude_m;
      if (alt && !isNaN(alt)) {
        // Map drone altitude smoothly to Three.js world Y coordinate (10m = 12 units, 20m = 20 units)
        const targetY = Math.max(8, Math.min(30, 8 + (alt * 0.7)));
        farm3d.drone.position.y += (targetY - farm3d.drone.position.y) * 0.15;
      }
    }
  }

  setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  renderError(msg) {
    this.lastState = 'error';
    if (this.statusDot) this.statusDot.className = 'status-dot error';
    if (this.statusBadge) {
      this.statusBadge.className = 'status-val-pill error';
      this.statusBadge.textContent = this.getTranslation('drone_status_error', 'Connection Error');
    }
    if (this.errorBanner) {
      this.errorBanner.style.display = 'flex';
      if (this.errorText) this.errorText.textContent = msg;
    }
    if (this.btnConnect) {
      this.btnConnect.disabled = false;
      this.btnConnect.style.display = 'none';
    }
    if (this.btnRetry) {
      this.btnRetry.style.display = 'inline-flex';
    }
    if (this.btnDisconnect) {
      this.btnDisconnect.style.display = 'none';
    }
  }
}

// Instantiate global drone controller when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.droneController = new DroneController();
});
