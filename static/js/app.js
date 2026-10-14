// Base API URL resolver (handles both http:// and direct file:// execution)
const API_BASE = (window.location.protocol === 'file:') ? 'http://127.0.0.1:5000' : '';
function apiEndpoint(path) {
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${API_BASE}${path}`;
}

class RythuMitraApp {
  constructor() {
    this.currentLang = localStorage.getItem('rythu_lang') || 'te'; // Telugu default
    this.token = localStorage.getItem('rythu_token') || null;
    this.currentUser = null;
    this.selectedImageFile = null;
    this.cameraStream = null;
    this.activeDiagnosisMethod = 'photo'; // 'photo' or 'voice'
    this.activeDistrict = 'warangal';
    this.farm3d = null;
    this.cachedDiagnosis = null;
    this.cachedWeather = null;

    this.init();
  }

  async init() {
    this.setupEventListeners();
    this.applyLanguage(this.currentLang);
    this.checkSunlightModePreference();
    
    // Initialize 3D Farm Visualizer
    if (typeof Farm3DVisualizer !== 'undefined') {
      this.farm3d = new Farm3DVisualizer('farmCanvas');
    }

    // Verify session if token exists
    if (this.token) {
      await this.fetchCurrentUser();
    } else {
      this.updateAuthUI(null);
    }

    // Initial data loads
    this.loadFarmTelemetry();
    this.loadWeather();
    this.loadMandiPrices();
    this.loadCropRecommendations();
    this.loadSchemes();
    this.loadOrganicRecipes();
    this.loadScanHistory();
    this.fetchSystemHealth();
  }

  setupEventListeners() {
    // 1. Language selector
    const langSelect = document.getElementById('langSelect');
    if (langSelect) {
      langSelect.value = this.currentLang;
      langSelect.addEventListener('change', (e) => this.setLanguage(e.target.value));
    }

    // 2. High contrast toggle
    const contrastBtn = document.getElementById('contrastToggleBtn');
    if (contrastBtn) {
      contrastBtn.addEventListener('click', () => this.toggleSunlightMode());
    }

    // 3. Navigation Tabs
    const tabBtns = document.querySelectorAll('.nav-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
    });

    // 4. Auth Modal & Buttons
    const authBtn = document.getElementById('headerAuthBtn');
    if (authBtn) {
      authBtn.addEventListener('click', () => {
        if (this.currentUser) {
          this.logout();
        } else {
          this.openModal('authModal');
        }
      });
    }

    const authForm = document.getElementById('authForm');
    if (authForm) {
      authForm.addEventListener('submit', (e) => this.handleAuthSubmit(e));
    }

    const switchAuthModeBtn = document.getElementById('switchAuthModeBtn');
    if (switchAuthModeBtn) {
      switchAuthModeBtn.addEventListener('click', () => this.toggleAuthMode());
    }

    // Modal close buttons
    document.querySelectorAll('.modal-close-btn').forEach(btn => {
      btn.addEventListener('click', () => this.closeAllModals());
    });

    // 5. 3D Farm Controls
    document.getElementById('btnDayNight')?.addEventListener('click', () => this.farm3d?.toggleDayNight());
    document.getElementById('btnRain')?.addEventListener('click', () => this.farm3d?.toggleRain());
    document.getElementById('btnDroneSurvey')?.addEventListener('click', () => this.farm3d?.toggleDroneSurvey());

    window.addEventListener('farm:select-sector', (e) => {
      this.highlightSectorInSidebar(e.detail.sectorId);
    });

    // 6. AI Crop Doctor Controls
    document.getElementById('tabPhotoBtn')?.addEventListener('click', () => this.setDiagnosisMethod('photo'));
    document.getElementById('tabVoiceBtn')?.addEventListener('click', () => this.setDiagnosisMethod('voice'));

    const photoInput = document.getElementById('photoInput');
    const uploadDropZone = document.getElementById('photoDropZone');
    if (uploadDropZone && photoInput) {
      uploadDropZone.addEventListener('click', () => photoInput.click());
      photoInput.addEventListener('change', (e) => this.handleFileSelect(e.target.files[0]));

      uploadDropZone.addEventListener('dragover', (e) => { e.preventDefault(); uploadDropZone.style.borderColor = '#fbbf24'; });
      uploadDropZone.addEventListener('dragleave', () => { uploadDropZone.style.borderColor = ''; });
      uploadDropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadDropZone.style.borderColor = '';
        if (e.dataTransfer.files.length) this.handleFileSelect(e.dataTransfer.files[0]);
      });
    }

    document.getElementById('removePreviewBtn')?.addEventListener('click', () => this.removeSelectedImage());
    document.getElementById('btnOpenCamera')?.addEventListener('click', () => this.startCamera());
    document.getElementById('btnCaptureCam')?.addEventListener('click', () => this.captureCameraFrame());
    document.getElementById('btnCancelCam')?.addEventListener('click', () => this.stopCamera());

    // Voice Engine Integration
    const micBtn = document.getElementById('micRecordBtn');
    if (micBtn) {
      micBtn.addEventListener('click', () => {
        voiceEngine.setLanguage(this.currentLang);
        voiceEngine.startListening();
      });
    }

    window.addEventListener('voice-engine:recording-state', (e) => {
      const isRec = e.detail.recording;
      const micBtn = document.getElementById('micRecordBtn');
      const statusText = document.getElementById('voiceStatusText');
      if (micBtn) micBtn.classList.toggle('recording', isRec);
      if (statusText) {
        statusText.textContent = isRec 
          ? (TRANSLATIONS[this.currentLang]?.mic_recording || "Listening...") 
          : (TRANSLATIONS[this.currentLang]?.mic_prompt || "Click to Speak");
      }
    });

    window.addEventListener('voice-engine:transcript-update', (e) => {
      const textarea = document.getElementById('symptomText');
      if (textarea) textarea.value = e.detail.transcript;
    });

    document.getElementById('btnSubmitDiagnosis')?.addEventListener('click', () => this.submitDiagnosis());
    document.getElementById('btnListenDiagnosis')?.addEventListener('click', () => this.speakDiagnosisResult());

    // 7. Weather Controls
    document.getElementById('districtSelect')?.addEventListener('change', (e) => {
      this.activeDistrict = e.target.value;
      this.loadWeatherForDistrict(this.activeDistrict);
    });

    document.getElementById('btnLocateMe')?.addEventListener('click', () => this.detectUserLocationWeather());
    document.getElementById('btnListenWeather')?.addEventListener('click', () => this.speakWeatherAdvisory());

    // 8. Mandi & Schemes Search
    document.getElementById('mandiSearchInput')?.addEventListener('input', (e) => this.loadMandiPrices(e.target.value));
    document.getElementById('schemesSearchInput')?.addEventListener('input', (e) => this.loadSchemes(e.target.value));

    // 9. Crop Rec Calculation
    document.getElementById('btnCalculateCrops')?.addEventListener('click', () => this.loadCropRecommendations());

    // 10. System Health Status modal trigger
    document.getElementById('btnSystemHealth')?.addEventListener('click', () => this.openModal('healthModal'));
  }

  // ==========================================
  // LANGUAGE & THEME
  // ==========================================
  setLanguage(lang) {
    this.currentLang = lang;
    localStorage.setItem('rythu_lang', lang);
    voiceEngine.setLanguage(lang);
    this.applyLanguage(lang);

    // Re-render components with translated fields
    if (this.cachedDiagnosis) this.renderDiagnosisResult(this.cachedDiagnosis);
    if (this.cachedWeather) this.renderWeather(this.cachedWeather);
    this.loadMandiPrices();
    this.loadCropRecommendations();
    this.loadSchemes();
  }

  applyLanguage(lang) {
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (dict[key]) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = dict[key];
        } else {
          el.textContent = dict[key];
        }
      }
    });
  }

  toggleSunlightMode() {
    document.body.classList.toggle('sunlight-mode');
    const isSunlight = document.body.classList.contains('sunlight-mode');
    localStorage.setItem('rythu_sunlight_mode', isSunlight ? '1' : '0');
  }

  checkSunlightModePreference() {
    if (localStorage.getItem('rythu_sunlight_mode') === '1') {
      document.body.classList.add('sunlight-mode');
    }
  }

  switchTab(tabId) {
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    document.querySelectorAll('.tab-pane').forEach(pane => {
      pane.classList.toggle('active', pane.id === tabId);
    });

    if (tabId === 'farm3dTab' && this.farm3d) {
      this.farm3d.onWindowResize();
    }
  }

  // ==========================================
  // AUTHENTICATION
  // ==========================================
  async fetchCurrentUser() {
    try {
      const res = await fetch(apiEndpoint('/api/auth/me'), {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        this.currentUser = data.user;
        this.updateAuthUI(this.currentUser);
      } else {
        this.logout();
      }
    } catch (e) {
      this.updateAuthUI(null);
    }
  }

  updateAuthUI(user) {
    const authBtn = document.getElementById('headerAuthBtn');
    const profileInfo = document.getElementById('profileFarmerDetails');
    if (!authBtn) return;

    if (user) {
      const tLogout = TRANSLATIONS[this.currentLang]?.btn_logout || "Logout";
      authBtn.innerHTML = `<span>👤 ${user.name}</span> <span style="opacity:0.7">(${tLogout})</span>`;
      if (profileInfo) {
        profileInfo.innerHTML = `
          <div class="telemetry-card" style="margin-top:12px">
            <h3 style="color:var(--accent-gold);margin-bottom:8px">నమస్కారం, ${user.name} గారు!</h3>
            <p><strong>ఫోన్ / Phone:</strong> ${user.phone}</p>
            <p><strong>గ్రామం / Village:</strong> ${user.village || 'N/A'}, ${user.district || 'N/A'}</p>
            <p><strong>ప్రధాన పంట / Primary Crop:</strong> ${user.primary_crop || 'Paddy'}</p>
            <p><strong>విస్తీర్ణం / Land:</strong> ${user.land_acres} ఎకరాలు</p>
          </div>
        `;
      }
    } else {
      const tLogin = TRANSLATIONS[this.currentLang]?.btn_login || "Login / Register";
      authBtn.innerHTML = `<span>🔑 ${tLogin}</span>`;
      if (profileInfo) {
        profileInfo.innerHTML = `<p style="color:var(--text-muted)">లాగిన్ అయిన రైతు వివరాలు ఇక్కడ కనిపిస్తాయి.</p>`;
      }
    }
  }

  toggleAuthMode() {
    const isRegister = document.getElementById('authRegisterFields').style.display !== 'none';
    const regFields = document.getElementById('authRegisterFields');
    const modalTitle = document.getElementById('authModalTitle');
    const submitBtn = document.getElementById('authSubmitBtn');
    const switchBtn = document.getElementById('switchAuthModeBtn');
    const dict = TRANSLATIONS[this.currentLang] || TRANSLATIONS.en;

    if (isRegister) {
      regFields.style.display = 'none';
      modalTitle.textContent = dict.modal_login_title;
      submitBtn.textContent = dict.btn_submit_login;
      switchBtn.textContent = dict.switch_to_register;
    } else {
      regFields.style.display = 'block';
      modalTitle.textContent = dict.modal_register_title;
      submitBtn.textContent = dict.btn_submit_register;
      switchBtn.textContent = dict.switch_to_login;
    }
  }

  async handleAuthSubmit(e) {
    e.preventDefault();
    const isRegister = document.getElementById('authRegisterFields').style.display !== 'none';
    const phone = document.getElementById('authPhone').value.trim();
    const password = document.getElementById('authPassword').value;
    const errorEl = document.getElementById('authErrorText');
    errorEl.textContent = '';

    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
    const payload = { phone, password };

    if (isRegister) {
      payload.name = document.getElementById('authName').value.trim();
      payload.village = document.getElementById('authVillage').value.trim();
      payload.district = document.getElementById('authDistrict').value.trim();
      payload.primary_crop = document.getElementById('authPrimaryCrop').value;
      payload.land_acres = parseFloat(document.getElementById('authAcres').value) || 0;
      payload.preferred_language = this.currentLang;
    }

    try {
      const res = await fetch(apiEndpoint(endpoint), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok) {
        this.token = data.user.token;
        this.currentUser = data.user;
        localStorage.setItem('rythu_token', this.token);
        this.updateAuthUI(this.currentUser);
        this.closeAllModals();
        this.loadScanHistory();
      } else {
        errorEl.textContent = data.error || 'Authentication failed. Please verify credentials.';
      }
    } catch (err) {
      errorEl.textContent = 'Server connection error during authentication.';
    }
  }

  logout() {
    if (this.token) {
      fetch(apiEndpoint('/api/auth/logout'), {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${this.token}` }
      });
    }
    this.token = null;
    this.currentUser = null;
    localStorage.removeItem('rythu_token');
    this.updateAuthUI(null);
  }

  // ==========================================
  // CROP DISEASE DIAGNOSIS
  // ==========================================
  setDiagnosisMethod(method) {
    this.activeDiagnosisMethod = method;
    document.getElementById('tabPhotoBtn')?.classList.toggle('active', method === 'photo');
    document.getElementById('tabVoiceBtn')?.classList.toggle('active', method === 'voice');

    document.getElementById('photoInputSection').style.display = method === 'photo' ? 'block' : 'none';
    document.getElementById('voiceInputSection').style.display = method === 'voice' ? 'block' : 'none';
  }

  handleFileSelect(file) {
    if (!file) return;
    this.selectedImageFile = file;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.getElementById('imagePreview');
      const box = document.getElementById('previewBox');
      if (img && box) {
        img.src = e.target.result;
        box.style.display = 'block';
      }
    };
    reader.readAsDataURL(file);
  }

  removeSelectedImage() {
    this.selectedImageFile = null;
    const box = document.getElementById('previewBox');
    const input = document.getElementById('photoInput');
    if (box) box.style.display = 'none';
    if (input) input.value = '';
  }

  async startCamera() {
    try {
      const streamBox = document.getElementById('cameraStreamBox');
      const video = document.getElementById('cameraVideo');
      this.cameraStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 } }
      });
      video.srcObject = this.cameraStream;
      streamBox.style.display = 'block';
    } catch (e) {
      alert("Unable to access camera: " + e.message);
    }
  }

  stopCamera() {
    if (this.cameraStream) {
      this.cameraStream.getTracks().forEach(track => track.stop());
      this.cameraStream = null;
    }
    const streamBox = document.getElementById('cameraStreamBox');
    if (streamBox) streamBox.style.display = 'none';
  }

  captureCameraFrame() {
    const video = document.getElementById('cameraVideo');
    if (!video || !this.cameraStream) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      this.selectedImageFile = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
      const img = document.getElementById('imagePreview');
      const box = document.getElementById('previewBox');
      if (img && box) {
        img.src = canvas.toDataURL('image/jpeg');
        box.style.display = 'block';
      }
      this.stopCamera();
    }, 'image/jpeg', 0.9);
  }

  async submitDiagnosis() {
    const crop = document.getElementById('cropSelector')?.value || "Paddy / Rice";
    const symptoms = document.getElementById('symptomText')?.value.trim() || "";
    const btn = document.getElementById('btnSubmitDiagnosis');
    const loadingPill = document.getElementById('diagnosisLoadingPill');

    if (btn) btn.disabled = true;
    if (loadingPill) loadingPill.style.display = 'inline-block';

    const headers = {};
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;

    try {
      let res;
      if (this.selectedImageFile) {
        // Multipart Photo Upload
        const formData = new FormData();
        formData.append('photo', this.selectedImageFile);
        formData.append('crop', crop);
        formData.append('symptoms', symptoms);
        formData.append('input_method', this.activeDiagnosisMethod === 'voice' ? 'voice_and_photo' : 'photo_upload');

        res = await fetch(apiEndpoint('/api/diagnose/image'), {
          method: 'POST',
          headers,
          body: formData
        });
      } else {
        // Voice / Text Symptom Diagnosis
        if (!symptoms) {
          alert("Please upload a leaf photo or describe symptoms with voice/text.");
          if (btn) btn.disabled = false;
          if (loadingPill) loadingPill.style.display = 'none';
          return;
        }

        res = await fetch(apiEndpoint('/api/diagnose/text'), {
          method: 'POST',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            crop,
            symptoms,
            input_method: 'voice_speech'
          })
        });
      }

      const data = await res.json();
      if (res.ok && data.diagnosis) {
        this.cachedDiagnosis = data.diagnosis;
        this.renderDiagnosisResult(data.diagnosis);
        this.loadScanHistory();
      } else {
        alert(data.error || "Diagnosis failed. Please check inputs.");
      }
    } catch (err) {
      alert("Network error connecting to diagnostic engine: " + err.message);
    } finally {
      if (btn) btn.disabled = false;
      if (loadingPill) loadingPill.style.display = 'none';
    }
  }

  renderDiagnosisResult(diag) {
    document.getElementById('diagnosisEmptyState').style.display = 'none';
    const card = document.getElementById('diagnosisResultContent');
    card.style.display = 'block';

    // Set localized title
    let title = diag.disease_name;
    if (this.currentLang === 'te' && diag.disease_name_te) {
      title = `${diag.disease_name_te} (${diag.disease_name})`;
    } else if (this.currentLang === 'hi' && diag.disease_name_hi) {
      title = `${diag.disease_name_hi} (${diag.disease_name})`;
    }

    document.getElementById('diagDiseaseTitle').textContent = title;
    
    // Severity badge
    const sevPill = document.getElementById('diagSeverityPill');
    sevPill.textContent = `${diag.severity} Severity (${diag.confidence}% Confidence)`;
    sevPill.className = `severity-pill severity-${diag.severity}`;

    // Causes
    const causesList = document.getElementById('diagCausesList');
    causesList.innerHTML = (diag.possible_causes || []).map(c => `<li>${c}</li>`).join('');

    // Organic remedies
    const orgList = document.getElementById('diagOrganicList');
    orgList.innerHTML = (diag.treatment_organic || []).map(o => `<li>${o}</li>`).join('');

    // Chemical treatments
    const chemList = document.getElementById('diagChemicalList');
    chemList.innerHTML = (diag.treatment_chemical || []).map(c => `<li>${c}</li>`).join('');

    // Preventives
    const prevList = document.getElementById('diagPreventiveList');
    prevList.innerHTML = (diag.preventive_measures || []).map(p => `<li>${p}</li>`).join('');

    // Transparency API status notice (Rule 14)
    const apiBadge = document.getElementById('diagApiNotice');
    apiBadge.innerHTML = `
      <span>⚙️ <strong>Source Engine:</strong> ${diag.ai_provider}</span> | 
      <span><strong>API Configured:</strong> ${diag.api_configured ? 'Yes (Cloud AI)' : 'No (Local Agri Knowledgebase)'}</span>
      <p style="margin-top:4px;font-size:0.75rem">${diag.status_message}</p>
    `;
  }

  speakDiagnosisResult() {
    if (!this.cachedDiagnosis) return;
    const summaries = this.cachedDiagnosis.audio_summaries || {};
    let textToSpeak = summaries.english;
    if (this.currentLang === 'te') textToSpeak = summaries.telugu;
    else if (this.currentLang === 'hi') textToSpeak = summaries.hindi;

    const playBtn = document.getElementById('btnListenDiagnosis');
    if (playBtn) playBtn.classList.add('speaking');

    voiceEngine.speak(textToSpeak, this.currentLang, () => {
      if (playBtn) playBtn.classList.remove('speaking');
    });
  }

  // ==========================================
  // LIVE WEATHER & SPRAY ADVISORY
  // ==========================================
  async loadWeather(lat = 17.9689, lon = 79.5941, name = "Warangal Agri-Zone") {
    try {
      const res = await fetch(apiEndpoint(`/api/weather/live?lat=${lat}&lon=${lon}&location_name=${encodeURIComponent(name)}`));
      const data = await res.json();
      if (data.success) {
        this.cachedWeather = data;
        this.renderWeather(data);
      }
    } catch (e) {
      console.warn("Weather fetch error:", e);
    }
  }

  async loadWeatherForDistrict(districtKey) {
    try {
      const res = await fetch(apiEndpoint(`/api/weather/district/${districtKey}`));
      const data = await res.json();
      if (data.success) {
        this.cachedWeather = data;
        this.renderWeather(data);
      }
    } catch (e) {
      console.warn("District weather fetch error:", e);
    }
  }

  detectUserLocationWeather() {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.loadWeather(pos.coords.latitude, pos.coords.longitude, "My Farm Location");
      },
      (err) => {
        alert("Location access denied. Please select your district from the dropdown.");
      }
    );
  }

  renderWeather(data) {
    const cur = data.current;
    document.getElementById('weatherLocName').textContent = data.location_name;
    document.getElementById('weatherTemp').textContent = `${Math.round(cur.temperature)}°C`;
    document.getElementById('weatherFeelsLike').textContent = `${Math.round(cur.apparent_temperature)}°C`;
    document.getElementById('weatherHumidity').textContent = `${cur.humidity}%`;
    document.getElementById('weatherWind').textContent = `${cur.wind_speed} km/h`;
    document.getElementById('weatherRainProb').textContent = `${cur.rain_probability_today}%`;

    // Quick header badge
    const headerBadge = document.getElementById('headerWeatherQuick');
    if (headerBadge) {
      headerBadge.textContent = `🌦️ ${data.location_name.split(' ')[0]}: ${Math.round(cur.temperature)}°C | Rain: ${cur.rain_probability_today}%`;
    }

    // Spray advisory
    const adv = data.advisory;
    const sprayPill = document.getElementById('sprayStatusPill');
    sprayPill.textContent = adv.spray_condition;
    sprayPill.className = `spray-status-pill spray-${adv.spray_color}`;

    const alertsBox = document.getElementById('weatherAlertsBox');
    alertsBox.innerHTML = (adv.alerts || []).map(a => {
      const msg = this.currentLang === 'te' ? a.te : (this.currentLang === 'hi' ? a.hi : a.en);
      return `<p style="margin-bottom:6px">📌 ${msg}</p>`;
    }).join('');

    // 7-Day Forecast cards
    const forecastBox = document.getElementById('forecast7DayContainer');
    forecastBox.innerHTML = (data.forecast_7day || []).map(d => `
      <div class="forecast-day-card">
        <div style="font-weight:700;font-size:0.85rem">${d.date}</div>
        <div style="font-size:1.4rem;font-weight:900;color:var(--text-primary);margin:4px 0">${Math.round(d.max_temp)}° / ${Math.round(d.min_temp)}°</div>
        <div style="font-size:0.78rem;color:var(--accent-sky)">🌧️ ${d.rain_prob}% (${d.rain_sum} mm)</div>
      </div>
    `).join('');
  }

  speakWeatherAdvisory() {
    if (!this.cachedWeather) return;
    const summaries = this.cachedWeather.audio_summaries || {};
    let text = summaries.english;
    if (this.currentLang === 'te') text = summaries.telugu;
    else if (this.currentLang === 'hi') text = summaries.hindi;

    voiceEngine.speak(text, this.currentLang);
  }

  // ==========================================
  // MANDI MARKET PRICES & MSP
  // ==========================================
  async loadMandiPrices(query = "") {
    try {
      const url = query ? `/api/market/prices?q=${encodeURIComponent(query)}` : '/api/market/prices';
      const res = await fetch(apiEndpoint(url));
      const data = await res.json();
      if (data.success) {
        this.renderMandiCommodities(data.commodities);
      }
    } catch (e) {
      console.warn("Mandi price fetch error:", e);
    }
  }

  renderMandiCommodities(list) {
    const container = document.getElementById('commodityGridContainer');
    if (!container) return;

    container.innerHTML = list.map(c => {
      const name = this.currentLang === 'te' ? c.name_te : (this.currentLang === 'hi' ? c.name_hi : c.name_en);
      const advice = this.currentLang === 'te' ? c.selling_advice_te : (this.currentLang === 'hi' ? c.selling_advice_hi : c.selling_advice_en);
      const mspDiff = c.msp > 0 ? (c.modal_price - c.msp) : null;
      const mspBadge = c.msp > 0 
        ? `<div class="msp-badge">MSP: ₹${c.msp} (${mspDiff >= 0 ? '+' : ''}₹${mspDiff})</div>`
        : `<div class="msp-badge" style="color:var(--text-muted)">Commercial Market Crop</div>`;

      return `
        <div class="commodity-card">
          <div>
            <div class="comm-title-row">
              <span class="comm-name">${name}</span>
              <span style="font-size:0.8rem;background:rgba(255,255,255,0.1);padding:2px 8px;border-radius:12px">${c.trend_pct} 📈</span>
            </div>
            <div style="font-size:0.82rem;color:var(--text-muted)">🏛️ ${c.mandi}</div>
            
            <div class="comm-price-box">
              <div class="comm-modal-price">₹${c.modal_price.toLocaleString()}</div>
              <div style="font-size:0.8rem;color:var(--text-secondary)">per ${c.unit}</div>
              ${mspBadge}
            </div>

            <div style="display:flex;justify-content:space-between;font-size:0.8rem;color:var(--text-secondary);margin:8px 0">
              <span>Min: ₹${c.min_price}</span>
              <span>Max: ₹${c.max_price}</span>
              <span>Arrivals: ${c.arrival_qtl} Qtl</span>
            </div>
          </div>

          <div class="selling-advice-pill">
            <strong>💡 AI సలహా / Advice:</strong> ${advice}
          </div>
        </div>
      `;
    }).join('');
  }

  // ==========================================
  // CROP RECOMMENDATIONS
  // ==========================================
  async loadCropRecommendations() {
    const soil = document.getElementById('recSoilType')?.value || "black";
    const season = document.getElementById('recSeason')?.value || "kharif";
    const water = document.getElementById('recWaterSource')?.value || "medium";
    const acres = document.getElementById('recAcres')?.value || "2.0";

    try {
      const res = await fetch(apiEndpoint(`/api/crops/recommendations?soil=${soil}&season=${season}&water=${water}&acres=${acres}`));
      const data = await res.json();
      if (data.success) {
        this.renderCropRecommendations(data.recommendations);
      }
    } catch (e) {
      console.warn("Crop rec fetch error:", e);
    }
  }

  renderCropRecommendations(recs) {
    const container = document.getElementById('cropRecsContainer');
    if (!container) return;

    container.innerHTML = recs.map(c => {
      const name = this.currentLang === 'te' ? c.name_te : (this.currentLang === 'hi' ? c.name_hi : c.name_en);
      const guide = this.currentLang === 'te' ? c.guidance_te : (this.currentLang === 'hi' ? c.guidance_hi : c.guidance_en);

      return `
        <div class="crop-rec-card">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px">
            <h3 style="font-size:1.15rem;font-weight:800;color:var(--text-primary)">${name}</h3>
            <span class="crop-match-badge">${c.match_score}% Match</span>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:0.85rem;color:var(--text-secondary);margin-bottom:12px">
            <div><strong>Duration:</strong> ${c.duration_days}</div>
            <div><strong>Seed Rate:</strong> ${c.seed_rate_acre}</div>
            <div><strong>Yield/Acre:</strong> ${c.expected_yield_acre}</div>
            <div><strong>Est. Profit:</strong> ${c.est_net_profit_acre}</div>
          </div>

          <div style="background:var(--bg-secondary);padding:10px;border-radius:8px;font-size:0.85rem;border-left:3px solid var(--accent-emerald)">
            🌱 ${guide}
          </div>
        </div>
      `;
    }).join('');
  }

  // ==========================================
  // GOVERNMENT SCHEMES
  // ==========================================
  async loadSchemes(query = "") {
    try {
      const url = query ? `/api/schemes?q=${encodeURIComponent(query)}` : '/api/schemes';
      const res = await fetch(apiEndpoint(url));
      const data = await res.json();
      if (data.success) {
        this.renderSchemes(data.schemes);
      }
    } catch (e) {
      console.warn("Schemes fetch error:", e);
    }
  }

  renderSchemes(schemes) {
    const container = document.getElementById('schemesContainer');
    if (!container) return;

    container.innerHTML = schemes.map(s => {
      const name = this.currentLang === 'te' ? s.name_te : (this.currentLang === 'hi' ? s.name_hi : s.name_en);
      const elig = this.currentLang === 'te' ? s.eligibility_te : (this.currentLang === 'hi' ? s.eligibility_hi : s.eligibility_en);

      return `
        <div class="scheme-card">
          <div>
            <div style="font-size:0.75rem;text-transform:uppercase;color:var(--accent-gold);font-weight:700">${s.type}</div>
            <h3 style="font-size:1.2rem;font-weight:800;margin:4px 0">${name}</h3>
            
            <div class="scheme-benefit">
              ${s.benefit_amount}
            </div>

            <div style="font-size:0.88rem;color:var(--text-primary);margin-bottom:12px">
              <strong>అర్హత / Eligibility:</strong> ${elig}
            </div>
          </div>

          <a href="${s.official_url || '#'}" target="_blank" class="btn-auth" style="text-decoration:none;justify-content:center;margin-top:10px">
            🌐 అధికారిక వెబ్‌సైట్ / Apply Online
          </a>
        </div>
      `;
    }).join('');
  }

  // ==========================================
  // ORGANIC RECIPES & IPM
  // ==========================================
  async loadOrganicRecipes() {
    try {
      const res = await fetch(apiEndpoint('/api/guidance/recipes'));
      const data = await res.json();
      if (data.success) {
        this.renderRecipes(data.recipes);
      }
    } catch (e) {
      console.warn("Recipes fetch error:", e);
    }
  }

  renderRecipes(recipes) {
    const container = document.getElementById('recipesContainer');
    if (!container) return;

    container.innerHTML = recipes.map(r => {
      const name = this.currentLang === 'te' ? r.name_te : (this.currentLang === 'hi' ? r.name_hi : r.name_en);

      return `
        <div class="recipe-card">
          <h3 style="font-size:1.25rem;font-weight:800;color:var(--accent-gold);margin-bottom:8px">${name}</h3>
          <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:14px">${r.purpose}</p>

          <div style="margin-bottom:12px">
            <h4 style="font-size:0.9rem;font-weight:700;color:var(--text-primary)">కావలసిన పదార్థాలు / Ingredients:</h4>
            <ul style="padding-left:20px;font-size:0.85rem;color:var(--text-secondary)">
              ${r.ingredients.map(i => `<li>${i}</li>`).join('')}
            </ul>
          </div>

          <div style="background:var(--bg-secondary);padding:10px;border-radius:8px;font-size:0.85rem;border-left:3px solid var(--accent-emerald)">
            <strong>వాడే విధానం / Application:</strong> ${r.application_method}
          </div>
        </div>
      `;
    }).join('');
  }

  // ==========================================
  // 3D FARM TELEMETRY
  // ==========================================
  async loadFarmTelemetry() {
    try {
      const res = await fetch(apiEndpoint('/api/farm/sectors'));
      const data = await res.json();
      if (data.success) {
        this.renderFarmTelemetry(data.sectors);
      }
    } catch (e) {
      console.warn("Farm telemetry fetch error:", e);
    }
  }

  renderFarmTelemetry(sectors) {
    const container = document.getElementById('farmTelemetryContainer');
    if (!container) return;

    container.innerHTML = sectors.map(sec => `
      <div class="telemetry-card" id="card-${sec.sector_id}">
        <div class="telemetry-header">
          <span class="sector-name">${sec.sector_name}</span>
          <span style="font-size:0.75rem;padding:2px 8px;border-radius:10px;background:rgba(16,185,129,0.2);color:var(--accent-emerald)">
            ${sec.irrigation_status}
          </span>
        </div>

        <div style="font-size:0.8rem;color:var(--text-secondary)">
          నేలలో తేమ / Moisture: <strong>${sec.soil_moisture}%</strong>
        </div>
        <div class="moisture-bar-bg">
          <div class="moisture-bar-fill" style="width:${sec.soil_moisture}%"></div>
        </div>

        <div class="sensor-grid">
          <div>🌡️ Temp: ${sec.soil_temp}°C</div>
          <div>🧪 pH: ${sec.soil_ph}</div>
          <div>🌿 N: ${sec.nitrogen} kg/ha</div>
          <div>🌱 P: ${sec.phosphorus} kg/ha</div>
        </div>

        <button class="irrigate-btn" onclick="app.triggerSectorIrrigation('${sec.sector_id}')">
          💧 డ్రిప్ నీరు అందించండి / Water Sector
        </button>
      </div>
    `).join('');
  }

  async triggerSectorIrrigation(sectorId) {
    try {
      const res = await fetch(apiEndpoint(`/api/farm/sectors/${sectorId}/irrigate`), { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        this.loadFarmTelemetry();
      }
    } catch (e) {
      alert("Failed to activate irrigation: " + e.message);
    }
  }

  highlightSectorInSidebar(sectorId) {
    document.querySelectorAll('.telemetry-card').forEach(c => c.style.borderColor = 'var(--border-color)');
    const card = document.getElementById(`card-${sectorId}`);
    if (card) {
      card.style.borderColor = '#fbbf24';
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  // ==========================================
  // SCAN HISTORY
  // ==========================================
  async loadScanHistory() {
    try {
      const headers = {};
      if (this.token) headers['Authorization'] = `Bearer ${this.token}`;
      const res = await fetch(apiEndpoint('/api/diagnose/history'), { headers });
      const data = await res.json();
      if (data.success) {
        this.renderScanHistory(data.scans);
      }
    } catch (e) {
      console.warn("Scan history fetch error:", e);
    }
  }

  renderScanHistory(scans) {
    const container = document.getElementById('scanHistoryContainer');
    if (!container) return;

    if (!scans || scans.length === 0) {
      container.innerHTML = `<p style="color:var(--text-muted);font-size:0.9rem">No past scans recorded yet.</p>`;
      return;
    }

    container.innerHTML = `
      <div style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse;font-size:0.85rem">
          <thead>
            <tr style="border-bottom:1px solid var(--border-color);text-align:left;color:var(--text-muted)">
              <th style="padding:8px">Crop</th>
              <th style="padding:8px">Diagnosed Issue</th>
              <th style="padding:8px">Severity</th>
              <th style="padding:8px">Date</th>
            </tr>
          </thead>
          <tbody>
            ${scans.map(s => `
              <tr style="border-bottom:1px solid rgba(255,255,255,0.05)">
                <td style="padding:8px;font-weight:700">${s.crop_name}</td>
                <td style="padding:8px;color:var(--accent-emerald)">${s.disease_name}</td>
                <td style="padding:8px"><span class="severity-pill severity-${s.severity}">${s.severity}</span></td>
                <td style="padding:8px;color:var(--text-muted)">${new Date(s.created_at).toLocaleDateString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // ==========================================
  // SYSTEM HEALTH
  // ==========================================
  async fetchSystemHealth() {
    try {
      const res = await fetch(apiEndpoint('/api/health'));
      const data = await res.json();
      const modalContent = document.getElementById('healthStatusContent');
      if (modalContent) {
        modalContent.innerHTML = `
          <div style="margin-bottom:14px">
            <p><strong>Database:</strong> ${data.database_connected ? '🟢 Connected (SQLite)' : '🔴 Disconnected'}</p>
            <p><strong>Server Status:</strong> ${data.status.toUpperCase()}</p>
            <p><strong>Version:</strong> ${data.version}</p>
          </div>

          <h4 style="margin:12px 0 6px 0;color:var(--accent-gold)">External Service Credentials (.env)</h4>
          <ul style="padding-left:20px;font-size:0.9rem">
            <li>Google Gemini AI: ${data.external_services.gemini_ai_configured ? '🟢 Configured' : '⚪ Not Set (Running Local Expert Engine)'}</li>
            <li>Open-Meteo Weather: 🟢 Active (Real-Time Live Satellite/Radar)</li>
            <li>OpenWeather API: ${data.external_services.openweather_configured ? '🟢 Configured' : '⚪ Not Set (Optional)'}</li>
            <li>Data.gov.in Mandi API: ${data.external_services.datagov_configured ? '🟢 Configured' : '⚪ Not Set (Using APMC & MSP Benchmarks)'}</li>
          </ul>

          <div style="margin-top:16px;background:rgba(255,255,255,0.05);padding:10px;border-radius:8px;font-size:0.8rem">
            ℹ️ To add API keys, edit <code>.env</code> in the project folder and restart the application.
          </div>
        `;
      }
    } catch (e) {
      console.warn("Health check error:", e);
    }
  }

  // ==========================================
  // MODAL HELPERS
  // ==========================================
  openModal(modalId) {
    const m = document.getElementById(modalId);
    if (m) m.classList.add('active');
  }

  closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
  }
}

// Instantiate global app instance
let app;
window.addEventListener('DOMContentLoaded', () => {
  app = new RythuMitraApp();
});
