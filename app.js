(function() {
  const fileBtn = document.getElementById('dc-file-btn');
  const statusEl = document.getElementById('dc-status');
  const loadingEl = document.getElementById('dc-loading');
  const loadingTextEl = document.getElementById('dc-loading-text');
  const wrap = document.getElementById('dc-transcript-wrap');
  const dognameEl = document.getElementById('dc-dogname');
  const breedEl = document.getElementById('dc-breed');
  const crimeEl = document.getElementById('dc-crime');
  const chipRow = document.getElementById('dc-chip-row');
  const mugName = document.getElementById('dc-mug-name');
  const mugMeta = document.getElementById('dc-mug-meta');
  const mugshotContainer = document.getElementById('dc-mugshot-container');

  // New UI Elements
  const archiveBtn = document.getElementById('dc-btn-archive');
  const archiveCount = document.getElementById('dc-archive-count');
  const archiveModal = document.getElementById('dc-archive-modal');
  const archiveList = document.getElementById('dc-archive-list');
  const archiveClose = document.getElementById('dc-archive-close');

  const randomBtn = document.getElementById('dc-btn-random');

  const settingsBtn = document.getElementById('dc-btn-settings');
  const settingsModal = document.getElementById('dc-settings-modal');
  const settingsClose = document.getElementById('dc-settings-close');
  const saveSettingsBtn = document.getElementById('dc-save-settings-btn');
  const setGeminiKey = document.getElementById('dc-set-gemini-key');
  const setGeminiModel = document.getElementById('dc-set-gemini-model');
  const setElevenKey = document.getElementById('dc-set-eleven-key');
  const setElevenToggle = document.getElementById('dc-set-eleven-toggle');

  // Load custom settings from LocalStorage if available
  function initSettings() {
    try {
      const saved = localStorage.getItem('dc_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        window.APP_CONFIG = window.APP_CONFIG || {};
        if (parsed.geminiKey) window.APP_CONFIG.GEMINI_API_KEY = parsed.geminiKey;
        if (parsed.geminiModel) window.APP_CONFIG.GEMINI_MODEL = parsed.geminiModel;
        if (parsed.elevenKey) window.APP_CONFIG.ELEVENLABS_API_KEY = parsed.elevenKey;
        if (typeof parsed.elevenEnabled === 'boolean') window.APP_CONFIG.ELEVENLABS_ENABLED = parsed.elevenEnabled;
      }
    } catch (_) {}

    updateSettingsUI();
  }

  function updateSettingsUI() {
    const cfg = window.APP_CONFIG || {};
    const geminiStatus = document.getElementById('dc-gemini-status');
    const elevenStatus = document.getElementById('dc-eleven-status');

    // SECURITY: NEVER output raw secret API keys into DOM input value attributes!
    if (setGeminiKey) setGeminiKey.value = '';
    if (setElevenKey) setElevenKey.value = '';

    if (geminiStatus) {
      if (cfg.GEMINI_API_KEY && cfg.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE') {
        geminiStatus.textContent = '✓ Gemini API Key configured & active in memory';
        geminiStatus.style.color = '#2f5c3f';
      } else {
        geminiStatus.textContent = '⚠️ API Key required (Set in config.js or type above)';
        geminiStatus.style.color = '#a1301f';
      }
    }

    if (elevenStatus) {
      if (cfg.ELEVENLABS_API_KEY && cfg.ELEVENLABS_API_KEY !== 'YOUR_ELEVENLABS_API_KEY_HERE') {
        elevenStatus.textContent = '✓ ElevenLabs Key active';
        elevenStatus.style.color = '#2f5c3f';
      } else {
        elevenStatus.textContent = 'Optional — using Web SpeechSynthesis fallback';
        elevenStatus.style.color = 'var(--ink-soft)';
      }
    }

    if (setGeminiModel && cfg.GEMINI_MODEL) setGeminiModel.value = cfg.GEMINI_MODEL;
    if (setElevenToggle) setElevenToggle.checked = !!cfg.ELEVENLABS_ENABLED;
  }

  initSettings();

  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener('click', () => {
      window.APP_CONFIG = window.APP_CONFIG || {};
      if (setGeminiKey.value.trim()) window.APP_CONFIG.GEMINI_API_KEY = setGeminiKey.value.trim();
      if (setGeminiModel.value) window.APP_CONFIG.GEMINI_MODEL = setGeminiModel.value;
      if (setElevenKey.value.trim()) window.APP_CONFIG.ELEVENLABS_API_KEY = setElevenKey.value.trim();
      window.APP_CONFIG.ELEVENLABS_ENABLED = setElevenToggle.checked;

      try {
        localStorage.setItem('dc_settings', JSON.stringify({
          geminiKey: window.APP_CONFIG.GEMINI_API_KEY,
          geminiModel: window.APP_CONFIG.GEMINI_MODEL,
          elevenKey: window.APP_CONFIG.ELEVENLABS_API_KEY,
          elevenEnabled: window.APP_CONFIG.ELEVENLABS_ENABLED
        }));
      } catch (_) {}

      updateSettingsUI();
      settingsModal.classList.remove('active');
      alert('Settings saved successfully!');
    });
  }

  if (settingsBtn) settingsBtn.addEventListener('click', () => {
    updateSettingsUI();
    settingsModal.classList.add('active');
  });
  if (settingsClose) settingsClose.addEventListener('click', () => settingsModal.classList.remove('active'));

  // Avatar Customizer State
  let currentCoat = 'golden';
  let currentAccessory = 'none';

  const coatPalettes = {
    golden:    { body: '#c98a3d', head: '#e3a94f', ear: '#8a5a2b', snout: '#f3d9a8', bg: '#d6a24a' },
    black:     { body: '#2d2926', head: '#3d3835', ear: '#1b1816', snout: '#5c544d', bg: '#4a4440' },
    husky:     { body: '#6e7781', head: '#8c959e', ear: '#484f58', snout: '#e6edf3', bg: '#57606a' },
    dalmatian: { body: '#e1e4e8', head: '#f6f8fa', ear: '#24292e', snout: '#ffffff', bg: '#c9d1d9', spots: true }
  };

  function renderMugshotSVG() {
    const pal = coatPalettes[currentCoat] || coatPalettes.golden;
    let spotsSVG = '';
    if (pal.spots) {
      spotsSVG = `
        <circle cx="34" cy="48" r="3" fill="#24292e"/>
        <circle cx="58" cy="52" r="2.5" fill="#24292e"/>
        <circle cx="42" cy="74" r="4" fill="#24292e"/>
        <circle cx="54" cy="80" r="3.5" fill="#24292e"/>
      `;
    }

    let accessorySVG = '';
    if (currentAccessory === 'wig') {
      accessorySVG = `
        <path d="M22 36 C18 24, 30 14, 46 14 C62 14, 74 24, 70 36 C76 34, 78 48, 72 50 C68 40, 64 34, 46 34 C28 34, 24 40, 20 50 C14 48, 16 34, 22 36 Z" fill="#f0f0e8" stroke="#d0d0c8" stroke-width="1.5"/>
        <circle cx="20" cy="38" r="6" fill="#f0f0e8"/>
        <circle cx="72" cy="38" r="6" fill="#f0f0e8"/>
      `;
    } else if (currentAccessory === 'bowtie') {
      accessorySVG = `
        <polygon points="36,66 46,71 36,76" fill="#a1301f"/>
        <polygon points="56,66 46,71 56,76" fill="#a1301f"/>
        <circle cx="46" cy="71" r="3" fill="#d6a24a"/>
      `;
    } else if (currentAccessory === 'hat') {
      accessorySVG = `
        <path d="M16 30 Q46 22 76 30 Q68 28 62 16 Q46 12 30 16 Q24 28 16 30 Z" fill="#5a3a1a"/>
        <rect x="28" y="24" width="36" height="4" fill="#17130d"/>
      `;
    }

    const svg = `<svg viewBox="0 0 96 96" width="96" height="96">
      <rect width="96" height="96" fill="${pal.bg}"/>
      <rect x="0" y="0" width="96" height="96" fill="none" stroke="#17130d" stroke-width="2"/>
      <path id="dc-tail" d="M78 68 Q94 60 90 42" stroke="${pal.ear}" stroke-width="8" fill="none" stroke-linecap="round"/>
      <ellipse cx="48" cy="78" rx="30" ry="14" fill="${pal.body}"/>
      <circle cx="46" cy="46" r="26" fill="${pal.head}"/>
      ${spotsSVG}
      <path d="M24 32 Q14 26 18 44 Q26 46 30 38 Z" fill="${pal.ear}"/>
      <path d="M68 32 Q78 26 74 44 Q66 46 62 38 Z" fill="${pal.ear}"/>
      <ellipse cx="46" cy="56" rx="14" ry="10" fill="${pal.snout}"/>
      <ellipse cx="46" cy="52" rx="6" ry="4.5" fill="#241f16"/>
      <circle cx="37" cy="42" r="3.2" fill="#241f16"/>
      <circle cx="55" cy="42" r="3.2" fill="#241f16"/>
      <path d="M40 60 Q46 65 52 60" stroke="#241f16" stroke-width="2" fill="none" stroke-linecap="round"/>
      ${accessorySVG}
    </svg>`;

    mugshotContainer.innerHTML = svg + '<div class="dc-mugshot-board" id="dc-mugshot-board">DC-2026</div>';
  }
  renderMugshotSVG();

  document.querySelectorAll('.dc-cust-opt').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const type = btn.dataset.type;
      const val = btn.dataset.val;
      btn.closest('.dc-cust-group').querySelectorAll('.dc-cust-opt').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (type === 'coat') currentCoat = val;
      if (type === 'acc') currentAccessory = val;
      renderMugshotSVG();
    });
  });

  const loadingLines = [
    'Bailiff is summoning the court...',
    'Judge is finding their gavel...',
    'Witnesses are being sworn in (paw on the Bible)...',
    'Prosecutor is rehearsing their dramatic pause...',
    'Defense counsel is preparing puppy-dog eyes...'
  ];

  chipRow.addEventListener('click', (e) => {
    const chip = e.target.closest('.dc-chip');
    if (!chip) return;
    document.querySelectorAll('.dc-chip').forEach(c => c.classList.remove('selected'));
    chip.classList.add('selected');
    crimeEl.value = chip.dataset.crime;
  });

  function updateMugshot() {
    const name = dognameEl.value.trim();
    mugName.textContent = 'DEFENDANT: ' + (name ? name.toUpperCase() : 'UNKNOWN');
  }
  dognameEl.addEventListener('input', updateMugshot);

  let voiceList = [];
  function loadVoices() {
    voiceList = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
  }
  if (window.speechSynthesis) {
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }

  const roleVoiceProfile = {
    JUDGE:      { pitch: 0.65, rate: 0.88 },
    PROSECUTOR: { pitch: 1.05, rate: 1.08 },
    DEFENSE:    { pitch: 1.15, rate: 1.05 },
    WITNESS:    { pitch: 0.95, rate: 0.98 }
  };

  function hashCode(str) { let h = 0; for (let i = 0; i < str.length; i++) { h = (h << 5) - h + str.charCodeAt(i); h |= 0; } return h; }
  function pickVoiceForRole(role) { if (!voiceList.length) return null; return voiceList[Math.abs(hashCode(role)) % voiceList.length]; }

  let audioCtx = null;
  function getAudioCtx() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx;
  }

  function playBarkSound() {
    try {
      const ctx = getAudioCtx();
      const now = ctx.currentTime;
      [0, 0.16].forEach(offset => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(520, now + offset);
        osc.frequency.exponentialRampToValueAtTime(140, now + offset + 0.11);
        gain.gain.setValueAtTime(0.0001, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.18, now + offset + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.13);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.14);
      });
    } catch (e) { /* audio context unavailable, skip bark */ }
  }

  // Web Audio Heavy Wooden Gavel Strike Sound Effect
  function playGavelImpactSound() {
    try {
      const ctx = getAudioCtx();
      const now = ctx.currentTime;
      // Heavy low thud
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.25);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);

      // Noise click for wood slap
      const bufferSize = ctx.sampleRate * 0.05;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.3, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);
      noise.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(now);
    } catch (e) { /* audio fallback */ }
  }

  let currentPlayingBtn = null;
  let currentPlayingAvatar = null;

  function clearPlayingState() {
    document.querySelectorAll('.dc-play-line').forEach(b => { b.classList.remove('playing'); b.textContent = '▶ play'; });
    document.querySelectorAll('.dc-avatar.speaking').forEach(a => a.classList.remove('speaking'));
    currentPlayingBtn = null;
    currentPlayingAvatar = null;
    updateStopButton();
  }

  function stopAllAudio() {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (window._elevenLabsAudio) {
      try { window._elevenLabsAudio.pause(); window._elevenLabsAudio.src = ''; } catch(_) {}
      window._elevenLabsAudio = null;
    }
    fullTrialQueue = null;
    clearPlayingState();
  }

  function updateStopButton() {
    const stopBtn = document.getElementById('dc-stop-btn');
    if (!stopBtn) return;
    const isPlaying = (window.speechSynthesis && window.speechSynthesis.speaking) ||
                      (window._elevenLabsAudio && !window._elevenLabsAudio.paused && !window._elevenLabsAudio.ended) ||
                      currentPlayingBtn;
    stopBtn.disabled = !isPlaying;
  }

  function isElevenLabsConfigured() {
    const cfg = window.APP_CONFIG || {};
    return !!cfg.ELEVENLABS_ENABLED && !!cfg.ELEVENLABS_API_KEY &&
           cfg.ELEVENLABS_API_KEY !== 'YOUR_ELEVENLABS_API_KEY_HERE';
  }

  async function speakElevenLabs(text, role, btn) {
    const cfg = window.APP_CONFIG || {};
    const voices = cfg.ELEVENLABS_VOICES || {};
    const voiceId = voices[role && role.toLowerCase()] || voices.judge || 'ZQe5CZNOzWyzPSCn5a3c';
    try {
      const resp = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': cfg.ELEVENLABS_API_KEY,
          'Accept': 'audio/mpeg'
        },
        body: JSON.stringify({
          text: text || '',
          model_id: 'eleven_flash_v2_5',
          voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.0 }
        })
      });
      if (!resp.ok) throw new Error(`ElevenLabs ${resp.status}`);
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      if (window._elevenLabsAudio) {
        try { window._elevenLabsAudio.pause(); } catch(_) {}
      }
      const audio = new Audio(url);
      window._elevenLabsAudio = audio;
      audio.onended = () => { clearPlayingState(); URL.revokeObjectURL(url); };
      audio.onerror = () => { clearPlayingState(); URL.revokeObjectURL(url); };
      if (btn) {
        btn.classList.add('playing');
        btn.textContent = '⏹ stop';
      }
      currentPlayingBtn = btn;
      updateStopButton();
      await audio.play();
    } catch (e) {
      console.warn('ElevenLabs TTS failed, falling back to SpeechSynthesis:', e);
      throw e;
    }
  }

  function speak(text, role, btn) {
    window.speechSynthesis && window.speechSynthesis.cancel();
    fullTrialQueue = null;
    if (currentPlayingBtn === btn) { clearPlayingState(); return; }
    playBarkSound();

    const avatar = btn && btn.closest ? (btn.closest('.dc-line') ? btn.closest('.dc-line').querySelector('.dc-avatar') : null) : null;

    const onStartVisuals = () => {
      document.querySelectorAll('.dc-play-line').forEach(b => { b.classList.remove('playing'); b.textContent = '▶ play'; });
      document.querySelectorAll('.dc-avatar.speaking').forEach(a => a.classList.remove('speaking'));
      if (btn) { btn.classList.add('playing'); btn.textContent = '⏹ stop'; }
      if (avatar) avatar.classList.add('speaking');
      currentPlayingBtn = btn;
      currentPlayingAvatar = avatar;
      updateStopButton();
    };

    setTimeout(async () => {
      if (isElevenLabsConfigured()) {
        try {
          onStartVisuals();
          await speakElevenLabs(text, role, btn);
          return;
        } catch (_) {
          // fall through to speechSynthesis below
        }
      }
      if (!window.speechSynthesis) return;
      const utter = new SpeechSynthesisUtterance(text);
      const profile = roleVoiceProfile[role] || { pitch: 1, rate: 1 };
      utter.pitch = profile.pitch; utter.rate = profile.rate;
      const v = pickVoiceForRole(role);
      if (v) utter.voice = v;
      onStartVisuals();
      utter.onend = () => { clearPlayingState(); };
      utter.onerror = () => { clearPlayingState(); };
      window.speechSynthesis.speak(utter);
    }, 220);

    updateStopButton();
  }

  const roleClass = { JUDGE: 'role-judge', PROSECUTOR: 'role-prosecutor', DEFENSE: 'role-defense', WITNESS: 'role-witness' };
  const roleIcon = { JUDGE: '⚖️', PROSECUTOR: '💼', DEFENSE: '🐾', WITNESS: '👁️' };

  const exhibitMap = [
    { keys: ['shoe', 'loafer', 'sneaker', 'boot', 'sandal'], icon: '👟' },
    { keys: ['chicken', 'turkey', 'meat', 'steak', 'sausage', 'ham'], icon: '🍗' },
    { keys: ['sock'], icon: '🧦' },
    { keys: ['vacuum'], icon: '🧹' },
    { keys: ['table', 'coffee table', 'furniture'], icon: '🛋️' },
    { keys: ['hole', 'garden', 'flower', 'dig', 'yard'], icon: '🕳️' },
    { keys: ['escape', 'fence', 'gate', 'gap'], icon: '🚪' },
    { keys: ['trash', 'garbage', 'bin'], icon: '🗑️' },
    { keys: ['toilet paper', 'tissue'], icon: '🧻' },
    { keys: ['cake', 'cookie', 'treat', 'snack'], icon: '🍪' },
    { keys: ['mail', 'package', 'delivery'], icon: '📦' },
    { keys: ['pillow', 'cushion', 'couch', 'sofa'], icon: '🛋️' },
    { keys: ['bark', 'noise'], icon: '📢' },
  ];

  function pickExhibitIcon(crimeText) {
    const lower = crimeText.toLowerCase();
    for (const entry of exhibitMap) {
      if (entry.keys.some(k => lower.includes(k))) return entry.icon;
    }
    return '🐾';
  }

  function reactionSVG(isGuilty) {
    if (!isGuilty) {
      return `<svg viewBox="0 0 100 100">
        <g id="dc-r-body">
          <path id="dc-r-tail" d="M78 68 Q94 60 90 42" stroke="#8a5a2b" stroke-width="8" fill="none" stroke-linecap="round"/>
          <ellipse cx="48" cy="78" rx="30" ry="14" fill="#c98a3d"/>
          <circle cx="46" cy="46" r="26" fill="#e3a94f"/>
          <path d="M24 32 Q14 22 18 44 Q26 46 30 38 Z" fill="#8a5a2b"/>
          <path d="M68 32 Q78 22 74 44 Q66 46 62 38 Z" fill="#8a5a2b"/>
          <ellipse cx="46" cy="56" rx="14" ry="10" fill="#f3d9a8"/>
          <ellipse cx="46" cy="52" rx="6" ry="4.5" fill="#241f16"/>
          <path d="M32 40 Q37 36 42 40" stroke="#241f16" stroke-width="2.4" fill="none" stroke-linecap="round"/>
          <path d="M50 40 Q55 36 60 40" stroke="#241f16" stroke-width="2.4" fill="none" stroke-linecap="round"/>
          <path d="M38 60 Q46 68 54 60" stroke="#241f16" stroke-width="2.4" fill="none" stroke-linecap="round"/>
          <path d="M50 62 Q54 65 50 68" stroke="#e35" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.75"/>
        </g>
      </svg>`;
    }
    return `<svg viewBox="0 0 100 100">
      <g id="dc-r-group">
        <ellipse cx="48" cy="82" rx="30" ry="12" fill="#c98a3d"/>
        <circle cx="46" cy="54" r="24" fill="#e3a94f"/>
        <path d="M25 44 Q17 50 22 62 Q29 60 31 52 Z" fill="#8a5a2b"/>
        <path d="M67 44 Q75 50 70 62 Q63 60 61 52 Z" fill="#8a5a2b"/>
        <ellipse cx="46" cy="62" rx="12" ry="8" fill="#f3d9a8"/>
        <ellipse cx="46" cy="59" rx="5" ry="3.5" fill="#241f16"/>
        <path d="M34 50 Q39 53 44 51" stroke="#241f16" stroke-width="2.2" fill="none" stroke-linecap="round"/>
        <path d="M48 51 Q53 53 58 50" stroke="#241f16" stroke-width="2.2" fill="none" stroke-linecap="round"/>
        <path d="M40 68 Q46 65 52 68" stroke="#241f16" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      </g>
    </svg>`;
  }

  function lineRow(speaker, role, text, delay) {
    const row = document.createElement('div');
    row.className = 'dc-line ' + (roleClass[role] || '');
    row.style.animationDelay = delay + 's';

    const avatar = document.createElement('div');
    avatar.className = 'dc-avatar';
    avatar.textContent = roleIcon[role] || '📋';
    row.appendChild(avatar);

    const body = document.createElement('div');
    body.className = 'dc-line-body';

    const speakerRow = document.createElement('div');
    speakerRow.className = 'dc-speaker-row';
    const label = document.createElement('div');
    label.className = 'dc-speaker';
    label.textContent = speaker;
    const playBtn = document.createElement('button');
    playBtn.className = 'dc-play-line';
    playBtn.textContent = '▶ play';
    playBtn.addEventListener('click', () => speak(text, role, playBtn));
    speakerRow.appendChild(label);
    speakerRow.appendChild(playBtn);

    const textEl = document.createElement('div');
    textEl.className = 'dc-text';
    textEl.textContent = text;

    body.appendChild(speakerRow);
    body.appendChild(textEl);
    row.appendChild(body);
    return row;
  }

  function spawnConfetti() {
    const colors = ['#a1301f', '#2f5c3f', '#b08d4f', '#d6a24a', '#e3c893'];
    for (let i = 0; i < 40; i++) {
      const el = document.createElement('div');
      el.className = 'dc-confetti';
      el.style.left = Math.random() * 100 + 'vw';
      el.style.background = colors[Math.floor(Math.random() * colors.length)];
      el.style.animationDuration = (2.2 + Math.random() * 1.4) + 's';
      el.style.animationDelay = (Math.random() * 0.3) + 's';
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 4200);
    }
  }

  // --- LocalStorage Case History Archive ---
  function getArchive() {
    try {
      return JSON.parse(localStorage.getItem('dc_archive') || '[]');
    } catch (_) { return []; }
  }

  function saveCaseToArchive(data) {
    try {
      const archive = getArchive();
      archive.unshift(data);
      if (archive.length > 20) archive.pop();
      localStorage.setItem('dc_archive', JSON.stringify(archive));
      updateArchiveCount();
    } catch (_) {}
  }

  function updateArchiveCount() {
    if (archiveCount) archiveCount.textContent = getArchive().length;
  }
  updateArchiveCount();

  function renderArchiveModal() {
    const cases = getArchive();
    if (!cases.length) {
      archiveList.innerHTML = '<p class="dc-empty-msg">No prior cases recorded on this court docket yet.</p>';
      return;
    }
    archiveList.innerHTML = '';
    cases.forEach((item, idx) => {
      const card = document.createElement('div');
      card.className = 'dc-archive-card';
      const isGuilty = /guilty/i.test(item.judge_verdict || '');
      card.innerHTML = `
        <div class="dc-archive-header">
          <span class="dc-archive-caseno">${item.case_number || 'DC-0000'}</span>
          <span class="dc-archive-verdict ${isGuilty ? 'guilty' : 'acquitted'}">${item.judge_verdict || 'PENDING'}</span>
        </div>
        <div class="dc-archive-title">${item.dogname || 'The Defendant'} (${item.breed || 'Canine'})</div>
        <div class="dc-archive-crime">&ldquo;${item.charge || item.crime || ''}&rdquo;</div>
        <div class="dc-archive-actions">
          <button class="dc-top-btn dc-arch-replay" data-idx="${idx}">▶ Load & Replay</button>
          <button class="dc-top-btn dc-arch-cert" data-idx="${idx}">📜 Certificate</button>
        </div>
      `;
      archiveList.appendChild(card);
    });

    archiveList.querySelectorAll('.dc-arch-replay').forEach(b => {
      b.addEventListener('click', () => {
        const idx = b.dataset.idx;
        const caseData = cases[idx];
        if (caseData) {
          archiveModal.classList.remove('active');
          renderCase(caseData, false);
        }
      });
    });

    archiveList.querySelectorAll('.dc-arch-cert').forEach(b => {
      b.addEventListener('click', () => {
        const idx = b.dataset.idx;
        const caseData = cases[idx];
        if (caseData) generateCourtCertificate(caseData);
      });
    });
  }

  if (archiveBtn) archiveBtn.addEventListener('click', () => { renderArchiveModal(); archiveModal.classList.add('active'); });
  if (archiveClose) archiveClose.addEventListener('click', () => archiveModal.classList.remove('active'));

  // --- HTML5 Canvas Official Court Certificate Generator ---
  function drawWrappedCanvasText(ctx, text, startX, startY, maxWidth, lineHeight) {
    const words = (text || '').split(' ');
    let lines = [];
    let currentLine = words[0] || '';

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + ' ' + word).width;
      if (width < maxWidth) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);

    const totalHeight = (lines.length - 1) * lineHeight;
    let y = startY - (totalHeight / 2);
    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], startX, y);
      y += lineHeight;
    }
    return lines.length;
  }

  function generateCourtCertificate(data) {
    const canvas = document.getElementById('dc-cert-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Parchment Background
    ctx.fillStyle = '#f6edd9';
    ctx.fillRect(0, 0, 1200, 900);

    // Vignette / Aged Border Pattern
    const grad = ctx.createRadialGradient(600, 450, 400, 600, 450, 750);
    grad.addColorStop(0, 'rgba(255,255,255,0.4)');
    grad.addColorStop(1, 'rgba(180,140,80,0.3)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1200, 900);

    // Double Ornate Borders
    ctx.strokeStyle = '#241f16';
    ctx.lineWidth = 10;
    ctx.strokeRect(30, 30, 1140, 840);
    ctx.strokeStyle = '#b08d4f';
    ctx.lineWidth = 4;
    ctx.strokeRect(45, 45, 1110, 810);

    // Corner Ornaments
    const drawCorner = (x, y) => {
      ctx.fillStyle = '#b08d4f';
      ctx.beginPath();
      ctx.arc(x, y, 16, 0, Math.PI * 2);
      ctx.fill();
    };
    drawCorner(45, 45); drawCorner(1155, 45); drawCorner(45, 855); drawCorner(1155, 855);

    // Header Title
    ctx.textAlign = 'center';
    ctx.fillStyle = '#b08d4f';
    ctx.font = 'bold 24px "Special Elite", monospace';
    ctx.fillText('SUPREME COURT OF DOMESTIC GRIEVANCES', 600, 105);

    ctx.fillStyle = '#241f16';
    ctx.font = 'bold italic 52px "Playfair Display", serif';
    ctx.fillText('OFFICIAL JUDICIAL DECREE', 600, 165);

    ctx.strokeStyle = '#241f16';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(400, 185); ctx.lineTo(800, 185); ctx.stroke();

    // Case Details
    ctx.font = '20px "Special Elite", monospace';
    ctx.fillStyle = '#5a4f3a';
    ctx.fillText(`DOCKET NO. ${data.case_number || 'DC-2026-101'}`, 600, 222);

    ctx.font = 'bold 34px "PT Serif", serif';
    ctx.fillStyle = '#241f16';
    ctx.fillText(`IN THE MATTER OF: ${data.dogname || 'THE DEFENDANT'}`.toUpperCase(), 600, 280);

    if (data.breed) {
      ctx.font = 'italic 22px "PT Serif", serif';
      ctx.fillStyle = '#5a4f3a';
      ctx.fillText(`Alleged Breed: ${data.breed}`, 600, 318);
    }

    // Offense Charged Box (Sized to fit multi-line wrapped text)
    const chargeBoxY = 350;
    const chargeBoxH = 135;
    ctx.fillStyle = '#e8dec5';
    ctx.fillRect(150, chargeBoxY, 900, chargeBoxH);
    ctx.strokeStyle = '#b08d4f';
    ctx.lineWidth = 2;
    ctx.strokeRect(150, chargeBoxY, 900, chargeBoxH);

    ctx.font = 'bold 18px "Special Elite", monospace';
    ctx.fillStyle = '#a1301f';
    ctx.fillText('OFFENSE CHARGED:', 600, chargeBoxY + 28);

    const chargeText = `"${data.charge || data.crime || 'Chewing domestic goods'}"`;
    ctx.font = 'bold italic 22px "Playfair Display", serif';
    ctx.fillStyle = '#241f16';
    drawWrappedCanvasText(ctx, chargeText, 600, chargeBoxY + 80, 840, 28);

    // Sentence Section
    ctx.font = 'bold 18px "Special Elite", monospace';
    ctx.fillStyle = '#a1301f';
    ctx.fillText('SENTENCE / DECREE:', 600, 520);

    const sentenceText = data.sentence || 'Probation and extra belly rubs';
    ctx.font = 'italic 21px "PT Serif", serif';
    ctx.fillStyle = '#241f16';
    drawWrappedCanvasText(ctx, sentenceText, 600, 555, 880, 26);

    // Golden Wax Seal
    ctx.save();
    ctx.translate(960, 700);
    ctx.fillStyle = '#b08d4f';
    ctx.beginPath(); ctx.arc(0, 0, 65, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#d4b876'; ctx.lineWidth = 4; ctx.stroke();
    ctx.fillStyle = '#17130d'; ctx.font = 'bold 12px "Special Elite", monospace';
    ctx.fillText('SEAL OF JUSTICE', 0, -10);
    ctx.fillText('DOG COURT', 0, 10);
    ctx.fillText('VERIFIED 2026', 0, 30);
    ctx.restore();

    // Verdict Stamp
    const isGuilty = /guilty/i.test(data.judge_verdict || '');
    ctx.save();
    ctx.translate(320, 690);
    ctx.rotate(-0.15);
    ctx.strokeStyle = isGuilty ? '#a1301f' : '#2f5c3f';
    ctx.lineWidth = 8;
    ctx.strokeRect(-160, -45, 320, 90);
    ctx.fillStyle = isGuilty ? '#a1301f' : '#2f5c3f';
    ctx.font = 'bold 44px "Special Elite", monospace';
    ctx.fillText(data.judge_verdict || 'GUILTY', 0, 14);
    ctx.restore();

    // Judge Signature
    ctx.font = 'italic 26px "Playfair Display", serif';
    ctx.fillStyle = '#241f16';
    ctx.fillText('Hon. Sir Barks-a-Lot 🐾', 600, 770);
    ctx.font = '16px "Special Elite", monospace';
    ctx.fillStyle = '#5a4f3a';
    ctx.fillText('Chief Presiding Justice of Domestic Grievances', 600, 800);

    // Download Image Trigger
    const link = document.createElement('a');
    link.download = `Dog_Court_Verdict_${data.case_number || 'DC-2026'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  // --- Random Case Generator Preset ---
  const presetCrimes = [
    { name: 'Sir Barks-a-Lot', breed: 'Goldendoodle', crime: 'Ate an entire left shoe while owner was on a work call, left the right shoe completely untouched' },
    { name: 'Barnaby', breed: 'Basset Hound', crime: 'Barked at a cardboard box in the hallway for 45 straight minutes believing it was an intruder' },
    { name: 'Princess Destruction', breed: 'French Bulldog', crime: 'Shredded an entire roll of toilet paper into fine snow across the living room rug' },
    { name: 'Inspector Woof', breed: 'German Shepherd', crime: 'Stole a rotisserie chicken off the counter in under four seconds, evidence: one greasy paper bag' },
    { name: 'Waffles', breed: 'Pembroke Welsh Corgi', crime: 'Body-slammed the coffee table exactly as the Zoom call went live' },
    { name: 'Wigglebutt', breed: 'Pitbull Terrier', crime: 'Slept through a smoke alarm but woke up instantly at the sound of a cheese wrapper opening 3 rooms away' },
    { name: 'Shadow', breed: 'Husky Mix', crime: 'Escaped the yard through a gap no human believed a dog could fit through' },
    { name: 'Biscuit', breed: 'Suspiciously Innocent Labrador', crime: 'Dug a hole in the newly planted flower bed and buried a single sock in it' }
  ];

  if (randomBtn) {
    randomBtn.addEventListener('click', () => {
      const p = presetCrimes[Math.floor(Math.random() * presetCrimes.length)];
      dognameEl.value = p.name;
      breedEl.value = p.breed;
      crimeEl.value = p.crime;
      updateMugshot();

      // Random coat + accessory toggle
      const coats = ['golden', 'black', 'husky', 'dalmatian'];
      const accs = ['none', 'wig', 'bowtie', 'hat'];
      currentCoat = coats[Math.floor(Math.random() * coats.length)];
      currentAccessory = accs[Math.floor(Math.random() * accs.length)];
      renderMugshotSVG();

      document.querySelectorAll('.dc-chip').forEach(c => c.classList.remove('selected'));
    });
  }

  function renderCase(data, isNew = true) {
    data.dogname = dognameEl.value.trim() || data.dogname || 'The Defendant';
    data.breed = breedEl.value.trim() || data.breed || '';
    data.crime = crimeEl.value.trim() || data.charge || '';

    wrap.innerHTML = '';
    mugMeta.innerHTML = 'CHARGE: ' + (data.charge || '').toUpperCase() + '<br/>STATUS: TRIAL IN SESSION';

    const t = document.createElement('div');
    t.className = 'dc-transcript';

    const caseNo = document.createElement('div');
    caseNo.className = 'dc-case-no';
    caseNo.textContent = 'CASE NO. ' + (data.case_number || 'DC-0000');
    t.appendChild(caseNo);

    const charge = document.createElement('div');
    charge.className = 'dc-charge';
    charge.textContent = data.charge || '';
    t.appendChild(charge);

    const exhibit = document.createElement('div');
    exhibit.className = 'dc-exhibit';
    const exhibitIconWrap = document.createElement('div');
    exhibitIconWrap.className = 'dc-exhibit-icon';
    exhibitIconWrap.textContent = pickExhibitIcon((crimeEl.value || data.charge || ''));
    const exhibitText = document.createElement('div');
    exhibitText.innerHTML = '<div class="dc-exhibit-label">Exhibit A</div><div class="dc-exhibit-title">' +
      (crimeEl.value ? crimeEl.value.replace(/</g, '&lt;') : (data.charge || '')) + '</div>';
    exhibit.appendChild(exhibitIconWrap);
    exhibit.appendChild(exhibitText);
    t.appendChild(exhibit);

    let d = 0;
    const step = 0.12;
    t.appendChild(lineRow('PROSECUTOR', 'PROSECUTOR', data.prosecutor_opening || '', d)); d += step;
    (data.witnesses || []).forEach(w => {
      t.appendChild(lineRow((w.name || 'WITNESS').toUpperCase(), 'WITNESS', w.testimony || '', d)); d += step;
    });
    t.appendChild(lineRow('DEFENSE COUNSEL', 'DEFENSE', data.defense_argument || '', d)); d += step;

    const verdictWrap = document.createElement('div');
    verdictWrap.className = 'dc-verdict-wrap';

    const gavel = document.createElement('div');
    gavel.innerHTML = `<svg class="dc-gavel animate" viewBox="0 0 100 100" fill="none">
      <g transform="translate(50,50)">
        <rect x="-6" y="-38" width="12" height="30" rx="3" fill="#8a5a2b" transform="rotate(0)"/>
        <rect x="-18" y="-42" width="36" height="16" rx="4" fill="#5a3a1a"/>
        <rect x="-4" y="8" width="8" height="26" rx="3" fill="#8a5a2b"/>
        <ellipse cx="0" cy="36" rx="20" ry="5" fill="#3a2610" opacity="0.5"/>
      </g>
    </svg>`;
    verdictWrap.appendChild(gavel);

    const stamp = document.createElement('div');
    const isGuilty = /guilty/i.test(data.judge_verdict || '');
    stamp.className = 'dc-stamp ' + (isGuilty ? 'guilty' : 'acquitted');
    stamp.textContent = data.judge_verdict || 'VERDICT PENDING';
    verdictWrap.appendChild(stamp);
    t.appendChild(verdictWrap);

    const reaction = document.createElement('div');
    reaction.className = 'dc-reaction ' + (isGuilty ? 'guilty' : 'acquitted');
    reaction.innerHTML = reactionSVG(isGuilty);
    t.appendChild(reaction);

    t.appendChild(lineRow('JUDGE', 'JUDGE', data.verdict_reasoning || '', d)); d += step;

    if (data.sentence) {
      const sentence = document.createElement('div');
      sentence.className = 'dc-sentence';
      sentence.style.opacity = '0';
      sentence.style.animation = 'dc-line-in 0.35s ease forwards';
      sentence.style.animationDelay = d + 's';
      sentence.textContent = 'Sentencing: ' + data.sentence;
      t.appendChild(sentence);
    }

    const controls = document.createElement('div');
    controls.className = 'dc-controls-row';

    const certBtn = document.createElement('button');
    certBtn.className = 'dc-secondary-btn dc-cert-btn';
    certBtn.textContent = '📜 Download Official Court Certificate';
    certBtn.addEventListener('click', () => generateCourtCertificate(data));

    const playAll = document.createElement('button');
    playAll.className = 'dc-secondary-btn';
    playAll.textContent = 'Play Full Trial';
    playAll.addEventListener('click', () => playFullTrial(data));

    const newCase = document.createElement('button');
    newCase.className = 'dc-secondary-btn';
    newCase.textContent = 'File Another Case';
    newCase.addEventListener('click', () => {
      stopAllAudio();
      wrap.innerHTML = '';
      statusEl.textContent = '';
      mugMeta.innerHTML = 'STATUS: AWAITING CHARGES<br/>PRIOR OFFENSES: SUSPICIOUSLY CLEAN RECORD';
      document.querySelectorAll('.dc-chip').forEach(c => c.classList.remove('selected'));
    });

    const stopBtn = document.createElement('button');
    stopBtn.className = 'dc-secondary-btn dc-stop-btn';
    stopBtn.id = 'dc-stop-btn';
    stopBtn.textContent = '⏹ Stop Audio';
    stopBtn.disabled = true;
    stopBtn.addEventListener('click', stopAllAudio);

    controls.appendChild(certBtn);
    controls.appendChild(playAll);
    controls.appendChild(newCase);
    controls.appendChild(stopBtn);
    t.appendChild(controls);

    wrap.appendChild(t);
    mugMeta.innerHTML = 'VERDICT: ' + (data.judge_verdict || '') + '<br/>CHARGE: ' + (data.charge || '').toUpperCase();

    // Trigger wooden gavel hit sound effect
    setTimeout(playGavelImpactSound, 480);

    if (!isGuilty) {
      setTimeout(spawnConfetti, 550);
    } else {
      const cardEl = document.querySelector('.dc-card');
      setTimeout(() => {
        cardEl.classList.add('shake');
        setTimeout(() => cardEl.classList.remove('shake'), 450);
      }, 550);
    }

    if (isNew) saveCaseToArchive(data);
  }

  let fullTrialQueue = null;

  function playFullTrial(data) {
    const hasSynthesis = !!window.speechSynthesis || isElevenLabsConfigured();
    if (!hasSynthesis) return;
    window.speechSynthesis && window.speechSynthesis.cancel();
    if (window._elevenLabsAudio) {
      try { window._elevenLabsAudio.pause(); window._elevenLabsAudio.src = ''; } catch(_) {}
      window._elevenLabsAudio = null;
    }
    clearPlayingState();

    const sequence = [
      { role: 'PROSECUTOR', text: data.prosecutor_opening },
      ...(data.witnesses || []).map(w => ({ role: 'WITNESS', text: w.testimony })),
      { role: 'DEFENSE', text: data.defense_argument },
      { role: 'JUDGE', text: data.verdict_reasoning },
      { role: 'JUDGE', text: data.sentence ? ('Sentencing: ' + data.sentence) : '' }
    ].filter(s => s.text);

    fullTrialQueue = sequence;
    let i = 0;
    updateStopButton();

    async function next() {
      if (!fullTrialQueue || i >= sequence.length) { fullTrialQueue = null; updateStopButton(); return; }
      const item = sequence[i];
      playBarkSound();
      setTimeout(async () => {
        if (!fullTrialQueue) return;
        let advanced = false;
        const advance = () => { if (!advanced) { advanced = true; i++; next(); } };

        if (isElevenLabsConfigured()) {
          try {
            await speakElevenLabs(item.text, item.role, null);
            advance();
            return;
          } catch (_) { /* fall back to speechSynthesis */ }
        }
        if (!window.speechSynthesis) { advance(); return; }
        const utter = new SpeechSynthesisUtterance(item.text);
        const profile = roleVoiceProfile[item.role] || { pitch: 1, rate: 1 };
        utter.pitch = profile.pitch; utter.rate = profile.rate;
        const v = pickVoiceForRole(item.role);
        if (v) utter.voice = v;
        utter.onend = () => { i++; next(); };
        utter.onerror = () => { i++; next(); };
        window.speechSynthesis.speak(utter);
      }, 220);
    }
    next();
  }

  let loadingInterval;

  async function fileCase() {
    const dogname = dognameEl.value.trim() || 'The Defendant';
    const breed = breedEl.value.trim();
    const crime = crimeEl.value.trim();

    if (!crime) {
      statusEl.textContent = 'The court requires a description of the alleged crime — tap a chip or write your own.';
      return;
    }

    fileBtn.disabled = true;
    statusEl.textContent = '';
    wrap.innerHTML = '';
    loadingEl.classList.add('active');
    let li = 0;
    loadingTextEl.textContent = loadingLines[0];
    loadingInterval = setInterval(() => {
      li = (li + 1) % loadingLines.length;
      loadingTextEl.textContent = loadingLines[li];
    }, 1400);

    const systemPrompt = `You are a courtroom script generator for a satirical comedy web app called "Dog Court," where a dog is put on mock trial for a household "crime." Write in the deadpan, self-serious tone of a legal drama — NOT a sentimental dog story. Everyone in the courtroom treats the case with total sincerity even though the crime is trivial.

Respond with ONLY valid JSON, no markdown fences, no preamble, matching exactly this schema:
{
  "case_number": "short case number like DC-2026-114",
  "charge": "one formal legal-sounding charge line, punchy, max 20 words",
  "prosecutor_opening": "2-3 sentences, prosecutor's opening statement, dramatic and accusatory",
  "witnesses": [
    {"name": "witness name (can be a pet, appliance, or object, e.g. 'The Living Room Rug' or 'Mr. Whiskers the Cat')", "testimony": "1-2 sentences of testimony, deadpan and specific"},
    {"name": "a second distinct witness", "testimony": "1-2 sentences"}
  ],
  "defense_argument": "2-3 sentences, the defense attorney's argument on the dog's behalf, passionate but absurd legal logic",
  "judge_verdict": "either GUILTY or ACQUITTED or CASE DISMISSED, in caps",
  "verdict_reasoning": "2-3 sentences, judge's reasoning, wise and slightly amused",
  "sentence": "one short absurd sentence/punishment if guilty, or one line of restored privileges if acquitted, max 20 words"
}`;

    const userPrompt = `Defendant: ${dogname}${breed ? ' (' + breed + ')' : ''}\nAlleged crime: ${crime}`;

    const cfg = window.APP_CONFIG || {};
    const GEMINI_API_KEY = cfg.GEMINI_API_KEY;

    // First attempt Vercel Serverless Proxy (/api/generate) if client API key is not set
    let proxySuccess = false;
    let proxyData = null;

    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
      try {
        const proxyResp = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: userPrompt, systemPrompt: systemPrompt })
        });
        if (proxyResp.ok) {
          proxyData = await proxyResp.json();
          proxySuccess = true;
        }
      } catch (_) { /* proxy unavailable, check client key */ }
    }

    if (proxySuccess && proxyData) {
      try {
        const rawText = proxyData.candidates && proxyData.candidates[0] && proxyData.candidates[0].content.parts[0].text;
        if (rawText) {
          let cleaned = rawText.trim().replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim();
          const parsed = JSON.parse(cleaned);
          renderCase(parsed, true);
          return;
        }
      } catch (e) {
        console.error('Error parsing Vercel API proxy data:', e);
      } finally {
        clearInterval(loadingInterval);
        loadingEl.classList.remove('active');
        fileBtn.disabled = false;
      }
    }

    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
      alert('Please set your GEMINI_API_KEY in Vercel Environment Variables or in Settings (⚙️) first.');
      loadingEl.classList.remove('active');
      fileBtn.disabled = false;
      throw new Error('API key not configured.');
    }

    const freeTierModels = [
      'gemini-2.0-flash-001',
      'gemini-2.0-flash',
      'gemini-flash-latest',
      'gemini-2.5-flash-lite',
      'gemini-3.1-flash-lite',
      'gemini-2.5-flash',
      'gemini-2.5-pro',
      'gemini-pro-latest'
    ];

    const preferredFirst = cfg.GEMINI_MODEL ? [cfg.GEMINI_MODEL] : [];
    const fallbackModels = [];
    for (const m of preferredFirst.concat(freeTierModels)) {
      if (!fallbackModels.includes(m)) fallbackModels.push(m);
    }

    const apiVersions = (cfg.GEMINI_API_VERSION ? [cfg.GEMINI_API_VERSION] : []).concat(['v1beta', 'v1']);

    const requestBody = JSON.stringify({
      contents: [{ parts: [{ text: systemPrompt + '\n\n' + userPrompt }] }]
    });

    let lastError = null;
    let lastErrorStatus = 0;
    let success = false;
    let data = null;
    let usedModel = null;
    let usedVersion = null;

    const RETRYABLE_STATUSES = new Set([404, 400, 503, 500, 502, 504]);
    const CONTINUE_ON_STATUSES = new Set([404, 400, 503, 500, 502, 504, 429]);
    const MAX_RETRIES_PER_MODEL = 2;
    const RETRY_DELAY_MS = 700;
    const QUOTA_RETRY_DELAY_MS = 1500;
    const sleep = (ms) => new Promise(res => setTimeout(res, ms));

    outer:
    for (const version of apiVersions) {
      inner:
      for (const model of fallbackModels) {
        const endpoint = `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent`;
        for (let attempt = 1; attempt <= MAX_RETRIES_PER_MODEL; attempt++) {
          try {
            const response = await fetch(endpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': GEMINI_API_KEY
              },
              body: requestBody
            });

            if (response.ok) {
              data = await response.json();
              usedModel = model;
              usedVersion = version;
              success = true;
              break outer;
            }

            let errDetail = '';
            try {
              const errData = await response.json();
              if (errData && errData.error) {
                errDetail = errData.error.message || errData.error.code || JSON.stringify(errData.error);
              }
            } catch (_) {}
            lastError = new Error(`API error ${response.status} — ${errDetail || response.statusText} (${version}/${model})`);
            lastErrorStatus = response.status;

            if (!CONTINUE_ON_STATUSES.has(response.status)) {
              break outer;
            }

            if (attempt < MAX_RETRIES_PER_MODEL) {
              if (response.status === 429) {
                await sleep(QUOTA_RETRY_DELAY_MS);
              } else if (response.status === 503 || response.status >= 500) {
                await sleep(RETRY_DELAY_MS);
              } else if (RETRYABLE_STATUSES.has(response.status)) {
                await sleep(RETRY_DELAY_MS / 2);
              } else {
                continue inner;
              }
              continue;
            }

            continue inner;
          } catch (netErr) {
            lastError = netErr;
            lastErrorStatus = 0;
            if (attempt < MAX_RETRIES_PER_MODEL) {
              await sleep(RETRY_DELAY_MS);
              continue;
            }
          }
        }
      }
    }

    if (!success) {
      if (lastErrorStatus === 429) {
        statusEl.textContent = '';
        const quotaMsg = document.createElement('div');
        quotaMsg.style.cssText = 'margin-top:14px;padding:12px 14px;background:#3b2626;border:1.5px solid #a1301f;border-radius:4px;font-family:PT Serif,serif;font-size:14px;color:#f3d9c4;line-height:1.6;';
        quotaMsg.innerHTML = `
          <div style="font-family:'Special Elite',monospace;font-size:13px;letter-spacing:0.1em;text-transform:uppercase;color:#ffb199;margin-bottom:6px;">⚠️ 429 — Free Tier Quota Exceeded</div>
          You&rsquo;ve temporarily hit the Google Gemini free-tier rate-limit. Enter a fresh API key in Settings (⚙️) to continue immediately.
        `;
        statusEl.parentNode.insertBefore(quotaMsg, statusEl.nextSibling);
      }
      throw lastError || new Error('All API endpoints failed.');
    }

    try {
      const rawText = data.candidates && data.candidates[0] && data.candidates[0].content.parts[0].text;
      if (!rawText) throw new Error('No transcript returned.');

      let cleaned = rawText.trim().replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim();
      const parsed = JSON.parse(cleaned);

      renderCase(parsed, true);
    } catch (err) {
      console.error(err);
      statusEl.textContent = 'Order in the court! Something went wrong: ' + err.message;
    } finally {
      clearInterval(loadingInterval);
      loadingEl.classList.remove('active');
      fileBtn.disabled = false;
    }
  }

  fileBtn.addEventListener('click', fileCase);
})();
