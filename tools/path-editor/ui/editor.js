/* 步步 Path Editor — the editor itself.
 *
 * Everything it knows comes from the app, through /api/project: chapters,
 * stones, art, the saved layout and the path's own geometry. The screen you
 * pick loads the real app at that size (the preview on the right) and the
 * editor measures the path there, so what you place is where it lands. */
"use strict";

/* ---- screens ------------------------------------------------------------ */
const DEVICES = [
  { group: "Phones", id: "iphone-se", name: "iPhone SE", w: 375, h: 667 },
  { group: "Phones", id: "iphone-15", name: "iPhone 15 / 16", w: 393, h: 852, def: true },
  { group: "Phones", id: "iphone-pro-max", name: "iPhone 15 Pro Max", w: 430, h: 932 },
  { group: "Phones", id: "pixel-8", name: "Pixel 8", w: 412, h: 915 },
  { group: "Phones", id: "galaxy-s", name: "Galaxy S (small)", w: 360, h: 780 },
  { group: "Tablets", id: "ipad-mini", name: "iPad mini", w: 744, h: 1133 },
  { group: "Tablets", id: "ipad", name: "iPad (10th gen)", w: 820, h: 1180 },
  { group: "Tablets", id: "ipad-pro-11", name: "iPad Pro 11″", w: 834, h: 1194 },
  { group: "Tablets", id: "ipad-pro-13", name: "iPad Pro 13″", w: 1024, h: 1366 },
  { group: "Computers", id: "laptop", name: "Laptop", w: 1280, h: 800, desk: true },
  { group: "Computers", id: "macbook", name: "MacBook Air", w: 1440, h: 900, desk: true },
  { group: "Computers", id: "desktop", name: "Desktop (Full HD)", w: 1920, h: 1080, desk: true },
  { group: "Other", id: "custom", name: "Custom size…", w: 1024, h: 768 }
];

/* ---- state -------------------------------------------------------------- */
const $ = s => document.querySelector(s);
const P = { project: null };              // what the app has
const state = {
  theme: "light", cur: 3, zoom: 1, pieces: [], sel: null, headerSides: {},
  device: "iphone-15", landscape: false, preview: true, bad: {}, dropped: []
};
let G = null, uid = 1, ITEMS = [], savedJSON = "", baseHash = "", undoStack = [], redoStack = [];
let screen = { vw: 393, vh: 852, W: 393, hud: 62, measured: false };

const PREFS_KEY = "bubu.editor.prefs.v2", DRAFT_KEY = "bubu.editor.draft.v2", DEV_LAYOUT_KEY = "bubu.dev.pathLayout";
const store = {
  get(k) { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
  del(k) { try { localStorage.removeItem(k); } catch (e) {} }
};

/* ---- little helpers ----------------------------------------------------- */
function el(tag, cls, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
function toast(msg, err) {
  const t = el("div", "toast" + (err ? " err" : ""), esc(msg));
  $("#toasts").appendChild(t);
  setTimeout(() => { t.style.transition = "opacity .3s"; t.style.opacity = "0"; setTimeout(() => t.remove(), 320); }, err ? 7000 : 3200);
}
function modal({ title, body, ok = "OK", cancel = "Cancel", danger = false, onOpen }) {
  return new Promise(resolve => {
    $("#modalTitle").textContent = title;
    const b = $("#modalBody"); b.innerHTML = ""; if (typeof body === "string") b.innerHTML = body; else if (body) b.appendChild(body);
    const okB = $("#modalOk"), caB = $("#modalCancel");
    okB.textContent = ok; okB.className = "btn " + (danger ? "danger" : "primary");
    caB.textContent = cancel; caB.hidden = cancel === null;
    $("#modal").hidden = false;
    if (onOpen) onOpen(b); else okB.focus();
    const done = v => { $("#modal").hidden = true; okB.onclick = caB.onclick = null; document.removeEventListener("keydown", key, true); resolve(v); };
    const key = e => { if (e.key === "Escape") { e.stopPropagation(); done(false); } if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") { e.preventDefault(); e.stopPropagation(); done(true); } };
    document.addEventListener("keydown", key, true);
    okB.onclick = () => done(true); caB.onclick = () => done(false);
  });
}
function banner(text, actions, kind) {
  const b = $("#banner");
  if (!text) { b.hidden = true; return; }
  b.className = "banner" + (kind ? " " + kind : ""); b.hidden = false;
  $("#bannerText").textContent = text;
  const a = $("#bannerActions"); a.innerHTML = "";
  (actions || []).forEach(([label, fn, cls]) => { const x = el("button", "btn " + (cls || ""), esc(label)); x.onclick = fn; a.appendChild(x); });
}
async function api(path, body) {
  const r = await fetch(path, body ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) } : {});
  const j = await r.json().catch(() => ({ ok: false, error: "The editor server sent back something unreadable." }));
  if (!r.ok || j.ok === false) throw Object.assign(new Error(j.error || r.statusText), { status: r.status });
  return j;
}

/* ---- the current screen ------------------------------------------------- */
function device() { return DEVICES.find(d => d.id === state.device) || DEVICES[1]; }
function viewport() {
  const d = device();
  let w = d.id === "custom" ? +$("#customW").value || 1024 : d.w, h = d.id === "custom" ? +$("#customH").value || 768 : d.h;
  if (state.landscape) [w, h] = [h, w];
  return { w: Math.max(280, w), h: Math.max(400, h) };
}
const isPhone = () => screen.vw <= P.project.phoneMax;
const cfg = () => isPhone() ? P.project.cfg.phone : P.project.cfg.desktop;
const kx = () => screen.W / 390;         // the app scales sideways offsets from a 390-wide composition

/* ---- the app's path geometry (renderPath in app.js) ---------------------- */
const BANNER_H = 72, HGAP = 36, BUBBLE = 40;
function stoneShape(id) { let h = 0; for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0; return h % 5; }
function geom(cur) {
  const c = cfg(), W = screen.W, HUD_H = screen.hud;
  const bubble = i => (i === cur ? BUBBLE : 0);
  const ys = []; let y = HUD_H + 16 + BANNER_H + bubble(0) + c.size / 2;
  ITEMS.forEach((it, i) => { if (it.chapter && i > 0) y += HGAP + BANNER_H + bubble(i); ys.push(y); y += c.gap; });
  let k = 0; for (let i = 0; i < ITEMS.length; i++) k = Math.max(k, Math.abs(Math.sin(i * 2 * Math.PI / c.per)));
  if (k < 1e-6) k = 1;
  const half = c.size / 2 + 8;
  const xs = ITEMS.map((_, i) => Math.max(half, Math.min(W - half, W / 2 + c.wave * Math.sin((i + (c.phase || 0)) * 2 * Math.PI / c.per) / k)));
  const headers = [];
  ITEMS.forEach((it, i) => {
    if (!it.chapter) return;
    const top = ys[i] - c.size / 2 - bubble(i), prev = i === 0 ? HUD_H : ys[i - 1] + c.size / 2, mid = (prev + top) / 2;
    const chosen = state.headerSides[it.id];
    const right = chosen ? chosen === "right" : i > 0 && (xs[i - 1] + xs[i]) / 2 < W / 2;
    headers.push({ i, mid, right, chosen: !!chosen, x0: right ? W * .38 : 0, x1: right ? W : W * .62, y0: mid - BANNER_H / 2, y1: mid + BANNER_H / 2 });
  });
  return { c, W, ys, xs, headers, height: ys[ys.length - 1] + c.pad };
}

/* ---- pieces ------------------------------------------------------------- */
function defaults(art) {
  const a = P.project.art[art];
  return { id: uid++, art, w: a.w, flip: false, behind: !/^panda|^cluster-right-bamboo/.test(art), stone: 0, dx: 0, dy: 0 };
}
function px(p) { return { cx: G.xs[p.stone] + p.dx * kx(), base: G.ys[p.stone] + p.dy }; }
function anchor(p, cx, base) {
  let best = 0, bd = 1e9;
  for (let i = 0; i < G.ys.length; i++) { const d = Math.abs(G.ys[i] - base); if (d < bd) { bd = d; best = i; } }
  p.stone = best; p.dx = Math.round((cx - G.xs[best]) / kx() * 10) / 10; p.dy = Math.round((base - G.ys[best]) * 10) / 10;
}
function dims(p) { const w = G.W * p.w / 100; return { w, h: w * P.project.art[p.art].ar }; }
const artSrc = (art, theme) => { const f = P.project.artFiles[art]; return f && (f[theme || state.theme] || f.light) || ""; };
const stoneSrc = (st, n) => `/app/images/path/stone-${state.theme}-${st}-${n}.webp`;

/* ---- overlap check, on the same strips the app uses ----------------------- */
function strips(p) {
  const d = dims(p), q = px(p), x0 = q.cx - d.w / 2, y0 = q.base - d.h, sl = P.project.slabs[p.art] || [[0, 1]], out = [];
  sl.forEach((s, r) => {
    if (!s) return;
    const l = p.flip ? 1 - s[1] : s[0], rr = p.flip ? 1 - s[0] : s[1];
    out.push({ x0: x0 + l * d.w, x1: x0 + rr * d.w, y0: y0 + d.h * r / sl.length, y1: y0 + d.h * (r + 1) / sl.length });
  });
  return out;
}
const overlap = (a, b, pad) => a.x0 < b.x1 + pad && a.x1 > b.x0 - pad && a.y0 < b.y1 + pad && a.y1 > b.y0 - pad;
function checkAll() {
  const c = G.c, R = P.project.stoneRatio;
  const stones = G.ys.map((y, i) => ({ x0: G.xs[i] - c.size * R / 2, x1: G.xs[i] + c.size * R / 2, y0: y - c.size / 2, y1: y + c.size / 2 }));
  const all = state.pieces.map(strips), bad = {};
  state.pieces.forEach((p, i) => {
    const why = new Set();
    all[i].forEach(s => {
      stones.forEach((b, k) => { if (overlap(s, b, 0)) why.add("stone " + ITEMS[k].hero); });
      G.headers.forEach(h => { if (overlap(s, h, 4)) why.add("a chapter header"); });
      all.forEach((o, j) => { if (j !== i) o.forEach(t => { if (overlap(s, t, 2)) why.add(state.pieces[j].art); }); });
      const d = dims(p);
      if (s.x1 < 0 || s.x0 > G.W) why.add("off the screen");
      else if (d.w > 0 && (s.x0 < -d.w * .6 || s.x1 > G.W + d.w * .6)) why.add("mostly off the screen");
    });
    if (why.size) bad[p.id] = [...why].join(", ");
  });
  return bad;
}

/* ---- drawing ------------------------------------------------------------ */
const stage = $("#stage");
const SC = { patchW: 1.20, patchSquash: .66, pebEvery: 9.2, pebSize: 11, pebVar: .63, pebWander: 31, pebClear: 4 };
function noise(n) { const v = Math.sin(n * 12.9898) * 43758.5453; return (v - Math.floor(v)) * 2 - 1; }

function renderStage() {
  if (!P.project) return;
  G = geom(state.cur);
  const c = G.c, R = P.project.stoneRatio, unit = c.size / 74;
  stage.className = "stage " + state.theme;
  stage.style.width = G.W + "px";
  stage.style.height = G.height + "px";
  stage.innerHTML = "";
  stage.appendChild(el("div", "hud", "<span>🔥 3</span><span>◯ 0/20</span><span>⚙</span>"));
  ITEMS.forEach((it, i) => {
    const w = c.size * R * SC.patchW, g = el("div", "pground g" + (i % 4));
    g.style.width = w + "px"; g.style.height = (w * SC.patchSquash) + "px";
    g.style.left = G.xs[i] + "px"; g.style.top = (G.ys[i] + c.size * .14) + "px";
    stage.appendChild(g);
  });
  // pebbles threading the path
  const ys = G.ys, n = ys.length;
  const curve = t => { const f = t * (n - 1), i = Math.max(0, Math.min(n - 2, Math.floor(f))); let u = f - i; u = u * u * (3 - 2 * u);
    return { x: G.xs[i] + (G.xs[i + 1] - G.xs[i]) * u, y: ys[i] + (ys[i + 1] - ys[i]) * u }; };
  const span = ys[n - 1] - ys[0], count = Math.max(0, Math.round(span / (SC.pebEvery * unit)));
  const halfW = c.size * R / 2 + SC.pebClear * unit, halfH = c.size / 2 + SC.pebClear * unit;
  for (let k = 1; k <= count; k++) {
    const t = k / (count + 1), p = curve(t), q = curve(Math.min(1, t + 0.002));
    const dx = q.x - p.x, dy = q.y - p.y, len = Math.hypot(dx, dy) || 1;
    const off = SC.pebWander * unit * noise(k * 1.7), w = SC.pebSize * unit * (1 + SC.pebVar * noise(k * 4.3));
    const bx = p.x - dy / len * off, by = p.y + dx / len * off;
    let hidden = false;
    for (let i = 0; i < n && !hidden; i++) { const ex = (bx - G.xs[i]) / (halfW + w / 2), ey = (by - ys[i]) / (halfH + w / 2); if (ex * ex + ey * ey < 1) hidden = true; }
    G.headers.forEach(h => { if (bx > h.x0 - w && bx < h.x1 + w && by > h.y0 - w && by < h.y1 + w) hidden = true; });
    if (hidden) continue;
    const pb = el("div", "ppebble"); pb.style.width = Math.max(3, w) + "px"; pb.style.height = Math.max(2, w * .62) + "px";
    pb.style.left = bx + "px"; pb.style.top = by + "px"; pb.style.backgroundImage = `url(${stoneSrc("locked", 4)})`;
    stage.appendChild(pb);
  }
  // stones
  const hero = P.project.hero;
  ITEMS.forEach((it, i) => {
    const st = i < state.cur ? "done" : i === state.cur ? "now" : "locked";
    const s = el("div", "stone " + st);
    s.style.width = Math.round(c.size * R) + "px"; s.style.height = c.size + "px";
    s.style.left = G.xs[i] + "px"; s.style.top = ys[i] + "px";
    s.style.backgroundImage = `url(${stoneSrc(st, stoneShape(it.id))})`;
    const h = el("div", "hero", esc(it.hero));
    h.style.fontSize = (c.size * hero.size / 74) + "px"; h.style.transform = `translateY(${c.size * hero.dy / 74}px)`;
    s.appendChild(h);
    if (st === "now") s.appendChild(el("div", "start", "START"));
    s.title = `${it.id} · ${P.project.titles[it.id] || ""}`;
    stage.appendChild(s);
  });
  // chapter headers
  const unitCh = {};
  P.project.chapters.forEach(ch => { unitCh[ch.unit] = (unitCh[ch.unit] || 0) + 1; ch.chNo = unitCh[ch.unit]; });
  G.headers.forEach(h => {
    const ch = ITEMS[h.i].chapter;
    const done = ch.lessons.filter(id => ITEMS.findIndex(x => x.id === id) < state.cur).length;
    const d = el("div", "pchapter" + (h.right ? " right" : "") + (h.chosen ? " chosen" : ""));
    d.innerHTML = `<div class="u">UNIT ${esc(ch.unit)} · CHAPTER ${ch.chNo}</div><div class="t">${esc(ch.title)}</div>` +
      `<div class="bar"><i style="width:${Math.round(done / ch.lessons.length * 100)}%"></i></div><div class="n">${done} / ${ch.lessons.length} lessons</div>`;
    d.style.top = h.mid + "px"; if (!h.right) d.style.left = "0";
    d.title = h.chosen ? "Placed by hand. Click to swap sides, Alt+click to let the app choose." : "Click to move this header to the other side of the path";
    d.onpointerdown = ev => ev.stopPropagation();
    d.onclick = ev => {
      snapshot();
      if (ev.altKey) delete state.headerSides[ITEMS[h.i].id];
      else state.headerSides[ITEMS[h.i].id] = h.right ? "left" : "right";
      changed(); renderStage();
    };
    d.dataset.chapter = ITEMS[h.i].id;
    stage.appendChild(d);
  });
  // where each screenful ends on this device, and the review button
  for (let gy = screen.vh; gy < G.height; gy += screen.vh) {
    const g = el("div", "guide", `<i>screen ${Math.round(gy / screen.vh) + 1}</i>`); g.style.top = gy + "px"; stage.appendChild(g);
  }
  const fab = el("div", "fabguide", "review button at the end"); fab.style.top = (G.height - 128) + "px"; stage.appendChild(fab);
  state.pieces.forEach(renderPiece);
  refreshWarnings(); renderList(); renderProps(); placeTools(); applyZoom();
  $("#geomText").textContent = `${screen.vw}×${screen.vh} · path ${Math.round(G.W)}px wide · ${isPhone() ? "phone" : "tablet/desktop"} stones ${c.size}px` + (screen.measured ? "" : " · estimated");
}
function renderPiece(p) {
  const d = dims(p), q = px(p);
  const e = document.getElementById("p" + p.id) || el("div");
  e.id = "p" + p.id;
  e.className = "piece" + (p.behind ? "" : " front") + (p.flip ? " flip" : "") + (state.sel === p.id ? " sel" : "") + (state.bad[p.id] ? " bad" : "");
  e.style.width = d.w + "px"; e.style.height = d.h + "px";
  e.style.left = (q.cx - d.w / 2) + "px"; e.style.top = (q.base - d.h) + "px";
  let html = "";
  if (/^panda/.test(p.art)) { const gw = d.w * .82, gh = gw * .38; html += `<div class="patch" style="width:${gw}px;height:${gh}px;bottom:${-gh * .38}px"></div>`; }
  const lit = P.project.lights[p.art];
  if (lit) { const lx = p.flip ? 100 - lit.x : lit.x; html += `<div class="glow" style="--lx:${((35 + lx) / 170 * 100).toFixed(1)}%;--ly:${((45 + lit.y) / 190 * 100).toFixed(1)}%"></div>`; }
  html += `<img alt="" draggable="false" src="${artSrc(p.art)}">`;
  e.innerHTML = html;
  e.onpointerdown = ev => startDrag(ev, p);
  if (!e.parentNode) stage.appendChild(e);
  return e;
}
function refreshWarnings() {
  const bad = checkAll(); state.bad = bad;
  state.pieces.forEach(p => { const e = document.getElementById("p" + p.id); if (e) { e.classList.toggle("bad", !!bad[p.id]); e.title = bad[p.id] ? `${p.art} — touches ${bad[p.id]}` : p.art; } });
  renderIssues();
}

/* ---- interaction -------------------------------------------------------- */
let drag = null;
function startDrag(ev, p) {
  if (ev.button !== 0) return;
  ev.preventDefault(); ev.stopPropagation();
  select(p.id);
  const q = px(p);
  drag = { p, sx: ev.clientX, sy: ev.clientY, cx: q.cx, base: q.base, moved: false, before: snap() };
}
window.addEventListener("pointermove", ev => {
  if (!drag) return;
  const dx = ev.clientX - drag.sx, dy = ev.clientY - drag.sy;
  if (!drag.moved && Math.hypot(dx, dy) < 3) return;
  drag.moved = true;
  anchor(drag.p, drag.cx + dx / state.zoom, drag.base + dy / state.zoom);
  renderPiece(drag.p); refreshWarnings(); renderProps(true); placeTools();
});
window.addEventListener("pointerup", () => {
  if (!drag) return;
  if (drag.moved) { pushUndo(drag.before); changed(); renderList(); renderProps(); }
  drag = null;
});
function placeTools() {
  const t = $("#ptools"), p = selected();
  if (!p || !G) { t.hidden = true; return; }
  const q = px(p);
  t.hidden = false;
  t.style.left = (40 + Math.max(0, Math.min(G.W - 150, q.cx - 80))) + "px";
  t.style.top = (40 + q.base + 8) + "px";
  t.style.transform = `scale(${1 / state.zoom})`;
  $("#t-behind").textContent = p.behind ? "Bring in front" : "Send behind";
}
function select(id) {
  state.sel = id;
  state.pieces.forEach(p => { const e = document.getElementById("p" + p.id); if (e) e.classList.toggle("sel", p.id === id); });
  renderList(); renderProps(); placeTools();
}
const selected = () => state.pieces.find(p => p.id === state.sel);

/* ---- undo --------------------------------------------------------------- */
const snap = () => JSON.stringify({ p: state.pieces, h: state.headerSides });
function unsnap(s) { const o = JSON.parse(s); state.pieces = o.p; state.headerSides = o.h || {}; }
function pushUndo(s) { undoStack.push(s); if (undoStack.length > 200) undoStack.shift(); redoStack = []; updateUndo(); }
function snapshot() { pushUndo(snap()); }
function undo() { if (!undoStack.length) return; redoStack.push(snap()); unsnap(undoStack.pop()); state.sel = null; changed(); renderStage(); updateUndo(); }
function redo() { if (!redoStack.length) return; undoStack.push(snap()); unsnap(redoStack.pop()); state.sel = null; changed(); renderStage(); updateUndo(); }
function updateUndo() { $("#undo").disabled = !undoStack.length; $("#redo").disabled = !redoStack.length; }

function addPiece(art) {
  snapshot();
  const p = defaults(art), d = dims(p), a = P.project.art[art], W = G.W;
  const main = $("#canvas");
  const viewMid = (main.scrollTop + main.clientHeight / 2) / state.zoom - 40;
  const cx = a.side === "left" ? d.w / 2 - W * .02 : a.side === "right" ? W - d.w / 2 + W * .02 : /^panda/.test(art) ? W * .79 : /^grass/.test(art) ? W * .5 : W * .7;
  anchor(p, cx, Math.max(screen.hud + d.h + 8, Math.min(G.height, viewMid + d.h / 2)));
  state.pieces.push(p);
  renderPiece(p); select(p.id); refreshWarnings(); changed();
}
function removeSel() { const p = selected(); if (!p) return; snapshot(); state.pieces = state.pieces.filter(x => x !== p); const e = document.getElementById("p" + p.id); if (e) e.remove(); state.sel = null; refreshWarnings(); renderList(); renderProps(); placeTools(); changed(); }
function mutate(fn) { const p = selected(); if (!p) return; snapshot(); fn(p); renderPiece(p); refreshWarnings(); renderList(); renderProps(); placeTools(); changed(); }
function duplicateSel() { const p = selected(); if (!p) return; snapshot(); const c = JSON.parse(JSON.stringify(p)); c.id = uid++; c.dx += 30; state.pieces.push(c); renderPiece(c); select(c.id); refreshWarnings(); changed(); }

/* ---- side panels -------------------------------------------------------- */
function renderProps(light) {
  const box = $("#props"), p = selected();
  if (!p) { box.innerHTML = '<div class="empty">Nothing selected. Click a piece on the path.</div>'; delete box.dataset.id; return; }
  const q = px(p), posText = `x ${Math.round(q.cx)} · base ${Math.round(q.base)} · on stone ${ITEMS[p.stone].hero} (${ITEMS[p.stone].id}) · offset ${p.dx}, ${p.dy}`;
  if (light && box.dataset.id == p.id) { const pos = box.querySelector(".pos"); if (pos) pos.textContent = posText; return; }
  box.dataset.id = p.id;
  box.innerHTML =
    `<div class="row"><img src="${artSrc(p.art)}" alt="" style="width:36px;height:36px;object-fit:contain"><span class="title">${esc(p.art)}</span></div>` +
    `<div class="row pos">${esc(posText)}</div>` +
    `<div class="row"><label for="pw">Width, % of screen</label><input id="pw" type="range" min="2" max="95" step="0.1" value="${p.w}"><span class="val" id="pwv">${(+p.w).toFixed(1)}</span></div>` +
    `<div class="row"><label for="pf">Flip</label><input id="pf" type="checkbox"${p.flip ? " checked" : ""}></div>` +
    `<div class="row"><label for="pb">Behind the stones</label><input id="pb" type="checkbox"${p.behind ? " checked" : ""}></div>` +
    `<div class="row"><button class="btn" id="pdup">Duplicate</button><button class="btn danger" id="pdel">Remove</button></div>` +
    (state.bad[p.id] ? `<div class="row warn">Touches ${esc(state.bad[p.id])}</div>` : "");
  let before = null;
  box.querySelector("#pw").oninput = function () {
    const p = selected(); if (!p) return;
    if (!before) before = snap();
    p.w = +this.value; box.querySelector("#pwv").textContent = p.w.toFixed(1);
    renderPiece(p); refreshWarnings(); placeTools();
  };
  box.querySelector("#pw").onchange = () => { if (before) pushUndo(before); before = null; renderList(); changed(); renderProps(); };
  box.querySelector("#pf").onchange = () => mutate(p => { p.flip = !p.flip; });
  box.querySelector("#pb").onchange = () => mutate(p => { p.behind = !p.behind; });
  box.querySelector("#pdel").onclick = removeSel;
  box.querySelector("#pdup").onclick = duplicateSel;
}
function focusPiece(p) { select(p.id); const e = document.getElementById("p" + p.id); if (e) e.scrollIntoView({ block: "center", inline: "center", behavior: "smooth" }); }
function renderList() {
  const list = $("#list"); list.innerHTML = "";
  state.pieces.slice().sort((a, b) => px(a).base - px(b).base).forEach(p => {
    const d = el("div", (p.id === state.sel ? "sel" : "") + (state.bad[p.id] ? " bad" : ""));
    d.innerHTML = `<b>${esc(p.art)}</b>${p.flip ? " ⇋" : ""}<span>${esc(ITEMS[p.stone].hero)} ${esc(ITEMS[p.stone].id)}</span>`;
    d.onclick = () => focusPiece(p);
    list.appendChild(d);
  });
  $("#count").textContent = `(${state.pieces.length})`;
}
function renderIssues() {
  const box = $("#issues"); box.innerHTML = "";
  let n = 0;
  state.pieces.forEach(p => {
    if (!state.bad[p.id]) return; n++;
    const d = el("div", "", `<b>${esc(p.art)}</b> touches ${esc(state.bad[p.id])}`); d.onclick = () => focusPiece(p); box.appendChild(d);
  });
  state.dropped.forEach(q => { n++; box.appendChild(el("div", "note", `${esc(q.art)} was on stone “${esc(q.stone)}”, which the app no longer has. It will be dropped when you save.`)); });
  (P.project && P.project.missing || []).forEach(id => { n++; box.appendChild(el("div", "note", `Chapter lesson “${esc(id)}” isn't in data.js.`)); });
  $("#issueCount").textContent = n ? `(${n})` : "";
}
function renderChapters() {
  const box = $("#chapters"); box.innerHTML = "";
  const unitCh = {};
  P.project.chapters.forEach(ch => {
    unitCh[ch.unit] = (unitCh[ch.unit] || 0) + 1;
    const b = el("button", "", `<small>UNIT ${esc(ch.unit)} · CHAPTER ${unitCh[ch.unit]}</small>${esc(ch.title)}<br><span>${ch.lessons.map(id => esc(P.project.heroes[id] || "")).join(" ")}</span>`);
    b.onclick = () => { const h = stage.querySelector(`.pchapter[data-chapter="${ch.lessons[0]}"]`); if (h) h.scrollIntoView({ block: "start", behavior: "smooth" }); };
    box.appendChild(b);
  });
}
function palettes() {
  ["pal-land", "pal-fol", "pal-grass", "pal-panda", "pal-orig"].forEach(id => { $("#" + id).innerHTML = ""; });
  const add = (id, arts) => arts.forEach(art => {
    const b = el("button"); b.title = `${art} — click to add`; b.innerHTML = `<img alt="${esc(art)}" src="${artSrc(art)}">`;
    b.onclick = () => addPiece(art); $("#" + id).appendChild(b);
  });
  const arts = Object.keys(P.project.art);
  add("pal-land", arts.filter(a => /^land-/.test(a)));
  add("pal-fol", arts.filter(a => /^fol-/.test(a)));
  add("pal-grass", arts.filter(a => /^grass-/.test(a)));
  add("pal-panda", arts.filter(a => /^panda/.test(a)));
  add("pal-orig", arts.filter(a => /^cluster/.test(a)));
}

/* ---- layout in and out --------------------------------------------------- */
function exportLayout() {
  return {
    version: 1, phone: true, headers: Object.fromEntries(Object.entries(state.headerSides).sort()),
    pieces: state.pieces.slice().sort((a, b) => a.stone - b.stone || (a.dy - b.dy))
      .map(p => ({ art: p.art, stone: ITEMS[p.stone].id, dx: p.dx, dy: p.dy, w: +(+p.w).toFixed(1), flip: !!p.flip, behind: !!p.behind }))
  };
}
function importLayout(o) {
  const pieces = [], dropped = [];
  (o.pieces || []).forEach(q => {
    const idx = ITEMS.findIndex(it => it.id === q.stone);
    if (idx < 0 || !P.project.art[q.art]) { dropped.push(q); return; }
    const p = defaults(q.art); Object.assign(p, { stone: idx, dx: +q.dx, dy: +q.dy, w: +q.w, flip: !!q.flip, behind: !!q.behind }); pieces.push(p);
  });
  return { pieces, headers: Object.assign({}, o.headers || {}), dropped };
}
const layoutJSON = () => JSON.stringify(exportLayout());
const isDirty = () => P.project && layoutJSON() !== savedJSON;

let pushTimer = null;
function changed() {
  const dirty = isDirty();
  const s = $("#saveState");
  s.textContent = dirty ? "● Unsaved changes" : "✓ Saved in the app";
  s.className = "save-state " + (dirty ? "dirty" : "clean");
  document.title = (dirty ? "● " : "") + "步步 Path Editor";
  if (dirty) store.set(DRAFT_KEY, { baseHash, layout: exportLayout(), at: Date.now() }); else store.del(DRAFT_KEY);
  clearTimeout(pushTimer); pushTimer = setTimeout(pushPreview, 120);
}

/* ---- the live preview ---------------------------------------------------- */
// The preview is the real app, served from the same address as the editor,
// so the two share storage: the editor hands the app its layout and the
// current lesson, and the app redraws (a hook in app.js, localhost only).
function seedPreviewStorage() {
  try {
    localStorage.setItem("zhBeginnerA.onboarded.v1", "1");
    localStorage.setItem("zhBeginnerA.skipAuth.v1", "1");
    localStorage.setItem("zhBeginnerA.done.v1", JSON.stringify(ITEMS.slice(0, state.cur).map(it => it.id)));
    localStorage.setItem(DEV_LAYOUT_KEY, JSON.stringify(exportLayout()));
  } catch (e) {}
}
function pushPreview() {
  if (!P.project) return;
  try {
    localStorage.setItem(DEV_LAYOUT_KEY, JSON.stringify(exportLayout()));
    const done = JSON.stringify(ITEMS.slice(0, state.cur).map(it => it.id));
    if (localStorage.getItem("zhBeginnerA.done.v1") !== done) localStorage.setItem("zhBeginnerA.done.v1", done);
  } catch (e) {}
}
function frameDoc() { try { return $("#preview").contentDocument; } catch (e) { return null; } }
let measureToken = 0;
function loadPreview() {
  const vp = viewport(), token = ++measureToken, f = $("#preview"), frame = $("#deviceFrame");
  screen = { vw: vp.w, vh: vp.h, W: Math.min(vp.w, 620), hud: 62, measured: false };
  f.style.width = vp.w + "px"; f.style.height = vp.h + "px";
  frame.classList.toggle("desk", !!device().desk || vp.w > 1100);
  fitPreview();
  seedPreviewStorage();
  f.src = "/app/index.html?view=path&editor=" + Date.now();
  $("#previewLabel").textContent = `${device().id === "custom" ? "Custom" : device().name}${state.landscape ? " (landscape)" : ""} · ${vp.w}×${vp.h}`;
  $("#dimLabel").textContent = `${vp.w} × ${vp.h}`;
  renderStage();
  // measure the path inside the real app, then redraw to its numbers
  const t0 = Date.now();
  (function poll() {
    if (token !== measureToken) return;
    const d = frameDoc(), wrap = d && d.querySelector("#pathList");
    if (d && d.body && d.body.dataset.view === "path" && wrap && wrap.clientWidth > 0 && wrap.querySelector(".pnode")) {
      const hudEl = d.querySelector(".path-top");
      screen.W = wrap.clientWidth; screen.hud = (hudEl && hudEl.offsetHeight) || 62; screen.measured = true;
      applyTheme(); renderStage(); syncScroll();
      return;
    }
    if (Date.now() - t0 < 12000) setTimeout(poll, 150);
    else { toast("Couldn't measure the path in the preview, so the editor is estimating this screen.", true); renderStage(); }
  })();
}
function fitPreview() {
  const vp = viewport(), well = $("#deviceWell"), frame = $("#deviceFrame");
  const pad = 28, availW = Math.max(100, well.clientWidth - pad), availH = Math.max(100, well.clientHeight - pad);
  const fw = vp.w + 20, fh = vp.h + 20;
  const s = Math.min(1, availW / fw, availH / fh);
  frame.style.transform = `scale(${s})`;
  frame.style.marginBottom = (-(1 - s) * fh) + "px";
}
function applyTheme() {
  const d = frameDoc(); if (!d || !d.documentElement) return;
  d.documentElement.dataset.theme = state.theme;
}
function syncScroll() {
  if (!$("#syncScroll").checked || !state.preview) return;
  const d = frameDoc(), sc = d && d.querySelector("#pathScroll"); if (!sc) return;
  const main = $("#canvas");
  sc.scrollTop = Math.max(0, main.scrollTop / state.zoom - 40);
}

/* ---- zoom ---------------------------------------------------------------- */
function applyZoom() {
  const z = $("#zoomer"); if (!G) return;
  z.style.transform = `scale(${state.zoom})`;
  z.style.width = (G.W + 80) + "px"; z.style.height = (G.height + 80) + "px";
  z.style.marginRight = ((G.W + 80) * (state.zoom - 1)) + "px";
  z.style.marginBottom = ((G.height + 80) * (state.zoom - 1)) + "px";
  $("#zoomVal").textContent = Math.round(state.zoom * 100) + "%";
  placeTools();
}
function setZoom(z, keepCentre = true) {
  const main = $("#canvas"), old = state.zoom;
  const cx = (main.scrollLeft + main.clientWidth / 2) / old, cy = (main.scrollTop + main.clientHeight / 2) / old;
  state.zoom = Math.max(.25, Math.min(3, Math.round(z * 100) / 100));
  applyZoom();
  if (keepCentre) { main.scrollLeft = cx * state.zoom - main.clientWidth / 2; main.scrollTop = cy * state.zoom - main.clientHeight / 2; }
  savePrefs();
}
function fitZoom() { const main = $("#canvas"); setZoom(Math.min(1.5, (main.clientWidth - 30) / (G.W + 80)), false); }

/* ---- loading from the app -------------------------------------------------- */
async function loadProject(opts = {}) {
  const pr = await api("/api/project");
  P.project = pr; baseHash = pr.hash;
  ITEMS = [];
  pr.chapters.forEach((ch, ci) => ch.lessons.forEach((id, li) => ITEMS.push({ id, hero: pr.heroes[id] || "字", chapter: li === 0 ? ch : null, ci })));
  if (state.cur >= ITEMS.length) state.cur = Math.max(0, ITEMS.length - 1);
  const saved = importLayout(pr.layout);
  savedJSON = JSON.stringify(exportFrom(saved));
  state.dropped = saved.dropped;
  const draft = store.get(DRAFT_KEY);
  if (opts.keep) { /* keep what's on screen */ }
  else { state.pieces = saved.pieces; state.headerSides = saved.headers; state.sel = null; undoStack = []; redoStack = []; updateUndo(); }
  // lesson picker
  const cur = $("#cur"); cur.innerHTML = "";
  ITEMS.forEach((it, i) => { const o = el("option"); o.value = i; o.textContent = `${i + 1}. ${it.hero}  ${it.id}`; cur.appendChild(o); });
  cur.value = state.cur;
  $("#buildChip").textContent = `app build v${pr.build} · ${ITEMS.length} stones · ${pr.chapters.length} chapters`;
  renderGit(pr.git);
  palettes(); renderChapters();
  $("#loading").hidden = true;
  if (!opts.keep && draft && draft.layout && JSON.stringify(draft.layout) !== JSON.stringify(exportFrom(saved))) {
    banner(`You have unsaved edits from ${new Date(draft.at).toLocaleString()}.`, [
      ["Restore them", () => { const d = importLayout(draft.layout); snapshot(); state.pieces = d.pieces; state.headerSides = d.headers; changed(); renderStage(); banner(); toast("Draft restored."); }, "primary"],
      ["Discard", () => { store.del(DRAFT_KEY); banner(); }]
    ]);
  } else if (!opts.keep) banner();
  changed();
  loadPreview();
}
// the saved layout, normalised the same way the editor exports, for comparing
function exportFrom(imp) {
  const keep = { pieces: state.pieces, headers: state.headerSides };
  state.pieces = imp.pieces; state.headerSides = imp.headers;
  const out = exportLayout();
  state.pieces = keep.pieces; state.headerSides = keep.headers;
  return out;
}
async function reloadFromApp() {
  if (isDirty()) {
    const ok = await modal({ title: "Reload from the app?", body: "<p>This loads the layout saved in app.js. Your unsaved edits are kept as a draft, and you can restore them afterwards.</p>", ok: "Reload" });
    if (!ok) return;
    store.set(DRAFT_KEY, { baseHash, layout: exportLayout(), at: Date.now() });
  }
  try { await loadProject(); toast("Loaded the latest from the app."); } catch (e) { toast("Couldn't load the app: " + e.message, true); }
}

/* ---- save and publish ------------------------------------------------------ */
async function save({ quiet } = {}) {
  if (!isDirty()) { if (!quiet) toast("Nothing to save: the app already has this layout."); return true; }
  const n = Object.keys(state.bad).length;
  if (n && !quiet) {
    const ok = await modal({ title: `${n} piece${n > 1 ? "s" : ""} overlapping`, body: "<p>Some pieces touch a stone, a header or each other. Save anyway?</p>", ok: "Save anyway" });
    if (!ok) return false;
  }
  $("#save").disabled = true;
  try {
    const r = await api("/api/save", { layout: exportLayout(), baseHash, bump: true });
    baseHash = r.hash; savedJSON = layoutJSON(); state.dropped = [];
    if (r.build) { P.project.build = r.build.to; $("#buildChip").textContent = `app build v${r.build.to} · ${ITEMS.length} stones · ${P.project.chapters.length} chapters`; }
    changed(); renderIssues();
    toast(`Saved ${r.pieces} pieces into app.js${r.build ? ` · build v${r.build.from} → v${r.build.to}` : ""}.`);
    refreshGit();
    return true;
  } catch (e) {
    if (e.status === 409) banner("The app's files changed since the editor loaded them. Reload to pick up the changes; your edits are kept as a draft.", [["Reload", reloadFromApp, "primary"]]);
    toast("Not saved: " + e.message, true);
    return false;
  } finally { $("#save").disabled = false; }
}
async function publish() {
  if (isDirty()) { const ok = await save(); if (!ok) return; }
  const g = await api("/api/git").catch(() => null);
  const ours = g && g.dirty ? g.dirty.filter(f => /^(app\.js|index\.html|sw\.js)$/.test(f)) : [];
  if (g && !ours.length && !g.ahead) { toast("Nothing to publish: the live app already has this layout."); return; }
  const others = g && g.dirty ? g.dirty.filter(f => !ours.includes(f)) : [];
  const box = el("div");
  box.innerHTML = `<p>This commits the saved layout and pushes it, so it goes live on your phone the next time the app opens.</p>` +
    `<label style="display:block;color:var(--ui-muted);margin-bottom:4px">Description</label><input type="text" id="pubMsg" value="Path layout: ${state.pieces.length} pieces, v${P.project.build}">` +
    (others.length ? `<p style="margin-top:10px">Other files with changes stay out of it:</p><ul>${others.slice(0, 8).map(f => `<li>${esc(f)}</li>`).join("")}${others.length > 8 ? `<li>and ${others.length - 8} more</li>` : ""}</ul>` : "");
  const ok = await modal({ title: "Publish to the live app", body: box, ok: "Publish", onOpen: b => { const i = b.querySelector("#pubMsg"); i.focus(); i.select(); } });
  if (!ok) return;
  const msg = box.querySelector("#pubMsg").value.trim() || "Path layout";
  $("#publish").disabled = true; $("#publish").textContent = "Publishing…";
  try { const r = await api("/api/publish", { message: msg }); toast("Published. " + (r.output || "")); }
  catch (e) { toast("Publish failed: " + e.message, true); }
  finally { $("#publish").disabled = false; $("#publish").textContent = "Publish"; refreshGit(); }
}
function renderGit(g) {
  if (!g || !g.ok) { $("#gitText").textContent = "git: not available"; return; }
  const ours = g.dirty.filter(f => /^(app\.js|index\.html|sw\.js)$/.test(f)).length;
  $("#gitText").textContent = `git ${g.branch}` + (g.dirty.length ? ` · ${g.dirty.length} changed file${g.dirty.length > 1 ? "s" : ""}` : " · clean") +
    (g.ahead ? ` · ${g.ahead} to push` : "") + (ours || g.ahead ? " · ready to publish" : "");
}
async function refreshGit() { try { renderGit(await api("/api/git")); } catch (e) {} }

/* ---- watching the app ------------------------------------------------------ */
function watch() {
  const es = new EventSource("/api/events");
  es.onopen = () => { $("#connDot").className = "dot on"; $("#connText").textContent = "Connected to the app · watching for changes"; };
  es.onerror = () => { $("#connDot").className = "dot off"; $("#connText").textContent = "Editor server stopped. Run start.bat again."; };
  es.addEventListener("changed", e => {
    const h = JSON.parse(e.data).hash;
    if (h === baseHash) return;
    if (!isDirty()) { loadProject({}).then(() => toast("The app changed on disk, so the editor reloaded it.")); return; }
    banner("The app's files changed on disk (new lessons or art?). Reload to see them; your edits are kept as a draft.", [["Reload", reloadFromApp, "primary"], ["Later", () => banner()]], "info");
  });
}

/* ---- preferences ----------------------------------------------------------- */
function savePrefs() { store.set(PREFS_KEY, { theme: state.theme, cur: state.cur, zoom: state.zoom, device: state.device, landscape: state.landscape, preview: state.preview,
  customW: +$("#customW").value, customH: +$("#customH").value, sync: $("#syncScroll").checked }); }
function loadPrefs() {
  const p = store.get(PREFS_KEY) || {};
  if (p.theme) state.theme = p.theme;
  if (p.cur != null) state.cur = p.cur;
  if (p.zoom) state.zoom = p.zoom;
  if (p.device && DEVICES.some(d => d.id === p.device)) state.device = p.device;
  state.landscape = !!p.landscape;
  if (p.preview === false) state.preview = false;
  if (p.customW) $("#customW").value = p.customW;
  if (p.customH) $("#customH").value = p.customH;
  if (p.sync === false) $("#syncScroll").checked = false;
}

/* ---- wiring ---------------------------------------------------------------- */
function buildDeviceMenu() {
  const s = $("#device"); s.innerHTML = "";
  const groups = {};
  DEVICES.forEach(d => {
    if (!groups[d.group]) { groups[d.group] = el("optgroup"); groups[d.group].label = d.group; s.appendChild(groups[d.group]); }
    const o = el("option"); o.value = d.id; o.textContent = d.id === "custom" ? d.name : `${d.name} — ${d.w}×${d.h}`; groups[d.group].appendChild(o);
  });
  s.value = state.device;
  $("#customBox").hidden = state.device !== "custom";
}
function setPreviewVisible(v) {
  state.preview = v;
  $("#previewPane").classList.toggle("hidden-pane", !v);
  $("#previewToggle").classList.toggle("on", v);
  savePrefs(); setTimeout(() => { fitPreview(); applyZoom(); }, 0);
}
function setTheme(t) {
  state.theme = t;
  document.querySelectorAll(".seg button").forEach(b => b.classList.toggle("on", b.dataset.theme === t));
  palettes(); renderStage(); applyTheme(); renderProps(); savePrefs();
}

function wire() {
  buildDeviceMenu();
  $("#device").onchange = function () { state.device = this.value; $("#customBox").hidden = this.value !== "custom"; state.landscape = false; savePrefs(); loadPreview(); };
  $("#rotate").onclick = () => { state.landscape = !state.landscape; savePrefs(); loadPreview(); };
  let cT = null;
  ["#customW", "#customH"].forEach(s => $(s).oninput = () => { clearTimeout(cT); cT = setTimeout(() => { savePrefs(); loadPreview(); }, 500); });
  document.querySelectorAll(".seg button").forEach(b => b.onclick = () => setTheme(b.dataset.theme));
  $("#cur").onchange = function () { state.cur = +this.value; savePrefs(); renderStage(); pushPreview(); };
  $("#zoomIn").onclick = () => setZoom(state.zoom * 1.2);
  $("#zoomOut").onclick = () => setZoom(state.zoom / 1.2);
  $("#zoomVal").onclick = fitZoom;
  $("#canvas").addEventListener("wheel", ev => { if (!ev.ctrlKey) return; ev.preventDefault(); setZoom(state.zoom * (ev.deltaY < 0 ? 1.1 : 1 / 1.1)); }, { passive: false });
  $("#canvas").addEventListener("scroll", () => syncScroll());
  $("#canvas").addEventListener("pointerdown", ev => { if (!ev.target.closest(".piece") && !ev.target.closest(".ptools") && !ev.target.closest(".pchapter")) select(null); });
  $("#t-flip").onclick = () => mutate(p => { p.flip = !p.flip; });
  $("#t-behind").onclick = () => mutate(p => { p.behind = !p.behind; });
  $("#t-dup").onclick = duplicateSel;
  $("#t-del").onclick = removeSel;
  $("#undo").onclick = undo; $("#redo").onclick = redo;
  $("#save").onclick = () => save();
  $("#publish").onclick = publish;
  $("#reload").onclick = reloadFromApp;
  $("#previewToggle").onclick = () => setPreviewVisible(!state.preview);
  $("#previewReload").onclick = loadPreview;
  $("#syncScroll").onchange = () => { savePrefs(); syncScroll(); };
  $("#preview").addEventListener("load", () => { applyTheme(); });
  document.querySelectorAll(".tabs button").forEach(b => b.onclick = () => {
    document.querySelectorAll(".tabs button").forEach(x => x.classList.toggle("on", x === b));
    document.querySelectorAll(".tab").forEach(t => t.hidden = t.dataset.tab !== b.dataset.tab);
  });
  window.addEventListener("resize", () => fitPreview());
  window.addEventListener("beforeunload", e => { if (isDirty()) { e.preventDefault(); e.returnValue = ""; } });

  document.addEventListener("keydown", ev => {
    if (!$("#modal").hidden) return;
    const tag = ev.target.tagName;
    const mod = ev.ctrlKey || ev.metaKey, k = ev.key.toLowerCase();
    if (mod && k === "s") { ev.preventDefault(); save(); return; }
    if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
    if (mod && k === "z") { ev.preventDefault(); if (ev.shiftKey) redo(); else undo(); return; }
    if (mod && k === "y") { ev.preventDefault(); redo(); return; }
    if (mod) return;
    if (k === "+" || k === "=") { setZoom(state.zoom * 1.2); return; }
    if (k === "-" || k === "_") { setZoom(state.zoom / 1.2); return; }
    if (k === "0") { fitZoom(); return; }
    if (k === "p") { setPreviewVisible(!state.preview); return; }
    if (k === "r") { state.landscape = !state.landscape; savePrefs(); loadPreview(); return; }
    if (k === "escape") { select(null); return; }
    const p = selected(); if (!p) return;
    const step = ev.shiftKey ? 10 : 1;
    const moves = { arrowleft: [-step, 0], arrowright: [step, 0], arrowup: [0, -step], arrowdown: [0, step] };
    if (moves[k]) { ev.preventDefault(); const q = px(p); mutate(p => anchor(p, q.cx + moves[k][0], q.base + moves[k][1])); }
    else if (k === "delete" || k === "backspace") { ev.preventDefault(); removeSel(); }
    else if (k === "f") mutate(p => { p.flip = !p.flip; });
    else if (k === "b") mutate(p => { p.behind = !p.behind; });
    else if (k === "d") duplicateSel();
  });
}

/* ---- start ---------------------------------------------------------------- */
(async function boot() {
  loadPrefs(); wire();
  document.querySelectorAll(".seg button").forEach(b => b.classList.toggle("on", b.dataset.theme === state.theme));
  setPreviewVisible(state.preview);
  watch();
  try { await loadProject(); }
  catch (e) { $("#loading").textContent = "Couldn't read the app: " + e.message; toast(e.message, true); }
  setInterval(refreshGit, 20000);
})();
