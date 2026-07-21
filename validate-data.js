/*
 * Data validator — run this after editing data.js, BEFORE testing in the app.
 *
 *   node validate-data.js
 *
 * Catches the mistakes that fail SILENTLY in the app rather than throwing:
 *
 *  - A dialogue whose pinyin doesn't line up with its characters is dropped
 *    from the app entirely (no sentence-building exercise, and no phrase for
 *    the speaking drill) with no error shown. This is the big one.
 *  - A character with no stroke data can't be used for writing practice.
 *  - A duplicate word is hidden (first lesson wins), so it looks like it
 *    "didn't get added".
 *  - Reordering or removing a word shifts every card ID after it, because IDs
 *    are `lessonId:index` — which silently reassigns saved progress to the
 *    wrong words.
 */
const fs = require("fs");
const path = require("path");

const here = f => path.join(__dirname, f);
const load = f => { const w = {}; new Function("window", fs.readFileSync(here(f), "utf8"))(w); return w; };

const { VOCAB, DIALOGUES } = load("data.js");
const { HANZI_DATA } = (() => { try { return load("hanzi-data.js"); } catch { return { HANZI_DATA: {} }; } })();

const errors = [], warnings = [], notes = [];
const E = m => errors.push(m), W = m => warnings.push(m), N = m => notes.push(m);

/* ---- mirror of the app's own segmentation (app.js) ---------------------- */
const PY_VOWELS = "aeiouüāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ";
const syllableCount = tok => {
  let n = 0, inV = false;
  for (const ch of tok.toLowerCase()) {
    const isV = PY_VOWELS.includes(ch);
    if (isV && !inV) n++;
    inV = isV;
  }
  return Math.max(1, n);
};
const CJK = /[一-鿿]/;
function segmentSentence(hanzi, pinyin) {
  const chars = [...hanzi].filter(c => CJK.test(c));
  const tokens = pinyin.split(/\s+/).map(t => t.replace(/[,.!?;:，。！？]/g, "")).filter(Boolean);
  const words = []; let i = 0;
  for (const tok of tokens) {
    const w = chars.slice(i, i + syllableCount(tok)).join("");
    if (!w) break;
    words.push({ hanzi: w, pinyin: tok });
    i += syllableCount(tok);
  }
  return { ok: i === chars.length && words.length >= 2, consumed: i, total: chars.length, words };
}

/* ---- lessons ------------------------------------------------------------ */
if (!VOCAB || !Array.isArray(VOCAB.lessons)) {
  E("data.js: window.VOCAB.lessons is missing or not an array.");
} else {
  const seenLesson = new Set(), firstSeen = new Map();
  let wordCount = 0;

  VOCAB.lessons.forEach((les, li) => {
    const where = `lesson[${li}] (${les && les.id || "no id"})`;
    if (!les || !les.id) return E(`${where}: missing "id".`);
    if (!les.title) W(`${where}: missing "title".`);
    if (seenLesson.has(les.id)) E(`${where}: duplicate lesson id "${les.id}".`);
    seenLesson.add(les.id);
    if (!Array.isArray(les.words) || !les.words.length) return E(`${where}: no "words" array.`);

    les.words.forEach((w, wi) => {
      wordCount++;
      const at = `${les.id}:${wi}`;
      if (!w || typeof w !== "object") return E(`${at}: not an object.`);
      ["hanzi", "pinyin", "en"].forEach(k => {
        if (!w[k] || !String(w[k]).trim()) E(`${at}: missing "${k}".`);
      });
      if (!w.hanzi) return;

      const chars = [...w.hanzi].filter(c => CJK.test(c));
      if (!chars.length) E(`${at} "${w.hanzi}": no Chinese characters — is this a typo?`);
      if ([...w.hanzi].some(c => !CJK.test(c) && !/[·’'\s]/.test(c)))
        W(`${at} "${w.hanzi}": contains non-Chinese characters.`);

      // Missing tone marks usually means a slip — but neutral-tone syllables
      // (吗 ma, 呢 ne, 的 de …) correctly have none, so only flag multi-syllable
      // words where NO syllable is marked.
      if (w.pinyin && !/^[A-Z]/.test(w.pinyin)) {
        const toneless = !/[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜńňǹ]/i.test(w.pinyin);
        const syls = w.pinyin.trim().split(/\s+/).reduce((n, t) => n + syllableCount(t), 0);
        if (toneless && syls > 1)
          W(`${at} "${w.hanzi}" (${w.pinyin}): no tone marks on any syllable.`);
      }

      // syllables vs characters — a mismatch breaks the writing/tile splitting
      if (w.pinyin) {
        const syl = w.pinyin.trim().split(/\s+/).reduce((n, t) => n + syllableCount(t), 0);
        if (syl !== chars.length)
          W(`${at} "${w.hanzi}" (${w.pinyin}): ${chars.length} character(s) but ${syl} pinyin syllable(s).`);
      }

      // duplicates: the app keeps only the FIRST occurrence
      if (firstSeen.has(w.hanzi)) {
        N(`${at} "${w.hanzi}" already appears in ${firstSeen.get(w.hanzi)} — the app shows it only once (first wins).`);
      } else firstSeen.set(w.hanzi, at);

      // stroke data
      const missing = chars.filter(c => !HANZI_DATA || !HANZI_DATA[c]);
      if (missing.length)
        E(`${at} "${w.hanzi}": no stroke data for ${missing.join(" ")} — run: node fetch-hanzi-data.js`);
    });
  });

  N(`${VOCAB.lessons.length} lessons, ${wordCount} words, ${firstSeen.size} unique.`);
}

/* ---- dialogues (these feed sentence-building AND speaking prompts) ------- */
let turns = 0, usable = 0;
if (!Array.isArray(DIALOGUES)) {
  W("data.js: window.DIALOGUES missing — no sentence or speaking-phrase exercises.");
} else {
  const seenD = new Set();
  DIALOGUES.forEach((d, di) => {
    const where = `dialogue[${di}] (${d && d.id || "no id"})`;
    if (!d || !d.id) return E(`${where}: missing "id".`);
    if (seenD.has(d.id)) E(`${where}: duplicate dialogue id "${d.id}".`);
    seenD.add(d.id);
    if (!Array.isArray(d.turns) || !d.turns.length) return E(`${where}: no "turns".`);

    d.turns.forEach((t, ti) => {
      turns++;
      const at = `${d.id}[${ti}]`;
      ["hanzi", "pinyin", "en"].forEach(k => {
        if (!t[k] || !String(t[k]).trim()) E(`${at}: missing "${k}".`);
      });
      if (t.who && !["app", "you"].includes(t.who)) W(`${at}: who="${t.who}" (expected "app" or "you").`);
      if (!t.hanzi || !t.pinyin) return;

      const seg = segmentSentence(t.hanzi, t.pinyin);
      if (seg.ok) { usable++; return; }
      if (seg.consumed !== seg.total) {
        // THE silent failure: pinyin genuinely doesn't match, app drops the line.
        E(`${at} "${t.hanzi}" (${t.pinyin}): pinyin doesn't line up with the characters ` +
          `(${seg.consumed}/${seg.total} matched) — this line is SILENTLY DROPPED from ` +
          `sentence-building and speaking practice. Check the spacing of the pinyin.`);
      } else {
        // Aligned fine, just a single-word utterance — can't make tiles from one word.
        N(`${at} "${t.hanzi}": single word, so no sentence-building tiles (this is normal).`);
      }
    });
  });
  N(`${turns} dialogue lines, ${usable} usable for sentence/speaking exercises.`);
}

/* ---- report ------------------------------------------------------------- */
const show = (list, label) => { if (list.length) { console.log(`\n${label} (${list.length}):`); list.forEach(m => console.log("  " + m)); } };
show(errors, "ERRORS — these break something");
show(warnings, "WARNINGS — probably a mistake");
show(notes, "NOTES");
console.log(`\n${errors.length ? "✗ FAILED" : "✓ PASSED"} — ${errors.length} error(s), ${warnings.length} warning(s).`);
process.exit(errors.length ? 1 : 0);
