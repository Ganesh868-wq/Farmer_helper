// Base API URL resolver (handles both http:// and direct file:// execution)
const API_BASE = (window.location.protocol === 'file:') ? 'http://127.0.0.1:5000' : '';
function apiEndpoint(path) {
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${API_BASE}${path}`;
}

class RythuMitraApp {
  constructor() {
    this.currentLang = localStorage.getItem('rythu_lang') || 'en'; // English default
    this.token = localStorage.getItem('rythu_token') || null;
    this.currentUser = null;
    this.selectedImageFile = null;
    this.cameraStream = null;
    this.activeDiagnosisMethod = 'photo'; // 'photo' or 'voice'
    this.activeDistrict = 'warangal';
    this.farm3d = null;
    this.cachedDiagnosis = null;
    this.cachedWeather = null;
    this.cachedCrops = null;
    this.cachedSchemes = null;
    this.cachedRecipes = null;
    this.selectedSchemeCategory = 'all';
    this.selectedRecipeCategory = 'all';
    this.currentSchemeSearch = '';
    this.currentRecipeSearch = '';

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

    // 8. Mandi, Schemes & Recipes Search & Filters
    document.getElementById('mandiSearchInput')?.addEventListener('input', (e) => this.loadMandiPrices(e.target.value));

    const schemesSearchInput = document.getElementById('schemesSearchInput');
    if (schemesSearchInput) {
      schemesSearchInput.addEventListener('input', (e) => {
        this.currentSchemeSearch = e.target.value;
        this.loadSchemes(this.currentSchemeSearch, this.selectedSchemeCategory);
      });
    }

    const schemesCatBar = document.getElementById('schemesCategoryBar');
    if (schemesCatBar) {
      schemesCatBar.querySelectorAll('.category-pill').forEach(pill => {
        pill.addEventListener('click', () => {
          schemesCatBar.querySelectorAll('.category-pill').forEach(p => p.classList.remove('active'));
          pill.classList.add('active');
          this.selectedSchemeCategory = pill.dataset.schemeCat || 'all';
          this.loadSchemes(this.currentSchemeSearch, this.selectedSchemeCategory);
        });
      });
    }

    const recipesSearchInput = document.getElementById('recipesSearchInput');
    if (recipesSearchInput) {
      recipesSearchInput.addEventListener('input', (e) => {
        this.currentRecipeSearch = e.target.value;
        this.loadOrganicRecipes(this.currentRecipeSearch, this.selectedRecipeCategory);
      });
    }

    const recipesCatBar = document.getElementById('recipesCategoryBar');
    if (recipesCatBar) {
      recipesCatBar.querySelectorAll('.category-pill').forEach(pill => {
        pill.addEventListener('click', () => {
          recipesCatBar.querySelectorAll('.category-pill').forEach(p => p.classList.remove('active'));
          pill.classList.add('active');
          this.selectedRecipeCategory = pill.dataset.recipeCat || 'all';
          this.loadOrganicRecipes(this.currentRecipeSearch, this.selectedRecipeCategory);
        });
      });
    }

    // 9. Crop Rec Calculation & Enter key
    document.getElementById('btnCalculateCrops')?.addEventListener('click', () => this.loadCropRecommendations());
    document.getElementById('recAcres')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.loadCropRecommendations();
      }
    });

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

    // Dispatch global event for other components (droneController, etc.)
    window.dispatchEvent(new CustomEvent('language:changed', { detail: { lang } }));

    // Re-render components with translated fields
    if (this.currentUser !== undefined) this.updateAuthUI(this.currentUser);
    this.loadFarmTelemetry();
    if (this.cachedDiagnosis) this.renderDiagnosisResult(this.cachedDiagnosis);
    if (this.cachedWeather) this.renderWeather(this.cachedWeather);
    this.loadMandiPrices();
    if (this.cachedCrops) {
      this.renderCropRecommendations(this.cachedCrops.recs, this.cachedCrops.acres);
    } else {
      this.loadCropRecommendations();
    }
    if (this.cachedSchemes) {
      this.renderSchemes(this.cachedSchemes);
    } else {
      this.loadSchemes(this.currentSchemeSearch, this.selectedSchemeCategory);
    }
    if (this.cachedRecipes) {
      this.renderRecipes(this.cachedRecipes);
    } else {
      this.loadOrganicRecipes(this.currentRecipeSearch, this.selectedRecipeCategory);
    }
    this.loadScanHistory();
  }

  applyLanguage(lang) {
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
    document.documentElement.lang = lang;
    if (dict.app_title && dict.app_subtitle) {
      document.title = `${dict.app_title} — ${dict.app_subtitle}`;
    }
    const langSelect = document.getElementById('langSelect');
    if (langSelect && langSelect.value !== lang) {
      langSelect.value = lang;
    }
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
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.dataset.i18nPlaceholder;
      if (dict[key]) {
        el.placeholder = dict[key];
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
    if (tabId === 'cropsTab') {
      const c = document.getElementById('cropRecsContainer');
      if (!c || !c.children.length) this.loadCropRecommendations();
    }
    if (tabId === 'schemesTab') {
      const c = document.getElementById('schemesContainer');
      if (!c || !c.children.length) this.loadSchemes(this.currentSchemeSearch, this.selectedSchemeCategory);
    }
    if (tabId === 'guidanceTab') {
      const c = document.getElementById('recipesContainer');
      if (!c || !c.children.length) this.loadOrganicRecipes(this.currentRecipeSearch, this.selectedRecipeCategory);
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
    const dict = TRANSLATIONS[this.currentLang] || TRANSLATIONS.en;

    if (user) {
      const tLogout = dict.btn_logout || "Logout";
      authBtn.innerHTML = `<span>👤 ${user.name}</span> <span style="opacity:0.7">(${tLogout})</span>`;
      if (profileInfo) {
        const welcomeText = this.currentLang === 'te' 
          ? `నమస్కారం, ${user.name} గారు!`
          : (this.currentLang === 'hi' ? `नमस्ते, ${user.name} जी!` : `Welcome, ${user.name}!`);
        const phoneLabel = dict.profile_phone || "Phone";
        const villageLabel = dict.profile_village || "Village";
        const districtLabel = dict.profile_district || "District";
        const cropLabel = dict.profile_crop || "Primary Crop";
        const landLabel = dict.profile_land || "Land Size";
        const acresUnit = dict.profile_acres_unit || "Acres";

        profileInfo.innerHTML = `
          <div class="telemetry-card" style="margin-top:12px">
            <h3 style="color:var(--accent-gold);margin-bottom:8px">${welcomeText}</h3>
            <p><strong>${phoneLabel}:</strong> ${user.phone}</p>
            <p><strong>${villageLabel}:</strong> ${user.village || 'N/A'}, <strong>${districtLabel}:</strong> ${user.district || 'N/A'}</p>
            <p><strong>${cropLabel}:</strong> ${user.primary_crop || 'Paddy'}</p>
            <p><strong>${landLabel}:</strong> ${user.land_acres} ${acresUnit}</p>
          </div>
        `;
      }
    } else {
      const tLogin = dict.btn_login || "Login / Register";
      authBtn.innerHTML = `<span>🔑 ${tLogin}</span>`;
      if (profileInfo) {
        profileInfo.innerHTML = `<p style="color:var(--text-muted)">${dict.profile_empty || "Login to view farmer profile details."}</p>`;
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
        formData.append('language', this.currentLang);

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
            input_method: 'voice_speech',
            language: this.currentLang
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
    const dict = TRANSLATIONS[this.currentLang] || TRANSLATIONS.en;
    document.getElementById('weatherLocName').textContent = data.location_name;
    document.getElementById('weatherTemp').textContent = `${Math.round(cur.temperature)}°C`;
    document.getElementById('weatherFeelsLike').textContent = `${Math.round(cur.apparent_temperature)}°C`;
    document.getElementById('weatherHumidity').textContent = `${cur.humidity}%`;
    document.getElementById('weatherWind').textContent = `${cur.wind_speed} km/h`;
    document.getElementById('weatherRainProb').textContent = `${cur.rain_probability_today}%`;

    // Quick header badge
    const headerBadge = document.getElementById('headerWeatherQuick');
    if (headerBadge) {
      const rainWord = dict.weather_rain_label || "Rain";
      headerBadge.textContent = `🌦️ ${data.location_name.split(' ')[0]}: ${Math.round(cur.temperature)}°C | ${rainWord}: ${cur.rain_probability_today}%`;
    }

    // Spray advisory
    const adv = data.advisory;
    const sprayPill = document.getElementById('sprayStatusPill');
    let sprayText = adv.spray_condition;
    if (adv.spray_color === 'emerald') {
      sprayText = dict.spray_favorable || 'Favorable for Spraying';
    } else if (adv.spray_color === 'rose') {
      sprayText = dict.spray_unfavorable_rain || 'Unfavorable (Rain Alert)';
    } else if (adv.spray_color === 'amber') {
      sprayText = dict.spray_unfavorable_wind || 'Unfavorable (High Wind)';
    }
    sprayPill.textContent = sprayText;
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

    const dict = TRANSLATIONS[this.currentLang] || TRANSLATIONS.en;

    container.innerHTML = list.map(c => {
      const name = this.currentLang === 'te' ? c.name_te : (this.currentLang === 'hi' ? c.name_hi : c.name_en);
      const advice = this.currentLang === 'te' ? c.selling_advice_te : (this.currentLang === 'hi' ? c.selling_advice_hi : c.selling_advice_en);
      const mspDiff = c.msp > 0 ? (c.modal_price - c.msp) : null;
      const mspBadge = c.msp > 0 
        ? `<div class="msp-badge">MSP: ₹${c.msp} (${mspDiff >= 0 ? '+' : ''}₹${mspDiff})</div>`
        : `<div class="msp-badge" style="color:var(--text-muted)">${dict.commercial_crop || 'Commercial Market Crop'}</div>`;

      const perUnitLabel = dict.per_unit || 'per';
      const arrivalsLabel = dict.arrivals_label || 'Arrivals';
      const minLabel = dict.min_price_label || 'Min';
      const maxLabel = dict.max_price_label || 'Max';
      const aiAdviceLabel = dict.ai_advice_label || '💡 AI Advice:';

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
              <div style="font-size:0.8rem;color:var(--text-secondary)">${perUnitLabel} ${c.unit}</div>
              ${mspBadge}
            </div>

            <div style="display:flex;justify-content:space-between;font-size:0.8rem;color:var(--text-secondary);margin:8px 0">
              <span>${minLabel}: ₹${c.min_price}</span>
              <span>${maxLabel}: ₹${c.max_price}</span>
              <span>${arrivalsLabel}: ${c.arrival_qtl} Qtl</span>
            </div>
          </div>

          <div class="selling-advice-pill">
            <strong>${aiAdviceLabel}</strong> ${advice}
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
    const acresRaw = document.getElementById('recAcres')?.value || "2.0";
    const acres = parseFloat(acresRaw);

    const validationEl = document.getElementById('cropRecsValidationMsg');
    if (isNaN(acres) || acres < 0.1 || acres > 500) {
      if (validationEl) {
        const msg = TRANSLATIONS[this.currentLang]?.invalid_acres || "Please enter a valid land size between 0.1 and 500 acres.";
        validationEl.textContent = `⚠️ ${msg}`;
        validationEl.style.display = 'block';
      }
      return;
    }

    if (validationEl) {
      validationEl.style.display = 'none';
      validationEl.textContent = '';
    }

    const container = document.getElementById('cropRecsContainer');
    if (container) {
      const loadingMsg = TRANSLATIONS[this.currentLang]?.loading_crops || "Calculating optimal crop matches...";
      container.innerHTML = `
        <div class="state-box loading">
          <div class="state-icon">🌾</div>
          <div class="state-title">${loadingMsg}</div>
        </div>
      `;
    }

    try {
      const res = await fetch(apiEndpoint(`/api/crops/recommendations?soil=${soil}&season=${season}&water=${water}&acres=${acres}`));
      const data = await res.json();
      if (data.success && data.recommendations && data.recommendations.length > 0) {
        this.cachedCrops = { recs: data.recommendations, acres: acres };
        this.renderCropRecommendations(data.recommendations, acres);
        return;
      }
    } catch (e) {
      console.warn("Crop rec fetch error, using local recommendation engine:", e);
    }

    // Local fallback calculation engine
    const localRecs = this.calculateLocalCropRecommendations(soil, season, water, acres);
    this.cachedCrops = { recs: localRecs, acres: acres };
    this.renderCropRecommendations(localRecs, acres);
  }

  renderCropRecommendations(recs, acres = 2.0) {
    const container = document.getElementById('cropRecsContainer');
    if (!container) return;

    if (!recs || recs.length === 0) {
      const emptyMsg = TRANSLATIONS[this.currentLang]?.no_crops_found || "No matching crops found for selected parameters.";
      container.innerHTML = `
        <div class="state-box empty-state">
          <div class="state-icon">🌾</div>
          <div class="state-title">${emptyMsg}</div>
        </div>
      `;
      return;
    }

    container.innerHTML = recs.map(c => {
      const name = this.currentLang === 'te' ? c.name_te : (this.currentLang === 'hi' ? c.name_hi : c.name_en);
      const guide = this.currentLang === 'te' ? c.guidance_te : (this.currentLang === 'hi' ? c.guidance_hi : c.guidance_en);
      const suitability = this.currentLang === 'te' 
        ? (c.suitability_reason_te || c.suitability_reason_en || '')
        : (this.currentLang === 'hi' ? (c.suitability_reason_hi || c.suitability_reason_en || '') : (c.suitability_reason_en || ''));
      
      const badgeClass = c.match_score >= 85 ? 'high' : (c.match_score >= 70 ? 'medium' : '');
      const projProfit = c.projected_profit_total 
        ? `₹${Number(c.projected_profit_total).toLocaleString()}`
        : c.est_net_profit_acre;

      const durLabel = this.currentLang === 'te' ? 'పంట కాలం' : (this.currentLang === 'hi' ? 'अवधि' : 'Duration');
      const waterLabel = this.currentLang === 'te' ? 'నీటి అవసరం' : (this.currentLang === 'hi' ? 'जल आवश्यकता' : 'Water Need');
      const seedLabel = this.currentLang === 'te' ? 'విత్తన మోతాదు' : (this.currentLang === 'hi' ? 'बीज दर' : 'Seed Rate');
      const yieldLabel = this.currentLang === 'te' ? 'దిగుబడి / ఎకరా' : (this.currentLang === 'hi' ? 'पैदावार / एकड़' : 'Yield / Acre');
      const profitLabel = this.currentLang === 'te' ? 'నికర లాభం / ఎకరా' : (this.currentLang === 'hi' ? 'मुनाफा / एकड़' : 'Profit / Acre');
      const projLabel = this.currentLang === 'te' ? `మొత్తం లాభం (${acres} ఎకరాలు)` : (this.currentLang === 'hi' ? `कुल लाभ (${acres} एकड़)` : `Total Profit (${acres} Acres)`);

      return `
        <div class="crop-rec-card">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px">
            <h3 style="font-size:1.15rem;font-weight:800;color:var(--text-primary)">${name}</h3>
            <span class="crop-match-badge ${badgeClass}">${c.match_score}% Match</span>
          </div>

          ${suitability ? `<div style="font-size:0.83rem;color:var(--accent-emerald);font-weight:600;margin-bottom:10px;background:rgba(16,185,129,0.1);padding:6px 10px;border-radius:6px">✓ ${suitability}</div>` : ''}

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:0.85rem;color:var(--text-secondary);margin-bottom:12px">
            <div><strong>${durLabel}:</strong> ${c.duration_days}</div>
            <div><strong>${waterLabel}:</strong> ${c.water_requirement_desc || c.water_need || 'Medium'}</div>
            <div><strong>${seedLabel}:</strong> ${c.seed_rate_acre}</div>
            <div><strong>${yieldLabel}:</strong> ${c.expected_yield_acre}</div>
            <div><strong>${profitLabel}:</strong> ${c.est_net_profit_acre}</div>
            <div style="color:var(--accent-gold);font-weight:700"><strong>${projLabel}:</strong> ${projProfit}</div>
          </div>

          <div style="background:var(--bg-secondary);padding:10px;border-radius:8px;font-size:0.85rem;border-left:3px solid var(--accent-emerald)">
            🌱 ${guide}
          </div>
        </div>
      `;
    }).join('');
  }

  calculateLocalCropRecommendations(soil, season, water, acres) {
    const catalog = [
      {
        id: "paddy_kharif",
        name_en: "Paddy / Rice (BPT 5204 / RNR 15048 Telangana Sona)",
        name_te: "వరి (తెలంగాణ సోనా / సాంబ మసూరి)",
        name_hi: "धान (तेलंगाना सोना / सांबा मसूरी)",
        suitable_soils: ["clay", "loam", "black"],
        suitable_seasons: ["kharif", "rabi"],
        water_need: "high",
        water_requirement_desc: "High (Canal / Continuous Borewell)",
        duration_days: "125 - 145 days",
        seed_rate_acre: "20 - 25 kg",
        expected_yield_acre: "25 - 32 Quintals",
        est_net_profit_acre: "₹32,000 - ₹45,000",
        profit_min: 32000, profit_max: 45000,
        guidance_en: "RNR 15048 (Telangana Sona) has low glycemic index and resistance to blast disease. Best for canal and borewell irrigated tracts.",
        guidance_te: "ఆర్.ఎన్.ఆర్ 15048 (తెలంగాణ సోనా) షుగర్ తక్కువ ఉన్న వరి రకం మరియు అగ్గి తెగులును తట్టుకుంటుంది. కాలువలు, బోరుబావుల కింద అధిక దిగుబడి ఇస్తుంది.",
        guidance_hi: "तेलंगाना सोना कम ग्लाइसेमिक इंडेक्स वाली किस्म है जो ब्लास्ट रोग को सहन कर सकती है।"
      },
      {
        id: "cotton_bt",
        name_en: "Cotton (Bollgard II Hybrids)",
        name_te: "పత్తి (బీటీ హైబ్రిడ్)",
        name_hi: "कपास (बीटी संकर)",
        suitable_soils: ["black", "loam"],
        suitable_seasons: ["kharif"],
        water_need: "medium",
        water_requirement_desc: "Medium (Requires well-drained soil)",
        duration_days: "150 - 165 days",
        seed_rate_acre: "2 packets (900g)",
        expected_yield_acre: "10 - 16 Quintals",
        est_net_profit_acre: "₹45,000 - ₹75,000",
        profit_min: 45000, profit_max: 75000,
        guidance_en: "Requires deep black cotton soils with good drainage. Install pheromone traps by 45th day to monitor pink bollworm.",
        guidance_te: "లోతైన నల్లరేగడి నేలల్లో అద్భుతమైన దిగుబడి వస్తుంది. గులాబీ రంగు పురుగు నివారణకు 45వ రోజు నుండే లింగాకర్షక బుట్టలను అమర్చాలి.",
        guidance_hi: "गहरी काली मिट्टी में अच्छी जल निकासी के साथ लगाएं। 45वें दिन फेरोमोन ट्रैप लगाएं।"
      },
      {
        id: "red_chilli",
        name_en: "Red Chilli (Teja / Armoor / US 341)",
        name_te: "ఎర్ర మిరప (తేజ / ఆర్మోర్)",
        name_hi: "लाल मिर्च (तेजा / आर्मूर)",
        suitable_soils: ["black", "red", "loam"],
        suitable_seasons: ["kharif", "rabi"],
        water_need: "medium",
        water_requirement_desc: "Medium (Drip Irrigation Recommended)",
        duration_days: "180 - 210 days",
        seed_rate_acre: "80 - 100g (nursery seedlings)",
        expected_yield_acre: "20 - 30 Quintals (Dry)",
        est_net_profit_acre: "₹1,20,000 - ₹2,50,000",
        profit_min: 120000, profit_max: 250000,
        guidance_en: "High-value commercial cash crop. Adopt drip irrigation and plastic mulching. Requires vigilant management of thrips and mites.",
        guidance_te: "అధిక ఆదాయాన్నిచ్చే వాణిజ్య పంట. డ్రిప్ ఇరిగేషన్ మరియు మల్చింగ్ షీట్ ఉపయోగించడం ద్వారా తామర పురుగుల ఉధృతిని తగ్గించి రెట్టింపు లాభం పొందవచ్చు.",
        guidance_hi: "उच्च मूल्य वाली नकदी फसल। ड्रिप सिंचाई और मल्चिंग अपनाएं।"
      },
      {
        id: "maize_hybrid",
        name_en: "Hybrid Maize / Corn (DKC 9108 / Pioneer)",
        name_te: "హైబ్రిడ్ మొక్కజొన్న",
        name_hi: "संकर मक्का",
        suitable_soils: ["red", "black", "loam", "sandy"],
        suitable_seasons: ["kharif", "rabi", "summer"],
        water_need: "medium",
        water_requirement_desc: "Medium (5 - 6 irrigations)",
        duration_days: "105 - 120 days",
        seed_rate_acre: "7 - 8 kg",
        expected_yield_acre: "28 - 36 Quintals",
        est_net_profit_acre: "₹35,000 - ₹50,000",
        profit_min: 35000, profit_max: 50000,
        guidance_en: "Fast-growing cereal with ready industrial poultry demand. Suitable for both Kharif and Rabi in red and light black soils.",
        guidance_te: "తక్కువ కాలపరిమితితో నికర ఆదాయం ఇచ్చే పంట. ఎర్ర నేలలు, తేలికపాటి నల్లరేగడి నేలల్లో అద్భుతంగా పండుతుంది.",
        guidance_hi: "कम समय में तैयार होने वाली फसल। पोल्ट्री उद्योगों में अच्छी मांग रहती है।"
      },
      {
        id: "groundnut_rabi",
        name_en: "Groundnut / Peanut (Kadiri 6 / TAG 24 / Dharani)",
        name_te: "వేరుశనగ (కదిరి 6 / ధరణి)",
        name_hi: "मूंगफली (कदिरी 6 / धरणी)",
        suitable_soils: ["red", "sandy", "loam"],
        suitable_seasons: ["rabi", "summer", "kharif"],
        water_need: "low",
        water_requirement_desc: "Low to Moderate (Light sprinkler/drip)",
        duration_days: "100 - 115 days",
        seed_rate_acre: "40 - 50 kg kernels",
        expected_yield_acre: "14 - 18 Quintals",
        est_net_profit_acre: "₹45,000 - ₹65,000",
        profit_min: 45000, profit_max: 65000,
        guidance_en: "Ideal for sandy loam and red chalka soils. Requires gypsum application @ 200kg/acre at pegging stage for bold pod filling.",
        guidance_te: "ఎర్ర చెల్క నేలలు, ఇసుక రేగడి నేలలకు అత్యుత్తమ పంట. ఊడలు దిగే దశలో ఎకరాకు 200 కేజీల జిప్సం వేస్తే కాయలు లావుగా ఊరుతాయి.",
        guidance_hi: "रेतीली और लाल मिट्टी के लिए उत्तम फसल। जिप्सम का प्रयोग अवश्य करें।"
      },
      {
        id: "red_gram_pigeonpea",
        name_en: "Red Gram / Toor (PRG 176 / Asha / WRG 65)",
        name_te: "కందులు (పి.ఆర్.జి 176 / ఆశ)",
        name_hi: "अरहर / तुअर (पीआरजी 176)",
        suitable_soils: ["red", "black", "loam"],
        suitable_seasons: ["kharif"],
        water_need: "low",
        water_requirement_desc: "Low (Drought Hardy / Rainfed)",
        duration_days: "140 - 160 days",
        seed_rate_acre: "4 - 5 kg sole / 1.5kg intercrop",
        expected_yield_acre: "8 - 12 Quintals",
        est_net_profit_acre: "₹45,000 - ₹70,000",
        profit_min: 45000, profit_max: 70000,
        guidance_en: "Drought-hardy pulse crop with excellent nitrogen fixation. Highly recommended as sole crop or 1:4 intercrop with cotton/maize.",
        guidance_te: "వర్షాభావ పరిస్థితులను తట్టుకుని భూసారాన్ని పెంచే పప్పుదినుసుల పంట. పత్తి లేదా మొక్కజొన్నలో అంతరపంటగా లేదా ప్రధాన పంటగా సాగు చేయవచ్చు.",
        guidance_hi: "सूखा रोधी दलहन फसल। कपास या मक्का के साथ अंतःफसल के रूप में भी बहुत लाभकारी।"
      },
      {
        id: "millets_ragi",
        name_en: "Finger Millet / Ragi (Bharathi / Vakula)",
        name_te: "రాగులు / తైదలు",
        name_hi: "रागी / मडुआ",
        suitable_soils: ["red", "sandy", "loam"],
        suitable_seasons: ["kharif", "rabi", "summer"],
        water_need: "low",
        water_requirement_desc: "Very Low (Climate resilient)",
        duration_days: "95 - 105 days",
        seed_rate_acre: "4 - 5 kg",
        expected_yield_acre: "10 - 14 Quintals",
        est_net_profit_acre: "₹28,000 - ₹40,000",
        profit_min: 28000, profit_max: 40000,
        guidance_en: "Climate-resilient superfood with minimal water and zero chemical pesticide needs. Guaranteed high domestic market prices.",
        guidance_te: "తక్కువ నీటితో, రసాయన మందుల అవసరం లేకుండా పండే బలవర్ధకమైన చిరుధాన్యం. ఆరోగ్య స్పృహ పెరగడంతో నగరాల్లో మంచి డిమాండ్ ఉంది.",
        guidance_hi: "कम पानी और बिना रसायनों के उगने वाला पौष्टिक मोटा अनाज।"
      }
    ];

    const ranked = [];
    catalog.forEach(crop => {
      let score = 55;
      const reasons_en = [];
      const reasons_te = [];

      if (crop.suitable_soils.includes(soil)) {
        score += 22;
        reasons_en.push(`Highly compatible with ${soil} soil`);
        reasons_te.push(`${soil} నేలకు అత్యంత అనుకూలమైనది`);
      } else {
        score -= 10;
        reasons_en.push("Requires soil conditioners");
        reasons_te.push("నేల స్వభావం మెరుగుపరచడానికి సేంద్రియ ఎరువులు అవసరం");
      }

      if (crop.suitable_seasons.includes(season)) {
        score += 15;
        reasons_en.push(`Optimal for ${season} season`);
        reasons_te.push(`${season} కాలానికి అనువైనది`);
      } else {
        score -= 15;
      }

      if (water === "canal" && ["high", "medium"].includes(crop.water_need)) score += 15;
      else if (water === "borewell" && ["medium", "low"].includes(crop.water_need)) score += 15;
      else if (water === "rainfed" && crop.water_need === "low") score += 18;
      else score += 5;

      const finalScore = Math.min(98, Math.max(45, score));
      const midProfit = Math.round((crop.profit_min + crop.profit_max) / 2);
      const totalProfit = Math.round(midProfit * acres);

      ranked.push({
        ...crop,
        match_score: finalScore,
        suitability_reason_en: reasons_en.join(". "),
        suitability_reason_te: reasons_te.join(". "),
        projected_profit_total: totalProfit
      });
    });

    ranked.sort((a, b) => b.match_score - a.match_score);
    return ranked;
  }

  // ==========================================
  // GOVERNMENT SCHEMES
  // ==========================================
  async loadSchemes(query = this.currentSchemeSearch, category = this.selectedSchemeCategory) {
    const q = (query || "").trim();
    const cat = category || "all";

    const container = document.getElementById('schemesContainer');
    if (container && (!this.cachedSchemes || q || cat !== 'all')) {
      const loadingMsg = TRANSLATIONS[this.currentLang]?.loading_schemes || "Loading verified government schemes...";
      container.innerHTML = `
        <div class="state-box loading">
          <div class="state-icon">🏛️</div>
          <div class="state-title">${loadingMsg}</div>
        </div>
      `;
    }

    try {
      const url = `/api/schemes?q=${encodeURIComponent(q)}&category=${encodeURIComponent(cat)}`;
      const res = await fetch(apiEndpoint(url));
      const data = await res.json();
      if (data.success && data.schemes) {
        this.cachedSchemes = data.schemes;
        this.renderSchemes(data.schemes);
        return;
      }
    } catch (e) {
      console.warn("Schemes fetch error, using local schemes directory:", e);
    }

    const fallback = this.fallbackSchemes(q, cat);
    this.cachedSchemes = fallback;
    this.renderSchemes(fallback);
  }

  renderSchemes(schemes) {
    const container = document.getElementById('schemesContainer');
    if (!container) return;

    if (!schemes || schemes.length === 0) {
      const emptyMsg = TRANSLATIONS[this.currentLang]?.no_schemes_found || "No schemes match your search or filter.";
      container.innerHTML = `
        <div class="state-box empty-state">
          <div class="state-icon">🏛️</div>
          <div class="state-title">${emptyMsg}</div>
        </div>
      `;
      return;
    }

    container.innerHTML = schemes.map(s => {
      const name = this.currentLang === 'te' ? s.name_te : (this.currentLang === 'hi' ? s.name_hi : s.name_en);
      const purpose = this.currentLang === 'te' ? (s.purpose_te || s.purpose_en) : (this.currentLang === 'hi' ? (s.purpose_hi || s.purpose_en) : s.purpose_en);
      const elig = this.currentLang === 'te' ? s.eligibility_te : (this.currentLang === 'hi' ? s.eligibility_hi : s.eligibility_en);
      const appSteps = this.currentLang === 'te' ? (s.application_steps_te || s.application_steps_en) : s.application_steps_en;
      const docs = s.documents_required || [];

      const eligLabel = this.currentLang === 'te' ? 'అర్హత' : (this.currentLang === 'hi' ? 'पात्रता' : 'Eligibility');
      const docsLabel = this.currentLang === 'te' ? 'కావలసిన పత్రాలు' : (this.currentLang === 'hi' ? 'आवश्यक दस्तावेज' : 'Documents Required');
      const stepsLabel = this.currentLang === 'te' ? 'దరఖాస్తు విధానం' : (this.currentLang === 'hi' ? 'आवेदन प्रक्रिया' : 'Application Process');
      const applyBtnText = this.currentLang === 'te' ? '🌐 అధికారిక వెబ్‌సైట్ / Apply Online' : (this.currentLang === 'hi' ? '🌐 आधिकारिक पोर्टल / Apply Online' : '🌐 Official Portal / Apply Online');

      return `
        <div class="scheme-card">
          <div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
              <span style="font-size:0.75rem;text-transform:uppercase;color:var(--accent-gold);font-weight:700">${s.type || 'Government Scheme'}</span>
              ${s.status ? `<span style="font-size:0.75rem;padding:2px 8px;border-radius:10px;background:rgba(16,185,129,0.15);color:var(--accent-emerald)">${s.status}</span>` : ''}
            </div>

            <h3 style="font-size:1.2rem;font-weight:800;margin:4px 0">${name}</h3>

            <div class="scheme-benefit">
              ${s.benefit_amount}
            </div>

            ${purpose ? `<p style="font-size:0.88rem;color:var(--text-secondary);margin:8px 0">${purpose}</p>` : ''}

            <div style="font-size:0.86rem;color:var(--text-primary);margin-bottom:10px;background:var(--bg-secondary);padding:10px;border-radius:8px;border-left:3px solid var(--accent-gold)">
              <strong>${eligLabel}:</strong> ${elig}
            </div>

            ${docs.length > 0 ? `
              <div style="font-size:0.82rem;color:var(--text-secondary);margin-bottom:10px">
                <strong style="color:var(--text-primary)">📄 ${docsLabel}:</strong>
                <ul style="padding-left:18px;margin:4px 0 0 0">
                  ${docs.map(d => `<li>${d}</li>`).join('')}
                </ul>
              </div>
            ` : ''}

            ${appSteps ? `
              <div style="font-size:0.82rem;color:var(--text-muted);margin-bottom:10px">
                <strong>📝 ${stepsLabel}:</strong> ${appSteps}
              </div>
            ` : ''}

            ${s.helpline ? `
              <div style="font-size:0.8rem;color:var(--accent-sky);margin-bottom:12px">
                📞 <strong>Helpline:</strong> ${s.helpline}
              </div>
            ` : ''}
          </div>

          <a href="${s.official_url || '#'}" target="_blank" rel="noopener noreferrer" class="btn-auth" style="text-decoration:none;justify-content:center;margin-top:10px">
            ${applyBtnText}
          </a>
        </div>
      `;
    }).join('');
  }

  fallbackSchemes(query = "", category = "all") {
    const all = [
      {
        id: "pm_kisan",
        name_en: "PM-KISAN Samman Nidhi Yojana",
        name_te: "పీఎం కిసాన్ సమ్మాన్ నిధి యోజన",
        name_hi: "पीएम-किसान सम्मान निधि योजना",
        category: "central",
        type: "Central Government",
        purpose_en: "Direct income support of ₹6,000/year to landholding farmer families across India for farm inputs and household expenses.",
        purpose_te: "రైతుల ఖాతాల్లో నేరుగా పంట పెట్టుబడి సహాయం జమ చేసి వ్యవసాయ ఖర్చులకు మరియు కుటుంబ అవసరాలకు అండగా నిలవడం.",
        benefit_amount: "₹6,000 / year (3 installments of ₹2,000)",
        eligibility_en: "All landholding farmer families having cultivable agricultural land registered in their name.",
        eligibility_te: "పట్టాదారు పాస్ పుస్తకం కలిగి, స్వంత వ్యవసాయ భూమి ఉన్న రైతులందరికీ వర్తిస్తుంది.",
        eligibility_hi: "जिनके नाम पर कृषि योग्य भूमि है, वे सभी किसान परिवार पात्र हैं।",
        documents_required: ["Aadhaar Card linked with active mobile", "Pattadar Passbook / Land Record (ROR 1-B / Pahani)", "Bank Passbook with Aadhaar DBT seeding", "e-KYC verification"],
        application_steps_en: "1. Visit pmkisan.gov.in. 2. Register under 'New Farmer Registration'. 3. Enter Aadhaar and land details. 4. Complete biometric/OTP e-KYC.",
        application_steps_te: "1. pmkisan.gov.in లేదా మీసేవ సందర్శించండి. 2. ఆధార్ మరియు భూమి వివరాలు ఇవ్వండి. 3. ఇ-కెవైసి (e-KYC) పూర్తి చేయండి.",
        official_url: "https://pmkisan.gov.in/",
        status: "Active & Ongoing",
        helpline: "155261 / 1800-115-526"
      },
      {
        id: "rythu_bharosa",
        name_en: "Rythu Bharosa / Rythu Bandhu Investment Support",
        name_te: "రైతు భరోసా / రైతు బంధు పెట్టుబడి సహాయం",
        name_hi: "रैतु भरोसा / किसान निवेश सहायता",
        category: "state",
        type: "State Government (AP / Telangana)",
        purpose_en: "Timely financial investment assistance before Kharif and Rabi sowing seasons to prevent rural indebtedness and purchase quality seeds/fertilizers.",
        purpose_te: "ఖరీఫ్ మరియు రబీ విత్తనాలు వేసే సమయానికి ముందే రైతులకు పంట పెట్టుబడి అందించి అప్పులపాలు కాకుండా కాపాడటం.",
        benefit_amount: "Up to ₹13,500 - ₹15,000 / year",
        eligibility_en: "Farmer landholders and eligible tenant farmers holding genuine cultivation permits (CCRC).",
        eligibility_te: "వ్యవసాయ భూమి ఉన్న రైతులు మరియు CCRC అనుమతి పత్రం కలిగిన కౌలు రైతులకు నేరుగా బ్యాంకు ఖాతాలో జమ చేయబడుతుంది.",
        eligibility_hi: "राज्य के भूस्वामी और पात्र पट्टाधारक किसान।",
        documents_required: ["Pattadar Passbook / 1B Namoona / Webland", "Aadhaar Card", "Bank Account seeded with Aadhaar", "CCRC card for tenant farmers"],
        application_steps_en: "1. Village Agricultural Assistant (VAA) verifies Webland patta. 2. Social audit list displayed in RBK. 3. Direct bank transfer.",
        application_steps_te: "1. రైతు భరోసా కేంద్రం (RBK) లో గ్రామ వ్యవసాయ సహాయకుడు ధ్రువీకరిస్తారు. 2. అర్హుల జాబితా ఆడిట్. 3. నేరుగా ఖాతాలో జమ.",
        official_url: "https://apagrisnet.gov.in/",
        status: "Active & Ongoing",
        helpline: "1902 (Toll Free)"
      },
      {
        id: "pmfby_crop_insurance",
        name_en: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
        name_te: "ప్రధాన మంత్రి ఫసల్ బీమా యోజన (సమగ్ర పంటల బీమా)",
        name_hi: "प्रधानमंत्री फसल बीमा योजना (पीएमएफबीवाई)",
        category: "credit",
        type: "Central & State Joint Insurance",
        purpose_en: "Comprehensive financial shield covering yield losses caused by cyclones, droughts, floods, pest epidemics, and unseasonal rains.",
        purpose_te: "తుఫానులు, వరదలు, అకాల వర్షాలు మరియు తెగుళ్ల వల్ల పంట నష్టపోయినప్పుడు రైతులకు పూర్తి ఆర్థిక పరిహారం అందించడం.",
        benefit_amount: "Up to 100% sum insured on crop yield loss",
        eligibility_en: "All farmers growing notified crops (Paddy, Cotton, Chilli, Groundnut, Maize, Pulses). Nominal premium: 2% Kharif, 1.5% Rabi.",
        eligibility_te: "ఖరీఫ్ పంటలకు కేవలం 2%, రబీ పంటలకు 1.5% నామమాత్రపు ప్రీమియంతో పూర్తి పంట నష్టపరిహార రక్షణ లభిస్తుంది.",
        eligibility_hi: "प्राकृतिक आपदाओं और कीटों से फसल नष्ट होने पर शत-प्रतिशत तक मुआवजा।",
        documents_required: ["Crop Sowing Certificate (Vithana Dhruveekarana) / e-Crop booking receipt", "Pattadar Passbook or CCRC agreement", "Bank Passbook copy and linked Aadhaar"],
        application_steps_en: "1. Complete e-Crop booking. 2. Premium deducted through KCC bank or CSC portal. 3. Report localized damage within 72 hours via Crop Insurance App.",
        application_steps_te: "1. ఈ-పంట (e-Crop) నమోదు చేయించండి. 2. బ్యాంక్ లేదా CSC ద్వారా ప్రీమియం చెల్లింపు. 3. నష్టం జరిగితే 72 గంటల్లోగా టోల్ ఫ్రీ నంబర్‌కు తెలియజేయాలి.",
        official_url: "https://pmfby.gov.in/",
        status: "Active & Ongoing",
        helpline: "14447"
      },
      {
        id: "pm_kusum_solar",
        name_en: "PM-KUSUM Solar Agricultural Pumps Scheme",
        name_te: "పీఎం-కుసుమ్ సోలార్ వ్యవసాయ పంపుల పథకం",
        name_hi: "पीएम-कुसुम सौर कृषि पंप योजना",
        category: "subsidy",
        type: "Renewable Energy & Agriculture",
        purpose_en: "Installing standalone off-grid solar water pump sets to eliminate diesel costs and day-time electricity supply constraints.",
        purpose_te: "కరెంట్ కోతలు మరియు డీజిల్ ఖర్చుల భారం లేకుండా పట్టపగలే సోలార్ శక్తితో ఉచితంగా పొలాలకు నీరందించడం.",
        benefit_amount: "60% to 80% Capital Subsidy",
        eligibility_en: "Farmers without electricity grid connection or seeking to replace high-cost diesel pump sets.",
        eligibility_te: "కరెంట్ లేని లేదా డీజిల్ ఇంజన్లపై ఆధారపడే రైతులకు వర్తిస్తుంది. బోరుబావి లేదా బావిలో నీటి వసతి ఉండాలి.",
        eligibility_hi: "डीजल पंपों को सौर ऊर्जा पंपों में बदलने के लिए भारी सब्सिडी।",
        documents_required: ["Aadhaar Card & Photo", "Land Pattadar Passbook with revenue sketch", "Borewell / Open well water source certificate", "Bank account details"],
        application_steps_en: "1. Apply on state NREDCAP / TSREDCO portal. 2. Site inspection by district solar officer. 3. Pay beneficiary share (10-40%). 4. Installation by empaneled vendor.",
        application_steps_te: "1. డిస్కాం లేదా రెన్యూవబుల్ ఎనర్జీ పోర్టల్‌లో దరఖాస్తు. 2. స్థల పరిశీలన. 3. మిగిలిన వాటా చెల్లించగానే సోలార్ పంపుల ఏర్పాటు.",
        official_url: "https://pmkusum.mnre.gov.in/",
        status: "Active & Ongoing",
        helpline: "1800-180-3333"
      },
      {
        id: "micro_irrigation_drip",
        name_en: "Pradhan Mantri Krishi Sinchayee Yojana (PMKSY - Drip & Sprinkler)",
        name_te: "సూక్ష్మ సేద్య పథకం (డ్రిప్ & స్ప్రింక్లర్ రాయితీ)",
        name_hi: "प्रधानमंत्री कृषि सिंचाई योजना (ड्रिप एवं स्प्रिंकलर)",
        category: "subsidy",
        type: "State & Central Irrigation Mission",
        purpose_en: "Water conservation through precision micro-irrigation systems, boosting crop yields by 30-40% while slashing water consumption in half.",
        purpose_te: "బిందు సేద్యం (డ్రిప్) మరియు తుంపర సేద్యం (స్ప్రింక్లర్లు) పరికరాలను భారీ సబ్సిడీతో అందించి నీటి పొదుపుతో అధిక దిగుబడులు సాధించడం.",
        benefit_amount: "70% to 90% Subsidy for Small/Marginal Farmers",
        eligibility_en: "All small and marginal farmers owning agricultural land with an assured irrigation source.",
        eligibility_te: "5 ఎకరాలలోపు ఉన్న సన్న, చిన్నకారు రైతులకు 90% వరకు, ఇతర రైతులకు 70% వరకు రాయితీ లభిస్తుంది.",
        eligibility_hi: "लघु एवं सीमांत किसानों को 70% से 90% तक की भारी सब्सिडी।",
        documents_required: ["Pattadar Passbook / 1B", "Aadhaar Card", "Electricity connection / Solar borewell document", "Soil and Water test report"],
        application_steps_en: "1. Register at APMIP / TSMIP portal or MeeSeva. 2. Soil and land survey by field engineer. 3. Pay farmer contribution. 4. Drip installation & test run.",
        application_steps_te: "1. మీసేవ లేదా APMIP/TSMIP పోర్టల్‌లో నమోదు. 2. వ్యవసాయ ఇంజనీర్ ద్వారా పొలం సర్వే. 3. డ్రిప్ పరికరాల బిగింపు.",
        official_url: "https://pmksy.gov.in/",
        status: "Active & Ongoing",
        helpline: "040-23383520 / 1800-425-4444"
      },
      {
        id: "kisan_credit_card",
        name_en: "Kisan Credit Card (KCC) Crop Loan Scheme",
        name_te: "కిసాన్ క్రెడిట్ కార్డు (KCC) స్వల్పకాలిక పంట రుణాలు",
        name_hi: "किसान क्रेडिट कार्ड (केसीसी) फसल ऋण योजना",
        category: "credit",
        type: "Agricultural Credit & Banking",
        purpose_en: "Instant, hassle-free institutional short-term credit for seeds, fertilizers, pesticides, labor wages, and post-harvest maintenance at concessional interest.",
        purpose_te: "వడ్డీ వ్యాపారుల చక్రవడ్డీల నుండి విముక్తి కల్పించి అతి తక్కువ వడ్డీకే రైతులకు బ్యాంకుల ద్వారా పంట పెట్టుబడి రుణాలు అందించడం.",
        benefit_amount: "Loans up to ₹3,00,000 at effective 4% interest per annum",
        eligibility_en: "All individual farmers, joint borrowers, tenant farmers, sharecroppers, and Self Help Groups (SHGs).",
        eligibility_te: "వ్యవసాయం చేసే ప్రతి రైతుకు, కౌలు రైతులకు మరియు మహిళా రైతు సంఘాలకు వర్తిస్తుంది.",
        eligibility_hi: "सभी किसान, काश्तकार और स्वयं सहायता समूह 4% ब्याज पर ऋण के लिए पात्र।",
        documents_required: ["Filled KCC application form", "Pattadar passbook and latest ROR 1-B", "Aadhaar Card and PAN card", "No-dues certificate from primary PACS/banks"],
        application_steps_en: "1. Approach local nationalized bank, cooperative bank, or RRB branch. 2. Submit land records. 3. KCC limit sanctioned within 14 days.",
        application_steps_te: "1. స్థానిక జాతీయ బ్యాంకు లేదా సహకార సంఘం (PACS) లో దరఖాస్తు ఇవ్వండి. 2. 14 రోజుల్లోగా KCC కార్డు మరియు రుణం మంజూరు.",
        official_url: "https://www.myscheme.gov.in/schemes/kcc",
        status: "Active & Ongoing",
        helpline: "1800-180-1111 / 1800-115-526"
      }
    ];

    const qLower = query.toLowerCase().trim();
    return all.filter(s => {
      const matchCat = category === "all" || s.category === category;
      const matchQuery = !qLower ||
        s.name_en.toLowerCase().includes(qLower) ||
        s.name_te.toLowerCase().includes(qLower) ||
        (s.name_hi && s.name_hi.toLowerCase().includes(qLower)) ||
        (s.purpose_en && s.purpose_en.toLowerCase().includes(qLower)) ||
        (s.purpose_te && s.purpose_te.toLowerCase().includes(qLower));
      return matchCat && matchQuery;
    });
  }

  // ==========================================
  // ORGANIC RECIPES & IPM
  // ==========================================
  async loadOrganicRecipes(query = this.currentRecipeSearch, category = this.selectedRecipeCategory) {
    const q = (query || "").trim();
    const cat = category || "all";

    const container = document.getElementById('recipesContainer');
    if (container && (!this.cachedRecipes || q || cat !== 'all')) {
      const loadingMsg = TRANSLATIONS[this.currentLang]?.loading_recipes || "Loading organic formulations and IPM practices...";
      container.innerHTML = `
        <div class="state-box loading">
          <div class="state-icon">🌿</div>
          <div class="state-title">${loadingMsg}</div>
        </div>
      `;
    }

    try {
      const url = `/api/guidance/recipes?q=${encodeURIComponent(q)}&category=${encodeURIComponent(cat)}`;
      const res = await fetch(apiEndpoint(url));
      const data = await res.json();
      if (data.success && data.recipes) {
        this.cachedRecipes = data.recipes;
        this.renderRecipes(data.recipes);
        return;
      }
    } catch (e) {
      console.warn("Recipes fetch error, using local recipes directory:", e);
    }

    const fallback = this.fallbackOrganicRecipes(q, cat);
    this.cachedRecipes = fallback;
    this.renderRecipes(fallback);
  }

  renderRecipes(recipes) {
    const container = document.getElementById('recipesContainer');
    if (!container) return;

    if (!recipes || recipes.length === 0) {
      const emptyMsg = TRANSLATIONS[this.currentLang]?.no_recipes_found || "No recipes or IPM practices match your query.";
      container.innerHTML = `
        <div class="state-box empty-state">
          <div class="state-icon">🌿</div>
          <div class="state-title">${emptyMsg}</div>
        </div>
      `;
      return;
    }

    container.innerHTML = recipes.map(r => {
      const name = this.currentLang === 'te' ? r.name_te : (this.currentLang === 'hi' ? r.name_hi : r.name_en);
      const purpose = this.currentLang === 'te' ? (r.purpose_te || r.purpose) : r.purpose;
      const targetCrops = this.currentLang === 'te' ? (r.target_crops_te || r.target_crops) : r.target_crops;
      const prepMethod = r.preparation_steps ? r.preparation_steps.join(' ') : (r.preparation_method || '');
      const appMethod = this.currentLang === 'te' ? (r.application_method_te || r.application_method) : r.application_method;
      const precautions = this.currentLang === 'te' ? (r.precautions_te || r.precautions) : r.precautions;
      const ingredients = r.ingredients || [];

      const purposeLabel = this.currentLang === 'te' ? 'ప్రయోజనం / ఉపయోగాలు' : (this.currentLang === 'hi' ? 'उद्देश्य और लाभ' : 'Purpose & Benefits');
      const targetLabel = this.currentLang === 'te' ? 'అనువైన పంటలు' : (this.currentLang === 'hi' ? 'उपयुक्त फसलें' : 'Target Crops');
      const ingLabel = this.currentLang === 'te' ? 'కావలసిన పదార్థాలు / సామగ్రి' : (this.currentLang === 'hi' ? 'आवश्यक सामग्री' : 'Ingredients / Materials');
      const prepLabel = this.currentLang === 'te' ? 'తయారీ విధానం' : (this.currentLang === 'hi' ? 'बनाने की विधि' : 'Preparation Method');
      const appLabel = this.currentLang === 'te' ? 'వాడే విధానం & మోతాదు' : (this.currentLang === 'hi' ? 'प्रयोग विधि एवं मात्रा' : 'Application & Dosage');
      const precLabel = this.currentLang === 'te' ? 'జాగ్రత్తలు' : (this.currentLang === 'hi' ? 'सावधानियां' : 'Precautions');

      return `
        <div class="recipe-card">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
            <span style="font-size:0.75rem;padding:3px 10px;border-radius:12px;background:rgba(16,185,129,0.15);color:var(--accent-emerald);font-weight:700">
              ${r.type_label || (r.category === 'ipm' ? 'IPM Practice' : 'Organic Recipe')}
            </span>
          </div>

          <h3 style="font-size:1.25rem;font-weight:800;color:var(--accent-gold);margin-bottom:8px">${name}</h3>
          
          <div style="font-size:0.88rem;color:var(--text-primary);margin-bottom:10px">
            <strong>🎯 ${purposeLabel}:</strong> ${purpose}
          </div>

          ${targetCrops ? `
            <div style="font-size:0.84rem;color:var(--text-secondary);margin-bottom:10px">
              <strong>🌾 ${targetLabel}:</strong> ${targetCrops}
            </div>
          ` : ''}

          ${ingredients.length > 0 ? `
            <div style="margin-bottom:12px">
              <h4 style="font-size:0.9rem;font-weight:700;color:var(--text-primary);margin-bottom:6px">🧪 ${ingLabel}:</h4>
              <ul style="padding-left:20px;font-size:0.85rem;color:var(--text-secondary);line-height:1.5">
                ${ingredients.map(i => `<li>${i}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          ${prepMethod ? `
            <div style="background:var(--bg-secondary);padding:10px;border-radius:8px;font-size:0.85rem;margin-bottom:10px;border-left:3px solid var(--accent-gold)">
              <strong>⚙️ ${prepLabel}:</strong> ${prepMethod}
            </div>
          ` : ''}

          <div style="background:var(--bg-secondary);padding:10px;border-radius:8px;font-size:0.85rem;margin-bottom:10px;border-left:3px solid var(--accent-emerald)">
            <strong>🚿 ${appLabel}:</strong> ${appMethod}
          </div>

          ${precautions ? `
            <div style="font-size:0.82rem;color:var(--accent-rose);background:rgba(244,63,94,0.1);padding:8px 10px;border-radius:6px">
              ⚠️ <strong>${precLabel}:</strong> ${precautions}
            </div>
          ` : ''}
        </div>
      `;
    }).join('');
  }

  fallbackOrganicRecipes(query = "", category = "all") {
    const all = [
      {
        id: "jeevamrutham",
        name_en: "Jeevamrutham — Soil Microbial Elixir",
        name_te: "జీవామృతం తయారీ విధానం",
        name_hi: "जीवामृत तैयार करने की विधि",
        category: "soil",
        type_label: "Microbial Biostimulant / జీవ రసాయనం",
        purpose: "Multiplies billions of beneficial soil microorganisms, enhances earthworm activity, and unlocks insoluble nitrogen and phosphorus in soil naturally.",
        purpose_te: "నేలలో లాభదాయక సూక్ష్మజీవులను వృద్ధి చేసి, వానపాముల సంఖ్యను పెంచుతుంది. మొక్కలకు అవసరమైన పోషకాలను సహజంగా అందిస్తుంది.",
        target_crops: "All crops: Paddy, Cotton, Chilli, Vegetables, Pulses, Horticulture",
        target_crops_te: "అన్ని రకాల పంటలు: వరి, పత్తి, మిరప, కూరగాయలు, పండ్ల తోటలు",
        ingredients: [
          "Fresh indigenous cow dung (దేశీ ఆవు పేడ): 10 kg",
          "Indigenous cow urine (దేశీ ఆవు మూత్రం): 5 to 10 liters",
          "Organic Jaggery / raw cane sugar (సేంద్రియ బెల్లం): 1 to 2 kg",
          "Pulse flour - Chickpea / Gram flour (శనగ లేదా ఉలవ పిండి): 1 to 2 kg",
          "Fertile native field bund soil (పొలం గట్టు జీవ మట్టి): Handful (200g)",
          "Clean water (నీరు): 200 liters"
        ],
        preparation_method: "Mix cow dung and urine in 200L water. Add crushed jaggery, besan, and bund soil. Stir clockwise twice daily for 48-72 hours under shade.",
        application_method: "Apply 200 liters per acre through irrigation water, venturi drip, or as a 10% foliar spray every 15 days.",
        application_method_te: "ఎకరాకు 200 లీటర్లు నీటి తడులతో పాటు, డ్రిప్ ద్వారా లేదా 10% ద్రావణాన్ని పిచికారీ చేయవచ్చు.",
        precautions: "Never use chemical drum containers. Do not boil or heat. Protect from direct harsh midday sunlight.",
        precautions_te: "రసాయన డ్రమ్ములను వాడకూడదు. ద్రావణాన్ని వేడి చేయకూడదు. ఎండ తగలకుండా నీడలోనే ఉంచాలి."
      },
      {
        id: "ghanajeevamrutham",
        name_en: "Ghana Jeevamrutham — Solid Soil Starter",
        name_te: "ఘనజీవామృతం తయారీ విధానం",
        name_hi: "घनजीवामृत - ठोस जैविक खाद",
        category: "soil",
        type_label: "Dry Microbial Manure / ఘన ఎరువు",
        purpose: "A powerful dry organic basal starter that replaces synthetic chemical DAP and urea, providing continuous root-zone nutrition.",
        purpose_te: "రసాయన డీఏపీ (DAP) ఎరువులకు ప్రత్యామ్నాయంగా విత్తే సమయంలో లేదా దుక్కిలో వేసే బలమైన ఘన సేంద్రియ ఎరువు.",
        target_crops: "Paddy, Groundnut, Maize, Cotton, Pulses",
        target_crops_te: "వరి, వేరుశనగ, మొక్కజొన్న, పత్తి మరియు పప్పుదినుసులు",
        ingredients: [
          "Well-decomposed cow dung (బాగా చివికిన ఆవు పేడ): 100 kg",
          "Liquid Jeevamrutham (జీవామృతం ద్రావణం): 20 liters",
          "Crushed jaggery (బెల్లం): 1 kg",
          "Besan / Gram flour (శనగ పిండి): 1 kg"
        ],
        preparation_method: "Spread 100kg cow dung under shade. Sprinkle 20L Jeevamrutham, jaggery, and flour. Heap and cover with wet gunny bag for 48 hours, then shade-dry.",
        application_method: "Broadcast 100 to 200 kg per acre as basal manure during last ploughing or sowing.",
        application_method_te: "ఆఖరి దుక్కిలో ఎకరాకు 100 నుండి 200 కేజీలు చల్లుకోవాలి.",
        precautions: "Do not dry under direct harsh sunlight; UV rays will kill beneficial bacteria.",
        precautions_te: "ఎండలో ఆరబెట్టకూడదు; నీడలోనే ఆరబెట్టి నిల్వ చేసుకోవాలి."
      },
      {
        id: "neemastra",
        name_en: "Neemastra — Sucking Pest & Whitefly Repellent",
        name_te: "నిమాస్త్రం తయారీ విధానం",
        name_hi: "नीमास्त्र - रस चूसक कीट नियंत्रक",
        category: "pest",
        type_label: "Bio-Insecticide / కీటక నివారిణి",
        purpose: "Controls sucking pests, early-stage borer larvae, whiteflies, jassids, and aphids within 48 hours of spraying.",
        purpose_te: "రసం పీల్చే పురుగులు, తెల్లదోమ, పచ్చదోమ, పేనుబంక మరియు లేత దశలోని గొంగళి పురుగులను సమర్థవంతంగా అరికడుతుంది.",
        target_crops: "Cotton, Chilli, Vegetables, Groundnut, Paddy",
        target_crops_te: "పత్తి, మిరప, కూరగాయలు, వేరుశనగ, వరి",
        ingredients: [
          "Fresh neem leaves & tender branches (వేప మండలు / ఆకులు): 5 kg",
          "Indigenous cow urine (ఆవు మూత్రం): 5 liters",
          "Fresh indigenous cow dung (ఆవు పేడ): 1 kg",
          "Clean water (నీరు): 100 liters"
        ],
        preparation_method: "Crush 5kg neem leaves into coarse paste. Add to 100L water with cow urine and dung. Ferment 48 hours under shade. Filter through khadi cloth.",
        application_method: "Spray directly without dilution (100 liters/acre) in early morning or late afternoon.",
        application_method_te: "నీరు కలపకుండా నేరుగా పంపుతో ఉదయం లేదా సాయంత్రం వేళల్లో పిచికారీ చేయాలి.",
        precautions: "Use within 21 days of preparation. Do not mix with synthetic chemical pesticides.",
        precautions_te: "తయారు చేసిన 21 రోజుల్లోగా వాడాలి. రసాయన మందులతో కలపకూడదు."
      },
      {
        id: "brahmastra",
        name_en: "Brahmastra — Borer & Caterpillar Destroyer",
        name_te: "బ్రహ్మాస్త్రం తయారీ విధానం",
        name_hi: "ब्रह्मास्त्र - इल्ली और छेदक कीट नाशक",
        category: "pest",
        type_label: "Botanical Decoction / మూలికా కషాయం",
        purpose: "Destroys tough pod borers, fruit borers, pink bollworms, Spodoptera, and leaf-eating caterpillars safely without synthetic poison.",
        purpose_te: "కాయ తొలుచు పురుగులు, శనగపచ్చ పురుగు, గులాబీ రంగు పురుగు మరియు ఆకుతినే లద్దె పురుగులను నిర్మూలిస్తుంది.",
        target_crops: "Cotton, Red Gram, Red Chilli, Tomato, Brinjal, Bengal Gram",
        target_crops_te: "పత్తి, కందులు, మిరప, టమాటా, వంగ, శనగ",
        ingredients: [
          "Neem leaves (వేప ఆకులు): 3 kg",
          "Custard apple leaves (సీతాఫలం ఆకులు): 2 kg",
          "Papaya leaves (బొప్పాయి ఆకులు): 2 kg",
          "Castor or Calotropis leaves (ఆముదం లేదా జిల్లేడు ఆకులు): 2 kg",
          "Pongamia / Karanj leaves (కానుగ ఆకులు): 2 kg",
          "Indigenous cow urine (ఆవు మూత్రం): 10 liters"
        ],
        preparation_method: "Crush all 5 bitter leaf types into paste. Add to 10 liters cow urine and boil on low flame until reduced to half. Cool 24 hours, filter.",
        application_method: "Dilute 2 to 2.5 liters of Brahmastra in 100 liters of water per acre. Spray upon seeing borer larvae.",
        application_method_te: "ఎకరాకు 2 నుండి 2.5 లీటర్ల కషాయాన్ని 100 లీటర్ల నీటిలో కలిపి పిచికారీ చేయాలి.",
        precautions: "Wear hand gloves during preparation. Stores effectively for up to 6 months in airtight glass or earthen jars.",
        precautions_te: "చేతులకు గ్లౌజులు ధరించాలి. ఆరు నెలల వరకు నిల్వ ఉంటుంది."
      },
      {
        id: "sour_buttermilk",
        name_en: "Sour Buttermilk & Hing (ఇంగువ & పుల్లటి మజ్జిగ)",
        name_te: "పుల్లటి మజ్జిగ & ఇంగువ ద్రావణం",
        name_hi: "खट्टी छाछ और हींग का घोल",
        category: "disease",
        type_label: "Organic Fungicide / సేంద్రియ శిలీంధ్ర నాశిని",
        purpose: "Controls fungal leaf spots, downy mildew, powdery mildew, and bacterial leaf blight through natural lactic acid cultures.",
        purpose_te: "ఆకుమచ్చ తెగులు, బూడిద తెగులు మరియు ఎండు తెగుళ్లను సహజ లాక్టిక్ యాసిడ్ ద్వారా అరికడుతుంది.",
        target_crops: "Chilli, Tomato, Paddy, Cucurbits, Citrus, Rose",
        target_crops_te: "మిరప, టమాటా, వరి, కూరగాయలు, నిమ్మ తోటలు",
        ingredients: [
          "Desi cow sour buttermilk aged 5 to 7 days (పుల్లటి మజ్జిగ): 5 liters",
          "Copper wire / clean copper vessel piece (రాగి తీగ లేదా ముక్క): 1 piece",
          "Asafoetida / Hing powder (ఇంగువ పొడి): 50 grams",
          "Water (నీరు): 100 liters"
        ],
        preparation_method: "Store buttermilk in plastic container with copper piece submerged for 5-7 days until it turns greenish. Remove copper and mix hing powder.",
        application_method: "Mix 5 liters fermented copper-buttermilk with 100 liters water (500ml per 15L sprayer pump). Spray thoroughly.",
        application_method_te: "100 లీటర్ల నీటిలో 5 లీటర్ల ద్రావణం కలిపి పిచికారీ చేయాలి.",
        precautions: "Do not leave copper submerged longer than 10 days. Wash copper piece before and after use.",
        precautions_te: "రాగి ముక్కను 10 రోజుల కంటే ఎక్కువ ఉంచరాదు."
      },
      {
        id: "ipm_pheromone_traps",
        name_en: "Pheromone Traps (లింగాకర్షక బుట్టలు)",
        name_te: "లింగాకర్షక బుట్టలు (సమగ్ర సస్యరక్షణ)",
        name_hi: "फेरोमोन ट्रैप - कीट निगरानी",
        category: "ipm",
        type_label: "IPM Bio-Lure / సమగ్ర సస్యరక్షణ",
        purpose: "Traps adult male moths (Pink bollworm, Spodoptera, Helicoverpa) using synthetic female sex pheromones to halt reproduction.",
        purpose_te: "మగ పురుగులను ఆకర్షించి పట్టివేయడం ద్వారా సంతానోత్పత్తిని నిరోధిస్తుంది.",
        target_crops: "Cotton, Red Gram, Tomato, Chilli, Maize",
        target_crops_te: "పత్తి, కందులు, టమాటా, మిరప, మొక్కజొన్న",
        ingredients: [
          "Funnel trap body / sleeve traps: 4 to 8 per acre",
          "Specific crop lure septa (PBW lure for cotton, Helilure for gram): 1 per trap",
          "Sturdy bamboo support sticks: 1.5m tall"
        ],
        preparation_method: "Fix lure septa inside funnel lid using forceps without touching with bare fingers. Mount trap on bamboo pole 1 foot above crop canopy.",
        application_method: "Install 4 to 5 traps per acre by 35-40th crop day. Inspect catch daily and empty dead moths.",
        application_method_te: "ఎకరాకు 4 నుండి 5 బుట్టలను పంట ఎత్తు కంటే 1 అడుగు ఎత్తులో అమర్చాలి. 30 రోజులకు ఒకసారి ల్యూర్ మార్చాలి.",
        precautions: "Never touch lure septa with bare fingers; human sweat odors reduce lure effectiveness.",
        precautions_te: "ల్యూర్‌ను చేతులతో తాకకూడదు; పట్టకారుతో అమర్చాలి."
      },
      {
        id: "ipm_sticky_traps",
        name_en: "Yellow & Blue Sticky Sheets (జిగురు అట్టలు)",
        name_te: "పసుపు, నీలం రంగు జిగురు అట్టలు",
        name_hi: "पीले और नीले चिपचिपे जाल",
        category: "ipm",
        type_label: "Physical Pest Control / భౌతిక నివారణ",
        purpose: "Yellow traps capture whiteflies, aphids, and leafminers; blue traps attract thrips with 95% specificity without pesticides.",
        purpose_te: "పసుపు అట్టలు తెల్లదోమ, పేనుబంకను; నీలం అట్టలు తామర పురుగులను (Thrips) ఆకర్షించి అరికడతాయి.",
        target_crops: "Chilli, Cotton, Tomato, Capsicum, Cucumber, Marigold",
        target_crops_te: "మిరప, పత్తి, టమాటా, కూరగాయలు",
        ingredients: [
          "Yellow plastic corrugated sheets (30cm x 15cm): 10 per acre",
          "Blue plastic corrugated sheets (30cm x 15cm): 10 per acre",
          "Castor oil or petroleum jelly adhesive: 100g",
          "Supporting wooden stakes and clips"
        ],
        preparation_method: "Smear thin coating of castor oil or clean non-drying sticky glue on both sides of yellow and blue sheets. Tie to stakes at plant height.",
        application_method: "Install 10 yellow and 10 blue traps per acre evenly across the field starting 15 days after transplanting.",
        application_method_te: "ఎకరాకు 10 పసుపు, 10 నీలం అట్టలను పంట ఎత్తు సమానంగా అమర్చాలి.",
        precautions: "Re-apply castor oil every 15-20 days or when sheet is fully covered with trapped insects.",
        precautions_te: "పురుగులు నిండినప్పుడు శుభ్రం చేసి మళ్లీ ఆముదం రాయాలి."
      }
    ];

    const qLower = query.toLowerCase().trim();
    return all.filter(r => {
      const matchCat = category === "all" || r.category === category;
      const matchQuery = !qLower ||
        r.name_en.toLowerCase().includes(qLower) ||
        r.name_te.toLowerCase().includes(qLower) ||
        (r.name_hi && r.name_hi.toLowerCase().includes(qLower)) ||
        (r.purpose && r.purpose.toLowerCase().includes(qLower)) ||
        (r.purpose_te && r.purpose_te.toLowerCase().includes(qLower));
      return matchCat && matchQuery;
    });
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

    const dict = TRANSLATIONS[this.currentLang] || TRANSLATIONS.en;

    container.innerHTML = sectors.map(sec => {
      const secKey = 'sector_' + sec.sector_id;
      const sectorTitle = dict[secKey] || sec.sector_name;
      const moistureLabel = dict.moisture_label || dict.soil_moisture || 'Soil Moisture';
      const irrigateBtnText = dict.btn_water_sector || '💧 Trigger Smart Drip';
      const irrStatus = (sec.irrigation_status && sec.irrigation_status.toLowerCase().includes('active'))
        ? (dict.irrigation_active || sec.irrigation_status)
        : (dict.irrigation_optimal || sec.irrigation_status);

      return `
      <div class="telemetry-card" id="card-${sec.sector_id}">
        <div class="telemetry-header">
          <span class="sector-name">${sectorTitle}</span>
          <span style="font-size:0.75rem;padding:2px 8px;border-radius:10px;background:rgba(16,185,129,0.2);color:var(--accent-emerald)">
            ${irrStatus}
          </span>
        </div>

        <div style="font-size:0.8rem;color:var(--text-secondary)">
          ${moistureLabel}: <strong>${sec.soil_moisture}%</strong>
        </div>
        <div class="moisture-bar-bg">
          <div class="moisture-bar-fill" style="width:${sec.soil_moisture}%"></div>
        </div>

        <div class="sensor-grid">
          <div>🌡️ ${dict.soil_temp || 'Soil Temp'}: ${sec.soil_temp}°C</div>
          <div>🧪 ${dict.soil_ph || 'Soil pH'}: ${sec.soil_ph}</div>
          <div>🌿 N: ${sec.nitrogen} kg/ha</div>
          <div>🌱 P: ${sec.phosphorus} kg/ha</div>
        </div>

        <button class="irrigate-btn" onclick="app.triggerSectorIrrigation('${sec.sector_id}')">
          ${irrigateBtnText}
        </button>
      </div>
      `;
    }).join('');
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

    const dict = TRANSLATIONS[this.currentLang] || TRANSLATIONS.en;

    if (!scans || scans.length === 0) {
      container.innerHTML = `<p style="color:var(--text-muted);font-size:0.9rem">${dict.history_no_scans || "No past scans recorded yet."}</p>`;
      return;
    }

    const colCrop = dict.col_crop || "Crop";
    const colDisease = dict.col_disease || "Diagnosed Issue";
    const colSeverity = dict.col_severity || "Severity";
    const colDate = dict.col_date || "Date";

    container.innerHTML = `
      <div style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse;font-size:0.85rem">
          <thead>
            <tr style="border-bottom:1px solid var(--border-color);text-align:left;color:var(--text-muted)">
              <th style="padding:8px">${colCrop}</th>
              <th style="padding:8px">${colDisease}</th>
              <th style="padding:8px">${colSeverity}</th>
              <th style="padding:8px">${colDate}</th>
            </tr>
          </thead>
          <tbody>
            ${scans.map(s => {
              const dName = (this.currentLang === 'te' && s.disease_name_te) 
                ? s.disease_name_te 
                : ((this.currentLang === 'hi' && s.disease_name_hi) ? s.disease_name_hi : s.disease_name);
              return `
              <tr style="border-bottom:1px solid rgba(255,255,255,0.05)">
                <td style="padding:8px;font-weight:700">${s.crop_name}</td>
                <td style="padding:8px;color:var(--accent-emerald)">${dName}</td>
                <td style="padding:8px"><span class="severity-pill severity-${s.severity}">${s.severity}</span></td>
                <td style="padding:8px;color:var(--text-muted)">${new Date(s.created_at).toLocaleDateString()}</td>
              </tr>
              `;
            }).join('')}
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
  window.farmApp = app;
});
