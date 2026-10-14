// ==============================================================
// RYTHU MITRA AI (రైతు మిత్ర AI) — SPEECH & VOICE ENGINE
// Web Speech Recognition & Multilingual Text-to-Speech (Telugu, Hindi, English)
// ==============================================================

class VoiceEngine {
  constructor() {
    this.recognition = null;
    this.isRecording = false;
    this.synth = window.speechSynthesis || null;
    this.currentUtterance = null;
    this.currentLang = 'te'; // default Telugu
    this.voices = [];

    this.initRecognition();
    this.loadVoices();
    if (this.synth && this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = () => this.loadVoices();
    }
  }

  loadVoices() {
    if (this.synth) {
      this.voices = this.synth.getVoices();
    }
  }

  initRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Web Speech Recognition API is not supported in this browser.");
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 1;

    this.recognition.onstart = () => {
      this.isRecording = true;
      this.triggerEvent("recording-state", { recording: true });
    };

    this.recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        transcript += event.results[i][0].transcript;
      }
      this.triggerEvent("transcript-update", { transcript });
    };

    this.recognition.onerror = (event) => {
      console.warn("Speech recognition error:", event.error);
      this.isRecording = false;
      this.triggerEvent("recording-state", { recording: false, error: event.error });
    };

    this.recognition.onend = () => {
      this.isRecording = false;
      this.triggerEvent("recording-state", { recording: false });
    };
  }

  setLanguage(langCode) {
    this.currentLang = langCode;
  }

  getLocaleCode(langCode) {
    switch (langCode) {
      case 'te': return 'te-IN';
      case 'hi': return 'hi-IN';
      default: return 'en-IN';
    }
  }

  startListening() {
    if (!this.recognition) {
      alert("Microphone voice recognition is not supported in this browser. Please type your symptoms.");
      return;
    }
    if (this.isRecording) {
      this.recognition.stop();
      return;
    }

    this.recognition.lang = this.getLocaleCode(this.currentLang);
    try {
      this.recognition.start();
    } catch (e) {
      console.warn("Recognition start failed, restarting:", e);
      this.recognition.stop();
    }
  }

  stopListening() {
    if (this.recognition && this.isRecording) {
      this.recognition.stop();
    }
  }

  speak(text, lang = null, onEndCallback = null) {
    if (!this.synth) {
      console.warn("Speech synthesis is not supported on this browser.");
      return;
    }

    // Cancel any ongoing speech
    this.stopSpeaking();

    if (!text || text.trim() === '') return;

    const utteranceLang = lang || this.currentLang;
    const locale = this.getLocaleCode(utteranceLang);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = locale;
    utterance.rate = 0.95; // Slightly slower for clear farmer comprehension
    utterance.pitch = 1.0;

    // Try finding exact matched voice
    const matchedVoice = this.voices.find(v => v.lang === locale || v.lang.startsWith(utteranceLang));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onend = () => {
      this.currentUtterance = null;
      if (onEndCallback) onEndCallback();
    };

    utterance.onerror = (e) => {
      console.warn("Speech synthesis error:", e);
      this.currentUtterance = null;
      if (onEndCallback) onEndCallback();
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }

  // Event dispatch helper
  triggerEvent(name, detail) {
    window.dispatchEvent(new CustomEvent(`voice-engine:${name}`, { detail }));
  }
}

const voiceEngine = new VoiceEngine();
