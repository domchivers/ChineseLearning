/* 中文 Beginner A trainer — vanilla JS, no build step, offline.
 * Data comes from data.js (window.VOCAB). Progress lives in localStorage. */

(() => {
  "use strict";

  const LS_KEY = "zhBeginnerA.srs.v1";
  const LS_PREFS = "zhBeginnerA.prefs.v1";

  // ---- Build a flat list of cards with stable ids ----
  const LESSONS = VOCAB.lessons;
  const CARDS = [];
  // One card per unique word; first lesson wins. Keyed on hanzi + meaning, so a
  // character re-taught with a genuinely NEW meaning (e.g. 在 "at, in, on" in l3
  // vs the progressive 在 "in the middle of doing" in b7) still earns its own
  // card, while a plain repeat (same meaning) is shown only once.
  const seenHanzi = new Set();
  const normEn = s => (s || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
  LESSONS.forEach(lesson => {
    lesson.words.forEach((w, i) => {
      const dedupKey = w.hanzi + "|" + normEn(w.en);
      if (seenHanzi.has(dedupKey)) return;
      seenHanzi.add(dedupKey);
      CARDS.push({
        id: `${lesson.id}:${i}`,
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        hanzi: w.hanzi,
        pinyin: w.pinyin,
        pos: w.pos || "",
        en: w.en
      });
    });
  });
  const CARD_BY_ID = Object.fromEntries(CARDS.map(c => [c.id, c]));
  const PINYIN_BY_HANZI = Object.fromEntries(CARDS.map(c => [c.hanzi, c.pinyin]));
  const lessonCardCount = id => CARDS.reduce((n, c) => n + (c.lessonId === id ? 1 : 0), 0);

  // ---- Focus directions ----
  /* ---- Icons -----------------------------------------------------------
     Drawn inline rather than loaded from a font: the markup referenced a
     Tabler icon font that was never bundled, so every icon rendered 0px wide.
     These use currentColor, so they inherit whatever colour they sit in.   */
  // Bumped with the app version so replaced artwork is never served stale.
  const ASSET_V = "?v=193";
  const APP_VERSION = ASSET_V.replace("?v=", "v");   // e.g. "v148" — shown in Settings
  const ICON_NS = "http://www.w3.org/2000/svg";
  const rotN = (inner, n) => Array.from({ length: n },
    (_, i) => `<g transform="rotate(${i * 360 / n} 12 12)">${inner}</g>`).join("");
  const ICONS = {
    flame: '<path d="M12 2c.6 3 2.2 4.2 3.6 5.9A6.6 6.6 0 0 1 17.4 12a5.4 5.4 0 1 1-10.8 0c0-1.6.6-2.8 1.5-3.9C9.4 6.6 11.4 5.2 12 2Z"/>'
         + '<path d="M12 12.5c1.3 1.3 2.1 2.1 2.1 3.4a2.1 2.1 0 1 1-4.2 0c0-1.3.8-2.1 2.1-3.4Z" opacity=".42"/>',
    lotus: rotN('<ellipse cx="12" cy="7.6" rx="2.35" ry="4.4"/>', 5) + '<circle cx="12" cy="12" r="2.1"/>',
    chart: '<rect x="3.4" y="13" width="4.3" height="7.4" rx="1.7"/>'
         + '<rect x="9.85" y="8" width="4.3" height="12.4" rx="1.7"/>'
         + '<rect x="16.3" y="3.6" width="4.3" height="16.8" rx="1.7"/>',
    gear:  rotN('<rect x="10.8" y="1.3" width="2.4" height="4.1" rx="1.2"/>', 8)
         + '<circle cx="12" cy="12" r="6.4" fill="none" stroke="currentColor" stroke-width="2.4"/>'
         + '<circle cx="12" cy="12" r="2.4"/>',
    repeat:'<path d="M4 11.5a8 8 0 0 1 13.6-5.7" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"/>'
         + '<path d="M20 12.5a8 8 0 0 1-13.6 5.7" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"/>'
         + '<path d="M17.8 2.6v3.9h-3.9M6.2 21.4v-3.9h3.9" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/>',
    lock:  '<path d="M8.3 10.3V7.7a3.7 3.7 0 0 1 7.4 0v2.6" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"/>'
         + '<rect x="4.9" y="10" width="14.2" height="10.1" rx="2.9"/>',
    check: '<path d="M5 12.6l4.4 4.4L19 7.4" fill="none" stroke="currentColor" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round"/>'
  };
  function icon(name, size) {
    const s = document.createElementNS(ICON_NS, "svg");
    s.setAttribute("viewBox", "0 0 24 24");
    s.setAttribute("width", size || 22);
    s.setAttribute("height", size || 22);
    s.setAttribute("fill", "currentColor");
    s.setAttribute("aria-hidden", "true");
    s.classList.add("ico");
    s.innerHTML = ICONS[name] || "";
    return s;
  }
  // fill in any <span data-icon="name"> placeholders sitting in the markup
  function hydrateIcons(root) {
    (root || document).querySelectorAll("[data-icon]").forEach(sp => {
      if (sp.dataset.iconDone) return;
      sp.dataset.iconDone = "1";
      sp.appendChild(icon(sp.dataset.icon, +sp.dataset.size || 22));
    });
  }

  const FOCUSES = [
    { key: "recognize", ico: "i-eye",        name: "Read characters",     desc: "See 汉字, recall the meaning" },
    { key: "recall",    ico: "i-type",       name: "Recall from English", desc: "English → produce the 汉字" },
    { key: "pinyin",    ico: "i-languages",  name: "Pinyin",              desc: "Pick the correct pinyin — tones matter" },
    { key: "listen",    ico: "i-headphones", name: "Listen",              desc: "Hear it, then pick what it means" },
    { key: "write",     ico: "i-pencil",     name: "Write it",            desc: "Draw the character stroke by stroke" },
    { key: "sentence",  ico: "i-blocks",     name: "Build sentences",     desc: "Tap word tiles to assemble a sentence" },
    { key: "speak",     ico: "i-mic",        name: "Speak it",            desc: "Say the word aloud and get it checked" }
  ];
  const PRESETS = [
    { name: "Everything", keys: ["recognize", "recall", "pinyin", "listen", "write", "sentence", "speak"] },
    { name: "Reading",    keys: ["recognize", "recall", "pinyin"] },
    { name: "Writing",    keys: ["write", "recognize"] },
    { name: "Speaking",   keys: ["speak", "pinyin", "listen"] }
  ];

  // ---- Persistence ----
  function loadSRS() {
    try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; }
    catch { return {}; }
  }
  function saveSRS(s) { localStorage.setItem(LS_KEY, JSON.stringify(s)); }

  function loadPrefs() {
    try { return JSON.parse(localStorage.getItem(LS_PREFS)) || {}; }
    catch { return {}; }
  }
  function savePrefs(p) { localStorage.setItem(LS_PREFS, JSON.stringify(p)); }

  const LS_ACTIVITY = "zhBeginnerA.activity.v1";
  let srs = loadSRS();          // id -> { ease, interval(days), due(ts), reps }
  let prefs = loadPrefs();      // { lessons, focuses, theme, rate, dailyGoal, checkStrokes }

  const NOW = () => Date.now();
  const DAY = 24 * 60 * 60 * 1000;

  // ---- Appearance ----
  function applyTheme() {
    const t = prefs.theme || "system";
    if (t === "system") document.documentElement.removeAttribute("data-theme");
    else document.documentElement.setAttribute("data-theme", t);
  }
  const audioRate = () => (typeof prefs.rate === "number" ? prefs.rate : 0.85);
  const dailyGoal = () => (typeof prefs.dailyGoal === "number" ? prefs.dailyGoal : 20);

  // ---- Activity log (streak + daily goal) ----
  function loadActivity() { try { return JSON.parse(localStorage.getItem(LS_ACTIVITY)) || { days: {} }; } catch { return { days: {} }; } }
  let activity = loadActivity();
  const dateStr = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const todayStr = () => dateStr(new Date());
  function recordReview(n = 1) {
    queueSync();
    const t = todayStr();
    const before = activity.days[t] || 0;
    const after = before + n;
    activity.days[t] = after;
    const goal = dailyGoal();
    // Fire the celebration exactly once, the moment today's count crosses the goal.
    const crossed = before < goal && after >= goal && activity.celebrated !== t;
    if (crossed) activity.celebrated = t;
    localStorage.setItem(LS_ACTIVITY, JSON.stringify(activity));
    if (crossed) celebrateGoal();
  }
  // The streak now means what the user thinks it means: consecutive days the
  // DAILY GOAL was met, not just days with any activity. Today counts only once
  // its goal is reached; until then the streak shows the run through yesterday.
  const goalMetOn = key => (activity.days[key] || 0) >= dailyGoal();
  function computeStreak() {
    let d = new Date();
    if (!goalMetOn(dateStr(d))) d.setDate(d.getDate() - 1);
    let streak = 0;
    while (goalMetOn(dateStr(d))) { streak++; d.setDate(d.getDate() - 1); }
    return streak;
  }
  const todayCount = () => activity.days[todayStr()] || 0;
  const goalDone = () => todayCount() >= dailyGoal();

  // ---- Progress stats over all cards ----
  const MASTER_INTERVAL = 7;   // days; a word is "mastered" once spaced this far
  // Directions that count as PRODUCING the word (recalling/writing/saying it),
  // not merely recognising it. A word must be produced at least once to master.
  const PRODUCTION_DIRS = new Set(["recall", "write", "speak"]);
  const isMastered = s => !!(s && s.interval >= MASTER_INTERVAL && s.prod);
  function progressStats(cardList) {
    let mastered = 0, learning = 0, fresh = 0;
    for (const c of cardList) {
      const s = srs[c.id];
      if (!s) fresh++;
      else if (isMastered(s)) mastered++;
      else learning++;
    }
    return { mastered, learning, fresh, total: cardList.length };
  }

  // ---- Spaced repetition (SM-2 lite) ----
  function schedule(id, grade) {
    const s = srs[id] || { ease: 2.4, interval: 0, due: 0, reps: 0 };
    if (grade === "again") {
      s.reps = 0;
      s.interval = 0;
      s.ease = Math.max(1.6, s.ease - 0.2);
      s.lapses = (s.lapses || 0) + 1;   // how often you've missed it — powers "trouble words"
      s.due = NOW() + 60 * 1000; // ~1 min: comes back this session
    } else {
      const bump = grade === "easy" ? 0.15 : 0;
      s.ease = Math.min(3.0, s.ease + bump);
      if (s.reps === 0) s.interval = grade === "easy" ? 2 : 1;
      else if (s.reps === 1) s.interval = grade === "easy" ? 5 : 3;
      else s.interval = Math.round(s.interval * s.ease * (grade === "easy" ? 1.3 : 1));
      s.reps += 1;
      s.due = NOW() + s.interval * DAY;
    }
    srs[id] = s;
    saveSRS(srs);
  }

  function dueCountForLesson(lessonId) {
    return CARDS.filter(c => c.lessonId === lessonId).reduce((n, c) => {
      const s = srs[c.id];
      return n + (!s || s.due <= NOW() ? 1 : 0);
    }, 0);
  }

  // ---- Small helpers ----
  const $ = sel => document.querySelector(sel);
  const el = (tag, props = {}, kids = []) => {
    const n = document.createElement(tag);
    // `style` needs special handling: Object.assign(n, { style: "..." }) is a
    // silent no-op, because .style is a read-only CSSStyleDeclaration. Every
    // inline style passed to el() was being dropped.
    const { style, ...rest } = props;
    Object.assign(n, rest);
    if (style) n.style.cssText = style;
    (Array.isArray(kids) ? kids : [kids]).forEach(k =>
      n.appendChild(typeof k === "string" ? document.createTextNode(k) : k));
    return n;
  };
  // A line-icon element from the sprite (returns the <svg> node).
  const licon = (id, extra) => {
    const t = document.createElement("template");
    t.innerHTML = `<svg class="licon${extra ? " " + extra : ""}"><use href="#${id}"/></svg>`;
    return t.content.firstChild;
  };
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function sample(arr, n, exclude) {
    return shuffle(arr.filter(x => x !== exclude)).slice(0, n);
  }

  function show(sectionId) {
    ["path", "home", "progress", "study", "quiz", "browse", "done", "sheet", "converse", "pick", "flash", "match"].forEach(id =>
      $("#" + id).classList.toggle("hidden", id !== sectionId));
    // Reset the window scroll BEFORE the new view applies its body scroll-lock.
    // The done screen is normal flow, so scrolling down to "Back to path" scrolls
    // the BODY; the path then locks body overflow. On iOS a body that's scrolled
    // and THEN locked keeps its offset and can't be scrolled back — the whole UI
    // sits pushed up. So reset first (on every scrolling element) while the body
    // is still scrollable, then lock; the rAF pass repeats it once layout settles.
    const resetScroll = () => { window.scrollTo(0, 0); document.documentElement.scrollTop = 0; document.body.scrollTop = 0; };
    resetScroll();
    document.body.dataset.view = sectionId;   // lets CSS give sessions a fixed-height layout
    // Keep the bottom-nav highlight in sync with the view HERE (a stale one left
    // Path showing with Home lit after a session).
    document.querySelectorAll(".bottomnav button").forEach(x => x.classList.toggle("on", x.dataset.nav === sectionId));
    requestAnimationFrame(resetScroll);
  }

  // Gentle inline message instead of a browser alert().
  let toastTimer = null;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 2400);
  }

  // Full-screen moment when the daily goal is reached — the streak's payoff.
  function celebrateGoal() {
    const streak = computeStreak();
    const o = el("div", { className: "goal-burst" });
    o.innerHTML =
      `<div class="gb-card">
         <img src="images/panda-celebrate.png${ASSET_V}" alt="">
         <div class="gb-title">Daily goal reached!</div>
         <div class="gb-sub">🔥 ${streak} day${streak === 1 ? "" : "s"} in a row</div>
       </div>`;
    document.body.appendChild(o);
    const close = () => { o.classList.remove("show"); setTimeout(() => o.remove(), 350); };
    setTimeout(() => o.classList.add("show"), 20);
    setTimeout(close, 2800);
    o.addEventListener("click", close);
    sfx("goal");
  }

  // ---- Sound effects ----
  // Plays warm synthesized chime FILES (sounds/*.mp3) through WebAudio, which is
  // reliable on iOS and lets rapid answers overlap. Falls back to live-oscillator
  // tones for any file that hasn't loaded, so sound never silently disappears.
  let audioCtx = null;
  const soundOn = () => prefs.sound !== false;   // default on
  let masterGain = null, audioWarmed = false;
  function ensureAudio() {
    if (!soundOn()) return null;
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      audioCtx = new AC();
      masterGain = audioCtx.createGain();
      masterGain.gain.value = 0.7;        // one knob to tame overall loudness
      masterGain.connect(audioCtx.destination);
      // Keep the context AWAKE with a silent loop. iOS suspends an idle context
      // between sounds, and resume() is async — so every chime was waiting on it
      // (that's the "delayed" correct/wrong sound). A looping silent source stops
      // the auto-suspend, so sfx() finds the context running and plays instantly.
      try {
        const keep = audioCtx.createBufferSource();
        keep.buffer = audioCtx.createBuffer(1, audioCtx.sampleRate, audioCtx.sampleRate); // 1s of silence
        keep.loop = true; keep.connect(audioCtx.destination); keep.start();
      } catch (e) {}
    }
    if (audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
  }
  // Coming back from the background re-suspends the context; resume it as soon
  // as the app is visible again so the first tap's chime doesn't pay the wait.
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && audioCtx && audioCtx.state === "suspended") audioCtx.resume();
  });
  // On iOS the FIRST WebAudio output can jump in loud (ignoring the media volume)
  // until the audio route settles — so spend that first sound on 120ms of silence.
  function warmAudio() {
    if (audioWarmed) return;
    const ctx = ensureAudio(); if (!ctx || !masterGain) return;
    audioWarmed = true;
    try {
      const buf = ctx.createBuffer(1, Math.max(1, Math.ceil(ctx.sampleRate * 0.12)), ctx.sampleRate);
      const src = ctx.createBufferSource(); src.buffer = buf;
      src.connect(masterGain); src.start();
    } catch (e) {}
  }
  // Same story for the spoken voice: the first utterance on iOS activates the
  // audio session and can blast in loud. Fire one silent utterance on unlock so
  // the first word you actually hear plays at the settled volume.
  let speechWarmed = false;
  function warmSpeech() {
    if (speechWarmed || !("speechSynthesis" in window)) return;
    speechWarmed = true;
    try {
      const u = new SpeechSynthesisUtterance("​");   // zero-width space
      u.volume = 0; u.rate = 2;
      speechSynthesis.speak(u);
    } catch (e) {}
  }

  const SFX_KINDS = ["correct", "wrong", "complete", "goal"];
  const sfxBuffers = {};
  let sfxLoadStarted = false;
  function loadSfx() {
    const ctx = ensureAudio();
    if (!ctx || sfxLoadStarted) return;
    sfxLoadStarted = true;
    SFX_KINDS.forEach(kind => {
      fetch(`sounds/${kind}.mp3${ASSET_V}`)
        .then(r => (r.ok ? r.arrayBuffer() : Promise.reject()))
        .then(b => ctx.decodeAudioData(b))
        .then(buf => { sfxBuffers[kind] = buf; })
        .catch(() => {});   // missing/undecodable → keeps the synth fallback
    });
  }
  // iOS only unlocks WebAudio inside a user gesture — prime + preload + warm the
  // route on first tap, so the first real chime plays at a settled volume.
  ["pointerdown", "keydown"].forEach(ev =>
    window.addEventListener(ev, () => { if (soundOn()) { ensureAudio(); loadSfx(); warmAudio(); } warmSpeech(); }, { passive: true }));

  function tone(ctx, freq, start, dur, opts = {}) {
    const type = opts.type || "sine", gain = opts.gain == null ? 0.16 : opts.gain;
    const t0 = ctx.currentTime + start;
    const osc = ctx.createOscillator(), g = ctx.createGain();
    osc.type = type; osc.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g).connect(masterGain || ctx.destination);
    osc.start(t0); osc.stop(t0 + dur + 0.03);
  }
  function synthSfx(ctx, kind) {
    if (kind === "correct") { tone(ctx, 660, 0, 0.12); tone(ctx, 990, 0.09, 0.16); }
    else if (kind === "wrong") { tone(ctx, 200, 0, 0.22, { type: "sawtooth", gain: 0.11 }); tone(ctx, 160, 0.09, 0.26, { type: "sawtooth", gain: 0.09 }); }
    else if (kind === "complete") { [523, 659, 784, 1047].forEach((f, i) => tone(ctx, f, i * 0.09, 0.22)); }
    else if (kind === "goal") { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(ctx, f, i * 0.1, 0.3, { gain: 0.18 })); }
    else if (kind === "tap") { tone(ctx, 430, 0, 0.05, { gain: 0.07 }); }
  }
  let lastGoalAt = 0;
  function sfx(kind) {
    const ctx = ensureAudio();
    if (!ctx) return;
    // The daily-goal fanfare fires on the answer that crosses the goal. When that
    // answer is also a lesson's last card, the done screen's "complete" chime
    // would land on top of it — two fanfares at once. The goal fanfare already IS
    // the celebration, so let "complete" yield to it.
    if (kind === "goal") lastGoalAt = Date.now();
    else if (kind === "complete" && Date.now() - lastGoalAt < 1500) return;
    const play = () => {
      const buf = sfxBuffers[kind];
      if (buf) {
        const src = ctx.createBufferSource(), g = ctx.createGain();
        src.buffer = buf; g.gain.value = 0.85;
        src.connect(g).connect(masterGain || ctx.destination);
        try { src.start(); } catch (e) {}
      } else synthSfx(ctx, kind);
    };
    // iOS suspends the audio context after inactivity / backgrounding. resume() is
    // async, so starting a sound before it resolves plays SILENTLY — which is why
    // the correct/wrong chime only fired sometimes. Resume first, THEN play.
    if (ctx.state === "suspended") ctx.resume().then(play).catch(play);
    else play();
  }

  // ---- Text to speech ----
  let zhVoice = null, voicesSeen = false;
  const isZhVoice = v => {
    const s = ((v.lang || "") + " " + (v.name || "")).toLowerCase();
    return /(^|[^a-z])zh([^a-z]|$)|zh[-_]|cmn|chinese|mandarin|中文|普通话|國語|国语|台湾|táiwān/.test(s);
  };
  // Rank a Chinese voice for naturalness. Default system voices ("compact" on
  // iOS, "eSpeak" on Android) sound robotic; the Siri / Enhanced / Premium /
  // network voices sound close to human. Score so the best available one wins.
  function voiceQuality(v) {
    const s = ((v.name || "") + " " + (v.voiceURI || "")).toLowerCase();
    let q = 0;
    if (/^zh[-_]?cn/i.test(v.lang)) q += 3;             // Mainland Mandarin dialect
    else if (/^(zh|cmn)/i.test(v.lang)) q += 1;
    if (/siri/.test(s)) q += 10;                        // iOS Siri voices — best
    if (/(premium|enhanced|neural|natural|网络|wǎngluò)/.test(s)) q += 8;
    if (/google/.test(s)) q += 6;                       // Android/Chrome network voice
    if (v.localService === false) q += 2;               // network (usually higher quality)
    if (/(compact|espeak|微软|中英文)/.test(s)) q -= 2;   // known low-fi engines
    // named Chinese voices, roughly better than the bare compact default
    if (/(tingting|ting-ting|婷婷|meijia|美佳|sinji|語嫣|yu-shu|yushu|li-mu|panpan)/.test(s)) q += 4;
    return q;
  }
  function zhVoices() {
    const voices = speechSynthesis.getVoices();
    return voices.filter(v => /^(zh|cmn)/i.test(v.lang) || isZhVoice(v));
  }
  function pickVoice() {
    const voices = speechSynthesis.getVoices();
    if (!voices.length) return;              // not loaded yet — try again later
    voicesSeen = true;
    const zh = zhVoices();
    if (!zh.length) { zhVoice = null; return; }
    // An explicit choice from Settings wins, if it's still installed.
    if (prefs.voiceURI) {
      const chosen = zh.find(v => v.voiceURI === prefs.voiceURI);
      if (chosen) { zhVoice = chosen; return; }
    }
    zh.sort((a, b) => voiceQuality(b) - voiceQuality(a));   // else the best available
    zhVoice = zh[0];
  }
  if ("speechSynthesis" in window) {
    pickVoice();
    speechSynthesis.onvoiceschanged = pickVoice;
    // Some engines (notably iOS Safari) populate voices late and may never fire
    // voiceschanged — poll a few times so we don't miss the Chinese voice.
    [150, 500, 1200, 2500].forEach(t => setTimeout(pickVoice, t));
  }
  function warnNoVoiceOnce() {
    try {
      if (localStorage.getItem("zhBeginnerA.noVoice.v1")) return;
      localStorage.setItem("zhBeginnerA.noVoice.v1", "1");
    } catch (e) {}
    toast("No Chinese voice on this device, so audio is silent. Add one in your system's spoken-content / voice settings.");
  }
  // The best iOS voices must be downloaded by the user — suggest it once, the
  // first time we're stuck on a low-quality (robotic) voice.
  function suggestBetterVoiceOnce() {
    try {
      if (localStorage.getItem("zhBeginnerA.voiceTip.v1")) return;
      if (!zhVoice || voiceQuality(zhVoice) >= 8) return;   // already on a good one
      localStorage.setItem("zhBeginnerA.voiceTip.v1", "1");
    } catch (e) { return; }
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
    toast(ios
      ? "Tip: for a far more natural voice, go to Settings → Accessibility → Spoken Content → Voices → Chinese and download an “Enhanced” voice."
      : "Tip: install a higher-quality Chinese text-to-speech voice in your system settings for a more natural voice.");
  }
  function speak(text, opts = {}) {
    if (!("speechSynthesis" in window)) return;
    if (!zhVoice) pickVoice();               // re-resolve at play time — voices may have loaded since boot
    const ss = speechSynthesis;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "zh-CN";
    if (zhVoice) u.voice = zhVoice;
    u.rate = opts.rate != null ? opts.rate : audioRate();
    u.pitch = opts.pitch != null ? opts.pitch : 1;
    if (opts.onEnd) u.onend = opts.onEnd;
    try { ss.resume(); } catch (e) {}        // iOS can leave the synth paused/stuck — unstick it
    ss.cancel();                             // stop anything mid-utterance
    // iOS/Safari drops an utterance queued in the SAME tick as cancel(); deferring
    // one tick (and resuming again) makes playback reliable, incl. the listen card.
    setTimeout(() => { try { ss.resume(); ss.speak(u); } catch (e) {} }, 0);
    // If the voice list hasn't populated yet (common on a cold iOS launch), the
    // utterance can fall silent — re-fire once the voices arrive.
    if (!voicesSeen && !speakRetried) {
      speakRetried = true;
      setTimeout(() => { pickVoice(); if (voicesSeen) speak(text, opts); }, 500);
    }
    // Voices have loaded but none are Chinese → tell the user once why it's silent.
    if (voicesSeen && !zhVoice) warnNoVoiceOnce();
    else if (zhVoice) suggestBetterVoiceOnce();
  }
  let speakRetried = false;
  function speakerBtn(text) {
    const b = el("button", { className: "speaker", title: "Play audio", type: "button" });
    b.innerHTML = `<svg class="licon licon-sm"><use href="#i-volume"/></svg>`;
    b.addEventListener("click", e => { e.stopPropagation(); speak(text); });
    return b;
  }
  // Slow (🐢) playback for careful listening.
  function slowSpeakerBtn(text) {
    const b = el("button", { className: "speaker speaker-slow", title: "Play slowly", type: "button" });
    b.innerHTML = `<svg class="licon licon-sm"><use href="#i-volume"/></svg><span class="spd">½×</span>`;
    b.addEventListener("click", e => { e.stopPropagation(); speak(text, { rate: 0.5 }); });
    return b;
  }

  // ---- Speech recognition (you speak → it checks) ----
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const canRecognize = () => !!SR;
  // onInterim(alts)  – live partial guesses while you're still speaking
  // acceptEarly(alts) – return true to settle NOW without waiting for the engine
  //                     to time out on silence (the main source of the lag)
  function recognizeOnce({ onStart, onResult, onInterim, onError, onEnd, acceptEarly }) {
    if (!SR) { onError && onError("unsupported"); onEnd && onEnd(); return null; }
    const rec = new SR();
    rec.lang = "zh-CN";
    rec.interimResults = true;   // stream partial results — the exercise feels live, not frozen
    rec.maxAlternatives = 8;     // more candidates = more chances the right one is in there
    let delivered = false, ended = false, watchdog = null;
    // onEnd must fire EXACTLY once, no matter how recognition terminates — a normal
    // end, an error, a failed start, or the engine simply hanging. Callers re-enable
    // the mic button in onEnd, so if it never fired the button stuck on "Listening…".
    const done = () => { if (ended) return; ended = true; if (watchdog) clearTimeout(watchdog); onEnd && onEnd(); };
    const altsOf = r => { const a = []; for (let i = 0; i < r.length; i++) a.push(r[i].transcript); return a; };
    const deliver = alts => { if (delivered) return; delivered = true; onResult && onResult(alts); try { rec.stop(); } catch {} };
    rec.onstart = () => onStart && onStart();
    rec.onresult = e => {
      const r = e.results[e.results.length - 1];
      const alts = altsOf(r);
      if (r.isFinal) return deliver(alts);
      onInterim && onInterim(alts);
      if (acceptEarly && acceptEarly(alts)) deliver(alts);   // heard it — don't make them wait
    };
    rec.onerror = e => { onError && onError(e.error || "error"); done(); };
    rec.onend = () => done();
    try { rec.start(); } catch (e) { onError && onError("start-failed"); done(); return null; }
    // Watchdog: some engines (mobile Safari especially) can stall with neither a
    // result nor an end event — force a reset so you can just tap and try again.
    watchdog = setTimeout(() => { try { rec.abort(); } catch (e) {} done(); }, 12000);
    return rec;
  }
  const cleanHan = s => (s || "").replace(/[，。！？、,.!?\s·…"'“”]/g, "");
  // For acceptEarly: has a live partial ALREADY contained the whole target? Only
  // then have you actually finished the line — a prefix ("你好…" of "你好吗") must
  // NOT settle, or the mic cuts you off mid-sentence. (scoreSpeech scores a prefix
  // at .95 via exp.includes(t), which is what made early-accept too eager.)
  function saidWhole(expectedHanzi, alts) {
    const exp = cleanHan(expectedHanzi);
    if (!exp) return false;
    return alts.some(a => { const t = cleanHan(a); return t && t.includes(exp); });
  }
  // `keyword` is the word actually being practised. The recogniser often mangles
  // part of a phrase while still nailing the target word — hearing the keyword
  // back is a pass even if the rest of the transcript drifts.
  function scoreSpeech(expectedHanzi, alts, keyword) {
    const exp = cleanHan(expectedHanzi);
    let best = { level: "no", heard: alts[0] || "", ratio: 0 };
    for (const a of alts) {
      const t = cleanHan(a); if (!t) continue;
      if (t === exp) return { level: "exact", heard: a, ratio: 1 };
      if (t.includes(exp) || exp.includes(t)) { best = { level: "close", heard: a, ratio: .95 }; continue; }
      const set = new Set(t.split(""));
      const hit = [...exp].filter(c => set.has(c)).length / (exp.length || 1);
      if (hit > best.ratio) best = { level: hit >= 0.7 ? "close" : "no", heard: a, ratio: hit };
    }
    if (best.level !== "exact" && keyword) {
      const k = cleanHan(keyword);
      for (const a of alts) if (k && cleanHan(a).includes(k)) return { level: "close", heard: a, ratio: .9 };
    }
    return best;
  }
  // A "🎤 Say it & check" control (used on the pinyin flashcard).
  function pronunciationControl(hanzi) {
    const wrap = el("div", { className: "hint-wrap" });
    if (!canRecognize()) return wrap;    // gracefully absent where unsupported
    const micLabel = `<svg class="licon licon-sm"><use href="#i-mic"/></svg> Say it &amp; check`;
    const btn = el("button", { className: "hint-btn mic-btn", type: "button" });
    btn.innerHTML = micLabel;
    const fb = el("div", { className: "conv-feedback", style: "font-size:.85rem" });
    btn.addEventListener("click", e => {
      e.stopPropagation();
      fb.textContent = ""; btn.disabled = true; btn.textContent = "● Listening…"; btn.classList.add("listening");
      recognizeOnce({
        onResult: alts => {
          const r = scoreSpeech(hanzi, alts);
          fb.innerHTML = r.level === "exact" ? `<span class="ok">✓ Perfect!</span>`
            : r.level === "close" ? `<span class="ok">✓ Close</span> — heard “${r.heard}”`
            : `<span class="bad">Try again</span> — heard “${r.heard || "…"}”`;
        },
        onError: err => { fb.textContent = err === "not-allowed" ? "Allow mic access to use this." : "Didn't catch that — try again."; },
        onEnd: () => { btn.disabled = false; btn.innerHTML = micLabel; btn.classList.remove("listening"); }
      });
    });
    wrap.append(btn, fb);
    return wrap;
  }

  // Training wheels: show pinyin under characters by default (a beginner can't
  // read bare 汉字). Turn it off in Settings for a tougher, pinyin-free test.
  const showPinyin = () => prefs.showPinyin !== false;

  // A pinyin aid. With "Show pinyin" on it's just visible; off, it hides behind
  // a "Show pinyin 👀" button you tap to reveal.
  function pinyinHint(pinyin) {
    pinyin = prettyPinyin(pinyin);
    const wrap = el("div", { className: "hint-wrap" });
    if (showPinyin()) {
      wrap.appendChild(el("span", { className: "pinyin hint-text" }, pinyin));
      return wrap;
    }
    const btn = el("button", { className: "hint-btn", type: "button" });
    btn.innerHTML = `Show pinyin <svg class="licon licon-sm"><use href="#i-eye"/></svg>`;
    const txt = el("span", { className: "pinyin hint-text hidden" }, pinyin);
    btn.addEventListener("click", e => {
      e.stopPropagation();
      txt.classList.remove("hidden");
      btn.classList.add("hidden");
    });
    wrap.append(btn, txt);
    return wrap;
  }

  // A row of optional study aids: hear it (🔊) and/or reveal pinyin.
  function aidsRow(c, { speaker = false, pinyin = false } = {}) {
    const row = el("div", { className: "aids-row" });
    if (speaker) row.appendChild(speakerBtn(c.hanzi));
    if (pinyin) row.appendChild(pinyinHint(c.pinyin));
    return row;
  }

  // ---- Hanzi Writer (stroke order + writing) ----
  const HANZI = window.HANZI_DATA || {};
  const HW_OK = typeof window.HanziWriter !== "undefined";
  const cjkOnly = s => [...s].filter(c => /[一-鿿]/.test(c));
  const hasStrokes = ch => !!HANZI[ch];
  const wordWritable = hanzi => { const c = cjkOnly(hanzi); return c.length > 0 && c.every(hasStrokes); };

  function makeWriter(target, char, opts = {}) {
    return HanziWriter.create(target, char, Object.assign({
      width: 160, height: 160, padding: 6,
      showOutline: true,
      strokeAnimationSpeed: 1.2,
      delayBetweenStrokes: 180,
      strokeColor: getComputedStyle(document.body).getPropertyValue("--ink").trim() || "#2b2620",
      radicalColor: getComputedStyle(document.body).getPropertyValue("--accent").trim() || "#2b776d",
      drawingColor: getComputedStyle(document.body).getPropertyValue("--accent").trim() || "#2b776d",
      charDataLoader: (c, onComplete) => onComplete(HANZI[c])
    }, opts));
  }

  // Character modal: browse each character's strokes and practise writing.
  let modalWriters = [];
  let modalWord = null;
  const enForHanzi = hanzi => (CARDS.find(c => c.hanzi === hanzi) || {}).en || "";
  function openCharModal(hanzi, pinyin) {
    const chars = cjkOnly(hanzi);
    modalWord = { hanzi, pinyin: pinyin || "", en: enForHanzi(hanzi) };
    $("#charModalTitle").textContent = `${hanzi}${pinyin ? "  ·  " + pinyin : ""}`;
    const grid = $("#charTargets");
    grid.innerHTML = "";
    modalWriters = [];
    $("#charHint").textContent = "";

    if (!HW_OK || chars.length === 0) {
      grid.appendChild(el("div", { className: "hanzi" }, hanzi));
      $("#charAnimate").classList.add("hidden");
      $("#charPractice").classList.add("hidden");
    } else {
      $("#charAnimate").classList.remove("hidden");
      $("#charPractice").classList.remove("hidden");
      const accent = getComputedStyle(document.body).getPropertyValue("--accent").trim() || "#2b776d";
      chars.forEach(ch => {
        const box = el("div", { className: "hz-box" });
        const lbl = el("div", { className: "lbl" });
        grid.appendChild(el("div", { className: "hz-cell" }, [box, lbl]));
        if (hasStrokes(ch)) {
          // Red strokes + a thicker pen so your writing is clearly visible.
          const w = makeWriter(box, ch, {
            strokeColor: accent, radicalColor: accent, drawingColor: accent,
            drawingWidth: Math.round(7 * 1024 / 160)
          });
          modalWriters.push({ w, box, lbl, ch });
        } else {
          box.appendChild(el("div", { className: "hanzi", style: "font-size:5rem;line-height:160px" }, ch));
          lbl.textContent = "no stroke data";
        }
      });
    }
    $("#charModal").classList.remove("hidden");
  }
  function closeCharModal() {
    $("#charModal").classList.add("hidden");
    $("#charTargets").innerHTML = "";
    modalWriters = [];
  }
  async function animateAll(writers) {
    for (const { w } of writers) {
      await new Promise(res => w.animateCharacter({ onComplete: res }));
      await new Promise(res => setTimeout(res, 150));
    }
  }
  function practiceAll(writers, hintEl) {
    let i = 0;
    const runOne = () => {
      if (i >= writers.length) { if (hintEl) hintEl.textContent = "Done! ✔ Well written."; return; }
      const { w, lbl } = writers[i];
      if (lbl) lbl.textContent = "your turn…";
      if (hintEl) hintEl.textContent = `Draw character ${i + 1} of ${writers.length}. A hint appears after a couple of misses.`;
      w.quiz({
        leniency: 1.4,
        showHintAfterMisses: 2,
        onComplete: () => { if (lbl) lbl.textContent = "✓"; i++; runOne(); }
      });
    };
    writers.forEach(({ w }) => w.hideCharacter());
    runOne();
  }
  // Small "strokes/write" button used in lists and cards.
  function strokeBtn(hanzi, pinyin) {
    const b = el("button", { className: "speaker", title: "Stroke order & writing", type: "button" });
    b.innerHTML = `<svg class="licon licon-sm"><use href="#i-pencil"/></svg>`;
    b.addEventListener("click", e => { e.stopPropagation(); openCharModal(hanzi, pinyin); });
    return b;
  }

  $("#charClose").addEventListener("click", closeCharModal);
  $("#charModal").addEventListener("click", e => { if (e.target.id === "charModal") closeCharModal(); });
  $("#charAnimate").addEventListener("click", () => animateAll(modalWriters));
  $("#charPractice").addEventListener("click", () => practiceAll(modalWriters, $("#charHint")));
  $("#charSheet").addEventListener("click", () => {
    const info = modalWord;
    closeCharModal();
    openWritingSheet(info.hanzi, info.pinyin, info.en);
  });

  /* ==================================================================== */
  /*  WRITING SHEET (字帖 copybook)                                        */
  /* ==================================================================== */

  const SVGNS = "http://www.w3.org/2000/svg";
  // Draw a character statically from its stroke paths, using Hanzi Writer's
  // coordinate transform (1024 grid, y-flipped).
  function charOutlineSVG(ch, size, color, opts = {}) {
    const data = HANZI[ch];
    const svg = document.createElementNS(SVGNS, "svg");
    svg.setAttribute("width", size);
    svg.setAttribute("height", size);
    svg.setAttribute("viewBox", `0 0 ${size} ${size}`);
    if (!data) return svg;
    const pad = size * 0.06;
    const s = (size - 2 * pad) / 1024;
    const g = document.createElementNS(SVGNS, "g");
    g.setAttribute("transform", `translate(${pad}, ${size - pad}) scale(${s}, ${-s})`);
    if (opts.opacity != null) g.setAttribute("opacity", opts.opacity);
    const strokes = opts.maxStrokes != null ? data.strokes.slice(0, opts.maxStrokes) : data.strokes;
    strokes.forEach(d => {
      const p = document.createElementNS(SVGNS, "path");
      p.setAttribute("d", d);
      p.setAttribute("fill", color);
      g.appendChild(p);
    });
    svg.appendChild(g);
    return svg;
  }

  // Copybook fade schedule: earlier rows show more strokes at higher opacity;
  // the last row is blank (write from memory).
  function copybookRowStyle(rowIdx, rows, totalStrokes) {
    const t = rows > 1 ? rowIdx / (rows - 1) : 0;      // 0 (first) .. 1 (last)
    return {
      opacity: +(0.7 - 0.7 * t).toFixed(3),
      maxStrokes: Math.round(totalStrokes * (1 - t))
    };
  }

  // A transparent canvas laid over a grid so you can trace with mouse/finger.
  function attachInkCanvas(gridEl, cell) {
    const w = gridEl.clientWidth, h = gridEl.clientHeight;
    const dpr = window.devicePixelRatio || 1;
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, w * dpr);
    canvas.height = Math.max(1, h * dpr);
    canvas.style.position = "absolute";
    canvas.style.left = "0"; canvas.style.top = "0";
    canvas.style.width = w + "px"; canvas.style.height = h + "px";
    canvas.style.touchAction = "none";
    canvas.style.cursor = "crosshair";
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    const color = getComputedStyle(document.body).getPropertyValue("--accent").trim() || "#2b776d";
    const lw = Math.max(3, cell * 0.06);   // ~25% thinner than before
    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = lw;

    const strokes = [];       // history of finished strokes (each an array of points)
    let cur = null;
    const at = e => { const r = canvas.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    function drawStroke(pts) {
      if (pts.length === 1) { ctx.beginPath(); ctx.arc(pts[0][0], pts[0][1], lw / 2, 0, 7); ctx.fill(); return; }
      ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length - 1; i++) {
        const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2;
        ctx.quadraticCurveTo(pts[i][0], pts[i][1], mx, my);   // smoothed curve
      }
      ctx.lineTo(pts[pts.length - 1][0], pts[pts.length - 1][1]);
      ctx.stroke();
    }
    function redraw() { ctx.clearRect(0, 0, w, h); strokes.forEach(drawStroke); }
    canvas.addEventListener("pointerdown", e => { cur = [at(e)]; strokes.push(cur); canvas.setPointerCapture(e.pointerId); });
    canvas.addEventListener("pointermove", e => { if (!cur) return; cur.push(at(e)); redraw(); });
    const end = () => { cur = null; };
    canvas.addEventListener("pointerup", end);
    canvas.addEventListener("pointercancel", end);
    gridEl.appendChild(canvas);
    return {
      clear: () => { strokes.length = 0; redraw(); },
      undo: () => { strokes.pop(); redraw(); }
    };
  }

  // Build a 6-row fading copybook (workbook style) into `host`, with a single
  // tracing canvas over it. Returns the ink handle ({ clear }).
  function buildCopybook(host, chars, { rows = 6, cols, cell, tight = false }) {
    const ink = getComputedStyle(document.body).getPropertyValue("--ink").trim() || "#2b2620";
    const nCols = cols || (chars.length === 1 ? 6 : chars.length);
    const grid = el("div", { className: "copybook" + (tight ? " tight" : "") });
    host.appendChild(grid);
    for (let r = 0; r < rows; r++) {
      const row = el("div", { className: "writing-inline", style: tight ? "gap:0" : "gap:6px" });
      grid.appendChild(row);
      for (let col = 0; col < nCols; col++) {
        const ch = chars.length === 1 ? chars[0] : chars[col % chars.length];
        const box = el("div", { className: "tzg-cell" });
        box.style.width = box.style.height = cell + "px";
        row.appendChild(box);
        if (hasStrokes(ch)) {
          const st = copybookRowStyle(r, rows, HANZI[ch].strokes.length);
          if (st.maxStrokes > 0) {
            const svg = charOutlineSVG(ch, cell, ink, { maxStrokes: st.maxStrokes, opacity: st.opacity });
            svg.style.position = "absolute";
            svg.style.inset = "0";
            box.appendChild(svg);
          }
        } else {
          box.appendChild(el("div", { className: "hanzi", style: `font-size:2rem;line-height:${cell}px` }, ch));
        }
      }
    }
    return attachInkCanvas(grid, cell);
  }

  // Validated version: each box is a Hanzi Writer quiz — wrong strokes don't
  // register and a hint flashes after 2 misses. Top row shows a faint outline
  // to trace; lower rows are from memory.
  function buildCheckGrid(host, chars, { rows, cols, cell, tight = false, onAllDone = null }) {
    const accent = getComputedStyle(document.body).getPropertyValue("--accent").trim() || "#2b776d";
    // drawingWidth is in the 1024-unit glyph space, so scale it up for small
    // cells to keep the pen ~7px on screen regardless of box size.
    const pen = Math.round(7 * 1024 / cell);
    const grid = el("div", { className: "copybook" + (tight ? " tight" : "") });
    host.appendChild(grid);
    // Gate: every distinct character must be written correctly at least once
    // (extra boxes are optional practice). Fires onAllDone when that's satisfied.
    const need = new Set(chars.filter(c => hasStrokes(c)));
    const written = new Set();
    const markWritten = ch => {
      written.add(ch);
      if (onAllDone && written.size >= need.size) onAllDone();
    };
    if (onAllDone && need.size === 0) onAllDone();   // no stroke data — nothing to gate on
    for (let r = 0; r < rows; r++) {
      const row = el("div", { className: "writing-inline", style: tight ? "gap:0" : "gap:6px" });
      grid.appendChild(row);
      for (let col = 0; col < cols; col++) {
        const ch = chars.length === 1 ? chars[0] : chars[col % chars.length];
        const box = el("div", { className: "tzg-cell" });
        box.style.width = box.style.height = cell + "px";
        row.appendChild(box);
        if (!hasStrokes(ch)) { box.appendChild(el("div", { className: "hanzi", style: `line-height:${cell}px` }, ch)); continue; }
        const w = makeWriter(box, ch, {
          width: cell, height: cell, showOutline: r === 0, showCharacter: false,
          drawingWidth: pen, drawingColor: accent,
          // Completed strokes in red (like the pen) so it's obvious they registered.
          strokeColor: accent, radicalColor: accent
        });
        w.quiz({ leniency: 1.4, showHintAfterMisses: 2, onComplete: () => markWritten(ch) });
      }
    }
  }

  // Other vocabulary words that contain this character (like 组词 examples).
  function exampleWords(ch, excludeHanzi) {
    const seen = new Set();
    const out = [];
    for (const c of CARDS) {
      if (c.hanzi === excludeHanzi) continue;
      if (c.hanzi.length > 1 && c.hanzi.includes(ch) && !seen.has(c.hanzi)) {
        seen.add(c.hanzi);
        out.push(c);
        if (out.length >= 4) break;
      }
    }
    return out;
  }

  let sheetChars = [], sheetIdx = 0, sheetWord = null, sheetInk = null;

  function openWritingSheet(hanzi, pinyin, en) {
    sheetWord = { hanzi, pinyin, en };
    sheetChars = cjkOnly(hanzi).filter(hasStrokes);
    sheetIdx = 0;
    if (sheetChars.length === 0) { toast("No stroke data for this word yet."); return; }
    $("#sheetTitle").textContent = `Writing sheet · ${hanzi}`;
    // Character tabs (only when the word has more than one character)
    const tabs = $("#sheetTabs");
    tabs.innerHTML = "";
    if (sheetChars.length > 1) {
      sheetChars.forEach((ch, i) => {
        const t = el("button", { className: "sheet-tab" + (i === 0 ? " on" : "") }, ch);
        t.addEventListener("click", () => { sheetIdx = i; renderSheetChar(); });
        tabs.appendChild(t);
      });
    }
    show("sheet");
    renderSheetChar();
  }

  function renderSheetChar() {
    const ch = sheetChars[sheetIdx];
    [...$("#sheetTabs").children].forEach((t, i) => t.classList.toggle("on", i === sheetIdx));

    // Header: big character, pinyin, meaning, stroke count, example words.
    const strokes = (HANZI[ch] && HANZI[ch].strokes.length) || "?";
    const examples = exampleWords(ch, sheetWord.hanzi);
    const header = $("#sheetHeader");
    header.innerHTML = "";
    // Big animated character (tap to watch the strokes).
    const big = el("div", { className: "big-char" });
    big.style.cssText = "cursor:pointer;width:96px;height:96px;";
    header.appendChild(big);
    const bigW = makeWriter(big, ch, { width: 96, height: 96, showCharacter: true });
    big.addEventListener("click", () => bigW.animateCharacter());
    const meta = el("div", { className: "meta" }, [
      el("div", { className: "py" }, prettyPinyin(sheetWord.pinyin)),
      el("div", { className: "en" }, sheetWord.en),
      el("div", { className: "facts" }, `笔画 (strokes): ${strokes}`)
    ]);
    if (examples.length)
      meta.appendChild(el("div", { className: "facts" },
        "组词: " + examples.map(e => `${e.hanzi} (${prettyPinyin(e.pinyin)})`).join("，")));
    header.appendChild(meta);

    // Validated 田字格 grid: draw each box and correct strokes fill in red.
    // First row shows a faint outline to trace; the rest are from memory.
    const grid = $("#sheetGrid");
    grid.innerHTML = "";
    sheetInk = null;
    const avail = (grid.clientWidth || 340) - 4;   // fit the card width on any screen
    const cell = Math.max(64, Math.min(110, Math.floor(avail / 4)));
    buildCheckGrid(grid, [ch], { rows: 4, cols: 4, cell, tight: true });
  }

  // Printable copybook: rows of 田字格, fading from full outline to blank.
  function printSheet() {
    const ch = sheetChars[sheetIdx];
    const area = $("#printArea");
    area.innerHTML = "";
    const strokes = (HANZI[ch] && HANZI[ch].strokes.length) || "?";
    area.appendChild(el("h1", { className: "print-title" },
      `${ch}   ${prettyPinyin(sheetWord.pinyin)}`));
    area.appendChild(el("div", { className: "print-sub" },
      `${sheetWord.en}   ·   笔画 (strokes): ${strokes}`));

    const COLS = 9, ROWS = 6;
    const MM = 68; // px used for the SVG raster inside each 18mm cell (crisp enough)
    const total = (HANZI[ch] && HANZI[ch].strokes.length) || 0;
    for (let r = 0; r < ROWS; r++) {
      const st = copybookRowStyle(r, ROWS, total);   // fades + fewer strokes each row
      const row = el("div", { className: "print-row" });
      for (let c = 0; c < COLS; c++) {
        const cell = el("div", { className: "print-cell" });
        if (st.maxStrokes > 0) {
          const shade = r === 0 ? "#e2001a" : "#222";  // first row pink, rest grey
          const svg = charOutlineSVG(ch, MM, shade,
            { maxStrokes: st.maxStrokes, opacity: r === 0 ? 0.6 : Math.max(0.2, st.opacity + 0.1) });
          svg.setAttribute("width", "100%");
          svg.setAttribute("height", "100%");
          cell.appendChild(svg);
        }
        row.appendChild(cell);
      }
      area.appendChild(row);
    }

    area.classList.remove("hidden");
    window.print();
  }

  $("#sheetBack").addEventListener("click", () => { show("path"); renderPath(); });
  $("#sheetReset").addEventListener("click", renderSheetChar);
  $("#sheetPrint").addEventListener("click", printSheet);

  /* ==================================================================== */
  /*  CONVERSE (roleplay + speaking)                                      */
  /* ==================================================================== */

  const DIALOGUES = window.DIALOGUES || [];
  let convDlg = null, convTurn = 0;

  function openConverse() {
    show("converse");
    $("#convTitle").textContent = "Converse";
    $("#convBubbles").innerHTML = "";
    $("#convControls").innerHTML = "";
    // Dialogue picker. The label lives OUTSIDE the horizontal-scroll row — inside
    // it, the edge-fade mask clipped "…to roleplay:".
    const picker = $("#convPicker");
    picker.innerHTML = "";
    DIALOGUES.forEach(d => {
      const b = el("button", { className: "chip" }, `${d.title}  ·  ${d.lesson}`);
      b.addEventListener("click", () => startConversation(d));
      picker.appendChild(b);
    });
    if (!canRecognize())
      $("#convControls").appendChild(el("div", { className: "muted", style: "font-size:.8rem" },
        "Tip: the speaking-check needs Chrome or Edge. You can still roleplay by tapping “I said it”."));
  }

  function startConversation(d) {
    convDlg = d; convTurn = 0;
    const picker = $("#convPicker");
    let onChip = null;
    [...picker.querySelectorAll(".chip")].forEach(c => {
      const on = c.textContent.startsWith(d.title);
      c.classList.toggle("on", on); if (on) onChip = c;
    });
    // bring the chosen chip fully into view (never half-clipped at an edge)
    if (onChip) picker.scrollTo({ left: Math.max(0, onChip.offsetLeft - 16), behavior: "smooth" });
    $("#convTitle").textContent = `Converse · ${d.title}`;
    $("#convBubbles").innerHTML = "";
    stepConversation();
  }

  function addBubble(turn) {
    const b = el("div", { className: "bubble " + turn.who }, [
      el("div", { className: "b-han" }, turn.hanzi),
      el("div", { className: "b-py" }, prettyPinyin(turn.pinyin)),
      el("div", { className: "b-en" }, turn.en)
    ]);
    const acts = el("div", { className: "b-acts" }, [speakerBtn(turn.hanzi), slowSpeakerBtn(turn.hanzi)]);
    b.appendChild(acts);
    const box = $("#convBubbles");
    box.appendChild(b);
    box.scrollTop = box.scrollHeight;
    return b;
  }

  function stepConversation() {
    const ctrl = $("#convControls");
    ctrl.innerHTML = "";
    if (!convDlg || convTurn >= convDlg.turns.length) {
      ctrl.appendChild(el("div", { className: "muted", style: "text-align:center" }, "🎉 End of conversation."));
      const again = el("button", { className: "primary" }, "↻ Start over");
      again.addEventListener("click", () => startConversation(convDlg));
      ctrl.appendChild(again);
      return;
    }
    const turn = convDlg.turns[convTurn];
    if (turn.who === "app") {
      addBubble(turn);
      speak(turn.hanzi);
      convTurn++;
      setTimeout(stepConversation, 1100);   // let the line be heard, then continue
    } else {
      renderYourTurn(turn);
    }
  }

  function renderYourTurn(turn) {
    const ctrl = $("#convControls");
    ctrl.innerHTML = "";
    const goal = el("div", { className: "your-goal" }, [
      el("div", { className: "muted", style: "font-size:.78rem;letter-spacing:1px" }, "YOUR TURN — SAY:"),
      el("div", { className: "b-py", style: "font-size:1.25rem" }, prettyPinyin(turn.pinyin)),
      el("div", { className: "b-en" }, turn.en)
    ]);
    const chars = el("div", { className: "b-han hidden", style: "font-size:1.6rem;margin-top:4px" }, turn.hanzi);
    goal.appendChild(chars);
    ctrl.appendChild(goal);

    const feedback = el("div", { className: "conv-feedback" });
    const advance = () => { addBubble(turn); convTurn++; stepConversation(); };

    const btns = el("div", { className: "conv-btns" });
    const hear = el("button", { className: "ghost" });
    hear.innerHTML = `<svg class="licon licon-sm"><use href="#i-volume"/></svg> Hear it`;
    hear.addEventListener("click", () => speak(turn.hanzi));
    const showCh = el("button", { className: "ghost" }, "Show characters");
    showCh.addEventListener("click", () => chars.classList.remove("hidden"));
    btns.appendChild(hear);
    btns.appendChild(showCh);

    if (canRecognize() && !turn.free) {
      const micLbl = `<svg class="licon licon-sm"><use href="#i-mic"/></svg> Speak`;
      const mic = el("button", { className: "primary mic-btn" });
      mic.innerHTML = micLbl;
      mic.addEventListener("click", () => {
        feedback.textContent = "";
        mic.disabled = true; mic.textContent = "● Listening…"; mic.classList.add("listening");
        recognizeOnce({
          // Show what it's hearing live, and settle the instant the line lands —
          // otherwise it waits for the engine to time out on silence, which is
          // the delay you feel after you've finished speaking.
          onInterim: alts => { if (alts[0]) feedback.innerHTML = `<span class="muted">heard: ${alts[0]}…</span>`; },
          // settle only once you've said the WHOLE line — never mid-sentence
          acceptEarly: alts => saidWhole(turn.hanzi, alts),
          onResult: alts => {
            const r = scoreSpeech(turn.hanzi, alts);
            if (r.level === "exact" || r.level === "close") {
              feedback.innerHTML = `<span class="ok">✓ ${r.level === "exact" ? "Perfect" : "Close enough"}</span> — heard “${r.heard}”`;
              setTimeout(advance, 900);
            } else {
              feedback.innerHTML = `<span class="bad">Not quite</span> — heard “${r.heard || "…"}”. Try again, or tap “I said it”.`;
            }
          },
          onError: err => { feedback.textContent = err === "not-allowed"
            ? "Microphone blocked — allow mic access, or tap “I said it”." : "Didn't catch that — try again."; },
          onEnd: () => { mic.disabled = false; mic.innerHTML = micLbl; mic.classList.remove("listening"); }
        });
      });
      btns.appendChild(mic);
    }
    const said = el("button", { className: canRecognize() && !turn.free ? "ghost" : "primary" },
      turn.free ? "I said it →" : "Skip / I said it →");
    said.addEventListener("click", advance);
    btns.appendChild(said);

    ctrl.appendChild(btns);
    ctrl.appendChild(feedback);
  }

  $("#convBack").addEventListener("click", () => { speechSynthesis.cancel(); show("path"); renderPath(); });

  /* ==================================================================== */
  /*  HOME                                                                */
  /* ==================================================================== */

  const selectedLessons = new Set(prefs.lessons && prefs.lessons.length ? prefs.lessons : LESSONS.map(l => l.id));
  const selectedFocuses = new Set(prefs.focuses && prefs.focuses.length ? prefs.focuses : FOCUSES.map(f => f.key));

  function persistPrefs() {
    prefs.lessons = [...selectedLessons];
    prefs.focuses = [...selectedFocuses];
    savePrefs(prefs);
  }

  function lessonMastered(lessonId) {
    return CARDS.reduce((n, c) => n + (c.lessonId === lessonId && isMastered(srs[c.id]) ? 1 : 0), 0);
  }

  // Progress screen: per-chapter mastery bars, to fill the page with something useful.
  function renderProgressBreakdown() {
    const box = $("#progBreak");
    if (!box) return;
    box.innerHTML = "";
    let curUnit = null;
    CHAPTERS.forEach(ch => {
      if (ch.unit !== curUnit) {
        curUnit = ch.unit;
        box.appendChild(el("div", { className: "pb-unit" }, `Unit ${ch.unit}`));
      }
      let total = 0, mastered = 0;
      ch.lessons.forEach(id => { total += lessonCardCount(id); mastered += lessonMastered(id); });
      const pct = total ? Math.round(mastered / total * 100) : 0;
      const row = el("div", { className: "pb-row" + (total && mastered === total ? " done" : "") }, [
        el("div", { className: "pb-name" }, ch.title),
        el("div", { className: "pb-count" }, `${mastered} / ${total}`),
        el("div", { className: "pb-bar" }, el("i", { style: `width:${pct}%` }))
      ]);
      box.appendChild(row);
    });
  }

  function renderDashboard() {
    renderProgressBreakdown();
    const st = progressStats(CARDS);
    $("#statMastered").textContent = st.mastered;
    $("#statLearning").textContent = st.learning;
    $("#statNew").textContent = st.fresh;
    const streak = computeStreak();
    $("#streakNum").textContent = streak;
    $("#streakSub").textContent = streak === 0 ? "start a streak today!" : `day${streak === 1 ? "" : "s"} in a row`;
    // Goal ring
    const goal = dailyGoal(), done = todayCount();
    const frac = Math.max(0, Math.min(1, goal ? done / goal : 0));
    const circ = 2 * Math.PI * 30;
    const arc = $("#goalArc");
    arc.setAttribute("stroke-dasharray", circ.toFixed(1));
    arc.setAttribute("stroke-dashoffset", (circ * (1 - frac)).toFixed(1));
    arc.setAttribute("stroke", frac >= 1 ? "var(--good)" : "var(--accent)");
    $("#goalNum").textContent = done;
    $("#goalLbl").textContent = frac >= 1 ? "DONE ✓" : `/ ${goal}`;
    // Panel summary
    const nL = selectedLessons.size, nF = selectedFocuses.size;
    $("#panelSummary").textContent =
      `· ${nL === LESSONS.length ? "all lessons" : nL + " lesson" + (nL === 1 ? "" : "s")}, ${nF} focus${nF === 1 ? "" : "es"}`;

    // A wall of zeros says nothing useful — say something human instead, and
    // celebrate the state where there's genuinely nothing left to review.
    const note = $("#backupFoot") && $("#statsNote");
    if (note) {
      const dueNow = dueReviewCards().length;
      let msg = "";
      if (!st.mastered && !st.learning) msg = "Nothing studied yet — your first lesson is waiting.";
      else if (frac >= 1 && !dueNow) msg = "Daily goal hit and nothing due. Rest easy 🎉";
      else if (!dueNow) msg = "Nothing due for review right now — you're ahead.";
      note.textContent = msg;
      note.classList.toggle("hidden", !msg);
    }
    const foot = $("#backupFoot");
    if (foot) {
      foot.textContent = backupAgeText();
      foot.classList.toggle("stale", !lastBackupAt() || (NOW() - lastBackupAt()) / DAY >= STALE_DAYS);
    }
  }

  // Eyebrow like "UNIT A · CHAPTER 2" for a lesson id.
  function chapterLabelFor(id) {
    const unitCh = {};
    for (const ch of CHAPTERS) {
      unitCh[ch.unit] = (unitCh[ch.unit] || 0) + 1;
      if (ch.lessons.includes(id)) return `UNIT ${ch.unit} · CHAPTER ${unitCh[ch.unit]}`;
    }
    return "";
  }
  const svgUse = id => `<svg class="licon licon-sm"><use href="#${id}"/></svg>`;

  // The Home landing: greeting, the Continue card, and the Review link.
  // A friendly name for the greeting: what you set in Settings, else a tidied-up
  // version of your sign-in email, else nothing.
  function displayName() {
    if (prefs.name && prefs.name.trim()) return prefs.name.trim();
    const e = (typeof userEmail === "function") ? userEmail() : "";
    if (!e) return "";
    const local = e.split("@")[0].split(/[._+-]/)[0].replace(/\d+/g, "");
    return local ? local.charAt(0).toUpperCase() + local.slice(1) : "";
  }

  // Time-of-day greeting, as in the mock ("Good morning!"), with the name if we have one.
  function greetingWord() {
    const h = new Date().getHours();
    return h < 5 ? "Good night" : h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  }
  // This week's seven days, Monday first. Done = the daily goal was met that day.
  function renderWeekStrip() {
    const strip = $("#weekStrip"); if (!strip) return;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const monday = new Date(today); monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
    const names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    strip.innerHTML = "";
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday); d.setDate(monday.getDate() + i);
      const key = dateStr(d);
      const cls = ["wd"];
      if (goalMetOn(key)) cls.push("met");
      if (d.getTime() === today.getTime()) cls.push("today");
      if (d > today) cls.push("future");
      const ring = el("i"); ring.innerHTML = svgUse("i-tick");
      strip.appendChild(el("div", { className: cls.join(" ") }, [ring, el("span", {}, names[i])]));
    }
  }

  function renderHomeTop() {
    const name = displayName();
    $("#greetH").textContent = `${greetingWord()}${name ? ", " + name : ""}!`;
    const streak = computeStreak(), goal = dailyGoal(), done = todayCount();
    $("#scNum").textContent = streak;
    $("#scSub").textContent = streak === 1 ? "day streak" : "day streak";
    // Kept short: the bubble shares the row with the panda on a narrow phone.
    $("#scBubble").textContent = done >= goal ? "Done! 🎉" : done > 0 ? `${goal - done} to go`
      : streak > 0 ? "Keep going!" : "Let's start!";
    renderWeekStrip();

    const cont = $("#homeContinue");
    const curId = currentLessonId();
    const allDone = LESSONS.every(l => doneLessons.has(l.id));
    if (allDone) {
      cont.innerHTML =
        `<div class="hc-body"><div class="eyebrow">Course complete 🎉</div>` +
        `<div class="hc-title">You've finished every lesson</div>` +
        `<div class="hc-en">Keep your words sharp with a review.</div>` +
        `<div class="hc-row">Review your words</div></div>` +
        `<span class="hc-go">${svgUse("i-check")}</span>`;
      cont.onclick = () => startReview();
    } else {
      const l = LESSONS.find(x => x.id === curId);
      const parts = l.title.split("·");
      const after = (parts.length > 1 ? parts.slice(1).join("·") : parts[0]).trim();
      const i = after.search(/[A-Za-z(]/);
      const hz = i > 0 ? after.slice(0, i).trim() : after;
      const en = i > 0 ? after.slice(i).replace(/^[(\s]+|[)\s]+$/g, "").trim() : "";
      const total = lessonCardCount(curId);
      const cleared = CARDS.filter(c => c.lessonId === curId && srs[c.id] && srs[c.id].reps >= 1).length;
      const studied = lessonStudied(curId);
      cont.innerHTML =
        `<div class="hc-body"><div class="eyebrow">${chapterLabelFor(curId)}</div>` +
        `<div class="hc-title">${hz}</div>` +
        (en ? `<div class="hc-en">${en}</div>` : "") +
        `<div class="hc-bar"><i style="width:${total ? Math.round(cleared / total * 100) : 0}%"></i></div>` +
        `<div class="hc-row">${cleared} / ${total} words learned</div></div>` +
        `<span class="hc-go" aria-label="${studied ? "Continue" : "Start"}">${svgUse("i-chevron")}</span>`;
      cont.onclick = () => launchLesson(curId, null);
    }

    const due = dueReviewCards().length, rev = $("#homeReview");
    if (due) {
      $("#homeReviewTxt").textContent = `${due} word${due === 1 ? "" : "s"} ready to review`;
      rev.classList.remove("hidden");
    } else rev.classList.add("hidden");

    const trouble = troubleCards().length, tr = $("#homeTrouble");
    if (trouble) {
      $("#homeTroubleTxt").textContent = `${trouble} trouble word${trouble === 1 ? "" : "s"} to drill`;
      tr.classList.remove("hidden");
    } else tr.classList.add("hidden");
  }

  function renderHome() {
    renderDashboard();
    renderHomeTop();

    const list = $("#lessonList");
    list.innerHTML = "";
    LESSONS.forEach(lesson => {
      const count = lessonCardCount(lesson.id);
      const due = dueCountForLesson(lesson.id);
      const mastered = lessonMastered(lesson.id);
      const cb = el("input", { type: "checkbox", checked: selectedLessons.has(lesson.id) });
      const bar = el("span", { className: "bar" }, el("i", { style: `width:${count ? Math.round(mastered / count * 100) : 0}%` }));
      const row = el("label", { className: "lesson-row" }, [
        cb,
        el("span", { className: "name" }, lesson.title),
        due ? el("span", { className: "due" }, `${due} due`) : el("span", { className: "count" }, `${count}`),
        bar
      ]);
      cb.addEventListener("change", () => {
        cb.checked ? selectedLessons.add(lesson.id) : selectedLessons.delete(lesson.id);
        persistPrefs();
        renderDashboard();
      });
      list.appendChild(row);
    });

    renderFocuses();
  }

  const focusesMatch = keys => keys.length === selectedFocuses.size && keys.every(k => selectedFocuses.has(k));
  function renderFocuses() {
    // Quick-set presets
    const pr = $("#focusPresets");
    pr.innerHTML = "";
    PRESETS.forEach(p => {
      const chip = el("button", { className: "chip" + (focusesMatch(p.keys) ? " on" : "") }, p.name);
      chip.addEventListener("click", () => {
        selectedFocuses.clear();
        p.keys.forEach(k => selectedFocuses.add(k));
        persistPrefs(); renderFocuses(); renderDashboard();
      });
      pr.appendChild(chip);
    });
    // Individual skill toggles
    const fr = $("#focusRow");
    fr.innerHTML = "";
    FOCUSES.forEach(f => {
      const on = selectedFocuses.has(f.key);
      const row = el("div", { className: "focus-toggle" + (on ? " on" : "") }, [
        el("div", { className: "ft-ic" }, licon(f.ico)),
        el("div", { className: "ft-txt" }, [
          el("div", { className: "ft-name" }, f.name),
          el("div", { className: "ft-desc" }, f.desc)
        ]),
        el("div", { className: "switch" + (on ? " on" : "") }, el("span", {}))
      ]);
      row.addEventListener("click", () => {
        if (selectedFocuses.has(f.key)) {
          if (selectedFocuses.size === 1) { toast("Keep at least one skill switched on."); return; }
          selectedFocuses.delete(f.key);
        } else selectedFocuses.add(f.key);
        persistPrefs(); renderFocuses(); renderDashboard();
      });
      fr.appendChild(row);
    });
  }

  // When launched from a lesson node these scope the session to one lesson /
  // one skill; null means "use the global selection".
  let scopeLessons = null, scopeFocuses = null;
  function activeCards() {
    const ls = scopeLessons || selectedLessons;
    return CARDS.filter(c => ls.has(c.lessonId));
  }

  $("#toggleAll").addEventListener("click", () => {
    const all = selectedLessons.size === LESSONS.length;
    selectedLessons.clear();
    if (!all) LESSONS.forEach(l => selectedLessons.add(l.id));
    persistPrefs();
    renderHome();
  });

  function runMode(mode) {
    scopeLessons = null; scopeFocuses = null;   // global (stats) study uses the full selection
    if (mode === "converse") { openConverse(); return; }   // doesn't need lessons
    if (mode === "pick") { openPicker(); return; }         // choose your own words
    if (selectedLessons.size === 0) {
      toast("Pick at least one lesson — open “What to study”.");
      $("#studyPanel").open = true;
      return;
    }
    if (mode === "study") startStudy();
    else if (mode === "quiz") startQuiz();
    else if (mode === "browse") startBrowse();
    else if (mode === "listen") startListening();
    else if (mode === "write") startWriting();
  }
  // Writing practice: stroke-by-stroke drills over the words you've met that have
  // stroke data. Mirrors startListening so the two tiles behave alike.
  function startWriting() {
    reviewMode = false;
    scopeLessons = null;
    if (!HW_OK) { toast("Writing practice needs the stroke engine, which didn't load."); return; }
    const cards = activeCards().filter(c => wordWritable(c.hanzi));
    const studied = cards.filter(c => srs[c.id]);
    const pool = studied.length ? studied : cards;
    if (!pool.length) { toast("Pick at least one lesson — open “What to study”."); $("#studyPanel").open = true; return; }
    scopeFocuses = new Set(["write"]);
    beginStudySession(shuffle(pool).slice(0, 12));
    $("#studyTitle").textContent = "Writing";
  }
  document.querySelectorAll(".practice-list button").forEach(btn =>
    btn.addEventListener("click", () => runMode(btn.dataset.mode)));
  $("#homeContLabel").addEventListener("click", () => { show("path"); renderPath(); });
  $("#homeReview").addEventListener("click", () => startReview());
  $("#homeTrouble").addEventListener("click", () => startTrouble());

  function resetProgress() {
    const ids = new Set(activeCards().map(c => c.id));
    const n = [...ids].filter(id => srs[id]).length;
    if (!confirm(`Reset spaced-repetition memory for ${ids.size} words in the selected lessons? (${n} have progress)`)) return;
    ids.forEach(id => delete srs[id]);
    doneLessons = new Set(); saveDone();
    saveSRS(srs);
    renderHome(); renderPath();
    toast("Progress reset for the selected lessons.");
  }

  /* ==================================================================== */
  /*  PATH (lesson journey home)                                          */
  /* ==================================================================== */

  // Chapters carry a `unit` so the path can group Beginner A (Unit A) and
  // Beginner B (Unit B). New Unit B chapters are appended; their lessons unlock
  // in order after Unit A, since currentLessonId walks LESSONS top to bottom.
  const CHAPTERS = [
    { unit: "A", title: "Greetings & basics", lessons: ["useful", "l1", "l2", "l2-countries"] },
    { unit: "A", title: "Work, things & numbers", lessons: ["l3", "l4", "l5", "numbers", "l6"] },
    { unit: "B", title: "Talking about your day", lessons: ["b1", "b2"] },
    { unit: "B", title: "In the room — measure words", lessons: ["b3", "b4", "b5"] },
    { unit: "B", title: "Dates & plans", lessons: ["b6", "b7", "b8"] }
  ];

  // Short grammar/pattern notes, shown on the "meet the new words" screen and on
  // the lesson sheet, for the lessons that introduce a pattern worth a sentence.
  const LESSON_NOTES = {
    l1: { title: "Yes/no questions with 吗", body: "Add 吗 to the end of a statement to ask it as a question: 你好 → 你好吗？(How are you?)" },
    l3: { title: "Saying where — 在", body: "在 + a place = “at / in”: 我在公司 (I’m at the company), 他在学校 (he’s at school)." },
    l6: { title: "What are you doing? — 在 + verb", body: "在 before a verb means it’s happening right now: 我在学习 (I’m studying)." },
    b1: { title: "了 and 太…了", body: "了 marks something completed; 太…了 = “too / so …”: 太好了！(great!), 太贵了 (too expensive)." },
    b2: { title: "Telling the time", body: "点 = o’clock, 分 = minutes, 半 = half, 刻 = quarter: 三点半 (3:30), 从五点到六点 (from 5 to 6)." },
    b3: { title: "Counting: number + measure word + noun", body: "You can’t say 一书 — a measure word goes between: 一本书 (a book), 两杯水 (two cups of water)." },
    b6: { title: "Dates: biggest unit first", body: "月 (month) → 号 (day) → 星期 (weekday): 八月二十一号星期二 (Tues 21 Aug)." },
    b7: { title: "在 + verb, and 要 / 不要 + verb", body: "在 + verb = doing it now: 我在看电视. 要 + verb = will; 不要 + verb = won’t: 我要学习 / 我不要看电视." }
  };
  // One mascot sprite per chapter; chapter N uses sprite N (wraps around).
  // The panda in six scenes. Sprites cycle through this list to fill the wave's
  // open pockets, so adding one here just appears on the path. All sit on a
  // 690x690 canvas at the same height, so a single CSS width renders them alike.
  const CHAPTER_SPRITES = [
    "sprite-reading.png", "sprite-baozi.png", "sprite-writing.png", "sprite-listening.png",
    "sprite-puzzled.png", "sprite-sleeping.png"
  ];
  // Where the lamplight sits inside each night cluster, measured from the art.
  const PATH_LIGHTS = {
    "cluster-left-bamboo": { x: 17.1, y: 69.9 },
    "cluster-right-temple": { x: 73.1, y: 35.8 },
    "land-pagoda": { x: 56.0, y: 59.7 },
    "fol-blossom": { x: 67.4, y: 49.6 }
  };
  // Scenery clusters, alternating down the path and mirrored so a short list of
  // pieces does not read as a repeating tile.
  /* The arrangement settled in the path composer, as percentages of a 390x844
     screen. `ar` is each piece's height over its width. `y` is the base of the
     piece. This band covers five lessons and repeats down the path. */
  const BAND_LESSONS = 5;
  const BAND_TOP = 200;              // where the first lesson sat in the composer
  const BAND_H = 844;                // the screen the arrangement was composed on
  const PATH_TEMPLATE = [
    { art: "cluster-right-temple", x: 69, y: 35.6, w: 65, ar: 0.738, family: "landmark" },
    { art: "cluster-left-bamboo", x: 26.7, y: 98.2, w: 66, ar: 1.689, family: "left" },
    { art: "cluster-right-bamboo", x: 98, y: 112, w: 44, ar: 1.470, family: "right" }
  ];
  /* Every piece of scenery: how wide it is drawn (percent of the screen), its
     height over its width, and the side it was drawn for. The first band uses
     the template's own pieces; later bands rotate through each slot's family
     so the path does not repeat. The foliage was drawn with a flat left edge,
     so it is flipped when it sits on the right. */
  const ART = {
    "cluster-right-temple": { w: 65, ar: 0.738, side: "right" },
    "cluster-left-bamboo": { w: 66, ar: 1.689, side: "left" },
    "cluster-right-bamboo": { w: 44, ar: 1.470, side: "right" },
    "panda-walking": { w: 22, ar: 1.352, side: "any" },
    "fol-bamboo": { w: 60, ar: 1.532, side: "left" },
    "fol-pine": { w: 60, ar: 1.349, side: "left" },
    "fol-blossom": { w: 60, ar: 1.462, side: "left" },
    "fol-banana": { w: 60, ar: 1.439, side: "left" },
    "land-torii": { w: 65, ar: 0.624, side: "any" },
    "land-pagoda": { w: 65, ar: 0.841, side: "any" },
    "land-pavilion": { w: 65, ar: 0.711, side: "any" },
    "land-house": { w: 65, ar: 0.617, side: "any" },
    "fol-oak": { w: 60, ar: 1.31, side: "left" },
    "land-bridge": { w: 65, ar: 0.58, side: "any" },
    "land-waterfall": { w: 65, ar: 0.688, side: "any" },
    "grass-1": { w: 13, ar: 0.962, side: "any" },
    "grass-2": { w: 13, ar: 0.642, side: "any" },
    "grass-3": { w: 13, ar: 0.809, side: "any" },
    "land-cliff": { w: 65, ar: 0.895, side: "left" },
    "panda-celebrate": { w: 22, ar: 1.143, side: "any" },
    "panda-idle": { w: 22, ar: 1.531, side: "any" },
    "panda-peek": { w: 22, ar: 0.703, side: "any" },
    "panda-sad": { w: 22, ar: 1.079, side: "any" },
    "panda-teacher": { w: 22, ar: 1.202, side: "any" },
    "panda-waving": { w: 22, ar: 1.321, side: "any" },
    "panda-reading": { w: 22, ar: 1.349, side: "any" },
    "panda-baozi": { w: 22, ar: 1.267, side: "any" },
    "panda-writing": { w: 22, ar: 0.978, side: "any" },
    "panda-listening": { w: 22, ar: 1.125, side: "any" },
    "panda-puzzled": { w: 22, ar: 1.297, side: "any" },
    "panda-sleeping": { w: 22, ar: 0.845, side: "any" }
  };
  const FAMILIES = {
    landmark: ["cluster-right-temple", "land-torii", "land-pagoda", "land-pavilion", "land-house", "land-bridge", "land-waterfall", "land-cliff"],
    left: ["cluster-left-bamboo", "fol-bamboo", "fol-pine", "fol-blossom", "fol-banana", "fol-oak"],
    right: ["cluster-right-bamboo", "fol-bamboo", "fol-pine", "fol-blossom", "fol-banana", "fol-oak"]
  };
  /* The path as composed by hand in the path editor, phone edition. Each
     piece is placed against a lesson's stone (dx, dy from the stone's centre
     to the piece's centre-bottom, w as a share of the screen width), so it
     follows that stone when a START bubble or a new chapter shifts the path.
     Headers may be sent to a chosen side. Stones past the last composed one
     fall back to the automatic bands below. */
  const PATH_LAYOUT = {
    version: 1,
    phone: true,
    headers: {
        "b1": "right",
        "l3": "right",
        "b3": "left"
    },
    pieces: [
        {
            "art": "cluster-right-temple",
            "stone": "l1",
            "dx": 145.1,
            "dy": -38.5,
            "w": 65,
            "flip": false,
            "behind": true
        },
        {
            "art": "panda-walking",
            "stone": "l2",
            "dx": 114.9,
            "dy": -38.2,
            "w": 22,
            "flip": true,
            "behind": false
        },
        {
            "art": "cluster-left-bamboo",
            "stone": "l3",
            "dx": -196.9,
            "dy": -51.2,
            "w": 66,
            "flip": false,
            "behind": true
        },
        {
            "art": "panda-sleeping",
            "stone": "l4",
            "dx": -172.8,
            "dy": 44.3,
            "w": 36,
            "flip": false,
            "behind": false
        },
        {
            "art": "land-pagoda",
            "stone": "l6",
            "dx": 245,
            "dy": 63.6,
            "w": 84.5,
            "flip": false,
            "behind": true
        },
        {
            "art": "fol-blossom",
            "stone": "b5",
            "dx": -185.8,
            "dy": 78.2,
            "w": 63,
            "flip": false,
            "behind": true
        },
        {
            "art": "panda-writing",
            "stone": "b8",
            "dx": 201.2,
            "dy": -40,
            "w": 36,
            "flip": false,
            "behind": false
        }
    ]
};
  // Where the mascot stands relative to the lesson you are on.
  const PANDA = { x: 79.2, y: 50.8, w: 22, flip: true, ar: 831 / 614 };
  /* Where each piece is actually painted: ten strips top to bottom, each the
     opaque extent as a fraction of the width. Measured from the artwork.
     Collisions are judged on these, so foliage can lean towards the path the
     way it was composed without its empty corners counting against it. */
  const SLABS = {
    "cluster-left-bamboo": [[0.0, 0.306], [0.0, 0.346], [0.0, 0.352], [0.0, 0.427], [0.0, 0.499], [0.0, 0.596], [0.0, 0.598], [0.0, 0.605], [0.0, 0.932], [0.0, 1.0]],
    "cluster-right-temple": [[0.735, 1.0], [0.641, 1.0], [0.423, 1.0], [0.332, 1.0], [0.278, 1.0], [0.185, 1.0], [0.06, 1.0], [0.0, 1.0], [0.149, 1.0], [0.48, 1.0]],
    "cluster-right-bamboo": [[0.718, 0.989], [0.668, 1.0], [0.618, 1.0], [0.638, 1.0], [0.707, 1.0], [0.627, 1.0], [0.618, 1.0], [0.449, 1.0], [0.38, 1.0], [0.0, 1.0]],
    "panda-walking": [[0.143, 0.893], [0.117, 0.926], [0.131, 0.986], [0.119, 0.995], [0.048, 0.969], [0.0, 0.995], [0.0, 1.0], [0.067, 0.8], [0.045, 0.94], [0.048, 0.94]],
    "fol-bamboo": [[0.081, 0.433], [0.0, 0.473], [0.0, 0.544], [0.0, 0.528], [0.0, 0.576], [0.0, 0.57], [0.0, 0.5], [0.0, 0.746], [0.0, 0.878], [0.0, 1.0]],
    "fol-pine": [[0.011, 0.375], [0.0, 0.569], [0.0, 0.618], [0.0, 0.759], [0.0, 0.768], [0.0, 0.506], [0.0, 0.536], [0.0, 0.718], [0.0, 0.943], [0.0, 1.0]],
    "fol-blossom": [[0.005, 0.335], [0.0, 0.463], [0.0, 0.728], [0.0, 0.817], [0.0, 0.667], [0.0, 0.618], [0.0, 0.434], [0.0, 0.669], [0.0, 0.712], [0.0, 1.0]],
    "fol-banana": [[0.235, 0.434], [0.014, 0.418], [0.014, 0.676], [0.0, 0.646], [0.0, 0.716], [0.0, 0.717], [0.0, 0.58], [0.0, 0.747], [0.0, 0.899], [0.0, 1.0]],
    "land-torii": [[0.587, 0.791], [0.161, 0.919], [0.175, 0.948], [0.209, 1.0], [0.213, 0.999], [0.097, 0.937], [0.046, 0.93], [0.016, 0.924], [0.012, 0.94], [0.0, 0.94]],
    "land-pagoda": [[0.551, 0.581], [0.49, 0.639], [0.38, 0.885], [0.359, 0.944], [0.215, 0.981], [0.159, 0.989], [0.115, 1.0], [0.06, 0.988], [0.021, 0.993], [0.0, 0.994]],
    "land-pavilion": [[0.545, 0.795], [0.478, 0.918], [0.415, 0.926], [0.129, 0.964], [0.051, 0.958], [0.018, 0.958], [0.022, 0.976], [0.009, 1.0], [0.0, 0.98], [0.056, 0.873]],
    "land-house": [[0.577, 0.798], [0.172, 0.833], [0.149, 0.864], [0.078, 0.924], [0.046, 0.969], [0.033, 1.0], [0.044, 0.998], [0.04, 0.977], [0.0, 0.995], [0.002, 0.995]],
    "fol-oak": [[0.052, 0.425], [0.0, 0.625], [0.016, 0.675], [0.0, 0.782], [0.0, 0.796], [0.0, 0.501], [0.0, 0.552], [0.0, 0.696], [0.0, 0.937], [0.0, 1.0]],
    "land-bridge": [[0.478, 0.821], [0.419, 0.931], [0.365, 0.959], [0.311, 0.976], [0.165, 0.968], [0.105, 0.986], [0.041, 0.988], [0.001, 0.999], [0.0, 0.997], [0.009, 0.893]],
    "land-waterfall": [[0.452, 0.964], [0.341, 1.0], [0.294, 1.0], [0.296, 1.0], [0.261, 1.0], [0.167, 1.0], [0.11, 1.0], [0.046, 1.0], [0.0, 1.0], [0.269, 1.0]],
    "grass-1": [[0.167, 0.309], [0.189, 0.394], [0.215, 0.454], [0.0, 0.994], [0.022, 0.984], [0.102, 0.904], [0.169, 0.843], [0.032, 1.0], [0.084, 0.976], [0.163, 0.845]],
    "grass-2": [[0.194, 0.305], [0.224, 0.364], [0.25, 0.732], [0.271, 0.702], [0.29, 0.663], [0.0, 0.632], [0.054, 1.0], [0.091, 0.897], [0.076, 0.792], [0.151, 0.729]],
    "grass-3": [[0.168, 0.344], [0.213, 0.434], [0.255, 0.934], [0.29, 0.922], [0.317, 0.863], [0.078, 0.818], [0.0, 0.785], [0.137, 1.0], [0.164, 0.92], [0.228, 0.858]],
    "land-cliff": [[0.0, 0.287], [0.0, 0.367], [0.0, 0.372], [0.0, 0.405], [0.0, 0.537], [0.0, 0.588], [0.0, 0.683], [0.0, 0.758], [0.0, 0.915], [0.0, 1.0]],
    "panda-celebrate": [[0.17, 0.952], [0.059, 0.947], [0.061, 1.0], [0.065, 0.984], [0.0, 0.972], [0.089, 0.986], [0.212, 0.851], [0.218, 0.838], [0.242, 0.79], [0.291, 0.505]],
    "panda-idle": [[0.077, 0.914], [0.077, 0.912], [0.107, 0.893], [0.107, 0.893], [0.118, 0.954], [0.035, 0.998], [0.0, 1.0], [0.002, 0.979], [0.167, 0.824], [0.139, 0.856]],
    "panda-peek": [[0.139, 0.728], [0.06, 0.734], [0.052, 0.728], [0.056, 0.954], [0.11, 0.998], [0.1, 1.0], [0.1, 0.996], [0.102, 0.975], [0.023, 0.942], [0.0, 0.888]],
    "panda-sad": [[0.188, 0.816], [0.107, 0.897], [0.109, 0.897], [0.135, 0.84], [0.137, 0.893], [0.176, 0.911], [0.145, 0.927], [0.014, 0.99], [0.0, 1.0], [0.012, 0.986]],
    "panda-teacher": [[0.036, 0.62], [0.008, 0.994], [0.026, 1.0], [0.073, 0.923], [0.032, 0.899], [0.006, 0.824], [0.0, 0.691], [0.032, 0.691], [0.119, 0.683], [0.081, 0.733]],
    "panda-waving": [[0.087, 0.741], [0.077, 0.939], [0.123, 1.0], [0.123, 0.998], [0.032, 0.956], [0.004, 0.838], [0.0, 0.78], [0.046, 0.78], [0.182, 0.78], [0.152, 0.808]],
    "panda-reading": [[0.054, 0.892], [0.052, 0.89], [0.11, 0.871], [0.104, 0.876], [0.116, 0.959], [0.035, 0.985], [0.0, 1.0], [0.002, 0.985], [0.015, 0.988], [0.033, 0.969]],
    "panda-baozi": [[0.088, 0.865], [0.066, 0.865], [0.088, 0.864], [0.125, 0.869], [0.131, 0.891], [0.133, 0.943], [0.103, 0.969], [0.045, 0.969], [0.0, 1.0], [0.002, 0.994]],
    "panda-writing": [[0.277, 0.805], [0.277, 0.818], [0.248, 0.8], [0.248, 0.777], [0.209, 0.838], [0.186, 0.891], [0.098, 0.918], [0.002, 0.998], [0.0, 1.0], [0.035, 0.968]],
    "panda-listening": [[0.05, 0.721], [0.029, 0.891], [0.09, 1.0], [0.003, 0.967], [0.0, 0.888], [0.01, 0.913], [0.093, 0.922], [0.01, 0.933], [0.002, 0.927], [0.026, 0.843]],
    "panda-puzzled": [[0.331, 1.0], [0.036, 0.96], [0.036, 0.882], [0.002, 0.806], [0.0, 0.832], [0.034, 0.876], [0.192, 0.896], [0.184, 0.89], [0.188, 0.776], [0.152, 0.824]],
    "panda-sleeping": [[0.288, 0.583], [0.091, 0.655], [0.0, 0.9], [0.086, 0.886], [0.083, 0.809], [0.134, 0.878], [0.122, 0.905], [0.063, 0.935], [0.043, 0.992], [0.097, 1.0]]
  };
  const lessonHero = lesson => (cjkOnly(lesson.words[0].hanzi)[0] || "字");
  /* ---- Lesson completion -------------------------------------------------
     Separate from mastery. A word is "mastered" only once its SRS interval
     reaches a week, so gating the path on that meant finishing a lesson today
     never advanced it. Completing a study round marks the lesson done; mastery
     still drives the progress bar in the lesson sheet.                      */
  const LS_DONE = "zhBeginnerA.done.v1";
  let doneLessons = (() => {
    try { return new Set(JSON.parse(localStorage.getItem(LS_DONE)) || []); }
    catch { return new Set(); }
  })();
  const saveDone = () => { localStorage.setItem(LS_DONE, JSON.stringify([...doneLessons])); queueSync(); };
  const lessonDone = id => doneLessons.has(id);
  function nextLessonId(after) {
    const i = LESSONS.findIndex(l => l.id === after);
    for (let k = i + 1; k < LESSONS.length; k++) if (!doneLessons.has(LESSONS[k].id)) return LESSONS[k].id;
    return LESSONS.find(l => !doneLessons.has(l.id))?.id || null;
  }

  const lessonPct = id => { const t = lessonCardCount(id); return t ? Math.round(lessonMastered(id) / t * 100) : 0; };
  const lessonStudied = id => CARDS.some(c => c.lessonId === id && srs[c.id]);
  // Beyond this many due cards a lesson study is split into even batches.
  const SESSION_CAP = 20;
  // A lesson is complete once every one of its words has been answered correctly
  // at least once (reps ≥ 1) — this is what lets big lessons finish across batches
  // instead of on a single cleared round.
  const lessonCleared = id => CARDS.filter(c => c.lessonId === id).every(c => srs[c.id] && srs[c.id].reps >= 1);

  /* ---- Review ------------------------------------------------------------
     The SRS was running but never surfaced: once a lesson was finished its
     words went stale with no way back to them. Review pulls everything that
     has fallen due across lessons you've already worked through.           */
  let reviewMode = false;
  function dueReviewCards() {
    const now = NOW();
    return CARDS.filter(c => {
      const s = srs[c.id];
      if (!s) return false;                       // never studied - not a review
      if (!doneLessons.has(c.lessonId) && c.lessonId !== firstUnfinishedId()) return false;
      return s.due <= now;
    });
  }
  function firstUnfinishedId() {
    for (const l of LESSONS) if (!doneLessons.has(l.id)) return l.id;
    return null;
  }
  function startReview() {
    const cards = dueReviewCards();
    if (!cards.length) { toast("Nothing due yet - come back later."); return; }
    reviewMode = true;
    scopeLessons = new Set(cards.map(c => c.lessonId));   // distractors from these lessons
    scopeFocuses = new Set(selectedFocuses);
    beginStudySession(shuffle(cards).slice(0, 20));
    $("#studyTitle").textContent = "Review";
  }

  // The words you personally keep missing. Ease only ever drops when you tap
  // "again", so ease < the 2.4 start means it's tripped you up; lapses (how many
  // times) refines the order. Only words you've actually reached count.
  function troubleCards() {
    return CARDS.filter(c => {
      const s = srs[c.id];
      if (!s || !s.reps && !s.lapses) return false;
      if (!doneLessons.has(c.lessonId) && c.lessonId !== firstUnfinishedId()) return false;
      return (s.lapses || 0) > 0 || s.ease < 2.4;
    }).sort((a, b) => {
      const sa = srs[a.id], sb = srs[b.id];
      return (sb.lapses || 0) - (sa.lapses || 0) || sa.ease - sb.ease;   // most-missed first
    });
  }
  function startTrouble() {
    const cards = troubleCards();
    if (!cards.length) { toast("No trouble words yet — nothing you're stuck on. Nice!"); return; }
    reviewMode = true;
    scopeLessons = new Set(cards.map(c => c.lessonId));   // plausible distractors
    scopeFocuses = new Set(selectedFocuses);
    beginStudySession(cards.slice(0, 20));                // already hardest-first
    $("#studyTitle").textContent = "Trouble words";
  }

  // A listening-first session: audio plays and you answer from what you hear,
  // before reading anything. Reuses the existing "listen" card direction.
  function startListening() {
    reviewMode = false;
    scopeLessons = null;
    const cards = activeCards();                          // the words from your selected lessons
    const studied = cards.filter(c => srs[c.id]);        // you can only recognise words you've met
    const pool = studied.length ? studied : cards;
    if (!pool.length) { toast("Pick at least one lesson — open “What to study”."); $("#studyPanel").open = true; return; }
    scopeFocuses = new Set(["listen"]);
    beginStudySession(shuffle(pool).slice(0, 20));
    $("#studyTitle").textContent = "Listening";
  }

  function currentLessonId() {
    for (const l of LESSONS) if (!doneLessons.has(l.id)) return l.id;
    return LESSONS[LESSONS.length - 1].id;   // everything finished → last
  }

  /* ---- The river ------------------------------------------------------
     The path is a sine wave. The same function draws the water AND places the
     lotuses, so they can never drift apart. `t` runs along the scroll axis;
     the return value is the cross-axis position. Settings were dialled in on
     pathmock2.html — each orientation needs its own, because the cross-axis is
     ~800px tall on desktop but only ~400px wide on a phone.                */
  const PATH_CFG = {
    desktop: { size: 84, gap: 132, wave: 118, per: 8, phase: 6, pad: 180, sprite: 140, sgap: 80, svert: 0 },
    phone:   { size: 74, gap: 143, wave: 106, per: 8, phase: 6, pad: 170, sprite: 124, sgap: 70, svert: 0 }
  };
  const pathIsPhone = () => window.matchMedia("(max-width: 699px)").matches;
  let pathTries = 0;

  function renderPath() {
    $("#pathStreak").textContent = computeStreak();
    // Daily-goal ring in the HUD: fills through the day, flips to a gold ✓ when met.
    const goal = dailyGoal(), done = todayCount(), met = done >= goal;
    const frac = Math.max(0, Math.min(1, goal ? done / goal : 0));
    const arc = $("#pathGoalArc"), circ = 2 * Math.PI * 9;
    arc.setAttribute("stroke-dasharray", circ.toFixed(1));
    arc.setAttribute("stroke-dashoffset", (circ * (1 - frac)).toFixed(1));
    $("#pathGoal").classList.toggle("done", met);
    $("#pathGoalTxt").textContent = met ? "✓" : `${done}/${goal}`;
    renderBackupNudge();
    // Review call-to-action: only shown when something has actually fallen due.
    const due = dueReviewCards().length, fab = $("#reviewFab");
    const allDone = LESSONS.every(l => doneLessons.has(l.id));
    fab.innerHTML = "";
    if (due) {
      fab.appendChild(icon("repeat", 18));
      fab.appendChild(document.createTextNode(` Review ${due} word${due === 1 ? "" : "s"}`));
      fab.classList.remove("hidden", "caughtup");
    } else if (allDone) {
      fab.appendChild(document.createTextNode("🎉 Course complete — all caught up"));
      fab.classList.remove("hidden");
      fab.classList.add("caughtup");
    } else fab.classList.add("hidden");

    const wrap = $("#pathList");
    const phone = pathIsPhone(), c = phone ? PATH_CFG.phone : PATH_CFG.desktop;
    const curId = currentLessonId();

    // flatten chapters into an ordered list, remembering where each one starts.
    // The banner shows the unit + a chapter number counted WITHIN that unit.
    const items = [];
    const unitCh = {};
    CHAPTERS.forEach((ch, ci) => {
      unitCh[ch.unit] = (unitCh[ch.unit] || 0) + 1;
      const chNo = unitCh[ch.unit];
      ch.lessons.forEach((id, li) => {
        const lesson = LESSONS.find(l => l.id === id);
        if (lesson) items.push({
          lesson,
          chapter: li === 0 ? {
            unit: ch.unit, chNo, title: ch.title,
            total: ch.lessons.length,
            done: ch.lessons.filter(x => doneLessons.has(x)).length
          } : null
        });
      });
    });

    [...wrap.querySelectorAll(".pnode,.pchapter,.psprite")].forEach(n => n.remove());

    // Vertical positions. A chapter opens a banner-sized void before its first
    // button; size that void to one even edge-gap above AND below the banner
    // (plus the START bubble's headroom, but only when that first button is the
    // current lesson) so the path's rhythm doesn't stutter around a header.
    const BUBBLE = 40;                    // headroom reserved for a START bubble (placement measures the real overhang)
    // Measure the HUD rather than hardcode it: on a notched phone its safe-area
    // top padding makes it taller, and the first banner must clear THAT, not 62.
    const hudEl = document.querySelector(".path-top");
    const HUD_H = (hudEl && hudEl.offsetHeight) || 62;
    const EDGE = Math.max(22, c.gap - c.size);   // normal coin-to-coin edge gap
    const BANNER_H = 72;                  // the header block; placement re-centres on the real height
    const HGAP = 36;                      // extra room a header gets, over the normal stone gap
    // A chapter banner gets a roomier gap than the coins do, the SAME above and
    // below — and, crucially, banner→coin stays this size even when that coin is
    // the current lesson, because bubbleFor() reserves the START bubble's height
    // ON TOP. So a bubble arriving under a banner (as progression reaches a new
    // chapter) never eats into the gap or clips the banner.
    const BGAP = EDGE + 24;
    const bubbleFor = i => (items[i].lesson.id === curId ? BUBBLE : 0);
    const ys = [];
    // Chapter 1's banner sits nearer the HUD than later banners do — there's no
    // preceding coin to breathe from, so the full 2×BGAP void just read as dead
    // space at the very top. One BGAP splits evenly above/below it instead.
    let y = HUD_H + 16 + BANNER_H + bubbleFor(0) + c.size / 2;
    items.forEach((it, i) => {
      if (it.chapter && i > 0) y += HGAP + BANNER_H + bubbleFor(i);
      ys.push(y); y += c.gap;
    });
    wrap.style.height = (ys[ys.length - 1] + c.pad) + "px";

    // A hidden #path has width 0 and can't be laid out. Only retry while the path
    // is actually the visible view — otherwise a render kicked off while we're on
    // another tab would storm retries and burn through pathTries, leaving the path
    // blank on its first open (the "have to tap Learn twice" bug). Callers show
    // the path FIRST, then render, so this measures a real width straight away.
    const W = wrap.clientWidth;
    if (!W) {
      if (document.body.dataset.view === "path" && pathTries++ < 40) setTimeout(renderPath, 50);
      return;
    }
    pathTries = 0;

    // The sine advances one step per BUTTON, so `per` is how many buttons make
    // up a full sweep. Normalising by the largest value the buttons actually
    // reach makes `wave` the true offset of the outermost one — without it,
    // changing `per` would silently change the path's width too.
    let k = 0;
    for (let i = 0; i < items.length; i++) k = Math.max(k, Math.abs(Math.sin(i * 2 * Math.PI / c.per)));
    if (k < 1e-6) k = 1;                  // every button on a zero crossing: straight column
    const half = c.size / 2 + 8;
    const nodeX = i => Math.max(half, Math.min(W - half,
      W / 2 + c.wave * Math.sin((i + (c.phase || 0)) * 2 * Math.PI / c.per) / k));

    const place = (node, x, yy) => {
      node.style.left = x + "px"; node.style.top = yy + "px"; wrap.appendChild(node);
    };

    /* ---- Scenery. Settled in the path composer and expressed here against the
       same 74px stone the editor used, so the numbers carry straight over. */
    const SC = { patchW: 1.20, patchSquash: .66,
                 pebEvery: 9.2, pebSize: 11, pebVar: .63, pebWander: 31, pebClear: 4,
                 clusterEvery: 6 };
    const unit = c.size / 74;                       // editor units to real pixels
    const noise = n => {
      const v = Math.sin(n * 12.9898) * 43758.5453;
      return (v - Math.floor(v)) * 2 - 1;
    };

    // A smooth walk down the whole path, used to thread the pebbles.
    const curve = t => {
      const f = t * (ys.length - 1);
      const i = Math.max(0, Math.min(ys.length - 2, Math.floor(f)));
      let u = f - i;
      u = u * u * (3 - 2 * u);
      return { x: nodeX(i) + (nodeX(i + 1) - nodeX(i)) * u,
               y: ys[i] + (ys[i + 1] - ys[i]) * u };
    };

    // A header takes the side of the path the stones around it leave free.
    // The first one sits on the left, under the HUD, as the design has it.
    const headerRight = i => {
      const chosen = PATH_LAYOUT.headers[items[i].lesson.id];
      if (chosen) return chosen === "right";
      return i > 0 && (nodeX(i - 1) + nodeX(i)) / 2 < W / 2;
    };

    // Everything scenery has to keep out of: the stones, and the chapter
    // headers, each on its own side of the page.
    const obstacles = [];
    for (let i = 0; i < ys.length; i++) {
      obstacles.push({
        x0: nodeX(i) - c.size * STONE_RATIO / 2, x1: nodeX(i) + c.size * STONE_RATIO / 2,
        y0: ys[i] - c.size / 2, y1: ys[i] + c.size / 2
      });
      if (!items[i].chapter) continue;
      const top = ys[i] - c.size / 2 - bubbleFor(i);
      const prev = i === 0 ? HUD_H : ys[i - 1] + c.size / 2;
      const mid = (prev + top) / 2;
      const right = headerRight(i);
      obstacles.push({ header: true, x0: right ? W * .38 : 0, x1: right ? W : W * .62,
                       y0: mid - BANNER_H / 2, y1: mid + BANNER_H / 2 });
    }
    // Ground under each stone, so it reads as resting on cleared earth.
    items.forEach((it, i) => {
      const w = c.size * STONE_RATIO * SC.patchW;
      const g = el("div", { className: "pground g" + (i % 4) });
      g.style.width = w + "px";
      g.style.height = (w * SC.patchSquash) + "px";
      place(g, nodeX(i), ys[i] + c.size * .14);
    });

    // The pebble trail. Density is fixed, so a long chapter gets more of them
    // rather than the same number stretched further apart.
    const span = ys[ys.length - 1] - ys[0];
    const pebbles = Math.max(0, Math.round(span / (SC.pebEvery * unit)));
    const halfW = c.size * STONE_RATIO / 2 + SC.pebClear * unit;
    const halfH = c.size / 2 + SC.pebClear * unit;
    for (let n = 1; n <= pebbles; n++) {
      const t = n / (pebbles + 1);
      const p = curve(t), q = curve(Math.min(1, t + 0.002));
      const dx = q.x - p.x, dy = q.y - p.y;
      const len = Math.hypot(dx, dy) || 1;
      const off = SC.pebWander * unit * noise(n * 1.7);
      const w = SC.pebSize * unit * (1 + SC.pebVar * noise(n * 4.3));
      const bx = p.x - dy / len * off, by = p.y + dx / len * off;
      // Anything landing inside a stone, or under a header, is dropped, not drawn.
      let hidden = false;
      for (let i = 0; i < ys.length && !hidden; i++) {
        const ex = (bx - nodeX(i)) / (halfW + w / 2), ey = (by - ys[i]) / (halfH + w / 2);
        if (ex * ex + ey * ey < 1) hidden = true;
      }
      for (const b of obstacles) {
        if (b.header && bx > b.x0 - w && bx < b.x1 + w && by > b.y0 - w && by < b.y1 + w) {
          hidden = true; break;
        }
      }
      if (hidden) continue;
      const pb = el("div", { className: "ppebble" });
      pb.style.width = Math.max(3, w) + "px";
      pb.style.height = Math.max(2, w * .62) + "px";
      place(pb, bx, by);
    }

    /* ---- Scenery placement. Every band starts from the composed template.
       Collisions are judged on where a piece is painted (SLABS), not on its
       bounding box. A piece that would run into a stone, a header or another
       piece slides up or down the path to the nearest clear stretch; failing
       that it tries the mirrored side; failing that it is left out. Nothing
       goes under the HUD, and nothing goes below the last stone. */
    const bandScale = c.gap / 143;                  // the spacing it was composed at
    const pathTop = HUD_H + 8;
    const pathEnd = ys[ys.length - 1] + c.size * .9;
    const taken = [];                               // strips scenery already paints
    const overlap = (a, b, pad) =>
      a.x0 < b.x1 + pad && a.x1 > b.x0 - pad && a.y0 < b.y1 + pad && a.y1 > b.y0 - pad;
    const strips = (art, x0, y0, w, h, mirrored) => {
      const out = [], sl = SLABS[art];
      sl.forEach((sb, r) => {
        if (!sb) return;
        const l = mirrored ? 1 - sb[1] : sb[0], rr = mirrored ? 1 - sb[0] : sb[1];
        out.push({ x0: x0 + l * w, x1: x0 + rr * w,
                   y0: y0 + h * r / sl.length, y1: y0 + h * (r + 1) / sl.length });
      });
      return out;
    };
    /* The template was composed with foliage touching the stones, so stones
       get no margin (the alpha cut when the strips were measured is margin
       enough); header text and other scenery get a little. */
    const PAD = { stone: 0, header: 4, scenery: 4 };
    // `asComposed` is for the first band, laid out exactly as the template
    // was approved: its pieces were composed against each other, so only the
    // stones and headers can turn one away.
    const fits = (art, x0, y0, w, h, mirrored, asComposed) => {
      if (y0 < pathTop || y0 + h > pathEnd) return false;
      const st = strips(art, x0, y0, w, h, mirrored);
      for (const sp of st) {
        for (const o of obstacles) if (overlap(sp, o, o.header ? PAD.header : PAD.stone)) return false;
        if (!asComposed) for (const t of taken) if (overlap(sp, t, PAD.scenery)) return false;
      }
      return true;
    };
    // The composed spot first, then step away from it down and up the path.
    const settle = (art, cx, base, w, h, mirrored, reach, asComposed) => {
      for (let d = 0; d <= reach; d += 12) {
        for (const sgn of (d ? [1, -1] : [1])) {
          const y0 = base - h + sgn * d;
          if (fits(art, cx - w / 2, y0, w, h, mirrored, asComposed)) return y0 + h;
        }
      }
      return null;
    };
    const claim = (art, cx, base, w, h, mirrored) =>
      taken.push(...strips(art, cx - w / 2, base - h, w, h, mirrored));

    // The mascot stands on a little patch of the same ground as the stones,
    // and faces the path.
    const addPanda = (cx, base) => {
      const pw = W * PANDA.w / 100, ph = pw * PANDA.ar;
      const gw = pw * .82, gh = gw * .38;
      const g = el("div", { className: "pground g2" });
      g.style.width = gw + "px";
      g.style.height = gh + "px";
      place(g, cx, base - gh * .62 + gh / 2);
      const sp = el("div", { className: "psprite" + (cx > W / 2 ? " flip" : "") });
      sp.style.backgroundImage = "var(--panda-walk)";
      sp.style.width = pw + "px";
      sp.style.height = ph + "px";
      place(sp, cx, base - ph / 2);
      claim("panda-walking", cx, base, pw, ph, cx > W / 2);
    };

    /* ---- The hand-composed layout, drawn exactly as placed. It was composed
       at 390 wide: sideways offsets scale with the screen, vertical ones do
       not, because the stone spacing is fixed in pixels. */
    const kx = W / 390;
    let composedUntil = -1;
    PATH_LAYOUT.pieces.forEach(p => {
      const i = items.findIndex(it => it.lesson.id === p.stone);
      const a = ART[p.art];
      if (i < 0 || !a) return;
      composedUntil = Math.max(composedUntil, i);
      const cx = nodeX(i) + p.dx * kx, base = ys[i] + p.dy;
      const w = W * p.w / 100, h = w * a.ar;
      if (/^panda/.test(p.art)) {
        const gw = w * .82, gh = gw * .38;
        const g = el("div", { className: "pground g2" });
        g.style.width = gw + "px";
        g.style.height = gh + "px";
        place(g, cx, base - gh * .62 + gh / 2);
        const sp = el("div", { className: "psprite" + (p.flip ? " flip" : "") });
        sp.style.backgroundImage = `var(--${p.art === "panda-walking" ? "panda-walk" : p.art})`;
        sp.style.width = w + "px";
        sp.style.height = h + "px";
        place(sp, cx, base - h / 2);
      } else {
        const cl = el("div", { className: "pcluster" + (p.flip ? " flip" : "") + (p.behind ? "" : " front") +
          (PATH_LIGHTS[p.art] ? "" : " nolight") });
        cl.style.width = w + "px";
        cl.style.height = h + "px";
        cl.style.backgroundImage = `var(--${p.art})`;
        const lit = PATH_LIGHTS[p.art];
        if (lit) {
          const lx = p.flip ? 100 - lit.x : lit.x;
          cl.style.setProperty("--lx", ((35 + lx) / 170 * 100).toFixed(1) + "%");
          cl.style.setProperty("--ly", ((45 + lit.y) / 190 * 100).toFixed(1) + "%");
        }
        place(cl, cx, base);
      }
      claim(p.art, cx, base, w, h, p.flip);
    });

    for (let b = 0; b * BAND_LESSONS < items.length; b++) {
      const first = b * BAND_LESSONS;
      if (first <= composedUntil) continue;             // composed by hand: leave it be
      const anchor = ys[first] - BAND_TOP * bandScale;
      const bandH = BAND_H * bandScale;

      // The mascot goes first: it matters more than the planting. As composed
      // if that is clear, otherwise beside one of the band's stones, on the
      // open side, about a stone's width away from it.
      const pw = W * PANDA.w / 100, ph = pw * PANDA.ar;
      const tx = W * PANDA.x / 100, tb = anchor + BAND_H * PANDA.y / 100 * bandScale;
      const ty = settle("panda-walking", tx, tb, pw, ph, tx > W / 2, b === 0 ? 0 : c.gap * .5, b === 0)
              ?? settle("panda-walking", tx, tb, pw, ph, tx > W / 2, c.gap * .5);
      if (ty !== null) addPanda(tx, ty);
      else for (const k of [1, 3, 0, 2, 4]) {
        const i = first + k;
        if (i >= items.length) continue;
        const side = nodeX(i) < W / 2 ? 1 : -1;
        const edge = nodeX(i) + side * c.size * STONE_RATIO / 2;
        let cx = edge + side * (c.size * .9 + pw / 2);
        cx = Math.max(pw / 2 + 4, Math.min(W - pw / 2 - 4, cx));
        if (Math.abs(cx - edge) - pw / 2 < c.size * .4) continue;      // too tight a fit
        const yb = settle("panda-walking", cx, ys[i] + c.size * 1.16, pw, ph, cx > W / 2, c.gap * .35);
        if (yb !== null) { addPanda(cx, yb); break; }
      }

      PATH_TEMPLATE.forEach((spec, k) => {
        const base = anchor + BAND_H * spec.y / 100 * bandScale;
        // The first band is the template as composed; after that each slot
        // rotates through its family, the two foliage slots out of step so a
        // band never shows the same piece twice.
        const fam = FAMILIES[spec.family];
        const art = b === 0 ? spec.art : fam[(b * 5 + k * 7) % fam.length];
        const a = ART[art];
        const slotRight = spec.x > 50;
        // Full size on the composed side, then mirrored, then a little smaller,
        // anywhere in the band. Off the edge as composed: the pieces were
        // drawn to bleed, and moving them inward is what causes the clutter.
        let cw, ch, cx, mirrored, flipped, y = null;
        if (b === 0) {                              // exactly as composed, if the stones allow
          cw = W * a.w / 100; ch = cw * a.ar; cx = W * spec.x / 100;
          mirrored = false; flipped = false;
          y = settle(art, cx, base, cw, ch, false, 0, true);
        }
        if (y === null) for (const scale of [1, .85, .72]) {
          cw = W * a.w / 100 * scale; ch = cw * a.ar;
          for (mirrored of [false, true]) {
            // The slot's outer edge stays where it was composed, so any piece
            // in it keeps the same overhang off the side of the screen.
            const full = W * spec.w / 100, x0 = W * spec.x / 100;
            const outer = slotRight ? x0 + full / 2 - cw / 2 : x0 - full / 2 + cw / 2;
            cx = mirrored ? W - outer : outer;
            const onRight = slotRight !== mirrored;
            flipped = a.side === "any" ? mirrored : (onRight !== (a.side === "right"));
            y = settle(art, cx, base, cw, ch, flipped, bandH * .6);
            if (y !== null) break;
          }
          if (y !== null) break;
        }
        if (y === null) return;                     // no room for it in this band
        const cl = el("div", { className: "pcluster" + (flipped ? " flip" : "") +
          (PATH_LIGHTS[art] ? "" : " nolight") });
        cl.style.width = cw + "px";
        cl.style.height = ch + "px";
        cl.style.backgroundImage = `var(--${art})`;
        const lit = PATH_LIGHTS[art];
        if (lit) {
          // The glow's box is 170% wide and 190% tall of the piece (see the CSS
          // inset), so the light's position has to be mapped into that box.
          const lx = flipped ? 100 - lit.x : lit.x;
          cl.style.setProperty("--lx", ((35 + lx) / 170 * 100).toFixed(1) + "%");
          cl.style.setProperty("--ly", ((45 + lit.y) / 190 * 100).toFixed(1) + "%");
        }
        place(cl, cx, y);
        claim(art, cx, y, cw, ch, flipped);
      });
    }

    items.forEach((it, i) => {
      const yy = ys[i], x = nodeX(i), id = it.lesson.id;
      const state = lessonDone(id) ? "done" : (id === curId ? "now" : "todo");
      // Lessons unlock in order: you can replay finished ones and play the
      // current one, but everything ahead is locked.
      const btn = el("button", { className: "pnode" + (state === "todo" ? " locked" : "") });
      btn.appendChild(coinMarkup(it.lesson, state, c.size));
      // Every node opens its sheet. A locked node's sheet offers the skip test,
      // so tapping ahead is a way to test out rather than a dead end.
      btn.addEventListener("click", () => openLessonSheet(id));
      place(btn, x, yy);

      if (it.chapter) {                    // banner sits in the lead-in gap above
        const pct = it.chapter.total ? Math.round(it.chapter.done / it.chapter.total * 100) : 0;
        const hd = el("div", { className: "pchapter" }, [
          el("div", { className: "u" }, `UNIT ${it.chapter.unit} · CHAPTER ${it.chapter.chNo}`),
          el("div", { className: "t" }, it.chapter.title),
          el("div", { className: "bar" }, el("i", { style: `width:${pct}%` })),
          el("div", { className: "n" }, `${it.chapter.done} / ${it.chapter.total} lessons`)
        ]);
        // Centre it in the gap it opened. `btn` (the button this banner labels)
        // is already in the DOM, so measure the START bubble's REAL overhang
        // rather than guessing it — a fixed constant was 11px too big and
        // re-skewed the gaps the moment progression put a bubble here. Measuring
        // also keeps the edge gaps equal for any banner or bubble height.
        const startEl = btn.querySelector(".start");
        let overhang = 0;
        if (startEl) {
          const bt = btn.getBoundingClientRect(), st = startEl.getBoundingClientRect();
          overhang = Math.max(0, bt.top - st.top);
        }
        const topOfNext = yy - c.size / 2 - overhang;
        const bottomOfPrev = i === 0 ? HUD_H : ys[i - 1] + c.size / 2;
        if (headerRight(i)) { hd.classList.add("right"); hd.style.right = "0"; }
        else hd.style.left = "0";
        hd.style.top = ((bottomOfPrev + topOfNext) / 2) + "px";
        wrap.appendChild(hd);
      }
    });

    // Land the path on your CURRENT lesson every render, so it opens where you
    // are — and, crucially, at a deterministic scroll position. Leaving the inner
    // scroll wherever it happened to be is what showed up as the whole path
    // "pushed up" after finishing a session.
    const scroller = $("#pathScroll");
    const curIdx = items.findIndex(it => it.lesson.id === curId);
    if (scroller && curIdx >= 0) {
      const curY = ys[curIdx];
      requestAnimationFrame(() => {
        const max = Math.max(0, wrap.offsetHeight - scroller.clientHeight);
        scroller.scrollTop = Math.min(max, Math.max(0, curY - scroller.clientHeight * 0.5));
      });
    }
  }
  // Home scenery parallax. Each layer carries its own drift, the share of the
  // scroll it climbs by: clouds barely move, the hills a little, the near
  // bush the most, so the view has depth. Nothing moves under reduced motion.
  (() => {
    const layers = [...document.querySelectorAll(".home-bg[data-drift]")];
    if (!layers.length) return;
    // Browsers with scroll-driven animations do this in CSS, on the compositor.
    if (window.CSS && CSS.supports && CSS.supports("animation-timeline: scroll()")) return;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
    let queued = false;
    const settle = () => {
      queued = false;
      const home = document.body.dataset.view === "home" && !calm.matches;
      layers.forEach(l => {
        l.style.transform = home ? `translate3d(0, ${(-window.scrollY * parseFloat(l.dataset.drift)).toFixed(1)}px, 0)` : "";
      });
    };
    window.addEventListener("scroll", () => { if (!queued) { queued = true; requestAnimationFrame(settle); } }, { passive: true });
    settle();
  })();

  // Re-lay when the window changes shape (positions are measured, not static).
  let pathResizeTimer = null;
  window.addEventListener("resize", () => {
    if (document.body.dataset.view !== "path") return;
    clearTimeout(pathResizeTimer);
    pathResizeTimer = setTimeout(renderPath, 120);
  });

  // Character size and nudge, settled in the stone editor against a 74px stone.
  const HERO = { size: 35, dy: -7.5 };
  const STONE_RATIO = 1.62;          // the stone artwork is wider than it is tall

  // Which of the five stone outlines a lesson gets. Hashing the id keeps it
  // stable, so a lesson always sits on the same stone.
  const stoneShape = id => {
    let h = 0;
    for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
    return h % 5;
  };

  // Lesson stones: the character is carved into the stone, and the stone's own
  // colour says whether the lesson is finished, current or still locked.
  function coinMarkup(lesson, state, size) {
    const node = el("div", { className: "coin " + state });
    const art = state === "todo" ? "locked" : state;
    node.style.width = Math.round(size * STONE_RATIO) + "px";
    node.style.height = size + "px";
    node.style.setProperty("--stone", `var(--st-${art}-${stoneShape(lesson.id)})`);
    node.style.setProperty("--hero-dy", (size * HERO.dy / 74).toFixed(2) + "px");
    node.style.setProperty("--hero-d", (size * HERO.size / 74 * 0.05).toFixed(2) + "px");

    const hero = el("div", { className: "hero" }, lessonHero(lesson));
    hero.style.fontSize = (size * HERO.size / 74).toFixed(1) + "px";
    node.appendChild(hero);
    if (state === "now") node.appendChild(el("div", { className: "start" }, "START"));
    return node;
  }


  function openLessonSheet(id) {
    const lesson = LESSONS.find(l => l.id === id);
    const pct = lessonPct(id), total = lessonCardCount(id), mastered = lessonMastered(id);
    // A completed lesson counts as studied even if its SRS was cleared/imported,
    // so a done coin never opens a "new lesson" sheet.
    const due = dueCountForLesson(id), studied = lessonStudied(id) || lessonDone(id);
    const sheet = $("#lessonSheet");
    const chip = (icoId, label, focus, wide) => {
      const c = el("div", { className: "lchip" + (wide ? " wide" : "") }, [
        el("span", { className: "em" }, licon(icoId, "licon-sm")), document.createTextNode(" " + label)
      ]);
      if (studied) c.addEventListener("click", () => { closeLessonSheet(); launchLesson(id, focus); });
      else c.appendChild(el("span", { className: "lk" }, icon("lock", 15)));
      return c;
    };
    const box = el("div", { className: "lsheet" });
    box.addEventListener("click", e => e.stopPropagation());
    const pose = pct >= 100 ? "panda-celebrate" : studied ? "panda-idle" : "panda-waving";
    box.appendChild(el("img", { className: "lsheet-mascot", src: `images/${pose}.png${ASSET_V}`, alt: "" }));
    box.appendChild(el("div", { className: "handle" }));
    box.appendChild(el("div", { className: "lhead" }, [
      el("div", { className: "lcoin" }, lessonHero(lesson)),
      el("div", { className: "lmeta" }, [
        el("div", { className: "k" }, lesson.title.split(" · ")[0].toUpperCase()),
        el("div", { className: "t" }, lesson.title.replace(/^.*?· /, "")),
        el("div", { className: "bar" }, el("i", { style: `width:${pct}%` })),
        el("div", { className: "m" }, studied ? `${mastered} / ${total} mastered${due ? ` · ${due} due` : ""}` : `new lesson · ${total} words`)
      ])
    ]));
    const locked = !lessonDone(id) && id !== currentLessonId();
    const study = el("button", { className: "lstudy" });
    if (locked) {
      // A locked lesson can't be studied directly — offer to test out to reach it.
      study.innerHTML = `<svg class="licon licon-sm"><use href="#i-target"/></svg> Take the skip test<small>pass to unlock this — and everything before it</small>`;
      study.addEventListener("click", () => { closeLessonSheet(); startPlacement(id); });
    } else {
      study.innerHTML = (studied ? "Study" : "Start studying") + "<small>mixed skills · spaced repetition</small>";
      study.addEventListener("click", () => { closeLessonSheet(); launchLesson(id, null); });
    }
    box.appendChild(study);
    if (LESSON_NOTES[id]) box.appendChild(el("div", { className: "lnote" }, [
      el("div", { className: "lnote-t" }, [licon("i-bulb", "licon-sm"), document.createTextNode(" " + LESSON_NOTES[id].title)]),
      el("div", { className: "lnote-b" }, LESSON_NOTES[id].body)
    ]));
    // Before a lesson is studied the focused-practice chips are all locked, so
    // showing six greyed-out rows is just dead height — keep the sheet short and
    // only reveal them once they actually work.
    if (studied) {
      box.appendChild(el("div", { className: "lsub" }, [document.createTextNode("OR PRACTISE ONE SKILL")]));
      box.appendChild(el("div", { className: "lchips" }, [
        chip("i-pencil", "Write", "write"),
        chip("i-languages", "Pinyin", "pinyin"),
        chip("i-headphones", "Listen", "listen"),
        chip("i-blocks", "Sentences", "sentence"),
        chip("i-check", "Quiz", "quiz"),
        chip("i-book", "Browse the words", "browse", true)
      ]));
    } else {
      box.appendChild(el("div", { className: "lsub" },
        [icon("lock", 15), document.createTextNode(locked
          ? "Reach this in order, or pass the skip test above"
          : "Finish a Study round to unlock focused practice")]));
    }
    // Scroll the sheet's CONTENT (not the mascot) so a tall sheet — a lesson with
    // a note plus six skill chips — never clips on a phone with a home indicator.
    const inner = el("div", { className: "lsheet-inner" });
    [...box.children].forEach(ch => { if (!ch.classList.contains("lsheet-mascot")) inner.appendChild(ch); });
    box.appendChild(inner);
    sheet.innerHTML = "";
    sheet.appendChild(box);
    sheet.classList.remove("hidden");
  }
  function closeLessonSheet() { $("#lessonSheet").classList.add("hidden"); }
  $("#lessonSheet").addEventListener("click", closeLessonSheet);

  // Launch a lesson in the chosen way (null focus = mixed study).
  function launchLesson(id, focus) {
    if (!lessonDone(id) && id !== currentLessonId()) return;   // locked — play in order
    reviewMode = false;
    scopeLessons = new Set([id]);
    if (focus === "quiz") { scopeFocuses = null; startQuiz(); }
    else if (focus === "browse") { scopeFocuses = null; startBrowse(); }
    else if (focus) { scopeFocuses = new Set([focus]); startStudy(); }
    else { scopeFocuses = new Set(selectedFocuses); startStudy(); }   // mixed = user's chosen skills
  }

  // Bottom nav
  document.querySelectorAll(".bottomnav button").forEach(b =>
    b.addEventListener("click", () => {
      const nav = b.dataset.nav;
      if (nav === "settings") { syncSettings(); renderAccount(); openModal("settingsModal"); return; }
      // (highlight is synced by show() itself)
      if (nav === "home") { renderHome(); show("home"); }
      else if (nav === "path") { show("path"); renderPath(); }
      else if (nav === "progress") { renderDashboard(); show("progress"); }
    }));
  $("#reviewFab").addEventListener("click", () => { if (!$("#reviewFab").classList.contains("caughtup")) startReview(); });
  $("#pathSettings").addEventListener("click", () => { syncSettings(); renderAccount(); openModal("settingsModal"); });
  // Tapping the daily-goal ring jumps to Progress, where the full ring + streak live.
  $("#pathGoal").addEventListener("click", () => { renderDashboard(); show("progress"); });

  let queue = [];        // array of card objects
  let studyStats = { reviewed: 0, again: 0 };

  /* ---- Sentence pool (for the word-tile builder) ---------------------- */
  // The dialogue pinyin is grouped by word ("nǐ jiào shénme míngzi"), so counting
  // the syllables in each pinyin token tells us how many hanzi it covers — that
  // gives a proper word segmentation to build tiles from.
  const PY_VOWELS = "aeiouüāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ";
  function syllableCount(token) {
    let n = 0, inVowel = false;
    for (const ch of token.toLowerCase()) {
      const isV = PY_VOWELS.includes(ch);
      if (isV && !inVowel) n++;
      inVowel = isV;
    }
    return Math.max(1, n);
  }
  const CJK_ONE = /[一-鿿]/;
  function segmentSentence(hanzi, pinyin) {
    const chars = [...hanzi].filter(c => CJK_ONE.test(c));
    const tokens = pinyin.split(/\s+/).map(t => t.replace(/[,.!?;:，。！？]/g, "")).filter(Boolean);
    const words = [];
    let i = 0;
    for (const tok of tokens) {
      const w = chars.slice(i, i + syllableCount(tok)).join("");
      if (!w) break;
      words.push({ hanzi: w, pinyin: tok });
      i += syllableCount(tok);
    }
    // Only trust the split if it consumed every character and gives ≥2 tiles.
    return (i === chars.length && words.length >= 2) ? words : null;
  }
  const SENTENCES = [];
  (window.DIALOGUES || []).forEach(d => (d.turns || []).forEach(t => {
    const words = segmentSentence(t.hanzi, t.pinyin);
    if (words) SENTENCES.push({ hanzi: t.hanzi, pinyin: t.pinyin, en: t.en, words, alt: t.alt || [] });
  }));

  /* ---- Other word orders that are also right ---------------------------
     Chinese lets a time word sit before or after the subject (明天我要… and
     我明天要… are both fine), so a sentence built the other way round must not
     be marked wrong. Each sentence yields every order it accepts: the stored
     one, the subject/time swap when it opens that way, and any alternatives
     written into the dialogue data as `alt` (which must use the same words). */
  const SUBJECTS = new Set(["我", "你", "他", "她", "它", "我们", "你们", "他们", "她们", "咱们", "您"]);
  const isTimeWord = w => /^(今|明|昨|后|前)(天|年)$/.test(w) || /^(早|晚|上|中|下)(上|午)$/.test(w)
    || /^(星期|周)/.test(w) || ["现在", "周末", "每天", "每年", "平时", "以后", "以前", "刚才"].includes(w);
  function acceptedOrders(sent) {
    const base = sent.words.map(w => w.hanzi);
    const orders = [base];
    const add = seq => { if (!orders.some(o => o.join("") === seq.join(""))) orders.push(seq); };
    const [a, b] = base;
    if (base.length > 2 && ((SUBJECTS.has(a) && isTimeWord(b)) || (isTimeWord(a) && SUBJECTS.has(b))))
      add([b, a, ...base.slice(2)]);
    // Alternatives from the data: split each on the sentence's own words.
    const vocab = [...new Set(base)].sort((x, y) => y.length - x.length);
    (sent.alt || []).forEach(h => {
      const chars = [...h].filter(c => CJK_ONE.test(c)).join("");
      const seq = [];
      let i = 0;
      while (i < chars.length) {
        const w = vocab.find(v => chars.startsWith(v, i));
        if (!w) return;
        seq.push(w); i += w.length;
      }
      if (seq.length === base.length && [...seq].sort().join() === [...base].sort().join()) add(seq);
    });
    return orders;
  }
  // The stored pinyin, re-ordered to follow a different word order.
  function pinyinFor(sent, order) {
    const py = {};
    sent.words.forEach(w => { py[w.hanzi] = w.pinyin; });
    return order.map(w => py[w] || "").join(" ");
  }
  const tailPunct = h => (/[。？！]$/.test(h) ? h.slice(-1) : "");
  const enWords = s => s.replace(/[.!?,;:]+/g, "").split(/\s+/).filter(Boolean);
  const sentencesFor = card => SENTENCES.filter(s => s.hanzi.includes(card.hanzi));

  function pickDirection(card) {
    const focusSet = scopeFocuses || selectedFocuses;
    let enabled = FOCUSES.filter(f => focusSet.has(f.key)).map(f => f.key);
    // "write" only makes sense when we have stroke data for the whole word.
    if (card && !(HW_OK && wordWritable(card.hanzi))) enabled = enabled.filter(k => k !== "write");
    // "sentence" only when this word actually appears in a dialogue sentence.
    if (card && !sentencesFor(card).length) enabled = enabled.filter(k => k !== "sentence");
    // Ease beginners in: on a word you've never got right yet, hold back the
    // demanding output skills (writing, speaking) in a MIXED session — you meet
    // it through recognition first, and write/speak join in once it has landed.
    // A single-skill practice (you chose "Write"/"Speak") is always honoured.
    if (card && (scopeFocuses || selectedFocuses).size > 1) {
      const reps = srs[card.id] ? srs[card.id].reps : 0;
      if (reps < 1) {
        const eased = enabled.filter(k => k !== "write" && k !== "speak");
        if (eased.length) enabled = eased;
      }
    }
    if (enabled.length === 0) enabled = ["recognize"];
    return enabled[Math.floor(Math.random() * enabled.length)];
  }

  function buildStudyQueue() {
    const focusSet = scopeFocuses || selectedFocuses;
    let cards = activeCards();
    // A sentence-only session only makes sense for words that appear in one.
    if (focusSet.size === 1 && focusSet.has("sentence")) {
      const withSent = cards.filter(c => sentencesFor(c).length);
      if (withSent.length) cards = withSent;
    }
    const due = cards.filter(c => { const s = srs[c.id]; return !s || s.due <= NOW(); });
    // If nothing is due, review everything (a manual refresher session).
    const pool = due.length ? due : cards;
    const q = shuffle(pool);
    // Keep a round digestible: a long lesson (e.g. Numbers, 30) comes in even
    // batches rather than one forced march. Split into halves, so there's never
    // an awkward one-word leftover round; the rest is picked up next time.
    return pool.length > SESSION_CAP ? q.slice(0, Math.ceil(pool.length / 2)) : q;
  }

  let sessionTotal = 0;
  let studySource = [];       // the unique cards this session was built from (for "Practice again")
  let clearedIds = new Set(); // cards answered correctly (a card is "cleared" once right)
  let studyAnswered = false;  // has the current card been answered yet?

  // Start (or restart) a study session over a given set of cards.
  function beginStudySession(cards) {
    studySource = cards.slice();
    queue = shuffle(cards.slice());
    clearedIds = new Set();
    studyStats = { answered: 0, again: 0, learned: 0 };
    sessionTotal = queue.length;
    $("#studyTitle").textContent = "Study";
    show("study");
    updateStudyProgress();
    // Teach before test: if this session introduces words the learner has never
    // seen, MEET them first (character + pinyin + meaning + audio) before any quiz.
    const fresh = queue.filter(c => !srs[c.id]);
    if (fresh.length) {
      const order = new Map(CARDS.map((c, i) => [c.id, i]));
      fresh.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
      meetNewWords(fresh, () => nextStudyCard());
    } else {
      nextStudyCard();
    }
  }
  function startStudy() { beginStudySession(buildStudyQueue()); }

  // "Meet the new words" preview — shown once per session, before the first quiz
  // card, whenever the session brings in words never studied before. Beginners
  // get to SEE and HEAR a word before being asked to recall it.
  function meetNewWords(cards, done) {
    curCard = null; studyAnswered = true;
    $("#promptLabel").textContent = "New words";
    $("#studyChoices").classList.add("hidden");
    $("#studyContinueWrap").classList.add("hidden");
    $("#studyReveal").classList.add("hidden");
    $("#studyNext").classList.add("hidden");
    // Cap the preview so a large mixed session never dumps a wall of words to
    // "meet" — you'll still meet the rest as they first come up in practice.
    const MAX_MEET = 15;
    const shown = cards.slice(0, MAX_MEET);
    const more = cards.length - shown.length;
    const face = $("#studyFace");
    face.innerHTML = "";
    face.style.justifyContent = "flex-start";
    face.appendChild(el("div", { className: "meet-intro" },
      shown.length === 1
        ? "Here's a new word — tap the speaker to hear it, then practise."
        : `Here ${more > 0 ? "are your first" : "are these"} ${shown.length} new words — tap each speaker to hear it` +
          (more > 0 ? `, then practise (${more} more along the way).` : ", then practise.")));
    // If every new word is from one lesson and it has a pattern note, teach it here.
    const lid = cards.length && cards.every(c => c.lessonId === cards[0].lessonId) ? cards[0].lessonId : null;
    const note = lid && LESSON_NOTES[lid];
    if (note) face.appendChild(el("div", { className: "lnote" }, [
      el("div", { className: "lnote-t" }, [licon("i-bulb", "licon-sm"), document.createTextNode(" " + note.title)]),
      el("div", { className: "lnote-b" }, note.body)
    ]));
    const list = el("div", { className: "meet-list" });
    shown.forEach(c => {
      const row = el("div", { className: "meet-row" });
      row.append(
        el("div", { className: "meet-hz" }, c.hanzi),
        el("div", { className: "meet-info" }, [
          el("div", { className: "meet-py" }, prettyPinyin(c.pinyin)),
          el("div", { className: "meet-en" }, c.en)
        ]),
        speakerBtn(c.hanzi)
      );
      list.appendChild(row);
    });
    face.appendChild(list);
    const start = el("button", { className: "study-start", type: "button" }, "Start practising →");
    start.addEventListener("click", done);
    face.appendChild(start);
  }

  let curCard = null, curDir = null;

  function nextStudyCard() {
    if (queue.length === 0) return finishStudy();
    curCard = queue.shift();
    curDir = pickDirection(curCard);
    studyAnswered = false;
    renderStudyCard();
  }

  function updateStudyProgress() {
    $("#studyBar").style.width = `${(clearedIds.size / Math.max(sessionTotal, 1)) * 100}%`;
    $("#studyCounter").textContent = `${clearedIds.size} / ${sessionTotal}`;
  }

  // Record the outcome of the current card: correct = cleared & advances the SRS;
  // wrong = shown the answer, SRS reset, and requeued to come back later this session.
  function answerStudy(correct) {
    if (studyAnswered) return;
    studyAnswered = true;
    sfx(correct ? "correct" : "wrong");
    const wasNew = !srs[curCard.id];
    schedule(curCard.id, correct ? "good" : "again");
    // "Mastered" requires you to have PRODUCED the word, not just recognised it:
    // mark a production pass when you get a recall / write / speak card right.
    if (correct && srs[curCard.id] && PRODUCTION_DIRS.has(curDir)) {
      srs[curCard.id].prod = true;
      saveSRS(srs);
    }
    recordReview(1);
    studyStats.answered += 1;
    if (correct) {
      if (!clearedIds.has(curCard.id)) { clearedIds.add(curCard.id); if (wasNew) studyStats.learned += 1; }
    } else {
      studyStats.again += 1;
      queue.push(curCard);   // comes back later this session
    }
    updateStudyProgress();
  }

  const DIR_LABEL = {
    recognize: "Character → meaning",
    recall: "English → characters",
    pinyin: "Read the pinyin",
    listen: "Listen",
    write: "Trace, then write it",
    speak: "Say it out loud"
  };
  // Locks/unlocks the advance buttons (write mode until it's written, sentence
  // mode until at least one tile is placed).
  function setWriteGate(enabled) {
    $("#studyNext").disabled = !enabled;
    $("#studyContinue").disabled = !enabled;
  }
  function setContinueLabel(txt) { $("#studyContinue").firstChild.textContent = txt + " "; }
  // When set, the pinned button checks the answer first instead of advancing.
  let studyCheckFn = null;

  let writeWriters = [];   // active Hanzi Writer instances in study "write" mode
  let writeInk = null;     // freehand tracing canvas for the write copybook
  let writeCharIdx = 0;    // phone: which character of the word we're on
  let writeNextFn = null;  // phone: advances to the next character (pinned button)
  const isPhone = () => window.matchMedia("(max-width: 560px)").matches;

  // Build a mascot + prompt bubble into `face`; returns the bubble to fill.
  // Chat-style: one squared corner toward the dragon (no fragile pointy tail).
  function mascotSpeech(face, src) {
    const speech = el("div", { className: "mascot-prompt" });
    speech.appendChild(el("img", { className: "quiz-dragon", src: src || "images/path/panda-teacher.webp?v=193", alt: "" }));
    const bubble = el("div", { className: "q-bubble" });
    speech.appendChild(bubble);
    face.appendChild(speech);
    return bubble;
  }

  // Duolingo-style sentence builder: tap word tiles to assemble the translation.
  // Two directions, picked at random:
  //   cn2en - bubble shows the 汉字 (+audio), tiles are English words
  //   en2cn - bubble shows the English, tiles are 汉字 with pinyin underneath
  // Sets studyCheckFn so the pinned button acts as "Check" then "Continue".
  function buildSentenceExercise(face, host, sent, labelEl, onResult) {
    // Translating to English needs ≥2 English words, or it's a 1-tile giveaway
    // (e.g. 再见！→ "Goodbye!"); fall back to building the Chinese instead.
    const en2cn = enWords(sent.en).length < 2 || Math.random() < 0.5;
    face.innerHTML = "";
    face.classList.add("sent");
    host.innerHTML = "";
    host.classList.add("sentence-mode");
    $("#studyContinueWrap").classList.add("wide");
    const bubble = mascotSpeech(face);

    let target, tiles, answerDisplay;
    bubble.classList.add("sent");
    if (en2cn) {
      labelEl.textContent = "Build the Chinese";
      bubble.appendChild(el("div", { className: "en" }, sent.en));
      target = sent.words.map(w => w.hanzi);
      tiles = sent.words.map(w => ({ val: w.hanzi, hanzi: w.hanzi, pinyin: w.pinyin }));
      answerDisplay = sent.hanzi;
      const pool = SENTENCES.filter(s => s !== sent).flatMap(s => s.words)
        .filter(w => !target.includes(w.hanzi));
      sample(pool, 3).forEach(w => tiles.push({ val: w.hanzi, hanzi: w.hanzi, pinyin: w.pinyin }));
    } else {
      labelEl.textContent = "Translate this sentence";
      // The sentence reads across the bubble, each word with its pinyin above.
      // With pinyin turned off the readings stay hidden until the bubble is tapped.
      bubble.appendChild(speakerBtn(sent.hanzi));
      sent.words.forEach(w => bubble.appendChild(el("span", { className: "sw" }, [
        el("span", { className: "py" }, prettyPinyin(w.pinyin)),
        el("span", { className: "hz" }, w.hanzi)
      ])));
      const tail = sent.hanzi.slice(-1);
      if (/[。？！，、]/.test(tail)) bubble.appendChild(el("span", { className: "sw punct" }, [
        el("span", { className: "py" }, ""), el("span", { className: "hz" }, tail)
      ]));
      if (!showPinyin()) {
        bubble.classList.add("nopy");
        bubble.addEventListener("click", () => bubble.classList.remove("nopy"), { once: true });
      }
      target = enWords(sent.en);
      tiles = target.map(w => ({ val: w, text: w }));
      answerDisplay = sent.en;
      const pool = SENTENCES.filter(s => s !== sent).flatMap(s => enWords(s.en))
        .filter(w => !target.includes(w));
      sample([...new Set(pool)], 3).forEach(w => tiles.push({ val: w, text: w }));
    }

    const answer = el("div", { className: "sent-answer " + (en2cn ? "han" : "txt") });
    const bank = el("div", { className: "sent-bank" });
    host.append(answer, bank);

    // A tile slides from where it was to where it lands; its bank slot stays
    // behind as a ghost so nothing else shuffles about.
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const glide = (tile, to) => {
      const a = tile.getBoundingClientRect();
      to.appendChild(tile);
      if (calm) return;
      const b = tile.getBoundingClientRect();
      const dx = a.left - b.left, dy = a.top - b.top;
      if (!dx && !dy) return;
      // Start it where it was, force that to lay out, then let it travel. A
      // forced reflow rather than a frame callback, so a hidden tab (which
      // never gets frames) still ends with the tile where it belongs.
      tile.style.transition = "none";
      tile.style.transform = `translate(${dx}px, ${dy}px)`;
      void tile.offsetWidth;
      tile.style.transition = "transform .22s cubic-bezier(.2,.8,.3,1)";
      tile.style.transform = "";
      tile.addEventListener("transitionend", () => { tile.style.transition = ""; }, { once: true });
    };
    const placed = () => [...answer.querySelectorAll(".tile")];
    const refreshGate = () => setWriteGate(placed().length > 0);
    shuffle(tiles).forEach(item => {
      const t = el("button", { className: "tile" });
      t.dataset.val = item.val;
      if (item.pinyin) {
        t.appendChild(el("span", { className: "t-han" }, item.hanzi));
        t.appendChild(el("span", { className: "t-py" }, prettyPinyin(item.pinyin)));
      } else t.textContent = item.text;
      const slot = el("div", { className: "slot" });
      slot.appendChild(t);
      bank.appendChild(slot);
      t.addEventListener("click", () => {
        if (studyAnswered) return;
        if (t.parentElement === slot) {
          // The ghost takes the tile's painted size, read from the slot itself
          // (which is exactly the tile) so no pressed or stretched state leaks in.
          const r = slot.getBoundingClientRect();
          slot.style.width = r.width.toFixed(1) + "px"; slot.style.height = r.height.toFixed(1) + "px";
          slot.classList.add("empty");
          const cell = el("div", { className: "cell" });
          answer.appendChild(cell);
          glide(t, cell);
        } else {
          const cell = t.parentElement;
          slot.classList.remove("empty");
          glide(t, slot);
          cell.remove();
        }
        refreshGate();
      });
    });
    refreshGate();
    setContinueLabel("Check");

    studyCheckFn = () => {
      const got = placed().map(t => t.dataset.val);
      const same = (x, y) => x.length === y.length && x.every((v, i) => v === y[i]);
      // Building the Chinese: any accepted word order counts, not only the stored one.
      const orders = en2cn ? acceptedOrders(sent) : [target];
      const hit = orders.find(o => same(got, o));
      const correct = !!hit;
      answer.classList.add(correct ? "ok" : "bad");
      host.querySelectorAll(".tile").forEach(t => t.disabled = true);
      // Feedback sits under the bank, never on the mascot.
      const fb = el("div", { className: "sent-fb " + (correct ? "ok" : "bad") });
      fb.innerHTML = `<svg class="licon"><use href="#${correct ? "i-tick" : "i-x"}"/></svg>`;
      const body = el("div");
      body.appendChild(el("div", { className: "fb-t" }, correct ? "Nicely done!" : "Correct solution:"));
      if (!correct) {
        body.appendChild(el("div", { className: "fb-a" }, answerDisplay));
        if (en2cn) body.appendChild(el("div", { className: "fb-py" }, prettyPinyin(sent.pinyin)));
      }
      // Show the other orders that would also have been right, so a swap
      // learnt one way is seen the other way too.
      const shown = !en2cn ? [] : correct ? orders.filter(o => o !== hit) : orders.slice(1);
      if (shown.length) {
        body.appendChild(el("div", { className: "fb-also" }, correct ? "Also correct:" : "Also accepted:"));
        shown.forEach(o => {
          body.appendChild(el("div", { className: "fb-a" }, o.join("") + tailPunct(sent.hanzi)));
          body.appendChild(el("div", { className: "fb-py" }, prettyPinyin(pinyinFor(sent, o))));
        });
      }
      fb.appendChild(body);
      // The result rides with the Continue button, pinned at the bottom, so it
      // is always in view however long the word bank is.
      const wrapEl = $("#studyContinueWrap");
      wrapEl.insertBefore(fb, wrapEl.firstChild);
      const drg = face.querySelector(".quiz-dragon");
      if (drg) { drg.src = correct ? "images/path/panda-celebrate.webp?v=193" : "images/path/panda-sad.webp?v=193"; drg.classList.add("react"); }
      onResult(correct);
      setContinueLabel("Continue");
      setWriteGate(true);
    };
  }

  // Objective multiple-choice exercise (Duolingo-style). Builds the mascot prompt
  // into `face` and answer buttons into `choicesBox`; the dragon reacts and the
  // correct answer is revealed on a wrong pick. Calls onResult(correct) once.
  // Shared by Study and Quiz.
  // ---- Tone-aware distractors -----------------------------------------
  // Same base letters, different tone marks — so the "pinyin" drill actually
  // tests tone instead of letting you pick the answer by its consonants/vowels.
  const TONE_VOWELS = {
    a: ["ā", "á", "ǎ", "à"], e: ["ē", "é", "ě", "è"], i: ["ī", "í", "ǐ", "ì"],
    o: ["ō", "ó", "ǒ", "ò"], u: ["ū", "ú", "ǔ", "ù"], "ü": ["ǖ", "ǘ", "ǚ", "ǜ"]
  };
  const TONE_DECODE = {};   // toned char -> [baseVowel, toneIndex 0..3]
  Object.entries(TONE_VOWELS).forEach(([base, arr]) =>
    arr.forEach((ch, i) => { TONE_DECODE[ch] = [base, i]; }));
  const tonelessPinyin = py => [...(py || "")].map(ch => TONE_DECODE[ch] ? TONE_DECODE[ch][0] : ch).join("");

  // ---- Readable pinyin ---------------------------------------------------
  // The data joins syllables within a word ("láizì") — standard orthography, and
  // it drives the word-level sentence tiles. But joined compounds are hard for a
  // beginner to read, so for DISPLAY we split them back into syllables ("lái zì").
  // Display-only: the data (and the tile grouping) is never touched. Validated to
  // round-trip exactly on every pinyin string in the app; anything it can't
  // segment is left exactly as-is.
  const PY_SYL = (() => {
    const initials = ["","b","p","m","f","d","t","n","l","g","k","h","j","q","x","zh","ch","sh","r","z","c","s","y","w"];
    const finals = ["a","o","e","ê","ai","ei","ao","ou","an","en","ang","eng","ong","er",
      "i","ia","ie","iao","iu","ian","in","iang","ing","iong",
      "u","ua","uo","uai","ui","uan","un","uang","ueng",
      "ü","üe","üan","ün","v","ve","van","vn"];
    const set = new Set();
    for (const ini of initials) for (const fin of finals) set.add(ini + fin);
    ["a","o","e","ê","ai","ei","ao","ou","an","en","ang","eng","er","yi","wu","yu","ye","yue","yuan","yun","yin","ying",
     "n","ng","m","hm","hng","lo","yo","ju","qu","xu","jue","xue","que","juan","xuan","quan","jun","xun","qun",
     "nü","nüe","lü","lüe","nv","nve","lv","lve"].forEach(s => set.add(s));
    return set;
  })();
  const PY_TONE_BASE = { "ā":"a","á":"a","ǎ":"a","à":"a","ē":"e","é":"e","ě":"e","è":"e",
    "ī":"i","í":"i","ǐ":"i","ì":"i","ō":"o","ó":"o","ǒ":"o","ò":"o","ū":"u","ú":"u","ǔ":"u","ù":"u",
    "ǖ":"ü","ǘ":"ü","ǚ":"ü","ǜ":"ü","ń":"n","ň":"n","ǹ":"n" };
  function splitPySyllables(run) {
    const base = [...run].map(ch => PY_TONE_BASE[ch] || ch).join("").toLowerCase();
    const n = base.length, cuts = [0];
    let i = 0;
    while (i < n) {
      let matched = 0;
      for (let len = Math.min(6, n - i); len >= 1; len--) {
        if (PY_SYL.has(base.slice(i, i + len))) { matched = len; break; }
      }
      if (!matched) return null;              // can't segment — caller keeps original
      i += matched; cuts.push(i);
    }
    const chars = [...run], parts = [];
    for (let k = 0; k < cuts.length - 1; k++) parts.push(chars.slice(cuts[k], cuts[k + 1]).join(""));
    return parts;
  }
  function prettyPinyin(s) {
    if (!s) return s;
    return String(s).replace(/[A-Za-zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜüńňǹ]+/g, run => {
      if (/^[A-Z]/.test(run)) return run;      // proper nouns (Dàwèi) — leave alone
      const parts = splitPySyllables(run);
      return parts ? parts.join(" ") : run;
    });
  }
  function toneVariants(py, n) {
    const chars = [...py];
    const marks = [];
    chars.forEach((ch, i) => { if (TONE_DECODE[ch]) marks.push(i); });
    if (!marks.length) return [];               // all-neutral word (ma, de…): can't retone
    const out = new Set();
    let guard = 0;
    while (out.size < n && guard++ < 60) {
      const arr = chars.slice();
      const k = 1 + Math.floor(Math.random() * Math.min(2, marks.length));
      shuffle(marks.slice()).slice(0, k).forEach(idx => {
        const [base, tone] = TONE_DECODE[chars[idx]];
        let t2 = tone; while (t2 === tone) t2 = Math.floor(Math.random() * 4);
        arr[idx] = TONE_VOWELS[base][t2];
      });
      const v = arr.join("");
      if (v !== py) out.add(v);
    }
    return [...out].slice(0, n);
  }

  function buildChoiceExercise(face, choicesBox, c, dir, labelEl, onResult) {
    face.innerHTML = "";
    choicesBox.classList.remove("sentence-mode");
    const bubble = mascotSpeech(face);
    let promptNode, answerText, distractField;
    if (dir === "recall") {
      labelEl.textContent = "Which characters mean this?";
      promptNode = el("div", { className: "en" }, c.en);
      answerText = c.hanzi; distractField = "hanzi";
    } else if (dir === "pinyin") {
      labelEl.textContent = "Which pinyin is correct?";
      promptNode = el("div", { className: "hanzi" + (c.hanzi.length > 3 ? " small" : "") }, c.hanzi);
      answerText = c.pinyin; distractField = "pinyin";
      // First time you meet the tone drill, introduce the tones themselves.
      try {
        if (!localStorage.getItem("zhBeginnerA.tonesSeen.v1")) {
          localStorage.setItem("zhBeginnerA.tonesSeen.v1", "1");
          setTimeout(openTones, 350);
        }
      } catch (e) {}
    } else if (dir === "listen") {
      labelEl.textContent = "What did you hear?";
      // Tappable, so a missed auto-play (voice still loading, synth stuck) is always
      // recoverable — tap the headphones to hear it again.
      promptNode = el("button", { className: "hanzi listen-replay", type: "button", title: "Play again" }, "🎧");
      promptNode.addEventListener("click", () => speak(c.hanzi));
      answerText = c.en; distractField = "en";
      setTimeout(() => speak(c.hanzi), 60);   // let the card mount, then play
    } else {
      labelEl.textContent = "What does this mean?";
      promptNode = el("div", { className: "hanzi" + (c.hanzi.length > 3 ? " small" : "") }, c.hanzi);
      answerText = c.en; distractField = "en";
    }
    bubble.appendChild(promptNode);
    // The pinyin drill tests the pinyin, so it can't show the answer — but a bare
    // character is a blind guess, so give the English meaning as context.
    if (dir === "pinyin") bubble.appendChild(el("div", { className: "en", style: "font-size:1rem;margin-top:2px" }, c.en));
    if (dir !== "pinyin") bubble.appendChild(speakerBtn(c.hanzi));
    // Recall shows pinyin on the option tiles instead (below), so its prompt
    // pinyin hint would just give the answer away.
    if (dir !== "pinyin" && dir !== "listen" && !(dir === "recall" && showPinyin())) {
      face.appendChild(el("div", { className: "aids-row" }, pinyinHint(c.pinyin)));
    }
    if (dir === "pinyin") {
      const tl = el("button", { className: "tones-link", type: "button" });
      tl.innerHTML = `<svg class="licon licon-sm"><use href="#i-music"/></svg> What are tones?`;
      tl.addEventListener("click", openTones);
      face.appendChild(tl);
    }

    const cards = activeCards();
    let distractors;
    if (dir === "pinyin") {
      // Same syllables, different tones — a genuine tone-discrimination drill.
      distractors = toneVariants(answerText, 3);
      if (distractors.length < 3)
        distractors = distractors.concat(sample(
          [...new Set(cards.map(x => x.pinyin))].filter(v => v !== answerText && !distractors.includes(v)),
          3 - distractors.length));
    } else if (dir === "listen") {
      // Prefer true tone minimal-pairs (same letters, different tones) when the
      // vocab has any; otherwise fall back to random meanings.
      const target = tonelessPinyin(c.pinyin);
      const near = [...new Set(cards.filter(x => x.en !== answerText && tonelessPinyin(x.pinyin) === target).map(x => x.en))];
      distractors = sample(near, 3);
      if (distractors.length < 3)
        distractors = distractors.concat(sample(
          [...new Set(cards.map(x => x.en))].filter(v => v !== answerText && !distractors.includes(v)),
          3 - distractors.length));
    } else {
      distractors = sample([...new Set(cards.map(x => x[distractField]))].filter(v => v !== answerText), 3);
    }
    const options = shuffle([answerText, ...distractors]);
    choicesBox.innerHTML = "";
    choicesBox.dataset.answered = "";
    // Recall options are bare characters a beginner can't read — show pinyin
    // under each (when the aid is on) so the choice is legible, not a guess.
    const withTilePinyin = dir === "recall" && showPinyin();
    options.forEach(opt => {
      const btn = el("button", { className: "choice" + (withTilePinyin ? " choice-py" : "") });
      btn.dataset.val = opt;
      if (withTilePinyin) {
        btn.appendChild(el("span", { className: "c-han" }, opt));
        if (PINYIN_BY_HANZI[opt]) btn.appendChild(el("span", { className: "c-py" }, prettyPinyin(PINYIN_BY_HANZI[opt])));
      } else {
        // display prettified for the pinyin drill; the match still uses dataset.val
        btn.textContent = dir === "pinyin" ? prettyPinyin(opt) : opt;
      }
      btn.addEventListener("click", () => {
        if (choicesBox.dataset.answered) return;
        choicesBox.dataset.answered = "1";
        const correct = opt === answerText;
        const drg = face.querySelector(".quiz-dragon");
        if (correct) { btn.classList.add("correct"); if (drg) { drg.src = "images/path/panda-celebrate.webp?v=193"; drg.classList.add("react"); } }
        else {
          btn.classList.add("wrong");
          [...choicesBox.children].forEach(ch => { if (ch.dataset.val === answerText) ch.classList.add("correct"); });
          if (drg) { drg.src = "images/path/panda-sad.webp?v=193"; drg.classList.add("react"); }
        }
        onResult(correct);
      });
      choicesBox.appendChild(btn);
    });
  }

  function renderStudyCard() {
    $("#promptLabel").textContent = DIR_LABEL[curDir];
    const face = $("#studyFace");
    face.innerHTML = "";              // every mode starts from a clean face — the
    face.style.justifyContent = "";   // speak branch used to inherit the last card's
                                       // write grid, stacking two exercises on one page.
    // Reset all pinned controls; each mode re-shows what it needs.
    $("#studyContinueWrap").classList.add("hidden");
    $("#studyContinueWrap").classList.remove("wide");
    $("#studyContinueWrap").querySelectorAll(".sent-fb").forEach(n => n.remove());
    face.classList.remove("sent");
    $("#studyReveal").classList.add("hidden");
    $("#studyNext").classList.add("hidden");
    setWriteGate(true);   // only write/sentence modes lock these
    studyCheckFn = null;
    setContinueLabel("Continue");
    const choices = $("#studyChoices");
    choices.classList.remove("sentence-mode");
    const c = curCard;

    if (curDir === "write") {
      // Writing practice keeps its full-width grid; finishing it = correct.
      choices.classList.add("hidden"); choices.innerHTML = "";
      face.innerHTML = "";
      const chars = cjkOnly(c.hanzi);
      const checkOn = prefs.checkStrokes !== false;
      if (isPhone()) { writeCharIdx = 0; renderWritePhone(face, c, chars, checkOn); }
      else {
        // desktop keeps the fuller prompt above the grid
        face.appendChild(el("div", { className: "en" }, c.en));
        face.appendChild(el("div", { className: "pinyin" }, prettyPinyin(c.pinyin)));
        face.appendChild(aidsRow(c, { speaker: true }));
        renderWriteDesktop(face, chars, checkOn);
      }
    } else if (curDir === "speak") {
      choices.classList.add("hidden"); choices.innerHTML = "";
      /* Speech recognition is very poor on a single Chinese syllable — with no
         surrounding context the recogniser is guessing between dozens of
         homophones, which is why a correct 也 came back as 野. Give it a short
         PHRASE containing the word instead: more acoustic context makes
         recognition far more reliable, and practising the word in context is
         better learning anyway. Falls back to the bare word when we have no
         sentence for it. */
      const phrase = sentencesFor(c)
        .filter(s => { const n = cjkOnly(s.hanzi).length; return n >= 3 && n <= 12; })
        .sort((a, b) => cjkOnly(a.hanzi).length - cjkOnly(b.hanzi).length)[0] || null;
      const sayHanzi  = phrase ? phrase.hanzi  : c.hanzi;
      const sayPinyin = phrase ? phrase.pinyin : c.pinyin;
      const sayEn     = phrase ? phrase.en     : c.en;

      const bubble = mascotSpeech(face);
      bubble.appendChild(el("div", { className: "hanzi" + (sayHanzi.length > 3 ? " small" : "") }, sayHanzi));
      bubble.appendChild(speakerBtn(sayHanzi));
      face.appendChild(el("div", { className: "pinyin" }, prettyPinyin(sayPinyin)));
      face.appendChild(el("div", { className: "muted" }, sayEn));
      if (phrase) face.appendChild(el("div", { className: "muted", style: "font-size:.78rem" },
        `practising ${c.hanzi} — ${c.pinyin}`));
      const fb = el("div", { className: "speak-fb" });
      const settle = (correct, html) => {
        fb.innerHTML = html;
        const drg = face.querySelector(".quiz-dragon");
        if (drg) { drg.src = `images/${correct ? "panda-celebrate" : "panda-sad"}.png${ASSET_V}`; drg.classList.add("react"); }
        answerStudy(correct);
        setWriteGate(true);
      };
      if (canRecognize()) {
        const micLbl2 = `<svg class="licon licon-sm"><use href="#i-mic"/></svg> Tap and say it`;
        const mic = el("button", { className: "speak-btn", type: "button" });
        mic.innerHTML = micLbl2;
        let tries = 0;
        const MAX_TRIES = 2;   // recognition is stochastic — a second pass often lands
        mic.addEventListener("click", () => {
          if (studyAnswered) return;
          let gotResult = false;
          mic.disabled = true; mic.textContent = "● Listening…"; mic.classList.add("listening");
          fb.textContent = "";
          recognizeOnce({
            // live partial text so it visibly responds while you're still talking
            onInterim: alts => { if (!studyAnswered && alts[0])
              fb.innerHTML = `<span class="muted">…${alts[0]}</span>`; },
            // accept once a partial contains the whole phrase — don't wait for the
            // silence timeout, but don't cut off a prefix mid-phrase either.
            acceptEarly: alts => saidWhole(sayHanzi, alts),
            onResult: alts => {
              gotResult = true; tries++;
              const r = scoreSpeech(sayHanzi, alts, c.hanzi);
              if (r.level === "exact") settle(true, `<span class="ok">✓ Perfect</span>`);
              else if (r.level === "close") settle(true, `<span class="ok">✓ Got it</span> — heard “${r.heard}”`);
              else if (tries < MAX_TRIES)
                fb.innerHTML = `<span class="muted">Heard “${r.heard || "…"}” — give it one more go.</span>`;
              else settle(false, `<span class="bad">Not quite</span> — heard “${r.heard || "…"}”. It's <b>${sayHanzi}</b> (${sayPinyin}).`);
            },
            // a mic failure isn't a wrong answer — let them try again
            onError: err => { fb.innerHTML = err === "not-allowed"
              ? `<span class="bad">Allow microphone access to use this.</span>`
              : `<span class="muted">Didn't catch that — tap and try again.</span>`; },
            // the recogniser can end without ever returning a result (short words,
            // background noise); always leave a visible prompt, never a dead button.
            onEnd: () => { if (!studyAnswered) {
              mic.disabled = false; mic.innerHTML = micLbl2; mic.classList.remove("listening");
              if (!gotResult && !fb.textContent.trim())
                fb.innerHTML = `<span class="muted">Didn't catch that — tap and try again.</span>`;
            } }
          });
        });
        // Not being able to use the mic isn't a wrong answer — reveal it and
        // requeue it for later this session with no SRS penalty (parity with the
        // self-assessed iOS path, which also never marks you wrong here).
        const skip = el("button", { className: "hint-btn", type: "button" }, "Can't speak now");
        skip.addEventListener("click", () => {
          if (studyAnswered) return;
          studyAnswered = true;
          fb.innerHTML = `<span class="muted">No problem — it's <b>${c.hanzi}</b> (${c.pinyin}). We'll come back to it.</span>`;
          queue.push(curCard);   // returns later this session, not counted wrong
          updateStudyProgress();
          setWriteGate(true);
        });
        face.append(mic, fb, skip);
      } else {
        // iOS Safari has no speech recognition: keep the practice, self-assessed.
        face.appendChild(el("div", { className: "muted", style: "font-size:.8rem" },
          "This browser can't check speech — say it aloud, then mark yourself."));
        const said = el("button", { className: "speak-btn", type: "button" });
        said.innerHTML = `<svg class="licon licon-sm"><use href="#i-volume"/></svg> I said it`;
        said.addEventListener("click", () => { if (!studyAnswered) settle(true, `<span class="ok">✓ Nice</span>`); });
        face.append(said, fb);
      }
      setWriteGate(false);                       // locked until they attempt
      $("#studyContinueWrap").classList.remove("hidden");
    } else if (curDir === "sentence") {
      // Tap word tiles to assemble the sentence; the button checks, then advances.
      choices.classList.remove("hidden");
      const pool = sentencesFor(c);
      buildSentenceExercise(face, choices, pool[Math.floor(Math.random() * pool.length)],
        $("#promptLabel"), correct => answerStudy(correct));
      $("#studyContinueWrap").classList.remove("hidden");
    } else {
      // Objective multiple choice: mascot asks, you pick, it marks you.
      choices.classList.remove("hidden");
      buildChoiceExercise(face, choices, c, curDir, $("#promptLabel"), correct => {
        answerStudy(correct);
        $("#studyContinueWrap").classList.remove("hidden");
      });
    }
    updateStudyProgress();
  }

  // Animated red stroke-order reference box for one character (loops, tap-replay).
  function refAnimBox(ch, size) {
    const accent = getComputedStyle(document.body).getPropertyValue("--accent").trim() || "#2b776d";
    const box = el("div", { className: "tzg-cell", style: "cursor:pointer" });
    box.style.width = box.style.height = size + "px";
    const w = makeWriter(box, ch, { width: size, height: size, showCharacter: true, strokeColor: accent });
    box.addEventListener("click", () => w.animateCharacter());
    let n = 0;
    const play = () => w.animateCharacter({ onComplete: () => { if (++n < 2) setTimeout(play, 500); } });
    w.hideCharacter(); play();
    return box;
  }

  // Desktop/tablet: all characters in a grid on one page.
  function renderWriteDesktop(face, chars, checkOn) {
    const avail = (face.clientWidth || 340) - 4;
    const refSize = Math.max(56, Math.min(96, Math.floor((avail - (chars.length - 1) * 12) / chars.length)));
    const refRow = el("div", { className: "writing-inline", style: "gap:12px" });
    face.appendChild(refRow);
    chars.forEach(ch => refRow.appendChild(hasStrokes(ch) ? refAnimBox(ch, refSize) : el("div", { className: "hanzi" }, ch)));
    face.appendChild(el("div", { className: "muted", style: "font-size:.78rem" }, "stroke order — tap a character to replay"));

    const cols = chars.length === 1 ? (checkOn ? 3 : 4) : chars.length;
    const cell = checkOn
      ? Math.max(62, Math.min(112, Math.floor(avail / cols)))
      : Math.max(50, Math.min(88, Math.floor(avail / cols)));
    setWriteGate(!checkOn);   // stroke-check mode stays locked until it's written
    if (checkOn) {
      face.appendChild(el("div", { className: "muted", style: "margin-top:8px" },
        "write each character once to continue — wrong strokes won’t register; a hint appears after 2 misses"));
      buildCheckGrid(face, chars, { rows: 2, cols, cell, onAllDone: () => setWriteGate(true) });
    } else {
      face.appendChild(el("div", { className: "muted", style: "margin-top:8px" },
        "trace each row — the guide fades; the last row is from memory"));
      writeInk = buildCopybook(face, chars, { rows: 4, cols, cell });
      face.appendChild(el("div", { className: "writing-inline", style: "gap:8px;margin-top:10px" }, [
        (() => { const b = el("button", { className: "ghost" }, "Undo ↶"); b.addEventListener("click", () => writeInk && writeInk.undo()); return b; })(),
        (() => { const b = el("button", { className: "ghost" }, "Clear ✕"); b.addEventListener("click", () => writeInk && writeInk.clear()); return b; })()
      ]));
    }
    $("#studyReveal").classList.add("hidden");
    $("#studyNext").classList.add("hidden");
    $("#studyContinueWrap").classList.remove("hidden");
  }

  // Phone: ONE big writing box that dominates the screen (Duolingo-style),
  // paged with a pinned "Next character →". Minimal chrome around the box.
  function renderWritePhone(face, c, chars, checkOn) {
    face.style.justifyContent = "flex-start";
    const pageWrap = el("div", { style: "width:100%;display:flex;flex-direction:column;align-items:center;gap:10px" });
    face.appendChild(pageWrap);
    const renderPage = () => {
      pageWrap.innerHTML = "";
      const ch = chars[writeCharIdx];
      const N = chars.length, last = writeCharIdx === N - 1;

      // Compact one-line header: small animated stroke-order + prompt + audio.
      const header = el("div", { className: "write-head" });
      if (hasStrokes(ch)) header.appendChild(refAnimBox(ch, 50));
      header.appendChild(el("div", { className: "wh-txt" }, [
        el("div", { className: "pinyin", style: "font-size:1.15rem;line-height:1.15" }, prettyPinyin(c.pinyin)),
        el("div", { className: "muted", style: "font-size:.9rem" }, c.en + (N > 1 ? `  ·  ${writeCharIdx + 1}/${N}` : ""))
      ]));
      header.appendChild(speakerBtn(c.hanzi));
      pageWrap.appendChild(header);

      // Each page must be written before its advance button unlocks.
      setWriteGate(!(checkOn && hasStrokes(ch)));
      if (hasStrokes(ch)) {
        // The box fills the on-screen space between the header and the controls.
        const gap = face.getBoundingClientRect().bottom - header.getBoundingClientRect().bottom - 62;
        const box = Math.max(180, Math.min((face.clientWidth || 340) - 8, gap, 460));
        if (checkOn) {
          buildCheckGrid(pageWrap, [ch], { rows: 1, cols: 1, cell: box, tight: true, onAllDone: () => setWriteGate(true) });
          const redo = el("button", { className: "ghost", style: "margin-top:6px" }, "↺ Clear");
          redo.addEventListener("click", renderPage);
          pageWrap.appendChild(redo);
        } else {
          writeInk = buildCopybook(pageWrap, [ch], { rows: 1, cols: 1, cell: box, tight: true });
          pageWrap.appendChild(el("div", { className: "writing-inline", style: "gap:8px;margin-top:6px" }, [
            (() => { const b = el("button", { className: "ghost" }, "Undo ↶"); b.addEventListener("click", () => writeInk && writeInk.undo()); return b; })(),
            (() => { const b = el("button", { className: "ghost" }, "Clear ✕"); b.addEventListener("click", () => writeInk && writeInk.clear()); return b; })()
          ]));
        }
      } else {
        pageWrap.appendChild(el("div", { className: "hanzi" }, ch));
      }

      // Pinned action at the card bottom (always visible, never scrolls away).
      if (last) {
        writeNextFn = null;
        $("#studyReveal").classList.add("hidden");
        $("#studyContinueWrap").classList.remove("hidden");
      } else {
        writeNextFn = () => { writeCharIdx++; renderPage(); };
        $("#studyContinueWrap").classList.add("hidden");
        $("#studyNext").textContent = `Next character (${writeCharIdx + 1}/${N}) →`;
        $("#studyNext").classList.remove("hidden");
        $("#studyReveal").classList.remove("hidden");
      }
    };
    renderPage();
  }

  function finishStudy() {
    doneAction = null;
    // A lesson completes once ALL its words are cleared — which can take a few
    // batches for a big lesson, not just one round.
    let justFinished = null;
    const scopedId = (!reviewMode && scopeLessons && scopeLessons.size === 1) ? [...scopeLessons][0] : null;
    if (scopedId && !doneLessons.has(scopedId) && lessonCleared(scopedId)) {
      doneLessons.add(scopedId); saveDone(); justFinished = scopedId;
    }
    const upNext = justFinished ? nextLessonId(justFinished) : null;
    // Words still to clear in this lesson (a long lesson comes in batches).
    const remaining = (scopedId && !justFinished)
      ? CARDS.filter(c => c.lessonId === scopedId && !(srs[c.id] && srs[c.id].reps >= 1)).length
      : 0;

    $("#doneTitle").textContent = reviewMode ? "Review complete 🎉"
      : justFinished ? "Lesson complete 🎉"
      : remaining ? "Batch done 👏" : "Session complete 🎉";
    sfx("complete");
    $("#doneStats").innerHTML = "";
    $("#doneStats").append(
      statEl(clearedIds.size, clearedIds.size === 1 ? "word cleared" : "words cleared"),
      statEl(`🔥 ${computeStreak()}`, "day streak")
    );
    const nextBtn = $("#doneNext");
    if (upNext) {
      const l = LESSONS.find(x => x.id === upNext);
      nextBtn.textContent = `Next: ${l.title.replace(/^.*?· /, "")} →`;
      nextBtn.dataset.next = upNext;
      nextBtn.classList.remove("hidden");
    } else if (remaining) {
      nextBtn.textContent = `Keep going — ${remaining} word${remaining === 1 ? "" : "s"} left →`;
      nextBtn.dataset.next = scopedId;
      nextBtn.classList.remove("hidden");
    } else nextBtn.classList.add("hidden");
    $("#doneAgain").classList.remove("hidden");
    saveSRS(srs);
    show("done");
  }

  $("#studyNext").addEventListener("click", () => { if (writeNextFn) writeNextFn(); });
  $("#studyContinue").addEventListener("click", () => {
    // Sentence mode: first press checks the answer, second advances.
    if (!studyAnswered && studyCheckFn) { studyCheckFn(); return; }
    if (!studyAnswered) answerStudy(true);   // write mode: finishing the character = correct
    nextStudyCard();
  });
  $("#studyBack").addEventListener("click", () => { show("path"); renderPath(); });
  $("#studyShuffle").addEventListener("click", () => { queue = shuffle(queue); nextStudyCard(); });

  /* ==================================================================== */
  /*  QUIZ (multiple choice)                                              */
  /* ==================================================================== */

  let quizItems = [], quizIdx = 0, quizScore = 0;
  // Placement / "skip test": pass a quick test to unlock lessons you already know.
  let quizMode = "quiz";
  let placeRange = [], placeTarget = null, placeScores = {}, placeCorrectCards = new Set();

  // Build a skip test covering every not-yet-done lesson up to (and including)
  // the target. Passing unlocks the longest run of lessons you're solid on.
  function startPlacement(targetId) {
    const order = LESSONS.map(l => l.id);
    const ti = order.indexOf(targetId);
    const range = [];
    for (let i = 0; i <= ti; i++) if (!doneLessons.has(order[i])) range.push(order[i]);
    if (!range.length) { toast("That's already unlocked."); return; }
    const perLesson = Math.max(2, Math.min(5, Math.floor(20 / range.length)));
    placeScores = {}; placeCorrectCards = new Set();
    const items = [];
    range.forEach(lid => {
      placeScores[lid] = { ok: 0, total: 0 };
      const cards = CARDS.filter(c => c.lessonId === lid);
      shuffle(cards).slice(0, Math.min(perLesson, cards.length)).forEach(c => items.push(c));
    });
    quizItems = shuffle(items);
    quizIdx = 0; quizScore = 0; quizMode = "placement";
    placeRange = range; placeTarget = targetId;
    scopeLessons = new Set(range);                     // distractors drawn from the tested range
    scopeFocuses = new Set(["recognize", "recall"]);   // clean "do you know this word" tests
    $("#quizTitle").textContent = `Skip test · ${quizItems.length} question${quizItems.length === 1 ? "" : "s"}`;
    show("quiz");
    renderQuiz();
  }

  function finishPlacement() {
    doneAction = null;
    quizMode = "quiz";
    const PASS = 0.7;
    const unlocked = [];
    for (const lid of placeRange) {          // linear: stop at the first lesson you don't clear
      const s = placeScores[lid] || { ok: 0, total: 0 };
      if (s.total && s.ok / s.total >= PASS) unlocked.push(lid); else break;
    }
    unlocked.forEach(lid => doneLessons.add(lid));
    if (unlocked.length) saveDone();
    placeCorrectCards.forEach(id => {          // seed known words so they don't read as brand-new
      const card = CARD_BY_ID[id];
      if (card && unlocked.includes(card.lessonId) && !srs[id])
        srs[id] = { ease: 2.4, interval: 3, due: NOW() + 3 * DAY, reps: 2, prod: true };
    });
    if (unlocked.length) saveSRS(srs);
    scopeLessons = null; scopeFocuses = null;
    const reachedTarget = unlocked.includes(placeTarget);
    $("#doneTitle").textContent = !unlocked.length ? "Not yet 💪"
      : reachedTarget ? "You tested out! 🎉" : "Skipped ahead 👍";
    sfx(unlocked.length ? "complete" : "wrong");
    $("#doneStats").innerHTML = "";
    $("#doneStats").append(
      statEl(`${quizScore}/${quizItems.length}`, "correct"),
      statEl(unlocked.length, unlocked.length === 1 ? "lesson unlocked" : "lessons unlocked")
    );
    $("#doneNext").classList.add("hidden");
    $("#doneAgain").classList.add("hidden");
    show("done");
    toast(!unlocked.length
      ? "Keep studying from where you are — you'll get there."
      : reachedTarget ? "Unlocked all the way to your target — nice!"
      : "Unlocked what you're solid on — the rest needs a little more study.");
  }

  function startQuiz() {
    const cards = activeCards();
    if (cards.length < 3) { toast("Pick more lessons — a quiz needs at least 3 words."); $("#studyPanel").open = true; return; }
    quizItems = shuffle(cards).slice(0, Math.min(20, cards.length));
    quizIdx = 0; quizScore = 0; quizMode = "quiz";
    $("#quizTitle").textContent = `Quiz · ${quizItems.length} questions`;
    show("quiz");
    renderQuiz();
  }

  function renderQuiz() {
    if (quizIdx >= quizItems.length) return quizMode === "placement" ? finishPlacement() : finishQuiz();
    const c = quizItems[quizIdx];
    // Direction: only multiple-choice types (write/sentence/speak aren't MC).
    let dirs = [...(scopeFocuses || selectedFocuses)].filter(k => k !== "write" && k !== "sentence" && k !== "speak");
    if (dirs.length === 0) dirs = ["recognize"];
    const dir = dirs[Math.floor(Math.random() * dirs.length)];

    $("#quizBar").style.width = `${(quizIdx / quizItems.length) * 100}%`;
    buildChoiceExercise($("#quizFace"), $("#quizChoices"), c, dir, $("#quizPromptLabel"), correct => {
      sfx(correct ? "correct" : "wrong");
      if (correct) quizScore++;
      if (quizMode === "placement") {
        const s = placeScores[c.lessonId] || (placeScores[c.lessonId] = { ok: 0, total: 0 });
        s.total++; if (correct) { s.ok++; placeCorrectCards.add(c.id); }
      } else {
        schedule(c.id, correct ? "good" : "again");
        recordReview(1);
      }
      $("#quizNextWrap").classList.remove("hidden");
    });
    $("#quizNextWrap").classList.add("hidden");
  }

  $("#quizNext").addEventListener("click", () => { quizIdx++; renderQuiz(); });
  $("#quizBack").addEventListener("click", () => { show("path"); renderPath(); });

  function finishQuiz() {
    doneAction = null;
    $("#doneTitle").textContent = "Quiz complete";
    sfx("complete");
    $("#doneStats").innerHTML = "";
    const pct = Math.round((quizScore / quizItems.length) * 100);
    $("#doneStats").append(
      statEl(`${quizScore}/${quizItems.length}`, "correct"),
      statEl(`${pct}%`, "score")
    );
    $("#doneAgain").classList.add("hidden");   // redo is a Study feature
    show("done");
  }

  /* ==================================================================== */
  /*  BROWSE                                                              */
  /* ==================================================================== */

  function startBrowse() {
    const body = $("#browseBody");
    body.innerHTML = "";
    let curLesson = null;
    activeCards().forEach(c => {
      if (c.lessonId !== curLesson) {
        curLesson = c.lessonId;
        const th = el("td", { colSpan: 4, style: "background:var(--accent-soft);font-weight:700;" }, c.lessonTitle);
        body.appendChild(el("tr", {}, th));
      }
      const actions = el("td", {}, [speakerBtn(c.hanzi)]);
      if (HW_OK && cjkOnly(c.hanzi).length) actions.appendChild(strokeBtn(c.hanzi, c.pinyin));
      const tr = el("tr", {}, [
        el("td", { className: "h" }, c.hanzi),
        el("td", { className: "p" }, prettyPinyin(c.pinyin)),
        el("td", {}, c.pos ? `${c.en}  ·  ${c.pos}` : c.en),
        actions
      ]);
      body.appendChild(tr);
    });
    $("#browseTitle").textContent = `Browse · ${activeCards().length} words`;
    show("browse");
  }
  $("#browseBack").addEventListener("click", () => { show("path"); renderPath(); });

  /* ==================================================================== */
  /*  PICK & PRACTISE — choose any words, then flashcards / match / quiz  */
  /* ==================================================================== */

  const pickSel = new Set();            // chosen card ids (kept across visits)
  let pickFilter = "";

  function openPicker() { renderPicker(); show("pick"); }

  function pickedCards() { return CARDS.filter(c => pickSel.has(c.id)); }

  function updatePickCount() {
    const n = pickSel.size;
    $("#pickCount").textContent = `${n} chosen`;
    document.querySelectorAll(".pick-actions button").forEach(b => b.disabled = n < 1);
  }

  function renderPicker() {
    // Preset chips
    const presets = $("#pickPresets"); presets.innerHTML = "";
    const chip = (label, fn) => { const b = el("button", { className: "pick-chip", type: "button" }, label); b.addEventListener("click", fn); presets.appendChild(b); };
    chip("＋ Current lesson", () => { CARDS.filter(c => c.lessonId === currentLessonId()).forEach(c => pickSel.add(c.id)); renderPicker(); });
    chip("＋ Still learning", () => { CARDS.forEach(c => { const s = srs[c.id]; if (s && !isMastered(s)) pickSel.add(c.id); }); renderPicker(); });
    chip("＋ Due for review", () => { dueReviewCards().forEach(c => pickSel.add(c.id)); renderPicker(); });
    chip("✕ Clear", () => { pickSel.clear(); renderPicker(); });

    const q = pickFilter.trim().toLowerCase();
    // Match pinyin WITHOUT tone marks and with spaces optional, so a beginner can
    // type "ni hao" or "nihao" (not just "nǐ hǎo") and still find the word.
    const qp = tonelessPinyin(q), qpNoSpace = qp.replace(/\s+/g, "");
    const match = c => {
      if (!q) return true;
      if (c.hanzi.includes(q) || c.en.toLowerCase().includes(q)) return true;
      const py = tonelessPinyin(c.pinyin).toLowerCase();
      return py.includes(qp) || py.replace(/\s+/g, "").includes(qpNoSpace);
    };

    const list = $("#pickList"); list.innerHTML = "";
    let curLesson = null, group = null;
    CARDS.filter(match).forEach(c => {
      if (c.lessonId !== curLesson) {
        curLesson = c.lessonId;
        // Each lesson is its own block so its sticky header stays pinned only
        // WHILE that block is on screen — flat siblings all pin at top:0 at once
        // and pile up (a tall 2-line header peeking under the next single one,
        // and stacked headers hiding the top rows' 汉字).
        group = el("div", { className: "pick-group" });
        const head = el("div", { className: "pick-lhead" });
        const title = el("span", {}, c.lessonTitle.replace(/^.*?· /, ""));
        const all = el("button", { className: "link", type: "button" }, "all");
        all.addEventListener("click", () => {
          const cards = CARDS.filter(x => x.lessonId === c.lessonId && match(x));
          const every = cards.every(x => pickSel.has(x.id));
          cards.forEach(x => every ? pickSel.delete(x.id) : pickSel.add(x.id));
          renderPicker();
        });
        head.append(title, all);
        group.appendChild(head);
        list.appendChild(group);
      }
      const row = el("label", { className: "pick-row" });
      const cb = el("input", { type: "checkbox" });
      cb.checked = pickSel.has(c.id);
      cb.addEventListener("change", () => { cb.checked ? pickSel.add(c.id) : pickSel.delete(c.id); updatePickCount(); });
      row.append(cb,
        el("span", { className: "pk-han" }, c.hanzi),
        el("span", { className: "pk-py" }, prettyPinyin(c.pinyin)),
        el("span", { className: "pk-en" }, c.en));
      group.appendChild(row);
    });
    if (!list.children.length) list.appendChild(el("p", { className: "muted", style: "padding:10px" }, "No words match that search."));
    updatePickCount();
  }

  $("#pickSearch").addEventListener("input", e => { pickFilter = e.target.value; renderPicker(); });
  $("#pickBack").addEventListener("click", () => show("home"));
  document.querySelectorAll(".pick-actions button").forEach(btn => btn.addEventListener("click", () => {
    const cards = pickedCards();
    if (!cards.length) { toast("Tick some words first."); return; }
    const m = btn.dataset.pmode;
    if (m === "flash") startFlash(cards);
    else if (m === "match") startMatch(cards);
    else if (m === "quiz") startQuizOn(cards);
  }));

  /* ---- Flashcards ---------------------------------------------------- */
  let flashCards = [], flashIdx = 0;

  function startFlash(cards) {
    flashCards = shuffle(cards.slice()); flashIdx = 0;
    show("flash"); renderFlash();
  }
  function renderFlash() {
    const c = flashCards[flashIdx];
    $("#flashCount").textContent = `${flashIdx + 1} / ${flashCards.length}`;
    $("#flashBar").style.width = `${((flashIdx + 1) / flashCards.length) * 100}%`;
    const card = $("#flashCard");
    card.className = "flashcard";
    card.innerHTML = "";
    const front = el("div", { className: "fc-face fc-front" }, [
      el("div", { className: "fc-han" + (cjkOnly(c.hanzi).length > 3 ? " small" : "") }, c.hanzi),
      el("div", { className: "fc-tip muted" }, "tap to flip")
    ]);
    const back = el("div", { className: "fc-face fc-back" }, [
      el("div", { className: "fc-py" }, prettyPinyin(c.pinyin)),
      el("div", { className: "fc-en" }, c.pos ? `${c.en} · ${c.pos}` : c.en)
    ]);
    const aids = el("div", { className: "fc-aids" }, [speakerBtn(c.hanzi), slowSpeakerBtn(c.hanzi)]);
    if (HW_OK && cjkOnly(c.hanzi).length) aids.appendChild(strokeBtn(c.hanzi, c.pinyin));
    back.appendChild(aids);
    card.append(front, back);
    card.onclick = e => { if (e.target.closest("button")) return; card.classList.toggle("flipped"); };
  }
  const flashStep = d => { flashIdx = (flashIdx + d + flashCards.length) % flashCards.length; renderFlash(); };
  $("#flashPrev").addEventListener("click", () => flashStep(-1));
  $("#flashNext").addEventListener("click", () => flashStep(1));
  $("#flashFlip").addEventListener("click", () => $("#flashCard").classList.toggle("flipped"));
  $("#flashShuffle").addEventListener("click", () => { flashCards = shuffle(flashCards); flashIdx = 0; renderFlash(); });
  $("#flashBack").addEventListener("click", () => show("pick"));

  /* ---- Matching game ------------------------------------------------- */
  let matchQueue = [], matchFirst = null, matchLeft = 0, matchTotal = 0, matchDone = 0;

  function startMatch(cards) {
    // Two words that mean the same thing (中文 / 汉语 = "Chinese (language)") would
    // make two indistinguishable meaning tiles and score a correct pairing as wrong.
    // Keep one card per meaning so every tile is uniquely matchable.
    const seenEn = new Set(), uniq = [];
    shuffle(cards.slice()).forEach(c => { if (!seenEn.has(c.en)) { seenEn.add(c.en); uniq.push(c); } });
    if (uniq.length < 3) { toast("Pick at least 3 words with different meanings to match."); return; }
    matchQueue = uniq;
    matchTotal = matchQueue.length; matchDone = 0;
    show("match"); nextMatchRound();
  }
  function nextMatchRound() {
    const round = matchQueue.splice(0, Math.min(6, matchQueue.length));
    matchLeft = round.length; matchFirst = null;
    const tiles = [];
    round.forEach(c => { tiles.push({ id: c.id, kind: "han", text: c.hanzi }); tiles.push({ id: c.id, kind: "en", text: c.en }); });
    const grid = $("#matchGrid"); grid.innerHTML = "";
    shuffle(tiles).forEach(t => {
      const b = el("button", { className: "match-tile " + (t.kind === "han" ? "mt-han" : "mt-en") }, t.text);
      b.dataset.id = t.id; b.dataset.kind = t.kind;
      b.addEventListener("click", () => onMatchTap(b));
      grid.appendChild(b);
    });
    $("#matchCount").textContent = `${matchDone} / ${matchTotal}`;
    $("#matchMsg").textContent = "Tap a character, then its meaning.";
  }
  function onMatchTap(b) {
    if (b.classList.contains("matched") || b.classList.contains("miss")) return;
    if (!matchFirst) { matchFirst = b; b.classList.add("sel"); return; }
    if (b === matchFirst) { b.classList.remove("sel"); matchFirst = null; return; }
    const a = matchFirst; matchFirst = null; a.classList.remove("sel");
    if (a.dataset.id === b.dataset.id && a.dataset.kind !== b.dataset.kind) {
      a.classList.add("matched"); b.classList.add("matched");
      sfx("correct");
      const card = CARD_BY_ID[a.dataset.id]; if (card) speak(card.hanzi);
      matchLeft--; matchDone++;
      $("#matchCount").textContent = `${matchDone} / ${matchTotal}`;
      if (matchLeft === 0) {
        if (matchQueue.length) { $("#matchMsg").textContent = "Nice — next set…"; setTimeout(nextMatchRound, 650); }
        else finishMatch();
      }
    } else {
      sfx("wrong");
      a.classList.add("miss"); b.classList.add("miss");
      setTimeout(() => { a.classList.remove("miss"); b.classList.remove("miss"); }, 450);
    }
  }
  function finishMatch() {
    $("#doneTitle").textContent = "Matching done 🎉";
    sfx("complete");
    $("#doneStats").innerHTML = "";
    $("#doneStats").append(statEl(matchTotal, matchTotal === 1 ? "pair matched" : "pairs matched"));
    doneAction = () => startMatch(pickedCards());
    $("#doneNext").innerHTML = `<svg class="licon licon-sm"><use href="#i-shuffle"/></svg> Again`;
    delete $("#doneNext").dataset.next;
    $("#doneNext").classList.remove("hidden");
    $("#doneAgain").classList.add("hidden");
    show("done");
  }
  $("#matchBack").addEventListener("click", () => show("pick"));

  /* ---- Quiz over the picked words ------------------------------------ */
  function startQuizOn(cards) {
    if (cards.length < 3) { toast("Pick at least 3 words to quiz."); return; }
    scopeLessons = new Set(cards.map(c => c.lessonId));        // plausible distractors
    scopeFocuses = new Set(["recognize", "recall", "pinyin", "listen"]);
    quizItems = shuffle(cards.slice()).slice(0, Math.min(20, cards.length));
    quizIdx = 0; quizScore = 0; quizMode = "quiz";
    $("#quizTitle").textContent = `Quiz · ${quizItems.length} questions`;
    show("quiz"); renderQuiz();
  }

  /* ==================================================================== */
  /*  DONE / shared                                                       */
  /* ==================================================================== */

  function statEl(value, label) {
    return el("span", { className: "stat" }, [
      el("b", {}, String(value)), el("div", { className: "muted" }, label)
    ]);
  }
  // A one-shot action for the done screen's primary button (used by Matching's
  // "Again"); lesson flows leave it null and fall through to the dataset.next path.
  let doneAction = null;
  $("#doneHome").addEventListener("click", () => { doneAction = null; show("path"); renderPath(); });
  $("#doneNext").addEventListener("click", () => {
    if (doneAction) { const fn = doneAction; doneAction = null; $("#doneNext").classList.add("hidden"); fn(); return; }
    const id = $("#doneNext").dataset.next;
    if (id) { $("#doneNext").classList.add("hidden"); launchLesson(id, null); }
  });
  $("#doneAgain").addEventListener("click", () => {
    $("#doneAgain").classList.add("hidden");
    beginStudySession(studySource);   // re-run the exact same set
  });

  /* ==================================================================== */
  /*  SETTINGS & HELP                                                     */
  /* ==================================================================== */

  function openModal(id) { $("#" + id).classList.remove("hidden"); }
  function closeModal(id) { $("#" + id).classList.add("hidden"); }

  function syncSettings() {
    const theme = prefs.theme || "system";
    $("#themeSeg").querySelectorAll("button").forEach(b => b.classList.toggle("on", b.dataset.theme === theme));
    $("#rateRange").value = audioRate();
    if ($("#appVersion")) $("#appVersion").textContent = APP_VERSION;
    if (typeof syncVoicePicker === "function") syncVoicePicker();
    const g = dailyGoal();
    $("#goalSeg").querySelectorAll("button").forEach(b => b.classList.toggle("on", +b.dataset.goal === g));
    $("#checkSwitch").classList.toggle("on", prefs.checkStrokes !== false);
    $("#soundSwitch").classList.toggle("on", prefs.sound !== false);
    $("#pinyinSwitch").classList.toggle("on", prefs.showPinyin !== false);
    if ($("#nameInput") && document.activeElement !== $("#nameInput")) $("#nameInput").value = prefs.name || "";
    const bk = $("#backupAge");
    if (bk) {
      bk.textContent = backupAgeText();
      bk.classList.toggle("stale", !lastBackupAt() || (NOW() - lastBackupAt()) / DAY >= STALE_DAYS);
    }
  }
  function toggleCheck() {
    prefs.checkStrokes = prefs.checkStrokes === false ? true : false;
    savePrefs(prefs); syncSettings();
  }
  function toggleSound() {
    prefs.sound = prefs.sound === false ? true : false;
    savePrefs(prefs); syncSettings();
    if (prefs.sound) sfx("correct");   // little confirmation you can hear it
  }
  function togglePinyin() {
    prefs.showPinyin = prefs.showPinyin === false ? true : false;
    savePrefs(prefs); syncSettings();
  }
  $("#pinyinSwitch").addEventListener("click", togglePinyin);
  $("#pinyinSwitch").addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); togglePinyin(); } });
  if ($("#nameInput")) $("#nameInput").addEventListener("input", e => {
    prefs.name = e.target.value.slice(0, 24); savePrefs(prefs); renderHomeTop();
  });
  $("#checkSwitch").addEventListener("click", toggleCheck);
  $("#checkSwitch").addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleCheck(); } });
  $("#soundSwitch").addEventListener("click", toggleSound);
  $("#soundSwitch").addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleSound(); } });
  $("#settingsBtn").addEventListener("click", () => { syncSettings(); renderAccount(); openModal("settingsModal"); });
  $("#settingsClose").addEventListener("click", () => closeModal("settingsModal"));
  $("#settingsModal").addEventListener("click", e => { if (e.target.id === "settingsModal") closeModal("settingsModal"); });
  $("#helpBtn").addEventListener("click", () => openModal("helpModal"));
  $("#helpClose").addEventListener("click", () => closeModal("helpModal"));
  $("#helpModal").addEventListener("click", e => { if (e.target.id === "helpModal") closeModal("helpModal"); });

  // ---- Tones primer ----
  const TONE_DEMO = [
    { n: "1st tone", desc: "high and flat", py: "mā", hz: "妈", en: "mother" },
    { n: "2nd tone", desc: "rising, like asking a question", py: "má", hz: "麻", en: "hemp" },
    { n: "3rd tone", desc: "dips down low, then rises", py: "mǎ", hz: "马", en: "horse" },
    { n: "4th tone", desc: "sharp and falling, like a command", py: "mà", hz: "骂", en: "to scold" }
  ];
  let tonesBuilt = false;
  function buildTonesRows() {
    const box = $("#tonesRows"); box.innerHTML = "";
    TONE_DEMO.forEach(t => {
      box.appendChild(el("div", { className: "tone-row" }, [
        el("div", { className: "tone-badge" }, t.py),
        el("div", { className: "tone-info" }, [
          el("div", {}, [el("b", {}, t.n), document.createTextNode(` — ${t.hz} ${t.en}`)]),
          el("div", { className: "muted", style: "font-size:.82rem" }, t.desc)
        ]),
        speakerBtn(t.hz)
      ]));
    });
    tonesBuilt = true;
  }
  function openTones() { if (!tonesBuilt) buildTonesRows(); openModal("tonesModal"); }
  $("#tonesClose").addEventListener("click", () => closeModal("tonesModal"));
  $("#tonesModal").addEventListener("click", e => { if (e.target.id === "tonesModal") closeModal("tonesModal"); });
  const helpTonesLink = $("#tonesFromHelp");
  if (helpTonesLink) helpTonesLink.addEventListener("click", () => { closeModal("helpModal"); openTones(); });

  $("#themeSeg").querySelectorAll("button").forEach(b =>
    b.addEventListener("click", () => { prefs.theme = b.dataset.theme; savePrefs(prefs); applyTheme(); syncSettings(); }));
  $("#rateRange").addEventListener("input", e => { prefs.rate = parseFloat(e.target.value); savePrefs(prefs); });
  $("#rateRange").addEventListener("change", e => speak("你好", { rate: parseFloat(e.target.value) }));

  // ---- Chinese-voice picker ----
  // Lists the Chinese voices actually installed on THIS device so you can see
  // what you've got and choose one. If there's only the default (robotic) voice,
  // the note explains how to get a better one — no app can install voices.
  function voiceLabel(v) {
    let n = (v.name || v.voiceURI || "Voice").replace(/\s*\((enhanced|premium)\)/i, "");
    const q = voiceQuality(v);
    if (/siri/i.test(v.name + v.voiceURI)) n += " · Siri";
    else if (q >= 8) n += " · enhanced";
    return n;
  }
  function syncVoicePicker() {
    const sel = $("#voiceSel"); if (!sel) return;
    const list = zhVoices().slice().sort((a, b) => voiceQuality(b) - voiceQuality(a));
    sel.innerHTML = "";
    sel.appendChild(el("option", { value: "" }, "Auto — best available"));
    list.forEach(v => sel.appendChild(el("option", { value: v.voiceURI }, voiceLabel(v))));
    sel.value = prefs.voiceURI && list.some(v => v.voiceURI === prefs.voiceURI) ? prefs.voiceURI : "";
    const note = $("#voiceNote");
    if (note) {
      if (!list.length) note.textContent = "No Chinese voice found on this device.";
      else if (list.length === 1) note.innerHTML = /iPad|iPhone|iPod/.test(navigator.userAgent)
        ? "Only one voice installed (it sounds robotic). For a natural voice: iOS <b>Settings → Accessibility → Spoken Content → Voices → Chinese</b>, then download an <b>Enhanced</b> voice and pick it here."
        : "Only one Chinese voice is installed. Add a higher-quality one in your system's speech settings.";
      else note.textContent = "";
    }
  }
  $("#voiceSel").addEventListener("change", e => {
    prefs.voiceURI = e.target.value || null;
    savePrefs(prefs); pickVoice();
    speak("你好，我叫步步");   // hear the chosen voice immediately
  });
  $("#voiceTest").addEventListener("click", () => speak("你好，很高兴认识你"));
  // Voices often arrive after boot (esp. iOS) — refresh the list when they land.
  if ("speechSynthesis" in window)
    speechSynthesis.onvoiceschanged = () => { pickVoice(); syncVoicePicker(); };
  $("#goalSeg").querySelectorAll("button").forEach(b =>
    b.addEventListener("click", () => {
      prefs.dailyGoal = +b.dataset.goal;
      savePrefs(prefs); renderDashboard(); renderHomeTop(); syncSettings();
    }));
  /* ---- Backup / restore --------------------------------------------------
     Everything lives in localStorage, so clearing site data, switching browser
     or reinstalling the PWA would wipe months of study with no warning.     */
  const BACKUP_KEYS = [LS_KEY, LS_PREFS, LS_DONE, LS_ACTIVITY];
  // Progress lives only in localStorage, which iOS can evict if the app sits
  // unused or gets offloaded. Track the last backup so we can nudge before that
  // silently costs someone their streak and review history.
  const LS_BACKUP = "zhBeginnerA.lastBackup.v1";
  const LS_BK_SNOOZE = "zhBeginnerA.backupSnooze.v1";
  const STALE_DAYS = 14, SNOOZE_DAYS = 7;
  const lastBackupAt = () => +localStorage.getItem(LS_BACKUP) || 0;
  const markBackedUp = () => { localStorage.setItem(LS_BACKUP, String(NOW())); localStorage.removeItem(LS_BK_SNOOZE); };
  function backupAgeText() {
    const t = lastBackupAt();
    if (!t) return "never backed up";
    const d = Math.floor((NOW() - t) / DAY);
    return d <= 0 ? "backed up today" : `backed up ${d} day${d === 1 ? "" : "s"} ago`;
  }
  // Only nag when there is actually something worth losing, and not while snoozed.
  function backupOverdue() {
    const worthLosing = doneLessons.size > 0 || Object.keys(srs).length >= 8 || computeStreak() > 0;
    if (!worthLosing) return false;
    // A signed-in account that synced recently IS the backup — nagging would be noise.
    if (cloudOn() && signedIn() && (NOW() - lastSyncAt()) / DAY < STALE_DAYS) return false;
    if (NOW() < (+localStorage.getItem(LS_BK_SNOOZE) || 0)) return false;
    const t = lastBackupAt();
    return !t || (NOW() - t) / DAY >= STALE_DAYS;
  }
  function renderBackupNudge() {
    const n = $("#backupNudge");
    if (!n) return;
    if (!backupOverdue()) { n.classList.add("hidden"); return; }
    const hud = document.querySelector(".path-top");
    n.style.top = ((hud && hud.offsetHeight ? hud.offsetHeight : 62) + 6) + "px";
    $("#bkNudgeSub").textContent = lastBackupAt()
      ? `Last ${backupAgeText()}. Progress lives only on this device.`
      : "Your streak and history live only on this device.";
    n.classList.remove("hidden");
  }
  function exportProgress() {
    const payload = { app: "zhBeginnerA", version: 1, exported: new Date().toISOString(), data: {} };
    BACKUP_KEYS.forEach(k => { const v = localStorage.getItem(k); if (v !== null) payload.data[k] = v; });
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `chinese-progress-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    markBackedUp();
    renderBackupNudge();
    syncSettings();
    toast("Progress exported — keep the file somewhere safe.");
  }
  function importProgress(file) {
    const r = new FileReader();
    r.onload = () => {
      let p;
      try { p = JSON.parse(r.result); } catch { return toast("That file isn't valid JSON."); }
      if (!p || p.app !== "zhBeginnerA" || !p.data) return toast("That isn't a progress backup.");
      let words = 0, lessons = 0;
      try { words = Object.keys(JSON.parse(p.data[LS_KEY] || "{}")).length; } catch {}
      try { lessons = (JSON.parse(p.data[LS_DONE] || "[]")).length; } catch {}
      const when = (p.exported || "").slice(0, 10) || "unknown date";
      if (!confirm(`Restore backup from ${when}?

${lessons} lesson(s) complete, ${words} word(s) with progress.

This REPLACES the progress on this device.`)) return;
      BACKUP_KEYS.forEach(k => localStorage.removeItem(k));
      Object.entries(p.data).forEach(([k, v]) => { if (BACKUP_KEYS.includes(k)) localStorage.setItem(k, v); });
      markBackedUp();          // they demonstrably hold a copy of this state
      location.reload();
    };
    r.onerror = () => toast("Couldn't read that file.");
    r.readAsText(file);
  }
  $("#exportBtn").addEventListener("click", exportProgress);
  $("#bkNudgeExport").addEventListener("click", exportProgress);
  $("#bkNudgeClose").addEventListener("click", () => {
    localStorage.setItem(LS_BK_SNOOZE, String(NOW() + SNOOZE_DAYS * DAY));
    $("#backupNudge").classList.add("hidden");
  });
  $("#importBtn").addEventListener("click", () => $("#importFile").click());
  $("#importFile").addEventListener("change", e => {
    const f = e.target.files && e.target.files[0];
    if (f) importProgress(f);
    e.target.value = "";        // allow re-picking the same file
  });


  /* ==================================================================== */
  /*  ACCOUNT + CLOUD SYNC  (optional — inert until configured)           */
  /* ==================================================================== */
  /* Talks to Supabase over its plain REST API with fetch(), deliberately NOT
     the JS SDK: the app is 100% self-hosted with no CDN calls, which is what
     lets it work offline, and a 40KB library would break that for no gain.

     LOCAL-FIRST: localStorage stays the source of truth, so everything keeps
     working with no signal. Signing in only adds a backup + multi-device copy.

     SUPABASE_ANON_KEY is the PUBLIC key — it is designed to be embedded in a
     client and is safe here. The service_role key must NEVER appear in this
     file; it bypasses row-level security entirely. */
  const SUPABASE_URL = "https://cthoynfsgpqgthxpmngm.supabase.co";
  // Public "anon" key — designed to be embedded in a client; row-level security
  // in Postgres is what actually protects the data. NEVER the service_role key.
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0aG95bmZzZ3BxZ3RoeHBtbmdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2MDM3NDksImV4cCI6MjEwMDE3OTc0OX0.nj0EP_CL5wA61D9ebjTKIDwMLj3ou_2LtEVSN1Rsn1E";
  const cloudOn = () => !!(SUPABASE_URL && SUPABASE_ANON_KEY);

  const LS_SESSION = "zhBeginnerA.session.v1";
  const LS_SYNCED  = "zhBeginnerA.lastSync.v1";
  const LS_SKIPAUTH = "zhBeginnerA.skipAuth.v1";   // chose to use the app without an account
  let session = (() => { try { return JSON.parse(localStorage.getItem(LS_SESSION)) || null; } catch { return null; } })();
  const signedIn = () => !!(session && session.access_token);
  const userEmail = () => (session && session.user && session.user.email) || "";
  function setSession(s) {
    session = s;
    if (s) localStorage.setItem(LS_SESSION, JSON.stringify(s));
    else localStorage.removeItem(LS_SESSION);
    renderAccount();
  }

  async function sb(path, opts = {}, useAuth = true) {
    const headers = Object.assign(
      { apikey: SUPABASE_ANON_KEY, "Content-Type": "application/json" }, opts.headers || {});
    if (useAuth && signedIn()) headers.Authorization = `Bearer ${session.access_token}`;
    return fetch(SUPABASE_URL + path, Object.assign({}, opts, { headers }));
  }
  // Access tokens expire (~1h). Refresh once and replay rather than logging out.
  // DEFENSIVE: with the sign-in gate on, dropping the session locks the user out
  // of an app whose data is on their own device. So only a DEFINITIVE rejection
  // from the server ends a session — never a network error, never a 5xx.
  const NET_FAIL = { ok: false, status: 0, networkError: true,
                     json: async () => ({}), text: async () => "" };
  async function sbAuthed(path, opts = {}) {
    let r;
    try { r = await sb(path, opts); } catch { return NET_FAIL; }
    if (r.status !== 401 || !session || !session.refresh_token) return r;
    let rr;
    try {
      rr = await sb(`/auth/v1/token?grant_type=refresh_token`,
        { method: "POST", body: JSON.stringify({ refresh_token: session.refresh_token }) }, false);
    } catch { return r; }                    // offline — keep the session, stay usable
    if (!rr.ok) {
      // 400/401 = the refresh token really is dead. Anything else is transient.
      if (rr.status === 400 || rr.status === 401) { setSession(null); openAuthGate(); }
      return r;
    }
    setSession(await rr.json());
    try { return await sb(path, opts); } catch { return NET_FAIL; }
  }

  async function signUp(email, password) {
    const r = await sb("/auth/v1/signup", { method: "POST", body: JSON.stringify({ email, password }) }, false);
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.msg || j.error_description || j.message || "Sign-up failed");
    // With email confirmation ON, Supabase returns a user but no session.
    if (j.access_token) { setSession(j); return { confirmed: true }; }
    return { confirmed: false };
  }
  async function signIn(email, password) {
    const r = await sb("/auth/v1/token?grant_type=password",
      { method: "POST", body: JSON.stringify({ email, password }) }, false);
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.error_description || j.msg || j.message || "Sign-in failed");
    setSession(j);
    return j;
  }
  function signOut() {
    // Local data is deliberately left alone — signing out must never wipe progress.
    setSession(null);
    localStorage.removeItem(LS_SYNCED);
    toast("Signed out — your progress stays on this device.");
    closeModal("settingsModal");
    openAuthGate();
  }

  /* ---- merge -------------------------------------------------------------
     Naive last-write-wins silently destroys progress when two devices are used.
     Merge per data type instead, always in the direction that KEEPS work:
       lessons  -> union            (finished on either device counts)
       activity -> max per day      (never double-counts, never loses a day)
       srs      -> more-reviewed entry wins
       prefs    -> this device wins, remote fills any gaps                     */
  function mergeProgress(local, remote) {
    const P = (v, f) => { try { return typeof v === "string" ? JSON.parse(v) : (v || f); } catch { return f; } };
    const out = {};

    const sa = P(local[LS_KEY], {}), sbb = P(remote[LS_KEY], {});
    const srsM = Object.assign({}, sbb);
    for (const [id, e] of Object.entries(sa)) {
      const o = srsM[id];
      const better = !o || (e.reps || 0) > (o.reps || 0) ||
        ((e.reps || 0) === (o.reps || 0) && (e.due || 0) > (o.due || 0));
      if (better) srsM[id] = e;
    }
    out[LS_KEY] = JSON.stringify(srsM);

    const da = P(local[LS_DONE], []), db = P(remote[LS_DONE], []);
    out[LS_DONE] = JSON.stringify([...new Set([].concat(
      Array.isArray(da) ? da : [], Array.isArray(db) ? db : []))]);

    const aa = P(local[LS_ACTIVITY], { days: {} }), ab = P(remote[LS_ACTIVITY], { days: {} });
    const days = Object.assign({}, ab.days || {});
    for (const [d, n] of Object.entries(aa.days || {})) days[d] = Math.max(n || 0, days[d] || 0);
    out[LS_ACTIVITY] = JSON.stringify(Object.assign({}, ab, aa, { days }));

    out[LS_PREFS] = JSON.stringify(Object.assign({}, P(remote[LS_PREFS], {}), P(local[LS_PREFS], {})));
    return out;
  }

  const localPayload = () => {
    const d = {};
    BACKUP_KEYS.forEach(k => { const v = localStorage.getItem(k); if (v !== null) d[k] = v; });
    return d;
  };
  // Re-read everything into memory after a merge, so we never need a page reload.
  function reloadStateFromStorage() {
    srs = loadSRS(); prefs = loadPrefs(); activity = loadActivity();
    try { doneLessons = new Set(JSON.parse(localStorage.getItem(LS_DONE)) || []); }
    catch { doneLessons = new Set(); }
    applyTheme();
    renderPath();
    if (document.body.dataset.view === "home") renderHome();
  }

  let syncing = false;
  async function cloudSync(reason) {
    if (!cloudOn() || !signedIn() || syncing || !navigator.onLine) return false;
    syncing = true; renderAccount();
    try {
      const uid = session.user && session.user.id;
      const get = await sbAuthed(`/rest/v1/progress?user_id=eq.${uid}&select=data`);
      if (!get.ok) throw new Error("pull failed");
      const rows = await get.json();
      const remote = (rows[0] && rows[0].data) || {};
      const merged = mergeProgress(localPayload(), remote);

      Object.entries(merged).forEach(([k, v]) => localStorage.setItem(k, v));
      reloadStateFromStorage();

      const put = await sbAuthed("/rest/v1/progress", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates" },
        body: JSON.stringify([{ user_id: uid, data: merged, updated_at: new Date().toISOString() }])
      });
      if (!put.ok) throw new Error("push failed");

      localStorage.setItem(LS_SYNCED, String(NOW()));
      renderBackupNudge();
      return true;
    } catch (e) {
      if (reason === "manual") toast("Couldn't sync — will retry later.");
      return false;
    } finally { syncing = false; renderAccount(); }
  }
  // Debounced background sync after progress changes.
  let syncTimer = null;
  function queueSync() {
    if (!cloudOn() || !signedIn()) return;
    clearTimeout(syncTimer);
    syncTimer = setTimeout(() => cloudSync("auto"), 4000);
  }
  window.addEventListener("online", () => cloudSync("online"));

  const lastSyncAt = () => +localStorage.getItem(LS_SYNCED) || 0;

  /* ---- sign-in gate ---------------------------------------------------
     Blocks the app until there's a session. Deliberately NOT a network check:
     a cached session opens the app instantly, online or off. Only shown when
     cloud sync is configured, so the app still runs standalone without it.   */
  let gateMode = "signup";
  function openAuthGate() {
    const g = $("#authGate");
    if (!g || !cloudOn()) return;
    g.classList.remove("hidden"); g.setAttribute("aria-hidden", "false");
    paintGate();
  }
  function closeAuthGate() {
    const g = $("#authGate");
    if (!g) return;
    g.classList.add("hidden"); g.setAttribute("aria-hidden", "true");
  }
  function paintGate() {
    const signup = gateMode === "signup";
    $("#gateIntro").textContent = signup
      ? "Your progress is saved to the cloud and follows you to any device."
      : "Sign in to pick up where you left off.";
    $("#gateIntroTitle").textContent = signup ? "Create your account" : "Welcome back";
    $("#gatePrimary").textContent = signup ? "Create account" : "Sign in";
    $("#gateToggle").textContent = signup ? "I already have an account" : "Create an account instead";
    $("#gatePass").setAttribute("autocomplete", signup ? "new-password" : "current-password");
    gateMsg("");
  }
  function gateMsg(text, kind) {
    const m = $("#gateMsg");
    if (m) { m.textContent = text || ""; m.className = "acct-msg" + (kind ? " " + kind : ""); }
  }
  async function afterSignedIn() {
    closeAuthGate();
    renderAccount();
    await cloudSync("manual");                       // pull anything already in the cloud
    if (!localStorage.getItem(LS_ONBOARDED)) runOnboarding();
  }
  if ($("#gatePrimary")) {
    // Splash → "Sign in" slides the account form up over the scene.
    $("#gateShowForm").addEventListener("click", () => {
      gateMode = "signin"; paintGate();
      $("#authGate").classList.add("form-open");
      setTimeout(() => $("#gateEmail").focus(), 50);
    });
    $("#gateSheetClose").addEventListener("click", () => $("#authGate").classList.remove("form-open"));
    $("#gateToggle").addEventListener("click", () => {
      gateMode = gateMode === "signup" ? "signin" : "signup"; paintGate();
    });
    $("#gatePrimary").addEventListener("click", async () => {
      const email = ($("#gateEmail").value || "").trim();
      const password = $("#gatePass").value || "";
      if (!email || !password) return gateMsg("Enter an email and password.", "err");
      if (password.length < 6) return gateMsg("Password needs at least 6 characters.", "err");
      if (!navigator.onLine) return gateMsg("You're offline — connect to the internet to sign in.", "err");
      const btn = $("#gatePrimary");
      btn.disabled = true;
      gateMsg(gateMode === "signup" ? "Creating account…" : "Signing in…");
      try {
        if (gateMode === "signup") {
          const r = await signUp(email, password);
          if (!r.confirmed) {
            gateMsg("Check your email to confirm, then sign in.", "ok");
            gateMode = "signin";
            btn.disabled = false;
            return paintGate();
          }
        } else {
          await signIn(email, password);
        }
        $("#gatePass").value = "";
        await afterSignedIn();
      } catch (e) {
        gateMsg(e.message || "That didn't work — try again.", "err");
      } finally { btn.disabled = false; }
    });
    ["gateEmail", "gatePass"].forEach(id =>
      $("#" + id).addEventListener("keydown", e => { if (e.key === "Enter") $("#gatePrimary").click(); }));
    if ($("#gateSkip")) $("#gateSkip").addEventListener("click", () => {
      // Run the app locally with no account. The app is local-first, so this
      // loses nothing — and it means a missing/paused backend can never lock you out.
      try { localStorage.setItem(LS_SKIPAUTH, "1"); } catch (e) {}
      closeAuthGate();
      if (!localStorage.getItem(LS_ONBOARDED)) runOnboarding();
    });
  }

  function renderAccount() {
    const box = $("#acctBox");
    if (!box) return;
    // Nothing about accounts appears at all until the app is pointed at a project.
    box.classList.toggle("hidden", !cloudOn());
    if (!cloudOn()) return;
    const inOK = signedIn();
    $("#acctSignedOut").classList.toggle("hidden", inOK);
    $("#acctSignedIn").classList.toggle("hidden", !inOK);
    $("#acctState").textContent = inOK ? userEmail() : "Not signed in";
    if (inOK) {
      const t = lastSyncAt();
      $("#acctSyncLine").textContent = syncing ? "Syncing…"
        : !t ? "Not synced yet."
        : `Last synced ${Math.max(0, Math.floor((NOW() - t) / 60000))} min ago.`;
      $("#acctSyncNow").disabled = syncing;
    }
  }
  function acctMsg(text, kind) {
    const m = $("#acctMsg");
    if (!m) return;
    m.textContent = text || "";
    m.className = "acct-msg" + (kind ? " " + kind : "");
  }
  if ($("#acctSignIn")) {
    const creds = () => ({
      email: ($("#acctEmail").value || "").trim(),
      password: $("#acctPass").value || ""
    });
    const guard = c => {
      if (!c.email || !c.password) { acctMsg("Enter an email and password.", "err"); return false; }
      if (c.password.length < 6) { acctMsg("Password needs at least 6 characters.", "err"); return false; }
      return true;
    };
    $("#acctSignIn").addEventListener("click", async () => {
      const c = creds(); if (!guard(c)) return;
      acctMsg("Signing in…");
      try {
        await signIn(c.email, c.password);
        $("#acctPass").value = "";
        acctMsg("");
        await cloudSync("manual");
        toast("Signed in — progress synced.");
      } catch (e) { acctMsg(e.message, "err"); }
    });
    $("#acctSignUp").addEventListener("click", async () => {
      const c = creds(); if (!guard(c)) return;
      acctMsg("Creating account…");
      try {
        const r = await signUp(c.email, c.password);
        $("#acctPass").value = "";
        if (r.confirmed) { acctMsg(""); await cloudSync("manual"); toast("Account created — progress synced."); }
        else acctMsg("Check your email to confirm, then sign in.", "ok");
      } catch (e) { acctMsg(e.message, "err"); }
    });
    $("#acctSignOut").addEventListener("click", signOut);
    $("#acctSyncNow").addEventListener("click", async () => {
      const ok = await cloudSync("manual");
      if (ok) toast("Synced.");
    });
  }


  $("#resetBtn").addEventListener("click", () => { closeModal("settingsModal"); resetProgress(); });

  // Force the newest version: wipe the service-worker caches and unregister it,
  // then reload — so the next load fetches everything fresh from the network,
  // no matter how stale the cached copy was. (Progress lives in localStorage,
  // which this does NOT touch.)
  async function forceUpdate() {
    const btn = $("#updateBtn");
    if (btn) { btn.disabled = true; btn.textContent = "Updating…"; }
    try {
      if (window.caches) {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
      }
      if (navigator.serviceWorker) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map(r => r.unregister()));
      }
    } catch (e) {}
    // cache-busting reload so even the HTML itself is re-fetched
    const u = new URL(location.href);
    u.searchParams.set("fresh", Date.now().toString());
    location.replace(u.toString());
  }
  if ($("#updateBtn")) $("#updateBtn").addEventListener("click", forceUpdate);

  // ---- Keyboard shortcuts ----
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      if (!$("#lessonSheet").classList.contains("hidden")) { closeLessonSheet(); return; }
      if (!$("#settingsModal").classList.contains("hidden")) { closeModal("settingsModal"); return; }
      if (!$("#helpModal").classList.contains("hidden")) { closeModal("helpModal"); return; }
      if (!$("#tonesModal").classList.contains("hidden")) { closeModal("tonesModal"); return; }
    }
    if (!$("#charModal").classList.contains("hidden")) {
      if (e.key === "Escape") closeCharModal();
      return;
    }
    if (!$("#study").classList.contains("hidden")) {
      const choices = $("#studyChoices");
      if (e.code === "Space" || e.key === "Enter") {
        e.preventDefault();
        if (!$("#studyContinueWrap").classList.contains("hidden")) {
          if (!$("#studyContinue").disabled) $("#studyContinue").click();
        } else if (writeNextFn && !$("#studyNext").classList.contains("hidden") && !$("#studyNext").disabled) {
          writeNextFn();
        }
      } else if (!choices.classList.contains("hidden") && !choices.dataset.answered) {
        const n = parseInt(e.key, 10);   // 1-4 picks an answer
        if (n >= 1 && n <= choices.children.length) choices.children[n - 1].click();
      }
    }
  });

  // ---- First-run onboarding ----
  const LS_ONBOARDED = "zhBeginnerA.onboarded.v1";
  function runOnboarding() {
    const ob = $("#onboard");
    const slides = [...ob.querySelectorAll(".ob-slide")];
    const dots = $("#obDots");
    dots.innerHTML = ""; slides.forEach(() => dots.appendChild(el("i")));
    let i = 0;
    const paint = () => {
      slides.forEach((s, k) => s.classList.toggle("on", k === i));
      [...dots.children].forEach((d, k) => d.classList.toggle("on", k === i));
      // display:none, NOT visibility:hidden — a hidden-but-present Back button
      // still occupies its width and shoves "Next" off-centre on the first slide.
      $("#obBack").style.display = i === 0 ? "none" : "";
      $("#obNext").textContent = i === slides.length - 1 ? "Start learning" : "Next";
    };
    // goal presets inside onboarding write straight to prefs
    ob.querySelectorAll("#obGoalSeg button").forEach(b =>
      b.addEventListener("click", () => {
        ob.querySelectorAll("#obGoalSeg button").forEach(x => x.classList.toggle("on", x === b));
        prefs.dailyGoal = +b.dataset.goal; savePrefs(prefs);
      }));
    const finish = () => {
      localStorage.setItem(LS_ONBOARDED, "1");
      ob.classList.add("hidden"); ob.setAttribute("aria-hidden", "true");
      renderPath(); renderHome();         // reflect the chosen goal on the HUD + Home
    };
    $("#obBack").addEventListener("click", () => { if (i > 0) { i--; paint(); } });
    $("#obNext").addEventListener("click", () => {
      if (i < slides.length - 1) { i++; paint(); } else finish();
    });
    hydrateIcons(ob);
    ob.classList.remove("hidden"); ob.setAttribute("aria-hidden", "false");
    paint();
  }

  // ---- Boot ----
  applyTheme();
  hydrateIcons();
  renderHome();
  show("home");                          // land on the Home dashboard (path renders on first Learn tap)
  renderAccount();
  if (cloudOn() && !signedIn() && !localStorage.getItem(LS_SKIPAUTH)) {
    openAuthGate();                       // no session yet — offer sign-in (skippable)
  } else {
    // Cached session (or no cloud configured): open the app immediately and sync
    // in the background. A failed sync must never block usage.
    if (cloudOn() && signedIn()) cloudSync("boot");
    if (!localStorage.getItem(LS_ONBOARDED)) runOnboarding();
  }
})();
